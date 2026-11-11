import { CEFRLevel, StageId, LearningFormat } from './index';

export type UserRole = 'super-admin' | 'super_admin' | 'admin' | 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  age?: number;
  // Student-specific fields
  mainLevel?: CEFRLevel;
  currentStage?: StageId;
  learningFormat?: LearningFormat;
  points?: number;
  starOfTheWeekCount?: number;
  starOfTheMonthCount?: number;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  assignedGroupId?: string;
  subscriptionStatus?: 'active' | 'pending' | 'due' | 'expired';
  monthlyTuitionUSD?: number;
  avatarConfig?: AvatarConfiguration;
  createdAt: string;
}

export interface AvatarConfiguration {
  gender: 'male' | 'female';
  characterType: 'child' | 'teen' | 'adult';
  skinTone: string;
  faceShape: string;
  eyesStyle: string;
  eyeColor: string;
  hairStyle: string;
  hairColor: string;
  hasHijab: boolean;
  hijabStyle: string;
  hijabColor: string;
  clothingType: string;
  clothingColor: string;
  backgroundId: string;
  accessories: string[];
  // 3D Visual Engine Extensions
  secondaryClothingColor?: string;
  bottomType?: string;
  bottomColor?: string;
  shoesType?: string;
  shoesColor?: string;
  eyebrowsColor?: string;
  lipColor?: string;
  cameraPreset?: 'face' | 'upper' | 'full';
}

export interface RegistrationRequest {
  id: string;
  fullName: string;
  age: number | '';
  country: string;
  whatsappNumber: string;
  email: string;
  mainLevel: CEFRLevel | 'needs_test';
  learningGoal: string;
  learningFormat: LearningFormat;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedTeacherId?: string;
  assignedLevel?: CEFRLevel;
  assignedStage?: StageId;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
