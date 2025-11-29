export type TherapistType = 
  | 'social_skills_trainer'      // 사회성강사
  | 'special_education_teacher'   // 특수교사
  | 'speech_therapist'            // 언어치료사
  | 'play_therapist'              // 놀이치료사
  | 'art_therapist'               // 미술치료사
  | 'adult_counselor'             // 심리상담사(성인)
  | 'cognitive_therapist'         // 인지치료사
  | 'occupational_therapist'      // 작업치료사
  | 'youth_counselor'             // 청소년상담사
  | 'physical_therapist';         // 물리도수치료사

export interface TherapistProfile {
  id: TherapistType;
  name: string;
  nameKo: string;
  description: string;
  specialty: string[];
  voiceId: string;
  voiceStyle: string;
  sessionStructure: {
    greeting: string;
    assessmentPhase: string;
    interventionPhase: string;
    closingPhase: string;
  };
  therapeuticApproach: string[];
  targetAudience: string;
  color: string;
  icon: string;
}

export interface TherapySession {
  therapistType: TherapistType;
  sessionGoals: string[];
  currentPhase: 'greeting' | 'assessment' | 'intervention' | 'closing';
  progressNotes: string[];
  therapeuticTechniques: string[];
}
