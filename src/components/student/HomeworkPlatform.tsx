import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, BookOpenCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { studentHubService, HomeworkResult } from '../../services/studentHubService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface Props {
  isAr: boolean;
  uid: string;
  name: string;
  groupId?: string;
  teacherId?: string;
  // معاينة للإدارة: تعرض الموقع نفسه بلا حفظ نتائج
  preview?: boolean;
  // صفحة كاملة: الواجبات تملأ الشاشة كلها في تبويب مستقل
  full?: boolean;
  onBack?: () => void;
}

const kindLabel = (k: string, isAr: boolean) =>
  k === 'exam' ? (isAr ? 'اختبار نهائي' : 'Final exam') : k === 'test' ? (isAr ? 'اختبار وحدة' : 'Unit test') : isAr ? 'درس' : 'Lesson';

// منصة الواجبات والاختبارات التفاعلية داخل لوحة الطالب.
// الموقع المضمّن يرسل النتائج والتقدّم، فتُحفظ هنا باسم الطالب وتظهر للإدارة والمعلم.
export const HomeworkPlatform: React.FC<Props> = ({ isAr, uid, name, groupId, teacherId, preview = false, full = false, onBack }) => {
  // موقع الواجبات صار جزءًا من المنصة نفسها، ولا يُفتح إلا من هنا
  const homeworkUrl = '/homework/';
  const [tall, setTall] = useState(false);
  const [results, setResults] = useState<HomeworkResult[]>([]);
  const [savedNote, setSavedNote] = useState('');
  const [saveError, setSaveError] = useState('');
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  // صفحة الواجبات الكاملة (تبويب جديد تفتحه المنصة)
  const popupRef = useRef<Window | null>(null);

  const openFull = () => {
    // تبويب جديد فيه المنصة نفسها بصفحة الواجبات الكاملة، فتُحفظ النتائج منه مباشرة
    const w = window.open('/#/homework', '_blank');
    if (w) w.focus();
    else window.location.hash = '#/homework';
  };
  const progressTimer = useRef<number | null>(null);
  // دروس أُنهيت في هذه الجلسة: لا يُحفظ لها «غير مكتمل» متأخر
  const finished = useRef<Set<string>>(new Set());
  // واجبات لها نتيجة محفوظة: إعادة حلّها للتدريب فقط ولا تُحفظ
  const doneIds = useRef<Set<string>>(new Set());
  const sendDone = (target?: Window | null) => {
    const ids = [...doneIds.current];
    [target, frameRef.current?.contentWindow, popupRef.current].forEach((w) => {
      try {
        if (w) w.postMessage({ source: 'ez-platform', type: 'done', ids }, '*');
      } catch {
        /* الصفحة أُغلقت */
      }
    });
  };
  const valid = true;


  const loadResults = () =>
    studentHubService
      .getMyHomeworkResults(uid)
      .then((r) => {
        // إن أُنهي الدرس لاحقًا يُحذف «غير المكتمل» القديم
        const full = new Set(r.filter((x) => !x.partial).map((x) => x.itemId));
        full.forEach((id) => doneIds.current.add(id));
        sendDone();
        r.filter((x) => x.partial && full.has(x.itemId)).forEach((x) => studentHubService.deletePartialResult(uid, x.itemId).catch(() => undefined));
        setResults(r.filter((x) => !(x.partial && full.has(x.itemId))));
      })
      .catch((err) => console.error('Error loading homework results:', err));

  // المعلم والمجموعة الحاليان من الملف مباشرة (قد تغيّرهما الإدارة بعد دخول الطالب)
  const freshIds = async (): Promise<{ groupId?: string; teacherId?: string }> => {
    try {
      const d: any = (await getDoc(doc(db, 'users', uid))).data() || {};
      return { groupId: d.groupId || undefined, teacherId: d.teacherId || undefined };
    } catch {
      return { groupId, teacherId };
    }
  };

  // النتائج التي لم تُحفظ تُخزَّن على الجهاز وتُعاد محاولة حفظها تلقائيًا
  const pendKey = `ez_hw_pending_${uid}`;
  const readPending = (): any[] => {
    try {
      return JSON.parse(localStorage.getItem(pendKey) || '[]');
    } catch {
      return [];
    }
  };
  const writePending = (a: any[]) => {
    try {
      if (a.length) localStorage.setItem(pendKey, JSON.stringify(a.slice(-10)));
      else localStorage.removeItem(pendKey);
    } catch {
      /* التخزين ممتلئ */
    }
  };

  const saveFinal = async (m: any) => {
    finished.current.add(String(m.id || m.title || '').slice(0, 80));
    const score = Number(m.score);
    const total = Number(m.total);
    const ex = m.extra && typeof m.extra === 'object' ? m.extra : {};
    const ids = await freshIds();
    const payload = {
      studentId: uid,
      studentName: name,
      groupId: ids.groupId,
      teacherId: ids.teacherId,
      kind: m.kind,
      itemId: String(m.id || m.title || ''),
      title: String(m.title || ''),
      score,
      total,
      sections: Array.isArray(ex.sections) ? ex.sections : undefined,
      strengths: Array.isArray(ex.strengths) ? ex.strengths : undefined,
      weaknesses: Array.isArray(ex.weaknesses) ? ex.weaknesses : undefined
    };
    const extra = { answers: Array.isArray(ex.answers) ? ex.answers : [], audio: Array.isArray(ex.audio) ? ex.audio : [] };
    try {
      await studentHubService.saveHomeworkResult(payload as any, extra);
    } catch (err: any) {
      // رفض الصلاحية غالبًا بسبب تغيّر المعلم: نحفظ بلا معلم، والإدارة تربطه تلقائيًا
      if (String(err?.code || '').includes('permission')) await studentHubService.saveHomeworkResult({ ...payload, teacherId: undefined } as any, extra);
      else throw err;
    }
    if (m.kind === 'lesson') await studentHubService.deletePartialResult(uid, String(m.id || m.title || '').slice(0, 80));
  };

  const flushPending = async () => {
    const list = readPending();
    if (!list.length) return;
    const left: any[] = [];
    for (const m of list) {
      if (doneIds.current.has(String(m.id || m.title || ''))) continue;
      try {
        await saveFinal(m);
      } catch {
        left.push(m);
      }
    }
    writePending(left);
    if (left.length < list.length) loadResults();
  };

  useEffect(() => {
    if (!preview) {
      loadResults();
      flushPending();
    }
  }, [uid, preview]);

  // إرسال اسم الطالب وتقدّمه المحفوظ إلى الموقع المضمّن
  const greet = async (target?: Window | null) => {
    const win = target || frameRef.current?.contentWindow;
    if (!win) return;
    if (!preview) try {
      const data = await studentHubService.getHomeworkProgress(uid);
      if (Object.keys(data).length) win.postMessage({ source: 'ez-platform', type: 'restore', data }, '*');
    } catch (err) {
      console.error('Error loading homework progress:', err);
    }
    win.postMessage({ source: 'ez-platform', type: 'student', name }, '*');
    sendDone(win);
  };

  useEffect(() => {
    if (!valid) return;
    const onMsg = async (ev: MessageEvent) => {
      const src = ev.source as Window | null;
      const fromFrame = !!frameRef.current && src === frameRef.current.contentWindow;
      const fromPopup = !!popupRef.current && src === popupRef.current;
      if (!fromFrame && !fromPopup) return;
      const m = ev.data || {};
      if (m.source !== 'ez-homework') return;
      if (m.type === 'ready') {
        greet(src);
      } else if (preview) {
        if (m.type === 'result') {
          setSavedNote(isAr ? `معاينة: ${m.title} (${m.score}/${m.total}) – لا تُحفظ نتائج الإدارة` : `Preview: ${m.title} (${m.score}/${m.total}) – not saved`);
          window.setTimeout(() => setSavedNote(''), 6000);
        }
      } else if (m.type === 'result' && ['lesson', 'test', 'exam'].includes(m.kind)) {
        const score = Number(m.score);
        const total = Number(m.total);
        if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return;
        const itemId = String(m.id || m.title || '');
        if (doneIds.current.has(itemId)) {
          // إعادة حل للتدريب: النتيجة تظهر للطالبة فقط ولا تُحفظ ولا تصل للمعلمة
          setSavedNote(isAr ? `إعادة للتدريب: ${m.title} (${score}/${total}). هذه النتيجة لكِ فقط، ونتيجتك الأولى هي المحفوظة.` : `Practice retake: ${m.title} (${score}/${total}). Only you see this; your first result is the one saved.`);
          window.setTimeout(() => setSavedNote(''), 7000);
          return;
        }
        doneIds.current.add(itemId);
        try {
          await saveFinal(m);
          setSaveError('');
          setSavedNote(isAr ? `تم حفظ نتيجتك: ${m.title} (${score}/${total})` : `Result saved: ${m.title} (${score}/${total})`);
          window.setTimeout(() => setSavedNote(''), 5000);
          loadResults();
        } catch (err: any) {
          console.error('Error saving homework result:', err);
          doneIds.current.delete(itemId);
          writePending([...readPending(), m]);
          setSaveError(
            (isAr ? 'لم تُحفظ النتيجة الآن، وستُعاد المحاولة تلقائيًا عند فتح الواجبات مرة أخرى. الخطأ: ' : 'Result not saved yet; it will retry automatically next time. Error: ') + (err?.code || err?.message || '')
          );
        }
      } else if (m.type === 'partial') {
        // حل غير مكتمل: يصل للمعلمة ويُحدَّث كلما تقدّمت الطالبة
        const score = Number(m.score);
        const total = Number(m.total);
        const done = Number(m.done);
        if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || !Number.isFinite(done)) return;
        const ex = m.extra && typeof m.extra === 'object' ? m.extra : {};
        if (doneIds.current.has(String(m.id || m.title || ''))) return;
        freshIds()
          .then((ids) => finished.current.has(String(m.id || m.title || '').slice(0, 80)) ? undefined : studentHubService.savePartialResult({
            studentId: uid,
            studentName: name,
            groupId: ids.groupId,
            teacherId: ids.teacherId,
            answers: Array.isArray(ex.answers) ? ex.answers : undefined,
            itemId: String(m.id || m.title || '').slice(0, 80),
            title: String(m.title || ''),
            score,
            total,
            done,
            sections: Array.isArray(ex.sections) ? ex.sections : undefined,
            strengths: Array.isArray(ex.strengths) ? ex.strengths : undefined,
            weaknesses: Array.isArray(ex.weaknesses) ? ex.weaknesses : undefined
          }))
          .then(() => loadResults())
          .catch((err) => console.error('Error saving partial result:', err));
      } else if (m.type === 'progress' && m.data && typeof m.data === 'object') {
        if (progressTimer.current) window.clearTimeout(progressTimer.current);
        progressTimer.current = window.setTimeout(() => {
          studentHubService.saveHomeworkProgress(uid, m.data).catch((err) => console.error(err));
        }, 1500);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [valid, uid, name, groupId, teacherId, preview]);

  if (!valid) return null;

  if (full) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#FAF8F5]">
        <div className="h-9 shrink-0 flex items-center justify-between gap-2 px-3 bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold">
          <span className="flex items-center gap-1.5 truncate">
            <BookOpenCheck className="w-4 h-4 shrink-0" />
            {saveError ? <span className="text-red-300">{saveError}</span> : savedNote || 'English Zone'}
          </span>
          {onBack && (
            <button onClick={onBack} className="px-2 py-1 rounded-lg border border-[#F3E5AB]/40 whitespace-nowrap">
              {isAr ? 'العودة إلى لوحتي' : 'Back to my dashboard'}
            </button>
          )}
        </div>
        <iframe
          ref={frameRef}
          src={homeworkUrl}
          title={isAr ? 'الواجبات والاختبارات' : 'Homework and tests'}
          className="w-full flex-1 block border-0"
          allow="autoplay; fullscreen; clipboard-write; microphone"
          allowFullScreen
          onLoad={() => window.setTimeout(() => greet(), 600)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="bg-white rounded-3xl p-4 sm:p-6 border border-[#D4AF37]/40 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif-luxury font-bold text-xl text-[#0E3A99] flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-[#D4AF37]" />
            {isAr ? 'الواجبات والاختبارات التفاعلية' : 'Interactive Homework & Tests'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={openFull}
              className="px-4 py-2 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              {isAr ? 'فتح في صفحة كاملة' : 'Open full page'}
            </button>
            <button
              onClick={() => setTall((t) => !t)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5"
            >
              {tall ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {tall ? (isAr ? 'تصغير' : 'Smaller') : isAr ? 'تكبير' : 'Bigger'}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-gray-500">
          {preview
            ? isAr
              ? 'معاينة للإدارة: {تستطيع|تستطيعين} تصفّح الواجبات والاختبارات وتجربتها كما يراها الطالب، ونتائجك هنا لا تُحفظ.'
              : 'Admin preview: browse and try everything as students see it; your answers are not saved.'
            : isAr
              ? 'نتائجك وتقدّمك تُحفظ تلقائيًا باسمك ويراها معلمك، سواء {حللت|حللتِ} هنا أو في الصفحة الكاملة ({أبقِ|أبقي} هذه الصفحة مفتوحة).'
              : 'Your results and progress are saved automatically for your teacher.'}
        </p>
        {savedNote && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {savedNote}
          </div>
        )}
        {saveError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">{saveError}</div>
        )}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-[#FAF8F5]">
          <iframe
            ref={frameRef}
            src={homeworkUrl}
            title={isAr ? 'الواجبات والاختبارات' : 'Homework and tests'}
            className="w-full block"
            style={{ height: tall ? '92vh' : '75vh' }}
            allow="autoplay; fullscreen; clipboard-write; microphone"
            allowFullScreen
            onLoad={() => window.setTimeout(() => greet(), 600)}
          />
        </div>
      </div>

      {!preview && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              { key: 'hw', ar: '📘 الواجبات', en: '📘 Homework', list: results.filter((r) => r.kind === 'lesson') },
              { key: 'ts', ar: '📝 الاختبارات', en: '📝 Tests', list: results.filter((r) => r.kind !== 'lesson') }
            ] as const
          ).map((half) => {
            const avg = half.list.length ? Math.round(half.list.reduce((a, r) => a + (r.percent || 0), 0) / half.list.length) : null;
            return (
              <div key={half.key} className={`bg-white rounded-3xl p-5 border shadow-sm space-y-3 ${half.key === 'hw' ? 'border-sky-200' : 'border-violet-200'}`}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-[#0E3A99]">{isAr ? half.ar : half.en}</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${half.key === 'hw' ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'}`}>
                    {half.list.length} {avg !== null ? `• ${isAr ? 'المعدل' : 'avg'} ${avg}%` : ''}
                  </span>
                </div>
                {half.list.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">{isAr ? 'لا توجد نتائج بعد.' : 'No results yet.'}</p>
                ) : (
                  <div className="space-y-2">
                    {half.list.slice(0, 20).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-gray-100 text-xs">
                        <div className="min-w-0">
                          <span className="font-bold text-[#0E3A99]">{r.title}</span>
                          {r.partial && (
                            <span className="ms-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              {isAr ? `غير مكتمل ${r.done}/${r.total}` : `unfinished ${r.done}/${r.total}`}
                            </span>
                          )}
                          <span className="text-gray-400">
                            {' '}
                            • {half.key === 'ts' ? `${kindLabel(r.kind, isAr)} • ` : ''}
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap ${
                            r.percent >= 70 ? 'bg-emerald-50 text-emerald-700' : r.percent >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {r.score}/{r.total} ({r.percent}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
