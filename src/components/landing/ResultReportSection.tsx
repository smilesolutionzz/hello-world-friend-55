import { BarChart3, Activity, TrendingUp, FileText, Download, Brain, Heart, Smile, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ResultReportSection = () => {
  const [showModal, setShowModal] = useState(false);

  const handlePDFDownload = () => {
    const googleDriveUrl = "https://drive.google.com/file/d/17WD3mhW2T4TdkfxTzLpfH5bzFARxz_Vh/view?usp=drive_link";
    window.open(googleDriveUrl, '_blank');
  };

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
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 whitespace-nowrap">
            AI 리포트 & 데이터 해석
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Visual Preview */}
          <Card className="relative p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-0 rounded-3xl shadow-2xl overflow-hidden">
            {/* Sample Chart Visualization */}
            <div className="aspect-square bg-card/60 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center">
              <div className="text-center space-y-4">
                <BarChart3 className="w-20 h-20 text-primary mx-auto" />
                <p className="text-lg font-semibold text-foreground">리포트 미리보기</p>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    결과 예시 보기
                  </Button>
                  <Button 
                    onClick={handlePDFDownload}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF 예시 보기
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          </Card>
        </div>
      </div>

      {/* Sample Report Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">AI 분석 리포트 샘플</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3 text-foreground">종합 건강 점수</h3>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-primary">85</div>
                <div className="flex-1">
                  <Progress value={85} className="h-4" />
                  <p className="text-sm text-muted-foreground mt-2">상위 15% 수준 · 양호</p>
                </div>
              </div>
            </div>
            
            {/* Detailed Scores by Category */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">영역별 상세 분석</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">정서 안정성</p>
                      <p className="text-xl font-bold text-green-600">92점</p>
                    </div>
                  </div>
                  <Progress value={92} className="h-2" />
                </Card>

                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">인지 기능</p>
                      <p className="text-xl font-bold text-blue-600">88점</p>
                    </div>
                  </div>
                  <Progress value={88} className="h-2" />
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Smile className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">사회성 발달</p>
                      <p className="text-xl font-bold text-purple-600">79점</p>
                    </div>
                  </div>
                  <Progress value={79} className="h-2" />
                </Card>

                <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">스트레스 관리</p>
                      <p className="text-xl font-bold text-orange-600">81점</p>
                    </div>
                  </div>
                  <Progress value={81} className="h-2" />
                </Card>
              </div>
            </div>

            {/* Risk Assessment */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">위험도 평가</h3>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 border-green-200 bg-green-50/50">
                  <p className="text-xs text-muted-foreground mb-1">우울증</p>
                  <p className="text-lg font-bold text-green-600">낮음</p>
                </Card>
                <Card className="p-3 border-yellow-200 bg-yellow-50/50">
                  <p className="text-xs text-muted-foreground mb-1">불안장애</p>
                  <p className="text-lg font-bold text-yellow-600">보통</p>
                </Card>
                <Card className="p-3 border-green-200 bg-green-50/50">
                  <p className="text-xs text-muted-foreground mb-1">ADHD</p>
                  <p className="text-lg font-bold text-green-600">낮음</p>
                </Card>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5">
              <h3 className="font-bold text-lg mb-3 text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                AI 맞춤 추천사항
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>스트레스 관리를 위한 주 3회 이상 규칙적인 운동을 권장합니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>사회성 향상을 위해 그룹 활동 참여를 고려해보세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>3개월 후 재검사를 통한 경과 관찰을 추천드립니다</span>
                </li>
              </ul>
            </div>

            {/* Expert Connection */}
            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">전문가 상담 연결</h4>
                  <p className="text-sm text-muted-foreground">
                    회원가입 후 AI 분석 결과를 바탕으로 심리 전문가와 1:1 상담이 가능합니다
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center pt-2">
              * 본 샘플은 예시이며, 실제 리포트는 개인별 맞춤 데이터와 더 상세한 분석을 포함합니다
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ResultReportSection;
