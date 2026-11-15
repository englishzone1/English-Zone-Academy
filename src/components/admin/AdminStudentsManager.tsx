import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  increment,
  deleteField
} from 'firebase/firestore';
import { RefreshCw, Search, Save, Sparkles, X } from 'lucide-react';
import { db } from '../../services/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface AdminStudentsManagerProps {
  onNotice: (message: string) => void;
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
  currentStage?: string;
  learningFormat?: string;
  assignedTeacherName?: string;
  monthlyTuitionUSD?: number;
  stageProgress?: number;
  lessonsAttended?: number;
  lessonsTotal?: number;
}

type FormState = {
  subscriptionStatus: string;
  mainLevel: string;
  enrolledCourseName: string;
  currentStage: string;
  learningFormat: string;
  assignedTeacherName: string;
  monthlyTuitionUSD: string;
  stageProgress: string;
  lessonsAttended: string;
  lessonsTotal: string;
};

const EMPTY_FORM: FormState = {
  subscriptionStatus: 'pending',
  mainLevel: '',
  enrolledCourseName: '',
  currentStage: '',
  learningFormat: '',
  assignedTeacherName: '',
  monthlyTuitionUSD: '',
  stageProgress: '',
  lessonsAttended: '',
  lessonsTotal: ''
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
  currentStage: s.currentStage || '',
  learningFormat: s.learningFormat || '',
  assignedTeacherName: s.assignedTeacherName || '',
  monthlyTuitionUSD: s.monthlyTuitionUSD !== undefined ? String(s.monthlyTuitionUSD) : '',
  stageProgress: s.stageProgress !== undefined ? String(s.stageProgress) : '',
  lessonsAttended: s.lessonsAttended !== undefined ? String(s.lessonsAttended) : '',
  lessonsTotal: s.lessonsTotal !== undefined ? String(s.lessonsTotal) : ''
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

export const AdminStudentsManager: React.FC<AdminStudentsManagerProps> = ({ onNotice }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [courseNames, setCourseNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [starAmount, setStarAmount] = useState('');
  const [starReason, setStarReason] = useState('');

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setLoadError(null);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const rows: StudentRow[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        if (data.role === 'student') rows.push({ ...data, id: d.id });
      });
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
  };

  useEffect(() => {
    load();
  }, []);

  const selected = students.find((s) => s.id === selectedId) || null;

  const openStudent = (s: StudentRow) => {
    setSelectedId(s.id);
    setForm(toForm(s));
    setStarAmount('');
    setStarReason('');
  };

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
        currentStage: textOrDelete(form.currentStage),
        learningFormat: textOrDelete(form.learningFormat),
        assignedTeacherName: textOrDelete(form.assignedTeacherName),
        monthlyTuitionUSD: numberOrDelete(form.monthlyTuitionUSD, 0),
        stageProgress: numberOrDelete(form.stageProgress, 0, 100),
        lessonsAttended: numberOrDelete(form.lessonsAttended, 0),
        lessonsTotal: numberOrDelete(form.lessonsTotal, 0),
        updatedAt: new Date().toISOString()
      });
      onNotice(isAr ? 'تم حفظ بيانات الطالب.' : 'Student record saved.');
      setSelectedId(null);
      await load(false);
    } catch (err: any) {
      console.error('Error saving student:', err);
      onNotice((isAr ? 'تعذّر الحفظ: ' : 'Save failed: ') + (err?.code || err?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleAwardStars = async () => {
    if (!selected) return;
    const amount = Number(starAmount);
    if (!Number.isFinite(amount) || amount === 0) {
      onNotice(isAr ? 'اكتب عدد النجوم (رقماً غير صفر).' : 'Enter a non-zero number of stars.');
      return;
    }
    if (!starReason.trim()) {
      onNotice(isAr ? 'اكتب سبب منح النجوم.' : 'Please enter a reason.');
      return;
    }
    setSaving(true);
    try {
      const batch = writeBatch(db);
      const logRef = doc(collection(db, 'points_log'));
      batch.set(logRef, {
        id: logRef.id,
        studentId: selected.id,
        amount,
        reason: starReason.trim(),
        awardedBy: user?.fullName || 'Administrator',
        timestamp: new Date().toISOString()
      });
      batch.update(doc(db, 'users', selected.id), {
        points: increment(amount),
        updatedAt: new Date().toISOString()
      });
      await batch.commit();
      onNotice(isAr ? 'تم تسجيل النجوم في السجل وتحديث الرصيد.' : 'Stars recorded and balance updated.');
      setStarAmount('');
      setStarReason('');
      await load(false);
    } catch (err: any) {
      console.error('Error awarding stars:', err);
      onNotice((isAr ? 'تعذّر تسجيل النجوم: ' : 'Could not record stars: ') + (err?.code || err?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const count = (status: string) => students.filter((s) => statusOf(s) === status).length;

  const filtered = students.filter((s) => {
    if (filter !== 'all' && statusOf(s) !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      String(s.fullName || '').toLowerCase().includes(q) ||
      String(s.email || '').toLowerCase().includes(q)
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
            {isAr ? 'إدارة الطلاب' : 'Students Management'}
          </h2>
          <p className="text-xs text-gray-500">
            {isAr
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

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isAr ? 'ابحث بالاسم أو البريد' : 'Search by name or email'}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs bg-white"
        />
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
                  </div>
                  <div className="text-[11px] text-gray-500 break-all">{s.email}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {s.mainLevel ? `${isAr ? 'المستوى' : 'Level'} ${s.mainLevel}` : isAr ? 'بلا مستوى' : 'No level'}
                    {' • '}
                    {s.enrolledCourseName || (isAr ? 'بلا دورة' : 'No course')}
                    {' • '}
                    {s.points || 0} {isAr ? 'نجمة' : 'stars'}
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

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto p-4" onClick={() => setSelectedId(null)}>
          <div
            className="max-w-2xl mx-auto my-6 bg-white rounded-3xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F]">{selected.fullName || '—'}</h3>
                <p className="text-[11px] text-gray-500 break-all">{selected.email}</p>
                <p className="text-[10px] text-gray-400 font-mono break-all">{selected.id}</p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
                  <option value="individual">{isAr ? 'خاص (60 دقيقة)' : 'Private 1-on-1 (60 min)'}</option>
                  <option value="group">{isAr ? 'جماعي (90 دقيقة)' : 'Group (90 min)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'اسم المعلم' : 'Instructor name'}
                </label>
                <input
                  type="text"
                  value={form.assignedTeacherName}
                  onChange={(e) => setField('assignedTeacherName', e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {isAr ? 'الرسوم الشهرية (دولار)' : 'Monthly tuition (USD)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.monthlyTuitionUSD}
                  onChange={(e) => setField('monthlyTuitionUSD', e.target.value)}
                  className={inputCls}
                />
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

              <div className="grid grid-cols-2 gap-3">
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

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h4 className="font-bold text-sm text-[#0A192F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#AA820A]" />
                <span>
                  {isAr ? 'منح أو خصم نجوم' : 'Award or deduct stars'} — {isAr ? 'الرصيد الحالي:' : 'Current:'}{' '}
                  {selected.points || 0}
                </span>
              </h4>
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
                onClick={handleAwardStars}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] disabled:opacity-50"
              >
                {isAr ? 'تسجيل النجوم' : 'Record stars'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
