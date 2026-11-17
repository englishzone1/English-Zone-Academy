import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { studentDataService } from '../../services/studentDataService';
import { STAGE_PRICING_TABLE } from '../../data/academyData';
import { EnglishZoneEmblem } from '../../components/common/Logo';
import { UserProfile, RegistrationRequest } from '../../types/auth';
import { StagePricing } from '../../types';
import {
  CheckCircle2,
  XCircle,
  LogOut,
  DollarSign,
  BookOpen,
  Save,
  Plus,
  Trash2,
  MessageSquare,
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
  AcademySettings,
  WebsiteSectionContent,
  DynamicCourseItem,
  LibraryBookMaterial,
  DynamicPromotionOffer,
  DynamicTestimonial
} from '../../services/contentManagementService';
import { AdminReviewsManager } from '../../components/admin/AdminReviewsManager';
import { AdminStudentsManager } from '../../components/admin/AdminStudentsManager';
import { AdminStarsLedger } from '../../components/admin/AdminStarsLedger';
import { AdminBlogManager } from '../../components/admin/AdminBlogManager';
import { AdminCourseMaterials } from '../../components/admin/AdminCourseMaterials';
import { groupService } from '../../services/groupService';
import { CommunityFeed } from '../../components/community/CommunityFeed';
import { AdminMessagesManager } from '../../components/admin/AdminMessagesManager';

interface AdminDashboardProps {
  navigate: (route: string) => void;
}

type TabId =
  | 'overview'
  | 'blog'
  | 'messages'
  | 'community'
  | 'registrations'
  | 'students'
  | 'feedback_reviews'
  | 'pricing'
  | 'stars_audit'
  | 'settings'
  | 'english_club'
  | 'content_cms';

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]';
const labelCls = 'block text-[11px] font-bold text-gray-600 mb-1';
const cardCls = 'bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6';
const boxCls = 'p-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FAF8F5] space-y-4';
const emptyCls = 'p-8 text-center text-xs text-gray-500 bg-[#FAF8F5] rounded-2xl';
const primaryBtn =
  'px-5 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] flex items-center gap-1.5 disabled:opacity-50';
const thCls = 'py-3 px-4';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { language } = useLanguage();
  const { user, logout, firebaseUser } = useAuth();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const adminName = user?.fullName || tr('Super Administrator', 'المدير العام');

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // عند فتح لوحة الإدارة: تحديث لوحات المجموعات التي يراها الطلاب (الاسم والنقاط)
  useEffect(() => {
    groupService.syncAllMembers().catch((err) => console.error('Group boards sync failed:', err));
  }, []);
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [noticeIsError, setNoticeIsError] = useState(false);

  const notify = (msg: string, ms = 3000, isError = false) => {
    setNoticeIsError(isError);
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), ms);
  };

  // CMS state
  const [cmsSubTab, setCmsSubTab] = useState<'sections' | 'courses' | 'books' | 'offers' | 'testimonials'>('sections');
  const [websiteSections, setWebsiteSections] = useState<WebsiteSectionContent[]>([]);
  const [coursesList, setCoursesList] = useState<DynamicCourseItem[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBookMaterial[]>([]);
  const [offersList, setOffersList] = useState<DynamicPromotionOffer[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<DynamicTestimonial[]>([]);
  const [isCmsSaving, setIsCmsSaving] = useState(false);

  // New book form
  const [newBookTitleEn, setNewBookTitleEn] = useState('');
  const [newBookTitleAr, setNewBookTitleAr] = useState('');
  const [newBookLevel, setNewBookLevel] = useState('All Levels');
  const [newBookCategory, setNewBookCategory] = useState<'curriculum' | 'reading' | 'grammar' | 'vocabulary'>('curriculum');
  const [newBookUrl, setNewBookUrl] = useState('');
  const [newBookIsPublic, setNewBookIsPublic] = useState(true);

  // New offer form
  const [newOfferTitleEn, setNewOfferTitleEn] = useState('');
  const [newOfferTitleAr, setNewOfferTitleAr] = useState('');
  const [newOfferDiscount, setNewOfferDiscount] = useState<number>(20);
  const [newOfferBadgeEn, setNewOfferBadgeEn] = useState('');
  const [newOfferBadgeAr, setNewOfferBadgeAr] = useState('');
  const [newOfferDescEn, setNewOfferDescEn] = useState('');
  const [newOfferDescAr, setNewOfferDescAr] = useState('');
  const [newOfferValidUntil, setNewOfferValidUntil] = useState('');
  const [newOfferCode, setNewOfferCode] = useState('');

  // New course form
  const [newCourseTitleEn, setNewCourseTitleEn] = useState('');
  const [newCourseTitleAr, setNewCourseTitleAr] = useState('');
  const [newCourseDescEn, setNewCourseDescEn] = useState('');
  const [newCourseDescAr, setNewCourseDescAr] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('B1');
  const [newCourseFormat, setNewCourseFormat] = useState<'individual' | 'group' | 'both'>('both');

  // English Club
  const [clubSettings, setClubSettings] = useState<EnglishClubSettings>(DEFAULT_ENGLISH_CLUB_SETTINGS);
  const [isClubSaving, setIsClubSaving] = useState(false);

  // Pricing
  const [stageRows, setStageRows] = useState<StagePricing[]>(STAGE_PRICING_TABLE);
  const [isPricingSaving, setIsPricingSaving] = useState(false);

  // Academy settings
  const [settings, setSettings] = useState<AcademySettings | null>(null);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);


  useEffect(() => {
    const fetchRegs = async () => {
      try {
        setRegistrations(await studentDataService.getRegistrationRequests());
      } catch (err) {
        console.error('Error fetching registration requests:', err);
      }
    };
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        setUsersList(snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as UserProfile)));
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    const fetchClub = async () => {
      try {
        setClubSettings(await englishClubService.getSettings());
      } catch (err) {
        console.error('Error fetching club settings:', err);
      }
    };
    const fetchCms = async () => {
      try {
        const [secs, crs, bks, ofs, tms, stg, cfg] = await Promise.all([
          contentManagementService.getSections(),
          contentManagementService.getCourses(),
          contentManagementService.getLibraryMaterials(),
          contentManagementService.getOffers(),
          contentManagementService.getTestimonials(),
          contentManagementService.getStagePricing(),
          contentManagementService.getAcademySettings()
        ]);
        setWebsiteSections(secs);
        setCoursesList(crs);
        setLibraryBooks(bks);
        setOffersList(ofs);
        setTestimonialsList(tms);
        setStageRows(stg);
        setSettings(cfg);
      } catch (err) {
        console.error('Error fetching CMS data:', err);
      }
    };
    fetchRegs();
    fetchUsers();
    fetchClub();
    fetchCms();
  }, []);


  const students = usersList.filter((u) => u.role === 'student');
  const teachers = usersList.filter((u) => u.role === 'teacher');
  const pendingRegistrations = registrations.filter((r) => r.status === 'pending');

  const formatLabel = (f?: string) =>
    f === 'individual' ? tr('Individual', 'فردي') : f === 'group' ? tr('Group', 'جماعي') : f === 'both' ? tr('Group & 1-on-1', 'جماعي وفردي') : f || '';
  const statusLabel = (s: string) =>
    s === 'approved' ? tr('Approved', 'مقبول') : s === 'rejected' ? tr('Rejected', 'مرفوض') : tr('Pending', 'قيد المراجعة');
  const categoryLabel = (c: string) =>
    c === 'magazine'
      ? tr('Monthly Magazine', 'المجلة الشهرية')
      : c === 'curriculum'
      ? tr('Curriculum Textbook', 'كتاب منهج')
      : c === 'reading'
      ? tr('Graded Reader', 'قراءة مبسطة')
      : c === 'grammar'
      ? tr('Grammar & Syntax', 'قواعد ونحو')
      : tr('Vocabulary & Idioms', 'مفردات وتعابير');
  const studentName = (id: string) => usersList.find((u) => u.id === id)?.fullName || id;

  /* ------------------------------ Handlers ------------------------------ */

  const handleSaveClubSettings = async () => {
    setIsClubSaving(true);
    try {
      await englishClubService.updateSettings(clubSettings, adminName);
      notify(tr('English Club settings saved.', 'تم حفظ إعدادات نادي الإنجليزية.'), 4000);
    } catch (err) {
      console.error('Error updating club settings:', err);
      notify(tr('Failed to save English Club settings.', 'تعذر حفظ إعدادات نادي الإنجليزية.'), 5000, true);
    } finally {
      setIsClubSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSettingsSaving(true);
    try {
      await contentManagementService.saveAcademySettings(settings);
      notify(tr('Academy settings saved.', 'تم حفظ إعدادات الأكاديمية.'));
    } catch (err) {
      console.error('Error saving academy settings:', err);
      notify(tr('Failed to save academy settings.', 'تعذر حفظ إعدادات الأكاديمية.'), 5000, true);
    } finally {
      setIsSettingsSaving(false);
    }
  };

  const updateStageField = (stage: string, field: keyof StagePricing, value: number) => {
    setStageRows((rows) => rows.map((r) => (r.stage === stage ? { ...r, [field]: value } : r)));
  };

  const handleSavePricing = async () => {
    setIsPricingSaving(true);
    try {
      await Promise.all(stageRows.map((r) => contentManagementService.saveStagePricing(r)));
      notify(tr('Pricing saved.', 'تم حفظ الأسعار.'));
    } catch (err) {
      console.error('Error saving pricing:', err);
      notify(tr('Failed to save pricing.', 'تعذر حفظ الأسعار.'), 5000, true);
    } finally {
      setIsPricingSaving(false);
    }
  };

  const handleSaveSection = async (section: WebsiteSectionContent) => {
    setIsCmsSaving(true);
    try {
      await contentManagementService.saveSection({ ...section, updatedBy: adminName });
      setWebsiteSections((prev) => [...prev.filter((s) => s.sectionKey !== section.sectionKey), section]);
      notify(tr(`Section "${section.titleEn}" saved.`, `تم حفظ القسم "${section.titleAr}".`));
    } catch (err) {
      console.error('Error saving section:', err);
      notify(tr('Failed to save section.', 'تعذر حفظ القسم.'), 5000, true);
    } finally {
      setIsCmsSaving(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseTitleEn.trim() && !newCourseTitleAr.trim()) return;
    setIsCmsSaving(true);
    try {
      const course: DynamicCourseItem = {
        id: `course_${Date.now()}`,
        titleEn: newCourseTitleEn.trim() || newCourseTitleAr.trim(),
        titleAr: newCourseTitleAr.trim() || newCourseTitleEn.trim(),
        level: newCourseLevel,
        descriptionEn: newCourseDescEn.trim(),
        descriptionAr: newCourseDescAr.trim(),
        durationMonths: 6,
        format: newCourseFormat,
        isActive: true
      };
      await contentManagementService.saveCourse(course);
      setCoursesList((prev) => [...prev, course]);
      setNewCourseTitleEn('');
      setNewCourseTitleAr('');
      setNewCourseDescEn('');
      setNewCourseDescAr('');
      notify(tr('Course added.', 'تمت إضافة المنهج.'));
    } catch (err) {
      console.error('Error adding course:', err);
      notify(tr('Failed to add course.', 'تعذرت إضافة المنهج.'), 5000, true);
    } finally {
      setIsCmsSaving(false);
    }
  };

  const handleToggleCourse = async (course: DynamicCourseItem) => {
    try {
      const updated = { ...course, isActive: !course.isActive };
      await contentManagementService.saveCourse(updated);
      setCoursesList((prev) => prev.map((c) => (c.id === course.id ? updated : c)));
      notify(updated.isActive ? tr('Course published.', 'تم نشر المنهج.') : tr('Course hidden.', 'تم إخفاء المنهج.'));
    } catch (err) {
      console.error('Error toggling course:', err);
      notify(tr('Failed to update course.', 'تعذر تحديث المنهج.'), 5000, true);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm(tr('Delete this course?', 'حذف هذا المنهج؟'))) return;
    try {
      await contentManagementService.deleteCourse(id);
      setCoursesList((prev) => prev.filter((c) => c.id !== id));
      notify(tr('Course removed.', 'تم حذف المنهج.'));
    } catch (err) {
      console.error('Error deleting course:', err);
      notify(tr('Failed to delete course.', 'تعذر حذف المنهج.'), 5000, true);
    }
  };

  const handleCreateBook = async () => {
    if (!newBookTitleEn.trim() && !newBookTitleAr.trim()) return;
    setIsCmsSaving(true);
    try {
      const book: LibraryBookMaterial = {
        id: `book_${Date.now()}`,
        titleEn: newBookTitleEn.trim() || newBookTitleAr.trim(),
        titleAr: newBookTitleAr.trim() || newBookTitleEn.trim(),
        category: newBookCategory,
        level: newBookLevel,
        downloadUrl: newBookUrl.trim() || undefined,
        isPublic: newBookIsPublic,
        addedAt: new Date().toISOString()
      };
      await contentManagementService.saveLibraryMaterial(book);
      setLibraryBooks((prev) => [...prev, book]);
      setNewBookTitleEn('');
      setNewBookTitleAr('');
      setNewBookUrl('');
      notify(tr('Library material added.', 'تمت إضافة المادة إلى المكتبة.'));
    } catch (err) {
      console.error('Error adding book:', err);
      notify(tr('Failed to add material.', 'تعذرت إضافة المادة.'), 5000, true);
    } finally {
      setIsCmsSaving(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm(tr('Remove this material?', 'حذف هذه المادة؟'))) return;
    try {
      await contentManagementService.deleteLibraryMaterial(id);
      setLibraryBooks((prev) => prev.filter((b) => b.id !== id));
      notify(tr('Material removed.', 'تم حذف المادة.'));
    } catch (err) {
      console.error('Error deleting book:', err);
      notify(tr('Failed to delete material.', 'تعذر حذف المادة.'), 5000, true);
    }
  };

  const handleCreateOffer = async () => {
    if (!newOfferTitleEn.trim() && !newOfferTitleAr.trim()) return;
    setIsCmsSaving(true);
    try {
      const offer: DynamicPromotionOffer = {
        id: `offer_${Date.now()}`,
        titleEn: newOfferTitleEn.trim() || newOfferTitleAr.trim(),
        titleAr: newOfferTitleAr.trim() || newOfferTitleEn.trim(),
        discountPercentage: newOfferDiscount || undefined,
        badgeEn: newOfferBadgeEn.trim(),
        badgeAr: newOfferBadgeAr.trim(),
        descriptionEn: newOfferDescEn.trim(),
        descriptionAr: newOfferDescAr.trim(),
        validUntil: newOfferValidUntil,
        promoCode: newOfferCode.trim() || undefined,
        isActive: true
      };
      await contentManagementService.saveOffer(offer);
      setOffersList((prev) => [...prev, offer]);
      setNewOfferTitleEn('');
      setNewOfferTitleAr('');
      setNewOfferBadgeEn('');
      setNewOfferBadgeAr('');
      setNewOfferDescEn('');
      setNewOfferDescAr('');
      setNewOfferValidUntil('');
      setNewOfferCode('');
      notify(tr('Offer added.', 'تمت إضافة العرض.'));
    } catch (err) {
      console.error('Error adding offer:', err);
      notify(tr('Failed to add offer.', 'تعذرت إضافة العرض.'), 5000, true);
    } finally {
      setIsCmsSaving(false);
    }
  };

  const handleToggleOffer = async (offer: DynamicPromotionOffer) => {
    try {
      const updated = { ...offer, isActive: !offer.isActive };
      await contentManagementService.saveOffer(updated);
      setOffersList((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
      notify(updated.isActive ? tr('Offer published.', 'تم نشر العرض.') : tr('Offer hidden.', 'تم إخفاء العرض.'));
    } catch (err) {
      console.error('Error toggling offer:', err);
      notify(tr('Failed to update offer.', 'تعذر تحديث العرض.'), 5000, true);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!window.confirm(tr('Remove this offer?', 'حذف هذا العرض؟'))) return;
    try {
      await contentManagementService.deleteOffer(id);
      setOffersList((prev) => prev.filter((o) => o.id !== id));
      notify(tr('Offer removed.', 'تم حذف العرض.'));
    } catch (err) {
      console.error('Error deleting offer:', err);
      notify(tr('Failed to delete offer.', 'تعذر حذف العرض.'), 5000, true);
    }
  };

  const handleToggleTestimonial = async (id: string, current: boolean) => {
    try {
      await contentManagementService.toggleTestimonialApproval(id, !current);
      setTestimonialsList((prev) => prev.map((x) => (x.id === id ? { ...x, isApproved: !current } : x)));
      notify(!current ? tr('Review approved and published.', 'تم اعتماد التقييم ونشره.') : tr('Review unpublished.', 'تم إلغاء نشر التقييم.'));
    } catch (err) {
      console.error('Error toggling testimonial:', err);
      notify(tr('Failed to update review.', 'تعذر تحديث التقييم.'), 5000, true);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm(tr('Delete this review?', 'حذف هذا التقييم؟'))) return;
    try {
      await contentManagementService.deleteTestimonial(id);
      setTestimonialsList((prev) => prev.filter((x) => x.id !== id));
      notify(tr('Review deleted.', 'تم حذف التقييم.'));
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      notify(tr('Failed to delete review.', 'تعذر حذف التقييم.'), 5000, true);
    }
  };

  const handleApprove = async (regId: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;
    try {
      // طلبات نادي الإنجليزية لا تحتاج حساب طالب
      if ((reg as any).type === 'english_club') {
        await studentDataService.updateRegistrationStatus(regId, 'approved', adminName);
        setRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status: 'approved' as const } : r)));
        notify(tr(`Registration ${regId} approved.`, `تم قبول الطلب ${regId}.`), 4000);
        return;
      }

      // ربط الطلب بحساب الطالب الذي يحمل نفس البريد
      const uid = await studentDataService.linkRegistrationToStudent(reg);
      if (!uid) {
        notify(
          tr(
            `No student account uses ${reg.email}. Ask the student to create an account with this exact email, then press Approve again.`,
            `لا يوجد حساب طالب بالبريد ${reg.email}. اطلب من الطالب إنشاء حساب بنفس البريد تمامًا، ثم اضغط قبول مرة أخرى.`
          ),
          9000,
          true
        );
        return;
      }

      await studentDataService.updateRegistrationStatus(regId, 'approved', adminName, uid);
      setRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status: 'approved' as const } : r)));
      notify(
        tr(
          'Request approved and linked to the student account. Now open the Students tab, set the course, and change the subscription to Active.',
          'تم قبول الطلب وربطه بحساب الطالب. افتح الآن تبويب الطلاب، وحدد الدورة، وغيّر حالة الاشتراك إلى نشط.'
        ),
        9000
      );
      setActiveTab('students');
    } catch (err) {
      console.error('Error approving registration:', err);
      notify(tr(`Error approving ${regId}.`, `تعذر قبول الطلب ${regId}.`), 5000, true);
    }
  };

  const handleReject = async (regId: string) => {
    try {
      await studentDataService.updateRegistrationStatus(regId, 'rejected', adminName);
      setRegistrations((prev) => prev.map((r) => (r.id === regId ? { ...r, status: 'rejected' as const } : r)));
      notify(tr(`Registration ${regId} rejected.`, `تم رفض الطلب ${regId}.`));
    } catch (err) {
      console.error('Error rejecting registration:', err);
      notify(tr(`Error rejecting ${regId}.`, `تعذر رفض الطلب ${regId}.`), 5000, true);
    }
  };

  /* ------------------------------ Static config ------------------------------ */

  const tabs: { id: TabId; labelEn: string; labelAr: string }[] = [
    { id: 'overview', labelEn: 'Overview & Metrics', labelAr: 'الإحصائيات العامة' },
    { id: 'registrations', labelEn: `Registrations (${pendingRegistrations.length} Pending)`, labelAr: `طلبات التسجيل (${pendingRegistrations.length})` },
    { id: 'students', labelEn: `Students (${students.length})`, labelAr: `الطلاب (${students.length})` },
    { id: 'messages', labelEn: 'Messages', labelAr: 'الرسائل' },
    { id: 'community', labelEn: 'Community', labelAr: 'مجتمع الطلاب' },
    { id: 'feedback_reviews', labelEn: 'Student Reviews Gallery', labelAr: 'آراء وتقييمات الطلاب' },
    { id: 'content_cms', labelEn: 'Content & Curricula', labelAr: 'إدارة المحتوى والمناهج' },
    { id: 'blog', labelEn: 'Blog', labelAr: 'المدونة' },
    { id: 'pricing', labelEn: 'Tuition & Stages', labelAr: 'الأسعار والمراحل' },
    { id: 'english_club', labelEn: 'English Club Config', labelAr: 'إعدادات نادي الإنجليزية' },
    { id: 'stars_audit', labelEn: 'Stars Audit Ledger', labelAr: 'سجل تدقيق النجوم' },
    { id: 'settings', labelEn: 'Academy Settings', labelAr: 'إعدادات الأكاديمية' }
  ];

  const sectionDefs = [
    { key: 'hero_announcement', titleEn: 'Top Hero Announcement', titleAr: 'إعلان أعلى الصفحة الرئيسية' },
    { key: 'methodology_intro', titleEn: 'Academy Methodology Summary', titleAr: 'ملخص منهجية الأكاديمية' },
    { key: 'placement_notice', titleEn: 'Free Placement Test Banner', titleAr: 'شريط اختبار تحديد المستوى' },
    { key: 'footer_accreditation', titleEn: 'Accreditation Statement', titleAr: 'نص الاعتماد في أسفل الموقع' }
  ];

  const cmsTabs = [
    { id: 'sections', labelEn: 'Sections', labelAr: 'الأقسام', icon: FileText },
    { id: 'courses', labelEn: 'Curricula', labelAr: 'المناهج', icon: Layers },
    { id: 'books', labelEn: 'Library Books', labelAr: 'مكتبة الكتب', icon: BookOpen },
    { id: 'offers', labelEn: 'Offers', labelAr: 'العروض', icon: Tag },
    { id: 'testimonials', labelEn: 'Testimonials', labelAr: 'الآراء', icon: MessageSquare }
  ];

  const trackDefs = [
    { key: 'A1-A2', labelEn: 'Foundations (A1–A2)', labelAr: 'التأسيس (A1–A2)', wrap: 'border-emerald-200 bg-emerald-50/20', badge: 'bg-emerald-100 text-emerald-800' },
    { key: 'B1-B2', labelEn: 'Fluency (B1–B2)', labelAr: 'الطلاقة (B1–B2)', wrap: 'border-[#D4AF37]/50 bg-[#FAF8F5]', badge: 'bg-[#D4AF37]/20 text-[#0A192F]' },
    { key: 'C1-C2', labelEn: 'Mastery (C1–C2)', labelAr: 'الإتقان (C1–C2)', wrap: 'border-indigo-200 bg-indigo-50/20', badge: 'bg-indigo-100 text-indigo-800' }
  ];

  const settingFields: { key: keyof AcademySettings; labelEn: string; labelAr: string }[] = [
    { key: 'whatsapp', labelEn: 'WhatsApp link', labelAr: 'رابط واتساب' },
    { key: 'email', labelEn: 'Admissions email', labelAr: 'بريد القبول' },
    { key: 'youtube', labelEn: 'YouTube channel link', labelAr: 'رابط قناة يوتيوب' },
    { key: 'instagram', labelEn: 'Instagram link', labelAr: 'رابط إنستغرام' },
    { key: 'discord', labelEn: 'Discord link', labelAr: 'رابط ديسكورد' },
    { key: 'facebook', labelEn: 'Facebook link', labelAr: 'رابط فيسبوك' },
    { key: 'telegram', labelEn: 'Telegram link', labelAr: 'رابط تيليغرام' },
    { key: 'placementTestUrl', labelEn: 'Placement test link', labelAr: 'رابط اختبار تحديد المستوى' }
  ];

  const updateTrack = (key: string, patch: Record<string, any>) => {
    const tracks: any = { ...clubSettings.tracks };
    tracks[key] = { ...(tracks[key] || {}), ...patch };
    setClubSettings({ ...clubSettings, tracks });
  };

  /* ------------------------------ Render ------------------------------ */

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
                  {tr('Super Admin Console', 'وحدة تحكم المدير العام')}
                </span>
                <span className="text-xs text-[#AA820A] font-semibold">
                  {tr('Complete Academy Management', 'الإدارة الكاملة للأكاديمية')}
                </span>
              </div>
              <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F] mt-1">
                {tr('English Zone Central Administration', 'الإدارة المركزية لأكاديمية English Zone')}
              </h1>
              <p className="text-xs text-gray-500">
                {tr(
                  'Full control over registrations, students, teachers, CEFR pricing, and audit logs.',
                  'تحكم كامل في التسجيلات والطلاب والمعلمين وأسعار مستويات CEFR وسجلات التدقيق.'
                )}
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
              <span>{tr('Sign Out', 'تسجيل الخروج')}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {actionNotice && (
          <div
            className={`p-4 rounded-2xl bg-[#FAF8F5] border text-xs font-bold flex items-center gap-2 shadow-sm ${
              noticeIsError ? 'border-red-300 text-red-700' : 'border-[#25D366] text-[#128C7E]'
            }`}
          >
            {noticeIsError ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-[#25D366]" />}
            <span>{actionNotice}</span>
          </div>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 block">{tr('Students', 'عدد الطلاب')}</span>
                <span className="font-serif-luxury font-bold text-3xl text-[#0A192F] mt-1 block">{students.length}</span>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 block">{tr('Pending Applications', 'طلبات قيد المراجعة')}</span>
                <span className="font-serif-luxury font-bold text-3xl text-[#D4AF37] mt-1 block">{pendingRegistrations.length}</span>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 block">{tr('Teachers', 'عدد المعلمين')}</span>
                <span className="font-serif-luxury font-bold text-3xl text-[#0A192F] mt-1 block">{teachers.length}</span>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500 block">{tr('Total Applications', 'إجمالي الطلبات')}</span>
                <span className="font-serif-luxury font-bold text-3xl text-[#0A192F] mt-1 block">{registrations.length}</span>
              </div>
            </div>

            <div className={cardCls}>
              <div className="flex items-center justify-between">
                <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F]">
                  {tr('Pending Registration Requests', 'طلبات التسجيل التي تحتاج إجراءً')}
                </h3>
                <button onClick={() => setActiveTab('registrations')} className="text-xs font-bold text-[#AA820A] hover:underline">
                  {tr(`View All (${registrations.length}) →`, `عرض الكل (${registrations.length}) ←`)}
                </button>
              </div>

              {pendingRegistrations.length === 0 ? (
                <div className={emptyCls}>{tr('No pending registration requests.', 'لا توجد طلبات تسجيل قيد المراجعة.')}</div>
              ) : (
                <div className="space-y-3">
                  {pendingRegistrations.slice(0, 3).map((reg) => (
                    <div key={reg.id} className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-sm text-[#0A192F] block">{reg.fullName}</span>
                        <span className="text-gray-500">
                          {tr('Level', 'المستوى')}: {reg.mainLevel} • {formatLabel(reg.learningFormat)} • WhatsApp: {reg.whatsappNumber} • {tr('Country', 'الدولة')}: {reg.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(reg.id)} className="px-4 py-2 rounded-lg bg-[#0A192F] text-[#F3E5AB] font-bold">
                          {tr('Approve', 'قبول')}
                        </button>
                        <button onClick={() => handleReject(reg.id)} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:text-red-600">
                          {tr('Reject', 'رفض')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div className={cardCls}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  {tr('Admissions Requests', 'طلبات القبول والتسجيل')}
                </h2>
                <p className="text-xs text-gray-500">
                  {tr('Review applications and update their status.', 'راجع الطلبات وحدّث حالتها.')}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] text-gray-700 border">
                {tr(`${registrations.length} Total`, `الإجمالي: ${registrations.length}`)}
              </span>
            </div>

            {registrations.length === 0 ? (
              <div className={emptyCls}>{tr('No registration requests yet.', 'لا توجد طلبات تسجيل بعد.')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#FAF8F5] text-xs font-semibold text-gray-500 border-b border-gray-200">
                      <th className={thCls}>{tr('Applicant', 'المتقدم')}</th>
                      <th className={thCls}>{tr('Level & Format', 'المستوى والنمط')}</th>
                      <th className={thCls}>{tr('Contact', 'التواصل')}</th>
                      <th className={thCls}>{tr('Status', 'الحالة')}</th>
                      <th className={`${thCls} text-center`}>{tr('Action', 'الإجراء')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3.5 px-4 font-bold text-[#0A192F]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{reg.fullName}</span>
                            {(reg as any).type === 'english_club' && (
                              <span className="px-2 py-0.5 rounded-full bg-[#0A192F] text-[#F3E5AB] text-[10px] font-bold border border-[#D4AF37]/40">
                                {tr('English Club', 'نادي الإنجليزية')}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {reg.id} {reg.age ? `• ${tr('Age', 'العمر')}: ${reg.age}` : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {(reg as any).selectedTrack ? (
                            <>
                              <span className="font-semibold text-[#0A192F]">{tr('Track', 'المسار')}: {(reg as any).selectedTrack}</span>
                              <span className="block text-xs text-gray-500">{tr('60-Min Club Practice', 'ممارسة النادي (60 دقيقة)')}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-[#0A192F]">{tr('Level', 'المستوى')} {reg.mainLevel}</span>
                              <span className="block text-xs text-gray-500">{formatLabel(reg.learningFormat)}</span>
                            </>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          <div>{reg.whatsappNumber}</div>
                          <div className="text-xs text-gray-400">{reg.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              reg.status === 'approved'
                                ? 'bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30'
                                : reg.status === 'rejected'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-[#D4AF37]/20 text-[#0A192F] border border-[#D4AF37]/40'
                            }`}
                          >
                            {statusLabel(reg.status)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {reg.status === 'pending' ? (
                            <div className="inline-flex items-center gap-2">
                              <button onClick={() => handleApprove(reg.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D]">
                                {tr('Approve', 'قبول')}
                              </button>
                              <button onClick={() => handleReject(reg.id)} className="px-2.5 py-1.5 rounded-lg text-xs border border-gray-300 text-gray-600 hover:text-red-600">
                                {tr('Reject', 'رفض')}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">{tr('Completed', 'مكتمل')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS */}
        {activeTab === 'students' && <AdminStudentsManager onNotice={(msg) => notify(msg, 4000)} />}

        {/* PRICING */}
        {activeTab === 'pricing' && (
          <div className={cardCls}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  {tr('Tuition by Stage', 'أسعار المراحل')}
                </h2>
                <p className="text-xs text-gray-500">
                  {tr('Monthly prices in USD. Edit any value, then save.', 'الأسعار الشهرية بالدولار. عدّل أي قيمة ثم احفظ.')}
                </p>
              </div>
              <button onClick={handleSavePricing} disabled={isPricingSaving} className={primaryBtn}>
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>{isPricingSaving ? tr('Saving...', 'جارٍ الحفظ...') : tr('Save Pricing', 'حفظ الأسعار')}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] text-xs font-semibold text-gray-500 border-b border-gray-200">
                    <th className={thCls}>{tr('Stage', 'المرحلة')}</th>
                    <th className={thCls}>{tr('Individual (now)', 'فردي (الحالي)')}</th>
                    <th className={thCls}>{tr('Individual (original)', 'فردي (الأصلي)')}</th>
                    <th className={thCls}>{tr('Group (now)', 'جماعي (الحالي)')}</th>
                    <th className={thCls}>{tr('Group (original)', 'جماعي (الأصلي)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stageRows.map((row) => (
                    <tr key={row.stage} className="hover:bg-[#FAF8F5]">
                      <td className="py-2 px-4 font-mono font-bold text-[#0A192F]">{row.stage}</td>
                      {(['individualCurrent', 'individualOriginal', 'groupPrice', 'groupOriginalPrice'] as (keyof StagePricing)[]).map((f) => (
                        <td key={f} className="py-2 px-4">
                          <input
                            type="number"
                            min="0"
                            value={(row as any)[f] ?? 0}
                            onChange={(e) => updateStageField(row.stage, f, Number(e.target.value) || 0)}
                            className="w-24 px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-[#0A192F]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STARS AUDIT */}
        {activeTab === 'stars_audit' && <AdminStarsLedger onNotice={(msg) => notify(msg, 4000)} />}

        {/* BLOG */}
        {activeTab === 'blog' && <AdminBlogManager onNotice={(msg) => notify(msg, 4000)} />}

        {/* CONTACT MESSAGES */}
        {activeTab === 'messages' && <AdminMessagesManager onNotice={(msg) => notify(msg, 4000)} />}

        {/* COMMUNITY */}
        {activeTab === 'community' && firebaseUser && (
          <CommunityFeed uid={firebaseUser.uid} name={tr('English Zone Academy', 'أكاديمية English Zone')} role="admin" isAr={isAr} />
        )}

        {/* ACADEMY SETTINGS */}
        {activeTab === 'settings' && (
          <div className={cardCls}>
            <div>
              <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                {tr('Academy Settings', 'إعدادات الأكاديمية')}
              </h2>
              <p className="text-xs text-gray-500">
                {tr('Official contact links and the placement test link.', 'روابط التواصل الرسمية ورابط اختبار تحديد المستوى.')}
              </p>
            </div>

            {!settings ? (
              <div className={emptyCls}>{tr('Loading...', 'جارٍ التحميل...')}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settingFields.map((f) => (
                    <div key={f.key as string}>
                      <label className="block text-xs font-bold text-[#0A192F] mb-1">{isAr ? f.labelAr : f.labelEn}</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={(settings as any)[f.key] ?? ''}
                        onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button onClick={handleSaveSettings} disabled={isSettingsSaving} className={primaryBtn}>
                    <Save className="w-4 h-4 text-[#D4AF37]" />
                    <span>{isSettingsSaving ? tr('Saving...', 'جارٍ الحفظ...') : tr('Save Settings', 'حفظ الإعدادات')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ENGLISH CLUB */}
        {activeTab === 'english_club' && (
          <div className={`${cardCls} space-y-8`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB] text-xs font-bold mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{tr('Interactive Conversation Activity', 'نشاط المحادثة التفاعلي')}</span>
                </div>
                <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
                  {tr('English Club Administration & Scheduling', 'إدارة نادي الإنجليزية وجدولته')}
                </h2>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                  {tr(
                    'Configure the membership fee, session schedule and admission availability. No price or schedule is shown publicly unless enabled here.',
                    'اضبط رسوم العضوية وجدول الجلسات وحالة القبول. لا يظهر أي سعر أو جدول للزوار ما لم تفعّله هنا.'
                  )}
                </p>
              </div>
              <button onClick={handleSaveClubSettings} disabled={isClubSaving} className={primaryBtn}>
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>{isClubSaving ? tr('Saving...', 'جارٍ الحفظ...') : tr('Save Club Settings', 'حفظ إعدادات النادي')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
                <label className="block text-xs font-bold text-[#0A192F]">{tr('Registration Availability', 'حالة التسجيل')}</label>
                <select
                  value={clubSettings.status}
                  onChange={(e) => setClubSettings({ ...clubSettings, status: e.target.value as any, isRegistrationOpen: e.target.value === 'open' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800"
                >
                  <option value="open">{tr('🟢 Open for Enrollment', '🟢 التسجيل مفتوح')}</option>
                  <option value="coming_soon">{tr('🟡 Coming Soon', '🟡 قريبًا')}</option>
                  <option value="closed">{tr('🔴 Closed (Waitlist Only)', '🔴 مغلق (قائمة انتظار فقط)')}</option>
                </select>
                <p className="text-[11px] text-gray-500">
                  {tr('Controls whether students can submit club registrations from the website.', 'يتحكم في إمكانية إرسال الطلاب طلبات الانضمام للنادي من الموقع.')}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-gray-200 space-y-3">
                <label className="block text-xs font-bold text-[#0A192F]">{tr('General English Prerequisite', 'شرط دورة اللغة العامة')}</label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clubSettings.requiresGeneralEnglish}
                    onChange={(e) => setClubSettings({ ...clubSettings, requiresGeneralEnglish: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-gray-800 block">{tr('Require General English course purchase', 'اشتراط شراء دورة اللغة العامة')}</span>
                    <span className="text-gray-500">
                      {tr(
                        'When unchecked, the club is a standalone activity open to any learner.',
                        'عند عدم التحديد يكون النادي نشاطًا مستقلًا متاحًا لأي متعلم.'
                      )}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-gray-200 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#0A192F] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#AA820A]" />
                  <span>{tr('Club Fee & Price Display', 'رسوم النادي وعرض السعر')}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {tr('No price is displayed unless you enable it and enter an official fee.', 'لا يُعرض أي سعر ما لم تفعّله وتدخل الرسوم الرسمية.')}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clubSettings.isPriceConfigured}
                    onChange={(e) => setClubSettings({ ...clubSettings, isPriceConfigured: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs font-bold text-gray-800">{tr('Display membership fee publicly', 'عرض رسوم العضوية للزوار')}</span>
                </label>
                {clubSettings.isPriceConfigured && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">{tr('Official Membership Fee (USD)', 'رسوم العضوية الرسمية (دولار)')}</label>
                    <input
                      type="number"
                      min="1"
                      value={clubSettings.membershipFeeUSD || ''}
                      onChange={(e) => setClubSettings({ ...clubSettings, membershipFeeUSD: Number(e.target.value) || null })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white font-bold text-[#0A192F]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-[#0A192F] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>{tr('CEFR Tracks & Meeting Schedule', 'مسارات CEFR وجدول اللقاءات')}</span>
                </h3>
                <p className="text-xs text-gray-500">
                  {tr('Only tracks marked active show their schedule publicly.', 'تظهر للزوار جداول المسارات المفعّلة فقط.')}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {trackDefs.map((trk) => {
                  const tdata: any = (clubSettings.tracks as any)[trk.key] || {};
                  return (
                    <div key={trk.key} className={`p-5 rounded-2xl border-2 space-y-3 ${trk.wrap}`}>
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${trk.badge}`}>{isAr ? trk.labelAr : trk.labelEn}</span>
                        <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                          <input type="checkbox" checked={tdata.isConfigured || false} onChange={(e) => updateTrack(trk.key, { isConfigured: e.target.checked })} className="rounded" />
                          <span>{tr('Active', 'مفعّل')}</span>
                        </label>
                      </div>
                      <div>
                        <label className={labelCls}>{tr('Schedule Day & Time (EN)', 'اليوم والوقت (EN)')}</label>
                        <input
                          type="text"
                          value={tdata.dayTimeEn || ''}
                          onChange={(e) => updateTrack(trk.key, { dayTimeEn: e.target.value })}
                          placeholder="Mon & Wed, 6:00 PM GMT"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>{tr('Current Topic (EN)', 'الموضوع الحالي (EN)')}</label>
                        <input
                          type="text"
                          value={tdata.activeTopicEn || ''}
                          onChange={(e) => updateTrack(trk.key, { activeTopicEn: e.target.value })}
                          placeholder="Daily Habits & Food"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {clubSettings.updatedAt
                  ? `${tr('Last saved', 'آخر حفظ')}: ${new Date(clubSettings.updatedAt).toLocaleString()}`
                  : tr('Settings in default state.', 'الإعدادات في حالتها الافتراضية.')}
              </span>
              <button onClick={handleSaveClubSettings} disabled={isClubSaving} className={primaryBtn}>
                <Save className="w-4 h-4 text-[#D4AF37]" />
                <span>{isClubSaving ? tr('Saving...', 'جارٍ الحفظ...') : tr('Save English Club Settings', 'حفظ إعدادات نادي الإنجليزية')}</span>
              </button>
            </div>
          </div>
        )}

        {/* CONTENT CMS */}
        {activeTab === 'content_cms' && (
          <div className={cardCls}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                  {tr('Website Content & Curriculum Management', 'إدارة محتوى الموقع والمناهج')}
                </h2>
                <p className="text-xs text-gray-500">
                  {tr(
                    'Update homepage sections, curricula, library books, offers, and moderate student testimonials.',
                    'حدّث أقسام الصفحة الرئيسية والمناهج ومكتبة الكتب والعروض، وراجع آراء الطلاب.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl overflow-x-auto">
                {cmsTabs.map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setCmsSubTab(sub.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        cmsSubTab === sub.id ? 'bg-white text-[#0A192F] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{isAr ? sub.labelAr : sub.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sections */}
            {cmsSubTab === 'sections' && (
              <div className="space-y-6">
                <p className="text-xs text-gray-600">
                  {tr('Edit the main messages shown on the website. Empty fields mean nothing is set yet.', 'عدّل الرسائل الرئيسية الظاهرة في الموقع. الحقل الفارغ يعني أنه لم يُحدد شيء بعد.')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sectionDefs.map((sec) => {
                    const current: WebsiteSectionContent =
                      websiteSections.find((s) => s.sectionKey === sec.key) || {
                        id: sec.key,
                        sectionKey: sec.key,
                        titleEn: sec.titleEn,
                        titleAr: sec.titleAr,
                        contentEn: '',
                        contentAr: '',
                        updatedAt: '',
                        updatedBy: ''
                      };
                    const setField = (patch: Partial<WebsiteSectionContent>) =>
                      setWebsiteSections([...websiteSections.filter((s) => s.sectionKey !== sec.key), { ...current, ...patch }]);
                    return (
                      <div key={sec.key} className="p-5 rounded-2xl border border-gray-200 bg-[#FAF8F5] space-y-3">
                        <span className="font-bold text-xs text-[#0A192F]">{isAr ? sec.titleAr : sec.titleEn}</span>
                        <div>
                          <label className={labelCls}>{tr('English Content', 'المحتوى بالإنجليزية')}</label>
                          <textarea rows={2} value={current.contentEn} onChange={(e) => setField({ contentEn: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>{tr('Arabic Content', 'المحتوى بالعربية')}</label>
                          <textarea rows={2} dir="rtl" value={current.contentAr} onChange={(e) => setField({ contentAr: e.target.value })} className={inputCls} />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] text-gray-400">
                            {current.updatedAt ? `${tr('Updated', 'آخر تحديث')}: ${new Date(current.updatedAt).toLocaleDateString()}` : ''}
                          </span>
                          <button onClick={() => handleSaveSection(current)} disabled={isCmsSaving} className={primaryBtn}>
                            <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{tr('Save', 'حفظ')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courses */}
            {cmsSubTab === 'courses' && (
              <div className="space-y-6">
                <div className={boxCls}>
                  <h4 className="font-bold text-xs text-[#0A192F] flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-[#AA820A]" />
                    <span>{tr('Add New Course', 'إضافة منهج جديد')}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>{tr('Title (EN)', 'العنوان (EN)')}</label>
                      <input type="text" value={newCourseTitleEn} onChange={(e) => setNewCourseTitleEn(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Title (AR)', 'العنوان (AR)')}</label>
                      <input type="text" dir="rtl" value={newCourseTitleAr} onChange={(e) => setNewCourseTitleAr(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Description (EN)', 'الوصف (EN)')}</label>
                      <textarea rows={2} value={newCourseDescEn} onChange={(e) => setNewCourseDescEn(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Description (AR)', 'الوصف (AR)')}</label>
                      <textarea rows={2} dir="rtl" value={newCourseDescAr} onChange={(e) => setNewCourseDescAr(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('CEFR Level', 'المستوى')}</label>
                      <select value={newCourseLevel} onChange={(e) => setNewCourseLevel(e.target.value)} className={inputCls}>
                        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Format', 'النمط')}</label>
                      <select value={newCourseFormat} onChange={(e) => setNewCourseFormat(e.target.value as any)} className={inputCls}>
                        <option value="both">{formatLabel('both')}</option>
                        <option value="group">{formatLabel('group')}</option>
                        <option value="individual">{formatLabel('individual')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleCreateCourse} disabled={(!newCourseTitleEn.trim() && !newCourseTitleAr.trim()) || isCmsSaving} className={primaryBtn}>
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>{tr('Add Course', 'إضافة المنهج')}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700">{tr(`Course Catalog (${coursesList.length})`, `قائمة المناهج (${coursesList.length})`)}</span>
                  {coursesList.length === 0 ? (
                    <div className={emptyCls}>{tr('No courses added yet.', 'لم تُضف مناهج بعد.')}</div>
                  ) : (
                    coursesList.map((course) => (
                      <div key={course.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[#0A192F] text-[#F3E5AB] text-xs font-bold font-mono">{course.level}</span>
                          <div>
                            <span className="font-bold text-xs text-[#0A192F] block">{isAr ? course.titleAr : course.titleEn}</span>
                            <span className="text-[11px] text-gray-500">
                              {formatLabel(course.format)} • {course.durationMonths} {tr('months', 'أشهر')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleCourse(course)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${course.isActive ? 'bg-[#25D366]/20 text-[#128C7E]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {course.isActive ? tr('Published', 'منشور') : tr('Hidden', 'مخفي')}
                          </button>
                          <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg" title={tr('Delete', 'حذف')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <AdminCourseMaterials courses={coursesList} isAr={isAr} onNotice={(msg) => notify(msg, 4000)} />
              </div>
            )}

            {/* Books */}
            {cmsSubTab === 'books' && (
              <div className="space-y-6">
                <div className={boxCls}>
                  <h4 className="font-bold text-xs text-[#0A192F] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#AA820A]" />
                    <span>{tr('Add Library Material', 'إضافة مادة إلى المكتبة')}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>{tr('Title (EN)', 'العنوان (EN)')}</label>
                      <input type="text" value={newBookTitleEn} onChange={(e) => setNewBookTitleEn(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Title (AR)', 'العنوان (AR)')}</label>
                      <input type="text" dir="rtl" value={newBookTitleAr} onChange={(e) => setNewBookTitleAr(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Category', 'التصنيف')}</label>
                      <select value={newBookCategory} onChange={(e) => setNewBookCategory(e.target.value as any)} className={inputCls}>
                        {['magazine', 'curriculum', 'reading', 'grammar', 'vocabulary'].map((c) => (
                          <option key={c} value={c}>{categoryLabel(c)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Level', 'المستوى')}</label>
                      <select value={newBookLevel} onChange={(e) => setNewBookLevel(e.target.value)} className={inputCls}>
                        <option value="All Levels">{tr('All Levels', 'كل المستويات')}</option>
                        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>{tr('Download link (PDF)', 'رابط التحميل (PDF)')}</label>
                      <input type="text" dir="ltr" placeholder="https://..." value={newBookUrl} onChange={(e) => setNewBookUrl(e.target.value)} className={`${inputCls} font-mono`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={newBookIsPublic} onChange={(e) => setNewBookIsPublic(e.target.checked)} className="rounded" />
                      <span>{tr('Available to all registered students', 'متاح لجميع الطلاب المسجلين')}</span>
                    </label>
                    <button onClick={handleCreateBook} disabled={(!newBookTitleEn.trim() && !newBookTitleAr.trim()) || isCmsSaving} className={primaryBtn}>
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>{tr('Add Material', 'إضافة المادة')}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700">{tr(`Library (${libraryBooks.length})`, `المكتبة (${libraryBooks.length})`)}</span>
                  {libraryBooks.length === 0 ? (
                    <div className={emptyCls}>{tr('No library materials yet.', 'لا توجد مواد في المكتبة بعد.')}</div>
                  ) : (
                    libraryBooks.map((book) => (
                      <div key={book.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-[#AA820A]" />
                          <div>
                            <span className="font-bold text-xs text-[#0A192F] block">{isAr ? book.titleAr : book.titleEn}</span>
                            <span className="text-[11px] text-gray-500">
                              {categoryLabel(book.category)} • {book.level} • {book.isPublic ? tr('Public', 'عام') : tr('Protected', 'محمي')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {book.downloadUrl && (
                            <a href={book.downloadUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-[#0A192F] rounded-lg" title={tr('Open', 'فتح')}>
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg" title={tr('Delete', 'حذف')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Offers */}
            {cmsSubTab === 'offers' && (
              <div className="space-y-6">
                <div className={boxCls}>
                  <h4 className="font-bold text-xs text-[#0A192F] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#AA820A]" />
                    <span>{tr('Create Offer', 'إنشاء عرض')}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>{tr('Title (EN)', 'العنوان (EN)')}</label>
                      <input type="text" value={newOfferTitleEn} onChange={(e) => setNewOfferTitleEn(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Title (AR)', 'العنوان (AR)')}</label>
                      <input type="text" dir="rtl" value={newOfferTitleAr} onChange={(e) => setNewOfferTitleAr(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Badge (EN)', 'الشارة (EN)')}</label>
                      <input type="text" value={newOfferBadgeEn} onChange={(e) => setNewOfferBadgeEn(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Badge (AR)', 'الشارة (AR)')}</label>
                      <input type="text" dir="rtl" value={newOfferBadgeAr} onChange={(e) => setNewOfferBadgeAr(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Description (EN)', 'الوصف (EN)')}</label>
                      <textarea rows={2} value={newOfferDescEn} onChange={(e) => setNewOfferDescEn(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Description (AR)', 'الوصف (AR)')}</label>
                      <textarea rows={2} dir="rtl" value={newOfferDescAr} onChange={(e) => setNewOfferDescAr(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Discount %', 'نسبة الخصم %')}</label>
                      <input type="number" min="1" max="100" value={newOfferDiscount} onChange={(e) => setNewOfferDiscount(parseInt(e.target.value) || 0)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Valid until', 'ساري حتى')}</label>
                      <input type="date" value={newOfferValidUntil} onChange={(e) => setNewOfferValidUntil(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tr('Promo code (optional)', 'رمز القسيمة (اختياري)')}</label>
                      <input type="text" dir="ltr" value={newOfferCode} onChange={(e) => setNewOfferCode(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleCreateOffer} disabled={(!newOfferTitleEn.trim() && !newOfferTitleAr.trim()) || isCmsSaving} className={primaryBtn}>
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>{tr('Add Offer', 'إضافة العرض')}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-700">{tr(`Offers (${offersList.length})`, `العروض (${offersList.length})`)}</span>
                  {offersList.length === 0 ? (
                    <div className={emptyCls}>{tr('No offers yet.', 'لا توجد عروض بعد.')}</div>
                  ) : (
                    offersList.map((offer) => (
                      <div key={offer.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#128C7E] text-xs font-bold font-mono">
                            {offer.discountPercentage ?? 0}%
                          </span>
                          <div>
                            <span className="font-bold text-xs text-[#0A192F] block">{isAr ? offer.titleAr : offer.titleEn}</span>
                            <span className="text-[11px] text-gray-500">
                              {isAr ? offer.badgeAr : offer.badgeEn}
                              {offer.validUntil ? ` • ${tr('Valid until', 'ساري حتى')} ${offer.validUntil}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleOffer(offer)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${offer.isActive ? 'bg-[#25D366]/20 text-[#128C7E]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {offer.isActive ? tr('Published', 'منشور') : tr('Hidden', 'مخفي')}
                          </button>
                          <button onClick={() => handleDeleteOffer(offer.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg" title={tr('Delete', 'حذف')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {cmsSubTab === 'testimonials' && (
              <div className="space-y-6">
                <p className="text-xs text-gray-600">
                  {tr('Review student testimonials before they appear on the public site.', 'راجع آراء الطلاب قبل ظهورها في الموقع.')}
                </p>
                <div className="space-y-3">
                  {testimonialsList.length === 0 ? (
                    <div className={emptyCls}>{tr('No testimonials to review.', 'لا توجد آراء للمراجعة.')}</div>
                  ) : (
                    testimonialsList.map((test) => (
                      <div key={test.id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#0A192F]">{isAr ? test.studentNameAr : test.studentNameEn}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">{test.level}</span>
                            <div className="flex items-center text-[#D4AF37]">
                              {[...Array(test.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 italic">"{isAr ? test.quoteAr : test.quoteEn}"</p>
                          <span className="text-[10px] text-gray-400 block">{test.submittedAt ? new Date(test.submittedAt).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleTestimonial(test.id, test.isApproved)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${test.isApproved ? 'bg-[#25D366]/20 text-[#128C7E]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {test.isApproved ? tr('Approved', 'معتمد') : tr('Pending Approval', 'بانتظار الاعتماد')}
                          </button>
                          <button onClick={() => handleDeleteTestimonial(test.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg">
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

        {/* REVIEWS GALLERY */}
        {activeTab === 'feedback_reviews' && <AdminReviewsManager onNotice={(msg) => notify(msg, 4000)} />}
      </div>
    </div>
  );
};
