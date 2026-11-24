import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { chatFaqService, ChatFaq, PRICES_TOKEN } from '../../services/chatFaqService';

interface Props {
  onNotice: (message: string) => void;
}

// أسئلة مقترحة مأخوذة من محتوى الموقع نفسه (الأسئلة الشائعة وطريقة عمل المنصة)
const SUGGESTED: Omit<ChatFaq, 'id' | 'order' | 'active'>[] = [
  {
    questionAr: 'كيف أسجّل في الأكاديمية؟',
    answerAr:
      'التسجيل سهل:\n1️⃣ من الموقع اضغطي «التسجيل» وأنشئي حسابك بالبريد الإلكتروني أو بحساب Google.\n2️⃣ إذا لم تعرفي مستواك اختاري «أحتاج اختبار تحديد مستوى».\n3️⃣ نراجع طلبك ونفعّل اشتراكك، فتظهر لكِ لوحة الطالب.'
  },
  {
    questionAr: 'هل الحصص مباشرة؟',
    answerAr:
      'نعم، كل الحصص الأساسية مباشرة وتفاعلية 100% مع معلمات معتمدات، وليست تسجيلات. تتحدثين وتتفاعلين صوتًا وصورة وتحصلين على تصحيح فوري للنطق والأخطاء.'
  },
  {
    questionAr: 'كيف تكون حصص المجموعات؟',
    answerAr: 'حصص المجموعات من A1 حتى C2:\n⏱️ مدة الحصة 90 دقيقة كاملة.\n📘 منهج أكسفورد (Oxford) المعتمد والتفاعلي.\n👥 مجموعات صغيرة حتى تأخذ كل طالبة وقتًا كافيًا للتحدث والتصحيح.'
  },
  {
    questionAr: 'ما هي المستويات؟',
    answerAr:
      'عندنا 6 مستويات حسب الإطار الأوروبي CEFR: A1، A2، B1، B2، C1، C2.\nكل مستوى مدته 6 أشهر ويُقسَم إلى 3 مراحل، كل مرحلة شهران (مثل A1.1 ثم A1.2 ثم A1.3)، مع تقييم مستمر.'
  },
  {
    questionAr: 'كم الأسعار؟',
    answerAr: `الاشتراك شهري لكل مستوى، ولا يلزمك دفع 6 أشهر مقدمًا:\n${PRICES_TOKEN}`
  },
  {
    questionAr: 'هل أدفع 6 أشهر مقدمًا؟',
    answerAr: 'لا أبدًا، الدفع شهري ومريح، وتدفعين رسوم المرحلة التي تدرسين فيها فقط.'
  },
  {
    questionAr: 'كيف أعرف مستواي؟',
    answerAr: 'اختبار تحديد المستوى مجاني وحسب معايير CEFR. أو اختاري عند التسجيل «أحتاج اختبار تحديد مستوى» وفريقنا يقيّم مستواك.'
  },
  {
    questionAr: 'هل أحصل على شهادة؟',
    answerAr:
      'نعم، تحصلين مجانًا على شهادتين بعد إتمام المستوى:\n1️⃣ شهادة التطوير المهني من منصة بريطانية عالمية، تضيفينها إلى سيرتك الذاتية وLinkedIn.\n2️⃣ شهادة مستوى اللغة حسب CEFR بعد اختبار EF SET.'
  },
  {
    questionAr: 'ما هي مواعيد الحصص؟',
    answerAr: 'مواعيد الحصص مرنة 🗓️ نرتّب الجدول حسب مستواك والأوقات المناسبة لكِ ولمجموعتك. اضغطي «تحدثي مع الأكاديمية» وأخبرينا بالأيام والأوقات التي تناسبك.'
  },
  {
    questionAr: 'سجّلت ولم يُفعَّل حسابي',
    answerAr: 'وصلنا حسابك ✅ وهو قيد المراجعة. نفعّل اشتراكك قريبًا، وبعدها تظهر لكِ لوحة الطالب والواجبات.'
  },
  {
    questionAr: 'أين أجد الواجبات والاختبارات؟',
    answerAr:
      'في لوحة الطالب، تبويب «الواجبات والاختبارات». للحل براحة اضغطي «فتح في صفحة كاملة». نتيجتك تُحفظ تلقائيًا وتراها معلمتك.'
  },
  {
    questionAr: 'لا أستطيع الدخول',
    answerAr:
      'تأكدي أنه البريد نفسه الذي سجّلتِ به. وإذا سجّلتِ بحساب Google فادخلي بزر Google. وإن بقيت المشكلة اضغطي «تحدثي مع الأكاديمية» واكتبي بريدك.'
  }
];

// إدارة المساعد الآلي: الأسئلة التي يراها الزائر وأجوبتها
export const AdminChatFaq: React.FC<Props> = ({ onNotice }) => {
  const [items, setItems] = useState<ChatFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await chatFaqService.getAll());
    } catch (err: any) {
      onNotice(`تعذّر تحميل الأسئلة: ${err?.code || err?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const edit = (id: string, patch: Partial<ChatFaq>) => setItems((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const add = () =>
    setItems((list) => [...list, { id: chatFaqService.newId(), questionAr: '', answerAr: '', order: list.length + 1, active: true }]);

  const save = async (f: ChatFaq) => {
    if (!f.questionAr.trim() || !f.answerAr.trim()) {
      onNotice('اكتبي السؤال والجواب أولًا.');
      return;
    }
    setBusy(true);
    try {
      await chatFaqService.save(f);
      onNotice('تم حفظ السؤال.');
    } catch (err: any) {
      onNotice(`تعذّر الحفظ: ${err?.code || err?.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (f: ChatFaq) => {
    if (!window.confirm('حذف هذا السؤال من المساعد؟')) return;
    setBusy(true);
    try {
      await chatFaqService.remove(f.id);
      setItems((list) => list.filter((x) => x.id !== f.id));
    } catch (err: any) {
      onNotice(`تعذّر الحذف: ${err?.code || err?.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  const move = async (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const list = [...items];
    [list[i], list[j]] = [list[j], list[i]];
    const ordered = list.map((x, k) => ({ ...x, order: k + 1 }));
    setItems(ordered);
    const saved = ordered.filter((x) => x.questionAr.trim() && x.answerAr.trim());
    try {
      await chatFaqService.saveMany(saved);
    } catch (err: any) {
      onNotice(`تعذّر حفظ الترتيب: ${err?.code || ''}`);
    }
  };

  const addSuggested = async () => {
    const have = new Set(items.map((x) => x.questionAr.trim()));
    const fresh = SUGGESTED.filter((s) => !have.has(s.questionAr)).map((s, k) => ({
      ...s,
      id: chatFaqService.newId() + k,
      order: items.length + k + 1,
      active: true
    }));
    if (!fresh.length) {
      onNotice('الأسئلة المقترحة موجودة كلها.');
      return;
    }
    setBusy(true);
    try {
      await chatFaqService.saveMany(fresh);
      onNotice(`تمت إضافة ${fresh.length} سؤالًا.`);
      await load();
    } catch (err: any) {
      onNotice(`تعذّرت الإضافة: ${err?.code || err?.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  const inp = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-luxury font-bold text-xl text-[#0E3A99]">المساعد الآلي</h2>
          <p className="text-xs text-gray-500">
            زر المساعد يظهر في الموقع: تضغط الزائرة على سؤال فيظهر جوابه فورًا، ومجاني بالكامل. اكتبي <b dir="ltr">{PRICES_TOKEN}</b> في أي جواب
            لتظهر مكانها أسعار المستويات المحفوظة في «الأسعار والمراحل».
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={addSuggested} disabled={busy} className="px-3 py-2 rounded-xl border border-[#D4AF37] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            إضافة الأسئلة المقترحة
          </button>
          <button onClick={add} className="px-3 py-2 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            سؤال جديد
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">جارٍ التحميل...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">
          لا توجد أسئلة بعد، فلن يظهر زر المساعد في الموقع. اضغطي «إضافة الأسئلة المقترحة» أو «سؤال جديد».
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((f, i) => (
            <div key={f.id} className={`p-4 rounded-2xl border space-y-2 ${f.active ? 'border-gray-200 bg-[#FAF8F5]' : 'border-dashed border-gray-300 bg-gray-50 opacity-70'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                <input value={f.questionAr} onChange={(e) => edit(f.id, { questionAr: e.target.value })} placeholder="السؤال (يظهر كزر)" className={inp} />
              </div>
              <textarea value={f.answerAr} onChange={(e) => edit(f.id, { answerAr: e.target.value })} placeholder="الجواب" rows={3} className={inp} />
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500">النسخة الإنجليزية (اختيارية)</summary>
                <div className="space-y-2 mt-2" dir="ltr">
                  <input value={f.questionEn || ''} onChange={(e) => edit(f.id, { questionEn: e.target.value })} placeholder="Question" className={inp} />
                  <textarea value={f.answerEn || ''} onChange={(e) => edit(f.id, { answerEn: e.target.value })} placeholder="Answer" rows={2} className={inp} />
                </div>
              </details>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={f.active} onChange={(e) => edit(f.id, { active: e.target.checked })} />
                  ظاهر للزائرات
                </label>
                <div className="flex-1" />
                <button onClick={() => move(i, -1)} className="p-1.5 rounded-lg border border-gray-200" title="لأعلى">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => move(i, 1)} className="p-1.5 rounded-lg border border-gray-200" title="لأسفل">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button onClick={() => remove(f)} disabled={busy} className="p-1.5 rounded-lg border border-red-200 text-red-600" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => save(f)} disabled={busy} className="px-3 py-1.5 rounded-lg bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold flex items-center gap-1 disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  حفظ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
