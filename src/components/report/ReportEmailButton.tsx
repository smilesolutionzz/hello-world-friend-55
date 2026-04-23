import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Mail, Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ReportEmailButtonProps {
  reportHistoryId?: string;
  reportTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

const ReportEmailButton: React.FC<ReportEmailButtonProps> = ({
  reportHistoryId,
  reportTitle,
  className,
  variant = 'outline',
}) => {
  const { user } = useAuthGuard();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'self' | 'other'>('self');
  const [otherEmail, setOtherEmail] = useState('');
  const [sending, setSending] = useState(false);

  const userEmail = user?.email || '';

  const handleSend = async () => {
    if (!user) {
      toast({ title: '로그인이 필요합니다', variant: 'destructive' });
      return;
    }
    const recipientEmail = mode === 'self' ? userEmail : otherEmail.trim();
    if (!recipientEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipientEmail)) {
      toast({ title: '올바른 이메일을 입력해 주세요', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: {
          recipientEmail,
          reportHistoryId,
          reportTitle,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || '발송 실패');

      toast({
        title: '리포트 요약 메일을 보냈어요 📧',
        description: `${recipientEmail}로 전송되었습니다.`,
      });
      setOpen(false);
      setOtherEmail('');
    } catch (e: any) {
      console.error(e);
      toast({
        title: '메일 발송에 실패했어요',
        description: e?.message || '잠시 후 다시 시도해 주세요.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <Mail className="w-4 h-4 mr-2" />
          이메일로 받기
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            리포트 요약 메일 발송
          </DialogTitle>
          <DialogDescription className="text-xs">
            메일에는 핵심 요약과 전체 리포트 보기 링크가 포함됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'self' | 'other')} className="space-y-2">
            <div className="flex items-center space-x-2 rounded-lg border p-3">
              <RadioGroupItem value="self" id="self" />
              <Label htmlFor="self" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">내 이메일로 받기</div>
                <div className="text-xs text-muted-foreground mt-0.5 break-all">
                  {userEmail || '로그인이 필요합니다'}
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-lg border p-3">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm">다른 이메일로 보내기</div>
                <div className="text-xs text-muted-foreground mt-0.5">가족·전문가에게 공유</div>
              </Label>
            </div>
          </RadioGroup>

          {mode === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="other-email">받는 사람 이메일</Label>
              <Input
                id="other-email"
                type="email"
                placeholder="example@email.com"
                value={otherEmail}
                onChange={(e) => setOtherEmail(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={handleSend}
            disabled={sending || (mode === 'self' && !userEmail)}
            className="w-full"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />발송 중...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />메일 발송</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportEmailButton;
