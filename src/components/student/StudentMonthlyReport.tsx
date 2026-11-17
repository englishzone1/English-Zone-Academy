import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardCheck, CalendarCheck, GraduationCap, Sparkles } from 'lucide-react';
import { studentHubService, AttendanceRecord, HomeworkResult } from '../../services/studentHubService';
import { PASS_MARK } from '../../services/groupService';

interface Props {
  uid: string;
  isAr: boolean;
  homework: any[];
  grades: any[];
  pointsLog: any[];
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const inMonth = (value: string | undefined, key: string) => !!value && String(value).slice(0, 7) === key;

// التقرير الشهري: كل الأرقام من سجلات الطالب الحقيقية، ولا يظهر رقم لا توجد له بيانات
export const StudentMonthlyReport: React.FC<Props> = ({ uid, isAr, homework, grades, pointsLog }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [offset, setOffset] = useState(0); // 0 = هذا الشهر، -1 = الشهر الماضي...
  const [online, setOnline] = useState<HomeworkResult[]>([]);

  useEffect(() => {
    studentHubService
      .getAttendanceFor(uid)
      .then(setAttendance)
      .catch((err) => console.error('Error loading attendance:', err));
    studentHubService
      .getMyHomeworkResults(uid)
      .then(setOnline)
      .catch((err) => console.error('Error loading homework results:', err));
  }, [uid]);

  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const key = monthKey(monthDate);
  const monthLabel = monthDate.toLocaleDateString(isAr ? 'ar' : 'en', { month: 'long', year: 'numeric' });

  // نتائج موقع الواجبات التفاعلي في هذا الشهر (أفضل محاولة لكل درس أو اختبار)
  const best = new Map<string, HomeworkResult>();
  online
    .filter((r) => inMonth(r.createdAt, key))
    .forEach((r) => {
      const k = `${r.kind}:${r.itemId}`;
      const prev = best.get(k);
      if (!prev || r.percent > prev.percent) best.set(k, r);
    });
  const onLessons = [...best.values()].filter((r) => r.kind === 'lesson');
  const onTests = [...best.values()].filter((r) => r.kind !== 'lesson');

  // الواجبات = ما سجّله المعلم + الدروس المحلولة في الموقع
  const hwManual = homework.filter((h) => inMonth(h.dueDate || h.createdAt, key));
  const hwManualDone = hwManual.filter((h) => h.status === 'submitted' || h.status === 'graded').length;
  const hw = { length: hwManual.length + onLessons.length };
  const hwDone = hwManualDone + onLessons.length;

  const att = attendance.filter((a) => inMonth(a.date, key));
  const attPresent = att.filter((a) => a.present).length;

  // الاختبارات = درجات المعلم + اختبارات الموقع (بالنسبة المئوية)
  const scores = [
    ...grades.filter((g) => inMonth(g.date, key)).map((g) => Number(g.score) || 0),
    ...onTests.map((r) => r.percent || 0)
  ];
  const gr = { length: scores.length };
  const grAvg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : undefined;
  const grPassed = scores.filter((x) => x >= PASS_MARK).length;

  const pts = pointsLog.filter((p) => inMonth(p.timestamp, key));
  const ptsTotal = pts.reduce((a, p) => a + (Number(p.amount) || 0), 0);

  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : undefined);
  const noData = hw.length === 0 && att.length === 0 && gr.length === 0 && pts.length === 0;

  const Card = ({
    icon: Icon,
    title,
    main,
    sub
  }: {
    icon: any;
    title: string;
    main: string;
    sub?: string;
  }) => (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
        <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>{title}</span>
      </div>
      <div className="font-bold text-lg text-[#F3E5AB]">{main}</div>
      {sub && <div className="text-[11px] text-gray-400">{sub}</div>}
    </div>
  );

  const dash = '—';

  return (
    <div className="bg-gradient-to-br from-[#0A192F] via-[#102445] to-[#0A192F] text-white rounded-3xl p-6 border border-[#D4AF37]/50 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="p-1.5 rounded-lg hover:bg-white/10"
          title={isAr ? 'الشهر السابق' : 'Previous month'}
        >
          {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <div className="text-center">
          <h3 className="font-serif-luxury font-bold text-lg text-[#F3E5AB]">
            {isAr ? 'التقرير الشهري' : 'Monthly Report'}
          </h3>
          <span className="text-xs text-gray-300">{monthLabel}</span>
        </div>
        <button
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset === 0}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30"
          title={isAr ? 'الشهر التالي' : 'Next month'}
        >
          {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {noData ? (
        <p className="text-xs text-gray-300 text-center py-4">
          {isAr ? 'لا توجد بيانات مسجلة لهذا الشهر بعد.' : 'Nothing has been recorded for this month yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Card
            icon={ClipboardCheck}
            title={isAr ? 'حل الواجبات' : 'Homework'}
            main={hw.length ? `${pct(hwDone, hw.length)}%` : dash}
            sub={
              hw.length
                ? (isAr ? `${hwDone} من ${hw.length}` : `${hwDone} of ${hw.length}`) +
                  (onLessons.length ? (isAr ? ` • ${onLessons.length} من الموقع` : ` • ${onLessons.length} online`) : '')
                : undefined
            }
          />
          <Card
            icon={CalendarCheck}
            title={isAr ? 'الالتزام بالحضور' : 'Attendance'}
            main={att.length ? `${pct(attPresent, att.length)}%` : dash}
            sub={att.length ? (isAr ? `${attPresent} من ${att.length} حصة` : `${attPresent} of ${att.length} lessons`) : undefined}
          />
          <Card
            icon={GraduationCap}
            title={isAr ? 'درجات الاختبارات' : 'Test scores'}
            main={grAvg !== undefined ? `${grAvg}%` : dash}
            sub={
              gr.length
                ? (isAr ? `نجح في ${grPassed} من ${gr.length}` : `Passed ${grPassed} of ${gr.length}`) +
                  (onTests.length ? (isAr ? ` • ${onTests.length} من الموقع` : ` • ${onTests.length} online`) : '')
                : undefined
            }
          />
          <Card
            icon={Sparkles}
            title={isAr ? 'نقاط الشهر' : 'Stars earned'}
            main={pts.length ? String(ptsTotal) : dash}
            sub={pts.length ? (isAr ? `${pts.length} تقييم` : `${pts.length} ratings`) : undefined}
          />
        </div>
      )}
    </div>
  );
};
