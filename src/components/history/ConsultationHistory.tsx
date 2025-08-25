import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Calendar, 
  User, 
  Clock,
  Users,
  UserCheck,
  Eye,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Consultation {
  id: string;
  expert_name: string;
  expert_specialization?: string;
  session_type: 'individual' | 'family' | 'group';
  duration_minutes?: number;
  notes?: string;
  next_appointment?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  profile: {
    display_name: string;
  };
}

const ConsultationHistory = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform chat rooms to consultation format
      const consultations = data?.map(room => ({
        id: room.id,
        expert_name: '온라인 상담사',
        session_type: 'individual' as const,
        status: room.status as 'scheduled' | 'completed' | 'cancelled',
        created_at: room.created_at,
        profile: {
          display_name: '사용자'
        }
      })) || [];
      setConsultations(consultations);
    } catch (error) {
      console.error('Error loading consultations:', error);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      scheduled: { color: "bg-blue-100 text-blue-700", label: "예정" },
      completed: { color: "bg-green-100 text-green-700", label: "완료" },
      cancelled: { color: "bg-gray-100 text-gray-700", label: "취소" }
    };
    
    const config = configs[status as keyof typeof configs] || { 
      color: "bg-gray-100 text-gray-700", 
      label: status || "알 수 없음" 
    };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getSessionTypeIcon = (type: string) => {
    const icons = {
      individual: User,
      family: Users,
      group: UserCheck
    };
    
    const Icon = icons[type as keyof typeof icons] || User;
    return <Icon className="w-4 h-4" />;
  };

  const getSessionTypeLabel = (type: string) => {
    const labels = {
      individual: "개인 상담",
      family: "가족 상담",
      group: "그룹 상담"
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">상담 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">상담 기록</h2>
          <p className="text-muted-foreground">전문가와의 상담 기록을 확인하고 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/ai-counselor')}>
            <MessageCircle className="w-4 h-4 mr-2" />
            AI 상담
          </Button>
          <Button onClick={() => navigate('/assessment')}>
            <Plus className="w-4 h-4 mr-2" />
            전문가 상담 예약
          </Button>
        </div>
      </div>

      {/* Consultation List */}
      {consultations.length > 0 ? (
        <div className="space-y-4">
          {consultations.map(consultation => (
            <Card key={consultation.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    {getSessionTypeIcon(consultation.session_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{consultation.expert_name}</h3>
                    {consultation.expert_specialization && (
                      <p className="text-sm text-muted-foreground">{consultation.expert_specialization}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {getSessionTypeLabel(consultation.session_type)}
                      </Badge>
                      {getStatusBadge(consultation.status)}
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  상세보기
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  상담자: {consultation.profile.display_name}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  상담일: {new Date(consultation.created_at).toLocaleDateString()}
                </div>
                
                {consultation.duration_minutes && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    진행시간: {consultation.duration_minutes}분
                  </div>
                )}
                
                {consultation.next_appointment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    다음 예약: {new Date(consultation.next_appointment).toLocaleDateString()}
                  </div>
                )}
              </div>

              {consultation.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">상담 내용</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {consultation.notes.substring(0, 200)}
                    {consultation.notes.length > 200 && "..."}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">아직 상담 기록이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            전문가와의 상담을 통해 더 깊이 있는 도움을 받아보세요
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/ai-counselor')}>
              <MessageCircle className="w-4 h-4 mr-2" />
              AI 상담 시작
            </Button>
            <Button onClick={() => navigate('/assessment')}>
              <Plus className="w-4 h-4 mr-2" />
              전문가 상담 예약
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConsultationHistory;