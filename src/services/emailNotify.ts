// تنبيه بالبريد عند وصول رسالة جديدة، عبر EmailJS (خطة مجانية، يُضبط من لوحة الإدارة ← الإعدادات)
import { getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

interface EmailCfg {
  serviceId: string;
  templateId: string;
  publicKey: string;
  academyEmail: string;
}

// تُقرأ الإعدادات من جديد كل 5 دقائق (حتى تعمل فور حفظها دون تحديث الصفحة)
let cfgPromise: Promise<EmailCfg | null> | null = null;
let cfgAt = 0;
const loadCfg = (): Promise<EmailCfg | null> => {
  if (!cfgPromise || Date.now() - cfgAt > 5 * 60 * 1000) {
    cfgAt = Date.now();
    cfgPromise = getDoc(doc(db, 'academy_settings', 'main'))
      .then((s) => {
        const d: any = s.exists() ? s.data() : {};
        const c = {
          serviceId: String(d.emailjsServiceId || '').trim(),
          templateId: String(d.emailjsTemplateId || '').trim(),
          publicKey: String(d.emailjsPublicKey || '').trim(),
          academyEmail: String(d.notifyEmail || d.email || '').trim()
        };
        return c.serviceId && c.templateId && c.publicKey ? c : null;
      })
      .catch(() => null);
  }
  return cfgPromise;
};

export const getAcademyNotifyEmail = async (): Promise<string> => (await loadCfg())?.academyEmail || '';

// بريد واحد فقط في اليوم لكل مستلم (بتوقيت مكة/إسطنبول UTC+3)، مهما كثرت الرسائل أو المرسلون.
// السجل في Firestore: mail_log/{البريد}_{اليوم} يُنشأ مرة واحدة، والمحاولة الثانية ترفضها القواعد.
const today = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);

const logId = (to: string, day: string) => `${to.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 100)}_${day}`;
const localKey = (to: string) => `ez_mail_${to.toLowerCase()}`;

// هل أُرسل له بريد اليوم؟
const sentToday = async (to: string): Promise<boolean> => {
  const day = today();
  try {
    if (localStorage.getItem(localKey(to)) === day) return true;
  } catch {
    /* ignore */
  }
  try {
    return (await getDoc(doc(db, 'mail_log', logId(to, day)))).exists();
  } catch {
    return false; // القواعد غير منشورة: نعتمد على حد المتصفح
  }
};

// يُسجَّل اليوم بعد نجاح الإرسال فقط، فالمحاولة الفاشلة لا تستهلك بريد اليوم
const markSent = async (to: string) => {
  const day = today();
  try {
    localStorage.setItem(localKey(to), day);
  } catch {
    /* ignore */
  }
  await setDoc(doc(db, 'mail_log', logId(to, day)), { day, createdAt: new Date().toISOString() }).catch(() => undefined);
};

// الإدارة: تصفير حد اليوم لبريد معيّن (بعد إصلاح الإعدادات)
export const resetTodayLimit = async (to: string) => {
  const day = today();
  try {
    localStorage.removeItem(localKey(to));
  } catch {
    /* ignore */
  }
  await deleteDoc(doc(db, 'mail_log', logId(to, day))).catch(() => undefined);
};

export const notifyNewMessage = async (p: { toEmail?: string; toName?: string; fromName: string; preview: string }) => {
  const to = String(p.toEmail || '').trim();
  if (!to || !to.includes('@')) return;
  const cfg = await loadCfg();
  if (!cfg || (await sentToday(to))) return;
  const r = await sendViaEmailJS(cfg, { to, toName: p.toName || '', fromName: p.fromName, preview: p.preview });
  if (r.ok) await markSent(to);
};

const sendViaEmailJS = async (cfg: EmailCfg, p: { to: string; toName: string; fromName: string; preview: string }): Promise<{ ok: boolean; status: number; text: string }> => {
  const to = p.to;
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: cfg.serviceId,
        template_id: cfg.templateId,
        user_id: cfg.publicKey,
        template_params: {
          to_email: to,
          to_name: p.toName || '',
          from_name: p.fromName,
          message: p.preview.slice(0, 300),
          link: `${window.location.origin}/#/portal`
        }
      })
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) console.warn('EmailJS error', res.status, text);
    return { ok: res.ok, status: res.status, text };
  } catch (err: any) {
    console.warn('Email notification failed:', err);
    return { ok: false, status: 0, text: String(err?.message || err) };
  }
};

// زر «إرسال بريد تجريبي» في الإعدادات: يرسل فورًا دون حد اليوم، ويعيد سبب الخطأ إن وُجد
export const sendTestEmail = async (cfg: { serviceId: string; templateId: string; publicKey: string }, to: string) =>
  sendViaEmailJS(
    { serviceId: cfg.serviceId.trim(), templateId: cfg.templateId.trim(), publicKey: cfg.publicKey.trim(), academyEmail: to },
    { to: to.trim(), toName: 'English Zone', fromName: 'منصة English Zone', preview: 'هذه رسالة تجريبية للتأكد من أن تنبيهات البريد تعمل ✅' }
  );
