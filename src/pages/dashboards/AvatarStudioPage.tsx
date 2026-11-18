import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EZAvatar } from '../../components/avatar/EZAvatar';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { squarePhoto, adminUpdateMemberProfile } from '../../services/studentHubService';
import {
  EZAvatarConfig,
  Gender,
  toEZAvatar,
  defaultAvatar,
  randomAvatar,
  SKINS,
  EYE_COLORS,
  HAIR_COLORS,
  FABRIC_COLORS,
  BACKGROUNDS,
  MALE_HAIR,
  FEMALE_HAIR,
  HIJABS,
  MALE_OUTFITS,
  FEMALE_OUTFITS
} from '../../components/avatar/ezAvatar';
import { ArrowLeft, Save, Dices, RotateCcw, User, Scissors, Shirt, Palette, CheckCircle2, Sparkles, Camera, Trash2 } from 'lucide-react';

interface AvatarStudioPageProps {
  navigate: (route: string) => void;
  // الإدارة فقط: تعديل أفاتار واسم طالبة أخرى
  editUser?: any;
  onClose?: () => void;
  onSaved?: (updates: { fullName?: string; phone?: string; avatarConfig: any }) => void;
}

type Tab = 'look' | 'hair' | 'outfit' | 'colors';

// غرفة الأفاتار: نسخة واحدة للذكور والإناث بملابس محتشمة وعصرية
export const AvatarStudioPage: React.FC<AvatarStudioPageProps> = ({ navigate, editUser, onClose, onSaved }) => {
  const { language } = useLanguage();
  const { user: me, saveAvatarConfig, updateProfile } = useAuth();
  const user: any = editUser || me;
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const saved = toEZAvatar((user as any)?.avatarConfig);
  const [a, setA] = useState<EZAvatarConfig>(saved);
  const [tab, setTab] = useState<Tab>('outfit');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [occasionOnly, setOccasionOnly] = useState(false);
  // الاسم الظاهر ورقم الواتساب (اختياري) مع الأفاتار
  const [displayName, setDisplayName] = useState<string>((user as any)?.fullName || '');
  const [phone, setPhone] = useState<string>((user as any)?.phone || '');

  const set = (patch: Partial<EZAvatarConfig>) => {
    setA((prev) => ({ ...prev, ...patch }));
    setStatus('idle');
  };

  const setGender = (g: Gender) => {
    if (g === a.gender) return;
    const d = defaultAvatar(g);
    set({
      gender: g,
      hairStyle: d.hairStyle,
      hijab: d.hijab,
      outfit: d.outfit,
      outfitColor: d.outfitColor,
      accentColor: d.accentColor,
      cap: false
    });
  };

  const handleSave = async () => {
    setStatus('saving');
    try {
      const u: any = user || {};
      const updates: any = {};
      if (displayName.trim() && displayName.trim() !== u.fullName) updates.fullName = displayName.trim().slice(0, 100);
      if (phone.trim() !== String(u.phone || '')) updates.phone = phone.trim().slice(0, 30);
      if (editUser) {
        await adminUpdateMemberProfile(editUser.id, { ...updates, avatarConfig: a });
        onSaved?.({ ...updates, avatarConfig: a });
      } else {
        await saveAvatarConfig(a as any);
        if (Object.keys(updates).length) await updateProfile({ ...updates, updatedAt: new Date().toISOString() });
      }
      setStatus('saved');
    } catch (err) {
      console.error('Avatar save failed:', err);
      setStatus('error');
    }
  };

  const female = a.gender === 'female';
  const outfits = (female ? FEMALE_OUTFITS : MALE_OUTFITS).filter((o) => !occasionOnly || o.occasion);

  /* ------------------------------ UI helpers ------------------------------ */
  const Swatches = ({ colors, value, onPick }: { colors: string[]; value: string; onPick: (c: string) => void }) => (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className={`w-9 h-9 rounded-full border-2 transition-transform ${
            value.toLowerCase() === c.toLowerCase() ? 'border-[#D4AF37] scale-110 shadow' : 'border-gray-200'
          }`}
          style={{ background: c }}
          aria-label={c}
        />
      ))}
    </div>
  );

  const Chips = <T extends string>({
    items,
    value,
    onPick
  }: {
    items: readonly { id: T; ar: string; en: string }[];
    value: string;
    onPick: (id: T) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onPick(it.id)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
            value === it.id ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {isAr ? it.ar : it.en}
        </button>
      ))}
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2.5">
      <h4 className="text-xs font-bold text-[#0A192F]">{title}</h4>
      {children}
    </div>
  );

  const tabs: { id: Tab; ar: string; en: string; icon: any }[] = [
    { id: 'look', ar: 'الشخصية', en: 'Character', icon: User },
    { id: 'hair', ar: female ? 'الحجاب والشعر' : 'الشعر', en: female ? 'Hijab & hair' : 'Hair', icon: Scissors },
    { id: 'outfit', ar: 'الملابس', en: 'Outfits', icon: Shirt },
    { id: 'colors', ar: 'الخلفية', en: 'Background', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {editUser && (
          <div className="p-3 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold text-center">
            {tr('Admin editing:', 'تعديل الإدارة لحساب:')} {editUser.fullName || editUser.email}
          </div>
        )}
        <button onClick={() => (onClose ? onClose() : navigate('student-dashboard'))} className="text-xs font-bold text-gray-500 hover:text-[#0A192F] flex items-center gap-1.5">
          <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          <span>{tr('Back to my dashboard', 'العودة إلى لوحتي')}</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif-luxury font-bold text-3xl text-[#0A192F] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              {tr('My Avatar', 'الأفاتار الخاص بي')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{tr('Design your character, then save.', 'صمّم شخصيتك ثم اضغط حفظ.')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => set({ ...randomAvatar(a.gender), photo: a.photo, mode: 'cartoon' })} className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-bold flex items-center gap-1.5">
              <Dices className="w-4 h-4 text-[#AA820A]" />
              {tr('Random', 'عشوائي')}
            </button>
            <button onClick={() => set(saved)} className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-bold flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-gray-500" />
              {tr('Undo changes', 'تراجع')}
            </button>
            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              className="px-5 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
            >
              {status === 'saved' ? <CheckCircle2 className="w-4 h-4 text-[#25D366]" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
              {status === 'saving' ? tr('Saving...', 'جارٍ الحفظ...') : status === 'saved' ? tr('Saved', 'تم الحفظ') : tr('Save', 'حفظ')}
            </button>
          </div>
        </div>
        {status === 'error' && <p className="text-xs text-red-600">{tr('Could not save, please try again.', 'تعذر الحفظ، حاول مرة أخرى.')}</p>}

        <div className="bg-white rounded-2xl p-4 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">{tr('Your name (shown with your avatar)', 'اسمكِ (يظهر مع الأفاتار)')}</label>
            <input value={displayName} onChange={(e) => { setDisplayName(e.target.value); setStatus('idle'); }} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">{tr('WhatsApp number (optional)', 'رقم واتساب (اختياري)')}</label>
            <input value={phone} onChange={(e) => { setPhone(e.target.value); setStatus('idle'); }} dir="ltr" inputMode="tel" placeholder="+966..." className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-[#D4AF37]/40 shadow-lg flex justify-center">
              <EZAvatar config={a} view="full" size={260} />
            </div>
            <div className="flex items-center justify-center gap-3">
              <AvatarRenderer config={a} size={64} />
              <span className="text-[11px] text-gray-500">{tr('How others see you in the community', 'هكذا يظهر أفاتارك للآخرين في المجتمع')}</span>
            </div>
            {/* Profile photo */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#0A192F] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#AA820A]" />
                {tr('My profile photo', 'صورتي الشخصية')}
              </h4>
              <div className="flex items-center gap-3">
                {a.photo ? (
                  <img src={a.photo} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 border border-dashed border-gray-300" />
                )}
                <label className="px-3 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold cursor-pointer">
                  {a.photo ? tr('Change photo', 'تغيير الصورة') : tr('Upload photo', 'رفع صورة')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        set({ photo: await squarePhoto(f), mode: 'photo' });
                      } catch {
                        setStatus('error');
                      }
                    }}
                  />
                </label>
                {a.photo && (
                  <button onClick={() => set({ photo: '', mode: 'cartoon' })} className="p-2 text-gray-400 hover:text-red-600" title={tr('Remove', 'حذف')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {a.photo && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => set({ mode: 'photo' })}
                    className={`py-2 rounded-xl text-[11px] font-bold border ${a.mode === 'photo' ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37]' : 'bg-white text-gray-600 border-gray-200'}`}
                  >
                    {tr('Show my photo', 'أظهر صورتي')}
                  </button>
                  <button
                    onClick={() => set({ mode: 'cartoon' })}
                    className={`py-2 rounded-xl text-[11px] font-bold border ${a.mode !== 'photo' ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37]' : 'bg-white text-gray-600 border-gray-200'}`}
                  >
                    {tr('Show my avatar', 'أظهر الأفاتار')}
                  </button>
                </div>
              )}
              <p className="text-[10px] text-gray-400">
                {tr('Remember to press Save. Your choice appears everywhere on the site.', 'لا تنسَ الضغط على حفظ. ما تختاره يظهر في كل مكان في الموقع.')}
              </p>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-2 gap-2">
              {(['female', 'male'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-2xl text-sm font-bold border transition-colors ${
                    a.gender === g ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {g === 'female' ? tr('Girl', 'بنت') : tr('Boy', 'ولد')}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-100">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-3 py-3.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 ${
                      tab === t.id ? 'border-[#D4AF37] text-[#0A192F]' : 'border-transparent text-gray-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {isAr ? t.ar : t.en}
                  </button>
                );
              })}
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {tab === 'look' && (
                <>
                  <Section title={tr('Skin tone', 'لون البشرة')}>
                    <Swatches colors={SKINS} value={a.skin} onPick={(c) => set({ skin: c })} />
                  </Section>
                  <Section title={tr('Eyes', 'العيون')}>
                    <Chips
                      items={[
                        { id: 'round', ar: 'دائرية', en: 'Round' },
                        { id: 'almond', ar: 'لوزية', en: 'Almond' },
                        { id: 'happy', ar: 'مبتسمة', en: 'Happy' }
                      ] as const}
                      value={a.eyes}
                      onPick={(id) => set({ eyes: id })}
                    />
                    <Swatches colors={EYE_COLORS} value={a.eyeColor} onPick={(c) => set({ eyeColor: c })} />
                  </Section>
                  <Section title={tr('Expression', 'التعبير')}>
                    <Chips
                      items={[
                        { id: 'smile', ar: 'ابتسامة', en: 'Smile' },
                        { id: 'grin', ar: 'ضحكة', en: 'Big smile' },
                        { id: 'soft', ar: 'هادئ', en: 'Calm' }
                      ] as const}
                      value={a.mouth}
                      onPick={(id) => set({ mouth: id })}
                    />
                  </Section>
                  <Section title={tr('Glasses', 'النظارة')}>
                    <Chips
                      items={[
                        { id: 'none', ar: 'بدون', en: 'None' },
                        { id: 'round', ar: 'دائرية', en: 'Round' },
                        { id: 'square', ar: 'مربعة', en: 'Square' }
                      ] as const}
                      value={a.glasses}
                      onPick={(id) => set({ glasses: id })}
                    />
                  </Section>
                </>
              )}

              {tab === 'hair' && (
                <>
                  {female && (
                    <Section title={tr('Hijab', 'الحجاب')}>
                      <Chips items={HIJABS} value={a.hijab} onPick={(id) => set({ hijab: id })} />
                      {a.hijab !== 'none' && <Swatches colors={FABRIC_COLORS} value={a.hijabColor} onPick={(c) => set({ hijabColor: c })} />}
                    </Section>
                  )}
                  {(!female || a.hijab === 'none') && (
                    <Section title={tr('Hair style', 'تسريحة الشعر')}>
                      <Chips items={female ? FEMALE_HAIR : MALE_HAIR} value={a.hairStyle} onPick={(id) => set({ hairStyle: id })} />
                      <Swatches colors={HAIR_COLORS} value={a.hairColor} onPick={(c) => set({ hairColor: c })} />
                    </Section>
                  )}
                  {!female && (
                    <Section title={tr('Cap', 'القبعة')}>
                      <Chips
                        items={[
                          { id: 'no', ar: 'بدون', en: 'None' },
                          { id: 'yes', ar: 'قبعة', en: 'Cap' }
                        ] as const}
                        value={a.cap ? 'yes' : 'no'}
                        onPick={(id) => set({ cap: id === 'yes' })}
                      />
                    </Section>
                  )}
                </>
              )}

              {tab === 'outfit' && (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOccasionOnly(false)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${!occasionOnly ? 'bg-[#D4AF37] text-[#0A192F]' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {tr('All', 'الكل')}
                    </button>
                    <button
                      onClick={() => setOccasionOnly(true)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${occasionOnly ? 'bg-[#D4AF37] text-[#0A192F]' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {tr('Occasions', 'المناسبات')}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {outfits.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => set({ outfit: o.id })}
                        className={`rounded-2xl border-2 p-1.5 bg-[#FAF8F5] transition-colors ${
                          a.outfit === o.id ? 'border-[#D4AF37] shadow' : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <EZAvatar config={{ ...a, outfit: o.id }} view="full" size={80} showBackground={false} />
                        <span className="block text-[10px] font-bold text-[#0A192F] mt-1 leading-tight">{isAr ? o.ar : o.en}</span>
                      </button>
                    ))}
                  </div>
                  <Section title={tr('Clothes color', 'لون الملابس')}>
                    <Swatches colors={FABRIC_COLORS} value={a.outfitColor} onPick={(c) => set({ outfitColor: c })} />
                  </Section>
                  <Section title={tr('Second color (skirt, trousers, details)', 'اللون الثاني (التنورة، البنطال، التفاصيل)')}>
                    <Swatches colors={FABRIC_COLORS} value={a.accentColor} onPick={(c) => set({ accentColor: c })} />
                  </Section>
                  {female && a.hijab !== 'none' && (
                    <Section title={tr('Hijab color', 'لون الحجاب')}>
                      <Swatches colors={FABRIC_COLORS} value={a.hijabColor} onPick={(c) => set({ hijabColor: c })} />
                    </Section>
                  )}
                </>
              )}

              {tab === 'colors' && (
                <>
                  <Section title={tr('Background', 'الخلفية')}>
                    <Swatches colors={BACKGROUNDS} value={a.bg} onPick={(c) => set({ bg: c })} />
                  </Section>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
