import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Share2, Download, Copy, Sparkles, Instagram, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { trackEvent } from '@/components/common/Analytics';

interface ViralShareCardProps {
  testName: string;
  resultTitle: string;
  resultSummary: string;
  score?: number | string;
  emoji?: string;
  gradientFrom?: string;
  gradientTo?: string;
  shareUrl?: string;
  referralCode?: string;
  children?: React.ReactNode;
}

export const ViralShareCard: React.FC<ViralShareCardProps> = ({
  testName,
  resultTitle,
  resultSummary,
  score,
  emoji = '✨',
  gradientFrom = 'from-primary',
  gradientTo = 'to-accent',
  shareUrl = window.location.href,
  referralCode,
  children
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const viralMessage = `${emoji} ${testName} 결과\n\n${resultTitle}\n${resultSummary}\n\n🔗 나도 해보기: ${shareUrl}\n\n#심리테스트 #AIHPRO #자가분석`;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      // 모바일에서 공유 가능하면 공유
      const file = new File([blob], `${testName}-결과.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `${testName} 결과`,
            text: viralMessage,
            files: [file]
          });
          toast.success("공유 완료!");
          return;
        } catch (shareError) {
          console.log('Share API failed, downloading:', shareError);
        }
      }

      // 공유 불가하면 다운로드
      const link = document.createElement('a');
      link.download = `${testName}-결과.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("이미지 저장 완료! 📸\n인스타 스토리에 올려보세요!", {
        duration: 4000,
      });
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      toast.error("이미지 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${viralMessage}`);
      toast.success("복사 완료! 친구에게 공유하세요 💌");
    } catch (error) {
      toast.error("복사에 실패했습니다.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${testName} 결과`,
          text: viralMessage,
          url: shareUrl,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleInstagramShare = () => {
    handleDownloadImage();
    toast.success("이미지를 저장했어요!\n인스타 스토리에 업로드하세요 📸", {
      duration: 4000,
    });
  };

  const handleTwitterShare = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(viralMessage)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* 공유용 결과 카드 */}
      <div
        ref={cardRef}
        className="p-6 rounded-2xl bg-white"
        style={{ minHeight: '200px' }}
      >
        {/* 헤더 */}
        <div className={`text-center pb-4 mb-4 border-b border-gray-100`}>
          <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-2 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white`}>
            {testName}
          </div>
          <div className="text-4xl mb-2">{emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{resultTitle}</h2>
          {score && (
            <p className={`text-lg font-semibold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
              {score}
            </p>
          )}
        </div>

        {/* 결과 요약 */}
        <p className="text-gray-700 text-center leading-relaxed mb-4">
          {resultSummary}
        </p>

        {/* 추가 컨텐츠 */}
        {children}

        {/* 브랜딩 푸터 */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            🔮 AIHPRO에서 무료로 테스트해보세요!
          </p>
          <p className="text-xs text-gray-300 mt-1">aihpro.kr</p>
        </div>
      </div>

      {/* 공유 버튼들 */}
      <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <div className="text-center mb-3">
          <h4 className="font-bold text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            친구들에게 공유하기
          </h4>
          <p className="text-sm text-muted-foreground">
            "이거 어디서 해봤어?" 친구들이 물어볼거예요! 🔥
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* 이미지 저장 */}
          <Button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="flex-col h-auto py-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isGenerating ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="w-5 h-5 mb-1" />
            )}
            <span className="text-[10px]">이미지 저장</span>
          </Button>

          {/* 인스타그램 */}
          <Button
            onClick={handleInstagramShare}
            className="flex-col h-auto py-3 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90"
          >
            <Instagram className="w-5 h-5 mb-1" />
            <span className="text-[10px]">인스타</span>
          </Button>

          {/* 공유하기 */}
          <Button
            onClick={handleNativeShare}
            variant="outline"
            className="flex-col h-auto py-3"
          >
            <Share2 className="w-5 h-5 mb-1" />
            <span className="text-[10px]">더보기</span>
          </Button>
        </div>

        {/* 링크 복사 */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Copy className="w-4 h-4 mr-2" />
          결과 링크 복사하기
        </Button>
      </Card>

      {/* 바이럴 유도 메시지 */}
      <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <p className="text-sm">
          💡 <strong>친구도 테스트하면</strong> 서로 결과 비교할 수 있어요!
        </p>
      </div>
    </div>
  );
};

export default ViralShareCard;
