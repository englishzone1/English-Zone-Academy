import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Star, FileText, Mic, Download, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { studentHubService, HomeworkResult } from '../../services/studentHubService';
import { groupService, StudyGroup } from '../../services/groupService';

interface Props {
  onNotice: (message: string) => void;
  teacherMode?: boolean;
}

const color = (p: number) => (p >= 70 ? 'bg-emerald-50 text-emerald-700' : p >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700');

// نتائج الواجبات والاختبارات من موقع الواجبات التفاعلي: تصل مباشرة عند حلّ الطالب
export const AdminHomeworkResults: React.FC<Props> = ({ onNotice, teacherMode = false }) => {
  const { language } = useLanguage();
  const { firebaseUser, user } = useAuth();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [items, setItems] = useState<HomeworkResult[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState<'all' | 'lesson' | 'test'>('all');
  const [view, setView] = useState<'latest' | 'students'>('latest');
  const [busy, setBusy] = useState('');
  const [loadError, setLoadError] = useState('');

  // اقتراح النجوم حسب النسبة: 90%+ ثلاث نجوم، 70%+ نجمتان، 50%+ نجمة
  const suggest = (p: number) => (p >= 90 ? 3 : p >= 70 ? 2 : p >= 50 ? 1 : 0);

  const giveStars = async (r: HomeworkResult, amount: number) => {
    if (amount <= 0 || r.starsGiven) return;
    setBusy(r.id);
    try {
      await groupService.awardStars({
        studentId: r.studentId,
        studentName: r.studentName,
        groupId: r.groupId,
        amount,
        reason: `${tr('Homework', 'واجب')}: ${r.title} (${r.score}/${r.total})`,
        awardedBy: user?.fullName || tr('Administration', 'الإدارة'),
        asTeacher: teacherMode
      });
      await studentHubService.markHomeworkStars(r.id, amount);
      setItems((prev) => prev.map((x) => (x.id === r.id ? { ...x, starsGiven: amount } : x)));
      onNotice(tr(`+${amount} stars for ${r.studentName}.`, `تم منح ${amount} نجوم لـ ${r.studentName}.`));
    } catch (err: any) {
      onNotice(`${tr('Could not give stars:', 'تعذّر منح النجوم:')} ${err?.code || err?.message || ''}`);
    } finally {
      setBusy('');
    }
  };

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const uid = firebaseUser?.uid || '';
      const [r, g] = await Promise.all([
        studentHubService.getAllHomeworkResults(teacherMode ? uid : undefined),
        teacherMode ? groupService.getTeacherGroups(uid) : groupService.getGroups()
      ]);
      setItems(r);
      setGroups(g);
    } catch (err: any) {
      const code = err?.code || err?.message || '';
      setLoadError(code);
      onNotice(`${tr('Could not load results:', 'تعذر تحميل النتائج:')} ${code}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (r) =>
          (groupFilter === 'all' || r.groupId === groupFilter) &&
          (kindFilter === 'all' || (kindFilter === 'lesson' ? r.kind === 'lesson' : r.kind !== 'lesson'))
      ),
    [items, groupFilter, kindFilter]
  );

  // ملخص لكل طالب: عدد الدروس والاختبارات ومتوسطها
  const perStudent = useMemo(() => {
    const m = new Map<string, { name: string; lessons: number[]; tests: number[]; last: string }>();
    filtered.forEach((r) => {
      const x = m.get(r.studentId) || { name: r.studentName, lessons: [], tests: [], last: r.createdAt };
      (r.kind === 'lesson' ? x.lessons : x.tests).push(r.percent);
      if (r.createdAt > x.last) x.last = r.createdAt;
      m.set(r.studentId, x);
    });
    const avg = (a: number[]) => (a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : undefined);
    return [...m.entries()]
      .map(([id, x]) => ({ id, name: x.name, lessons: x.lessons.length, lessonAvg: avg(x.lessons), tests: x.tests.length, testAvg: avg(x.tests), last: x.last }))
      .sort((a, b) => b.last.localeCompare(a.last));
  }, [filtered]);

  // تحميل النتائج كملف يفتح في Excel (CSV بترميز UTF-8)
  const exportExcel = () => {
    const cell = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = [
      tr('Student', 'الطالب'),
      tr('Group', 'المجموعة'),
      tr('Type', 'النوع'),
      tr('Title', 'العنوان'),
      tr('Score', 'الدرجة'),
      tr('Out of', 'من'),
      tr('Percent', 'النسبة'),
      tr('Speaking', 'المحادثة'),
      tr('Strengths', 'نقاط القوة'),
      tr('Weaknesses', 'نقاط الضعف'),
      tr('Date', 'التاريخ')
    ];
    const rows = filtered.map((r) => [
      r.studentName,
      groupName(r.groupId),
      kindLabel(r.kind),
      r.title,
      r.score,
      r.total,
      `${r.percent}%`,
      r.speakingScore !== undefined ? `${r.speakingScore}/${r.speakingMax}` : '',
      (r.strengths || []).join(' • '),
      (r.weaknesses || []).join(' • '),
      new Date(r.createdAt).toLocaleString(isAr ? 'ar' : 'en')
    ]);
    const csv = '\uFEFF' + [head, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `english-zone-results-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // حذف التسجيلات التي وُضعت درجتها ومضى عليها أكثر من 30 يومًا (للإدارة)
  const oldGraded = useMemo(() => {
    const limit = Date.now() - 30 * 24 * 3600 * 1000;
    return items.filter((r) => (r.audioCount || 0) > 0 && r.speakingScore !== undefined && new Date(r.createdAt).getTime() < limit);
  }, [items]);

  const cleanOldAudio = async () => {
    if (!oldGraded.length) {
      onNotice(tr('No graded recordings older than 30 days.', 'لا توجد تسجيلات مصحّحة أقدم من 30 يومًا.'));
      return;
    }
    if (!window.confirm(tr(`Delete ${oldGraded.length} graded recordings older than 30 days? Grades stay.`, `حذف تسجيلات ${oldGraded.length} نتيجة مصحّحة أقدم من 30 يومًا؟ الدرجات تبقى محفوظة.`))) return;
    setBusy('clean');
    let done = 0;
    for (const r of oldGraded) {
      try {
        await studentHubService.deleteHomeworkAudio(r.id, r.audioCount || 0);
        done++;
      } catch (err) {
        console.error(err);
      }
    }
    setBusy('');
    onNotice(tr(`Deleted recordings of ${done} results.`, `تم حذف تسجيلات ${done} نتيجة.`));
    load();
  };

  const kindLabel = (k: string) => (k === 'exam' ? tr('Final exam', 'اختبار نهائي') : k === 'test' ? tr('Unit test', 'اختبار وحدة') : tr('Lesson', 'درس'));
  const groupName = (id?: string) => groups.find((g) => g.id === id)?.name || '';
  const sel = 'px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{tr('Homework & Test Results', 'نتائج الواجبات والاختبارات')}</h2>
          <p className="text-xs text-gray-500">
            {tr(
              'Results arrive automatically when students solve lessons and tests in their dashboard.',
              'تصل النتائج تلقائيًا عندما يحلّ الطلاب الدروس والاختبارات من لوحتهم.'
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <button onClick={exportExcel} disabled={!filtered.length} className="px-3 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
            <Download className="w-4 h-4" />
            {tr('Download Excel', 'تحميل Excel')}
          </button>
          {!teacherMode && (
            <button
              onClick={cleanOldAudio}
              disabled={busy === 'clean'}
              title={tr('Graded recordings older than 30 days', 'التسجيلات المصحّحة الأقدم من 30 يومًا')}
              className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {tr(`Clean old recordings (${oldGraded.length})`, `حذف التسجيلات القديمة (${oldGraded.length})`)}
            </button>
          )}
          <button onClick={load} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            {tr('Refresh', 'تحديث')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className={sel}>
          <option value="all">{tr('All groups', 'كل المجموعات')}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as any)} className={sel}>
          <option value="all">{tr('Lessons and tests', 'الدروس والاختبارات')}</option>
          <option value="lesson">{tr('Lessons (homework)', 'الدروس (الواجبات)')}</option>
          <option value="test">{tr('Tests', 'الاختبارات')}</option>
        </select>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-bold">
          <button onClick={() => setView('latest')} className={`px-3 py-2 ${view === 'latest' ? 'bg-[#0A192F] text-[#F3E5AB]' : 'bg-white text-gray-600'}`}>
            {tr('Latest', 'الأحدث')}
          </button>
          <button onClick={() => setView('students')} className={`px-3 py-2 ${view === 'students' ? 'bg-[#0A192F] text-[#F3E5AB]' : 'bg-white text-gray-600'}`}>
            {tr('Per student', 'لكل طالب')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : loadError ? (
        <div className="p-6 text-center text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          {loadError.includes('permission')
            ? tr(
                'The database refused to show results: publish the latest Firestore rules (firestore-rules-full.txt), then press Refresh.',
                'قاعدة البيانات رفضت عرض النتائج: انشري ملف القواعد الأخير (firestore-rules-full.txt) ثم اضغطي «تحديث».'
              )
            : `${tr('Could not load results:', 'تعذر تحميل النتائج:')} ${loadError}`}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No results yet.', 'لا توجد نتائج بعد.')}</div>
      ) : view === 'latest' ? (
        <div className="space-y-2">
          {filtered.slice(0, 200).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-gray-100 text-xs">
              <div>
                <span className="font-bold text-[#0A192F]">{r.studentName}</span>
                {groupName(r.groupId) && <span className="text-gray-400"> • {groupName(r.groupId)}</span>}
                <div className="text-gray-600 mt-0.5">
                  {r.title} <span className="text-gray-400">• {kindLabel(r.kind)} • {new Date(r.createdAt).toLocaleString(isAr ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                {!!r.sections?.length && (
                  <div className="flex flex-wrap gap-1 mt-1.5" dir="ltr">
                    {r.sections.map((s) => (
                      <span key={s.name} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${color(s.n ? Math.round((s.ok / s.n) * 100) : 0)}`}>
                        {s.name} {s.ok}/{s.n}
                      </span>
                    ))}
                  </div>
                )}
                {!!r.strengths?.length && (
                  <div className="mt-1 text-[11px] text-emerald-700">
                    <b>{tr('Strengths:', 'نقاط القوة:')}</b> <span dir="ltr">{r.strengths.join(' • ')}</span>
                  </div>
                )}
                {!!r.weaknesses?.length && (
                  <div className="text-[11px] text-red-600">
                    <b>{tr('Weaknesses:', 'نقاط الضعف:')}</b> <span dir="ltr">{r.weaknesses.join(' • ')}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap ${color(r.percent)}`}>
                  {r.score}/{r.total} ({r.percent}%)
                </span>
                {!!r.audioCount && (
                  <span className="px-2 py-1 rounded-lg bg-[#F3E5AB]/50 text-[#0A192F] font-bold whitespace-nowrap flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" />
                    {r.speakingScore !== undefined ? `${r.speakingScore}/${r.speakingMax}` : tr('to grade', 'بانتظار درجتك')}
                  </span>
                )}
                {(r.hasAnswers || !!r.audioCount) && (
                  <button
                    onClick={() => window.open(`/#/hw-answers/${r.id}`, '_blank')}
                    className="px-2.5 py-1 rounded-lg border border-[#0A192F] text-[#0A192F] font-bold whitespace-nowrap flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {tr('Answers', 'الإجابات')}
                  </button>
                )}
                {r.starsGiven ? (
                  <span className="px-2.5 py-1 rounded-lg bg-[#F3E5AB]/50 text-[#8a6d10] font-bold whitespace-nowrap flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {tr(`${r.starsGiven} given`, `مُنحت ${r.starsGiven}`)}
                  </span>
                ) : (
                  [1, 2, 3].map((n) => (
                    <button
                      key={n}
                      disabled={busy === r.id}
                      onClick={() => giveStars(r, n)}
                      title={tr(`Give ${n} stars`, `امنحي ${n} نجوم`)}
                      className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-0.5 disabled:opacity-50 ${
                        n === suggest(r.percent) ? 'border-[#D4AF37] bg-[#F3E5AB]/40 text-[#0A192F]' : 'border-gray-200 bg-white text-gray-500'
                      }`}
                    >
                      +{n}
                      <Star className="w-3 h-3" />
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead>
              <tr className="bg-[#FAF8F5] text-gray-500 border-b border-gray-200">
                <th className="py-2 px-3">{tr('Student', 'الطالب')}</th>
                <th className="py-2 px-3">{tr('Lessons solved', 'الدروس المحلولة')}</th>
                <th className="py-2 px-3">{tr('Lessons avg', 'متوسط الدروس')}</th>
                <th className="py-2 px-3">{tr('Tests', 'الاختبارات')}</th>
                <th className="py-2 px-3">{tr('Tests avg', 'متوسط الاختبارات')}</th>
                <th className="py-2 px-3">{tr('Last activity', 'آخر نشاط')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {perStudent.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 px-3 font-bold text-[#0A192F]">{s.name}</td>
                  <td className="py-2 px-3">{s.lessons}</td>
                  <td className="py-2 px-3">{s.lessonAvg !== undefined ? <span className={`px-2 py-0.5 rounded font-bold ${color(s.lessonAvg)}`}>{s.lessonAvg}%</span> : '—'}</td>
                  <td className="py-2 px-3">{s.tests}</td>
                  <td className="py-2 px-3">{s.testAvg !== undefined ? <span className={`px-2 py-0.5 rounded font-bold ${color(s.testAvg)}`}>{s.testAvg}%</span> : '—'}</td>
                  <td className="py-2 px-3 text-gray-500">{new Date(s.last).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
