import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/* ------------------------------------------------------------------ */
/*  عروض الدعوة                                                         */
/*  • «صديقتي في مجموعتي»: صاحبة الدعوة 30% على شهر عن كل صديقة         */
/*    (بعد أن تدفع الصديقة شهرها الأول)،                                */
/*    والصديقة 30% على شهرها الأول.                                     */
/*  • «سفيرة English Zone» (مجموعة أخرى): 15% من شهر الصديقة الأول ثم    */
/*    5% شهريًا ما دامتا مشتركتين، والصديقة 30% على شهرها الأول.          */
/* ------------------------------------------------------------------ */

export const REFERRER_GROUP_DISCOUNT = 30;
export const FRIEND_DISCOUNT = 30;
export const AMBASSADOR_FIRST = 15;
export const AMBASSADOR_MONTHLY = 5;

// كود ثابت لكل طالبة مأخوذ من معرّف حسابها
export const referralCodeFor = (uid: string) => `EZ${uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`;

export const referralLink = (code: string) => `${window.location.origin}/#/r/${code}`;

const KEY = 'ez_ref_code';
export const storeRefCode = (code: string) => {
  try {
    localStorage.setItem(KEY, code.trim().toUpperCase().slice(0, 20));
  } catch {
    /* ignore */
  }
};
export const getStoredRefCode = (): string => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

export const isActiveSub = (u: any) => !!u && u.role === 'student' && !!u.subscriptionStatus && !['pending', 'cancelled', 'canceled', 'expired', 'inactive', 'suspended'].includes(String(u.subscriptionStatus));

// متابعة الإدارة لكل دعوة: تطبيق الخصومات والدفعات المسلّمة للسفيرة
export interface ReferralStatus {
  id: string; // = معرّف طلب التسجيل
  friendDiscountApplied?: boolean;
  referrerDiscountApplied?: boolean;
  payouts?: { month: string; amount: number; at: string }[];
  note?: string;
}

export const referralStatusService = {
  async all(): Promise<Record<string, ReferralStatus>> {
    const snap = await getDocs(collection(db, 'referral_status'));
    return Object.fromEntries(snap.docs.map((d) => [d.id, { ...(d.data() as any), id: d.id }]));
  },
  async save(s: ReferralStatus) {
    await setDoc(doc(db, 'referral_status', s.id), { ...s, updatedAt: new Date().toISOString() }, { merge: true });
  }
};
