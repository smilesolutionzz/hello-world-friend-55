import { ReferralSystem } from '@/components/referral/ReferralSystem';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReferralPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">친구 추천 보상</h1>
            <p className="text-muted-foreground">친구를 초대하고 함께 토큰을 받으세요</p>
          </div>
        </div>

        {/* 레퍼럴 시스템 */}
        <ReferralSystem />

        {/* 추가 정보 */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-2">10</div>
            <div className="text-sm text-muted-foreground">토큰 / 친구</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-2">∞</div>
            <div className="text-sm text-muted-foreground">무제한 초대</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-2">24h</div>
            <div className="text-sm text-muted-foreground">즉시 지급</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;