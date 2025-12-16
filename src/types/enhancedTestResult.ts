// 고급 검사 결과 저장 타입 정의

export interface QuestionResponse {
  questionId: string;
  questionText?: string;
  answer: number | string;
  responseTimeMs?: number;  // 응답 시간 (밀리초)
  confidence?: number;      // 응답 확신도 (1-5)
  skipped?: boolean;
  category?: string;
}

export interface DomainScore {
  domain: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  interpretation?: string;
  percentile?: number;      // 백분위 (선택)
  tScore?: number;          // T점수 (선택)
  zScore?: number;          // Z점수 (선택)
}

export interface SessionMetadata {
  startTime: string;
  endTime: string;
  durationSeconds: number;
  pauseCount?: number;
  totalPauseSeconds?: number;
  completionRate: number;   // 완료율 (0-100)
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  browserInfo?: string;
  screenSize?: string;
  languagePreference?: string;
}

export interface EnvironmentalFactors {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  mood?: number;            // 검사 전 기분 (1-10)
  stressLevel?: number;     // 검사 전 스트레스 (1-10)
  sleepQuality?: number;    // 전날 수면 질 (1-10)
  caffeineIntake?: boolean;
  recentExercise?: boolean;
  notes?: string;
}

export interface ComparisonData {
  previousTestId?: string;
  previousTestDate?: string;
  previousTotalScore?: number;
  scoreDifference?: number;
  percentageChange?: number;
  trend: 'improving' | 'stable' | 'declining' | 'first_test';
  consecutiveTestCount: number;
  averageScore?: number;    // 전체 검사 평균
}

export interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: string[];
  protectiveFactors: string[];
  urgencyLevel: number;     // 1-5
  recommendProfessional: boolean;
  redFlags?: string[];
}

export interface AIAnalysisResult {
  summary: string;
  detailedAnalysis: string;
  strengths: string[];
  areasOfConcern: string[];
  personalizedRecommendations: string[];
  suggestedResources?: string[];
  followUpSuggestions?: string[];
  confidenceScore?: number;  // AI 분석 신뢰도
  analysisModel?: string;    // 사용된 AI 모델
  analysisTimestamp: string;
}

export interface EnhancedTestResult {
  // 기본 정보
  testType: string;
  testVersion?: string;
  testCategory?: string;    // 심리검사, 성격검사, 발달검사 등
  
  // 점수 데이터
  totalScore: number;
  maxPossibleScore?: number;
  percentageScore?: number;
  domainScores: DomainScore[];
  
  // 상세 응답 데이터
  responses: QuestionResponse[];
  answeredCount: number;
  skippedCount: number;
  
  // 세션 메타데이터
  sessionMetadata: SessionMetadata;
  
  // 환경 요인
  environmentalFactors?: EnvironmentalFactors;
  
  // 비교 데이터
  comparisonData?: ComparisonData;
  
  // 위험 평가
  riskAssessment?: RiskAssessment;
  
  // AI 분석
  aiAnalysis?: AIAnalysisResult;
  
  // 사용자 입력
  userNotes?: string;
  ageGroup?: string;
  userAge?: number;
  gender?: string;
  
  // 추가 메타데이터
  tags?: string[];
  isBookmarked?: boolean;
  sharedWith?: string[];    // 공유된 전문가 ID 목록
}

// 저장 옵션
export interface SaveTestOptions {
  silent?: boolean;
  includeRawResponses?: boolean;
  generateComparison?: boolean;
  runAIAnalysis?: boolean;
  calculateRisk?: boolean;
}
