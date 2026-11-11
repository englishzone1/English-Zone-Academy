import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OFFICIAL_CONTACTS, CEFR_LEVELS_INFO } from '../data/academyData';
import { studentDataService } from '../services/studentDataService';
import { CEFRLevel, LearningFormat, RegistrationFormData } from '../types';
import { 
  GraduationCap, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  User,
  Mail,
  MapPin,
  Calendar,
  Send
} from 'lucide-react';

interface RegistrationPageProps {
  navigate: (route: string) => void;
  initialLevel?: CEFRLevel;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ navigate, initialLevel }) => {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    age: '',
    country: '',
    whatsappNumber: '',
    email: '',
    mainLevel: initialLevel || 'A1',
    learningGoal: '',
    learningFormat: 'individual',
    notes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  useEffect(() => {
    if (initialLevel) {
      setFormData((prev) => ({ ...prev, mainLevel: initialLevel }));
    }
  }, [initialLevel]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.whatsappNumber || !formData.email) return;

    setIsSubmitting(true);
    try {
      const generatedId = `EZ-REG-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmissionId(generatedId);

      await studentDataService.submitRegistration({
        fullName: formData.fullName.trim(),
        age: formData.age ? String(formData.age) : '',
        country: formData.country.trim(),
        whatsappNumber: formData.whatsappNumber.trim(),
        email: formData.email.trim(),
        mainLevel: formData.mainLevel,
        learningGoal: formData.learningGoal,
        learningFormat: formData.learningFormat,
        notes: formData.notes
      } as any);

      setIsSubmitted(true);
    } catch (err) {
      console.error('Registration submission error:', err);
      // Fallback submission ID display
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate WhatsApp prefilled link with enrollment details
  const generateWhatsAppLink = () => {
    const textEn = `Hello English Zone Admissions! I would like to join the academy. Name: ${formData.fullName || 'Student'}, Main Level: ${formData.mainLevel}, Format: ${formData.learningFormat === 'individual' ? 'Private Lessons (60 min)' : 'Group Lessons (90 min)'}.`;
    const textAr = `مرحباً فريق قبول أكاديمية English Zone، أود التسجيل في الأكاديمية. الاسم: ${formData.fullName || 'طالب'}، المستوى الرئيسي: ${formData.mainLevel}، نظام الحصص: ${formData.learningFormat === 'individual' ? 'دروس فردية (60 دقيقة)' : 'دورات مجموعات (90 دقيقة)'}.`;
    const encoded = encodeURIComponent(language === 'ar' ? textAr : textEn);
    return `${OFFICIAL_CONTACTS.whatsapp}?text=${encoded}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Official Admissions Application
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.register.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            {t.register.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {isSubmitted ? (
          /* SUCCESS CONFIRMATION MODAL CARD */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#D4AF37]/50 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#FAF8F5] border-2 border-[#25D366] flex items-center justify-center text-[#25D366] shadow">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <span className="text-xs uppercase font-bold tracking-widest text-[#AA820A]">
              Application Reference: {submissionId}
            </span>

            <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F]">
              {t.register.successTitle}
            </h2>

            <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              {t.register.successDesc}
            </p>

            {/* Direct WhatsApp button */}
            <div className="pt-4 space-y-3">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>{t.register.whatsappDirect}</span>
              </a>

              {formData.mainLevel === 'needs_test' && (
                <div className="pt-2">
                  <button
                    onClick={() => navigate('placement-test')}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-[#0A192F] bg-[#FAF8F5] border border-[#D4AF37] hover:bg-[#D4AF37]/10"
                  >
                    {t.hero.ctaTest}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={() => navigate('home')}
                className="text-xs font-bold text-gray-500 hover:text-[#0A192F]"
              >
                {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Return to Academy Home'}
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/30 shadow-xl space-y-8">
            
            {/* Top WhatsApp Fast-Track Option */}
            <div className="p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0A192F]">
                    {language === 'ar' ? 'تسجيل مباشر وسريع عبر الواتساب' : 'Fast-Track WhatsApp Registration'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {language === 'ar' ? 'تواصل مع منسق القبول الآن' : 'Chat with admissions coordinator instantly'}
                  </p>
                </div>
              </div>

              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors flex-shrink-0 flex items-center gap-1.5"
              >
                <span>WhatsApp</span>
                <ArrowRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </a>
            </div>

            <div className="relative text-center">
              <span className="bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest relative z-10">
                {t.register.orSeparator} {language === 'ar' ? 'املأ الاستمارة الرسمية' : 'Complete Academy Form'}
              </span>
              <div className="absolute inset-0 top-1/2 border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Full Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                    {t.register.fullName} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={t.register.fullNamePlaceholder}
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                    {t.register.age} *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={6}
                      max={99}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : '' })}
                      placeholder={t.register.agePlaceholder}
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Country & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                    {t.register.country} *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder={t.register.countryPlaceholder}
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                    {t.register.whatsapp} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder={t.register.whatsappPlaceholder}
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                  {t.register.email} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t.register.emailPlaceholder}
                    className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* CRITICAL ENROLLMENT RULE: Main CEFR Level A1–C2 ONLY (Sections 8 & 17) */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F]">
                    {t.register.levelLabel} *
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('placement-test')}
                    className="text-xs text-[#AA820A] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.hero.ctaTest}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mb-4">
                  {t.register.levelHint}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((levelCode) => {
                    const isSelected = formData.mainLevel === levelCode;
                    return (
                      <button
                        key={levelCode}
                        type="button"
                        onClick={() => setFormData({ ...formData, mainLevel: levelCode })}
                        className={`p-3 rounded-xl text-center font-bold text-sm border-2 transition-all ${
                          isSelected
                            ? 'bg-[#0A192F] text-[#F3E5AB] border-[#D4AF37] shadow'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        Level {levelCode}
                      </button>
                    );
                  })}
                </div>

                {/* Placement Test Option */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mainLevel: 'needs_test' })}
                    className={`w-full p-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.mainLevel === 'needs_test'
                        ? 'bg-[#0A192F] text-[#F3E5AB] border-[#D4AF37] shadow'
                        : 'bg-white text-gray-600 border-dashed border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{t.register.levelNeedsTest}</span>
                  </button>
                </div>
              </div>

              {/* Learning Format: Individual (60 min) vs Group (90 min) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                  {t.register.formatLabel} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, learningFormat: 'individual' })}
                    className={`p-4 rounded-xl text-left rtl:text-right border-2 transition-all ${
                      formData.learningFormat === 'individual'
                        ? 'bg-[#0A192F] text-[#F3E5AB] border-[#D4AF37] shadow'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-sm">{t.register.formatIndividual}</div>
                    <div className="text-xs text-gray-400 mt-1">100% dedicated instructor, 60 minutes</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, learningFormat: 'group' })}
                    className={`p-4 rounded-xl text-left rtl:text-right border-2 transition-all ${
                      formData.learningFormat === 'group'
                        ? 'bg-[#0A192F] text-[#F3E5AB] border-[#D4AF37] shadow'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-sm">{t.register.formatGroup}</div>
                    <div className="text-xs text-gray-400 mt-1">4–6 students, 90 minutes extended session</div>
                  </button>
                </div>
              </div>

              {/* Goal & Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                  {t.register.goalLabel}
                </label>
                <input
                  type="text"
                  value={formData.learningGoal}
                  onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
                  placeholder={t.register.goalPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1.5">
                  {t.register.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t.register.notesPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                ></textarea>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] hover:shadow-xl shadow-[#D4AF37]/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>{t.register.submitBtn}</span>
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
