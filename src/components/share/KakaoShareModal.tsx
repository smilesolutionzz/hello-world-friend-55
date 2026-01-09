import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageCircle, Copy, Share2, Download, Instagram, Users } from 'lucide-react';
import { toast } from 'sonner';
import { shareToKakao, shareTestResult, shareReferral, isKakaoInitialized } from '@/lib/kakaoShare';
import { trackEvent } from '@/components/common/Analytics';

interface KakaoShareModalProps {
  // 공유 컨텐츠
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  
  // 테스트 결과용 (선택)
  testName?: string;
  resultTitle?: string;
  emoji?: string;
  score?: string | number;
  
  // 레퍼럴 코드
  referralCode?: string;
  
  // 트리거 버튼 스타일
  triggerText?: string;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  
  // 자식 요소 (커스텀 트리거)
  children?: React.ReactNode;
}

export const KakaoShareModal: React.FC<KakaoShareModalProps> = ({
  title,
  description,
  imageUrl,
  url = window.location.href,
  testName,
  resultTitle,
  emoji,
  score,
  referralCode,
  triggerText = '공유하기',
  triggerIcon,
  triggerClassName,
  triggerVariant = 'default',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = referralCode && !url.includes('ref=')
    ? `${url}${url.includes('?') ? '&' : '?'}ref=${referralCode}`
    : url;

  const shareMessage = `${emoji || '✨'} ${title}\n\n${description}\n\n👉 ${shareUrl}`;

  const handleKakaoShare = () => {
    trackEvent('share_kakao', { title, url: shareUrl });
    
    if (testName && resultTitle) {
      shareTestResult({
        testName,
        resultTitle,
        resultSummary: description,
        emoji,
        score,
        referralCode,
      });
    } else {
      shareToKakao({
        title,
        description,
        imageUrl,
        url: shareUrl,
        referralCode,
      });
    }
    
    if (!isKakaoInitialized()) {
      toast.success('카카오톡에 붙여넣기 하세요! 💬');
    }
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    trackEvent('share_copy_link', { url: shareUrl });
    
    try {
      await navigator.clipboard.writeText(shareMessage);
      setIsCopied(true);
      toast.success('복사 완료! 친구에게 공유하세요 💌');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleNativeShare = async () => {
    trackEvent('share_native', { url: shareUrl });
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch {
        // 사용자가 취소함
      }
    } else {
      handleCopyLink();
    }
  };

  const handleInstagramShare = () => {
    trackEvent('share_instagram', { url: shareUrl });
    toast.success('이미지를 저장 후 인스타 스토리에 올려보세요! 📸');
    setIsOpen(false);
  };

  const handleInviteFriends = () => {
    trackEvent('share_invite_friends', { referralCode });
    
    if (referralCode) {
      shareReferral(referralCode);
    } else {
      handleKakaoShare();
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={triggerVariant} className={triggerClassName}>
            {triggerIcon || <Share2 className="w-4 h-4 mr-2" />}
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            친구에게 공유하기
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 공유 미리보기 */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium text-sm line-clamp-1">{title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>
          </div>

          {/* 공유 버튼 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 카카오톡 */}
            <Button
              onClick={handleKakaoShare}
              className="h-16 flex-col gap-1 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E]"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-medium">카카오톡</span>
            </Button>

            {/* 친구 초대 */}
            <Button
              onClick={handleInviteFriends}
              className="h-16 flex-col gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium">친구 초대</span>
            </Button>

            {/* 인스타그램 */}
            <Button
              onClick={handleInstagramShare}
              className="h-16 flex-col gap-1 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
            >
              <Instagram className="w-6 h-6" />
              <span className="text-xs font-medium">인스타그램</span>
            </Button>

            {/* 더보기 */}
            <Button
              onClick={handleNativeShare}
              variant="outline"
              className="h-16 flex-col gap-1"
            >
              <Share2 className="w-6 h-6" />
              <span className="text-xs font-medium">더보기</span>
            </Button>
          </div>

          {/* 링크 복사 */}
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            {isCopied ? '복사됨!' : '링크 복사하기'}
          </Button>

          {/* 바이럴 유도 */}
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <p className="text-sm">
              💡 <strong>친구가 가입하면</strong> 보너스 캐시 100원!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KakaoShareModal;
