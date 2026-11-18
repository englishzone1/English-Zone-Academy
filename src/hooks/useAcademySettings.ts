import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// روابط التواصل ورابط اختبار المستوى كما حفظتها في لوحة الإدارة (academy_settings/main)
// لا توجد قيم ثابتة: الحقل الفارغ يعني أن العنصر لا يظهر في الموقع
export interface PublicAcademySettings {
  whatsapp: string;
  email: string;
  youtube: string;
  instagram: string;
  discord: string;
  facebook: string;
  telegram: string;
  placementTestUrl: string;
  tawkUrl: string;
  homeworkUrl: string;
  // عملة الأسعار التي تظهر في الموقع (USD، SAR، EGP، TRY... أو رمز تكتبه الإدارة)
  currency: string;
}

const EMPTY: PublicAcademySettings = {
  whatsapp: '',
  email: '',
  youtube: '',
  instagram: '',
  discord: '',
  facebook: '',
  telegram: '',
  placementTestUrl: '',
  tawkUrl: '',
  homeworkUrl: '',
  currency: 'USD'
};

// قيمة صالحة فقط: نص غير فارغ وليس "#"
const clean = (v: any): string => {
  const s = typeof v === 'string' ? v.trim() : '';
  return s === '#' ? '' : s;
};

// قراءة واحدة تتشاركها كل الصفحات
let cached: Promise<PublicAcademySettings> | null = null;

const loadSettings = (): Promise<PublicAcademySettings> => {
  if (!cached) {
    cached = getDoc(doc(db, 'academy_settings', 'main'))
      .then((snap) => {
        if (!snap.exists()) return EMPTY;
        const d = snap.data() as any;
        return {
          whatsapp: clean(d.whatsapp),
          email: clean(d.email),
          youtube: clean(d.youtube),
          instagram: clean(d.instagram),
          discord: clean(d.discord),
          facebook: clean(d.facebook),
          telegram: clean(d.telegram),
          placementTestUrl: clean(d.placementTestUrl),
          tawkUrl: clean(d.tawkUrl),
          homeworkUrl: clean(d.homeworkUrl),
          currency: clean(d.currency) || 'USD'
        };
      })
      .catch((err) => {
        console.error('Error reading academy settings:', err);
        cached = null;
        return EMPTY;
      });
  }
  return cached;
};

export const useAcademySettings = (): PublicAcademySettings => {
  const [settings, setSettings] = useState<PublicAcademySettings>(EMPTY);
  useEffect(() => {
    let alive = true;
    loadSettings().then((s) => {
      if (alive) setSettings(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  return settings;
};

// رابط واتساب مع رسالة جاهزة
export const whatsappWithText = (link: string, text: string): string =>
  link ? `${link}${link.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}` : '';

// رقم واتساب للعرض من رابط مثل https://wa.me/84326853884
export const whatsappDisplay = (link: string): string => {
  const m = link.match(/(\d{6,})/);
  return m ? `+${m[1]}` : link;
};

// اسم الحساب للعرض من رابط مثل https://www.instagram.com/name?x=1 أو youtube.com/@name
export const handleFromUrl = (link: string): string => {
  try {
    const u = new URL(link);
    const first = u.pathname.split('/').filter(Boolean)[0] || u.hostname;
    return first.startsWith('@') ? first : `@${first}`;
  } catch {
    return link;
  }
};

// العملات الشائعة: الرمز الذي يظهر بجانب السعر
export const CURRENCIES: { code: string; ar: string; en: string; symbol: string; prefix?: boolean }[] = [
  { code: 'USD', ar: 'دولار أمريكي', en: 'US Dollar', symbol: '$', prefix: true },
  { code: 'SAR', ar: 'ريال سعودي', en: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'AED', ar: 'درهم إماراتي', en: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'KWD', ar: 'دينار كويتي', en: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'QAR', ar: 'ريال قطري', en: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'BHD', ar: 'دينار بحريني', en: 'Bahraini Dinar', symbol: 'د.ب' },
  { code: 'OMR', ar: 'ريال عماني', en: 'Omani Rial', symbol: 'ر.ع' },
  { code: 'JOD', ar: 'دينار أردني', en: 'Jordanian Dinar', symbol: 'د.أ' },
  { code: 'EGP', ar: 'جنيه مصري', en: 'Egyptian Pound', symbol: 'ج.م' },
  { code: 'TRY', ar: 'ليرة تركية', en: 'Turkish Lira', symbol: '₺', prefix: true },
  { code: 'EUR', ar: 'يورو', en: 'Euro', symbol: '€', prefix: true },
  { code: 'GBP', ar: 'جنيه إسترليني', en: 'British Pound', symbol: '£', prefix: true }
];

// عرض المبلغ بعملته: $80 أو 300 ر.س؛ أي رمز آخر يُكتب بعد الرقم كما هو
export const formatMoney = (amount: number | string, currency?: string): string => {
  const code = String(currency || 'USD').trim();
  const c = CURRENCIES.find((x) => x.code === code.toUpperCase());
  if (!c) return `${amount} ${code}`;
  return c.prefix ? `${c.symbol}${amount}` : `${amount} ${c.symbol}`;
};
