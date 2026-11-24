import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { studentHubService, HomeworkResult } from '../../services/studentHubService';

interface Props {
  uid: string;
  isAr: boolean;
  lessonsAttended?: number;
  lessonsTotal?: number;
}

// دروس كل مرحلة في موقع الواجبات (معرّفات البطاقات)
const STAGES: { ar: string; en: string; ids: string[] }[] = [
  { ar: 'المرحلة الأولى (1–4)', en: 'Stage 1 (1–4)', ids: ['c1A', 'c1B', 'c3', 'c2A', 'c2B', 'cREV', 'c3A', 'c3B', 'cPE2', 'c4A', 'c4B', 'cREV34'] },
  { ar: 'المرحلة الثانية (5–8)', en: 'Stage 2 (5–8)', ids: ['c5A', 'c5B', 'cPE3', 'c6A', 'c6B', 'cREV56', 'c7A', 'c7B', 'cPE4', 'c8A', 'c8B', 'cREV78'] },
  { ar: 'المرحلة الثالثة (9–12)', en: 'Stage 3 (9–12)', ids: ['c9A', 'c9B', 'cPE5', 'c10A', 'c10B', 'cREV910', 'c11A', 'c11B', 'cPE6', 'c12A', 'c12B', 'cREV1112'] }
];

const WEEKS = 8;
const DAY = 86400000;

// رسم خفيف بلا مكتبات: تطوّر الدرجات أسبوعيًا، والحصص المنجزة، وإنجاز كل مرحلة
export const StudentProgressChart: React.FC<Props> = ({ uid, isAr, lessonsAttended, lessonsTotal }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [results, setResults] = useState<HomeworkResult[]>([]);

  useEffect(() => {
    studentHubService
      .getMyHomeworkResults(uid)
      .then((r) => setResults(r.filter((x) => !x.partial)))
      .catch(() => undefined);
  }, [uid]);

  // متوسط النسبة لكل أسبوع من آخر 8 أسابيع
  const weekly = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime(); // بداية هذا الأسبوع (الأحد)
    return Array.from({ length: WEEKS }, (_, i) => {
      const from = start - (WEEKS - 1 - i) * 7 * DAY;
      const to = from + 7 * DAY;
      const list = results.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= from && t < to;
      });
      const avg = list.length ? Math.round(list.reduce((a, r) => a + (Number(r.percent) || 0), 0) / list.length) : null;
      return { from, avg, n: list.length };
    });
  }, [results]);

  const stages = useMemo(() => {
    const done = new Set(results.filter((r) => r.kind === 'lesson').map((r) => r.itemId));
    return STAGES.map((s) => ({ ...s, done: s.ids.filter((id) => done.has(id)).length }));
  }, [results]);

  // إحداثيات الرسم
  const W = 300;
  const H = 130;
  const pad = { l: 26, r: 8, t: 10, b: 22 };
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (WEEKS - 1);
  const y = (v: number) => pad.t + ((100 - v) * (H - pad.t - pad.b)) / 100;
  const pts = weekly.map((w, i) => (w.avg === null ? null : { x: x(i), y: y(w.avg), v: w.avg }));
  const segs: string[] = [];
  let cur = '';
  pts.forEach((p) => {
    if (p) cur += `${cur ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)} `;
    else if (cur) {
      segs.push(cur);
      cur = '';
    }
  });
  if (cur) segs.push(cur);
  const hasData = pts.some(Boolean);
  const fmtDay = (t: number) => new Date(t).toLocaleDateString(isAr ? 'ar' : 'en', { day: 'numeric', month: 'numeric' });

  const lessonPct = lessonsTotal ? Math.min(100, Math.round(((lessonsAttended || 0) / lessonsTotal) * 100)) : null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5">
      <h3 className="font-bold text-[#0E3A99] flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
        {tr('My progress', 'تقدّمي')}
      </h3>

      {/* الدرجات أسبوعيًا */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-1">{tr('Homework & test scores (last 8 weeks)', 'درجات الواجبات والاختبارات (آخر 8 أسابيع)')}</p>
        {hasData ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" dir="ltr" role="img" aria-label={tr('Weekly scores chart', 'رسم الدرجات الأسبوعية')}>
            {[0, 50, 100].map((v) => (
              <g key={v}>
                <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#E5E7EB" strokeDasharray={v === 0 ? '' : '3 3'} />
                <text x={pad.l - 4} y={y(v) + 3} fontSize="8" textAnchor="end" fill="#9CA3AF">{v}%</text>
              </g>
            ))}
            {segs.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            ))}
            {pts.map((p, i) =>
              p ? (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#0E3A99" stroke="#D4AF37" strokeWidth="1.5" />
                  <text x={p.x} y={p.y - 6} fontSize="7.5" textAnchor="middle" fill="#0E3A99" fontWeight="bold">{p.v}%</text>
                </g>
              ) : null
            )}
            {weekly.map((w, i) => (i % 2 === 1 || i === WEEKS - 1 ? <text key={i} x={x(i)} y={H - 6} fontSize="7.5" textAnchor="middle" fill="#6B7280">{fmtDay(w.from)}</text> : null))}
          </svg>
        ) : (
          <p className="text-[11px] text-gray-400 py-4 text-center">{tr('Your chart appears after your first homework.', 'يظهر الرسم بعد أول واجب {تحله|تحلينه}.')}</p>
        )}
      </div>

      {/* الحصص المنجزة */}
      {lessonPct !== null && (
        <div>
          <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
            <span>{tr('Lessons attended', 'الحصص المنجزة')}</span>
            <span className="text-[#0E3A99]">{lessonsAttended || 0} / {lessonsTotal}</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0E3A99] to-[#1E3A6B]" style={{ width: `${lessonPct}%` }} />
          </div>
        </div>
      )}

      {/* إنجاز المراحل */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-gray-600">{tr('Homework completed by stage', 'إنجاز الواجبات حسب المرحلة')}</p>
        {stages.map((s) => {
          const pct = Math.round((s.done / s.ids.length) * 100);
          return (
            <div key={s.en}>
              <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                <span>{isAr ? s.ar : s.en}</span>
                <span className="text-[#0E3A99]">{s.done} / {s.ids.length}</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
