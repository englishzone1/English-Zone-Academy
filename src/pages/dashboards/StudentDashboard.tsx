import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { EnglishZoneEmblem } from '../../components/common/Logo';
import {
  studentDataService,
  HomeworkRecord,
  PointsLogRecord,
  GradeRecord,
  TimetableRecord
} from '../../services/studentDataService';
import { Sparkles, LogOut, Edit3, Phone, AlertCircle, MessageCircle, Gift, Mic, BookOpenCheck, Library, Map as MapIcon, Users, MessagesSquare, Eye } from 'lucide-react';
import { ChatThread } from '../../components/chat/ChatThread';
import { groupThread } from '../../services/chatService';
import { doc, getDoc } from 'firebase/firestore';
import {
  groupService,
  startOfWeek,
  startOfMonth,
  StudyGroup,
  GroupMember,
  PointsEntry
} from '../../services/groupService';
import { db } from '../../services/firebase';
import { StudentMonthlyReport } from '../../components/student/StudentMonthlyReport';
import { StudentProgressChart } from '../../components/student/StudentProgressChart';
import { CurriculumViewer } from '../../components/student/CurriculumViewer';
import { StudentCourseMaterials, StudentLibrary, StudentMessages, StudentFeedback } from '../../components/student/StudentHubPanels';
import { CommunityFeed } from '../../components/community/CommunityFeed';
import { HomeworkPlatform } from '../../components/student/HomeworkPlatform';
import { VisitorDashboard } from '../../components/student/VisitorDashboard';
import { CompleteProfile } from '../../components/student/CompleteProfile';
import { DailyChallenge } from '../../components/student/DailyChallenge';
import { useAcademySettings, formatMoney } from '../../hooks/useAcademySettings';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { ReferralOffers } from '../../components/student/ReferralOffers';

interface StudentDashboardProps {
  navigate: (route: string) => void;
  // معاينة الإدارة: صفحة الطالب كما يراها هو، للعرض فقط
  previewUser?: any;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ navigate, previewUser }) => {
  const { currency: siteCurrency } = useAcademySettings();
  const { language } = useLanguage();
  const auth = useAuth();
  const preview = !!previewUser;
  const user: any = preview ? previewUser : auth.user;
  const firebaseUser: any = preview ? { uid: previewUser.id, email: previewUser.email } : auth.firebaseUser;
  const hasProfile = preview ? true : auth.hasProfile;
  const isAuthLoading = preview ? false : auth.isLoading;
  const logout = auth.logout;
  const unreadMsgs = useUnreadMessages('student', firebaseUser?.uid);
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'overview' | 'group' | 'groupchat' | 'community' | 'stars' | 'curriculum' | 'library' | 'homework' | 'messages' | 'feedback' | 'subscription' | 'offers'>('overview');
  const [homeworkList, setHomeworkList] = useState<HomeworkRecord[]>([]);
  const [pointsLog, setPointsLog] = useState<PointsLogRecord[]>([]);
  const [gradesList, setGradesList] = useState<GradeRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableRecord[]>([]);
  // مجموعتي: تُقرأ فقط مجموعة الطالب (القواعد تمنع غيرها)
  const [myGroup, setMyGroup] = useState<StudyGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupLog, setGroupLog] = useState<PointsEntry[]>([]);
  const [groupError, setGroupError] = useState(false);

  // رابط واتساب من إعدادات الأكاديمية في لوحة الإدارة فقط (لا قيمة ثابتة)
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'academy_settings', 'main'))
      .then((snap) => {
        const link = snap.exists() ? String((snap.data() as any).whatsapp || '').trim() : '';
        setWhatsappLink(link);
      })
      .catch(() => setWhatsappLink(''));
  }, []);

  // The student dashboard opens only after the academy sets subscriptionStatus = 'active'
  const isActive =
    !!user && hasProfile && String((user as any).subscriptionStatus || '').toLowerCase() === 'active';

  useEffect(() => {
    if (!firebaseUser || !isActive) return;

    const loadStudentData = async () => {
      try {
        const [hw, pts, gr, tt] = await Promise.all([
          studentDataService.getStudentHomework(firebaseUser.uid),
          studentDataService.getStudentPointsLog(firebaseUser.uid),
          studentDataService.getStudentGrades(firebaseUser.uid),
          studentDataService.getStudentTimetable(firebaseUser.uid)
        ]);
        setHomeworkList(hw || []);
        setPointsLog(pts || []);
        setGradesList(gr || []);
        setTimetable(tt || []);
      } catch (err) {
        console.error('Error fetching student records:', err);
      }
    };

    loadStudentData();
  }, [firebaseUser, isActive]);

  const myGroupId: string = String((user as any)?.groupId || '');

  useEffect(() => {
    if (!firebaseUser || !isActive || !myGroupId) return;
    setGroupError(false);
    Promise.all([
      groupService.getGroupById(myGroupId),
      groupService.getGroupMembers(myGroupId),
      groupService.getGroupPointsLog(myGroupId)
    ])
      .then(([g, m, l]) => {
        setMyGroup(g);
        setGroupMembers(m);
        setGroupLog(l);
      })
      .catch((err) => {
        console.error('Error loading group board:', err);
        setGroupError(true);
      });
  }, [firebaseUser, isActive, myGroupId]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-sm text-gray-500">
        {isAr ? 'جارٍ التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (!firebaseUser) {
    navigate('login');
    return null;
  }

  // حساب زائر مجاني: صفحة الكتب المجانية ودعوة للاشتراك
  if (!isActive && hasProfile && ['', 'pending'].includes(String((user as any)?.subscriptionStatus || '').toLowerCase())) {
    return (
      <VisitorDashboard
        isAr={isAr}
        uid={firebaseUser.uid}
        name={(user as any)?.fullName || ''}
        whatsapp={whatsappLink}
        navigate={navigate}
        onLogout={async () => {
          await logout();
          navigate('home');
        }}
      />
    );
  }

  // Waiting for the academy: no profile yet, or subscription not activated
  if (!isActive) {
    const status = String((user as any)?.subscriptionStatus || '').toLowerCase();
    const title = hasProfile
      ? (isAr ? 'حسابك بانتظار تفعيل الاشتراك' : 'Your Account Is Awaiting Activation')
      : (isAr ? 'ملف الطالب قيد التجهيز' : 'Student Profile Not Ready');
    const message = hasProfile
      ? (isAr
          ? 'تم إنشاء حسابك. ستظهر لك لوحة الطالب بعد أن تؤكد إدارة الأكاديمية اشتراكك وتحدد مستواك ودورتك.'
          : 'Your account has been created. Your student dashboard will appear once the academy confirms your subscription and assigns your level and course.')
      : (isAr
          ? 'ملف الطالب الخاص بك غير جاهز بعد. يرجى التواصل مع إدارة الأكاديمية.'
          : 'Your student profile is not ready yet. Please contact the academy administration.');

    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#D4AF37]/40 shadow-2xl max-w-lg w-full text-center space-y-6">
          <div className="flex justify-center">
            <EnglishZoneEmblem sizeClass="w-20 h-20" glow={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isAr ? 'بانتظار الاعتماد الأكاديمي' : 'Pending Academic Approval'}</span>
          </div>

          <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">{title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 text-xs text-left rtl:text-right space-y-1.5 font-mono text-gray-700">
            <div className="flex justify-between gap-3">
              <span className="text-gray-400 font-sans">{isAr ? 'البريد:' : 'Account Email:'}</span>
              <span className="font-bold break-all">{firebaseUser.email}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400 font-sans">UID:</span>
              <span className="text-[10px] break-all">{firebaseUser.uid}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400 font-sans">{isAr ? 'الحالة:' : 'Status:'}</span>
              <span className="text-amber-700 font-bold">{status || 'pending'}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {whatsappLink && (
            <a
              href={`${whatsappLink}${whatsappLink.includes('?') ? '&' : '?'}text=${encodeURIComponent(`Hello Admissions, I have created my English Zone account (${firebaseUser.email}, UID: ${firebaseUser.uid}). Please activate my student profile.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>{isAr ? 'تواصل عبر واتساب للتفعيل' : 'Contact via WhatsApp'}</span>
            </a>
            )}

            <button
              onClick={async () => {
                await logout();
                navigate('login');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isAr ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Active student: show ONLY what the academy has set ----------
  const student: any = user!;
  const level: string | undefined = student.mainLevel || undefined;
  const courseName: string | undefined = student.enrolledCourseName || undefined;
  const stage: string | undefined = student.currentStage || undefined;
  const rawTeacher = String(student.assignedTeacherName || '').trim();
  // لا يظهر بريد المعلم للطالب أبدًا
  const teacherName: string | undefined = rawTeacher && !rawTeacher.includes('@') ? rawTeacher : undefined;
  const tuition: number | undefined = typeof student.monthlyTuitionUSD === 'number' ? student.monthlyTuitionUSD : undefined;
  const progress: number | undefined = typeof student.stageProgress === 'number' ? student.stageProgress : undefined;
  const lessonsAttended = typeof student.lessonsAttended === 'number' ? student.lessonsAttended : undefined;
  const lessonsTotal = typeof student.lessonsTotal === 'number' ? student.lessonsTotal : undefined;

  const lessonMinutes = Number((student as any).lessonDuration) || 0;
  const durLabel = lessonMinutes ? ` (${lessonMinutes} ${isAr ? 'دقيقة' : 'min'})` : '';
  const formatLabel: string | undefined =
    student.learningFormat === 'individual'
      ? (isAr ? 'فردي (خاص)' : 'Private 1-on-1') + durLabel
      : student.learningFormat === 'group'
      ? (isAr ? 'جماعي' : 'Group') + durLabel
      : lessonMinutes
      ? `${lessonMinutes} ${isAr ? 'دقيقة' : 'min'}`
      : undefined;

  const detailItems: { label: string; value: string }[] = [];
  if (lessonsAttended !== undefined && lessonsTotal !== undefined) {
    detailItems.push({ label: isAr ? 'الحصص المنجزة' : 'Lessons Attended', value: `${lessonsAttended} / ${lessonsTotal}` });
  }
  if (teacherName) {
    detailItems.push({ label: isAr ? 'المعلم' : 'Instructor', value: teacherName });
  }
  if (formatLabel) {
    detailItems.push({ label: isAr ? 'نظام الحصة' : 'Lesson Format', value: formatLabel });
  }

  const notSet = isAr ? 'لم يُحدد بعد' : 'Not set yet';

  // ---------- My group board ----------
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  const sumSince = (sid: string, since: Date) =>
    groupLog
      .filter((l) => l.studentId === sid && new Date(l.timestamp) >= since)
      .reduce((a, l) => a + (Number(l.amount) || 0), 0);
  const boardRows = groupMembers.map((m) => ({
    m,
    total: Number(m.points) || 0,
    week: sumSince(m.id, weekStart),
    month: sumSince(m.id, monthStart)
  }));
  const topBy = (key: 'total' | 'week' | 'month') => {
    const top = [...boardRows].sort((a, b) => b[key] - a[key])[0];
    return top && top[key] > 0 ? top : null;
  };
  const groupLeader = topBy('total');
  const groupStarWeek = topBy('week');
  const groupStarMonth = topBy('month');
  const myRank = boardRows.findIndex((r) => r.m.id === firebaseUser.uid) + 1;
  const myWeek = sumSince(firebaseUser.uid, weekStart);
  const myMonth = sumSince(firebaseUser.uid, monthStart);

  // في المعاينة: يُسمح فقط بالتنقل بين التبويبات، وكل زر أو حقل آخر معطّل
  const blockInPreview = (e: React.SyntheticEvent) => {
    if (!preview) return;
    const el = e.target as HTMLElement;
    if (el.closest('[data-pv-ok]')) return;
    if (el.closest('button, a, input, textarea, select, label, [role="button"], audio')) {
      if ((el.closest('audio') as any)) return;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8" onClickCapture={blockInPreview} onKeyDownCapture={blockInPreview} onChangeCapture={blockInPreview}>
      {preview && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="p-3 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {isAr ? `معاينة: هذه صفحة ${student.fullName || ''} كما تراها هي، للعرض فقط ولا يمكن تعديل أي شيء.` : `Preview: ${student.fullName || ''}'s page as they see it. View only — nothing can be changed.`}
          </div>
        </div>
      )}
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate('avatar-studio')}
              className="relative cursor-pointer group"
              title="Open Avatar Studio"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow group-hover:scale-105 transition-transform bg-[#0A192F]">
                {student.avatarConfig ? (
                  <AvatarRenderer config={student.avatarConfig} size={64} showBackground={false} />
                ) : (
                  <EnglishZoneEmblem sizeClass="w-full h-full" glow={false} />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shadow">
                <Edit3 className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F]">
                  {student.fullName}
                </h1>
                {level && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/40">
                    {isAr ? 'المستوى' : 'Level'} {level}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {student.email}
                {formatLabel ? ` • ${formatLabel}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
              <div className="col-span-2 px-4 py-2 rounded-2xl bg-[#0A192F] border border-[#D4AF37]/40 text-[#F3E5AB] flex items-center gap-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <div className="text-left rtl:text-right">
                  <span className="text-[10px] text-gray-400 block leading-none">English Zone Stars</span>
                  <span className="font-bold text-base text-[#F3E5AB]">{student.points || 0} {isAr ? 'نقطة' : 'Points'}</span>
                </div>
              </div>
              {/* الرسائل: زر ظاهر دائمًا تحت النقاط */}
              <button
                data-pv-ok
                onClick={() => {
                  setActiveTab('messages');
                  setTimeout(() => document.getElementById('ez-tab-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                }}
                className={`relative px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border shadow-sm transition-all ${
                  activeTab === 'messages' ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37]' : 'bg-white text-[#0A192F] border-[#D4AF37]/60 hover:bg-[#FAF8F5]'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-[#AA820A]" />
                <span>{isAr ? 'الرسائل' : 'Messages'}</span>
                {unreadMsgs > 0 && (
                  <span className="absolute -top-2 -end-2 min-w-[20px] h-[20px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow">
                    {unreadMsgs}
                  </span>
                )}
              </button>
              {/* الواجبات والاختبارات: وصول سريع */}
              <button
                data-pv-ok
                onClick={() => {
                  setActiveTab('homework');
                  setTimeout(() => document.getElementById('ez-tab-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border shadow-sm transition-all ${
                  activeTab === 'homework' ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37]' : 'bg-white text-[#0A192F] border-[#D4AF37]/60 hover:bg-[#FAF8F5]'
                }`}
              >
                <BookOpenCheck className="w-4 h-4 text-[#AA820A]" />
                <span>{isAr ? 'الواجبات والاختبارات' : 'Homework & tests'}</span>
              </button>
              {/* المكتبة، والمنهج والمراحل، ومجموعتي: وصول سريع */}
              {(
                [
                  { id: 'library', icon: Library, ar: 'المكتبة', en: 'Library' },
                  { id: 'curriculum', icon: MapIcon, ar: 'المنهج والمراحل', en: 'Curriculum' },
                  { id: 'group', icon: Users, ar: 'مجموعتي', en: 'My group' },
                  { id: 'groupchat', icon: MessagesSquare, ar: 'شات المجموعة', en: 'Group chat' }
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  data-pv-ok
                  onClick={() => {
                    setActiveTab(b.id);
                    setTimeout(() => document.getElementById('ez-tab-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border shadow-sm transition-all ${
                    activeTab === b.id ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37]' : 'bg-white text-[#0A192F] border-[#D4AF37]/60 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <b.icon className="w-4 h-4 text-[#AA820A]" />
                  <span>{isAr ? b.ar : b.en}</span>
                </button>
              ))}
              {/* الغرف الصوتية */}
              <button
                onClick={() => navigate('rooms')}
                className="col-span-2 px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border shadow-sm bg-white text-[#0A192F] border-[#D4AF37]/60 hover:bg-[#FAF8F5]"
              >
                <Mic className="w-4 h-4 text-[#AA820A]" />
                <span>{isAr ? 'الغرف الصوتية' : 'Voice rooms'}</span>
              </button>
              {/* العروض: لامعة وعائمة */}
              <button
                data-pv-ok
                onClick={() => {
                  setActiveTab('offers');
                  setTimeout(() => document.getElementById('ez-tab-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                }}
                className="ez-float-glow col-span-2 px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] border border-[#D4AF37]"
              >
                <Gift className="w-4 h-4" />
                <span>{isAr ? 'العروض: {ادعُ|ادعي} {واربح|واربحي}' : 'Offers: invite & earn'}</span>
              </button>
            </div>

            <button
              onClick={() => navigate('avatar-studio')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#D4AF37]/50 text-[#0A192F] hover:bg-[#FAF8F5] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#AA820A]" />
              <span>{isAr ? 'استوديو الأفاتار' : 'Avatar Studio'}</span>
            </button>

            <button
              onClick={async () => {
                await logout();
                navigate('login');
              }}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', labelEn: 'Overview & Lessons', labelAr: 'نظرة عامة والدروس' },
            { id: 'community', labelEn: 'Community', labelAr: 'مجتمع English Zone' },
            { id: 'feedback', labelEn: 'My Feedback', labelAr: 'رأيي' },
            { id: 'subscription', labelEn: 'Tuition & Invoices', labelAr: 'الاشتراك والفواتير' }
          ].map((tab) => (
            <button
              key={tab.id}
              data-pv-ok
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0A192F] text-[#F3E5AB] shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
              {tab.id === 'messages' && unreadMsgs > 0 && (
                <span className="ms-1.5 inline-flex min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold items-center justify-center animate-pulse">{unreadMsgs}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!preview && <CompleteProfile isAr={isAr} />}
      <div id="ez-tab-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-4">

        {activeTab === 'overview' && firebaseUser && <DailyChallenge uid={firebaseUser.uid} isAr={isAr} />}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-8 space-y-6">

              {/* Program card: only what the academy has set */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#AA820A]">
                      {isAr ? 'دورتك' : 'Your Course'}
                    </span>
                    <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-0.5">
                      {courseName || notSet}
                    </h2>
                    {(level || stage) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {level ? `${isAr ? 'المستوى' : 'Level'} ${level}` : ''}
                        {level && stage ? ' • ' : ''}
                        {stage ? `${isAr ? 'المرحلة' : 'Stage'} ${stage}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-xs font-bold text-emerald-800 border border-emerald-200 whitespace-nowrap">
                    {isAr ? 'اشتراك نشط' : 'Active Enrollment'}
                  </span>
                </div>

                {progress !== undefined && (
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                      <span>{isAr ? 'نسبة إنجاز المرحلة:' : 'Stage Progress:'}</span>
                      <span className="text-[#0A192F] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA820A] rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {detailItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center border-t border-gray-100 pt-4 text-xs">
                    {detailItems.map((item) => (
                      <div key={item.label}>
                        <span className="text-gray-400 block">{item.label}</span>
                        <span className="font-bold text-sm text-[#0A192F]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="lg:col-span-4 space-y-6">

              <StudentProgressChart uid={firebaseUser.uid} isAr={isAr} lessonsAttended={lessonsAttended} lessonsTotal={lessonsTotal} />

              <StudentMonthlyReport
                uid={firebaseUser.uid}
                isAr={isAr}
                homework={homeworkList}
                grades={gradesList}
                pointsLog={pointsLog}
                groupMembers={groupMembers}
                groupLog={groupLog}
              />

              {/* مواعيد الدرس التي كتبتها الإدارة */}
              {(Array.isArray((student as any).lessonDays) && (student as any).lessonDays.length > 0) || (student as any).lessonTime ? (
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-2">
                  <h4 className="font-serif-luxury font-bold text-sm text-[#0A192F]">{isAr ? 'مواعيد دروسك' : 'Your lesson times'}</h4>
                  <p className="text-sm font-bold text-[#0A192F]">
                    {((student as any).lessonDays || [])
                      .map((d: number) => (isAr ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])[d])
                      .join(isAr ? ' و' : ', ')}
                    {(student as any).lessonTime ? ` • ${(student as any).lessonTime}` : ''}
                    {Number((student as any).lessonDuration) ? ` • ${(student as any).lessonDuration} ${isAr ? 'دقيقة' : 'min'}` : ''}
                  </p>
                  {(student as any).lessonNote && <p className="text-xs text-gray-500">{(student as any).lessonNote}</p>}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TAB: MY GROUP */}
        {activeTab === 'group' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            {!myGroupId ? (
              <p className="text-sm text-gray-500 text-center py-6">
                {isAr ? 'لم تُضف إلى مجموعة بعد.' : 'You have not been added to a group yet.'}
              </p>
            ) : groupError ? (
              <p className="text-sm text-red-600 text-center py-6">
                {isAr ? 'تعذر تحميل بيانات المجموعة.' : 'Could not load your group.'}
              </p>
            ) : (
              <>
                <div>
                  <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
                    {myGroup?.name || (isAr ? 'مجموعتي' : 'My Group')}
                  </h2>
                  {(myGroup?.level || myGroup?.teacherName) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {[myGroup?.level, myGroup?.teacherName].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: isAr ? 'الأول في المجموعة' : 'Group Leader', row: groupLeader, value: groupLeader?.total },
                    { label: isAr ? 'نجم الأسبوع' : 'Star of the Week', row: groupStarWeek, value: groupStarWeek?.week },
                    { label: isAr ? 'نجم الشهر' : 'Star of the Month', row: groupStarMonth, value: groupStarMonth?.month }
                  ].map((c) => (
                    <div key={c.label} className="p-4 rounded-2xl bg-[#0A192F] text-center border border-[#D4AF37]/40">
                      <span className="text-[11px] text-gray-400 block">{c.label}</span>
                      <span className="font-bold text-sm text-[#F3E5AB] block mt-1">
                        {c.row ? c.row.m.fullName : '—'}
                      </span>
                      {c.row && (
                        <span className="text-xs text-[#D4AF37]">
                          {c.value} {isAr ? 'نقطة' : 'pts'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-200">
                    <span className="text-gray-400 block">{isAr ? 'ترتيبي' : 'My Rank'}</span>
                    <span className="font-bold text-base text-[#0A192F]">
                      {myRank > 0 ? `${myRank} / ${boardRows.length}` : '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-200">
                    <span className="text-gray-400 block">{isAr ? 'نقاطي هذا الأسبوع' : 'My Week'}</span>
                    <span className="font-bold text-base text-[#0A192F]">{myWeek}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-200">
                    <span className="text-gray-400 block">{isAr ? 'نقاطي هذا الشهر' : 'My Month'}</span>
                    <span className="font-bold text-base text-[#0A192F]">{myMonth}</span>
                  </div>
                </div>

                {boardRows.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    {isAr ? 'لا توجد بيانات للمجموعة بعد.' : 'No group data yet.'}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#FAF8F5] text-xs text-gray-500 border-b border-gray-200">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">{isAr ? 'الطالب' : 'Student'}</th>
                          <th className="py-2.5 px-3">{isAr ? 'الأسبوع' : 'Week'}</th>
                          <th className="py-2.5 px-3">{isAr ? 'الشهر' : 'Month'}</th>
                          <th className="py-2.5 px-3">{isAr ? 'المجموع' : 'Total'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {boardRows.map((r, i) => (
                          <tr
                            key={r.m.id}
                            className={r.m.id === firebaseUser.uid ? 'bg-[#D4AF37]/10 font-bold' : ''}
                          >
                            <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                            <td className="py-2.5 px-3 text-[#0A192F]">
                              <span className="inline-flex items-center gap-2 align-middle">
                                <AvatarRenderer config={(r.m as any).avatar} size={28} />
                              </span>{' '}
                              {r.m.fullName}
                              {r.m.id === firebaseUser.uid ? (isAr ? ' (أنت)' : ' (you)') : ''}
                            </td>
                            <td className="py-2.5 px-3">{r.week}</td>
                            <td className="py-2.5 px-3">{r.month}</td>
                            <td className="py-2.5 px-3 font-bold text-[#AA820A]">{r.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p className="text-[11px] text-gray-400">
                  {isAr
                    ? 'تقريرك الأسبوعي والشهري في «نظرة عامة»، ودرجاتك في «الواجبات والاختبارات».'
                    : 'Your weekly and monthly report is in Overview, and your grades in Homework & tests.'}
                </p>
              </>
            )}
          </div>
        )}

        {/* TAB: GROUP CHAT */}
        {activeTab === 'groupchat' && (
          myGroupId ? (
            <ChatThread
              threadId={groupThread(myGroupId)}
              me={{ uid: firebaseUser.uid, name: student.fullName || '', role: 'student' }}
              isAr={isAr}
              title={`${isAr ? 'شات المجموعة' : 'Group chat'}${myGroup?.name ? ` — ${myGroup.name}` : ''}`}
              readOnly={preview}
            />
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-gray-200 text-center text-sm text-gray-500">
              {isAr ? 'لم تُضف إلى مجموعة بعد.' : 'You have not been added to a group yet.'}
            </div>
          )
        )}

        {/* TAB: COMMUNITY */}
        {activeTab === 'community' && (
          <CommunityFeed uid={firebaseUser.uid} name={student.fullName || ''} role="student" isAr={isAr} avatar={student.avatarConfig} />
        )}

        {/* TAB: LIBRARY */}
        {activeTab === 'library' && <StudentLibrary isAr={isAr} />}

        {/* TAB: MESSAGES */}
        {activeTab === 'messages' && preview && (
          <div className="bg-white rounded-3xl p-10 border border-gray-200 text-center text-sm text-gray-500">
            {isAr ? 'الرسائل الخاصة لا تُعرض في المعاينة.' : 'Private messages are not shown in preview.'}
          </div>
        )}
        {activeTab === 'messages' && !preview && (
          <StudentMessages uid={firebaseUser.uid} name={student.fullName || ''} email={student.email || firebaseUser.email || ''} isAr={isAr} teacherId={student.teacherId} teacherName={teacherName} teacherEmail={(student as any).assignedTeacherEmail || undefined} />
        )}

        {/* TAB: FEEDBACK */}
        {activeTab === 'offers' && <ReferralOffers uid={firebaseUser.uid} isAr={isAr} active />}
        {activeTab === 'feedback' && <StudentFeedback uid={firebaseUser.uid} name={student.fullName || ''} level={level} isAr={isAr} />}

        {/* TAB 3: CURRICULUM */}
        {activeTab === 'curriculum' && (student as any).curriculumId && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm mb-6">
            <CurriculumViewer curriculumId={(student as any).curriculumId} stage={Number((student as any).curriculumStage) || 1} isAr={isAr} />
          </div>
        )}
        {activeTab === 'curriculum' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              {isAr ? 'منهجك ومرحلتك' : 'Your Curriculum & Stage'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AA820A]">
                  {isAr ? 'الدورة' : 'Course'}
                </span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">{courseName || notSet}</h4>
                {level && <p className="text-xs text-gray-500 mt-1">{isAr ? 'المستوى' : 'Level'} {level}</p>}
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {isAr ? 'المرحلة الحالية' : 'Current Stage'}
                </span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">{stage || notSet}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {isAr ? 'نظام الحصة' : 'Instruction Format'}
                </span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">{formatLabel || notSet}</h4>
              </div>
            </div>
            <StudentCourseMaterials level={level} isAr={isAr} />
          </div>
        )}

        {/* TAB 4: HOMEWORK & GRADES */}
        {activeTab === 'homework' && (
          <HomeworkPlatform
            isAr={isAr}
            uid={firebaseUser.uid}
            name={student.fullName || ''}
            groupId={(student as any).groupId}
            teacherId={(student as any).teacherId}
          />
        )}
        {/* TAB 5: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              {isAr ? 'الاشتراك والرسوم' : 'Tuition & Subscription'}
            </h2>
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A192F]">{isAr ? 'حالة الاشتراك' : 'Subscription Status'}</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                  {isAr ? 'نشط' : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-xs text-gray-600">{isAr ? 'الرسوم الشهرية' : 'Monthly Tuition'}</span>
                <span className="font-bold text-base text-[#0A192F]">
                  {tuition !== undefined ? `${formatMoney(tuition, (student as any).tuitionCurrency || siteCurrency)} / ${isAr ? 'شهر' : 'Month'}` : notSet}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
