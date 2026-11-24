import React, { useRef, useState } from 'react';
import { PrivacyMaskBox, PrivacyMaskStyle } from '../../types/reviews';
import { renderPrivacyMaskedImage } from '../../services/feedbackReviewsService';
import { Shield, Undo2, Trash2, Check, X, EyeOff } from 'lucide-react';

interface PrivacyMaskModalProps {
  imageDataUrl: string;
  isArabic: boolean;
  onSave: (maskedImageDataUrl: string) => Promise<void>;
  onClose: () => void;
}

export const PrivacyMaskModal: React.FC<PrivacyMaskModalProps> = ({
  imageDataUrl,
  isArabic,
  onSave,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [masks, setMasks] = useState<PrivacyMaskBox[]>([]);
  const [draftBox, setDraftBox] = useState<PrivacyMaskBox | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [maskStyle, setMaskStyle] = useState<PrivacyMaskStyle>('navy');
  const [isSaving, setIsSaving] = useState(false);

  const getNormalizedPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getNormalizedPoint(e.clientX, e.clientY);
    setDragStart(pt);
    setDraftBox({
      id: `mask_${Date.now()}`,
      x: pt.x,
      y: pt.y,
      width: 0,
      height: 0
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    const pt = getNormalizedPoint(e.clientX, e.clientY);
    const x = Math.min(dragStart.x, pt.x);
    const y = Math.min(dragStart.y, pt.y);
    const width = Math.abs(pt.x - dragStart.x);
    const height = Math.abs(pt.y - dragStart.y);
    setDraftBox({
      id: `mask_${Date.now()}`,
      x,
      y,
      width,
      height
    });
  };

  const handlePointerUp = () => {
    if (draftBox && draftBox.width > 0.015 && draftBox.height > 0.015) {
      setMasks((prev) => [...prev, draftBox]);
    }
    setDragStart(null);
    setDraftBox(null);
  };

  const addPreset = (preset: Omit<PrivacyMaskBox, 'id'>) => {
    setMasks((prev) => [...prev, { id: `preset_${Date.now()}_${Math.random()}`, ...preset }]);
  };

  const handleApplyAndSave = async () => {
    if (masks.length === 0) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      const redactedUrl = await renderPrivacyMaskedImage(imageDataUrl, masks, maskStyle);
      await onSave(redactedUrl);
    } finally {
      setIsSaving(false);
    }
  };

  const allBoxes = draftBox ? [...masks, draftBox] : masks;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#060D1A]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl max-w-4xl w-full p-5 sm:p-6 space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#AA820A]" />
              <h3 className="font-serif-luxury font-bold text-lg sm:text-xl text-[#0A192F]">
                {isArabic
                  ? 'أداة حماية الخصوصية وإخفاء البيانات'
                  : 'Privacy Redaction & Masking Tool'}
              </h3>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {isArabic
                ? 'اسحب على أي رقم هاتف أو اسم أو صورة شخصية لإخفائها نهائياً قبل النشر دون المساس بنص التقييم.'
                : 'Drag across any phone number, contact name, or profile photo to permanently redact it before publishing without altering the feedback text.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets & Mask Style */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#D4AF37]/25">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#0A192F]">
              {isArabic ? 'قوالب سريعة:' : 'Quick Masks:'}
            </span>
            <button
              type="button"
              onClick={() => addPreset({ x: 0, y: 0, width: 1, height: 0.14 })}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-[#D4AF37] text-[11px] font-bold text-[#0A192F]"
            >
              {isArabic ? 'تغطية الشريط العلوي (14%)' : 'Mask Top Bar (14%)'}
            </button>
            <button
              type="button"
              onClick={() => addPreset({ x: 0, y: 0, width: 1, height: 0.2 })}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-[#D4AF37] text-[11px] font-bold text-[#0A192F]"
            >
              {isArabic ? 'تغطية الشريط العلوي (20%)' : 'Mask Top Bar (20%)'}
            </button>
            <button
              type="button"
              onClick={() => addPreset({ x: 0.84, y: 0.16, width: 0.16, height: 0.16 })}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-[#D4AF37] text-[11px] font-bold text-[#0A192F]"
            >
              {isArabic ? 'إخفاء الصورة يميناً' : 'Top-Right Avatar'}
            </button>
            <button
              type="button"
              onClick={() => addPreset({ x: 0, y: 0.16, width: 0.16, height: 0.16 })}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-[#D4AF37] text-[11px] font-bold text-[#0A192F]"
            >
              {isArabic ? 'إخفاء الصورة يساراً' : 'Top-Left Avatar'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0A192F]">
              {isArabic ? 'نمط الإخفاء:' : 'Style:'}
            </span>
            {(
              [
                { id: 'navy', label: isArabic ? 'كحلي' : 'Navy' },
                { id: 'blur', label: isArabic ? 'تمويه' : 'Blur' },
                { id: 'dark', label: isArabic ? 'أسود' : 'Dark' }
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setMaskStyle(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                  maskStyle === st.id
                    ? 'bg-[#0A192F] text-[#F3E5AB] border-[#D4AF37]'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Canvas Overlay Area */}
        <div className="flex justify-center bg-[#0A192F]/5 rounded-2xl p-3 border border-gray-200 max-h-[56vh] overflow-auto">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative inline-block select-none touch-none cursor-crosshair shadow-lg rounded-xl overflow-hidden"
          >
            <img
              src={imageDataUrl}
              alt="Screenshot to redact"
              draggable={false}
              className="block max-w-full max-h-[50vh] w-auto h-auto pointer-events-none"
            />

            {allBoxes.map((box) => (
              <div
                key={box.id}
                style={{
                  left: `${box.x * 100}%`,
                  top: `${box.y * 100}%`,
                  width: `${box.width * 100}%`,
                  height: `${box.height * 100}%`
                }}
                className={`absolute pointer-events-none border border-[#D4AF37]/70 ${
                  maskStyle === 'blur'
                    ? 'backdrop-blur-md bg-[#0A192F]/35'
                    : maskStyle === 'navy'
                    ? 'bg-[#0A192F]'
                    : 'bg-[#111827]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMasks((prev) => prev.slice(0, -1))}
              disabled={masks.length === 0}
              className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1.5"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تراجع' : 'Undo'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMasks([])}
              disabled={masks.length === 0}
              className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isArabic ? 'مسح الكل' : 'Clear Masks'}</span>
            </button>
            <span className="text-[11px] text-gray-500 font-semibold">
              {masks.length} {isArabic ? 'منطقة مخفية' : 'masked region(s)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleApplyAndSave}
              disabled={isSaving || masks.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] disabled:opacity-50 flex items-center gap-1.5 shadow-md"
            >
              {isSaving ? (
                <span>{isArabic ? 'جاري الحفظ...' : 'Applying...'}</span>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{isArabic ? 'تطبيق وحفظ الإخفاء نهائياً' : 'Bake Masks & Save'}</span>
                  <Check className="w-3.5 h-3.5 text-[#25D366]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
