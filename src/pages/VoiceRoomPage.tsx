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
  Minimize2,
  Expand,
  Trash2,
  Lock,
  Loader2,
  ArrowRight,
  Palette,
  Video,
  VideoOff,
  ImagePlus,
  PenLine,
} from 'lucide-react';
import { ROOM_BGS, bgById, getMyBg, setMyBg, shrinkImage } from '../services/roomBackgrounds';
import { nextSession, countdown, formatSession } from '../services/roomSchedule';
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
  clearChat,
  watchMembers,
  watchMyMember,
  watchRoom,
} from '../services/voiceRooms';
import { LevelMeter } from '../services/voiceRtc';
import { P2PMesh, LIGHT_LEVELS, createLightProcessor, LightProcessor } from '../services/voiceP2P';
import { PrivacyBadge, userGender } from './VoiceRoomsPage';
import { Whiteboard } from '../components/rooms/Whiteboard';
import { BoardStore, BoardOp } from '../components/rooms/boardStore';

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

const VideoSink: React.FC<{ track: MediaStreamTrack; label?: string; mirror?: boolean; compact?: boolean }> = ({ track, label, mirror, compact }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = new MediaStream([track]);
      ref.current.play().catch(() => {});
    }
  }, [track]);
  return (
    <div className="relative bg-black rounded-2xl overflow-hidden">
      <video ref={ref} autoPlay playsInline muted className={`w-full object-contain ${compact ? 'max-h-[22vh]' : 'max-h-[34vh]'} ${mirror ? '-scale-x-100' : ''}`} />
      {label && <span className="absolute bottom-2 start-2 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[11px] font-bold">{label}</span>}
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

// نافذة فيديو عائمة (الكاميرا أو الشاشة): صغيرة بحجم الصورة، تُسحب بالإصبع أو الفأرة، وتُكبَّر وتُصغَّر
const FloatingVideo: React.FC<{
  track: MediaStreamTrack | null;
  label: string;
  mirror?: boolean;
  wide?: boolean;
  index: number;
  isAr: boolean;
  light?: { label: string; onClick: () => void };
}> = ({ track, label, mirror, wide, index, isAr, light }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [big, setBig] = useState(false);
  const small = typeof window !== 'undefined' && window.innerWidth < 640;
  const w = big ? Math.min(window.innerWidth - 24, wide ? 900 : 640) : wide ? (small ? 220 : 320) : small ? 130 : 200;
  const [pos, setPos] = useState(() => {
    const W = typeof window !== 'undefined' ? window.innerWidth : 400;
    const x = isAr ? 12 + index * (small ? 140 : 210) : W - w - 12 - index * (small ? 140 : 210);
    return { x: Math.max(8, x), y: 76 };
  });
  const drag = useRef<{ dx: number; dy: number; id: number } | null>(null);

  useEffect(() => {
    if (ref.current && track) {
      ref.current.srcObject = new MediaStream([track]);
      ref.current.play().catch(() => {});
    }
  }, [track]);

  // إبقاء النافذة داخل الشاشة عند التكبير أو تغيير الحجم
  useEffect(() => {
    const fit = () => {
      const b = boxRef.current;
      const bw = b?.offsetWidth || w;
      const bh = b?.offsetHeight || 120;
      setPos((p) => ({ x: Math.min(Math.max(8, p.x), window.innerWidth - bw - 8), y: Math.min(Math.max(8, p.y), window.innerHeight - bh - 80) }));
    };
    const t = setTimeout(fit, 50);
    window.addEventListener('resize', fit);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', fit);
    };
  }, [big, w]);

  return (
    <div
      ref={boxRef}
      className="fixed z-40 rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/20 touch-none select-none"
      style={{ left: pos.x, top: pos.y, width: w }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, id: e.pointerId };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const b = boxRef.current;
        const bw = b?.offsetWidth || w;
        const bh = b?.offsetHeight || 120;
        setPos({
          x: Math.min(Math.max(4, e.clientX - d.dx), window.innerWidth - bw - 4),
          y: Math.min(Math.max(4, e.clientY - d.dy), window.innerHeight - bh - 4),
        });
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      {track ? (
        <video ref={ref} autoPlay playsInline muted className={`block w-full h-auto max-h-[70vh] object-contain ${mirror ? '-scale-x-100' : ''}`} />
      ) : (
        <div className="aspect-video flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      <div className="absolute top-1 end-1 flex gap-1">
        {light && (
          <button onClick={light.onClick} className="h-7 px-2 rounded-lg bg-black/60 text-white text-[10px] font-bold flex items-center gap-1" title={isAr ? 'الإضاءة' : 'Lighting'}>
            ☀️ {light.label}
          </button>
        )}
        <button onClick={() => setBig((b) => !b)} className="w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center" title={big ? 'Smaller' : 'Bigger'}>
          {big ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        {big && (
          <button onClick={() => ref.current?.requestFullscreen?.().catch(() => {})} className="w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center" title="Fullscreen">
            <Expand className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <span className="absolute bottom-1 start-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold max-w-[90%] truncate">{label}</span>
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
  const [showSettings, setShowSettings] = useState(false);
  const [menuFor, setMenuFor] = useState<RoomMember | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showRequests, setShowRequests] = useState(false);
  const [myBg, setMyBgState] = useState(getMyBg());
  const [showBg, setShowBg] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [conn, setConn] = useState({ outTotal: 0, outOk: 0, inTotal: 0, inOk: 0, turn: false });

  const meshRef = useRef<P2PMesh | null>(null);
  // ===== السبورة: في الذاكرة فقط، وتنتقل عبر قناة البيانات =====
  const boardRef = useRef<BoardStore | null>(null);
  if (!boardRef.current) boardRef.current = new BoardStore();
  const board = boardRef.current;
  const [, boardTick] = useState(0);
  useEffect(() => board.subscribe(() => boardTick((x) => x + 1)), [board]);
  const [boardMin, setBoardMin] = useState(false);
  const micTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const camTrackRef = useRef<MediaStreamTrack | null>(null);
  const [camOn, setCamOn] = useState(false);
  const lightRef = useRef<LightProcessor | null>(null);
  const [light, setLight] = useState<number>(() => {
    try {
      const v = Number(localStorage.getItem('ez-cam-light'));
      return Number.isFinite(v) && v >= 0 && v < LIGHT_LEVELS.length ? v : 1;
    } catch {
      return 1;
    }
  });
  const changeLight = () => {
    const n = (light + 1) % LIGHT_LEVELS.length;
    setLight(n);
    lightRef.current?.setLevel(n);
    try {
      localStorage.setItem('ez-cam-light', String(n));
    } catch {
      /* ignore */
    }
  };
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
    return watchChat(roomId, room?.chatSince || 0, setChat);
  }, [roomId, inRoom, room?.chatSince]);

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
  const ownerIdRef = useRef('');
  ownerIdRef.current = room?.ownerId || '';
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
    // رسائل السبورة: نقبلها من صاحبة الغرفة ومن سُمح لها بالكتابة فقط
    mesh.onData = (peer, raw) => {
      let op: BoardOp;
      try {
        op = JSON.parse(raw);
      } catch {
        return;
      }
      if (!op || typeof op !== 'object' || typeof (op as any).t !== 'string') return;
      const fromOwner = peer === ownerIdRef.current;
      const m = presentRef.current.find((x) => x.uid === peer);
      const writer = fromOwner || (!!m && m.role === 'speaker' && !!m.canBoard);
      if (['open', 'close', 'snap', 'bg', 'clear'].includes(op.t) ? !fromOwner : !writer) return;
      if (op.t === 'open' || op.t === 'snap') setBoardMin(false);
      board.apply(op);
    };
    // من دخل متأخرًا: صاحبة الغرفة ترسل له السبورة كاملة
    mesh.onDataOpen = (peer) => {
      if (ownerIdRef.current === uid && board.snap.open) mesh.sendData(JSON.stringify({ t: 'snap', s: board.snap }), peer);
    };
    mesh.start();
    mesh.sync(presentRef.current);
    return () => {
      mesh.close();
      if (meshRef.current === mesh) meshRef.current = null;
      micTrackRef.current = null;
      screenTrackRef.current = null;
      setScreenOn(false);
      lightRef.current?.stop();
      lightRef.current = null;
      camTrackRef.current?.stop();
      camTrackRef.current = null;
      setCamOn(false);
      setTracks({});
      board.apply({ t: 'close' });
    };
  }, [inRoom, roomId, uid]);

  const boardSend = useCallback(
    (op: BoardOp) => {
      board.apply(op);
      meshRef.current?.sendData(JSON.stringify(op));
    },
    [board]
  );
  const boardEmit = useCallback((op: BoardOp) => meshRef.current?.sendData(JSON.stringify(op)), []);

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
    // السبورة ومشاركة الشاشة لا تعملان معًا
    if (board.snap.open) boardSend({ t: 'close' });
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

  // ===== الكاميرا (لصاحب/ة الغرفة ومن يُسمح له) =====
  const stopCam = useCallback(
    (write = true) => {
      const t = camTrackRef.current;
      camTrackRef.current = null;
      setCamOn(false);
      if (t) {
        meshRef.current?.setLocal('cam', null);
        lightRef.current?.stop();
        lightRef.current = null;
        t.stop();
        if (write) updateMember(roomId, uid, { cam: null }).catch(() => {});
      }
    },
    [roomId, uid]
  );

  const startCam = async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: 15, max: 15 }, facingMode: 'user' },
      });
    } catch {
      return flash(tr('Camera permission is needed.', 'يلزم السماح بالكاميرا.'));
    }
    const raw = stream.getVideoTracks()[0];
    const mesh = meshRef.current;
    if (!mesh) return raw.stop();
    // تحسين الإضاءة قبل الإرسال
    const proc = createLightProcessor(raw, light);
    lightRef.current = proc;
    const track = proc.track;
    camTrackRef.current = track;
    const nonce = mesh.setLocal('cam', track);
    setCamOn(true);
    raw.onended = () => stopCam();
    await updateMember(roomId, uid, { cam: nonce }).catch(() => {
      stopCam(false);
      flash(tr('Could not start the camera.', 'تعذر تشغيل الكاميرا.'));
    });
  };

  useEffect(() => {
    if (camTrackRef.current && (!inRoom || !me?.canScreen)) stopCam(inRoom);
  }, [inRoom, me?.canScreen, stopCam]);

  useEffect(() => {
    // مشاركة الشاشة لصاحب/ة الغرفة وحده
    if (screenTrackRef.current && (!inRoom || me?.role !== 'owner')) stopScreen(inRoom);
  }, [inRoom, me?.role, stopScreen]);

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
        const fresh = t - (r.lastActiveAt || 0) > ACTIVE_MS; // الغرفة كانت فارغة: جلسة جديدة بدردشة جديدة
        updateRoom(roomId, { lastActiveAt: t, liveCount: presentRef.current.length, ...(fresh ? { chatSince: t } : {}) } as any).catch(() => {});
        if (fresh && (r.ownerId === uid || admin)) clearChat(roomId);
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
      updateMember(roomId, uid, { status: 'left', pub: null, screen: null, cam: null, hand: false }).catch(() => {});
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


  const [showRules, setShowRules] = useState(false);
  const rulesAccepted = () => {
    try {
      return localStorage.getItem('ez-room-rules-v1') === '1';
    } catch {
      return true;
    }
  };
  const enter = async () => {
    if (!room) return;
    if (!rulesAccepted()) {
      setShowRules(true);
      return;
    }
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
    stopCam(false);
    setEntered(false);
    setMe(null);
    setMembers([]);
    await updateMember(roomId, uid, { status: 'left', pub: null, screen: null, cam: null, hand: false }).catch(() => {});
    if (goBack) navigate('rooms');
  };

  const toggleMute = () => me && updateMember(roomId, uid, { muted: !me.muted }).catch(() => {});
  const toggleHand = () => me && updateMember(roomId, uid, { hand: !me.hand }).catch(() => {});

  const mod = {
    approve: (m: RoomMember) => updateMember(roomId, m.uid, { status: 'in' }),
    decline: (m: RoomMember) => removeMember(roomId, m.uid),
    ban: (m: RoomMember) => updateMember(roomId, m.uid, { status: 'kicked', pub: null, screen: null, cam: null, hand: false, role: m.role === 'owner' ? 'owner' : 'listener' }),
    toStage: async (m: RoomMember) => {
      if (stage.length >= (room?.maxSpeakers || 6)) {
        flash(tr('The stage is full.', 'المنصة ممتلئة بالمتحدثين.'));
        return;
      }
      await updateMember(roomId, m.uid, { role: 'speaker', hand: false, muted: true });
    },
    toAudience: (m: RoomMember) => updateMember(roomId, m.uid, { role: 'listener', pub: null, screen: null, cam: null, canScreen: false, muted: true, ...(m.canBoard ? { canBoard: false } : {}) }),
    board: (m: RoomMember, on: boolean) => updateMember(roomId, m.uid, { canBoard: on }),
    mute: (m: RoomMember) => updateMember(roomId, m.uid, { muted: true }),
    screen: (m: RoomMember, on: boolean) => updateMember(roomId, m.uid, on ? { canScreen: true } : { canScreen: false, screen: null, cam: null }),
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
      {room.official && nextSession(room, now) !== null && (
        <div className="text-xs text-[#F3E5AB] font-bold">
          🗓️ {formatSession(nextSession(room, now)!, isAr)}
          {room.weekly ? ` · ${tr('every week', 'كل أسبوع')}` : ''} ·{' '}
          {nextSession(room, now)! <= now ? tr('live now', 'مباشرة الآن') : countdown(nextSession(room, now)! - now, isAr)}
        </div>
      )}
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
        {showRules && (
          <RoomRules
            isAr={isAr}
            onCancel={() => setShowRules(false)}
            onAccept={() => {
              try {
                localStorage.setItem('ez-room-rules-v1', '1');
              } catch {
                /* ignore */
              }
              setShowRules(false);
              setTimeout(() => enter(), 0);
            }}
          />
        )}
      </>
    );
  }


  const hands = audience.filter((m) => m.hand);
  const requestsCount = pending.length + hands.length;
  const seats: (RoomMember | null)[] = Array.from({ length: Math.max(room.maxSpeakers || 5, stage.length) }, (_, i) => stage[i] || null);
  const photoOf = (id: string) => members.find((m) => m.uid === id) || null;
  const roundBtn = 'w-11 h-11 shrink-0 rounded-full flex items-center justify-center';
  const videoTiles: { key: string; kind: 'screen' | 'cam'; label: string; track: MediaStreamTrack | null; mine: boolean }[] = [];
  if (screenOwner && screenOwner.uid !== uid) videoTiles.push({ key: screenOwner.uid + ':screen', kind: 'screen', label: `${tr('Screen of', 'شاشة')} ${screenOwner.name}`, track: tracks[screenOwner.uid + ':screen'] || null, mine: false });
  present.forEach((m) => {
    if (!m.cam) return;
    if (m.uid === uid) {
      if (camOn && camTrackRef.current) videoTiles.push({ key: 'me:cam', kind: 'cam', label: tr('You', 'أنت'), track: camTrackRef.current, mine: true });
    } else videoTiles.push({ key: m.uid + ':cam', kind: 'cam', label: m.name, track: tracks[m.uid + ':cam'] || null, mine: false });
  });

  // الخلفية: اختياري الشخصي، ثم خلفية الغرفة، ثم الليلي
  const bgStyle: React.CSSProperties =
    myBg?.id === 'custom' && myBg.img
      ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${myBg.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: (bgById(myBg?.id) || bgById(room.bg) || ROOM_BGS[0]).css };

  return (
    <div className="fixed inset-0 z-30 flex flex-col text-white" style={bgStyle} dir={isAr ? 'rtl' : 'ltr'}>
      {/* أصوات الآخرين */}
      {Object.entries(tracks)
        .filter(([k]) => k.endsWith(':mic'))
        .map(([k, t]) => (
          <AudioSink key={k} track={t} onBlocked={() => setAudioBlocked(true)} />
        ))}

      {/* الشريط العلوي */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <button onClick={() => leave()} className={`${roundBtn} bg-white/10`} title={tr('All rooms', 'كل الغرف')}>
          <ArrowRight className={`w-5 h-5 ${isAr ? '' : 'rotate-180'}`} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[15px] text-[#F3E5AB] truncate">{room.title}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
            {room.level && <span className="px-1.5 rounded bg-[#D4AF37] text-[#0A192F] font-bold">{room.level}</span>}
            {room.privacy !== 'public' && <Lock className="w-3 h-3" />}
            {room.girlsOnly && <span className="text-pink-300 font-bold">{tr('Girls only', 'للبنات فقط')}</span>}
            <span>
              {present.length} {tr('in the room', 'في الغرفة')}
            </span>
          </div>
        </div>
        {isMod && requestsCount > 0 && (
          <button onClick={() => setShowRequests(true)} className="relative h-9 px-3 rounded-full bg-[#D4AF37] text-[#0A192F] text-xs font-bold inline-flex items-center gap-1 animate-pulse">
            <Hand className="w-4 h-4" />
            {requestsCount}
          </button>
        )}
        <button onClick={() => setShowBg(true)} className={`${roundBtn} bg-white/10`} title={tr('Background', 'الخلفية')}>
          <Palette className="w-4 h-4" />
        </button>
        <button onClick={copyLink} className={`${roundBtn} bg-white/10`} title={tr('Copy invite link', 'نسخ رابط الدعوة')}>
          <Link2 className="w-4 h-4" />
        </button>
        {isMod && (
          <button onClick={() => setShowSettings(true)} className={`${roundBtn} bg-white/10`} title={tr('Room settings', 'إعدادات الغرفة')}>
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* تنبيهات */}
      <div className="px-3 space-y-2">
        {audioBlocked && (
          <button onClick={unlockAudio} className="w-full p-3 rounded-2xl bg-[#D4AF37] text-[#0A192F] font-bold text-sm animate-pulse">
            🔊 {tr('Tap here to hear the room', 'اضغط/ي هنا لتشغيل صوت الغرفة')}
          </button>
        )}
        {showVpnHint && (
          <div className="p-2.5 rounded-2xl bg-amber-400/15 border border-amber-300/40 text-xs text-amber-100 font-bold leading-relaxed">
            ⚠️{' '}
            {tr(
              'The sound is not connecting. If you use a VPN, turn it off during the room, then leave and enter again.',
              'الصوت لا يتصل. إذا كان لديك VPN {أوقفه|أوقفيه} أثناء الغرفة، ثم {اخرج|اخرجي} {وادخل|وادخلي} من جديد.'
            )}
          </div>
        )}
        {(isSpeaker || conn.inTotal > 0 || admin) && (
          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
            {isSpeaker && (
              <span className={`px-2 py-0.5 rounded-full ${conn.outTotal > 0 && conn.outOk === conn.outTotal ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'}`}>
                {tr('Your voice reaches', 'صوتك يصل إلى')} {conn.outOk}/{conn.outTotal}
              </span>
            )}
            {conn.inTotal > 0 && (
              <span className={`px-2 py-0.5 rounded-full ${conn.inOk === conn.inTotal ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'}`}>
                {tr('You hear', 'تسمع/ين')} {conn.inOk}/{conn.inTotal}
              </span>
            )}
            {((isSpeaker && conn.outOk < conn.outTotal) || conn.inOk < conn.inTotal) && (
              <button onClick={() => meshRef.current?.reconnect()} className="px-2 py-0.5 rounded-full bg-white/15 text-white">
                ↻ {tr('Reconnect', 'إعادة الاتصال')}
              </button>
            )}
            {admin && (
              <span className={`px-2 py-0.5 rounded-full ${conn.turn ? 'bg-sky-400/15 text-sky-200' : 'bg-white/10 text-gray-300'}`}>
                {conn.turn ? tr('Relay: on', 'خادم الاتصال: مفعّل') : tr('Relay: off', 'خادم الاتصال: غير مفعّل')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* الفيديو: نوافذ عائمة صغيرة تُسحب وتُكبَّر */}
      {screenOn && <div className="mx-3 mt-1 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-100 text-xs font-bold shrink-0">{tr('You are sharing your screen', 'أنت تشارك{|ين} شاشتك')}</div>}
      {videoTiles.map((v, i) => (
        <FloatingVideo
          key={v.key}
          index={i}
          track={v.track}
          label={v.label}
          mirror={v.mine}
          wide={v.kind === 'screen'}
          isAr={isAr}
          light={v.mine && v.kind === 'cam' ? { label: isAr ? LIGHT_LEVELS[light].ar : LIGHT_LEVELS[light].en, onClick: changeLight } : undefined}
        />
      ))}

      {/* الجزء الأوسط يتمرر إن ضاقت الشاشة، وشريط التحكم يبقى ظاهرًا دائمًا */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
      {/* المسرح: مقاعد المتحدثين */}
      <div className="grid grid-cols-4 gap-y-3 px-2 pt-3 shrink-0">
        {seats.map((m, i) =>
          m ? (
            <button key={m.uid} onClick={() => m.uid !== uid && setMenuFor(m)} className="flex flex-col items-center gap-1 min-w-0">
              <div className="relative">
                <Avatar m={m} size="w-16 h-16 sm:w-20 sm:h-20" speaking={speaking.has(m.uid)} />
                {m.role === 'owner' && <Crown className="absolute -top-2.5 start-1/2 -translate-x-1/2 w-5 h-5 text-[#D4AF37] drop-shadow" />}
                {m.muted && (
                  <span className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/55 flex items-center justify-center">
                    <MicOff className="w-4 h-4" />
                  </span>
                )}
                {m.screen && <MonitorUp className="absolute -bottom-1 -end-1 w-5 h-5 p-0.5 rounded-full bg-[#D4AF37] text-[#0A192F]" />}
                {m.cam && <Video className="absolute -bottom-1 -start-1 w-5 h-5 p-0.5 rounded-full bg-sky-500 text-white" />}
              </div>
              <span className="text-[11px] font-bold truncate max-w-[80px]">{m.uid === uid ? tr('You', 'أنت') : m.name}</span>
            </button>
          ) : (
            <button
              key={'seat' + i}
              onClick={() => !isSpeaker && !isMod && toggleHand()}
              className="flex flex-col items-center gap-1"
              title={tr('Raise your hand to take a seat', 'ارفع/ي يدك للصعود')}
            >
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <Mic className="w-6 h-6 text-white/40" />
              </span>
              <span className="text-[11px] text-white/40">{i + 1}</span>
            </button>
          )
        )}
      </div>

      {/* المستمعون: قائمة عرضية تُسحب */}
      <div className="flex gap-3 overflow-x-auto px-3 pt-3 pb-1 shrink-0 snap-x [scrollbar-width:none]">
        <div className="flex flex-col items-center gap-1 shrink-0 snap-start">
          <span className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">{audience.length}</span>
          <span className="text-[10px] text-gray-300 whitespace-nowrap">{tr('Listeners', 'المستمعون')}</span>
        </div>
        {audience.map((m) => (
          <button key={m.uid} onClick={() => m.uid !== uid && setMenuFor(m)} className="flex flex-col items-center gap-1 shrink-0 snap-start w-14">
            <div className="relative">
              <Avatar m={m} size="w-11 h-11" speaking={false} />
              {m.hand && <span className="absolute -top-1 -end-1 text-sm">✋</span>}
            </div>
            <span className="text-[10px] truncate w-full text-center">{m.uid === uid ? tr('You', 'أنت') : m.name}</span>
          </button>
        ))}
      </div>

      {/* الدردشة: الرسائل تصعد للأعلى */}
      <ChatFeed roomId={roomId} uid={uid} msgs={chat} isMod={isMod} isAr={isAr} memberOf={photoOf} />

      </div>

      {/* شريط التحكم والكتابة */}
      <ChatBar
        roomId={roomId}
        uid={uid}
        name={myName}
        isAr={isAr}
        left={
          <>
            <button onClick={() => leave()} className={`${roundBtn} bg-red-500/20 text-red-200`} title={tr('Leave', 'خروج')}>
              <LogOut className="w-5 h-5" />
            </button>
            {isSpeaker ? (
              <button
                onClick={toggleMute}
                disabled={!micReady}
                className={`${roundBtn} disabled:opacity-50 ${me?.muted ? 'bg-white/15 text-white' : 'bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.6)]'}`}
                title={me?.muted ? tr('Unmute', 'تشغيل المايك') : tr('Mute', 'كتم')}
              >
                {!micReady ? <Loader2 className="w-5 h-5 animate-spin" /> : me?.muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            ) : (
              <button onClick={toggleHand} className={`${roundBtn} ${me?.hand ? 'bg-[#D4AF37] text-[#0A192F]' : 'bg-white/15 text-white'}`} title={me?.hand ? tr('Lower hand', 'إنزال اليد') : tr('Raise hand', 'رفع اليد')}>
                <Hand className="w-5 h-5" />
              </button>
            )}
            {me?.role === 'speaker' && (
              <button
                onClick={() => updateMember(roomId, uid, { role: 'listener', pub: null, screen: null, cam: null, muted: true, hand: false }).catch(() => {})}
                className={`${roundBtn} bg-white/15`}
                title={tr('Leave the stage', 'النزول إلى المستمعين')}
              >
                <UserMinus className="w-5 h-5" />
              </button>
            )}
            {me?.canScreen && (
              <button
                onClick={() => (camOn ? stopCam() : startCam())}
                className={`${roundBtn} ${camOn ? 'bg-sky-500 text-white' : 'bg-white/15'}`}
                title={camOn ? tr('Turn camera off', 'إيقاف الكاميرا') : tr('Turn camera on', 'تشغيل الكاميرا')}
              >
                {camOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            )}
            {me?.role === 'owner' && (
              <button
                onClick={() => {
                  if (board.snap.open) {
                    setBoardMin(false);
                    return;
                  }
                  if (screenOn) stopScreen();
                  boardSend({ t: 'open' });
                  setBoardMin(false);
                }}
                className={`${roundBtn} ${board.snap.open ? 'bg-[#D4AF37] text-[#0A192F]' : 'bg-white/15'}`}
                title={tr('Whiteboard', 'السبورة')}
              >
                <PenLine className="w-5 h-5" />
              </button>
            )}
            {me?.role === 'owner' && canShareScreen() && (
              <button
                onClick={() => (screenOn ? stopScreen() : startScreen())}
                className={`${roundBtn} ${screenOn ? 'bg-red-600' : 'bg-white/15'}`}
                title={screenOn ? tr('Stop sharing', 'إيقاف المشاركة') : tr('Share screen', 'مشاركة الشاشة')}
              >
                {screenOn ? <MonitorX className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
              </button>
            )}
          </>
        }
      />

      {/* السبورة: تملأ الشاشة، ويمكن تصغيرها */}
      {inRoom && board.snap.open && !boardMin && (
        <Whiteboard
          store={board}
          canDraw={!!me && (me.role === 'owner' || (me.role === 'speaker' && !!me.canBoard))}
          isOwner={me?.role === 'owner'}
          isAr={isAr}
          send={boardSend}
          emit={boardEmit}
          onMinimize={() => setBoardMin(true)}
          onClose={() => boardSend({ t: 'close' })}
        />
      )}
      {inRoom && board.snap.open && boardMin && (
        <button
          onClick={() => setBoardMin(false)}
          className="fixed top-16 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-40 px-4 py-2 rounded-full bg-[#D4AF37] text-[#0A192F] text-xs font-bold shadow-xl animate-pulse"
        >
          🖊️ {tr('The whiteboard is open – view', 'السبورة مفتوحة – عرض')}
        </button>
      )}

      {/* طلبات الدخول والأيدي المرفوعة */}
      {showRequests && isMod && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={() => setShowRequests(false)}>
          <div className="bg-white text-[#0A192F] rounded-3xl w-full max-w-sm p-4 space-y-3 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {pending.length > 0 && <h3 className="text-sm font-bold text-amber-700">{tr('Requests to enter', 'طلبات الدخول')}</h3>}
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
                  <button onClick={() => mod.decline(m).catch(() => {})} className="px-3 py-1.5 rounded-lg bg-gray-200 text-xs font-bold">
                    {tr('Decline', 'رفض')}
                  </button>
                  <button onClick={() => mod.ban(m).catch(() => {})} className="p-1.5 rounded-lg bg-red-50 text-red-600" title={tr('Block from room', 'حظر من الغرفة')}>
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {hands.length > 0 && <h3 className="text-sm font-bold">✋ {tr('Want to speak', 'يريدون التحدث')}</h3>}
            {hands.map((m) => (
              <div key={m.uid} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar m={m} size="w-9 h-9" />
                  <span className="text-sm font-bold truncate">{m.name}</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => mod.toStage(m).catch(() => {})} className="px-3 py-1.5 rounded-lg bg-[#0A192F] text-[#F3E5AB] text-xs font-bold">
                    {tr('Let speak', 'السماح بالكلام')}
                  </button>
                  <button onClick={() => updateMember(roomId, m.uid, { hand: false }).catch(() => {})} className="px-3 py-1.5 rounded-lg bg-gray-200 text-xs font-bold">
                    {tr('Not now', 'ليس الآن')}
                  </button>
                </div>
              </div>
            ))}
            {requestsCount === 0 && <p className="text-xs text-gray-500">{tr('Nothing waiting.', 'لا يوجد طلبات.')}</p>}
            <button onClick={() => setShowRequests(false)} className="w-full py-2.5 rounded-xl bg-gray-100 text-sm font-bold">
              {tr('Close', 'إغلاق')}
            </button>
          </div>
        </div>
      )}

      {showBg && (
        <BgPicker
          isAr={isAr}
          current={myBg?.id || ''}
          roomBg={room.bg || 'night'}
          canSetRoom={isMod}
          onPick={(id, img) => {
            if (!setMyBg(id, img)) flash(tr('Could not save the picture on this device.', 'تعذر حفظ الصورة في هذا الجهاز.'));
            setMyBgState(getMyBg());
          }}
          onSetRoom={(id) => updateRoom(roomId, { bg: id }).then(() => flash(tr('Room background updated for everyone.', 'تم تغيير خلفية الغرفة للجميع.'))).catch(() => flash(tr('Could not save.', 'تعذر الحفظ.')))}
          onClose={() => setShowBg(false)}
        />
      )}

      {notice && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center z-50 px-4 pointer-events-none">
          <div className="px-4 py-2.5 rounded-xl bg-white text-[#0A192F] text-sm font-bold shadow-xl">{notice}</div>
        </div>
      )}

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
              if (a === 'boardOn') await mod.board(m, true);
              if (a === 'boardOff') await mod.board(m, false);
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
      {showSettings && isMod && <RoomSettings room={room} isAr={isAr} canGirls={(gender === 'female' || admin) && room.audience !== 'teacher'} onClose={() => setShowSettings(false)} onDeleted={() => navigate('rooms')} />}
    </div>
  );
};

type MenuAction = 'stage' | 'audience' | 'mute' | 'screenOn' | 'screenOff' | 'boardOn' | 'boardOff' | 'kick' | 'report';

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
        {isMod && m.role !== 'owner' && !m.canScreen && item('screenOn', <Video className="w-4 h-4" />, tr('Allow camera', 'السماح بالكاميرا'))}
        {isMod && m.role !== 'owner' && m.canScreen && item('screenOff', <VideoOff className="w-4 h-4" />, tr('Stop camera', 'منع الكاميرا'))}
        {isMod && m.role === 'speaker' && !m.canBoard && item('boardOn', <PenLine className="w-4 h-4" />, tr('Allow the whiteboard', 'السماح بالسبورة'))}
        {isMod && m.role === 'speaker' && m.canBoard && item('boardOff', <PenLine className="w-4 h-4" />, tr('Stop the whiteboard', 'منع السبورة'))}
        {isMod && m.role !== 'owner' && item('kick', <Ban className="w-4 h-4" />, tr('Remove and block from room', 'إخراج وحظر من الغرفة'), true)}
        {item('report', <Flag className="w-4 h-4" />, tr('Report to the academy', 'إبلاغ الأكاديمية'), true)}
        <button onClick={onClose} className="w-full mt-1 py-2.5 rounded-xl bg-gray-100 text-sm font-bold">
          {tr('Close', 'إغلاق')}
        </button>
      </div>
    </div>
  );
};

const EMOJIS = ['😊', '😂', '😍', '🥰', '😎', '🤔', '😅', '😢', '😮', '🙏', '👏', '👍', '👋', '💪', '🎉', '❤️', '🌸', '🌟', '🔥', '✅', '💯', '📚', '✍️', '🗣️'];
const NAME_COLORS = ['text-[#F3E5AB]', 'text-sky-300', 'text-pink-300', 'text-emerald-300', 'text-violet-300', 'text-orange-300'];
const colorOf = (id: string) => NAME_COLORS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % NAME_COLORS.length];

// الرسائل تظهر من الأسفل وتصعد للأعلى (مثل HelloTalk)
const ChatFeed: React.FC<{
  roomId: string;
  uid: string;
  msgs: ChatMsg[];
  isMod: boolean;
  isAr: boolean;
  memberOf: (id: string) => RoomMember | null;
}> = ({ roomId, uid, msgs, isMod, isAr, memberOf }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const boxRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const [unseen, setUnseen] = useState(0);
  const toBottom = () => {
    const b = boxRef.current;
    if (b) b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' });
    setUnseen(0);
  };
  useEffect(() => {
    const b = boxRef.current;
    if (!b) return;
    if (atBottom.current) b.scrollTop = b.scrollHeight;
    else setUnseen((n) => n + 1);
  }, [msgs.length]);
  return (
    <div className="relative flex-1 min-h-[200px] mt-2">
      <div
        ref={boxRef}
        onScroll={(e) => {
          const b = e.currentTarget;
          atBottom.current = b.scrollHeight - b.scrollTop - b.clientHeight < 40;
          if (atBottom.current) setUnseen(0);
        }}
        className="absolute inset-0 overflow-y-auto px-3 flex flex-col [mask-image:linear-gradient(to_bottom,transparent,black_18%)]"
      >
        <div className="mt-auto space-y-1.5 pb-2">
          {msgs.length === 0 && <p className="text-center text-xs text-white/40 py-4">{tr('Say hello in English 👋', 'قل/قولي مرحبًا بالإنجليزية 👋')}</p>}
          {msgs.map((m) => {
            const mem = memberOf(m.uid);
            return (
              <div key={m.id} className="flex items-start gap-2">
                {mem ? <Avatar m={mem} size="w-7 h-7" /> : <span className="w-7 h-7 rounded-full bg-white/10 shrink-0" />}
                <div className="max-w-[85%] px-3 py-1.5 rounded-2xl bg-white/10 text-sm leading-snug break-words">
                  <span className={`font-bold me-1.5 ${colorOf(m.uid)}`}>{m.uid === uid ? tr('You', 'أنت') : m.name}:</span>
                  <span>{m.text}</span>
                </div>
                {(isMod || m.uid === uid) && (
                  <button onClick={() => deleteChat(roomId, m.id).catch(() => {})} className="mt-1.5 text-white/25 hover:text-red-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {unseen > 0 && (
        <button onClick={toBottom} className="absolute bottom-2 start-3 px-3 py-1.5 rounded-full bg-white text-[#0A192F] text-xs font-bold shadow-lg">
          ↓ {unseen} {tr('new', 'رسالة جديدة')}
        </button>
      )}
    </div>
  );
};

// شريط الكتابة (مع الإيموجي) وأزرار التحكم
const ChatBar: React.FC<{ roomId: string; uid: string; name: string; isAr: boolean; left: React.ReactNode }> = ({ roomId, uid, name, isAr, left }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    setEmojiOpen(false);
    await sendChat(roomId, uid, name, t).catch(() => setText(t));
  };
  return (
    <div className="shrink-0 border-t border-white/10 bg-black/30 backdrop-blur px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {emojiOpen && (
        <div className="grid grid-cols-8 gap-1 pb-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => {
                setText((t) => (t + e).slice(0, 500));
                inputRef.current?.focus();
              }}
              className="text-2xl py-1 rounded-lg hover:bg-white/10"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        {left}
        <div className="flex-1 min-w-0 flex items-center gap-1 rounded-full bg-white/10 ps-1 pe-1">
          <button onClick={() => setEmojiOpen((o) => !o)} className="w-9 h-9 shrink-0 rounded-full text-lg" title="Emoji">
            😊
          </button>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/40 outline-none py-2.5"
            placeholder={tr('Comment…', 'تعليق…')}
          />
          {text.trim() && (
            <button onClick={send} className="w-9 h-9 shrink-0 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center">
              <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// اختيار الخلفية: لي وحدي، أو للغرفة كلها (لصاحب/ة الغرفة)
const BgPicker: React.FC<{
  isAr: boolean;
  current: string;
  roomBg: string;
  canSetRoom: boolean;
  onPick: (id: string | null, img?: string) => void;
  onSetRoom: (id: string) => void;
  onClose: () => void;
}> = ({ isAr, current, roomBg, canSetRoom, onPick, onSetRoom, onClose }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const sel = current || roomBg;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={onClose} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white text-[#0A192F] rounded-3xl w-full max-w-md p-4 space-y-3 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{tr('Room background', 'خلفية الغرفة')}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500">{tr('Your choice changes only what you see.', 'اختيارك يغيّر ما تراه/ينه أنت فقط.')}</p>
        <div className="grid grid-cols-4 gap-2">
          {ROOM_BGS.map((b) => (
            <button key={b.id} onClick={() => onPick(b.id)} className="space-y-1">
              <span className={`block h-20 rounded-2xl ${sel === b.id && current !== 'custom' ? 'ring-4 ring-[#D4AF37]' : 'ring-1 ring-gray-200'}`} style={{ background: b.css }} />
              <span className="block text-[11px] font-bold text-center">{tr(b.en, b.ar)}</span>
            </button>
          ))}
          <button onClick={() => fileRef.current?.click()} className="space-y-1" disabled={busy}>
            <span className={`h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center ${current === 'custom' ? 'ring-4 ring-[#D4AF37]' : ''}`}>
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-6 h-6 text-gray-500" />}
            </span>
            <span className="block text-[11px] font-bold text-center">{tr('My photo', 'صورة من جهازي')}</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            setBusy(true);
            try {
              onPick('custom', await shrinkImage(f));
            } catch {
              /* ignore */
            }
            setBusy(false);
          }}
        />
        {current && (
          <button onClick={() => onPick(null)} className="w-full py-2.5 rounded-xl bg-gray-100 text-sm font-bold">
            {tr("Use the room's background", 'استعمال خلفية الغرفة الافتراضية')}
          </button>
        )}
        {canSetRoom && current && current !== 'custom' && (
          <button onClick={() => onSetRoom(current)} className="w-full py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-sm font-bold">
            {tr('Make it the background for everyone', 'اجعلها خلفية الغرفة للجميع')}
          </button>
        )}
      </div>
    </div>
  );
};

// قواعد الغرف: تظهر مرة واحدة قبل أول دخول
const RoomRules: React.FC<{ isAr: boolean; onAccept: () => void; onCancel: () => void }> = ({ isAr, onAccept, onCancel }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const rules = isAr
    ? [
        ['🤝', 'الاحترام أولًا: لا إساءة ولا سخرية ولا كلام جارح.'],
        ['🇬🇧', 'نتحدث بالإنجليزية قدر الإمكان، والأخطاء طبيعية ومرحّب بها.'],
        ['✋', '{ارفع|ارفعي} يدك وانتظر/ي دورك، ولا {تقاطع|تقاطعي} المتحدث.'],
        ['🔒', 'لا تُنشر أرقام الهاتف أو الحسابات الشخصية داخل الغرف.'],
        ['🚫', 'يُمنع أي محتوى غير لائق أو دعاية أو طلب تواصل خاص.'],
        ['🚩', 'صاحب/ة الغرفة يستطيع كتم أو إخراج من يخالف، ويمكن لأي أحد الإبلاغ للأكاديمية.'],
      ]
    : [
        ['🤝', 'Respect first: no insults, mockery or hurtful words.'],
        ['🇬🇧', 'Speak English as much as you can — mistakes are normal and welcome.'],
        ['✋', 'Raise your hand and wait your turn; do not interrupt.'],
        ['🔒', 'Do not share phone numbers or personal accounts in rooms.'],
        ['🚫', 'No inappropriate content, advertising or private-contact requests.'],
        ['🚩', 'The room owner can mute or remove anyone who breaks the rules, and anyone can report to the academy.'],
      ];
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-lg text-[#0A192F]">{tr('Room rules', 'قواعد الغرف')}</h3>
        <ul className="space-y-2.5">
          {rules.map(([icon, text]) => (
            <li key={text} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
              <span className="text-lg leading-none mt-0.5">{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button onClick={onAccept} className="flex-1 py-3 rounded-xl bg-[#0A192F] text-[#F3E5AB] font-bold text-sm">
            {tr('I agree, enter', 'أوافق، دخول')}
          </button>
          <button onClick={onCancel} className="px-4 py-3 rounded-xl bg-gray-100 font-bold text-sm">
            {tr('Cancel', 'إلغاء')}
          </button>
        </div>
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
          onClick={async () => {
            const closing = room.status === 'open';
            await set(closing ? { status: 'closed', chatSince: Date.now() } : { status: 'open', chatSince: Date.now() });
            if (closing) clearChat(room.id);
          }}
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
