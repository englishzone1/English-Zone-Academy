import React from 'react';

// رسالة واضحة لكل خطأ في الدخول بجوجل
export const googleErrorMessage = (code: string | undefined, isAr: boolean): string | null => {
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'redirect':
      return null;
    case 'not-admin':
      return isAr ? 'هذا الحساب ليس حساب إدارة.' : 'This Google account is not an administrator account.';
    case 'auth/operation-not-allowed':
      return isAr
        ? 'الدخول بجوجل غير مفعّل بعد في إعدادات Firebase.'
        : 'Google sign-in is not enabled yet in Firebase settings.';
    case 'auth/unauthorized-domain':
      return isAr
        ? 'رابط الموقع غير مضاف في Firebase (Authorized domains).'
        : 'This site address is not authorized in Firebase (Authorized domains).';
    case 'auth/account-exists-with-different-credential':
      return isAr
        ? 'هذا البريد مسجل بطريقة أخرى. ادخل بالبريد وكلمة المرور.'
        : 'This email is registered with another method. Sign in with email and password.';
    case 'auth/network-request-failed':
      return isAr ? 'تحقق من اتصال الإنترنت.' : 'Please check your internet connection.';
    default:
      return isAr ? 'تعذر الدخول بجوجل، حاول مرة أخرى.' : 'Google sign-in failed, please try again.';
  }
};

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export const GoogleSignInButton: React.FC<{ onClick: () => void; disabled?: boolean; isAr: boolean; dark?: boolean }> = ({
  onClick,
  disabled,
  isAr,
  dark
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 border transition-colors disabled:opacity-50 ${
      dark ? 'bg-white text-[#0A192F] border-white hover:bg-gray-100' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
    }`}
  >
    <GoogleLogo />
    <span>{isAr ? 'المتابعة بحساب Google' : 'Continue with Google'}</span>
  </button>
);

export const OrDivider: React.FC<{ isAr: boolean; dark?: boolean }> = ({ isAr, dark }) => (
  <div className={`flex items-center gap-3 text-[11px] ${dark ? 'text-gray-400' : 'text-gray-400'}`}>
    <span className={`flex-1 h-px ${dark ? 'bg-white/15' : 'bg-gray-200'}`} />
    <span>{isAr ? 'أو' : 'or'}</span>
    <span className={`flex-1 h-px ${dark ? 'bg-white/15' : 'bg-gray-200'}`} />
  </div>
);
