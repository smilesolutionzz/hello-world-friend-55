import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Users } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';

const ReferralCodeInput: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const { applyReferralCode, isLoading } = useReferrals();

  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;
    
    const success = await applyReferralCode(inputCode.trim().toUpperCase());
    if (success) {
      setInputCode('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCode();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-secondary" />
          추천 코드 입력
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            친구의 추천 코드를 입력하면 2토큰을 즉시 받을 수 있어요!
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="추천 코드 입력 (예: ABC123)"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            maxLength={6}
            className="flex-1"
          />
          <Button 
            onClick={handleApplyCode}
            disabled={!inputCode.trim() || isLoading}
            className="bg-secondary hover:bg-secondary/90"
          >
            {isLoading ? '처리중...' : '적용'}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>추천인은 7일 후 3토큰을 받아요!</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCodeInput;