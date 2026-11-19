// تحدّي اليوم: سؤال واحد كل يوم تضعه الإدارة، والمسجّل يجيب مرة واحدة ويجمع سلسلة أيام متتالية
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Challenge {
  date: string; // YYYY-MM-DD
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  createdAt?: number;
}

export interface ChallengeProgress {
  lastDate: string;
  lastChoice: number;
  lastCorrect: boolean;
  streak: number;
  best: number;
  total: number;
  correct: number;
  updatedAt: number;
}

export const dayKey = (d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const addDays = (key: string, n: number) => {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
};

export async function getChallenge(date: string): Promise<Challenge | null> {
  const d = await getDoc(doc(db, 'daily_challenges', date));
  return d.exists() ? (d.data() as Challenge) : null;
}

export async function getProgress(uid: string): Promise<ChallengeProgress | null> {
  const d = await getDoc(doc(db, 'challenge_progress', uid));
  return d.exists() ? (d.data() as ChallengeProgress) : null;
}

export async function submitAnswer(uid: string, c: Challenge, choice: number, prev: ChallengeProgress | null): Promise<ChallengeProgress> {
  const ok = choice === c.answer;
  const streak = prev && prev.lastDate === addDays(c.date, -1) ? prev.streak + 1 : 1;
  const next: ChallengeProgress = {
    lastDate: c.date,
    lastChoice: choice,
    lastCorrect: ok,
    streak,
    best: Math.max(streak, prev?.best || 0),
    total: (prev?.total || 0) + 1,
    correct: (prev?.correct || 0) + (ok ? 1 : 0),
    updatedAt: Date.now(),
  };
  await setDoc(doc(db, 'challenge_progress', uid), next);
  return next;
}

// ===== الإدارة =====
export async function listChallenges(fromDate: string): Promise<Challenge[]> {
  const s = await getDocs(query(collection(db, 'daily_challenges'), where('date', '>=', fromDate), orderBy('date'), limit(60)));
  return s.docs.map((d) => d.data() as Challenge);
}
export const saveChallenge = (c: Challenge) => setDoc(doc(db, 'daily_challenges', c.date), { ...c, createdAt: c.createdAt || Date.now() });
export const deleteChallenge = (date: string) => deleteDoc(doc(db, 'daily_challenges', date));
export { addDays };
