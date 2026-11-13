import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo, EnglishZoneEmblem } from '../components/common/Logo';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Terminal,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';

interface AdminLoginPageProps {
  navigate: (route: string) => void;
  targetRedirect?: string;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ 
  navigate, 
  targetRedirect = 'admin-dashboard' 
}) => {
  const { language } = useLanguage();
  const { adminLogin, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'bootstrap'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Bootstrap lock status
  const [isLockChecked, setIsLockChecked] = useState(false);
  const [isAlreadyLocked, setIsAlreadyLocked] = useState(false);

  // Check permanent initialization lock status on mount
  useEffect(() => {
    const checkLockStatus = async () => {
      try {
        if (db) {
          const lockSnap = await getDoc(doc(db, 'system_config', 'initialization_lock'));
          if (lockSnap.exists()) {
            const data = lockSnap.data();
            if (data?.initialized === true || data?.locked === true) {
              setIsAlreadyLocked(true);
            }
          }
        }
      } catch {
        // Handled silently
      } finally {
        setIsLockChecked(true);
      }
    };
    checkLockStatus();
  }, []);

  // If already authenticated with administrative rights, redirect
  useEffect(() => {
    if (isAuthenticated && (isAdmin || isSuperAdmin)) {
      navigate(targetRedirect);
    }
  }, [isAuthenticated, isAdmin, isSuperAdmin, navigate, targetRedirect]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const res = await adminLogin(email, password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(language === 'ar' ? 'تم التحقق من الصلاحيات الإدارية بنجاح. جاري الدخول...' : 'Administrative authorization verified. Redirecting to console...');
      setTimeout(() => {
        navigate(targetRedirect);
      }, 800);
    } else {
      setErrorMsg(res.message || 'Administrative authentication failed. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060D1A] via-[#0A192F] to-[#060D1A] text-white py-12 px-4 sm:px-6 flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Subtle background luxury lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back to Public Site */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span>{language === 'ar' ? 'العودة للموقع الرئيسي' : 'Return to Public Site'}</span>
        </button>

        <button
          onClick={() => navigate('login')}
          className="text-xs text-[#D4AF37] hover:underline font-semibold"
        >
          {language === 'ar' ? 'بوابة الطلاب ←' : 'Student Portal Sign In →'}
        </button>
      </div>

      {/* Main Admin Card */}
      <div className="w-full max-w-md bg-[#0C1B33]/90 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/40 shadow-2xl p-8 sm:p-10 relative">
        
        {/* Top Header */}
        <div className="text-center mb-7">
          <div className="flex justify-center mb-4">
            <EnglishZoneEmblem sizeClass="w-16 h-16" glow={true} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#162B4D] border border-[#D4AF37]/50 text-[#F3E5AB] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Administrative Officers Only</span>
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-white">
            {language === 'ar' ? 'بوابة الإدارة العليا' : 'Central Admin Console'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'ar' 
              ? 'تسجيل الدخول المخصص لقيادة الأكاديمية والمشرفين'
              : 'Restricted to authenticated Super Admins & Academy Coordinators'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#060D1A] rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'signin'
                ? 'bg-[#D4AF37] text-[#0A192F] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'تسجيل دخول المشرف' : 'Administrator Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('bootstrap'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'bootstrap'
                ? 'bg-[#D4AF37] text-[#0A192F] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            <span>{language === 'ar' ? 'التهيئة الأولى' : 'First Admin Setup'}</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* TAB 1: REGULAR ADMIN SIGN IN */}
        {activeTab === 'signin' && (
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                {language === 'ar' ? 'البريد الإلكتروني الإداري' : 'Administrator Email'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@englishzone.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#060D1A]/90 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#060D1A]/90 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>{language === 'ar' ? 'جارٍ التحقق من الهوية...' : 'Authenticating Credentials...'}</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{language === 'ar' ? 'دخول لوحة التحكم' : 'Enter Administration Console'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-gray-400">
                {language === 'ar'
                  ? 'هذه البوابة مؤمنة بقواعد Firebase Custom Claims. أي محاولات دخول غير مصرح بها يتم تسجيلها وحظرها تلقائياً.'
                  : 'Access attempts without verified administrative claims are automatically rejected and recorded.'}
              </p>
            </div>
          </form>
        )}

        {/* TAB 2: FIRST SUPER ADMIN INITIALIZATION */}
        {activeTab === 'bootstrap' && (
          <div>
            {isAlreadyLocked ? (
              <div className="p-5 rounded-2xl bg-[#060D1A] border border-amber-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-[#D4AF37] flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-white">
                  {language === 'ar' ? 'عملية التهيئة مغلقة بشكل دائم' : 'Initialization Permanently Locked'}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {language === 'ar'
                    ? 'تم تهيئة حساب المشرف العام الأول بنجاح، وتم قفل العملية نهائياً على الخادم لحماية النظام. لإضافة مشرفين جدد، يرجى تسجيل الدخول وإدارتهم من داخل لوحة التحكم.'
                    : 'The initial Super Admin account has already been initialized and permanently locked on the backend. Additional administrative staff can only be provisioned from within the Super Admin Console.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs hover:brightness-110"
                >
                  {language === 'ar' ? 'الذهاب لتسجيل الدخول' : 'Proceed to Admin Sign In'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold mb-1 text-amber-300">
                    <Terminal className="w-4 h-4 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'التهيئة عبر سطر الأوامر (CLI)' : 'Secure CLI Initialization Required'}</span>
                  </div>
                  <p>
                    {language === 'ar'
                      ? 'لأسباب أمنية صارمة ومنعاً لكشف المفتاح السري عبر المتصفح، يتم تهيئة حساب المشرف العام الأول حصرياً عبر أداة سطر الأوامر الآمنة (Firebase Admin SDK).'
                      : 'To prevent browser network exposure of bootstrap secrets, the initial Super Admin account is provisioned exclusively via the backend Admin SDK CLI.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#060D1A] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-mono text-[11px] text-[#D4AF37]">scripts/init-first-super-admin.ts</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10">Firebase Admin SDK</span>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-400 overflow-x-auto select-all">
                    npm run init:admin -- "&lt;BOOTSTRAP_SECRET&gt;" "amalalhasan2006@gmail.com" "&lt;SECURE_PASSWORD&gt;" "Super Administrator"
                  </div>

                  <p className="text-[11px] text-gray-400 leading-normal">
                    {language === 'ar'
                      ? 'إذا كان البريد مسجلاً مسبقاً، أضف خيار --confirm-promote-existing للترقية الآمنة.'
                      : 'If your email is already registered, add the flag --confirm-promote-existing to promote your account.'}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-gray-300">
                  <div className="font-bold text-gray-200">
                    {language === 'ar' ? 'خطوات التنفيذ:' : 'Execution Steps:'}
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400 text-[11px] leading-relaxed">
                    <li>
                      {language === 'ar'
                        ? 'تأكد من إعداد صلاحيات Application Default Credentials أو مفتاح الخدمة.'
                        : 'Ensure Google Cloud ADC or Service Account credentials are configured.'}
                    </li>
                    <li>
                      {language === 'ar'
                        ? 'شغّل الأمر أعلاه مع استبدال الرموز بكلمة المرور والمفتاح السري.'
                        : 'Run the command above with your Secret Manager bootstrap secret.'}
                    </li>
                    <li>
                      {language === 'ar'
                        ? 'بعد انتهاء التهيئة بنجاح، عُد إلى تبويب "تسجيل دخول المشرف" للمتابعة.'
                        : 'Once initialized and locked, switch back to Administrator Sign In.'}
                    </li>
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] font-bold text-xs hover:brightness-105 transition-all shadow-md"
                >
                  {language === 'ar' ? 'العودة إلى شاشة تسجيل الدخول' : 'Return to Administrator Sign In'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Security Footer Notice */}
      <div className="mt-8 text-center text-xs text-gray-400 max-w-sm">
        <p>
          English Zone International Academy • Information Security & Access Control
        </p>
      </div>

    </div>
  );
};
