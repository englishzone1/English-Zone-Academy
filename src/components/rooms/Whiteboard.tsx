import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Type,
  Smile,
  Hand as HandIcon,
  Image as ImageIcon,
  FileText,
  Undo2,
  Redo2,
  Trash2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Palette,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { BoardItem, BoardOp, BoardStore, BW, BH, newId } from './boardStore';

interface Props {
  store: BoardStore;
  canDraw: boolean;
  isOwner: boolean;
  isAr: boolean;
  /** يطبّق محليًا ويرسل للجميع */
  send: (op: BoardOp) => void;
  /** يرسل للجميع فقط (طُبّق محليًا مسبقًا) */
  emit: (op: BoardOp) => void;
  onMinimize: () => void;
  onClose: () => void;
  /** سبورة مستقلة (خارج الغرف): زر رجوع بدل التصغير والإغلاق */
  standalone?: boolean;
}

type Tool = 'pen' | 'hl' | 'eraser' | 'text' | 'emoji' | 'move';

const COLORS = ['#111827', '#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#9333EA', '#FFFFFF', '#D4AF37'];
const SIZES = [4, 8, 16];
const BGS = [
  { c: '#FFFFFF', ar: 'أبيض', en: 'White' },
  { c: '#FFF8E7', ar: 'كريمي', en: 'Cream' },
  { c: '#E8F1FF', ar: 'أزرق فاتح', en: 'Light blue' },
  { c: '#1F3D2B', ar: 'سبورة خضراء', en: 'Chalkboard' },
  { c: '#0F172A', ar: 'أسود', en: 'Black' }
];
const EMOJIS = ['⭐', '✅', '❌', '❓', '👍', '👏', '😊', '😍', '🤔', '🎉', '❤️', '🔥', '💡', '📚', '✍️', '🗣️', '👂', '👀', '➡️', '⬅️', '⬆️', '⬇️', '🍎', '🐱', '🏠', '☀️', '🌙', '⏰'];

const dark = (c: string) => {
  const n = parseInt(c.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return r * 0.299 + g * 0.587 + b * 0.114 < 110;
};

// مكتبة قراءة PDF تُحمَّل من الإنترنت عند الحاجة فقط
const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';
let pdfLib: any = null;
const loadPdfLib = async () => {
  if (pdfLib) return pdfLib;
  const url = PDFJS;
  const lib: any = await import(/* @vite-ignore */ url);
  lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  pdfLib = lib;
  return lib;
};

// تصغير الصورة قبل إرسالها حتى تصل بسرعة
const fileToJpeg = (file: File, max = 1200): Promise<{ src: string; w: number; h: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const x = c.getContext('2d')!;
      x.fillStyle = '#fff';
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve({ src: c.toDataURL('image/jpeg', 0.78), w: c.width, h: c.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('img'));
    };
    img.src = url;
  });

const imgCache = new Map<string, HTMLImageElement>();

export const Whiteboard: React.FC<Props> = ({ store, canDraw, isOwner, isAr, send, emit, onMinimize, onClose, standalone = false }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const view = useRef({ sc: 1, ox: 0, oy: 0, w: 0, h: 0 });

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#111827');
  const [size, setSize] = useState(1);
  const [emoji, setEmoji] = useState('⭐');
  const [panel, setPanel] = useState<'' | 'color' | 'emoji' | 'bg'>('');
  const [textBox, setTextBox] = useState<{ x: number; y: number; sx: number; sy: number; v: string } | null>(null);
  const [selected, setSelectedState] = useState<string | null>(null);
  const selRef = useRef<string | null>(null);
  const setSelected = (v: string | null) => {
    selRef.current = v;
    setSelectedState(v);
  };
  const [busy, setBusy] = useState('');
  const pdfRef = useRef<any>(null);

  // ما أضفته أنا (للتراجع والإعادة)
  const mine = useRef<BoardItem[]>([]);
  const redo = useRef<BoardItem[]>([]);

  // إعادة الرسم عند أي تغيير في السبورة
  useEffect(
    () =>
      store.subscribe(() => {
        requestDraw();
        force();
      }),
    [store]
  );

  const raf = useRef(0);
  const drawRef = useRef<() => void>(() => {});
  const requestDraw = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      drawRef.current();
    });
  };

  const imgOf = (src: string) => {
    let im = imgCache.get(src);
    if (!im) {
      im = new Image();
      im.onload = () => requestDraw();
      im.src = src;
      imgCache.set(src, im);
    }
    return im.complete && im.naturalWidth ? im : null;
  };

  const draw = () => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
    }
    const sc = Math.min(W / BW, H / BH);
    const ox = (W - BW * sc) / 2;
    const oy = (H - BH * sc) / 2;
    view.current = { sc, ox, oy, w: W, h: H };
    const s = store.snap;
    const x = cv.getContext('2d')!;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.fillStyle = s.bg;
    x.fillRect(0, 0, W, H);

    // صفحة PDF في الخلفية
    if (s.pdf?.src) {
      const im = imgOf(s.pdf.src);
      if (im) {
        const k = Math.min((BW * sc) / im.naturalWidth, (BH * sc) / im.naturalHeight);
        const iw = im.naturalWidth * k;
        const ih = im.naturalHeight * k;
        x.drawImage(im, ox + (BW * sc - iw) / 2, oy + (BH * sc - ih) / 2, iw, ih);
      }
    }

    // السطور تمتد على الشاشة كلها (بلا حدود)
    if (s.lines !== 'none') {
      const step = 62 * sc;
      x.strokeStyle = dark(s.bg) ? 'rgba(255,255,255,0.18)' : 'rgba(37,99,235,0.22)';
      x.lineWidth = 1;
      x.beginPath();
      for (let y = oy % step; y < H; y += step) {
        x.moveTo(0, y + 0.5);
        x.lineTo(W, y + 0.5);
      }
      if (s.lines === 'grid') for (let xx = ox % step; xx < W; xx += step) {
        x.moveTo(xx + 0.5, 0);
        x.lineTo(xx + 0.5, H);
      }
      x.stroke();
    }

    const P = (vx: number, vy: number): [number, number] => [ox + vx * sc, oy + vy * sc];
    for (const it of s.items) {
      if (it.k === 's') {
        if (it.p.length < 2) continue;
        x.globalAlpha = it.a;
        x.strokeStyle = it.c;
        x.lineWidth = it.w * sc;
        x.lineCap = 'round';
        x.lineJoin = 'round';
        x.beginPath();
        const [a, b] = P(it.p[0], it.p[1]);
        x.moveTo(a, b);
        if (it.p.length === 2) x.lineTo(a + 0.1, b + 0.1);
        for (let i = 2; i < it.p.length; i += 2) {
          const [c, d] = P(it.p[i], it.p[i + 1]);
          x.lineTo(c, d);
        }
        x.stroke();
        x.globalAlpha = 1;
      } else if (it.k === 't' || it.k === 'e') {
        x.font = `${it.k === 't' ? 'bold ' : ''}${it.s * sc}px ${it.k === 'e' ? 'sans-serif' : 'Tajawal, Cairo, Arial, sans-serif'}`;
        x.textBaseline = 'top';
        x.fillStyle = it.k === 't' ? it.c : '#000';
        const [a, b] = P(it.x, it.y);
        it.v.split('\n').forEach((line, i) => {
          // اتجاه السطر حسب أول حرف (عربي أو إنجليزي)
          const m = line.match(/[A-Za-z\u0600-\u06FF]/);
          (x as any).direction = m && /[\u0600-\u06FF]/.test(m[0]) ? 'rtl' : 'ltr';
          x.textAlign = 'left';
          x.fillText(line, a, b + i * it.s * sc * 1.2);
        });
        (x as any).direction = 'ltr';
      } else if (it.k === 'i') {
        const im = imgOf(it.src);
        const [a, b] = P(it.x, it.y);
        if (im) x.drawImage(im, a, b, it.w * sc, it.h * sc);
        else {
          x.fillStyle = 'rgba(0,0,0,0.08)';
          x.fillRect(a, b, it.w * sc, it.h * sc);
        }
      }
      if (it.id === selRef.current && it.k !== 's') {
        const r = boxOf(it);
        const [a, b] = P(r.x, r.y);
        x.strokeStyle = '#D4AF37';
        x.setLineDash([6, 4]);
        x.lineWidth = 2;
        x.strokeRect(a - 4, b - 4, r.w * sc + 8, r.h * sc + 8);
        x.setLineDash([]);
      }
    }
  };

  const boxOf = (it: BoardItem) => {
    if (it.k === 'i') return { x: it.x, y: it.y, w: it.w, h: it.h };
    if (it.k === 't' || it.k === 'e') {
      const lines = it.v.split('\n');
      const longest = Math.max(...lines.map((l) => l.length), 1);
      return { x: it.x, y: it.y, w: it.k === 'e' ? it.s * 1.15 : longest * it.s * 0.56, h: it.s * 1.2 * lines.length };
    }
    return { x: 0, y: 0, w: 0, h: 0 };
  };

  drawRef.current = draw;
  useLayoutEffect(() => {
    draw();
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  });

  const toLogic = (e: { clientX: number; clientY: number }) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const { sc, ox, oy } = view.current;
    return [(e.clientX - r.left - ox) / sc, (e.clientY - r.top - oy) / sc] as [number, number];
  };

  const hit = (lx: number, ly: number, strokes: boolean) => {
    const items = store.snap.items;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (it.k === 's') {
        if (!strokes) continue;
        const tol = it.w / 2 + 14;
        for (let j = 0; j < it.p.length; j += 2) {
          if (Math.abs(it.p[j] - lx) < tol && Math.abs(it.p[j + 1] - ly) < tol) return it;
        }
      } else {
        const r = boxOf(it);
        if (lx >= r.x - 6 && lx <= r.x + r.w + 6 && ly >= r.y - 6 && ly <= r.y + r.h + 6) return it;
      }
    }
    return null;
  };

  const addMine = (it: BoardItem) => {
    mine.current.push(it);
    redo.current = [];
  };

  // ===== الرسم باللمس أو الماوس =====
  const drag = useRef<{ kind: 'stroke'; id: string; buf: number[]; last: number } | { kind: 'move'; id: string; dx: number; dy: number; last: number } | { kind: 'erase' } | null>(null);

  const flushStroke = () => {
    const d = drag.current;
    if (!d || d.kind !== 'stroke' || !d.buf.length) return;
    emit({ t: 'sp', id: d.id, p: d.buf });
    d.buf = [];
    d.last = Date.now();
  };

  const onDown = (e: React.PointerEvent) => {
    if (!canDraw) return;
    // يمنع المتصفح من سحب التركيز (حتى يبقى مربع النص مفتوحًا)
    e.preventDefault();
    setPanel('');
    const [lx, ly] = toLogic(e);
    if (tool === 'pen' || tool === 'hl') {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      const id = newId();
      const w = SIZES[size] * (tool === 'hl' ? 3 : 1);
      const op: BoardOp = { t: 'sb', id, c: color, w, a: tool === 'hl' ? 0.35 : 1, p: [Math.round(lx), Math.round(ly)] };
      send(op);
      drag.current = { kind: 'stroke', id, buf: [], last: Date.now() };
    } else if (tool === 'eraser') {
      (e.target as Element).setPointerCapture?.(e.pointerId);
      drag.current = { kind: 'erase' };
      const it = hit(lx, ly, true);
      if (it) send({ t: 'del', id: it.id });
    } else if (tool === 'move') {
      const it = hit(lx, ly, false);
      setSelected(it ? it.id : null);
      if (it && it.k !== 's') {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        drag.current = { kind: 'move', id: it.id, dx: lx - it.x, dy: ly - it.y, last: 0 };
      }
      requestDraw();
    } else if (tool === 'text') {
      const r = canvasRef.current!.getBoundingClientRect();
      setTextBox({ x: lx, y: ly, sx: e.clientX - r.left, sy: e.clientY - r.top, v: '' });
    } else if (tool === 'emoji') {
      const it: BoardItem = { k: 'e', id: newId(), x: Math.round(lx - 35), y: Math.round(ly - 35), s: 70, v: emoji };
      send({ t: 'add', it });
      addMine(it);
    }
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const [lx, ly] = toLogic(e);
    if (d.kind === 'stroke') {
      const p = [Math.round(lx), Math.round(ly)];
      // نرسم محليًا فورًا، ونرسل النقاط كل 40 مللي ثانية
      store.apply({ t: 'sp', id: d.id, p });
      d.buf.push(...p);
      if (Date.now() - d.last > 40) flushStroke();
    } else if (d.kind === 'erase') {
      const it = hit(lx, ly, true);
      if (it) send({ t: 'del', id: it.id });
    } else if (d.kind === 'move') {
      const nx = Math.round(lx - d.dx);
      const ny = Math.round(ly - d.dy);
      store.apply({ t: 'upd', id: d.id, x: nx, y: ny });
      if (Date.now() - d.last > 60) {
        d.last = Date.now();
        emit({ t: 'upd', id: d.id, x: nx, y: ny });
      }
    }
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.kind === 'stroke') {
      // نرسل النقاط المتبقية فقط (النقاط المرسلة سابقًا موجودة عند الجميع)
      flushStroke();
      const it = store.snap.items.find((x) => x.id === d.id);
      if (it) addMine({ ...it, p: (it as any).p.slice() } as BoardItem);
    } else if (d.kind === 'move') {
      const it = store.snap.items.find((x) => x.id === d.id);
      if (it && it.k !== 's') send({ t: 'upd', id: it.id, x: it.x, y: it.y });
    }
  };

  const commitText = () => {
    if (!textBox) return;
    const v = textBox.v.trim();
    setTextBox(null);
    if (!v) return;
    const it: BoardItem = { k: 't', id: newId(), x: Math.round(textBox.x), y: Math.round(textBox.y), s: 26 + size * 12, c: color, v: v.slice(0, 500) };
    send({ t: 'add', it });
    addMine(it);
  };

  const undo = () => {
    const ids = new Set(store.snap.items.map((x) => x.id));
    while (mine.current.length) {
      const it = mine.current.pop()!;
      if (!ids.has(it.id)) continue;
      const cur = store.snap.items.find((x) => x.id === it.id)!;
      redo.current.push(JSON.parse(JSON.stringify(cur)));
      send({ t: 'del', id: it.id });
      return;
    }
  };
  const doRedo = () => {
    const it = redo.current.pop();
    if (!it) return;
    send({ t: 'add', it });
    mine.current.push(it);
  };

  const addImage = async (file: File) => {
    setBusy(tr('Adding the image…', 'جارٍ إضافة الصورة…'));
    try {
      const { src, w, h } = await fileToJpeg(file);
      const k = Math.min(1, 700 / w, 500 / h);
      const it: BoardItem = { k: 'i', id: newId(), x: Math.round(BW / 2 - (w * k) / 2), y: Math.round(BH / 2 - (h * k) / 2), w: Math.round(w * k), h: Math.round(h * k), src };
      send({ t: 'add', it });
      addMine(it);
      setTool('move');
      setSelected(it.id);
    } catch {
      /* ignore */
    }
    setBusy('');
  };

  const showPdfPage = async (n: number) => {
    const pdf = pdfRef.current;
    if (!pdf) return;
    setBusy(tr('Loading the page…', 'جارٍ تحميل الصفحة…'));
    try {
      const page = await pdf.getPage(n);
      const v1 = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: Math.min(2.2, 1400 / v1.width) });
      const c = document.createElement('canvas');
      c.width = Math.round(vp.width);
      c.height = Math.round(vp.height);
      await page.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
      send({ t: 'pdf', pdf: { src: c.toDataURL('image/jpeg', 0.72), page: n, pages: pdf.numPages, name: store.snap.pdf?.name || '' } });
    } catch {
      /* ignore */
    }
    setBusy('');
  };

  const openPdf = async (file: File) => {
    setBusy(tr('Opening the PDF…', 'جارٍ فتح الملف…'));
    try {
      const lib = await loadPdfLib();
      const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
      pdfRef.current = pdf;
      send({ t: 'pdf', pdf: { src: '', page: 1, pages: pdf.numPages, name: file.name.slice(0, 60) } });
      await showPdfPage(1);
    } catch {
      setBusy('');
      alertOnce(tr('Could not open this PDF.', 'تعذّر فتح هذا الملف.'));
    }
  };
  const [note, setNote] = useState('');
  const alertOnce = (m: string) => {
    setNote(m);
    setTimeout(() => setNote(''), 4000);
  };

  const sel = store.snap.items.find((x) => x.id === selected) || null;
  const resize = (k: number) => {
    if (!sel || sel.k === 's') return;
    if (sel.k === 'i') {
      const w = Math.max(60, Math.round(sel.w * k));
      const h = Math.max(40, Math.round(sel.h * k));
      store.apply({ t: 'upd', id: sel.id, x: sel.x, y: sel.y, w, h });
      send({ t: 'upd', id: sel.id, x: sel.x, y: sel.y, w, h });
    } else {
      // النص والإيموجي: نعيد إضافتهما بحجم جديد
      const it = { ...sel, s: Math.max(14, Math.min(260, Math.round(sel.s * k))) } as BoardItem;
      send({ t: 'del', id: sel.id });
      send({ t: 'add', it });
    }
  };

  useEffect(() => {
    if (selected && !store.snap.items.some((x) => x.id === selected)) setSelected(null);
  });

  // على السبورة الداكنة يصبح القلم الأسود أبيض تلقائيًا (والعكس)
  const bgDark = dark(store.snap.bg);
  useEffect(() => {
    if (bgDark && color === '#111827') setColor('#FFFFFF');
    if (!bgDark && color === '#FFFFFF') setColor('#111827');
  }, [bgDark]);

  // زر الإغلاق والتصغير، وأدوات الكتابة
  const tb = 'w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors';
  const on = 'bg-[#D4AF37] text-[#061638]';
  const off = 'bg-white/10 text-white hover:bg-white/20';
  const pdf = store.snap.pdf;
  const PrevI = isAr ? ChevronRight : ChevronLeft;
  const NextI = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="fixed inset-0 z-40 select-none" style={{ background: store.snap.bg }} dir={isAr ? 'rtl' : 'ltr'}>
      <div ref={wrapRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="block touch-none"
          style={{ cursor: !canDraw ? 'default' : tool === 'move' ? 'grab' : tool === 'text' ? 'text' : 'crosshair' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={(e) => e.buttons === 0 && onUp()}
        />
      </div>

      {/* مربع كتابة النص */}
      {textBox && (
        <textarea
          ref={(el) => {
            if (el && document.activeElement !== el) setTimeout(() => el.focus(), 0);
          }}
          dir="auto"
          value={textBox.v}
          onChange={(e) => setTextBox({ ...textBox, v: e.target.value })}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commitText();
            }
            if (e.key === 'Escape') setTextBox(null);
          }}
          placeholder={tr('Type… (Enter to place)', 'اكتب… (Enter للتثبيت)')}
          className="absolute z-10 min-w-[180px] px-2 py-1 rounded-lg border-2 border-[#D4AF37] bg-white/95 text-[#061638] font-bold outline-none shadow-lg"
          style={{ left: textBox.sx, top: textBox.sy, color, fontSize: Math.max(14, (26 + size * 12) * view.current.sc) }}
          rows={1}
        />
      )}

      {/* الشريط العلوي: اسم السبورة، التصغير، الإغلاق */}
      <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-2 pointer-events-none">
        <span className="pointer-events-auto px-3 py-1.5 rounded-full bg-[#061638]/85 text-[#F3E5AB] text-xs font-bold shadow">
          🖊️ {tr('Whiteboard', 'السبورة')}
          {!canDraw && <span className="text-gray-300 font-normal"> • {tr('view only', 'للمشاهدة')}</span>}
        </span>
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {standalone ? (
            <button onClick={onClose} className="h-10 px-4 rounded-full bg-[#061638]/85 text-[#F3E5AB] text-xs font-bold shadow flex items-center gap-1.5" title={tr('Back', 'رجوع')}>
              <X className="w-4 h-4" />
              {tr('Close the board', 'إغلاق السبورة')}
            </button>
          ) : (
          <>
          <button onClick={onMinimize} className={`${tb} bg-[#061638]/85 text-white`} title={tr('Minimize', 'تصغير')}>
            <Minimize2 className="w-4 h-4" />
          </button>
          {isOwner && (
            <button onClick={onClose} className={`${tb} bg-red-600 text-white`} title={tr('Close the board for everyone', 'إغلاق السبورة للجميع')}>
              <X className="w-5 h-5" />
            </button>
          )}
          </>
          )}
        </div>
      </div>

      {/* تنقل صفحات PDF */}
      {pdf && (
        <div className="absolute top-14 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#061638]/85 text-white text-xs font-bold shadow">
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          {pdfRef.current && canDraw && (
            <button disabled={pdf.page <= 1} onClick={() => showPdfPage(pdf.page - 1)} className="p-1 disabled:opacity-30">
              <PrevI className="w-4 h-4" />
            </button>
          )}
          <span dir="ltr">
            {pdf.page} / {pdf.pages}
          </span>
          {pdfRef.current && canDraw && (
            <button disabled={pdf.page >= pdf.pages} onClick={() => showPdfPage(pdf.page + 1)} className="p-1 disabled:opacity-30">
              <NextI className="w-4 h-4" />
            </button>
          )}
          {canDraw && (
            <button
              onClick={() => {
                pdfRef.current = null;
                send({ t: 'pdf', pdf: null });
              }}
              className="p-1 text-red-300"
              title={tr('Remove the PDF', 'إزالة الملف')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {(busy || note) && (
        <div className="absolute top-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 px-3 py-1.5 rounded-full bg-[#061638] text-[#F3E5AB] text-xs font-bold shadow flex items-center gap-1.5">
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {busy || note}
        </div>
      )}

      {/* أدوات الكتابة */}
      {canDraw && (
        <div className="absolute bottom-3 inset-x-2 flex flex-col items-center gap-2">
          {panel === 'color' && (
            <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-[#061638]/90 shadow-xl max-w-[95vw]">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-[#D4AF37] scale-110' : 'border-white/40'}`} style={{ background: c }} />
              ))}
              <span className="w-px h-6 bg-white/20 mx-1" />
              {SIZES.map((w, i) => (
                <button key={w} onClick={() => setSize(i)} className={`w-8 h-8 rounded-full flex items-center justify-center ${size === i ? 'bg-[#D4AF37]' : 'bg-white/10'}`}>
                  <span className="rounded-full" style={{ width: 4 + i * 5, height: 4 + i * 5, background: size === i ? '#061638' : '#fff' }} />
                </button>
              ))}
            </div>
          )}
          {panel === 'emoji' && (
            <div className="grid grid-cols-7 gap-1 p-2 rounded-2xl bg-[#061638]/90 shadow-xl">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setEmoji(e);
                    setTool('emoji');
                    setPanel('');
                  }}
                  className={`w-9 h-9 rounded-lg text-xl ${emoji === e ? 'bg-[#D4AF37]' : 'hover:bg-white/10'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          {panel === 'bg' && isOwner && (
            <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-[#061638]/90 shadow-xl text-white text-[11px] font-bold max-w-[95vw]">
              {BGS.map((b) => (
                <button key={b.c} onClick={() => send({ t: 'bg', bg: b.c })} className={`px-2 py-1 rounded-lg border-2 flex items-center gap-1 ${store.snap.bg === b.c ? 'border-[#D4AF37]' : 'border-white/20'}`}>
                  <span className="w-4 h-4 rounded" style={{ background: b.c }} />
                  {isAr ? b.ar : b.en}
                </button>
              ))}
              <span className="w-px h-6 bg-white/20 mx-1" />
              {(
                [
                  ['none', tr('No lines', 'بلا سطور')],
                  ['lines', tr('Lines', 'سطور')],
                  ['grid', tr('Grid', 'مربعات')]
                ] as const
              ).map(([v, l]) => (
                <button key={v} onClick={() => send({ t: 'bg', lines: v })} className={`px-2 py-1 rounded-lg ${store.snap.lines === v ? 'bg-[#D4AF37] text-[#061638]' : 'bg-white/10'}`}>
                  {l}
                </button>
              ))}
            </div>
          )}
          {sel && sel.k !== 's' && tool === 'move' && (
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#061638]/90 shadow-xl">
              <button onClick={() => resize(0.85)} className={`${tb} ${off}`} title={tr('Smaller', 'أصغر')}>
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => resize(1.18)} className={`${tb} ${off}`} title={tr('Bigger', 'أكبر')}>
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => send({ t: 'del', id: sel.id })} className={`${tb} bg-red-500/80 text-white`} title={tr('Delete', 'حذف')}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#061638]/90 shadow-2xl max-w-full overflow-x-auto [scrollbar-width:none]">
            <button onClick={() => setTool('pen')} className={`${tb} ${tool === 'pen' ? on : off}`} title={tr('Pen', 'قلم')}>
              <Pen className="w-4 h-4" />
            </button>
            <button onClick={() => setTool('hl')} className={`${tb} ${tool === 'hl' ? on : off}`} title={tr('Highlighter', 'قلم تظليل')}>
              <Highlighter className="w-4 h-4" />
            </button>
            <button onClick={() => setPanel(panel === 'color' ? '' : 'color')} className={`${tb} ${off}`} title={tr('Colour and size', 'اللون والحجم')}>
              <span className="w-5 h-5 rounded-full border-2 border-white" style={{ background: color }} />
            </button>
            <button onClick={() => setTool('eraser')} className={`${tb} ${tool === 'eraser' ? on : off}`} title={tr('Eraser', 'ممحاة')}>
              <Eraser className="w-4 h-4" />
            </button>
            <button onClick={() => setTool('text')} className={`${tb} ${tool === 'text' ? on : off}`} title={tr('Text', 'كتابة')}>
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setPanel(panel === 'emoji' ? '' : 'emoji');
                setTool('emoji');
              }}
              className={`${tb} ${tool === 'emoji' ? on : off}`}
              title={tr('Emoji', 'إيموجي')}
            >
              {tool === 'emoji' ? <span className="text-lg">{emoji}</span> : <Smile className="w-4 h-4" />}
            </button>
            <button onClick={() => setTool('move')} className={`${tb} ${tool === 'move' ? on : off}`} title={tr('Move and resize', 'تحريك وتكبير')}>
              <HandIcon className="w-4 h-4" />
            </button>
            <label className={`${tb} ${off} cursor-pointer`} title={tr('Add an image', 'إضافة صورة')}>
              <ImageIcon className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (f) addImage(f);
                }}
              />
            </label>
            <label className={`${tb} ${off} cursor-pointer`} title={tr('Open a PDF', 'فتح ملف PDF')}>
              <FileText className="w-4 h-4" />
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (f) openPdf(f);
                }}
              />
            </label>
            {isOwner && (
              <button onClick={() => setPanel(panel === 'bg' ? '' : 'bg')} className={`${tb} ${panel === 'bg' ? on : off}`} title={tr('Board colour and lines', 'لون السبورة والسطور')}>
                <Palette className="w-4 h-4" />
              </button>
            )}
            <span className="w-px h-6 bg-white/20 shrink-0" />
            <button onClick={undo} className={`${tb} ${off}`} title={tr('Undo', 'تراجع')}>
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={doRedo} className={`${tb} ${off}`} title={tr('Redo', 'إعادة')}>
              <Redo2 className="w-4 h-4" />
            </button>
            {isOwner && (
              <button
                onClick={() => {
                  send({ t: 'clear' });
                  mine.current = [];
                  redo.current = [];
                }}
                className={`${tb} bg-red-500/80 text-white`}
                title={tr('Clear everything', 'مسح الكل')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
