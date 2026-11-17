import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

/* ------------------------------------------------------------------ */
/*  خدمات لوحة الطالب: الواجبات والحضور، روابط المنهج، المكتبة،        */
/*  الآراء، الرسائل، ومجتمع English Zone                               */
/* ------------------------------------------------------------------ */

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

const clean = <T extends object>(obj: T): T => JSON.parse(JSON.stringify(obj));

/* ------------------------------ Homework & attendance ------------------------------ */

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  note?: string;
}

/* ------------------------------ Course materials ------------------------------ */

export type MaterialType = 'book' | 'audio' | 'video' | 'other';

export interface MaterialLink {
  label: string;
  url: string;
  type: MaterialType;
}

export interface CourseMaterials {
  id: string; // = courseId
  courseId: string;
  courseTitleAr: string;
  courseTitleEn: string;
  level: string;
  links: MaterialLink[];
  updatedAt: string;
}

/* ------------------------------ Messages ------------------------------ */

export interface StudentMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  submittedAt: string;
  studentId?: string;
  reply?: string;
  repliedAt?: string;
}

/* ------------------------------ Community ------------------------------ */

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'admin';
  text: string;
  imageDataUrl?: string;
  audioDataUrl?: string;
  videoUrl?: string;
  authorAvatar?: any;
  likes: string[];
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'admin';
  authorAvatar?: any;
  text: string;
  createdAt: string;
}

// حد حجم الصورة أو التسجيل الصوتي داخل المنشور (Firestore يقبل حتى 1 ميغابايت للوثيقة)
export const MAX_MEDIA_CHARS = 700_000;

export const studentHubService = {
  /* ---------- Homework (admin records done / missed) ---------- */
  async addHomeworkRecord(p: { studentId: string; title: string; date: string; done: boolean }): Promise<void> {
    const id = newId('HW');
    await setDoc(doc(db, 'homework', id), {
      id,
      studentId: p.studentId,
      titleEn: p.title,
      titleAr: p.title,
      dueDate: p.date,
      status: p.done ? 'submitted' : 'missed',
      pointsAward: '',
      createdAt: new Date().toISOString()
    });
  },

  async getHomeworkFor(studentId: string): Promise<any[]> {
    const snap = await getDocs(query(collection(db, 'homework'), where('studentId', '==', studentId)));
    return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
  },

  async deleteHomework(id: string): Promise<void> {
    await deleteDoc(doc(db, 'homework', id));
  },

  /* ---------- Attendance (commitment) ---------- */
  async addAttendance(p: { studentId: string; date: string; present: boolean }): Promise<void> {
    // معرّف ثابت لكل طالب ويوم: تسجيل نفس اليوم مرة ثانية يستبدل الأول
    const id = `${p.studentId}_${p.date}`;
    await setDoc(doc(db, 'attendance', id), {
      id,
      studentId: p.studentId,
      date: p.date,
      present: p.present,
      createdAt: new Date().toISOString()
    });
  },

  async getAttendanceFor(studentId: string): Promise<AttendanceRecord[]> {
    const snap = await getDocs(query(collection(db, 'attendance'), where('studentId', '==', studentId)));
    return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as AttendanceRecord));
  },

  async deleteAttendance(id: string): Promise<void> {
    await deleteDoc(doc(db, 'attendance', id));
  },

  /* ---------- Course materials ---------- */
  async getAllMaterials(): Promise<CourseMaterials[]> {
    const snap = await getDocs(collection(db, 'course_materials'));
    return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as CourseMaterials));
  },

  async getMaterialsForLevel(level: string): Promise<CourseMaterials[]> {
    const snap = await getDocs(query(collection(db, 'course_materials'), where('level', '==', level)));
    return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as CourseMaterials));
  },

  async saveMaterials(m: Omit<CourseMaterials, 'id' | 'updatedAt'>): Promise<void> {
    await setDoc(
      doc(db, 'course_materials', m.courseId),
      clean({ ...m, id: m.courseId, updatedAt: new Date().toISOString() })
    );
  },

  /* ---------- Library (published books & magazine) ---------- */
  async getPublishedLibrary(): Promise<any[]> {
    const snap = await getDocs(collection(db, 'library_materials'));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id }))
      .filter((b) => b.isPublic)
      .sort((a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')));
  },

  /* ---------- Testimonials (student feedback, needs admin approval) ---------- */
  async submitTestimonial(p: { name: string; level?: string; text: string; rating: number }): Promise<void> {
    const id = newId('REV');
    const text = p.text.trim().slice(0, 1000);
    await setDoc(doc(db, 'testimonials', id), {
      id,
      studentNameEn: p.name,
      studentNameAr: p.name,
      roleEn: 'Student',
      roleAr: 'طالب',
      level: p.level || '',
      quoteEn: text,
      quoteAr: text,
      rating: Math.max(1, Math.min(5, Math.round(p.rating))),
      isApproved: false,
      submittedAt: new Date().toISOString()
    });
  },

  async getApprovedTestimonials(): Promise<any[]> {
    const snap = await getDocs(query(collection(db, 'testimonials'), where('isApproved', '==', true)));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id }))
      .sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
  },

  /* ---------- Messages between student and academy ---------- */
  async sendStudentMessage(p: { studentId: string; name: string; email: string; subject: string; message: string }): Promise<void> {
    const id = newId('MSG');
    await setDoc(doc(db, 'contact_messages', id), {
      id,
      name: p.name.trim().slice(0, 100),
      email: p.email.trim().slice(0, 150),
      subject: p.subject.trim().slice(0, 200),
      message: p.message.trim().slice(0, 3000),
      status: 'new',
      submittedAt: new Date().toISOString(),
      studentId: p.studentId
    });
  },

  async getMyMessages(studentId: string): Promise<StudentMessage[]> {
    const snap = await getDocs(query(collection(db, 'contact_messages'), where('studentId', '==', studentId)));
    return snap.docs
      .map((d) => ({ ...(d.data() as any), id: d.id } as StudentMessage))
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  },

  async replyToMessage(id: string, reply: string): Promise<void> {
    await updateDoc(doc(db, 'contact_messages', id), {
      reply: reply.trim().slice(0, 3000),
      repliedAt: new Date().toISOString(),
      status: 'replied'
    });
  },

  /* ---------- Community ---------- */
  async getPosts(max = 40): Promise<CommunityPost[]> {
    const snap = await getDocs(query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), limit(max)));
    return snap.docs.map((d) => ({ likes: [], ...(d.data() as any), id: d.id } as CommunityPost));
  },

  async createPost(p: Omit<CommunityPost, 'id' | 'likes' | 'createdAt'>): Promise<void> {
    const id = newId('POST');
    await setDoc(
      doc(db, 'community_posts', id),
      clean({ ...p, id, likes: [], createdAt: new Date().toISOString() })
    );
  },

  async deletePost(id: string): Promise<void> {
    const comments = await getDocs(collection(db, 'community_posts', id, 'comments'));
    await Promise.all(comments.docs.map((c) => deleteDoc(c.ref)));
    await deleteDoc(doc(db, 'community_posts', id));
  },

  async toggleLike(postId: string, uid: string, liked: boolean): Promise<void> {
    await updateDoc(doc(db, 'community_posts', postId), {
      likes: liked ? arrayRemove(uid) : arrayUnion(uid)
    });
  },

  async getComments(postId: string): Promise<CommunityComment[]> {
    const snap = await getDocs(query(collection(db, 'community_posts', postId, 'comments'), orderBy('createdAt', 'asc')));
    return snap.docs.map((d) => ({ ...(d.data() as any), id: d.id } as CommunityComment));
  },

  async addComment(postId: string, c: Omit<CommunityComment, 'id' | 'createdAt'>): Promise<void> {
    const id = newId('CMT');
    await setDoc(doc(db, 'community_posts', postId, 'comments', id), clean({
      ...c,
      id,
      text: c.text.trim().slice(0, 1000),
      createdAt: new Date().toISOString()
    }));
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await deleteDoc(doc(db, 'community_posts', postId, 'comments', commentId));
  }
};

/* ------------------------------ Media helpers ------------------------------ */

// تصغير الصورة وضغطها حتى تناسب حد الحجم
export const compressImage = (file: File, maxSide = 1280): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      for (const q of [0.82, 0.7, 0.6, 0.5, 0.4]) {
        const data = canvas.toDataURL('image/jpeg', q);
        if (data.length <= MAX_MEDIA_CHARS) return resolve(data);
      }
      if (maxSide > 640) {
        compressImage(file, Math.round(maxSide * 0.7)).then(resolve, reject);
      } else {
        reject(new Error('Image too large'));
      }
    };
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = url;
  });

export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

// يقبل روابط يوتيوب وجوجل درايف وأي رابط https
export const isSafeUrl = (u: string): boolean => /^https:\/\/[^\s]+$/i.test(u.trim());
