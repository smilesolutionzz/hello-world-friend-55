import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminTokenAdd = () => {
  const [email, setEmail] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddTokens = async () => {
    if (!email || !tokenAmount) {
      toast({
        title: "입력 오류",
        description: "이메일과 토큰 수량을 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-add-tokens', {
        body: { 
          targetEmail: email,
          tokenAmount: parseInt(tokenAmount)
        }
      });

      if (error) throw error;

      toast({
        title: "토큰 지급 완료",
        description: `${email}에 ${tokenAmount}토큰이 지급되었습니다.`,
      });

      setEmail('');
      setTokenAmount('');
    } catch (error) {
      console.error('토큰 지급 오류:', error);
      toast({
        title: "토큰 지급 실패",
        description: "토큰 지급 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>관리자 토큰 지급</CardTitle>
        <CardDescription>
          사용자에게 토큰을 직접 지급할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">사용자 이메일</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tokens">토큰 수량</Label>
          <Input
            id="tokens"
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="예: 500"
          />
        </div>
        <Button 
          onClick={handleAddTokens} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? '토큰 지급 중...' : '토큰 지급'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminTokenAdd;