import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  ATTACHED_REVIEW_ASSET_PATHS,
  feedbackReviewsService,
  optimizeFeedbackImage
} from '../../services/feedbackReviewsService';
import { FeedbackScreenshot, ReviewCategory } from '../../types/reviews';
import { PrivacyMaskModal } from './PrivacyMaskModal';
import {
  Upload,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Images,
  Sparkles,
  CheckCircle2,
  FolderInput
} from 'lucide-react';

interface AdminReviewsManagerProps {
  onNotice?: (message: string) => void;
}

export const AdminReviewsManager: React.FC<AdminReviewsManagerProps> = ({ onNotice }) => {
  const { language, dir } = useLanguage();
  const { user } = useAuth();
  const isArabic = language === 'ar';

  const [items, setItems] = useState<FeedbackScreenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingMaskItem, setEditingMaskItem] = useState<FeedbackScreenshot | null>(null);
  const [localEdits, setLocalEdits] = useState<
    Record<string, { category: ReviewCategory; captionEn: string; captionAr: string }>
  >({});

  const notify = (msg: string) => {
    if (onNotice) onNotice(msg);
  };

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackReviewsService.getAllScreenshotsForAdmin();
      setItems(data);
      const editsMap: Record<string, { category: ReviewCategory; captionEn: string; captionAr: string }> = {};
      data.forEach((item) => {
        editsMap[item.id] = {
          category: item.category || 'none',
          captionEn: item.captionEn || '',
          captionAr: item.captionAr || ''
        };
      });
      setLocalEdits(editsMap);
    } catch (err) {
      console.error('Failed to load feedback screenshots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    let currentOrder = items.reduce((max, item) => Math.max(max, item.orderIndex || 0), 0);
    const created: FeedbackScreenshot[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(
          isArabic
            ? `جاري ضغط وتحسين الصورة ${i + 1} من ${fileArray.length}...`
            : `Optimizing & saving screenshot ${i + 1} of ${fileArray.length}...`
        );
        const optimizedDataUrl = await optimizeFeedbackImage(file);
        currentOrder += 1;
        const newItem: FeedbackScreenshot = {
          id: `rev_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          imageDataUrl: optimizedDataUrl,
          category: 'student_reviews',
          captionEn: '',
          captionAr: '',
          orderIndex: currentOrder,
          isPublished: false, // STRICT PRIVACY: Draft by default until admin publishes
          hasPrivacyMask: false,
          createdAt: new Date().toISOString(),
          createdBy: user?.fullName || 'Super Administrator'
        };
        await feedbackReviewsService.createScreenshot(newItem);
        created.push(newItem);
      }

      if (created.length > 0) {
        await loadAll();
        notify(
          isArabic
            ? `تم رفع ${created.length} لقطة شاشة كمسودة خاصة (غير منشورة) لحين المراجعة وإخفاء أي بيانات خاصة.`
            : `Uploaded ${created.length} screenshot(s) as Private Drafts. Mask private details before publishing.`
        );
      }
    } catch (err) {
      console.error('Upload failed:', err);
      notify(isArabic ? 'حدث خطأ أثناء رفع الصور.' : 'Failed to upload one or more screenshots.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const unimportedAttached = ATTACHED_REVIEW_ASSET_PATHS.filter(
    (asset) => !items.some((it) => it.id === asset.id)
  );

  const handleImportAttachedDrafts = async () => {
    if (unimportedAttached.length === 0) return;
    setIsUploading(true);
    let currentOrder = items.reduce((max, item) => Math.max(max, item.orderIndex || 0), 0);
    let count = 0;

    try {
      for (let i = 0; i < unimportedAttached.length; i++) {
        const asset = unimportedAttached[i];
        setUploadProgress(
          isArabic
            ? `جاري استيراد المسودة ${i + 1} من ${unimportedAttached.length}...`
            : `Importing draft ${i + 1} of ${unimportedAttached.length}...`
        );
        const optimizedDataUrl = await optimizeFeedbackImage(asset.path);
        currentOrder += 1;
        const draft: FeedbackScreenshot = {
          id: asset.id,
          imageDataUrl: optimizedDataUrl,
          category: asset.suggestedCategory,
          captionEn: '',
          captionAr: '',
          orderIndex: currentOrder,
          isPublished: false, // STRICT PRIVACY: Draft only until masked & published by admin
          hasPrivacyMask: false,
          createdAt: new Date().toISOString(),
          createdBy: user?.fullName || 'Super Administrator'
        };
        await feedbackReviewsService.createScreenshot(draft);
        count += 1;
      }

      await loadAll();
      notify(
        isArabic
          ? `تم استيراد ${count} لقطة شاشة كمسودات غير منشورة. راجعها وأخفِ أي أسماء أو صور شخصية قبل النشر.`
          : `Imported ${count} screenshots as Private Unpublished Drafts. Redact personal names/avatars before publishing.`
      );
    } catch (err) {
      console.error('Failed importing attached screenshots:', err);
      notify(isArabic ? 'تعذر استيراد بعض اللقطات.' : 'Failed importing some attached screenshots.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleSaveDetails = async (item: FeedbackScreenshot) => {
    const edit = localEdits[item.id];
    if (!edit) return;
    try {
      await feedbackReviewsService.updateScreenshot(
        item.id,
        {
          category: edit.category,
          captionEn: edit.captionEn.trim(),
          captionAr: edit.captionAr.trim()
        },
        item
      );
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? {
                ...it,
                category: edit.category,
                captionEn: edit.captionEn.trim(),
                captionAr: edit.captionAr.trim()
              }
            : it
        )
      );
      notify(isArabic ? 'تم حفظ التصنيف والوصف.' : 'Category & caption saved.');
    } catch (err) {
      console.error('Error saving details:', err);
    }
  };

  const handleTogglePublish = async (item: FeedbackScreenshot) => {
    const nextState = !item.isPublished;
    if (nextState && !item.hasPrivacyMask) {
      const proceed = window.confirm(
        isArabic
          ? 'تنبيه الخصوصية: لم يتم تطبيق أداة إخفاء البيانات الخاصة على هذه اللقطة بعد. هل أنت متأكد من خلوها من أرقام الهواتف أو الصور الشخصية ونشرها للعامة؟'
          : 'Privacy Check: This screenshot has not been redacted with the Privacy Mask tool. Confirm it contains no personal phone numbers, names, or profile photos before publishing?'
      );
      if (!proceed) return;
    }

    try {
      await feedbackReviewsService.updateScreenshot(item.id, { isPublished: nextState }, item);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isPublished: nextState } : it))
      );
      notify(
        nextState
          ? isArabic
            ? 'تم نشر التقييم على الموقع العام.'
            : 'Screenshot published to website!'
          : isArabic
          ? 'تم إخفاء التقييم وإرجاعه للمسودات.'
          : 'Screenshot hidden from public website.'
      );
    } catch (err) {
      console.error('Error toggling publish state:', err);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updatedWithIndex = reordered.map((it, idx) => ({ ...it, orderIndex: idx + 1 }));
    setItems(updatedWithIndex);

    try {
      await feedbackReviewsService.updateOrderBatch(updatedWithIndex);
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      isArabic
        ? 'هل أنت متأكد من حذف هذه اللقطة نهائياً؟'
        : 'Delete this feedback screenshot permanently?'
    );
    if (!confirmed) return;

    try {
      await feedbackReviewsService.deleteScreenshot(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      notify(isArabic ? 'تم حذف اللقطة.' : 'Screenshot deleted.');
    } catch (err) {
      console.error('Error deleting screenshot:', err);
    }
  };

  const handleSavePrivacyMask = async (maskedDataUrl: string) => {
    if (!editingMaskItem) return;
    try {
      await feedbackReviewsService.updateScreenshot(
        editingMaskItem.id,
        {
          imageDataUrl: maskedDataUrl,
          hasPrivacyMask: true
        },
        editingMaskItem
      );
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingMaskItem.id
            ? { ...it, imageDataUrl: maskedDataUrl, hasPrivacyMask: true }
            : it
        )
      );
      setEditingMaskItem(null);
      notify(
        isArabic
          ? 'تم تطبيق إخفاء البيانات الخاصة وحفظ الصورة المحمية بنجاح.'
          : 'Privacy redaction permanently applied and saved!'
      );
    } catch (err) {
      console.error('Failed saving redacted image:', err);
    }
  };

  const publishedCount = items.filter((i) => i.isPublished).length;
  const draftCount = items.length - publishedCount;
  const maskedCount = items.filter((i) => i.hasPrivacyMask).length;

  return (
    <div dir={dir} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB] text-[11px] font-bold">
              {isArabic ? 'معرض آراء الطلاب' : 'Reviews Gallery CMS'}
            </span>
            <span className="text-xs text-[#AA820A] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isArabic ? 'حماية الخصوصية مفعّلة افتراضياً' : 'Draft-by-Default Privacy'}
            </span>
          </div>
          <h2 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F] mt-1">
            {isArabic
              ? 'إدارة لقطات آراء وتقييمات الطلاب'
              : 'Student Reviews & Feedback Screenshots'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isArabic
              ? 'ارفع عدة صور دفعة واحدة، أخفِ أرقام الهواتف أو الأسماء والصور الشخصية، رتبها، وانشر فقط ما تعتمده.'
              : 'Upload multiple screenshots at once, redact personal phone numbers/names/avatars, organize categories, reorder, and publish selectively.'}
          </p>
        </div>

        {/* Summary Counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-gray-200 font-bold text-[#0A192F]">
            {isArabic ? 'الإجمالي:' : 'Total:'} {items.length}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 font-bold text-[#128C7E]">
            {isArabic ? 'منشور:' : 'Published:'} {publishedCount}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-bold text-amber-800">
            {isArabic ? 'مسودة خاصة:' : 'Private Drafts:'} {draftCount}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#0A192F]/5 border border-[#D4AF37]/40 font-bold text-[#0A192F]">
            {isArabic ? 'محمي الخصوصية:' : 'Masked:'} {maskedCount}
          </span>
        </div>
      </div>

      {/* Multi-Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFilesSelected(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
            : 'border-[#D4AF37]/45 bg-[#FAF8F5] hover:border-[#D4AF37]'
        }`}
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0A192F] text-[#D4AF37] flex items-center justify-center mb-3 shadow-md">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm sm:text-base text-[#0A192F]">
          {isArabic
            ? 'رفع عدة لقطات شاشة لتقييمات الطلاب دفعة واحدة'
            : 'Upload Multiple Feedback Screenshots at Once'}
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-lg mx-auto">
          {isArabic
            ? 'يتم تحسين حجم الصور تلقائياً لسرعة التحميل مع الحفاظ على وضوح النصوص، وتُحفظ كمسودات خاصة غير ظاهرة للزوار حتى تنشرها.'
            : 'Images are automatically optimized for fast loading while preserving crisp text readability, and saved strictly as unpublished drafts until you publish them.'}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-md hover:brightness-105 transition-all">
            <Images className="w-4 h-4" />
            <span>{isArabic ? 'اختيار صور من جهازك' : 'Select Screenshots'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading}
              onChange={(e) => {
                handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />
          </label>
        </div>

        {uploadProgress && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold">
            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-spin" />
            <span>{uploadProgress}</span>
          </div>
        )}
      </div>

      {/* Importer for the 20 Attached Screenshots (Private Drafts Only) */}
      {unimportedAttached.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0A192F] to-[#102445] text-white border border-[#D4AF37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
              <FolderInput className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F3E5AB]">
                {isArabic
                  ? `يتوفر ${unimportedAttached.length} لقطة شاشة مرفقة جاهزة للاستيراد كمسودات خاصة`
                  : `${unimportedAttached.length} Attached Screenshots Ready to Import as Private Drafts`}
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                {isArabic
                  ? 'سيتم استيرادها كمسودات مخفية تماماً عن الزوار لتتمكن من إخفاء الأسماء أو الصور الشخصية قبل نشرها.'
                  : 'They will be imported strictly as unpublished private drafts so you can mask names/avatars before publishing.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleImportAttachedDrafts}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] hover:brightness-105 disabled:opacity-50 whitespace-nowrap shadow-md"
          >
            {isArabic
              ? `استيراد (${unimportedAttached.length}) كمسودات`
              : `Import (${unimportedAttached.length}) Drafts`}
          </button>
        </div>
      )}

      {/* Screenshots List */}
      {isLoading ? (
        <div className="p-10 text-center text-xs text-gray-500">
          {isArabic ? 'جاري تحميل لقطات الآراء...' : 'Loading feedback screenshots...'}
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl border border-gray-200">
          {isArabic
            ? 'لا توجد لقطات مرفوعة بعد. ارفع صوراً جديدة أو استورد اللقطات المرفقة أعلاه.'
            : 'No screenshots uploaded yet. Select files above or import your attached screenshots as drafts.'}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => {
            const edit = localEdits[item.id] || {
              category: item.category || 'none',
              captionEn: item.captionEn || '',
              captionAr: item.captionAr || ''
            };

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all grid grid-cols-1 lg:grid-cols-12 gap-5 items-start ${
                  item.isPublished
                    ? 'bg-white border-[#25D366]/40 shadow-sm'
                    : 'bg-[#FAF8F5] border-amber-200/80'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="lg:col-span-3 flex flex-col items-center gap-2">
                  <div className="relative w-full h-48 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={item.imageDataUrl}
                      alt={`Review ${idx + 1}`}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                    <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-[#0A192F] text-[#F3E5AB] text-[10px] font-bold font-mono">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="w-full flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="flex-1 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center gap-1 text-[11px] font-bold"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'أعلى' : 'Up'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === items.length - 1}
                      className="flex-1 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center gap-1 text-[11px] font-bold"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'أسفل' : 'Down'}</span>
                    </button>
                  </div>
                </div>

                {/* Metadata & Controls */}
                <div className="lg:col-span-9 space-y-4">
                  {/* Status & Privacy Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/15 text-[#128C7E] text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'منشور للعامة' : 'Published Publicly'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold">
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'مسودة خاصة (مخفي)' : 'Hidden Private Draft'}</span>
                        </span>
                      )}

                      {item.hasPrivacyMask ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A192F] text-[#F3E5AB] text-[11px] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{isArabic ? 'تم إخفاء البيانات الخاصة' : 'Privacy Masked'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isArabic ? 'بدون إخفاء مضاف' : 'Unmasked'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMaskItem(item)}
                        className="px-3 py-1.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{isArabic ? 'إخفاء بيانات خاصة' : 'Mask Private Info'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          item.isPublished
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-[#25D366] text-white hover:brightness-95 shadow-sm'
                        }`}
                      >
                        {item.isPublished ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'إخفاء' : 'Hide'}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'نشر' : 'Publish'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                        title={isArabic ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Category + Optional Captions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        {isArabic ? 'التصنيف (اختياري)' : 'Category (Optional)'}
                      </label>
                      <select
                        value={edit.category}
                        onChange={(e) =>
                          setLocalEdits((prev) => ({
                            ...prev,
                            [item.id]: { ...edit, category: e.target.value as ReviewCategory }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      >
                        <option value="none">{isArabic ? 'بدون تصنيف' : 'No Category'}</option>
                        <option value="student_reviews">
                          {isArabic ? 'آراء الطلاب (Student Reviews)' : 'Student Reviews'}
                        </option>
                        <option value="parents_feedback">
                          {isArabic ? "آراء أولياء الأمور (Parents' Feedback)" : "Parents' Feedback"}
                        </option>
                        <option value="lecture_feedback">
                          {isArabic ? 'تقييم المحاضرات (Lecture Feedback)' : 'Lecture Feedback'}
                        </option>
                        <option value="course_experience">
                          {isArabic ? 'تجربة الدورات (Course Experience)' : 'Course Experience'}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        {isArabic ? 'وصف مختصر بالإنجليزية (اختياري)' : 'Short Caption EN (Optional)'}
                      </label>
                      <input
                        type="text"
                        maxLength={200}
                        placeholder={isArabic ? 'مثال: تقييم دورة المحادثة' : 'e.g. Speaking course feedback'}
                        value={edit.captionEn}
                        onChange={(e) =>
                          setLocalEdits((prev) => ({
                            ...prev,
                            [item.id]: { ...edit, captionEn: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        {isArabic ? 'وصف مختصر بالعربية (اختياري)' : 'Short Caption AR (Optional)'}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        maxLength={200}
                        placeholder="مثال: رأي إحدى الطالبات في الكورس"
                        value={edit.captionAr}
                        onChange={(e) =>
                          setLocalEdits((prev) => ({
                            ...prev,
                            [item.id]: { ...edit, captionAr: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveDetails(item)}
                      className="px-4 py-1.5 rounded-xl bg-white border border-[#D4AF37]/60 text-[#0A192F] hover:bg-[#FAF8F5] text-xs font-bold flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-[#AA820A]" />
                      <span>{isArabic ? 'حفظ التصنيف والوصف' : 'Save Category & Caption'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Privacy Redaction Modal */}
      {editingMaskItem && (
        <PrivacyMaskModal
          imageDataUrl={editingMaskItem.imageDataUrl}
          isArabic={isArabic}
          onSave={handleSavePrivacyMask}
          onClose={() => setEditingMaskItem(null)}
        />
      )}
    </div>
  );
};
