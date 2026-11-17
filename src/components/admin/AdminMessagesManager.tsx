import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Mail, Trash2, CheckCircle } from 'lucide-react';
import { db } from '../../services/firebase';
import { studentHubService } from '../../services/studentHubService';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onNotice: (message: string) => void;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  submittedAt: string;
  studentId?: string;
  reply?: string;
}

// رسائل نموذج "راسلنا" في صفحة التواصل
export const AdminMessagesManager: React.FC<Props> = ({ onNotice }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Record<string, string>>({});

  const sendReply = async (m: ContactMessage) => {
    const text = (replies[m.id] || '').trim();
    if (!text) return;
    try {
      await studentHubService.replyToMessage(m.id, text);
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, reply: text, status: 'replied' } : x)));
      setReplies((prev) => ({ ...prev, [m.id]: '' }));
      onNotice(tr('Reply sent. The student sees it in their dashboard.', 'تم إرسال الرد، ويراه الطالب في لوحته.'));
    } catch (err: any) {
      onNotice(`${tr('Could not send:', 'تعذر الإرسال:')} ${err?.code || ''}`);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'contact_messages'));
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
    if (!window.confirm(tr('Delete this message?', 'حذف هذه الرسالة؟'))) return;
    try {
      await deleteDoc(doc(db, 'contact_messages', m.id));
      setItems((prev) => prev.filter((x) => x.id !== m.id));
    } catch (err: any) {
      onNotice(`${tr('Could not delete:', 'تعذر الحذف:')} ${err?.code || ''}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{tr('Contact Messages', 'رسائل التواصل')}</h2>
        <p className="text-xs text-gray-500">{tr('Messages sent from the Contact page form.', 'الرسائل المرسلة من نموذج صفحة التواصل.')}</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No messages yet.', 'لا توجد رسائل بعد.')}</div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border bg-white space-y-2 ${m.status === 'new' ? 'border-[#D4AF37]' : 'border-gray-200'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {m.status === 'new' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold">{tr('New', 'جديدة')}</span>
                  )}
                  <span className="font-bold text-xs text-[#0A192F]">{m.name}</span>
                  {m.studentId && (
                    <span className="px-2 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB] text-[10px] font-bold">{tr('Student', 'طالب')}</span>
                  )}
                  <a href={`mailto:${m.email}`} className="text-[11px] text-[#AA820A] underline" dir="ltr">
                    {m.email}
                  </a>
                </div>
                <span className="text-[10px] text-gray-400">{m.submittedAt ? new Date(m.submittedAt).toLocaleString() : ''}</span>
              </div>
              {m.subject && <div className="text-xs font-semibold text-gray-700">{m.subject}</div>}
              <p className="text-xs text-gray-600 whitespace-pre-line">{m.message}</p>
              {m.reply && (
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/40 text-xs">
                  <b className="text-[#AA820A]">{tr('Your reply:', 'ردك:')}</b> <span className="whitespace-pre-line">{m.reply}</span>
                </div>
              )}
              {m.studentId && (
                <div className="flex items-center gap-2">
                  <input
                    value={replies[m.id] || ''}
                    onChange={(e) => setReplies((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    placeholder={tr('Write a reply the student will see...', 'اكتب ردًا يراه الطالب في لوحته...')}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                  <button onClick={() => sendReply(m)} className="px-3 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB]">
                    {tr('Send reply', 'إرسال الرد')}
                  </button>
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
                <button onClick={() => remove(m)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg" title={tr('Delete', 'حذف')}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
