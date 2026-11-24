import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { studentHubService, AttendanceRecord, HomeworkResult } from '../../services/studentHubService';

interface Props {
  studentId: string;
  isAr: boolean;
  onNotice: (message: string) => void;
  teacherScope?: string; // معرّف المعلم في وضع المعلم
  // مواعيد الدرس (أيام الأسبوع 0 = الأحد، والساعة): منها تُعرض الحصص لتسجيل الحضور
  lessonDays?: number[];
  lessonTime?: string;
  // عدّاد الحصص المنجزة: يزيد تلقائيًا عند تسجيل حضور
  lessonsAttended?: number;
  lessonsTotal?: number;
  onAttendedChange?: (value: number) => void;
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';
const btn = 'px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50';
const today = () => new Date().toISOString().slice(0, 10);

// تسجيل الواجبات والحضور لطالب واحد؛ منها يُحسب التقرير الشهري في لوحة الطالب
export const AdminStudentRecords: React.FC<Props> = ({ studentId, isAr, onNotice, teacherScope, lessonDays = [], lessonTime = '', lessonsAttended, lessonsTotal, onAttendedChange }) => {
  const [online, setOnline] = useState<HomeworkResult[]>([]);
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [homework, setHomework] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const now0 = new Date();
  const [ym, setYm] = useState<{ y: number; m: number }>({ y: now0.getFullYear(), m: now0.getMonth() });
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

  const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const firstDow = new Date(ym.y, ym.m, 1).getDay(); // 0 = الأحد
  const monthLabel = new Date(ym.y, ym.m, 1).toLocaleDateString(isAr ? 'ar' : 'en', { month: 'long', year: 'numeric' });
  const prefix = iso(ym.y, ym.m, 1).slice(0, 8);
  const monthRecs = attendance.filter((a) => a.date.startsWith(prefix));
  const presentCount = monthRecs.filter((a) => a.present).length;
  const absentCount = monthRecs.filter((a) => !a.present).length;
  const weekDays = isAr ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIso = today();

  // تحديث عدّاد الحصص المنجزة للطالب تلقائيًا
  const bump = async (delta: number) => {
    if (!delta) return;
    await updateDoc(doc(db, 'users', studentId), { lessonsAttended: increment(delta), updatedAt: new Date().toISOString() });
    onAttendedChange?.(Math.max(0, (Number(lessonsAttended) || 0) + delta));
  };

  // الضغط على اليوم: فارغ ← حضرت ← غابت ← فارغ
  const cycle = (date: string) => {
    const old = attendance.find((a) => a.date === date);
    run(
      async () => {
        if (!old) {
          await studentHubService.addAttendance({ studentId, date, present: true });
          await bump(1);
        } else if (old.present) {
          await studentHubService.addAttendance({ studentId, date, present: false });
          await bump(-1);
        } else {
          await studentHubService.deleteAttendance(old.id);
        }
      },
      !old ? 'سُجّل الحضور وأُضيفت حصة.' : old.present ? 'سُجّل الغياب وأُنقصت الحصة.' : 'تم مسح اليوم.',
      !old ? 'Present recorded, one lesson added.' : old.present ? 'Absent recorded, lesson removed.' : 'Day cleared.'
    );
  };
  const shift = (d: number) => setYm(({ y, m }) => { const n = new Date(y, m + d, 1); return { y: n.getFullYear(), m: n.getMonth() }; });

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

      {/* Monthly attendance: every day of the month */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-sm text-[#0A192F]">{tr('Monthly attendance', 'الحضور والغياب الشهري')}</h4>
          <div className="flex items-center gap-1">
            <button onClick={() => shift(-1)} className="p-1.5 rounded-lg border border-gray-200 bg-white" title={tr('Previous month', 'الشهر السابق')}>
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <span className="text-xs font-bold text-[#0A192F] min-w-[110px] text-center">{monthLabel}</span>
            <button onClick={() => shift(1)} className="p-1.5 rounded-lg border border-gray-200 bg-white" title={tr('Next month', 'الشهر التالي')}>
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{tr('Present', 'حضور')}: {presentCount}</span>
          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{tr('Absent', 'غياب')}: {absentCount}</span>
          {lessonsTotal !== undefined && (
            <span className="px-2.5 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB]">
              {tr('Lessons done', 'الحصص المنجزة')}: {Number(lessonsAttended) || 0} / {lessonsTotal}
            </span>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((w) => (
            <div key={w} className="text-[9px] font-bold text-gray-500 py-1">{w}</div>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const date = iso(ym.y, ym.m, d);
            const rec = attendance.find((a) => a.date === date);
            const lessonDay = lessonDays.includes(new Date(ym.y, ym.m, d).getDay());
            const cls = rec
              ? rec.present
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-red-500 text-white border-red-500'
              : lessonDay
              ? 'bg-[#FFF8E1] text-[#0A192F] border-[#D4AF37]'
              : 'bg-white text-gray-600 border-gray-200';
            return (
              <button
                key={date}
                onClick={() => cycle(date)}
                disabled={busy}
                className={`relative h-11 rounded-lg border text-xs font-bold flex flex-col items-center justify-center disabled:opacity-60 ${cls} ${date === todayIso ? 'ring-2 ring-[#0A192F]/40' : ''}`}
                title={rec ? (rec.present ? tr('Present', 'حضرت') : tr('Absent', 'غابت')) : lessonDay ? tr('Lesson day', 'يوم درس') : ''}
              >
                {d}
                <span className="text-[8px] leading-none font-semibold">
                  {rec ? (rec.present ? tr('present', 'حضرت') : tr('absent', 'غابت')) : lessonDay ? (lessonTime || tr('lesson', 'درس')) : ''}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          {tr(
            'Tap a day: once = present (adds one lesson automatically), twice = absent, three times = clear. Gold days are the lesson days.',
            '{اضغط|اضغطي} على اليوم: مرة = حضرت (تُضاف حصة منجزة تلقائيًا)، مرتين = غابت، ثلاث مرات = مسح. الأيام الذهبية هي أيام الدرس.'
          )}
        </p>
      </div>
    </>
  );
};
