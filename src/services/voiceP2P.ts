// الصوت ومشاركة الشاشة مباشرة بين أجهزة المشاركين (بدون خادم وسيط ولا بطاقة دفع)
// اتصال واحد في الاتجاهين بين كل شخصين. تبادل الإعداد (SDP) عبر Firestore:
// voice_rooms/{roomId}/signals/{id} {from, to, kind:'pair', nonce, offer, answer}
// صاحب المعرّف الأصغر يكتب العرض، والآخر يكتب الجواب، ثم تُحذف الوثيقة.
import { collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import type { RoomMember } from './voiceRooms';

export type MediaKind = 'mic' | 'screen' | 'cam';

const STUN: RTCIceServer = { urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] };
let ICE: RTCIceServer[] = [STUN];

// خادم TURN المجاني (مثل ExpressTURN) يمرّر الصوت حين تمنع الشبكة أو الـ VPN الاتصال المباشر.
// يُحفظ من لوحة الإدارة في voice_config/turn {server, username, credential}
export interface TurnConfig {
  server: string;
  username: string;
  credential: string;
}
export const turnUrls = (server: string) => {
  const host = server.trim().replace(/^turns?:/, '').replace(/[:?].*$/, '');
  return [`turn:${host}:3478?transport=udp`, `turn:${host}:3478?transport=tcp`, `turns:${host}:443?transport=tcp`];
};
export async function loadTurn(): Promise<TurnConfig | null> {
  try {
    const d = await getDoc(doc(db, 'voice_config', 'turn'));
    const t = d.exists() ? (d.data() as TurnConfig) : null;
    ICE = t && t.server && t.username && t.credential ? [STUN, { urls: turnUrls(t.server), username: t.username, credential: t.credential }] : [STUN];
    return t;
  } catch {
    return null;
  }
}
export const hasTurn = () => ICE.length > 1;
export const saveTurn = (t: TurnConfig) => setDoc(doc(db, 'voice_config', 'turn'), t);

function waitIce(pc: RTCPeerConnection, ms = 2500): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const t = setTimeout(done, ms);
    function done() {
      clearTimeout(t);
      pc.removeEventListener('icegatheringstatechange', check);
      resolve();
    }
    function check() {
      if (pc.iceGatheringState === 'complete') done();
    }
    pc.addEventListener('icegatheringstatechange', check);
  });
}

const newNonce = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// ترتيب المسارات ثابت في كل اتصال: صوت، كاميرا، شاشة
const KINDS: MediaKind[] = ['mic', 'cam', 'screen'];
const BITRATE: Record<MediaKind, number> = { mic: 0, cam: 250_000, screen: 700_000 };
const CONNECT_TIMEOUT = 35_000;
const OFFER_MAX_AGE = 2 * 60_000;

interface Pair {
  pc: RTCPeerConnection;
  peer: string;
  docId: string;
  initiator: boolean;
  at: number;
  dc?: RTCDataChannel;
}

// قناة بيانات السبورة: الرسائل الكبيرة (الصور) تُقسَّم إلى أجزاء
const CHUNK = 15000;

const canPublish = (m: RoomMember) => m.role === 'owner' || m.role === 'speaker' || !!m.canScreen;

/**
 * اتصال واحد في الاتجاهين بين كل شخصين (إذا كان أحدهما على الأقل متحدثًا).
 * فيه ثلاثة مسارات ثابتة (صوت، كاميرا، شاشة) تُبدَّل بـ replaceTrack بلا إعادة تفاوض،
 * فإذا نجح الاتصال مرّ الصوت والصورة في الاتجاهين معًا.
 * صاحب المعرّف الأصغر يبدأ الاتصال، ويُعاد المحاولة تلقائيًا بلا توقف (مع تمرير عبر TURN عند الفشل).
 */
export class P2PMesh {
  private roomId: string;
  private uid: string;
  private local: Partial<Record<MediaKind, { track: MediaStreamTrack; nonce: string }>> = {};
  private pairs = new Map<string, Pair>();
  private fails = new Map<string, { n: number; nextAt: number }>();
  private lastOffer = new Map<string, number>();
  private handled = new Set<string>();
  private present: RoomMember[] = [];
  private unsubs: (() => void)[] = [];
  private closed = false;
  private started = false;
  private timer: any;
  onTrack: (key: string, track: MediaStreamTrack) => void;
  onRemove: (key: string) => void;
  /** رسالة من قناة البيانات (السبورة) */
  onData: (peer: string, msg: string) => void = () => {};
  /** فُتحت قناة البيانات مع مشارك (لإرسال حالة السبورة لمن دخل متأخرًا) */
  onDataOpen: (peer: string) => void = () => {};
  private parts = new Map<string, string[]>();

  constructor(roomId: string, uid: string, onTrack: (key: string, track: MediaStreamTrack) => void, onRemove: (key: string) => void) {
    this.roomId = roomId;
    this.uid = uid;
    this.onTrack = onTrack;
    this.onRemove = onRemove;
  }

  private col() {
    return collection(db, 'voice_rooms', this.roomId, 'signals');
  }

  async start() {
    await loadTurn();
    if (this.closed) return;
    this.unsubs.push(
      onSnapshot(
        query(this.col(), where('to', '==', this.uid)),
        (snap) => {
          // الأحدث أولًا: لا نجيب على عروض قديمة بعد عرض أحدث
          const docs = snap.docChanges().filter((c) => c.type !== 'removed').map((c) => ({ id: c.doc.id, d: c.doc.data() as any }));
          docs.sort((a, b) => (a.d.createdAt || 0) - (b.d.createdAt || 0)).forEach((x) => this.onOffer(x.id, x.d));
        },
        (e) => console.warn('signals in', e)
      )
    );
    this.unsubs.push(
      onSnapshot(
        query(this.col(), where('from', '==', this.uid)),
        (snap) => snap.docChanges().forEach((c) => c.type !== 'removed' && this.onAnswer(c.doc.id, c.doc.data() as any)),
        (e) => console.warn('signals out', e)
      )
    );
    this.timer = setInterval(() => this.sync(this.present), 5000);
    this.started = true;
    this.sync(this.present);
  }

  /** يبدأ أو يوقف إرسال مسار (الصوت أو الكاميرا أو الشاشة). يعيد المعرّف الذي يُكتب في وثيقة العضو. */
  setLocal(kind: MediaKind, track: MediaStreamTrack | null): string | null {
    if (!track) delete this.local[kind];
    else this.local[kind] = { track, nonce: newNonce() };
    this.pairs.forEach((p) => this.applyLocal(p.pc, kind));
    this.sync(this.present);
    return track ? this.local[kind]!.nonce : null;
  }

  private applyLocal(pc: RTCPeerConnection, kind: MediaKind) {
    const t = pc.getTransceivers()[KINDS.indexOf(kind)];
    if (!t || pc.signalingState === 'closed') return;
    const track = this.local[kind]?.track || null;
    t.sender
      .replaceTrack(track)
      .then(() => {
        const max = BITRATE[kind];
        if (!track || !max) return;
        const prm = t.sender.getParameters();
        if (!prm.encodings || !prm.encodings.length) prm.encodings = [{}] as any;
        prm.encodings[0].maxBitrate = max;
        return t.sender.setParameters(prm).catch(() => {});
      })
      .catch(() => {});
  }

  private wire(pc: RTCPeerConnection, peer: string, pair: () => Pair | undefined) {
    pc.ontrack = (e) => {
      const kind = KINDS[pc.getTransceivers().indexOf(e.transceiver)];
      if (kind && this.pairs.get(peer) === pair()) this.onTrack(`${peer}:${kind}`, e.track);
    };
    pc.addEventListener('connectionstatechange', () => {
      const p = this.pairs.get(peer);
      if (!p || p.pc !== pc) return;
      if (pc.connectionState === 'connected') {
        this.fails.delete(peer);
        KINDS.forEach((k) => this.applyLocal(pc, k)); // لضبط سرعة الفيديو بعد الاتصال
      } else if (pc.connectionState === 'failed') {
        this.fail(peer);
      } else if (pc.connectionState === 'disconnected') {
        // انقطاع مؤقت: إن لم يعد خلال 10 ثوانٍ نعيد بناء الاتصال
        setTimeout(() => {
          const q = this.pairs.get(peer);
          if (q && q.pc === pc && pc.connectionState !== 'connected') this.fail(peer);
        }, 10_000);
      }
    });
  }

  private addChannel(pc: RTCPeerConnection, peer: string, pair: Pair) {
    try {
      // قناة متفق عليها مسبقًا (id ثابت) تُنشأ عند الطرفين بلا تفاوض إضافي
      const dc = pc.createDataChannel('board', { negotiated: true, id: 7, ordered: true });
      pair.dc = dc;
      dc.onopen = () => {
        if (this.pairs.get(peer) === pair) this.onDataOpen(peer);
      };
      dc.onmessage = (e) => {
        if (this.pairs.get(peer) !== pair || typeof e.data !== 'string') return;
        const d = e.data as string;
        if (d[0] === 'F') return this.onData(peer, d.slice(1));
        if (d[0] !== 'C') return;
        // C<id>|<i>|<n>|<part>
        const m = d.match(/^C([^|]+)\|(\d+)\|(\d+)\|/);
        if (!m) return;
        const key = `${peer}:${m[1]}`;
        const n = Number(m[3]);
        const arr = this.parts.get(key) || new Array(n).fill('');
        arr[Number(m[2])] = d.slice(m[0].length);
        this.parts.set(key, arr);
        if (arr.every((x) => x !== '')) {
          this.parts.delete(key);
          this.onData(peer, arr.join(''));
        }
      };
    } catch {
      /* متصفح قديم: بلا سبورة */
    }
  }

  /** إرسال رسالة لكل من فُتحت معه القناة (أو لمشارك واحد) */
  sendData(msg: string, to?: string) {
    const out: string[] = [];
    if (msg.length <= CHUNK) out.push('F' + msg);
    else {
      const id = Math.random().toString(36).slice(2, 9);
      const n = Math.ceil(msg.length / CHUNK);
      for (let i = 0; i < n; i++) out.push(`C${id}|${i}|${n}|${msg.slice(i * CHUNK, (i + 1) * CHUNK)}`);
    }
    this.pairs.forEach((p) => {
      if (to && p.peer !== to) return;
      if (!p.dc || p.dc.readyState !== 'open') return;
      try {
        out.forEach((x) => p.dc!.send(x));
      } catch {
        /* ignore */
      }
    });
  }

  /** يُستدعى كلما تغيّرت قائمة الحاضرين */
  sync(present: RoomMember[]) {
    if (this.closed) return;
    this.present = present;
    if (!this.started) return;
    const me = present.find((m) => m.uid === this.uid);
    const iPub = !!me && canPublish(me);
    const want = new Set(present.filter((m) => m.uid !== this.uid && (iPub || canPublish(m))).map((m) => m.uid));
    const now = Date.now();

    // أنا أبدأ الاتصال مع من معرّفه أكبر من معرّفي
    want.forEach((peer) => {
      if (this.pairs.has(peer) || this.uid > peer) return;
      const f = this.fails.get(peer);
      if (f && f.nextAt > now) return;
      this.openPair(peer).catch((e) => console.warn('offer', e));
    });
    // إغلاق اتصالات من خرج
    this.pairs.forEach((p, peer) => {
      if (!want.has(peer)) {
        this.closePair(peer);
        this.fails.delete(peer);
      }
    });
  }

  private fail(peer: string) {
    const f = this.fails.get(peer) || { n: 0, nextAt: 0 };
    f.n += 1;
    f.nextAt = Date.now() + Math.min(30_000, 3000 * f.n);
    this.fails.set(peer, f);
    this.closePair(peer);
  }

  private async openPair(peer: string) {
    const attempt = this.fails.get(peer)?.n || 0;
    // بعد أول فشل: نجرّب التمرير عبر خادم TURN في المحاولات الفردية
    const relay = hasTurn() && attempt % 2 === 1;
    const pc = new RTCPeerConnection({ iceServers: ICE, iceTransportPolicy: relay ? 'relay' : 'all' });
    const docId = `${this.uid}_${peer}_${Date.now().toString(36)}`;
    const pair: Pair = { pc, peer, docId, initiator: true, at: Date.now() };
    this.pairs.set(peer, pair);
    KINDS.forEach((k) => pc.addTransceiver(k === 'mic' ? 'audio' : 'video', { direction: 'sendrecv' }));
    this.addChannel(pc, peer, pair);
    KINDS.forEach((k) => this.applyLocal(pc, k));
    this.wire(pc, peer, () => pair);
    setTimeout(() => {
      if (this.pairs.get(peer) === pair && pc.connectionState !== 'connected') this.fail(peer);
    }, CONNECT_TIMEOUT);
    await pc.setLocalDescription(await pc.createOffer());
    await waitIce(pc, hasTurn() ? 4000 : 2500);
    if (this.pairs.get(peer) !== pair || this.closed) return;
    await setDoc(doc(this.col(), docId), {
      from: this.uid,
      to: peer,
      kind: 'pair',
      nonce: docId.slice(-12),
      offer: pc.localDescription!.sdp,
      answer: null,
      createdAt: Date.now(),
    });
  }

  private onAnswer(docId: string, d: any) {
    if (!d || !d.answer) return;
    let found: Pair | undefined;
    this.pairs.forEach((p) => {
      if (p.docId === docId) found = p;
    });
    if (!found) {
      deleteDoc(doc(this.col(), docId)).catch(() => {});
      return;
    }
    if (found.pc.signalingState !== 'have-local-offer') return;
    found.pc
      .setRemoteDescription({ type: 'answer', sdp: d.answer })
      .then(() => deleteDoc(doc(this.col(), docId)).catch(() => {}))
      .catch((e) => console.warn('answer', e));
  }

  private async onOffer(docId: string, d: any) {
    if (!d || !d.offer || d.answer || d.kind !== 'pair' || this.handled.has(docId) || this.closed) return;
    this.handled.add(docId);
    const peer = String(d.from || '');
    // طلب إعادة اتصال من الطرف الآخر: أبدأ اتصالًا جديدًا فورًا
    if (d.offer === 'RESET') {
      deleteDoc(doc(this.col(), docId)).catch(() => {});
      if (Date.now() - Number(d.createdAt || 0) > OFFER_MAX_AGE) return;
      this.closePair(peer);
      this.fails.delete(peer);
      this.sync(this.present);
      return;
    }
    const at = Number(d.createdAt || 0);
    if (!peer || Date.now() - at > OFFER_MAX_AGE || at < (this.lastOffer.get(peer) || 0)) return;
    this.lastOffer.set(peer, at);
    this.closePair(peer);
    const pc = new RTCPeerConnection({ iceServers: ICE });
    const pair: Pair = { pc, peer, docId, initiator: false, at: Date.now() };
    this.pairs.set(peer, pair);
    this.addChannel(pc, peer, pair);
    this.wire(pc, peer, () => pair);
    try {
      await pc.setRemoteDescription({ type: 'offer', sdp: d.offer });
      pc.getTransceivers().forEach((t) => {
        try {
          t.direction = 'sendrecv';
        } catch {
          /* ignore */
        }
      });
      KINDS.forEach((k) => this.applyLocal(pc, k));
      await pc.setLocalDescription(await pc.createAnswer());
      await waitIce(pc, hasTurn() ? 4000 : 2500);
      if (this.pairs.get(peer) !== pair) return;
      await updateDoc(doc(this.col(), docId), { answer: pc.localDescription!.sdp });
    } catch (e) {
      console.warn('offer in', e);
      if (this.pairs.get(peer) === pair) this.closePair(peer);
    }
  }

  private closePair(peer: string) {
    const p = this.pairs.get(peer);
    if (!p) return;
    this.pairs.delete(peer);
    try {
      p.pc.close();
    } catch {
      /* ignore */
    }
    if (p.initiator) deleteDoc(doc(this.col(), p.docId)).catch(() => {});
    KINDS.forEach((k) => this.onRemove(`${peer}:${k}`));
  }

  /** حالة الاتصالات لعرضها: كم مشاركًا يصله صوتي، وكم متحدثًا أسمعه */
  status() {
    const others = this.present.filter((m) => m.uid !== this.uid);
    const ok = (id: string) => this.pairs.get(id)?.pc.connectionState === 'connected';
    const outPeers = this.local.mic ? others : [];
    const speakers = others.filter((m) => m.pub && (m.role === 'owner' || m.role === 'speaker'));
    return {
      outTotal: outPeers.length,
      outOk: outPeers.filter((m) => ok(m.uid)).length,
      inTotal: speakers.length,
      inOk: speakers.filter((m) => ok(m.uid)).length,
      turn: hasTurn(),
    };
  }

  /** إعادة الاتصال يدويًا بكل المشاركين */
  reconnect() {
    [...this.pairs.values()].forEach((p) => {
      // إن كان الطرف الآخر هو من يبدأ الاتصال نطلب منه إعادة البدء
      if (!p.initiator)
        setDoc(doc(this.col(), `${this.uid}_${p.peer}_r${Date.now().toString(36)}`), {
          from: this.uid,
          to: p.peer,
          kind: 'pair',
          nonce: 'reset',
          offer: 'RESET',
          answer: null,
          createdAt: Date.now(),
        }).catch(() => {});
      this.closePair(p.peer);
    });
    this.fails.clear();
    this.sync(this.present);
  }

  close() {
    this.closed = true;
    clearInterval(this.timer);
    this.unsubs.forEach((u) => u());
    [...this.pairs.keys()].forEach((k) => this.closePair(k));
    (Object.values(this.local) as { track: MediaStreamTrack }[]).forEach((l) => {
      try {
        l.track.stop();
      } catch {
        /* ignore */
      }
    });
    this.local = {};
  }
}

// ===== تحسين إضاءة الكاميرا =====
// تُعالَج الصورة قبل إرسالها (تفتيح لطيف مع تباين وألوان متوازنة) فيراها الجميع بنفس الإضاءة.
export const LIGHT_LEVELS = [
  { id: 0, ar: 'عادية', en: 'Normal', filter: 'none' },
  { id: 1, ar: 'مشرقة', en: 'Bright', filter: 'brightness(1.2) contrast(1.02) saturate(0.92)' },
  { id: 2, ar: 'أكثر إشراقًا', en: 'Brighter', filter: 'brightness(1.36) contrast(0.97) saturate(0.88)' },
  // تخفيف الاصفرار: ألوان أهدأ وميل خفيف بعيدًا عن الأصفر نحو الوردي الطبيعي
  { id: 3, ar: 'طبيعية بلا اصفرار', en: 'Natural, less yellow', filter: 'brightness(1.3) contrast(1) saturate(0.8) hue-rotate(-6deg)' },
];

export interface LightProcessor {
  track: MediaStreamTrack;
  setLevel: (lvl: number) => void;
  stop: () => void;
}

export function createLightProcessor(raw: MediaStreamTrack, level: number): LightProcessor {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const supportsFilter = !!ctx && 'filter' in ctx && typeof (canvas as any).captureStream === 'function';
  if (!ctx || !supportsFilter) {
    // متصفح قديم لا يدعم المعالجة: نرسل الصورة كما هي
    return { track: raw, setLevel: () => {}, stop: () => raw.stop() };
  }
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = new MediaStream([raw]);
  video.play().catch(() => {});
  let filter = LIGHT_LEVELS[level]?.filter || 'none';
  const s = raw.getSettings();
  canvas.width = s.width || 480;
  canvas.height = s.height || 360;
  const draw = () => {
    if (video.readyState >= 2) {
      if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.filter = filter;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  };
  const timer = setInterval(draw, 66); // حوالي 15 صورة في الثانية
  const out = (canvas as any).captureStream(15).getVideoTracks()[0] as MediaStreamTrack;
  return {
    track: out,
    setLevel: (lvl) => {
      filter = LIGHT_LEVELS[lvl]?.filter || 'none';
    },
    stop: () => {
      clearInterval(timer);
      out.stop();
      raw.stop();
      video.srcObject = null;
    },
  };
}
