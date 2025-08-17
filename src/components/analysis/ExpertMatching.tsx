import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Clock, 
  MessageCircle, 
  Video, 
  Award, 
  Users, 
  Heart,
  ArrowRight,
  Phone,
  Calendar
} from "lucide-react";
import { ExpertProfile, MatchingResult } from "@/types/assessment";
import { matchExperts } from "@/services/openai";
import { filterExpertsByAge } from "@/data/expertDatabase";

interface ExpertMatchingProps {
  analysis: string;
  ageGroup: 'infant' | 'child' | 'adult';
  age: number;
  onExpertSelect: (expert: ExpertProfile) => void;
}

const ExpertMatching = ({ analysis, ageGroup, age, onExpertSelect }: ExpertMatchingProps) => {
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performExpertMatching();
  }, []);

  const performExpertMatching = async () => {
    setLoading(true);
    
    try {
      // 연령에 맞는 전문가 필터링
      const availableExperts = filterExpertsByAge(ageGroup);
      
      // AI 매칭 실행
      const results = await matchExperts(analysis, availableExperts);
      
      if (results && results.length > 0) {
        setMatchingResults(results);
      } else {
        // AI 매칭 실패 시 기본 매칭 수행
        const basicMatching = performBasicMatching(availableExperts);
        setMatchingResults(basicMatching);
      }
    } catch (error) {
      console.error('Expert matching error:', error);
      // 기본 매칭으로 폴백
      const availableExperts = filterExpertsByAge(ageGroup);
      const basicMatching = performBasicMatching(availableExperts);
      setMatchingResults(basicMatching);
    }
    
    setLoading(false);
  };

  // 기본 매칭 알고리즘 (AI 실패 시 사용)
  const performBasicMatching = (experts: ExpertProfile[]): MatchingResult[] => {
    const availableExperts = experts.filter(expert => expert.available);
    const sortedExperts = availableExperts
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    return sortedExperts.map((expert, index) => ({
      expert,
      matchScore: 90 - (index * 5),
      matchingReasons: [
        "전문 영역 일치",
        "높은 평점 보유",
        "풍부한 임상 경험",
        "현재 상담 가능"
      ],
      estimatedSessions: 8 + index * 2,
      treatmentDirection: "개별 맞춤형 통합치료 접근"
    }));
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      "영유아발달": "bg-gentle-peach text-gentle-peach-foreground",
      "ADHD": "bg-calm-blue text-calm-blue-foreground", 
      "우울증": "bg-warm-lavender text-warm-lavender-foreground",
      "불안장애": "bg-soft-mint text-soft-mint-foreground",
      "학습장애": "bg-primary/20 text-primary",
      "트라우마": "bg-red-100 text-red-700"
    };
    
    for (const [key, color] of Object.entries(colors)) {
      if (specialty.includes(key)) return color;
    }
    return "bg-muted text-muted-foreground";
  };

  const getConsultationStyleIcon = (style: string) => {
    const icons = {
      empathetic: Heart,
      solution_focused: ArrowRight,
      analytical: Star,
      integrative: Users
    };
    return icons[style as keyof typeof icons] || MessageCircle;
  };

  const getConsultationStyleName = (style: string) => {
    const names = {
      empathetic: "공감적 접근",
      solution_focused: "해결중심 치료",
      analytical: "분석적 치료",
      integrative: "통합치료"
    };
    return names[style as keyof typeof names] || "개별 맞춤";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary-glow/20 flex items-center justify-center">
        <Card className="p-8 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto" />
          <h3 className="text-xl font-semibold text-primary">최적의 전문가를 찾고 있습니다...</h3>
          <p className="text-muted-foreground">AI 매칭 알고리즘 실행 중</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-primary-glow/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-border">
              <Award className="w-8 h-8 text-primary animate-pulse-glow" />
              <span className="text-2xl font-semibold text-brand-gradient">AI 전문가 매칭</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="block text-foreground mb-2">당신에게 완벽한</span>
            <span className="block text-brand-gradient">TOP 3 전문가</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI 분석 결과 기반으로 가장 적합한 전문가를 매칭했습니다
          </p>
        </div>

        {/* Matching Results */}
        <div className="max-w-6xl mx-auto space-y-8">
          {matchingResults.map((result, index) => {
            const expert = result.expert;
            const StyleIcon = getConsultationStyleIcon(expert.consultationStyle);
            
            return (
              <Card key={expert.id} className={`overflow-hidden hover-glow ${index === 0 ? 'ring-2 ring-primary/50' : ''}`}>
                <div className="p-8">
                  {/* Ranking Badge */}
                  {index === 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                        🏆 최고 매칭
                      </Badge>
                    </div>
                  )}
                  
                  {/* Expert Header */}
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Profile Image Placeholder */}
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {expert.name.charAt(0)}
                    </div>
                    
                    {/* Expert Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h3 className="text-2xl font-bold text-foreground">{expert.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <span className="font-semibold text-foreground">{expert.rating}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{expert.experienceYears}년 경력</span>
                        </div>
                      </div>
                      
                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2">
                        {expert.specialty.map((spec, idx) => (
                          <Badge key={idx} className={getSpecialtyColor(spec)}>
                            {spec}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Credentials */}
                      <div className="flex flex-wrap gap-2">
                        {expert.credentials.map((cred, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cred}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Match Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{result.matchScore}점</div>
                      <div className="text-sm text-muted-foreground">매칭 점수</div>
                    </div>
                  </div>
                  
                  {/* Matching Analysis */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        매칭 이유
                      </h4>
                      <ul className="space-y-2">
                        {result.matchingReasons.map((reason, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <StyleIcon className="w-4 h-4 text-primary" />
                        치료 접근법
                      </h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-primary">{getConsultationStyleName(expert.consultationStyle)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.treatmentDirection}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          예상 세션: <span className="font-medium">{result.estimatedSessions}회</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Availability & Actions */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          {expert.available ? `${expert.nextAvailableTime} 상담 가능` : `${expert.nextAvailableTime} 예약 가능`}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        상담료: <span className="font-medium">{expert.pricePerSession.toLocaleString()}원</span> / 회
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        예약하기
                      </Button>
                      <Button 
                        onClick={() => onExpertSelect(expert)}
                        className="btn-brand flex items-center gap-2"
                        disabled={!expert.available}
                      >
                        {expert.available ? (
                          <>
                            <Video className="w-4 h-4" />
                            즉시 상담
                          </>
                        ) : (
                          <>
                            <Phone className="w-4 h-4" />
                            예약 상담
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Emergency Contact */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-red-50 border-red-200">
            <div className="p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-700">응급상황 시</h3>
              </div>
              <p className="text-red-600">
                위기상황이거나 즉시 도움이 필요하다면 24시간 응급상담센터로 연락해주세요
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="destructive">
                  응급상담 1577-0199
                </Button>
                <Button variant="outline" className="text-red-600 border-red-300">
                  생명의전화 1588-9191
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpertMatching;