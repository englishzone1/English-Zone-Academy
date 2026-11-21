import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_VOICE_SEC = 120;

export type ChatRole = 'student' | 'teacher' | 'admin';
export type ChatKind = 'text' | 'image' | 'voice';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: ChatRole;
  kind: ChatKind;
  text?: string;
  data?: string; // data URL (compressed image or voice note)
  durSec?: number;
  createdAtMs: number;
}

// شات المجموعة: يُحذف كل ما مضى عليه أسبوع. المحادثة الخاصة مع المعلم: دائمة
export const groupThread = (groupId: string) => `group_${groupId}`;
export const staffThread = (teacherId: string) => `staff_${teacherId}`;
export const isGroupThread = (threadId: string) => threadId.startsWith('group_');

const col = (threadId: string) => collection(db, 'chats', threadId, 'messages');

export const chatService = {
  listen(threadId: string, cb: (msgs: ChatMessage[]) => void, onErr?: (e: any) => void) {
    const since = isGroupThread(threadId) ? Date.now() - WEEK_MS : 0;
    const q = query(col(threadId), where('createdAtMs', '>=', since), orderBy('createdAtMs', 'asc'));
    return onSnapshot(
      q,
      (snap) => cb(snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as ChatMessage))),
      (e) => onErr && onErr(e)
    );
  },

  async send(threadId: string, m: Omit<ChatMessage, 'id' | 'createdAtMs'>): Promise<void> {
    const clean: any = { ...m, createdAtMs: Date.now() };
    Object.keys(clean).forEach((k) => clean[k] === undefined && delete clean[k]);
    await addDoc(col(threadId), clean);
  },

  async remove(threadId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, 'chats', threadId, 'messages', id));
  },

  // حذف رسائل شات المجموعة التي مضى عليها أسبوع (تلقائي)
  async cleanup(threadId: string): Promise<number> {
    if (!isGroupThread(threadId)) return 0;
    const snap = await getDocs(query(col(threadId), where('createdAtMs', '<', Date.now() - WEEK_MS)));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
    return snap.size;
  }
};

/* ---------- media helpers (free: stored compressed inside the message) ---------- */

const fileToImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

export async function compressImage(file: File): Promise<string> {
  const img = await fileToImage(file);
  let max = 1100;
  let quality = 0.72;
  for (let i = 0; i < 6; i++) {
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    const url = c.toDataURL('image/jpeg', quality);
    if (url.length < 320000) return url;
    max = Math.round(max * 0.8);
    quality = Math.max(0.5, quality - 0.06);
  }
  throw new Error('image-too-large');
}

export const blobToDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(b);
  });

export function pickVoiceMime(): string {
  const opts = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
  for (const o of opts) {
    try {
      if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(o)) return o;
    } catch {
      /* ignore */
    }
  }
  return '';
}
