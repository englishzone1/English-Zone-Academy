import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { UserX, Undo2, Loader2 } from 'lucide-react';
import { db } from '../../services/firebase';

// الإدارة: الحسابات المحذوفة (blocked_users) — المحذوف لا يستطيع إنشاء ملف جديد بنفس الحساب حتى يُرفع عنه الحظر
export const AdminDeletedAccounts: React.FC<{ isAr: boolean; onNotice: (m: string) => void }> = ({ isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [list, setList] = useState<{ id: string; email?: string; blockedAt?: string }[]>([]);
  const [busyId, setBusyId] = useState('');
  const [q, setQ] = useState('');

  const load = () =>
    getDocs(collection(db, 'blocked_users'))
      .then((s) =>
        setList(
          s.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) }))
            .sort((a, b) => String(b.blockedAt || '').localeCompare(String(a.blockedAt || '')))
        )
      )
      .catch(() => undefined);

  useEffect(() => {
    load();
  }, []);

  const unblock = async (id: string) => {
    setBusyId(id);
    try {
      await deleteDoc(doc(db, 'blocked_users', id));
      setList((l) => l.filter((x) => x.id !== id));
      onNotice(tr('Unblocked. The account can sign in again and will appear as a new registrant.', 'تم رفع الحظر. يستطيع الحساب الدخول من جديد، ويظهر مسجّلًا جديدًا.'));
    } catch (err: any) {
      onNotice(`${tr('Could not unblock:', 'تعذر رفع الحظر:')} ${err?.code || ''}`);
    } finally {
      setBusyId('');
    }
  };

  const shown = list.filter((b) => !q.trim() || String(b.email || '').toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-3">
      <div>
        <h3 className="font-bold text-[#0A192F] flex items-center gap-2">
          <UserX className="w-4 h-4 text-gray-600" />
          {tr('Deleted accounts', 'الحسابات المحذوفة')} ({list.length})
        </h3>
        <p className="text-[11px] text-gray-500">
          {tr(
            'A deleted account cannot create a new profile with the same sign-in. Unblock it to let the person register again.',
            'الحساب المحذوف لا يستطيع إنشاء ملف جديد بنفس حساب الدخول. ارفعي الحظر ليستطيع التسجيل من جديد.'
          )}
        </p>
      </div>
      {list.length > 5 && (
        <input value={q} onChange={(e) => setQ(e.target.value)} dir="ltr" placeholder={tr('Search by email', 'بحث بالبريد')} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm" />
      )}
      {shown.length === 0 ? (
        <p className="text-xs text-gray-400">{tr('No deleted accounts.', 'لا توجد حسابات محذوفة.')}</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {shown.map((b) => (
            <div key={b.id} className="py-2 flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span dir="ltr" className="font-mono block truncate">{b.email || b.id}</span>
                {b.blockedAt && <span className="text-[10px] text-gray-400">{new Date(b.blockedAt).toLocaleString(isAr ? 'ar' : 'en')}</span>}
              </div>
              <button
                onClick={() => unblock(b.id)}
                disabled={busyId === b.id}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1 shrink-0 disabled:opacity-50"
              >
                {busyId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                {tr('Unblock', 'رفع الحظر')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
