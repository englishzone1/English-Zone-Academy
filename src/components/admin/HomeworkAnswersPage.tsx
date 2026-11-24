import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Mic, Save, Trash2, PencilLine, RotateCcw, Check, X } from 'lucide-react';
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
  const admin = isAdmin || isSuperAdmin;

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
  // ===== التصحيح اليدوي =====
  const [baseG, setBaseG] = useState<number[]>([]); // درجات الأسئلة كما هي محفوظة الآن
  const [scoreIn, setScoreIn] = useState('');
  const [gradeNote, setGradeNote] = useState('');
  const dirty = answers.some((a, i) => a.g !== baseG[i]);
  const r2 = (x: number) => Math.round(x * 100) / 100;

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
        setBaseG(a.map((x) => x.g));
        setScoreIn(String(r.score));
        setAudio(au);
      } catch (err: any) {
        setError(`${tr('Could not load:', 'تعذّر التحميل:')} ${err?.code || err?.message || ''}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [resultId]);

  const groups = useMemo(() => {
    const list = answers.map((a, idx) => ({ a, idx })).filter(({ a, idx }) => !onlyWrong || a.g < a.m || (baseG[idx] ?? a.g) < a.m);
    const m = new Map<string, { a: HomeworkAnswer; idx: number }[]>();
    list.forEach((x) => {
      const k = x.a.s || '—';
      m.set(k, [...(m.get(k) || []), x]);
    });
    return [...m.entries()];
  }, [answers, onlyWrong, baseG]);

  // تغيير درجة سؤال واحد (محليًا حتى تضغطي «حفظ التصحيح»)
  const setG = (idx: number, g: number) =>
    setAnswers((all) =>
      all.map((a, i) => (i === idx ? { ...a, g: r2(Math.max(0, Math.min(a.m, g))), og: a.og !== undefined ? a.og : baseG[i] } : a))
    );

  // حفظ تصحيح الأسئلة: الدرجة الكلية تتغيّر بمقدار الفرق
  const saveQuestions = async () => {
    if (!result) return;
    setSaving(true);
    setGradeNote('');
    try {
      const delta = answers.reduce((s2, a, i) => s2 + (a.g - (baseG[i] ?? a.g)), 0);
      await studentHubService.saveHomeworkAnswers(result.id, answers);
      const out = await studentHubService.setHomeworkScore(result, result.score + delta);
      setResult({ ...result, ...out, manual: out.score !== out.origScore });
      setScoreIn(String(out.score));
      setBaseG(answers.map((a) => a.g));
      setGradeNote(tr('Marking saved.', 'تم حفظ التصحيح.'));
    } catch (err: any) {
      setGradeNote(`${tr('Could not save (publish the latest rules):', 'تعذّر الحفظ (انشري آخر ملف قواعد):')} ${err?.code || ''}`);
    } finally {
      setSaving(false);
    }
  };

  // كتابة الدرجة الكلية مباشرة
  const saveTotal = async (value?: number) => {
    if (!result) return;
    const v = value !== undefined ? value : Number(String(scoreIn).replace(',', '.'));
    if (!Number.isFinite(v) || v < 0 || v > result.total) {
      setGradeNote(tr(`Enter a score from 0 to ${result.total}.`, `اكتبي درجة من 0 إلى ${result.total}.`));
      return;
    }
    setSaving(true);
    setGradeNote('');
    try {
      const out = await studentHubService.setHomeworkScore(result, v);
      setResult({ ...result, ...out, manual: out.score !== out.origScore });
      setScoreIn(String(out.score));
      setGradeNote(tr('Score saved.', 'تم حفظ الدرجة.'));
    } catch (err: any) {
      setGradeNote(`${tr('Could not save (publish the latest rules):', 'تعذّر الحفظ (انشري آخر ملف قواعد):')} ${err?.code || ''}`);
    } finally {
      setSaving(false);
    }
  };

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

  const deleteAudio = async () => {
    if (!result) return;
    if (!window.confirm(tr('Delete these recordings permanently? The speaking grade stays.', 'حذف التسجيلات نهائيًا؟ درجة المحادثة تبقى محفوظة.'))) return;
    setSaving(true);
    try {
      await studentHubService.deleteHomeworkAudio(result.id, result.audioCount || 0);
      setAudio([]);
      setResult({ ...result, audioCount: 0, audioDeleted: true });
      setNote(tr('Recordings deleted.', 'تم حذف التسجيلات.'));
    } catch (err: any) {
      setNote(`${tr('Could not delete:', 'تعذّر الحذف:')} ${err?.code || err?.message || ''}`);
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
                <h1 className="font-serif-luxury font-bold text-xl text-[#061638]">{result.studentName}</h1>
                <p className="text-sm text-gray-600">{result.title}</p>
                <p className="text-[11px] text-gray-400">
                  {new Date(result.createdAt).toLocaleString(isAr ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1.5 rounded-xl font-bold text-sm ${color(result.percent)}`}>
                  {result.score}/{result.total} ({result.percent}%)
                </span>
                {result.manual && (
                  <span className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 text-indigo-700 flex items-center gap-1">
                    <PencilLine className="w-3.5 h-3.5" />
                    {tr(`Edited by hand (site gave ${result.origScore})`, `عُدّلت يدويًا (درجة الموقع ${result.origScore})`)}
                  </span>
                )}
                {result.speakingScore !== undefined && (
                  <span className="px-3 py-1.5 rounded-xl font-bold text-sm bg-[#F3E5AB]/50 text-[#061638] flex items-center gap-1">
                    <Mic className="w-4 h-4" />
                    {result.speakingScore}/{result.speakingMax}
                  </span>
                )}
              </div>
            </div>

            {staff && (
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center gap-2">
                <PencilLine className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-bold text-[#061638]">{tr('Final score', 'الدرجة النهائية')}</span>
                <input
                  value={scoreIn}
                  onChange={(e) => setScoreIn(e.target.value)}
                  inputMode="decimal"
                  className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 text-sm text-center bg-white"
                />
                <span className="text-xs">
                  {tr('out of', 'من')} {result.total}
                </span>
                <button
                  onClick={() => saveTotal()}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-[#061638] text-[#F3E5AB] text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {tr('Save score', 'حفظ الدرجة')}
                </button>
                {result.manual && result.origScore !== undefined && (
                  <button
                    onClick={() => saveTotal(result.origScore)}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {tr("Restore the site's score", 'إرجاع درجة الموقع')}
                  </button>
                )}
                {gradeNote && <span className="text-xs text-gray-700">{gradeNote}</span>}
              </div>
            )}

            {!!result.sections?.length && (
              <div className="grid sm:grid-cols-2 gap-2">
                {result.sections.map((s) => {
                  const p = s.n ? Math.round((s.ok / s.n) * 100) : 0;
                  return (
                    <div key={s.name} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-gray-100 text-xs">
                      <div className="flex justify-between font-bold text-[#061638]">
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

          {result.audioDeleted && (
            <div className={`${box} text-xs text-gray-500 flex items-center gap-2`}>
              <Mic className="w-4 h-4 text-[#D4AF37]" />
              {tr('The speaking recordings were deleted after grading to save space.', 'حُذفت تسجيلات المحادثة بعد التقييم لتوفير المساحة.')}
              {result.speakingScore !== undefined && (
                <b className="text-[#061638]">
                  {tr('Grade', 'الدرجة')}: {result.speakingScore}/{result.speakingMax}
                </b>
              )}
            </div>
          )}

          {(audio.length > 0 || !!result.audioCount) && (
            <div className={`${box} space-y-3`}>
              <h2 className="font-bold text-[#061638] flex items-center gap-2">
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
                  <span className="text-xs font-bold text-[#061638]">{tr('Speaking grade', 'درجة المحادثة')}</span>
                  <input value={spScore} onChange={(e) => setSpScore(e.target.value)} inputMode="numeric" className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 text-sm text-center" />
                  <span className="text-xs">{tr('out of', 'من')}</span>
                  <input value={spMax} onChange={(e) => setSpMax(e.target.value)} inputMode="numeric" className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 text-sm text-center" />
                  <button
                    onClick={saveSpeaking}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-[#061638] text-[#F3E5AB] text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {tr('Save', 'حفظ')}
                  </button>
                  {note && <span className="text-xs text-gray-600">{note}</span>}
                </div>
              )}
              {admin && audio.length > 0 && (
                <button
                  onClick={deleteAudio}
                  disabled={saving}
                  className="text-xs font-bold text-red-600 flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {result.speakingScore !== undefined
                    ? tr('Delete recordings (grade saved)', 'حذف التسجيلات (الدرجة محفوظة)')
                    : tr('Delete recordings', 'حذف التسجيلات')}
                </button>
              )}
            </div>
          )}

          <div className={`${box} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-[#061638]">{tr("Student's answers", 'إجابات الطالب')}</h2>
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
              <>
              {staff && (
                <p className="text-[11px] text-gray-500">
                  {tr(
                    'Use ✓ / ✗ or type a mark for any question, then press “Save marking”. The final score changes by the difference.',
                    'استخدمي ✓ أو ✗ أو اكتبي درجة لأي سؤال، ثم اضغطي «حفظ التصحيح». تتغيّر الدرجة النهائية بمقدار الفرق.'
                  )}
                </p>
              )}
              {groups.map(([sec, rows]) => (
                <div key={sec} className="space-y-1.5">
                  <h3 className="text-sm font-bold text-[#061638] border-b border-gray-100 pb-1" dir="ltr">
                    {sec}
                  </h3>
                  {rows.map(({ a, idx }) => {
                    const ok = a.g >= a.m;
                    const changed = a.g !== baseG[idx] || (a.og !== undefined && a.og !== a.g);
                    return (
                      <div key={idx} className={`p-2.5 rounded-xl text-xs border ${ok ? 'bg-emerald-50/50 border-emerald-100' : a.g > 0 ? 'bg-amber-50/50 border-amber-100' : 'bg-red-50/50 border-red-100'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div dir="ltr" className="text-left flex-1">
                            <div className="text-gray-500">{a.q || a.e}</div>
                            <div className="font-bold text-[#061638] whitespace-pre-line">{a.a || tr('(no answer)', '(بلا إجابة)')}</div>
                            {!ok && a.c && <div className="text-emerald-700">✓ {a.c}</div>}
                          </div>
                          {staff ? (
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <button
                                onClick={() => setG(idx, a.m)}
                                title={tr('Correct', 'صحيح')}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${ok ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200'}`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setG(idx, 0)}
                                title={tr('Wrong', 'خطأ')}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center border ${a.g === 0 ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-600 border-red-200'}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <input
                                value={a.g}
                                onChange={(e) => {
                                  const v = Number(e.target.value.replace(',', '.'));
                                  if (Number.isFinite(v)) setG(idx, v);
                                }}
                                type="number"
                                step="0.25"
                                min={0}
                                max={a.m}
                                className="w-14 px-1 py-1 rounded-lg border border-gray-300 text-xs text-center bg-white"
                              />
                              <span className="text-[11px] text-gray-500">/{a.m}</span>
                              {changed && a.og !== undefined && (
                                <span className="text-[10px] text-indigo-700 font-bold" title={tr("Site's mark", 'درجة الموقع')}>
                                  ({tr('site', 'الموقع')} {a.og})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-bold whitespace-nowrap">
                              {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                              {a.m > 1 ? `${a.g}/${a.m}` : ''}
                            </span>
                          )}
                        </div>
                        {a.n && a.m > 1 && <div className="mt-1.5 text-gray-700 whitespace-pre-line" dir="rtl">{a.n}</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
              {staff && (
                <div className="sticky bottom-3 flex items-center justify-end gap-2">
                  {gradeNote && <span className="text-xs text-gray-700 bg-white/90 px-2 py-1 rounded-lg">{gradeNote}</span>}
                  <button
                    onClick={saveQuestions}
                    disabled={saving || !dirty}
                    className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#061638] text-sm font-bold shadow-lg flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Save className="w-4 h-4" />
                    {tr('Save marking', 'حفظ التصحيح')}
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
