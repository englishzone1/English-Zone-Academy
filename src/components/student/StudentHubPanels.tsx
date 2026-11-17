import React, { useEffect, useState } from 'react';
import { BookOpen, Headphones, PlayCircle, Link as LinkIcon, Newspaper, Send, Star, MessageSquare } from 'lucide-react';
import { studentHubService, CourseMaterials, MaterialType, StudentMessage } from '../../services/studentHubService';

const card = 'bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5';
const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]';

const typeIcon = (t: MaterialType) =>
  t === 'book' ? BookOpen : t === 'audio' ? Headphones : t === 'video' ? PlayCircle : LinkIcon;

/* ------------------------------ Course materials (for the student's level) ------------------------------ */

export const StudentCourseMaterials: React.FC<{ level?: string; isAr: boolean }> = ({ level, isAr }) => {
  const [items, setItems] = useState<CourseMaterials[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!level) {
      setLoaded(true);
      return;
    }
    studentHubService
      .getMaterialsForLevel(level)
      .then(setItems)
      .catch((err) => console.error('Error loading materials:', err))
      .finally(() => setLoaded(true));
  }, [level]);

  const withLinks = items.filter((m) => m.links && m.links.length > 0);
  if (!loaded || withLinks.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F]">{isAr ? 'مواد المنهج' : 'Course Materials'}</h3>
      {withLinks.map((m) => (
        <div key={m.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
          <span className="font-bold text-sm text-[#0A192F]">{(isAr ? m.courseTitleAr : m.courseTitleEn) || m.courseTitleAr || m.courseTitleEn}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {m.links.map((l, i) => {
              const Icon = typeIcon(l.type);
              return (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-white border border-[#D4AF37]/30 hover:border-[#D4AF37] text-xs font-semibold text-[#0A192F]"
                >
                  <Icon className="w-4 h-4 text-[#AA820A] shrink-0" />
                  <span>{l.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------ Library & monthly magazine ------------------------------ */

export const StudentLibrary: React.FC<{ isAr: boolean }> = ({ isAr }) => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentHubService
      .getPublishedLibrary()
      .then(setBooks)
      .catch((err) => console.error('Error loading library:', err))
      .finally(() => setLoading(false));
  }, []);

  const catLabel = (c: string) =>
    ({
      magazine: isAr ? 'المجلة الشهرية' : 'Monthly Magazine',
      curriculum: isAr ? 'منهج' : 'Curriculum',
      reading: isAr ? 'قراءة' : 'Reading',
      grammar: isAr ? 'قواعد' : 'Grammar',
      vocabulary: isAr ? 'مفردات' : 'Vocabulary'
    } as Record<string, string>)[c] || c;

  return (
    <div className={card}>
      <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">{isAr ? 'المكتبة' : 'Library'}</h2>
      {loading ? (
        <p className="text-xs text-gray-500 text-center py-6">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>
      ) : books.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-6">{isAr ? 'لا توجد كتب منشورة بعد.' : 'No books published yet.'}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {books.map((b) => {
            const Icon = b.category === 'magazine' ? Newspaper : BookOpen;
            const title = (isAr ? b.titleAr : b.titleEn) || b.titleAr || b.titleEn;
            return (
              <div key={b.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-[#AA820A] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-[#0A192F] block">{title}</span>
                    <span className="text-[11px] text-gray-500">
                      {[catLabel(b.category), b.level && b.level !== 'All Levels' ? b.level : ''].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                </div>
                {b.downloadUrl && (
                  <a
                    href={b.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] whitespace-nowrap"
                  >
                    {isAr ? 'فتح' : 'Open'}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ Messages with the academy ------------------------------ */

export const StudentMessages: React.FC<{ uid: string; name: string; email: string; isAr: boolean; teacherId?: string }> = ({ uid, name, email, isAr, teacherId }) => {
  const [items, setItems] = useState<StudentMessage[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const load = () =>
    studentHubService
      .getMyMessages(uid)
      .then(setItems)
      .catch((err) => console.error('Error loading messages:', err));

  useEffect(() => {
    load();
  }, [uid]);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    setStatus('');
    try {
      await studentHubService.sendStudentMessage({ studentId: uid, name, email, subject, message, teacherId });
      setSubject('');
      setMessage('');
      setStatus(isAr ? 'تم إرسال رسالتك.' : 'Your message was sent.');
      await load();
    } catch (err) {
      console.error(err);
      setStatus(isAr ? 'تعذر الإرسال، حاول مرة أخرى.' : 'Could not send, please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={card}>
      <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">{isAr ? 'رسائلي مع الأكاديمية' : 'My Messages'}</h2>

      <div className="space-y-3">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={isAr ? 'الموضوع (اختياري)' : 'Subject (optional)'} className={inputCls} />
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={isAr ? 'اكتب رسالتك...' : 'Write your message...'} className={inputCls} />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-gray-500">{status}</span>
          <button
            onClick={send}
            disabled={sending || !message.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4 text-[#D4AF37]" />
            <span>{sending ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : isAr ? 'إرسال' : 'Send'}</span>
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          {items.map((m) => (
            <div key={m.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#0A192F]">{m.subject || (isAr ? 'رسالة' : 'Message')}</span>
                <span className="text-[10px] text-gray-400">{new Date(m.submittedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{m.message}</p>
              {m.reply ? (
                <div className="p-3 rounded-xl bg-white border border-[#D4AF37]/40 space-y-1">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#AA820A]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {isAr ? 'رد الأكاديمية' : 'Academy reply'}
                  </span>
                  <p className="text-gray-700 whitespace-pre-line">{m.reply}</p>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400">{isAr ? 'بانتظار الرد' : 'Awaiting reply'}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ Student feedback (testimonial) ------------------------------ */

export const StudentFeedback: React.FC<{ uid: string; name: string; level?: string; isAr: boolean }> = ({ uid, name, level, isAr }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    setStatus('');
    try {
      await studentHubService.submitTestimonial({ studentId: uid, name, level, text, rating });
      setText('');
      setStatus(
        isAr
          ? 'شكرًا لك! وصل رأيك، وسيظهر في الموقع بعد موافقة الإدارة.'
          : 'Thank you! Your feedback will appear on the site after approval.'
      );
    } catch (err) {
      console.error(err);
      setStatus(isAr ? 'تعذر الإرسال، حاول مرة أخرى.' : 'Could not send, please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={card}>
      <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">{isAr ? 'اكتب رأيك' : 'Share Your Feedback'}</h2>
      <p className="text-xs text-gray-500">
        {isAr ? 'رأيك يساعدنا ويساعد الطلاب الجدد. يظهر في الموقع بعد موافقة الإدارة.' : 'Your feedback appears on the site after the academy approves it.'}
      </p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} title={String(n)}>
            <Star className={`w-6 h-6 ${n <= rating ? 'text-[#D4AF37] fill-current' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
      <textarea rows={4} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder={isAr ? 'اكتب تجربتك مع الأكاديمية...' : 'Write about your experience...'} className={inputCls} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">{status}</span>
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4 text-[#D4AF37]" />
          <span>{sending ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : isAr ? 'إرسال رأيي' : 'Send feedback'}</span>
        </button>
      </div>
    </div>
  );
};
