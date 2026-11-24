import React, { useEffect, useState } from 'react';
import { BookOpen, Headphones, PlayCircle, Link as LinkIcon, Newspaper, Send, Star, MessageSquare } from 'lucide-react';
import { studentHubService, CourseMaterials, MaterialType, StudentMessage } from '../../services/studentHubService';
import { RecordedAudio } from '../common/VoiceRecorder';
import { ChatThread, Bubble } from '../common/ChatThread';
import { notifyNewMessage, getAcademyNotifyEmail } from '../../services/emailNotify';
import { sendChatMessage, markMessagesRead } from '../../services/studentHubService';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

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
      <h3 className="font-serif-luxury font-bold text-lg text-[#0E3A99]">{isAr ? 'مواد المنهج' : 'Course Materials'}</h3>
      {withLinks.map((m) => (
        <div key={m.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
          <span className="font-bold text-sm text-[#0E3A99]">{(isAr ? m.courseTitleAr : m.courseTitleEn) || m.courseTitleAr || m.courseTitleEn}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {m.links.map((l, i) => {
              const Icon = typeIcon(l.type);
              return (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-white border border-[#D4AF37]/30 hover:border-[#D4AF37] text-xs font-semibold text-[#0E3A99]"
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
      <h2 className="font-serif-luxury font-bold text-2xl text-[#0E3A99]">{isAr ? 'المكتبة' : 'Library'}</h2>
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
                    <span className="font-bold text-sm text-[#0E3A99] block">{title}</span>
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
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0E3A99] text-[#F3E5AB] whitespace-nowrap"
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

export const StudentMessages: React.FC<{ uid: string; name: string; email: string; isAr: boolean; teacherId?: string; teacherName?: string; teacherEmail?: string }> = ({
  uid,
  name,
  email,
  isAr,
  teacherId,
  teacherName,
  teacherEmail
}) => {
  const [items, setItems] = useState<StudentMessage[]>([]);
  const [loadError, setLoadError] = useState('');

  // تحديث فوري للمحادثة
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'contact_messages'), where('studentId', '==', uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as StudentMessage));
        setItems(list);
        // رسائل المعلمة والأكاديمية الجديدة تُعلَّم مقروءة
        const unread = list.filter((m) => m.from && m.from !== 'student' && m.status === 'new').map((m) => m.id);
        if (unread.length) markMessagesRead(unread);
      },
      (err) => {
        console.error('Error loading messages:', err);
        setLoadError(isAr ? 'تعذر تحميل الرسائل.' : 'Could not load messages.');
      }
    );
    return unsub;
  }, [uid]);

  const send = async (text: string, audio: RecordedAudio | null) => {
    await sendChatMessage({ from: 'student', studentId: uid, teacherId, name, email, text, audio });
    // تنبيه المعلمة والأكاديمية بالبريد
    const preview = text.trim() || '🎙️ رسالة صوتية';
    if (teacherId && teacherEmail) notifyNewMessage({ toEmail: teacherEmail, toName: teacherName, fromName: name, preview });
    getAcademyNotifyEmail().then((to) => notifyNewMessage({ toEmail: to, toName: 'English Zone', fromName: name, preview }));
  };

  const report = async (b: Bubble) => {
    const reason = window.prompt(isAr ? 'سبب البلاغ (يصل للأكاديمية فقط):' : 'Reason for the report (academy only):', '');
    if (reason === null) return;
    await studentHubService.reportMessage(b.msg.id, 'student', reason || '');
  };

  return (
    <div className="space-y-2">
      {loadError && <p className="text-xs text-red-600">{loadError}</p>}
      <ChatThread
        isAr={isAr}
        me="student"
        items={items}
        title={isAr ? (teacherId ? `محادثتي مع ${teacherName ? `المعلمة ${teacherName}` : 'معلمتي'} والأكاديمية` : 'محادثتي مع الأكاديمية') : 'My chat'}
        subtitle={isAr ? '{اكتب|اكتبي} أو {سجّل|سجّلي} صوتك (حتى 10 دقائق). الأكاديمية تطّلع على المحادثة.' : 'Type or record (up to 10 min). The academy can see this chat.'}
        onSend={send}
        onReport={report}
      />
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
      <h2 className="font-serif-luxury font-bold text-2xl text-[#0E3A99]">{isAr ? 'اكتب رأيك' : 'Share Your Feedback'}</h2>
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
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0E3A99] text-[#F3E5AB] disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4 text-[#D4AF37]" />
          <span>{sending ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : isAr ? 'إرسال رأيي' : 'Send feedback'}</span>
        </button>
      </div>
    </div>
  );
};
