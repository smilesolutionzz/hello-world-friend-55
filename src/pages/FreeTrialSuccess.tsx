import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Calendar, Bell, ArrowRight, Settings } from 'lucide-react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';

const FreeTrialSuccess = () => {
  const navigate = useNavigate();

  const features = [
    '모든 심리검사 무제한 이용',
    '프리미엄 AI 분석 리포트',
    '전문가 상담 우선 예약',
    '관찰 기록 무제한',
    '맞춤형 발달 가이드',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 성공 카드 */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-100/50 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                🎉 축하합니다!
              </CardTitle>
              <p className="text-xl text-muted-foreground mt-2">
                프리미엄 패스 1개월 무료 체험이 시작되었습니다
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 이용 가능한 기능 */}
              <div className="bg-white/80 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  지금 바로 이용 가능한 기능
                </h3>
                <div className="grid gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 중요 안내사항 */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  꼭 확인해주세요
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">1개월 후 자동 결제</p>
                      <p className="text-amber-700">
                        무료 체험 기간이 끝나면 매월 29,900원이 자동 결제됩니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">언제든 구독 취소 가능</p>
                      <p className="text-amber-700">
                        마이페이지 &gt; 구독 관리에서 언제든지 구독을 취소할 수 있습니다.
                        취소 후에도 남은 기간 동안은 프리미엄 혜택을 이용할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 결제 예정 정보 */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Badge variant="outline" className="mb-2">다음 결제 예정</Badge>
                <p className="text-2xl font-bold text-primary">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  29,900원/월 (부가세 포함)
                </p>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => navigate('/assessment')} 
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  size="lg"
                >
                  검사 시작하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => navigate('/token-subscription')} 
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  구독 관리
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialSuccess;
