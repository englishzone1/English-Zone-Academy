export type EnglishClubStatus = 'open' | 'coming_soon' | 'closed';

export interface EnglishClubTrackConfig {
  trackId: 'A1-A2' | 'B1-B2' | 'C1-C2';
  titleEn: string;
  titleAr: string;
  cefrRange: string;
  suitableForEn: string;
  suitableForAr: string;
  dayTimeEn?: string;
  dayTimeAr?: string;
  activeTopicEn?: string;
  activeTopicAr?: string;
  breakoutCapacity?: number;
  meetingPlatform?: 'Zoom' | 'Google Meet';
  isConfigured: boolean;
}

export interface EnglishClubSettings {
  id: string;
  isRegistrationOpen: boolean;
  status: EnglishClubStatus;
  // Membership fee is strictly optional and only displayed when configured by Super Admin
  membershipFeeUSD?: number | null;
  feeNoteEn?: string;
  feeNoteAr?: string;
  isPriceConfigured: boolean;
  // By default students are NOT required to purchase General English course
  requiresGeneralEnglish: boolean;
  sessionDurationMinutes: number; // default 60
  maxBreakoutCapacity: number; // default 15
  tracks: {
    'A1-A2': EnglishClubTrackConfig;
    'B1-B2': EnglishClubTrackConfig;
    'C1-C2': EnglishClubTrackConfig;
  };
  announcementEn?: string;
  announcementAr?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EnglishClubRegistrationPayload {
  fullName: string;
  whatsappNumber: string;
  email: string;
  selectedTrack: 'A1-A2' | 'B1-B2' | 'C1-C2' | 'undecided';
  currentEnglishLevel?: string;
  notes?: string;
  type: 'english_club';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}
