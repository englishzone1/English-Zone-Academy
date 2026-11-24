import React, { useEffect, useState } from 'react';
import { BookOpen, Headphones, Lock, PlayCircle, X } from 'lucide-react';
import { BookReader } from './BookReader';
import { curriculumService, CurriculumDoc, drivePreview, CURRICULUM_BOOKS, CURRICULUM_EXTRAS, CurriculumExtra } from '../../services/curriculumService';

interface Props {
  curriculumId: string;
  // مرحلة الطالبة الحالية (1..3): ما بعدها يظهر مقفلًا
  stage?: number;
  isAr: boolean;
}

// منهج الطالبة: مراحل ← وحدات ← كتاب وصوتيات وفيديوهات، تُفتح داخل الموقع
export const CurriculumViewer: React.FC<Props> = ({ curriculumId, stage: myStage = 1, isAr }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [cur, setCur] = useState<CurriculumDoc | null>(null);
  const [err, setErr] = useState('');
  const [stage, setStage] = useState(Math.max(0, myStage - 1));
  const [unit, setUnit] = useState<number | null>(null);
  const [player, setPlayerRaw] = useState<{ kind: 'audio' | 'video' | 'book'; id: string; label: string; num?: string } | null>(null);
  // الصوت يُشغَّل مباشرة في الموقع؛ إن تعذّر نعود لمشغّل Drive
  const [audioFail, setAudioFail] = useState(false);
  const [reading, setReading] = useState<'stage' | 'appendix' | null>(null);
  const [extra, setExtra] = useState<CurriculumExtra | null>(null);
  const setPlayer = (p: typeof player) => {
    setAudioFail(false);
    setPlayerRaw(p);
  };

  useEffect(() => {
    curriculumService
      .get(curriculumId)
      .then((d) => (d ? setCur(d) : setErr('not-installed')))
      .catch((e) => setErr(e?.code || 'error'));
  }, [curriculumId]);

  if (err) return <p className="text-sm text-gray-500 text-center py-6">{tr('The curriculum is not available yet.', 'المنهج غير متاح بعد.')}</p>;
  if (!cur) return <p className="text-sm text-gray-400 text-center py-6">{tr('Loading…', 'جارٍ التحميل…')}</p>;

  const st = cur.stages[Math.min(stage, cur.stages.length - 1)];
  const locked = stage + 1 > myStage;
  const books = CURRICULUM_BOOKS[cur.id];
  const book = books?.stages[stage];
  const u = unit !== null ? cur.units[String(unit)] : null;

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-[#061638]">{isAr ? cur.titleAr : cur.titleEn}</h3>

      {(CURRICULUM_EXTRAS[cur.id] || []).length > 0 && (
        <div className="p-4 rounded-2xl bg-[#F4F8F9] border border-[#0e4d5c]/20 space-y-3">
          <p className="font-bold text-sm text-[#061638]">📚 {tr('Supplements and extra practice', 'ملحقات وتمارين إضافية')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CURRICULUM_EXTRAS[cur.id].map((x) => (
              <button
                key={x.key}
                onClick={() => { setPlayer(null); setReading(null); setExtra(extra?.key === x.key ? null : x); }}
                className={`text-start px-3 py-2.5 rounded-xl border transition-all ${extra?.key === x.key ? 'bg-[#061638] text-[#F3E5AB] border-[#061638]' : 'bg-white text-[#061638] border-gray-200 hover:border-[#D4AF37]'}`}
              >
                <span className="block text-xs font-bold">{isAr ? x.titleAr : x.titleEn}</span>
                <span className="block text-[10px] opacity-75">{isAr ? x.descAr : x.descEn}</span>
              </button>
            ))}
          </div>
          {extra && (
            <BookReader
              key={extra.key}
              folder={extra.folder}
              count={extra.count}
              pdf={extra.pdf}
              title={isAr ? extra.titleAr : extra.titleEn}
              isAr={isAr}
              onClose={() => setExtra(null)}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {cur.stages.map((s, i) => (
          <button
            key={s.key}
            onClick={() => { setStage(i); setUnit(null); setPlayer(null); setReading(null); }}
            className={`px-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${i === stage ? 'bg-[#061638] text-[#F3E5AB] border-[#061638]' : 'bg-white text-[#061638] border-gray-200'}`}
          >
            {i + 1 > myStage && <Lock className="w-3.5 h-3.5 inline-block mb-0.5 me-1 opacity-80" />}
            {isAr ? s.titleAr : s.titleEn}
            <span className="block text-[10px] opacity-75 font-semibold">{tr('Units', 'الوحدات')} {s.units[0]}–{s.units[s.units.length - 1]}</span>
          </button>
        ))}
      </div>

      {player && (
        <div id="cur-player" className="rounded-2xl border-2 border-[#D4AF37] bg-[#061638] p-3 space-y-2">
          <div className="flex items-center justify-between text-[#F3E5AB] text-xs font-bold">
            <span>{player.label}</span>
            <button onClick={() => setPlayer(null)} title={tr('Close', 'إغلاق')}><X className="w-4 h-4" /></button>
          </div>
          {player.kind === 'audio' && !audioFail ? (
            <audio
              key={player.id}
              controls
              autoPlay
              preload="auto"
              src={`/curriculum/${cur.id}/${player.num}.mp3`}
              onError={() => setAudioFail(true)}
              className="w-full"
            />
          ) : player.kind === 'video' && !audioFail ? (
            <video
              key={player.id}
              controls
              autoPlay
              playsInline
              preload="metadata"
              src={`https://drive.usercontent.google.com/download?id=${player.id}&export=download&confirm=t`}
              onError={() => setAudioFail(true)}
              className="w-full rounded-xl bg-black aspect-video"
            />
          ) : (
          <iframe
            id="cur-frame"
            key={player.id}
            src={drivePreview(player.id)}
            className={`w-full rounded-xl bg-black ${player.kind === 'audio' ? 'h-40' : player.kind === 'video' ? 'aspect-[4/5] sm:aspect-[4/3] max-h-[80vh]' : 'h-[75vh]'}`}
            allow="autoplay; fullscreen"
            allowFullScreen
            title={player.label}
          />
          )}
          {/* روابط Drive: للفتح أو التحميل */}
          <div className="flex flex-wrap gap-2 pt-1">
            {player.kind !== 'audio' && (
              <button
                onClick={() => {
                  const el: any = document.getElementById('cur-frame') || document.querySelector('#cur-player video');
                  if (el?.requestFullscreen) el.requestFullscreen().catch(() => undefined);
                  else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
                }}
                className="px-3 py-1.5 rounded-lg bg-white text-[#061638] text-[11px] font-bold"
              >
                ⛶ {tr('Full screen', 'ملء الشاشة')}
              </button>
            )}
            <a
              href={`https://drive.google.com/file/d/${player.id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-[#D4AF37]/60 text-[#F3E5AB] text-[11px] font-bold"
            >
              {tr('Open in Google Drive', 'فتح في Google Drive')} ↗
            </a>
            <a
              href={`https://drive.usercontent.google.com/download?id=${player.id}&export=download&confirm=t`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#061638] text-[11px] font-bold"
            >
              ⬇ {tr('Download', 'تحميل الملف')}
            </a>
          </div>
        </div>
      )}

      {locked ? (
        <div className="p-6 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 text-center space-y-2">
          <Lock className="w-8 h-8 mx-auto text-gray-400" />
          <p className="font-bold text-[#061638]">{tr('This stage is locked', 'هذه المرحلة مقفلة')}</p>
          <p className="text-xs text-gray-500">{tr('It opens when you move up to it with your teacher.', 'تُفتح {لك|لكِ} عندما {تنتقل|تنتقلين} إليها مع {معلمك|معلمتك}.')}</p>
        </div>
      ) : (
      <>
      {book ? (
        reading ? (
          <BookReader
            key={reading + stage}
            folder={reading === 'stage' ? book.folder : books!.appendix.folder}
            count={reading === 'stage' ? book.count : books!.appendix.count}
            pdf={reading === 'stage' ? book.pdf : books!.appendix.pdf}
            title={reading === 'stage' ? `${tr('Student book', 'كتاب الطالب')} – ${isAr ? st.titleAr : st.titleEn}` : tr('Book appendix', 'ملحق الكتاب')}
            isAr={isAr}
            onClose={() => setReading(null)}
          />
        ) : (
        <div className="p-4 rounded-2xl bg-[#FFF8E1] border-2 border-[#D4AF37] space-y-3">
          <p className="font-bold text-sm text-[#061638] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#AA820A]" />
            {tr('Student book', 'كتاب الطالب')} – {isAr ? st.titleAr : st.titleEn}
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setPlayer(null); setExtra(null); setReading('stage'); }} className="px-4 py-2 rounded-xl bg-[#061638] text-[#F3E5AB] text-xs font-bold">
              📖 {tr('Open the stage book', 'فتح كتاب المرحلة')}
            </button>
            {books?.appendix && (
              <button onClick={() => { setPlayer(null); setReading('appendix'); }} className="px-4 py-2 rounded-xl bg-white border border-[#D4AF37] text-[#061638] text-xs font-bold">
                📎 {tr('Book appendix', 'ملحق الكتاب')}
              </button>
            )}
          </div>
        </div>
        )
      ) : (
      <button
        disabled={!st.bookId}
        onClick={() => st.bookId && setPlayer({ kind: 'book', id: st.bookId, label: `📖 ${tr('Student book', 'كتاب الطالب')} – ${isAr ? st.titleAr : st.titleEn}` })}
        className="w-full px-4 py-3 rounded-2xl bg-[#FFF8E1] border-2 border-[#D4AF37] text-[#061638] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <BookOpen className="w-5 h-5 text-[#AA820A]" />
        {st.bookId ? tr('Open the stage book', 'فتح كتاب المرحلة') : tr('The stage book will be added soon', 'كتاب المرحلة يُضاف قريبًا')}
      </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {st.units.map((n) => (
          <button
            key={n}
            onClick={() => setUnit(unit === n ? null : n)}
            className={`px-3 py-3 rounded-xl text-sm font-bold border transition-all ${unit === n ? 'bg-[#D4AF37] text-[#061638] border-[#D4AF37]' : 'bg-white text-[#061638] border-gray-200 hover:border-[#D4AF37]'}`}
          >
            {tr('Unit', 'الوحدة')} {n}
          </button>
        ))}
      </div>

      {u && (
        <div className="space-y-4">
          {(u.lessons || []).map((l) => (
            <div key={l.key} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
              <h4 className="font-bold text-[#061638] flex flex-wrap items-baseline gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#061638] text-[#F3E5AB] text-xs">{isAr ? l.codeAr : l.code}</span>
                <span className="text-sm" dir="ltr">{l.title}</span>
              </h4>
              {l.tracks.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-[#AA820A]" />
                    {tr('Recordings', 'التسجيلات الصوتية')}
                  </p>
                  <div className="flex flex-wrap gap-1.5" dir="ltr">
                    {l.tracks.map(([num, id]) => (
                      <button
                        key={id}
                        onClick={() => setPlayer({ kind: 'audio', id, num, label: `🎧 ${num}` })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${player?.id === id ? 'bg-[#061638] text-[#F3E5AB] border-[#061638]' : 'bg-white border-gray-300 text-[#061638] hover:border-[#D4AF37]'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {l.videos.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5 text-[#AA820A]" />
                    {tr('Videos', 'الفيديوهات')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {l.videos.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setPlayer({ kind: 'video', id: v.id, label: `🎬 ${isAr ? l.codeAr : l.code} – ${isAr ? v.ar : v.en}` })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${player?.id === v.id ? 'bg-[#061638] text-[#F3E5AB] border-[#061638]' : 'bg-white border-gray-300 text-[#061638] hover:border-[#D4AF37]'}`}
                      >
                        ▶ {isAr ? v.ar : v.en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {l.tracks.length === 0 && l.videos.length === 0 && (
                <p className="text-xs text-gray-400">{tr('No recordings or videos for this lesson.', 'لا توجد تسجيلات أو فيديوهات لهذا الدرس.')}</p>
              )}
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
};
