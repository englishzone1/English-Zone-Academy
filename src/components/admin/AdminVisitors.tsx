import React, { useMemo, useState } from 'react';
import { AdminMemberProfile } from './AdminMemberProfile';
import { Download, MessageCircle, Mail, Search, CheckCircle2, Trash2 } from 'lucide-react';

interface Props {
  users: any[];
  isAr: boolean;
  // من أرسلت طلب الاشتراك في الكورس تنتقل إلى «المسجّلون على الكورس»
  enrolledIds?: string[];
  onActivate?: (uid: string) => Promise<void>;
  onDelete?: (uid: string) => Promise<void>;
}

// الزوار الذين أنشؤوا حسابًا مجانيًا (ليسوا مشتركين بعد): للتواصل معهم بالعروض
export const AdminVisitors: React.FC<Props> = ({ users, isAr, enrolledIds = [], onActivate, onDelete }) => {
  const [busy, setBusy] = useState('');
  const [profileOf, setProfileOf] = useState<any>(null);
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [q, setQ] = useState('');

  const visitors = useMemo(
    () =>
      users

        .filter((u) => !q.trim() || `${u.fullName} ${u.email} ${u.phone || ''}`.toLowerCase().includes(q.trim().toLowerCase()))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))),
    [users, q]
  );

  const waLink = (phone: string) => {
    const digits = String(phone || '').replace(/[^\d]/g, '').replace(/^00/, '');
    return digits.length >= 8 ? `https://wa.me/${digits}` : '';
  };

  const exportExcel = () => {
    const cell = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = [tr('Name', 'الاسم'), tr('Email', 'البريد'), tr('WhatsApp', 'واتساب'), tr('Country', 'الدولة'), tr('Age', 'العمر'), tr('Joined', 'تاريخ التسجيل')];
    const rows = visitors.map((u) => [u.fullName, u.email, u.phone || '', u.country || '', u.age || '', u.createdAt ? new Date(u.createdAt).toLocaleDateString(isAr ? 'ar' : 'en') : '']);
    const csv = '﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `english-zone-visitors-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-luxury font-bold text-xl text-[#061638]">{tr('Potential registrants', 'المسجّلون المحتملون')}</h2>
          <p className="text-xs text-gray-500">
            {tr(
              'Everyone who signed up and is not an enrolled student yet. After you talk with her, press Activate to make her a student.',
              'كل من سجّلت في الموقع ولم تصبح طالبة مشتركة بعد. بعد أن تتحدثي معها اضغطي «تفعيل» لتصبح طالبة في الكورس.'
            )}
          </p>
        </div>
        <button onClick={exportExcel} disabled={!visitors.length} className="self-start px-3 py-2 rounded-xl bg-[#061638] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Download className="w-4 h-4" />
          {tr('Download Excel', 'تحميل Excel')}
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 start-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Search name, email or number', 'ابحثي بالاسم أو البريد أو الرقم')} className="w-full ps-9 pe-3 py-2 rounded-xl border border-gray-300 text-xs" />
      </div>

      <p className="text-xs font-bold text-gray-700">{tr(`Total: ${visitors.length}`, `العدد: ${visitors.length}`)}</p>

      {visitors.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No sign-ups yet.', 'لا توجد مسجّلات بعد.')}</div>
      ) : (
        <div className="space-y-2">
          {visitors.map((u) => (
            <div key={u.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-[#061638]">{u.fullName}</span>
                {enrolledIds.includes(u.id) && (
                  <span className="ms-1.5 px-1.5 py-0.5 rounded bg-[#F3E5AB] text-[#061638] text-[10px] font-bold">{tr('Asked to subscribe', 'طلبت الاشتراك')}</span>
                )}
                <span className="text-gray-400">
                  {u.placementLevel ? ` • ${tr('Level', 'المستوى')} ${u.placementLevel}` : ''}
                  {u.country ? ` • ${u.country}` : ''}
                  {u.age ? ` • ${tr('age', 'العمر')} ${u.age}` : ''} • {u.createdAt ? new Date(u.createdAt).toLocaleDateString(isAr ? 'ar' : 'en') : ''}
                </span>
                <div className="text-gray-600" dir="ltr">
                  {u.email}
                  {u.phone ? ` • ${u.phone}` : ''}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setProfileOf(u)} className="px-2.5 py-1.5 rounded-lg border border-[#D4AF37] text-[#7A5C00] font-bold">
                  {tr('Profile', 'صفحتها')}
                </button>
                {onActivate && (
                  <button
                    disabled={busy === u.id}
                    onClick={async () => {
                      if (!window.confirm(tr(`Activate ${u.fullName} as an enrolled student?`, `تفعيل ${u.fullName} كطالبة مشتركة في الكورس؟`))) return;
                      setBusy(u.id);
                      await onActivate(u.id);
                      setBusy('');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#061638] text-[#F3E5AB] font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {tr('Activate', 'تفعيل')}
                  </button>
                )}
                {waLink(u.phone) && (
                  <a href={waLink(u.phone)} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white font-bold flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {tr('WhatsApp', 'واتساب')}
                  </a>
                )}
                <a href={`mailto:${u.email}`} className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-bold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {tr('Email', 'بريد')}
                </a>
                {onDelete && (
                  <button
                    disabled={busy === u.id}
                    title={tr('Delete', 'حذف')}
                    onClick={async () => {
                      if (!window.confirm(tr(`Delete ${u.fullName} permanently?`, `حذف ${u.fullName} نهائيًا من المنصة؟`))) return;
                      setBusy(u.id);
                      await onDelete(u.id);
                      setBusy('');
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {tr('Delete', 'حذف')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {profileOf && <AdminMemberProfile member={profileOf} isAr={isAr} onClose={() => setProfileOf(null)} />}
    </div>
  );
};
