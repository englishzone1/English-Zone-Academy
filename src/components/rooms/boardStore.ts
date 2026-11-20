// حالة السبورة في الغرفة الصوتية: تعيش في الذاكرة فقط (لا تُحفظ أبدًا)،
// وتنتقل بين الأجهزة عبر قناة البيانات في الاتصال المباشر.

export const BW = 1600; // المساحة المنطقية للسبورة (تُكبَّر وتُصغَّر حسب الشاشة)
export const BH = 1000;

export type BoardItem =
  | { k: 's'; id: string; c: string; w: number; a: number; p: number[] } // خط (نقاط x,y متتالية)
  | { k: 't'; id: string; x: number; y: number; s: number; c: string; v: string } // نص
  | { k: 'e'; id: string; x: number; y: number; s: number; v: string } // إيموجي
  | { k: 'i'; id: string; x: number; y: number; w: number; h: number; src: string }; // صورة

export interface BoardSnap {
  open: boolean;
  bg: string;
  lines: 'none' | 'lines' | 'grid';
  items: BoardItem[];
  pdf: { src: string; page: number; pages: number; name: string } | null;
}

export type BoardOp =
  | { t: 'open' }
  | { t: 'close' }
  | { t: 'snap'; s: BoardSnap }
  | { t: 'add'; it: BoardItem }
  | { t: 'sb'; id: string; c: string; w: number; a: number; p: number[] }
  | { t: 'sp'; id: string; p: number[] }
  | { t: 'upd'; id: string; x: number; y: number; w?: number; h?: number }
  | { t: 'del'; id: string }
  | { t: 'clear' }
  | { t: 'bg'; bg?: string; lines?: BoardSnap['lines'] }
  | { t: 'pdf'; pdf: BoardSnap['pdf'] };

export const emptySnap = (): BoardSnap => ({ open: false, bg: '#FFFFFF', lines: 'none', items: [], pdf: null });

export class BoardStore {
  snap: BoardSnap = emptySnap();
  version = 0;
  private subs = new Set<() => void>();

  subscribe(fn: () => void) {
    this.subs.add(fn);
    return () => {
      this.subs.delete(fn);
    };
  }

  private emit() {
    this.version++;
    this.subs.forEach((f) => f());
  }

  apply(op: BoardOp) {
    const s = this.snap;
    switch (op.t) {
      case 'open':
        s.open = true;
        break;
      case 'close':
        this.snap = emptySnap();
        break;
      case 'snap':
        this.snap = { ...emptySnap(), ...op.s, items: Array.isArray(op.s.items) ? op.s.items : [] };
        break;
      case 'add':
        if (!s.items.some((x) => x.id === op.it.id)) s.items.push(op.it);
        break;
      case 'sb':
        if (!s.items.some((x) => x.id === op.id)) s.items.push({ k: 's', id: op.id, c: op.c, w: op.w, a: op.a, p: op.p.slice() });
        break;
      case 'sp': {
        const it = s.items.find((x) => x.id === op.id);
        if (it && it.k === 's') it.p.push(...op.p);
        break;
      }
      case 'upd': {
        const it = s.items.find((x) => x.id === op.id);
        if (it && it.k !== 's') {
          it.x = op.x;
          it.y = op.y;
          if (it.k === 'i' && op.w && op.h) {
            it.w = op.w;
            it.h = op.h;
          }
        }
        break;
      }
      case 'del':
        s.items = s.items.filter((x) => x.id !== op.id);
        break;
      case 'clear':
        s.items = [];
        break;
      case 'bg':
        if (op.bg) s.bg = op.bg;
        if (op.lines) s.lines = op.lines;
        break;
      case 'pdf':
        s.pdf = op.pdf;
        break;
    }
    this.emit();
  }
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
