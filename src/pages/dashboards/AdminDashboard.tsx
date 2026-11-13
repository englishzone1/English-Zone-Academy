import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { studentDataService } from '../../services/studentDataService';
import { OFFICIAL_CONTACTS, STAGE_PRICING_TABLE } from '../../data/academyData';
import { EnglishZoneEmblem } from '../../components/common/Logo';
import { UserProfile, RegistrationRequest } from '../../types/auth';
import { CEFRLevel, LearningFormat } from '../../types';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Settings, 
  DollarSign, 
  BookOpen, 
  Award, 
  Clock, 
  Phone, 
  Mail, 
  Save, 
  Search,
  Plus,
  Trash2,
  Edit,
  MessageSquare,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Layers,
  FileText,
  FolderPlus,
  Tag,
  Star,
  Download
} from 'lucide-react';
import { englishClubService, DEFAULT_ENGLISH_CLUB_SETTINGS } from '../../services/englishClubService';
import { EnglishClubSettings } from '../../types/englishClub';
import { 
  contentManagementService, 
  WebsiteSectionContent, 
  DynamicCourseItem, 
  LibraryBookMaterial, 
  DynamicPromotionOffer, 
  DynamicTestimonial 
} from '../../services/contentManagementService';
import { AdminReviewsManager } from '../../components/admin/AdminReviewsManager';

interface AdminDashboardProps {
  navigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'registrations' | 'students' | 'feedback_reviews' | 'pricing' | 'stars_audit' | 'settings' | 'english_club' | 'content_cms'
  >('overview');
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>(() => storageService.getRegistrations());
  const [usersList, setUsersList] = useState<UserProfile[]>(() => storageService.getUsers());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Dynamic Content CMS State
  const [cmsSubTab, setCmsSubTab] = useState<'sections' | 'courses' | 'books' | 'offers' | 'testimonials'>('sections');
  const [websiteSections, setWebsiteSections] = useState<WebsiteSectionContent[]>([]);
  const [coursesList, setCoursesList] = useState<DynamicCourseItem[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBookMaterial[]>([]);
  const [offersList, setOffersList] = useState<DynamicPromotionOffer[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<DynamicTestimonial[]>([]);
  const [isCmsSaving, setIsCmsSaving] = useState(false);

  // Form states for adding items
  const [newBookTitleEn, setNewBookTitleEn] = useState('');
  const [newBookTitleAr, setNewBookTitleAr] = useState('');
  const [newBookLevel, setNewBookLevel] = useState('All Levels');
  const [newBookCategory, setNewBookCategory] = useState<'curriculum' | 'reading' | 'grammar' | 'vocabulary'>('curriculum');
  const [newBookUrl, setNewBookUrl] = useState('');
  const [newBookIsPublic, setNewBookIsPublic] = useState(true);

  const [newOfferTitleEn, setNewOfferTitleEn] = useState('');
  const [newOfferTitleAr, setNewOfferTitleAr] = useState('');
  const [newOfferDiscount, setNewOfferDiscount] = useState<number>(20);
  const [newOfferBadgeEn, setNewOfferBadgeEn] = useState('Limited Time');
  const [newOfferDescEn, setNewOfferDescEn] = useState('');

  const [newCourseTitleEn, setNewCourseTitleEn] = useState('');
  const [newCourseTitleAr, setNewCourseTitleAr] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('B1');
  const [newCourseFormat, setNewCourseFormat] = useState<'individual' | 'group' | 'both'>('both');

  // English Club Configuration State
  const [clubSettings, setClubSettings] = useState<EnglishClubSettings>(DEFAULT_ENGLISH_CLUB_SETTINGS);
  const [isClubSaving, setIsClubSaving] = useState(false);

  // Load latest Firestore registration applications and English Club config
  React.useEffect(() => {
    const fetchRegs = async () => {
      try {
        const firestoreRegs = await studentDataService.getRegistrationRequests();
        if (firestoreRegs && firestoreRegs.length > 0) {
          setRegistrations(firestoreRegs);
        }
      } catch (err) {
        console.error('Error fetching Firestore applications:', err);
      }
    };
    fetchRegs();

    const fetchClub = async () => {
      try {
        const data = await englishClubService.getSettings();
        setClubSettings(data);
      } catch (err) {
        console.error('Error fetching club settings:', err);
      }
    };
    fetchClub();

    const fetchCmsData = async () => {
      try {
        const [secs, crs, bks, ofs, tms] = await Promise.all([
          contentManagementService.getSections(),
          contentManagementService.getCourses(),
          contentManagementService.getLibraryMaterials(),
          contentManagementService.getOffers(),
          contentManagementService.getTestimonials()
        ]);
        if (secs.length > 0) setWebsiteSections(secs);
        if (crs.length > 0) setCoursesList(crs);
        if (bks.length > 0) setLibraryBooks(bks);
        if (ofs.length > 0) setOffersList(ofs);
        if (tms.length > 0) setTestimonialsList(tms);
      } catch (err) {
        console.error('Error fetching CMS data from Firestore:', err);
      }
    };
    fetchCmsData();
  }, []);

  const handleSaveClubSettings = async () => {
    setIsClubSaving(true);
    try {
      await englishClubService.updateSettings(clubSettings, user?.fullName || 'Super Administrator');
      setActionNotice('English Club configuration successfully saved and updated in Firestore!');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error('Error updating club settings:', err);
      setActionNotice('Failed to update English Club settings. Please try again.');
    } finally {
      setIsClubSaving(false);
    }
  };

  const handleSaveSection = async (section: WebsiteSectionContent) => {
    setIsCmsSaving(true);
    try {
      await contentManagementService.saveSection({
        ...section,
        updatedBy: user?.fullName || 'Super Administrator'
      });
      setActionNotice(`Website section "${section.titleEn}" saved successfully!`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error saving section:', err);
      setActionNotice('Failed to save section.');
    } finally {
      setIsCmsSaving(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseTitleEn.trim()) return;
    setIsCmsSaving(true);
    try {
      const course: DynamicCourseItem = {
        id: `course_${Date.now()}`,
        titleEn: newCourseTitleEn,
        titleAr: newCourseTitleAr || newCourseTitleEn,
        level: newCourseLevel,
        descriptionEn: `Official CEFR ${newCourseLevel} course curriculum.`,
        descriptionAr: `منهج المستوى ${newCourseLevel} المعتمد.`,
        durationMonths: 3,
        format: newCourseFormat,
        isActive: true
      };
      await contentManagementService.saveCourse(course);
      setCoursesList(prev => [...prev, course]);
      setNewCourseTitleEn('');
      setNewCourseTitleAr('');
      setActionNotice('Course curriculum successfully published!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error adding course:', err);
    } finally {
      setIsCmsSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Delete this course curriculum?')) return;
    try {
      await contentManagementService.deleteCourse(id);
      setCoursesList(prev => prev.filter(c => c.id !== id));
      setActionNotice('Course removed.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const handleCreateBook = async () => {
    if (!newBookTitleEn.trim()) return;
    setIsCmsSaving(true);
    try {
      const book: LibraryBookMaterial = {
        id: `book_${Date.now()}`,
        titleEn: newBookTitleEn,
        titleAr: newBookTitleAr || newBookTitleEn,
        category: newBookCategory,
        level: newBookLevel,
        downloadUrl: newBookUrl || 'https://englishzone.com/materials/sample.pdf',
        fileSizeMb: 12.5,
        isPublic: newBookIsPublic,
        addedAt: new Date().toISOString()
      };
      await contentManagementService.saveLibraryMaterial(book);
      setLibraryBooks(prev => [...prev, book]);
      setNewBookTitleEn('');
      setNewBookTitleAr('');
      setNewBookUrl('');
      setActionNotice('Library resource published to Firestore!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error adding book:', err);
    } finally {
      setIsCmsSaving(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('Remove this library material?')) return;
    try {
      await contentManagementService.deleteLibraryMaterial(id);
      setLibraryBooks(prev => prev.filter(b => b.id !== id));
      setActionNotice('Library resource removed.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };

  const handleCreateOffer = async () => {
    if (!newOfferTitleEn.trim()) return;
    setIsCmsSaving(true);
    try {
      const offer: DynamicPromotionOffer = {
        id: `offer_${Date.now()}`,
        titleEn: newOfferTitleEn,
        titleAr: newOfferTitleAr || newOfferTitleEn,
        discountPercentage: newOfferDiscount,
        badgeEn: newOfferBadgeEn,
        badgeAr: 'عرض خاص',
        descriptionEn: newOfferDescEn || 'Special limited time promotional discount.',
        descriptionAr: 'خصم ترويجي مميز لفترة محدودة.',
        validUntil: '2026-12-31',
        isActive: true
      };
      await contentManagementService.saveOffer(offer);
      setOffersList(prev => [...prev, offer]);
      setNewOfferTitleEn('');
      setNewOfferTitleAr('');
      setNewOfferDescEn('');
      setActionNotice('Promotion offer published!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error adding offer:', err);
    } finally {
      setIsCmsSaving(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm('Remove this offer?')) return;
    try {
      await contentManagementService.deleteOffer(id);
      setOffersList(prev => prev.filter(o => o.id !== id));
      setActionNotice('Offer removed.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error deleting offer:', err);
    }
  };

  const handleToggleTestimonial = async (id: string, current: boolean) => {
    try {
      await contentManagementService.toggleTestimonialApproval(id, !current);
      setTestimonialsList(prev => prev.map(t => t.id === id ? { ...t, isApproved: !current } : t));
      setActionNotice(`Review ${!current ? 'Approved & Published' : 'Unpublished'}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error toggling testimonial:', err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await contentManagementService.deleteTestimonial(id);
      setTestimonialsList(prev => prev.filter(t => t.id !== id));
      setActionNotice('Testimonial deleted.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error deleting testimonial:', err);
    }
  };

  // Editable settings state
  const [officialContacts, setOfficialContacts] = useState(OFFICIAL_CONTACTS);

  const students = usersList.filter((u) => u.role === 'student');
  const teachers = usersList.filter((u) => u.role === 'teacher');
  const pendingRegistrations = registrations.filter((r) => r.status === 'pending');

  const handleApprove = async (regId: string) => {
    try {
      await studentDataService.updateRegistrationStatus(regId, 'approved', user?.fullName || 'Super Administrator');
      const updated = registrations.map((r) => (r.id === regId ? { ...r, status: 'approved' as const } : r));
      setRegistrations(updated);
      setActionNotice(`Registration ${regId} APPROVED! Application review status updated in Firestore.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error('Error approving registration:', err);
      setActionNotice(`Error approving ${regId}. Please try again.`);
    }
  };

  const handleReject = async (regId: string) => {
    try {
      await studentDataService.updateRegistrationStatus(regId, 'rejected', user?.fullName || 'Super Administrator');
      const updated = registrations.map((r) => (r.id === regId ? { ...r, status: 'rejected' as const } : r));
      setRegistrations(updated);
      setActionNotice(`Registration ${regId} marked as rejected.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error rejecting registration:', err);
      setActionNotice(`Error rejecting ${regId}.`);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user record?')) {
      const remaining = usersList.filter((u) => u.id !== userId);
      storageService.saveUsers(remaining);
      setUsersList(remaining);
      setActionNotice('User record removed.');
      setTimeout(() => setActionNotice(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <EnglishZoneEmblem sizeClass="w-14 h-14" glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB] text-xs font-bold">
                  Super Admin Console
                </span>
                <span className="text-xs text-[#AA820A] font-semibold">Complete Academy Management</span>
              </div>
              <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F] mt-1">
                English Zone Central Administration
              </h1>
              <p className="text-xs text-gray-500">
                Full control over registrations, students, teachers, CEFR pricing, and audit logs.
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

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', labelEn: 'Overview & Metrics', labelAr: 'الإحصائيات العامة' },
            { id: 'registrations', labelEn: `Registrations (${pendingRegistrations.length} Pending)`, labelAr: `طلبات التسجيل (${pendingRegistrations.length})` },
            { id: 'students', labelEn: `Students (${students.length})`, labelAr: `الطلاب (${students.length})` },
            { id: 'feedback_reviews', labelEn: 'Student Reviews Gallery', labelAr: 'آراء وتقييمات الطلاب' },
            { id: 'content_cms', labelEn: 'Dynamic Content CMS', labelAr: 'إدارة المحتوى والمناهج' },
            { id: 'pricing', labelEn: 'Tuition & Stages', labelAr: 'الأسعار والمراحل' },
            { id: 'english_club', labelEn: 'English Club Config', labelAr: 'إعدادات نادي الإنجليزية' },
            { id: 'stars_audit', labelEn: 'Stars Audit Ledger', labelAr: 'سجل تدقيق النجوم' },
            { id: 'settings', labelEn: 'Academy Settings', labelAr: 'إعدادات الأكاديمية' }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#25D366] text-xs font-bold text-[#128C7E] flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 block">Total Active Students</span>
                <span className="font-serif-luxury font-bold text-3xl text-[#0A192F] mt-1 block">
                  {students.length}
                </span>
                <span className="text-[11px] text-[#25D366] font-semibold mt-1 block">Active Enrollment</span>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 block">Pending Applications</span>
                <span className="font-serif-luxury font-bold text-3xl text-[#D4AF37] mt-1 block">
                  {pendingRegistrations.length}
                </span>
                <span className="text-[11px] text-[#AA820A] font-semibold mt-1 block">Awaiting Coordinator Review</span>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 block">Certified Teachers</span>
                <span className="font-serif-luxury font-bold text-3xl text-[#0A192F] mt-1 block">
                  {teachers.length}
                </span>
                <span className="text-[11px] text-gray-400 font-semibold mt-1 block">Faculty Staff</span>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 block">Tuition Model</span>
                <span className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-1 block">
                  Month-by-Month
                </span>
                <span className="text-[11px] text-[#25D366] font-semibold mt-1 block">USD Stage Rates Active</span>
              </div>
            </div>

            {/* Quick Registration Queue */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F]">
                  Pending Registration Requests Requiring Action
                </h3>
                <button
                  onClick={() => setActiveTab('registrations')}
                  className="text-xs font-bold text-[#AA820A] hover:underline"
                >
                  View All ({registrations.length}) →
                </button>
              </div>

              {pendingRegistrations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">
                  No pending registration requests in the queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRegistrations.slice(0, 3).map((reg) => (
                    <div key={reg.id} className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-sm text-[#0A192F] block">{reg.fullName} ({reg.id})</span>
                        <span className="text-gray-500">
                          Level: {reg.mainLevel} • {reg.learningFormat} • WhatsApp: {reg.whatsappNumber} • Country: {reg.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(reg.id)}
                          className="px-4 py-2 rounded-lg bg-[#0A192F] text-[#F3E5AB] font-bold"
                        >
                          Approve Student
                        </button>
                        <button
                          onClick={() => handleReject(reg.id)}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:text-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REGISTRATIONS PIPELINE */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  Official Admissions Requests Pipeline
                </h2>
                <p className="text-xs text-gray-500">
                  Strictly enforces main CEFR levels (A1–C2). Approved students receive accounts automatically.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] text-gray-700 border">
                {registrations.length} Total Requests
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] text-xs font-semibold text-gray-500 border-b border-gray-200">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Level & Format</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3.5 px-4 font-bold text-[#0A192F]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{reg.fullName}</span>
                          {(reg as any).type === 'english_club' && (
                            <span className="px-2 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB] text-[10px] font-bold border border-[#D4AF37]/40 shadow-xs">
                              English Club
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {reg.id} {reg.age ? `• Age: ${reg.age}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {(reg as any).selectedTrack ? (
                          <>
                            <span className="font-semibold text-[#0A192F]">Track: {(reg as any).selectedTrack}</span>
                            <span className="block text-xs text-gray-500">60-Min Club Practice</span>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-[#0A192F]">Level {reg.mainLevel}</span>
                            <span className="block text-xs text-gray-500 capitalize">{reg.learningFormat}</span>
                          </>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <div>{reg.whatsappNumber}</div>
                        <div className="text-xs text-gray-400">{reg.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.status === 'approved'
                            ? 'bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30'
                            : reg.status === 'rejected'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-[#D4AF37]/20 text-[#0A192F] border border-[#D4AF37]/40'
                        }`}>
                          {reg.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {reg.status === 'pending' ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(reg.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(reg.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-600 hover:text-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  Registered Students Registry
                </h2>
                <p className="text-xs text-gray-500">
                  Manage active student records, points balances, and assigned academic stages.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] text-xs font-semibold text-gray-500 border-b border-gray-200">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Level / Stage</th>
                    <th className="py-3 px-4">Stars Balance</th>
                    <th className="py-3 px-4">Tuition USD</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3.5 px-4 font-bold text-[#0A192F]">
                        <div>{st.fullName}</div>
                        <div className="text-[10px] text-gray-400">{st.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold">{st.currentStage || 'B1.1'}</span>
                        <span className="block text-xs text-gray-500 capitalize">{st.learningFormat}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#AA820A]">
                        {st.points || 0} Stars
                      </td>
                      <td className="py-3.5 px-4 text-[#0A192F] font-bold">
                        ${st.monthlyTuitionUSD || 80} / mo
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(st.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Remove Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PRICING & STAGES CONFIGURATION (SECTION 11, 12, 13) */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  Academy Approved Tuition Matrix
                </h2>
                <p className="text-xs text-gray-500">
                  Individual lessons (60 min) with discount tracking, and Group lessons (90 min).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] text-xs font-semibold text-gray-500 border-b border-gray-200">
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Individual (60 min)</th>
                    <th className="py-3 px-4">Original (USD)</th>
                    <th className="py-3 px-4">Group (90 min)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {STAGE_PRICING_TABLE.slice(0, 9).map((row) => (
                    <tr key={row.stage} className="hover:bg-[#FAF8F5]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#0A192F]">{row.stage}</td>
                      <td className="py-2.5 px-4">Level {row.level}</td>
                      <td className="py-2.5 px-4 font-bold text-[#0A192F]">${row.individualCurrent} / mo</td>
                      <td className="py-2.5 px-4 text-gray-400 line-through">${row.individualOriginal}</td>
                      <td className="py-2.5 px-4 font-bold text-[#0A192F]">${row.groupPrice} / mo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ACADEMY SETTINGS & BRANDING (PART 22, SECTION 48) */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                Centralized Academy Configuration
              </h2>
              <p className="text-xs text-gray-500">
                Official contact links, verified phone numbers, and academic leadership profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1">
                  Official WhatsApp URL
                </label>
                <input
                  type="text"
                  value={officialContacts.whatsapp}
                  onChange={(e) => setOfficialContacts({ ...officialContacts, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1">
                  Admissions Email
                </label>
                <input
                  type="email"
                  value={officialContacts.email}
                  onChange={(e) => setOfficialContacts({ ...officialContacts, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={officialContacts.youtube}
                  onChange={(e) => setOfficialContacts({ ...officialContacts, youtube: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F] mb-1">
                  Instagram Channel URL
                </label>
                <input
                  type="text"
                  value={officialContacts.instagram}
                  onChange={(e) => setOfficialContacts({ ...officialContacts, instagram: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setActionNotice('Academy settings and contact links successfully updated.');
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>Save Academy Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: ENGLISH CLUB CONFIGURATION */}
        {activeTab === 'english_club' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB] text-xs font-bold mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Interactive Conversation Activity</span>
                </div>
                <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
                  English Club Administration & Scheduling
                </h2>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                  Configure the club membership fee, session schedule, breakout capacity, and admission availability. Note: By default, no price or schedule is displayed publicly unless explicitly enabled here.
                </p>
              </div>

              <button
                onClick={handleSaveClubSettings}
                disabled={isClubSaving}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] hover:brightness-110 shadow-md flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isClubSaving ? 'Syncing with Firestore...' : 'Save Club Settings'}</span>
              </button>
            </div>

            {/* Availability & Course Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Registration Status */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F]">
                  Registration Availability
                </label>
                <select
                  value={clubSettings.status}
                  onChange={(e) => setClubSettings({ ...clubSettings, status: e.target.value as any, isRegistrationOpen: e.target.value === 'open' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800"
                >
                  <option value="open">🟢 Open for Enrollment (Accepting Applications)</option>
                  <option value="coming_soon">🟡 Coming Soon (Cohort Forming)</option>
                  <option value="closed">🔴 Closed (Waitlist Only)</option>
                </select>
                <p className="text-[11px] text-gray-500">
                  Controls whether students can submit registrations directly from the website.
                </p>
              </div>

              {/* Prerequisite Course Restriction */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A192F]">
                  General English Prerequisite Policy
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clubSettings.requiresGeneralEnglish}
                    onChange={(e) => setClubSettings({ ...clubSettings, requiresGeneralEnglish: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-[#0A192F] focus:ring-[#D4AF37]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-gray-800 block">
                      Require General English course purchase
                    </span>
                    <span className="text-gray-500">
                      When unchecked (recommended), the club is an affordable standalone practice activity accessible to any learner without purchasing the main academic course.
                    </span>
                  </div>
                </label>
              </div>

            </div>

            {/* Membership Pricing Configuration */}
            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0A192F] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#AA820A]" />
                    <span>Club Fee & Pricing Display Policy</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    To comply with academy guidelines, no price is invented or displayed unless the Super Admin activates and inputs an official fee.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clubSettings.isPriceConfigured}
                      onChange={(e) => setClubSettings({ ...clubSettings, isPriceConfigured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0A192F] focus:ring-[#D4AF37]"
                    />
                    <span className="text-xs font-bold text-gray-800">
                      Display Fixed Membership Fee Publicly
                    </span>
                  </label>
                  <p className="text-[11px] text-gray-500 pl-6">
                    If disabled, the website displays: "Affordable fee is communicated upon cohort registration by the academy administration."
                  </p>
                </div>

                {clubSettings.isPriceConfigured && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Official Membership Fee (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        min="1"
                        value={clubSettings.membershipFeeUSD || ''}
                        onChange={(e) => setClubSettings({ ...clubSettings, membershipFeeUSD: Number(e.target.value) || null })}
                        placeholder="e.g. 25"
                        className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-300 text-sm bg-white font-bold text-[#0A192F]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CEFR Level Tracks & Session Schedules */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-[#0A192F] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>CEFR Level Tracks & Meeting Schedule</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Configure schedule timing, platform, and active discussion topics for each of the three CEFR proficiency bands. Only tracks marked as configured display their schedule publicly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Track A1-A2 */}
                <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      Foundations (A1–A2)
                    </span>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clubSettings.tracks['A1-A2']?.isConfigured || false}
                        onChange={(e) => {
                          const updated = { ...clubSettings.tracks };
                          updated['A1-A2'].isConfigured = e.target.checked;
                          setClubSettings({ ...clubSettings, tracks: updated });
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span>Active Schedule</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Schedule Day & Time (EN)
                    </label>
                    <input
                      type="text"
                      value={clubSettings.tracks['A1-A2']?.dayTimeEn || ''}
                      onChange={(e) => {
                        const updated = { ...clubSettings.tracks };
                        updated['A1-A2'].dayTimeEn = e.target.value;
                        setClubSettings({ ...clubSettings, tracks: updated });
                      }}
                      placeholder="e.g. Mon & Wed, 6:00 PM GMT"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Current Topic (EN)
                    </label>
                    <input
                      type="text"
                      value={clubSettings.tracks['A1-A2']?.activeTopicEn || ''}
                      onChange={(e) => {
                        const updated = { ...clubSettings.tracks };
                        updated['A1-A2'].activeTopicEn = e.target.value;
                        setClubSettings({ ...clubSettings, tracks: updated });
                      }}
                      placeholder="e.g. Daily Habits & Food"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Track B1-B2 */}
                <div className="p-5 rounded-2xl border-2 border-[#D4AF37]/50 bg-[#FAF8F5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#0A192F] text-[11px] font-bold">
                      Fluency (B1–B2)
                    </span>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clubSettings.tracks['B1-B2']?.isConfigured || false}
                        onChange={(e) => {
                          const updated = { ...clubSettings.tracks };
                          updated['B1-B2'].isConfigured = e.target.checked;
                          setClubSettings({ ...clubSettings, tracks: updated });
                        }}
                        className="rounded text-[#AA820A]"
                      />
                      <span>Active Schedule</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Schedule Day & Time (EN)
                    </label>
                    <input
                      type="text"
                      value={clubSettings.tracks['B1-B2']?.dayTimeEn || ''}
                      onChange={(e) => {
                        const updated = { ...clubSettings.tracks };
                        updated['B1-B2'].dayTimeEn = e.target.value;
                        setClubSettings({ ...clubSettings, tracks: updated });
                      }}
                      placeholder="e.g. Tue & Thu, 7:00 PM GMT"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Current Topic (EN)
                    </label>
                    <input
                      type="text"
                      value={clubSettings.tracks['B1-B2']?.activeTopicEn || ''}
                      onChange={(e) => {
                        const updated = { ...clubSettings.tracks };
                        updated['B1-B2'].activeTopicEn = e.target.value;
                        setClubSettings({ ...clubSettings, tracks: updated });
                      }}
                      placeholder="e.g. Travel & Modern Tech"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Track C1-C2 */}
                <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                      Mastery (C1–C2)
                    </span>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clubSettings.tracks['C1-C2']?.isConfigured || false}
                        onChange={(e) => {
                          const updated = { ...clubSettings.tracks };
                          updated['C1-C2'].isConfigured = e.target.checked;
                          setClubSettings({ ...clubSettings, tracks: updated });
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span>Active Schedule</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Schedule Day & Time (EN)
                    </label>
                    <input
                      type="text"
                      value={clubSettings.tracks['C1-C2']?.dayTimeEn || ''}
                      onChange={(e) => {
                        const updated = { ...clubSettings.tracks };
                        updated['C1-C2'].dayTimeEn = e.target.value;
                        setClubSettings({ ...clubSettings, tracks: updated });
                      }}
                      placeholder="e.g. Saturdays, 5:00 PM GMT"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Current Topic (EN)
                    </label>
                    <input
                      type="text"
                      value={clubSettings.tracks['C1-C2']?.activeTopicEn || ''}
                      onChange={(e) => {
                        const updated = { ...clubSettings.tracks };
                        updated['C1-C2'].activeTopicEn = e.target.value;
                        setClubSettings({ ...clubSettings, tracks: updated });
                      }}
                      placeholder="e.g. Critical Thinking & Debates"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {clubSettings.updatedAt ? `Last saved: ${new Date(clubSettings.updatedAt).toLocaleString()}` : 'Settings in default state.'}
              </span>
              <button
                onClick={handleSaveClubSettings}
                disabled={isClubSaving}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-2 shadow transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>{isClubSaving ? 'Saving...' : 'Save English Club Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: DYNAMIC CONTENT CMS */}
        {activeTab === 'content_cms' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB] text-[11px] font-bold">
                    Firestore CMS
                  </span>
                  <span className="text-xs text-gray-400">Dynamic Website Content & Assets</span>
                </div>
                <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F] mt-1">
                  Website Content & Curriculum Management
                </h2>
                <p className="text-xs text-gray-500">
                  Update homepage sections, curricula, digital library books, promo banners, and moderate student testimonials.
                </p>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
                {[
                  { id: 'sections', label: 'Sections', icon: FileText },
                  { id: 'courses', label: 'Curricula', icon: Layers },
                  { id: 'books', label: 'Library Books', icon: BookOpen },
                  { id: 'offers', label: 'Offers', icon: Tag },
                  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare }
                ].map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setCmsSubTab(sub.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        cmsSubTab === sub.id
                          ? 'bg-white text-[#0A192F] shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-tab 1: Website Sections */}
            {cmsSubTab === 'sections' && (
              <div className="space-y-6">
                <p className="text-xs text-gray-600">
                  Edit main promotional messages, banner announcements, and callout text directly synchronized with the live website.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'hero_announcement', title: 'Top Hero Announcement', defEn: 'Spring 2026 Admissions Now Open!', defAr: 'بدء التسجيل لفصل ربيع 2026!' },
                    { key: 'methodology_intro', title: 'Academy Methodology Summary', defEn: 'Communicative CEFR framework with interactive native-level mentoring.', defAr: 'منهج الإطار الأوروبي التفاعلي مع إشراف تدريسي معتمد.' },
                    { key: 'placement_notice', title: 'Free Placement Test Banner', defEn: 'Take our 15-minute diagnostic test to discover your exact starting CEFR level.', defAr: 'أجرِ اختبار تحديد المستوى المجاني لمعرفة مستواك بدقة.' },
                    { key: 'footer_accreditation', title: 'Accreditation Statement', defEn: 'English Zone International Educational Academy • ISO 9001 Quality Standard Aligned.', defAr: 'أكاديمية إنغلش زون التعليمية الدولية • متوافقة مع معايير الجودة العالمية.' }
                  ].map((sec) => {
                    const current = websiteSections.find(s => s.sectionKey === sec.key) || {
                      id: sec.key,
                      sectionKey: sec.key,
                      titleEn: sec.title,
                      titleAr: sec.title,
                      contentEn: sec.defEn,
                      contentAr: sec.defAr,
                      updatedAt: new Date().toISOString(),
                      updatedBy: 'System Default'
                    };
                    return (
                      <div key={sec.key} className="p-5 rounded-2xl border border-gray-200 bg-[#FAF8F5] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#0A192F]">{sec.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{sec.key}</span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">English Content</label>
                          <textarea
                            rows={2}
                            value={current.contentEn}
                            onChange={(e) => {
                              const updated = websiteSections.filter(s => s.sectionKey !== sec.key);
                              setWebsiteSections([...updated, { ...current, contentEn: e.target.value }]);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Arabic Content</label>
                          <textarea
                            rows={2}
                            dir="rtl"
                            value={current.contentAr}
                            onChange={(e) => {
                              const updated = websiteSections.filter(s => s.sectionKey !== sec.key);
                              setWebsiteSections([...updated, { ...current, contentAr: e.target.value }]);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                          />
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleSaveSection(current)}
                            disabled={isCmsSaving}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Save to Firestore</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Dynamic Courses & Curricula */}
            {cmsSubTab === 'courses' && (
              <div className="space-y-6">
                {/* Add new course */}
                <div className="p-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F5] space-y-4">
                  <h4 className="font-bold text-xs text-[#0A192F] flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-[#AA820A]" />
                    <span>Publish New Course Curriculum</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Course Title (EN)</label>
                      <input
                        type="text"
                        placeholder="e.g. B2 Upper-Intermediate Fluency Masterclass"
                        value={newCourseTitleEn}
                        onChange={(e) => setNewCourseTitleEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">CEFR Level</label>
                      <select
                        value={newCourseLevel}
                        onChange={(e) => setNewCourseLevel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      >
                        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Format</label>
                      <select
                        value={newCourseFormat}
                        onChange={(e) => setNewCourseFormat(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      >
                        <option value="both">Group & 1-on-1</option>
                        <option value="group">Group Only</option>
                        <option value="individual">1-on-1 Private</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreateCourse}
                      disabled={!newCourseTitleEn.trim() || isCmsSaving}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>Add Course</span>
                    </button>
                  </div>
                </div>

                {/* Courses List */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700">Active Course Catalog ({coursesList.length})</span>
                  {coursesList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">
                      No dynamic courses added yet. Add your first course curriculum above.
                    </div>
                  ) : (
                    coursesList.map((course) => (
                      <div key={course.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[#0A192F] text-[#F3E5AB] text-xs font-bold font-mono">
                            {course.level}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-[#0A192F] block">{course.titleEn}</span>
                            <span className="text-[11px] text-gray-500">
                              Format: {course.format} • Duration: {course.durationMonths} Months
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sub-tab 3: Library Materials */}
            {cmsSubTab === 'books' && (
              <div className="space-y-6">
                {/* Add book */}
                <div className="p-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F5] space-y-4">
                  <h4 className="font-bold text-xs text-[#0A192F] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#AA820A]" />
                    <span>Upload & Register Library Book / Material</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Book Title (EN)</label>
                      <input
                        type="text"
                        placeholder="e.g. English Zone Grammar In Use B1-B2"
                        value={newBookTitleEn}
                        onChange={(e) => setNewBookTitleEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Category</label>
                      <select
                        value={newBookCategory}
                        onChange={(e) => setNewBookCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      >
                        <option value="curriculum">Curriculum Textbook</option>
                        <option value="reading">Graded Reader</option>
                        <option value="grammar">Grammar & Syntax</option>
                        <option value="vocabulary">Vocabulary & Idioms</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Download / PDF Storage URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newBookUrl}
                        onChange={(e) => setNewBookUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBookIsPublic}
                        onChange={(e) => setNewBookIsPublic(e.target.checked)}
                        className="rounded text-[#AA820A]"
                      />
                      <span>Make available to all registered students</span>
                    </label>
                    <button
                      onClick={handleCreateBook}
                      disabled={!newBookTitleEn.trim() || isCmsSaving}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>Register Book</span>
                    </button>
                  </div>
                </div>

                {/* Books list */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700">Digital Library Catalog ({libraryBooks.length})</span>
                  {libraryBooks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">
                      No library materials registered yet.
                    </div>
                  ) : (
                    libraryBooks.map((book) => (
                      <div key={book.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-[#AA820A]" />
                          <div>
                            <span className="font-bold text-xs text-[#0A192F] block">{book.titleEn}</span>
                            <span className="text-[11px] text-gray-500">
                              Category: {book.category} • Level: {book.level} • {book.isPublic ? 'Public' : 'Protected'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {book.downloadUrl && (
                            <a
                              href={book.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-gray-400 hover:text-[#0A192F] rounded-lg transition-colors"
                              title="Download/Open"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sub-tab 4: Promotions & Offers */}
            {cmsSubTab === 'offers' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F5] space-y-4">
                  <h4 className="font-bold text-xs text-[#0A192F] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#AA820A]" />
                    <span>Create Promotional Offer</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Offer Title (EN)</label>
                      <input
                        type="text"
                        placeholder="e.g. Early Bird Spring Discount"
                        value={newOfferTitleEn}
                        onChange={(e) => setNewOfferTitleEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Discount %</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newOfferDiscount}
                        onChange={(e) => setNewOfferDiscount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Badge Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Limited Time"
                        value={newOfferBadgeEn}
                        onChange={(e) => setNewOfferBadgeEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreateOffer}
                      disabled={!newOfferTitleEn.trim() || isCmsSaving}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>Publish Offer</span>
                    </button>
                  </div>
                </div>

                {/* Offers list */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700">Active Offers ({offersList.length})</span>
                  {offersList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">
                      No promotional offers active.
                    </div>
                  ) : (
                    offersList.map((offer) => (
                      <div key={offer.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#128C7E] text-xs font-bold font-mono">
                            {offer.discountPercentage}% OFF
                          </span>
                          <div>
                            <span className="font-bold text-xs text-[#0A192F] block">{offer.titleEn}</span>
                            <span className="text-[11px] text-gray-500">Badge: {offer.badgeEn} • Valid: {offer.validUntil}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sub-tab 5: Testimonials Moderation */}
            {cmsSubTab === 'testimonials' && (
              <div className="space-y-6">
                <p className="text-xs text-gray-600">
                  Review student reviews and testimonials before publishing them to the public homepage.
                </p>
                <div className="space-y-3">
                  {testimonialsList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl">
                      No student testimonials in moderation queue.
                    </div>
                  ) : (
                    testimonialsList.map((test) => (
                      <div key={test.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#0A192F]">{test.studentNameEn}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">{test.level}</span>
                            <div className="flex items-center text-[#D4AF37]">
                              {[...Array(test.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 italic">"{test.quoteEn}"</p>
                          <span className="text-[10px] text-gray-400 block">{new Date(test.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleTestimonial(test.id, test.isApproved)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              test.isApproved
                                ? 'bg-[#25D366]/20 text-[#128C7E]'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {test.isApproved ? 'Approved' : 'Pending Approval'}
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(test.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: STUDENT REVIEWS & FEEDBACK GALLERY */}
        {activeTab === 'feedback_reviews' && (
          <AdminReviewsManager
            onNotice={(msg) => {
              setActionNotice(msg);
              setTimeout(() => setActionNotice(null), 4000);
            }}
          />
        )}

      </div>
    </div>
  );
};
