import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { OFFICIAL_CONTACTS } from '../data/academyData';
import { 
  Phone, 
  Mail, 
  Youtube, 
  Instagram, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  ExternalLink,
  Clock,
  MapPin,
  Globe
} from 'lucide-react';

interface ContactPageProps {
  navigate: (route: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
  };

  const contactChannels = [
    {
      title: t.contact.whatsappCardTitle,
      value: '+84 326 853 884',
      sub: t.contact.whatsappCardDesc,
      href: OFFICIAL_CONTACTS.whatsapp,
      icon: Phone,
      color: '#25D366',
      isOfficial: true
    },
    {
      title: t.contact.emailCardTitle,
      value: OFFICIAL_CONTACTS.email,
      sub: language === 'ar' ? 'الرد الأكاديمي خلال 24 ساعة' : 'Academic response within 24 hours',
      href: `mailto:${OFFICIAL_CONTACTS.email}`,
      icon: Mail,
      color: '#D4AF37',
      isOfficial: true
    },
    {
      title: t.contact.youtubeCardTitle,
      value: '@englishzonewithamal',
      sub: t.contact.youtubeCardDesc,
      href: OFFICIAL_CONTACTS.youtube,
      icon: Youtube,
      color: '#FF0000',
      isOfficial: true
    },
    {
      title: t.contact.instagramCardTitle,
      value: '@englishzoneabc',
      sub: t.contact.instagramCardDesc,
      href: OFFICIAL_CONTACTS.instagram,
      icon: Instagram,
      color: '#E4405F',
      isOfficial: true
    },
    {
      title: t.contact.discordCardTitle,
      value: 'English Zone Student Club',
      sub: t.contact.discordCardDesc,
      href: OFFICIAL_CONTACTS.discord,
      icon: MessageSquare,
      color: '#5865F2',
      isOfficial: true
    },
    {
      title: 'Facebook Page',
      value: language === 'ar' ? 'موضع رابط فيسبوك (قيد الإعداد)' : 'Facebook Channel (Placeholder)',
      sub: language === 'ar' ? 'رابط قابل للتعديل من لوحة الإدارة' : 'Editable link managed by admin',
      href: '#',
      icon: Globe,
      color: '#1877F2',
      isPlaceholder: true
    },
    {
      title: 'Telegram Channel',
      value: language === 'ar' ? 'قناة تيليجرام (قيد الإعداد)' : 'Telegram Channel (Placeholder)',
      sub: language === 'ar' ? 'رابط قابل للتعديل من لوحة الإدارة' : 'Editable link managed by admin',
      href: '#',
      icon: Globe,
      color: '#229ED9',
      isPlaceholder: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Official Admissions Desk
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.contact.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.contact.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {contactChannels.map((item, index) => {
            const Icon = item.icon;
            const isClickable = item.href && item.href !== '#';
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-[#D4AF37]/30 shadow-sm hover:shadow-md hover:border-[#D4AF37] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {item.isPlaceholder ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                        {language === 'ar' ? 'موضع تعديل' : 'Placeholder'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/30">
                        {language === 'ar' ? 'رسمي' : 'Official'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F] mb-1">
                    {item.title}
                  </h3>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 break-all mb-2">
                    {item.value}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.sub}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                  {isClickable ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A192F] hover:text-[#AA820A] transition-colors"
                    >
                      <span>{language === 'ar' ? 'فتح الرابط المباشر' : 'Open Link'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      {language === 'ar' ? 'قيد التفعيل في لوحة الإدارة' : 'Configured via Admin'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Inquiry Form & WhatsApp Quick Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Quick WhatsApp Admissions Banner */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0A192F] to-[#162B4D] text-white rounded-3xl p-8 border border-[#D4AF37]/30 shadow-xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] block">
              Immediate Admissions Support
            </span>
            <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-white">
              {language === 'ar' ? 'هل تود الاستفسار والتسجيل عبر الواتساب فوراً؟' : 'Prefer Direct WhatsApp Assistance?'}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {language === 'ar'
                ? 'فريق القبول والتنسيق الأكاديمي متاح للرد على استفساراتك حول البرامج وتحديد موعد الحصة التجريبية أو حجز مقعدك مباشرة.'
                : 'Our academic coordinator responds promptly to answer questions regarding CEFR level placement, private or group class schedules, and tuition payments.'}
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Admissions Hours: 7 Days a week (Daily Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>Format: International Online Academy (Worldwide)</span>
              </div>
            </div>

            <a
              href={OFFICIAL_CONTACTS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Phone className="w-4 h-4" />
              <span>{language === 'ar' ? 'محادثة فورية على الواتساب' : 'Chat on WhatsApp Now'}</span>
            </a>
          </div>

          {/* Academic Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-gray-200/80 shadow-md">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mb-2">
              {t.contact.formTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              {language === 'ar' 
                ? 'أرسل لنا استفسارك وسيقوم القسم الأكاديمي بالتواصل معك عبر البريد الإلكتروني أو الواتساب.'
                : 'Send your academic question and our team will get in touch with you shortly.'
              }
            </p>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-[#25D366]/40 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto" />
                <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  {t.contact.formSuccess}
                </h3>
                <p className="text-xs text-gray-600">
                  {language === 'ar' 
                    ? 'تم استلام بياناتك وسنرد على بريدك الإلكتروني قريباً.' 
                    : 'We have received your message and will respond promptly.'}
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-white"
                >
                  {language === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">
                      {t.contact.formName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D4AF37] text-sm"
                      placeholder="e.g., Sarah Al-Ahmad"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">
                      {t.contact.formEmail} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D4AF37] text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">
                    {t.contact.formSubject}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D4AF37] text-sm"
                    placeholder="e.g., Level B1 Schedule & Timetable"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">
                    {t.contact.formMessage} *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D4AF37] text-sm"
                    placeholder="Write your questions here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[#0A192F] text-white hover:bg-[#162B4D] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t.contact.formSend}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
