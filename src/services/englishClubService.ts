import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { EnglishClubSettings, EnglishClubRegistrationPayload } from '../types/englishClub';

const SETTINGS_DOC_ID = 'english_club';
const LOCAL_STORAGE_SETTINGS_KEY = 'ez_english_club_settings';

export const DEFAULT_ENGLISH_CLUB_SETTINGS: EnglishClubSettings = {
  id: SETTINGS_DOC_ID,
  isRegistrationOpen: true,
  status: 'open',
  membershipFeeUSD: null,
  isPriceConfigured: false,
  feeNoteEn: 'Affordable club fee is communicated upon cohort registration by the academy administration.',
  feeNoteAr: 'يتم تحديد الرسوم الميسرة من قِبل إدارة الأكاديمية عند تأكيد التسجيل في الدورة.',
  requiresGeneralEnglish: false,
  sessionDurationMinutes: 60,
  maxBreakoutCapacity: 15,
  tracks: {
    'A1-A2': {
      trackId: 'A1-A2',
      titleEn: 'Foundations Club (A1–A2)',
      titleAr: 'مسار التأسيس والمبتدئين (A1–A2)',
      cefrRange: 'CEFR A1–A2',
      suitableForEn: 'Beginner & Elementary learners developing speaking habits and basic daily communication.',
      suitableForAr: 'للمبتدئين لتأسيس عادة التحدث اليومية وكسر حاجز الخوف في بيئة داعمة ومريحة.',
      isConfigured: false,
      meetingPlatform: 'Google Meet',
    },
    'B1-B2': {
      trackId: 'B1-B2',
      titleEn: 'Intermediate Fluency Club (B1–B2)',
      titleAr: 'مسار الطلاقة المتوسطة (B1–B2)',
      cefrRange: 'CEFR B1–B2',
      suitableForEn: 'Intermediate speakers looking to speak smoothly, debate engaging topics, and expand active vocabulary.',
      suitableForAr: 'للمتحدثين في المستوى المتوسط لتطوير الطلاقة، ومناقشة مواضيع متنوعة، واكتساب مفردات متقدمة.',
      isConfigured: false,
      meetingPlatform: 'Google Meet',
    },
    'C1-C2': {
      trackId: 'C1-C2',
      titleEn: 'Advanced Mastery Club (C1–C2)',
      titleAr: 'مسار الإتقان والاحتراف (C1–C2)',
      cefrRange: 'CEFR C1–C2',
      suitableForEn: 'Upper-intermediate & advanced speakers sharpening nuance, idiomatic speech, and professional conversation.',
      suitableForAr: 'للمستويات المتقدمة لإتقان التعبير الدقيق، والمصطلحات الاحترافية، والخطابة ومناقشة الأفكار المعقدة.',
      isConfigured: false,
      meetingPlatform: 'Google Meet',
    }
  }
};

export const englishClubService = {
  /**
   * Fetch English Club settings from Firestore.
   * If not yet saved in Firestore, falls back to default unconfigured state (strictly no invented pricing or schedule).
   */
  async getSettings(): Promise<EnglishClubSettings> {
    try {
      if (db) {
        const docRef = doc(db, 'academy_settings', SETTINGS_DOC_ID);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<EnglishClubSettings>;
          return {
            ...DEFAULT_ENGLISH_CLUB_SETTINGS,
            ...data,
            tracks: {
              'A1-A2': { ...DEFAULT_ENGLISH_CLUB_SETTINGS.tracks['A1-A2'], ...(data.tracks?.['A1-A2'] || {}) },
              'B1-B2': { ...DEFAULT_ENGLISH_CLUB_SETTINGS.tracks['B1-B2'], ...(data.tracks?.['B1-B2'] || {}) },
              'C1-C2': { ...DEFAULT_ENGLISH_CLUB_SETTINGS.tracks['C1-C2'], ...(data.tracks?.['C1-C2'] || {}) }
            }
          };
        }
      }
    } catch (err) {
      console.warn('Could not load club settings from Firestore, checking local cache:', err);
    }

    // Local cached fallback if offline
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }

    return DEFAULT_ENGLISH_CLUB_SETTINGS;
  },

  /**
   * Save settings to Firestore academy_settings/english_club
   */
  async updateSettings(settings: Partial<EnglishClubSettings>, updatedByName: string): Promise<void> {
    const payload: Partial<EnglishClubSettings> = {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedByName
    };

    if (db) {
      const docRef = doc(db, 'academy_settings', SETTINGS_DOC_ID);
      await setDoc(docRef, payload, { merge: true });
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify({ ...DEFAULT_ENGLISH_CLUB_SETTINGS, ...payload }));
    } catch {
      // Ignore
    }
  },

  /**
   * Submit new English Club registration request
   */
  async submitClubRegistration(form: Omit<EnglishClubRegistrationPayload, 'type' | 'status' | 'submittedAt'>): Promise<string> {
    const referenceId = `CLUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    const applicationData = {
      ...form,
      id: referenceId,
      type: 'english_club',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      timestamp: serverTimestamp ? serverTimestamp() : new Date().toISOString()
    };

    if (db) {
      try {
        const collectionRef = collection(db, 'registration_requests');
        await addDoc(collectionRef, applicationData);
      } catch (err) {
        console.warn('Firestore submission fallback:', err);
      }
    }

    return referenceId;
  }
};
