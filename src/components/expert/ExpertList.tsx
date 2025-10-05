import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageCircle, Video, Mic, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getExpertImage } from './ExpertImages';

interface Expert {
  id: string;
  full_name: string;
  professional_title: string;
  specializations: string[];
  years_experience: number;
  bio: string;
  profile_image_url: string | null;
  hourly_rate: number;
  average_rating: number;
  total_sessions: number;
  languages: string[];
  consultation_methods: string[];
  is_available: boolean;
  is_verified: boolean;
  kakao_link?: string;
}

interface ExpertListProps {
  specialization?: string;
  consultationType?: string;
}

export const ExpertList: React.FC<ExpertListProps> = ({ 
  specialization, 
  consultationType 
}) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExperts();
  }, [specialization, consultationType]);

  const fetchExperts = async () => {
    try {
      let query = supabase
        .from('experts')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true)
        .order('updated_at', { ascending: false });

      if (specialization) {
        query = query.contains('specializations', [specialization]);
      }

      if (consultationType) {
        query = query.contains('consultation_methods', [consultationType]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExperts(data || []);
    } catch (error) {
      console.error('전문가 목록 조회 실패:', error);
      toast({
        title: "오류",
        description: "전문가 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestConsultation = async (expert: Expert, type: string = 'text') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "상담을 신청하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // 즉시 상담 요청 생성
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          expert_id: expert.id,
          consultation_type: type,
          price: expert.hourly_rate,
          scheduled_at: new Date().toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (consultationError) throw consultationError;

      // 채팅방 생성
      const { data: chatRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          user_id: user.id,
          expert_id: expert.id,
          status: 'active'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // 상담에 채팅방 연결
      const { error: updateError } = await supabase
        .from('consultations')
        .update({ chat_room_id: chatRoom.id })
        .eq('id', consultation.id);

      if (updateError) throw updateError;

      toast({
        title: "상담 신청 완료",
        description: `${expert.full_name} 전문가에게 상담을 신청했습니다.`,
      });

      // 채팅방으로 이동
      navigate(`/consultation/${chatRoom.id}`);

    } catch (error) {
      console.error('상담 신청 실패:', error);
      toast({
        title: "신청 실패",
        description: "상담 신청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getConsultationIcon = (method: string) => {
    switch (method) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getConsultationLabel = (method: string) => {
    switch (method) {
      case 'video': return '화상 상담';
      case 'voice': return '음성 상담';
      default: return '텍스트 상담';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <Award className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-600">
            조건에 맞는 전문가를 찾을 수 없습니다
          </h3>
          <p className="text-gray-500">
            다른 조건으로 검색해보시거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            믿을 수 있는 전문가
          </h2>
          <p className="text-muted-foreground mt-1">검증된 {experts.length}명의 전문가가 함께합니다</p>
        </div>
      </div>

      <div className="grid gap-8">
        {experts.map((expert) => (
          <Card 
            key={expert.id} 
            className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 animate-fade-in"
          >
            <div className="p-8">
              <div className="flex items-start gap-8">
                {/* 프로필 이미지 */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                  <Avatar className="w-28 h-28 border-4 border-background shadow-xl relative">
                    <AvatarImage 
                      src={getExpertImage(expert.full_name) || expert.profile_image_url || ''} 
                      className="object-cover" 
                    />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-white">
                      {expert.full_name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {expert.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 shadow-lg">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* 전문가 정보 */}
                <div className="flex-1 space-y-5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{expert.full_name} 에이전트</h3>
                      {expert.hourly_rate === 0 && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 text-sm">
                          무료 봉사
                        </Badge>
                      )}
                    </div>
                    <p className="text-base text-muted-foreground mb-4">{expert.professional_title}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-lg">{expert.average_rating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">({expert.total_sessions}회 상담)</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{expert.years_experience}년 경력</span>
                      </div>
                    </div>
                  </div>

                  {/* 전문 분야 */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">전문 분야</p>
                    <div className="flex flex-wrap gap-2">
                      {expert.specializations.map((spec, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="px-3 py-1 text-sm font-medium bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 소개 */}
                  {expert.bio && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm leading-relaxed">
                        {expert.bio.length > 200 
                          ? `${expert.bio.slice(0, 200)}...` 
                          : expert.bio}
                      </p>
                    </div>
                  )}

                  {/* 상담 방식 */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">상담 방법</p>
                    <div className="flex flex-wrap gap-3">
                      {expert.consultation_methods.map((method) => (
                        <Badge 
                          key={method} 
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/90 to-primary text-white hover:from-primary hover:to-primary/90 transition-all"
                        >
                          {getConsultationIcon(method)}
                          <span className="font-medium">{getConsultationLabel(method)}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 상담 신청 영역 */}
                <div className="flex-shrink-0 w-48 space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                    {expert.hourly_rate === 0 ? (
                      <>
                        <div className="text-3xl font-bold text-green-600 mb-1">무료</div>
                        <div className="text-sm text-muted-foreground">봉사 상담</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-primary">
                          {expert.hourly_rate.toLocaleString()}원
                        </div>
                        <div className="text-sm text-muted-foreground">50분 기준</div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    {expert.kakao_link && (
                      <Button
                        onClick={() => window.open(expert.kakao_link, '_blank')}
                        className="w-full group-hover:scale-105 transition-transform shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold"
                        size="lg"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        즉시 상담하기
                      </Button>
                    )}
                    
                    {expert.consultation_methods.includes('text') && !expert.kakao_link && (
                      <Button
                        onClick={() => requestConsultation(expert, 'text')}
                        className="w-full group-hover:scale-105 transition-transform shadow-lg"
                        size="lg"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        텍스트 상담
                      </Button>
                    )}
                    
                    {expert.consultation_methods.includes('voice') && (
                      <Button
                        onClick={() => requestConsultation(expert, 'voice')}
                        variant="outline"
                        className="w-full hover:bg-primary/10"
                        size="lg"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        음성 상담
                      </Button>
                    )}

                    {expert.consultation_methods.includes('video') && (
                      <Button
                        onClick={() => requestConsultation(expert, 'video')}
                        variant="outline"
                        className="w-full hover:bg-primary/10"
                        size="lg"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        화상 상담
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};