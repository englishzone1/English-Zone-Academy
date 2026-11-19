import React, { useEffect, useState } from 'react';
import { Flame, CheckCircle2, XCircle } from 'lucide-react';
import { Challenge, ChallengeProgress, dayKey, getChallenge, getProgress, submitAnswer } from '../../services/dailyChallenge';

// بطاقة «تحدّي اليوم» في لوحة المسجّل والطالب (تختفي إن لم تضع الإدارة سؤالًا لليوم)
export const DailyChallenge: React.FC<{ uid: string; isAr: boolean }> = ({ uid, isAr }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [c, setC] = useState<Challenge | null>(null);
  const [p, setP] = useState<ChallengeProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const today = dayKey();

  useEffect(() => {
    if (!uid) return;
    getChallenge(today).then(setC).catch(() => setC(null));
    getProgress(uid).then(setP).catch(() => setP(null));
  }, [uid, today]);

  if (!c) return null;
  const answered = p?.lastDate === today;
  const liveStreak = p && (p.lastDate === today || p.lastDate === dayKey(new Date(Date.now() - 864e5))) ? p.streak : 0;

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#FFF7E0] to-white border-2 border-[#D4AF37]/60 shadow-sm space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-[#0A192F] text-lg">🎯 {tr("Today's challenge", 'تحدّي اليوم')}</h3>
        {liveStreak > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold" title={tr('Days in a row', 'أيام متتالية')}>
            <Flame className="w-4 h-4" />
            {liveStreak} {tr(liveStreak === 1 ? 'day' : 'days', 'يوم')}
          </span>
        )}
      </div>
      <p className="text-base font-bold text-[#0A192F] leading-relaxed" dir="auto">{c.question}</p>
      <div className="grid gap-2">
        {c.options.map((o, i) => {
          const chosen = answered && p!.lastChoice === i;
          const right = answered && i === c.answer;
          return (
            <button
              key={i}
              disabled={answered || busy}
              dir="auto"
              onClick={async () => {
                setBusy(true);
                try {
                  setP(await submitAnswer(uid, c, i, p));
                } catch {
                  /* ignore */
                }
                setBusy(false);
              }}
              className={`text-start px-4 py-3 rounded-xl border text-sm font-bold transition-colors flex items-center justify-between gap-2 ${
                right ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : chosen ? 'bg-red-50 border-red-300 text-red-700' : answered ? 'bg-white border-gray-200 text-gray-400' : 'bg-white border-gray-200 hover:border-[#D4AF37] text-[#0A192F]'
              }`}
            >
              <span>{o}</span>
              {right && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {chosen && !right && <XCircle className="w-5 h-5 shrink-0" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="space-y-2">
          <p className={`text-sm font-bold ${p!.lastCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
            {p!.lastCorrect ? tr('Correct! Well done 🌟', 'إجابة صحيحة! {أحسنت|أحسنتِ} 🌟') : tr('Not this time — see why below.', 'ليست هذه المرة، {إليك|إليكِ} السبب:')}
          </p>
          {c.explanation && <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-xl p-3 border border-gray-100" dir="auto">{c.explanation}</p>}
          <p className="text-xs text-gray-500">{tr('Come back tomorrow for a new challenge and keep your streak 🔥', '{عد|عودي} غدًا لتحدٍّ جديد {وحافظ|وحافظي} على سلسلتك 🔥')}</p>
        </div>
      )}
    </div>
  );
};
