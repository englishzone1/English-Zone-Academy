import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { drawQR } from './qr';

/* ------------------------------------------------------------------ */
/*  الورش المجانية: صفحة تسجيل عامة + شهادة فورية برقم تسلسلي و QR      */
/*  workshops/{id}            إعدادات الورشة وقالب الشهادة (قراءة عامة)  */
/*  workshop_regs/{serial}    التسجيل والتقييم (الإدارة فقط تقرأ)        */
/*  certificates/{serial}     بيانات التحقق العامة (الاسم والورشة والتاريخ) */
/* ------------------------------------------------------------------ */

export interface TextSpot {
  x: number; // مركز النص أفقيًا ٪ من العرض
  y: number; // ٪ من الارتفاع
  size: number; // حجم الخط ٪ من العرض
  color: string;
  font: 'Tajawal' | 'Cinzel' | 'Plus Jakarta Sans';
  show: boolean;
}

export interface CertLayout {
  name: TextSpot;
  date: TextSpot;
  serial: TextSpot;
  qr: { x: number; y: number; size: number; show: boolean }; // x,y = الزاوية العليا ٪، size = ٪ من العرض
}

export interface Workshop {
  id: string;
  title: string;
  description?: string;
  workshopDate?: string;
  active: boolean;
  template?: string; // صورة قالب الشهادة (data URL)
  layout: CertLayout;
  createdAt: string;
}

export interface WorkshopReg {
  serial: string;
  workshopId: string;
  workshopTitle: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  rating: number;
  benefit: number;
  feedback: string;
  createdAt: string;
}

export interface CertificateRecord {
  serial: string;
  workshopId: string;
  workshopTitle: string;
  name: string;
  issuedAt: string; // YYYY-MM-DD
}

export const DEFAULT_LAYOUT: CertLayout = {
  name: { x: 50, y: 48, size: 4.2, color: '#0A192F', font: 'Tajawal', show: true },
  date: { x: 25, y: 82, size: 1.6, color: '#0A192F', font: 'Tajawal', show: true },
  serial: { x: 75, y: 82, size: 1.4, color: '#0A192F', font: 'Plus Jakarta Sans', show: true },
  qr: { x: 86, y: 70, size: 11, show: true }
};

const rid = (n: number) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const a = new Uint32Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, (v) => chars[v % chars.length]).join('');
};

export const newSerial = () => `EZ-${new Date().getFullYear()}-${rid(6)}`;
const newWorkshopId = () => `WS-${rid(8)}`;

export const verifyUrl = (serial: string) => `${window.location.origin}/#/verify/${serial}`;
export const workshopUrl = (id: string) => `${window.location.origin}/#/workshop/${id}`;

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatCertDate = (iso: string, lang: 'ar' | 'en' = 'en') => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return lang === 'ar'
    ? date.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
    : date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const workshopService = {
  async list(): Promise<Workshop[]> {
    const snap = await getDocs(collection(db, 'workshops'));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as Workshop))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  },

  async get(id: string): Promise<Workshop | null> {
    const snap = await getDoc(doc(db, 'workshops', id));
    return snap.exists() ? ({ ...(snap.data() as any), id: snap.id } as Workshop) : null;
  },

  async save(w: Partial<Workshop> & { title: string }): Promise<string> {
    const id = w.id || newWorkshopId();
    const data: any = {
      id,
      title: w.title.trim().slice(0, 150),
      description: (w.description || '').trim().slice(0, 1500),
      workshopDate: w.workshopDate || '',
      active: w.active !== false,
      layout: w.layout || DEFAULT_LAYOUT,
      createdAt: w.createdAt || new Date().toISOString()
    };
    if (w.template !== undefined) data.template = w.template;
    await setDoc(doc(db, 'workshops', id), data, { merge: true });
    return id;
  },

  async setActive(id: string, active: boolean) {
    await updateDoc(doc(db, 'workshops', id), { active });
  },

  async remove(id: string) {
    await deleteDoc(doc(db, 'workshops', id));
  },

  async registrations(): Promise<WorkshopReg[]> {
    const snap = await getDocs(collection(db, 'workshop_regs'));
    return snap.docs
      .map((d) => d.data() as WorkshopReg)
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  },

  async deleteRegistration(serial: string) {
    await deleteDoc(doc(db, 'workshop_regs', serial)).catch(() => undefined);
    await deleteDoc(doc(db, 'certificates', serial)).catch(() => undefined);
  },

  // تسجيل عام (بلا حساب): يحفظ التقييم ويصدر الشهادة
  async register(w: Workshop, p: { name: string; email: string; phone?: string; country?: string; rating: number; benefit: number; feedback: string }): Promise<CertificateRecord> {
    const serial = newSerial();
    const issuedAt = todayIso();
    const reg: WorkshopReg = {
      serial,
      workshopId: w.id,
      workshopTitle: w.title,
      name: p.name.trim().slice(0, 80),
      email: p.email.trim().slice(0, 150),
      phone: (p.phone || '').trim().slice(0, 30),
      country: (p.country || '').trim().slice(0, 60),
      rating: Math.min(5, Math.max(1, Math.round(p.rating))),
      benefit: Math.min(10, Math.max(1, Math.round(p.benefit))),
      feedback: p.feedback.trim().slice(0, 2000),
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'workshop_regs', serial), reg);
    const cert: CertificateRecord = { serial, workshopId: w.id, workshopTitle: w.title, name: reg.name, issuedAt };
    await setDoc(doc(db, 'certificates', serial), cert);
    return cert;
  },

  async getCertificate(serial: string): Promise<CertificateRecord | null> {
    const snap = await getDoc(doc(db, 'certificates', serial));
    return snap.exists() ? (snap.data() as CertificateRecord) : null;
  }
};

/* ------------------------------ Certificate rendering ------------------------------ */

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('template-load-failed'));
    img.src = src;
  });

const fontStack = (f: string) => (f === 'Cinzel' ? `'Cinzel', serif` : f === 'Plus Jakarta Sans' ? `'Plus Jakarta Sans', Arial, sans-serif` : `'Tajawal', Tahoma, Arial, sans-serif`);

// يرسم الشهادة: القالب + الاسم + التاريخ + الرقم التسلسلي + QR يقود لصفحة التحقق
export const renderCertificate = async (
  canvas: HTMLCanvasElement,
  template: string,
  layout: CertLayout,
  data: { name: string; issuedAt: string; serial: string; dateLang?: 'ar' | 'en' }
) => {
  const img = await loadImage(template);
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.drawImage(img, 0, 0, W, H);

  const fonts = new Set([layout.name.font, layout.date.font, layout.serial.font]);
  try {
    await Promise.all(Array.from(fonts).map((f) => (document as any).fonts?.load(`700 40px '${f}'`)));
  } catch {
    /* الخط الاحتياطي */
  }

  const text = (spot: TextSpot, value: string, weight = 700) => {
    if (!spot.show || !value) return;
    let px = Math.max(8, (spot.size / 100) * W);
    ctx.font = `${weight} ${px}px ${fontStack(spot.font)}`;
    // تصغير الاسم الطويل حتى لا يخرج عن الشهادة
    const maxW = W * 0.8;
    while (ctx.measureText(value).width > maxW && px > 10) {
      px -= 2;
      ctx.font = `${weight} ${px}px ${fontStack(spot.font)}`;
    }
    ctx.fillStyle = spot.color || '#0A192F';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = /[؀-ۿ]/.test(value) ? 'rtl' : 'ltr';
    ctx.fillText(value, (spot.x / 100) * W, (spot.y / 100) * H);
  };

  text(layout.name, data.name);
  text(layout.date, formatCertDate(data.issuedAt, data.dateLang || 'en'), 600);
  text(layout.serial, data.serial, 600);
  if (layout.qr.show) {
    const s = (layout.qr.size / 100) * W;
    drawQR(ctx, verifyUrl(data.serial), (layout.qr.x / 100) * W, (layout.qr.y / 100) * H, s);
  }
};

// ضغط صورة القالب لتناسب مستند Firestore (أقل من ~900 ألف حرف)
export const compressTemplate = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = Math.min(2400, img.naturalWidth);
      for (let attempt = 0; attempt < 8; attempt++) {
        const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        for (const q of [0.9, 0.82, 0.74, 0.66]) {
          const d = c.toDataURL('image/jpeg', q);
          if (d.length <= 900000) return resolve(d);
        }
        w = Math.round(w * 0.85);
      }
      reject(new Error('template-too-large'));
    };
    img.onerror = () => reject(new Error('image-read-failed'));
    img.src = url;
  });
