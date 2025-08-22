import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  user_id: string;
  family_id?: string;
  created_at: string;
  currentState?: {
    mood: string;
    stress: number;
    engagement: number;
    weatherIcon: string;
  };
}

interface FamilyDynamics {
  memberStates: FamilyMember[];
  correlations: Array<{
    member1: string;
    member2: string;
    type: string;
    strength: number;
  }>;
  insights: Array<{
    message: string;
    severity: 'low' | 'medium' | 'high';
    recommendations: string[];
  }>;
}

interface InterventionStrategy {
  id: string;
  strategy_type: string;
  strategy_content: {
    description: string;
    timeline?: string;
    successMetrics?: string[];
  };
  predicted_effectiveness: number;
  intervention_order: number;
  status: 'recommended' | 'scheduled' | 'in_progress' | 'completed';
}

interface WellnessMetrics {
  overall_wellness_index: number;
  collective_harmony: number;
  communication_quality: number;
  resilience_index: number;
}

interface EmotionalContagion {
  emotionType: string;
  timeDelay: number;
  strength: number;
}

export function useFamilyEcosystem() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyDynamics, setFamilyDynamics] = useState<FamilyDynamics | null>(null);
  const [interventionStrategies, setInterventionStrategies] = useState<InterventionStrategy[]>([]);
  const [generationalPatterns, setGenerationalPatterns] = useState<any[]>([]);
  const [wellnessMetrics, setWellnessMetrics] = useState<WellnessMetrics | null>(null);
  const [emotionalContagions, setEmotionalContagions] = useState<EmotionalContagion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  // 가족 구성원 로드
  const loadFamilyMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const membersWithState = (data || []).map(member => ({
        ...member,
        currentState: {
          mood: ['happy', 'calm', 'excited', 'tired', 'stressed'][Math.floor(Math.random() * 5)],
          stress: Math.floor(Math.random() * 100),
          engagement: Math.floor(Math.random() * 100),
          weatherIcon: ['☀️', '⛅', '☁️', '🌧️', '⛈️'][Math.floor(Math.random() * 5)]
        }
      }));

      setFamilyMembers(membersWithState);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  // 가족 역학 분석
  const analyzeFamilyDynamics = async () => {
    setIsLoading(true);
    try {
      // AI 분석 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const dynamics: FamilyDynamics = {
        memberStates: familyMembers,
        correlations: [
          {
            member1: familyMembers[0]?.name || "구성원 1",
            member2: familyMembers[1]?.name || "구성원 2", 
            type: "긍정적 영향",
            strength: 0.8
          }
        ],
        insights: [
          {
            message: "가족 구성원 간 소통 패턴이 개선되고 있습니다.",
            severity: "low",
            recommendations: [
              "정기적인 가족 회의 시간을 가져보세요",
              "서로의 감정을 표현하는 시간을 만들어보세요"
            ]
          }
        ]
      };
      
      setFamilyDynamics(dynamics);
      
      toast({
        title: "분석 완료",
        description: "가족 역학 분석이 완료되었습니다."
      });
    } catch (error) {
      toast({
        title: "분석 실패",
        description: "분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 감정 전염 감지
  const detectEmotionalContagion = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const contagions: EmotionalContagion[] = [
        {
          emotionType: "스트레스",
          timeDelay: 2,
          strength: 0.7
        },
        {
          emotionType: "기쁨",
          timeDelay: 1,
          strength: 0.9
        }
      ];
      
      setEmotionalContagions(contagions);
      
      toast({
        title: "감정 전염 분석 완료",
        description: "구성원 간 감정 영향을 분석했습니다."
      });
    } catch (error) {
      toast({
        title: "분석 실패",
        description: "감정 전염 분석에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 개입 전략 생성
  const generateInterventionStrategies = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const strategies: InterventionStrategy[] = [
        {
          id: "1",
          strategy_type: "family_therapy",
          strategy_content: {
            description: "가족 전체를 대상으로 한 집단 상담을 통해 소통 패턴을 개선합니다.",
            timeline: "4-6주",
            successMetrics: ["가족 대화 시간 증가", "갈등 빈도 감소", "만족도 향상"]
          },
          predicted_effectiveness: 0.85,
          intervention_order: 1,
          status: "recommended"
        },
        {
          id: "2", 
          strategy_type: "individual_counseling",
          strategy_content: {
            description: "개별 구성원의 심리적 어려움을 해결하기 위한 개인 상담입니다.",
            timeline: "8-12주",
            successMetrics: ["개인 스트레스 수준 감소", "자존감 향상"]
          },
          predicted_effectiveness: 0.75,
          intervention_order: 2,
          status: "recommended"
        }
      ];
      
      setInterventionStrategies(strategies);
      
      toast({
        title: "개입 전략 생성 완료", 
        description: "맞춤형 치료 계획이 수립되었습니다."
      });
    } catch (error) {
      toast({
        title: "생성 실패",
        description: "개입 전략 생성에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 세대 패턴 분석
  const analyzeGenerationalPatterns = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGenerationalPatterns([
        {
          pattern: "의사소통 스타일",
          description: "3세대에 걸쳐 직접적인 표현보다는 간접적 소통을 선호하는 패턴"
        }
      ]);
      
      toast({
        title: "세대 패턴 분석 완료",
        description: "3세대 가족 패턴을 분석했습니다."
      });
    } catch (error) {
      toast({
        title: "분석 실패", 
        description: "세대 패턴 분석에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 웰빙 지수 계산
  const calculateWellnessIndex = async () => {
    try {
      const metrics: WellnessMetrics = {
        overall_wellness_index: 78.5,
        collective_harmony: 82.0,
        communication_quality: 75.0,
        resilience_index: 80.0
      };
      
      setWellnessMetrics(metrics);
    } catch (error) {
      console.error('Error calculating wellness index:', error);
    }
  };

  // 종합 분석 실행
  const runComprehensiveAnalysis = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        analyzeFamilyDynamics(),
        detectEmotionalContagion(),
        generateInterventionStrategies(),
        analyzeGenerationalPatterns(),
        calculateWellnessIndex()
      ]);
      
      toast({
        title: "종합 분석 완료",
        description: "가족 생태계 전체 분석이 완료되었습니다."
      });
    } catch (error) {
      toast({
        title: "분석 실패",
        description: "종합 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 가족 이벤트 추적
  const trackFamilyEvent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 타임라인에 이벤트 저장
      await supabase
        .from('timeline_activities')
        .insert({
          type: 'SYSTEM',
          title: '가족 생태계 분석 완료',
          summary: '전체 가족 구성원에 대한 종합 분석이 수행되었습니다.',
          tags: ['시스템', '분석'],
          actor: { role: 'system', name: 'AI 분석 엔진' },
          meta: { analysis_type: 'comprehensive' }
        });

      toast({
        title: "이벤트 저장 완료",
        description: "가족 이벤트가 타임라인에 기록되었습니다."
      });
    } catch (error) {
      console.error('Error tracking family event:', error);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadFamilyMembers();
    calculateWellnessIndex();
  }, []);

  return {
    familyMembers,
    familyDynamics,
    interventionStrategies,
    generationalPatterns,
    wellnessMetrics,
    emotionalContagions,
    isLoading,
    analyzeFamilyDynamics,
    detectEmotionalContagion,
    generateInterventionStrategies,
    analyzeGenerationalPatterns,
    calculateWellnessIndex,
    runComprehensiveAnalysis,
    trackFamilyEvent,
    loadFamilyMembers
  };
}