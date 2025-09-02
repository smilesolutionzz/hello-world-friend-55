import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageCircle, Video, Mic, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
        .order('average_rating', { ascending: false });

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">전문가 목록</h2>
        <p className="text-muted-foreground">{experts.length}명의 전문가</p>
      </div>

      <div className="grid gap-6">
        {experts.map((expert) => (
          <Card key={expert.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-6">
              {/* 프로필 이미지 */}
              <Avatar className="w-20 h-20">
                <AvatarImage src={expert.profile_image_url || ''} />
                <AvatarFallback className="text-lg">
                  {expert.full_name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* 전문가 정보 */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{expert.full_name}</h3>
                    <Badge variant="secondary">{expert.professional_title}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{expert.average_rating.toFixed(1)}</span>
                      <span>({expert.total_sessions}회)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{expert.years_experience}년 경력</span>
                    </div>
                  </div>

                  {/* 전문 분야 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {expert.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  {/* 소개 */}
                  {expert.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {expert.bio.length > 150 
                        ? `${expert.bio.slice(0, 150)}...` 
                        : expert.bio}
                    </p>
                  )}
                </div>

                {/* 상담 방식 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">상담 방식:</span>
                  <div className="flex gap-2">
                    {expert.consultation_methods.map((method) => (
                      <Badge key={method} variant="secondary" className="flex items-center gap-1">
                        {getConsultationIcon(method)}
                        {getConsultationLabel(method)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* 상담 신청 */}
              <div className="text-right space-y-3">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {expert.hourly_rate.toLocaleString()}원
                  </div>
                  <div className="text-sm text-muted-foreground">50분 기준</div>
                </div>

                <div className="space-y-2">
                  {expert.consultation_methods.includes('text') && (
                    <Button
                      onClick={() => requestConsultation(expert, 'text')}
                      className="w-full"
                      size="sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      텍스트 상담
                    </Button>
                  )}
                  
                  {expert.consultation_methods.includes('voice') && (
                    <Button
                      onClick={() => requestConsultation(expert, 'voice')}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      음성 상담
                    </Button>
                  )}

                  {expert.consultation_methods.includes('video') && (
                    <Button
                      onClick={() => requestConsultation(expert, 'video')}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      화상 상담
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};