import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { contentManagementService, DynamicPromotionOffer } from '../services/contentManagementService';
import { useLanguage } from '../context/LanguageContext';
import { PROGRAM_CATEGORIES } from '../data/academyData';
import { ProgramPrice } from '../components/programs/ProgramPrice';
import { Tag, Sparkles, Check, ArrowRight, Gift, Calendar, Copy, CheckCheck } from 'lucide-react';

interface OffersPageProps {
  navigate: (route: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // العروض المنشورة من لوحة الإدارة فقط (promotions_offers)، ويُخفى العرض بعد تاريخ انتهائه
  const [offersRaw, setOffersRaw] = useState<DynamicPromotionOffer[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    contentManagementService
      .getOffers()
      .then((list) => setOffersRaw(list || []))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const isAr = language === 'ar';
  const offers = offersRaw
    .filter((o) => o.isActive && (!o.validUntil || o.validUntil >= today))
    .map((o) => ({
      id: o.id,
      title: (isAr ? o.titleAr : o.titleEn) || o.titleAr || o.titleEn,
      desc: (isAr ? o.descriptionAr : o.descriptionEn) || o.descriptionAr || o.descriptionEn,
      discount: o.discountPercentage ? (isAr ? `خصم ${o.discountPercentage}%` : `${o.discountPercentage}% OFF`) : '',
      code: (o.promoCode || '').trim(),
      badge: (isAr ? o.badgeAr : o.badgeEn) || o.badgeAr || o.badgeEn,
      terms: o.validUntil ? (isAr ? `ساري حتى ${o.validUntil}` : `Valid until ${o.validUntil}`) : ''
    }));

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.brand.name} Savings & Bundles
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#061638] mt-2">
            {t.offers.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.offers.sectionSubtitle}
          </p>
          <div className="mt-6">
            {(
              <button
                onClick={() => navigate(isAuthenticated ? 'portal' : 'join-offer')}
                className="ez-float-glow w-full rounded-2xl px-5 py-5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#061638] flex flex-col items-center gap-2"
              >
                {isAr ? (
                  <>
                    <span className="font-bold text-base sm:text-lg leading-snug">
                      🎁 سجّلي معنا حسابًا مجانيًا واستمتعي بعرض خصم <span className="text-[#8a5a00] text-xl sm:text-2xl">30%</span>
                    </span>
                    <span className="w-24 h-px bg-[#061638]/25" />
                    <span className="font-bold text-sm sm:text-base">
                      👑 كوني سفيرة لنا واربحي <span className="text-[#8a5a00] text-lg sm:text-xl">15%</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-base sm:text-lg">🎁 Create a free account and enjoy a 30% discount</span>
                    <span className="w-24 h-px bg-[#061638]/25" />
                    <span className="font-bold text-sm sm:text-base">👑 Become our ambassador and earn 15%</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {PROGRAM_CATEGORIES.filter((p) => p.monthlyStartingPrice && p.offerNoteAr).map((p) => (
          <div key={p.id} dir={isAr ? 'rtl' : 'ltr'} className="bg-gradient-to-br from-[#061638] to-[#102445] text-white rounded-3xl p-7 sm:p-9 border-2 border-[#D4AF37] shadow-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37] text-[#061638] text-xs font-extrabold mb-3">
              <Gift className="w-3.5 h-3.5" />
              {isAr ? 'العرض الحالي' : 'Current offer'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
              <div className="md:col-span-3">
                <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#F3E5AB] mb-3">{isAr ? p.titleAr : p.titleEn}</h2>
                <p className="text-sm sm:text-base text-gray-200 leading-relaxed mb-3">{isAr ? p.shortDescAr : p.shortDescEn}</p>
                <p className="text-sm text-gray-300">{isAr ? p.durationAr : p.durationEn} • {isAr ? p.formatAr : p.formatEn}</p>
              </div>
              <div className="md:col-span-2 space-y-3">
                <ProgramPrice prog={p} language={language} dark />
                <button
                  onClick={() => navigate(`course/${p.id}`)}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#061638] flex items-center justify-center gap-2"
                >
                  {isAr ? 'تفاصيل العرض' : 'Offer details'}
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl p-8 border-2 border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {offer.badge ? (
                    <span className="px-3 py-1 rounded-full bg-[#061638] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{offer.badge}</span>
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="font-serif-luxury font-bold text-2xl text-[#D4AF37]">
                    {offer.discount}
                  </span>
                </div>

                <h2 className="font-serif-luxury font-bold text-2xl text-[#061638] mb-3">
                  {offer.title}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {offer.desc}
                </p>

                {offer.code && (
                                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                      {language === 'ar' ? 'رمز القسيمة' : 'Promo Code'}
                    </span>
                    <span className="font-mono font-bold text-base text-[#061638]">
                      {offer.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-[#25D366]" />
                        <span className="text-[#25D366]">{language === 'ar' ? 'تم النسخ' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
                )}

                {offer.terms && (
                  <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{offer.terms}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('register')}
                className="w-full py-3 rounded-xl font-bold text-sm bg-[#061638] text-white hover:bg-[#123A8C] transition-colors flex items-center justify-center gap-2"
              >
                <span>{t.offers.applyOffer}</span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Note on combining discounts (Rule 14) */}
        <div className="p-6 rounded-2xl bg-[#061638]/5 border border-[#D4AF37]/30 text-center text-xs text-gray-600 max-w-2xl mx-auto">
          <p>
            {language === 'ar'
              ? 'تنويه: لا يتم دمج الخصومات تلقائياً ما لم يتم اعتماد ذلك من الإدارة العليا للأكاديمية. تطبق الأسعار الرسمية المعتمدة لكل مرحلة.'
              : 'Official Policy: Promotional discounts cannot be combined automatically unless explicitly approved by Academy Administration. Official stage tuition applies.'}
          </p>
        </div>
      </div>
    </div>
  );
};
