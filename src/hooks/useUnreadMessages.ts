import { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

// صوت تنبيه قصير بدون ملفات
export const playPing = () => {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const tone = (freq: number, at: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.3);
    };
    tone(880, 0);
    tone(1320, 0.18);
    setTimeout(() => ctx.close().catch(() => undefined), 800);
  } catch {
    /* ignore */
  }
};

const fromStudent = (d: any) => !d.from || d.from === 'student';

// عدد الرسائل غير المقروءة + صوت عند وصول جديدة
// student: رسائل المعلمة/الأكاديمية الجديدة • teacher: رسائل طالباته الجديدة • academy: رسائل الطالبات التي لم تفتحها الإدارة + رسائل صفحة التواصل
export const useUnreadMessages = (role: 'student' | 'teacher' | 'academy' | null, uid: string | undefined): number => {
  const [count, setCount] = useState(0);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (!role || !uid) return;
    prev.current = null;
    const q =
      role === 'student'
        ? query(collection(db, 'contact_messages'), where('studentId', '==', uid))
        : role === 'teacher'
        ? query(collection(db, 'contact_messages'), where('teacherId', '==', uid))
        : collection(db, 'contact_messages');
    const unsub = onSnapshot(
      q,
      (snap) => {
        let n = 0;
        snap.forEach((s) => {
          const d: any = s.data();
          if (role === 'student') {
            if (!fromStudent(d) && d.status === 'new') n++;
          } else if (role === 'teacher') {
            if (fromStudent(d) && d.status === 'new') n++;
          } else if (!d.studentId) {
            if (d.status === 'new') n++;
          } else if (fromStudent(d) && !d.seenByAcademy && (d.from === 'student' || d.status === 'new')) {
            n++;
          }
        });
        if (prev.current !== null && n > prev.current) playPing();
        prev.current = n;
        setCount(n);
      },
      (err) => console.warn('Unread messages listener:', err?.code)
    );
    return unsub;
  }, [role, uid]);

  return count;
};
