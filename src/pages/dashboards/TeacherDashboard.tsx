import React, { useState } from 'react';
import { LogOut, Users, Star, MessageSquare, Globe2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EnglishZoneEmblem } from '../../components/common/Logo';
import { AdminStudentsManager } from '../../components/admin/AdminStudentsManager';
import { AdminStarsLedger } from '../../components/admin/AdminStarsLedger';
import { AdminMessagesManager } from '../../components/admin/AdminMessagesManager';
import { CommunityFeed } from '../../components/community/CommunityFeed';

interface TeacherDashboardProps {
  navigate: (route: string) => void;
}

type Tab = 'students' | 'ledger' | 'messages' | 'community';

// لوحة المعلم: طلاب مجموعاته فقط، بدون صلاحيات الإدارة
export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ navigate }) => {
  const { language } = useLanguage();
  const { user, firebaseUser, logout } = useAuth();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [tab, setTab] = useState<Tab>('students');
  const [notice, setNotice] = useState('');

  const notify = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 4000);
  };

  const tabs: { id: Tab; ar: string; en: string; icon: any }[] = [
    { id: 'students', ar: 'طلابي', en: 'My students', icon: Users },
    { id: 'ledger', ar: 'سجل النجوم', en: 'Stars ledger', icon: Star },
    { id: 'messages', ar: 'رسائل الطلاب', en: 'Messages', icon: MessageSquare },
    { id: 'community', ar: 'مجتمع الطلاب', en: 'Community', icon: Globe2 }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-[#D4AF37]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <EnglishZoneEmblem sizeClass="w-14 h-14" glow={false} />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#AA820A]">{tr('Teacher portal', 'بوابة المعلم')}</span>
              <h1 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{user?.fullName}</h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('login');
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-red-600 flex items-center gap-1.5 self-start"
          >
            <LogOut className="w-4 h-4" />
            {tr('Sign out', 'تسجيل الخروج')}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              </button>
            );
          })}
        </div>

        {notice && (
          <div className="p-3 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-semibold text-center">{notice}</div>
        )}

        {tab === 'students' && <AdminStudentsManager onNotice={notify} teacherMode />}
        {tab === 'ledger' && <AdminStarsLedger onNotice={notify} teacherMode />}
        {tab === 'messages' && <AdminMessagesManager onNotice={notify} teacherMode />}
        {tab === 'community' && firebaseUser && (
          <CommunityFeed uid={firebaseUser.uid} name={user?.fullName || tr('Teacher', 'معلم')} role="teacher" isAr={isAr} />
        )}
      </div>
    </div>
  );
};
