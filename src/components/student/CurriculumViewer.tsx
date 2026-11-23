import React, { useEffect, useState } from 'react';
import { BookOpen, Headphones, PlayCircle, X } from 'lucide-react';
import { curriculumService, CurriculumDoc, drivePreview } from '../../services/curriculumService';

interface Props {
  curriculumId: string;
  isAr: boolean;
}

// منهج الطالبة: مراحل ← وحدات ← كتاب وصوتيات وفيديوهات، تُفتح داخل الموقع
export const CurriculumViewer: React.FC<Props> = ({ curriculumId, isAr }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [cur, setCur] = useState<CurriculumDoc | null>(null);
  const [err, setErr] = useState('');
  const [stage, setStage] = useState(0);
  const [unit, setUnit] = useState<number | null>(null);
  const [player, setPlayerRaw] = useState<{ kind: 'audio' | 'video' | 'book'; id: string; label: string; num?: string } | null>(null);
  // الصوت يُشغَّل مباشرة في الموقع؛ إن تعذّر نعود لمشغّل Drive
  const [audioFail, setAudioFail] = useState(false);
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

  const st = cur.stages[stage];
  const u = unit !== null ? cur.units[String(unit)] : null;
  const lessons = u ? Array.from(new Set(u.videos.map((v) => v.lesson))) : [];

  return (
    <div className="space-y-5">
      <h3 className="font-bold text-lg text-[#0A192F]">{isAr ? cur.titleAr : cur.titleEn}</h3>

      <div className="grid grid-cols-3 gap-2">
        {cur.stages.map((s, i) => (
          <button
            key={s.key}
            onClick={() => { setStage(i); setUnit(null); setPlayer(null); }}
            className={`px-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${i === stage ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white text-[#0A192F] border-gray-200'}`}
          >
            {isAr ? s.titleAr : s.titleEn}
            <span className="block text-[10px] opacity-75 font-semibold">{tr('Units', 'الوحدات')} {s.units[0]}–{s.units[s.units.length - 1]}</span>
          </button>
        ))}
      </div>

      {player && (
        <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#0A192F] p-3 space-y-2">
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
          ) : (
          <iframe
            key={player.id}
            src={drivePreview(player.id)}
            className={`w-full rounded-xl bg-black ${player.kind === 'audio' ? 'h-40' : player.kind === 'video' ? 'aspect-video h-auto' : 'h-[75vh]'}`}
            allow="autoplay; fullscreen"
            allowFullScreen
            title={player.label}
          />
          )}
        </div>
      )}

      <button
        disabled={!st.bookId}
        onClick={() => st.bookId && setPlayer({ kind: 'book', id: st.bookId, label: `📖 ${tr('Student book', 'كتاب الطالب')} – ${isAr ? st.titleAr : st.titleEn}` })}
        className="w-full px-4 py-3 rounded-2xl bg-[#FFF8E1] border-2 border-[#D4AF37] text-[#0A192F] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <BookOpen className="w-5 h-5 text-[#AA820A]" />
        {st.bookId ? tr('Open the stage book', 'فتح كتاب المرحلة') : tr('The stage book will be added soon', 'كتاب المرحلة يُضاف قريبًا')}
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {st.units.map((n) => (
          <button
            key={n}
            onClick={() => setUnit(unit === n ? null : n)}
            className={`px-3 py-3 rounded-xl text-sm font-bold border transition-all ${unit === n ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37]' : 'bg-white text-[#0A192F] border-gray-200 hover:border-[#D4AF37]'}`}
          >
            {tr('Unit', 'الوحدة')} {n}
          </button>
        ))}
      </div>

      {u && (
        <div className="space-y-5 p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200">
          <div>
            <h4 className="font-bold text-sm text-[#0A192F] mb-2 flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-[#AA820A]" />
              {tr('Recordings (numbers as in the book)', 'التسجيلات الصوتية (بأرقامها كما في الكتاب)')}
            </h4>
            {u.tracks.length === 0 ? (
              <p className="text-xs text-gray-400">{tr('None.', 'لا يوجد.')}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5" dir="ltr">
                {u.tracks.map(([num, id]) => (
                  <button
                    key={id}
                    onClick={() => setPlayer({ kind: 'audio', id, num, label: `🎧 ${num}` })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${player?.id === id ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white border-gray-300 text-[#0A192F] hover:border-[#D4AF37]'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold text-sm text-[#0A192F] mb-2 flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-[#AA820A]" />
              {tr('Videos', 'الفيديوهات')}
            </h4>
            {lessons.length === 0 ? (
              <p className="text-xs text-gray-400">{tr('No videos for this unit.', 'لا توجد فيديوهات لهذه الوحدة.')}</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((l) => {
                  const vs = u.videos.filter((v) => v.lesson === l);
                  return (
                    <div key={l} className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0A192F] min-w-[90px]">{isAr ? vs[0].lessonAr : l}</span>
                      {vs.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setPlayer({ kind: 'video', id: v.id, label: `🎬 ${isAr ? v.lessonAr : v.lesson} – ${isAr ? v.ar : v.en}` })}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${player?.id === v.id ? 'bg-[#0A192F] text-[#F3E5AB] border-[#0A192F]' : 'bg-white border-gray-300 text-[#0A192F] hover:border-[#D4AF37]'}`}
                        >
                          ▶ {isAr ? v.ar : v.en}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
