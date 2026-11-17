import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

// أسئلة وأجوبة المساعد الآلي في الموقع (مجاني بالكامل، تُدار من لوحة الإدارة)
export interface ChatFaq {
  id: string;
  questionAr: string;
  answerAr: string;
  questionEn?: string;
  answerEn?: string;
  order: number;
  active: boolean;
  updatedAt?: string;
}

// يُستبدل في الجواب بأسعار المستويات المحفوظة في «الأسعار والمراحل»
export const PRICES_TOKEN = '{prices}';

const COL = 'chat_faq';
const clean = <T extends object>(o: T): T => JSON.parse(JSON.stringify(o));

let cached: Promise<ChatFaq[]> | null = null;

export const chatFaqService = {
  async getAll(): Promise<ChatFaq[]> {
    const snap = await getDocs(collection(db, COL));
    return snap.docs
      .map((d) => ({ active: true, order: 0, ...(d.data() as any), id: d.id } as ChatFaq))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  // للزائر: الأسئلة المفعّلة فقط، مع ذاكرة مؤقتة
  getActive(): Promise<ChatFaq[]> {
    if (!cached) {
      cached = this.getAll()
        .then((all) => all.filter((f) => f.active && f.questionAr && f.answerAr))
        .catch((err) => {
          console.error('Error reading chat_faq:', err);
          cached = null;
          return [];
        });
    }
    return cached;
  },

  async save(f: ChatFaq): Promise<void> {
    cached = null;
    await setDoc(
      doc(db, COL, f.id),
      clean({
        ...f,
        questionAr: f.questionAr.trim().slice(0, 200),
        answerAr: f.answerAr.trim().slice(0, 3000),
        questionEn: f.questionEn?.trim().slice(0, 200) || undefined,
        answerEn: f.answerEn?.trim().slice(0, 3000) || undefined,
        updatedAt: new Date().toISOString()
      })
    );
  },

  async remove(id: string): Promise<void> {
    cached = null;
    await deleteDoc(doc(db, COL, id));
  },

  async saveMany(list: ChatFaq[]): Promise<void> {
    cached = null;
    const batch = writeBatch(db);
    list.forEach((f) => batch.set(doc(db, COL, f.id), clean({ ...f, updatedAt: new Date().toISOString() })));
    await batch.commit();
  },

  newId(): string {
    return `FAQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }
};
