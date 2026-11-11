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
   */
  async submitRegistration(data: Omit<RegistrationRequest, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const path = 'registration_requests';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
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
  async updateRegistrationStatus(requestId: string, status: 'approved' | 'rejected', reviewer: string): Promise<void> {
    const path = `registration_requests/${requestId}`;
    try {
      await updateDoc(doc(db, 'registration_requests', requestId), {
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: reviewer
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
};
