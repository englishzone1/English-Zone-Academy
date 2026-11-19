import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Hand,
  MonitorUp,
  MonitorX,
  LogOut,
  Link2,
  Flag,
  Crown,
  Check,
  X,
  Send,
  MessageSquare,
  Settings,
  Ban,
  UserMinus,
  UserPlus,
  Maximize2,
  Trash2,
  Lock,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  ACTIVE_MS,
  ChatMsg,
  HEARTBEAT_MS,
  RoomMember,
  RoomPrivacy,
  VoiceRoom,
  deleteChat,
  deleteRoom,
  joinRoom,
  removeMember,
  reportUser,
  roomLink,
  sendChat,
  updateMember,
  updateRoom,
  watchChat,
  watchMembers,
  watchMyMember,
  watchRoom,
} from '../services/voiceRooms';
import { LevelMeter } from '../services/voiceRtc';
import { P2PMesh } from '../services/voiceP2P';
import { PrivacyBadge, userGender } from './VoiceRoomsPage';

const canShareScreen = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices;

const Avatar: React.FC<{ m: RoomMember; size?: string; speaking?: boolean }> = ({ m, size = 'w-16 h-16', speaking }) => (
  <div className={`relative ${size} rounded-full shrink-0 transition-shadow ${speaking ? 'ring-4 ring-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]' : 'ring-2 ring-white'}`}>
    {m.photo ? (
      <img src={m.photo} alt="" referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
    ) : (
      <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-lg text-white ${m.gender === 'female' ? 'bg-pink-400' : m.gender === 'male' ? 'bg-sky-500' : 'bg-[#0A192F]'}`}>
        {(m.name || '?').trim().charAt(0).toUpperCase()}
      </div>
    )}
  </div>
);

const AudioSink: React.FC<{ track: MediaStreamTrack; onBlocked: () => void }> = ({ track, onBlocked }) => {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = new MediaStream([track]);
      ref.current.play().catch(() => onBlocked());
    }
  }, [track]);
  return <audio ref={ref} autoPlay playsInline />;
};

const VideoSink: React.FC<{ track: MediaStreamTrack }> = ({ track }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = new MediaStream([track]);
      ref.current.play().catch(() => {});
    }
  }, [track]);
  return (
    <div className="relative bg-black rounded-2xl overflow-hidden">
      <video ref={ref} autoPlay playsInline muted className="w-full max-h-[60vh] object-contain" />
      <button
        onClick={() => ref.current?.requestFullscreen?.().catch(() => {})}
        className="absolute top-2 end-2 p-2 rounded-lg bg-black/60 text-white"
        title="Fullscreen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const VoiceRoomPage: React.FC<{ roomId: string; navigate: (r: string) => void }> = ({ roomId, navigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { user, firebaseUser, isAuthenticated, isLoading, isAdmin, isSuperAdmin } = useAuth();
  const admin = isAdmin || isSuperAdmin;
  const uid = firebaseUser?.uid || '';
  const myName = ((user as any)?.fullName || firebaseUser?.displayName || 'Member').slice(0, 60);
  const gender = userGender(user);

  const [room, setRoom] = useState<VoiceRoom | null | undefined>(undefined);
  const [me, setMe] = useState<RoomMember | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [entered, setEntered] = useState(false); // ضغطت زر الدخول (لازم لتشغيل الصوت في المتصفح)
  const [joining, setJoining] = useState(false);
  const [notice, setNotice] = useState('');
  const [tracks, setTracks] = useState<Record<string, MediaStreamTrack>>({});
  const [speaking, setSpeaking] = useState<Set<string>>(new Set());
  const [micReady, setMicReady] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [menuFor, setMenuFor] = useState<RoomMember | null>(null);
  const [now, setNow] = useState(Date.now());
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [conn, setConn] = useState({ outTotal: 0, outOk: 0, inTotal: 0, inOk: 0, turn: false });

  const meshRef = useRef<P2PMesh | null>(null);
  const micTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const meterRef = useRef<LevelMeter | null>(null);

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice((n) => (n === msg ? '' : n)), 5000);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // الغرفة
  useEffect(() => {
    if (!uid) return;
    return watchRoom(roomId, setRoom, () => setRoom(null));
  }, [roomId, uid]);

  const isOwner = !!room && room.ownerId === uid;
  const isMod = isOwner || admin;
  const inRoom = entered && me?.status === 'in';
  const isSpeaker = inRoom && (me?.role === 'owner' || me?.role === 'speaker');

  // وثيقتي في الغرفة
  useEffect(() => {
    if (!uid || !entered) return;
    return watchMyMember(roomId, uid, setMe, () => setMe(null));
  }, [roomId, uid, entered]);

  // المشاركون (لمن دخل فعلًا أو للمشرفة)
  useEffect(() => {
    if (!uid || !entered || !(inRoom || isMod)) return;
    return watchMembers(roomId, setMembers, () => {});
  }, [roomId, uid, entered, inRoom, isMod]);

  useEffect(() => {
    if (!inRoom) return;
    return watchChat(roomId, setChat);
  }, [roomId, inRoom]);

  const fresh = useCallback((m: RoomMember) => now - (m.seenAt || 0) < ACTIVE_MS, [now]);
  const present = useMemo(() => members.filter((m) => m.status === 'in' && (fresh(m) || m.uid === uid)), [members, fresh, uid]);
  const stage = useMemo(
    () => present.filter((m) => m.role === 'owner' || m.role === 'speaker').sort((a, b) => Number(b.role === 'owner') - Number(a.role === 'owner') || a.joinedAt - b.joinedAt),
    [present]
  );
  const audience = useMemo(() => present.filter((m) => m.role === 'listener').sort((a, b) => Number(b.hand) - Number(a.hand) || a.joinedAt - b.joinedAt), [present]);
  const pending = useMemo(() => members.filter((m) => m.status === 'pending'), [members]);
  const presentRef = useRef<RoomMember[]>([]);
  presentRef.current = present;
  const screenOwner = present.find((m) => m.screen);

  // ===== الصوت: شبكة الاتصالات المباشرة =====
  useEffect(() => {
    if (!inRoom) return;
    const meter = (meterRef.current = meterRef.current || new LevelMeter());
    const mesh = new P2PMesh(
      roomId,
      uid,
      (key, track) => {
        setTracks((t) => ({ ...t, [key]: track }));
        if (key.endsWith(':mic')) meter.add(key, track);
      },
      (key) => {
        meter.remove(key);
        setTracks((t) => {
          const n = { ...t };
          delete n[key];
          return n;
        });
      }
    );
    meshRef.current = mesh;
    mesh.start();
    mesh.sync(presentRef.current);
    return () => {
      mesh.close();
      if (meshRef.current === mesh) meshRef.current = null;
      micTrackRef.current = null;
      screenTrackRef.current = null;
      setScreenOn(false);
      setTracks({});
    };
  }, [inRoom, roomId, uid]);

  useEffect(() => {
    meshRef.current?.sync(present);
  }, [present]);

  useEffect(() => {
    if (!inRoom) return;
    const t = setInterval(() => {
      const st = meshRef.current?.status();
      if (st) setConn((o) => (o.outTotal === st.outTotal && o.outOk === st.outOk && o.inTotal === st.inTotal && o.inOk === st.inOk && o.turn === st.turn ? o : st));
    }, 2000);
    return () => clearInterval(t);
  }, [inRoom]);

  // تنبيه الـ VPN: إن بقي الاتصال ناقصًا 30 ثانية
  const badSince = useRef(0);
  const [showVpnHint, setShowVpnHint] = useState(false);
  useEffect(() => {
    const bad = (conn.inTotal > 0 && conn.inOk < conn.inTotal) || (conn.outTotal > 0 && conn.outOk < conn.outTotal);
    if (!bad) {
      badSince.current = 0;
      setShowVpnHint(false);
      return;
    }
    if (!badSince.current) badSince.current = Date.now();
    const left = 30000 - (Date.now() - badSince.current);
    if (left <= 0) {
      setShowVpnHint(true);
      return;
    }
    const t = setTimeout(() => setShowVpnHint(true), left);
    return () => clearTimeout(t);
  }, [conn]);

  const unlockAudio = () => {
    document.querySelectorAll('audio').forEach((a) => (a as HTMLAudioElement).play().catch(() => {}));
    meterRef.current?.levels();
    setAudioBlocked(false);
  };

  // ===== الصوت: النشر للمتحدثين =====
  useEffect(() => {
    if (!isSpeaker) return;
    let cancelled = false;
    let track: MediaStreamTrack | null = null;
    (async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      } catch {
        flash(tr('Microphone permission is needed to speak.', 'يلزم السماح بالميكروفون للتحدث.'));
        updateMember(roomId, uid, { muted: true }).catch(() => {});
        return;
      }
      track = stream.getAudioTracks()[0];
      track.enabled = false;
      const mesh = meshRef.current;
      if (cancelled || !mesh) {
        track.stop();
        return;
      }
      micTrackRef.current = track;
      const nonce = mesh.setLocal('mic', track);
      (meterRef.current = meterRef.current || new LevelMeter()).add(uid + ':mic', track);
      setMicReady(true);
      await updateMember(roomId, uid, { pub: nonce }).catch(() => {});
    })();
    return () => {
      cancelled = true;
      setMicReady(false);
      meterRef.current?.remove(uid + ':mic');
      if (track) {
        meshRef.current?.setLocal('mic', null);
        track.stop();
        if (micTrackRef.current === track) micTrackRef.current = null;
        updateMember(roomId, uid, { pub: null }).catch(() => {});
      }
    };
  }, [isSpeaker, roomId, uid]);

  // الكتم: من وثيقتي
  useEffect(() => {
    if (micTrackRef.current) micTrackRef.current.enabled = !me?.muted;
  }, [me?.muted, micReady]);

  // ===== مشاركة الشاشة =====
  const stopScreen = useCallback(
    (write = true) => {
      const t = screenTrackRef.current;
      screenTrackRef.current = null;
      setScreenOn(false);
      if (t) {
        meshRef.current?.setLocal('screen', null);
        t.stop();
        if (write) updateMember(roomId, uid, { screen: null }).catch(() => {});
      }
    },
    [roomId, uid]
  );

  const startScreen = async () => {
    if (screenOwner && screenOwner.uid !== uid) return flash(tr('Someone is already sharing their screen.', 'هناك من يشارك شاشته الآن.'));
    let stream: MediaStream;
    try {
      stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: { frameRate: 10 }, audio: false });
    } catch {
      return;
    }
    const track = stream.getVideoTracks()[0];
    try {
      track.contentHint = 'detail';
    } catch {
      /* ignore */
    }
    const mesh = meshRef.current;
    if (!mesh) return track.stop();
    screenTrackRef.current = track;
    const nonce = mesh.setLocal('screen', track);
    setScreenOn(true);
    track.onended = () => stopScreen();
    await updateMember(roomId, uid, { screen: nonce }).catch(() => {
      stopScreen(false);
      flash(tr('Could not share the screen.', 'تعذرت مشاركة الشاشة.'));
    });
  };

  useEffect(() => {
    if (screenTrackRef.current && (!inRoom || !me?.canScreen)) stopScreen(inRoom);
  }, [inRoom, me?.canScreen, stopScreen]);

  // مستوى الصوت: من يتكلم الآن
  useEffect(() => {
    if (!inRoom) return;
    const t = setInterval(() => {
      const lv = meterRef.current?.levels() || {};
      const s = new Set<string>();
      Object.entries(lv).forEach(([k, v]) => {
        const id = k.split(':')[0];
        if (v > 0.045 && !(id === uid && me?.muted)) s.add(id);
      });
      setSpeaking((old) => (old.size === s.size && [...s].every((x) => old.has(x)) ? old : s));
    }, 250);
    return () => clearInterval(t);
  }, [inRoom, uid, me?.muted]);

  // نبض الحضور: كل 3 دقائق (لتوفير حصة Firestore المجانية)
  const roomRef = useRef<VoiceRoom | null | undefined>(room);
  roomRef.current = room;
  useEffect(() => {
    if (!inRoom) return;
    const beat = () => {
      const t = Date.now();
      updateMember(roomId, uid, { seenAt: t }).catch(() => {});
      const r = roomRef.current;
      if (r && t - (r.lastActiveAt || 0) > HEARTBEAT_MS - 5000) {
        updateRoom(roomId, { lastActiveAt: t, liveCount: presentRef.current.length } as any).catch(() => {});
      }
    };
    beat();
    const i = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(i);
  }, [inRoom, roomId, uid]);

  // الخروج عند إغلاق الصفحة
  useEffect(() => {
    if (!inRoom) return;
    const bye = () => {
      updateMember(roomId, uid, { status: 'left', pub: null, screen: null, hand: false }).catch(() => {});
    };
    window.addEventListener('pagehide', bye);
    return () => window.removeEventListener('pagehide', bye);
  }, [inRoom, roomId, uid]);

  // تنظيف كامل عند مغادرة الصفحة
  useEffect(
    () => () => {
      stopScreen(false);
      meterRef.current?.close();
      meterRef.current = null;
    },
    [stopScreen]
  );

  // طرد أو إغلاق الغرفة
  useEffect(() => {
    if (entered && me?.status === 'kicked') {
      stopScreen(false);
      setEntered(false);
      flash(tr('You were removed from this room.', 'تم إخراجك من هذه الغرفة.'));
    }
  }, [me?.status]);

  useEffect(() => {
    if (entered && room && room.status === 'closed' && !isMod) {
      leave(false);
      flash(tr('The room was closed.', 'أُغلقت الغرفة.'));
    }
  }, [room?.status]);


  const enter = async () => {
    if (!room) return;
    setJoining(true);
    try {
      const st = await joinRoom(room, { uid, name: myName, photo: firebaseUser?.photoURL || '', gender }, admin);
      if (st === 'kicked') {
        flash(tr('You cannot enter this room.', 'لا يمكنك دخول هذه الغرفة.'));
      } else {
        setEntered(true);
        // فتح الصوت في المتصفح بلمسة المستخدم
        (meterRef.current = meterRef.current || new LevelMeter()).levels();
      }
    } catch (e) {
      console.error(e);
      flash(tr('Could not enter the room.', 'تعذر دخول الغرفة.'));
    } finally {
      setJoining(false);
    }
  };

  const leave = async (goBack = true) => {
    stopScreen(false);
    setEntered(false);
    setMe(null);
    setMembers([]);
    await updateMember(roomId, uid, { status: 'left', pub: null, screen: null, hand: false }).catch(() => {});
    if (goBack) navigate('rooms');
  };

  const toggleMute = () => me && updateMember(roomId, uid, { muted: !me.muted }).catch(() => {});
  const toggleHand = () => me && updateMember(roomId, uid, { hand: !me.hand }).catch(() => {});

  const mod = {
    approve: (m: RoomMember) => updateMember(roomId, m.uid, { status: 'in' }),
    decline: (m: RoomMember) => removeMember(roomId, m.uid),
    ban: (m: RoomMember) => updateMember(roomId, m.uid, { status: 'kicked', pub: null, screen: null, hand: false, role: m.role === 'owner' ? 'owner' : 'listener' }),
    toStage: async (m: RoomMember) => {
      if (stage.length >= (room?.maxSpeakers || 6)) {
        flash(tr('The stage is full.', 'المنصة ممتلئة بالمتحدثين.'));
        return;
      }
      await updateMember(roomId, m.uid, { role: 'speaker', hand: false, muted: true });
    },
    toAudience: (m: RoomMember) => updateMember(roomId, m.uid, { role: 'listener', pub: null, screen: null, canScreen: false, muted: true }),
    mute: (m: RoomMember) => updateMember(roomId, m.uid, { muted: true }),
    screen: (m: RoomMember, on: boolean) => updateMember(roomId, m.uid, on ? { canScreen: true } : { canScreen: false, screen: null }),
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomLink(roomId));
      flash(tr('Room link copied.', 'تم نسخ رابط الغرفة.'));
    } catch {
      window.prompt(tr('Room link', 'رابط الغرفة'), roomLink(roomId));
    }
  };

  // ===== العرض =====
  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#FAF8F5] py-6 px-3 sm:px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-4">{children}</div>
      {notice && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center z-50 px-4">
          <div className="px-4 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-sm font-bold shadow-xl">{notice}</div>
        </div>
      )}
    </div>
  );

  if (isLoading) return <div className="min-h-[50vh]" />;
  if (!isAuthenticated) {
    return shell(
      <div className="bg-white rounded-3xl p-8 text-center space-y-4 border border-[#D4AF37]/40">
        <Mic className="w-10 h-10 text-[#D4AF37] mx-auto" />
        <p className="font-bold text-[#0A192F]">{tr('Sign up free to join voice rooms.', '{سجّل|سجّلي} مجانًا لدخول الغرف الصوتية.')}</p>
        <div className="flex gap-2 justify-center">
          <button onClick={() => navigate('join-us')} className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-sm">
            {tr('Sign up', 'تسجيل')}
          </button>
          <button onClick={() => navigate('login')} className="px-5 py-2.5 rounded-xl border border-[#0A192F] font-bold text-sm">
            {tr('Log in', 'دخول')}
          </button>
        </div>
      </div>
    );
  }
  if (room === undefined) return shell(<Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto mt-20" />);
  if (room === null) {
    return shell(
      <div className="bg-white rounded-3xl p-8 text-center space-y-3 border border-gray-200">
        <Lock className="w-8 h-8 text-gray-400 mx-auto" />
        <p className="font-bold text-[#0A192F]">{tr('This room is not available.', 'هذه الغرفة غير متاحة.')}</p>
        <button onClick={() => navigate('rooms')} className="px-5 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] font-bold text-sm">
          {tr('All rooms', 'كل الغرف')}
        </button>
      </div>
    );
  }

  const header = (
    <div className="bg-gradient-to-r from-[#0A192F] to-[#102445] text-white rounded-3xl p-5 border border-[#D4AF37]/40 shadow-lg space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <button onClick={() => (inRoom ? leave() : navigate('rooms'))} className="text-[11px] text-gray-300 hover:text-white inline-flex items-center gap-1">
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? '' : 'rotate-180'}`} />
            {tr('All rooms', 'كل الغرف')}
          </button>
          <h1 className="font-bold text-xl text-[#F3E5AB] break-words">{room.title}</h1>
          {room.topic && <p className="text-xs text-gray-300">{room.topic}</p>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={copyLink} className="p-2 rounded-xl bg-white/10 hover:bg-white/20" title={tr('Copy invite link', 'نسخ رابط الدعوة')}>
            <Link2 className="w-4 h-4" />
          </button>
          {isMod && (
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20" title={tr('Room settings', 'إعدادات الغرفة')}>
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PrivacyBadge privacy={room.privacy} girlsOnly={room.girlsOnly} isAr={isAr} />
        {room.level && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0A192F]">{room.level}</span>}
        {room.status === 'closed' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{tr('Closed', 'مغلقة')}</span>}
      </div>
    </div>
  );

  // قبل الدخول / بانتظار الموافقة
  if (!inRoom) {
    const waiting = entered && me?.status === 'pending';
    return shell(
      <>
        {header}
        <div className="bg-white rounded-3xl p-8 text-center space-y-4 border border-gray-200">
          {room.status === 'closed' && !isMod ? (
            <p className="text-sm text-gray-600 font-bold">{tr('This room is closed now.', 'هذه الغرفة مغلقة الآن.')}</p>
          ) : waiting ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
              <p className="font-bold text-[#0A192F]">{tr('Waiting for the room owner to let you in…', 'بانتظار موافقة صاحب/ة الغرفة على دخولك…')}</p>
              <button onClick={() => leave()} className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold">
                {tr('Cancel', 'إلغاء')}
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#0A192F] text-[#F3E5AB] flex items-center justify-center mx-auto">
                <Mic className="w-8 h-8" />
              </div>
              <p className="text-sm text-gray-600">
                {room.privacy === 'public' || isOwner || admin
                  ? tr('You will enter as a listener. Raise your hand to speak.', '{ستدخل|ستدخلين} {مستمعًا|مستمعة}. {ارفع|ارفعي} يدك لتتحدث{|ي}.')
                  : tr('This room needs approval. Your request will be sent to the owner.', 'هذه الغرفة تحتاج موافقة. سيُرسل طلبك إلى صاحب/ة الغرفة.')}
              </p>
              <button
                onClick={enter}
                disabled={joining}
                className="px-8 py-3 rounded-2xl bg-[#D4AF37] text-[#0A192F] font-bold text-base inline-flex items-center gap-2 disabled:opacity-50"
              >
                {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                {room.privacy === 'public' || isOwner || admin ? tr('Enter the room', 'دخول الغرفة') : tr('Ask to enter', 'طلب الدخول')}
              </button>
            </>
          )}
        </div>
        {showSettings && isMod && <RoomSettings room={room} isAr={isAr} canGirls={gender === 'female' || admin} onClose={() => setShowSettings(false)} onDeleted={() => navigate('rooms')} />}
      </>
    );
  }

  const tile = (m: RoomMember, big: boolean) => (
    <button key={m.uid} onClick={() => m.uid !== uid && setMenuFor(m)} className="flex flex-col items-center gap-1.5 w-20 sm:w-24 text-center">
      <div className="relative">
        <Avatar m={m} size={big ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12'} speaking={speaking.has(m.uid)} />
        {m.role === 'owner' && <Crown className="absolute -top-2 -end-1 w-5 h-5 text-[#D4AF37] drop-shadow" />}
        {big && (
          <span className={`absolute -bottom-1 -end-1 w-6 h-6 rounded-full flex items-center justify-center ${m.muted ? 'bg-gray-500' : 'bg-emerald-500'} text-white border-2 border-white`}>
            {m.muted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          </span>
        )}
        {!big && m.hand && <span className="absolute -top-1 -end-1 text-base">✋</span>}
        {m.screen && <MonitorUp className="absolute -bottom-1 -start-1 w-5 h-5 p-0.5 rounded-full bg-[#0A192F] text-white" />}
      </div>
      <span className="text-[11px] font-bold text-[#0A192F] truncate w-full">{m.uid === uid ? tr('You', 'أنت') : m.name}</span>
    </button>
  );

  const hands = audience.filter((m) => m.hand);

  return shell(
    <>
      {header}

      {/* أصوات الآخرين */}
      {Object.entries(tracks)
        .filter(([k]) => k.endsWith(':mic'))
        .map(([k, t]) => (
          <AudioSink key={k} track={t} onBlocked={() => setAudioBlocked(true)} />
        ))}

      {audioBlocked && (
        <button onClick={unlockAudio} className="w-full p-4 rounded-2xl bg-[#D4AF37] text-[#0A192F] font-bold text-base animate-pulse">
          🔊 {tr('Tap here to hear the room', 'اضغط/ي هنا لتشغيل صوت الغرفة')}
        </button>
      )}

      {showVpnHint && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-sm text-amber-900 font-bold leading-relaxed">
          ⚠️{' '}
          {tr(
            'The sound is not connecting. If you use a VPN, turn it off during the room, then leave and enter again.',
            'الصوت لا يتصل. إذا كان لديك VPN {أوقفه|أوقفيه} أثناء الغرفة، ثم {اخرج|اخرجي} {وادخل|وادخلي} من جديد.'
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
        {isSpeaker && (
          <span className={`px-2.5 py-1 rounded-full border ${conn.outTotal > 0 && conn.outOk === conn.outTotal ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {tr('Your voice reaches', 'صوتك يصل إلى')} {conn.outOk}/{conn.outTotal}
          </span>
        )}
        {conn.inTotal > 0 && (
          <span className={`px-2.5 py-1 rounded-full border ${conn.inOk === conn.inTotal ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {tr('You hear', 'تسمع/ين')} {conn.inOk}/{conn.inTotal} {tr('speakers', 'متحدث')}
          </span>
        )}
        {admin && (
          <span className={`px-2.5 py-1 rounded-full border ${conn.turn ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            {conn.turn ? tr('Relay server: on', 'خادم الاتصال: مفعّل') : tr('Relay server: off', 'خادم الاتصال: غير مفعّل')}
          </span>
        )}
        {isSpeaker && me?.muted && micReady && (
          <span className="px-2.5 py-1 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
            {tr('Your mic is off — tap “Unmute” below', 'المايك مغلق: اضغط/ي «تشغيل المايك» في الأسفل ليسمعوك')}
          </span>
        )}
      </div>

      {/* طلبات الدخول للمشرفة */}
      {isMod && pending.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 space-y-2">
          <h3 className="text-sm font-bold text-amber-800">{tr('Requests to enter', 'طلبات الدخول')} ({pending.length})</h3>
          {pending.map((m) => (
            <div key={m.uid} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar m={m} size="w-9 h-9" />
                <span className="text-sm font-bold truncate">{m.name}</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => mod.approve(m).catch(() => {})} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {tr('Accept', 'قبول')}
                </button>
                <button onClick={() => mod.decline(m).catch(() => {})} className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold">
                  {tr('Decline', 'رفض')}
                </button>
                <button onClick={() => mod.ban(m).catch(() => {})} className="p-1.5 rounded-lg bg-red-50 text-red-600" title={tr('Block from room', 'حظر من الغرفة')}>
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* الأيدي المرفوعة */}
      {isMod && hands.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#D4AF37]/60 p-4 space-y-2">
          <h3 className="text-sm font-bold text-[#0A192F]">✋ {tr('Want to speak', 'يريدون التحدث')}</h3>
          {hands.map((m) => (
            <div key={m.uid} className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold truncate">{m.name}</span>
              <div className="flex gap-1.5">
                <button onClick={() => mod.toStage(m).catch(() => {})} className="px-3 py-1.5 rounded-lg bg-[#0A192F] text-[#F3E5AB] text-xs font-bold">
                  {tr('Let speak', 'السماح بالكلام')}
                </button>
                <button onClick={() => updateMember(roomId, m.uid, { hand: false }).catch(() => {})} className="px-3 py-1.5 rounded-lg bg-gray-200 text-xs font-bold">
                  {tr('Not now', 'ليس الآن')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* الشاشة المشتركة */}
      {screenOwner && (
        <div className="bg-white rounded-3xl border border-gray-200 p-3 space-y-2">
          <div className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
            <MonitorUp className="w-4 h-4" />
            {screenOwner.uid === uid ? tr('You are sharing your screen', 'أنت تشارك{|ين} شاشتك') : `${tr('Screen of', 'شاشة')} ${screenOwner.name}`}
          </div>
          {screenOwner.uid !== uid && tracks[screenOwner.uid + ':screen'] ? (
            <VideoSink track={tracks[screenOwner.uid + ':screen']} />
          ) : screenOwner.uid !== uid ? (
            <div className="h-40 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : null}
        </div>
      )}

      <div className={`grid gap-4 ${showChat ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-500">
              {tr('Speakers', 'المتحدثون')} ({stage.length}/{room.maxSpeakers})
            </h3>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">{stage.map((m) => tile(m, true))}</div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-500">
              {tr('Listeners', 'المستمعون')} ({audience.length})
            </h3>
            {audience.length === 0 ? (
              <p className="text-xs text-gray-400">{tr('No listeners yet.', 'لا يوجد مستمعون بعد.')}</p>
            ) : (
              <div className="flex flex-wrap gap-3">{audience.map((m) => tile(m, false))}</div>
            )}
          </div>
        </div>
        {showChat && <RoomChat roomId={roomId} uid={uid} name={myName} msgs={chat} isMod={isMod} isAr={isAr} />}
      </div>

      <div className="h-20" />

      {/* شريط التحكم */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-3 py-3" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <button onClick={() => leave()} className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-bold inline-flex items-center gap-1.5">
            <LogOut className="w-4 h-4" />
            {tr('Leave', 'خروج')}
          </button>
          <div className="flex items-center gap-2">
            {me?.role === 'speaker' && (
              <button
                onClick={() => updateMember(roomId, uid, { role: 'listener', pub: null, screen: null, muted: true, hand: false }).catch(() => {})}
                className="p-3 rounded-full bg-gray-100 text-[#0A192F]"
                title={tr('Leave the stage', 'النزول إلى المستمعين')}
              >
                <UserMinus className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setShowChat((s) => !s)} className={`p-3 rounded-full ${showChat ? 'bg-[#0A192F] text-white' : 'bg-gray-100 text-[#0A192F]'}`} title={tr('Chat', 'الدردشة')}>
              <MessageSquare className="w-5 h-5" />
            </button>
            {me?.canScreen && canShareScreen() && (
              <button
                onClick={() => (screenOn ? stopScreen() : startScreen())}
                className={`p-3 rounded-full ${screenOn ? 'bg-red-600 text-white' : 'bg-gray-100 text-[#0A192F]'}`}
                title={screenOn ? tr('Stop sharing', 'إيقاف المشاركة') : tr('Share screen', 'مشاركة الشاشة')}
              >
                {screenOn ? <MonitorX className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
              </button>
            )}
            {isSpeaker ? (
              <button
                onClick={toggleMute}
                disabled={!micReady}
                className={`px-5 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 disabled:opacity-50 ${me?.muted ? 'bg-gray-200 text-gray-700' : 'bg-emerald-500 text-white'}`}
              >
                {!micReady ? <Loader2 className="w-5 h-5 animate-spin" /> : me?.muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {me?.muted ? tr('Unmute', 'تشغيل المايك') : tr('Mute', 'كتم')}
              </button>
            ) : (
              <button onClick={toggleHand} className={`px-5 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 ${me?.hand ? 'bg-[#D4AF37] text-[#0A192F]' : 'bg-[#0A192F] text-[#F3E5AB]'}`}>
                <Hand className="w-5 h-5" />
                {me?.hand ? tr('Lower hand', 'إنزال اليد') : tr('Raise hand', 'رفع اليد')}
              </button>
            )}
          </div>
        </div>
      </div>

      {menuFor && (
        <MemberMenu
          m={menuFor}
          isMod={isMod}
          isAr={isAr}
          onClose={() => setMenuFor(null)}
          act={async (a) => {
            const m = menuFor;
            setMenuFor(null);
            try {
              if (a === 'stage') await mod.toStage(m);
              if (a === 'audience') await mod.toAudience(m);
              if (a === 'mute') await mod.mute(m);
              if (a === 'screenOn') await mod.screen(m, true);
              if (a === 'screenOff') await mod.screen(m, false);
              if (a === 'kick') await mod.ban(m);
              if (a === 'report') {
                const reason = window.prompt(tr('What happened? (sent to the academy)', 'ماذا حدث؟ (يُرسل إلى الأكاديمية)'));
                if (reason === null) return;
                await reportUser({
                  roomId,
                  roomTitle: room.title.slice(0, 80),
                  reportedUid: m.uid,
                  reportedName: m.name,
                  reporterUid: uid,
                  reporterName: myName,
                  reason: reason || '',
                });
                flash(tr('Thank you, the report was sent.', 'شكرًا، تم إرسال البلاغ.'));
              }
            } catch (e) {
              console.error(e);
              flash(tr('Could not complete this action.', 'تعذر تنفيذ هذا الإجراء.'));
            }
          }}
        />
      )}
      {showSettings && isMod && <RoomSettings room={room} isAr={isAr} canGirls={gender === 'female' || admin} onClose={() => setShowSettings(false)} onDeleted={() => navigate('rooms')} />}
    </>
  );
};

type MenuAction = 'stage' | 'audience' | 'mute' | 'screenOn' | 'screenOff' | 'kick' | 'report';

const MemberMenu: React.FC<{ m: RoomMember; isMod: boolean; isAr: boolean; onClose: () => void; act: (a: MenuAction) => void }> = ({ m, isMod, isAr, onClose, act }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const item = (a: MenuAction, icon: React.ReactNode, label: string, danger = false) => (
    <button key={a} onClick={() => act(a)} className={`w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-[#0A192F] hover:bg-gray-50'}`}>
      {icon}
      {label}
    </button>
  );
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3" onClick={onClose} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-sm p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 pb-2 mb-1 border-b border-gray-100">
          <Avatar m={m} size="w-12 h-12" />
          <span className="font-bold text-[#0A192F]">{m.name}</span>
        </div>
        {isMod && m.role === 'listener' && item('stage', <UserPlus className="w-4 h-4" />, tr('Invite to speak', 'دعوة للتحدث'))}
        {isMod && m.role === 'speaker' && item('audience', <UserMinus className="w-4 h-4" />, tr('Move to listeners', 'نقل إلى المستمعين'))}
        {isMod && m.role !== 'listener' && !m.muted && item('mute', <MicOff className="w-4 h-4" />, tr('Mute', 'كتم الميكروفون'))}
        {isMod && m.role !== 'owner' && !m.canScreen && item('screenOn', <MonitorUp className="w-4 h-4" />, tr('Allow screen sharing', 'السماح بمشاركة الشاشة'))}
        {isMod && m.role !== 'owner' && m.canScreen && item('screenOff', <MonitorX className="w-4 h-4" />, tr('Stop screen sharing', 'منع مشاركة الشاشة'))}
        {isMod && m.role !== 'owner' && item('kick', <Ban className="w-4 h-4" />, tr('Remove and block from room', 'إخراج وحظر من الغرفة'), true)}
        {item('report', <Flag className="w-4 h-4" />, tr('Report to the academy', 'إبلاغ الأكاديمية'), true)}
        <button onClick={onClose} className="w-full mt-1 py-2.5 rounded-xl bg-gray-100 text-sm font-bold">
          {tr('Close', 'إغلاق')}
        </button>
      </div>
    </div>
  );
};

const RoomChat: React.FC<{ roomId: string; uid: string; name: string; msgs: ChatMsg[]; isMod: boolean; isAr: boolean }> = ({ roomId, uid, name, msgs, isMod, isAr }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [msgs.length]);
  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    await sendChat(roomId, uid, name, t).catch(() => setText(t));
  };
  return (
    <div className="bg-white rounded-3xl border border-gray-200 flex flex-col h-[420px]">
      <div className="px-4 py-3 border-b border-gray-100 text-xs font-bold text-gray-500">{tr('Room chat', 'دردشة الغرفة')}</div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {msgs.map((m) => (
          <div key={m.id} className={`group text-sm ${m.uid === uid ? 'text-end' : ''}`}>
            <span className="text-[10px] font-bold text-gray-400 block">{m.name}</span>
            <span className={`inline-block px-3 py-1.5 rounded-2xl break-words max-w-full ${m.uid === uid ? 'bg-[#0A192F] text-white' : 'bg-gray-100 text-[#0A192F]'}`}>{m.text}</span>
            {(isMod || m.uid === uid) && (
              <button onClick={() => deleteChat(roomId, m.id).catch(() => {})} className="opacity-0 group-hover:opacity-100 ms-1 text-gray-400 hover:text-red-600 align-middle">
                <Trash2 className="w-3.5 h-3.5 inline" />
              </button>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-2 border-t border-gray-100 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm"
          placeholder={tr('Write in English…', '{اكتب|اكتبي} بالإنجليزية…')}
        />
        <button onClick={send} className="p-2.5 rounded-xl bg-[#D4AF37] text-[#0A192F]">
          <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};

const RoomSettings: React.FC<{ room: VoiceRoom; isAr: boolean; canGirls: boolean; onClose: () => void; onDeleted: () => void }> = ({ room, isAr, canGirls, onClose, onDeleted }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [busy, setBusy] = useState(false);
  const set = async (d: Partial<VoiceRoom>) => {
    setBusy(true);
    await updateRoom(room.id, d).catch((e) => console.error(e));
    setBusy(false);
  };
  const opts: { v: RoomPrivacy; en: string; ar: string }[] = [
    { v: 'public', en: 'Open', ar: 'عامة' },
    { v: 'approval', en: 'By approval', ar: 'بالموافقة' },
    { v: 'private', en: 'Private', ar: 'خاصة' },
  ];
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3" onClick={onClose} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#0A192F]">{tr('Room settings', 'إعدادات الغرفة')}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-600">{tr('Who can enter?', 'من يدخل؟')}</span>
          <div className="grid grid-cols-3 gap-2">
            {opts.map((o) => (
              <button
                key={o.v}
                disabled={busy}
                onClick={() => set({ privacy: o.v })}
                className={`py-2 rounded-xl text-xs font-bold border ${room.privacy === o.v ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'border-gray-300'}`}
              >
                {tr(o.en, o.ar)}
              </button>
            ))}
          </div>
        </div>
        {canGirls && (
          <label className="flex items-center gap-2 p-3 rounded-xl bg-pink-50 border border-pink-200 text-sm font-bold text-pink-800">
            <input type="checkbox" checked={room.girlsOnly} disabled={busy} onChange={(e) => set({ girlsOnly: e.target.checked })} className="w-4 h-4" />
            {tr('Girls only', 'للبنات فقط')}
          </label>
        )}
        <button
          disabled={busy}
          onClick={() => set({ status: room.status === 'open' ? 'closed' : 'open' })}
          className="w-full py-2.5 rounded-xl border border-gray-300 text-sm font-bold"
        >
          {room.status === 'open' ? tr('Close the room', 'إغلاق الغرفة') : tr('Reopen the room', 'إعادة فتح الغرفة')}
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            if (!window.confirm(tr('Delete this room for good?', 'حذف الغرفة نهائيًا؟'))) return;
            setBusy(true);
            await deleteRoom(room.id).catch((e) => console.error(e));
            onDeleted();
          }}
          className="w-full py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-bold"
        >
          {tr('Delete the room', 'حذف الغرفة')}
        </button>
      </div>
    </div>
  );
};
