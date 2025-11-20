import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Sparkles } from "lucide-react";

interface MemoryLegacyRecommendationProps {
  show: boolean;
  onDismiss: () => void;
}

export const MemoryLegacyRecommendation = ({ show, onDismiss }: MemoryLegacyRecommendationProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <Card className="max-w-md w-full bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/90 dark:to-blue-950/90 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full mb-3">
              <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              관찰일지가 저장되었어요!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              소중한 기록을 더 오래 보관하고 싶으신가요?
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-2 text-sm">💝 나만의 일기를 책으로 만들기</h4>
            <ul className="text-xs text-muted-foreground space-y-1 mb-3">
              <li>✓ 관찰일지를 영구 보존</li>
              <li>✓ AI가 자동으로 챕터 구성</li>
              <li>✓ 아름다운 책으로 완성</li>
              <li>✓ 가족에게 물려줄 소중한 유산</li>
            </ul>
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-2 text-xs">
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                🎁 특별 혜택: 
              </span>
              <span className="text-purple-600 dark:text-purple-400">
                HIGHLIGHT 회원 20% 할인
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onDismiss}
            >
              나중에
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => {
                window.open('https://memolegacy.com?ref=highlight', '_blank');
                onDismiss();
              }}
            >
              알아보기
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
