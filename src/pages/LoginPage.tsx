import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/common/Logo';
import { 
  Lock, 
  Mail, 
  GraduationCap, 
  BookOpen, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(t.login.demoNotice);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/30 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo variant="light" onClick={() => navigate('home')} />
            </div>
            <h1 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              {t.login.title}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {t.login.subtitle}
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2 text-center">
              {t.login.roleHint}
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  role === 'student'
                    ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm'
                    : 'text-gray-600 hover:text-[#0A192F]'
                }`}
              >
                {t.login.roleStudent}
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  role === 'teacher'
                    ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm'
                    : 'text-gray-600 hover:text-[#0A192F]'
                }`}
              >
                {t.login.roleTeacher}
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm'
                    : 'text-gray-600 hover:text-[#0A192F]'
                }`}
              >
                {t.login.roleAdmin}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1">
                {t.login.email}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === 'admin' 
                      ? 'admin@englishzone.com' 
                      : role === 'teacher' 
                      ? 'teacher@englishzone.com' 
                      : 'student@example.com'
                  }
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F]">
                  {t.login.password}
                </label>
                <button
                  type="button"
                  onClick={() => alert(language === 'ar' ? 'سيتم ربط استعادة كلمة المرور في المرحلة 2 عبر Firebase.' : 'Password reset link will be sent via Firebase in Phase 2.')}
                  className="text-[11px] text-[#AA820A] font-semibold hover:underline"
                >
                  {t.login.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {notice && (
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/50 text-xs text-[#0A192F] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] transition-colors flex items-center justify-center gap-2 shadow"
            >
              <span>{t.login.signInBtn} ({role.toUpperCase()})</span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>

            {/* Google Sign In button placeholder */}
            <button
              type="button"
              onClick={() => setNotice(t.login.demoNotice)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t.login.googleSignIn}</span>
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-6 mt-6 border-t border-gray-100 text-center text-xs text-gray-500">
            <span>{t.login.needAccount} </span>
            <button
              onClick={() => navigate('register')}
              className="font-bold text-[#0A192F] hover:text-[#AA820A] underline"
            >
              {t.login.registerLink}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
