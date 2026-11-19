// صيغة المخاطَب حسب جنس المشترك
// النصوص تُكتب بعلامات {مذكر|مؤنث}، مثل «{سجّل|سجّلي} الآن».
// • مشترك ذكر ← المذكر • مشتركة أنثى ← المؤنث • زائر لا نعرف جنسه ← الصيغتان معًا: «سجّل/ي الآن»
export type Gender = 'male' | 'female' | '';

let current: Gender = '';
const listeners = new Set<() => void>();

export const getGender = () => current;
export const setGender = (g: Gender) => {
  if (g === current) return;
  current = g;
  listeners.forEach((f) => f());
};
export const onGenderChange = (f: () => void) => {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
};

const MARK = /\{([^{}|\n]*)\|([^{}|\n]*)\}/g;

const both = (m: string, f: string) => {
  const plain = f.replace(/ِ/g, '');
  if (plain === m) return m; // كِ ← ك (تُقرأ للجنسين)
  if (f.startsWith(m)) return `${m}/${f.slice(m.length)}`; // سجّل/ي
  return `${m}/${f}`; // ابدأ/ابدئي
};

export const resolveGender = (s: string, g: Gender = current): string =>
  s.indexOf('|') < 0 || s.indexOf('{') < 0 ? s : s.replace(MARK, (_, m: string, f: string) => (g === 'male' ? m : g === 'female' ? f : both(m, f)));

// يحوّل العلامات في الصفحة كلها (النصوص والعناوين ونص الحقول الفارغة) لحظة ظهورها
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const fixText = (n: Node) => {
  const v = n.nodeValue;
  if (v && v.indexOf('|') >= 0 && v.indexOf('{') >= 0) {
    const r = resolveGender(v);
    if (r !== v) n.nodeValue = r;
  }
};
const fixEl = (el: Element) => {
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v && v.indexOf('|') >= 0 && v.indexOf('{') >= 0) {
      const r = resolveGender(v);
      if (r !== v) el.setAttribute(a, r);
    }
  }
};
const walk = (root: Node) => {
  if (root.nodeType === Node.TEXT_NODE) return fixText(root);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'TEXTAREA') return;
  fixEl(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let n: Node | null = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) {
      const p = n.parentElement;
      if (!p || (p.tagName !== 'TEXTAREA' && p.tagName !== 'SCRIPT' && p.tagName !== 'STYLE')) fixText(n);
    } else fixEl(n as Element);
    n = tw.nextNode();
  }
};

let started = false;
export const startGenderObserver = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  walk(document.body);
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'characterData') fixText(m.target);
      else if (m.type === 'attributes') fixEl(m.target as Element);
      else m.addedNodes.forEach((n) => walk(n));
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
};
