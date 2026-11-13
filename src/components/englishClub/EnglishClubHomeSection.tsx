import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { EnglishZoneEmblem } from '../common/Logo';
import { 
  Clock, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';

interface EnglishClubHomeSectionProps {
  navigate: (route: string) => void;
  onJoinClick?: () => void;
}

const OFFICIAL_ENGLISH_CLUB_IMAGE = '/assets/aistudio/file_00000000258081f4b09279610d241227_e69634ba.png';

export const EnglishClubHomeSection: React.FC<EnglishClubHomeSectionProps> = ({ 
  navigate,
  onJoinClick
}) => {
  const { language, t } = useLanguage();
  const c = t.englishClub;

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6] to-[#FAF8F5] border-y border-[#D4AF37]/25">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="bg-[#0A192F] text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-2xl border border-[#D4AF37]/40 relative overflow-hidden">
          
          {/* Subtle metallic backdrop pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Artwork Column */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div 
                onClick={() => navigate('english-club')}
                className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/50 group cursor-pointer bg-[#0A192F]"
              >
                <img
                  src={OFFICIAL_ENGLISH_CLUB_IMAGE}
                  alt="English Zone English Club Banner"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-serif-luxury font-bold text-[#F3E5AB]">
                    Interactive Online Practice
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold tracking-wider uppercase">
                    New Feature
                  </span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#162B4D] border border-[#D4AF37]/50 text-[#F3E5AB] text-xs font-semibold">
                <EnglishZoneEmblem sizeClass="w-3.5 h-3.5" glow={false} showBevelBorder={false} />
                <span>{c.badge}</span>
                <span className="text-gray-400">•</span>
                <span className="text-[#D4AF37] font-bold">A1–C2 CEFR</span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                  {c.mainTitle}
                </h2>
                <p className="mt-1.5 text-lg sm:text-xl font-serif-luxury font-semibold text-[#D4AF37]">
                  {c.tagline}
                </p>
                {language === 'ar' && (
                  <p className="text-xs text-gray-300 font-medium">
                    {c.taglineSub}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {c.description}
              </p>

              {/* 3 Core Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-[#F3E5AB] font-bold mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>60-Min Sessions</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    {language === 'ar' ? 'ساعة كاملة من التحدث الفعلي' : 'One full hour of pure active speaking'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-[#F3E5AB] font-bold mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>English Only</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    {language === 'ar' ? 'بيئة انغماس لغوي داعمة' : 'Supportive total immersion'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-[#F3E5AB] font-bold mb-1">
                    <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Breakout Groups</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    {language === 'ar' ? 'مجموعات صغيرة تفاعلية' : 'Small groups for high interaction'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onJoinClick ? onJoinClick : () => navigate('english-club')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm border border-[#D4AF37]/60 text-[#F3E5AB] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                  <span>{c.joinCta}</span>
                </button>
              </div>

              {/* Sub-note */}
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{c.practiceNotReplacementBadge}</span>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
