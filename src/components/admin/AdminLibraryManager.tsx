import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Download, BookOpen, Newspaper, Globe, GraduationCap, EyeOff, UserPlus, Pencil, Save, X, Image as ImageIcon } from 'lucide-react';
import { contentManagementService, LibraryBookMaterial, LibraryAudience, audienceOf } from '../../services/contentManagementService';
import { isSafeUrl, compressImage } from '../../services/studentHubService';
import { imgSrc } from '../../services/imageLinks';

interface Props {
  kind: 'library' | 'magazine';
  isAr: boolean;
  onNotice: (message: string) => void;
}

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';
const labelCls = 'block text-[11px] font-bold text-gray-600 mb-1';

const AUD: { id: LibraryAudience; ar: string; en: string; icon: any; on: string }[] = [
  { id: 'public', ar: 'للعامة', en: 'Public', icon: Globe, on: 'bg-emerald-600 text-white' },
  { id: 'members', ar: 'للمسجّلين مجانًا', en: 'Free members', icon: UserPlus, on: 'bg-[#D4AF37] text-[#0A192F]' },
  { id: 'students', ar: 'للطلاب فقط', en: 'Students only', icon: GraduationCap, on: 'bg-[#0A192F] text-[#F3E5AB]' },
  { id: 'hidden', ar: 'مخفية', en: 'Hidden', icon: EyeOff, on: 'bg-gray-500 text-white' }
];

// إدارة المكتبة أو مجلة الأكاديمية، مع اختيار من يرى كل مادة
export const AdminLibraryManager: React.FC<Props> = ({ kind, isAr, onNotice }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const mag = kind === 'magazine';
  const [items, setItems] = useState<LibraryBookMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const empty = {
    titleAr: '',
    titleEn: '',
    category: 'curriculum' as LibraryBookMaterial['category'],
    level: 'All Levels',
    downloadUrl: '',
    issue: '',
    description: '',
    coverUrl: '',
    audience: 'public' as LibraryAudience
  };
  const [f, setF] = useState(empty);
  // تعديل مادة موجودة: نفس النموذج يمتلئ ببياناتها
  const [editing, setEditing] = useState<LibraryBookMaterial | null>(null);
  const formRef = React.useRef<HTMLDivElement | null>(null);
  const startEdit = (b: LibraryBookMaterial) => {
    setEditing(b);
    setF({
      titleAr: b.titleAr || '',
      titleEn: b.titleEn || '',
      category: b.category,
      level: b.level || 'All Levels',
      downloadUrl: b.downloadUrl || '',
      issue: b.issue || '',
      description: b.description || '',
      coverUrl: b.coverUrl || '',
      audience: audienceOf(b)
    });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const cancelEdit = () => {
    setEditing(null);
    setF(empty);
  };

  const load = async () => {
    setLoading(true);
    const all = await contentManagementService.getLibraryMaterials();
    const mine = all
      .filter((b) => (mag ? b.category === 'magazine' : b.category !== 'magazine'))
      .sort((a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')));
    // المواد القديمة بلا audience: نحفظ لها القيمة المناسبة مرة واحدة
    const legacy = mine.filter((b) => !b.audience);
    for (const b of legacy) {
      try {
        await contentManagementService.saveLibraryMaterial({ ...b, audience: audienceOf(b) });
      } catch {
        // تبقى كما هي
      }
    }
    setItems(mine.map((b) => ({ ...b, audience: audienceOf(b) })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [kind]);

  const add = async () => {
    if (!f.titleAr.trim() && !f.titleEn.trim()) {
      onNotice(tr('Write a title first.', 'اكتبي العنوان أولًا.'));
      return;
    }
    for (const u of [f.downloadUrl, f.coverUrl.startsWith('data:image/') ? '' : f.coverUrl]) {
      if (u.trim() && !isSafeUrl(u)) {
        onNotice(tr('Links must start with https://', 'الروابط يجب أن تبدأ بـ https://'));
        return;
      }
    }
    setBusy(true);
    try {
      const item: LibraryBookMaterial = {
        id: editing ? editing.id : `${mag ? 'mag' : 'book'}_${Date.now()}`,
        titleAr: f.titleAr.trim() || f.titleEn.trim(),
        titleEn: f.titleEn.trim() || f.titleAr.trim(),
        category: mag ? 'magazine' : f.category,
        level: mag ? 'All Levels' : f.level,
        downloadUrl: f.downloadUrl.trim() || undefined,
        issue: mag ? f.issue.trim() || undefined : undefined,
        description: f.description.trim() || undefined,
        coverUrl: f.coverUrl.trim() || undefined,
        audience: f.audience,
        isPublic: f.audience !== 'hidden',
        addedAt: editing?.addedAt || new Date().toISOString()
      };
      await contentManagementService.saveLibraryMaterial(item);
      if (editing) {
        setItems((prev) => prev.map((x) => (x.id === item.id ? item : x)));
        setEditing(null);
        setF(empty);
        onNotice(tr('Changes saved.', 'تم حفظ التعديل.'));
      } else {
        setItems((prev) => [item, ...prev]);
        setF({ ...empty, audience: f.audience, category: f.category, level: f.level });
        onNotice(mag ? tr('Issue added.', 'تمت إضافة العدد.') : tr('Material added.', 'تمت إضافة المادة.'));
      }
    } catch (err: any) {
      onNotice(`${tr('Failed:', 'تعذّرت الإضافة:')} ${err?.code || ''}`);
    } finally {
      setBusy(false);
    }
  };

  const setAudience = async (b: LibraryBookMaterial, audience: LibraryAudience) => {
    const updated = { ...b, audience, isPublic: audience !== 'hidden' };
    setItems((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
    try {
      await contentManagementService.saveLibraryMaterial(updated);
    } catch (err: any) {
      setItems((prev) => prev.map((x) => (x.id === b.id ? b : x)));
      onNotice(`${tr('Failed:', 'تعذّر الحفظ:')} ${err?.code || ''}`);
    }
  };

  const remove = async (b: LibraryBookMaterial) => {
    if (!window.confirm(tr('Delete this item?', 'حذف هذه المادة؟'))) return;
    try {
      await contentManagementService.deleteLibraryMaterial(b.id);
      setItems((prev) => prev.filter((x) => x.id !== b.id));
    } catch (err: any) {
      onNotice(`${tr('Failed:', 'تعذّر الحذف:')} ${err?.code || ''}`);
    }
  };

  const catLabel = (c: string) =>
    ({ curriculum: tr('Curriculum', 'منهج'), reading: tr('Reading', 'قراءة'), grammar: tr('Grammar', 'قواعد'), vocabulary: tr('Vocabulary', 'مفردات') } as Record<string, string>)[c] || c;

  const audButtons = (value: LibraryAudience, onPick: (a: LibraryAudience) => void) => (
    <div className="flex flex-wrap gap-1">
      {AUD.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onPick(a.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${value === a.id ? `${a.on} border-transparent` : 'bg-white text-gray-500 border-gray-200'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {isAr ? a.ar : a.en}
          </button>
        );
      })}
    </div>
  );

  const Icon = mag ? Newspaper : BookOpen;

  return (
    <div className="space-y-6">
      <div ref={formRef} className={`p-5 rounded-2xl border space-y-3 scroll-mt-4 ${editing ? 'border-[#D4AF37] bg-[#FFF9E6]' : 'border-gray-200 bg-[#FAF8F5]'}`}>
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-xs text-[#0A192F] flex items-center gap-2">
            {editing ? <Pencil className="w-4 h-4 text-[#AA820A]" /> : <Icon className="w-4 h-4 text-[#AA820A]" />}
            {editing
              ? tr('Edit', 'تعديل') + ': ' + (isAr ? editing.titleAr : editing.titleEn)
              : mag
                ? tr('Add a magazine issue', 'إضافة عدد من مجلة الأكاديمية')
                : tr('Add library material', 'إضافة مادة إلى المكتبة')}
          </h4>
          {editing && (
            <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:text-gray-700" title={tr('Cancel', 'إلغاء')}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{tr('Title (AR)', 'العنوان (عربي)')}</label>
            <input dir="rtl" value={f.titleAr} onChange={(e) => setF({ ...f, titleAr: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{tr('Title (EN)', 'العنوان (إنجليزي)')}</label>
            <input dir="ltr" value={f.titleEn} onChange={(e) => setF({ ...f, titleEn: e.target.value })} className={inputCls} />
          </div>
          {mag ? (
            <>
              <div>
                <label className={labelCls}>{tr('Issue / month', 'رقم العدد أو الشهر')}</label>
                <input value={f.issue} onChange={(e) => setF({ ...f, issue: e.target.value })} placeholder={tr('Issue 1 – Nov 2026', 'العدد 1 – نوفمبر 2026')} className={inputCls} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>{tr('Category', 'التصنيف')}</label>
                <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as any })} className={inputCls}>
                  {['curriculum', 'reading', 'grammar', 'vocabulary'].map((c) => (
                    <option key={c} value={c}>{catLabel(c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{tr('Level', 'المستوى')}</label>
                <select value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })} className={inputCls}>
                  <option value="All Levels">{tr('All levels', 'كل المستويات')}</option>
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <label className={labelCls}>{tr('Short description (optional)', 'نبذة قصيرة (اختيارية)')}</label>
            <textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={inputCls} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className={labelCls}>{tr('Cover image (optional)', 'صورة الغلاف (اختيارية)')}</label>
            <div className="flex flex-wrap items-center gap-3">
              {f.coverUrl && <img src={imgSrc(f.coverUrl)} alt="" className="w-14 h-20 object-cover rounded-lg border border-gray-200" />}
              <label className="px-3 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold cursor-pointer flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                {f.coverUrl ? tr('Change image', 'تغيير الصورة') : tr('Upload image', 'رفع صورة')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    try {
                      const data = await compressImage(file, 900);
                      setF((cur) => ({ ...cur, coverUrl: data }));
                    } catch {
                      onNotice(tr('This image is too large.', 'الصورة كبيرة جدًا.'));
                    }
                  }}
                />
              </label>
              {f.coverUrl && (
                <button type="button" onClick={() => setF({ ...f, coverUrl: '' })} className="text-xs font-bold text-red-600">
                  {tr('Remove image', 'حذف الصورة')}
                </button>
              )}
            </div>
            {!f.coverUrl.startsWith('data:') && (
              <input
                dir="ltr"
                value={f.coverUrl}
                onChange={(e) => setF({ ...f, coverUrl: e.target.value })}
                placeholder={tr('...or paste an image link (Google Drive works)', '...أو الصقي رابط صورة (رابط Google Drive يعمل)')}
                className={inputCls}
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>{tr('PDF link', 'رابط الملف (PDF)')}</label>
            <input dir="ltr" value={f.downloadUrl} onChange={(e) => setF({ ...f, downloadUrl: e.target.value })} placeholder="https://drive.google.com/..." className={inputCls} />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="space-y-1">
            <span className={labelCls}>{tr('Who can see it?', 'من يراها؟')}</span>
            {audButtons(f.audience, (a) => setF({ ...f, audience: a }))}
          </div>
          <button onClick={add} disabled={busy} className="px-4 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
            {editing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editing ? tr('Save changes', 'حفظ التعديل') : mag ? tr('Add issue', 'إضافة العدد') : tr('Add material', 'إضافة المادة')}
          </button>
        </div>
        <p className="text-[11px] text-gray-500">
          {tr(
            'Public: everyone. Free members: anyone with a free account (and students). Students only: enrolled students. Hidden: only you.',
            '«للعامة»: يراها كل زائر. «للمسجّلين مجانًا»: تُفتح لمن ينشئ حسابًا مجانيًا (والطلاب أيضًا). «للطلاب فقط»: في لوحة الطالب المشترك. «مخفية»: لا يراها إلا أنتِ.'
          )}
        </p>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold text-gray-700">
          {mag ? tr(`Magazine issues (${items.length})`, `أعداد المجلة (${items.length})`) : tr(`Library (${items.length})`, `المكتبة (${items.length})`)}
        </span>
        {loading ? (
          <div className="p-6 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">{tr('Nothing added yet.', 'لم تُضف شيئًا بعد.')}</div>
        ) : (
          items.map((b) => (
            <div key={b.id} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {b.coverUrl ? (
                  <img src={imgSrc(b.coverUrl)} alt="" className="w-10 h-14 object-cover rounded-md border border-gray-200 shrink-0" />
                ) : (
                  <Icon className="w-5 h-5 text-[#AA820A] shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <span className="font-bold text-xs text-[#0A192F] block">{isAr ? b.titleAr : b.titleEn}</span>
                  <span className="text-[11px] text-gray-500">
                    {mag ? b.issue || '' : `${catLabel(b.category)} • ${b.level === 'All Levels' ? tr('All levels', 'كل المستويات') : b.level}`}
                  </span>
                  {b.description && <p className="text-[11px] text-gray-500 truncate">{b.description}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {audButtons(audienceOf(b), (a) => setAudience(b, a))}
                {b.downloadUrl && (
                  <a href={b.downloadUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-[#0A192F] rounded-lg" title={tr('Open', 'فتح')}>
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => startEdit(b)} className="p-2 text-gray-500 hover:text-[#0A192F] rounded-lg" title={tr('Edit', 'تعديل')}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(b)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg" title={tr('Delete', 'حذف')}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
