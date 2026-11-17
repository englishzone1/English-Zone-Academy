import { useEffect } from 'react';
import { useAcademySettings } from '../../hooks/useAcademySettings';

// يستخرج رقم الحساب ورقم الأداة من رابط Tawk.to
// يقبل: https://tawk.to/chat/PROPERTY/WIDGET  أو  https://embed.tawk.to/PROPERTY/WIDGET
export const parseTawk = (url: string): { property: string; widget: string } | null => {
  const m = url.trim().match(/tawk\.to\/(?:chat\/)?([a-f0-9]{16,})\/([\w-]+)/i);
  return m ? { property: m[1], widget: m[2] } : null;
};

// زر المحادثة المباشرة: يظهر في الموقع ولوحة الطالب، ويختفي في لوحات الإدارة والمعلم
export const TawkChat = ({ hidden }: { hidden: boolean }) => {
  const { tawkUrl } = useAcademySettings();
  const ids = tawkUrl ? parseTawk(tawkUrl) : null;

  useEffect(() => {
    if (!ids || document.getElementById('tawk-script')) return;
    const w = window as any;
    w.Tawk_API = w.Tawk_API || {};
    w.Tawk_LoadStart = new Date();
    const s = document.createElement('script');
    s.id = 'tawk-script';
    s.async = true;
    s.src = `https://embed.tawk.to/${ids.property}/${ids.widget}`;
    s.charset = 'UTF-8';
    s.setAttribute('crossorigin', '*');
    document.body.appendChild(s);
  }, [ids?.property, ids?.widget]);

  useEffect(() => {
    const api = (window as any).Tawk_API;
    if (!api) return;
    const apply = () => {
      try {
        if (hidden) api.hideWidget?.();
        else api.showWidget?.();
      } catch {
        // الأداة لم تكتمل بعد
      }
    };
    apply();
    const prev = api.onLoad;
    api.onLoad = () => {
      if (typeof prev === 'function') prev();
      apply();
    };
  }, [hidden, ids?.property]);

  return null;
};
