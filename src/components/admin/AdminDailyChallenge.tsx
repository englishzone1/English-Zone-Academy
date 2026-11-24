import React, { useEffect, useState } from 'react';
import { Trash2, Pencil, Plus, Loader2, Sparkles } from 'lucide-react';
import { generateChallenges, loadGeminiKey, saveGeminiKey } from '../../services/challengeAI';
import { Challenge, addDays, dayKey, deleteChallenge, listChallenges, saveChallenge } from '../../services/dailyChallenge';

// الإدارة: أسئلة «تحدّي اليوم» لكل تاريخ
export const AdminDailyChallenge: React.FC<{ isAr: boolean; onNotice: (m: string) => void }> = ({ isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const today = dayKey();
  const [list, setList] = useState<Challenge[]>([]);
  const [edit, setEdit] = useState<Challenge | null>(null);
  const [busy, setBusy] = useState(false);

  // ===== التوليد بالذكاء الاصطناعي =====
  const [key, setKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [gen, setGen] = useState({ level: 'A1', count: 7, topic: '' });
  const [genBusy, setGenBusy] = useState(false);
  const [drafts, setDrafts] = useState<Omit<Challenge, 'date'>[]>([]);
  useEffect(() => {
    loadGeminiKey().then(setKey);
  }, []);

  const freeDates = (n: number) => {
    const used = new Set(list.map((c) => c.date));
    const out: string[] = [];
    let d = today;
    while (out.length < n) {
      if (!used.has(d)) out.push(d);
      d = addDays(d, 1);
    }
    return out;
  };

  const runGen = async () => {
    if (!key) return setShowKey(true);
    setGenBusy(true);
    try {
      const qs = await generateChallenges(key, { ...gen, avoid: list.map((c) => c.question) });
      if (!qs.length) onNotice(tr('Nothing was generated, try again.', 'لم يُولَّد شيء، حاولي مرة أخرى.'));
      setDrafts(qs);
    } catch (e: any) {
      const m = String(e?.message || '');
      onNotice(
        m === 'bad_key'
          ? tr('The Gemini key is not valid.', 'مفتاح Gemini غير صحيح.')
          : m === 'quota'
            ? tr('Free limit reached for now, try again later.', 'وصلتِ للحد المجاني مؤقتًا، حاولي بعد قليل.')
            : tr('Could not generate, try again.', 'تعذّر التوليد، حاولي مرة أخرى.')
      );
    }
    setGenBusy(false);
  };

  const saveDrafts = async () => {
    const dates = freeDates(drafts.length);
    setGenBusy(true);
    try {
      for (let i = 0; i < drafts.length; i++) {
        const d = drafts[i];
        const options = d.options.map((o) => o.trim()).filter(Boolean);
        if (!d.question.trim() || options.length < 2) continue;
        await saveChallenge({ date: dates[i], question: d.question.trim(), options, answer: Math.min(d.answer, options.length - 1), explanation: d.explanation.trim() });
      }
      setDrafts([]);
      await load();
      onNotice(tr('Saved on the next free days.', 'تم الحفظ على الأيام الفارغة القادمة.'));
    } catch {
      onNotice(tr('Could not save (publish the latest rules).', 'تعذر الحفظ (انشري آخر ملف قواعد).'));
    }
    setGenBusy(false);
  };
  const setDraft = (i: number, d: Omit<Challenge, 'date'>) => setDrafts((all) => all.map((x, j) => (j === i ? d : x)));

  const load = () => listChallenges(today).then(setList).catch(() => onNotice(tr('Could not load (publish the latest rules).', 'تعذر التحميل (انشري آخر ملف قواعد).')));
  useEffect(() => {
    load();
  }, []);

  const firstFree = () => {
    const used = new Set(list.map((c) => c.date));
    let d = today;
    while (used.has(d)) d = addDays(d, 1);
    return d;
  };

  const blank = (): Challenge => ({ date: firstFree(), question: '', options: ['', '', ''], answer: 0, explanation: '' });

  const save = async () => {
    if (!edit) return;
    const options = edit.options.map((o) => o.trim()).filter(Boolean);
    if (!edit.question.trim() || options.length < 2) return onNotice(tr('Write the question and at least 2 choices.', 'اكتبي السؤال وخيارين على الأقل.'));
    const ans = Math.min(edit.answer, options.length - 1);
    setBusy(true);
    try {
      await saveChallenge({ ...edit, question: edit.question.trim(), options, answer: ans, explanation: edit.explanation.trim() });
      setEdit(null);
      await load();
      onNotice(tr('Saved.', 'تم الحفظ.'));
    } catch {
      onNotice(tr('Could not save (publish the latest rules).', 'تعذر الحفظ (انشري آخر ملف قواعد).'));
    }
    setBusy(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#0E3A99]">🎯 {tr('Daily challenge', 'تحدّي اليوم')}</h3>
          <p className="text-[11px] text-gray-500">
            {tr(
              'One question per day for members. They answer once and build a streak. Days without a question show nothing.',
              'سؤال واحد لكل يوم يظهر للمسجّلين والطلاب. يجيبون مرة واحدة ويجمعون سلسلة أيام متتالية. اليوم بلا سؤال لا يظهر فيه شيء.'
            )}
          </p>
        </div>
        <button onClick={() => setEdit(blank())} className="px-3 py-2 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold flex items-center gap-1 shrink-0">
          <Plus className="w-4 h-4" />
          {tr('Add', 'إضافة سؤال')}
        </button>
      </div>

      {/* التوليد بالذكاء الاصطناعي */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            {tr('Generate with AI', 'توليد بالذكاء الاصطناعي')}
          </h4>
          <button onClick={() => setShowKey((v) => !v)} className="text-[11px] font-bold text-indigo-700 underline">
            {key ? tr('Gemini key ✓', 'مفتاح Gemini ✓') : tr('Add Gemini key', 'إضافة مفتاح Gemini')}
          </button>
        </div>
        {showKey && (
          <div className="space-y-2">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {tr(
                'Free key from Google AI Studio → “Get API key”. It is stored for the administration only and never shown to students.',
                'مفتاح مجاني من Google AI Studio ← «Get API key». يُحفظ للإدارة فقط ولا يظهر للطالبات.'
              )}
            </p>
            <div className="flex gap-2">
              <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} dir="ltr" placeholder="AIza…" className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm" />
              <button
                onClick={async () => {
                  try {
                    await saveGeminiKey(keyInput);
                    setKey(keyInput.trim());
                    setKeyInput('');
                    setShowKey(false);
                    onNotice(tr('Key saved.', 'تم حفظ المفتاح.'));
                  } catch {
                    onNotice(tr('Could not save (publish the latest rules).', 'تعذر الحفظ (انشري آخر ملف قواعد).'));
                  }
                }}
                disabled={!keyInput.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {tr('Save', 'حفظ')}
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select value={gen.level} onChange={(e) => setGen({ ...gen, level: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white">
            {['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <select value={gen.count} onChange={(e) => setGen({ ...gen, count: Number(e.target.value) })} className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white">
            {[7, 14, 30].map((n) => (
              <option key={n} value={n}>
                {n === 7 ? tr('1 week', 'أسبوع') : n === 14 ? tr('2 weeks', 'أسبوعان') : tr('1 month', 'شهر')}
              </option>
            ))}
          </select>
          <input
            value={gen.topic}
            onChange={(e) => setGen({ ...gen, topic: e.target.value.slice(0, 120) })}
            placeholder={tr('Topic (optional)', 'الموضوع (اختياري)')}
            className="col-span-2 px-3 py-2 rounded-xl border border-gray-300 text-sm"
          />
        </div>
        <button onClick={runGen} disabled={genBusy} className="w-full py-2.5 rounded-xl bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {genBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {tr('Generate drafts', 'توليد مسودة الأسئلة')}
        </button>

        {drafts.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-600">
              {tr('Review and edit, then save. They go on the next free days from today.', 'راجعي وعدّلي ما تريدين ثم احفظي. تُوزَّع على الأيام الفارغة القادمة بدءًا من اليوم.')}
            </p>
            {drafts.map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-white border border-gray-200 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 mt-2 shrink-0">{freeDates(drafts.length)[i]}</span>
                  <textarea value={d.question} dir="auto" rows={2} onChange={(e) => setDraft(i, { ...d, question: e.target.value.slice(0, 400) })} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-bold" />
                  <button onClick={() => setDrafts((all) => all.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-red-600" title={tr('Remove', 'حذف')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {d.options.map((o, k) => (
                  <label key={k} className="flex items-center gap-2">
                    <input type="radio" name={`d${i}`} checked={d.answer === k} onChange={() => setDraft(i, { ...d, answer: k })} className="w-4 h-4" />
                    <input
                      value={o}
                      dir="auto"
                      onChange={(e) => setDraft(i, { ...d, options: d.options.map((x, j) => (j === k ? e.target.value.slice(0, 150) : x)) })}
                      className={`flex-1 px-2 py-1 rounded-lg border text-sm ${d.answer === k ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`}
                    />
                  </label>
                ))}
                <textarea value={d.explanation} dir="auto" rows={2} onChange={(e) => setDraft(i, { ...d, explanation: e.target.value.slice(0, 600) })} className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700" />
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={saveDrafts} disabled={genBusy} className="flex-1 py-2.5 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-sm font-bold disabled:opacity-50">
                {tr(`Save all (${drafts.length})`, `حفظ الكل (${drafts.length})`)}
              </button>
              <button onClick={() => setDrafts([])} className="px-4 py-2.5 rounded-xl bg-gray-100 text-sm font-bold">
                {tr('Discard', 'إلغاء')}
              </button>
            </div>
          </div>
        )}
      </div>

      {edit && (
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/50 space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tr('Date', 'التاريخ')}</span>
            <input type="date" value={edit.date} min={today} onChange={(e) => setEdit({ ...edit, date: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tr('Question', 'السؤال')}</span>
            <textarea value={edit.question} dir="auto" rows={2} onChange={(e) => setEdit({ ...edit, question: e.target.value.slice(0, 400) })} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm" placeholder="What does “break the ice” mean?" />
          </label>
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700">{tr('Choices (tick the correct one)', 'الخيارات (اختاري الصحيح)')}</span>
            {edit.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="ans" checked={edit.answer === i} onChange={() => setEdit({ ...edit, answer: i })} className="w-4 h-4" />
                <input
                  value={o}
                  dir="auto"
                  onChange={(e) => setEdit({ ...edit, options: edit.options.map((x, j) => (j === i ? e.target.value.slice(0, 150) : x)) })}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm"
                />
                {edit.options.length > 2 && (
                  <button onClick={() => setEdit({ ...edit, options: edit.options.filter((_, j) => j !== i), answer: edit.answer === i ? 0 : edit.answer > i ? edit.answer - 1 : edit.answer })} className="p-1.5 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {edit.options.length < 4 && (
              <button onClick={() => setEdit({ ...edit, options: [...edit.options, ''] })} className="text-xs font-bold text-[#AA820A]">
                + {tr('Add choice', 'خيار آخر')}
              </button>
            )}
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tr('Explanation (shown after answering)', 'الشرح (يظهر بعد الإجابة)')}</span>
            <textarea value={edit.explanation} dir="auto" rows={2} onChange={(e) => setEdit({ ...edit, explanation: e.target.value.slice(0, 600) })} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm" />
          </label>
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="px-4 py-2 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold flex items-center gap-1 disabled:opacity-50">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {tr('Save', 'حفظ')}
            </button>
            <button onClick={() => setEdit(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-bold">
              {tr('Cancel', 'إلغاء')}
            </button>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-xs text-gray-400">{tr('No upcoming questions yet.', 'لا توجد أسئلة قادمة بعد.')}</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {list.map((c) => (
            <div key={c.date} className="py-2.5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`text-[11px] font-bold ${c.date === today ? 'text-emerald-700' : 'text-gray-500'}`}>
                  {c.date} {c.date === today ? `· ${tr('today', 'اليوم')}` : ''}
                </span>
                <p className="text-sm font-bold text-[#0E3A99] truncate" dir="auto">{c.question}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEdit({ ...c, options: [...c.options] })} className="p-2 rounded-lg bg-gray-50 text-gray-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    await deleteChallenge(c.date).catch(() => {});
                    load();
                  }}
                  className="p-2 rounded-lg bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
