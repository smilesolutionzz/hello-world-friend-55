import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Phone, 
  Shield, 
  Clock,
  User,
  FileText,
  Activity,
  Brain
} from "lucide-react";

interface CrisisDetectionProps {
  riskLevel: 'low' | 'medium' | 'high';
  onEscalate: () => void;
}

// 위기상황 감지 시스템
const CrisisDetection = ({ riskLevel, onEscalate }: CrisisDetectionProps) => {
  const [showCrisisProtocol, setShowCrisisProtocol] = useState(false);
  const [responseTime, setResponseTime] = useState(0);

  useEffect(() => {
    if (riskLevel === 'high') {
      setShowCrisisProtocol(true);
      // 응답 시간 카운터 시작
      const interval = setInterval(() => {
        setResponseTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [riskLevel]);

  const emergencyContacts = [
    {
      name: "통합건강위기상담전화",
      number: "1577-0199",
      description: "24시간 위기개입 전문상담",
      priority: 1
    },
    {
      name: "생명의전화",
      number: "1588-9191", 
      description: "자살예방 전문상담",
      priority: 2
    },
    {
      name: "청소년전화",
      number: "1388",
      description: "청소년 전용 상담전화",
      priority: 3
    }
  ];

  if (!showCrisisProtocol) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Crisis Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-700">위기상황 감지</h2>
              <p className="text-muted-foreground">즉시 전문가 도움이 필요합니다</p>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-700">응급 대응 시간</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {Math.floor(responseTime / 60)}:{(responseTime % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">긴급 연락처</h3>
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{contact.name}</h4>
                    {contact.priority === 1 && (
                      <Badge className="bg-red-100 text-red-700">최우선</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.description}</p>
                </div>
                <Button 
                  onClick={() => window.open(`tel:${contact.number}`)}
                  className={contact.priority === 1 ? "bg-red-600 hover:bg-red-700" : "btn-brand"}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {contact.number}
                </Button>
              </div>
            ))}
          </div>

          {/* Professional Escalation */}
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-4">
            <h4 className="font-semibold text-orange-700 mb-2">AIH 전문가 즉시 연결</h4>
            <p className="text-sm text-orange-600 mb-3">
              카카오톡으로 전문가와 실시간 상담 가능
            </p>
            <Button 
              onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')} 
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              💬 카카오톡 전문가 연결
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-700 mb-2">전문가 즉시 연결</h4>
            <p className="text-sm text-blue-600 mb-3">
              위기개입 전문가가 5분 내에 연결됩니다
            </p>
            <Button onClick={onEscalate} className="w-full bg-blue-600 hover:bg-blue-700">
              <User className="w-4 h-4 mr-2" />
              응급 전문가 연결 요청
            </Button>
          </div>

          {/* Crisis Protocol Info */}
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              모든 위기상황은 즉시 전문가에게 보고됩니다
            </p>
            <p className="flex items-center gap-2">
              <FileText className="w-3 h-3" />
              대화 내용은 안전하게 보호되며 치료 목적으로만 사용됩니다
            </p>
          </div>

          {/* Close Button */}
          <div className="text-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowCrisisProtocol(false)}
              className="text-sm"
            >
              위기상황 종료
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// 실시간 모니터링 대시보드
export const CrisisMonitoringDashboard = () => {
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 1,
      userId: "user_001",
      riskLevel: 'high' as const,
      lastMessage: "죽고 싶어요... 더 이상 견딜 수 없어요",
      timestamp: new Date(Date.now() - 120000), // 2분 전
      status: 'escalated'
    },
    {
      id: 2, 
      userId: "user_002",
      riskLevel: 'medium' as const,
      lastMessage: "요즘 너무 우울해서 아무것도 하기 싫어요",
      timestamp: new Date(Date.now() - 300000), // 5분 전
      status: 'monitoring'
    }
  ]);

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    const colors = {
      low: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100", 
      high: "text-red-600 bg-red-100"
    };
    return colors[level];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">위기상황 모니터링</h1>
        <div className="flex items-center gap-4">
          <Badge className="bg-red-100 text-red-700">
            긴급: {activeAlerts.filter(alert => alert.riskLevel === 'high').length}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-700">
            주의: {activeAlerts.filter(alert => alert.riskLevel === 'medium').length}
          </Badge>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="space-y-4">
        {activeAlerts.map(alert => (
          <Card key={alert.id} className={`p-4 border-l-4 ${
            alert.riskLevel === 'high' ? 'border-l-red-500' : 'border-l-yellow-500'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className={getRiskColor(alert.riskLevel)}>
                    {alert.riskLevel === 'high' ? '긴급' : '주의'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    사용자 ID: {alert.userId}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.floor((Date.now() - alert.timestamp.getTime()) / 60000)}분 전
                  </span>
                </div>
                <p className="text-sm text-foreground">{alert.lastMessage}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  상태: {alert.status === 'escalated' ? '전문가 배정됨' : '모니터링 중'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Brain className="w-4 h-4 mr-1" />
                  상세 보기
                </Button>
                {alert.riskLevel === 'high' && (
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <Phone className="w-4 h-4 mr-1" />
                    즉시 개입
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CrisisDetection;