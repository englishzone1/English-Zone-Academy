import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Flag, Trash2, MicOff, Loader2 } from 'lucide-react';
import { StudentMessage } from '../../services/studentHubService';
import { VoiceRecorder, MessageAudioPlayer, RecordedAudio } from './VoiceRecorder';

export type ChatRole = 'student' | 'teacher' | 'academy';

export interface Bubble {
  key: string;
  msg: StudentMessage;
  isReply: boolean; // رد قديم مخزّن داخل رسالة الطالبة
  from: ChatRole;
  text: string;
  at: string;
  audioParts?: number;
  audioSeconds?: number;
}

const DELETED_AUDIO_TEXTS = ['🎙️ رسالة صوتية', '🎙️ رد صوتي'];

// تحويل مستندات الرسائل إلى فقاعات مرتبة زمنيًا
export const toBubbles = (items: StudentMessage[]): Bubble[] => {
  const out: Bubble[] = [];
  for (const m of items) {
    out.push({
      key: m.id,
      msg: m,
      isReply: false,
      from: (m.from as ChatRole) || 'student',
      text: m.message,
      at: m.submittedAt || '',
      audioParts: m.audioParts,
      audioSeconds: m.audioSeconds
    });
    if (m.reply) {
      out.push({
        key: `${m.id}_reply`,
        msg: m,
        isReply: true,
        from: m.repliedBy === 'teacher' ? 'teacher' : 'academy',
        text: m.reply,
        at: m.repliedAt || m.submittedAt || '',
        audioParts: m.replyAudioParts,
        audioSeconds: m.replyAudioSeconds
      });
    }
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
};

const timeLabel = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

interface Props {
  isAr: boolean;
  me: ChatRole;
  items: StudentMessage[];
  title: string;
  subtitle?: string;
  emptyText?: string;
  onSend: (text: string, audio: RecordedAudio | null) => Promise<void>;
  // الأكاديمية فقط
  moderator?: boolean;
  onDeleteAudio?: (b: Bubble) => Promise<void>;
  onDeleteMessage?: (b: Bubble) => Promise<void>;
  onClearReport?: (m: StudentMessage) => Promise<void>;
  // الطالبة والمعلمة
  onReport?: (b: Bubble) => Promise<void>;
  height?: string;
}

// محادثة بشكل واتساب: فقاعات، تسجيل صوتي، إرسال سريع
export const ChatThread: React.FC<Props> = ({
  isAr,
  me,
  items,
  title,
  subtitle,
  emptyText,
  onSend,
  moderator,
  onDeleteAudio,
  onDeleteMessage,
  onClearReport,
  onReport,
  height = 'h-[60vh] min-h-[380px]'
}) => {
  const [text, setText] = useState('');
  const [audio, setAudio] = useState<RecordedAudio | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const bubbles = useMemo(() => toBubbles(items), [items]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [bubbles.length]);

  const send = async () => {
    if ((!text.trim() && !audio) || sending) return;
    setSending(true);
    setError('');
    try {
      await onSend(text, audio);
      setText('');
      setAudio(null);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message === 'audio-too-long'
          ? isAr ? 'التسجيل طويل جدًا.' : 'The recording is too long.'
          : `${isAr ? 'تعذر الإرسال' : 'Could not send'} ${err?.code || ''}`
      );
    } finally {
      setSending(false);
    }
  };

  const act = async (b: Bubble, fn?: (b: Bubble) => Promise<void>) => {
    if (!fn) return;
    setBusyKey(b.key);
    try {
      await fn(b);
    } finally {
      setBusyKey('');
    }
  };

  const who = (r: ChatRole) => (r === 'student' ? (isAr ? 'الطالبة' : 'Student') : r === 'teacher' ? (isAr ? 'المعلمة' : 'Teacher') : isAr ? 'الأكاديمية' : 'Academy');

  return (
    <div className="rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-sm flex flex-col">
      <div className="px-4 py-3 bg-[#0A192F] text-[#F3E5AB]">
        <div className="font-bold text-sm">{title}</div>
        {subtitle && <div className="text-[11px] text-gray-300">{subtitle}</div>}
      </div>

      <div className={`${height} overflow-y-auto px-3 py-4 space-y-2 bg-[#EFEAE2]`}>
        {bubbles.length === 0 && (
          <div className="text-center text-xs text-gray-500 bg-white/70 rounded-xl p-3 mx-auto max-w-xs">
            {emptyText || (isAr ? 'لا توجد رسائل بعد. ابدئي المحادثة.' : 'No messages yet.')}
          </div>
        )}
        {bubbles.map((b) => {
          const mine = b.from === me;
          const showText = !(b.audioParts && DELETED_AUDIO_TEXTS.includes(b.text));
          const audioGone = !b.audioParts && b.msg.audioDeleted && DELETED_AUDIO_TEXTS.includes(b.text);
          return (
            <div key={b.key} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow-sm text-xs space-y-1 ${
                  mine ? 'bg-[#DCF8C6] rounded-ee-sm' : 'bg-white rounded-es-sm'
                } ${b.msg.reported && !b.isReply ? 'ring-2 ring-red-400' : ''}`}
              >
                {!mine && <div className={`text-[10px] font-bold ${b.from === 'academy' ? 'text-[#AA820A]' : b.from === 'teacher' ? 'text-indigo-700' : 'text-emerald-700'}`}>{b.from === 'student' ? b.msg.name || who(b.from) : who(b.from)}</div>}
                {mine && me !== 'student' && b.from !== 'student' && <div className="text-[10px] font-bold text-gray-500">{who(b.from)}</div>}
                {b.audioParts ? (
                  <MessageAudioPlayer messageId={b.msg.id} kind={b.isReply ? 'reply' : 'msg'} parts={b.audioParts} seconds={b.audioSeconds} isAr={isAr} />
                ) : null}
                {audioGone ? (
                  <p className="text-gray-400 italic flex items-center gap-1">
                    <MicOff className="w-3.5 h-3.5" />
                    {isAr ? 'حذفت الأكاديمية هذا التسجيل' : 'Recording removed by the academy'}
                  </p>
                ) : (
                  showText && <p className="text-gray-800 whitespace-pre-line break-words">{b.text}</p>
                )}
                {b.msg.reported && !b.isReply && (moderator || me !== 'academy') && (
                  <div className="text-[10px] text-red-600 font-bold">
                    {isAr ? 'مُبلّغ عنها' : 'Reported'}
                    {moderator && b.msg.reportReason ? `: ${b.msg.reportReason}` : ''}
                    {moderator && onClearReport && (
                      <button onClick={() => onClearReport(b.msg)} className="ms-2 underline">
                        {isAr ? 'إغلاق البلاغ' : 'Close'}
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 text-[10px] text-gray-400">
                  {busyKey === b.key && <Loader2 className="w-3 h-3 animate-spin" />}
                  {moderator && b.audioParts && onDeleteAudio ? (
                    <button onClick={() => act(b, onDeleteAudio)} className="hover:text-red-600 flex items-center gap-0.5" title={isAr ? 'حذف التسجيل فقط' : 'Delete recording only'}>
                      <MicOff className="w-3 h-3" />
                      {isAr ? 'حذف التسجيل' : 'Delete audio'}
                    </button>
                  ) : null}
                  {moderator && onDeleteMessage && (
                    <button onClick={() => act(b, onDeleteMessage)} className="hover:text-red-600" title={isAr ? 'حذف الرسالة' : 'Delete message'}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  {!moderator && onReport && !mine && !b.isReply && !b.msg.reported && (
                    <button onClick={() => act(b, onReport)} className="hover:text-red-600" title={isAr ? 'إبلاغ عن الرسالة' : 'Report'}>
                      <Flag className="w-3 h-3" />
                    </button>
                  )}
                  <span dir="ltr">{timeLabel(b.at)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-gray-200 p-2 space-y-2 bg-white">
        {error && <p className="text-[11px] text-red-600 px-1">{error}</p>}
        {audio ? (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <VoiceRecorder isAr={isAr} value={audio} onChange={setAudio} disabled={sending} />
            </div>
            <button onClick={send} disabled={sending} className="w-11 h-11 rounded-full bg-[#0A192F] text-[#F3E5AB] flex items-center justify-center disabled:opacity-50 shrink-0" title={isAr ? 'إرسال' : 'Send'}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-[#D4AF37] rtl:rotate-180" />}
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={isAr ? 'اكتبي رسالة...' : 'Type a message...'}
              className="flex-1 resize-none px-4 py-2.5 rounded-3xl border border-gray-300 text-sm max-h-32 focus:outline-none focus:border-[#D4AF37]"
            />
            {text.trim() ? (
              <button onClick={send} disabled={sending} className="w-11 h-11 rounded-full bg-[#0A192F] text-[#F3E5AB] flex items-center justify-center disabled:opacity-50 shrink-0" title={isAr ? 'إرسال' : 'Send'}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-[#D4AF37] rtl:rotate-180" />}
              </button>
            ) : (
              <div className="shrink-0">
                <VoiceRecorder isAr={isAr} value={null} onChange={setAudio} disabled={sending} compact />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
