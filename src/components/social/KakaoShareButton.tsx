import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface KakaoShareButtonProps {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  className?: string;
}

declare global {
  interface Window {
    Kakao: any;
  }
}

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  title,
  description,
  imageUrl,
  url = window.location.href,
  className = ''
}) => {
  const handleKakaoShare = () => {
    try {
      // 카카오톡 공유 기능 (현재는 일반 공유로 대체)
      if (navigator.share) {
        navigator.share({
          title: title,
          text: description,
          url: url,
        });
      } else {
        // 클립보드에 복사
        navigator.clipboard.writeText(url);
        toast.success('링크가 클립보드에 복사되었습니다!');
      }
      
      // 카카오 SDK 로드 시 구현:
      // if (window.Kakao && window.Kakao.Link) {
      //   window.Kakao.Link.sendDefault({
      //     objectType: 'feed',
      //     content: {
      //       title: title,
      //       description: description,
      //       imageUrl: imageUrl || 'https://aihpro.com/default-share.png',
      //       link: {
      //         mobileWebUrl: url,
      //         webUrl: url,
      //       },
      //     },
      //     buttons: [
      //       {
      //         title: '자세히 보기',
      //         link: {
      //           mobileWebUrl: url,
      //           webUrl: url,
      //         },
      //       },
      //     ],
      //   });
      // }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('공유 중 오류가 발생했습니다.');
    }
  };

  return (
    <Button
      onClick={handleKakaoShare}
      className={`bg-yellow-400 hover:bg-yellow-300 text-black ${className}`}
      size="sm"
    >
      <Share2 className="h-4 w-4 mr-2" />
      카카오톡 공유
    </Button>
  );
};