import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareButtonsProps {
  title: string;
  description: string;
  url?: string;
  onPDFDownload?: () => void;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  title,
  description,
  url = window.location.href,
  onPDFDownload
}) => {
  const { toast } = useToast();

  const shareData = {
    title: `${title} - 마음성장 AI 심리분석`,
    text: `${description}\n\n나도 AI 심리분석 받아보기 👇`,
    url: url
  };

  const handleKakaoShare = () => {
    if (window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: shareData.title,
          description: shareData.text,
          imageUrl: 'https://your-domain.com/og-image.jpg',
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
        buttons: [
          {
            title: '나도 무료 체험하기',
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
        ],
      });
      
      toast({
        title: "카카오톡 공유 완료",
        description: "친구들과 함께 심리분석을 받아보세요!",
      });
    } else {
      toast({
        title: "카카오톡 공유 오류",
        description: "카카오톡 앱이 설치되어 있지 않습니다.",
        variant: "destructive",
      });
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "공유 완료",
          description: "결과를 성공적으로 공유했습니다!",
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const textToCopy = `${shareData.title}\n\n${shareData.text}\n\n${url}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "링크 복사 완료",
        description: "클립보드에 복사되었습니다. 어디든 붙여넣어 공유하세요!",
      });
    });
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 md:p-6 space-y-4">
      <div className="text-center space-y-2">
        <h4 className="font-bold text-base md:text-lg">🎉 친구들과 함께 해보세요!</h4>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          공유하신 분과 친구 모두 <span className="font-semibold text-primary">무료 토큰 5개</span>를 드려요!
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Button
          onClick={handleKakaoShare}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 h-10 md:h-12 text-sm md:text-base"
          size="sm"
        >
          <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
          <span className="text-xs md:text-sm">카톡공유</span>
        </Button>
        
        <Button
          onClick={handleWebShare}
          variant="outline"
          className="h-10 md:h-12 text-sm md:text-base"
          size="sm"
        >
          <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
          <span className="text-xs md:text-sm">공유하기</span>
        </Button>
        
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="h-10 md:h-12 text-sm md:text-base"
          size="sm"
        >
          <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1" />
          <span className="text-xs md:text-sm">링크복사</span>
        </Button>
        
        {onPDFDownload && (
          <Button
            onClick={onPDFDownload}
            variant="outline"
            className="h-10 md:h-12 text-sm md:text-base"
            size="sm"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="text-xs md:text-sm">PDF저장</span>
          </Button>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-xs md:text-sm text-muted-foreground">
          💝 추천인 코드: <span className="font-mono bg-primary/20 px-2 py-1 rounded text-xs md:text-sm">FRIEND2024</span>
        </p>
      </div>
    </div>
  );
};

export default SocialShareButtons;