// توليد أسئلة «تحدّي اليوم» بالذكاء الاصطناعي (Gemini). مفتاح الإدارة محفوظ في admin_secrets/gemini (للإدارة فقط).
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Challenge } from './dailyChallenge';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const loadGeminiKey = async (): Promise<string> => {
  try {
    const d = await getDoc(doc(db, 'admin_secrets', 'gemini'));
    return d.exists() ? String((d.data() as any).apiKey || '') : '';
  } catch {
    return '';
  }
};
export const saveGeminiKey = (apiKey: string) => setDoc(doc(db, 'admin_secrets', 'gemini'), { apiKey: apiKey.trim() });

let cachedModel = '';
/** يختار أحدث نموذج «flash» متاح لهذا المفتاح (الأسماء تتغير مع الإصدارات) */
async function pickModel(key: string): Promise<string> {
  if (cachedModel) return cachedModel;
  const r = await fetch(`${BASE}/models?pageSize=200`, { headers: { 'x-goog-api-key': key } });
  if (!r.ok) throw new Error(r.status === 400 || r.status === 403 ? 'bad_key' : 'models_' + r.status);
  const j = await r.json();
  const names: string[] = (j.models || [])
    .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m: any) => String(m.name || ''));
  const ver = (n: string) => Number((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  const flash = names.filter((n) => /gemini-[\d.]+-flash$/.test(n)).sort((a, b) => ver(b) - ver(a));
  const any = names.filter((n) => /flash/.test(n) && !/lite|image|tts|live|audio|thinking|exp/.test(n)).sort((a, b) => ver(b) - ver(a));
  cachedModel = flash[0] || any[0] || names.find((n) => /gemini/.test(n)) || '';
  if (!cachedModel) throw new Error('no_model');
  return cachedModel;
}

export async function generateChallenges(
  key: string,
  opts: { level: string; count: number; topic: string; avoid: string[] }
): Promise<Omit<Challenge, 'date'>[]> {
  const model = await pickModel(key);
  const prompt = `You write a daily English challenge for Arabic-speaking adult learners (mostly women) at CEFR level ${opts.level}.
Create ${opts.count} different multiple-choice questions${opts.topic ? ` about: ${opts.topic}` : ' mixing vocabulary, grammar, everyday expressions and pronunciation'}.
Rules:
- Each question is short, clear English suitable for level ${opts.level}.
- 3 or 4 options, exactly ONE correct. Double-check the correct answer is right and the others are clearly wrong.
- "answer" is the 0-based index of the correct option. Vary its position.
- "explanation": one or two short sentences in simple Arabic explaining why the answer is correct (English words may appear inside).
- No two questions alike. Do not repeat these existing questions: ${opts.avoid.slice(0, 40).join(' | ') || 'none'}.`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            answer: { type: 'INTEGER' },
            explanation: { type: 'STRING' },
          },
          required: ['question', 'options', 'answer', 'explanation'],
        },
      },
    },
  };
  const r = await fetch(`${BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    cachedModel = r.status === 404 ? '' : cachedModel;
    throw new Error(r.status === 429 ? 'quota' : r.status === 400 || r.status === 403 ? 'bad_key' : 'gen_' + r.status);
  }
  const j = await r.json();
  const text = (j.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('');
  let arr: any[] = [];
  try {
    arr = JSON.parse(text);
  } catch {
    const m = text.match(/\[[\s\S]*\]/);
    arr = m ? JSON.parse(m[0]) : [];
  }
  return arr
    .map((q) => {
      const options = (Array.isArray(q.options) ? q.options : []).map((o: any) => String(o).trim().slice(0, 150)).filter(Boolean).slice(0, 4);
      return {
        question: String(q.question || '').trim().slice(0, 400),
        options,
        answer: Math.min(Math.max(0, Number(q.answer) || 0), Math.max(0, options.length - 1)),
        explanation: String(q.explanation || '').trim().slice(0, 600),
      };
    })
    .filter((q) => q.question && q.options.length >= 2);
}
