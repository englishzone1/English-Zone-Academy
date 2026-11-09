import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
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
import { CertificatesPage } from './pages/CertificatesPage';
import { BlogPage } from './pages/BlogPage';
import { PlacementTestPage } from './pages/PlacementTestPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { CEFRLevel } from './types';

function MainApp() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    // Read route from URL hash if available (supports GitHub Pages & direct reloads)
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'home';
  });

  const [navigationState, setNavigationState] = useState<{ preselectedLevel?: CEFRLevel }>({});

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

  const navigate = (route: string, state?: { preselectedLevel?: CEFRLevel }) => {
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
        return <CurriculumPage navigate={navigate} />;
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
      case 'certificates':
        return <CertificatesPage navigate={navigate} />;
      case 'blog':
        return <BlogPage navigate={navigate} />;
      case 'placement-test':
        return <PlacementTestPage navigate={navigate} />;
      case 'register':
        return <RegistrationPage navigate={navigate} initialLevel={navigationState.preselectedLevel} />;
      case 'login':
      case 'portal':
        return <LoginPage navigate={navigate} />;
      default:
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
      <MainApp />
    </LanguageProvider>
  );
}

export default App;
