import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Play, Loader2 } from 'lucide-react';
import { loadMessageAudio } from '../../services/studentHubService';

export interface RecordedAudio {
  blob: Blob;
  mime: string;
  seconds: number;
}

const MAX_SECONDS = 10 * 60; // حد التسجيل: 10 دقائق

const pickMime = (): string => {
  const MR: any = (window as any).MediaRecorder;
  if (!MR || !MR.isTypeSupported) return '';
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
    if (MR.isTypeSupported(m)) return m;
  }
  return '';
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// زر تسجيل صوتي: تسجيل ← إيقاف ← استماع قبل الإرسال أو حذف
export const VoiceRecorder: React.FC<{ isAr: boolean; value: RecordedAudio | null; onChange: (a: RecordedAudio | null) => void; disabled?: boolean; compact?: boolean }> = ({
  isAr,
  value,
  onChange,
  disabled,
  compact
}) => {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (!value) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(value.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      try {
        recRef.current?.stream.getTracks().forEach((t) => t.stop());
      } catch {
        /* ignore */
      }
    },
    []
  );

  const stop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  };

  const start = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !(window as any).MediaRecorder) {
      setError(isAr ? 'المتصفح لا يدعم التسجيل الصوتي.' : 'This browser cannot record audio.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const rec = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 24000 });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = rec.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        const seconds = Math.round((Date.now() - startRef.current) / 1000);
        setRecording(false);
        if (blob.size > 0) onChange({ blob, mime: type.split(';')[0], seconds });
      };
      recRef.current = rec;
      startRef.current = Date.now();
      setElapsed(0);
      rec.start(1000);
      setRecording(true);
      timerRef.current = window.setInterval(() => {
        const s = Math.round((Date.now() - startRef.current) / 1000);
        setElapsed(s);
        if (s >= MAX_SECONDS) stop();
      }, 500);
    } catch (err) {
      console.error(err);
      setError(isAr ? 'لم يُسمح باستخدام الميكروفون.' : 'Microphone permission was denied.');
    }
  };

  if (value && previewUrl) {
    return (
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/40">
        <audio controls src={previewUrl} className="h-9 max-w-full" />
        <span className="text-[11px] text-gray-500">{fmt(value.seconds)}</span>
        <button type="button" onClick={() => onChange(null)} className="p-1.5 text-gray-400 hover:text-red-600" title={isAr ? 'حذف التسجيل' : 'Remove'}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {error && <span className="text-[10px] text-red-600 max-w-[140px]">{error}</span>}
        {recording ? (
          <button type="button" onClick={stop} className="h-11 px-4 rounded-full bg-red-600 text-white flex items-center gap-1.5 text-xs font-bold animate-pulse" title={isAr ? 'إيقاف' : 'Stop'}>
            <Square className="w-3.5 h-3.5" />
            <span dir="ltr">{fmt(elapsed)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={disabled}
            className="w-11 h-11 rounded-full bg-[#0A192F] text-[#D4AF37] flex items-center justify-center disabled:opacity-50"
            title={isAr ? 'تسجيل صوتي (حتى 10 دقائق)' : 'Voice recording (up to 10 min)'}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recording ? (
        <button type="button" onClick={stop} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white flex items-center gap-1.5 animate-pulse">
          <Square className="w-3.5 h-3.5" />
          <span>
            {isAr ? 'إيقاف التسجيل' : 'Stop'} {fmt(elapsed)} / {fmt(MAX_SECONDS)}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          className="px-4 py-2 rounded-xl text-xs font-bold border border-[#D4AF37] text-[#0A192F] bg-white hover:bg-[#FAF8F5] flex items-center gap-1.5 disabled:opacity-50"
        >
          <Mic className="w-4 h-4 text-[#AA820A]" />
          <span>{isAr ? 'تسجيل صوتي' : 'Voice recording'}</span>
        </button>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
};

// تشغيل تسجيل محفوظ: يُحمَّل عند الضغط فقط
export const MessageAudioPlayer: React.FC<{ messageId: string; kind: 'msg' | 'reply'; parts: number; isAr: boolean; seconds?: number }> = ({
  messageId,
  kind,
  parts,
  isAr,
  seconds
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const blob = await loadMessageAudio(messageId, kind, parts);
      setUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setError(isAr ? 'تعذر تحميل التسجيل (ربما حذفته الأكاديمية).' : 'Could not load the recording.');
    } finally {
      setLoading(false);
    }
  };

  if (url) return <audio controls autoPlay src={url} className="h-9 max-w-full" />;
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={load} disabled={loading} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#0A192F] text-[#F3E5AB] flex items-center gap-1.5">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
        <span>
          {isAr ? 'تسجيل صوتي' : 'Voice recording'}
          {seconds ? ` (${fmt(seconds)})` : ''}
        </span>
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
};
