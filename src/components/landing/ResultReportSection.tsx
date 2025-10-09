import { BarChart3, Activity, TrendingUp, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ResultReportSection = () => {
  const [showModal, setShowModal] = useState(false);

  const features = [
    {
      icon: BarChart3,
      title: "상태 분석",
      description: "현재 심리 상태를 시각화"
    },
    {
      icon: Activity,
      title: "추이 그래프",
      description: "변화 양상을 한눈에"
    },
    {
      icon: TrendingUp,
      title: "예측 분석",
      description: "향후 경과 예측"
    },
    {
      icon: FileText,
      title: "맞춤 솔루션",
      description: "개인별 케어 플랜"
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A0E1A] mb-6">
            AI 리포트 & 데이터 해석
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            전문가 수준의 상세한 분석 결과
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Features */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4 items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#5E8FFF]/10 to-[#8FB9FF]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#5E8FFF]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0A0E1A] mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Visual Preview */}
          <Card className="relative p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-0 rounded-3xl shadow-2xl overflow-hidden">
            {/* Sample Chart Visualization */}
            <div className="aspect-square bg-white/60 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center">
              <div className="text-center space-y-4">
                <BarChart3 className="w-20 h-20 text-[#5E8FFF] mx-auto" />
                <p className="text-lg font-semibold text-[#0A0E1A]">리포트 미리보기</p>
                <Button 
                  onClick={() => setShowModal(true)}
                  className="bg-[#5E8FFF] hover:bg-[#4A7FEF] text-white rounded-xl"
                >
                  결과 예시 보기
                </Button>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5E8FFF]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          </Card>
        </div>
      </div>

      {/* Sample Report Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">AI 분석 리포트 샘플</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">종합 점수</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-[#5E8FFF]">85</div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] w-[85%]" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-green-50">
                <p className="text-sm text-gray-600 mb-1">정서 안정성</p>
                <p className="text-2xl font-bold text-green-600">양호</p>
              </Card>
              <Card className="p-4 bg-blue-50">
                <p className="text-sm text-gray-600 mb-1">스트레스 수준</p>
                <p className="text-2xl font-bold text-blue-600">보통</p>
              </Card>
            </div>
            
            <p className="text-sm text-gray-600 text-center">
              * 실제 리포트는 더 상세한 분석과 맞춤 솔루션을 포함합니다
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ResultReportSection;
