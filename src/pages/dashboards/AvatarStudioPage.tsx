import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ThreeCharacterStudio } from '../../components/avatar/ThreeCharacterStudio';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { AvatarConfiguration } from '../../types/auth';
import { 
  Sparkles, 
  RotateCcw, 
  Save, 
  Dices, 
  Check, 
  User, 
  Palette, 
  Scissors, 
  Shirt, 
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  Box
} from 'lucide-react';

interface AvatarStudioPageProps {
  navigate: (route: string) => void;
}

const SKIN_TONES = [
  { label: 'Fair Ivory', value: '#F7D7C4' },
  { label: 'Warm Peach', value: '#F0C29E' },
  { label: 'Golden Honey', value: '#E0AC69' },
  { label: 'Olive Tan', value: '#C68B59' },
  { label: 'Caramel Bronze', value: '#9A6338' },
  { label: 'Deep Espresso', value: '#5C381E' }
];

const EYE_COLORS = [
  { label: 'Dark Brown', value: '#2C1B18' },
  { label: 'Warm Amber', value: '#78350F' },
  { label: 'Emerald Green', value: '#065F46' },
  { label: 'Sapphire Blue', value: '#1E40AF' },
  { label: 'Charcoal Grey', value: '#374151' }
];

const HAIR_COLORS = [
  { label: 'Natural Black', value: '#1A1A1A' },
  { label: 'Dark Brown', value: '#3E2723' },
  { label: 'Warm Chestnut', value: '#6D4C41' },
  { label: 'Golden Blonde', value: '#D4AF37' },
  { label: 'Auburn', value: '#8D261A' }
];

const HIJAB_COLORS = [
  { label: 'Navy Blue', value: '#0A192F' },
  { label: 'Champagne Gold', value: '#C5A059' },
  { label: 'Pearl Cream', value: '#EDE8DF' },
  { label: 'Rose Blush', value: '#D98282' },
  { label: 'Sage Olive', value: '#4A6B56' },
  { label: 'Deep Burgundy', value: '#581C28' },
  { label: 'Charcoal Slate', value: '#262626' }
];

const CLOTHING_COLORS = [
  { label: 'English Zone Navy', value: '#0A192F' },
  { label: 'Champagne Gold', value: '#D4AF37' },
  { label: 'Royal Emerald', value: '#164E43' },
  { label: 'Burgundy Crimson', value: '#651A24' },
  { label: 'Warm Sand', value: '#E7DEC8' },
  { label: 'Classic Black', value: '#171717' }
];

export const AvatarStudioPage: React.FC<AvatarStudioPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { user, saveAvatarConfig } = useAuth();

  const [engineMode, setEngineMode] = useState<'3d' | '2d'>('3d');
  const [activeCategory, setActiveCategory] = useState<'character' | 'hair_hijab' | 'wardrobe' | 'background' | 'accessories'>('character');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize with user's saved avatar config or sensible defaults
  const [avatar, setAvatar] = useState<AvatarConfiguration>(() => {
    if (user?.avatarConfig) {
      return user.avatarConfig;
    }
    return {
      gender: 'female',
      characterType: 'teen',
      skinTone: '#E0AC69',
      faceShape: 'oval',
      eyesStyle: 'almond',
      eyeColor: '#2C1B18',
      hairStyle: 'shoulder-length',
      hairColor: '#1A1A1A',
      hasHijab: true,
      hijabStyle: 'modern-wrap',
      hijabColor: '#0A192F',
      clothingType: 'modest-blouse',
      clothingColor: '#D4AF37',
      backgroundId: 'modern-library',
      accessories: ['glasses']
    };
  });

  const handleSave = () => {
    saveAvatarConfig(avatar);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleRandomize = () => {
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].value;
    const randomEye = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].value;
    const randomHair = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].value;
    const randomHijabColor = HIJAB_COLORS[Math.floor(Math.random() * HIJAB_COLORS.length)].value;
    const randomCloth = CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)].value;
    const backgrounds = ['modern-library', 'study-room', 'academic-hall', 'nature-garden', 'golden-stars'];
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const randomGender = Math.random() > 0.5 ? 'female' : 'male';
    const randomHijab = randomGender === 'female' ? Math.random() > 0.3 : false;

    setAvatar({
      ...avatar,
      gender: randomGender,
      skinTone: randomSkin,
      eyeColor: randomEye,
      hairColor: randomHair,
      hasHijab: randomHijab,
      hijabColor: randomHijabColor,
      clothingColor: randomCloth,
      backgroundId: randomBg
    });
  };

  const handleReset = () => {
    if (user?.avatarConfig) {
      setAvatar(user.avatarConfig);
    }
  };

  const toggleAccessory = (acc: string) => {
    const current = [...avatar.accessories];
    const exists = current.includes(acc);
    if (exists) {
      setAvatar({ ...avatar, accessories: current.filter((a) => a !== acc) });
    } else {
      setAvatar({ ...avatar, accessories: [...current, acc] });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12">
      {/* Top Bar with Navigation & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <button
              onClick={() => navigate('student-dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0A192F] mb-2"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              <span>{language === 'ar' ? 'العودة لبوابة الطالب' : 'Back to Student Portal'}</span>
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif-luxury font-bold text-2xl sm:text-4xl text-[#0A192F]">
                English Zone Avatar Studio
              </h1>
              {/* Engine Mode Switcher */}
              <div className="inline-flex items-center gap-1 p-1 bg-white border border-gray-300 rounded-2xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setEngineMode('3d')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    engineMode === '3d'
                      ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Character Studio (New)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEngineMode('2d')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    engineMode === '2d'
                      ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 text-gray-400" />
                  <span>Classic Badge Mode</span>
                </button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {language === 'ar'
                ? 'خصص مظهرك الأكاديمي الرقمي بالكامل مع خيارات الحجاب والأزياء والخلفيات المتنوعة.'
                : 'Craft and personalize your official digital academic avatar with rich character, hijab, wardrobe, and study backgrounds.'}
            </p>
          </div>

          {engineMode === '2d' && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleRandomize}
                type="button"
                className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Dices className="w-4 h-4 text-[#AA820A]" />
                <span>{language === 'ar' ? 'عشوائي' : 'Randomize'}</span>
              </button>

              <button
                onClick={handleReset}
                type="button"
                className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
              </button>

              <button
                onClick={handleSave}
                type="button"
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                    <span className="text-[#25D366]">{language === 'ar' ? 'تم الحفظ!' : 'Saved!'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'حفظ الأفاتار' : 'Save Avatar'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {engineMode === '3d' ? (
          <ThreeCharacterStudio onBack={() => navigate('student-dashboard')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CENTER AVATAR DISPLAY (PROMINENT PREVIEW) */}
            <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-square p-4 bg-white rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl flex items-center justify-center">
              <AvatarRenderer config={avatar} size="100%" showBackground={true} />

              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0A192F]/80 backdrop-blur-sm text-[10px] font-bold text-[#F3E5AB] border border-[#D4AF37]/30">
                Live Preview
              </div>

              {saveSuccess && (
                <div className="absolute inset-0 bg-[#0A192F]/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-white z-20">
                  <CheckCircle2 className="w-16 h-16 text-[#25D366] mb-2" />
                  <span className="font-serif-luxury font-bold text-lg text-[#F3E5AB]">
                    {language === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Avatar Saved Successfully!'}
                  </span>
                  <span className="text-xs text-gray-300">
                    {language === 'ar' ? 'ستظهر صورتك الرمزية في بوابتك الأكاديمية' : 'Reflected in your portal and badge'}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              {language === 'ar' 
                ? 'يتم تحديث المظهر فورياً عند تغيير أي خيار في لوحة التخصيص.' 
                : 'Real-time synchronization across all features, grades, and profile cards.'}
            </p>
          </div>

          {/* CUSTOMIZATION CONTROL TABS & PANELS */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-lg space-y-6">
            
            {/* Category Selector Tabs */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
              {[
                { id: 'character', labelEn: 'Character & Skin', labelAr: 'الشخصية والبشرة', icon: User },
                { id: 'hair_hijab', labelEn: 'Hair & Hijab', labelAr: 'الحجاب والشعر', icon: Scissors },
                { id: 'wardrobe', labelEn: 'Wardrobe', labelAr: 'الملابس والأزياء', icon: Shirt },
                { id: 'background', labelEn: 'Backgrounds', labelAr: 'الخلفية الدراسية', icon: ImageIcon },
                { id: 'accessories', labelEn: 'Badges & Accessories', labelAr: 'الأوسمة والإضافات', icon: Sparkles }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-[#0A192F] text-[#F3E5AB] shadow-md'
                        : 'bg-[#FAF8F5] text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                    <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: CHARACTER & SKIN */}
            {activeCategory === 'character' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-3">
                    {language === 'ar' ? 'نوع الشخصية والجنس:' : 'Gender & Character Identity:'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAvatar({ ...avatar, gender: 'female' })}
                      className={`p-3 rounded-xl border-2 text-sm font-bold text-center transition-all ${
                        avatar.gender === 'female'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0A192F]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Female Character
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatar({ ...avatar, gender: 'male', hasHijab: false })}
                      className={`p-3 rounded-xl border-2 text-sm font-bold text-center transition-all ${
                        avatar.gender === 'male'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0A192F]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      Male Character
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-3">
                    {language === 'ar' ? 'تدرجات لون البشرة الطبيعية:' : 'Natural Skin Tone Palette:'}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, skinTone: tone.value })}
                        className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                          avatar.skinTone === tone.value ? 'border-[#0A192F] shadow-md scale-105' : 'border-gray-200'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: tone.value }}></div>
                        <span className="text-[10px] text-gray-600 font-semibold">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-3">
                    {language === 'ar' ? 'لون العيون:' : 'Eye Color:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {EYE_COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, eyeColor: col.value })}
                        className={`p-2.5 rounded-xl border-2 flex items-center gap-2 transition-all ${
                          avatar.eyeColor === col.value ? 'border-[#0A192F] bg-gray-50 font-bold' : 'border-gray-200'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: col.value }}></div>
                        <span className="text-xs text-gray-700">{col.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HAIR & HIJAB (COMPREHENSIVE HIJAB COLLECTION AS REQUIRED IN SECTION 28) */}
            {activeCategory === 'hair_hijab' && (
              <div className="space-y-6">
                
                {avatar.gender === 'female' && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-serif-luxury font-bold text-sm text-[#0A192F]">
                          {language === 'ar' ? 'خيارات الحجاب المعتمدة' : 'Hijab Style Collection'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {language === 'ar' ? 'تفعيل الحجاب مع ضبط تلقائي متناسق للشعر' : 'Toggle modest hijab coverage with automatic hair harmony'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAvatar({ ...avatar, hasHijab: !avatar.hasHijab })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          avatar.hasHijab
                            ? 'bg-[#0A192F] text-[#F3E5AB] shadow'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {avatar.hasHijab ? 'Hijab Enabled' : 'Hijab Off'}
                      </button>
                    </div>

                    {avatar.hasHijab && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                          {language === 'ar' ? 'لون الحجاب:' : 'Hijab Color Palette:'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {HIJAB_COLORS.map((col) => (
                            <button
                              key={col.value}
                              type="button"
                              onClick={() => setAvatar({ ...avatar, hijabColor: col.value })}
                              className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                                avatar.hijabColor === col.value ? 'border-[#0A192F] bg-white font-bold shadow-sm' : 'border-gray-200 bg-[#FAF8F5]'
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: col.value }}></div>
                              <span>{col.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hairstyles (Available if not wearing hijab or for male avatars) */}
                {(!avatar.hasHijab || avatar.gender === 'male') && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-3">
                      {language === 'ar' ? 'قصة الشعر:' : 'Hairstyle Options:'}
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {avatar.gender === 'female' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setAvatar({ ...avatar, hairStyle: 'shoulder-length' })}
                            className={`p-3 rounded-xl border-2 text-xs font-bold ${avatar.hairStyle === 'shoulder-length' ? 'border-[#0A192F] bg-gray-50' : 'border-gray-200'}`}
                          >
                            Shoulder Length
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatar({ ...avatar, hairStyle: 'long-waves' })}
                            className={`p-3 rounded-xl border-2 text-xs font-bold ${avatar.hairStyle === 'long-waves' ? 'border-[#0A192F] bg-gray-50' : 'border-gray-200'}`}
                          >
                            Long Wavy
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatar({ ...avatar, hairStyle: 'bob-cut' })}
                            className={`p-3 rounded-xl border-2 text-xs font-bold ${avatar.hairStyle === 'bob-cut' ? 'border-[#0A192F] bg-gray-50' : 'border-gray-200'}`}
                          >
                            Classic Bob
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setAvatar({ ...avatar, hairStyle: 'classic-short' })}
                            className="p-3 rounded-xl border-2 text-xs font-bold border-[#0A192F] bg-gray-50"
                          >
                            Academic Cut
                          </button>
                        </>
                      )}
                    </div>

                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                      {language === 'ar' ? 'لون الشعر:' : 'Hair Color:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {HAIR_COLORS.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => setAvatar({ ...avatar, hairColor: col.value })}
                          className={`p-2 rounded-xl border flex items-center gap-2 text-xs ${
                            avatar.hairColor === col.value ? 'border-[#0A192F] bg-gray-50 font-bold' : 'border-gray-200'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: col.value }}></div>
                          <span>{col.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: WARDROBE (MODEST, FORMAL & CASUAL AS SPECIFIED IN SECTION 29) */}
            {activeCategory === 'wardrobe' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-3">
                    {language === 'ar' ? 'نوع الزي الأكاديمي:' : 'Outfit Style:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAvatar({ ...avatar, clothingType: 'modest-blouse' })}
                      className={`p-3.5 rounded-xl border-2 text-xs font-bold text-center ${
                        avatar.clothingType === 'modest-blouse' ? 'border-[#0A192F] bg-gray-50' : 'border-gray-200'
                      }`}
                    >
                      Modest Blazer & Blouse
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatar({ ...avatar, clothingType: 'academic-gown' })}
                      className={`p-3.5 rounded-xl border-2 text-xs font-bold text-center ${
                        avatar.clothingType === 'academic-gown' ? 'border-[#0A192F] bg-gray-50' : 'border-gray-200'
                      }`}
                    >
                      Formal Abaya / Robe
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatar({ ...avatar, clothingType: 'casual-jacket' })}
                      className={`p-3.5 rounded-xl border-2 text-xs font-bold text-center ${
                        avatar.clothingType === 'casual-jacket' ? 'border-[#0A192F] bg-gray-50' : 'border-gray-200'
                      }`}
                    >
                      Executive Oxford Jacket
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-3">
                    {language === 'ar' ? 'لون الزي:' : 'Wardrobe Color:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CLOTHING_COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setAvatar({ ...avatar, clothingColor: col.value })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                          avatar.clothingColor === col.value ? 'border-[#0A192F] bg-gray-50 font-bold shadow-sm' : 'border-gray-200'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: col.value }}></div>
                        <span>{col.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BACKGROUNDS (SECTION 30) */}
            {activeCategory === 'background' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                  {language === 'ar' ? 'اختر بيئة الدراسة أو الخلفية:' : 'Select Academic Background Environment:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'modern-library', nameEn: 'Oxford Grand Library', nameAr: 'المكتبة الأكاديمية الكبرى' },
                    { id: 'study-room', nameEn: 'Cozy Study Sanctuary', nameAr: 'غرفة الدراسة الذكية' },
                    { id: 'academic-hall', nameEn: 'International Lecture Hall', nameAr: 'قاعة المحاضرات الدولية' },
                    { id: 'nature-garden', nameEn: 'Green Campus Garden', nameAr: 'حديقة الحرم الأكاديمي' },
                    { id: 'golden-stars', nameEn: 'English Zone Stars Hall of Fame', nameAr: 'صالة نجوم English Zone Stars' }
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setAvatar({ ...avatar, backgroundId: bg.id })}
                      className={`p-4 rounded-xl border-2 text-left rtl:text-right transition-all flex items-center justify-between ${
                        avatar.backgroundId === bg.id
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 font-bold text-[#0A192F]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-semibold">{language === 'ar' ? bg.nameAr : bg.nameEn}</div>
                        <span className="text-[10px] text-gray-400 font-normal">HD Vector Atmosphere</span>
                      </div>
                      {avatar.backgroundId === bg.id && (
                        <Check className="w-4 h-4 text-[#AA820A]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ACCESSORIES & BADGES */}
            {activeCategory === 'accessories' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                  {language === 'ar' ? 'الإضافات والأوسمة التقديرية:' : 'Wearable Accessories & Achievements:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleAccessory('glasses')}
                    className={`p-4 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                      avatar.accessories.includes('glasses')
                        ? 'border-[#0A192F] bg-gray-50 text-[#0A192F]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Classic Study Glasses
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAccessory('star-badge')}
                    className={`p-4 rounded-xl border-2 text-xs font-bold text-center transition-all ${
                      avatar.accessories.includes('star-badge')
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0A192F]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    English Zone Star Badge
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
        )}
      </div>
    </div>
  );
};
