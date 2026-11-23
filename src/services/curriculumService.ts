import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// المناهج الثابتة التي تختارها الإدارة للطالب (الأسماء فقط؛ الملفات في قاعدة البيانات)
export const CURRICULA: { id: string; titleAr: string; titleEn: string }[] = [
  { id: 'ef5-a1', titleAr: 'منهج أكسفورد English File – المستوى الأول (المبتدئين)', titleEn: 'Oxford English File – Level 1 (Beginner)' }
];

// كتب المراحل وملحق الكتاب (ملفات PDF داخل الموقع)
// كل كتاب: مجلد صور الصفحات (يُقرأ داخل الموقع) + ملف PDF للتحميل
export interface CurriculumBook {
  folder: string;
  count: number;
  pdf: string;
}
const efBook = (name: string, count: number): CurriculumBook => ({
  folder: `/curriculum/ef5-a1/books/888b3c80cf9c/${name}`,
  count,
  pdf: `/curriculum/ef5-a1/books/888b3c80cf9c-${name}.pdf`
});
export const CURRICULUM_BOOKS: Record<string, { stages: CurriculumBook[]; appendix: CurriculumBook }> = {
  'ef5-a1': {
    stages: [efBook('stage1', 47), efBook('stage2', 46), efBook('stage3', 43)],
    appendix: efBook('appendix', 61)
  }
};

// مراحل كل منهج لاختيار مرحلة الطالبة في إدارة الطلاب
export const CURRICULUM_STAGES: Record<string, { ar: string; en: string }[]> = {
  'ef5-a1': [
    { ar: 'المرحلة الأولى (الوحدات 1–4)', en: 'Stage 1 (Units 1–4)' },
    { ar: 'المرحلة الثانية (الوحدات 5–8)', en: 'Stage 2 (Units 5–8)' },
    { ar: 'المرحلة الثالثة (الوحدات 9–12)', en: 'Stage 3 (Units 9–12)' }
  ]
};

export interface CurriculumVideo {
  en: string;
  ar: string;
  id: string;
}

// درس داخل الوحدة: 1A / 1B / Practical English / Revise and Check
export interface CurriculumLesson {
  key: string;
  code: string;
  codeAr: string;
  title: string;
  tracks: [string, string][];
  videos: CurriculumVideo[];
}

export interface CurriculumDoc {
  id: string;
  titleAr: string;
  titleEn: string;
  stages: { key: string; titleAr: string; titleEn: string; units: number[]; bookId?: string }[];
  units: Record<string, { lessons: CurriculumLesson[] }>;
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
      (u.lessons || []).forEach((l: any) => {
        if (typeof l.tracks === 'string') l.tracks = JSON.parse(l.tracks);
      });
      if (!u.lessons) u.lessons = [];
    });
    return { ...d, id: s.id } as CurriculumDoc;
  },

  async save(c: CurriculumDoc): Promise<void> {
    const units: any = {};
    Object.entries(c.units).forEach(([k, u]) => (units[k] = { lessons: u.lessons.map((l) => ({ ...l, tracks: JSON.stringify(l.tracks) })) }));
    const stages = c.stages.map((s) => ({ key: s.key, titleAr: s.titleAr, titleEn: s.titleEn, units: s.units, ...(s.bookId ? { bookId: s.bookId } : {}) }));
    await setDoc(doc(db, 'curricula', c.id), { id: c.id, titleAr: c.titleAr, titleEn: c.titleEn, stages, units, updatedAt: new Date().toISOString() });
  }
};
