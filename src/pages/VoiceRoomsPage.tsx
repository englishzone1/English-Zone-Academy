import React, { useEffect, useMemo, useState } from 'react';
import { Mic, Lock, ShieldCheck, Globe2, Users, Plus, X, Radio, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ACTIVE_MS, RoomPrivacy, VoiceRoom, createRoom, watchRooms } from '../services/voiceRooms';
import { rtcConfigured } from '../services/voiceRtc';

const LEVELS = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const userGender = (u: any): string =>
  u?.gender === 'male' || u?.gender === 'female'
    ? u.gender
    : u?.avatarConfig?.gender === 'male' || u?.avatarConfig?.gender === 'female'
      ? u.avatarConfig.gender
      : '';

export const PrivacyBadge: React.FC<{ privacy: RoomPrivacy; girlsOnly: boolean; isAr: boolean }> = ({ privacy, girlsOnly, isAr }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {privacy === 'public' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
          <Globe2 className="w-3 h-3" />
          {tr('Open', 'عامة')}
        </span>
      )}
      {privacy === 'approval' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
          <ShieldCheck className="w-3 h-3" />
          {tr('Entry by approval', 'الدخول بموافقة')}
        </span>
      )}
      {privacy === 'private' && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
          <Lock className="w-3 h-3" />
          {tr('Private (link + approval)', 'خاصة (برابط وموافقة)')}
        </span>
      )}
      {girlsOnly && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold border border-pink-200">
          {tr('Girls only', 'للبنات فقط')}
        </span>
      )}
    </span>
  );
};

// صفحة الغرف الصوتية: القائمة وإنشاء غرفة جديدة
export const VoiceRoomsPage: React.FC<{ navigate: (r: string) => void; embedded?: boolean }> = ({ navigate, embedded }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { user, firebaseUser, isAuthenticated, isLoading, isAdmin, isSuperAdmin } = useAuth();
  const admin = isAdmin || isSuperAdmin;
  const gender = userGender(user);
  const isFemale = gender === 'female';
  const uid = firebaseUser?.uid || '';

  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [loadErr, setLoadErr] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    rtcConfigured().then(setConfigured);
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!uid) return;
    return watchRooms(uid, isFemale, admin, setRooms, () => setLoadErr(tr('Could not load rooms.', 'تعذر تحميل الغرف.')));
  }, [uid, isFemale, admin]);

  const visible = useMemo(() => {
    return rooms
      .filter((r) => r.status === 'open' || r.ownerId === uid || admin)
      .filter((r) => r.privacy !== 'private' || r.ownerId === uid || admin)
      .map((r) => ({ r, live: now - (r.lastActiveAt || 0) < ACTIVE_MS }))
      .filter(({ r, live }) => live || r.ownerId === uid || admin || now - (r.createdAt || 0) < 7 * 24 * 3600 * 1000)
      .sort((a, b) => Number(b.live) - Number(a.live) || (b.r.lastActiveAt || 0) - (a.r.lastActiveAt || 0));
  }, [rooms, uid, admin, now]);

  if (isLoading) return <div className="min-h-[50vh]" />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex items-center justify-center px-4 py-12" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-lg w-full bg-white rounded-3xl border border-[#D4AF37]/40 shadow-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#0A192F] text-[#F3E5AB] flex items-center justify-center mx-auto">
            <Mic className="w-8 h-8" />
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">{tr('English voice rooms', 'غرف المحادثة الصوتية بالإنجليزية')}</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            {tr(
              'Practise speaking English live with other learners. Free for everyone who signs up.',
              '{تدرّب|تدرّبي} على التحدث بالإنجليزية مباشرة مع متعلمين آخرين. مجانًا لكل من يسجّل في المنصة.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button onClick={() => navigate('join-us')} className="px-5 py-3 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-sm">
              {tr('Sign up free', '{سجّل|سجّلي} مجانًا')}
            </button>
            <button onClick={() => navigate('login')} className="px-5 py-3 rounded-xl border border-[#0A192F] text-[#0A192F] font-bold text-sm">
              {tr('I already have an account', 'لدي حساب')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? '' : 'min-h-screen bg-[#FAF8F5] py-8 px-4'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="bg-gradient-to-r from-[#0A192F] to-[#102445] text-white rounded-3xl p-6 border border-[#D4AF37]/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            {!embedded && (
              <button onClick={() => navigate('portal')} className="text-[11px] text-gray-300 hover:text-white inline-flex items-center gap-1 mb-1">
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? '' : 'rotate-180'}`} />
                {tr('My dashboard', 'لوحتي')}
              </button>
            )}
            <h1 className="font-serif-luxury font-bold text-2xl text-[#F3E5AB] flex items-center gap-2">
              <Mic className="w-6 h-6 text-[#D4AF37]" />
              {tr('Voice rooms', 'الغرف الصوتية')}
            </h1>
            <p className="text-sm text-gray-300">
              {tr('Join a room to practise speaking, or open your own.', '{ادخل|ادخلي} غرفة {وتدرّب|وتدرّبي} على المحادثة، أو {افتح|افتحي} غرفتك.')}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            disabled={configured === false && !admin}
            className="self-start px-4 py-3 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {tr('Open a room', '{افتح|افتحي} غرفة')}
          </button>
        </div>

        {configured === false && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            {admin
              ? tr(
                  'Voice is not switched on yet: add REALTIME_APP_ID and REALTIME_APP_TOKEN as secrets in the Cloudflare Worker settings.',
                  'الصوت غير مفعّل بعد: أضيفي REALTIME_APP_ID و REALTIME_APP_TOKEN كـ Secrets في إعدادات الـ Worker على Cloudflare.'
                )
              : tr('Voice rooms open very soon.', 'الغرف الصوتية تُفتح قريبًا جدًا.')}
          </div>
        )}
        {loadErr && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{loadErr}</div>}

        <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs text-gray-600 leading-relaxed">
          {tr(
            'Be kind and speak English as much as you can. Room owners can accept or refuse who enters, and anyone can report bad behaviour.',
            '{كن|كوني} {لطيفًا|لطيفة} {وتحدث|وتحدثي} بالإنجليزية قدر الإمكان. صاحب/ة الغرفة يقبل أو يرفض من يدخل، ويمكن لأي أحد الإبلاغ عن أي إساءة.'
          )}
        </div>

        {visible.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-dashed border-gray-300 text-center text-sm text-gray-500">
            {tr('No rooms right now. Be the first to open one!', 'لا توجد غرف الآن. {كن|كوني} أول من يفتح غرفة!')}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(({ r, live }) => (
              <button
                key={r.id}
                onClick={() => navigate('room/' + r.id)}
                className="text-start p-5 rounded-3xl bg-white border border-gray-200 hover:border-[#D4AF37] hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0A192F] text-base leading-snug">{r.title}</h3>
                  {r.level && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/40 shrink-0">{r.level}</span>}
                </div>
                {r.topic && <p className="text-xs text-gray-600 line-clamp-2">{r.topic}</p>}
                <PrivacyBadge privacy={r.privacy} girlsOnly={r.girlsOnly} isAr={isAr} />
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>{r.ownerName}</span>
                  {r.status === 'closed' ? (
                    <span className="text-gray-400 font-bold">{tr('Closed', 'مغلقة')}</span>
                  ) : live ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      {tr('Live', 'مباشر')}
                      {r.liveCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 ms-1">
                          <Users className="w-3 h-3" />
                          {r.liveCount}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span>{tr('Quiet now', 'هادئة الآن')}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateRoomModal
          isAr={isAr}
          isFemale={isFemale}
          onClose={() => setShowCreate(false)}
          onCreate={async (d) => {
            const id = await createRoom({ ...d, ownerId: uid, ownerName: ((user as any)?.fullName || firebaseUser?.displayName || '').slice(0, 80) });
            setShowCreate(false);
            navigate('room/' + id);
          }}
        />
      )}
    </div>
  );
};

const CreateRoomModal: React.FC<{
  isAr: boolean;
  isFemale: boolean;
  onClose: () => void;
  onCreate: (d: { title: string; topic: string; level: string; privacy: RoomPrivacy; girlsOnly: boolean; maxSpeakers: number }) => Promise<void>;
}> = ({ isAr, isFemale, onClose, onCreate }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [privacy, setPrivacy] = useState<RoomPrivacy>('approval');
  const [girlsOnly, setGirlsOnly] = useState(isFemale);
  const [maxSpeakers, setMaxSpeakers] = useState(6);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const opts: { v: RoomPrivacy; en: string; ar: string; dEn: string; dAr: string }[] = [
    { v: 'public', en: 'Open', ar: 'عامة', dEn: 'Anyone can enter and listen.', dAr: 'أي أحد يدخل ويستمع مباشرة.' },
    { v: 'approval', en: 'By approval', ar: 'بموافقتي', dEn: 'People ask to enter; you accept or refuse.', dAr: 'يطلبون الدخول {وأنت تقبل أو ترفض|وأنتِ تقبلين أو ترفضين}.' },
    { v: 'private', en: 'Private', ar: 'خاصة', dEn: 'Hidden from the list; only via your link, with approval.', dAr: 'لا تظهر في القائمة؛ بالرابط فقط ومع {موافقتك|موافقتكِ}.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-[#0A192F]">{tr('New voice room', 'غرفة صوتية جديدة')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-bold text-gray-700">{tr('Room name', 'اسم الغرفة')}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 80))} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm" placeholder={tr('e.g. Daily small talk', 'مثلًا: محادثة يومية')} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-bold text-gray-700">{tr('Topic (optional)', 'الموضوع (اختياري)')}</span>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value.slice(0, 300))} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tr('Level', 'المستوى')}</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white">
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l || tr('All levels', 'كل المستويات')}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-gray-700">{tr('Max speakers', 'أقصى عدد للمتحدثين')}</span>
            <select value={maxSpeakers} onChange={(e) => setMaxSpeakers(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white">
              {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-700">{tr('Who can enter?', 'من يدخل الغرفة؟')}</span>
          {opts.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setPrivacy(o.v)}
              className={`w-full text-start p-3 rounded-xl border text-sm ${privacy === o.v ? 'border-[#D4AF37] bg-[#FAF8F5]' : 'border-gray-200'}`}
            >
              <span className="font-bold text-[#0A192F] block">{tr(o.en, o.ar)}</span>
              <span className="text-xs text-gray-500">{tr(o.dEn, o.dAr)}</span>
            </button>
          ))}
        </div>
        {isFemale && (
          <label className="flex items-center gap-2 p-3 rounded-xl bg-pink-50 border border-pink-200 text-sm font-bold text-pink-800 cursor-pointer">
            <input type="checkbox" checked={girlsOnly} onChange={(e) => setGirlsOnly(e.target.checked)} className="w-4 h-4" />
            {tr('Girls only (boys will not see the room)', 'للبنات فقط (لا تظهر الغرفة للطلاب)')}
          </label>
        )}
        {err && <p className="text-xs text-red-600">{err}</p>}
        <button
          disabled={busy || !title.trim()}
          onClick={async () => {
            setBusy(true);
            setErr('');
            try {
              await onCreate({ title: title.trim(), topic: topic.trim(), level, privacy, girlsOnly: isFemale && girlsOnly, maxSpeakers });
            } catch (e) {
              console.error(e);
              setErr(tr('Could not create the room. Please try again.', 'تعذر إنشاء الغرفة. {حاول|حاولي} مرة أخرى.'));
              setBusy(false);
            }
          }}
          className="w-full py-3 rounded-xl bg-[#0A192F] text-[#F3E5AB] font-bold text-sm disabled:opacity-50"
        >
          {busy ? '…' : tr('Create and enter', 'إنشاء ودخول')}
        </button>
      </div>
    </div>
  );
};
