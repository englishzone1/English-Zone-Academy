import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  FeedbackScreenshot,
  PrivacyMaskBox,
  PrivacyMaskStyle,
  ReviewCategory
} from '../types/reviews';
import { PUBLISHED_FEEDBACK_SCREENSHOTS } from '../data/publishedReviewsData';

const COLLECTION_NAME = 'feedback_screenshots';
const MAX_WIDTH = 1120;
const MAX_HEIGHT = 1400;
const MAX_DATA_URL_CHARS = 680_000;

export const ATTACHED_REVIEW_ASSET_PATHS: { id: string; path: string; suggestedCategory: ReviewCategory }[] =
  PUBLISHED_FEEDBACK_SCREENSHOTS.map((item) => ({
    id: item.id,
    path: item.imageDataUrl,
    suggestedCategory: item.category
  }));

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for optimization.'));
    img.src = src;
  });
}

function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

function encodeCanvasUnderLimit(canvas: HTMLCanvasElement, initialQuality = 0.86): string {
  const mimeCandidates: ('image/webp' | 'image/jpeg')[] = ['image/webp', 'image/jpeg'];
  const qualitySteps = [initialQuality, 0.78, 0.7, 0.62];

  for (const mime of mimeCandidates) {
    for (const q of qualitySteps) {
      const dataUrl = canvas.toDataURL(mime, q);
      if (dataUrl.startsWith(`data:${mime}`) && dataUrl.length <= MAX_DATA_URL_CHARS) {
        return dataUrl;
      }
    }
  }

  let current = canvas;
  for (let i = 0; i < 3; i++) {
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = Math.max(480, Math.round(current.width * 0.8));
    nextCanvas.height = Math.max(360, Math.round(current.height * 0.8));
    const ctx = nextCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(current, 0, 0, nextCanvas.width, nextCanvas.height);
      const dataUrl = nextCanvas.toDataURL('image/jpeg', 0.72);
      if (dataUrl.length <= MAX_DATA_URL_CHARS) {
        return dataUrl;
      }
    }
    current = nextCanvas;
  }

  return current.toDataURL('image/jpeg', 0.6);
}

/**
 * Optimizes an uploaded File or URL for fast web loading and crisp text readability.
 */
export async function optimizeFeedbackImage(source: File | string): Promise<string> {
  const isFile = typeof source !== 'string';
  const objectUrl = isFile ? fileToObjectUrl(source) : source;

  try {
    const img = await loadImageElement(objectUrl);
    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    const widthScale = targetWidth > MAX_WIDTH ? MAX_WIDTH / targetWidth : 1;
    const heightScale = targetHeight > MAX_HEIGHT ? MAX_HEIGHT / targetHeight : 1;
    const scale = Math.min(widthScale, heightScale);

    targetWidth = Math.max(1, Math.round(targetWidth * scale));
    targetHeight = Math.max(1, Math.round(targetHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return encodeCanvasUnderLimit(canvas, 0.86);
  } finally {
    if (isFile) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

/**
 * Permanently renders privacy redaction masks directly onto the image canvas
 * so personal phone numbers, names, and profile photos are removed from pixels
 * before publication, without modifying the feedback message text.
 */
export async function renderPrivacyMaskedImage(
  imageSrc: string,
  masks: PrivacyMaskBox[],
  maskStyle: PrivacyMaskStyle
): Promise<string> {
  const img = await loadImageElement(imageSrc);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable.');
  }

  ctx.drawImage(img, 0, 0, w, h);

  for (const box of masks) {
    const rx = Math.round(box.x * w);
    const ry = Math.round(box.y * h);
    const rw = Math.max(4, Math.round(box.width * w));
    const rh = Math.max(4, Math.round(box.height * h));

    if (maskStyle === 'blur') {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = rw;
      tempCanvas.height = rh;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        const tinyW = Math.max(2, Math.round(rw / 14));
        const tinyH = Math.max(2, Math.round(rh / 14));
        const pixelCanvas = document.createElement('canvas');
        pixelCanvas.width = tinyW;
        pixelCanvas.height = tinyH;
        const pCtx = pixelCanvas.getContext('2d');
        if (pCtx) {
          pCtx.drawImage(img, rx, ry, rw, rh, 0, 0, tinyW, tinyH);
          tCtx.imageSmoothingEnabled = false;
          tCtx.drawImage(pixelCanvas, 0, 0, tinyW, tinyH, 0, 0, rw, rh);
          tCtx.fillStyle = 'rgba(10, 25, 47, 0.25)';
          tCtx.fillRect(0, 0, rw, rh);
          ctx.drawImage(tempCanvas, rx, ry);
        }
      }
    } else {
      ctx.save();
      ctx.fillStyle = maskStyle === 'navy' ? '#0A192F' : '#111827';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
      ctx.lineWidth = Math.max(1, Math.round(w * 0.002));
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.restore();
    }
  }

  return encodeCanvasUnderLimit(canvas, 0.86);
}

function sanitizeFirestorePayload(item: FeedbackScreenshot): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: item.id,
    imageDataUrl: item.imageDataUrl,
    category: item.category || 'none',
    orderIndex: item.orderIndex,
    isPublished: Boolean(item.isPublished),
    hasPrivacyMask: Boolean(item.hasPrivacyMask),
    createdAt: item.createdAt
  };
  if (item.captionEn !== undefined) payload.captionEn = item.captionEn.slice(0, 200);
  if (item.captionAr !== undefined) payload.captionAr = item.captionAr.slice(0, 200);
  if (item.updatedAt !== undefined) payload.updatedAt = item.updatedAt;
  if (item.createdBy !== undefined) payload.createdBy = item.createdBy.slice(0, 120);
  return payload;
}

export const feedbackReviewsService = {
  /**
   * Public read: returns all published static assets merged with any published
   * Firestore feedback_screenshots records (sorted by orderIndex).
   */
  async getPublishedScreenshots(): Promise<FeedbackScreenshot[]> {
    const mergedMap = new Map<string, FeedbackScreenshot>();
    PUBLISHED_FEEDBACK_SCREENSHOTS.forEach((item) => {
      if (item.isPublished) {
        mergedMap.set(item.id, item);
      }
    });

    if (!db) {
      return Array.from(mergedMap.values()).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), where('isPublished', '==', true));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        const docItem = { id: d.id, ...(d.data() as Omit<FeedbackScreenshot, 'id'>) };
        mergedMap.set(docItem.id, docItem);
      });
    } catch (err) {
      console.warn('Error loading Firestore published feedback screenshots (using published assets):', err);
    }

    return Array.from(mergedMap.values()).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  },

  /**
   * Admin read: fetches all feedback screenshots from Firestore and merges any
   * published built-in screenshots not yet overridden in Firestore.
   */
  async getAllScreenshotsForAdmin(): Promise<FeedbackScreenshot[]> {
    const mergedMap = new Map<string, FeedbackScreenshot>();
    PUBLISHED_FEEDBACK_SCREENSHOTS.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    if (!db) {
      return Array.from(mergedMap.values()).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    }

    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      snap.docs.forEach((d) => {
        const docItem = { id: d.id, ...(d.data() as Omit<FeedbackScreenshot, 'id'>) };
        mergedMap.set(docItem.id, docItem);
      });
      return Array.from(mergedMap.values()).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
    }
  },

  async createScreenshot(item: FeedbackScreenshot): Promise<void> {
    if (!db) return;
    try {
      const ref = doc(db, COLLECTION_NAME, item.id);
      await setDoc(ref, sanitizeFirestorePayload(item));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COLLECTION_NAME}/${item.id}`);
    }
  },

  async updateScreenshot(
    id: string,
    patch: Partial<
      Pick<
        FeedbackScreenshot,
        'imageDataUrl' | 'category' | 'captionEn' | 'captionAr' | 'orderIndex' | 'isPublished' | 'hasPrivacyMask'
      >
    >,
    baseItem?: FeedbackScreenshot
  ): Promise<void> {
    if (!db) return;
    try {
      if (baseItem) {
        const merged: FeedbackScreenshot = {
          ...baseItem,
          ...patch,
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, COLLECTION_NAME, id), sanitizeFirestorePayload(merged));
        return;
      }

      const cleanPatch: Record<string, unknown> = {
        updatedAt: new Date().toISOString()
      };
      if (patch.imageDataUrl !== undefined) cleanPatch.imageDataUrl = patch.imageDataUrl;
      if (patch.category !== undefined) cleanPatch.category = patch.category;
      if (patch.captionEn !== undefined) cleanPatch.captionEn = patch.captionEn.slice(0, 200);
      if (patch.captionAr !== undefined) cleanPatch.captionAr = patch.captionAr.slice(0, 200);
      if (patch.orderIndex !== undefined) cleanPatch.orderIndex = patch.orderIndex;
      if (patch.isPublished !== undefined) cleanPatch.isPublished = patch.isPublished;
      if (patch.hasPrivacyMask !== undefined) cleanPatch.hasPrivacyMask = patch.hasPrivacyMask;

      await updateDoc(doc(db, COLLECTION_NAME, id), cleanPatch);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async deleteScreenshot(id: string): Promise<void> {
    if (!db) return;
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async updateOrderBatch(orderedItems: FeedbackScreenshot[]): Promise<void> {
    if (!db || orderedItems.length === 0) return;
    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();
      orderedItems.forEach((item, idx) => {
        const updated: FeedbackScreenshot = {
          ...item,
          orderIndex: idx + 1,
          updatedAt: now
        };
        batch.set(doc(db, COLLECTION_NAME, item.id), sanitizeFirestorePayload(updated));
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, COLLECTION_NAME);
    }
  }
};
