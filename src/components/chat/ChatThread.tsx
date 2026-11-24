import React, { useEffect, useRef, useState } from 'react';
import { Send, ImagePlus, Mic, Square, Trash2, X, Clock } from 'lucide-react';
import {
  chatService,
  ChatMessage,
  ChatRole,
  compressImage,
  blobToDataUrl,
  pickVoiceMime,
  isGroupThread,
  MAX_VOICE_SEC
} from '../../services/chatService';

interface Props {
  threadId: string;
  me: { uid: string; name: string; role: ChatRole };
  isAr: boolean;
  title?: string;
  readOnly?: boolean;
  canDelete?: boolean; // الإدارة فقط
}

const fmtTime = (ms: number, isAr: boolean) =>
  new Date(ms).toLocaleString(isAr ? 'ar' : 'en', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export const ChatThread: React.FC<Props> = ({ threadId, me, isAr, title, readOnly, canDelete }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [recSec, setRecSec] = useState<number | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<{ mr: MediaRecorder; stream: MediaStream; chunks: Blob[]; start: number; timer: any } | null>(null);
  const group = isGroupThread(threadId);

  useEffect(() => {
    setMsgs([]);
    setErr('');
    const unsub = chatService.listen(threadId, setMsgs, (e) => setErr(e?.code || 'error'));
    if (group) chatService.cleanup(threadId).catch(() => undefined);
    return () => unsub();
  }, [threadId]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  const send = async (m: Omit<ChatMessage, 'id' | 'createdAtMs' | 'senderId' | 'senderName' | 'senderRole'>) => {
    setBusy(true);
    try {
      const nm = me.name && !me.name.includes('@') ? me.name : me.role === 'teacher' ? tr('Teacher', 'المعلم') : me.role === 'admin' ? tr('Admin', 'الإدارة') : tr('Member', 'عضو');
      await chatService.send(threadId, { ...m, senderId: me.uid, senderName: nm, senderRole: me.role });
    } catch (e: any) {
      alert(tr('Could not send: ', 'تعذر الإرسال: ') + (e?.code || e?.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const sendText = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    await send({ kind: 'text', text: t.slice(0, 2000) });
  };

  const sendImage = async (f?: File) => {
    if (!f) return;
    try {
      const data = await compressImage(f);
      await send({ kind: 'image', data });
    } catch {
      alert(tr('This image is too large.', 'الصورة كبيرة جدًا.'));
    }
  };

  const stopRec = (cancel = false) => {
    const r = recRef.current;
    if (!r) return;
    clearInterval(r.timer);
    (r as any).cancel = cancel;
    try {
      r.mr.stop();
    } catch {
      /* ignore */
    }
  };

  const startRec = async () => {
    const mime = pickVoiceMime();
    if (!navigator.mediaDevices?.getUserMedia || !(window as any).MediaRecorder) {
      alert(tr('Voice recording is not supported on this browser.', 'التسجيل الصوتي غير مدعوم في هذا المتصفح.'));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : { audioBitsPerSecond: 24000 });
      const chunks: Blob[] = [];
      const start = Date.now();
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const cur = recRef.current as any;
        recRef.current = null;
        setRecSec(null);
        if (cur?.cancel) return;
        const dur = Math.min(MAX_VOICE_SEC, Math.round((Date.now() - start) / 1000));
        if (dur < 1) return;
        const data = await blobToDataUrl(new Blob(chunks, { type: mr.mimeType || mime || 'audio/webm' }));
        if (data.length > 900000) {
          alert(tr('The recording is too long.', 'التسجيل طويل جدًا.'));
          return;
        }
        await send({ kind: 'voice', data, durSec: dur });
      };
      const timer = setInterval(() => {
        const s = (Date.now() - start) / 1000;
        setRecSec(s);
        if (s >= MAX_VOICE_SEC) stopRec();
      }, 250);
      recRef.current = { mr, stream, chunks, start, timer };
      setRecSec(0);
      mr.start();
    } catch {
      alert(tr('Please allow the microphone.', 'يجب السماح باستخدام الميكروفون.'));
    }
  };

  const roleTag = (r: ChatRole) =>
    r === 'admin' ? tr('Admin', 'الإدارة') : r === 'teacher' ? tr('Teacher', 'المعلم') : '';

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[70vh] min-h-[420px]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
        <h3 className="font-bold text-[#061638] text-sm sm:text-base">{title || tr('Chat', 'المحادثة')}</h3>
        {group && (
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {tr('Messages are deleted after one week', 'تُحذف الرسائل بعد أسبوع')}
          </span>
        )}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
        {err ? (
          <p className="text-center text-xs text-red-600 py-6">{tr('Could not load the chat.', 'تعذر تحميل المحادثة.')} ({err})</p>
        ) : msgs.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">{tr('No messages yet.', 'لا توجد رسائل بعد.')}</p>
        ) : (
          msgs.map((m) => {
            const mine = m.senderId === me.uid;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm ${mine ? 'bg-[#061638] text-white' : 'bg-white text-[#061638] border border-gray-200'}`}>
                  <div className={`text-[10px] font-bold mb-0.5 flex items-center gap-1.5 ${mine ? 'text-[#F3E5AB]' : 'text-[#AA820A]'}`}>
                    {m.senderName && !m.senderName.includes('@') ? m.senderName : roleTag(m.senderRole) || tr('Member', 'عضو')}
                    {roleTag(m.senderRole) && <span className="px-1.5 rounded-full bg-[#D4AF37] text-[#061638] text-[9px]">{roleTag(m.senderRole)}</span>}
                  </div>
                  {m.kind === 'text' && <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>}
                  {m.kind === 'image' && m.data && (
                    <img src={m.data} alt="" onClick={() => setZoom(m.data!)} className="rounded-xl max-h-64 cursor-zoom-in" />
                  )}
                  {m.kind === 'voice' && m.data && (
                    <div className="flex items-center gap-2">
                      <audio controls src={m.data} className="h-9 max-w-[220px]" />
                      {m.durSec ? <span className="text-[10px] opacity-70">{mmss(m.durSec)}</span> : null}
                    </div>
                  )}
                  <div className={`text-[9px] mt-1 flex items-center gap-2 ${mine ? 'text-gray-300' : 'text-gray-400'}`}>
                    {fmtTime(m.createdAtMs, isAr)}
                    {canDelete && (
                      <button
                        onClick={() => chatService.remove(threadId, m.id).catch(() => undefined)}
                        className="hover:text-red-500"
                        title={tr('Delete', 'حذف')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {readOnly ? (
        <div className="px-4 py-3 text-center text-[11px] text-gray-500 border-t border-gray-100">{tr('Preview only', 'للعرض فقط')}</div>
      ) : recSec !== null ? (
        <div className="p-3 border-t border-gray-100 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <span className="text-sm font-bold text-[#061638]">
            {mmss(recSec)} / {mmss(MAX_VOICE_SEC)}
          </span>
          <div className="flex-1" />
          <button onClick={() => stopRec(true)} className="p-2 rounded-xl border border-gray-200 text-gray-500" title={tr('Cancel', 'إلغاء')}>
            <X className="w-5 h-5" />
          </button>
          <button onClick={() => stopRec()} className="px-4 py-2 rounded-xl bg-[#061638] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5">
            <Square className="w-4 h-4" />
            {tr('Send', 'إرسال')}
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-gray-100 flex items-end gap-2">
          <label className="p-2.5 rounded-xl border border-gray-200 text-[#AA820A] cursor-pointer hover:bg-[#FAF8F5]" title={tr('Image', 'صورة')}>
            <ImagePlus className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { sendImage(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendText();
              }
            }}
            rows={1}
            placeholder={tr('Write a message…', 'نص الرسالة…')}
            className="flex-1 resize-none px-3 py-2.5 rounded-xl border border-gray-300 text-sm max-h-32"
          />
          {text.trim() ? (
            <button onClick={sendText} disabled={busy} className="p-2.5 rounded-xl bg-[#061638] text-[#F3E5AB] disabled:opacity-50" title={tr('Send', 'إرسال')}>
              <Send className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button onClick={startRec} disabled={busy} className="p-2.5 rounded-xl bg-[#D4AF37] text-[#061638] disabled:opacity-50" title={tr('Voice note (up to 2 minutes)', 'تسجيل صوتي (حتى دقيقتين)')}>
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-3" onClick={() => setZoom(null)}>
          <img src={zoom} alt="" className="max-h-[90vh] max-w-[95vw] rounded-xl" />
        </div>
      )}
    </div>
  );
};
