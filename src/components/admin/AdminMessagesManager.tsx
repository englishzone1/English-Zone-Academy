import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Mail, Trash2, CheckCircle, Flag, Search, ArrowRight, MessageCircle, Inbox } from 'lucide-react';
import { db } from '../../services/firebase';
import {
  studentHubService,
  deleteMessageWithAudio,
  deleteMessageAudioOnly,
  deleteLegacyReply,
  markMessagesRead,
  sendChatMessage,
  StudentMessage
} from '../../services/studentHubService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { groupService } from '../../services/groupService';
import { ChatThread, Bubble } from '../common/ChatThread';
import { RecordedAudio } from '../common/VoiceRecorder';

interface Props {
  onNotice: (message: string) => void;
  // وضع المعلم: محادثات طلابه فقط
  teacherMode?: boolean;
}

interface Person {
  id: string;
  name: string;
  email: string;
  teacherId?: string;
  avatarConfig?: any;
}

const isFromStudent = (m: StudentMessage) => !m.from || m.from === 'student';
const lastAt = (m: StudentMessage) => (m.repliedAt && m.repliedAt > (m.submittedAt || '') ? m.repliedAt : m.submittedAt || '');

const seenKey = (role: string, sid: string) => `ez_chat_seen_${role}_${sid}`;
const getSeen = (role: string, sid: string) => {
  try {
    return localStorage.getItem(seenKey(role, sid)) || '';
  } catch {
    return '';
  }
};
const setSeen = (role: string, sid: string) => {
  try {
    localStorage.setItem(seenKey(role, sid), new Date().toISOString());
  } catch {
    /* ignore */
  }
};

// المحادثات بشكل واتساب: قائمة الطالبات + المحادثة. الإدارة ترى الكل وتحذف، والمعلمة ترى طالباتها وتبلّغ.
export const AdminMessagesManager: React.FC<Props> = ({ onNotice, teacherMode = false }) => {
  const { firebaseUser, user } = useAuth();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const role = teacherMode ? 'teacher' : 'academy';
  const uid = firebaseUser?.uid || '';

  const [all, setAll] = useState<StudentMessage[]>([]);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState('');
  const [search, setSearch] = useState('');
  const [onlyReported, setOnlyReported] = useState(false);
  const [view, setView] = useState<'chats' | 'contact'>('chats');
  const [seenTick, setSeenTick] = useState(0);

  // الرسائل بتحديث فوري
  useEffect(() => {
    if (!uid) return;
    const q = teacherMode ? query(collection(db, 'contact_messages'), where('teacherId', '==', uid)) : collection(db, 'contact_messages');
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAll(snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as StudentMessage)));
        setLoading(false);
      },
      (err: any) => {
        console.error(err);
        setLoading(false);
        onNotice(`${tr('Could not load messages:', 'تعذر تحميل الرسائل:')} ${err?.code || ''}`);
      }
    );
    return unsub;
  }, [uid, teacherMode]);

  // الطالبات (لبدء محادثة حتى بلا رسائل)
  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const list: any[] = teacherMode
          ? await groupService.getTeacherStudents(uid)
          : (await getDocs(collection(db, 'users'))).docs
              .map((d) => ({ ...(d.data() as any), id: d.id }))
              .filter((u) => u.role === 'student' && u.subscriptionStatus && u.subscriptionStatus !== 'pending');
        setPeople(
          Object.fromEntries(
            list.map((u) => [u.id, { id: u.id, name: u.fullName || u.email || '—', email: u.email || '', teacherId: u.teacherId, avatarConfig: u.avatarConfig }])
          )
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, [uid, teacherMode]);

  const chatMsgs = useMemo(() => all.filter((m) => !!m.studentId), [all]);
  const contactMsgs = useMemo(() => all.filter((m) => !m.studentId).sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '')), [all]);

  // قائمة المحادثات
  const threads = useMemo(() => {
    const map: Record<string, { id: string; msgs: StudentMessage[] }> = {};
    for (const p of Object.values(people)) map[p.id] = { id: p.id, msgs: [] };
    for (const m of chatMsgs) {
      const sid = m.studentId as string;
      (map[sid] = map[sid] || { id: sid, msgs: [] }).msgs.push(m);
    }
    return Object.values(map)
      .map((t) => {
        const sorted = [...t.msgs].sort((a, b) => lastAt(a).localeCompare(lastAt(b)));
        const last = sorted[sorted.length - 1];
        const seen = getSeen(role, t.id);
        const unread = t.msgs.filter((m) => isFromStudent(m) && (m.submittedAt || '') > seen).length;
        const firstStudentMsg = t.msgs.find(isFromStudent);
        const name = people[t.id]?.name || firstStudentMsg?.name || '—';
        return { ...t, last, unread, name, reported: t.msgs.some((m) => m.reported) };
      })
      .filter((t) => (!onlyReported || t.reported) && (!search.trim() || t.name.toLowerCase().includes(search.trim().toLowerCase())))
      .sort((a, b) => (b.last ? lastAt(b.last) : '').localeCompare(a.last ? lastAt(a.last) : '') || a.name.localeCompare(b.name));
  }, [people, chatMsgs, onlyReported, search, seenTick]);

  const activeMsgs = useMemo(() => chatMsgs.filter((m) => m.studentId === activeId), [chatMsgs, activeId]);
  const activeName = activeId ? people[activeId]?.name || activeMsgs.find(isFromStudent)?.name || '—' : '';

  // فتح محادثة = قراءة رسائلها
  useEffect(() => {
    if (!activeId) return;
    setSeen(role, activeId);
    setSeenTick((n) => n + 1);
    if (teacherMode) {
      const ids = activeMsgs.filter((m) => isFromStudent(m) && m.status === 'new').map((m) => m.id);
      if (ids.length) markMessagesRead(ids);
    }
  }, [activeId, activeMsgs.length]);

  const send = async (text: string, audio: RecordedAudio | null) => {
    if (!activeId) return;
    const p = people[activeId];
    const studentTeacher = teacherMode ? uid : p?.teacherId || activeMsgs.find((m) => m.teacherId)?.teacherId;
    await sendChatMessage({
      from: role,
      studentId: activeId,
      teacherId: studentTeacher || undefined,
      name: teacherMode ? (user as any)?.fullName || firebaseUser?.email || '' : 'English Zone Academy',
      email: firebaseUser?.email || '',
      text,
      audio
    });
  };

  const deleteAudio = async (b: Bubble) => {
    if (!window.confirm(tr('Delete this recording only? The message stays in the chat.', 'حذف التسجيل الصوتي فقط؟ تبقى الرسالة في المحادثة.'))) return;
    try {
      await deleteMessageAudioOnly(b.msg, b.isReply ? 'reply' : 'msg');
      onNotice(tr('Recording deleted.', 'تم حذف التسجيل.'));
    } catch (err: any) {
      onNotice(`${tr('Could not delete:', 'تعذر الحذف:')} ${err?.code || ''}`);
    }
  };

  const deleteMsg = async (b: Bubble) => {
    const withReply = !b.isReply && !!b.msg.reply;
    if (
      !window.confirm(
        withReply
          ? tr('Delete this message (and the reply attached to it)?', 'حذف هذه الرسالة (والرد المرتبط بها)؟')
          : tr('Delete this message only?', 'حذف هذه الرسالة فقط؟')
      )
    )
      return;
    try {
      if (b.isReply) await deleteLegacyReply(b.msg);
      else await deleteMessageWithAudio(b.msg);
    } catch (err: any) {
      onNotice(`${tr('Could not delete:', 'تعذر الحذف:')} ${err?.code || ''}`);
    }
  };

  const report = async (b: Bubble) => {
    const reason = window.prompt(tr('Reason for the report (academy only):', 'سبب البلاغ (يصل للأكاديمية فقط):'), '');
    if (reason === null) return;
    try {
      await studentHubService.reportMessage(b.msg.id, 'teacher', reason || '');
      onNotice(tr('Reported to the academy.', 'تم إرسال البلاغ للأكاديمية.'));
    } catch (err: any) {
      onNotice(`${tr('Could not report:', 'تعذر الإبلاغ:')} ${err?.code || ''}`);
    }
  };

  const clearReport = async (m: StudentMessage) => {
    try {
      await studentHubService.clearReport(m.id);
    } catch (err: any) {
      onNotice(`${tr('Could not update:', 'تعذر التحديث:')} ${err?.code || ''}`);
    }
  };

  const reportedCount = chatMsgs.filter((m) => m.reported).length;
  const contactNew = contactMsgs.filter((m) => m.status === 'new').length;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{teacherMode ? tr('Student chats', 'محادثات طلابي') : tr('Messages', 'الرسائل')}</h2>
          <p className="text-xs text-gray-500">
            {teacherMode
              ? tr('The academy can see all chats; only the academy deletes. You can report a message.', 'الأكاديمية تطّلع على كل المحادثات وهي وحدها تحذف، ويمكنكِ الإبلاغ عن أي رسالة.')
              : tr('All student ↔ teacher chats. You can delete a recording only, or a single message.', 'كل محادثات الطالبات والمعلمات. يمكنكِ حذف التسجيل وحده أو رسالة واحدة دون حذف المحادثة.')}
          </p>
        </div>
        {!teacherMode && (
          <div className="flex gap-2">
            <button onClick={() => setView('chats')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${view === 'chats' ? 'bg-[#0A192F] text-[#F3E5AB]' : 'border border-gray-200 text-gray-600'}`}>
              <MessageCircle className="w-3.5 h-3.5" />
              {tr('Chats', 'المحادثات')}
            </button>
            <button onClick={() => setView('contact')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${view === 'contact' ? 'bg-[#0A192F] text-[#F3E5AB]' : 'border border-gray-200 text-gray-600'}`}>
              <Inbox className="w-3.5 h-3.5" />
              {tr('Contact page', 'رسائل صفحة التواصل')}
              {contactNew > 0 && <span className="px-1.5 rounded-full bg-[#D4AF37] text-[#0A192F] text-[10px]">{contactNew}</span>}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : view === 'contact' && !teacherMode ? (
        <ContactList items={contactMsgs} isAr={isAr} onNotice={onNotice} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* قائمة المحادثات */}
          <div className={`${activeId ? 'hidden md:block' : ''} md:col-span-1 border border-gray-200 rounded-2xl overflow-hidden`}>
            <div className="p-2 border-b border-gray-100 space-y-2 bg-[#FAF8F5]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr('Search a student...', 'ابحثي عن طالبة...')} className="w-full ps-8 pe-3 py-2 rounded-xl border border-gray-200 text-xs" />
              </div>
              {!teacherMode && reportedCount > 0 && (
                <button
                  onClick={() => setOnlyReported((v) => !v)}
                  className={`w-full px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 ${onlyReported ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border border-red-200'}`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {tr('Reported messages', 'الرسائل المبلّغ عنها')} ({reportedCount})
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
              {threads.length === 0 && <div className="p-6 text-center text-xs text-gray-500">{tr('No chats yet.', 'لا توجد محادثات بعد.')}</div>}
              {threads.map((t) => (
                <button key={t.id} onClick={() => setActiveId(t.id)} className={`w-full text-start p-3 flex items-center gap-2 hover:bg-[#FAF8F5] ${activeId === t.id ? 'bg-[#FAF8F5]' : ''}`}>
                  <AvatarRenderer config={people[t.id]?.avatarConfig} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#0A192F] truncate">{t.name}</span>
                      {t.last && <span className="text-[10px] text-gray-400 shrink-0">{new Date(lastAt(t.last)).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500 truncate">
                        {t.last ? (t.last.reply && lastAt(t.last) === t.last.repliedAt ? t.last.reply : t.last.message) : tr('Start a chat', 'ابدئي محادثة')}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        {t.reported && <Flag className="w-3 h-3 text-red-600" />}
                        {t.unread > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">{t.unread}</span>}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* المحادثة */}
          <div className={`${activeId ? '' : 'hidden md:block'} md:col-span-2`}>
            {activeId ? (
              <div className="space-y-2">
                <button onClick={() => setActiveId('')} className="md:hidden text-xs font-bold text-[#0A192F] flex items-center gap-1">
                  <ArrowRight className="w-4 h-4 ltr:rotate-180" />
                  {tr('All chats', 'كل المحادثات')}
                </button>
                <ChatThread
                  isAr={isAr}
                  me={role}
                  items={activeMsgs}
                  title={activeName}
                  subtitle={people[activeId]?.email}
                  emptyText={tr('No messages yet. Write the first message.', 'لا توجد رسائل بعد. اكتبي أول رسالة.')}
                  onSend={send}
                  moderator={!teacherMode}
                  onDeleteAudio={teacherMode ? undefined : deleteAudio}
                  onDeleteMessage={teacherMode ? undefined : deleteMsg}
                  onClearReport={teacherMode ? undefined : clearReport}
                  onReport={teacherMode ? report : undefined}
                />
              </div>
            ) : (
              <div className="h-full min-h-[300px] rounded-2xl bg-[#FAF8F5] border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-500">
                {tr('Choose a chat from the list.', 'اختاري محادثة من القائمة.')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// رسائل نموذج «راسلنا» في صفحة التواصل (زوار بلا حساب)
const ContactList: React.FC<{ items: StudentMessage[]; isAr: boolean; onNotice: (m: string) => void }> = ({ items, isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const markRead = async (m: StudentMessage) => {
    try {
      await updateDoc(doc(db, 'contact_messages', m.id), { status: 'read' });
    } catch (err: any) {
      onNotice(`${tr('Could not update:', 'تعذر التحديث:')} ${err?.code || ''}`);
    }
  };
  const remove = async (m: StudentMessage) => {
    if (!window.confirm(tr('Delete this message?', 'حذف هذه الرسالة؟'))) return;
    try {
      await deleteMessageWithAudio(m);
    } catch (err: any) {
      onNotice(`${tr('Could not delete:', 'تعذر الحذف:')} ${err?.code || ''}`);
    }
  };
  if (items.length === 0) return <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No messages yet.', 'لا توجد رسائل بعد.')}</div>;
  return (
    <div className="space-y-3">
      {items.map((m) => (
        <div key={m.id} className={`p-4 rounded-xl border bg-white space-y-2 ${m.status === 'new' ? 'border-[#D4AF37]' : 'border-gray-200'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {m.status === 'new' && <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold">{tr('New', 'جديدة')}</span>}
              <span className="font-bold text-xs text-[#0A192F]">{m.name}</span>
              <a href={`mailto:${m.email}`} className="text-[11px] text-[#AA820A] underline" dir="ltr">
                {m.email}
              </a>
            </div>
            <span className="text-[10px] text-gray-400">{m.submittedAt ? new Date(m.submittedAt).toLocaleString() : ''}</span>
          </div>
          {m.subject && <div className="text-xs font-semibold text-gray-700">{m.subject}</div>}
          <p className="text-xs text-gray-600 whitespace-pre-line">{m.message}</p>
          <div className="flex justify-end gap-2">
            <a href={`mailto:${m.email}?subject=${encodeURIComponent(m.subject || 'English Zone Academy')}`} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] flex items-center gap-1">
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
  );
};
