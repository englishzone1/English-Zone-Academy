// أفاتار English Zone: نموذج واحد للذكور والإناث، بملابس محتشمة وعصرية

export type Gender = 'male' | 'female';

export interface EZAvatarConfig {
  v: 2;
  gender: Gender;
  skin: string;
  eyes: 'round' | 'happy' | 'almond';
  eyeColor: string;
  mouth: 'smile' | 'grin' | 'soft';
  hairStyle: string;
  hairColor: string;
  hijab: 'none' | 'classic' | 'wrap' | 'sport';
  hijabColor: string;
  outfit: string;
  outfitColor: string;
  accentColor: string;
  glasses: 'none' | 'round' | 'square';
  cap: boolean;
  bg: string;
  photo?: string; // صورة شخصية مضغوطة (data URL)
  mode?: 'cartoon' | 'photo';
}

export const SKINS = ['#F9DCC8', '#F1C6A3', '#E2AC7E', '#C98E5E', '#A26B42', '#6E4428'];
export const EYE_COLORS = ['#3B2A20', '#5A3A1E', '#2F5D46', '#2C4C7A', '#4A4A4A'];
export const HAIR_COLORS = ['#1F1A17', '#3E2A1E', '#6B4226', '#A8743E', '#D9B26A', '#7A2E1F'];
export const FABRIC_COLORS = [
  '#0A192F', '#1E3A5F', '#3B6EA8', '#7FA7C9', '#2F5D50', '#6E8B5A', '#B8C4A0',
  '#C9A227', '#E8D3A2', '#F4EDE2', '#FFFFFF', '#D8A7A7', '#B76E79', '#7B2D3B',
  '#5B3A6E', '#9C8AB4', '#8B5E3C', '#3A3A3A'
];
export const BACKGROUNDS = ['#F3E9DC', '#E6EEF5', '#EAF2E6', '#F6E3E3', '#ECE6F3', '#FFF4D6', '#0A192F'];

export const MALE_HAIR = [
  { id: 'short', ar: 'قصير', en: 'Short' },
  { id: 'side', ar: 'مفروق', en: 'Side part' },
  { id: 'curly', ar: 'مجعد', en: 'Curly' },
  { id: 'quiff', ar: 'مرفوع', en: 'Quiff' },
  { id: 'buzz', ar: 'قصير جدًا', en: 'Buzz' }
];

export const FEMALE_HAIR = [
  { id: 'long', ar: 'طويل', en: 'Long' },
  { id: 'bun', ar: 'كعكة', en: 'Bun' },
  { id: 'ponytail', ar: 'ذيل حصان', en: 'Ponytail' },
  { id: 'bob', ar: 'قصير', en: 'Bob' }
];

export const HIJABS = [
  { id: 'classic', ar: 'حجاب كلاسيكي', en: 'Classic' },
  { id: 'wrap', ar: 'حجاب لفّة', en: 'Wrap' },
  { id: 'sport', ar: 'حجاب رياضي', en: 'Sport' },
  { id: 'none', ar: 'بدون حجاب', en: 'No hijab' }
] as const;

export interface OutfitDef {
  id: string;
  ar: string;
  en: string;
  occasion?: boolean;
}

export const MALE_OUTFITS: OutfitDef[] = [
  { id: 'tee', ar: 'تيشيرت وجينز', en: 'T-shirt & jeans' },
  { id: 'hoodie', ar: 'هودي', en: 'Hoodie' },
  { id: 'shirt', ar: 'قميص وبنطال', en: 'Shirt & trousers' },
  { id: 'jacket', ar: 'جاكيت', en: 'Jacket' },
  { id: 'thobe', ar: 'ثوب', en: 'Thobe', occasion: true },
  { id: 'suit', ar: 'بدلة رسمية', en: 'Suit', occasion: true }
];

export const FEMALE_OUTFITS: OutfitDef[] = [
  { id: 'blouse', ar: 'بلوزة وتنورة طويلة', en: 'Blouse & maxi skirt' },
  { id: 'tunic', ar: 'تونيك وبنطال واسع', en: 'Tunic & wide pants' },
  { id: 'cardigan', ar: 'كارديغان وتنورة', en: 'Cardigan & skirt' },
  { id: 'abaya', ar: 'عباية', en: 'Abaya' },
  { id: 'dress', ar: 'فستان طويل', en: 'Long dress' },
  { id: 'gown', ar: 'فستان مناسبات', en: 'Occasion gown', occasion: true },
  { id: 'kaftan', ar: 'قفطان مطرّز', en: 'Embroidered kaftan', occasion: true }
];

export const defaultAvatar = (gender: Gender = 'female'): EZAvatarConfig => ({
  v: 2,
  gender,
  skin: SKINS[2],
  eyes: 'round',
  eyeColor: EYE_COLORS[0],
  mouth: 'smile',
  hairStyle: gender === 'male' ? 'short' : 'long',
  hairColor: HAIR_COLORS[1],
  hijab: gender === 'female' ? 'classic' : 'none',
  hijabColor: '#E8D3A2',
  outfit: gender === 'male' ? 'shirt' : 'blouse',
  outfitColor: gender === 'male' ? '#1E3A5F' : '#D8A7A7',
  accentColor: gender === 'male' ? '#E8D3A2' : '#F4EDE2',
  glasses: 'none',
  cap: false,
  bg: BACKGROUNDS[0]
});

// يحوّل الأفاتار القديم (أو غير الموجود) إلى النموذج الجديد
export const toEZAvatar = (raw: any): EZAvatarConfig => {
  if (raw && raw.v === 2) return { ...defaultAvatar(raw.gender), ...raw };
  const gender: Gender = raw?.gender === 'male' ? 'male' : 'female';
  const base = defaultAvatar(gender);
  if (!raw) return base;
  return {
    ...base,
    hijab: gender === 'female' ? (raw.hasHijab === false ? 'none' : 'classic') : 'none',
    hijabColor: typeof raw.hijabColor === 'string' ? raw.hijabColor : base.hijabColor,
    hairColor: typeof raw.hairColor === 'string' ? raw.hairColor : base.hairColor
  };
};

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const randomAvatar = (gender: Gender): EZAvatarConfig => {
  const female = gender === 'female';
  return {
    v: 2,
    gender,
    skin: pick(SKINS),
    eyes: pick(['round', 'happy', 'almond'] as const),
    eyeColor: pick(EYE_COLORS),
    mouth: pick(['smile', 'grin', 'soft'] as const),
    hairStyle: pick(female ? FEMALE_HAIR : MALE_HAIR).id,
    hairColor: pick(HAIR_COLORS),
    hijab: female ? pick(['classic', 'wrap', 'sport'] as const) : 'none',
    hijabColor: pick(FABRIC_COLORS),
    outfit: pick(female ? FEMALE_OUTFITS : MALE_OUTFITS).id,
    outfitColor: pick(FABRIC_COLORS),
    accentColor: pick(FABRIC_COLORS),
    glasses: pick(['none', 'none', 'round', 'square'] as const),
    cap: !female && Math.random() < 0.2,
    bg: pick(BACKGROUNDS)
  };
};

// تفتيح أو تغميق لون (amt بين -1 و 1)
export const shade = (hex: string, amt: number): string => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
