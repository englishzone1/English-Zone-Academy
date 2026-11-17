import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, RegistrationRequest, AvatarConfiguration } from '../types/auth';

export interface HomeworkRecord {
  id: string;
  studentId: string;
  titleEn: string;
  titleAr: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  feedbackEn?: string;
  feedbackAr?: string;
  pointsAward: string;
}

export interface PointsLogRecord {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  awardedBy: string;
  timestamp: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  assessmentTitle: string;
  level: string;
  score: number;
  passed: boolean;
  date: string;
}

export interface TimetableRecord {
  id: string;
  studentId: string;
  topic: string;
  time: string;
  teacherName: string;
  zoomLink: string;
}

export const studentDataService = {
  /**
   * Fetch authenticated student's private profile by UID
   */
  async getStudentProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) {
        return null;
      }
      return snap.data() as UserProfile;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  /**
   * Update student profile fields (e.g. avatar configuration, phone, country)
   */
  async updateStudentProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  /**
   * Save student custom 3D cartoon avatar
   */
  async saveStudentAvatar(uid: string, avatarConfig: AvatarConfiguration): Promise<void> {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), {
        avatarConfig,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  /**
   * Fetch only the authenticated student's private homework assignments
   */
  async getStudentHomework(uid: string): Promise<HomeworkRecord[]> {
    const path = 'homework';
    try {
      const q = query(collection(db, path), where('studentId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HomeworkRecord, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  /**
   * Fetch only the authenticated student's star points audit log
   */
  async getStudentPointsLog(uid: string): Promise<PointsLogRecord[]> {
    const path = 'points_log';
    try {
      const q = query(collection(db, path), where('studentId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PointsLogRecord, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  /**
   * Fetch only the authenticated student's grade records
   */
  async getStudentGrades(uid: string): Promise<GradeRecord[]> {
    const path = 'grades';
    try {
      const q = query(collection(db, path), where('studentId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GradeRecord, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  /**
   * Fetch only the authenticated student's scheduled timetable sessions
   */
  async getStudentTimetable(uid: string): Promise<TimetableRecord[]> {
    const path = 'timetable';
    try {
      const q = query(collection(db, path), where('studentId', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TimetableRecord, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  /**
   * Public Student Application submission (Writes to registration_requests with status 'pending')
   * الحقول مطابقة لقواعد Firestore (submittedAt وليس createdAt)، ورقم الطلب هو نفسه معرّف الوثيقة
   */
  async submitRegistration(data: Omit<RegistrationRequest, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const requestId = `EZ-REG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const path = `registration_requests/${requestId}`;
    try {
      await setDoc(doc(db, 'registration_requests', requestId), {
        id: requestId,
        fullName: data.fullName,
        age: data.age ?? '',
        country: data.country ?? '',
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        mainLevel: data.mainLevel,
        learningGoal: data.learningGoal ?? '',
        learningFormat: data.learningFormat,
        notes: data.notes ?? '',
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      return requestId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      throw err;
    }
  },

  /**
   * Admins only: find the student account (users) with the same email as the request,
   * and copy the request data into it. Returns the student's uid, or null if no account exists.
   */
  async linkRegistrationToStudent(reg: RegistrationRequest): Promise<string | null> {
    const email = String(reg.email || '').trim();
    if (!email) return null;
    const candidates = Array.from(new Set([email, email.toLowerCase()]));
    let found: { id: string; data: any } | null = null;
    for (const e of candidates) {
      const snap = await getDocs(query(collection(db, 'users'), where('email', '==', e)));
      const hit = snap.docs.find((d) => (d.data() as any).role === 'student' || !(d.data() as any).role);
      if (hit) {
        found = { id: hit.id, data: hit.data() };
        break;
      }
    }
    if (!found) return null;

    const updates: Record<string, any> = {
      registrationRequestId: reg.id,
      updatedAt: new Date().toISOString()
    };
    // ننسخ فقط ما كتبه الطالب في الطلب، ولا نكتب فوق قيم وضعتها الإدارة
    if (reg.whatsappNumber && !found.data.phone) updates.phone = reg.whatsappNumber;
    if (reg.country && !found.data.country) updates.country = reg.country;
    if (reg.age && !found.data.age) updates.age = reg.age;
    if (reg.learningFormat && !found.data.learningFormat) updates.learningFormat = reg.learningFormat;
    if (reg.mainLevel && reg.mainLevel !== 'needs_test' && !found.data.mainLevel) updates.mainLevel = reg.mainLevel;

    await updateDoc(doc(db, 'users', found.id), updates);
    return found.id;
  },

  /**
   * Fetch all pending and reviewed applications (Admins only)
   */
  async getRegistrationRequests(): Promise<RegistrationRequest[]> {
    const path = 'registration_requests';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RegistrationRequest, 'id'>) }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  /**
   * Update application status (Admins only)
   */
  async updateRegistrationStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    reviewer: string,
    linkedUserId?: string
  ): Promise<void> {
    const path = `registration_requests/${requestId}`;
    try {
      await updateDoc(doc(db, 'registration_requests', requestId), {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewer,
        ...(linkedUserId ? { linkedUserId } : {})
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
};
