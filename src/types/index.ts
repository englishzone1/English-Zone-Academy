export type Language = 'en' | 'ar';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type StageId = 
  | 'A1.1' | 'A1.2' | 'A1.3'
  | 'A2.1' | 'A2.2' | 'A2.3'
  | 'B1.1' | 'B1.2' | 'B1.3'
  | 'B2.1' | 'B2.2' | 'B2.3'
  | 'C1.1' | 'C1.2' | 'C1.3'
  | 'C2.1' | 'C2.2' | 'C2.3';

export type LearningFormat = 'individual' | 'group';

export interface StagePricing {
  stage: StageId;
  level: CEFRLevel;
  stageNumber: 1 | 2 | 3;
  months: string;
  individualCurrent: number;
  individualOriginal: number;
  groupPrice: number;
}

export interface CEFRLevelInfo {
  code: CEFRLevel;
  nameEn: string;
  nameAr: string;
  durationMonths: number;
  descriptionEn: string;
  descriptionAr: string;
  targetAudienceEn: string;
  targetAudienceAr: string;
  stages: StageId[];
}

export interface ProgramCategory {
  id: string;
  titleEn: string;
  titleAr: string;
  shortDescEn: string;
  shortDescAr: string;
  fullDescEn: string;
  fullDescAr: string;
  objectivesEn: string[];
  objectivesAr: string[];
  suitableForEn: string;
  suitableForAr: string;
  formatEn: string;
  formatAr: string;
  durationEn: string;
  durationAr: string;
  monthlyStartingPrice: number;
  iconName: string;
  badgeEn?: string;
  badgeAr?: string;
}

export interface CurriculumStage {
  stageId: StageId;
  level: CEFRLevel;
  stageNameEn: string;
  stageNameAr: string;
  monthsEn: string;
  monthsAr: string;
  units: {
    unitNumber: number;
    titleEn: string;
    titleAr: string;
    grammarEn: string;
    grammarAr: string;
    vocabularyEn: string;
    vocabularyAr: string;
    skillsEn: string;
    skillsAr: string;
    speakingActivityEn: string;
    speakingActivityAr: string;
  }[];
}

export interface PlacementQuestion {
  id: number;
  level: CEFRLevel;
  questionEn: string;
  questionAr: string;
  options: {
    textEn: string;
    textAr: string;
    isCorrect: boolean;
  }[];
  explanationEn: string;
  explanationAr: string;
}

export interface RegistrationFormData {
  fullName: string;
  age: number | '';
  country: string;
  whatsappNumber: string;
  email: string;
  mainLevel: CEFRLevel | 'needs_test';
  learningGoal: string;
  learningFormat: LearningFormat;
  notes?: string;
}

export interface BlogPost {
  id: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  contentEn: string;
  contentAr: string;
  categoryEn: string;
  categoryAr: string;
  readTime: string;
  publishDate: string;
  imageUrl: string;
}

export interface FAQItem {
  id: string;
  category: 'general' | 'programs' | 'pricing' | 'tests' | 'format';
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
}

export interface SocialLinks {
  whatsapp: string;
  email: string;
  youtube: string;
  instagram: string;
  discord: string;
  facebook: string;
  telegram: string;
}
