import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Gift, Gem, CheckCircle2, Plus, Loader2, RefreshCw } from 'lucide-react';
import { db } from '../../services/firebase';
import {
  referralCodeFor,
  referralStatusService,
  ReferralStatus,
  isActiveSub,
  REFERRER_GROUP_DISCOUNT,
  FRIEND_DISCOUNT,
  AMBASSADOR_FIRST,
  AMBASSADOR_MONTHLY
} from '../../services/referralService';
import { formatMoney, useAcademySettings } from '../../hooks/useAcademySettings';

interface Row {
  regId: string;
  code: string;
  submittedAt: string;
  friendName: string;
  friend?: any;
  referrer?: any;
  type: 'group' | 'ambassador' | 'pending-group' | 'unknown';
}

const thisMonth = () => new Date().toISOString().slice(0, 7);

// الإدارة: الدعوات ومكافآتها محسوبة تلقائيًا من رسوم كل طالبة
export const AdminReferrals: React.FC<{ isAr: boolean; onNotice: (m: string) => void }> = ({ isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { currency: siteCurrency } = useAcademySettings();
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<Record<string, ReferralStatus>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [regsSnap, usersSnap, st] = await Promise.all([
        getDocs(collection(db, 'registration_requests')),
        getDocs(collection(db, 'users')),
        referralStatusService.all().catch(() => ({}))
      ]);
      const users = usersSnap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
      const byCode = new Map(users.filter((u) => u.role === 'student').map((u) => [referralCodeFor(u.id), u]));
      const byId = new Map(users.map((u) => [u.id, u]));
      const byEmail = new Map(users.filter((u) => u.email).map((u) => [String(u.email).toLowerCase(), u]));
      const list: Row[] = regsSnap.docs
        .map((d) => ({ ...(d.data() as any), id: d.id }))
        .filter((r) => String(r.referralCode || '').trim())
        .map((r) => {
          const code = String(r.referralCode).trim().toUpperCase();
          const referrer = byCode.get(code);
          const friend = byId.get(r.studentId) || byId.get(r.linkedUserId) || byEmail.get(String(r.email || '').toLowerCase());
          let type: Row['type'] = 'unknown';
          if (referrer) {
            // صاحبة الدعوة غير مشتركة أو بلا مجموعة = سفيرة (لا يشترط اشتراكها)
            if (!isActiveSub(referrer) || !referrer.groupId) type = 'ambassador';
            else if (!friend?.groupId) type = 'pending-group';
            else type = friend.groupId === referrer.groupId ? 'group' : 'ambassador';
          }
          return { regId: r.id, code, submittedAt: r.submittedAt || '', friendName: friend?.fullName || r.fullName || '—', friend, referrer, type };
        })
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
      setRows(list);
      setStatus(st as any);
    } catch (e: any) {
      onNotice(`${tr('Could not load referrals:', 'تعذر تحميل الدعوات:')} ${e?.code || ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, patch: Partial<ReferralStatus>) => {
    setBusy(id);
    try {
      const next = { ...(status[id] || { id }), ...patch, id };
      await referralStatusService.save(next);
      setStatus((p) => ({ ...p, [id]: next }));
    } catch (e: any) {
      onNotice(`${tr('Could not save:', 'تعذر الحفظ:')} ${e?.code || ''}`);
    } finally {
      setBusy('');
    }
  };

  const fee = (u: any) => (typeof u?.monthlyTuitionUSD === 'number' ? u.monthlyTuitionUSD : undefined);
  const money = (amount: number | undefined, u: any) => (amount === undefined ? tr('set her fee first', 'حدّدي رسومها أولًا') : formatMoney(Math.round(amount * 100) / 100, u?.tuitionCurrency || siteCurrency));

  // ما تدين به الأكاديمية لكل سفيرة هذا الشهر
  const ambassadorsDue = useMemo(() => {
    const m = new Map<string, { name: string; total: number; cur: string }>();
    rows
      .filter((r) => r.type === 'ambassador' && isActiveSub(r.friend) && fee(r.friend) !== undefined)
      .forEach((r) => {
        const paidThisMonth = (status[r.regId]?.payouts || []).some((p) => p.month === thisMonth());
        if (paidThisMonth) return;
        const first = !(status[r.regId]?.payouts || []).length;
        const amount = (fee(r.friend)! * (first ? AMBASSADOR_FIRST : AMBASSADOR_MONTHLY)) / 100;
        const k = r.referrer.id;
        const cur = r.friend?.tuitionCurrency || siteCurrency;
        const prev = m.get(k) || { name: r.referrer.fullName || r.referrer.email, total: 0, cur };
        prev.total += amount;
        m.set(k, prev);
      });
    return Array.from(m.values());
  }, [rows, status, siteCurrency]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">{tr('Referrals & rewards', 'الدعوات والمكافآت')}</h2>
            <p className="text-xs text-gray-500">
              {tr(
                'The offer type is decided by groups: same group = “My friend in my group”, another group = “Ambassador”. Amounts use each student’s monthly fee.',
                'نوع العرض يُحدَّد من المجموعات: نفس المجموعة = «صديقتي في مجموعتي»، ومجموعة أخرى = «سفيرة». المبالغ محسوبة من الرسوم الشهرية لكل طالبة.'
              )}
            </p>
          </div>
          <button onClick={load} className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            {tr('Refresh', 'تحديث')}
          </button>
        </div>

        {ambassadorsDue.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#0A192F] text-[#F3E5AB] space-y-1">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-[#D4AF37]" />
              {tr('Ambassador rewards due this month (not yet recorded):', 'مكافآت السفيرات المستحقة هذا الشهر (لم تُسجَّل بعد):')}
            </div>
            {ambassadorsDue.map((a) => (
              <div key={a.name} className="text-sm">
                • {a.name}: <b>{formatMoney(Math.round(a.total * 100) / 100, a.cur)}</b>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="p-6 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('No referrals yet.', 'لا توجد دعوات بعد.')}</div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const st = status[r.regId] || { id: r.regId };
              const friendFee = fee(r.friend);
              const refFee = fee(r.referrer);
              const payouts = st.payouts || [];
              const paidTotal = payouts.reduce((s, p) => s + (Number(p.amount) || 0), 0);
              const nextAmount = friendFee !== undefined ? (friendFee * (payouts.length ? AMBASSADOR_MONTHLY : AMBASSADOR_FIRST)) / 100 : undefined;
              const paidThisMonth = payouts.some((p) => p.month === thisMonth());
              const bothActive = isActiveSub(r.friend);
              return (
                <div key={r.regId} className="p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {r.type === 'group' ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#7A5C00] font-bold flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" />
                        {tr('My friend in my group', 'صديقتي في مجموعتي')}
                      </span>
                    ) : r.type === 'ambassador' ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB] font-bold flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {tr('Ambassador', 'سفيرة')}
                      </span>
                    ) : r.type === 'pending-group' ? (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">{tr('Assign groups to decide the offer', 'حدّدي المجموعة لتحديد نوع العرض')}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold">{tr('Unknown code', 'كود غير معروف')}</span>
                    )}
                    <span className="font-mono text-gray-400" dir="ltr">
                      {r.code}
                    </span>
                    <span className="text-gray-400 ms-auto">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : ''}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-[#FAF8F5]">
                      <div className="text-[10px] text-gray-500">{tr('Invited by', 'صاحبة الدعوة')}</div>
                      <b className="text-[#0A192F]">{r.referrer?.fullName || '—'}</b>
                      {r.referrer && !isActiveSub(r.referrer) && <span className="ms-1 text-gray-500">({tr('not a course student', 'ليست مشتركة في الكورس')})</span>}
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF8F5]">
                      <div className="text-[10px] text-gray-500">{tr('New friend', 'الصديقة الجديدة')}</div>
                      <b className="text-[#0A192F]">{r.friendName}</b>
                      {!isActiveSub(r.friend) && <span className="ms-1 text-gray-500">({tr('not active yet', 'لم تُفعَّل بعد')})</span>}
                    </div>
                  </div>

                  {(r.type === 'group' || r.type === 'ambassador') && (
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" disabled={busy === r.regId} checked={!!st.friendDiscountApplied} onChange={(e) => update(r.regId, { friendDiscountApplied: e.target.checked })} />
                        {tr('Friend’s first-month discount', 'خصم الصديقة على شهرها الأول')} {FRIEND_DISCOUNT}%: <b>{money(friendFee !== undefined ? (friendFee * FRIEND_DISCOUNT) / 100 : undefined, r.friend)}</b>
                      </label>

                      {r.type === 'group' && (
                        <label className="flex items-center gap-2">
                          <input type="checkbox" disabled={busy === r.regId} checked={!!st.referrerDiscountApplied} onChange={(e) => update(r.regId, { referrerDiscountApplied: e.target.checked })} />
                          {tr('Referrer’s one-month discount', 'خصم صاحبة الدعوة على شهر واحد')} {REFERRER_GROUP_DISCOUNT}%: <b>{money(refFee !== undefined ? (refFee * REFERRER_GROUP_DISCOUNT) / 100 : undefined, r.referrer)}</b>
                        </label>
                      )}

                      {r.type === 'ambassador' && (
                        <div className="p-2 rounded-xl border border-[#D4AF37]/40 space-y-1">
                          <div>
                            {tr('Paid to the ambassador so far:', 'سُلِّم للسفيرة حتى الآن:')} <b>{formatMoney(Math.round(paidTotal * 100) / 100, r.friend?.tuitionCurrency || siteCurrency)}</b> ({payouts.length} {tr('months', 'شهر')})
                          </div>
                          {payouts.length > 0 && <div className="text-[10px] text-gray-500" dir="ltr">{payouts.map((p) => p.month).join(' • ')}</div>}
                          {!bothActive ? (
                            <div className="text-[11px] text-gray-500">{tr('Monthly reward is paused while the friend is not subscribed.', 'المكافأة الشهرية متوقفة لأن الصديقة غير مشتركة.')}</div>
                          ) : paidThisMonth ? (
                            <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {tr('This month is recorded.', 'تم تسجيل مكافأة هذا الشهر.')}
                            </div>
                          ) : (
                            <button
                              disabled={busy === r.regId || nextAmount === undefined}
                              onClick={() =>
                                update(r.regId, { payouts: [...payouts, { month: thisMonth(), amount: Math.round((nextAmount || 0) * 100) / 100, at: new Date().toISOString() }] })
                              }
                              className="px-3 py-1.5 rounded-lg bg-[#0A192F] text-[#F3E5AB] font-bold flex items-center gap-1 disabled:opacity-50"
                            >
                              {busy === r.regId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                              {tr('Record this month’s reward', 'تسجيل تسليم مكافأة هذا الشهر')} ({payouts.length ? `${AMBASSADOR_MONTHLY}%` : `${AMBASSADOR_FIRST}%`}): {money(nextAmount, r.friend)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
