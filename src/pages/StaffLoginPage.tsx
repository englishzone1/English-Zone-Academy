import React, { useEffect, useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// دخول المعلمين: صفحة محايدة بلا شعار ولا اسم ولا قوائم
export const StaffLoginPage: React.FC<{ navigate: (r: string) => void }> = ({ navigate }) => {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'لوحة المعلم';
    if (isAuthenticated) navigate('teacher-dashboard');
  }, [isAuthenticated]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = await login(email.trim(), password);
    setBusy(false);
    if (!r.success) setError('البريد أو كلمة المرور غير صحيحة.');
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4" dir="rtl">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-md border border-gray-200 space-y-4">
        <h1 className="font-bold text-lg text-gray-800 text-center">دخول المعلم</h1>
        <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm" />
        <input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm" />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          دخول
        </button>
        <button
          type="button"
          onClick={async () => {
            setError('');
            const r = await loginWithGoogle();
            if (!r.success && r.code !== 'auth/popup-closed-by-user') setError('تعذر الدخول بحساب Google.');
          }}
          className="w-full py-3 rounded-xl border border-gray-300 text-sm font-bold text-gray-700"
        >
          الدخول بحساب Google
        </button>
      </form>
    </div>
  );
};
