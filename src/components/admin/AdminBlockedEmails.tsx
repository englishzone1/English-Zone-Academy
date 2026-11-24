import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { Ban, Trash2, Loader2 } from 'lucide-react';
import { db } from '../../services/firebase';

// الإدارة: حظر بريد إلكتروني من الدخول إلى المنصة نهائيًا
export const AdminBlockedEmails: React.FC<{ isAr: boolean; onNotice: (m: string) => void }> = ({ isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [list, setList] = useState<{ id: string; createdAt?: string }[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    getDocs(collection(db, 'blocked_emails'))
      .then((s) => setList(s.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))))
      .catch(() => undefined);

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const e = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e)) return onNotice(tr('Write a valid email.', 'اكتبي بريدًا صحيحًا.'));
    setBusy(true);
    try {
      await setDoc(doc(db, 'blocked_emails', e), { email: e, createdAt: new Date().toISOString() });
      setEmail('');
      await load();
      onNotice(tr('Email blocked.', 'تم حظر البريد.'));
    } catch (err: any) {
      onNotice(`${tr('Could not block:', 'تعذر الحظر:')} ${err?.code || ''}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-red-200 shadow-sm space-y-3">
      <div>
        <h3 className="font-bold text-[#0A192F] flex items-center gap-2">
          <Ban className="w-4 h-4 text-red-600" />
          {tr('Blocked emails', 'البريد المحظور')}
        </h3>
        <p className="text-[11px] text-gray-500">
          {tr('A blocked email cannot sign in, create an account, or see anything inside the platform.', 'البريد المحظور لا يستطيع الدخول أو إنشاء حساب أو رؤية أي شيء داخل المنصة.')}
        </p>
      </div>
      <div className="flex gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" placeholder="name@gmail.com" className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm" />
        <button onClick={add} disabled={busy} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
          {tr('Block', 'حظر')}
        </button>
      </div>
      {list.length > 0 && (
        <div className="divide-y divide-gray-100">
          {list.map((b) => (
            <div key={b.id} className="py-2 flex items-center justify-between text-xs">
              <span dir="ltr" className="font-mono">{b.id}</span>
              <button
                onClick={async () => {
                  if (!window.confirm(tr('Unblock this email?', 'إلغاء حظر هذا البريد؟'))) return;
                  await deleteDoc(doc(db, 'blocked_emails', b.id)).catch(() => undefined);
                  load();
                }}
                className="px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {tr('Unblock', 'إلغاء الحظر')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
