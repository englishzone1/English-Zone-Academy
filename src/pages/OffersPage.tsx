import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Tag, Sparkles, Check, ArrowRight, Gift, Calendar, Copy, CheckCheck } from 'lucide-react';

interface OffersPageProps {
  navigate: (route: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const offers = [
    {
      id: 'package-15',
      title: t.offers.packageDiscountTitle,
      desc: t.offers.packageDiscountDesc,
      discount: '15% OFF',
      code: t.offers.packageDiscountCode,
      badge: language === 'ar' ? 'باقة المرحلة الكاملة' : 'Stage Bundle',
      terms: language === 'ar' ? 'ينطبق عند حجز مرحلة كاملة (شهران) مقدماً' : 'Applies to complete 2-month stage enrollments',
      color: 'gold'
    },
    {
      id: 'promo-10',
      title: t.offers.promoDiscountTitle,
      desc: t.offers.promoDiscountDesc,
      discount: '10% OFF',
      code: t.offers.promoDiscountCode,
      badge: language === 'ar' ? 'للطلاب الجدد' : 'New Students',
      terms: language === 'ar' ? 'خصم فوري على الشهر الأول من أي برنامج' : 'Immediate discount on your first month',
      color: 'navy'
    }
  ];

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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl p-8 border-2 border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{offer.badge}</span>
                  </span>
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

                {/* Promo Code Box */}
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

                <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{offer.terms}</span>
                </div>
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
