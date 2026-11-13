import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
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
import { AdminLoginPage } from './pages/AdminLoginPage';
import { EnglishClubPage } from './pages/EnglishClubPage';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
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
      <span className="font-serif-luxury font-bold text-sm tracking-wider text-[#0A192F]">
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
        <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
          {language === 'ar' ? 'وصول غير مصرح به' : 'Access Restricted'}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {language === 'ar'
            ? `هذه البوابة مخصصة حصرياً لرتبة (${requiredRole}). حسابك الحالي لا يمتلك الصلاحيات الإدارية لدخول هذا القسم.`
            : `This portal section requires ${requiredRole} credentials. Your authenticated account does not have sufficient role permissions.`}
        </p>
        <button
          onClick={() => navigate('portal')}
          className="px-6 py-3 rounded-xl bg-[#0A192F] text-[#F3E5AB] font-bold text-xs hover:bg-[#162B4D] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span>{language === 'ar' ? 'العودة لبوابتك المصرح بها' : 'Return to Authorized Portal'}</span>
        </button>
      </div>
    </div>
  );
};

function MainApp() {
  const { user, isAuthenticated, isLoading, isTeacher, isSuperAdmin, isAdmin } = useAuth();
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

  const renderCurrentPage = () => {
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
      case 'blog':
        return <BlogPage navigate={navigate} />;
      case 'english-club':
        return <EnglishClubPage navigate={navigate} />;
      case 'register':
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
        if (currentRoute.startsWith('course/')) {
          const courseId = currentRoute.replace('course/', '');
          return <CourseDetailsPage courseId={courseId} navigate={navigate} />;
        }
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar currentRoute={currentRoute} navigate={navigate} />
      <main className="flex-grow">
        {renderCurrentPage()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
