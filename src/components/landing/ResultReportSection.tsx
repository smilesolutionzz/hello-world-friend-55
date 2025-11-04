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
import bgImage from '@/assets/result-report-bg.jpg';

const ResultReportSection = () => {
  const [showModal, setShowModal] = useState(false);

  const handlePDFDownload = () => {
    const googleDriveUrl = "https://drive.google.com/file/d/17WD3mhW2T4TdkfxTzLpfH5bzFARxz_Vh/view?usp=drive_link";
    window.open(googleDriveUrl, '_blank');
  };

  // 점수에 따른 백분위 계산
  const calculatePercentile = (score: number) => {
    if (score >= 95) return '상위 1%';
    if (score >= 90) return '상위 5%';
    if (score >= 85) return '상위 15%';
    if (score >= 80) return '상위 25%';
    if (score >= 75) return '상위 35%';
    if (score >= 70) return '상위 45%';
    if (score >= 65) return '상위 55%';
    if (score >= 60) return '중위 50%';
    if (score >= 55) return '하위 45%';
    if (score >= 50) return '하위 40%';
    if (score >= 45) return '하위 35%';
    if (score >= 40) return '하위 30%';
    return '하위 20%';
  };

  const overallScore = 85;
  const percentile = calculatePercentile(overallScore);

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
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-background/95" />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            AI 분석 리포트
          </h2>
          <p className="text-xl text-foreground font-semibold max-w-2xl mx-auto">
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
                    <p className="text-foreground font-medium">{feature.description}</p>
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
            {/* Dramatic Header with Animation */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative z-10 text-white text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span className="font-bold">AI 딥러닝 분석 완료</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">김지우님의 심리 프로파일</h3>
                <p className="text-white/90">32세 • 직장인 • 2025년 11월 분석</p>
              </div>
            </div>

            {/* Overall Score - More Impressive */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <h3 className="font-bold text-2xl mb-6 text-foreground flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  종합 심리 건강 지수
                </h3>
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <div className="text-7xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      85
                    </div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">전체 평균 대비</span>
                        <span className="text-sm font-bold text-purple-600">{percentile}</span>
                      </div>
                      <Progress value={overallScore} className="h-3 bg-white/50" />
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-green-500/10 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        ✓ 양호
                      </div>
                      <div className="bg-blue-500/10 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        ↑ 지난달 대비 +7점
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Scores - Enhanced */}
            <div>
              <h3 className="font-bold text-2xl mb-6 text-foreground">🎯 6대 핵심 영역 분석</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5 bg-gradient-to-br from-green-50 via-green-100/50 to-emerald-50 border-2 border-green-200 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium">정서 안정성</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-green-600">92</p>
                        <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full font-bold">우수</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={92} className="h-2.5 bg-white/70" />
                  <p className="text-xs text-green-700 mt-2 font-medium">😊 감정 조절 능력이 뛰어납니다</p>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-blue-50 via-blue-100/50 to-cyan-50 border-2 border-blue-200 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium">인지 기능</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-blue-600">88</p>
                        <span className="text-xs bg-blue-500/20 text-blue-700 px-2 py-0.5 rounded-full font-bold">양호</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={88} className="h-2.5 bg-white/70" />
                  <p className="text-xs text-blue-700 mt-2 font-medium">🧠 집중력과 기억력이 우수합니다</p>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-50 border-2 border-purple-200 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Smile className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium">사회성 발달</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-purple-600">79</p>
                        <span className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-0.5 rounded-full font-bold">개선 가능</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={79} className="h-2.5 bg-white/70" />
                  <p className="text-xs text-purple-700 mt-2 font-medium">💬 대인관계 기술 향상 추천</p>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-orange-50 via-orange-100/50 to-amber-50 border-2 border-orange-200 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium">스트레스 관리</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-orange-600">81</p>
                        <span className="text-xs bg-orange-500/20 text-orange-700 px-2 py-0.5 rounded-full font-bold">양호</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={81} className="h-2.5 bg-white/70" />
                  <p className="text-xs text-orange-700 mt-2 font-medium">⚡ 적절한 스트레스 대처 중</p>
                </Card>
              </div>
            </div>

            {/* Risk Assessment - More Visual */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6">
              <h3 className="font-bold text-2xl mb-5 text-foreground flex items-center gap-2">
                <Activity className="w-6 h-6 text-slate-600" />
                AI 기반 위험도 평가
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">우울증 위험도</p>
                  <p className="text-2xl font-black text-green-600 mb-1">낮음</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-green-500 rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full"></div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">✓ 안전 범위</p>
                </Card>
                <Card className="p-4 border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-shadow">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">불안장애 위험도</p>
                  <p className="text-2xl font-black text-yellow-600 mb-1">보통</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full"></div>
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">⚠ 주의 관찰</p>
                </Card>
                <Card className="p-4 border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">ADHD 위험도</p>
                  <p className="text-2xl font-black text-green-600 mb-1">낮음</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-green-500 rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full"></div>
                  </div>
                  <p className="text-xs text-green-600 mt-2">✓ 정상 범위</p>
                </Card>
              </div>
            </div>

            {/* AI Recommendations - Premium Look */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-black/5"></div>
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-2xl mb-5 text-white flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  AI 맞춤 개선 플랜 (3개월)
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">🏃‍♂️ 운동 루틴 강화</p>
                        <p className="text-white/90 text-sm">주 3회 이상 30분 유산소 운동으로 스트레스 호르몬 감소 및 세로토닌 증가 기대</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">👥 소셜 스킬 트레이닝</p>
                        <p className="text-white/90 text-sm">그룹 활동 참여로 사회성 지수 79점 → 85점 이상 향상 가능 (예상 2개월)</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">📊 정기 체크인</p>
                        <p className="text-white/90 text-sm">3개월 후 재검사로 진행 상황 추적 및 새로운 개선 방향 제시</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Connection - Enhanced */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-foreground mb-2">🎯 AI 매칭 전문가 상담</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    분석 결과를 바탕으로 회원님에게 <span className="font-bold text-amber-600">가장 적합한 심리 전문가 3명</span>을 AI가 자동 매칭합니다
                  </p>
                  <div className="flex gap-2">
                    <div className="bg-white px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700">
                      ✓ 99.2% 만족도
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700">
                      ✓ 첫 상담 50% 할인
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 text-center border border-purple-200">
              <p className="text-sm text-muted-foreground">
                * 본 리포트는 <span className="font-bold text-purple-600">샘플 예시</span>입니다. 실제 리포트는 <span className="font-bold">더 상세한 그래프, 트렌드 분석, 맞춤형 솔루션</span>을 포함합니다
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ResultReportSection;
