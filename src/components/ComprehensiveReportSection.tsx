import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Smartphone, 
  Clock, 
  CheckCircle, 
  BarChart3, 
  Users, 
  MessageCircle, 
  Brain,
  AlertCircle,
  Coins
} from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ComprehensiveReportSectionProps {
  totalAssessments: number;
  totalObservations: number;
  totalConsultations: number;
  hasEnoughData: boolean;
}

export function ComprehensiveReportSection({ 
  totalAssessments, 
  totalObservations, 
  totalConsultations,
  hasEnoughData 
}: ComprehensiveReportSectionProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const { balance, consumeTokens, checkTokenAvailability } = useTokens();
  const { toast } = useToast();

  const tokenCost = TOKEN_COSTS.COMPREHENSIVE_REPORT;
  const hasEnoughTokens = checkTokenAvailability(tokenCost);

  const handleRequestReport = async () => {
    if (!hasEnoughTokens) {
      toast({
        title: "토큰 부족",
        description: `종합 리포팅에는 ${tokenCost}토큰이 필요합니다.`,
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughData) {
      toast({
        title: "데이터 부족",
        description: "종합 리포팅을 위해 더 많은 검사와 관찰 데이터가 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsRequesting(true);

    try {
      // 토큰 소모
      const success = await consumeTokens(tokenCost);
      if (!success) {
        throw new Error("토큰 소모 실패");
      }

      // 종합 리포팅 요청 API 호출
      const { data, error } = await supabase.functions.invoke('generate-comprehensive-report', {
        body: {
          totalAssessments,
          totalObservations,
          totalConsultations,
          requestDate: new Date().toISOString(),
          phoneDelivery: true
        }
      });

      if (error) throw error;

      toast({
        title: "종합 리포팅 신청 완료! 🎉",
        description: "3일 내에 휴대폰으로 전문가 분석 리포트가 전송됩니다.",
        duration: 5000,
      });

    } catch (error: any) {
      console.error('Error requesting comprehensive report:', error);
      const errorMessage = error?.message?.includes('토큰') ? 
        '토큰이 부족합니다. 토큰을 충전해주세요.' :
        '종합 리포팅 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      
      toast({
        title: "요청 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary-glow/10 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">AIH 전문가 종합 리포팅</h3>
          <p className="text-sm text-muted-foreground">모든 데이터를 종합한 전문 분석 리포트</p>
        </div>
      </div>

      {/* 데이터 현황 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">검사</span>
          </div>
          <p className="text-lg font-bold text-primary">{totalAssessments}</p>
        </div>
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BarChart3 className="w-4 h-4 text-soft-mint-foreground" />
            <span className="text-xs text-muted-foreground">관찰일지</span>
          </div>
          <p className="text-lg font-bold text-soft-mint-foreground">{totalObservations}</p>
        </div>
        <div className="text-center p-3 bg-background/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MessageCircle className="w-4 h-4 text-calm-blue-foreground" />
            <span className="text-xs text-muted-foreground">AI상담</span>
          </div>
          <p className="text-lg font-bold text-calm-blue-foreground">{totalConsultations}</p>
        </div>
      </div>

      {/* 리포트 특징 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">프리미엄 검사 결과 종합 분석</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">관찰일지 패턴 분석 및 개선점 도출</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm">AI 상담 내용 기반 맞춤 솔루션 제공</span>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">3일 내 휴대폰으로 전송</span>
        </div>
      </div>

      {/* 토큰 정보 및 버튼 */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <span className="font-bold text-primary">{tokenCost}토큰</span>
          {!hasEnoughTokens && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              토큰 부족
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={handleRequestReport}
          disabled={!hasEnoughTokens || !hasEnoughData || isRequesting}
          className="font-medium"
        >
          {isRequesting ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              신청 중...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              종합 리포팅 신청
            </>
          )}
        </Button>
      </div>

      {!hasEnoughData && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              더 정확한 분석을 위해 검사와 관찰 데이터를 더 수집해보세요.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}