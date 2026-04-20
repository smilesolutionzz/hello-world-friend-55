import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ShareResultButtonProps {
  title: string;
  description: string;
  resultData?: any;
  shareUrl?: string;
  showScreenshot?: boolean;
  className?: string;
}

const ShareResultButton: React.FC<ShareResultButtonProps> = ({
  title,
  description,
  resultData,
  shareUrl = window.location.href,
  showScreenshot = true,
  className = ''
}) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('링크가 클립보드에 복사되었습니다!');
    } catch (error) {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleScreenshot = async () => {
    setIsSharing(true);
    try {
      // 결과 영역을 스크린샷으로 캡처
      const element = document.querySelector('.result-content') as HTMLElement;
      if (!element) {
        toast.error('결과 영역을 찾을 수 없습니다.');
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      // 이미지를 다운로드
      const link = document.createElement('a');
      link.download = `${title}-결과.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('결과 이미지가 다운로드되었습니다!');
    } catch (error) {
      console.error('스크린샷 실패:', error);
      toast.error('이미지 생성에 실패했습니다.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">결과 공유하기</h3>
        <p className="text-sm text-muted-foreground">
          친구들과 함께 결과를 공유하고 더 많은 사람들이 도움받을 수 있게 해주세요!
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* 링크 복사 */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
        >
          <Copy className="w-4 h-4 mr-2" />
          링크 복사
        </Button>

        {/* 일반 공유 */}
        <Button
          onClick={handleNativeShare}
          variant="outline"
          size="sm"
        >
          <Share2 className="w-4 h-4 mr-2" />
          공유하기
        </Button>

        {/* 스크린샷 다운로드 */}
        {showScreenshot && (
          <Button
            onClick={handleScreenshot}
            disabled={isSharing}
            variant="outline"
            size="sm"
          >
            {isSharing ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-current"></div>
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            이미지 저장
          </Button>
        )}
      </div>
      
      {/* 바이럴 유도 메시지 */}
      <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
        <p className="text-sm text-center text-muted-foreground">
          💝 <strong>친구 추천하면 보너스 토큰</strong>을 받을 수 있어요!
        </p>
      </div>
    </div>
  );
};

export default ShareResultButton;