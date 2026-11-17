import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CEFR_LEVELS_INFO } from '../data/academyData';
import type { CEFRLevel, StagePricing } from '../types';

// بطاقة سعر لكل مستوى، مبنية من أسعار المراحل التي تحفظها في لوحة الإدارة (pricing_stages)
// لا توجد أسعار ثابتة: المستوى الذي لا توجد له مراحل محفوظة لا يظهر
export interface LevelPriceCard {
  level: CEFRLevel;
  nameEn: string;
  nameAr: string;
  stagesCount: number;
  durationMonths?: number;
  groupPrice: number; // أقل سعر جماعي شهري بين مراحل المستوى
  groupOriginal?: number; // السعر الأصلي (قبل الخصم) إن كان أعلى
  groupVaries: boolean; // يختلف السعر بين المراحل فيُعرض "من"
  individualPrice?: number;
  individualOriginal?: number;
  individualVaries: boolean;
}

const LEVEL_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const num = (v: any): number | undefined => (typeof v === 'number' && v > 0 ? v : undefined);

// "Months 5–6" → 6
const lastMonth = (months: any): number | undefined => {
  const all = String(months || '').match(/\d+/g);
  return all ? Math.max(...all.map(Number)) : undefined;
};

const buildCards = (rows: StagePricing[]): LevelPriceCard[] =>
  LEVEL_ORDER.map((level) => {
    const stages = rows.filter((r) => r.level === level);
    const group = stages.map((s) => num(s.groupPrice)).filter((x): x is number => x !== undefined);
    if (stages.length === 0 || group.length === 0) return null;

    const groupOrig = stages.map((s) => num(s.groupOriginalPrice)).filter((x): x is number => x !== undefined);
    const indiv = stages.map((s) => num(s.individualCurrent)).filter((x): x is number => x !== undefined);
    const indivOrig = stages.map((s) => num(s.individualOriginal)).filter((x): x is number => x !== undefined);
    const months = stages.map((s) => lastMonth(s.months)).filter((x): x is number => x !== undefined);
    const info = CEFR_LEVELS_INFO.find((l) => l.code === level);

    const groupPrice = Math.min(...group);
    const groupOriginal = groupOrig.length ? Math.max(...groupOrig) : undefined;
    const individualPrice = indiv.length ? Math.min(...indiv) : undefined;
    const individualOriginal = indivOrig.length ? Math.max(...indivOrig) : undefined;

    return {
      level,
      nameEn: info?.nameEn || '',
      nameAr: info?.nameAr || '',
      stagesCount: stages.length,
      durationMonths: months.length ? Math.max(...months) : undefined,
      groupPrice,
      groupOriginal: groupOriginal && groupOriginal > groupPrice ? groupOriginal : undefined,
      groupVaries: new Set(group).size > 1,
      individualPrice,
      individualOriginal:
        individualOriginal && individualPrice && individualOriginal > individualPrice ? individualOriginal : undefined,
      individualVaries: new Set(indiv).size > 1
    } as LevelPriceCard;
  }).filter((c): c is LevelPriceCard => c !== null);

let cached: Promise<LevelPriceCard[]> | null = null;

const loadCards = (): Promise<LevelPriceCard[]> => {
  if (!cached) {
    cached = getDocs(collection(db, 'pricing_stages'))
      .then((snap) => buildCards(snap.docs.map((d) => d.data() as StagePricing)))
      .catch((err) => {
        console.error('Error reading pricing:', err);
        cached = null;
        return [];
      });
  }
  return cached;
};

export const usePricing = (): { cards: LevelPriceCard[]; loading: boolean } => {
  const [cards, setCards] = useState<LevelPriceCard[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    loadCards().then((c) => {
      if (alive) {
        setCards(c);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);
  return { cards, loading };
};
