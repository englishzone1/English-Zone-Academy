import React, { useState, useEffect } from 'react';
import { TawkChat } from './components/common/TawkChat';
import { ChatAssistant } from './components/common/ChatAssistant';
import { AccountFab } from './components/common/AccountFab';
import { OfferBubble } from './components/programs/OfferBubble';
import { StandaloneBoard } from './components/rooms/StandaloneBoard';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { TelegramWelcome } from './components/common/TelegramWelcome';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProgramsPage } from './pages/ProgramsPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { PricingPage } from './pages/PricingPage';
import { OffersPage } from './pages/OffersPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { BlogPage } from './pages/BlogPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { LibraryPage } from './pages/LibraryPage';
import { getGender, onGenderChange, startGenderObserver } from './i18n/gender';
import { storeRefCode } from './services/referralService';
import { StaffLoginPage } from './pages/StaffLoginPage';
import { WorkshopPage } from './pages/WorkshopPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { VisitorJoinPage } from './pages/VisitorJoinPage';
import { SpeakWorkshopPage } from './pages/SpeakWorkshopPage';

// رابط الورشة المستقل: /workshop يفتح صفحة الورشة مباشرة
// و /workshop/<id> يفتح صفحة التسجيل في ورشة محددة من لوحة الإدارة
if (typeof window !== 'undefined' && !window.location.hash) {
  const m = window.location.pathname.match(/^\/workshop(?:\/([A-Za-z0-9-]+))?\/?$/i);
  if (m) window.history.replaceState(null, '', m[1] ? `/#/join-workshop/${m[1]}` : '/#/speak-workshop');
}
import { HomeworkPlatform } from './components/student/HomeworkPlatform';
import { HomeworkAnswersPage } from './components/admin/HomeworkAnswersPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { VoiceRoomsPage } from './pages/VoiceRoomsPage';
import { VoiceRoomPage } from './pages/VoiceRoomPage';
import { EnglishClubPage } from './pages/EnglishClubPage';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { StudentPreviewPage } from './pages/StudentPreviewPage';
import { TeacherDashboard } from './pages/dashboards/TeacherDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { AvatarStudioPage } from './pages/dashboards/AvatarStudioPage';
import { EnglishZoneEmblem } from './components/common/Logo';
import { CEFRLevel } from './types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin-slow">
        <EnglishZoneEmblem sizeClass="w-20 h-20" glow={true} />
      </div>
      <span className="font-serif-luxury font-bold text-sm tracking-wider text-[#0E3A99]">
        ENGLISH ZONE
      </span>
      <span className="text-xs text-gray-400">
        Verifying secure authentication...
      </span>
    </div>
  </div>
);

const UnauthorizedScreen: React.FC<{ navigate: (route: string) => void; requiredRole: string }> = ({
  navigate,
  requiredRole
}) => {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-red-200 shadow-2xl max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-serif-luxury font-bold text-2xl text-[#0E3A99]">
          {language === 'ar' ? 'وصول غير مصرح به' : 'Access Restricted'}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {language === 'ar'
            ? `هذه البوابة مخصصة حصرياً لرتبة (${requiredRole}). حسابك الحالي لا يمتلك الصلاحيات الإدارية لدخول هذا القسم.`
            : `This portal section requires ${requiredRole} credentials. Your authenticated account does not have sufficient role permissions.`}
        </p>
        <button
          onClick={() => navigate('portal')}
          className="px-6 py-3 rounded-xl bg-[#0E3A99] text-[#F3E5AB] font-bold text-xs hover:bg-[#1E55C0] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span>{language === 'ar' ? 'العودة لبوابتك المصرح بها' : 'Return to Authorized Portal'}</span>
        </button>
      </div>
    </div>
  );
};

function MainApp() {
  const { language } = useLanguage();
  const { user, firebaseUser, isAuthenticated, isLoading, isTeacher, isSuperAdmin, isAdmin } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'home';
  });

  const [navigationState, setNavigationState] = useState<{
    preselectedLevel?: CEFRLevel;
    curriculumLevel?: CEFRLevel;
  }>({});

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash) {
        setCurrentRoute(hash);
      } else {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (
    route: string,
    state?: { preselectedLevel?: CEFRLevel; curriculumLevel?: CEFRLevel }
  ) => {
    if (state) {
      setNavigationState(state);
    }
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // المعلم لا يرى صفحات الموقع العامة (الأسعار والعروض والتسجيل…): لوحته فقط، بلا شعار ولا قوائم
  const teacherOnly = isTeacher && !isAdmin && !isSuperAdmin;
  // الغرفة الصوتية تملأ الشاشة (بلا القائمة العلوية والتذييل)
  const bare = teacherOnly || currentRoute === 'staff' || currentRoute === 'speak-workshop' || currentRoute.startsWith('join-workshop/') || currentRoute.startsWith('workshop/') || currentRoute.startsWith('room/');
  useEffect(() => {
    if (teacherOnly) document.title = 'لوحة المعلم';
  }, [teacherOnly]);

  const renderCurrentPage = () => {
    if (
      teacherOnly &&
      !['teacher-dashboard', 'portal', 'homework', 'avatar-studio', 'login', 'student-login', 'staff', 'rooms', 'board'].includes(currentRoute) &&
      !currentRoute.startsWith('hw-answers/') &&
      !currentRoute.startsWith('room/')
    ) {
      return <TeacherDashboard navigate={navigate} />;
    }
    switch (currentRoute) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'programs':
        return <ProgramsPage navigate={navigate} />;
      case 'curriculum':
        return <CurriculumPage navigate={navigate} initialLevel={navigationState.curriculumLevel} />;
      case 'pricing':
        return <PricingPage navigate={navigate} />;
      case 'offers':
        return <OffersPage navigate={navigate} />;
      case 'about':
        return <AboutPage navigate={navigate} />;
      case 'contact':
        return <ContactPage navigate={navigate} />;
      case 'faq':
        return <FAQPage navigate={navigate} />;
      case 'testimonials':
        return <TestimonialsPage navigate={navigate} />;
      case 'library':
        return <LibraryPage navigate={navigate} />;
      case 'join':
        return <VisitorJoinPage navigate={navigate} />;
      case 'join-us':
        return <VisitorJoinPage navigate={navigate} />;
      case 'speak-workshop':
        return <SpeakWorkshopPage navigate={navigate} />;
      case 'free-workshops':
      case 'workshops':
        return <VisitorJoinPage navigate={navigate} workshop />;
      case 'blocked':
        return (
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md text-center space-y-3 bg-white rounded-3xl p-8 border border-red-200 shadow-sm">
              <h1 className="font-bold text-xl text-red-700">هذا الحساب محظور من المنصة</h1>
              <p className="text-sm text-gray-600">This account has been blocked from the platform.</p>
            </div>
          </div>
        );
      // دخول المعلمين: صفحة محايدة بلا هوية
      case 'staff':
        return <StaffLoginPage navigate={navigate} />;
      // التسجيل القادم من عروض الدعوة: بدون زر واتساب
      case 'join-offer':
        return <VisitorJoinPage navigate={navigate} hideWhatsapp />;
      // الغرف الصوتية: لكل من سجّل في المنصة
      case 'rooms':
        return <VoiceRoomsPage navigate={navigate} />;
      case 'blog':
        return <BlogPage navigate={navigate} />;
      case 'english-club':
        return <EnglishClubPage navigate={navigate} />;
      case 'register':
        // الزائرة غير المسجّلة: التسجيل الموحّد أولًا (Google أو بريد)، وطلب الكورس من داخل المنصة
        if (!isAuthenticated) return <VisitorJoinPage navigate={navigate} />;
        return <RegistrationPage navigate={navigate} initialLevel={navigationState.preselectedLevel} />;
      
      // Dedicated Student Portal Login
      case 'login':
      case 'student-login':
        return <LoginPage navigate={navigate} />;

      // Dedicated Separate Administrator Portal Login
      case 'admin-login':
        return <AdminLoginPage navigate={navigate} />;

      // Unified Authorized Portal Router
      case 'portal':
        if (isLoading) return <LoadingScreen />;
        if (!isAuthenticated) return <LoginPage navigate={navigate} targetRedirect="portal" />;
        if (isSuperAdmin || isAdmin) return <AdminDashboard navigate={navigate} />;
        if (isTeacher) return <TeacherDashboard navigate={navigate} />;
        return <StudentDashboard navigate={navigate} />;

      // Protected Student Dashboard Guard
      case 'student-dashboard':
        if (isLoading) return <LoadingScreen />;
        if (!isAuthenticated) return <LoginPage navigate={navigate} targetRedirect="student-dashboard" />;
        return <StudentDashboard navigate={navigate} />;

      // Protected Teacher Dashboard Guard
      case 'teacher-dashboard':
        if (isLoading) return <LoadingScreen />;
        if (!isAuthenticated) return <LoginPage navigate={navigate} targetRedirect="teacher-dashboard" />;
        if (!isTeacher && !isSuperAdmin && !isAdmin) return <UnauthorizedScreen navigate={navigate} requiredRole="Faculty Instructor" />;
        return <TeacherDashboard navigate={navigate} />;

      // Protected Super Administrator Dashboard Guard
      case 'admin-dashboard':
        if (isLoading) return <LoadingScreen />;
        if (!isAuthenticated) return <AdminLoginPage navigate={navigate} targetRedirect="admin-dashboard" />;
        if (!isSuperAdmin && !isAdmin) return <UnauthorizedScreen navigate={navigate} requiredRole="Super Administrator" />;
        return <AdminDashboard navigate={navigate} />;

      // Protected Avatar Studio Guard
      case 'avatar-studio':
        if (isLoading) return <LoadingScreen />;
        if (!isAuthenticated) return <LoginPage navigate={navigate} targetRedirect="avatar-studio" />;
        return <AvatarStudioPage navigate={navigate} />;

      default:
        // رابط الدعوة: يحفظ الكود ثم يفتح التسجيل
        if (currentRoute.startsWith('r/')) {
          storeRefCode(decodeURIComponent(currentRoute.slice(2)));
          setTimeout(() => navigate(isAuthenticated ? 'register' : 'join-offer'), 0);
          return <LoadingScreen />;
        }
        // صفحة الورشة العامة وصفحة التحقق من الشهادة
        if (currentRoute.startsWith('room/')) {
          return <VoiceRoomPage key={currentRoute} roomId={currentRoute.slice('room/'.length).split(/[/?]/)[0]} navigate={navigate} />;
        }
        if (currentRoute.startsWith('join-workshop/')) {
          return <SpeakWorkshopPage key={currentRoute} navigate={navigate} workshopId={currentRoute.slice('join-workshop/'.length).split(/[/?]/)[0]} />;
        }
        if (currentRoute.startsWith('workshop/')) {
          return <WorkshopPage workshopId={currentRoute.slice('workshop/'.length)} navigate={navigate} />;
        }
        if (currentRoute === 'verify' || currentRoute.startsWith('verify/')) {
          return <VerifyCertificatePage serial={decodeURIComponent(currentRoute.slice('verify/'.length))} navigate={navigate} />;
        }
        if (currentRoute.startsWith('hw-answers/')) {
          if (isLoading) return <LoadingScreen />;
          if (!isAuthenticated) return <LoginPage navigate={navigate} targetRedirect={currentRoute} />;
          return <HomeworkAnswersPage resultId={currentRoute.replace('hw-answers/', '')} navigate={navigate} />;
        }
        if (currentRoute.startsWith('student-preview/')) {
          if (isLoading) return <LoadingScreen />;
          if (!isAdmin && !isSuperAdmin) return <LoginPage navigate={navigate} targetRedirect={currentRoute} />;
          return <StudentPreviewPage key={currentRoute} studentId={currentRoute.replace('student-preview/', '')} navigate={navigate} />;
        }
        if (currentRoute.startsWith('course/')) {
          const courseId = currentRoute.replace('course/', '');
          return <CourseDetailsPage courseId={courseId} navigate={navigate} />;
        }
        return <HomePage navigate={navigate} />;
    }
  };

  // السبورة المستقلة للمعلم والإدارة: تملأ الشاشة، ولا يُحفظ عليها شيء
  if (currentRoute === 'board') {
    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated) return <LoginPage navigate={navigate} targetRedirect="board" />;
    if (!(isTeacher || isAdmin || isSuperAdmin)) return <UnauthorizedScreen navigate={navigate} requiredRole="Faculty Instructor" />;
    return <StandaloneBoard isAr={language === 'ar'} onClose={() => navigate('portal')} />;
  }

  // صفحة الواجبات الكاملة: تملأ الشاشة بلا شريط علوي ولا تذييل، وتحفظ النتائج باسم الطالب
  if (currentRoute === 'homework') {
    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated || !firebaseUser || !user) return <LoginPage navigate={navigate} targetRedirect="homework" />;
    const u: any = user;
    const staff = isSuperAdmin || isAdmin || isTeacher;
    if (!staff && String(u.subscriptionStatus || '').toLowerCase() !== 'active') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-[#FAF8F5]">
          <p className="text-sm font-bold text-[#0E3A99]">
            {language === 'ar' ? 'الواجبات تفتح بعد تفعيل اشتراكك من الأكاديمية.' : 'Homework opens after the academy activates your subscription.'}
          </p>
          <button onClick={() => navigate('portal')} className="px-4 py-2 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold">
            {language === 'ar' ? 'العودة إلى لوحتي' : 'Back to my dashboard'}
          </button>
        </div>
      );
    }
    return (
      <HomeworkPlatform
        full
        preview={staff}
        isAr={language === 'ar'}
        uid={firebaseUser.uid}
        name={u.fullName || ''}
        groupId={staff ? undefined : u.groupId}
        teacherId={staff ? undefined : u.teacherId}
        onBack={() => navigate('portal')}
      />
    );
  }

  // خارج الحساب (الصفحة الرئيسية، المدونة، المكتبة، الغرف…): زر «حسابي» بدل زر الرد الآلي
  const showAccountFab =
    isAuthenticated &&
    !isLoading &&
    !['portal', 'student-dashboard', 'teacher-dashboard', 'admin-dashboard', 'admin-login', 'login', 'student-login', 'homework'].includes(currentRoute) &&
    !currentRoute.startsWith('room/');

  return (
    <div className="flex flex-col min-h-screen">
      {!bare && <Navbar currentRoute={currentRoute} navigate={navigate} />}
      <main className="flex-grow">
        {renderCurrentPage()}
      </main>
      {!bare && <Footer navigate={navigate} />}
      <TawkChat hidden={bare || currentRoute.startsWith('room/') || ['admin-dashboard', 'admin-login', 'teacher-dashboard'].includes(currentRoute) || (currentRoute === 'portal' && (isAdmin || isTeacher))} />
      {!bare && !currentRoute.startsWith('room/') && !['portal', 'student-dashboard', 'teacher-dashboard', 'admin-dashboard', 'admin-login', 'login', 'student-login', 'homework', 'register'].includes(currentRoute) && !currentRoute.startsWith('hw-answers/') && <OfferBubble language={language} navigate={navigate} />}
      {showAccountFab && <AccountFab isAr={language === 'ar'} onClick={() => navigate('portal')} />}
      <TelegramWelcome
        uid={(user as any)?.id}
        role={(user as any)?.role}
        createdAt={(user as any)?.createdAt}
        profileDone={!!user && (user as any).nameConfirmed === true && !!String((user as any).country || '').trim() && Number((user as any).age) > 0 && ['male', 'female'].includes((user as any).gender)}
        isAr={language === 'ar'}
      />
      <ChatAssistant
        hidden={
          showAccountFab ||
          ['admin-dashboard', 'admin-login', 'teacher-dashboard'].includes(currentRoute) ||
          currentRoute.startsWith('hw-answers/') ||
          currentRoute.startsWith('room/') ||
          bare ||
          (currentRoute === 'portal' && (isAdmin || isTeacher || isSuperAdmin))
        }
      />
    </div>
  );
}

// إعادة رسم الصفحة عند معرفة جنس المشترك حتى تتحول الصيغة (مذكر/مؤنث) في كل مكان
const GenderAwareApp: React.FC = () => {
  const [g, setG] = React.useState(getGender());
  React.useEffect(() => {
    startGenderObserver();
    return onGenderChange(() => setG(getGender()));
  }, []);
  return <MainApp key={g || 'none'} />;
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GenderAwareApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
