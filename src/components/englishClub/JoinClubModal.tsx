import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { englishClubService } from '../../services/englishClubService';
import { EnglishZoneEmblem } from '../common/Logo';
import { OFFICIAL_CONTACTS } from '../../data/academyData';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers
} from 'lucide-react';

interface JoinClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrack?: 'A1-A2' | 'B1-B2' | 'C1-C2' | 'undecided';
}

export const JoinClubModal: React.FC<JoinClubModalProps> = ({
  isOpen,
  onClose,
  initialTrack = 'undecided'
}) => {
  const { language, t } = useLanguage();
  const c = t.englishClub;

  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<'A1-A2' | 'B1-B2' | 'C1-C2' | 'undecided'>(initialTrack);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRefId, setSuccessRefId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !whatsappNumber.trim() || !email.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const refId = await englishClubService.submitClubRegistration({
        fullName: fullName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim(),
        selectedTrack,
        notes: notes.trim()
      });
      setSuccessRefId(refId);
    } catch (err: any) {
      console.error('Club registration error:', err);
      setErrorMsg(language === 'ar' ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSuccessRefId(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!successRefId ? (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#0A192F] flex items-center justify-center flex-shrink-0 shadow-md">
                <EnglishZoneEmblem sizeClass="w-9 h-9" glow={false} showBevelBorder={false} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#AA820A] text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>{c.badge}</span>
                </div>
                <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F] mt-0.5">
                  {c.modalTitle}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
              {c.modalSubtitle}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {c.fullNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم الثلاثي' : 'e.g. Sarah Mansoor'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {c.whatsappLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+966 5..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {c.emailLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {c.trackSelectLabel}
                </label>
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none bg-white transition-all font-medium text-gray-800"
                >
                  <option value="undecided">
                    {language === 'ar' ? '🔍 ساعدني في اختيار المسار (تحديد مستوى مجاني)' : '🔍 Help me choose (Placement Assessment)'}
                  </option>
                  <option value="A1-A2">
                    {language === 'ar' ? '🌱 المسار التأسيسي (Foundations A1–A2)' : '🌱 Foundations Track (CEFR A1–A2)'}
                  </option>
                  <option value="B1-B2">
                    {language === 'ar' ? '🚀 مسار الطلاقة المتوسطة (Intermediate B1–B2)' : '🚀 Intermediate Fluency (CEFR B1–B2)'}
                  </option>
                  <option value="C1-C2">
                    {language === 'ar' ? '💎 مسار الإتقان والاحتراف (Mastery C1–C2)' : '💎 Advanced Mastery (CEFR C1–C2)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {c.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'أي أوقات تفضلها أو أهداف خاصة ترغب في التركيز عليها...' : 'Preferred days, times, or speaking goals...'}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Club Policy Badge */}
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-gray-200 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5 text-[#0A192F] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{c.practiceNotReplacementBadge}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#0A192F] via-[#162B4D] to-[#0A192F] text-[#F3E5AB] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>{c.submitting}</span>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                      <span>{c.submitBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Submission Success State */
          <div className="text-center py-4 space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-[#25D366]" />
            </div>

            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] border border-gray-200 text-gray-600">
                Ref: {successRefId}
              </span>
              <h3 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-3">
                {c.successTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                {c.successDesc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/30 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-gray-700">
                <span>{language === 'ar' ? 'المسار المختار:' : 'Selected Track:'}</span>
                <span className="text-[#0A192F]">{selectedTrack}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>{language === 'ar' ? 'مدة اللقاء:' : 'Session Duration:'}</span>
                <span>60 Minutes (English Only)</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>{language === 'ar' ? 'حالة الطلب:' : 'Application Status:'}</span>
                <span className="text-[#25D366] font-semibold">Logged in Academy Registry</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`${OFFICIAL_CONTACTS.whatsapp}?text=${encodeURIComponent(
                  `Hello English Zone Academy, I just submitted my registration for English Club! Application Ref: ${successRefId}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{c.chatWhatsapp}</span>
              </a>

              <button
                type="button"
                onClick={handleModalClose}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
