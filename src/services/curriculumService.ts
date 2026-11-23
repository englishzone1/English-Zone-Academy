import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// المناهج الثابتة التي تختارها الإدارة للطالب (الأسماء فقط؛ الملفات في قاعدة البيانات)
export const CURRICULA: { id: string; titleAr: string; titleEn: string }[] = [
  { id: 'ef5-a1', titleAr: 'منهج أكسفورد English File – المستوى الأول (المبتدئين)', titleEn: 'Oxford English File – Level 1 (Beginner)' }
];

export interface CurriculumVideo {
  lesson: string;
  lessonAr: string;
  en: string;
  ar: string;
  id: string;
}

export interface CurriculumDoc {
  id: string;
  titleAr: string;
  titleEn: string;
  stages: { key: string; titleAr: string; titleEn: string; units: number[]; bookId?: string }[];
  units: Record<string, { tracks: [string, string][]; videos: CurriculumVideo[] }>;
  updatedAt?: string;
}

// معرّف ملف Drive من رابط أو معرّف مباشر
export const driveId = (s: string) => {
  const t = String(s || '').trim();
  const m = t.match(/\/d\/([A-Za-z0-9_-]{20,})/) || t.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{20,}$/.test(t) ? t : '';
};
export const drivePreview = (id: string) => `https://drive.google.com/file/d/${id}/preview`;

export const curriculumService = {
  async get(id: string): Promise<CurriculumDoc | null> {
    const s = await getDoc(doc(db, 'curricula', id));
    if (!s.exists()) return null;
    const d: any = s.data();
    // Firestore لا يقبل المصفوفات المتداخلة، فالتسجيلات محفوظة كنص JSON
    Object.values(d.units || {}).forEach((u: any) => {
      if (typeof u.tracks === 'string') u.tracks = JSON.parse(u.tracks);
    });
    return { ...d, id: s.id } as CurriculumDoc;
  },

  async save(c: CurriculumDoc): Promise<void> {
    const units: any = {};
    Object.entries(c.units).forEach(([k, u]) => (units[k] = { tracks: JSON.stringify(u.tracks), videos: u.videos }));
    const stages = c.stages.map((s) => ({ key: s.key, titleAr: s.titleAr, titleEn: s.titleEn, units: s.units, ...(s.bookId ? { bookId: s.bookId } : {}) }));
    await setDoc(doc(db, 'curricula', c.id), { id: c.id, titleAr: c.titleAr, titleEn: c.titleEn, stages, units, updatedAt: new Date().toISOString() });
  }
};
