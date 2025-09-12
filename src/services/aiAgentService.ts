import { supabase } from '@/integrations/supabase/client';

export interface UserMemory {
  userId: string;
  shortTermMemory: Record<string, any>; // 최근 7일간의 상호작용, 선호도
  longTermMemory: Record<string, any>; // 장기 패턴, 성격, 목표, 히스토리
  familyContext: Record<string, any>; // 가족 구성원별 특성과 관계
  lastUpdated: Date;
}

export interface AIAgent {
  id: string;
  name: string;
  specialty: 'development' | 'emotion' | 'education' | 'health' | 'family' | 'crisis';
  personality: string;
  capabilities: string[];
  proactiveThreshold: number; // 능동적 개입 임계값
}

export interface ProactiveInsight {
  agentId: string;
  message: string;
  confidence: number;
  actionItems: string[];
  urgency: 'low' | 'medium' | 'high';
  needsConfirmation: boolean;
  suggestedAgentCollaboration?: string[];
}

export class AIAgentService {
  private static instance: AIAgentService;
  private agents: AIAgent[] = [
    {
      id: 'dev-specialist',
      name: '발달전문 에이전트',
      specialty: 'development',
      personality: '따뜻하고 전문적이며 단계별 접근을 선호',
      capabilities: ['발달평가', '마일스톤 추적', '개별화교육계획', '치료계획 수립'],
      proactiveThreshold: 0.7
    },
    {
      id: 'emotion-companion',
      name: '마음돌봄 에이전트',
      specialty: 'emotion',
      personality: '공감적이고 따뜻하며 감정 지지에 특화',
      capabilities: ['감정분석', '스트레스 관리', '가족상담', '위기개입'],
      proactiveThreshold: 0.8
    },
    {
      id: 'edu-navigator',
      name: '교육지원 에이전트',
      specialty: 'education',
      personality: '체계적이고 실용적이며 리소스 연결 전문',
      capabilities: ['특수교육정보', '기관연계', '지원제도 안내', '학습계획'],
      proactiveThreshold: 0.6
    },
    {
      id: 'health-guardian',
      name: '건강관리 에이전트',
      specialty: 'health',
      personality: '신중하고 과학적이며 예방 중심적 접근',
      capabilities: ['건강모니터링', '치료기관 매칭', '의료정보 제공', '건강 예측'],
      proactiveThreshold: 0.75
    },
    {
      id: 'family-harmonizer',
      name: '가족조화 에이전트',
      specialty: 'family',
      personality: '균형잡힌 시각으로 가족 전체를 고려',
      capabilities: ['가족관계 분석', '형제자매 케어', '부모 지원', '가족 계획'],
      proactiveThreshold: 0.65
    },
    {
      id: 'crisis-responder',
      name: '위기대응 에이전트',
      specialty: 'crisis',
      personality: '침착하고 즉각적이며 안전 최우선',
      capabilities: ['위기감지', '응급대응', '전문기관 연계', '사후관리'],
      proactiveThreshold: 0.9
    }
  ];

  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  // 사용자 메모리 로드/저장
  async loadUserMemory(userId: string): Promise<UserMemory | null> {
    try {
      const { data, error } = await supabase
        .from('user_memory')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;

      return {
        userId,
        shortTermMemory: data.short_term_memory || {},
        longTermMemory: data.long_term_memory || {},
        familyContext: data.family_context || {},
        lastUpdated: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error loading user memory:', error);
      return null;
    }
  }

  async updateUserMemory(memory: UserMemory): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_memory')
        .upsert({
          user_id: memory.userId,
          short_term_memory: memory.shortTermMemory,
          long_term_memory: memory.longTermMemory,
          family_context: memory.familyContext,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user memory:', error);
    }
  }

  // 능동적 인사이트 생성
  async generateProactiveInsights(userId: string): Promise<ProactiveInsight[]> {
    const memory = await this.loadUserMemory(userId);
    if (!memory) return [];

    const insights: ProactiveInsight[] = [];

    // 각 에이전트별로 능동적 제안 생성
    for (const agent of this.agents) {
      const insight = await this.analyzeUserNeedsForAgent(agent, memory);
      if (insight && insight.confidence >= agent.proactiveThreshold) {
        insights.push(insight);
      }
    }

    // 우선순위 정렬 (긴급도 > 신뢰도)
    return insights.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return b.confidence - a.confidence;
    });
  }

  private async analyzeUserNeedsForAgent(agent: AIAgent, memory: UserMemory): Promise<ProactiveInsight | null> {
    const { shortTermMemory, longTermMemory, familyContext } = memory;

    // 에이전트별 특화 분석 로직
    switch (agent.specialty) {
      case 'development':
        return this.analyzeDevelopmentNeeds(agent, memory);
      case 'emotion':
        return this.analyzeEmotionalNeeds(agent, memory);
      case 'education':
        return this.analyzeEducationNeeds(agent, memory);
      case 'health':
        return this.analyzeHealthNeeds(agent, memory);
      case 'family':
        return this.analyzeFamilyNeeds(agent, memory);
      case 'crisis':
        return this.analyzeCrisisRisk(agent, memory);
      default:
        return null;
    }
  }

  private analyzeDevelopmentNeeds(agent: AIAgent, memory: UserMemory): ProactiveInsight | null {
    const recentMilestones = memory.shortTermMemory.milestones || [];
    const developmentHistory = memory.longTermMemory.developmentProgress || {};
    
    // 발달 지연 패턴 감지
    const delayedAreas = recentMilestones.filter((m: any) => m.isDelayed);
    if (delayedAreas.length >= 2) {
      return {
        agentId: agent.id,
        message: `최근 ${delayedAreas.length}개 영역에서 발달 지연이 관찰되었습니다. 전문적인 발달 평가와 개입 계획을 수립해드릴까요?`,
        confidence: 0.85,
        actionItems: [
          '종합발달평가 일정 조율',
          '개별화교육계획(IEP) 업데이트',
          '전문 치료기관 연계'
        ],
        urgency: 'medium',
        needsConfirmation: true,
        suggestedAgentCollaboration: ['health-guardian', 'edu-navigator']
      };
    }

    return null;
  }

  private analyzeEmotionalNeeds(agent: AIAgent, memory: UserMemory): ProactiveInsight | null {
    const recentMoods = memory.shortTermMemory.emotionalEntries || [];
    const stressLevel = memory.shortTermMemory.stressLevel || 0;
    
    // 연속된 부정적 감정 상태 감지
    const recentNegativeMoods = recentMoods.filter((entry: any) => 
      entry.mood === 'hard' || entry.mood === 'frown'
    );

    if (recentNegativeMoods.length >= 3 || stressLevel > 0.7) {
      return {
        agentId: agent.id,
        message: `최근 감정적으로 힘든 시기를 보내고 계시는 것 같습니다. 함께 스트레스 관리 방법을 찾아보고 필요시 전문가와 연결해드릴까요?`,
        confidence: 0.8,
        actionItems: [
          '개인별 스트레스 완화 프로그램 제안',
          '가족 상담 세션 안내',
          '즉시 사용 가능한 감정 조절 기법 제공'
        ],
        urgency: 'high',
        needsConfirmation: true,
        suggestedAgentCollaboration: ['family-harmonizer', 'crisis-responder']
      };
    }

    return null;
  }

  private analyzeEducationNeeds(agent: AIAgent, memory: UserMemory): ProactiveInsight | null {
    const educationGoals = memory.longTermMemory.educationGoals || [];
    const recentProgress = memory.shortTermMemory.learningProgress || {};
    
    // 교육 목표 달성률 분석
    const lowProgressGoals = educationGoals.filter((goal: any) => 
      recentProgress[goal.id] && recentProgress[goal.id].progress < 0.5
    );

    if (lowProgressGoals.length >= 2) {
      return {
        agentId: agent.id,
        message: `현재 설정된 교육 목표 중 일부에서 진전이 느린 것 같습니다. 학습 전략을 재점검하고 추가 지원 방안을 모색해보실까요?`,
        confidence: 0.75,
        actionItems: [
          '학습 방법 재평가',
          '추가 교육 리소스 연계',
          '특수교육 지원 서비스 확인'
        ],
        urgency: 'medium',
        needsConfirmation: true,
        suggestedAgentCollaboration: ['dev-specialist']
      };
    }

    return null;
  }

  private analyzeHealthNeeds(agent: AIAgent, memory: UserMemory): ProactiveInsight | null {
    const healthRecords = memory.shortTermMemory.healthStatus || {};
    const upcomingCheckups = memory.longTermMemory.medicalSchedule || [];
    
    // 건강 체크업 알림
    const overdueCheckups = upcomingCheckups.filter((checkup: any) => 
      new Date(checkup.dueDate) < new Date()
    );

    if (overdueCheckups.length > 0) {
      return {
        agentId: agent.id,
        message: `놓친 건강 검진이 있습니다. 정기 검진 일정을 재조정하고 필요한 추가 검사도 함께 계획해보실까요?`,
        confidence: 0.9,
        actionItems: [
          '검진 일정 재조정',
          '의료진과 상담 예약',
          '건강 모니터링 계획 업데이트'
        ],
        urgency: 'medium',
        needsConfirmation: true
      };
    }

    return null;
  }

  private analyzeFamilyNeeds(agent: AIAgent, memory: UserMemory): ProactiveInsight | null {
    const familyMembers = memory.familyContext.members || [];
    const familyStress = memory.shortTermMemory.familyStressLevel || 0;
    
    // 가족 전체 스트레스 레벨 분석
    if (familyStress > 0.7) {
      return {
        agentId: agent.id,
        message: `가족 전체가 스트레스를 받고 있는 상황으로 보입니다. 가족 구성원 각자의 니즈를 파악하고 조화로운 해결책을 찾아보실까요?`,
        confidence: 0.8,
        actionItems: [
          '가족 구성원별 개별 상담',
          '가족 활동 계획 수립',
          '형제자매 특별 케어 프로그램'
        ],
        urgency: 'medium',
        needsConfirmation: true,
        suggestedAgentCollaboration: ['emotion-companion', 'edu-navigator']
      };
    }

    return null;
  }

  private analyzeCrisisRisk(agent: AIAgent, memory: UserMemory): ProactiveInsight | null {
    const crisisIndicators = memory.shortTermMemory.crisisSignals || [];
    const emergencyLevel = memory.shortTermMemory.emergencyLevel || 0;
    
    // 위기 상황 감지
    if (emergencyLevel > 0.8 || crisisIndicators.length > 0) {
      return {
        agentId: agent.id,
        message: `긴급한 지원이 필요한 상황으로 판단됩니다. 즉시 전문 기관과 연결하고 응급 대응 계획을 실행하겠습니다.`,
        confidence: 0.95,
        actionItems: [
          '응급 전문기관 즉시 연락',
          '위기 대응 프로토콜 실행',
          '가족 안전 확보 조치'
        ],
        urgency: 'high',
        needsConfirmation: false,
        suggestedAgentCollaboration: ['emotion-companion', 'health-guardian']
      };
    }

    return null;
  }

  // 에이전트 협업 시나리오 생성
  async generateCollaborationPlan(agentIds: string[], userContext: UserMemory): Promise<string> {
    const involvedAgents = this.agents.filter(agent => agentIds.includes(agent.id));
    
    return `
    다음 에이전트들이 협업하여 종합적인 지원을 제공합니다:
    
    ${involvedAgents.map(agent => `
    🤖 ${agent.name}
    - 전문분야: ${agent.capabilities.join(', ')}
    - 역할: ${this.getAgentRoleInCollaboration(agent, userContext)}
    `).join('\n')}
    
    이 협업을 통해 더 정확하고 포괄적인 솔루션을 제공하겠습니다.
    `;
  }

  private getAgentRoleInCollaboration(agent: AIAgent, context: UserMemory): string {
    switch (agent.specialty) {
      case 'development': return '발달 상태 정밀 분석 및 개입 계획 수립';
      case 'emotion': return '심리적 안정감 제공 및 스트레스 관리';
      case 'education': return '교육 리소스 연계 및 학습 전략 최적화';
      case 'health': return '의료진 연결 및 건강 모니터링';
      case 'family': return '가족 역학 조정 및 조화로운 환경 조성';
      case 'crisis': return '안전 확보 및 응급 상황 대응';
      default: return '종합적 지원';
    }
  }

  getAgents(): AIAgent[] {
    return this.agents;
  }

  getAgent(id: string): AIAgent | undefined {
    return this.agents.find(agent => agent.id === id);
  }
}

export const aiAgentService = AIAgentService.getInstance();