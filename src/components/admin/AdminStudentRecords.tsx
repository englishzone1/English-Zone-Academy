import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { studentHubService, AttendanceRecord, HomeworkResult } from '../../services/studentHubService';

interface Props {
  studentId: string;
  isAr: boolean;
  onNotice: (message: string) => void;
  teacherScope?: string; // معرّف المعلم في وضع المعلم
  // مواعيد الدرس (أيام الأسبوع 0 = الأحد، والساعة): منها تُعرض الحصص لتسجيل الحضور
  lessonDays?: number[];
  lessonTime?: string;
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';
const btn = 'px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50';
const today = () => new Date().toISOString().slice(0, 10);

// تسجيل الواجبات والحضور لطالب واحد؛ منها يُحسب التقرير الشهري في لوحة الطالب
export const AdminStudentRecords: React.FC<Props> = ({ studentId, isAr, onNotice, teacherScope, lessonDays = [], lessonTime = '' }) => {
  const [online, setOnline] = useState<HomeworkResult[]>([]);
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [homework, setHomework] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
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

  // حصص الأسابيع الستة الماضية حتى اليوم حسب أيام الدرس
  const sessions: string[] = [];
  if (lessonDays.length) {
    const now = new Date();
    for (let i = 0; i < 42; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      if (lessonDays.includes(d.getDay())) {
        sessions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }
    }
  }
  const dayName = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(isAr ? 'ar' : 'en', { weekday: 'long' });
  };

  const mark = (date: string, present: boolean) => {
    const old = attendance.find((a) => a.date === date);
    run(
      async () => {
        if (old) await studentHubService.deleteAttendance(old.id);
        await studentHubService.addAttendance({ studentId, date, present });
      },
      'تم تسجيل الحضور.',
      'Attendance recorded.'
    );
  };

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

      {/* Attendance by the lesson schedule */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <h4 className="font-bold text-sm text-[#0A192F]">{tr('Attendance (commitment)', 'الحضور والالتزام')}</h4>
        {sessions.length === 0 ? (
          <p className="text-[11px] text-amber-700">
            {tr('Set the lesson days above to list the sessions here.', 'حدّدي أيام الدرس في «مواعيد الدرس» أعلاه واحفظي، فتظهر الحصص هنا لتسجيل الحضور.')}
          </p>
        ) : (
          <div className="space-y-1.5">
            {sessions.map((d) => {
              const rec = attendance.find((a) => a.date === d);
              return (
                <div key={d} className="flex flex-wrap items-center justify-between gap-2 text-[11px] px-3 py-2 rounded-lg bg-[#FAF8F5]">
                  <span className="font-bold text-[#0A192F]">
                    {dayName(d)} {d}
                    {lessonTime ? ` • ${lessonTime}` : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {rec ? (
                      <>
                        <b className={rec.present ? 'text-emerald-700' : 'text-red-600'}>{rec.present ? tr('Present', 'حضرت') : tr('Absent', 'غابت')}</b>
                        <button onClick={() => run(() => studentHubService.deleteAttendance(rec.id), 'تم المسح.', 'Cleared.')} title={tr('Clear', 'مسح')} className="text-gray-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => mark(d, true)} disabled={busy} className={`${btn} py-1 bg-emerald-600 text-white`}>
                          {tr('Present', 'حضرت')}
                        </button>
                        <button onClick={() => mark(d, false)} disabled={busy} className={`${btn} py-1 bg-red-50 text-red-700 border border-red-200`}>
                          {tr('Absent', 'غابت')}
                        </button>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <details className="text-[11px]">
          <summary className="cursor-pointer text-gray-500">{tr('Another date (make-up lesson)', 'تاريخ آخر (حصة تعويضية)')}</summary>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} className={`${inputCls} w-auto`} />
            <button onClick={() => mark(attDate, true)} disabled={busy} className={`${btn} bg-emerald-600 text-white`}>
              {tr('Present', 'حضرت')}
            </button>
            <button onClick={() => mark(attDate, false)} disabled={busy} className={`${btn} bg-red-50 text-red-700 border border-red-200`}>
              {tr('Absent', 'غابت')}
            </button>
          </div>
        </details>
      </div>
    </>
  );
};
