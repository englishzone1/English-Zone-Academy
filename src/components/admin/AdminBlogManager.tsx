import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2, Eye, EyeOff, Pencil, X, Download, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { contentManagementService, BlogPostRecord } from '../../services/contentManagementService';
import { compressImage } from '../../services/studentHubService';
import { imgSrc } from '../../services/imageLinks';

interface Props {
  onNotice: (message: string) => void;
}

type Draft = {
  id?: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  categoryAr: string;
  categoryEn: string;
  readTime: string;
  publishDate: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt?: string;
};

const EMPTY: Draft = {
  titleAr: '',
  titleEn: '',
  excerptAr: '',
  excerptEn: '',
  contentAr: '',
  contentEn: '',
  categoryAr: '',
  categoryEn: '',
  readTime: '',
  publishDate: new Date().toISOString().slice(0, 10),
  imageUrl: '',
  isPublished: false
};

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white';
const labelCls = 'block text-[11px] font-bold text-gray-600 mb-1';
const primaryBtn =
  'px-4 py-2 rounded-xl text-xs font-bold bg-[#0E3A99] text-[#F3E5AB] hover:bg-[#1E55C0] flex items-center gap-1.5 disabled:opacity-50';

export const AdminBlogManager: React.FC<Props> = ({ onNotice }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const fail = (err: any, ar: string, en: string) => {
    console.error(err);
    onNotice(`${tr(en, ar)} ${err?.code || err?.message || ''}`);
  };

  const load = async () => {
    setLoading(true);
    try {
      setPosts(await contentManagementService.getAllBlogPosts());
    } catch (err) {
      fail(err, 'تعذر تحميل المقالات:', 'Could not load posts:');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.titleAr.trim() && !draft.titleEn.trim()) {
      onNotice(tr('Write a title first.', 'اكتب عنوان المقال أولًا.'));
      return;
    }
    setSaving(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(draft).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
      ) as Draft;
      await contentManagementService.saveBlogPost(clean as any);
      onNotice(tr('Post saved.', 'تم حفظ المقال.'));
      setDraft(null);
      await load();
    } catch (err) {
      fail(err, 'تعذر الحفظ:', 'Save failed:');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (p: BlogPostRecord) => {
    try {
      await contentManagementService.setBlogPostPublished(p.id, !p.isPublished);
      onNotice(p.isPublished ? tr('Post hidden.', 'تم إخفاء المقال.') : tr('Post published.', 'تم نشر المقال.'));
      await load();
    } catch (err) {
      fail(err, 'تعذر التغيير:', 'Could not change:');
    }
  };

  const remove = async (p: BlogPostRecord) => {
    if (!window.confirm(tr('Delete this post permanently?', 'حذف هذا المقال نهائيًا؟'))) return;
    try {
      await contentManagementService.deleteBlogPost(p.id);
      onNotice(tr('Post deleted.', 'تم حذف المقال.'));
      await load();
    } catch (err) {
      fail(err, 'تعذر الحذف:', 'Could not delete:');
    }
  };

  const importOld = async () => {
    try {
      await contentManagementService.seedBlogFromDefaults();
      onNotice(tr('The 3 older posts were imported.', 'تم استيراد المقالات الثلاث القديمة.'));
      await load();
    } catch (err) {
      fail(err, 'تعذر الاستيراد:', 'Import failed:');
    }
  };

  const field = (key: keyof Draft, labelAr: string, labelEn: string, opts: { rtl?: boolean; rows?: number; type?: string } = {}) => (
    <div>
      <label className={labelCls}>{tr(labelEn, labelAr)}</label>
      {opts.rows ? (
        <textarea
          rows={opts.rows}
          dir={opts.rtl ? 'rtl' : 'ltr'}
          value={String(draft?.[key] ?? '')}
          onChange={(e) => set({ [key]: e.target.value } as any)}
          className={inputCls}
        />
      ) : (
        <input
          type={opts.type || 'text'}
          dir={opts.rtl ? 'rtl' : 'ltr'}
          value={String(draft?.[key] ?? '')}
          onChange={(e) => set({ [key]: e.target.value } as any)}
          className={inputCls}
        />
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-luxury font-bold text-xl text-[#0E3A99]">{tr('Blog', 'المدونة')}</h2>
          <p className="text-xs text-gray-500">
            {tr(
              'Only published posts appear on the website.',
              'تظهر في الموقع المقالات المنشورة فقط.'
            )}
          </p>
        </div>
        {!draft && (
          <button onClick={() => setDraft({ ...EMPTY })} className={primaryBtn}>
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>{tr('New post', 'مقال جديد')}</span>
          </button>
        )}
      </div>

      {draft && (
        <div id="ez-blog-form" className="p-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F5] space-y-4 scroll-mt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#0E3A99]">
              {draft.id ? tr('Edit post', 'تعديل المقال') : tr('New post', 'مقال جديد')}
            </h4>
            <button onClick={() => setDraft(null)} className="p-1.5 text-gray-400 hover:text-gray-700" title={tr('Close', 'إغلاق')}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {field('titleAr', 'العنوان بالعربية', 'Title (Arabic)', { rtl: true })}
            {field('titleEn', 'العنوان بالإنجليزية', 'Title (English)')}
            {field('excerptAr', 'ملخص قصير بالعربية', 'Short summary (Arabic)', { rtl: true, rows: 2 })}
            {field('excerptEn', 'ملخص قصير بالإنجليزية', 'Short summary (English)', { rows: 2 })}
            {field('contentAr', 'نص المقال بالعربية', 'Full text (Arabic)', { rtl: true, rows: 8 })}
            {field('contentEn', 'نص المقال بالإنجليزية', 'Full text (English)', { rows: 8 })}
            {field('categoryAr', 'التصنيف بالعربية', 'Category (Arabic)', { rtl: true })}
            {field('categoryEn', 'التصنيف بالإنجليزية', 'Category (English)')}
            {field('readTime', 'مدة القراءة (مثال: 5 دقائق)', 'Read time (e.g. 5 min)')}
            {field('publishDate', 'تاريخ النشر', 'Publish date', { type: 'date' })}
            <div className="sm:col-span-2 space-y-2">
              <label className={labelCls}>{tr('Post image (optional)', 'صورة المقال (اختياري)')}</label>
              <div className="flex flex-wrap items-center gap-3">
                {draft.imageUrl && <img src={imgSrc(draft.imageUrl)} alt="" className="h-20 rounded-xl border border-gray-200 object-cover" />}
                <label className="px-3 py-2 rounded-xl bg-[#0E3A99] text-[#F3E5AB] text-xs font-bold cursor-pointer flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                  {draft.imageUrl ? tr('Change image', 'تغيير الصورة') : tr('Upload image', 'رفع صورة')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        set({ imageUrl: await compressImage(f, 1200) });
                      } catch {
                        onNotice(tr('This image is too large.', 'الصورة كبيرة جدًا.'));
                      }
                    }}
                  />
                </label>
                {draft.imageUrl && (
                  <button onClick={() => set({ imageUrl: '' })} className="text-xs font-bold text-red-600">
                    {tr('Remove image', 'حذف الصورة')}
                  </button>
                )}
              </div>
              {!draft.imageUrl.startsWith('data:') && (
                <input
                  type="text"
                  dir="ltr"
                  value={draft.imageUrl}
                  onChange={(e) => set({ imageUrl: e.target.value })}
                  placeholder={tr('...or paste an image link', '...أو الصق رابط صورة')}
                  className={inputCls}
                />
              )}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-[#0E3A99]">
            <input type="checkbox" checked={draft.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} />
            <span>{tr('Publish on the website', 'منشور في الموقع')}</span>
          </label>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className={primaryBtn}>
              <Save className="w-4 h-4 text-[#D4AF37]" />
              <span>{saving ? tr('Saving...', 'جارٍ الحفظ...') : tr('Save post', 'حفظ المقال')}</span>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">{tr('Loading...', 'جارٍ التحميل...')}</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl space-y-3">
          <p>{tr('No posts yet.', 'لا توجد مقالات بعد.')}</p>
          <button onClick={importOld} className="px-4 py-2 rounded-xl text-xs font-bold border border-[#D4AF37] text-[#0E3A99] inline-flex items-center gap-1.5">
            <Download className="w-4 h-4 text-[#AA820A]" />
            <span>{tr('Import the 3 older posts from the site', 'استيراد المقالات الثلاث القديمة من الموقع')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-[#0E3A99] block">{(isAr ? p.titleAr : p.titleEn) || p.titleAr || p.titleEn}</span>
                <span className="text-[11px] text-gray-500">
                  {[isAr ? p.categoryAr : p.categoryEn, p.publishDate].filter(Boolean).join(' • ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    p.isPublished ? 'bg-[#25D366]/20 text-[#128C7E]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{p.isPublished ? tr('Published', 'منشور') : tr('Hidden', 'مخفي')}</span>
                </button>
                <button
                  onClick={() => {
                    setDraft({ ...EMPTY, ...(p as any) });
                    setTimeout(() => document.getElementById('ez-blog-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                  }}
                  className="p-2 text-gray-500 hover:text-[#0E3A99] rounded-lg"
                  title={tr('Edit', 'تعديل')}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(p)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg" title={tr('Delete', 'حذف')}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
