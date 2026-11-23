import React, { useEffect, useState } from 'react';
import { BookOpen, Download, Save } from 'lucide-react';
import { curriculumService, CurriculumDoc, CURRICULA, driveId } from '../../services/curriculumService';

interface Props {
  isAr: boolean;
  onNotice: (m: string) => void;
}

// المناهج: تثبيت ملفات المنهج (الصوتيات والفيديوهات) وروابط كتب المراحل
export const AdminCurricula: React.FC<Props> = ({ isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [doc, setDoc] = useState<CurriculumDoc | null>(null);
  const [books, setBooks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const cid = CURRICULA[0].id;

  const load = async () => {
    try {
      const d = await curriculumService.get(cid);
      setDoc(d);
      setBooks(Object.fromEntries((d?.stages || []).map((s) => [s.key, s.bookId ? `https://drive.google.com/file/d/${s.bookId}/view` : ''])));
    } catch (e: any) {
      onNotice(tr('Could not load: ', 'تعذر التحميل: ') + (e?.code || ''));
    }
  };
  useEffect(() => {
    load();
  }, []);

  // تثبيت/تحديث ملفات المنهج من البيانات المرفقة مع الموقع (مع الإبقاء على روابط الكتب)
  const install = async () => {
    setBusy(true);
    try {
      const { EF_A1_SEED } = await import('../../data/curricula/efA1Seed');
      const seed: CurriculumDoc = JSON.parse(JSON.stringify(EF_A1_SEED));
      seed.stages = seed.stages.map((s) => ({ ...s, bookId: doc?.stages.find((x) => x.key === s.key)?.bookId || undefined }));
      await curriculumService.save(seed);
      onNotice(tr('Curriculum installed.', 'تم تثبيت المنهج.'));
      await load();
    } catch (e: any) {
      onNotice(tr('Failed: ', 'تعذر: ') + (e?.code || e?.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const saveBooks = async () => {
    if (!doc) return;
    for (const s of doc.stages) {
      const v = (books[s.key] || '').trim();
      if (v && !driveId(v)) {
        onNotice(tr(`The book link of ${s.titleEn} is not a Drive file link.`, `رابط كتاب ${s.titleAr} ليس رابط ملف من Drive.`));
        return;
      }
    }
    setBusy(true);
    try {
      await curriculumService.save({ ...doc, stages: doc.stages.map((s) => ({ ...s, bookId: driveId(books[s.key] || '') || undefined })) });
      onNotice(tr('Books saved.', 'تم حفظ الكتب.'));
      await load();
    } catch (e: any) {
      onNotice(tr('Failed: ', 'تعذر: ') + (e?.code || e?.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const tracks = doc ? Object.values(doc.units).reduce((a, u) => a + u.tracks.length, 0) : 0;
  const videos = doc ? Object.values(doc.units).reduce((a, u) => a + u.videos.length, 0) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div>
        <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#D4AF37]" />
          {tr('Curricula', 'المناهج')}
        </h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {tr(
            'The curriculum appears only to students you assign it to (Students > manage > Curriculum).',
            'يظهر المنهج فقط للطالبات اللواتي تختارينه لهن من: الطلاب ← إدارة الطالبة ← المنهج.'
          )}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/40 space-y-3">
        <h3 className="font-bold text-sm text-[#0A192F]">{isAr ? CURRICULA[0].titleAr : CURRICULA[0].titleEn}</h3>
        <p className="text-xs text-gray-600">
          {doc
            ? tr(`Installed: ${tracks} recordings, ${videos} videos.`, `مثبّت: ${tracks} تسجيلًا صوتيًا و${videos} فيديو.`)
            : tr('Not installed yet.', 'غير مثبّت بعد.')}
        </p>
        <button onClick={install} disabled={busy} className="px-4 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Download className="w-4 h-4" />
          {doc ? tr('Update recordings & videos', 'تحديث الصوتيات والفيديوهات') : tr('Install the curriculum', 'تثبيت المنهج')}
        </button>
      </div>

      {doc && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[#0A192F]">{tr('Stage books (Drive links)', 'كتب المراحل (روابط Drive)')}</h3>
          {doc.stages.map((s) => (
            <div key={s.key}>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {isAr ? `${s.titleAr} (الوحدات ${s.units[0]}–${s.units[s.units.length - 1]})` : `${s.titleEn} (Units ${s.units[0]}–${s.units[s.units.length - 1]})`}
              </label>
              <input
                dir="ltr"
                value={books[s.key] || ''}
                onChange={(e) => setBooks((b) => ({ ...b, [s.key]: e.target.value }))}
                placeholder="https://drive.google.com/file/d/…/view"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
              />
            </div>
          ))}
          <button onClick={saveBooks} disabled={busy} className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0A192F] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {tr('Save books', 'حفظ الكتب')}
          </button>
        </div>
      )}
    </div>
  );
};
