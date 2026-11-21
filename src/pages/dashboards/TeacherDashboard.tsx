import React, { useEffect, useState } from 'react';
import { LogOut, Users, Star, MessageSquare, Globe2, BookOpenCheck, UserRound, Mic, PenLine, MessagesSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { autoAwardHomeworkStars } from '../../services/autoStars';
import { useAuth } from '../../context/AuthContext';
import { EnglishZoneEmblem } from '../../components/common/Logo';
import { AdminStudentsManager } from '../../components/admin/AdminStudentsManager';
import { AdminStarsLedger } from '../../components/admin/AdminStarsLedger';
import { AdminMessagesManager } from '../../components/admin/AdminMessagesManager';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { AdminHomeworkResults } from '../../components/admin/AdminHomeworkResults';
import { CommunityFeed } from '../../components/community/CommunityFeed';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { toEZAvatar } from '../../components/avatar/ezAvatar';
import { squarePhoto } from '../../services/studentHubService';
import { ChatHub } from '../../components/chat/ChatHub';

interface TeacherDashboardProps {
  navigate: (route: string) => void;
}

type Tab = 'students' | 'results' | 'ledger' | 'messages' | 'chats' | 'community';

// لوحة المعلم: طلاب مجموعاته فقط، بدون صلاحيات الإدارة
export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ navigate }) => {
  const { language } = useLanguage();
  const { user, firebaseUser, logout, saveAvatarConfig } = useAuth();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [tab, setTab] = useState<Tab>('students');
  const [notice, setNotice] = useState('');

  const notify = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 4000);
  };

  // نجوم تلقائية لطلابي عن الواجبات والاختبارات التي حلّوها في الموقع
  useEffect(() => {
    if (!firebaseUser) return;
    autoAwardHomeworkStars({ teacherId: firebaseUser.uid, awardedBy: user?.fullName || 'Teacher', asTeacher: true }).then((n) => {
      if (n) notify(isAr ? `مُنحت نجوم تلقائية عن ${n} واجب/اختبار.` : `Auto stars given for ${n} homework/tests.`);
    });
  }, [firebaseUser?.uid]);

  const unreadMsgs = useUnreadMessages('teacher', firebaseUser?.uid);
  const tabs: { id: Tab; ar: string; en: string; icon: any }[] = [
    { id: 'students', ar: 'طلابي', en: 'My students', icon: Users },
    { id: 'results', ar: 'نتائج الواجبات', en: 'Homework results', icon: BookOpenCheck },
    { id: 'ledger', ar: 'سجل النجوم', en: 'Stars ledger', icon: Star },
    { id: 'messages', ar: 'رسائل الطلاب', en: 'Messages', icon: MessageSquare },
    { id: 'chats', ar: 'المحادثات', en: 'Chats', icon: MessagesSquare },
    { id: 'community', ar: 'مجتمع الطلاب', en: 'Community', icon: Globe2 }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-[#D4AF37]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer group" title={tr('Change my photo', 'تغيير صورتي')}>
              {(user as any)?.avatarConfig?.photo ? (
                <AvatarRenderer config={(user as any).avatarConfig} size={56} />
              ) : (
                <span className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                  <UserRound className="w-7 h-7" />
                </span>
              )}
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0A192F] text-[9px] font-bold">
                {tr('Photo', 'صورة')}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const photo = await squarePhoto(f);
                    await saveAvatarConfig({ ...toEZAvatar((user as any)?.avatarConfig), photo, mode: 'photo' } as any);
                    notify(tr('Photo saved.', 'تم حفظ صورتك.'));
                  } catch {
                    notify(tr('Could not save the photo.', 'تعذر حفظ الصورة.'));
                  }
                }}
              />
            </label>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#AA820A]">{tr('Teacher portal', 'بوابة المعلم')}</span>
              <h1 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{user?.fullName}</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-start">
          <button
            onClick={() => navigate('rooms')}
            className="px-4 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5"
          >
            <Mic className="w-4 h-4" />
            {tr('Voice rooms with my students', 'الغرف الصوتية مع طلابي')}
          </button>
          <button
            onClick={() => navigate('board')}
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A192F] text-xs font-bold flex items-center gap-1.5"
          >
            <PenLine className="w-4 h-4" />
            {tr('Whiteboard', 'السبورة')}
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate('staff');
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-red-600 flex items-center gap-1.5 self-start"
          >
            <LogOut className="w-4 h-4" />
            {tr('Sign out', 'تسجيل الخروج')}
          </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                  tab === t.id ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {isAr ? t.ar : t.en}
                {t.id === 'messages' && unreadMsgs > 0 && (
                <span className="ms-1.5 inline-flex min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold items-center justify-center animate-pulse">{unreadMsgs}</span>
              )}
              </button>
            );
          })}
        </div>

        {notice && (
          <div className="p-3 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-semibold text-center">{notice}</div>
        )}

        {tab === 'students' && <AdminStudentsManager onNotice={notify} teacherMode />}
        {tab === 'results' && <AdminHomeworkResults onNotice={notify} teacherMode />}
        {tab === 'ledger' && <AdminStarsLedger onNotice={notify} teacherMode />}
        {tab === 'messages' && <AdminMessagesManager onNotice={notify} teacherMode />}
        {tab === 'chats' && firebaseUser && (
          <ChatHub me={{ uid: firebaseUser.uid, name: user?.fullName || tr('Teacher', 'المعلم'), role: 'teacher' }} isAr={isAr} />
        )}
        {tab === 'community' && firebaseUser && (
          <CommunityFeed uid={firebaseUser.uid} name={user?.fullName || tr('Teacher', 'معلم')} role="teacher" isAr={isAr} avatar={(user as any)?.avatarConfig} />
        )}
      </div>
    </div>
  );
};
