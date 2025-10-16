import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">환불 정책</CardTitle>
            <p className="text-muted-foreground">최종 수정일: 2025년 10월 16일</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">제1조 (목적)</h2>
              <p className="text-muted-foreground">
                본 환불 정책은 (AI)하이라이트(이하 "회사")가 제공하는 유료 서비스에 대한 환불 절차 및 기준을 명확히 하여 
                이용자의 권리를 보호하고 원활한 서비스 이용을 도모하기 위함입니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제2조 (환불 대상 서비스)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. 프리미엄 월간 구독</p>
                <p>2. 토큰 구매</p>
                <p>3. 전문가 상담권</p>
                <p>4. 기타 회사가 제공하는 유료 서비스</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제3조 (환불 기준)</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. 프리미엄 월간 구독</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>결제 후 7일 이내, 서비스 미사용 시: 100% 환불</li>
                    <li>결제 후 7일 이내, 부분 사용 시: 이용 비율에 따라 차감 후 환불</li>
                    <li>결제 후 7일 경과: 환불 불가 (단, 회사 귀책사유 제외)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. 토큰 구매</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>결제 후 7일 이내, 토큰 미사용 시: 100% 환불</li>
                    <li>토큰 일부 사용 시: 잔여 토큰에 대해서만 환불 (사용한 토큰은 차감)</li>
                    <li>유효기간 만료 후: 환불 불가</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">3. 전문가 상담권</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>상담 예약 전: 100% 환불</li>
                    <li>상담 시작 24시간 전까지 취소 시: 100% 환불</li>
                    <li>상담 시작 24시간 이내 취소 시: 50% 환불</li>
                    <li>상담 진행 후: 환불 불가 (단, 전문가 귀책사유 시 100% 환불)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제4조 (환불 불가 사유)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>다음 각 호의 경우에는 환불이 불가능합니다:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>이용자의 귀책사유로 서비스 이용이 제한된 경우</li>
                  <li>서비스를 이미 상당 부분 이용한 경우</li>
                  <li>이벤트나 프로모션으로 무료 또는 할인 제공된 서비스</li>
                  <li>이용자가 제공한 정보의 오류로 인해 서비스를 이용하지 못한 경우</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제5조 (환불 절차)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. 환불 요청: 고객센터 이메일(aihpro@naver.com) 또는 앱 내 문의하기를 통해 신청</p>
                <p>2. 환불 심사: 요청일로부터 영업일 기준 3일 이내 심사</p>
                <p>3. 환불 처리: 심사 승인 후 영업일 기준 7일 이내 처리</p>
                <p>4. 환불 방법: 결제한 수단으로 환불 (카드 결제 시 카드 승인 취소, 계좌이체 시 계좌 입금)</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제6조 (환불 수수료)</h2>
              <p className="text-muted-foreground">
                회사의 귀책사유가 아닌 이용자의 단순 변심에 의한 환불 시, 
                결제 수단에 따라 발생하는 수수료(PG 수수료 등)는 이용자가 부담할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제7조 (부분 환불 계산)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>부분 사용 시 환불 금액은 다음과 같이 계산됩니다:</p>
                <p className="font-mono bg-muted p-2 rounded">
                  환불 금액 = 결제 금액 × (1 - 이용 비율)
                </p>
                <p className="text-sm">
                  * 이용 비율 = 사용한 서비스 / 전체 제공 서비스
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">제8조 (문의)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>환불 관련 문의사항은 아래로 연락주시기 바랍니다:</p>
                <ul className="list-none space-y-1">
                  <li>📧 이메일: aihpro@naver.com</li>
                  <li>🏢 상호명: (AI)하이라이트</li>
                  <li>👤 대표: 이수석</li>
                  <li>🔢 사업자등록번호: 206-12-62002</li>
                  <li>📍 주소: 서울특별시 강남구 강남대로 84길 23-1, 1층 104호 (역삼동)</li>
                </ul>
              </div>
            </section>

            <section className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                본 환불 정책은 전자상거래 등에서의 소비자보호에 관한 법률, 콘텐츠산업 진흥법 등 관련 법령에 따라 작성되었으며, 
                관련 법령의 개정 등에 따라 변경될 수 있습니다.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;
