import {
  collection,
  doc,
  getDoc,
  updateDoc,
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
  teacherId?: string; // معلم المجموعة (حساب من مجموعة teachers)
  createdAt: string;
}

export interface TeacherAccount {
  id: string;
  fullName: string;
  email: string;
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

// لوحة المجموعة التي يراها الطلاب: الاسم والنقاط فقط (group_members/{uid})
export interface GroupMember {
  id: string;
  groupId: string;
  fullName: string;
  points: number;
  avatar?: any;
  updatedAt: string;
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
    members.forEach((d) => {
      batch.update(d.ref, { groupId: deleteField(), teacherId: deleteField() });
      batch.delete(doc(db, 'group_members', d.id));
    });
    batch.delete(doc(db, 'groups', id));
    await batch.commit();
  },

  // ---- Teachers ----
  async getTeachers(): Promise<TeacherAccount[]> {
    const snap = await getDocs(collection(db, 'teachers'));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as TeacherAccount))
      .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
  },

  // تحويل حساب موجود إلى معلم (الحساب يُنشأ أولًا بالتسجيل العادي أو بجوجل)
  async makeTeacher(u: { id: string; fullName?: string; email?: string }): Promise<void> {
    const batch = writeBatch(db);
    batch.set(doc(db, 'teachers', u.id), {
      id: u.id,
      fullName: u.fullName || '',
      email: u.email || '',
      createdAt: new Date().toISOString()
    });
    batch.update(doc(db, 'users', u.id), {
      role: 'teacher',
      groupId: deleteField(),
      teacherId: deleteField(),
      updatedAt: new Date().toISOString()
    });
    batch.delete(doc(db, 'group_members', u.id));
    await batch.commit();
  },

  async removeTeacher(id: string): Promise<void> {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'teachers', id));
    batch.update(doc(db, 'users', id), { role: 'student', updatedAt: new Date().toISOString() });
    const owned = await getDocs(query(collection(db, 'groups'), where('teacherId', '==', id)));
    owned.forEach((g) => batch.update(g.ref, { teacherId: deleteField(), teacherName: deleteField() }));
    await batch.commit();
  },

  // مجموعات المعلم وطلابه فقط
  async getTeacherGroups(teacherId: string): Promise<StudyGroup[]> {
    const snap = await getDocs(query(collection(db, 'groups'), where('teacherId', '==', teacherId)));
    return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as StudyGroup)).sort((a, b) => a.name.localeCompare(b.name));
  },

  async getTeacherStudents(teacherId: string): Promise<any[]> {
    const snap = await getDocs(query(collection(db, 'users'), where('teacherId', '==', teacherId)));
    return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id })).filter((u) => u.role === 'student');
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
    asTeacher?: boolean;
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
    try {
      await groupService.syncMember(p.studentId, { asTeacher: p.asTeacher });
    } catch (err) {
      console.error('Could not update group board:', err);
    }
  },

  // استعادة نقاط مُنحت بالخطأ: يحذف العملية من السجل ويطرح قيمتها من رصيد الطالب
  async revertPoints(e: PointsEntry, opts: { asTeacher?: boolean } = {}): Promise<void> {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'points_log', e.id));
    batch.update(doc(db, 'users', e.studentId), {
      points: increment(-Number(e.amount || 0)),
      updatedAt: new Date().toISOString()
    });
    await batch.commit();
    try {
      await groupService.syncMember(e.studentId, { asTeacher: opts.asTeacher });
    } catch (err) {
      console.error('Could not update group board:', err);
    }
  },

  // ---- Group board (group_members) ----
  // ينسخ اسم الطالب ونقاطه ومجموعته من users إلى group_members، أو يحذفه إن لم تكن له مجموعة
  async syncMember(studentId: string, opts: { asTeacher?: boolean } = {}): Promise<void> {
    const snap = await getDoc(doc(db, 'users', studentId));
    const data = snap.exists() ? (snap.data() as any) : null;
    const ref = doc(db, 'group_members', studentId);
    // معلم الطالب = معلم مجموعته (الأدمن فقط يغيّره)
    if (!opts.asTeacher && data && data.role === 'student') {
      let teacherId = '';
      if (data.groupId) {
        const g = await getDoc(doc(db, 'groups', data.groupId));
        teacherId = g.exists() ? String((g.data() as any).teacherId || '') : '';
      }
      if (!data.teacherManual && (data.teacherId || '') !== teacherId) {
        let tEmail = '';
        if (teacherId) {
          const t = await getDoc(doc(db, 'teachers', teacherId)).catch(() => null);
          tEmail = t && t.exists() ? String((t.data() as any).email || '') : '';
        }
        await updateDoc(doc(db, 'users', studentId), {
          teacherId: teacherId ? teacherId : deleteField(),
          assignedTeacherEmail: tEmail ? tEmail : deleteField()
        });
      }
    }
    if (!data || data.role !== 'student' || !data.groupId) {
      await deleteDoc(ref);
      return;
    }
    await setDoc(ref, {
      id: studentId,
      groupId: data.groupId,
      fullName: data.fullName || '',
      points: Number(data.points) || 0,
      ...(data.avatarConfig ? { avatar: data.avatarConfig } : {}),
      updatedAt: new Date().toISOString()
    });
  },

  // يعيد بناء لوحات كل المجموعات من بيانات الطلاب (زر المزامنة في اللوحة)
  async syncAllMembers(): Promise<number> {
    const [usersSnap, boardSnap, groupsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'group_members')),
      getDocs(collection(db, 'groups'))
    ]);
    const teacherOf = new Map<string, string>();
    groupsSnap.forEach((g) => teacherOf.set(g.id, String((g.data() as any).teacherId || '')));
    const teacherEmail = new Map<string, string>();
    try {
      (await getDocs(collection(db, 'teachers'))).forEach((t) => teacherEmail.set(t.id, String((t.data() as any).email || '')));
    } catch {
      /* البريد اختياري */
    }
    const ops: ((b: ReturnType<typeof writeBatch>) => void)[] = [];
    const keep = new Set<string>();
    usersSnap.forEach((d) => {
      const data = d.data() as any;
      // المعلم الذي اختارته الإدارة يدويًا لا يُستبدل بمعلم المجموعة
      if (data.role === 'student' && !data.teacherManual) {
        const t = data.groupId ? teacherOf.get(data.groupId) || '' : '';
        const te = t ? teacherEmail.get(t) || '' : '';
        if ((data.teacherId || '') !== t || (data.assignedTeacherEmail || '') !== te) {
          ops.push((b) => b.update(d.ref, { teacherId: t ? t : deleteField(), assignedTeacherEmail: te ? te : deleteField() }));
        }
      }
      if (data.role === 'student' && data.groupId) {
        keep.add(d.id);
        ops.push((b) =>
          b.set(doc(db, 'group_members', d.id), {
            id: d.id,
            groupId: data.groupId,
            fullName: data.fullName || '',
            points: Number(data.points) || 0,
            ...(data.avatarConfig ? { avatar: data.avatarConfig } : {}),
            updatedAt: new Date().toISOString()
          })
        );
      }
    });
    boardSnap.forEach((d) => {
      if (!keep.has(d.id)) ops.push((b) => b.delete(d.ref));
    });
    // Firestore يقبل 500 عملية في الدفعة الواحدة
    for (let i = 0; i < ops.length; i += 450) {
      const b = writeBatch(db);
      ops.slice(i, i + 450).forEach((op) => op(b));
      await b.commit();
    }
    return keep.size;
  },

  // ---- Student side (يقرأ مجموعته فقط حسب القواعد) ----
  async getGroupById(id: string): Promise<StudyGroup | null> {
    const snap = await getDoc(doc(db, 'groups', id));
    return snap.exists() ? ({ ...(snap.data() as any), id: snap.id } as StudyGroup) : null;
  },

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const snap = await getDocs(query(collection(db, 'group_members'), where('groupId', '==', groupId)));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as GroupMember))
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  },

  async getGroupPointsLog(groupId: string): Promise<PointsEntry[]> {
    const snap = await getDocs(query(collection(db, 'points_log'), where('groupId', '==', groupId)));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as PointsEntry))
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
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
