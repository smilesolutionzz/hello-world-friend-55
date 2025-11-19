import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, ExternalLink, Zap } from "lucide-react";

export const MakeOneProjectBanner = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-6 h-6" />
              <h3 className="text-xl font-bold">당신의 아이디어를 AI가 실현합니다</h3>
            </div>
            <p className="text-white/90 mb-4">
              권리금 산정부터 마케팅 자동화까지, 7일이면 충분합니다
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                <Zap className="w-4 h-4" />
                <span>7일 완성</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                <Zap className="w-4 h-4" />
                <span>개발지식 불필요</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                <Zap className="w-4 h-4" />
                <span>990,000원</span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-white/90"
              onClick={() => window.open('https://youchancemvp.com?ref=highlight', '_blank')}
            >
              무료 분석 받기
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center">
              <Rocket className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
