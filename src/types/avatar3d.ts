export interface DetailedAvatarConfig {
  gender: 'female' | 'male';
  characterType: 'child' | 'teen' | 'adult';
  // Head & Face
  skinTone: string;
  faceShape: 'oval' | 'round' | 'heart' | 'square' | string;
  eyeColor: string;
  eyesStyle: 'almond' | 'wide' | 'classic' | string;
  eyebrowsStyle: 'natural' | 'arched' | 'soft' | string;
  eyebrowsColor: string;
  noseStyle: 'straight' | 'subtle' | 'defined' | string;
  lipColor: string;
  blushTone: string;
  
  // Hair & Modest Headwear
  hasHijab: boolean;
  hijabStyle: 'cartoon-soft-wrap' | 'flowing-shawl' | 'turkish-clean' | 'chic-turban' | 'modern-wrap' | string;
  hijabColor: string;
  hijabTrimColor?: string;
  hairStyle: 'swooped-pompadour' | 'curly-pigtails-bow' | 'shoulder-waves' | 'bob-with-bangs' | 'shoulder-length' | 'long-waves' | 'bob-cut' | 'curls' | 'short-tapered' | 'academic-fade' | string;
  hairColor: string;

  // Wardrobe - Tops, Bottoms & Full Outfits
  clothingType: 
    | 'pastel-pleated-skirt'
    | 'olive-bomber-jacket'
    | 'tiered-party-dress'
    | 'royal-abaya'
    | 'modest-blouse' 
    | 'tailored-blazer' 
    | 'cardigan-ensemble' 
    | 'oxford-shirt' 
    | 'academic-robe' 
    | 'smart-polo'
    | string;
  clothingColor: string;
  secondaryClothingColor: string;
  bottomType: 'wide-trousers' | 'pleated-skirt' | 'jogger-pants' | 'formal-slacks' | 'maxi-skirt' | string;
  bottomColor: string;
  shoesType: 'leather-boots' | 'street-sneakers' | 'mary-jane-flats' | 'formal-oxfords' | 'modest-flats' | 'classic-loafers' | 'clean-sneakers' | string;
  shoesColor: string;

  // Accessories & Academic Achievements
  accessories: string[]; // 'glasses', 'gold-rim-glasses', 'star-brooch', 'smart-watch', 'silk-scarf-pin'
  backgroundId: 'modern-library' | 'study-room' | 'academic-hall' | 'nature-garden' | 'golden-stars' | 'royal-penthouse' | string;
  
  // Camera & Lighting environment preset
  cameraPreset?: 'face' | 'upper' | 'full';
  rotationY?: number;
}

export interface CosmeticItem {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'hijab' | 'outfit' | 'accessories' | 'background';
  previewColor?: string;
  badgeRequired?: string;
  isUnlockedDefault: boolean;
  descriptionEn: string;
  descriptionAr: string;
}

export const COSMETIC_UNLOCKS: CosmeticItem[] = [
  {
    id: 'royal-abaya',
    nameEn: 'Emerald Imperial Abaya',
    nameAr: 'عباءة إمبراطورية زمردية',
    category: 'outfit',
    previewColor: '#164E43',
    badgeRequired: 'Star of the Month',
    isUnlockedDefault: true,
    descriptionEn: 'Awarded to top scholars for academic dedication.',
    descriptionAr: 'تُمنح للطلاب المتفوقين تقديراً للتميز الأكاديمي.'
  },
  {
    id: 'golden-stars',
    nameEn: 'Grand Honors Hall',
    nameAr: 'صالة الشرف الكبرى',
    category: 'background',
    previewColor: '#D4AF37',
    badgeRequired: 'English Zone Honors',
    isUnlockedDefault: true,
    descriptionEn: 'Elite background environment for top achievers.',
    descriptionAr: 'بيئة خلفية فاخرة مخصصة لنجوم الأكاديمية.'
  },
  {
    id: 'gold-rim-glasses',
    nameEn: 'Gold Rim Scholar Specs',
    nameAr: 'نظارات الباحث الذهبية',
    category: 'accessories',
    previewColor: '#D4AF37',
    badgeRequired: '100% Attendance',
    isUnlockedDefault: true,
    descriptionEn: 'Refined eyewear signifying scholarly focus.',
    descriptionAr: 'إطارات ذهبية تعكس الجدية والتركيز الدراسي.'
  },
  {
    id: 'flowing-shawl',
    nameEn: 'Silk Cascade Shawl',
    nameAr: 'شال حريري انسيابي',
    category: 'hijab',
    previewColor: '#C5A059',
    badgeRequired: 'Weekly Excellence',
    isUnlockedDefault: true,
    descriptionEn: 'Draped luxury satin hijab style with gold clasp.',
    descriptionAr: 'طراز حجاب ساتان فاخر مع مشبك ذهبي أنيق.'
  }
];
