import React, { useState } from 'react';
import { UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// بعد التسجيل بحساب Google أو بالبريد: نطلب الاسم ورقم الواتساب (والدولة والعمر) مرة واحدة
export const CompleteProfile: React.FC<{ isAr: boolean }> = ({ isAr }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { user, updateProfile } = useAuth();
  const u: any = user || {};
  const emailPrefix = String(u.email || '').split('@')[0];
  const [name, setName] = useState(u.fullName && u.fullName !== emailPrefix ? u.fullName : '');
  const [phone, setPhone] = useState(u.phone || '');
  const [country, setCountry] = useState(u.country || '');
  const [age, setAge] = useState(u.age ? String(u.age) : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user || (u.phone && String(u.phone).trim())) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, '').length < 7) {
      setError(tr('Write your name and a valid WhatsApp number.', 'اكتبي اسمكِ ورقم واتساب صحيحًا.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await updateProfile({
        fullName: name.trim().slice(0, 100),
        phone: phone.trim().slice(0, 30),
        ...(country.trim() ? { country: country.trim().slice(0, 60) } : {}),
        ...(Number(age) > 0 ? { age: Number(age) } : {}),
        updatedAt: new Date().toISOString()
      } as any);
    } catch {
      setError(tr('Could not save, please try again.', 'تعذّر الحفظ، حاولي مرة أخرى.'));
    } finally {
      setBusy(false);
    }
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#D4AF37]';

  return (
    <div className="fixed inset-0 z-[80] bg-[#0A192F]/70 backdrop-blur-sm flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <form onSubmit={save} className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
            <UserRound className="w-6 h-6" />
          </span>
          <div>
            <h2 className="font-bold text-lg text-[#0A192F]">{tr('Welcome! One last step', 'أهلًا بكِ! خطوة أخيرة')}</h2>
            <p className="text-xs text-gray-500">{tr('So we can reach you about your level, workshops and offers.', 'لنتواصل معكِ بخصوص مستواكِ والورش والعروض.')}</p>
          </div>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('Full name *', 'الاسم الكامل *')} className={inp} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" placeholder={tr('WhatsApp number with country code *', 'رقم واتساب مع مفتاح الدولة *')} className={inp} />
        <div className="grid grid-cols-2 gap-3">
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder={tr('Country', 'الدولة')} className={inp} />
          <input value={age} onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} inputMode="numeric" placeholder={tr('Age', 'العمر')} className={inp} />
        </div>
        {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] text-sm font-bold disabled:opacity-50">
          {busy ? '...' : tr('Save and continue', 'حفظ والمتابعة')}
        </button>
      </form>
    </div>
  );
};
