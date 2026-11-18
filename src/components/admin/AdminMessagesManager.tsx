import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Mail, Trash2, CheckCircle, Flag } from 'lucide-react';
import { db } from '../../services/firebase';
import { studentHubService, deleteMessageWithAudio, StudentMessage } from '../../services/studentHubService';
import { VoiceRecorder, MessageAudioPlayer, RecordedAudio } from '../common/VoiceRecorder';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { groupService } from '../../services/groupService';

interface Props {
  onNotice: (message: string) => void;
  // وضع المعلم: رسائل طلاب مجموعاته فقط
  teacherMode?: boolean;
}

type ContactMessage = StudentMessage;

// رسائل نموذج "راسلنا" في صفحة التواصل
export const AdminMessagesManager: React.FC<Props> = ({ onNotice, teacherMode = false }) => {
  const { firebaseUser } = useAuth();
  const [avatars, setAvatars] = useState<Record<string, any>>({});
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [replyAudio, setReplyAudio] = useState<Record<string, RecordedAudio | null>>({});
  const [sendingId, setSendingId] = useState('');
  const [onlyReported, setOnlyReported] = useState(false);

  const sendReply = async (m: ContactMessage) => {
    const text = (replies[m.id] || '').trim();
    const audio = replyAudio[m.id] || null;
    if (!text && !audio) return;
    setSendingId(m.id);
    try {
      const extra = await studentHubService.replyToMessage(m.id, text, {
        by: teacherMode ? 'teacher' : 'academy',
        studentId: m.studentId,
        teacherId: teacherMode ? firebaseUser?.uid : m.teacherId,
        audio
      });
      setItems((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, ...extra, reply: text || '🎙️ رد صوتي', status: 'replied', repliedBy: teacherMode ? 'teacher' : 'academy' } : x))
      );
      setReplies((prev) => ({ ...prev, [m.id]: '' }));
      setReplyAudio((prev) => ({ ...prev, [m.id]: null }));
      onNotice(tr('Reply sent. The student sees it in their dashboard.', 'تم إرسال الرد، ويراه الطالب في لوحته.'));
    } catch (err: any) {
      onNotice(`${tr('Could not send:', 'تعذر الإرسال:')} ${err?.code || err?.message || ''}`);
    } finally {
      setSendingId('');
    }
  };

  const report = async (m: ContactMessage) => {
    const reason = window.prompt(tr('Reason for the report (academy only):', 'سبب البلاغ (يصل للأكاديمية فقط):'), '');
    if (reason === null) return;
    try {
      await studentHubService.reportMessage(m.id, 'teacher', reason || '');
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, reported: true } : x)));
      onNotice(tr('Reported to the academy.', 'تم إرسال البلاغ للأكاديمية.'));
    } catch (err: any) {
      onNotice(`${tr('Could not report:', 'تعذر الإبلاغ:')} ${err?.code || ''}`);
    }
  };

  const clearReport = async (m: ContactMessage) => {
    try {
      await studentHubService.clearReport(m.id);
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, reported: false } : x)));
    } catch (err: any) {
      onNotice(`${tr('Could not update:', 'تعذر التحديث:')} ${err?.code || ''}`);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const uid = firebaseUser?.uid || '';
      const snap = await getDocs(
        teacherMode
          ? query(collection(db, 'contact_messages'), where('teacherId', '==', uid))
          : collection(db, 'contact_messages')
      );
      // الإدارة ترى كل الرسائل، ومعها اسم معلم الطالب إن وُجد
      if (!teacherMode) {
        groupService
          .getTeachers()
          .then((ts) => setTeacherNames(Object.fromEntries(ts.map((t) => [t.id, t.fullName || t.email]))))
          .catch(() => undefined);
      }
      // أفاتار كل طالب بجانب رسالته
      try {
        const people = teacherMode
          ? await groupService.getTeacherStudents(uid)
          : (await getDocs(collection(db, 'users'))).docs.map((d) => ({ ...(d.data() as any), id: d.id }));
        setAvatars(Object.fromEntries(people.filter((p: any) => p.avatarConfig).map((p: any) => [p.id, p.avatarConfig])));
      } catch {
        // الأفاتار اختياري
      }
      setItems(
        snap.docs
          .map((d) => ({ ...(d.data() as any), id: d.id } as ContactMessage))
          .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
      );
    } catch (err: any) {
      console.error(err);
      onNotice(`${tr('Could not load messages:', 'تعذر تحميل الرسائل:')} ${err?.code || ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (m: ContactMessage) => {
    try {
      await updateDoc(doc(db, 'contact_messages', m.id), { status: 'read' });
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: 'read' } : x)));
    } catch (err: any) {
      onNotice(`${tr('Could not update:', 'تعذر التحديث:')} ${err?.code || ''}`);
    }
  };

  const remove = async (m: ContactMessage) => {
    if (!window.confirm(tr('Delete this message and its recordings?', 'حذف هذه الرسالة وتسجيلاتها الصوتية؟'))) return;
    try {
      await deleteMessageWithAudio(m);
      setItems((prev) => prev.filter((x) => x.id !== m.id));
    } catch (err: any) {
      onNotice(`${tr('Could not delete:', 'تعذر الحذف:')} ${err?.code || ''}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{teacherMode ? tr('Student messages', 'رسائل طلابي') : tr('All Messages', 'كل الرسائل')}</h2>
        <p className="text-xs text-gray-500">
          {teacherMode
            ? tr('Reply in writing or by voice. The academy can see all messages; only the academy can delete them. You can report a message.', 'ردّي كتابةً أو صوتيًا. الأكاديمية تطّلع على كل الرسائل وهي وحدها تحذفها، ويمكنكِ الإبلاغ عن أي رسالة.')
            : tr('Contact-page messages and all student ↔ teacher messages, including voice recordings.', 'رسائل صفحة التواصل وكل رسائل الطالبات والمعلمات، مع التسجيلات الصوتية.')}
        </p>
        {!teacherMode && items.some((m) => m.reported) && (
          <button
            onClick={() => setOnlyReported((v) => !v)}
            className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${onlyReported ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border border-red-200'}`}
          >
            <Flag className="w-3.5 h-3.5" />
            {tr('Reported messages', 'الرسائل المبلّغ عنها')} ({items.filter((m) => m.reported).length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No messages yet.', 'لا توجد رسائل بعد.')}</div>
      ) : (
        <div className="space-y-3">
          {items.filter((m) => !onlyReported || m.reported).map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border bg-white space-y-2 ${m.reported ? 'border-red-400' : m.status === 'new' ? 'border-[#D4AF37]' : 'border-gray-200'}`}
            >
              {m.reported && (
                <div className="p-2 rounded-lg bg-red-50 text-red-700 text-[11px] font-bold flex flex-wrap items-center gap-2">
                  <Flag className="w-3.5 h-3.5" />
                  <span>
                    {tr('Reported by', 'بلاغ من')} {m.reportedBy === 'teacher' ? tr('the teacher', 'المعلمة') : tr('the student', 'الطالبة')}
                    {m.reportReason ? `: ${m.reportReason}` : ''}
                  </span>
                  {!teacherMode && (
                    <button onClick={() => clearReport(m)} className="ms-auto px-2 py-0.5 rounded bg-white border border-red-200">
                      {tr('Close report', 'إغلاق البلاغ')}
                    </button>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {m.studentId && <AvatarRenderer config={avatars[m.studentId]} size={30} />}
                  {m.status === 'new' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold">{tr('New', 'جديدة')}</span>
                  )}
                  <span className="font-bold text-xs text-[#0A192F]">{m.name}</span>
                  {m.studentId && (
                    <span className="px-2 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB] text-[10px] font-bold">{tr('Student', 'طالب')}</span>
                  )}
                  {!teacherMode && (m as any).teacherId && (
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#7A5C00] text-[10px] font-bold">
                      {tr('Teacher:', 'المعلم:')} {teacherNames[(m as any).teacherId] || '—'}
                    </span>
                  )}
                  <a href={`mailto:${m.email}`} className="text-[11px] text-[#AA820A] underline" dir="ltr">
                    {m.email}
                  </a>
                </div>
                <span className="text-[10px] text-gray-400">{m.submittedAt ? new Date(m.submittedAt).toLocaleString() : ''}</span>
              </div>
              {m.subject && <div className="text-xs font-semibold text-gray-700">{m.subject}</div>}
              <p className="text-xs text-gray-600 whitespace-pre-line">{m.message}</p>
              {!!m.audioParts && <MessageAudioPlayer messageId={m.id} kind="msg" parts={m.audioParts} seconds={m.audioSeconds} isAr={isAr} />}
              {m.reply && (
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/40 text-xs space-y-1">
                  <div>
                    <b className="text-[#AA820A]">
                      {m.repliedBy === 'teacher' ? tr('Teacher reply:', 'رد المعلمة:') : m.repliedBy === 'academy' ? tr('Academy reply:', 'رد الأكاديمية:') : tr('Reply:', 'الرد:')}
                    </b>{' '}
                    <span className="whitespace-pre-line">{m.reply}</span>
                  </div>
                  {!!m.replyAudioParts && <MessageAudioPlayer messageId={m.id} kind="reply" parts={m.replyAudioParts} seconds={m.replyAudioSeconds} isAr={isAr} />}
                </div>
              )}
              {m.studentId && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={replies[m.id] || ''}
                      onChange={(e) => setReplies((prev) => ({ ...prev, [m.id]: e.target.value }))}
                      placeholder={tr('Write a reply the student will see...', 'اكتبي ردًا تراه الطالبة في لوحتها...')}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                    <button
                      onClick={() => sendReply(m)}
                      disabled={sendingId === m.id || (!(replies[m.id] || '').trim() && !replyAudio[m.id])}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] disabled:opacity-50"
                    >
                      {sendingId === m.id ? tr('Sending...', 'جارٍ الإرسال...') : tr('Send reply', 'إرسال الرد')}
                    </button>
                  </div>
                  <VoiceRecorder isAr={isAr} value={replyAudio[m.id] || null} onChange={(a) => setReplyAudio((prev) => ({ ...prev, [m.id]: a }))} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(m.subject || 'English Zone Academy')}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{tr('Reply', 'رد')}</span>
                </a>
                {m.status === 'new' && (
                  <button onClick={() => markRead(m)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-300 text-gray-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{tr('Mark as read', 'تمت القراءة')}</span>
                  </button>
                )}
                {teacherMode && m.studentId && !m.reported && (
                  <button onClick={() => report(m)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5" />
                    <span>{tr('Report', 'إبلاغ')}</span>
                  </button>
                )}
                {!teacherMode && (
                  <button onClick={() => remove(m)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg" title={tr('Delete', 'حذف')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
