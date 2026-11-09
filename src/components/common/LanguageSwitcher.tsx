import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-[#D4AF37]/40 bg-[#FAF8F5]/80 hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] text-[#0A192F] transition-all shadow-sm active:scale-95 ${className}`}
      title={language === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
    >
      <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
      <span className="font-medium">
        {language === 'en' ? (
          <span className="font-arabic font-bold text-sm">العربية</span>
        ) : (
          <span className="font-semibold tracking-wider">English</span>
        )}
      </span>
      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB]">
        {language.toUpperCase()}
      </span>
    </button>
  );
};
