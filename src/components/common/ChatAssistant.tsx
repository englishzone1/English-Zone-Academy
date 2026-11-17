import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, MessageCircle, RotateCcw, Send, Mail } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { studentHubService } from '../../services/studentHubService';
import { useLanguage } from '../../context/LanguageContext';
import { useAcademySettings, whatsappWithText } from '../../hooks/useAcademySettings';
import { usePricing, LevelPriceCard } from '../../hooks/usePricing';
import { chatFaqService, ChatFaq, PRICES_TOKEN } from '../../services/chatFaqService';

interface Msg {
  from: 'bot' | 'me';
  text: string;
  // أزرار تظهر تحت رسالة المساعد عندما لا يجد جوابًا
  offer?: boolean;
}

const pricesText = (cards: LevelPriceCard[], isAr: boolean): string => {
  if (!cards.length)
    return isAr
      ? 'الأسعار غير منشورة حاليًا. اضغطي «واتساب» أو «رسالة للأكاديمية» في الأسفل ونرسلها لكِ.'
      : 'Prices are not published right now. Tap WhatsApp or “Message the academy” below and we will send them.';
  return cards
    .map((c) => {
      const from = c.groupVaries ? (isAr ? 'من ' : 'from ') : '';
      const name = isAr ? c.nameAr : c.nameEn;
      return `• ${c.level}${name ? ` (${name})` : ''}: ${from}$${c.groupPrice} ${isAr ? 'شهريًا للمجموعات' : 'per month (groups)'}`;
    })
    .join('\n');
};

// تطبيع بسيط للعربية للمطابقة بين رسالة الزائرة والأسئلة
const normAr = (t: string) =>
  t
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ');
const STOP = new Set(['اريد', 'ما', 'هي', 'هو', 'كيف', 'كم', 'هل', 'في', 'من', 'عن', 'على', 'الى', 'لي', 'ان', 'او']);
const words = (t: string) =>
  normAr(t)
    .split(/\s+/)
    .map((w) => w.replace(/^(وال|بال|لل|ال|و)/, ''))
    .filter((w) => w.length >= 3 && !STOP.has(w));

// مواضيع بكلماتها المختلفة (سجّل/التسجيل/اشتراك…)
const TOPICS: [string, RegExp][] = [
  ['reg', /سجل|سجيل|اشترك|انضم|register|sign ?up|join/],
  ['price', /سعر|اسعار|تكلف|رسوم|بكم|price|cost|fee/],
  ['level', /مستوي|مستوى|cefr|level/],
  ['time', /موعد|مواعيد|وقت|اوقات|جدول|دوام|schedule|time/],
  ['cert', /شهاد|certif/],
  ['pay', /دفع|ادفع|مقدم|قسط|pay/],
  ['live', /مباشر|اونلاين|live|online/],
  ['group', /مجموع|group/],
  ['hw', /واجب|اختبار|homework|test/],
  ['login', /دخول|ادخل|كلمه المرور|login|password/],
  ['active', /تفعيل|يفعل|مفعل|activ/]
];
const tags = (t: string) => new Set(TOPICS.filter(([, re]) => re.test(normAr(t))).map(([k]) => k));

// أقرب سؤال لرسالة الزائرة في Tawk (مثل زر «الأسعار»)
const bestMatch = (msg: string, list: ChatFaq[]): ChatFaq | null => {
  const mw = words(msg);
  const mt = tags(msg);
  if (!mw.length && !mt.size) return null;
  let best: ChatFaq | null = null;
  let score = 0;
  list.forEach((f) => {
    const qw = words(f.questionAr + ' ' + (f.questionEn || ''));
    const qt = tags(f.questionAr + ' ' + (f.questionEn || ''));
    const sc =
      [...mt].filter((t) => qt.has(t)).length * 2 +
      mw.filter((w) => qw.some((q) => q.startsWith(w.slice(0, 4)) || w.startsWith(q.slice(0, 4)))).length;
    if (sc > score) {
      score = sc;
      best = f;
    }
  });
  return best;
};

// مساعد آلي مجاني: أزرار أسئلة جاهزة من لوحة الإدارة، وزر للمحادثة الحقيقية عبر Tawk
export const ChatAssistant: React.FC<{ hidden: boolean }> = ({ hidden }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { tawkUrl, whatsapp } = useAcademySettings();
  const { cards } = usePricing();
  const [open, setOpen] = useState(false);
  const { user, firebaseUser, isStudent } = useAuth();
  const [input, setInput] = useState('');
  const [form, setForm] = useState<null | { name: string; contact: string; message: string }>(null);
  const [sending, setSending] = useState(false);
  const [faqs, setFaqs] = useState<ChatFaq[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hidden) chatFaqService.getActive().then(setFaqs);
  }, [hidden]);

  // عندما تكتب الزائرة في Tawk (أو تضغط زرًا مقترحًا) يظهر الجواب فورًا من المساعد
  const faqsRef = useRef<ChatFaq[]>([]);
  faqsRef.current = faqs;
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  useEffect(() => {
    if (hidden) return;
    const w = window as any;
    w.Tawk_API = w.Tawk_API || {};
    const prev = w.Tawk_API.onChatMessageVisitor;
    w.Tawk_API.onChatMessageVisitor = (message: any) => {
      if (typeof prev === 'function') prev(message);
      const text = String(message?.message ?? message ?? '');
      const f = bestMatch(text, faqsRef.current);
      if (!f) return;
      const ans = f.answerAr.split(PRICES_TOKEN).join(pricesText(cardsRef.current, true));
      setMsgs((m) => [...m, { from: 'me', text: f.questionAr }, { from: 'bot', text: ans }]);
      setOpen(true);
      // على الجوال تغطي نافذة Tawk الشاشة، فنصغّرها ليظهر الجواب
      if (window.innerWidth < 640) {
        try {
          w.Tawk_API.minimize?.();
        } catch {
          // ignore
        }
      }
    };
    return () => {
      w.Tawk_API.onChatMessageVisitor = prev;
    };
  }, [hidden]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, open]);

  if (hidden) return null;

  const q = (f: ChatFaq) => (!isAr && f.questionEn ? f.questionEn : f.questionAr);
  const a = (f: ChatFaq) => {
    const t = !isAr && f.answerEn ? f.answerEn : f.answerAr;
    return t.split(PRICES_TOKEN).join(pricesText(cards, isAr));
  };

  const ask = (f: ChatFaq) => setMsgs((m) => [...m, { from: 'me', text: q(f) }, { from: 'bot', text: a(f) }]);

  const lastQuestion = () => [...msgs].reverse().find((m) => m.from === 'me')?.text || '';

  // سؤال مكتوب: جواب جاهز إن وُجد، وإلا عرض طرق التواصل
  const submitTyped = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const f = bestMatch(text, faqs);
    setMsgs((m) => [
      ...m,
      { from: 'me', text },
      f
        ? { from: 'bot', text: a(f) }
        : {
            from: 'bot',
            text: isAr
              ? 'لم أجد جوابًا جاهزًا لسؤالك 🌷 اختاري كيف تريدين التواصل مع الأكاديمية:'
              : "I don't have a ready answer for that 🌷 Choose how to reach the academy:",
            offer: true
          }
    ]);
  };

  const openWhatsapp = () => {
    const last = lastQuestion();
    const text = isAr ? `مرحبًا English Zone، لدي سؤال${last ? `: ${last}` : ''}` : `Hello English Zone, I have a question${last ? `: ${last}` : ''}`;
    window.open(whatsappWithText(whatsapp, text), '_blank');
  };

  const openTawk = () => {
    const api = (window as any).Tawk_API;
    try {
      api?.showWidget?.();
      api?.maximize?.();
      setOpen(false);
    } catch {
      // Tawk لم يكتمل تحميله
    }
  };

  const loggedStudent = !!firebaseUser && !!user && isStudent;

  // رسالة داخل المنصة: تظهر في لوحة الإدارة ← الرسائل، والطالب يرى الرد في لوحته
  const startMessage = async () => {
    const last = lastQuestion();
    if (loggedStudent) {
      setSending(true);
      try {
        await studentHubService.sendStudentMessage({
          studentId: firebaseUser!.uid,
          name: (user as any).fullName || firebaseUser!.email || 'Student',
          email: (user as any).email || firebaseUser!.email || '',
          subject: isAr ? 'سؤال من المساعد' : 'Question from the assistant',
          message: last || (isAr ? 'أريد التواصل مع الأكاديمية.' : 'I would like to contact the academy.'),
          teacherId: (user as any).teacherId || undefined
        });
        setMsgs((m) => [
          ...m,
          {
            from: 'bot',
            text: isAr
              ? 'وصلت رسالتك للأكاديمية ✅ ستجدين الرد في لوحتك ← تبويب «الرسائل».'
              : 'Your message reached the academy ✅ You will find the reply in your dashboard → Messages.'
          }
        ]);
      } catch (err: any) {
        setMsgs((m) => [...m, { from: 'bot', text: (isAr ? 'تعذّر إرسال الرسالة: ' : 'Could not send: ') + (err?.code || '') }]);
      } finally {
        setSending(false);
      }
      return;
    }
    setForm({ name: '', contact: '', message: last });
  };

  const sendVisitorMessage = async () => {
    if (!form) return;
    if (!form.name.trim() || !form.contact.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      const id = `MSG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      await setDoc(doc(db, 'contact_messages', id), {
        id,
        name: form.name.trim().slice(0, 100),
        email: form.contact.trim().slice(0, 150),
        subject: isAr ? 'سؤال من المساعد' : 'Question from the assistant',
        message: form.message.trim().slice(0, 3000),
        status: 'new',
        submittedAt: new Date().toISOString()
      });
      setForm(null);
      setMsgs((m) => [
        ...m,
        { from: 'bot', text: isAr ? 'وصلت رسالتك ✅ سنرد عليكِ على بريدك أو رقمك في أقرب وقت.' : 'Message received ✅ We will reply to your email or number soon.' }
      ]);
    } catch (err: any) {
      setMsgs((m) => [...m, { from: 'bot', text: (isAr ? 'تعذّر إرسال الرسالة: ' : 'Could not send: ') + (err?.code || '') }]);
    } finally {
      setSending(false);
    }
  };

  const greeting = isAr
    ? 'أهلًا بكِ في English Zone Academy 🌟\nاختاري سؤالك أو اكتبيه، وسأجيبك فورًا:'
    : 'Welcome to English Zone Academy 🌟\nChoose or type your question and I will answer right away:';

  const offerButtons = (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {whatsapp && (
        <button onClick={openWhatsapp} className="px-3 py-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-bold flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {isAr ? 'واتساب' : 'WhatsApp'}
        </button>
      )}
      <button onClick={startMessage} disabled={sending} className="px-3 py-1.5 rounded-full bg-[#0A192F] text-[#F3E5AB] text-[11px] font-bold flex items-center gap-1 disabled:opacity-50">
        <Mail className="w-3.5 h-3.5" />
        {isAr ? 'رسالة للأكاديمية' : 'Message the academy'}
      </button>
      {tawkUrl && (
        <button onClick={openTawk} className="px-3 py-1.5 rounded-full border border-[#0A192F] text-[#0A192F] text-[11px] font-bold">
          {isAr ? 'محادثة مباشرة' : 'Live chat'}
        </button>
      )}
    </div>
  );

  const inp = 'w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs bg-white';

  return (
    <div className="fixed bottom-5 left-5 z-[60]" dir={isAr ? 'rtl' : 'ltr'}>
      {open && (
        <div className="mb-3 w-[min(360px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-7rem))] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-[#0A192F] text-[#F3E5AB] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Bot className="w-5 h-5" />
              {isAr ? 'مساعد English Zone' : 'English Zone Assistant'}
            </div>
            <div className="flex items-center gap-1">
              {msgs.length > 0 && (
                <button onClick={() => { setMsgs([]); setForm(null); }} title={isAr ? 'من جديد' : 'Restart'} className="p-1.5 rounded-lg hover:bg-white/10">
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FAF8F5]">
            <div className="max-w-[85%] p-2.5 rounded-2xl bg-white border border-gray-100 text-xs whitespace-pre-line text-[#0A192F]">{greeting}</div>
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-2.5 rounded-2xl text-xs whitespace-pre-line ${
                  m.from === 'me' ? 'ms-auto bg-[#0A192F] text-[#F3E5AB]' : 'bg-white border border-gray-100 text-[#0A192F]'
                }`}
              >
                {m.text}
                {m.offer && i === msgs.length - 1 && !form && offerButtons}
              </div>
            ))}

            {form && (
              <div className="p-2.5 rounded-2xl bg-white border border-[#D4AF37] space-y-1.5">
                <p className="text-[11px] font-bold text-[#0A192F]">{isAr ? 'اكتبي بياناتك لنرد عليكِ:' : 'Your details so we can reply:'}</p>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={isAr ? 'اسمك' : 'Your name'} className={inp} />
                <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder={isAr ? 'بريدك أو رقم واتساب' : 'Email or WhatsApp number'} className={inp} />
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={2} placeholder={isAr ? 'رسالتك' : 'Your message'} className={inp} />
                <div className="flex gap-1.5">
                  <button onClick={sendVisitorMessage} disabled={sending} className="flex-1 py-1.5 rounded-lg bg-[#0A192F] text-[#F3E5AB] text-[11px] font-bold disabled:opacity-50">
                    {sending ? '...' : isAr ? 'إرسال' : 'Send'}
                  </button>
                  <button onClick={() => setForm(null)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px]">
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {faqs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {faqs.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => ask(f)}
                    className="px-3 py-1.5 rounded-full border border-[#D4AF37] bg-white text-[11px] font-bold text-[#0A192F] hover:bg-[#F3E5AB]/40"
                  >
                    {q(f)}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-100 p-2.5 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitTyped();
              }}
              className="flex gap-1.5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isAr ? 'اكتبي سؤالك هنا…' : 'Type your question…'}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs"
              />
              <button type="submit" className="px-3 rounded-xl bg-[#0A192F] text-[#F3E5AB]" aria-label={isAr ? 'إرسال' : 'Send'}>
                <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </form>
            <div className="flex items-center justify-center gap-3 text-[11px]">
              {whatsapp && (
                <button onClick={openWhatsapp} className="font-bold text-[#128C7E] flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {isAr ? 'واتساب' : 'WhatsApp'}
                </button>
              )}
              <button onClick={startMessage} disabled={sending} className="font-bold text-[#0A192F] flex items-center gap-1 disabled:opacity-50">
                <Mail className="w-3.5 h-3.5" />
                {isAr ? 'رسالة للأكاديمية' : 'Message the academy'}
              </button>
              {tawkUrl && (
                <button onClick={openTawk} className="font-bold text-gray-600">
                  {isAr ? 'محادثة مباشرة' : 'Live chat'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-[#0A192F] text-[#F3E5AB] shadow-xl flex items-center justify-center border-2 border-[#D4AF37]"
        aria-label={isAr ? 'المساعد' : 'Assistant'}
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </button>
    </div>
  );
};
