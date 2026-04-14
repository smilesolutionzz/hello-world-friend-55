import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Download, RefreshCw, Sparkles, Heart, Zap, Target, TrendingUp, BarChart3, ImageIcon, MessageCircle, Copy, Instagram } from "lucide-react";
import { getMBTIDescription, MBTIPercentages } from "./mbtiCalculator";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MBTIResultProps {
  mbtiType: string;
  aiAnalysis: string;
  percentages: MBTIPercentages;
  onRestart: () => void;
}

export const MBTIResult = ({ mbtiType, aiAnalysis, percentages, onRestart }: MBTIResultProps) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const description = getMBTIDescription(mbtiType);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  const dimensions = [
    { left: 'E', right: 'I', leftPercent: percentages.E, rightPercent: percentages.I, leftLabel: '외향', rightLabel: '내향' },
    { left: 'S', right: 'N', leftPercent: percentages.S, rightPercent: percentages.N, leftLabel: '감각', rightLabel: '직관' },
    { left: 'T', right: 'F', leftPercent: percentages.T, rightPercent: percentages.F, leftLabel: '사고', rightLabel: '감정' },
    { left: 'J', right: 'P', leftPercent: percentages.J, rightPercent: percentages.P, leftLabel: '판단', rightLabel: '인식' }
  ];

  const handleShare = async () => {
    if (!resultRef.current) return;

    try {
      // 스크린샷 생성
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });
      
      // Canvas를 Blob으로 변환
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      const file = new File([blob], `mbti-${mbtiType}.png`, { type: 'image/png' });

      // 모바일에서 Web Share API 시도
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `나는 ${mbtiType} - ${description.title}`,
            text: `${description.subtitle}\n당신도 테스트해보세요!`,
            files: [file]
          });
          toast.success("공유가 완료되었습니다!");
          return;
        } catch (shareError) {
          console.log('Share API failed, trying clipboard:', shareError);
        }
      }

      // Clipboard API로 이미지 복사 시도
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          toast.success("이미지가 클립보드에 복사되었습니다!\n인스타그램에서 붙여넣기 하세요 📋");
          return;
        } catch (clipError) {
          console.log('Clipboard failed, downloading:', clipError);
        }
      }

      // 마지막 수단: 다운로드
      const link = document.createElement('a');
      link.download = `mbti-${mbtiType}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success("이미지가 다운로드되었습니다!\n갤러리에서 인스타그램 스토리에 올려주세요 📸");
    } catch (error) {
      console.error('공유 실패:', error);
      toast.error("공유에 실패했습니다. 스크린샷을 찍어서 공유해주세요!");
    }
  };

  const handleDownload = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `mbti-result-${mbtiType}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("결과가 저장되었습니다!");
    } catch (error) {
      console.error('다운로드 실패:', error);
      toast.error("다운로드에 실패했습니다.");
    }
  };

  const handleGenerateImages = async () => {
    setIsGeneratingImages(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-mbti-image', {
        body: { mbtiType, description }
      });

      if (error) throw error;
      
      if (data?.images && Array.isArray(data.images)) {
        setGeneratedImages(data.images);
        toast.success("이미지가 생성되었습니다!");
      } else {
        throw new Error('이미지 생성 실패');
      }
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      toast.error("이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 결과 카드 */}
        <motion.div
          ref={resultRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-12 backdrop-blur-xl bg-card border-2">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-16 h-16 text-primary" />
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {mbtiType}
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {description.title}
              </h2>
              
              <p className="text-lg text-muted-foreground">
                {description.subtitle}
              </p>
            </motion.div>

            <div className="space-y-6">
              {/* 기질 분석 그래프 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">기질 분석</h3>
                </div>
                <div className="space-y-4">
                  {dimensions.map((dim, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{dim.left}</span>
                          <span className="text-muted-foreground">{dim.leftLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{dim.rightLabel}</span>
                          <span className="font-bold text-primary">{dim.right}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="flex h-8 rounded-full overflow-hidden bg-muted">
                          <div 
                            className="bg-gradient-to-r from-primary to-primary/80 flex items-center justify-start pl-3 text-white font-extrabold text-lg"
                            style={{ width: `${dim.leftPercent}%` }}
                          >
                            {dim.leftPercent > 15 && `${dim.leftPercent}%`}
                          </div>
                          <div 
                            className="bg-gradient-to-l from-accent to-accent/80 flex items-center justify-end pr-3 text-white font-extrabold text-lg"
                            style={{ width: `${dim.rightPercent}%` }}
                          >
                            {dim.rightPercent > 15 && `${dim.rightPercent}%`}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 기본 설명 */}
              <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-lg leading-relaxed">
                  {description.description}
                </p>
              </div>

              {/* AI 이미지 생성 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold">AI가 그린 나의 성격</h3>
                  </div>
                  {!generatedImages.length && (
                    <Button
                      onClick={handleGenerateImages}
                      disabled={isGeneratingImages}
                      size="sm"
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      {isGeneratingImages ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          생성중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          이미지 생성
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {generatedImages.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="rounded-xl overflow-hidden border-2 border-primary/20"
                      >
                        <img 
                          src={image} 
                          alt={`${mbtiType} 특성 이미지 ${index + 1}`}
                          className="w-full h-auto"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
                {!generatedImages.length && !isGeneratingImages && (
                  <div className="p-8 rounded-xl bg-muted/50 border border-border text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      AI가 당신의 성격 특성을 시각적으로 표현합니다
                    </p>
                  </div>
                )}
              </div>

              {/* 강점 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-green-500" />
                  <h3 className="text-xl font-bold">강점</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {description.strengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {strength}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 약점 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xl font-bold">개선 포인트</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {description.weaknesses.map((weakness, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"
                    >
                      <p className="font-medium text-orange-600 dark:text-orange-400">
                        {weakness}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 추천 직업 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-bold">추천 직업</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {description.careers.map((career, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium"
                    >
                      {career}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* 연애 스타일 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <h3 className="text-xl font-bold">연애 스타일</h3>
                </div>
                <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <p className="text-pink-600 dark:text-pink-400 leading-relaxed">
                    {description.loveStyle}
                  </p>
                </div>
              </div>

              {/* 궁합 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-xl font-bold">이상적인 궁합</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {description.compatibility.map((type, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-lg"
                    >
                      {type}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* 유명인 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-xl font-bold">같은 유형의 유명인</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {description.celebrities.map((celebrity, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium"
                    >
                      {celebrity}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* 스트레스 대처 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h3 className="text-xl font-bold">스트레스 받을 때</h3>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-600 dark:text-red-400 leading-relaxed">
                    {description.whenStressed}
                  </p>
                </div>
              </div>

              {/* AI 분석 */}
              {aiAnalysis && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <h3 className="text-xl font-bold">AI 심층 분석</h3>
                  </div>
                  <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="leading-relaxed whitespace-pre-line">
                      {aiAnalysis}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* 바이럴 공유 섹션 */}
        <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              친구들에게 공유하기
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              "이거 어디서 했어?" 친구들이 물어볼 거예요! 🔥
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {/* 이미지 저장 */}
            <Button
              onClick={handleDownload}
              className="flex-col h-auto py-3 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Download className="w-5 h-5 mb-1" />
              <span className="text-[10px]">이미지 저장</span>
            </Button>

            {/* 카카오톡 */}
            <Button
              onClick={() => {
                const message = `🎯 나의 성격유형은 ${mbtiType}!\n\n${description.title}\n${description.subtitle}\n\n🔗 너도 해봐: ${window.location.origin}/assessment/16-personality\n\n#성격유형 #성격테스트 #AIHPRO`;
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                  window.location.href = `kakaotalk://send?text=${encodeURIComponent(message)}`;
                } else {
                  navigator.clipboard.writeText(message);
                  toast.success("카카오톡에 붙여넣기 하세요! 💬");
                }
              }}
              className="flex-col h-auto py-3 bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              <MessageCircle className="w-5 h-5 mb-1" />
              <span className="text-[10px]">카카오톡</span>
            </Button>

            {/* 인스타그램 */}
            <Button
              onClick={handleShare}
              className="flex-col h-auto py-3 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90"
            >
              <Instagram className="w-5 h-5 mb-1" />
              <span className="text-[10px]">인스타</span>
            </Button>

            {/* 공유하기 */}
            <Button
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: `나는 ${mbtiType} - ${description.title}`,
                      text: `${description.subtitle}\n\n나도 테스트해보기!`,
                      url: `${window.location.origin}/assessment/16-personality`,
                    });
                  } catch (error) {
                    console.log('공유 취소됨');
                  }
                } else {
                  navigator.clipboard.writeText(`${window.location.origin}/assessment/16-personality`);
                  toast.success("링크가 복사되었습니다!");
                }
              }}
              variant="outline"
              className="flex-col h-auto py-3"
            >
              <Share2 className="w-5 h-5 mb-1" />
              <span className="text-[10px]">더보기</span>
            </Button>
          </div>

          {/* 링크 복사 */}
          <Button
            onClick={() => {
              const message = `🎯 ${mbtiType} - ${description.title}\n${description.subtitle}\n\n테스트 해보기 👉 ${window.location.origin}/assessment/16-personality`;
              navigator.clipboard.writeText(message);
              toast.success("결과가 복사되었습니다! 친구에게 공유하세요 💌");
            }}
            variant="outline"
            className="w-full mb-3"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            결과 링크 복사하기
          </Button>

          {/* 다시하기 버튼 */}
          <Button
            variant="ghost"
            onClick={onRestart}
            className="w-full"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 테스트하기
          </Button>
        </Card>

        {/* 바이럴 유도 메시지 */}
        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <p className="text-sm">
            💡 <strong>친구도 테스트하면</strong> 서로 결과 비교할 수 있어요!
          </p>
        </div>

        {/* 추가 테스트 유도 */}
        <Card className="p-6 text-center backdrop-blur-xl bg-card">
          <h3 className="text-xl font-bold mb-2">더 자세한 성격 분석이 궁금하다면?</h3>
          <p className="text-muted-foreground mb-4">
            프리미엄 검사로 더욱 정확한 심리 분석을 받아보세요
          </p>
          <Button
            onClick={() => window.location.href = '/premium-assessment'}
            className="bg-gradient-to-r from-primary to-accent"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            프리미엄 검사 하러가기
          </Button>
        </Card>
      </div>
    </div>
  );
};
