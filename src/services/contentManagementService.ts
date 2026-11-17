import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import type { BlogPost, LevelGroupPricing, StagePricing, SocialLinks } from '../types';
import {
  BLOG_POSTS,
  LEVEL_GROUP_PRICING,
  STAGE_PRICING_TABLE,
  OFFICIAL_CONTACTS,
  EF_SET_PLACEMENT_TEST_URL
} from '../data/academyData';

/* ------------------------------------------------------------------ */
/*  إعدادات تحتاج مراجعتك: غيّر الأسماء هنا إذا كانت مختلفة في مشروعك   */
/* ------------------------------------------------------------------ */
// اسم مجموعة الطلاب في Firestore وحقل مجموع النجوم داخل وثيقة الطالب
const STUDENTS_COLLECTION = 'students';
const STUDENT_STARS_FIELD = 'stars';

/* ------------------------------ Types ------------------------------ */

export interface WebsiteSectionContent {
  id: string;
  sectionKey: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  updatedAt: string;
  updatedBy: string;
}

export interface DynamicCourseItem {
  id: string;
  titleEn: string;
  titleAr: string;
  level: string;
  descriptionEn: string;
  descriptionAr: string;
  durationMonths: number;
  format: 'individual' | 'group' | 'both';
  isActive: boolean;
}

export interface LibraryBookMaterial {
  id: string;
  titleEn: string;
  titleAr: string;
  category: 'curriculum' | 'reading' | 'grammar' | 'vocabulary';
  level: string;
  downloadUrl?: string;
  fileSizeMb?: number;
  isPublic: boolean;
  addedAt: string;
}

export interface DynamicPromotionOffer {
  id: string;
  titleEn: string;
  titleAr: string;
  discountPercentage?: number;
  badgeEn: string;
  badgeAr: string;
  descriptionEn: string;
  descriptionAr: string;
  validUntil: string;
  promoCode?: string;
  isActive: boolean;
}

export interface DynamicTestimonial {
  id: string;
  studentNameEn: string;
  studentNameAr: string;
  roleEn: string;
  roleAr: string;
  level: string;
  quoteEn: string;
  quoteAr: string;
  rating: number;
  isApproved: boolean;
  submittedAt: string;
}

export interface BlogPostRecord extends BlogPost {
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademySettings extends SocialLinks {
  placementTestUrl: string;
  registrationOpen: boolean;
  updatedAt?: string;
}

export interface StarsLogEntry {
  id: string;
  studentId: string;
  delta: number; // موجب = إضافة، سالب = خصم
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface GradeRecord {
  id: string; // studentId_YYYY-MM
  studentId: string;
  month: string; // YYYY-MM
  monthlyTest?: number; // 0-100
  homework?: number; // 0-100
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

/* ------------------------------ Helpers ---------------------------- */

// Firestore يرفض أي حقل قيمته undefined (مثل downloadUrl الاختياري) فيفشل الحفظ بصمت.
// هذه الدالة تحذف هذه الحقول قبل الكتابة.
const clean = <T extends object>(obj: T): T => JSON.parse(JSON.stringify(obj));

// بدل أن يتجاهل الحفظ بصمت عند غياب Firebase، نرمي خطأ واضحاً ليظهر في لوحة الإدارة.
const requireDb = () => {
  if (!db) throw new Error('Firebase is not configured');
  return db;
};

async function readCollection<T>(name: string): Promise<T[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as unknown as T));
  } catch (err) {
    // غالباً permission-denied يعني أن قواعد Firestore لا تسمح بالقراءة
    console.error(`Error reading "${name}" from Firestore:`, err);
    return [];
  }
}

async function saveItem<T extends { id?: string }>(name: string, item: T): Promise<string> {
  const database = requireDb();
  const ref = item.id ? doc(database, name, item.id) : doc(collection(database, name));
  await setDoc(ref, clean({ ...item, id: ref.id }), { merge: true });
  return ref.id;
}

async function removeItem(name: string, id: string): Promise<void> {
  const database = requireDb();
  await deleteDoc(doc(database, name, id));
}

const byNewest = <T extends { createdAt?: string }>(a: T, b: T) =>
  (b.createdAt || '').localeCompare(a.createdAt || '');

/* ------------------------------ Service ---------------------------- */

export const contentManagementService = {
  // --- 1. Website Content Sections ---
  async getSections(): Promise<WebsiteSectionContent[]> {
    return readCollection<WebsiteSectionContent>('website_content');
  },

  async saveSection(section: WebsiteSectionContent): Promise<void> {
    const database = requireDb();
    const key = section.sectionKey || section.id;
    await setDoc(
      doc(database, 'website_content', key),
      clean({ ...section, id: key, updatedAt: new Date().toISOString() }),
      { merge: true }
    );
  },

  // --- 2. Dynamic Courses & Curricula ---
  async getCourses(): Promise<DynamicCourseItem[]> {
    return readCollection<DynamicCourseItem>('courses');
  },
  async saveCourse(course: DynamicCourseItem): Promise<void> {
    await saveItem('courses', course);
  },
  async deleteCourse(courseId: string): Promise<void> {
    await removeItem('courses', courseId);
  },

  // --- 3. Library Materials ---
  async getLibraryMaterials(): Promise<LibraryBookMaterial[]> {
    return readCollection<LibraryBookMaterial>('library_materials');
  },
  async saveLibraryMaterial(material: LibraryBookMaterial): Promise<void> {
    await saveItem('library_materials', material);
  },
  async deleteLibraryMaterial(materialId: string): Promise<void> {
    await removeItem('library_materials', materialId);
  },

  // --- 4. Offers & Promotions ---
  async getOffers(): Promise<DynamicPromotionOffer[]> {
    return readCollection<DynamicPromotionOffer>('promotions_offers');
  },
  async saveOffer(offer: DynamicPromotionOffer): Promise<void> {
    await saveItem('promotions_offers', offer);
  },
  async deleteOffer(offerId: string): Promise<void> {
    await removeItem('promotions_offers', offerId);
  },

  // --- 5. Testimonials Moderation ---
  async getTestimonials(): Promise<DynamicTestimonial[]> {
    return readCollection<DynamicTestimonial>('testimonials');
  },
  async toggleTestimonialApproval(testimonialId: string, isApproved: boolean): Promise<void> {
    const database = requireDb();
    await updateDoc(doc(database, 'testimonials', testimonialId), { isApproved });
  },
  async deleteTestimonial(testimonialId: string): Promise<void> {
    await removeItem('testimonials', testimonialId);
  },

  // --- 6. Blog (public page reads only published posts) ---
  async getPublishedBlogPosts(): Promise<BlogPostRecord[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(
        query(collection(db, 'blog_posts'), where('isPublished', '==', true))
      );
      return snap.docs
        .map(d => ({ ...d.data(), id: d.id } as unknown as BlogPostRecord))
        .sort(byNewest);
    } catch (err) {
      console.error('Error reading published blog posts:', err);
      return [];
    }
  },

  async getAllBlogPosts(): Promise<BlogPostRecord[]> {
    const posts = await readCollection<BlogPostRecord>('blog_posts');
    return posts.sort(byNewest);
  },

  async saveBlogPost(post: Partial<BlogPostRecord> & { id?: string }): Promise<string> {
    const now = new Date().toISOString();
    return saveItem('blog_posts', {
      ...post,
      isPublished: post.isPublished ?? false,
      createdAt: post.createdAt || now,
      updatedAt: now
    });
  },

  async setBlogPostPublished(postId: string, isPublished: boolean): Promise<void> {
    const database = requireDb();
    await updateDoc(doc(database, 'blog_posts', postId), {
      isPublished,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteBlogPost(postId: string): Promise<void> {
    await removeItem('blog_posts', postId);
  },

  // رفع المقالات الثلاثة الموجودة في الكود إلى Firestore مرة واحدة لتعديلها من لوحة الإدارة
  async seedBlogFromDefaults(): Promise<void> {
    const database = requireDb();
    const batch = writeBatch(database);
    const now = new Date().toISOString();
    BLOG_POSTS.forEach((p, i) => {
      batch.set(
        doc(database, 'blog_posts', p.id),
        clean({
          ...p,
          isPublished: true,
          createdAt: new Date(Date.now() - i * 1000).toISOString(), // يحافظ على الترتيب
          updatedAt: now
        }),
        { merge: true }
      );
    });
    await batch.commit();
  },

  // --- 7. Pricing (يرجع للقيم الثابتة في الكود إذا لم يُحفظ شيء بعد) ---
  async getLevelPricing(): Promise<LevelGroupPricing[]> {
    const rows = await readCollection<LevelGroupPricing>('pricing_levels');
    if (rows.length === 0) return LEVEL_GROUP_PRICING;
    return rows.sort((a, b) => a.level.localeCompare(b.level));
  },

  async getStagePricing(): Promise<StagePricing[]> {
    const rows = await readCollection<StagePricing>('pricing_stages');
    if (rows.length === 0) return STAGE_PRICING_TABLE;
    return rows.sort((a, b) => a.stage.localeCompare(b.stage));
  },

  async saveLevelPricing(p: LevelGroupPricing): Promise<void> {
    const database = requireDb();
    await setDoc(doc(database, 'pricing_levels', p.level), clean(p), { merge: true });
  },

  async saveStagePricing(p: StagePricing): Promise<void> {
    const database = requireDb();
    await setDoc(doc(database, 'pricing_stages', p.stage), clean(p), { merge: true });
  },

  async seedPricingFromDefaults(): Promise<void> {
    const database = requireDb();
    const batch = writeBatch(database);
    LEVEL_GROUP_PRICING.forEach(p =>
      batch.set(doc(database, 'pricing_levels', p.level), clean(p), { merge: true })
    );
    STAGE_PRICING_TABLE.forEach(p =>
      batch.set(doc(database, 'pricing_stages', p.stage), clean(p), { merge: true })
    );
    await batch.commit();
  },

  // --- 8. Academy settings (روابط التواصل ورابط اختبار المستوى) ---
  async getAcademySettings(): Promise<AcademySettings> {
    const defaults: AcademySettings = {
      ...OFFICIAL_CONTACTS,
      placementTestUrl: EF_SET_PLACEMENT_TEST_URL,
      registrationOpen: true
    };
    if (!db) return defaults;
    try {
      const snap = await getDoc(doc(db, 'academy_settings', 'main'));
      return snap.exists() ? { ...defaults, ...(snap.data() as Partial<AcademySettings>) } : defaults;
    } catch (err) {
      console.error('Error reading academy_settings:', err);
      return defaults;
    }
  },

  async saveAcademySettings(settings: AcademySettings): Promise<void> {
    const database = requireDb();
    await setDoc(
      doc(database, 'academy_settings', 'main'),
      clean({ ...settings, updatedAt: new Date().toISOString() }),
      { merge: true }
    );
  },

  // --- 9. Stars audit log ---
  // يسجل العملية في stars_log ويعدّل مجموع نجوم الطالب في نفس الوقت (كلاهما ينجح أو يفشل معاً)
  async addStars(studentId: string, delta: number, reason: string, adminId: string): Promise<void> {
    if (!studentId) throw new Error('studentId is required');
    if (!Number.isFinite(delta) || delta === 0) throw new Error('delta must be a non-zero number');
    if (!reason.trim()) throw new Error('reason is required');

    const database = requireDb();
    const batch = writeBatch(database);
    const logRef = doc(collection(database, 'stars_log'));
    batch.set(
      logRef,
      clean<StarsLogEntry>({
        id: logRef.id,
        studentId,
        delta,
        reason: reason.trim(),
        createdAt: new Date().toISOString(),
        createdBy: adminId
      })
    );
    batch.update(doc(database, STUDENTS_COLLECTION, studentId), {
      [STUDENT_STARS_FIELD]: increment(delta)
    });
    await batch.commit();
  },

  async getStarsLog(studentId?: string): Promise<StarsLogEntry[]> {
    if (!db) return [];
    try {
      const base = collection(db, 'stars_log');
      const snap = await getDocs(studentId ? query(base, where('studentId', '==', studentId)) : base);
      return snap.docs
        .map(d => ({ ...d.data(), id: d.id } as unknown as StarsLogEntry))
        .sort(byNewest);
    } catch (err) {
      console.error('Error reading stars_log:', err);
      return [];
    }
  },

  // --- 10. Grades (اختبار شهري + واجب) ---
  async saveGrade(
    input: { studentId: string; month: string; monthlyTest?: number; homework?: number; notes?: string },
    adminId: string
  ): Promise<void> {
    const { studentId, month, monthlyTest, homework, notes } = input;
    if (!studentId) throw new Error('studentId is required');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('month must look like 2026-11');
    for (const v of [monthlyTest, homework]) {
      if (v !== undefined && (!Number.isFinite(v) || v < 0 || v > 100)) {
        throw new Error('grades must be between 0 and 100');
      }
    }
    const database = requireDb();
    const id = `${studentId}_${month}`;
    await setDoc(
      doc(database, 'grades', id),
      clean<GradeRecord>({
        id,
        studentId,
        month,
        monthlyTest,
        homework,
        notes,
        updatedAt: new Date().toISOString(),
        updatedBy: adminId
      } as GradeRecord),
      { merge: true }
    );
  },

  async getGrades(studentId?: string): Promise<GradeRecord[]> {
    if (!db) return [];
    try {
      const base = collection(db, 'grades');
      const snap = await getDocs(studentId ? query(base, where('studentId', '==', studentId)) : base);
      return snap.docs
        .map(d => ({ ...d.data(), id: d.id } as unknown as GradeRecord))
        .sort((a, b) => b.month.localeCompare(a.month));
    } catch (err) {
      console.error('Error reading grades:', err);
      return [];
    }
  },

  async deleteGrade(gradeId: string): Promise<void> {
    await removeItem('grades', gradeId);
  }
};
