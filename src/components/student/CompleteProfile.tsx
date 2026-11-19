import React, { useState } from 'react';
import { UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// بعد التسجيل: نطلب الدولة والعمر فقط مرة واحدة (الاسم من Gmail، والواتساب اختياري في غرفة الأفاتار)
export const CompleteProfile: React.FC<{ isAr: boolean }> = ({ isAr }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { user, updateProfile } = useAuth();
  const u: any = user || {};
  const [country, setCountry] = useState(u.country || '');
  const [age, setAge] = useState(u.age ? String(u.age) : '');
  const [gender, setGenderVal] = useState<string>(u.gender || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user || (String(u.country || '').trim() && Number(u.age) > 0 && (u.gender === 'male' || u.gender === 'female'))) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) {
      setError(tr('Choose student (male) or student (female).', 'اختر/اختاري: طالب أو طالبة.'));
      return;
    }
    if (!country.trim() || !(Number(age) > 0)) {
      setError(tr('Write your country and age.', '{اكتب|اكتبي} {دولتك|دولتكِ} {وعمرك|وعمركِ}.'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await updateProfile({
        country: country.trim().slice(0, 60),
        age: Number(age),
        gender,
        updatedAt: new Date().toISOString()
      } as any);
    } catch {
      setError(tr('Could not save, please try again.', 'تعذّر الحفظ، {حاول|حاولي} مرة أخرى.'));
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
            <h2 className="font-bold text-lg text-[#0A192F]">{tr('Welcome! One last step', 'أهلًا {بك|بكِ}! خطوة أخيرة')}</h2>
            <p className="text-xs text-gray-500">{tr('This helps us address you correctly and suggest the right group and times.', 'هذه البيانات تساعدنا في مخاطبتك بالشكل الصحيح واقتراح المجموعة والمواعيد المناسبة لك.')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: 'male', ar: 'طالب', en: 'Male student' },
            { v: 'female', ar: 'طالبة', en: 'Female student' }
          ].map((g) => (
            <button
              type="button"
              key={g.v}
              onClick={() => setGenderVal(g.v)}
              className={`py-3 rounded-xl text-sm font-bold border ${gender === g.v ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white text-gray-600 border-gray-300'}`}
            >
              {isAr ? g.ar : g.en}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder={tr('Country *', 'الدولة *')} className={inp} />
          <input value={age} onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} inputMode="numeric" placeholder={tr('Age *', 'العمر *')} className={inp} />
        </div>
        {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] text-sm font-bold disabled:opacity-50">
          {busy ? '...' : tr('Save and continue', 'حفظ والمتابعة')}
        </button>
      </form>
    </div>
  );
};
