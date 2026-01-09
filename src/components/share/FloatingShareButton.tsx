import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Share2 } from 'lucide-react';
import { sharePage, shareReferral, isKakaoInitialized } from '@/lib/kakaoShare';
import { trackEvent } from '@/components/common/Analytics';
import { toast } from 'sonner';

interface FloatingShareButtonProps {
  referralCode?: string;
  className?: string;
}

/**
 * 플로팅 공유 버튼 - 화면 하단에 고정
 * 레퍼럴 코드가 있으면 친구 초대용으로 동작
 */
export const FloatingShareButton: React.FC<FloatingShareButtonProps> = ({
  referralCode,
  className = '',
}) => {
  const handleShare = () => {
    trackEvent('floating_share_click', { referralCode, hasReferral: !!referralCode });
    
    if (referralCode) {
      shareReferral(referralCode);
    } else {
      sharePage({
        title: '무료 AI 심리검사 해봤어요!',
        description: 'AI가 분석해주는 심리검사, 발달평가까지! 친구도 해보세요 🎁',
        buttonText: '무료로 해보기',
      });
    }

    if (!isKakaoInitialized()) {
      toast.success('카카오톡에 붙여넣기 하세요! 💬');
    }
  };

  return (
    <div className={`fixed bottom-20 right-4 z-50 ${className}`}>
      <Button
        onClick={handleShare}
        size="lg"
        className="rounded-full w-14 h-14 shadow-lg bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] p-0"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 text-[10px] text-white items-center justify-center font-bold">!</span>
      </span>
    </div>
  );
};

export default FloatingShareButton;
