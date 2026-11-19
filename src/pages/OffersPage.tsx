import React, { useEffect, useState } from 'react';
import { ReferralTeaser } from '../components/student/ReferralOffers';
import { useAuth } from '../context/AuthContext';
import { contentManagementService, DynamicPromotionOffer } from '../services/contentManagementService';
import { useLanguage } from '../context/LanguageContext';
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
  const [loading, setLoading] = useState(true);

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
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.offers.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.offers.sectionSubtitle}
          </p>
          <div className="mt-6">
            <ReferralTeaser isAr={language === 'ar'} onClick={() => navigate(isAuthenticated ? 'portal' : 'join-offer')} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* للزوار غير المسجلين: عرض التسجيل المجاني وعرض السفراء */}
        {!isAuthenticated && (
          <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#0A192F] via-[#102445] to-[#0A192F] border-2 border-[#D4AF37] shadow-xl text-center space-y-5">
            <button
              onClick={() => navigate('join-offer')}
              className="ez-float-glow px-6 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] text-sm font-bold"
            >
              {isAr ? '{انضم|انضمي} الآن' : 'Join now'}
            </button>
            <div className="space-y-2">
              <Gift className="w-9 h-9 text-[#D4AF37] mx-auto" />
              <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#F3E5AB] leading-snug">
                {isAr ? '{سجّل|سجّلي} معنا حسابًا مجانيًا {واستمتع|واستمتعي} بعرض خصم 50%' : 'Create a free account and enjoy a 50% discount'}
              </h2>
            </div>
            <div className="mx-auto max-w-md p-4 rounded-2xl bg-white/5 border border-[#D4AF37]/40">
              <p className="font-bold text-lg text-white">
                {isAr ? '{كن سفيرًا|كوني سفيرة} لنا {واربح|واربحي} 15%' : 'Become our ambassador and earn 15%'}
              </p>
            </div>
            <button
              onClick={() => navigate('join-offer')}
              className="px-8 py-3 rounded-2xl bg-[#D4AF37] text-[#0A192F] text-base font-bold hover:bg-[#F3E5AB] transition-colors shadow-lg"
            >
              {isAr ? '{انضم|انضمي} الآن' : 'Join now'}
            </button>
          </div>
        )}

        {!loading && offers.length === 0 && isAuthenticated && (
          <div className="p-10 rounded-3xl bg-white border border-gray-200 text-center text-sm text-gray-500">
            {isAr ? 'لا توجد عروض حاليًا.' : 'There are no offers at the moment.'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl p-8 border-2 border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {offer.badge ? (
                    <span className="px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5">
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

                <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mb-3">
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
                    <span className="font-mono font-bold text-base text-[#0A192F]">
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
                className="w-full py-3 rounded-xl font-bold text-sm bg-[#0A192F] text-white hover:bg-[#162B4D] transition-colors flex items-center justify-center gap-2"
              >
                <span>{t.offers.applyOffer}</span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Note on combining discounts (Rule 14) */}
        <div className="p-6 rounded-2xl bg-[#0A192F]/5 border border-[#D4AF37]/30 text-center text-xs text-gray-600 max-w-2xl mx-auto">
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
