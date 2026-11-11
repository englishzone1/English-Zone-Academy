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
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Edit3, 
  Star,
  Shield,
  HelpCircle,
  TrendingUp,
  UserCheck,
  Phone,
  AlertCircle
} from 'lucide-react';
import { OFFICIAL_CONTACTS } from '../../data/academyData';

interface StudentDashboardProps {
  navigate: (route: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { user, firebaseUser, hasProfile, isLoading: isAuthLoading, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'stars' | 'curriculum' | 'homework' | 'subscription'>('overview');
  const [homeworkList, setHomeworkList] = useState<HomeworkRecord[]>([]);
  const [pointsLog, setPointsLog] = useState<PointsLogRecord[]>([]);
  const [gradesList, setGradesList] = useState<GradeRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableRecord[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Load private student records linked strictly to the authenticated Firebase Auth UID
  useEffect(() => {
    if (!firebaseUser || !hasProfile || !user) {
      setIsDataLoading(false);
      return;
    }

    const loadStudentData = async () => {
      setIsDataLoading(true);
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
        console.error('Error fetching isolated student records:', err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadStudentData();
  }, [firebaseUser, hasProfile, user]);

  // Case 1: Unauthenticated -> Handled by route guard, but safety check here
  if (!isAuthLoading && !firebaseUser) {
    navigate('login');
    return null;
  }

  // Case 2: Authenticated user has no academic profile provisioned yet
  // Requirement 4: "Your student profile is not ready yet. Please contact the academy administration."
  if (!isAuthLoading && firebaseUser && !hasProfile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#D4AF37]/40 shadow-2xl max-w-lg w-full text-center space-y-6">
          <div className="flex justify-center">
            <EnglishZoneEmblem sizeClass="w-20 h-20" glow={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بانتظار الاعتماد الأكاديمي' : 'Pending Academic Assignment'}</span>
          </div>

          <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
            {language === 'ar' ? 'ملف الطالب قيد التجهيز الأكاديمي' : 'Student Profile Not Ready'}
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed">
            {language === 'ar' 
              ? 'ملف الطالب الخاص بك غير جاهز بعد. يرجى التواصل مع إدارة الأكاديمية لاستكمال إجراءات التسجيل وتفعيل صفك الدراسي.'
              : 'Your student profile is not ready yet. Please contact the academy administration.'}
          </p>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 text-xs text-left rtl:text-right space-y-1.5 font-mono text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-400 font-sans">Account Email:</span>
              <span className="font-bold">{firebaseUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-sans">Firebase UID:</span>
              <span className="text-[10px] break-all">{firebaseUser.uid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-sans">Status:</span>
              <span className="text-amber-700 font-bold">Awaiting Class Assignment</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`${OFFICIAL_CONTACTS.whatsapp}?text=${encodeURIComponent(`Hello Admissions, I have created my English Zone account (${firebaseUser.email}, UID: ${firebaseUser.uid}). Please activate my student profile.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Phone className="w-4 h-4" />
              <span>{language === 'ar' ? 'تواصل عبر واتساب للتفعيل' : 'Contact via WhatsApp'}</span>
            </a>

            <button
              onClick={async () => {
                await logout();
                navigate('login');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Authenticated Student
  const student = user!;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Student Identity Chip */}
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
              <div className="flex items-center gap-2">
                <h1 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F]">
                  {student.fullName}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/40">
                  Level {student.mainLevel || 'Enrolled'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {student.email} • {student.learningFormat === 'individual' ? 'Private 1-on-1 (60 min)' : student.learningFormat === 'group' ? 'Group (90 min)' : 'CEFR Pathway'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Stars Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#0A192F] border border-[#D4AF37]/40 text-[#F3E5AB] flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <div className="text-left rtl:text-right">
                <span className="text-[10px] text-gray-400 block leading-none">English Zone Stars</span>
                <span className="font-bold text-base text-[#F3E5AB]">{student.points || 0} Points</span>
              </div>
            </div>

            <button
              onClick={() => navigate('avatar-studio')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#D4AF37]/50 text-[#0A192F] hover:bg-[#FAF8F5] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#AA820A]" />
              <span>{language === 'ar' ? 'استوديو الأفاتار' : 'Avatar Studio'}</span>
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

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', labelEn: 'Overview & Lessons', labelAr: 'نظرة عامة والدروس' },
            { id: 'stars', labelEn: 'English Zone Stars', labelAr: 'نجوم التحفيز ونقاطي' },
            { id: 'curriculum', labelEn: 'Curriculum & Stages', labelAr: 'المنهج والمراحل' },
            { id: 'homework', labelEn: 'Homework & Tests', labelAr: 'الواجبات والاختبارات' },
            { id: 'subscription', labelEn: 'Tuition & Invoices', labelAr: 'الاشتراك الشهري والفواتير' }
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
              {language === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TAB 1: OVERVIEW & LESSONS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Academic Status Cards */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Active Stage & Progress Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#AA820A]">
                      Current Academic Stage
                    </span>
                    <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-0.5">
                      Stage {student.currentStage || `${student.mainLevel || 'A1'}.1`}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#FAF8F5] text-xs font-bold text-[#0A192F] border border-gray-200">
                    Active Enrollment
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                    <span>{language === 'ar' ? 'نسبة إنجاز وحدات المرحلة:' : 'Stage Curriculum Progress:'}</span>
                    <span className="text-[#0A192F] font-bold">50% In Progress</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA820A] w-1/2 rounded-full"></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-100 pt-4 text-xs">
                  <div>
                    <span className="text-gray-400 block">{language === 'ar' ? 'الحصص المنجزة' : 'Lessons Attended'}</span>
                    <span className="font-bold text-sm text-[#0A192F]">8 / 16</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{language === 'ar' ? 'المعلم الأكاديمي' : 'Faculty Instructor'}</span>
                    <span className="font-bold text-sm text-[#0A192F]">{student.assignedTeacherName || 'Academic Faculty'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{language === 'ar' ? 'نظام الحصة' : 'Lesson Format'}</span>
                    <span className="font-bold text-sm text-[#0A192F]">
                      {student.learningFormat === 'individual' ? '60 Min Private' : '90 Min Group'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Live Classroom Schedule */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#AA820A]" />
                    <span>{language === 'ar' ? 'الحصة التفاعلية القادمة' : 'Next Scheduled Live Session'}</span>
                  </h3>
                  <span className="text-xs text-gray-500 font-semibold">
                    {student.learningFormat === 'individual' ? '60 Minutes (1-on-1)' : '90 Minutes (Group)'}
                  </span>
                </div>

                {timetable.length > 0 ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0A192F] to-[#102445] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-[#F3E5AB] uppercase tracking-wider block mb-1">
                        {timetable[0].time}
                      </span>
                      <h4 className="font-bold text-base text-white">
                        {timetable[0].topic}
                      </h4>
                      <p className="text-xs text-gray-300 mt-1">
                        Instructor: {timetable[0].teacherName} • Live Virtual Room
                      </p>
                    </div>

                    <a
                      href={timetable[0].zoomLink || "https://zoom.us"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#D4AF37] text-[#0A192F] hover:bg-[#F3E5AB] transition-colors whitespace-nowrap shadow"
                    >
                      {language === 'ar' ? 'دخول الفصل الافتراضي' : 'Join Live Classroom'}
                    </a>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0A192F] to-[#102445] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-[#F3E5AB] uppercase tracking-wider block mb-1">
                        Weekly Class Schedule
                      </span>
                      <h4 className="font-bold text-base text-white">
                        Interactive Live English Classroom
                      </h4>
                      <p className="text-xs text-gray-300 mt-1">
                        Instructor: {student.assignedTeacherName || 'Academic Faculty'}
                      </p>
                    </div>

                    <a
                      href="https://zoom.us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#D4AF37] text-[#0A192F] hover:bg-[#F3E5AB] transition-colors whitespace-nowrap shadow"
                    >
                      {language === 'ar' ? 'دخول الفصل الافتراضي' : 'Join Live Classroom'}
                    </a>
                  </div>
                )}
              </div>

            </div>

            {/* Right: English Zone Stars Recognition Showcase */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Star of the Week & Month Badges */}
              <div className="bg-gradient-to-br from-[#0A192F] via-[#102445] to-[#0A192F] text-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/50 shadow-xl space-y-4 text-center">
                <div className="flex justify-center">
                  <EnglishZoneEmblem sizeClass="w-16 h-16" glow={true} />
                </div>

                <h3 className="font-serif-luxury font-bold text-xl text-[#F3E5AB]">
                  Official Student Academic Pass
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Enrolled student: {student.fullName}. Verified CEFR {student.mainLevel || 'Pathway'} learner.
                </p>

                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-gray-400 block text-[10px]">Star of Week</span>
                    <span className="font-bold text-base text-[#D4AF37]">{student.starOfTheWeekCount || 0} Wins</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-gray-400 block text-[10px]">Star of Month</span>
                    <span className="font-bold text-base text-[#D4AF37]">{student.starOfTheMonthCount || 0} Wins</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('certificates')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#D4AF37] text-[#0A192F] hover:bg-[#F3E5AB] transition-colors"
                >
                  {language === 'ar' ? 'استعراض الشهادات الأكاديمية' : 'View Verified Certificates'}
                </button>
              </div>

              {/* Private Homework Summary */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
                <h4 className="font-serif-luxury font-bold text-sm text-[#0A192F]">
                  {language === 'ar' ? 'الواجبات والمهام الحالية' : 'Active Homework & Tasks'}
                </h4>
                {homeworkList.length === 0 ? (
                  <p className="text-xs text-gray-500 py-3 text-center">
                    {language === 'ar' ? 'لا توجد واجبات معلقة حالياً.' : 'No pending homework assignments.'}
                  </p>
                ) : (
                  homeworkList.map((hw) => (
                    <div key={hw.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#0A192F]">
                        <span>{language === 'ar' ? hw.titleAr : hw.titleEn}</span>
                        <span className="text-[10px] text-[#AA820A]">{hw.pointsAward}</span>
                      </div>
                      <div className="text-gray-500 text-[11px] flex items-center justify-between">
                        <span>Due: {hw.dueDate}</span>
                        <span className="capitalize font-semibold text-emerald-700">{hw.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: STARS & ACHIEVEMENTS */}
        {activeTab === 'stars' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
                  English Zone Stars Recognition Log
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Individual stars awarded for speaking participation, homework excellence, and test milestones.
                </p>
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-[#0A192F] text-[#F3E5AB] font-bold text-lg">
                Total: {student.points || 0} Stars
              </div>
            </div>

            {pointsLog.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto mb-2 opacity-50" />
                <p>{language === 'ar' ? 'سجل النجوم الخاص بك يبدأ مع أول حصة تفاعلية.' : 'Your star points log will track achievements from your live sessions.'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pointsLog.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#0A192F] block">{log.reason}</span>
                      <span className="text-gray-400 text-[10px]">Awarded by: {log.awardedBy} • {log.timestamp}</span>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">+{log.amount} Stars</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CURRICULUM & STAGES */}
        {activeTab === 'curriculum' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              Your Enrolled CEFR Curriculum Pathway
            </h2>
            <p className="text-sm text-gray-600">
              You are enrolled in the structured 6-Level, 18-Stage international English program. Each stage spans 2 months with live active speaking.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#AA820A]">Enrolled Level</span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">Level {student.mainLevel || 'A1'}</h4>
                <p className="text-xs text-gray-500 mt-1">International CEFR Standard</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Stage</span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">Stage {student.currentStage || `${student.mainLevel || 'A1'}.1`}</h4>
                <p className="text-xs text-gray-500 mt-1">Months 1–2 of current level</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Instruction Format</span>
                <h4 className="font-bold text-lg text-[#0A192F] mt-1">
                  {student.learningFormat === 'individual' ? '1-on-1 (60 min)' : 'Group (90 min)'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">100% Live speaking focus</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOMEWORK & GRADES */}
        {activeTab === 'homework' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              Academic Evaluations & Homework
            </h2>
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#0A192F] uppercase tracking-wider">
                Evaluations & Exam Grades
              </h3>
              {gradesList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#FAF8F5] text-center text-xs text-gray-500">
                  {language === 'ar' ? 'لم يتم رصد اختبارات أو تقييمات رسمية بعد.' : 'No exam records recorded yet. Stage evaluations take place at the end of each 2-month stage.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {gradesList.map((gr) => (
                    <div key={gr.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#0A192F] block">{gr.assessmentTitle}</span>
                        <span className="text-gray-400 text-[10px]">Level: {gr.level} • Evaluated: {gr.date}</span>
                      </div>
                      <span className="font-bold text-emerald-700 text-sm">{gr.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: TUITION & SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
              Tuition & Monthly Subscription
            </h2>
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A192F]">Subscription Plan</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                  {student.subscriptionStatus || 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-xs text-gray-600">Monthly Tuition Rate</span>
                <span className="font-bold text-base text-[#0A192F]">${student.monthlyTuitionUSD || 120} USD / Month</span>
              </div>
              <p className="text-xs text-gray-500 pt-2">
                Tuition covers live sessions, personal academic teacher feedback, learning materials, and milestone CEFR certificates.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
