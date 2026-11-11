import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

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

export const contentManagementService = {
  // --- 1. Website Content Sections ---
  async getSections(): Promise<WebsiteSectionContent[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'website_content'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as WebsiteSectionContent));
    } catch (err) {
      console.warn('Error fetching website_content from Firestore:', err);
      return [];
    }
  },

  async saveSection(section: WebsiteSectionContent): Promise<void> {
    if (!db) return;
    const docRef = doc(db, 'website_content', section.sectionKey || section.id);
    await setDoc(docRef, {
      ...section,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },

  // --- 2. Dynamic Courses & Curricula ---
  async getCourses(): Promise<DynamicCourseItem[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'courses'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DynamicCourseItem));
    } catch (err) {
      console.warn('Error fetching courses from Firestore:', err);
      return [];
    }
  },

  async saveCourse(course: DynamicCourseItem): Promise<void> {
    if (!db) return;
    const docRef = course.id ? doc(db, 'courses', course.id) : doc(collection(db, 'courses'));
    await setDoc(docRef, { ...course, id: docRef.id }, { merge: true });
  },

  async deleteCourse(courseId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'courses', courseId));
  },

  // --- 3. Books & Downloadable Library Materials ---
  async getLibraryMaterials(): Promise<LibraryBookMaterial[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'library_materials'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBookMaterial));
    } catch (err) {
      console.warn('Error fetching library_materials from Firestore:', err);
      return [];
    }
  },

  async saveLibraryMaterial(material: LibraryBookMaterial): Promise<void> {
    if (!db) return;
    const docRef = material.id ? doc(db, 'library_materials', material.id) : doc(collection(db, 'library_materials'));
    await setDoc(docRef, { ...material, id: docRef.id }, { merge: true });
  },

  async deleteLibraryMaterial(materialId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'library_materials', materialId));
  },

  // --- 4. Offers & Promotions ---
  async getOffers(): Promise<DynamicPromotionOffer[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'promotions_offers'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DynamicPromotionOffer));
    } catch (err) {
      console.warn('Error fetching promotions_offers from Firestore:', err);
      return [];
    }
  },

  async saveOffer(offer: DynamicPromotionOffer): Promise<void> {
    if (!db) return;
    const docRef = offer.id ? doc(db, 'promotions_offers', offer.id) : doc(collection(db, 'promotions_offers'));
    await setDoc(docRef, { ...offer, id: docRef.id }, { merge: true });
  },

  async deleteOffer(offerId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'promotions_offers', offerId));
  },

  // --- 5. Testimonials Moderation ---
  async getTestimonials(): Promise<DynamicTestimonial[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DynamicTestimonial));
    } catch (err) {
      console.warn('Error fetching testimonials from Firestore:', err);
      return [];
    }
  },

  async toggleTestimonialApproval(testimonialId: string, isApproved: boolean): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'testimonials', testimonialId), { isApproved });
  },

  async deleteTestimonial(testimonialId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'testimonials', testimonialId));
  }
};
