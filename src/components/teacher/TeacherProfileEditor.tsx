import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { squarePhoto } from '../../services/studentHubService';
import { toEZAvatar } from '../avatar/ezAvatar';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { UserRound, Save, Camera, Wand2 } from 'lucide-react';
import { AvatarStudioPage } from '../../pages/dashboards/AvatarStudioPage';

interface Props {
  teacherId: string;
  isAr: boolean;
  mode: 'self' | 'admin';
  onNotice: (m: string) => void;
  onSaved?: () => void;
  openAvatarStudio?: () => void;
}

// تعديل بيانات المعلم وصورته: يستعمله المعلم لنفسه والإدارة لأي معلم
export const TeacherProfileEditor: React.FC<Props> = ({ teacherId, isAr, mode, onNotice, onSaved, openAvatarStudio }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [form, setForm] = useState({ fullName: '', phone: '', country: '', bio: '', gender: '' });
  const [avatar, setAvatar] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [studio, setStudio] = useState(false);
  const [raw, setRaw] = useState<any>(null);

  useEffect(() => {
    getDoc(doc(db, 'users', teacherId))
      .then((s) => {
        const d: any = s.data() || {};
        setRaw({ ...d, id: teacherId });
        setForm({ fullName: d.fullName || '', phone: d.phone || '', country: d.country || '', bio: d.bio || '', gender: d.gender || '' });
        setAvatar(d.avatarConfig || null);
      })
      .catch((e) => onNotice(tr('Could not load the data: ', 'تعذر تحميل البيانات: ') + (e?.code || '')))
      .finally(() => setLoaded(true));
  }, [teacherId]);

  const save = async (extra?: { avatarConfig?: any }) => {
    if (!form.fullName.trim()) {
      onNotice(tr('Please write the name.', 'يُرجى كتابة الاسم.'));
      return;
    }
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const base: any = {
        fullName: form.fullName.trim(),
        country: form.country.trim(),
        bio: form.bio.trim().slice(0, 600),
        updatedAt: now,
        ...(form.gender ? { gender: form.gender } : {}),
        ...(extra || {})
      };
      await setDoc(doc(db, 'users', teacherId), base, { merge: true });
      const photo = (extra?.avatarConfig || avatar)?.photo || '';
      await setDoc(
        doc(db, 'teachers', teacherId),
        { fullName: base.fullName, bio: base.bio, photo, updatedAt: now },
        { merge: true }
      );
      onNotice(tr('Saved.', 'تم الحفظ.'));
      onSaved?.();
    } catch (e: any) {
      onNotice(tr('Could not save: ', 'تعذر الحفظ: ') + (e?.code || e?.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const onPhoto = async (f?: File) => {
    if (!f) return;
    try {
      const photo = await squarePhoto(f, 256);
      const cfg = { ...toEZAvatar(avatar), photo, mode: 'photo' };
      setAvatar(cfg);
      await save({ avatarConfig: cfg });
    } catch {
      onNotice(tr('Could not read the photo.', 'تعذرت قراءة الصورة.'));
    }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white';
  if (studio && raw) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#FAF8F5] overflow-y-auto">
        <AvatarStudioPage
          navigate={() => setStudio(false)}
          editUser={raw}
          onClose={() => setStudio(false)}
          onSaved={async (u) => {
            setAvatar(u.avatarConfig);
            if (u.fullName) setForm((f) => ({ ...f, fullName: u.fullName! }));
            await setDoc(doc(db, 'teachers', teacherId), { photo: u.avatarConfig?.photo || '', ...(u.fullName ? { fullName: u.fullName } : {}), updatedAt: new Date().toISOString() }, { merge: true }).catch(() => undefined);
            onSaved?.();
          }}
        />
      </div>
    );
  }

  if (!loaded) return <p className="text-xs text-gray-500 p-4">{tr('Loading…', 'جارٍ التحميل…')}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#D4AF37] bg-gray-100 flex items-center justify-center">
          {avatar ? <AvatarRenderer config={avatar} size={80} /> : <UserRound className="w-9 h-9 text-gray-400" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="px-3 py-2 rounded-xl bg-[#D4AF37] text-[#061638] text-xs font-bold cursor-pointer flex items-center gap-1.5">
            <Camera className="w-4 h-4" />
            {tr('Upload a photo', 'رفع صورة')}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {(mode === 'admin' || openAvatarStudio) && (
            <button onClick={() => (mode === 'admin' ? setStudio(true) : openAvatarStudio && openAvatarStudio())} className="px-3 py-2 rounded-xl bg-[#061638] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5">
              <Wand2 className="w-4 h-4" />
              {tr('Design an avatar', 'تصميم أفاتار')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">{tr('Full name', 'الاسم الكامل')}</label>
          <input className={inputCls} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">{tr('Country', 'الدولة')}</label>
          <input className={inputCls} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">{tr('Gender', 'الجنس')}</label>
          <select className={inputCls} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">—</option>
            <option value="female">{tr('Female', 'أنثى')}</option>
            <option value="male">{tr('Male', 'ذكر')}</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-gray-600 mb-1">{tr('About (short bio)', 'نبذة قصيرة')}</label>
          <textarea className={inputCls} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
      </div>

      <button onClick={() => save()} disabled={busy} className="px-5 py-2.5 rounded-xl bg-[#061638] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
        <Save className="w-4 h-4" />
        {busy ? tr('Saving…', 'جارٍ الحفظ…') : tr('Save', 'حفظ')}
      </button>
    </div>
  );
};
