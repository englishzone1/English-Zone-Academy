export type ReviewCategory =
  | 'none'
  | 'student_reviews'
  | 'parents_feedback'
  | 'lecture_feedback'
  | 'course_experience';

export interface FeedbackScreenshot {
  id: string;
  imageDataUrl: string;
  category: ReviewCategory;
  captionEn?: string;
  captionAr?: string;
  orderIndex: number;
  isPublished: boolean;
  hasPrivacyMask: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface PrivacyMaskBox {
  id: string;
  /** Normalized coordinates (0..1) relative to natural image width & height */
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PrivacyMaskStyle = 'navy' | 'blur' | 'dark';
