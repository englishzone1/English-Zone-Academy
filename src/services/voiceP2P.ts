// الصوت ومشاركة الشاشة مباشرة بين أجهزة المشاركين (بدون خادم وسيط ولا بطاقة دفع)
// كل متحدث يرسل صوته لكل مشارك في اتصال مستقل باتجاه واحد (ناشر ← مستقبِل).
// تبادل الإعداد (SDP) عبر Firestore: voice_rooms/{roomId}/signals/{id} {from, to, kind, nonce, offer, answer}
// الناشر يكتب العرض، والمستقبِل يكتب الجواب، ثم يحذف الناشر الوثيقة.
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import type { RoomMember } from './voiceRooms';

export type MediaKind = 'mic' | 'screen';

const ICE: RTCIceServer[] = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }];
const MAX_FAILS = 3;

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

interface Out {
  pc: RTCPeerConnection;
  docId: string;
  to: string;
  kind: MediaKind;
  nonce: string;
}
interface In {
  pc: RTCPeerConnection;
  docId: string;
  from: string;
  kind: MediaKind;
  nonce: string;
  at: number;
}

export class P2PMesh {
  private roomId: string;
  private uid: string;
  private local: Partial<Record<MediaKind, { track: MediaStreamTrack; nonce: string }>> = {};
  private outs = new Map<string, Out>(); // `${kind}:${to}`
  private ins = new Map<string, In>(); // `${from}:${kind}`
  private handled = new Set<string>();
  private fails = new Map<string, number>();
  private present: RoomMember[] = [];
  private unsubs: (() => void)[] = [];
  private closed = false;
  private timer: any;
  onTrack: (key: string, track: MediaStreamTrack) => void;
  onRemove: (key: string) => void;

  constructor(roomId: string, uid: string, onTrack: (key: string, track: MediaStreamTrack) => void, onRemove: (key: string) => void) {
    this.roomId = roomId;
    this.uid = uid;
    this.onTrack = onTrack;
    this.onRemove = onRemove;
  }

  private col() {
    return collection(db, 'voice_rooms', this.roomId, 'signals');
  }

  start() {
    // عروض موجّهة إليّ
    this.unsubs.push(
      onSnapshot(
        query(this.col(), where('to', '==', this.uid)),
        (snap) => snap.docChanges().forEach((c) => c.type !== 'removed' && this.onOffer(c.doc.id, c.doc.data() as any)),
        (e) => console.warn('signals in', e)
      )
    );
    // أجوبة على عروضي
    this.unsubs.push(
      onSnapshot(
        query(this.col(), where('from', '==', this.uid)),
        (snap) => snap.docChanges().forEach((c) => c.type !== 'removed' && this.onAnswer(c.doc.id, c.doc.data() as any)),
        (e) => console.warn('signals out', e)
      )
    );
    this.timer = setInterval(() => this.sync(this.present), 10000);
  }

  /** يبدأ أو يوقف نشر مسار (الصوت أو الشاشة). يعيد المعرّف الذي يُكتب في وثيقة العضو. */
  setLocal(kind: MediaKind, track: MediaStreamTrack | null): string | null {
    this.outs.forEach((o, k) => {
      if (o.kind === kind) this.closeOut(k);
    });
    if (!track) {
      delete this.local[kind];
      return null;
    }
    const nonce = newNonce();
    this.local[kind] = { track, nonce };
    this.sync(this.present);
    return nonce;
  }

  /** يُستدعى كلما تغيّرت قائمة الحاضرين */
  sync(present: RoomMember[]) {
    if (this.closed) return;
    this.present = present;
    const others = present.filter((m) => m.uid !== this.uid);
    const ids = new Set(others.map((m) => m.uid));

    // الإرسال: اتصال لكل حاضر لكل مسار أنشره
    (Object.keys(this.local) as MediaKind[]).forEach((kind) => {
      others.forEach((m) => {
        const key = `${kind}:${m.uid}`;
        if (!this.outs.has(key) && (this.fails.get(key) || 0) < MAX_FAILS) this.openOut(kind, m.uid).catch((e) => console.warn('offer', e));
      });
    });
    this.outs.forEach((o, k) => {
      if (!ids.has(o.to)) {
        this.closeOut(k);
        this.fails.delete(k);
      }
    });

    // الاستقبال: إغلاق ما توقف ناشره عن نشره
    const now = Date.now();
    this.ins.forEach((i, k) => {
      const m = others.find((x) => x.uid === i.from);
      const cur = m ? (i.kind === 'mic' ? m.pub : m.screen) : null;
      const allowed = !!m && (i.kind === 'screen' || m.role === 'owner' || m.role === 'speaker');
      if (!m || !allowed || (cur && cur !== i.nonce) || (!cur && now - i.at > 15000)) this.closeIn(k);
    });
  }

  private async openOut(kind: MediaKind, to: string) {
    const loc = this.local[kind];
    if (!loc) return;
    const key = `${kind}:${to}`;
    const pc = new RTCPeerConnection({ iceServers: ICE });
    const docId = `${loc.nonce}_${to}_${Date.now().toString(36)}`;
    const out: Out = { pc, docId, to, kind, nonce: loc.nonce };
    this.outs.set(key, out);
    pc.addTransceiver(loc.track, { direction: 'sendonly' });
    pc.addEventListener('connectionstatechange', () => {
      if (pc.connectionState === 'failed') {
        this.fails.set(key, (this.fails.get(key) || 0) + 1);
        if (this.outs.get(key) === out) this.closeOut(key);
      }
    });
    // إن لم يصل جواب خلال 30 ثانية نعيد المحاولة لاحقًا (بحد أقصى)
    setTimeout(() => {
      if (this.outs.get(key) === out && pc.signalingState === 'have-local-offer') {
        this.fails.set(key, (this.fails.get(key) || 0) + 1);
        this.closeOut(key);
      }
    }, 30000);
    await pc.setLocalDescription(await pc.createOffer());
    await waitIce(pc);
    if (this.outs.get(key) !== out || this.closed) return;
    await setDoc(doc(this.col(), docId), {
      from: this.uid,
      to,
      kind,
      nonce: loc.nonce,
      offer: pc.localDescription!.sdp,
      answer: null,
      createdAt: Date.now(),
    });
  }

  private onAnswer(docId: string, d: any) {
    if (!d || !d.answer) return;
    let found: Out | undefined;
    this.outs.forEach((o) => {
      if (o.docId === docId) found = o;
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
    if (!d || !d.offer || d.answer || this.handled.has(docId) || this.closed) return;
    if (d.kind !== 'mic' && d.kind !== 'screen') return;
    this.handled.add(docId);
    const key = `${d.from}:${d.kind}`;
    this.closeIn(key);
    const pc = new RTCPeerConnection({ iceServers: ICE });
    const inn: In = { pc, docId, from: d.from, kind: d.kind, nonce: d.nonce, at: Date.now() };
    this.ins.set(key, inn);
    pc.ontrack = (e) => {
      if (this.ins.get(key) === inn) this.onTrack(key, e.track);
    };
    pc.addEventListener('connectionstatechange', () => {
      if ((pc.connectionState === 'failed' || pc.connectionState === 'closed') && this.ins.get(key) === inn) this.closeIn(key);
    });
    try {
      await pc.setRemoteDescription({ type: 'offer', sdp: d.offer });
      await pc.setLocalDescription(await pc.createAnswer());
      await waitIce(pc);
      if (this.ins.get(key) !== inn) return;
      await updateDoc(doc(this.col(), docId), { answer: pc.localDescription!.sdp });
    } catch (e) {
      console.warn('offer in', e);
      if (this.ins.get(key) === inn) this.closeIn(key);
    }
  }

  private closeOut(key: string) {
    const o = this.outs.get(key);
    if (!o) return;
    this.outs.delete(key);
    try {
      o.pc.close();
    } catch {
      /* ignore */
    }
    deleteDoc(doc(this.col(), o.docId)).catch(() => {});
  }

  private closeIn(key: string) {
    const i = this.ins.get(key);
    if (!i) return;
    this.ins.delete(key);
    try {
      i.pc.close();
    } catch {
      /* ignore */
    }
    this.onRemove(key);
  }

  /** حالة الاتصالات لعرضها للمستخدم: كم مشاركًا يصله صوتي، وكم متحدثًا أسمعه */
  status() {
    let outTotal = 0,
      outOk = 0,
      inTotal = 0,
      inOk = 0;
    this.outs.forEach((o) => {
      if (o.kind !== 'mic') return;
      outTotal++;
      if (o.pc.connectionState === 'connected') outOk++;
    });
    const speakers = this.present.filter((m) => m.uid !== this.uid && m.pub && (m.role === 'owner' || m.role === 'speaker'));
    inTotal = speakers.length;
    speakers.forEach((m) => {
      const i = this.ins.get(`${m.uid}:mic`);
      if (i && i.pc.connectionState === 'connected') inOk++;
    });
    return { outTotal, outOk, inTotal, inOk };
  }

  close() {
    this.closed = true;
    clearInterval(this.timer);
    this.unsubs.forEach((u) => u());
    [...this.outs.keys()].forEach((k) => this.closeOut(k));
    [...this.ins.keys()].forEach((k) => this.closeIn(k));
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
