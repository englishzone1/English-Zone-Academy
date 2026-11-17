import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  increment,
  deleteField
} from 'firebase/firestore';
import { db } from './firebase';

/* ------------------------------ Types ------------------------------ */

export interface StudyGroup {
  id: string;
  name: string;
  level?: string;
  teacherName?: string;
  createdAt: string;
}

// معيار تقييم يحدده المدير: النص والنقاط (موجبة أو سالبة)
export interface RatingCriterion {
  id: string;
  labelAr: string;
  labelEn: string;
  points: number;
  icon: string;
  order: number;
}

export interface PointsEntry {
  id: string;
  studentId: string;
  studentName?: string;
  groupId?: string;
  amount: number;
  reason: string;
  criterionId?: string;
  awardedBy: string;
  timestamp: string;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  assessmentTitle: string;
  level: string;
  score: number;
  passed: boolean;
  date: string;
}

// الدرجة التي يُعتبر عندها الطالب ناجحًا في التقييم. غيّر الرقم إن أردت.
export const PASS_MARK = 60;

/* ------------------------------ Helpers ------------------------------ */

// Firestore يرفض القيم undefined
const clean = <T extends object>(obj: T): T => JSON.parse(JSON.stringify(obj));

// بداية الأسبوع: يوم السبت
export const startOfWeek = (d: Date = new Date()): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const diff = (x.getDay() + 1) % 7; // السبت = 0
  x.setDate(x.getDate() - diff);
  return x;
};

export const startOfMonth = (d: Date = new Date()): Date => new Date(d.getFullYear(), d.getMonth(), 1);

const DEFAULT_CRITERIA: Omit<RatingCriterion, 'id'>[] = [
  { icon: '🎧', labelAr: 'استماع ومتابعة ممتازة', labelEn: 'Excellent listening', points: 5, order: 1 },
  { icon: '🗣️', labelAr: 'مشاركة فعالة ونطق ممتاز', labelEn: 'Active participation', points: 5, order: 2 },
  { icon: '🤝', labelAr: 'العمل الجماعي ومساعدة الزملاء', labelEn: 'Teamwork and helping peers', points: 3, order: 3 },
  { icon: '⚠️', labelAr: 'تحتاج إلى تركيز أكبر', labelEn: 'Needs more focus', points: -2, order: 4 }
];

/* ------------------------------ Service ------------------------------ */

export const groupService = {
  // ---- Groups ----
  async getGroups(): Promise<StudyGroup[]> {
    const snap = await getDocs(collection(db, 'groups'));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as StudyGroup))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async saveGroup(g: Partial<StudyGroup> & { name: string }): Promise<void> {
    const ref = g.id ? doc(db, 'groups', g.id) : doc(collection(db, 'groups'));
    await setDoc(
      ref,
      clean({ ...g, id: ref.id, createdAt: g.createdAt || new Date().toISOString() }),
      { merge: true }
    );
  },

  // عند حذف المجموعة يُزال ارتباط طلابها بها
  async deleteGroup(id: string): Promise<void> {
    const batch = writeBatch(db);
    const members = await getDocs(query(collection(db, 'users'), where('groupId', '==', id)));
    members.forEach((d) => batch.update(d.ref, { groupId: deleteField() }));
    batch.delete(doc(db, 'groups', id));
    await batch.commit();
  },

  // ---- Rating criteria ----
  async getCriteria(): Promise<RatingCriterion[]> {
    const snap = await getDocs(collection(db, 'rating_criteria'));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as RatingCriterion))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async saveCriterion(c: Partial<RatingCriterion> & { labelAr: string }): Promise<void> {
    const ref = c.id ? doc(db, 'rating_criteria', c.id) : doc(collection(db, 'rating_criteria'));
    await setDoc(ref, clean({ ...c, id: ref.id }), { merge: true });
  },

  async deleteCriterion(id: string): Promise<void> {
    await deleteDoc(doc(db, 'rating_criteria', id));
  },

  async seedDefaultCriteria(): Promise<void> {
    const batch = writeBatch(db);
    DEFAULT_CRITERIA.forEach((c) => {
      const ref = doc(collection(db, 'rating_criteria'));
      batch.set(ref, { ...c, id: ref.id });
    });
    await batch.commit();
  },

  // ---- Stars ----
  // يسجل العملية في points_log ويعدّل رصيد الطالب (users.points) معًا
  async awardStars(p: {
    studentId: string;
    studentName?: string;
    groupId?: string;
    amount: number;
    reason: string;
    criterionId?: string;
    awardedBy: string;
  }): Promise<void> {
    const batch = writeBatch(db);
    const logRef = doc(collection(db, 'points_log'));
    batch.set(
      logRef,
      clean({
        id: logRef.id,
        studentId: p.studentId,
        studentName: p.studentName,
        groupId: p.groupId,
        amount: p.amount,
        reason: p.reason,
        criterionId: p.criterionId,
        awardedBy: p.awardedBy,
        timestamp: new Date().toISOString()
      })
    );
    batch.update(doc(db, 'users', p.studentId), {
      points: increment(p.amount),
      updatedAt: new Date().toISOString()
    });
    await batch.commit();
  },

  async getPointsLog(): Promise<PointsEntry[]> {
    const snap = await getDocs(collection(db, 'points_log'));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as PointsEntry))
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  },

  // ---- Grades ----
  async getGrades(): Promise<GradeEntry[]> {
    const snap = await getDocs(collection(db, 'grades'));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as GradeEntry))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  },

  async addGrade(g: { studentId: string; assessmentTitle: string; level: string; score: number }): Promise<void> {
    const ref = doc(collection(db, 'grades'));
    await setDoc(
      ref,
      clean<GradeEntry>({
        id: ref.id,
        studentId: g.studentId,
        assessmentTitle: g.assessmentTitle,
        level: g.level,
        score: g.score,
        passed: g.score >= PASS_MARK,
        date: new Date().toISOString()
      })
    );
  },

  async deleteGrade(id: string): Promise<void> {
    await deleteDoc(doc(db, 'grades', id));
  }
};
