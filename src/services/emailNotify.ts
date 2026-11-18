// تنبيه بالبريد عند وصول رسالة جديدة، عبر EmailJS (خطة مجانية، يُضبط من لوحة الإدارة ← الإعدادات)
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

interface EmailCfg {
  serviceId: string;
  templateId: string;
  publicKey: string;
  academyEmail: string;
}

let cfgPromise: Promise<EmailCfg | null> | null = null;
const loadCfg = (): Promise<EmailCfg | null> => {
  if (!cfgPromise) {
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

const claimToday = async (to: string): Promise<boolean> => {
  const day = today();
  const key = `ez_mail_${to.toLowerCase()}`;
  try {
    if (localStorage.getItem(key) === day) return false;
  } catch {
    /* ignore */
  }
  const id = `${to.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 100)}_${day}`;
  try {
    await setDoc(doc(db, 'mail_log', id), { day, createdAt: new Date().toISOString() });
  } catch {
    // موجود مسبقًا = أُرسل بريد اليوم
    try {
      localStorage.setItem(key, day);
    } catch {
      /* ignore */
    }
    return false;
  }
  try {
    localStorage.setItem(key, day);
  } catch {
    /* ignore */
  }
  return true;
};

export const notifyNewMessage = async (p: { toEmail?: string; toName?: string; fromName: string; preview: string }) => {
  const to = String(p.toEmail || '').trim();
  if (!to || !to.includes('@')) return;
  const cfg = await loadCfg();
  if (!cfg || !(await claimToday(to))) return;
  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
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
  } catch (err) {
    console.warn('Email notification failed:', err);
  }
};
