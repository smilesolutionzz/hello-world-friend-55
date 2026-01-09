import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { shareToKakao, isKakaoInitialized, KakaoShareOptions } from '@/lib/kakaoShare';
import { trackEvent } from '@/components/common/Analytics';

interface KakaoShareButtonProps {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  buttonText?: string;
  referralCode?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  title,
  description,
  imageUrl,
  url = window.location.href,
  buttonText = '카카오톡 공유',
  referralCode,
  className = '',
  size = 'sm',
  variant = 'default',
}) => {
  const handleKakaoShare = () => {
    trackEvent('kakao_share_click', { title, url });
    
    const success = shareToKakao({
      title,
      description,
      imageUrl,
      url,
      referralCode,
    });

    if (!success) {
      toast.success('카카오톡에 붙여넣기 하세요! 💬');
    }
  };

  return (
    <Button
      onClick={handleKakaoShare}
      className={`bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] ${className}`}
      size={size}
      variant={variant}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
};