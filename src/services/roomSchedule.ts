// مواعيد الغرف الرسمية للأكاديمية (مرة واحدة أو أسبوعيًا)
import type { VoiceRoom } from './voiceRooms';

export const LIVE_WINDOW_MS = 2 * 3600 * 1000; // الجلسة تُعدّ «الآن» حتى ساعتين بعد بدايتها
const WEEK = 7 * 24 * 3600 * 1000;

/** موعد الجلسة الحالية أو القادمة، أو null إن انتهى موعد الغرفة غير المتكررة */
export function nextSession(r: VoiceRoom, now = Date.now()): number | null {
  if (!r.scheduledAt) return null;
  let t = r.scheduledAt;
  if (r.weekly) {
    while (t + LIVE_WINDOW_MS < now) t += WEEK;
    return t;
  }
  return t + LIVE_WINDOW_MS < now ? null : t;
}

export function countdown(ms: number, isAr: boolean): string {
  if (ms <= 0) return isAr ? 'الآن' : 'now';
  const m = Math.round(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  if (isAr) return d > 0 ? `بعد ${d} يوم و${h} ساعة` : h > 0 ? `بعد ${h} ساعة و${mm} دقيقة` : `بعد ${mm} دقيقة`;
  return d > 0 ? `in ${d}d ${h}h` : h > 0 ? `in ${h}h ${mm}m` : `in ${mm} min`;
}

export function formatSession(t: number, isAr: boolean): string {
  return new Date(t).toLocaleString(isAr ? 'ar' : 'en', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
}

/** رابط إضافة الموعد إلى تقويم Google (مع التكرار الأسبوعي) */
export function calendarLink(r: VoiceRoom, t: number, link: string): string {
  const f = (x: number) => new Date(x).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `English Zone — ${r.title}`,
    dates: `${f(t)}/${f(t + 3600 * 1000)}`,
    details: `${r.topic || ''}\n${link}`.trim(),
  });
  if (r.weekly) p.set('recur', 'RRULE:FREQ=WEEKLY');
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}
