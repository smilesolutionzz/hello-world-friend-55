import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Download, RefreshCw, Sparkles, Heart, Zap, Target, TrendingUp, BarChart3 } from "lucide-react";
import { getMBTIDescription, MBTIPercentages } from "./mbtiCalculator";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { useRef } from "react";

interface MBTIResultProps {
  mbtiType: string;
  aiAnalysis: string;
  percentages: MBTIPercentages;
  onRestart: () => void;
}

export const MBTIResult = ({ mbtiType, aiAnalysis, percentages, onRestart }: MBTIResultProps) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const description = getMBTIDescription(mbtiType);

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
        backgroundColor: '#1a1f2e',
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

      // Web Share API로 이미지 공유 (모바일에서 인스타그램 스토리 등으로 공유 가능)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `나는 ${mbtiType} - ${description.title}`,
          text: `${description.subtitle}\n당신도 테스트해보세요!`,
          files: [file]
        });
        toast.success("공유가 완료되었습니다!");
      } else if (navigator.share) {
        // 파일 공유를 지원하지 않는 경우 링크만 공유
        await navigator.share({
          title: `나는 ${mbtiType} - ${description.title}`,
          text: `${description.subtitle}\n당신도 테스트해보세요!`,
          url: window.location.href
        });
      } else {
        // Web Share API를 지원하지 않는 경우 다운로드
        const link = document.createElement('a');
        link.download = `mbti-${mbtiType}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success("이미지가 다운로드되었습니다!");
      }
    } catch (error) {
      console.error('공유 실패:', error);
      toast.error("공유에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDownload = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#1a1f2e',
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
          <Card className="p-8 md:p-12 backdrop-blur-xl bg-card/50 border-2">
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

        {/* 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            size="lg"
            onClick={handleShare}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Share2 className="w-4 h-4 mr-2" />
            인스타 스토리 공유
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            이미지 저장
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onRestart}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 하기
          </Button>
        </div>

        {/* 추가 테스트 유도 */}
        <Card className="p-6 text-center backdrop-blur-xl bg-card/50">
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
