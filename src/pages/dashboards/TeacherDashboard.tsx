import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { EnglishZoneEmblem } from '../../components/common/Logo';
import { 
  Users, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  LogOut, 
  Plus, 
  Minus, 
  FileText, 
  Award,
  Search
} from 'lucide-react';

interface TeacherDashboardProps {
  navigate: (route: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'classes' | 'stars_manager' | 'gradebook'>('classes');
  const allUsers = storageService.getUsers();
  const students = allUsers.filter((u) => u.role === 'student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [pointsReason, setPointsReason] = useState<string>('Speaking English in class');
  const [customPoints, setCustomPoints] = useState<number>(5);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleAwardPoints = (pointsDelta: number, reasonText: string) => {
    storageService.addPointsTransaction(
      selectedStudentId,
      pointsDelta,
      reasonText,
      user?.fullName || 'Senior Academic Instructor'
    );
    setActionSuccess(`${pointsDelta > 0 ? '+' : ''}${pointsDelta} Stars awarded for "${reasonText}"!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <EnglishZoneEmblem sizeClass="w-14 h-14" glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB] text-xs font-bold">
                  Instructor Workspace
                </span>
                <span className="text-xs text-gray-500">English Zone Academic Faculty</span>
              </div>
              <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F] mt-1">
                {user?.fullName || 'Senior Academic Instructor'}
              </h1>
              <p className="text-xs text-gray-500">
                Active assigned students: {students.length} • 4 Weekly Classrooms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                logout();
                navigate('login');
              }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'classes' ? 'bg-[#0A192F] text-[#F3E5AB] shadow' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {language === 'ar' ? 'الفصول والطلاب المسندين' : 'Assigned Students & Classes'}
          </button>
          <button
            onClick={() => setActiveTab('stars_manager')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'stars_manager' ? 'bg-[#0A192F] text-[#F3E5AB] shadow' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {language === 'ar' ? 'منح وتعديل نجوم English Zone Stars' : 'English Zone Stars Manager'}
          </button>
          <button
            onClick={() => setActiveTab('gradebook')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'gradebook' ? 'bg-[#0A192F] text-[#F3E5AB] shadow' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {language === 'ar' ? 'سجل الدرجات وتصحيح الواجبات' : 'Gradebook & Homework Review'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#25D366] text-xs font-bold text-[#128C7E] flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* TAB 1: ASSIGNED STUDENTS */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'الطلاب المسندين في فصولك' : 'Your Enrolled Students'}</span>
              </h2>
              <span className="text-xs text-gray-500 font-semibold">{students.length} Active Students</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((st) => (
                <div key={st.id} className="p-5 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#0A192F]">{st.fullName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB]">
                      {st.currentStage || 'B1.1'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Format: {st.learningFormat === 'individual' ? 'Private 1-on-1 (60 min)' : 'Group (90 min)'}</div>
                    <div>WhatsApp: {st.phone || 'Available'}</div>
                    <div className="font-semibold text-[#AA820A]">Stars Balance: {st.points || 0} Stars</div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedStudentId(st.id);
                        setActiveTab('stars_manager');
                      }}
                      className="text-xs font-bold text-[#0A192F] hover:text-[#AA820A]"
                    >
                      Award Stars →
                    </button>
                    <span className="text-[10px] text-[#25D366] font-bold">100% Attendance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ENGLISH ZONE STARS MANAGER (PART 12) */}
        {activeTab === 'stars_manager' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#AA820A]">
                ClassDojo-Inspired Academic Motivation
              </span>
              <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-1">
                English Zone Stars Points Manager
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ar'
                  ? 'اختر الطالب والنشاط لمنح أو خصم النقاط مع توثيق السبب في سجل التدقيق الأكاديمي.'
                  : 'Select a student and an activity to award or deduct motivation stars with mandatory reason logging.'}
              </p>
            </div>

            {/* Student selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-2">
                {language === 'ar' ? 'اختر الطالب المستهدف:' : 'Target Student:'}
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.currentStage || 'B1.1'} - Current: {st.points || 0} Stars)
                  </option>
                ))}
              </select>
            </div>

            {/* Official Activity Quick Buttons (Section 22) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-3">
                {language === 'ar' ? 'أنشطة التقييم المعتمدة بالأكاديمية:' : 'Approved Academy Points Activities:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Attendance & Punctuality', points: 5, icon: Plus },
                  { name: 'Homework Completion', points: 10, icon: Plus },
                  { name: 'Class Participation', points: 5, icon: Plus },
                  { name: 'Speaking English Only', points: 5, icon: Plus },
                  { name: 'Helping a Classmate', points: 3, icon: Plus },
                  { name: 'Breaking Classroom Rules', points: -3, icon: Minus }
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleAwardPoints(act.points, act.name)}
                    className={`p-4 rounded-xl border text-left rtl:text-right transition-all flex items-center justify-between ${
                      act.points > 0
                        ? 'bg-[#FAF8F5] border-gray-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
                        : 'bg-red-50/50 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#0A192F]">{act.name}</div>
                      <span className={`text-xs font-extrabold ${act.points > 0 ? 'text-[#128C7E]' : 'text-red-600'}`}>
                        {act.points > 0 ? `+${act.points}` : act.points} Stars
                      </span>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                      act.points > 0 ? 'bg-[#0A192F]' : 'bg-red-600'
                    }`}>
                      <act.icon className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GRADEBOOK */}
        {activeTab === 'gradebook' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              <span>{language === 'ar' ? 'سجل الدرجات والواجبات المستلمة' : 'Class Gradebook & Assignment Submissions'}</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] text-xs font-semibold text-gray-500 border-b border-gray-200">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Assignment / Test</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-gray-500">
                        {language === 'ar' ? 'لا يوجد طلاب مسجلون في هذه الشعبة بعد.' : 'No enrolled students assigned to this cohort yet.'}
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr key={st.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-4 font-bold text-[#0A192F]">{st.fullName}</td>
                        <td className="py-3.5 px-4">Stage Assessment & Speaking Tasks</td>
                        <td className="py-3.5 px-4 font-mono">Stage {st.currentStage || `${st.mainLevel || 'A1'}.1`}</td>
                        <td className="py-3.5 px-4 font-bold text-[#128C7E]">{st.points || 0} Stars</td>
                        <td className="py-3.5 px-4">
                          <button 
                            onClick={() => alert(`Reviewing academic records for ${st.fullName}`)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-white"
                          >
                            Review Output
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
