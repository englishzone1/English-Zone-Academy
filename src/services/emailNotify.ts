// تنبيه بالبريد عند وصول رسالة جديدة، عبر EmailJS (خطة مجانية، يُضبط من لوحة الإدارة ← الإعدادات)
import { getDoc, doc } from 'firebase/firestore';
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

// رسالة واحدة كل 10 دقائق لكل مستلم، حتى لا تمتلئ حصة البريد المجانية
const THROTTLE_MS = 10 * 60 * 1000;
const throttled = (to: string) => {
  try {
    const k = `ez_mail_${to.toLowerCase()}`;
    const last = Number(localStorage.getItem(k) || 0);
    if (Date.now() - last < THROTTLE_MS) return true;
    localStorage.setItem(k, String(Date.now()));
  } catch {
    /* ignore */
  }
  return false;
};

export const notifyNewMessage = async (p: { toEmail?: string; toName?: string; fromName: string; preview: string }) => {
  const to = String(p.toEmail || '').trim();
  if (!to || !to.includes('@')) return;
  const cfg = await loadCfg();
  if (!cfg || throttled(to)) return;
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
