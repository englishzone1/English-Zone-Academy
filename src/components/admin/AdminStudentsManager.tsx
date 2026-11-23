import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteField
} from 'firebase/firestore';
import { RefreshCw, Search, Save, Sparkles, X } from 'lucide-react';
import { db } from '../../services/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { groupService, StudyGroup, RatingCriterion, PASS_MARK } from '../../services/groupService';
import { CURRICULA } from '../../services/curriculumService';
import { AdminStudentRecords } from './AdminStudentRecords';
import { studentDataService } from '../../services/studentDataService';
import { CURRENCIES } from '../../hooks/useAcademySettings';
import { AdminMemberProfile } from './AdminMemberProfile';
import { AvatarRenderer } from '../avatar/AvatarRenderer';

interface AdminStudentsManagerProps {
  onNotice: (message: string) => void;
  // وضع المعلم: يرى طلاب مجموعاته فقط، ويقيّمهم دون تعديل بيانات الاشتراك
  teacherMode?: boolean;
}

interface StudentRow {
  id: string;
  fullName?: string;
  email?: string;
  createdAt?: string;
  points?: number;
  subscriptionStatus?: string;
  mainLevel?: string;
  enrolledCourseName?: string;
  curriculumId?: string;
  currentStage?: string;
  learningFormat?: string;
  assignedTeacherName?: string;
  monthlyTuitionUSD?: number;
  stageProgress?: number;
  lessonsAttended?: number;
  lessonsTotal?: number;
  groupId?: string;
}

type FormState = {
  subscriptionStatus: string;
  mainLevel: string;
  enrolledCourseName: string;
  curriculumId: string;
  currentStage: string;
  learningFormat: string;
  assignedTeacherName: string;
  monthlyTuitionUSD: string;
  stageProgress: string;
  lessonsAttended: string;
  lessonsTotal: string;
  groupId: string;
  teacherId: string;
  lessonDays: number[];
  lessonTime: string;
  lessonNote: string;
  lessonDuration: string;
  tuitionCurrency: string;
};

const EMPTY_FORM: FormState = {
  subscriptionStatus: 'pending',
  mainLevel: '',
  enrolledCourseName: '',
  curriculumId: '',
  currentStage: '',
  learningFormat: '',
  assignedTeacherName: '',
  monthlyTuitionUSD: '',
  stageProgress: '',
  lessonsAttended: '',
  lessonsTotal: '',
  groupId: '',
  teacherId: '',
  lessonDays: [],
  lessonTime: '',
  lessonNote: '',
  lessonDuration: '',
  tuitionCurrency: ''
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const STATUS_LABELS: Record<string, { ar: string; en: string; cls: string }> = {
  pending: { ar: 'بانتظار التفعيل', en: 'Pending', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  active: { ar: 'نشط', en: 'Active', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  suspended: { ar: 'موقوف', en: 'Suspended', cls: 'bg-red-50 text-red-700 border-red-200' }
};

const statusOf = (s: StudentRow) => String(s.subscriptionStatus || 'pending').toLowerCase();

const toForm = (s: StudentRow): FormState => ({
  subscriptionStatus: statusOf(s),
  mainLevel: s.mainLevel || '',
  enrolledCourseName: s.enrolledCourseName || '',
  curriculumId: s.curriculumId || '',
  currentStage: s.currentStage || '',
  learningFormat: s.learningFormat || '',
  assignedTeacherName: s.assignedTeacherName || '',
  monthlyTuitionUSD: s.monthlyTuitionUSD !== undefined ? String(s.monthlyTuitionUSD) : '',
  stageProgress: s.stageProgress !== undefined ? String(s.stageProgress) : '',
  lessonsAttended: s.lessonsAttended !== undefined ? String(s.lessonsAttended) : '',
  lessonsTotal: s.lessonsTotal !== undefined ? String(s.lessonsTotal) : '',
  groupId: s.groupId || '',
  teacherId: (s as any).teacherId || '',
  lessonDays: Array.isArray((s as any).lessonDays) ? (s as any).lessonDays : [],
  lessonTime: (s as any).lessonTime || '',
  lessonNote: (s as any).lessonNote || '',
  lessonDuration: (s as any).lessonDuration ? String((s as any).lessonDuration) : '',
  tuitionCurrency: (s as any).tuitionCurrency || ''
});

const textOrDelete = (value: string) => (value.trim() === '' ? deleteField() : value.trim());

const numberOrDelete = (value: string, min?: number, max?: number) => {
  const trimmed = value.trim();
  if (trimmed === '') return deleteField();
  let n = Number(trimmed);
  if (!Number.isFinite(n)) return deleteField();
  if (min !== undefined) n = Math.max(min, n);
  if (max !== undefined) n = Math.min(max, n);
  return n;
};

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';

export const AdminStudentsManager: React.FC<AdminStudentsManagerProps> = ({ onNotice, teacherMode = false }) => {
  const { language } = useLanguage();
  const { user, firebaseUser } = useAuth();
  const isAr = language === 'ar';
  const adminName = user?.fullName || (isAr ? 'المدير' : 'Administrator');

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [profileOf, setProfileOf] = useState<any>(null);
  const [courseNames, setCourseNames] = useState<string[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [criteria, setCriteria] = useState<RatingCriterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [groupFilter, setGroupFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [starAmount, setStarAmount] = useState('');
  const [starReason, setStarReason] = useState('');
  const [gradeTitle, setGradeTitle] = useState('');
  const [gradeScore, setGradeScore] = useState('');
  const [teachers, setTeachers] = useState<{ id: string; fullName: string; email?: string }[]>([]);
  useEffect(() => {
    if (!teacherMode) groupService.getTeachers().then((t: any[]) => setTeachers(t.map((x) => ({ id: x.id, fullName: x.fullName || x.email || '', email: x.email || '' })))).catch(() => {});
  }, [teacherMode]);

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setLoadError(null);
    try {
      const rows: StudentRow[] = [];
      if (teacherMode) {
        (await groupService.getTeacherStudents(firebaseUser?.uid || '')).forEach((u) => rows.push(u));
      } else {
        const snap = await getDocs(collection(db, 'users'));
        snap.forEach((d) => {
          const data = d.data() as any;
          if (data.role === 'student' && !['', 'pending'].includes(String(data.subscriptionStatus || '').toLowerCase())) rows.push({ ...data, id: d.id });
        });
      }
      rows.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      setStudents(rows);
    } catch (err: any) {
      console.error('Error loading students:', err);
      setLoadError(err?.code || err?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }

    try {
      const courseSnap = await getDocs(collection(db, 'courses'));
      const names: string[] = [];
      courseSnap.forEach((d) => {
        const data = d.data() as any;
        if (data.titleEn) names.push(String(data.titleEn));
        if (data.titleAr && data.titleAr !== data.titleEn) names.push(String(data.titleAr));
      });
      setCourseNames(names);
    } catch {
      // Course suggestions are optional
    }

    try {
      setGroups(teacherMode ? await groupService.getTeacherGroups(firebaseUser?.uid || '') : await groupService.getGroups());
      setCriteria(await groupService.getCriteria());
    } catch (err) {
      console.error('Error loading groups/criteria:', err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selected = students.find((s) => s.id === selectedId) || null;
  const groupName = (id?: string) => groups.find((g) => g.id === id)?.name || '';

  const openStudent = (s: StudentRow) => {
    setSelectedId(s.id);
    setForm(toForm(s));
    setStarAmount('');
    setStarReason('');
    setGradeTitle('');
    setGradeScore('');
  };

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const errText = (err: any) => err?.code || err?.message || '';

  const handleSave = async () => {
    if (!selected) return;
    if (form.subscriptionStatus === 'active' && (!form.mainLevel || !form.enrolledCourseName.trim())) {
      onNotice(
        isAr
          ? 'لتفعيل الاشتراك حدّد المستوى واسم الدورة أولاً.'
          : 'Please set the level and course name before activating.'
      );
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', selected.id), {
        subscriptionStatus: form.subscriptionStatus,
        mainLevel: textOrDelete(form.mainLevel),
        enrolledCourseName: textOrDelete(form.enrolledCourseName),
        curriculumId: textOrDelete(form.curriculumId),
        currentStage: textOrDelete(form.currentStage),
        learningFormat: textOrDelete(form.learningFormat),
        monthlyTuitionUSD: numberOrDelete(form.monthlyTuitionUSD, 0),
        stageProgress: numberOrDelete(form.stageProgress, 0, 100),
        lessonsAttended: numberOrDelete(form.lessonsAttended, 0),
        lessonsTotal: numberOrDelete(form.lessonsTotal, 0),
        groupId: textOrDelete(form.groupId),
        // معلم حقيقي: يرى الطالب في لوحته ويرد على رسائله
        ...(form.teacherId
          ? {
              teacherId: form.teacherId,
              teacherManual: true,
              assignedTeacherName: teachers.find((t) => t.id === form.teacherId)?.fullName || form.assignedTeacherName || deleteField(),
              assignedTeacherEmail: teachers.find((t) => t.id === form.teacherId)?.email || deleteField()
            }
          : { teacherManual: deleteField() }),
        // مواعيد الدرس: أيام الأسبوع (0 = الأحد) والساعة، ومنها يُسجَّل الحضور
        lessonDays: form.lessonDays.length ? [...form.lessonDays].sort() : deleteField(),
        lessonTime: textOrDelete(form.lessonTime),
        lessonNote: textOrDelete(form.lessonNote),
        lessonDuration: numberOrDelete(form.lessonDuration, 10, 180),
        tuitionCurrency: textOrDelete(form.tuitionCurrency),
        updatedAt: new Date().toISOString()
      });
      try {
        await groupService.syncMember(selected.id); // تحديث لوحة المجموعة التي يراها الطلاب
      } catch (syncErr) {
        console.error('Could not update group board:', syncErr);
      }
      onNotice(isAr ? 'تم حفظ بيانات الطالب.' : 'Student record saved.');
      setSelectedId(null);
      await load(false);
    } catch (err: any) {
      console.error('Error saving student:', err);
      onNotice((isAr ? 'تعذّر الحفظ: ' : 'Save failed: ') + errText(err));
    } finally {
      setSaving(false);
    }
  };

  const record = async (amount: number, reason: string, criterionId?: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      await groupService.awardStars({
        studentId: selected.id,
        studentName: selected.fullName,
        groupId: selected.groupId, // المجموعة المحفوظة للطالب
        amount,
        reason,
        criterionId,
        awardedBy: adminName,
        asTeacher: teacherMode
      });
      onNotice(
        isAr
          ? `تم تسجيل ${amount > 0 ? '+' : ''}${amount} نجمة لـ ${selected.fullName || ''}.`
          : `Recorded ${amount > 0 ? '+' : ''}${amount} stars for ${selected.fullName || ''}.`
      );
      await load(false);
    } catch (err: any) {
      console.error('Error awarding stars:', err);
      onNotice((isAr ? 'تعذّر تسجيل النجوم: ' : 'Could not record stars: ') + errText(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCriterion = (c: RatingCriterion) => record(c.points, c.labelAr || c.labelEn, c.id);

  const handleCustomStars = async () => {
    const amount = Number(starAmount);
    if (!Number.isFinite(amount) || amount === 0) {
      onNotice(isAr ? 'اكتب عدد النجوم (رقماً غير صفر).' : 'Enter a non-zero number of stars.');
      return;
    }
    if (!starReason.trim()) {
      onNotice(isAr ? 'اكتب سبب منح النجوم.' : 'Please enter a reason.');
      return;
    }
    await record(amount, starReason.trim());
    setStarAmount('');
    setStarReason('');
  };

  const handleAddGrade = async () => {
    if (!selected) return;
    const score = Number(gradeScore);
    if (!gradeTitle.trim() || gradeScore.trim() === '' || !Number.isFinite(score) || score < 0 || score > 100) {
      onNotice(isAr ? 'اكتب اسم التقييم ودرجة بين 0 و 100.' : 'Enter an assessment name and a score from 0 to 100.');
      return;
    }
    setSaving(true);
    try {
      await groupService.addGrade({
        studentId: selected.id,
        assessmentTitle: gradeTitle.trim(),
        level: selected.mainLevel || '',
        score
      });
      onNotice(isAr ? 'تم تسجيل الدرجة.' : 'Grade recorded.');
      setGradeTitle('');
      setGradeScore('');
    } catch (err: any) {
      console.error('Error adding grade:', err);
      onNotice((isAr ? 'تعذّر تسجيل الدرجة: ' : 'Could not record grade: ') + errText(err));
    } finally {
      setSaving(false);
    }
  };

  const count = (status: string) => students.filter((s) => statusOf(s) === status).length;

  const filtered = students.filter((s) => {
    if (filter !== 'all' && statusOf(s) !== filter) return false;
    if (groupFilter === '__none__' ? !!s.groupId : groupFilter && s.groupId !== groupFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      String(s.fullName || '').toLowerCase().includes(q) ||
      (!teacherMode && String(s.email || '').toLowerCase().includes(q))
    );
  });

  const chips: { id: 'all' | 'pending' | 'active' | 'suspended'; ar: string; en: string; n: number }[] = [
    { id: 'all', ar: 'الكل', en: 'All', n: students.length },
    { id: 'pending', ar: 'بانتظار التفعيل', en: 'Pending', n: count('pending') },
    { id: 'active', ar: 'نشط', en: 'Active', n: count('active') },
    { id: 'suspended', ar: 'موقوف', en: 'Suspended', n: count('suspended') }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
            {teacherMode ? (isAr ? 'طلابي' : 'My Students') : isAr ? 'إدارة الطلاب' : 'Students Management'}
          </h2>
          <p className="text-xs text-gray-500">
            {teacherMode
              ? isAr
                ? 'طلاب مجموعاتك فقط: سجّل لهم النجوم والدرجات والواجبات والحضور.'
                : 'Students of your groups only: record stars, grades, homework and attendance.'
              : isAr
              ? 'لا تظهر للطالب لوحته إلا بعد أن تفعّل اشتراكه وتحدد مستواه ودورته.'
              : 'Students see their dashboard only after you activate them and set their level and course.'}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isAr ? 'تحديث' : 'Refresh'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? 'ابحث بالاسم أو البريد' : 'Search by name or email'}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-white"
          />
        </div>
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-white">
          <option value="">{isAr ? 'كل المجموعات' : 'All groups'}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
          <option value="__none__">{isAr ? 'بدون مجموعة' : 'No group'}</option>
        </select>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
              filter === c.id
                ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {isAr ? c.ar : c.en} ({c.n})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</div>
      ) : loadError ? (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
          <div className="font-bold">{isAr ? 'تعذّر تحميل الطلاب' : 'Could not load students'}</div>
          <div className="font-mono break-all">{loadError}</div>
          <div>
            {isAr
              ? 'تأكد أنك دخلت كمدير وأن قواعد Firestore منشورة.'
              : 'Make sure you are signed in as an admin and the Firestore rules are published.'}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">
          {isAr ? 'لا يوجد طلاب مطابقون.' : 'No matching students.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const status = statusOf(s);
            const label = STATUS_LABELS[status];
            return (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-gray-200 bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex items-start gap-3">
                  <AvatarRenderer config={(s as any).avatarConfig} size={44} />
                  <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#0A192F]">{s.fullName || '—'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        label ? label.cls : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {label ? (isAr ? label.ar : label.en) : status}
                    </span>
                    {s.groupId && groupName(s.groupId) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A192F] text-[#F3E5AB]">
                        {groupName(s.groupId)}
                      </span>
                    )}
                  </div>
                  {!teacherMode && <div className="text-[11px] text-gray-500 break-all">{s.email}</div>}
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {s.mainLevel ? `${isAr ? 'المستوى' : 'Level'} ${s.mainLevel}` : isAr ? 'بلا مستوى' : 'No level'}
                    {' • '}
                    {s.enrolledCourseName || (isAr ? 'بلا دورة' : 'No course')}
                    {' • '}
                    {s.points || 0} {isAr ? 'نجمة' : 'stars'}
                  </div>
                  </div>
                </div>
                <button
                  onClick={() => openStudent(s)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] self-start sm:self-auto"
                >
                  {isAr ? 'إدارة' : 'Manage'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {profileOf && (
        <AdminMemberProfile
          member={profileOf}
          isAr={isAr}
          onClose={() => setProfileOf(null)}
          onChanged={(patch) => setStudents((prev) => prev.map((s) => (s.id === profileOf.id ? ({ ...s, ...patch } as any) : s)))}
        />
      )}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto p-4" onClick={() => setSelectedId(null)}>
          <div
            className="max-w-2xl mx-auto my-6 bg-white rounded-3xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <AvatarRenderer config={(selected as any).avatarConfig} size={56} />
                <div className="min-w-0">
                <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F]">{selected.fullName || '—'}</h3>
                {!teacherMode && <p className="text-[11px] text-gray-500 break-all">{selected.email}</p>}
                {!teacherMode && <p className="text-[10px] text-gray-400 font-mono break-all">{selected.id}</p>}
                {!teacherMode && (
                  <button onClick={() => setProfileOf(selected)} className="mt-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-[#D4AF37]/20 text-[#7A5C00]">
                    {isAr ? 'صفحتها: الاسم والأفاتار والصور والمنشورات' : 'Profile: name, avatar, photos & posts'}
                  </button>
                )}
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!teacherMode && (
              <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'حالة الاشتراك' : 'Subscription status'}
                </label>
                <select
                  value={form.subscriptionStatus}
                  onChange={(e) => setField('subscriptionStatus', e.target.value)}
                  className={inputCls}
                >
                  <option value="pending">{isAr ? 'بانتظار التفعيل' : 'Pending'}</option>
                  <option value="active">{isAr ? 'نشط' : 'Active'}</option>
                  <option value="suspended">{isAr ? 'موقوف' : 'Suspended'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'المجموعة' : 'Group'}
                </label>
                <select
                  value={form.groupId}
                  onChange={(e) => setField('groupId', e.target.value)}
                  className={inputCls}
                >
                  <option value="">{isAr ? '— بدون مجموعة —' : '— No group —'}</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {groups.length === 0 && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {isAr ? 'أنشئ مجموعة من تبويب سجل تدقيق النجوم ← إدارة المجموعات.' : 'Create a group in Stars Audit Ledger → Manage groups.'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'المستوى' : 'Level'}
                </label>
                <select
                  value={form.mainLevel}
                  onChange={(e) => setField('mainLevel', e.target.value)}
                  className={inputCls}
                >
                  <option value="">{isAr ? '— بدون —' : '— None —'}</option>
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'المرحلة الحالية' : 'Current stage'}
                </label>
                <input
                  type="text"
                  value={form.currentStage}
                  onChange={(e) => setField('currentStage', e.target.value)}
                  placeholder="e.g. B1.1"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'اسم الدورة (كما في الموقع)' : 'Course name (as on the website)'}
                </label>
                <input
                  type="text"
                  list="admin-course-names"
                  value={form.enrolledCourseName}
                  onChange={(e) => setField('enrolledCourseName', e.target.value)}
                  className={inputCls}
                />
                <datalist id="admin-course-names">
                  {courseNames.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'المنهج (يظهر للطالبة في «المنهج والمراحل»)' : 'Curriculum (shown in “Curriculum”)'}
                </label>
                <select value={form.curriculumId} onChange={(e) => setField('curriculumId', e.target.value)} className={inputCls}>
                  <option value="">{isAr ? '— بدون منهج —' : '— No curriculum —'}</option>
                  {CURRICULA.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isAr ? c.titleAr : c.titleEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'نظام الحصة' : 'Lesson format'}
                </label>
                <select
                  value={form.learningFormat}
                  onChange={(e) => setField('learningFormat', e.target.value)}
                  className={inputCls}
                >
                  <option value="">{isAr ? '— بدون —' : '— None —'}</option>
                  <option value="individual">{isAr ? 'فردي (خاص)' : 'Private 1-on-1'}</option>
                  <option value="group">{isAr ? 'جماعي (مجموعة)' : 'Group'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'مدة الدرس' : 'Lesson length'}
                </label>
                <select value={form.lessonDuration} onChange={(e) => setForm((f) => ({ ...f, lessonDuration: e.target.value }))} className={inputCls}>
                  <option value="">{isAr ? '— غير محددة —' : '— Not set —'}</option>
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} {isAr ? 'دقيقة' : 'min'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'المعلم' : 'Teacher'}
                </label>
                {teacherMode ? (
                  <input type="text" value={form.assignedTeacherName} readOnly className={`${inputCls} bg-gray-50`} />
                ) : (
                  <select value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))} className={inputCls}>
                    <option value="">{isAr ? 'معلم المجموعة (تلقائي)' : "Group's teacher (automatic)"}</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="sm:col-span-2 p-3 rounded-xl bg-[#FAF8F5] border border-gray-200 space-y-2">
                <label className="block text-[11px] font-bold text-gray-600">{isAr ? 'مواعيد الدرس' : 'Lesson schedule'}</label>
                <div className="flex flex-wrap gap-1.5">
                  {(isAr ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((d, i) => {
                    const on = form.lessonDays.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, lessonDays: on ? f.lessonDays.filter((x) => x !== i) : [...f.lessonDays, i] }))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${on ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white text-gray-600 border-gray-200'}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="time" value={form.lessonTime} onChange={(e) => setForm((f) => ({ ...f, lessonTime: e.target.value }))} className={inputCls} />
                  <input
                    type="text"
                    value={form.lessonNote}
                    onChange={(e) => setForm((f) => ({ ...f, lessonNote: e.target.value }))}
                    placeholder={isAr ? 'ملاحظة (مثل: بتوقيت السعودية)' : 'Note (e.g. Saudi time)'}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'الرسوم الشهرية والعملة' : 'Monthly tuition & currency'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={form.monthlyTuitionUSD}
                    onChange={(e) => setField('monthlyTuitionUSD', e.target.value)}
                    className={inputCls}
                  />
                  <select value={form.tuitionCurrency} onChange={(e) => setForm((f) => ({ ...f, tuitionCurrency: e.target.value }))} className={`${inputCls} w-36`}>
                    <option value="">{isAr ? 'عملة الموقع' : 'Site currency'}</option>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {isAr ? c.ar : c.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'تقدم المرحلة (0 - 100)' : 'Stage progress (0 - 100)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.stageProgress}
                  onChange={(e) => setField('stageProgress', e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {isAr ? 'حصص منجزة' : 'Lessons attended'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.lessonsAttended}
                    onChange={(e) => setField('lessonsAttended', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    {isAr ? 'إجمالي الحصص' : 'Total lessons'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.lessonsTotal}
                    onChange={(e) => setField('lessonsTotal', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-xs bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>{saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : isAr ? 'حفظ بيانات الطالب' : 'Save student'}</span>
            </button>

              </>
            )}

            {!teacherMode && (
              <button
                onClick={async () => {
                  if (!window.confirm(isAr ? `حذف ${selected.fullName || ''} نهائيًا من المنصة؟ تُحذف بياناتها وعضويتها في المجموعة.` : `Delete ${selected.fullName || ''} permanently?`)) return;
                  try {
                    await studentDataService.deleteMemberAccount(selected.id, selected.email);
                    onNotice(isAr ? 'تم حذف الطالبة.' : 'Student deleted.');
                    setSelectedId(null);
                    await load(false);
                  } catch (err: any) {
                    onNotice((isAr ? 'تعذّر الحذف: ' : 'Delete failed: ') + errText(err));
                  }
                }}
                className="w-full py-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                {isAr ? 'حذف هذه الطالبة من المنصة' : 'Delete this student'}
              </button>
            )}

            {!teacherMode && (selected as any).role !== 'teacher' && (
              <button
                onClick={() => window.open(`/#/student-preview/${selected.id}`, '_blank')}
                className="w-full py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold hover:bg-[#162B4D]"
              >
                {isAr ? '👁️ عرض صفحة الطالب كما يراها (للعرض فقط)' : '👁️ View the student page as they see it (view only)'}
              </button>
            )}

            {!teacherMode && (selected as any).role !== 'teacher' && (
              <button
                onClick={async () => {
                  if (!window.confirm(isAr ? `تحويل ${selected.fullName || ''} إلى معلم؟ سيخرج من قائمة الطلاب.` : 'Make this account a teacher?')) return;
                  try {
                    await groupService.makeTeacher(selected);
                    onNotice(isAr ? 'أصبح الحساب معلمًا. أسندي له مجموعاته وطلابه من تبويب المعلمون.' : 'Account is now a teacher. Assign groups and students in the Teachers tab.');
                    setSelectedId(null);
                    await load(false);
                  } catch (err: any) {
                    onNotice((isAr ? 'تعذّر التحويل: ' : 'Failed: ') + errText(err));
                  }
                }}
                className="w-full py-2 rounded-xl border border-dashed border-[#D4AF37] text-xs font-bold text-[#0A192F] hover:bg-[#FAF8F5]"
              >
                {isAr ? 'تعيين هذا الحساب كمعلم' : 'Make this account a teacher'}
              </button>
            )}

            {/* Rating */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h4 className="font-bold text-sm text-[#0A192F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#AA820A]" />
                <span>
                  {isAr ? 'تقييم الطالب' : 'Rate student'} — {isAr ? 'الرصيد الحالي:' : 'Current:'} {selected.points || 0}
                </span>
              </h4>
              {form.groupId !== (selected.groupId || '') && (
                <p className="text-[11px] text-amber-700">
                  {isAr ? 'غيّرت المجموعة ولم تحفظ بعد. احفظ أولًا ليُسجَّل التقييم في المجموعة الجديدة.' : 'You changed the group but have not saved. Save first so the rating goes to the new group.'}
                </p>
              )}

              {criteria.length === 0 ? (
                <p className="text-[11px] text-gray-500">
                  {isAr ? 'لم تُضف معايير تقييم بعد. أضفها من تبويب سجل تدقيق النجوم ← معايير التقييم.' : 'No rating criteria yet. Add them in Stars Audit Ledger → Rating criteria.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {criteria.map((c) => (
                    <button
                      key={c.id}
                      disabled={saving}
                      onClick={() => handleCriterion(c)}
                      className={`w-full px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-sm font-bold disabled:opacity-50 ${
                        c.points < 0 ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <span>
                        {c.icon} {isAr ? c.labelAr : c.labelEn || c.labelAr}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/70 text-xs">
                        {c.points > 0 ? `+${c.points}` : c.points}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-bold text-gray-600">{isAr ? 'تقييم مخصص' : 'Custom rating'}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={starAmount}
                    onChange={(e) => setStarAmount(e.target.value)}
                    placeholder={isAr ? 'العدد (مثل 5 أو -2)' : 'Amount (e.g. 5 or -2)'}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={starReason}
                    onChange={(e) => setStarReason(e.target.value)}
                    placeholder={isAr ? 'السبب' : 'Reason'}
                    className={`${inputCls} sm:col-span-2`}
                  />
                </div>
                <button
                  onClick={handleCustomStars}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] disabled:opacity-50"
                >
                  {isAr ? 'تسجيل النجوم' : 'Record stars'}
                </button>
              </div>
            </div>

            <AdminStudentRecords studentId={selected.id} isAr={isAr} onNotice={onNotice} teacherScope={teacherMode ? firebaseUser?.uid : undefined} lessonDays={form.lessonDays} lessonTime={form.lessonTime} lessonsAttended={Number(form.lessonsAttended) || 0} lessonsTotal={form.lessonsTotal !== '' ? Number(form.lessonsTotal) : undefined} onAttendedChange={(v) => setField('lessonsAttended', String(v))} />
          </div>
        </div>
      )}
    </div>
  );
};
