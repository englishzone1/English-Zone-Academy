import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AvatarRenderer } from '../../components/avatar/AvatarRenderer';
import { EnglishZoneEmblem } from '../../components/common/Logo';
import {
  studentDataService,
  HomeworkRecord,
  PointsLogRecord,
  GradeRecord,
  TimetableRecord
} from '../../services/studentDataService';
import { Sparkles, Calendar, LogOut, Edit3, Phone, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface StudentDashboardProps {
  navigate: (route: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ navigate }) => {
  const { language } = useLanguage();
  const { user, firebaseUser, hasProfile, isLoading: isAuthLoading, logout } = useAuth();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'overview' | 'stars' | 'curriculum' | 'homework' | 'subscription'>('overview');
  const [homeworkList, setHomeworkList] = useState<HomeworkRecord[]>([]);
  const [pointsLog, setPointsLog] = useState<PointsLogRecord[]>([]);
  const [gradesList, setGradesList] = useState<GradeRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableRecord[]>([]);
  // رابط واتساب من إعدادات الأكاديمية في لوحة الإدارة فقط (لا قيمة ثابتة)
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'academy_settings', 'main'))
      .then((snap) => {
        const link = snap.exists() ? String((snap.data() as any).whatsapp || '').trim() : '';
        setWhatsappLink(link);
      })
      .catch(() => setWhatsappLink(''));
  }, []);

  // The student dashboard opens only after the academy sets subscriptionStatus = 'active'
  const isActive =
    !!user && hasProfile && String((user as any).subscriptionStatus || '').toLowerCase() === 'active';

  useEffect(() => {
    if (!firebaseUser || !isActive) return;

    const loadStudentData = async () => {
      try {
        const [hw, pts, gr, tt] = await Promise.all([
          studentDataService.getStudentHomework(firebaseUser.uid),
          studentDataService.getStudentPointsLog(firebaseUser.uid),
          studentDataService.getStudentGrades(firebaseUser.uid),
          studentDataService.getStudentTimetable(firebaseUser.uid)
        ]);
        setHomeworkList(hw || []);
        setPointsLog(pts || []);
        setGradesList(gr || []);
        setTimetable(tt || []);
      } catch (err) {
        console.error('Error fetching student records:', err);
      }
    };

    loadStudentData();
  }, [firebaseUser, isActive]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-sm text-gray-500">
        {isAr ? 'جارٍ التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (!firebaseUser) {
    navigate('login');
    return null;
  }

  // Waiting for the academy: no profile yet, or subscription not activated
  if (!isActive) {
    const status = String((user as any)?.subscriptionStatus || '').toLowerCase();
    const title = hasProfile
      ? (isAr ? 'حسابك بانتظار تفعيل الاشتراك' : 'Your Account Is Awaiting Activation')
      : (isAr ? 'ملف الطالب قيد التجهيز' : 'Student Profile Not Ready');
    const message = hasProfile
      ? (isAr
          ? 'تم إنشاء حسابك. ستظهر لك لوحة الطالب بعد أن تؤكد إدارة الأكاديمية اشتراكك وتحدد مستواك ودورتك.'
          : 'Your account has been created. Your student dashboard will appear once the academy confirms your subscription and assigns your level and course.')
      : (isAr
          ? 'ملف الطالب الخاص بك غير جاهز بعد. يرجى التواصل مع إدارة الأكاديمية.'
          : 'Your student profile is not ready yet. Please contact the academy administration.');

    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#D4AF37]/40 shadow-2xl max-w-lg w-full text-center space-y-6">
          <div className="flex justify-center">
            <EnglishZoneEmblem sizeClass="w-20 h-20" glow={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isAr ? 'بانتظار الاعتماد الأكاديمي' : 'Pending Academic Approval'}</span>
          </div>

          <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">{title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 text-xs text-left rtl:text-right space-y-1.5 font-mono text-gray-700">
            <div className="flex justify-between gap-3">
              <span className="text-gray-400 font-sans">{isAr ? 'البريد:' : 'Account Email:'}</span>
              <span className="font-bold break-all">{firebaseUser.email}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400 font-sans">UID:</span>
              <span className="text-[10px] break-all">{firebaseUser.uid}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400 font-sans">{isAr ? 'الحالة:' : 'Status:'}</span>
              <span className="text-amber-700 font-bold">{status || 'pending'}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {whatsappLink && (
            <a
              href={`${whatsappLink}${whatsappLink.includes('?') ? '&' : '?'}text=${encodeURIComponent(`Hello Admissions, I have created my English Zone account (${firebaseUser.email}, UID: ${firebaseUser.uid}). Please activate my student profile.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>{isAr ? 'تواصل عبر واتساب للتفعيل' : 'Contact via WhatsApp'}</span>
            </a>
            )}

            <button
              onClick={async () => {
                await logout();
                navigate('login');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isAr ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Active student: show ONLY what the academy has set ----------
  const student: any = user!;
  const level: string | undefined = student.mainLevel || undefined;
  const courseName: string | undefined = student.enrolledCourseName || undefined;
  const stage: string | undefined = student.currentStage || undefined;
  const teacherName: string | undefined = student.assignedTeacherName || undefined;
  const tuition: number | undefined = typeof student.monthlyTuitionUSD === 'number' ? student.monthlyTuitionUSD : undefined;
  const progress: number | undefined = typeof student.stageProgress === 'number' ? student.stageProgress : undefined;
  const lessonsAttended = typeof student.lessonsAttended === 'number' ? student.lessonsAttended : undefined;
  const lessonsTotal = typeof student.lessonsTotal === 'number' ? student.lessonsTotal : undefined;

  const formatLabel: string | undefined =
    student.learningFormat === 'individual'
      ? (isAr ? 'خاص (60 دقيقة)' : 'Private 1-on-1 (60 min)')
      : student.learningFormat === 'group'
      ? (isAr ? 'جماعي (90 دقيقة)' : 'Group (90 min)')
      : undefined;

  const detailItems: { label: string; value: string }[] = [];
  if (lessonsAttended !== undefined && lessonsTotal !== undefined) {
    detailItems.push({ label: isAr ? 'الحصص المنجزة' : 'Lessons Attended', value: `${lessonsAttended} / ${lessonsTotal}` });
  }
  if (teacherName) {
    detailItems.push({ label: isAr ? 'المعلم' : 'Instructor', value: teacherName });
  }
  if (formatLabel) {
    detailItems.push({ label: isAr ? 'نظام الحصة' : 'Lesson Format', value: formatLabel });
  }

  const notSet = isAr ? 'لم يُحدد بعد' : 'Not set yet';

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate('avatar-studio')}
              className="relative cursor-pointer group"
              title="Open Avatar Studio"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow group-hover:scale-105 transition-transform bg-[#0A192F]">
                {student.avatarConfig ? (
                  <AvatarRenderer config={student.avatarConfig} size={64} showBackground={false} />
                ) : (
                  <EnglishZoneEmblem sizeClass="w-full h-full" glow={false} />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-[#0A192F] flex items-center justify-center shadow">
                <Edit3 className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F]">
                  {student.fullName}
                </h1>
                {level && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/40">
                    {isAr ? 'المستوى' : 'Level'} {level}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {student.email}
                {formatLabel ? ` • ${formatLabel}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#0A192F] border border-[#D4AF37]/40 text-[#F3E5AB] flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <div className="text-left rtl:text-right">
                <span className="text-[10px] text-gray-400 block leading-none">English Zone Stars</span>
                <span className="font-bold text-base text-[#F3E5AB]">{student.points || 0} {isAr ? 'نقطة' : 'Points'}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('avatar-studio')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#D4AF37]/50 text-[#0A192F] hover:bg-[#FAF8F5] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#AA820A]" />
              <span>{isAr ? 'استوديو الأفاتار' : 'Avatar Studio'}</span>
            </button>

            <button
              onClick={async () => {
                await logout();
                navigate('login');
              }}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', labelEn: 'Overview & Lessons', labelAr: 'نظرة عامة والدروس' },
            { id: 'stars', labelEn: 'English Zone Stars', labelAr: 'نجوم التحفيز ونقاطي' },
            { id: 'curriculum', labelEn: 'Curriculum & Stages', labelAr: 'المنهج والمراحل' },
            { id: 'homework', labelEn: 'Homework & Tests', labelAr: 'الواجبات والاختبارات' },
            { id: 'subscription', labelEn: 'Tuition & Invoices', labelAr: 'الاشتراك والفواتير' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0A192F] text-[#F3E5AB] shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-8 space-y-6">

              {/* Program card: only what the academy has set */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#AA820A]">
                      {isAr ? 'دورتك' : 'Your Course'}
                    </span>
                    <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-0.5">
                      {courseName || notSet}
                    </h2>
                    {(level || stage) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {level ? `${isAr ? 'المستوى' : 'Level'} ${level}` : ''}
                        {level && stage ? ' • ' : ''}
                        {stage ? `${isAr ? 'المرحلة' : 'Stage'} ${stage}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-xs font-bold text-emerald-800 border border-emerald-200 whitespace-nowrap">
                    {isAr ? 'اشتراك نشط' : 'Active Enrollment'}
                  </span>
                </div>

                {progress !== undefined && (
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                      <span>{isAr ? 'نسبة إنجاز المرحلة:' : 'Stage Progress:'}</span>
                      <span className="text-[#0A192F] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA820A] rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {detailItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center border-t border-gray-100 pt-4 text-xs">
                    {detailItems.map((item) => (
                      <div key={item.label}>
                        <span className="text-gray-400 block">{item.label}</span>
                        <span className="font-bold text-sm text-[#0A192F]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next session */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#AA820A]" />
                  <span>{isAr ? 'الحصة القادمة' : 'Next Scheduled Live Session'}</span>
                </h3>

                {timetable.length > 0 ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0A192F] to-[#102445] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-[#F3E5AB] uppercase tracking-wider block mb-1">
                        {timetable[0].time}
                      </span>
                      <h4 className="font-bold text-base text-white">{timetable[0].topic}</h4>
                      {timetable[0].teacherName && (
                        <p className="text-xs text-gray-300 mt-1">
                          {isAr ? 'المعلم:' : 'Instructor:'} {timetable[0].teacherName}
                        </p>
                      )}
                    </div>

                    {timetable[0].zoomLink && (
                      <a
                        href={timetable[0].zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#D4AF37] text-[#0A192F] hover:bg-[#F3E5AB] transition-colors whitespace-nowrap shadow"
                      >
                        {isAr ? 'دخول الفصل الافتراضي' : 'Join Live Classroom'}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-gray-200 text-xs text-gray-500 text-center">
                    {isAr ? 'لم يُحدد موعد حصتك القادمة بعد.' : 'Your next session has not been scheduled yet.'}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">

              <div className="bg-gradient-to-br from-[#0A192F] via-[#102445] to-[#0A192F] text-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/50 shadow-xl space-y-4 text-center">
                <div className="flex justify-center">
                  <EnglishZoneEmblem sizeClass="w-16 h-16" glow={true} />
                </div>

                <h3 className="font-serif-luxury font-bold text-xl text-[#F3E5AB]">
                  {isAr ? 'بطاقة الطالب' : 'Student Academic Pass'}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {student.fullName}
                  {level ? ` • ${isAr ? 'المستوى' : 'Level'} ${level}` : ''}
                </p>

                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-gray-400 block text-[10px]">{isAr ? 'نجم الأسبوع' : 'Star of Week'}</span>
                    <span className="font-bold text-base text-[#D4AF37]">{student.starOfTheWeekCount || 0}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-gray-400 block text-[10px]">{isAr ? 'نجم الشهر' : 'Star of Month'}</span>
                    <span className="font-bold text-base text-[#D4AF37]">{student.starOfTheMonthCount || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('certificates')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] text-[#0A192F] hover:bg-[#F3E5AB] transition-colors"
                >
                  {isAr ? 'استعراض الشهادات' : 'View Verified Certificates'}
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
                <h4 className="font-serif-luxury font-bold text-sm text-[#0A192F]">
                  {isAr ? 'الواجبات والمهام الحالية' : 'Active Homework & Tasks'}
                </h4>
                {homeworkList.length === 0 ? (
                  <p className="text-xs text-gray-500 py-3 text-center">
                    {isAr ? 'لا توجد واجبات معلقة حالياً.' : 'No pending homework assignments.'}
                  </p>
                ) : (
                  homeworkList.map((hw) => (
                    <div key={hw.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#0A192F]">
                        <span>{isAr ? hw.titleAr : hw.titleEn}</span>
                        <span className="text-[10px] text-[#AA820A]">{hw.pointsAward}</span>
                      </div>
                      <div className="text-gray-500 text-[11px] flex items-center justify-between">
                        <span>{isAr ? 'التسليم:' : 'Due:'} {hw.dueDate}</span>
                        <span className="capitalize font-semibold text-emerald-700">{hw.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STARS */}
        {activeTab === 'stars' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
                  {isAr ? 'سجل نجوم التحفيز' : 'English Zone Stars Recognition Log'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isAr ? 'النجوم التي منحها لك معلموك.' : 'Stars awarded by your teachers.'}
                </p>
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-[#0A192F] text-[#F3E5AB] font-bold text-lg">
                {isAr ? 'المجموع:' : 'Total:'} {student.points || 0}
              </div>
            </div>

            {pointsLog.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto mb-2 opacity-50" />
                <p>{isAr ? 'لا توجد نجوم مسجلة بعد.' : 'No stars have been recorded yet.'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pointsLog.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#0A192F] block">{log.reason}</span>
                      <span className="text-gray-400 text-[10px]">
                        {isAr ? 'بواسطة:' : 'Awarded by:'} {log.awardedBy} • {log.timestamp}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">+{log.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CURRICULUM */}
        {activeTab === 'curriculum' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              {isAr ? 'منهجك ومرحلتك' : 'Your Curriculum & Stage'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AA820A]">
                  {isAr ? 'الدورة' : 'Course'}
                </span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">{courseName || notSet}</h4>
                {level && <p className="text-xs text-gray-500 mt-1">{isAr ? 'المستوى' : 'Level'} {level}</p>}
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {isAr ? 'المرحلة الحالية' : 'Current Stage'}
                </span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">{stage || notSet}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {isAr ? 'نظام الحصة' : 'Instruction Format'}
                </span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">{formatLabel || notSet}</h4>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOMEWORK & GRADES */}
        {activeTab === 'homework' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              {isAr ? 'التقييمات والواجبات' : 'Academic Evaluations & Homework'}
            </h2>
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#0A192F] uppercase tracking-wider">
                {isAr ? 'الدرجات والاختبارات' : 'Evaluations & Exam Grades'}
              </h3>
              {gradesList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#FAF8F5] text-center text-xs text-gray-500">
                  {isAr ? 'لم تُرصد أي درجات بعد.' : 'No grades have been recorded yet.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {gradesList.map((gr) => (
                    <div key={gr.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#0A192F] block">{gr.assessmentTitle}</span>
                        <span className="text-gray-400 text-[10px]">
                          {isAr ? 'المستوى:' : 'Level:'} {gr.level} • {gr.date}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700 text-sm">{gr.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              {isAr ? 'الاشتراك والرسوم' : 'Tuition & Subscription'}
            </h2>
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A192F]">{isAr ? 'حالة الاشتراك' : 'Subscription Status'}</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                  {isAr ? 'نشط' : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-xs text-gray-600">{isAr ? 'الرسوم الشهرية' : 'Monthly Tuition'}</span>
                <span className="font-bold text-base text-[#0A192F]">
                  {tuition !== undefined ? `$${tuition} USD / ${isAr ? 'شهر' : 'Month'}` : notSet}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
