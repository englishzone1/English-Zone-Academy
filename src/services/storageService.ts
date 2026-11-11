import { UserProfile, RegistrationRequest, AvatarConfiguration } from '../types/auth';
import { CEFRLevel, StageId, LearningFormat } from '../types';

const STORAGE_KEYS = {
  USERS: 'ez_users_db',
  CURRENT_USER: 'ez_current_user_session',
  REGISTRATIONS: 'ez_registration_requests_db',
  POINTS_LOG: 'ez_points_audit_db',
  TESTS: 'ez_tests_db',
  TEST_SUBMISSIONS: 'ez_test_submissions_db',
  HOMEWORK: 'ez_homework_db',
  HOMEWORK_SUBMISSIONS: 'ez_homework_submissions_db',
  ATTENDANCE: 'ez_attendance_db',
  CERTIFICATES: 'ez_certificates_db',
  PAYMENTS: 'ez_payments_db',
  SETTINGS: 'ez_academy_settings_db'
};

const DEFAULT_AVATAR: AvatarConfiguration = {
  gender: 'female',
  characterType: 'teen',
  skinTone: '#E0AC69',
  faceShape: 'oval',
  eyesStyle: 'almond',
  eyeColor: '#2C1B18',
  hairStyle: 'shoulder-length',
  hairColor: '#1A1A1A',
  hasHijab: true,
  hijabStyle: 'modern-wrap',
  hijabColor: '#0A192F',
  clothingType: 'modest-blouse',
  clothingColor: '#D4AF37',
  backgroundId: 'modern-library',
  accessories: ['glasses']
};

// Seed initial authentic administrative accounts (No shared or hardcoded student profiles)
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_admin_01',
    email: 'admin@englishzone.com',
    fullName: 'Academy Super Administrator',
    role: 'super_admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_teacher_01',
    email: 'teacher@englishzone.com',
    fullName: 'Senior Academic Instructor',
    role: 'teacher',
    phone: '+84 326 853 884',
    country: 'International',
    createdAt: new Date().toISOString()
  }
];

export const storageService = {
  // Users & Profiles
  getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: UserProfile[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  getUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    this.saveUsers(users);

    // If updating current active user session, sync it
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser(updated);
    }
    return updated;
  },

  // Active Session
  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  // Registration Requests Pipeline
  getRegistrations(): RegistrationRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveRegistrations(regs: RegistrationRequest[]) {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(regs));
  },

  addRegistration(req: Omit<RegistrationRequest, 'id' | 'createdAt' | 'status'>): RegistrationRequest {
    const regs = this.getRegistrations();
    const newRecord: RegistrationRequest = {
      ...req,
      id: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    regs.unshift(newRecord);
    this.saveRegistrations(regs);
    return newRecord;
  },

  approveRegistration(regId: string, assignedTeacherId?: string): { registration: RegistrationRequest; newStudent: UserProfile } | null {
    const regs = this.getRegistrations();
    const reg = regs.find((r) => r.id === regId);
    if (!reg) return null;

    reg.status = 'approved';
    reg.reviewedAt = new Date().toISOString();
    this.saveRegistrations(regs);

    // Create or activate the student user account
    const assignedLevel: CEFRLevel = reg.mainLevel === 'needs_test' ? 'A1' : reg.mainLevel;
    const assignedStage: StageId = `${assignedLevel}.1` as StageId;

    const newStudent: UserProfile = {
      id: `student_${Date.now()}`,
      email: reg.email,
      fullName: reg.fullName,
      role: 'student',
      phone: reg.whatsappNumber,
      country: reg.country,
      age: typeof reg.age === 'number' ? reg.age : undefined,
      mainLevel: assignedLevel,
      currentStage: assignedStage,
      learningFormat: reg.learningFormat,
      points: 20, // Welcome points
      starOfTheWeekCount: 0,
      starOfTheMonthCount: 0,
      assignedTeacherId: assignedTeacherId || 'user_teacher_01',
      assignedTeacherName: 'Senior Academic Instructor',
      subscriptionStatus: 'active',
      monthlyTuitionUSD: reg.learningFormat === 'individual' ? 80 : 50,
      avatarConfig: DEFAULT_AVATAR,
      createdAt: new Date().toISOString()
    };

    const users = this.getUsers();
    // Check if user already exists
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === reg.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...newStudent, id: users[existingIndex].id };
    } else {
      users.push(newStudent);
    }
    this.saveUsers(users);

    return { registration: reg, newStudent };
  },

  rejectRegistration(regId: string, reason?: string): RegistrationRequest | null {
    const regs = this.getRegistrations();
    const reg = regs.find((r) => r.id === regId);
    if (!reg) return null;

    reg.status = 'rejected';
    reg.reviewedAt = new Date().toISOString();
    if (reason) reg.notes = `${reg.notes || ''} [Rejection note: ${reason}]`;
    this.saveRegistrations(regs);
    return reg;
  },

  // English Zone Stars Points Audit Log
  getPointsLog(studentId?: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.POINTS_LOG);
    const logs = raw ? JSON.parse(raw) : [];
    if (!studentId) return logs;
    return logs.filter((l: any) => l.studentId === studentId);
  },

  addPointsTransaction(studentId: string, points: number, reason: string, authorName: string) {
    const logs = this.getPointsLog();
    const transaction = {
      id: `PT-${Date.now()}`,
      studentId,
      points,
      reason,
      authorName,
      timestamp: new Date().toISOString()
    };
    logs.unshift(transaction);
    localStorage.setItem(STORAGE_KEYS.POINTS_LOG, JSON.stringify(logs));

    // Update user points total
    const user = this.getUserById(studentId);
    if (user) {
      const currentPoints = user.points || 0;
      const newPoints = Math.max(0, currentPoints + points);
      this.updateUser(studentId, { points: newPoints });
    }
    return transaction;
  }
};
