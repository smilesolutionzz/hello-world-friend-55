import { TokenHistory } from '@/components/TokenHistory';

export default function TokenHistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            토큰 내역
          </h1>
          <p className="text-muted-foreground">
            토큰 사용 및 충전 내역을 확인하세요
          </p>
        </div>
        <TokenHistory />
      </div>
    </div>
  );
}