import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { 
  Menu, 
  X, 
  Sparkles, 
  BookOpen, 
  Award, 
  HelpCircle, 
  FileText, 
  Phone, 
  ChevronDown,
  UserCheck,
  GraduationCap,
  User,
  MessageSquare
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (route: string) => {
    navigate(route);
    setIsMobileMenuOpen(false);
    setIsMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: t.nav.home },
    { id: 'programs', label: t.nav.programs },
    { id: 'english-club', label: t.nav.englishClub, highlight: true },
    { id: 'curriculum', label: t.nav.curriculum },
    { id: 'pricing', label: t.nav.pricing },
    { id: 'offers', label: t.nav.offers },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ];

  const moreLinks = [
    { id: 'english-club', label: t.nav.englishClub, icon: MessageSquare, badge: 'New' },
    { id: 'placement-test', label: t.nav.placementTest, icon: Sparkles, badge: 'Free' },
    { id: 'certificates', label: t.nav.certificates, icon: Award },
    { id: 'faq', label: t.nav.faq, icon: HelpCircle },
    { id: 'testimonials', label: t.nav.testimonials, icon: UserCheck },
    { id: 'blog', label: t.nav.blog, icon: FileText },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#0A192F]/95 backdrop-blur-md border-b border-[#D4AF37]/30 py-3 shadow-xl' 
        : 'bg-[#0A192F] border-b border-[#D4AF37]/20 py-4'
    }`}>
      {/* Top micro announcement bar */}
      <div className="hidden lg:block border-b border-white/5 pb-2 mb-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-gray-300">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[#F3E5AB]">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
              {t.brand.slogan}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">{t.brand.onlineOnlyBadge}</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleNav('placement-test')} 
              className="text-[#F3E5AB] hover:text-[#D4AF37] transition-colors flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.hero.ctaTest}</span>
            </button>
            <span className="text-gray-500">|</span>
            <a 
              href="https://wa.me/84326853884" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#25D366] transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-[#25D366]" />
              <span>+84 326 853 884</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Logo variant="dark" onClick={() => handleNav('home')} />

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-[#F3E5AB] bg-white/10 font-semibold'
                      : 'text-gray-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{link.label}</span>
                    {link.id === 'english-club' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0A192F] text-[10px] font-extrabold tracking-wider uppercase leading-none shadow-xs">
                        New
                      </span>
                    )}
                  </span>
                </button>
              );
            })}

            {/* "More" Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <span>{language === 'ar' ? 'المزيد' : 'More'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreDropdownOpen && (
                <div 
                  className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-56 rounded-xl bg-[#0A192F] border border-[#D4AF37]/30 shadow-2xl p-2 z-50`}
                  onMouseLeave={() => setIsMoreDropdownOpen(false)}
                >
                  {moreLinks.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentRoute === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                          isActive
                            ? 'bg-[#D4AF37]/20 text-[#F3E5AB] font-semibold'
                            : 'text-gray-200 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComponent className="w-4 h-4 text-[#D4AF37]" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37] text-[#0A192F]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Action CTAs & Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <button
                onClick={() => handleNav('portal')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#162B4D] border border-[#D4AF37]/40 text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all flex items-center gap-2 shadow"
              >
                <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center font-bold text-[10px]">
                  {user.fullName.charAt(0)}
                </div>
                <span>
                  {user.role === 'super-admin' || user.role === 'super_admin' || user.role === 'admin'
                    ? 'Admin Console'
                    : user.role === 'teacher'
                    ? 'Teacher Portal'
                    : 'Student Portal'}
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-200 hover:text-white transition-colors"
                >
                  {t.nav.login}
                </button>

                <button
                  onClick={() => handleNav('register')}
                  className="relative group overflow-hidden px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-lg hover:shadow-[#D4AF37]/20 transition-all active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {t.nav.register}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-[#D4AF37]" /> : <Menu className="w-6 h-6 text-gray-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#D4AF37]/20 bg-[#0A192F] px-4 pt-4 pb-6 space-y-2 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => handleNav('register')}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] text-center"
            >
              {t.nav.register}
            </button>
            <button
              onClick={() => handleNav('placement-test')}
              className="w-full py-2.5 rounded-xl font-semibold text-xs border border-[#D4AF37]/50 text-[#F3E5AB] flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              {t.nav.placementTest}
            </button>
          </div>

          <div className="border-t border-white/10 pt-2 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium ${
                  currentRoute === link.id
                    ? 'bg-[#D4AF37]/20 text-[#F3E5AB] font-bold'
                    : 'text-gray-200 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-2 pb-1 text-xs uppercase tracking-wider text-[#D4AF37] font-bold px-3">
              {language === 'ar' ? 'صفحات إضافية' : 'Academy Explorations'}
            </div>

            {moreLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium ${
                  currentRoute === item.id
                    ? 'bg-[#D4AF37]/20 text-[#F3E5AB] font-bold'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37] text-[#0A192F]">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="border-t border-white/10 pt-3">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-center border border-white/20 text-white hover:bg-white/10"
              >
                {t.nav.login}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
