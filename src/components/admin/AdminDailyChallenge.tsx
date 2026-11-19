import React, { useEffect, useState } from 'react';
import { Trash2, Pencil, Plus, Loader2 } from 'lucide-react';
import { Challenge, addDays, dayKey, deleteChallenge, listChallenges, saveChallenge } from '../../services/dailyChallenge';

// الإدارة: أسئلة «تحدّي اليوم» لكل تاريخ
export const AdminDailyChallenge: React.FC<{ isAr: boolean; onNotice: (m: string) => void }> = ({ isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const today = dayKey();
  const [list, setList] = useState<Challenge[]>([]);
  const [edit, setEdit] = useState<Challenge | null>(null);
  const [busy, setBusy] = useState(false);

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
          <h3 className="font-bold text-[#0A192F]">🎯 {tr('Daily challenge', 'تحدّي اليوم')}</h3>
          <p className="text-[11px] text-gray-500">
            {tr(
              'One question per day for members. They answer once and build a streak. Days without a question show nothing.',
              'سؤال واحد لكل يوم يظهر للمسجّلين والطلاب. يجيبون مرة واحدة ويجمعون سلسلة أيام متتالية. اليوم بلا سؤال لا يظهر فيه شيء.'
            )}
          </p>
        </div>
        <button onClick={() => setEdit(blank())} className="px-3 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1 shrink-0">
          <Plus className="w-4 h-4" />
          {tr('Add', 'إضافة سؤال')}
        </button>
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
            <button onClick={save} disabled={busy} className="px-4 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1 disabled:opacity-50">
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
                <p className="text-sm font-bold text-[#0A192F] truncate" dir="auto">{c.question}</p>
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
