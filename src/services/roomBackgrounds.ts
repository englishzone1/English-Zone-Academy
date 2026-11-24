// خلفيات الغرف الصوتية: ألوان متدرجة ونقوش (ورود، نجوم، قلوب) أو صورة من الجهاز
// كل شخص يختار خلفيته (تُحفظ في جهازه)، وصاحبة الغرفة تختار خلفية افتراضية للجميع.

const svg = (body: string, size = 120) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${body}</svg>`)}")`;

const flower = (x: number, y: number, r: number, petal: string, center: string, op = 1) => {
  let p = '';
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    p += `<circle cx='${(x + Math.cos(a) * r).toFixed(1)}' cy='${(y + Math.sin(a) * r).toFixed(1)}' r='${(r * 0.9).toFixed(1)}' fill='${petal}' opacity='${op}'/>`;
  }
  return p + `<circle cx='${x}' cy='${y}' r='${(r * 0.6).toFixed(1)}' fill='${center}' opacity='${op}'/>`;
};
const leaf = (x: number, y: number, rot: number, color: string, op = 0.5) =>
  `<ellipse cx='${x}' cy='${y}' rx='9' ry='4' fill='${color}' opacity='${op}' transform='rotate(${rot} ${x} ${y})'/>`;
const heart = (x: number, y: number, s: number, color: string, op = 0.35) =>
  `<path d='M${x} ${y + s * 0.3} C${x} ${y - s * 0.3} ${x - s} ${y - s * 0.3} ${x - s} ${y + s * 0.2} C${x - s} ${y + s * 0.7} ${x} ${y + s} ${x} ${y + s * 1.2} C${x} ${y + s} ${x + s} ${y + s * 0.7} ${x + s} ${y + s * 0.2} C${x + s} ${y - s * 0.3} ${x} ${y - s * 0.3} ${x} ${y + s * 0.3}Z' fill='${color}' opacity='${op}'/>`;
const star = (x: number, y: number, r: number, op: number) => `<circle cx='${x}' cy='${y}' r='${r}' fill='#fff' opacity='${op}'/>`;

const PINK_FLOWERS = svg(
  flower(25, 25, 7, '#F9A8D4', '#FDE68A', 0.55) +
    flower(85, 70, 9, '#FBCFE8', '#FCD34D', 0.45) +
    flower(40, 100, 5, '#F472B6', '#FEF3C7', 0.5) +
    leaf(45, 30, 30, '#86EFAC') +
    leaf(70, 85, -40, '#86EFAC') +
    leaf(100, 25, 70, '#BBF7D0', 0.35)
);
const NIGHT_FLOWERS = svg(
  flower(30, 30, 6, '#F3E5AB', '#D4AF37', 0.28) +
    flower(90, 80, 8, '#FBCFE8', '#F3E5AB', 0.22) +
    flower(35, 100, 4, '#F3E5AB', '#D4AF37', 0.25) +
    leaf(52, 40, 25, '#D4AF37', 0.25) +
    leaf(75, 95, -35, '#D4AF37', 0.22)
);
const SPRING = svg(
  flower(20, 30, 6, '#FFFFFF', '#FDE047', 0.55) +
    flower(80, 20, 5, '#FDE68A', '#FB923C', 0.5) +
    flower(60, 85, 8, '#FFFFFF', '#FDE047', 0.45) +
    flower(105, 105, 4, '#FBCFE8', '#FDE047', 0.5) +
    leaf(35, 55, 40, '#BBF7D0', 0.45) +
    leaf(90, 60, -30, '#BBF7D0', 0.4)
);
const STARS = svg(
  star(10, 15, 1.2, 0.8) + star(60, 30, 0.8, 0.6) + star(100, 10, 1.5, 0.7) + star(30, 70, 1, 0.5) + star(85, 85, 1.2, 0.8) + star(15, 110, 0.8, 0.6) + star(70, 115, 1, 0.4) + star(110, 55, 0.7, 0.6)
);
const HEARTS = svg(heart(25, 20, 8, '#F9A8D4') + heart(85, 60, 11, '#FBCFE8', 0.25) + heart(35, 90, 6, '#F472B6', 0.3));

export interface RoomBg {
  id: string;
  ar: string;
  en: string;
  css: string; // قيمة CSS background
}

export const ROOM_BGS: RoomBg[] = [
  { id: 'night', ar: 'ليلي', en: 'Night', css: 'linear-gradient(to bottom, #0A192F, #0B1424 45%, #05080F)' },
  { id: 'night-flowers', ar: 'ورود ذهبية', en: 'Golden flowers', css: `${NIGHT_FLOWERS}, linear-gradient(to bottom, #0A192F, #05080F)` },
  { id: 'rose-flowers', ar: 'ورود وردية', en: 'Pink flowers', css: `${PINK_FLOWERS}, linear-gradient(160deg, #831843, #9D174D 45%, #3B0764)` },
  { id: 'spring', ar: 'ربيع', en: 'Spring', css: `${SPRING}, linear-gradient(160deg, #065F46, #047857 45%, #064E3B)` },
  { id: 'stars', ar: 'نجوم', en: 'Stars', css: `${STARS}, linear-gradient(to bottom, #1E1B4B, #0F172A 60%, #020617)` },
  { id: 'hearts', ar: 'قلوب', en: 'Hearts', css: `${HEARTS}, linear-gradient(160deg, #4C1D95, #6D28D9 45%, #2E1065)` },
  { id: 'royal', ar: 'بنفسجي', en: 'Purple', css: 'linear-gradient(160deg, #2E1065, #4C1D95 50%, #1E1B4B)' },
  { id: 'rose', ar: 'وردي', en: 'Rose', css: 'linear-gradient(160deg, #831843, #BE185D 45%, #4A044E)' },
  { id: 'ocean', ar: 'بحري', en: 'Ocean', css: 'linear-gradient(160deg, #0C4A6E, #0E7490 50%, #082F49)' },
  { id: 'forest', ar: 'أخضر', en: 'Forest', css: 'linear-gradient(160deg, #064E3B, #047857 50%, #022C22)' },
  { id: 'sunset', ar: 'غروب', en: 'Sunset', css: 'linear-gradient(160deg, #7C2D12, #C2410C 40%, #4A044E)' },
  { id: 'coffee', ar: 'قهوة', en: 'Coffee', css: 'linear-gradient(160deg, #422006, #78350F 50%, #1C1917)' },
];

export const bgById = (id?: string | null) => ROOM_BGS.find((b) => b.id === id) || null;

const KEY = 'ez-room-bg';
const KEY_IMG = 'ez-room-bg-img';

export function getMyBg(): { id: string; img: string } | null {
  try {
    const id = localStorage.getItem(KEY);
    if (!id) return null;
    return { id, img: id === 'custom' ? localStorage.getItem(KEY_IMG) || '' : '' };
  } catch {
    return null;
  }
}

export function setMyBg(id: string | null, img?: string) {
  try {
    if (!id) {
      localStorage.removeItem(KEY);
      localStorage.removeItem(KEY_IMG);
      return true;
    }
    if (id === 'custom' && img) localStorage.setItem(KEY_IMG, img);
    localStorage.setItem(KEY, id);
    return true;
  } catch {
    return false;
  }
}

/** يصغّر الصورة المختارة (حتى 1080px) ويحوّلها إلى JPEG خفيف للحفظ في الجهاز */
export function shrinkImage(file: File, max = 1080): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image'));
    };
    img.src = url;
  });
}
