import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { studentHubService, AttendanceRecord, HomeworkResult } from '../../services/studentHubService';

interface Props {
  studentId: string;
  isAr: boolean;
  onNotice: (message: string) => void;
  teacherScope?: string; // معرّف المعلم في وضع المعلم
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';
const btn = 'px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50';
const today = () => new Date().toISOString().slice(0, 10);

// تسجيل الواجبات والحضور لطالب واحد؛ منها يُحسب التقرير الشهري في لوحة الطالب
export const AdminStudentRecords: React.FC<Props> = ({ studentId, isAr, onNotice, teacherScope }) => {
  const [online, setOnline] = useState<HomeworkResult[]>([]);
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [homework, setHomework] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [hwTitle, setHwTitle] = useState('');
  const [hwDate, setHwDate] = useState(today());
  const [attDate, setAttDate] = useState(today());
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [hw, att] = await Promise.all([
        studentHubService.getHomeworkFor(studentId),
        studentHubService.getAttendanceFor(studentId)
      ]);
      setHomework(hw.sort((a, b) => String(b.dueDate || '').localeCompare(String(a.dueDate || ''))));
      setAttendance(att.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err) {
      console.error(err);
    }
    studentHubService
      .getHomeworkResultsFor(studentId, teacherScope)
      .then(setOnline)
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    load();
  }, [studentId]);

  const run = async (fn: () => Promise<void>, okAr: string, okEn: string) => {
    setBusy(true);
    try {
      await fn();
      onNotice(tr(okEn, okAr));
      await load();
    } catch (err: any) {
      console.error(err);
      onNotice(`${tr('Failed:', 'تعذر الحفظ:')} ${err?.code || err?.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  const addHw = (done: boolean) => {
    if (!hwTitle.trim()) {
      onNotice(tr('Write the homework name.', 'اكتب اسم الواجب.'));
      return;
    }
    run(
      async () => {
        await studentHubService.addHomeworkRecord({ studentId, title: hwTitle.trim(), date: hwDate, done });
        setHwTitle('');
      },
      'تم تسجيل الواجب.',
      'Homework recorded.'
    );
  };

  const addAtt = (present: boolean) =>
    run(() => studentHubService.addAttendance({ studentId, date: attDate, present }), 'تم تسجيل الحضور.', 'Attendance recorded.');

  return (
    <>
      {/* Interactive homework results */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <h4 className="font-bold text-sm text-[#0A192F]">{tr('Interactive homework & tests', 'نتائج الواجبات والاختبارات التفاعلية')}</h4>
        {online.length === 0 ? (
          <p className="text-[11px] text-gray-400">{tr('No results yet.', 'لا توجد نتائج بعد.')}</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {online.slice(0, 30).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-[11px] px-3 py-1.5 rounded-lg bg-[#FAF8F5]">
                <span>
                  {r.createdAt.slice(0, 10)} • {r.title}
                </span>
                <b className={r.percent >= 70 ? 'text-emerald-700' : r.percent >= 50 ? 'text-amber-700' : 'text-red-600'}>
                  {r.score}/{r.total} ({r.percent}%)
                </b>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Homework */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <h4 className="font-bold text-sm text-[#0A192F]">{tr('Homework', 'الواجبات')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={hwTitle}
            onChange={(e) => setHwTitle(e.target.value)}
            placeholder={tr('Homework name', 'اسم الواجب (مثل واجب الوحدة 2)')}
            className={`${inputCls} sm:col-span-2`}
          />
          <input type="date" value={hwDate} onChange={(e) => setHwDate(e.target.value)} className={inputCls} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => addHw(true)} disabled={busy} className={`${btn} bg-emerald-600 text-white`}>
            {tr('Done', 'حلّه')}
          </button>
          <button onClick={() => addHw(false)} disabled={busy} className={`${btn} bg-red-50 text-red-700 border border-red-200`}>
            {tr('Not done', 'لم يحلّه')}
          </button>
        </div>
        {homework.length > 0 && (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {homework.slice(0, 20).map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-2 text-[11px] px-3 py-1.5 rounded-lg bg-[#FAF8F5]">
                <span>
                  {h.dueDate} • {h.titleAr || h.titleEn} •{' '}
                  <b className={h.status === 'missed' ? 'text-red-600' : 'text-emerald-700'}>
                    {h.status === 'missed' ? tr('not done', 'لم يحلّه') : tr('done', 'حلّه')}
                  </b>
                </span>
                <button
                  onClick={() => run(() => studentHubService.deleteHomework(h.id), 'تم الحذف.', 'Deleted.')}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <h4 className="font-bold text-sm text-[#0A192F]">{tr('Attendance (commitment)', 'الحضور والالتزام')}</h4>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} className={`${inputCls} w-auto`} />
          <button onClick={() => addAtt(true)} disabled={busy} className={`${btn} bg-emerald-600 text-white`}>
            {tr('Present', 'حضر')}
          </button>
          <button onClick={() => addAtt(false)} disabled={busy} className={`${btn} bg-red-50 text-red-700 border border-red-200`}>
            {tr('Absent', 'غاب')}
          </button>
        </div>
        {attendance.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {attendance.slice(0, 30).map((a) => (
              <span
                key={a.id}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                  a.present ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {a.date}
                <button onClick={() => run(() => studentHubService.deleteAttendance(a.id), 'تم الحذف.', 'Deleted.')} title={tr('Delete', 'حذف')}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
