import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { StylizedCartoonAvatarCanvas } from './StylizedCartoonAvatarCanvas';
import { DetailedAvatarConfig, COSMETIC_UNLOCKS } from '../../types/avatar3d';
import {
  Sparkles,
  RotateCcw,
  Save,
  Dices,
  User,
  Scissors,
  Shirt,
  Image as ImageIcon,
  CheckCircle2,
  Undo2,
  Award,
  Crown,
  Heart,
  Check,
  Download
} from 'lucide-react';
import { EnglishZoneEmblem } from '../common/Logo';

interface ThreeCharacterStudioProps {
  onBack?: () => void;
  initialConfig?: Partial<DetailedAvatarConfig>;
}

// Reference 1 & 2 Palette Choices
const SKIN_TONES = [
  { label: 'Fair Ivory', value: '#FCE7D6' },
  { label: 'Warm Peach', value: '#F3CCA8' },
  { label: 'Golden Honey', value: '#E5AC7D' }, // Reference 1 & 2 warm tone
  { label: 'Soft Caramel', value: '#C68B59' },
  { label: 'Caramel Bronze', value: '#9E6338' },
  { label: 'Deep Espresso', value: '#5C381E' }
];

const EYE_COLORS = [
  { label: 'Deep Hazel', value: '#3A2016' }, // Reference 1
  { label: 'Sparkling Aqua', value: '#1E88E5' }, // Reference 3
  { label: 'Dark Espresso', value: '#1A1A1A' }, // Reference 2
  { label: 'Emerald Green', value: '#1B5E20' },
  { label: 'Warm Amber', value: '#E65100' },
  { label: 'Royal Violet', value: '#6A1B9A' }
];

const HAIR_COLORS = [
  { label: 'Chocolate Brown', value: '#3A2016' }, // Reference 1 & 2
  { label: 'Espresso Black', value: '#1A1A1A' },
  { label: 'Chestnut Auburn', value: '#5D4037' },
  { label: 'Golden Honey', value: '#D4AF37' },
  { label: 'Soft Pastel Pink', value: '#F48FB1' }
];

const HIJAB_COLORS = [
  { label: 'Soft Warm Beige', value: '#D8B89E' }, // Reference 1 Exact Color!
  { label: 'Dusty Rose', value: '#D9989E' },
  { label: 'English Zone Navy', value: '#0A192F' },
  { label: 'Champagne Gold', value: '#C5A059' },
  { label: 'Sage Olive', value: '#798E7B' },
  { label: 'Pearl Cream', value: '#F5ECE3' },
  { label: 'Charcoal Slate', value: '#2D3436' }
];

const CLOTHING_COLORS = [
  { label: 'Dusty Rose', value: '#E8BDC4' }, // Reference 1 Pleated Skirt!
  { label: 'Olive Street Green', value: '#5E6B4B' }, // Reference 2 Bomber Jacket!
  { label: 'English Zone Navy', value: '#0A192F' },
  { label: 'Royal Emerald', value: '#1B4D3E' },
  { label: 'Burgundy Crimson', value: '#782835' },
  { label: 'Warm Sand Cream', value: '#F2E8DC' },
  { label: 'Classic Black', value: '#1E232A' }
];

export const ThreeCharacterStudio: React.FC<ThreeCharacterStudioProps> = ({
  onBack,
  initialConfig
}) => {
  const { language } = useLanguage();
  const { user, saveAvatarConfig } = useAuth();

  // Active Category: fashion-game tabs
  const [activeCategory, setActiveCategory] = useState<
    'outfits' | 'hijab' | 'hair' | 'face' | 'shoes' | 'accessories' | 'background'
  >('outfits');

  const [cameraView, setCameraView] = useState<'face' | 'upper' | 'full'>('full');
  const [angleView, setAngleView] = useState<'front' | 'three-quarter' | 'side'>('front');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Default configuration matches Reference 1 (Cute Female Cartoon with Soft Beige Hijab and Pleated Dusty Rose Skirt)
  const defaultConfig: DetailedAvatarConfig = {
    gender: 'female',
    characterType: 'teen',
    skinTone: '#E5AC7D',
    faceShape: 'round',
    eyeColor: '#3A2016',
    eyesStyle: 'almond',
    eyebrowsStyle: 'arched',
    eyebrowsColor: '#3A2016',
    noseStyle: 'subtle',
    lipColor: '#D4777E',
    blushTone: '#FF8A96',
    hasHijab: true,
    hijabStyle: 'cartoon-soft-wrap',
    hijabColor: '#D8B89E', // Exact Reference 1 Soft Beige
    hijabTrimColor: '#FAF8F5',
    hairStyle: 'swooped-pompadour',
    hairColor: '#3A2016',
    clothingType: 'pastel-pleated-skirt', // Exact Reference 1 Outfit!
    clothingColor: '#E8BDC4', // Exact Reference 1 Dusty Rose Skirt
    secondaryClothingColor: '#FAF8F5',
    bottomType: 'pleated-skirt',
    bottomColor: '#353A40',
    shoesType: 'leather-boots', // Exact Reference 1 Boots!
    shoesColor: '#7A4325',
    accessories: ['glasses'],
    backgroundId: 'modern-library',
    cameraPreset: 'full'
  };

  const [config, setConfig] = useState<DetailedAvatarConfig>(() => {
    if (user?.avatarConfig) {
      return {
        ...defaultConfig,
        ...user.avatarConfig,
        hasHijab: user.avatarConfig.hasHijab !== undefined ? user.avatarConfig.hasHijab : true,
        clothingType: user.avatarConfig.clothingType || 'pastel-pleated-skirt'
      };
    }
    return { ...defaultConfig, ...initialConfig };
  });

  // Undo Stack
  const historyRef = useRef<DetailedAvatarConfig[]>([]);

  const updateConfig = (newVals: Partial<DetailedAvatarConfig>) => {
    historyRef.current.push({ ...config });
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
    setConfig((prev) => ({ ...prev, ...newVals }));
  };

  const handleUndo = () => {
    if (historyRef.current.length > 0) {
      const prev = historyRef.current.pop();
      if (prev) {
        setConfig(prev);
      }
    }
  };

  const handleSave = () => {
    saveAvatarConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportImage = () => {
    try {
      const svgElement = document.querySelector('#avatar-preview-container svg');
      if (!svgElement) return;

      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);

      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1250;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw character
        ctx.drawImage(image, 0, 0, 1000, 1250);

        // Watermark badge banner at the bottom
        ctx.fillStyle = '#0A192F';
        ctx.fillRect(0, 1170, 1000, 80);

        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 24px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText('ENGLISH ZONE ACADEMY  •  LEARN. SPEAK. GROW.', 500, 1220);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `english-zone-avatar-${config.gender}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Failed to export avatar image:', err);
    }
  };

  const handleRandomize = () => {
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].value;
    const randomEye = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].value;
    const randomHair = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].value;
    const randomHijabColor = HIJAB_COLORS[Math.floor(Math.random() * HIJAB_COLORS.length)].value;
    const randomCloth = CLOTHING_COLORS[Math.floor(Math.random() * CLOTHING_COLORS.length)].value;
    const randomGender = Math.random() > 0.5 ? 'female' : 'male';
    const randomHijab = randomGender === 'female' ? Math.random() > 0.3 : false;

    const femaleOutfits = ['pastel-pleated-skirt', 'tiered-party-dress', 'royal-abaya', 'modest-blouse'];
    const maleOutfits = ['olive-bomber-jacket', 'tailored-blazer', 'oxford-shirt', 'smart-polo'];

    const randomOutfit = randomGender === 'female'
      ? femaleOutfits[Math.floor(Math.random() * femaleOutfits.length)]
      : maleOutfits[Math.floor(Math.random() * maleOutfits.length)];

    updateConfig({
      gender: randomGender,
      skinTone: randomSkin,
      eyeColor: randomEye,
      hairColor: randomHair,
      hasHijab: randomHijab,
      hijabColor: randomHijabColor,
      clothingType: randomOutfit,
      clothingColor: randomCloth
    });
  };

  const handleReset = () => {
    if (user?.avatarConfig) {
      updateConfig(user.avatarConfig as any);
    } else {
      updateConfig(defaultConfig);
    }
  };

  const toggleAccessory = (acc: string) => {
    const current = [...config.accessories];
    if (current.includes(acc)) {
      updateConfig({ accessories: current.filter((a) => a !== acc) });
    } else {
      updateConfig({ accessories: [...current, acc] });
    }
  };

  return (
    <div className="w-full">
      {/* Studio Header & Global Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A192F]/5 border border-[#D4AF37]/30 text-xs font-bold text-[#0A192F] mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Fashion Game Stylized 3D Cartoon Engine</span>
          </div>
          <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F]">
            {language === 'ar' ? 'استوديو أزياء الشخصيات الكرتونية' : 'English Zone Cartoon Fashion Studio'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            {language === 'ar'
              ? 'صمم شخصيتك الكرتونية ثلاثية الأبعاد بملامح جذابة، عيون معبرة، وتشكيلة أزياء وحجاب أنيقة مستوحاة من ألعاب الموضة العالمية.'
              : 'Create your 3D cartoon avatar with expressive anime eyes, rounded facial shapes, and modest fashion wardrobes.'}
          </p>
        </div>

        {/* Global Toolbar: Undo, Random, Reset, Save */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyRef.current.length === 0}
            title="Undo"
            className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Undo2 className="w-4 h-4 text-gray-600" />
          </button>

          <button
            type="button"
            onClick={handleRandomize}
            title="Randomize Appearance"
            className="px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Dices className="w-4 h-4 text-[#AA820A]" />
            <span className="hidden sm:inline">{language === 'ar' ? 'عشوائي' : 'Randomize'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset"
            className="px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportImage}
            title="Download Avatar Image"
            className="px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#AA820A]" />
            <span className="hidden sm:inline">{language === 'ar' ? 'تصدير صورة' : 'Export PNG'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
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
      </div>

      {/* Main Grid: Left Cartoon Avatar Preview, Right Fashion-Game Wardrobe Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: HERO CARTOON AVATAR PREVIEW (LARGE & PROMINENT) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div id="avatar-preview-container" className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#F9EFE7] to-[#ECDACD] rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl overflow-hidden flex flex-col justify-center">
            
            <StylizedCartoonAvatarCanvas
              config={config}
              cameraView={cameraView}
              angleView={angleView}
              className="w-full h-full"
              showBackground={true}
            />

            {/* Academy Official Watermark Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F]/85 backdrop-blur-sm border border-[#D4AF37]/40 shadow-md z-10 pointer-events-none">
              <EnglishZoneEmblem sizeClass="w-5 h-5" glow={false} showBevelBorder={false} />
              <span className="text-[10px] font-bold tracking-wider text-[#F3E5AB] font-serif-luxury">
                ENGLISH ZONE
              </span>
            </div>

            {/* Save Notification Overlay */}
            {saveSuccess && (
              <div className="absolute inset-0 bg-[#0A192F]/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-white z-30 transition-all p-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-[#25D366] mb-3 animate-bounce" />
                <span className="font-serif-luxury font-bold text-xl text-[#F3E5AB]">
                  {language === 'ar' ? 'تم حفظ شخصيتك الكرتونية!' : '3D Cartoon Avatar Saved!'}
                </span>
                <span className="text-xs text-gray-200 mt-1 max-w-xs">
                  {language === 'ar'
                    ? 'يتم تطبيق مظهرك الجديد تلقائياً في بوابة الطالب وكافة بطاقاتك الأكاديمية.'
                    : 'Reflected in your student portal, academic badge, and leaderboard.'}
                </span>
              </div>
            )}
          </div>

          {/* Perspective & Framing Dock (Positioned below canvas, never obscuring avatar!) */}
          <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Zoom Framing */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
                View:
              </span>
              <button
                type="button"
                onClick={() => setCameraView('face')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cameraView === 'face'
                    ? 'bg-[#0A192F] text-[#F3E5AB] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Face Close-Up
              </button>
              <button
                type="button"
                onClick={() => setCameraView('upper')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cameraView === 'upper'
                    ? 'bg-[#0A192F] text-[#F3E5AB] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Upper Body
              </button>
              <button
                type="button"
                onClick={() => setCameraView('full')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cameraView === 'full'
                    ? 'bg-[#0A192F] text-[#F3E5AB] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Full Body
              </button>
            </div>

            {/* Angle Presets (Front, 3/4 Pose, Side) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAngleView('front')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  angleView === 'front'
                    ? 'bg-[#D4AF37] text-[#0A192F] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setAngleView('three-quarter')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  angleView === 'three-quarter'
                    ? 'bg-[#D4AF37] text-[#0A192F] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                3/4 Pose
              </button>
              <button
                type="button"
                onClick={() => setAngleView('side')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  angleView === 'side'
                    ? 'bg-[#D4AF37] text-[#0A192F] shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Side
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT: GAME-STYLE WARDROBE & VISUAL THUMBNAIL PANEL */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6">
          
          {/* Fashion-Game Wardrobe Category Tabs */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
            {[
              { id: 'outfits', labelEn: 'Outfits & Dresses', labelAr: 'الأزياء والفساتين', icon: Shirt },
              { id: 'hijab', labelEn: 'Cartoon Hijabs', labelAr: 'الحجاب الكرتوني', icon: Crown },
              { id: 'hair', labelEn: 'Hairstyles', labelAr: 'تسريحات الشعر', icon: Scissors },
              { id: 'face', labelEn: 'Eyes & Face', labelAr: 'العيون والملامح', icon: User },
              { id: 'shoes', labelEn: 'Shoes & Boots', labelAr: 'الأحذية والبوت', icon: Heart },
              { id: 'accessories', labelEn: 'Accessories', labelAr: 'الإكسسوارات', icon: Sparkles },
              { id: 'background', labelEn: 'Backgrounds', labelAr: 'الخلفيات', icon: ImageIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#0A192F] text-[#F3E5AB] shadow-md scale-102'
                      : 'bg-[#FAF8F5] text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                  <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* GENDER & IDENTITY QUICK TOGGLE */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-gray-200/80">
            <span className="text-xs font-bold text-[#0A192F]">Character Archetype:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateConfig({ gender: 'female' })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  config.gender === 'female'
                    ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                👩 Female Cartoon
              </button>
              <button
                type="button"
                onClick={() => updateConfig({ gender: 'male', hasHijab: false, clothingType: 'olive-bomber-jacket' })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  config.gender === 'male'
                    ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                👨 Male Cartoon
              </button>
            </div>
          </div>

          {/* TAB 1: VISUAL OUTFITS GRID (FASHION GAME STYLE) */}
          {activeCategory === 'outfits' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-3">
                  {language === 'ar' ? 'تشكيلة الأزياء المتكاملة (انقر للارتداء الفوري):' : 'Garment Collection (Click to Wear Immediately):'}
                </label>

                {/* 2-Column Visual Thumbnail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {config.gender === 'female' ? (
                    <>
                      {/* Reference 1: Pastel Midi Skirt & Bell Top */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ clothingType: 'pastel-pleated-skirt', clothingColor: '#E8BDC4' })}
                        className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex items-center gap-3 relative ${
                          config.clothingType === 'pastel-pleated-skirt'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-xl shrink-0 border border-pink-200">
                          👗
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
                            <span>Pastel Pleated Skirt & Blouse</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-pink-200 text-pink-800 font-bold">Ref 1</span>
                          </div>
                          <div className="text-[11px] text-gray-500">Dusty rose A-line skirt with white bell sleeves</div>
                        </div>
                        {config.clothingType === 'pastel-pleated-skirt' && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>

                      {/* Reference 3: Tiered Ribbon Party Dress */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ clothingType: 'tiered-party-dress', clothingColor: '#E86E8C' })}
                        className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex items-center gap-3 relative ${
                          config.clothingType === 'tiered-party-dress'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-xl shrink-0 border border-rose-200">
                          🎀
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
                            <span>Tiered Ribbon Party Dress</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-200 text-rose-800 font-bold">Ref 3</span>
                          </div>
                          <div className="text-[11px] text-gray-500">Lace trim party dress with chest ribbon</div>
                        </div>
                        {config.clothingType === 'tiered-party-dress' && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>

                      {/* Royal Emerald & Gold Abaya */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ clothingType: 'royal-abaya', clothingColor: '#1B4D3E' })}
                        className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex items-center gap-3 relative ${
                          config.clothingType === 'royal-abaya'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0 border border-emerald-200">
                          ✨
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0A192F]">Royal Modest Abaya</div>
                          <div className="text-[11px] text-gray-500">Draped emerald robe with champagne-gold placket</div>
                        </div>
                        {config.clothingType === 'royal-abaya' && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>

                      {/* Tailored Blazer & Blouse */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ clothingType: 'modest-blouse', clothingColor: '#0A192F' })}
                        className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex items-center gap-3 relative ${
                          config.clothingType === 'modest-blouse'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0 border border-blue-200">
                          🧥
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0A192F]">Academy Blazer & Blouse</div>
                          <div className="text-[11px] text-gray-500">Tailored navy jacket with gold crest pin</div>
                        </div>
                        {config.clothingType === 'modest-blouse' && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Reference 2: Olive Street Bomber & Hoodie */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ clothingType: 'olive-bomber-jacket', clothingColor: '#5E6B4B', bottomColor: '#24282D' })}
                        className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex items-center gap-3 relative ${
                          config.clothingType === 'olive-bomber-jacket'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl shrink-0 border border-green-200">
                          🧥
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
                            <span>Olive Bomber & Hoodie</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-200 text-green-800 font-bold">Ref 2</span>
                          </div>
                          <div className="text-[11px] text-gray-500">Puffy green bomber jacket with chest graphic hoodie</div>
                        </div>
                        {config.clothingType === 'olive-bomber-jacket' && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>

                      {/* Tailored Executive Blazer */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ clothingType: 'tailored-blazer', clothingColor: '#0A192F', bottomColor: '#1A1A1A' })}
                        className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex items-center gap-3 relative ${
                          config.clothingType === 'tailored-blazer'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0 border border-blue-200">
                          👔
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0A192F]">Executive Oxford Blazer</div>
                          <div className="text-[11px] text-gray-500">Formal navy jacket with gold crest buttons</div>
                        </div>
                        {config.clothingType === 'tailored-blazer' && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>

                      {/* Crisp Button-Down Oxford */}
                      <button
                        type="button"
                        onClick={() => updateConfig({ clothingType: 'oxford-shirt', clothingColor: '#FFFFFF', bottomColor: '#2C3E50' })}
                        className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all flex items-center gap-3 relative ${
                          config.clothingType === 'oxford-shirt'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0 border border-gray-200">
                          👕
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0A192F]">Button-Down Oxford & Chinos</div>
                          <div className="text-[11px] text-gray-500">Classic collegiate shirt with tailored cuffs</div>
                        </div>
                        {config.clothingType === 'oxford-shirt' && (
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Independent Color Palette Swatches */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2.5">
                  {language === 'ar' ? 'تعديل لون القماش بشكل مستقل:' : 'Garment Colorway (Instant Swatch Selection):'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CLOTHING_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => updateConfig({ clothingColor: col.value })}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                        config.clothingColor === col.value
                          ? 'border-[#0A192F] bg-gray-50 font-bold shadow-sm ring-1 ring-[#0A192F]'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: col.value }} />
                      <span className="truncate">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARTOON HIJAB COLLECTION (EXACT REFERENCE 1 STYLING) */}
          {activeCategory === 'hijab' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif-luxury font-bold text-sm sm:text-base text-[#0A192F]">
                      {language === 'ar' ? 'الحجاب الكرتوني الأنيق (ستايل الموضة)' : 'Fashion-Game Cartoon Hijab'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {language === 'ar'
                        ? 'تصميم قماشي ناعم ثلاثي الأبعاد مع انسيابية حول الصدر وثنيات كرتونية طبيعية'
                        : 'Stylized 3D fabric hijab with smooth rounded curves, chest drape, and hair occlusion'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateConfig({ hasHijab: !config.hasHijab })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      config.hasHijab
                        ? 'bg-[#0A192F] text-[#F3E5AB]'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {config.hasHijab ? '✓ Hijab Enabled' : 'Hijab Off'}
                  </button>
                </div>

                {config.hasHijab && (
                  <div className="space-y-4 pt-2 border-t border-gray-200/60">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                        {language === 'ar' ? 'ألوان الحجاب الناعمة (مستوحاة من الصورة الأصلية):' : 'Cartoon Hijab Colorway:'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {HIJAB_COLORS.map((col) => (
                          <button
                            key={col.value}
                            type="button"
                            onClick={() => updateConfig({ hijabColor: col.value })}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all ${
                              config.hijabColor === col.value
                                ? 'border-[#0A192F] bg-white font-bold shadow-sm ring-1 ring-[#0A192F]'
                                : 'border-gray-200 bg-[#FAF8F5]'
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: col.value }} />
                            <span className="truncate">{col.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CARTOON HAIRSTYLES (REFERENCE 2 SWOOP & REFERENCE 3 BOW) */}
          {activeCategory === 'hair' && (
            <div className="space-y-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                {language === 'ar' ? 'تسريحات الشعر الكرتونية ثلاثية الأبعاد:' : '3D Cartoon Hairstyles:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.gender === 'male' ? (
                  <>
                    {/* Reference 2: Swooped Pompadour */}
                    <button
                      type="button"
                      onClick={() => updateConfig({ hairStyle: 'swooped-pompadour' })}
                      className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center gap-3 transition-all ${
                        config.hairStyle === 'swooped-pompadour'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                        💇‍♂️
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
                          <span>Swooped Anime Pompadour</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-200 text-amber-800 font-bold">Ref 2</span>
                        </div>
                        <div className="text-[11px] text-gray-500">Trendy high-volume swooped cartoon haircut</div>
                      </div>
                    </button>

                    {/* Academic Fade */}
                    <button
                      type="button"
                      onClick={() => updateConfig({ hairStyle: 'academic-fade' })}
                      className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center gap-3 transition-all ${
                        config.hairStyle === 'academic-fade'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        ✂️
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#0A192F]">Executive Side Fade</div>
                        <div className="text-[11px] text-gray-500">Clean tapered collegiate haircut</div>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Reference 3: Fluffy Curls with Giant Bow */}
                    <button
                      type="button"
                      onClick={() => updateConfig({ hairStyle: 'curly-pigtails-bow', hasHijab: false })}
                      className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center gap-3 transition-all ${
                        config.hairStyle === 'curly-pigtails-bow' && !config.hasHijab
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-xl shrink-0">
                        🎀
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
                          <span>Curled Waves & Giant Bow</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-200 text-rose-800 font-bold">Ref 3</span>
                        </div>
                        <div className="text-[11px] text-gray-500">Fluffy waves with bangs and satin hair bow</div>
                      </div>
                    </button>

                    {/* Shoulder Waves */}
                    <button
                      type="button"
                      onClick={() => updateConfig({ hairStyle: 'shoulder-waves', hasHijab: false })}
                      className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center gap-3 transition-all ${
                        config.hairStyle === 'shoulder-waves' && !config.hasHijab
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-xl shrink-0">
                        💇‍♀️
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#0A192F]">Soft Shoulder Waves</div>
                        <div className="text-[11px] text-gray-500">Natural flowing cartoon wave texture</div>
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Hair Color Palette */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                  {language === 'ar' ? 'لون الشعر:' : 'Hair Colorway:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {HAIR_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => updateConfig({ hairColor: col.value, eyebrowsColor: col.value })}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs ${
                        config.hairColor === col.value ? 'border-[#0A192F] bg-gray-50 font-bold ring-1 ring-[#0A192F]' : 'border-gray-200'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: col.value }} />
                      <span className="truncate">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CARTOON EYES & SKIN */}
          {activeCategory === 'face' && (
            <div className="space-y-6">
              {/* Natural Skin Tones */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2.5">
                  {language === 'ar' ? 'درجات لون البشرة الكرتونية الناعمة:' : 'Soft Cartoon Skin Palette:'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() => updateConfig({ skinTone: tone.value })}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                        config.skinTone === tone.value
                          ? 'border-[#0A192F] shadow-md scale-105 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full border border-black/15 shadow-inner" style={{ backgroundColor: tone.value }} />
                      <span className="text-[10px] text-gray-700 font-medium">{tone.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expressive Cartoon Eye Colors */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2.5">
                  {language === 'ar' ? 'ألوان العيون الكرتونية المعبرة (مع انعكاسات البريق):' : 'Expressive Cartoon Eye Colors (Specular Highlights):'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {EYE_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => updateConfig({ eyeColor: col.value })}
                      className={`p-2.5 rounded-xl border-2 flex items-center gap-2.5 transition-all ${
                        config.eyeColor === col.value
                          ? 'border-[#0A192F] bg-gray-50 font-bold shadow-sm ring-1 ring-[#0A192F]'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-black/15 shadow-inner flex items-center justify-center" style={{ backgroundColor: col.value }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      </div>
                      <span className="text-xs text-gray-800">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Appearance */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                  {language === 'ar' ? 'النسب العمرية للشخصية:' : 'Character Proportions & Age Appearance:'}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['child', 'teen', 'adult'] as const).map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => updateConfig({ characterType: age })}
                      className={`p-2.5 rounded-xl border-2 text-xs font-bold capitalize transition-all ${
                        config.characterType === age
                          ? 'border-[#0A192F] bg-gray-50 text-[#0A192F]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {age === 'child' ? 'Chibi Young Scholar' : age === 'teen' ? 'Fashion Teen' : 'Adult Scholar'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SHOES & BOOTS (REFERENCE 1 BOOTS & REFERENCE 2 SNEAKERS) */}
          {activeCategory === 'shoes' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                {language === 'ar' ? 'الأحذية والبوت ثلاثية الأبعاد:' : 'Footwear Collection:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Reference 1 Leather Boots */}
                <button
                  type="button"
                  onClick={() => updateConfig({ shoesType: 'leather-boots', shoesColor: '#7A4325' })}
                  className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center gap-3 transition-all ${
                    config.shoesType === 'leather-boots'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                    👢
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
                      <span>Laced Leather Ankle Boots</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-200 text-amber-800 font-bold">Ref 1</span>
                    </div>
                    <div className="text-[11px] text-gray-500">Brown leather boots with cartoon laces and thick soles</div>
                  </div>
                </button>

                {/* Reference 2 Street Sneakers */}
                <button
                  type="button"
                  onClick={() => updateConfig({ shoesType: 'street-sneakers' })}
                  className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center gap-3 transition-all ${
                    config.shoesType === 'street-sneakers'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0">
                    👟
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
                      <span>Two-Tone Street Sneakers</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-200 text-blue-800 font-bold">Ref 2</span>
                    </div>
                    <div className="text-[11px] text-gray-500">High-top black and white retro street sneakers</div>
                  </div>
                </button>

                {/* Reference 3 Mary Jane Flats */}
                <button
                  type="button"
                  onClick={() => updateConfig({ shoesType: 'mary-jane-flats' })}
                  className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center gap-3 transition-all ${
                    config.shoesType === 'mary-jane-flats'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/30'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl shrink-0">
                    🥿
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0A192F] flex items-center gap-1.5">
                      <span>Glossy Mary Jane Shoes</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-pink-200 text-pink-800 font-bold">Ref 3</span>
                    </div>
                    <div className="text-[11px] text-gray-500">Cute pink ribbon flats</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: ACCESSORIES */}
          {activeCategory === 'accessories' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                {language === 'ar' ? 'الإكسسوارات الأكاديمية:' : 'Cartoon Accessories & Insignia:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toggleAccessory('glasses')}
                  className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center justify-between transition-all ${
                    config.accessories.includes('glasses')
                      ? 'border-[#0A192F] bg-gray-50 shadow-sm'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0A192F]">Gold Scholar Wireframe Glasses</div>
                    <div className="text-[11px] text-gray-500">Cute rounded cartoon glasses</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    config.accessories.includes('glasses') ? 'border-[#0A192F] bg-[#0A192F] text-white' : 'border-gray-300'
                  }`}>
                    {config.accessories.includes('glasses') && '✓'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleAccessory('star-brooch')}
                  className={`p-4 rounded-2xl border-2 text-left rtl:text-right flex items-center justify-between transition-all ${
                    config.accessories.includes('star-brooch')
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-sm'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0A192F]">English Zone Star Brooch</div>
                    <div className="text-[11px] text-gray-500">Official golden star badge on chest</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    config.accessories.includes('star-brooch') ? 'border-[#AA820A] bg-[#D4AF37] text-[#0A192F]' : 'border-gray-300'
                  }`}>
                    {config.accessories.includes('star-brooch') && '✓'}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: BACKGROUNDS */}
          {activeCategory === 'background' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                {language === 'ar' ? 'أجواء الاستوديو الكرتونية:' : 'Cartoon Studio Environment Atmosphere:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'modern-library', name: 'Warm Peach Studio (Ref 1)' },
                  { id: 'nature-garden', name: 'Pastel Blue Studio (Ref 2)' },
                  { id: 'golden-stars', name: 'Starlight Dream (Ref 3)' },
                  { id: 'academic-hall', name: 'English Zone Navy Grand Hall' }
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => updateConfig({ backgroundId: bg.id as any })}
                    className={`p-3.5 rounded-2xl border-2 text-left rtl:text-right transition-all flex items-center justify-between ${
                      config.backgroundId === bg.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 font-bold text-[#0A192F]'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-xs font-semibold">{bg.name}</span>
                    {config.backgroundId === bg.id && <Check className="w-4 h-4 text-[#AA820A]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
