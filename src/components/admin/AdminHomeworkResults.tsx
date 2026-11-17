import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
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
  const { firebaseUser } = useAuth();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [items, setItems] = useState<HomeworkResult[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState<'all' | 'lesson' | 'test'>('all');
  const [view, setView] = useState<'latest' | 'students'>('latest');

  const load = async () => {
    setLoading(true);
    try {
      const uid = firebaseUser?.uid || '';
      const [r, g] = await Promise.all([
        studentHubService.getAllHomeworkResults(teacherMode ? uid : undefined),
        teacherMode ? groupService.getTeacherGroups(uid) : groupService.getGroups()
      ]);
      setItems(r);
      setGroups(g);
    } catch (err: any) {
      onNotice(`${tr('Could not load results:', 'تعذر تحميل النتائج:')} ${err?.code || ''}`);
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
        <button onClick={load} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-1.5 self-start">
          <RefreshCw className="w-4 h-4" />
          {tr('Refresh', 'تحديث')}
        </button>
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
              </div>
              <span className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap ${color(r.percent)}`}>
                {r.score}/{r.total} ({r.percent}%)
              </span>
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
