import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, MessageCircle, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAcademySettings } from '../../hooks/useAcademySettings';
import { usePricing, LevelPriceCard } from '../../hooks/usePricing';
import { chatFaqService, ChatFaq, PRICES_TOKEN } from '../../services/chatFaqService';

interface Msg {
  from: 'bot' | 'me';
  text: string;
}

const pricesText = (cards: LevelPriceCard[], isAr: boolean): string => {
  if (!cards.length)
    return isAr
      ? 'الأسعار غير منشورة حاليًا. اضغطي «تحدثي مع الأكاديمية» ونرسلها لكِ.'
      : 'Prices are not published right now. Tap “Talk to the academy” and we will send them to you.';
  return cards
    .map((c) => {
      const from = c.groupVaries ? (isAr ? 'من ' : 'from ') : '';
      const name = isAr ? c.nameAr : c.nameEn;
      return `• ${c.level}${name ? ` (${name})` : ''}: ${from}$${c.groupPrice} ${isAr ? 'شهريًا للمجموعات' : 'per month (groups)'}`;
    })
    .join('\n');
};

// مساعد آلي مجاني: أزرار أسئلة جاهزة من لوحة الإدارة، وزر للمحادثة الحقيقية عبر Tawk
export const ChatAssistant: React.FC<{ hidden: boolean }> = ({ hidden }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { tawkUrl } = useAcademySettings();
  const { cards } = usePricing();
  const [open, setOpen] = useState(false);
  const [faqs, setFaqs] = useState<ChatFaq[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hidden) chatFaqService.getActive().then(setFaqs);
  }, [hidden]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, open]);

  if (hidden || faqs.length === 0) return null;

  const q = (f: ChatFaq) => (!isAr && f.questionEn ? f.questionEn : f.questionAr);
  const a = (f: ChatFaq) => {
    const t = !isAr && f.answerEn ? f.answerEn : f.answerAr;
    return t.split(PRICES_TOKEN).join(pricesText(cards, isAr));
  };

  const ask = (f: ChatFaq) => setMsgs((m) => [...m, { from: 'me', text: q(f) }, { from: 'bot', text: a(f) }]);

  const talk = () => {
    const api = (window as any).Tawk_API;
    try {
      api?.showWidget?.();
      api?.maximize?.();
      setOpen(false);
    } catch {
      // Tawk لم يكتمل تحميله
    }
  };

  const greeting = isAr
    ? 'أهلًا بكِ في English Zone Academy 🌟\nاختاري سؤالك وسأجيبك فورًا:'
    : 'Welcome to English Zone Academy 🌟\nChoose your question and I will answer right away:';

  return (
    <div className="fixed bottom-5 left-5 z-[60]" dir={isAr ? 'rtl' : 'ltr'}>
      {open && (
        <div className="mb-3 w-[min(360px,calc(100vw-2.5rem))] h-[min(520px,calc(100vh-7rem))] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-[#0A192F] text-[#F3E5AB] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Bot className="w-5 h-5" />
              {isAr ? 'مساعد English Zone' : 'English Zone Assistant'}
            </div>
            <div className="flex items-center gap-1">
              {msgs.length > 0 && (
                <button onClick={() => setMsgs([])} title={isAr ? 'من جديد' : 'Restart'} className="p-1.5 rounded-lg hover:bg-white/10">
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
              </div>
            ))}
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
            <div ref={endRef} />
          </div>

          {tawkUrl && (
            <button onClick={talk} className="m-3 mt-2 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A192F] text-xs font-bold flex items-center justify-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              {isAr ? 'تحدثي مع الأكاديمية' : 'Talk to the academy'}
            </button>
          )}
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
