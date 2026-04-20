import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Copy, Share2, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ResultEmailShareProps {
  title: string;
  type: 'report' | 'test_result' | 'analysis' | 'concern';
  content: {
    summary?: string;
    sections?: Array<{ title: string; content: string }>;
    scores?: Record<string, number>;
    interpretation?: string;
    recommendations?: string[];
    metadata?: Record<string, any>;
  };
  onDownload?: () => void;
  shareUrl?: string;
}

const ResultEmailShare: React.FC<ResultEmailShareProps> = ({
  title,
  type,
  content,
  onDownload,
  shareUrl,
}) => {
  const [email, setEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthGuard();

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "이메일을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-share-email', {
        body: {
          email,
          type,
          title,
          recipientName: recipientName || undefined,
          senderName: user.user_metadata?.name || user.email?.split('@')[0],
          content,
        },
      });

      if (error) throw error;

      toast({
        title: "이메일 발송 완료! 📧",
        description: `${email}로 결과가 전송되었습니다.`,
      });
      setIsOpen(false);
      setEmail('');
      setRecipientName('');
    } catch (error: any) {
      console.error('Email send error:', error);
      toast({
        title: "이메일 발송 실패",
        description: error.message || "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = async () => {
    const url = shareUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "링크가 복사되었습니다! 📋",
      });
    } catch {
      toast({
        title: "링크 복사 실패",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content.summary?.substring(0, 100) || '검사 결과를 확인해보세요!',
          url: shareUrl || window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-sky-200/50 dark:border-slate-700">
      <h3 className="text-lg font-bold text-center text-slate-800 dark:text-white mb-2">
        결과 공유하기
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">
        친구들과 함께 결과를 공유하고 더 많은 사람들이 도움받을 수 있게 해주세요!
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="bg-white dark:bg-slate-800"
        >
          <Copy className="w-4 h-4 mr-2" />
          링크 복사
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-white dark:bg-slate-800"
            >
              <Mail className="w-4 h-4 mr-2" />
              이메일 전송
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                이메일로 결과 보내기
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">받는 사람 이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">받는 사람 이름 (선택)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendEmail}
                disabled={isSending || !email}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    발송 중...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    이메일 보내기
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {onDownload ? (
          <Button
            variant="outline"
            onClick={onDownload}
            className="bg-white dark:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            이미지 저장
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="bg-white dark:bg-slate-800"
          >
            <Share2 className="w-4 h-4 mr-2" />
            공유하기
          </Button>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
          🎁 친구 추천하면 보너스 토큰을 받을 수 있어요!
        </p>
      </div>
    </div>
  );
};

export default ResultEmailShare;
