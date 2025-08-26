// 전문 진단 시스템 타입 정의

export interface AssessmentQuestion {
  id: string;
  text: string;
  category: 'gross_motor' | 'fine_motor' | 'language' | 'social' | 'cognitive' | 'attention' | 'emotional';
  ageRange: string;
  observationGuide?: string;
  videoDemo?: string;
  materialsNeeded?: string[];
  scoringCriteria: {
    excellent: { score: number; description: string };
    good: { score: number; description: string };
    needsSupport: { score: number; description: string };
  };
  clinicalSignificance?: string;
}

export interface InfantAssessment {
  grossMotor: AssessmentQuestion[];
  fineMotor: AssessmentQuestion[];
  language: AssessmentQuestion[];
  social: AssessmentQuestion[];
  cognitive: AssessmentQuestion[];
}

export interface ChildAssessment {
  attentionGames: AssessmentGame[];
  socialEmotional: AssessmentGame[];
  cognitiveTests: AssessmentGame[];
}

export interface AdultAssessment {
  emotionalWellnessCheck: AssessmentQuestion[];
  mindPeaceCheck: AssessmentQuestion[];
  personalCharacteristics: AssessmentQuestion[];
  workplaceAdaptation: AssessmentQuestion[];
}

export interface AssessmentGame {
  name: string;
  description: string;
  duration: number; // seconds
  measurement: string[];
  clinicalValue: string;
  difficultyLevels?: string[];
  ageNorms?: Record<string, string>;
}

export interface AssessmentResult {
  userId: string;
  assessmentType: 'infant' | 'child' | 'adult';
  ageInMonths: number;
  scores: Record<string, number>;
  standardizedScores: Record<string, number>;
  percentileRanks: Record<string, number>;
  clinicalInterpretation: {
    overallLevel: 'excellent' | 'good' | 'average' | 'below_average' | 'needs_intervention';
    strengthAreas: string[];
    concernAreas: string[];
    recommendations: string[];
    riskFactors: string[];
  };
  completedAt: Date;
  nextAssessmentDue?: Date;
}

export interface ExpertProfile {
  id: string;
  name: string;
  specialty: string[];
  experienceYears: number;
  rating: number;
  consultationStyle: 'empathetic' | 'solution_focused' | 'analytical' | 'integrative';
  available: boolean;
  nextAvailableTime: string;
  pricePerSession: number;
  credentials: string[];
  languages: string[];
  ageSpecialization: 'infant' | 'child' | 'adolescent' | 'adult' | 'elderly' | 'all';
}

export interface MatchingResult {
  expert: ExpertProfile;
  matchScore: number;
  matchingReasons: string[];
  estimatedSessions: number;
  treatmentDirection: string;
}