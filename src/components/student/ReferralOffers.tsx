import React, { useState } from 'react';
import { resolveGender } from '../../i18n/gender';
import { Gift, Gem, Copy, MessageCircle, CheckCircle2, Lock } from 'lucide-react';
import { useAcademySettings, whatsappWithText } from '../../hooks/useAcademySettings';
import { referralCodeFor, referralLink, REFERRER_GROUP_DISCOUNT, FRIEND_DISCOUNT, AMBASSADOR_FIRST, AMBASSADOR_MONTHLY } from '../../services/referralService';

// عروض الدعوة داخل المنصة (للعضوات والطالبات)، مع كود الدعوة للطالبة المشتركة
export const ReferralOffers: React.FC<{ uid: string; isAr: boolean; active: boolean; onSubscribe?: () => void }> = ({ uid, isAr, active, onSubscribe }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const code = referralCodeFor(uid);
  const link = referralLink(code);
  const [copied, setCopied] = useState('');
  const { whatsapp } = useAcademySettings();
  const ambassadorWa = whatsapp
    ? whatsappWithText(whatsapp, tr(`Hello English Zone, I would like to become an ambassador. My code: ${code}`, resolveGender(`مرحبًا English Zone، أريد أن {أصبح سفيرًا|أصبح سفيرة} للأكاديمية. كودي: ${code}`)))
    : '';

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      window.prompt(resolveGender(tr('Copy:', '{انسخ|انسخي}:')), text);
    }
  };

  const shareText = tr(
    `Join me at English Zone Academy and get ${FRIEND_DISCOUNT}% off your first month! Use my code ${code}: ${link}`,
    resolveGender(`{انضم|انضمي} معي إلى أكاديمية English Zone {واحصل|واحصلي} على خصم ${FRIEND_DISCOUNT}% على شهرك الأول! كود الدعوة: ${code}\n${link}`)
  );

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="font-serif-luxury font-bold text-2xl text-[#0E3A99]">{tr('Invite & earn', '{ادعُ أصدقاءك واربح|ادعي صديقاتكِ واربحي}')}</h2>
        <p className="text-xs text-gray-500">{tr('Two offers, no limit on the number of friends.', 'عرضان، وبلا حد لعدد {الأصدقاء|الصديقات}.')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl p-6 bg-white border-2 border-[#D4AF37]/50 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="font-bold text-lg text-[#0E3A99]">{tr('“My friend in my group”', 'عرض «{صديقي|صديقتي} في مجموعتي»')}</h3>
          </div>
          <p className="text-xs text-gray-600">{tr('Invite your friend to your own group:', '{ادعُ صديقك|ادعي صديقتكِ} إلى {مجموعتك|مجموعتكِ} نفسها:')}</p>
          <ul className="space-y-2 text-sm text-[#0E3A99]">
            <li>
              • <b>{tr('You:', '{أنت|أنتِ}:')}</b> {tr(`${REFERRER_GROUP_DISCOUNT}% off one full month for every friend who joins (2 friends = 2 months at ${REFERRER_GROUP_DISCOUNT}%), once your friend pays her first month.`, `خصم ${REFERRER_GROUP_DISCOUNT}% على شهر كامل {عن كل صديق ينضم|عن كل صديقة تنضم} ({صديقان|صديقتان} = خصم ${REFERRER_GROUP_DISCOUNT}% على شهرين، وهكذا)، بعد أن {يدفع صديقك|تدفع صديقتكِ} {شهره|شهرها} الأول.`)}
            </li>
            <li>
              • <b>{tr('Your friend:', '{صديقك|صديقتكِ}:')}</b> {tr(`${FRIEND_DISCOUNT}% off her first month.`, `خصم ${FRIEND_DISCOUNT}% على {شهره|شهرها} الأول.`)}
            </li>
          </ul>
        </div>

        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0E3A99] to-[#102445] text-[#F3E5AB] border-2 border-[#D4AF37]/60 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Gem className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="font-bold text-lg">{tr('“English Zone Ambassador”', 'عرض «{سفير|سفيرة} English Zone»')}</h3>
          </div>
          <p className="text-xs text-gray-300">
            {active
              ? tr('Invite any friend to any other group:', '{ادعُ أي صديق|ادعي أي صديقة} إلى أي مجموعة أخرى في الأكاديمية:')
              : tr('No course subscription needed — invite any friend to the academy:', 'لا يشترط {اشتراكك|اشتراككِ} في الكورس، {ادعُ أي صديق|ادعي أي صديقة} إلى الأكاديمية:')}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              • <b>{tr('You:', '{أنت|أنتِ}:')}</b>{' '}
              {tr(`a ${AMBASSADOR_FIRST}% reward of her first month’s fee, then ${AMBASSADOR_MONTHLY}% of her fee every month while she stays subscribed.`, `مكافأة ${AMBASSADOR_FIRST}% من رسوم {شهره|شهرها} الأول، ثم ${AMBASSADOR_MONTHLY}% من {رسومه|رسومها} كل شهر ما {دام مشتركًا|دامت مشتركة}.`)}
            </li>
            <li>
              • <b>{tr('Your friend:', '{صديقك|صديقتكِ}:')}</b> {tr(`${FRIEND_DISCOUNT}% off her first month.`, `خصم ${FRIEND_DISCOUNT}% على {شهره|شهرها} الأول.`)}
            </li>
            <li>• {tr('No limit on the number of friends.', 'بلا حد لعدد {الأصدقاء|الصديقات}.')}</li>
          </ul>
          {ambassadorWa && (
            <a href={ambassadorWa} target="_blank" rel="noopener noreferrer" className="inline-flex px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              {tr('Become an ambassador: message us on WhatsApp', '{كن سفيرًا|كوني سفيرة}: {تواصل|تواصلي} معنا على واتساب')}
            </a>
          )}
        </div>
      </div>

      <div className="rounded-3xl p-6 bg-white border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-bold text-[#0E3A99]">{tr('Your invitation code', 'كود الدعوة الخاص {بك|بكِ}')}</h3>
        {!active && (
          <p className="text-[11px] text-gray-500">
            {tr('Before subscribing, your code works for the Ambassador offer. The “My friend in my group” offer starts once you subscribe.', 'قبل الاشتراك يعمل {كودك|كودكِ} لعرض «{السفير|السفيرة}». وعرض «{صديقي|صديقتي} في مجموعتي» يبدأ بعد {اشتراكك|اشتراككِ} في الكورس.')}
          </p>
        )}
        {true ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-4 py-2 rounded-xl bg-[#FAF8F5] border-2 border-dashed border-[#D4AF37] font-mono font-bold text-lg text-[#0E3A99] tracking-widest" dir="ltr">
                {code}
              </span>
              <button onClick={() => copy(code, 'code')} className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold flex items-center gap-1">
                {copied === 'code' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {tr('Copy code', 'نسخ الكود')}
              </button>
              <button onClick={() => copy(link, 'link')} className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold flex items-center gap-1">
                {copied === 'link' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {tr('Copy link', 'نسخ الرابط')}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" />
                {tr('Share on WhatsApp', 'مشاركة على واتساب')}
              </a>
            </div>
            <p className="text-[11px] text-gray-500">
              {tr('Your friend registers with your link or writes your code in the course registration form.', '{يسجّل صديقك|تسجّل صديقتكِ} من {رابطك|رابطكِ}، أو {يكتب|تكتب} {كودك|كودكِ} في استمارة الاشتراك في الكورس.')}
            </p>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F5]">
            <span className="text-xs text-gray-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#AA820A]" />
              {tr('Your personal code activates once you subscribe to the course.', 'يُفعَّل {كودك|كودكِ} الخاص بعد {اشتراكك|اشتراككِ} في الكورس.')}
            </span>
            {onSubscribe && (
              <button onClick={onSubscribe} className="px-4 py-2 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold">
                {tr('Subscribe to the course', '{اشترك|اشتركي} في الكورس')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-4 bg-[#FAF8F5] border border-gray-200 text-[11px] text-gray-600 space-y-1">
        <b className="text-[#0E3A99]">{tr('Terms', 'الشروط')}</b>
        <p>• {tr('Rewards count after your friend’s subscription is activated and paid.', 'تُحتسب المكافأة بعد تفعيل اشتراك {الصديق ودفعه|الصديقة ودفعها}.')}</p>
        <p>• {tr(`The monthly ${AMBASSADOR_MONTHLY}% is due while your friend stays subscribed.`, `تُستحق مكافأة ${AMBASSADOR_MONTHLY}% الشهرية ما {دام الصديق مشتركًا|دامت الصديقة مشتركة}.`)}</p>
        <p>• {tr('The ambassador offer does not require a course subscription.', 'عرض {السفير|السفيرة} لا يشترط الاشتراك في الكورس.')}</p>
        <p>• {tr('“My friend in my group” is for subscribed students.', 'عرض «{صديقي|صديقتي} في مجموعتي» {للطلاب المشتركين|للطالبات المشتركات}.')}</p>
        <p>• {tr('The ambassador reward is paid by the academy directly.', 'تُسلَّم مكافأة {السفير|السفيرة} من الأكاديمية مباشرة.')}</p>
        <p>• {tr('Your friend must register with your invitation code.', 'يجب أن {يسجّل الصديق|تسجّل الصديقة} بكود الدعوة الخاص {بك|بكِ}.')}</p>
      </div>
    </div>
  );
};

// شريط الإغراء العام قبل التسجيل
export const ReferralTeaser: React.FC<{ isAr: boolean; onClick: () => void; className?: string }> = ({ isAr, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`ez-float-glow w-full rounded-2xl px-5 py-4 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0E3A99] font-bold text-sm sm:text-base flex items-center justify-center gap-2 ${className}`}
  >
    <Gift className="w-5 h-5" />
    {isAr ? '🎁 {اربح|اربحي} بسهولة! {سجّل|سجّلي} مجانًا {واكتشف|واكتشفي} عروض الدعوة' : '🎁 Earn easily! Sign up free and discover our invite offers'}
  </button>
);
