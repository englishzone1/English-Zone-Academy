import {
  deleteField,
  collection, 
  doc, 
  getDoc, 
  getDocs,
  deleteDoc, 
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
        submittedAt: new Date().toISOString(),
        // حساب الدخول الذي أنشأه المسجّل مع الطلب
        ...((data as any).studentId ? { studentId: (data as any).studentId } : {}),
        ...((data as any).referralCode ? { referralCode: String((data as any).referralCode).slice(0, 20) } : {})
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
  // حذف حساب طالبة أو مسجّلة من المنصة (للإدارة): ملفها وعضويتها وطلباتها، ومنعها من إعادة إنشاء الملف
  async deleteMemberAccount(uid: string, email?: string): Promise<{ blocked: boolean }> {
    // الأهم أولًا: حذف الملف نفسه
    await deleteDoc(doc(db, 'users', uid));
    let blocked = true;
    try {
      await setDoc(doc(db, 'blocked_users', uid), { id: uid, email: String(email || ''), blockedAt: new Date().toISOString() });
    } catch (err) {
      // القواعد الجديدة لم تُنشر بعد: الحذف تم، لكن المنع من العودة لم يُسجَّل
      console.warn('Could not record blocked user:', err);
      blocked = false;
    }
    try {
      await deleteDoc(doc(db, 'group_members', uid));
    } catch {
      // لا عضوية
    }
    // نتائج الواجبات والاختبارات وإجاباتها وتسجيلاتها: إن عاد يبدأ من جديد تمامًا
    try {
      const rs = await getDocs(query(collection(db, 'homework_results'), where('studentId', '==', uid)));
      for (const d of rs.docs) {
        const n = Number((d.data() as any).audioCount) || 0;
        for (let i = 0; i < n; i++) await deleteDoc(doc(db, 'homework_audio', `${d.id}_${i}`)).catch(() => undefined);
        await deleteDoc(doc(db, 'homework_answers', d.id)).catch(() => undefined);
        await deleteDoc(d.ref).catch(() => undefined);
      }
    } catch {
      // لا نتائج
    }
    try {
      const regs = await getDocs(query(collection(db, 'registration_requests'), where('studentId', '==', uid)));
      for (const d of regs.docs) await deleteDoc(d.ref);
    } catch {
      // لا طلبات
    }
    return { blocked };
  },

  // إضافة المسجّل كطالب نشط مباشرة: يُفعَّل اشتراكه ومستواه من بيانات طلبه
  async activateRegistrantAsStudent(uid: string, reg: RegistrationRequest): Promise<void> {
    const updates: Record<string, any> = {
      subscriptionStatus: 'active',
      accountType: deleteField(),
      registrationRequestId: reg.id,
      updatedAt: new Date().toISOString()
    };
    if (reg.mainLevel && reg.mainLevel !== ('needs_test' as any)) updates.mainLevel = reg.mainLevel;
    if (reg.learningFormat) updates.learningFormat = reg.learningFormat;
    await updateDoc(doc(db, 'users', uid), updates);
  },

  async linkRegistrationToStudent(reg: RegistrationRequest): Promise<string | null> {
    // الطلب الذي أُرسل مع إنشاء الحساب يحمل معرّف الحساب مباشرة
    const sid = String((reg as any).studentId || '');
    if (sid) {
      try {
        const snap = await getDoc(doc(db, 'users', sid));
        if (snap.exists()) return sid;
        // الحساب موجود لكن ملفه لم يُحفظ (مثلًا قبل نشر القواعد): تنشئه الإدارة الآن
        await setDoc(doc(db, 'users', sid), {
          id: sid,
          email: String(reg.email || '').trim(),
          fullName: reg.fullName || '',
          role: 'student',
          points: 0,
          starOfTheWeekCount: 0,
          starOfTheMonthCount: 0,
          subscriptionStatus: 'pending',
          ...(reg.whatsappNumber ? { phone: reg.whatsappNumber } : {}),
          createdAt: new Date().toISOString()
        });
        return sid;
      } catch {
        // نكمل بالبحث بالبريد
      }
    }
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
    // بحث أوسع: نفس البريد مع اختلاف الحروف الكبيرة/الصغيرة أو المسافات
    if (!found) {
      const target = email.toLowerCase();
      const all = await getDocs(collection(db, 'users'));
      const hit = all.docs.find((d) => {
        const u = d.data() as any;
        return String(u.email || '').trim().toLowerCase() === target && (u.role === 'student' || !u.role);
      });
      if (hit) found = { id: hit.id, data: hit.data() };
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
    linkedUserId?: string,
    awaitingAccount?: boolean
  ): Promise<void> {
    const path = `registration_requests/${requestId}`;
    try {
      await updateDoc(doc(db, 'registration_requests', requestId), {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewer,
        // مقبول لكن الطالب لم ينشئ حساب الدخول بعد: يُربط تلقائيًا لاحقًا
        awaitingAccount: !!awaitingAccount,
        ...(linkedUserId ? { linkedUserId } : {})
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
};
