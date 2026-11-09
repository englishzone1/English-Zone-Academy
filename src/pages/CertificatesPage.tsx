import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Award, ShieldCheck, CheckCircle2, Search, Download, Printer, ExternalLink } from 'lucide-react';

interface CertificatesPageProps {
  navigate: (route: string) => void;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [certIdInput, setCertIdInput] = useState('');
  const [verifiedRecord, setVerifiedRecord] = useState<{
    id: string;
    studentName: string;
    level: string;
    program: string;
    issueDate: string;
    grade: string;
    status: 'valid' | 'not_found';
  } | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const query = certIdInput.trim().toUpperCase();
    if (!query) return;

    // Simulation of official registry verification
    if (query.includes('EZ') || query.length >= 6) {
      setVerifiedRecord({
        id: query,
        studentName: language === 'ar' ? 'فهد المحمد' : 'Fahad Al-Mohammad',
        level: 'Level B2 (Upper-Intermediate)',
        program: 'General English & Conversational Fluency',
        issueDate: 'October 15, 2026',
        grade: 'Pass with Distinction (94%)',
        status: 'valid'
      });
    } else {
      setVerifiedRecord({
        id: query,
        studentName: '',
        level: '',
        program: '',
        issueDate: '',
        grade: '',
        status: 'not_found'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Official Accreditation & Credentials
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.certificates.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.certificates.sectionSubtitle}
          </p>
        </div>

        {/* Verification Input Box */}
        <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-3xl border border-[#D4AF37]/40 shadow-lg">
          <form onSubmit={handleVerify} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F]">
              {t.certificates.verifyPrompt}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  placeholder="e.g. EZ-2026-B2-8492"
                  className="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-3 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.certificates.verifyButton}</span>
              </button>
            </div>
          </form>

          {/* Verification Results Display */}
          {verifiedRecord && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              {verifiedRecord.status === 'valid' ? (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#25D366]/40 space-y-2">
                  <div className="flex items-center gap-2 text-[#128C7E] font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                    <span>
                      {language === 'ar' ? 'الشهادة معتمدة وموثقة في سجل الأكاديمية' : 'Officially Verified & Authenticated in Academy Registry'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                    <div>
                      <span className="text-gray-400 block">{language === 'ar' ? 'الطالب:' : 'Student:'}</span>
                      <span className="font-bold text-[#0A192F]">{verifiedRecord.studentName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">{language === 'ar' ? 'المستوى:' : 'Level:'}</span>
                      <span className="font-bold text-[#0A192F]">{verifiedRecord.level}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">{language === 'ar' ? 'التقدير:' : 'Distinction:'}</span>
                      <span className="font-bold text-[#D4AF37]">{verifiedRecord.grade}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">{language === 'ar' ? 'تاريخ الإصدار:' : 'Issued:'}</span>
                      <span className="font-bold text-gray-700">{verifiedRecord.issueDate}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs text-center border border-red-200">
                  {language === 'ar' 
                    ? 'لم يتم العثور على شهادة تطابق هذا الرقم في السجل الإلكتروني. يرجى التأكد من الرقم والمحاولة مجدداً.'
                    : 'No certificate matching this ID was found in the official registry. Please check the ID and try again.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SAMPLE LUXURY CERTIFICATE PREVIEW (AS SPECIFIED IN PART 17) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
            Specimen Preview
          </span>
          <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-1">
            {t.certificates.sampleTitle}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t.certificates.sampleSubtitle}
          </p>
        </div>

        {/* Certificate Card */}
        <div className="relative bg-[#FFFDF9] rounded-3xl p-8 sm:p-14 border-8 border-double border-[#D4AF37]/50 shadow-2xl overflow-hidden text-center text-[#0A192F]">
          {/* Subtle ornate background watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <Award className="w-96 h-96 text-[#0A192F]" />
          </div>

          {/* Academy Header */}
          <div className="relative z-10 space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0A192F] text-[#D4AF37] flex items-center justify-center shadow-lg border border-[#D4AF37]/40 mb-3">
              <Award className="w-8 h-8" />
            </div>
            
            <h3 className="font-serif-luxury font-extrabold text-2xl sm:text-4xl tracking-wider text-[#0A192F]">
              ENGLISH ZONE
            </h3>
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#AA820A]">
              International Online Academy
            </p>
            <div className="w-24 h-0.5 bg-[#D4AF37] mx-auto mt-2"></div>
          </div>

          {/* Certificate Body */}
          <div className="relative z-10 my-8 space-y-4">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-gray-500 font-semibold">
              This is to officially certify that
            </p>

            <div className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F] py-1 border-b-2 border-[#D4AF37]/30 inline-block px-8">
              {t.certificates.sampleStudentName}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
              has successfully fulfilled all curriculum requirements, continuous stage assessments, and oral evaluations in accordance with international CEFR standards for
            </p>

            <div className="font-serif-luxury font-bold text-lg sm:text-xl text-[#AA820A]">
              {t.certificates.sampleLevel}
            </div>
          </div>

          {/* Certificate Footer & Signatures (Strictly role titles, no founder personal name as required) */}
          <div className="relative z-10 pt-8 border-t border-[#D4AF37]/30 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-xs text-gray-600">
            <div>
              <span className="font-mono font-bold text-[#0A192F] block">EZ-2026-VERIFIED</span>
              <span className="text-[10px] text-gray-400">{language === 'ar' ? 'رقم التحقق الفريد' : 'Certificate ID'}</span>
            </div>

            {/* Official Gold Seal Badge */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA820A] p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#0A192F] flex flex-col items-center justify-center text-[8px] text-[#F3E5AB] font-bold uppercase tracking-tighter">
                  <span>OFFICIAL</span>
                  <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>SEAL</span>
                </div>
              </div>
            </div>

            <div>
              {/* Authorized role signature placeholder */}
              <div className="font-serif-luxury italic font-bold text-sm text-[#0A192F] border-b border-gray-400 pb-1 mb-1">
                Academic Board
              </div>
              <span className="text-[10px] text-gray-500 font-semibold block">
                Academy Academic Director
              </span>
            </div>
          </div>

        </div>

        {/* Note on rules */}
        <p className="text-center text-xs text-gray-500 mt-6 max-w-xl mx-auto">
          {t.certificates.accreditationNote}
        </p>
      </div>
    </div>
  );
};
