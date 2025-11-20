import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Rocket, ExternalLink } from "lucide-react";

export const SisterServicesCard = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">✨</span>
        이런 서비스도 함께 이용해보세요
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Memory Legacy */}
        <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4 hover:shadow-lg transition-all">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">MEMORY LEGACY</h4>
              <p className="text-xs text-muted-foreground mb-2">
                가족의 추억을 영구 보존하고<br />아름다운 책으로 만들어보세요
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => window.open('https://memolegacy.com', '_blank')}
          >
            자세히 보기
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* AIHealthgrow */}
        <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4 hover:shadow-lg transition-all">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">AIHEALTHGROW</h4>
              <p className="text-xs text-muted-foreground mb-2">
                AI권리금산정<br />자동화마케팅
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => window.open('https://youchancemvp.com', '_blank')}
          >
            자세히 보기
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
