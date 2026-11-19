// الصوت ومشاركة الشاشة في الغرف الصوتية عبر Cloudflare Realtime (SFU)
// كل متحدث ينشر صوته في جلسة خاصة، وكل مشارك يستقبل الأصوات في جلسة استقبال واحدة.
import { auth } from './firebase';

const ICE: RTCIceServer[] = [{ urls: 'stun:stun.cloudflare.com:3478' }];

export class RtcError extends Error {}

async function api(op: 'new' | 'tracks' | 'renegotiate' | 'close', sessionId?: string, body?: any): Promise<any> {
  const user = auth.currentUser;
  if (!user) throw new RtcError('not_signed_in');
  const token = await user.getIdToken();
  const res = await fetch('/api/rtc', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
    body: JSON.stringify({ op, sessionId, body }),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  if (!res.ok || data.errorCode) throw new RtcError(data.errorCode || data.error || 'http_' + res.status);
  return data;
}

export async function rtcConfigured(): Promise<boolean> {
  try {
    const r = await fetch('/api/rtc/status', { cache: 'no-store' });
    if (!r.ok) return false;
    const j = await r.json();
    return !!j.configured;
  } catch {
    return false;
  }
}

function waitIce(pc: RTCPeerConnection, ms = 2000): Promise<void> {
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

function waitConnected(pc: RTCPeerConnection, ms = 15000): Promise<void> {
  if (pc.connectionState === 'connected') return Promise.resolve();
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      cleanup();
      reject(new RtcError('connect_timeout'));
    }, ms);
    function cleanup() {
      clearTimeout(t);
      pc.removeEventListener('connectionstatechange', check);
    }
    function check() {
      if (pc.connectionState === 'connected') {
        cleanup();
        resolve();
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanup();
        reject(new RtcError('connect_failed'));
      }
    }
    pc.addEventListener('connectionstatechange', check);
  });
}

/** نشر مسار واحد (صوت المتحدث أو الشاشة) في جلسة مستقلة */
export class Publisher {
  pc: RTCPeerConnection;
  sessionId = '';
  track: MediaStreamTrack;
  trackName: string;
  onDisconnect?: () => void;

  private constructor(track: MediaStreamTrack, trackName: string) {
    this.track = track;
    this.trackName = trackName;
    this.pc = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' });
  }

  static async start(track: MediaStreamTrack, trackName: string): Promise<Publisher> {
    const p = new Publisher(track, trackName);
    try {
      const tr = p.pc.addTransceiver(track, { direction: 'sendonly' });
      await p.pc.setLocalDescription(await p.pc.createOffer());
      await waitIce(p.pc);
      const s = await api('new');
      p.sessionId = s.sessionId;
      const res = await api('tracks', p.sessionId, {
        sessionDescription: { type: 'offer', sdp: p.pc.localDescription!.sdp },
        tracks: [{ location: 'local', mid: tr.mid, trackName }],
      });
      const t0 = (res.tracks || [])[0];
      if (t0 && t0.errorCode) throw new RtcError(t0.errorCode);
      await p.pc.setRemoteDescription(res.sessionDescription);
      await waitConnected(p.pc);
      p.pc.addEventListener('connectionstatechange', () => {
        if (p.pc.connectionState === 'failed' || p.pc.connectionState === 'disconnected') p.onDisconnect?.();
      });
      return p;
    } catch (e) {
      p.pc.close();
      throw e;
    }
  }

  close() {
    try {
      this.track.stop();
    } catch {
      /* ignore */
    }
    try {
      this.pc.close();
    } catch {
      /* ignore */
    }
  }
}

export interface WantedTrack {
  key: string; // معرّف داخلي: uid + نوع المسار
  sessionId: string; // جلسة الناشر
  trackName: string;
}

/** جلسة الاستقبال: تشترك في مسارات الآخرين وتُلغي ما لم يعد مطلوبًا */
export class Subscriber {
  pc: RTCPeerConnection;
  sessionId = '';
  private queue: Promise<void> = Promise.resolve();
  private subs = new Map<string, { mid: string; sid: string; name: string }>();
  private midToKey = new Map<string, string>();
  private closed = false;
  onTrack: (key: string, track: MediaStreamTrack) => void;
  onRemove: (key: string) => void;
  onDisconnect?: () => void;

  constructor(onTrack: (key: string, track: MediaStreamTrack) => void, onRemove: (key: string) => void) {
    this.onTrack = onTrack;
    this.onRemove = onRemove;
    this.pc = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' });
    this.pc.ontrack = (e) => {
      const key = this.midToKey.get(e.transceiver.mid || '');
      if (key) this.onTrack(key, e.track);
    };
    this.pc.addEventListener('connectionstatechange', () => {
      if (this.pc.connectionState === 'failed') this.onDisconnect?.();
    });
  }

  async init() {
    const s = await api('new');
    this.sessionId = s.sessionId;
  }

  /** يُستدعى كلما تغيّرت قائمة المسارات المنشورة في الغرفة */
  sync(wanted: WantedTrack[]) {
    this.queue = this.queue.then(() => this.doSync(wanted)).catch((e) => console.warn('voice sync', e));
    return this.queue;
  }

  private async doSync(wanted: WantedTrack[]) {
    if (this.closed || !this.sessionId) return;
    const want = new Map(wanted.map((w) => [w.key, w]));

    // إلغاء المسارات القديمة أو التي تغيّرت جلستها
    const remove: string[] = [];
    this.subs.forEach((s, key) => {
      const w = want.get(key);
      if (!w || w.sessionId !== s.sid || w.trackName !== s.name) remove.push(key);
    });
    if (remove.length) {
      const mids = remove.map((k) => this.subs.get(k)!.mid);
      try {
        await api('close', this.sessionId, { tracks: mids.map((mid) => ({ mid })), force: true });
      } catch (e) {
        console.warn('voice close', e);
      }
      remove.forEach((k) => {
        const s = this.subs.get(k)!;
        this.midToKey.delete(s.mid);
        this.subs.delete(k);
        this.onRemove(k);
      });
    }

    const add = wanted.filter((w) => !this.subs.has(w.key));
    if (!add.length || this.closed) return;
    const res = await api('tracks', this.sessionId, {
      tracks: add.map((w) => ({ location: 'remote', sessionId: w.sessionId, trackName: w.trackName })),
    });
    let any = false;
    (res.tracks || []).forEach((t: any, i: number) => {
      if (t.errorCode || !t.mid) return;
      const w = add.find((a) => a.sessionId === t.sessionId && a.trackName === t.trackName) || add[i];
      if (!w) return;
      this.midToKey.set(String(t.mid), w.key);
      this.subs.set(w.key, { mid: String(t.mid), sid: w.sessionId, name: w.trackName });
      any = true;
    });
    if (res.requiresImmediateRenegotiation && res.sessionDescription) {
      await this.pc.setRemoteDescription(res.sessionDescription);
      await this.pc.setLocalDescription(await this.pc.createAnswer());
      await waitIce(this.pc, 1500);
      await api('renegotiate', this.sessionId, {
        sessionDescription: { type: 'answer', sdp: this.pc.localDescription!.sdp },
      });
    } else if (!any) {
      return;
    }
  }

  close() {
    this.closed = true;
    try {
      this.pc.close();
    } catch {
      /* ignore */
    }
  }
}

/** مستوى الصوت (0..1) لإظهار من يتكلم الآن */
export class LevelMeter {
  private ctx: AudioContext | null = null;
  private nodes = new Map<string, { src: MediaStreamAudioSourceNode; an: AnalyserNode; buf: any }>();

  private context() {
    if (!this.ctx) {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = AC ? new AC() : null;
    }
    return this.ctx;
  }

  add(key: string, track: MediaStreamTrack) {
    this.remove(key);
    const ctx = this.context();
    if (!ctx) return;
    try {
      const src = ctx.createMediaStreamSource(new MediaStream([track]));
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      src.connect(an);
      this.nodes.set(key, { src, an, buf: new Uint8Array(an.frequencyBinCount) });
    } catch {
      /* ignore */
    }
  }

  remove(key: string) {
    const n = this.nodes.get(key);
    if (n) {
      try {
        n.src.disconnect();
      } catch {
        /* ignore */
      }
      this.nodes.delete(key);
    }
  }

  levels(): Record<string, number> {
    const out: Record<string, number> = {};
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    this.nodes.forEach((n, key) => {
      n.an.getByteFrequencyData(n.buf);
      let sum = 0;
      for (let i = 0; i < n.buf.length; i++) sum += n.buf[i];
      out[key] = sum / (n.buf.length * 255);
    });
    return out;
  }

  close() {
    this.nodes.forEach((_, k) => this.remove(k));
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
