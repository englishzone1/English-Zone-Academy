import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { englishClubService } from '../services/englishClubService';
import { EnglishClubSettings } from '../types/englishClub';
import { JoinClubModal } from '../components/englishClub/JoinClubModal';
import { EnglishZoneEmblem } from '../components/common/Logo';
import { OFFICIAL_CONTACTS } from '../data/academyData';
import { 
  Sparkles, 
  Clock, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Volume2, 
  GraduationCap, 
  Smile, 
  Dices, 
  Compass, 
  Info,
  Phone
} from 'lucide-react';

interface EnglishClubPageProps {
  navigate: (route: string) => void;
}

const OFFICIAL_ENGLISH_CLUB_IMAGE = '/assets/aistudio/file_00000000258081f4b09279610d241227_e69634ba.png';

export const EnglishClubPage: React.FC<EnglishClubPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const c = t.englishClub;

  const [settings, setSettings] = useState<EnglishClubSettings | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrackForModal, setSelectedTrackForModal] = useState<'A1-A2' | 'B1-B2' | 'C1-C2' | 'undecided'>('undecided');

  useEffect(() => {
    const loadSettings = async () => {
      const data = await englishClubService.getSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const openModalWithTrack = (track: 'A1-A2' | 'B1-B2' | 'C1-C2' | 'undecided') => {
    setSelectedTrackForModal(track);
    setIsModalOpen(true);
  };

  const expectationIcons = [
    Calendar,
    Clock,
    MessageSquare,
    BookOpen,
    Users,
    Sparkles,
    Dices,
    Smile
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      
      {/* HERO SECTION WITH OFFICIAL ARTWORK */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A192F] via-[#0F2244] to-[#0A192F] text-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#D4AF37]/30">
        {/* Subtle decorative radial grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Text & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#162B4D] border border-[#D4AF37]/40 text-[#F3E5AB] text-xs sm:text-sm font-semibold shadow-sm">
                <EnglishZoneEmblem sizeClass="w-4 h-4" glow={false} showBevelBorder={false} />
                <span>{c.badge}</span>
                <span className="text-gray-400">|</span>
                <span className="text-[#D4AF37] font-bold">100% Online</span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
                  {c.mainTitle}
                </h1>
                <p className="mt-2 text-lg sm:text-2xl font-serif-luxury font-semibold text-[#D4AF37] tracking-wide">
                  {c.tagline}
                </p>
                {language === 'ar' && (
                  <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
                    {c.taglineSub}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-2xl">
                {c.description}
              </p>

              {/* Quick Pillars */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1 text-xs">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[#F3E5AB] font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>60 Minutes Session</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[#F3E5AB] font-medium flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>English-Only Immersion</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[#F3E5AB] font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>A1–C2 CEFR Tracks</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => openModalWithTrack('undecided')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-xl hover:shadow-[#D4AF37]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>{c.joinCta}</span>
                </button>

                <a
                  href="#tracks-section"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-sm sm:text-base border border-white/20 text-gray-200 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <span>{c.viewSessions}</span>
                  <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </a>
              </div>

              {/* Notice */}
              <div className="pt-2 text-xs text-gray-400 flex items-center justify-center lg:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>{c.practiceNotReplacementBadge}</span>
              </div>

            </div>

            {/* Official Artwork Display */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/40 group bg-[#0A192F]">
                <img
                  src={OFFICIAL_ENGLISH_CLUB_IMAGE}
                  alt="English Zone English Club Artwork"
                  className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-[#0A192F]/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <EnglishZoneEmblem sizeClass="w-6 h-6" glow={false} showBevelBorder={false} />
                    <span className="font-semibold text-[#F3E5AB]">Interactive Virtual Lounge</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/30">
                    Live Breakouts
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHAT STUDENTS CAN EXPECT SECTION */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#AA820A] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Sessions</span>
          </div>
          <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F]">
            {c.expectSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {c.expectSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {c.expectations.map((item, index) => {
            const Icon = expectationIcons[index % expectationIcons.length];
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/30 text-[#0A192F] group-hover:bg-[#0A192F] group-hover:text-[#F3E5AB] transition-colors flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-[#0A192F] mb-2 group-hover:text-[#AA820A] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-[11px] font-semibold text-[#D4AF37]">
                  <span>Pillar {index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CLUB STRUCTURE & CEFR TRACKS */}
      <section id="tracks-section" className="py-16 bg-[#F3EDE2]/50 border-y border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#AA820A]">
              CEFR Aligned Structure
            </span>
            <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-1">
              {c.structureSectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              {c.structureSectionSubtitle}
            </p>
          </div>

          {/* 4 Core Structural Pillars Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {c.structureHighlights.map((hl, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0A192F]">{hl.title}</h4>
                  <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-relaxed">{hl.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CEFR Level Track Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Track 1: A1-A2 */}
            <div className="bg-white rounded-3xl p-7 border-2 border-emerald-200 shadow-md flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    CEFR A1–A2
                  </span>
                  <span className="text-xs font-bold text-gray-400">Track 1</span>
                </div>
                <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  {language === 'ar' ? 'مسار التأسيس والمبتدئين' : 'Foundations Conversation Club'}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {language === 'ar'
                    ? 'مصمم للمبتدئين لبناء عادة التحدث اليومية وكسر حاجز الرهبة في بيئة مريحة وداعمة.'
                    : 'Crafted for beginner and elementary learners building active speaking habits and breaking hesitation in a supportive environment.'}
                </p>

                {/* Session Details (Strictly dynamic or academy placeholder) */}
                <div className="mt-6 p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{language === 'ar' ? 'مدة الجلسة:' : 'Duration:'}</span>
                    </span>
                    <span>60 Min</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{language === 'ar' ? 'الموعد المجدول:' : 'Schedule:'}</span>
                    </span>
                    <span className="text-[#0A192F]">
                      {settings?.tracks['A1-A2']?.isConfigured && settings.tracks['A1-A2'].dayTimeEn
                        ? (language === 'ar' && settings.tracks['A1-A2'].dayTimeAr ? settings.tracks['A1-A2'].dayTimeAr : settings.tracks['A1-A2'].dayTimeEn)
                        : (language === 'ar' ? 'يُحدد عند اكتمال المجموعة' : 'Scheduled per cohort')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span>{language === 'ar' ? 'المجموعات الفرعية:' : 'Breakout Group:'}</span>
                    </span>
                    <span>10–15 Learners Max</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModalWithTrack('A1-A2')}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{language === 'ar' ? 'انضم لمسار التأسيس (A1–A2)' : 'Join Foundations Track'}</span>
                </button>
              </div>
            </div>

            {/* Track 2: B1-B2 (Featured) */}
            <div className="bg-white rounded-3xl p-7 border-2 border-[#D4AF37] shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all relative overflow-hidden ring-4 ring-[#D4AF37]/10">
              <div className="absolute top-0 right-0 left-0 h-2.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB] text-xs font-bold border border-[#D4AF37]/40 shadow-xs">
                    CEFR B1–B2 • Most Popular
                  </span>
                  <span className="text-xs font-bold text-[#AA820A]">Track 2</span>
                </div>
                <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  {language === 'ar' ? 'مسار الطلاقة والتعبير' : 'Intermediate Fluency Club'}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {language === 'ar'
                    ? 'للمتحدثين في المستوى المتوسط لمناقشة مواضيع فكرية متنوعة، توسيع التراكيب، والحديث بتدفق طبيعي.'
                    : 'For intermediate speakers expressing nuanced thoughts, debating current topics, and cultivating spontaneous fluency.'}
                </p>

                {/* Session Details */}
                <div className="mt-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/30 text-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#AA820A]" />
                      <span>{language === 'ar' ? 'مدة الجلسة:' : 'Duration:'}</span>
                    </span>
                    <span>60 Min</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#AA820A]" />
                      <span>{language === 'ar' ? 'الموعد المجدول:' : 'Schedule:'}</span>
                    </span>
                    <span className="text-[#0A192F] font-bold">
                      {settings?.tracks['B1-B2']?.isConfigured && settings.tracks['B1-B2'].dayTimeEn
                        ? (language === 'ar' && settings.tracks['B1-B2'].dayTimeAr ? settings.tracks['B1-B2'].dayTimeAr : settings.tracks['B1-B2'].dayTimeEn)
                        : (language === 'ar' ? 'يُحدد عند اكتمال المجموعة' : 'Scheduled per cohort')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#AA820A]" />
                      <span>{language === 'ar' ? 'المجموعات الفرعية:' : 'Breakout Group:'}</span>
                    </span>
                    <span>10–15 Learners Max</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModalWithTrack('B1-B2')}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#0A192F] via-[#162B4D] to-[#0A192F] text-[#F3E5AB] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'انضم لمسار الطلاقة (B1–B2)' : 'Join Fluency Track'}</span>
                </button>
              </div>
            </div>

            {/* Track 3: C1-C2 */}
            <div className="bg-white rounded-3xl p-7 border-2 border-indigo-200 shadow-md flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                    CEFR C1–C2
                  </span>
                  <span className="text-xs font-bold text-gray-400">Track 3</span>
                </div>
                <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  {language === 'ar' ? 'مسار الإتقان والاحتراف' : 'Advanced Mastery Club'}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {language === 'ar'
                    ? 'للمستويات المتقدمة لإتقان الخطابة، مناقشة القضايا العميقة، والتعبير الدقيق بلا تلعثم.'
                    : 'For advanced learners refining idiomatic subtlety, complex debates, executive communication, and professional discourse.'}
                </p>

                {/* Session Details */}
                <div className="mt-6 p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{language === 'ar' ? 'مدة الجلسة:' : 'Duration:'}</span>
                    </span>
                    <span>60 Min</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{language === 'ar' ? 'الموعد المجدول:' : 'Schedule:'}</span>
                    </span>
                    <span className="text-[#0A192F]">
                      {settings?.tracks['C1-C2']?.isConfigured && settings.tracks['C1-C2'].dayTimeEn
                        ? (language === 'ar' && settings.tracks['C1-C2'].dayTimeAr ? settings.tracks['C1-C2'].dayTimeAr : settings.tracks['C1-C2'].dayTimeEn)
                        : (language === 'ar' ? 'يُحدد عند اكتمال المجموعة' : 'Scheduled per cohort')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span>{language === 'ar' ? 'المجموعات الفرعية:' : 'Breakout Group:'}</span>
                    </span>
                    <span>10–15 Learners Max</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModalWithTrack('C1-C2')}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{language === 'ar' ? 'انضم لمسار الإتقان (C1–C2)' : 'Join Mastery Track'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* REGISTRATION INFORMATION */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#AA820A] text-xs font-bold uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                <span>{c.pricingTitle}</span>
              </div>

              <h3 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F]">
                {language === 'ar'
                  ? 'انضم إلى جلسات نادي المحادثة التفاعلية عبر الإنترنت'
                  : 'High-Impact Online Conversation Practice'}
              </h3>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {c.pricingNotice}
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{language === 'ar' ? 'ساعة كاملة لكل جلسة' : 'Full 60-Minute Sessions'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{language === 'ar' ? 'الإنجليزية فقط طوال اللقاء' : 'English Only Immersion'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{language === 'ar' ? 'لا يُشترط الاشتراك في المنهج العام' : 'Open without course purchase'}</span>
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => openModalWithTrack('undecided')}
                className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                <span>{c.joinCta}</span>
              </button>

              <a
                href={`${OFFICIAL_CONTACTS.whatsapp}?text=${encodeURIComponent(
                  'Hello English Zone Academy! I am inquiring about joining the English Club conversation sessions.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-semibold text-xs border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#25D366]" />
                <span>{language === 'ar' ? 'استفسار عبر الواتساب' : 'WhatsApp Inquiry'}</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* REGISTRATION MODAL */}
      <JoinClubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTrack={selectedTrackForModal}
      />

    </div>
  );
};
