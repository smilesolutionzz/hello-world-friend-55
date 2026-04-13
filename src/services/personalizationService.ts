import { supabase } from '@/integrations/supabase/client';

export interface PersonalizationInsight {
  type: 'mood_detection' | 'stress_analysis' | 'engagement_level' | 'social_isolation';
  confidence: number;
  message: string;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
}

export class PersonalizationService {
  private static instance: PersonalizationService;
  private realtimeInsights: PersonalizationInsight[] = [];
  private lastAnalysis: Date = new Date();

  static getInstance(): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService();
    }
    return PersonalizationService.instance;
  }

  // Real-time state detection
  async detectCurrentState(behaviors: any[]): Promise<PersonalizationInsight[]> {
    const insights: PersonalizationInsight[] = [];
    
    // Analyze recent behaviors (last 30 minutes)
    const recentBehaviors = behaviors.filter(b => 
      new Date(b.timestamp) > new Date(Date.now() - 30 * 60 * 1000)
    );

    // Detect stress patterns
    const stressInsight = this.analyzeStressPatterns(recentBehaviors);
    if (stressInsight) insights.push(stressInsight);

    // Detect mood changes
    const moodInsight = this.analyzeMoodIndicators(recentBehaviors);
    if (moodInsight) insights.push(moodInsight);

    // Detect engagement levels
    const engagementInsight = this.analyzeEngagement(recentBehaviors);
    if (engagementInsight) insights.push(engagementInsight);

    // Detect social isolation signs
    const socialInsight = this.analyzeSocialPatterns(recentBehaviors);
    if (socialInsight) insights.push(socialInsight);

    this.realtimeInsights = insights;
    return insights;
  }

  private analyzeStressPatterns(behaviors: any[]): PersonalizationInsight | null {
    const typingBehaviors = behaviors.filter(b => 
      b.behavior_type === 'text_input' && b.behavior_data.typingSpeed
    );

    if (typingBehaviors.length < 3) return null;

    const avgTypingSpeed = typingBehaviors.reduce((sum, b) => 
      sum + b.behavior_data.typingSpeed, 0
    ) / typingBehaviors.length;

    const rapidClicks = behaviors.filter(b => 
      b.behavior_type === 'click'
    ).length;

    const rapidNavigation = behaviors.some(b => 
      b.behavior_type === 'rapid_navigation'
    );

    let stressLevel = 'low';
    let confidence = 0.3;

    if (avgTypingSpeed < 20 || rapidClicks > 20 || rapidNavigation) {
      stressLevel = 'high';
      confidence = 0.8;
    } else if (avgTypingSpeed < 40 || rapidClicks > 10) {
      stressLevel = 'medium';
      confidence = 0.6;
    }

    if (stressLevel === 'low') return null;

    return {
      type: 'stress_analysis',
      confidence,
      message: stressLevel === 'high' 
        ? '높은 스트레스 수준이 감지되었습니다. 잠시 휴식을 취해보세요.'
        : '약간의 스트레스가 감지됩니다. 깊은 호흡을 해보세요.',
      recommendations: stressLevel === 'high' 
        ? [
            '5분간 깊은 호흡 연습하기',
            '화면에서 잠시 눈을 떼고 먼 곳 바라보기',
            '간단한 목과 어깨 스트레칭',
            '따뜻한 차 한 잔 마시기'
          ]
        : [
            '3분간 명상 음악 듣기',
            '창밖 풍경 감상하기',
            '긍정적인 생각 떠올리기'
          ],
      urgency: stressLevel === 'high' ? 'high' : 'medium'
    };
  }

  private analyzeMoodIndicators(behaviors: any[]): PersonalizationInsight | null {
    const lateNightUsage = behaviors.some(b => 
      b.behavior_type === 'late_night_usage'
    );

    const lowEngagement = behaviors.filter(b => 
      b.behavior_type === 'page_view' && 
      b.behavior_data.sessionDuration && 
      b.behavior_data.sessionDuration < 30
    ).length > 3;

    const scrollPatterns = behaviors.filter(b => 
      b.behavior_type === 'scroll'
    );

    const excessiveScrolling = scrollPatterns.length > 50;

    if (!lateNightUsage && !lowEngagement && !excessiveScrolling) return null;

    let moodState = 'neutral';
    let confidence = 0.4;

    if (lateNightUsage && (lowEngagement || excessiveScrolling)) {
      moodState = 'low';
      confidence = 0.7;
    } else if (lateNightUsage || (lowEngagement && excessiveScrolling)) {
      moodState = 'concerning';
      confidence = 0.6;
    }

    if (moodState === 'neutral') return null;

    return {
      type: 'mood_detection',
      confidence,
      message: moodState === 'low'
        ? '기분이 많이 저하된 것 같습니다. 전문가와 상담해보시는 것을 권합니다.'
        : '기분이 좋지 않은 것 같네요. 기분 전환이 필요해 보입니다.',
      recommendations: moodState === 'low'
        ? [
            'AI 상담사와 대화하기',
            '가까운 사람에게 연락하기',
            '전문가 상담 예약하기',
            '기분 일기 쓰기'
          ]
        : [
            '좋아하는 음악 듣기',
            '산책이나 가벼운 운동하기',
            '감사 일기 쓰기',
            '재미있는 영상 보기'
          ],
      urgency: moodState === 'low' ? 'high' : 'medium'
    };
  }

  private analyzeEngagement(behaviors: any[]): PersonalizationInsight | null {
    const pageViews = behaviors.filter(b => b.behavior_type === 'page_view');
    const focusEvents = behaviors.filter(b => b.behavior_type === 'focus');
    const blurEvents = behaviors.filter(b => b.behavior_type === 'blur');

    if (pageViews.length === 0) return null;

    const avgSessionTime = pageViews.reduce((sum, pv) => 
      sum + (pv.behavior_data.sessionDuration || 0), 0
    ) / pageViews.length;

    const focusRatio = focusEvents.length / (focusEvents.length + blurEvents.length);

    let engagementLevel = 'normal';
    let confidence = 0.5;

    if (avgSessionTime < 15 || focusRatio < 0.3) {
      engagementLevel = 'low';
      confidence = 0.7;
    } else if (avgSessionTime > 300 || focusRatio > 0.9) {
      engagementLevel = 'high';
      confidence = 0.8;
    }

    if (engagementLevel === 'normal') return null;

    return {
      type: 'engagement_level',
      confidence,
      message: engagementLevel === 'low'
        ? '집중도가 낮아 보입니다. 환경을 바꿔보시거나 잠시 휴식을 취해보세요.'
        : '매우 집중하고 계시네요! 눈 건강을 위해 중간중간 휴식을 취해주세요.',
      recommendations: engagementLevel === 'low'
        ? [
            '조용한 환경으로 이동하기',
            '5분간 명상하기',
            '목표를 더 작게 나누기',
            '좋아하는 음료 준비하기'
          ]
        : [
            '20-20-20 규칙 실행 (20분마다 20초간 20피트 멀리 보기)',
            '목과 어깨 스트레칭',
            '충분한 수분 섭취',
            '정시에 휴식 알림 설정'
          ],
      urgency: 'low'
    };
  }

  private analyzeSocialPatterns(behaviors: any[]): PersonalizationInsight | null {
    // This would analyze patterns that might indicate social isolation
    // For now, return null as we'd need more social interaction data
    return null;
  }

  // Generate contextual recommendations based on time, weather, etc.
  async generateContextualRecommendations(): Promise<string[]> {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const recommendations: string[] = [];

    // Time-based recommendations
    if (hour >= 6 && hour < 9) {
      recommendations.push('모닝 루틴으로 하루를 시작해보세요');
      recommendations.push('충분한 물과 건강한 아침식사를 챙기세요');
    } else if (hour >= 12 && hour < 14) {
      recommendations.push('점심 후 5분간 명상으로 에너지 충전');
      recommendations.push('오후 집중력을 위한 가벼운 스트레칭');
    } else if (hour >= 18 && hour < 21) {
      recommendations.push('하루를 돌아보는 감사 일기 쓰기');
      recommendations.push('가족이나 친구와 대화 시간 갖기');
    } else if (hour >= 21) {
      recommendations.push('디지털 디톡스로 숙면 준비하기');
      recommendations.push('수면 전 호흡법으로 마음 진정시키기');
    }

    // Day-based recommendations
    if (day === 0 || day === 6) { // Weekend
      recommendations.push('새로운 취미 활동이나 관심사 탐구해보기');
      recommendations.push('자연 속에서 시간 보내기');
    } else { // Weekday
      recommendations.push('업무 스트레스 관리를 위한 미니 브레이크');
      recommendations.push('동료들과의 긍정적인 소통 시간');
    }

    return recommendations;
  }

  // Get weather-based recommendations
  async getWeatherBasedRecommendations(weather?: string): Promise<string[]> {
    const recommendations: string[] = [];

    switch (weather?.toLowerCase()) {
      case 'sunny':
        recommendations.push('햇빛을 받으며 야외 활동하기');
        recommendations.push('비타민 D 합성을 위한 짧은 산책');
        break;
      case 'rainy':
        recommendations.push('비 오는 소리를 들으며 실내 명상');
        recommendations.push('따뜻한 차와 함께 독서 시간');
        break;
      case 'cloudy':
        recommendations.push('실내에서 할 수 있는 창의적 활동');
        recommendations.push('조명을 밝게 하여 기분 전환');
        break;
      case 'snowy':
        recommendations.push('겨울 경치 감상하며 마음 치유');
        recommendations.push('따뜻한 실내에서 휴식과 회복');
        break;
      default:
        recommendations.push('현재 날씨에 맞는 적절한 활동 선택');
    }

    return recommendations;
  }

  // Detect crisis situations and provide immediate support
  async detectCrisisSignals(behaviors: any[], lifestyle: any[]): Promise<PersonalizationInsight | null> {
    // Analyze patterns that might indicate crisis
    const crisisIndicators = [
      // Late night usage patterns
      behaviors.filter(b => b.behavior_type === 'late_night_usage').length > 3,
      
      // Extremely low mood scores
      lifestyle.some(l => l.mood_score && l.mood_score <= 2),
      
      // High stress levels
      lifestyle.some(l => l.stress_level && l.stress_level >= 9),
      
      // Social isolation
      lifestyle.some(l => l.social_interactions !== undefined && l.social_interactions === 0),
      
      // Sleep disruption
      lifestyle.some(l => l.sleep_hours && l.sleep_hours < 4)
    ];

    const crisisScore = crisisIndicators.filter(Boolean).length;

    if (crisisScore >= 3) {
      return {
        type: 'mood_detection',
        confidence: 0.9,
        message: '현재 힘든 시간을 보내고 계신 것 같습니다. 전문가의 도움을 받으시길 강력히 권합니다.',
        recommendations: [
          '플랫폼 내 긴급 전문가 매칭 이용',
          '전문가 상담 즉시 신청',
          '가까운 협력기관 방문',
          '즉시 가까운 병원 방문',
          '신뢰할 만한 사람에게 연락'
        ],
        urgency: 'high'
      };
    }

    return null;
  }
}

export const personalizationService = PersonalizationService.getInstance();