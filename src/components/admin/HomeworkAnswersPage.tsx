import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Mic, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { studentHubService, HomeworkResult, HomeworkAnswer, HomeworkAudio } from '../../services/studentHubService';

interface Props {
  resultId: string;
  navigate: (route: string) => void;
}

const color = (p: number) => (p >= 70 ? 'bg-emerald-50 text-emerald-700' : p >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700');

// صفحة إجابات طالب في درس أو اختبار: تُفتح من «نتائج الواجبات» في رابط منفصل
export const HomeworkAnswersPage: React.FC<Props> = ({ resultId, navigate }) => {
  const { language } = useLanguage();
  const { isAdmin, isSuperAdmin, isTeacher } = useAuth();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const staff = isAdmin || isSuperAdmin || isTeacher;

  const [result, setResult] = useState<HomeworkResult | null>(null);
  const [answers, setAnswers] = useState<HomeworkAnswer[]>([]);
  const [audio, setAudio] = useState<HomeworkAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [spScore, setSpScore] = useState('');
  const [spMax, setSpMax] = useState('10');
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await studentHubService.getHomeworkResult(resultId);
        if (!r) {
          setError(tr('Result not found.', 'لم يتم العثور على النتيجة.'));
          return;
        }
        setResult(r);
        if (r.speakingScore !== undefined) setSpScore(String(r.speakingScore));
        if (r.speakingMax) setSpMax(String(r.speakingMax));
        const [a, au] = await Promise.all([
          r.hasAnswers ? studentHubService.getHomeworkAnswers(resultId) : Promise.resolve([]),
          r.audioCount ? studentHubService.getHomeworkAudio(resultId, r.audioCount) : Promise.resolve([])
        ]);
        setAnswers(a);
        setAudio(au);
      } catch (err: any) {
        setError(`${tr('Could not load:', 'تعذّر التحميل:')} ${err?.code || err?.message || ''}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [resultId]);

  const groups = useMemo(() => {
    const list = onlyWrong ? answers.filter((a) => a.g < a.m) : answers;
    const m = new Map<string, HomeworkAnswer[]>();
    list.forEach((a) => {
      const k = a.s || '—';
      m.set(k, [...(m.get(k) || []), a]);
    });
    return [...m.entries()];
  }, [answers, onlyWrong]);

  const saveSpeaking = async () => {
    if (!result) return;
    const sc = Number(spScore);
    const mx = Number(spMax);
    if (!Number.isFinite(sc) || !Number.isFinite(mx) || mx <= 0 || mx > 100 || sc < 0 || sc > mx) {
      setNote(tr('Enter a score between 0 and the maximum.', 'اكتبي درجة بين 0 والدرجة العظمى.'));
      return;
    }
    setSaving(true);
    try {
      await studentHubService.gradeHomeworkSpeaking(result.id, sc, mx);
      setResult({ ...result, speakingScore: sc, speakingMax: mx });
      setNote(tr('Speaking grade saved.', 'تم حفظ درجة المحادثة.'));
    } catch (err: any) {
      setNote(`${tr('Could not save:', 'تعذّر الحفظ:')} ${err?.code || err?.message || ''}`);
    } finally {
      setSaving(false);
    }
  };

  const box = 'bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <button onClick={() => navigate('portal')} className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
        <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
        {tr('Back to dashboard', 'العودة إلى اللوحة')}
      </button>

      {loading ? (
        <div className={`${box} text-center text-xs text-gray-500`}>{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : error || !result ? (
        <div className={`${box} text-center text-xs font-bold text-red-700`}>{error}</div>
      ) : (
        <>
          <div className={`${box} space-y-4`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{result.studentName}</h1>
                <p className="text-sm text-gray-600">{result.title}</p>
                <p className="text-[11px] text-gray-400">
                  {new Date(result.createdAt).toLocaleString(isAr ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1.5 rounded-xl font-bold text-sm ${color(result.percent)}`}>
                  {result.score}/{result.total} ({result.percent}%)
                </span>
                {result.speakingScore !== undefined && (
                  <span className="px-3 py-1.5 rounded-xl font-bold text-sm bg-[#F3E5AB]/50 text-[#0A192F] flex items-center gap-1">
                    <Mic className="w-4 h-4" />
                    {result.speakingScore}/{result.speakingMax}
                  </span>
                )}
              </div>
            </div>

            {!!result.sections?.length && (
              <div className="grid sm:grid-cols-2 gap-2">
                {result.sections.map((s) => {
                  const p = s.n ? Math.round((s.ok / s.n) * 100) : 0;
                  return (
                    <div key={s.name} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-gray-100 text-xs">
                      <div className="flex justify-between font-bold text-[#0A192F]">
                        <span dir="ltr">{s.name}</span>
                        <span>
                          {s.ok}/{s.n}
                        </span>
                      </div>
                      <div className="h-1.5 rounded bg-gray-200 mt-1.5 overflow-hidden">
                        <div className={`h-full ${p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <b className="text-emerald-800">{tr('Strengths', 'نقاط القوة')}</b>
                <div className="mt-1 text-emerald-900" dir="ltr">
                  {result.strengths?.length ? result.strengths.join(' • ') : '—'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <b className="text-red-800">{tr('Weaknesses', 'نقاط الضعف')}</b>
                <div className="mt-1 text-red-900" dir="ltr">
                  {result.weaknesses?.length ? result.weaknesses.join(' • ') : '—'}
                </div>
              </div>
            </div>
          </div>

          {(audio.length > 0 || !!result.audioCount) && (
            <div className={`${box} space-y-3`}>
              <h2 className="font-bold text-[#0A192F] flex items-center gap-2">
                <Mic className="w-5 h-5 text-[#D4AF37]" />
                {tr('Speaking recordings', 'تسجيلات المحادثة')}
              </h2>
              {audio.map((a) => (
                <div key={a.idx} className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-100 space-y-2">
                  <p className="text-xs text-gray-700" dir="ltr">
                    {a.idx + 1}. {a.task}
                  </p>
                  <audio controls src={a.data} className="w-full h-10" />
                </div>
              ))}
              {staff && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-[#0A192F]">{tr('Speaking grade', 'درجة المحادثة')}</span>
                  <input value={spScore} onChange={(e) => setSpScore(e.target.value)} inputMode="numeric" className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 text-sm text-center" />
                  <span className="text-xs">{tr('out of', 'من')}</span>
                  <input value={spMax} onChange={(e) => setSpMax(e.target.value)} inputMode="numeric" className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 text-sm text-center" />
                  <button
                    onClick={saveSpeaking}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {tr('Save', 'حفظ')}
                  </button>
                  {note && <span className="text-xs text-gray-600">{note}</span>}
                </div>
              )}
            </div>
          )}

          <div className={`${box} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-[#0A192F]">{tr("Student's answers", 'إجابات الطالب')}</h2>
              <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} />
                {tr('Mistakes only', 'الأخطاء فقط')}
              </label>
            </div>
            {!answers.length ? (
              <p className="text-xs text-gray-500">
                {tr('Answers were not saved for this attempt (older results).', 'لم تُحفظ الإجابات في هذه المحاولة (نتيجة قديمة).')}
              </p>
            ) : (
              groups.map(([sec, rows]) => (
                <div key={sec} className="space-y-1.5">
                  <h3 className="text-sm font-bold text-[#0A192F] border-b border-gray-100 pb-1" dir="ltr">
                    {sec}
                  </h3>
                  {rows.map((a, i) => {
                    const ok = a.g >= a.m;
                    return (
                      <div key={i} className={`p-2.5 rounded-xl text-xs border ${ok ? 'bg-emerald-50/50 border-emerald-100' : a.g > 0 ? 'bg-amber-50/50 border-amber-100' : 'bg-red-50/50 border-red-100'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div dir="ltr" className="text-left flex-1">
                            <div className="text-gray-500">{a.q || a.e}</div>
                            <div className="font-bold text-[#0A192F] whitespace-pre-line">{a.a || tr('(no answer)', '(بلا إجابة)')}</div>
                            {!ok && a.c && <div className="text-emerald-700">✓ {a.c}</div>}
                          </div>
                          <span className="flex items-center gap-1 font-bold whitespace-nowrap">
                            {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                            {a.m > 1 ? `${a.g}/${a.m}` : ''}
                          </span>
                        </div>
                        {a.n && a.m > 1 && <div className="mt-1.5 text-gray-700 whitespace-pre-line" dir="rtl">{a.n}</div>}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
