import React, { useState } from 'react';
import { Gift, Gem, Copy, MessageCircle, CheckCircle2, Lock } from 'lucide-react';
import { referralCodeFor, referralLink, REFERRER_GROUP_DISCOUNT, FRIEND_DISCOUNT, AMBASSADOR_FIRST, AMBASSADOR_MONTHLY } from '../../services/referralService';

// عروض الدعوة داخل المنصة (للعضوات والطالبات)، مع كود الدعوة للطالبة المشتركة
export const ReferralOffers: React.FC<{ uid: string; isAr: boolean; active: boolean; onSubscribe?: () => void }> = ({ uid, isAr, active, onSubscribe }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const code = referralCodeFor(uid);
  const link = referralLink(code);
  const [copied, setCopied] = useState('');

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      window.prompt(tr('Copy:', 'انسخي:'), text);
    }
  };

  const shareText = tr(
    `Join me at English Zone Academy and get ${FRIEND_DISCOUNT}% off your first month! Use my code ${code}: ${link}`,
    `انضمي معي إلى أكاديمية English Zone واحصلي على خصم ${FRIEND_DISCOUNT}% على شهرك الأول! كود الدعوة: ${code}\n${link}`
  );

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">{tr('Invite & earn', 'ادعي صديقاتكِ واربحي')}</h2>
        <p className="text-xs text-gray-500">{tr('Two offers, no limit on the number of friends.', 'عرضان، وبلا حد لعدد الصديقات.')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl p-6 bg-white border-2 border-[#D4AF37]/50 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="font-bold text-lg text-[#0A192F]">{tr('“My friend in my group”', 'عرض «صديقتي في مجموعتي»')}</h3>
          </div>
          <p className="text-xs text-gray-600">{tr('Invite your friend to your own group:', 'ادعي صديقتكِ إلى مجموعتكِ نفسها:')}</p>
          <ul className="space-y-2 text-sm text-[#0A192F]">
            <li>
              • <b>{tr('You:', 'أنتِ:')}</b> {tr(`${REFERRER_GROUP_DISCOUNT}% off one full month for every friend who joins (2 friends = 2 months at ${REFERRER_GROUP_DISCOUNT}%).`, `خصم ${REFERRER_GROUP_DISCOUNT}% على شهر كامل عن كل صديقة تنضم (صديقتان = خصم ${REFERRER_GROUP_DISCOUNT}% على شهرين، وهكذا).`)}
            </li>
            <li>
              • <b>{tr('Your friend:', 'صديقتكِ:')}</b> {tr(`${FRIEND_DISCOUNT}% off her first month.`, `خصم ${FRIEND_DISCOUNT}% على شهرها الأول.`)}
            </li>
          </ul>
        </div>

        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#0A192F] to-[#102445] text-[#F3E5AB] border-2 border-[#D4AF37]/60 shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Gem className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="font-bold text-lg">{tr('“English Zone Ambassador”', 'عرض «سفيرة English Zone»')}</h3>
          </div>
          <p className="text-xs text-gray-300">{tr('Invite any friend to any other group:', 'ادعي أي صديقة إلى أي مجموعة أخرى في الأكاديمية:')}</p>
          <ul className="space-y-2 text-sm">
            <li>
              • <b>{tr('You:', 'أنتِ:')}</b>{' '}
              {tr(`a ${AMBASSADOR_FIRST}% reward of her first month’s fee, then ${AMBASSADOR_MONTHLY}% of her fee every month while she stays subscribed.`, `مكافأة ${AMBASSADOR_FIRST}% من رسوم شهرها الأول، ثم ${AMBASSADOR_MONTHLY}% من رسومها كل شهر ما دامت مشتركة.`)}
            </li>
            <li>
              • <b>{tr('Your friend:', 'صديقتكِ:')}</b> {tr(`${FRIEND_DISCOUNT}% off her first month.`, `خصم ${FRIEND_DISCOUNT}% على شهرها الأول.`)}
            </li>
            <li>• {tr('No limit on the number of friends.', 'بلا حد لعدد الصديقات.')}</li>
          </ul>
        </div>
      </div>

      <div className="rounded-3xl p-6 bg-white border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-bold text-[#0A192F]">{tr('Your invitation code', 'كود الدعوة الخاص بكِ')}</h3>
        {active ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-4 py-2 rounded-xl bg-[#FAF8F5] border-2 border-dashed border-[#D4AF37] font-mono font-bold text-lg text-[#0A192F] tracking-widest" dir="ltr">
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
              {tr('Your friend registers with your link or writes your code in the course registration form.', 'تسجّل صديقتكِ من رابطكِ، أو تكتب كودكِ في استمارة الاشتراك في الكورس.')}
            </p>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F5]">
            <span className="text-xs text-gray-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#AA820A]" />
              {tr('Your personal code activates once you subscribe to the course.', 'يُفعَّل كودكِ الخاص بعد اشتراككِ في الكورس.')}
            </span>
            {onSubscribe && (
              <button onClick={onSubscribe} className="px-4 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold">
                {tr('Subscribe to the course', 'اشتركي في الكورس')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-4 bg-[#FAF8F5] border border-gray-200 text-[11px] text-gray-600 space-y-1">
        <b className="text-[#0A192F]">{tr('Terms', 'الشروط')}</b>
        <p>• {tr('Rewards count after your friend’s subscription is activated and paid.', 'تُحتسب المكافأة بعد تفعيل اشتراك الصديقة ودفعها.')}</p>
        <p>• {tr(`The monthly ${AMBASSADOR_MONTHLY}% is due while both you and your friend stay subscribed.`, `تُستحق مكافأة ${AMBASSADOR_MONTHLY}% الشهرية ما دامت صاحبة الدعوة والصديقة مشتركتين.`)}</p>
        <p>• {tr('The ambassador reward is paid by the academy directly.', 'تُسلَّم مكافأة السفيرة من الأكاديمية مباشرة.')}</p>
        <p>• {tr('Your friend must register with your invitation code.', 'يجب أن تسجّل الصديقة بكود الدعوة الخاص بكِ.')}</p>
      </div>
    </div>
  );
};

// شريط الإغراء العام قبل التسجيل
export const ReferralTeaser: React.FC<{ isAr: boolean; onClick: () => void; className?: string }> = ({ isAr, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`ez-float-glow w-full rounded-2xl px-5 py-4 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] font-bold text-sm sm:text-base flex items-center justify-center gap-2 ${className}`}
  >
    <Gift className="w-5 h-5" />
    {isAr ? '🎁 اربحي بسهولة! سجّلي مجانًا واكتشفي عروض الدعوة' : '🎁 Earn easily! Sign up free and discover our invite offers'}
  </button>
);
