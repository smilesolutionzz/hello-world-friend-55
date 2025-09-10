import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  Crown,
  Calendar,
  CreditCard,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Download,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const ExpertContractSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [contractData, setContractData] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // 실제로는 세션 ID를 사용해서 계약 정보를 가져와야 함
      // 여기서는 Mock 데이터 사용
      setTimeout(() => {
        setContractData({
          id: 'contract-123',
          expertName: '박상훈',
          contractType: 'monthly',
          durationMonths: 3,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sessionsPerWeek: 2,
          monthlyAmount: 200000,
          totalAmount: 600000,
          paymentMethod: 'card',
          status: 'active'
        });
        setIsLoading(false);
      }, 1000);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">계약 처리 중...</h2>
            <p className="text-muted-foreground">잠시만 기다려주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contractData) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">계약 정보를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground mb-4">계약 처리 중 문제가 발생했습니다.</p>
            <Button onClick={() => navigate('/expert-hiring')}>
              전문가 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 성공 헤더 */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            계약이 성공적으로 완료되었습니다! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            {contractData.expertName} 전문가와의 장기 계약이 시작됩니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 계약 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 계약 개요 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  계약 개요
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">전문가</label>
                    <div className="text-lg font-semibold">{contractData.expertName}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">계약 번호</label>
                    <div className="text-lg font-mono">{contractData.id}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">계약 기간</label>
                    <div className="text-lg font-semibold">{contractData.durationMonths}개월</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">주당 상담 횟수</label>
                    <div className="text-lg font-semibold">주 {contractData.sessionsPerWeek}회</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">계약 시작일</label>
                    <div className="text-lg">{new Date(contractData.startDate).toLocaleDateString('ko-KR')}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">계약 종료일</label>
                    <div className="text-lg">{new Date(contractData.endDate).toLocaleDateString('ko-KR')}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Badge className="bg-green-100 text-green-700 px-3 py-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    계약 활성화됨
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 결제 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  결제 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">월 결제 금액</label>
                    <div className="text-2xl font-bold text-primary">
                      ₩{contractData.monthlyAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">총 계약 금액</label>
                    <div className="text-2xl font-bold">
                      ₩{contractData.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">결제 방법</label>
                    <div className="text-lg">신용카드 (자동결제)</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">다음 결제일</label>
                    <div className="text-lg">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      무통장입금으로 안전하게 처리되었습니다
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      영수증 다운로드
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 포함 서비스 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  포함 서비스
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>주 {contractData.sessionsPerWeek}회 개별 상담 (월 {contractData.sessionsPerWeek * 4}회)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>월 1회 진전 상황 리포트</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>24시간 긴급 상담 지원</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>가족 교육 프로그램 참여</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>개인 맞춤 치료 계획 수립</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 다음 단계 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-primary" />
                  다음 단계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-700 mb-2">1. 전문가 연락 대기</h3>
                    <p className="text-sm text-blue-600">
                      전문가가 24시간 내에 연락을 드릴 예정입니다.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">2. 상담 일정 조율</h3>
                    <p className="text-sm text-green-600">
                      첫 번째 상담 일정을 전문가와 함께 조율합니다.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-700 mb-2">3. 정기 상담 시작</h3>
                    <p className="text-sm text-purple-600">
                      주 {contractData.sessionsPerWeek}회 정기 상담이 시작됩니다.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    전문가와 대화하기
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    일정 확인하기
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    계약서 보기
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">궁금한 점이 있으신가요?</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>고객센터: 1588-1234</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>support@example.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">축하합니다! 🎊</h2>
            <p className="text-lg text-muted-foreground mb-6">
              전문가와의 여정이 시작되었습니다. 꾸준한 상담을 통해 좋은 결과를 얻으시길 바랍니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                대시보드로 이동
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/expert-hiring')}>
                다른 전문가 찾기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertContractSuccess;