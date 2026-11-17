import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { studentHubService, HomeworkResult } from '../../services/studentHubService';

interface Props {
  isAr: boolean;
  uid: string;
  name: string;
  groupId?: string;
  teacherId?: string;
}

const kindLabel = (k: string, isAr: boolean) =>
  k === 'exam' ? (isAr ? 'اختبار نهائي' : 'Final exam') : k === 'test' ? (isAr ? 'اختبار وحدة' : 'Unit test') : isAr ? 'درس' : 'Lesson';

// منصة الواجبات والاختبارات التفاعلية داخل لوحة الطالب.
// الموقع المضمّن يرسل النتائج والتقدّم، فتُحفظ هنا باسم الطالب وتظهر للإدارة والمعلم.
export const HomeworkPlatform: React.FC<Props> = ({ isAr, uid, name, groupId, teacherId }) => {
  // موقع الواجبات صار جزءًا من المنصة نفسها، ولا يُفتح إلا من هنا
  const homeworkUrl = '/homework/index.html';
  const [tall, setTall] = useState(false);
  const [results, setResults] = useState<HomeworkResult[]>([]);
  const [savedNote, setSavedNote] = useState('');
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const progressTimer = useRef<number | null>(null);
  const valid = true;

  const loadResults = () =>
    studentHubService
      .getMyHomeworkResults(uid)
      .then(setResults)
      .catch((err) => console.error('Error loading homework results:', err));

  useEffect(() => {
    loadResults();
  }, [uid]);

  // إرسال اسم الطالب وتقدّمه المحفوظ إلى الموقع المضمّن
  const greet = async () => {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    try {
      const data = await studentHubService.getHomeworkProgress(uid);
      if (Object.keys(data).length) win.postMessage({ source: 'ez-platform', type: 'restore', data }, '*');
    } catch (err) {
      console.error('Error loading homework progress:', err);
    }
    win.postMessage({ source: 'ez-platform', type: 'student', name }, '*');
  };

  useEffect(() => {
    if (!valid) return;
    const onMsg = async (ev: MessageEvent) => {
      if (!frameRef.current || ev.source !== frameRef.current.contentWindow) return;
      const m = ev.data || {};
      if (m.source !== 'ez-homework') return;
      if (m.type === 'ready') {
        greet();
      } else if (m.type === 'result' && ['lesson', 'test', 'exam'].includes(m.kind)) {
        const score = Number(m.score);
        const total = Number(m.total);
        if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return;
        try {
          await studentHubService.saveHomeworkResult({
            studentId: uid,
            studentName: name,
            groupId,
            teacherId,
            kind: m.kind,
            itemId: String(m.id || m.title || ''),
            title: String(m.title || ''),
            score,
            total
          });
          setSavedNote(isAr ? `تم حفظ نتيجتك: ${m.title} (${score}/${total})` : `Result saved: ${m.title} (${score}/${total})`);
          window.setTimeout(() => setSavedNote(''), 5000);
          loadResults();
        } catch (err) {
          console.error('Error saving homework result:', err);
        }
      } else if (m.type === 'progress' && m.data && typeof m.data === 'object') {
        if (progressTimer.current) window.clearTimeout(progressTimer.current);
        progressTimer.current = window.setTimeout(() => {
          studentHubService.saveHomeworkProgress(uid, m.data).catch((err) => console.error(err));
        }, 1500);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [valid, uid, name, groupId, teacherId]);

  if (!valid) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#D4AF37]/40 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F] flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-[#D4AF37]" />
            {isAr ? 'الواجبات والاختبارات التفاعلية' : 'Interactive Homework & Tests'}
          </h2>
          <div className="flex items-center gap-2">
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
          {isAr
            ? 'نتائجك وتقدّمك تُحفظ تلقائيًا باسمك ويراها معلمك.'
            : 'Your results and progress are saved automatically for your teacher.'}
        </p>
        {savedNote && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {savedNote}
          </div>
        )}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-[#FAF8F5]">
          <iframe
            ref={frameRef}
            src={homeworkUrl}
            title={isAr ? 'الواجبات والاختبارات' : 'Homework and tests'}
            className="w-full block"
            style={{ height: tall ? '92vh' : '75vh' }}
            allow="autoplay; fullscreen; clipboard-write"
            allowFullScreen
            onLoad={() => window.setTimeout(greet, 600)}
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-[#0A192F]">{isAr ? 'نتائجي في الواجبات التفاعلية' : 'My interactive results'}</h3>
          <div className="space-y-2">
            {results.slice(0, 20).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-gray-100 text-xs">
                <div>
                  <span className="font-bold text-[#0A192F]">{r.title}</span>
                  <span className="text-gray-400"> • {kindLabel(r.kind, isAr)} • {new Date(r.createdAt).toLocaleDateString()}</span>
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
        </div>
      )}
    </div>
  );
};
