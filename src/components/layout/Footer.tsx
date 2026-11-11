import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from '../common/Logo';
import { OFFICIAL_CONTACTS } from '../../data/academyData';
import { 
  Mail, 
  Phone, 
  Youtube, 
  Instagram, 
  MessageSquare, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { t, language } = useLanguage();

  const handleNav = (route: string) => {
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#060D1A] text-gray-300 border-t border-[#D4AF37]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand Info & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="footer" onClick={() => handleNav('home')} />
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              {t.footer.aboutText}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A192F] border border-[#D4AF37]/30 text-xs text-[#F3E5AB]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.brand.cefrStandard}</span>
            </div>

            {/* Social channels */}
            <div className="pt-2">
              <span className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                {language === 'ar' ? 'تابع منصات الأكاديمية الرسمية' : 'Official Academy Channels'}
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={OFFICIAL_CONTACTS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0A192F] border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#25D366] hover:border-[#25D366] transition-all"
                  title="WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${OFFICIAL_CONTACTS.email}`}
                  className="w-9 h-9 rounded-lg bg-[#0A192F] border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href={OFFICIAL_CONTACTS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0A192F] border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#FF0000] hover:border-[#FF0000] transition-all"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href={OFFICIAL_CONTACTS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0A192F] border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#E4405F] hover:border-[#E4405F] transition-all"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={OFFICIAL_CONTACTS.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0A192F] border border-white/10 flex items-center justify-center text-gray-300 hover:text-[#5865F2] hover:border-[#5865F2] transition-all"
                  title="Discord"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Academic Programs */}
          <div>
            <h4 className="font-serif-luxury font-bold text-white tracking-wider text-base mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              {t.footer.academicPrograms}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('programs')} className="hover:text-[#F3E5AB] transition-colors">
                  {language === 'ar' ? 'مسارات CEFR (A1–C2)' : 'CEFR Levels (A1–C2)'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('programs')} className="hover:text-[#F3E5AB] transition-colors">
                  {language === 'ar' ? 'الدروس الفردية (60 دقيقة)' : 'Private Lessons (60 min)'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('programs')} className="hover:text-[#F3E5AB] transition-colors">
                  {language === 'ar' ? 'دورات المجموعات (90 دقيقة)' : 'Group Courses (90 min)'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('programs')} className="hover:text-[#F3E5AB] transition-colors">
                  {language === 'ar' ? 'إتقان المحادثة والطلاقة' : 'Conversation Mastery'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('programs')} className="hover:text-[#F3E5AB] transition-colors">
                  {language === 'ar' ? 'الإنجليزية المهنية للأعمال' : 'Business English'}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('curriculum')} className="hover:text-[#F3E5AB] transition-colors">
                  {language === 'ar' ? 'الخطة والـ 18 مرحلة' : '18 Stage Curriculum'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="font-serif-luxury font-bold text-white tracking-wider text-base mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('english-club')} className="hover:text-[#F3E5AB] text-[#D4AF37] font-semibold transition-colors flex items-center gap-1">
                  <span>{t.nav.englishClub}</span>
                  <span className="text-[10px] bg-[#D4AF37] text-[#0A192F] px-1 rounded font-bold">New</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('placement-test')} className="hover:text-[#F3E5AB] text-gray-300 transition-colors flex items-center gap-1">
                  <span>{t.nav.placementTest}</span>
                  <span className="text-[10px] bg-white/20 text-white px-1 rounded font-bold">Free</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('pricing')} className="hover:text-[#F3E5AB] transition-colors">
                  {t.nav.pricing}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('offers')} className="hover:text-[#F3E5AB] transition-colors">
                  {t.nav.offers}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('certificates')} className="hover:text-[#F3E5AB] transition-colors">
                  {t.nav.certificates}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[#F3E5AB] transition-colors">
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#F3E5AB] transition-colors">
                  {t.nav.faq}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('blog')} className="hover:text-[#F3E5AB] transition-colors">
                  {t.nav.blog}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Contact & Verification */}
          <div>
            <h4 className="font-serif-luxury font-bold text-white tracking-wider text-base mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              {t.footer.contactInfo}
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-semibold">WhatsApp:</span>
                <a href={OFFICIAL_CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                  +84 326 853 884
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-semibold">Email:</span>
                <a href={`mailto:${OFFICIAL_CONTACTS.email}`} className="hover:text-white break-all">
                  englishzoneabc123@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-semibold">Format:</span>
                <span>Online Live Classes (Zoom / Classroom)</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => handleNav('register')}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] font-bold text-center text-xs shadow hover:brightness-110"
                >
                  {t.nav.register}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>{t.footer.disclaimer}</span>
            <span>•</span>
            <button onClick={() => handleNav('login')} className="hover:text-[#F3E5AB] underline">
              {t.nav.studentPortal}
            </button>
            <span>•</span>
            <button onClick={() => handleNav('admin-login')} className="hover:text-[#D4AF37] flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'ar' ? 'بوابة الإدارة' : 'Admin Console'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
