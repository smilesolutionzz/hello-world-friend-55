import Navigation from '@/components/Navigation';
import { HybridSubscriptionDashboard } from '@/components/subscription/HybridSubscriptionDashboard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const Subscription = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            홈으로
          </Button>
          <div>
            <h1 className="text-3xl font-bold">구독 관리</h1>
            <p className="text-muted-foreground">
              당신에게 맞는 최적의 플랜을 선택하세요
            </p>
          </div>
        </div>

        {/* 하이브리드 구독 대시보드 */}
        <HybridSubscriptionDashboard />
      </div>
    </div>
  );
};

export default Subscription;