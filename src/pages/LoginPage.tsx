import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { 
  Lock, 
  Mail, 
  User,
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
  targetRedirect?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate, targetRedirect }) => {
  const { t, language } = useLanguage();
  const { login, registerStudentAccount, user } = useAuth();
  
  const [authMode, setAuthMode] = useState<'signin' | 'activate'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    if (authMode === 'signin') {
      const res = await login(email, password);
      setIsLoading(false);

      if (res.success) {
        if (targetRedirect) {
          navigate(targetRedirect);
        } else {
          navigate('portal');
        }
      } else {
        setErrorMsg(res.message || 'Authentication rejected. Please check your credentials.');
      }
    } else {
      // First-time student account creation / password activation
      if (!fullName.trim()) {
        setIsLoading(false);
        setErrorMsg('Please enter your full legal name as submitted during admission registration.');
        return;
      }
      if (password.length < 6) {
        setIsLoading(false);
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      const res = await registerStudentAccount(email, password, fullName);
      setIsLoading(false);

      if (res.success) {
        setSuccessMsg('Account created successfully! Connecting to student portal...');
        setTimeout(() => {
          navigate(targetRedirect || 'student-dashboard');
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Could not register student account.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/30 shadow-2xl">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Logo variant="light" onClick={() => navigate('home')} />
            </div>
            <h1 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              {authMode === 'signin' 
                ? (language === 'ar' ? 'بوابة الدخول الموحدة' : 'Academy Portal Sign In')
                : (language === 'ar' ? 'تفعيل حساب طالب جديد' : 'Activate Student Account')}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'ar'
                ? 'تسجيل دخول آمن مشفر بتقنية Firebase Authentication'
                : 'Secured via verified Firebase Authentication'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 p-1 bg-[#FAF8F5] rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                authMode === 'signin'
                  ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-[#0A192F]'
              }`}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('activate');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                authMode === 'activate'
                  ? 'bg-[#0A192F] text-[#F3E5AB] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-[#0A192F]'
              }`}
            >
              {language === 'ar' ? 'طالب جديد (إنشاء كلمة مرور)' : 'First Time (Set Password)'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === 'activate' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1">
                  {language === 'ar' ? 'الاسم الكامل للطالب' : 'Full Student Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Fahad Al-Mohammad"
                    className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            )}

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
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F]">
                  {t.login.password}
                </label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      alert(language === 'ar' 
                        ? 'يرجى التواصل مع إدارة الأكاديمية عبر واتساب لإعادة ضبط كلمة المرور.'
                        : 'Please contact the academy administration to reset your account password.');
                    }}
                    className="text-[11px] text-[#AA820A] font-semibold hover:underline"
                  >
                    {t.login.forgotPassword}
                  </button>
                )}
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

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] transition-colors flex items-center justify-center gap-2 shadow disabled:opacity-50"
            >
              <span>
                {isLoading 
                  ? (language === 'ar' ? 'جارٍ التحقق الأمني...' : 'Verifying Credentials...') 
                  : authMode === 'signin' 
                  ? t.login.signInBtn 
                  : (language === 'ar' ? 'إنشاء الحساب ودخول البوابة' : 'Create Account & Enter')}
              </span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
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
