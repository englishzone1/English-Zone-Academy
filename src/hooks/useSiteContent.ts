import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { DynamicCourseItem } from '../services/contentManagementService';

// نصوص الأقسام التي تكتبها في لوحة الإدارة (website_content)، والمناهج المنشورة (courses)
// النص الفارغ لا يظهر في الموقع

export type SectionKey = 'hero_announcement' | 'methodology_intro' | 'placement_notice' | 'footer_accreditation';
type SectionTexts = Partial<Record<SectionKey, { en: string; ar: string }>>;

let sectionsCache: Promise<SectionTexts> | null = null;
let coursesCache: Promise<DynamicCourseItem[]> | null = null;

const loadSections = (): Promise<SectionTexts> => {
  if (!sectionsCache) {
    sectionsCache = getDocs(collection(db, 'website_content'))
      .then((snap) => {
        const out: SectionTexts = {};
        snap.docs.forEach((d) => {
          const x = d.data() as any;
          const key = (x.sectionKey || d.id) as SectionKey;
          out[key] = { en: String(x.contentEn || '').trim(), ar: String(x.contentAr || '').trim() };
        });
        return out;
      })
      .catch((err) => {
        console.error('Error reading website content:', err);
        sectionsCache = null;
        return {};
      });
  }
  return sectionsCache;
};

const loadCourses = (): Promise<DynamicCourseItem[]> => {
  if (!coursesCache) {
    coursesCache = getDocs(collection(db, 'courses'))
      .then((snap) =>
        snap.docs
          .map((d) => ({ ...(d.data() as any), id: d.id } as DynamicCourseItem))
          .filter((c) => c.isActive)
      )
      .catch((err) => {
        console.error('Error reading courses:', err);
        coursesCache = null;
        return [];
      });
  }
  return coursesCache;
};

// يعيد نص القسم باللغة الحالية، أو باللغة الأخرى إن لم يُكتب، أو نصًا فارغًا
export const useSiteSection = (key: SectionKey, language: string): string => {
  const [text, setText] = useState('');
  useEffect(() => {
    let alive = true;
    loadSections().then((all) => {
      if (!alive) return;
      const s = all[key];
      setText(s ? (language === 'ar' ? s.ar || s.en : s.en || s.ar) : '');
    });
    return () => {
      alive = false;
    };
  }, [key, language]);
  return text;
};

export const usePublishedCourses = (): DynamicCourseItem[] => {
  const [courses, setCourses] = useState<DynamicCourseItem[]>([]);
  useEffect(() => {
    let alive = true;
    loadCourses().then((c) => {
      if (alive) setCourses(c);
    });
    return () => {
      alive = false;
    };
  }, []);
  return courses;
};
