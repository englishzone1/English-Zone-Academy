import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FAQ_LIST } from '../data/academyData';
import { HelpCircle, ChevronDown, Search, MessageSquare, Phone } from 'lucide-react';

interface FAQPageProps {
  navigate: (route: string) => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFaqs = FAQ_LIST.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const qText = language === 'ar' ? faq.questionAr : faq.questionEn;
    const aText = language === 'ar' ? faq.answerAr : faq.answerEn;
    const matchesSearch = qText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          aText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Knowledge & Admissions Guide
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {language === 'ar' ? 'الأسئلة الشائعة وإجاباتها' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {language === 'ar'
              ? 'إجابات واضحة ومباشرة حول نظام الدراسة، المستويات، الأسعار، ومواعيد الحصص.'
              : 'Clear, transparent answers about our programs, scheduling, CEFR levels, and monthly tuition.'}
          </p>
        </div>

        {/* Search input */}
        <div className="max-w-xl mx-auto mt-8 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث في الأسئلة الشائعة...' : 'Search questions or keywords...'}
            className="w-full pl-12 pr-4 rtl:pl-4 rtl:pr-12 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:border-[#D4AF37] shadow-sm text-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {[
            { id: 'all', labelEn: 'All Questions', labelAr: 'جميع الأسئلة' },
            { id: 'general', labelEn: 'General & Academy', labelAr: 'عام وعن الأكاديمية' },
            { id: 'format', labelEn: 'Learning Formats', labelAr: 'أنظمة الحصص والمواعيد' },
            { id: 'programs', labelEn: 'CEFR & Programs', labelAr: 'المستويات والمنهج' },
            { id: 'pricing', labelEn: 'Tuition & Payment', labelAr: 'الرسوم وطرق السداد' },
            { id: 'tests', labelEn: 'Placement & Tests', labelAr: 'تحديد المستوى والاختبارات' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#0A192F] text-[#F3E5AB] shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {language === 'ar' ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500">
            {language === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No questions found matching your search.'}
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-6 text-left rtl:text-right flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
                >
                  <span className="font-serif-luxury font-bold text-base sm:text-lg text-[#0A192F] flex items-center gap-2.5">
                    <HelpCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span>{language === 'ar' ? faq.questionAr : faq.questionEn}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#D4AF37]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 text-sm text-gray-600 leading-relaxed bg-[#FAF8F5]/50">
                    <p className="pl-7 rtl:pl-0 rtl:pr-7 whitespace-pre-line">
                      {language === 'ar' ? faq.answerAr : faq.answerEn}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Still have questions banner */}
        <div className="mt-12 p-8 rounded-3xl bg-[#0A192F] text-white text-center space-y-4">
          <h3 className="font-serif-luxury font-bold text-xl text-[#F3E5AB]">
            {language === 'ar' ? 'هل لديك سؤال آخر لم تجد إجابته هنا؟' : 'Have a Question Not Listed Here?'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            {language === 'ar'
              ? 'تواصل معنا مباشرة وسيسعد فريقنا الأكاديمي بتقديم المشورة والإجابة الشاملة.'
              : 'Our admissions desk is always available to assist with your specific learning requirements.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('contact')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#D4AF37] text-[#0A192F] hover:bg-[#F3E5AB] transition-colors"
            >
              {t.nav.contact}
            </button>
            <a
              href="https://wa.me/84326853884"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl font-semibold text-xs border border-white/20 hover:bg-white/10 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
