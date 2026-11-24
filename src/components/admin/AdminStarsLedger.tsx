import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Crown, Undo2 } from 'lucide-react';
import { db } from '../../services/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import {
  groupService,
  startOfWeek,
  startOfMonth,
  StudyGroup,
  RatingCriterion,
  PointsEntry,
  GradeEntry,
  TeacherAccount
} from '../../services/groupService';

interface Props {
  onNotice: (message: string) => void;
  teacherMode?: boolean;
}

interface StudentLite {
  id: string;
  fullName?: string;
  points?: number;
  groupId?: string;
  mainLevel?: string;
}

const NONE = '__none__';
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';
const labelCls = 'block text-[11px] font-bold text-gray-600 mb-1';
const primaryBtn =
  'px-4 py-2 rounded-xl text-xs font-bold bg-[#0E3A99] text-[#F3E5AB] hover:bg-[#1E55C0] flex items-center gap-1.5 disabled:opacity-50';

export const AdminStarsLedger: React.FC<Props> = ({ onNotice, teacherMode = false }) => {
  const { firebaseUser } = useAuth();
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [subTab, setSubTab] = useState<'ledger' | 'groups' | 'criteria'>('ledger');
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [criteria, setCriteria] = useState<RatingCriterion[]>([]);
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [log, setLog] = useState<PointsEntry[]>([]);
  const [reverting, setReverting] = useState('');
  // استعادة نقاط مُنحت بالخطأ
  // حذف كل نقاط الطالبة: ضغطتان (الأولى تجهّز، والثانية تنفّذ) بلا نافذة تأكيد
  const [resetArm, setResetArm] = useState('');
  const [resetting, setResetting] = useState('');
  const resetAll = async (studentId: string) => {
    if (resetArm !== studentId) {
      setResetArm(studentId);
      setTimeout(() => setResetArm((x) => (x === studentId ? '' : x)), 4000);
      return;
    }
    setResetArm('');
    setResetting(studentId);
    try {
      await groupService.resetStudentPoints(studentId, log.filter((l) => l.studentId === studentId), { asTeacher: teacherMode });
      setLog((l) => l.filter((x) => x.studentId !== studentId));
      setStudents((st) => st.map((s) => (s.id === studentId ? ({ ...s, points: 0 } as any) : s)));
      onNotice(tr('All points deleted.', 'تم حذف كل النقاط.'));
    } catch (err: any) {
      onNotice(`${tr('Could not delete:', 'تعذّر الحذف:')} ${err?.code || err?.message || ''}`);
    } finally {
      setResetting('');
    }
  };
  const revert = async (e: PointsEntry, name: string) => {
    setReverting(e.id);
    try {
      await groupService.revertPoints(e, { asTeacher: teacherMode });
      setLog((l) => l.filter((x) => x.id !== e.id));
      setStudents((st) => st.map((s) => (s.id === e.studentId ? ({ ...s, points: Number((s as any).points || 0) - Number(e.amount || 0) } as any) : s)));
      onNotice(tr('Points restored.', 'تمت استعادة النقاط.'));
    } catch (err: any) {
      onNotice(`${tr('Could not undo:', 'تعذّرت الاستعادة:')} ${err?.code || err?.message || ''}`);
    } finally {
      setReverting('');
    }
  };
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [expanded, setExpanded] = useState<string | null>(null);

  // group form
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupLevel, setGroupLevel] = useState('');
  const [groupTeacher, setGroupTeacher] = useState('');

  // criterion drafts
  const [drafts, setDrafts] = useState<Record<string, RatingCriterion>>({});
  const [newCrit, setNewCrit] = useState({ icon: '⭐', labelAr: '', labelEn: '', points: '5' });

  const fail = (err: any, ar: string, en: string) => {
    console.error(err);
    onNotice(`${tr(en, ar)} ${err?.code || err?.message || ''}`);
  };

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const uid = firebaseUser?.uid || '';
      const [g, c, l, gr] = await Promise.all([
        teacherMode ? groupService.getTeacherGroups(uid) : groupService.getGroups(),
        groupService.getCriteria(),
        groupService.getPointsLog(),
        groupService.getGrades()
      ]);
      const st: StudentLite[] = [];
      if (teacherMode) {
        (await groupService.getTeacherStudents(uid)).forEach((u) => st.push(u));
      } else {
        const us = await getDocs(collection(db, 'users'));
        us.forEach((d) => {
          const data = d.data() as any;
          if (data.role === 'student' && !['', 'pending'].includes(String(data.subscriptionStatus || '').toLowerCase())) st.push({ ...data, id: d.id });
        });
        setTeachers(await groupService.getTeachers());
      }
      setGroups(g);
      setCriteria(c);
      setLog(l);
      setGrades(gr);
      setStudents(st);
      setDrafts(Object.fromEntries(c.map((x) => [x.id, x])));
      setSelectedGroup((prev) => prev || g[0]?.id || NONE);
    } catch (err: any) {
      console.error(err);
      setLoadError(err?.code || err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // تحديث لوحات المجموعات التي يراها الطلاب تلقائيًا عند فتح هذا التبويب
    if (!teacherMode) groupService.syncAllMembers().catch((err) => console.error('Group boards sync failed:', err));
  }, []);

  /* ------------------------------ Ledger data ------------------------------ */

  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  const members = students.filter((s) => (s.groupId || NONE) === selectedGroup);

  const sumSince = (sid: string, since: Date) =>
    log.filter((l) => l.studentId === sid && new Date(l.timestamp) >= since).reduce((a, l) => a + (l.amount || 0), 0);

  const rows = members
    .map((s) => ({ s, total: s.points || 0, week: sumSince(s.id, weekStart), month: sumSince(s.id, monthStart) }))
    .sort((a, b) => b.total - a.total);

  const best = (key: 'total' | 'week' | 'month') => {
    const top = [...rows].sort((a, b) => b[key] - a[key])[0];
    return top && top[key] > 0 ? top : null;
  };
  const leader = best('total');
  const starWeek = best('week');
  const starMonth = best('month');

  const groupLabel = (id: string) => groups.find((g) => g.id === id)?.name || tr('No group', 'بدون مجموعة');

  /* ------------------------------ Groups handlers ------------------------------ */

  const resetGroupForm = () => {
    setEditingGroupId(null);
    setGroupName('');
    setGroupLevel('');
    setGroupTeacher('');
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) return;
    try {
      await groupService.saveGroup({
        id: editingGroupId || undefined,
        name: groupName.trim(),
        level: groupLevel || undefined,
        teacherId: groupTeacher || '',
        teacherName: teachers.find((t) => t.id === groupTeacher)?.fullName || '',
        createdAt: groups.find((g) => g.id === editingGroupId)?.createdAt
      });
      onNotice(tr('Group saved.', 'تم حفظ المجموعة.'));
      resetGroupForm();
      await load();
      // ربط طلاب المجموعة بمعلمها
      groupService.syncAllMembers().catch((err) => console.error(err));
    } catch (err) {
      fail(err, 'تعذر حفظ المجموعة:', 'Could not save group:');
    }
  };

  const handleDeleteGroup = async (g: StudyGroup) => {
    if (!window.confirm(tr(`Delete group "${g.name}"? Its students stay but lose the group.`, `حذف المجموعة "${g.name}"؟ سيبقى طلابها لكن بدون مجموعة.`))) return;
    try {
      await groupService.deleteGroup(g.id);
      setSelectedGroup('');
      onNotice(tr('Group deleted.', 'تم حذف المجموعة.'));
      await load();
    } catch (err) {
      fail(err, 'تعذر حذف المجموعة:', 'Could not delete group:');
    }
  };

  const [syncing, setSyncing] = useState(false);
  const handleSyncBoards = async () => {
    setSyncing(true);
    try {
      const n = await groupService.syncAllMembers();
      onNotice(tr(`Student group boards updated (${n} students).`, `تم تحديث لوحات المجموعات للطلاب (${n} طالب).`));
    } catch (err) {
      fail(err, 'تعذر التحديث:', 'Could not update:');
    } finally {
      setSyncing(false);
    }
  };

  /* ------------------------------ Criteria handlers ------------------------------ */

  const handleSeedCriteria = async () => {
    try {
      await groupService.seedDefaultCriteria();
      onNotice(tr('Suggested criteria added.', 'تمت إضافة المعايير المقترحة.'));
      await load();
    } catch (err) {
      fail(err, 'تعذرت الإضافة:', 'Could not add:');
    }
  };

  const handleSaveCriterion = async (c: RatingCriterion) => {
    if (!c.labelAr.trim()) return;
    try {
      await groupService.saveCriterion({ ...c, points: Number(c.points) || 0 });
      onNotice(tr('Criterion saved.', 'تم حفظ المعيار.'));
      await load();
    } catch (err) {
      fail(err, 'تعذر حفظ المعيار:', 'Could not save criterion:');
    }
  };

  const handleAddCriterion = async () => {
    if (!newCrit.labelAr.trim()) return;
    try {
      await groupService.saveCriterion({
        icon: newCrit.icon || '⭐',
        labelAr: newCrit.labelAr.trim(),
        labelEn: newCrit.labelEn.trim() || newCrit.labelAr.trim(),
        points: Number(newCrit.points) || 0,
        order: criteria.length + 1
      });
      setNewCrit({ icon: '⭐', labelAr: '', labelEn: '', points: '5' });
      onNotice(tr('Criterion added.', 'تمت إضافة المعيار.'));
      await load();
    } catch (err) {
      fail(err, 'تعذرت الإضافة:', 'Could not add:');
    }
  };

  const handleDeleteCriterion = async (id: string) => {
    if (!window.confirm(tr('Delete this criterion?', 'حذف هذا المعيار؟'))) return;
    try {
      await groupService.deleteCriterion(id);
      await load();
    } catch (err) {
      fail(err, 'تعذر الحذف:', 'Could not delete:');
    }
  };

  /* ------------------------------ Render ------------------------------ */

  const subTabs: { id: 'ledger' | 'groups' | 'criteria'; en: string; ar: string }[] = [
    { id: 'ledger', en: 'Ledger by group', ar: 'السجل حسب المجموعة' },
    { id: 'groups', en: 'Manage groups', ar: 'إدارة المجموعات' },
    { id: 'criteria', en: 'Rating criteria', ar: 'معايير التقييم' }
  ].filter((t) => !teacherMode || t.id === 'ledger') as any;

  const StarCard = ({ title, row, value }: { title: string; row: { s: StudentLite } | null; value?: number }) => (
    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/40">
      <div className="text-[11px] text-gray-500 font-bold flex items-center gap-1.5">
        <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
        {title}
      </div>
      <div className="font-bold text-sm text-[#0E3A99] mt-1">{row ? row.s.fullName || '—' : tr('No one yet', 'لا أحد بعد')}</div>
      {row && value !== undefined && <div className="text-xs text-[#AA820A] font-bold">{value} ⭐</div>}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="font-serif-luxury font-bold text-xl text-[#0E3A99]">{tr('Stars Audit Ledger', 'سجل تدقيق النجوم')}</h2>
        <p className="text-xs text-gray-500">
          {tr(
            'Each group with its students, points, history and grades. Stars are given from Students Management.',
            'كل مجموعة مع طلابها ونقاطهم وسجلهم ودرجاتهم. تُمنح النجوم من تبويب الطلاب.'
          )}
        </p>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto w-fit max-w-full">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              subTab === t.id ? 'bg-white text-[#0E3A99] shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : loadError ? (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
          <div className="font-bold">{tr('Could not load data', 'تعذر تحميل البيانات')}</div>
          <div className="font-mono break-all">{loadError}</div>
          <div>{tr('Publish the Firestore rules for groups, rating_criteria, points_log and grades.', 'انشر قواعد Firestore الخاصة بـ groups و rating_criteria و points_log و grades.')}</div>
        </div>
      ) : (
        <>
          {/* ---------------- LEDGER ---------------- */}
          {subTab === 'ledger' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroup(g.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${
                      selectedGroup === g.id ? 'bg-[#0E3A99] text-[#F3E5AB] border-[#0E3A99]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {g.name} ({students.filter((s) => s.groupId === g.id).length})
                  </button>
                ))}
                <button
                  onClick={() => setSelectedGroup(NONE)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${
                    selectedGroup === NONE ? 'bg-[#0E3A99] text-[#F3E5AB] border-[#0E3A99]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tr('No group', 'بدون مجموعة')} ({students.filter((s) => !s.groupId).length})
                </button>
              </div>

              {groups.length === 0 && (
                <div className="p-5 rounded-2xl bg-[#FAF8F5] text-xs text-gray-600">
                  {tr('No groups yet. Create one from "Manage groups", then assign students from Students Management.', 'لا توجد مجموعات بعد. أنشئ مجموعة من "إدارة المجموعات" ثم عيّن الطلاب من تبويب الطلاب.')}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StarCard title={tr('Group leader', 'الأول على المجموعة')} row={leader} value={leader?.total} />
                <StarCard title={tr('Star of the week', 'نجم الأسبوع')} row={starWeek} value={starWeek?.week} />
                <StarCard title={tr('Star of the month', 'نجم الشهر')} row={starMonth} value={starMonth?.month} />
              </div>

              {rows.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">
                  {tr('No students in this group.', 'لا يوجد طلاب في هذه المجموعة.')}
                </div>
              ) : (
                <div className="space-y-3">
                  {rows.map((r, i) => {
                    const entries = log.filter((l) => l.studentId === r.s.id);
                    const sGrades = grades.filter((g) => g.studentId === r.s.id);
                    const open = expanded === r.s.id;
                    return (
                      <div key={r.s.id} className="rounded-xl border border-gray-200 bg-[#FAF8F5]">
                        <button onClick={() => setExpanded(open ? null : r.s.id)} className="w-full p-4 flex items-center justify-between gap-3 text-start">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-full bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-[#0E3A99] truncate flex items-center gap-2">
                                <AvatarRenderer config={(r.s as any).avatarConfig} gender={(r.s as any).gender} size={30} />
                                {r.s.fullName || '—'}
                              </div>
                              <div className="text-[11px] text-gray-500">
                                {tr('This week', 'هذا الأسبوع')}: {r.week} • {tr('This month', 'هذا الشهر')}: {r.month}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="px-3 py-1 rounded-full bg-amber-50 text-[#AA820A] text-xs font-bold">{r.total} ⭐</span>
                            {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </button>

                        {open && (
                          <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-bold text-[#0E3A99]">{tr('Stars history', 'سجل النجوم')}</div>
                                <button
                                  onClick={() => resetAll(r.s.id)}
                                  disabled={resetting === r.s.id}
                                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 disabled:opacity-50 ${resetArm === r.s.id ? 'bg-red-600 text-white animate-pulse' : 'bg-red-50 text-red-700'}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  {resetArm === r.s.id ? tr('Tap again to delete all', 'اضغطي مرة أخرى لحذف الكل') : tr('Delete all points', 'حذف كل النقاط')}
                                </button>
                              </div>
                              {entries.length === 0 ? (
                                <div className="text-gray-500">{tr('No entries yet.', 'لا توجد عمليات بعد.')}</div>
                              ) : (
                                entries.map((e) => (
                                  <div key={e.id} className="p-2.5 rounded-lg bg-white border border-gray-100 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="text-gray-700">{e.reason}</div>
                                      <div className="text-[10px] text-gray-400">
                                        {e.timestamp ? new Date(e.timestamp).toLocaleString() : ''} • {e.awardedBy}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={`font-bold ${e.amount < 0 ? 'text-red-600' : 'text-[#AA820A]'}`}>{e.amount > 0 ? `+${e.amount}` : e.amount}</span>
                                      <button
                                        onClick={() => revert(e, r.s.fullName || '')}
                                        disabled={reverting === e.id}
                                        className="px-2 py-1 rounded-lg bg-red-50 text-red-700 font-bold flex items-center gap-1 disabled:opacity-50"
                                        title={tr('Undo this entry', 'استعادة: إلغاء هذه العملية')}
                                      >
                                        <Undo2 className="w-3.5 h-3.5" />
                                        {tr('Undo', 'استعادة')}
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="font-bold text-[#0E3A99]">{tr('Grades', 'الدرجات')}</div>
                              {sGrades.length === 0 ? (
                                <div className="text-gray-500">{tr('No grades yet.', 'لا توجد درجات بعد.')}</div>
                              ) : (
                                sGrades.map((g) => (
                                  <div key={g.id} className="p-2.5 rounded-lg bg-white border border-gray-100 flex items-center justify-between gap-2">
                                    <div>
                                      <div className="text-gray-700">{g.assessmentTitle}</div>
                                      <div className="text-[10px] text-gray-400">{g.date ? new Date(g.date).toLocaleDateString() : ''} • {g.level}</div>
                                    </div>
                                    <span className={`font-bold ${g.passed ? 'text-emerald-600' : 'text-red-600'}`}>{g.score}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---------------- GROUPS ---------------- */}
          {subTab === 'groups' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-600">
                  {tr(
                    'Students see their group board (names and points only). It updates automatically; press this once now, and again if a board looks wrong.',
                    'يرى كل طالب لوحة مجموعته (الأسماء والنقاط فقط). تتحدث تلقائيًا، اضغط هذا الزر مرة واحدة الآن، ثم عند الحاجة فقط.'
                  )}
                </p>
                <button onClick={handleSyncBoards} disabled={syncing} className={primaryBtn}>
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  <span>{syncing ? tr('Updating...', 'جارٍ التحديث...') : tr('Update student boards', 'تحديث لوحات الطلاب')}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F5] space-y-4">
                <h4 className="font-bold text-xs text-[#0E3A99]">{editingGroupId ? tr('Edit group', 'تعديل المجموعة') : tr('New group', 'مجموعة جديدة')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>{tr('Group name', 'اسم المجموعة')}</label>
                    <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tr('Level (optional)', 'المستوى (اختياري)')}</label>
                    <select value={groupLevel} onChange={(e) => setGroupLevel(e.target.value)} className={inputCls}>
                      <option value="">{tr('— None —', '— بدون —')}</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{tr('Teacher', 'المعلم')}</label>
                    <select value={groupTeacher} onChange={(e) => setGroupTeacher(e.target.value)} className={inputCls}>
                      <option value="">{tr('— None —', '— بدون معلم —')}</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.fullName || t.email}</option>
                      ))}
                    </select>
                    {teachers.length === 0 && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {tr('Add teachers from the Teachers tab first.', 'أضف المعلمين أولًا من تبويب المعلمين.')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {editingGroupId && (
                    <button onClick={resetGroupForm} className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-600">
                      {tr('Cancel', 'إلغاء')}
                    </button>
                  )}
                  <button onClick={handleSaveGroup} disabled={!groupName.trim()} className={primaryBtn}>
                    <Save className="w-4 h-4 text-[#D4AF37]" />
                    <span>{tr('Save group', 'حفظ المجموعة')}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {groups.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No groups yet.', 'لا توجد مجموعات بعد.')}</div>
                ) : (
                  groups.map((g) => (
                    <div key={g.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-[#0E3A99]">{g.name}</div>
                        <div className="text-[11px] text-gray-500">
                          {g.level ? `${g.level} • ` : ''}
                          {g.teacherName ? `${g.teacherName} • ` : ''}
                          {students.filter((s) => s.groupId === g.id).length} {tr('students', 'طلاب')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingGroupId(g.id);
                            setGroupName(g.name);
                            setGroupLevel(g.level || '');
                            setGroupTeacher(g.teacherId || '');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {tr('Edit', 'تعديل')}
                        </button>
                        <button onClick={() => handleDeleteGroup(g)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ---------------- CRITERIA ---------------- */}
          {subTab === 'criteria' && (
            <div className="space-y-6">
              <p className="text-xs text-gray-600">
                {tr(
                  'You decide what appears when rating a student and how many stars each item is worth. Use a negative number to deduct.',
                  'أنت تحدد ما يظهر عند تقييم الطالب وكم نجمة لكل بند. استخدم رقمًا سالبًا للخصم.'
                )}
              </p>

              {criteria.length === 0 && (
                <div className="p-5 rounded-2xl bg-[#FAF8F5] text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span>{tr('No criteria yet.', 'لا توجد معايير بعد.')}</span>
                  <button onClick={handleSeedCriteria} className={primaryBtn}>
                    {tr('Add suggested criteria', 'إضافة المعايير المقترحة')}
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {criteria.map((c) => {
                  const d = drafts[c.id] || c;
                  const set = (patch: Partial<RatingCriterion>) => setDrafts({ ...drafts, [c.id]: { ...d, ...patch } });
                  return (
                    <div key={c.id} className="p-4 rounded-xl border border-gray-200 bg-white grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-2 sm:col-span-1">
                        <label className={labelCls}>{tr('Icon', 'رمز')}</label>
                        <input type="text" value={d.icon} onChange={(e) => set({ icon: e.target.value })} className={`${inputCls} text-center`} />
                      </div>
                      <div className="col-span-10 sm:col-span-4">
                        <label className={labelCls}>{tr('Text (AR)', 'النص (AR)')}</label>
                        <input type="text" dir="rtl" value={d.labelAr} onChange={(e) => set({ labelAr: e.target.value })} className={inputCls} />
                      </div>
                      <div className="col-span-8 sm:col-span-4">
                        <label className={labelCls}>{tr('Text (EN)', 'النص (EN)')}</label>
                        <input type="text" value={d.labelEn} onChange={(e) => set({ labelEn: e.target.value })} className={inputCls} />
                      </div>
                      <div className="col-span-4 sm:col-span-1">
                        <label className={labelCls}>{tr('Stars', 'النجوم')}</label>
                        <input type="number" value={d.points} onChange={(e) => set({ points: Number(e.target.value) })} className={inputCls} />
                      </div>
                      <div className="col-span-12 sm:col-span-2 flex items-center gap-2 justify-end">
                        <button onClick={() => handleSaveCriterion(d)} className={primaryBtn}>
                          <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{tr('Save', 'حفظ')}</span>
                        </button>
                        <button onClick={() => handleDeleteCriterion(c.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F5] space-y-3">
                <h4 className="font-bold text-xs text-[#0E3A99]">{tr('Add criterion', 'إضافة معيار')}</h4>
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelCls}>{tr('Icon', 'رمز')}</label>
                    <input type="text" value={newCrit.icon} onChange={(e) => setNewCrit({ ...newCrit, icon: e.target.value })} className={`${inputCls} text-center`} />
                  </div>
                  <div className="col-span-10 sm:col-span-4">
                    <label className={labelCls}>{tr('Text (AR)', 'النص (AR)')}</label>
                    <input type="text" dir="rtl" value={newCrit.labelAr} onChange={(e) => setNewCrit({ ...newCrit, labelAr: e.target.value })} className={inputCls} />
                  </div>
                  <div className="col-span-8 sm:col-span-4">
                    <label className={labelCls}>{tr('Text (EN)', 'النص (EN)')}</label>
                    <input type="text" value={newCrit.labelEn} onChange={(e) => setNewCrit({ ...newCrit, labelEn: e.target.value })} className={inputCls} />
                  </div>
                  <div className="col-span-4 sm:col-span-1">
                    <label className={labelCls}>{tr('Stars', 'النجوم')}</label>
                    <input type="number" value={newCrit.points} onChange={(e) => setNewCrit({ ...newCrit, points: e.target.value })} className={inputCls} />
                  </div>
                  <div className="col-span-12 sm:col-span-2 flex justify-end">
                    <button onClick={handleAddCriterion} disabled={!newCrit.labelAr.trim()} className={primaryBtn}>
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>{tr('Add', 'إضافة')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
