import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FounderLetterSection = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header - 클릭 가능한 타이틀 */}
          <div 
            className="text-center mb-8 space-y-4 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">매달 업데이트</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                창립자의 손편지
              </h2>
              <ChevronDown 
                className={`w-6 h-6 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
            <p className="text-lg text-muted-foreground">
              2025년 10월, 여러분께 전하는 진심
            </p>
          </div>

          {/* Letter Card - 아코디언 */}
          {isOpen && (
            <Card className="p-8 md:p-12 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl animate-in slide-in-from-top-4 duration-500">
              <div className="prose prose-lg max-w-none">
                <div className="space-y-6 text-foreground/90 leading-relaxed">
                  <p className="text-xl font-medium text-primary">
                    피할 수 없는 AI 시대,<br />
                    하지만 결국 사람이 포함되고 터치되어야 합니다.
                  </p>

                  <p className="text-base">
                    우리는 지금 거대한 변화의 한가운데 서 있습니다. AI가 모든 것을 대체할 것만 같은 이 시대에, 
                    저는 오히려 더 큰 확신을 갖게 되었습니다. <span className="font-semibold text-primary">기술은 도구일 뿐, 
                    진정한 치유와 성장은 '사람'에게서 시작된다는 것을요.</span>
                  </p>

                  <p className="text-base">
                    AI하이라이트PRO는 단순한 AI 플랫폼이 아닙니다. 여러분의 일상 속 작은 순간들을 기록하고, 
                    그 데이터가 쌓여 <span className="font-semibold text-primary">초개인화된 종합 리포트</span>로 탄생합니다. 
                    하지만 여기서 멈추지 않습니다. 그 리포트는 반드시 <span className="font-semibold text-primary">전문가의 검토</span>를 거쳐, 
                    정확한 회복과 예방의 길로 안내됩니다.
                  </p>

                  <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                    <p className="text-base font-medium italic">
                      "AI는 여러분의 패턴을 발견하고,<br />
                      전문가는 여러분의 마음을 이해합니다.<br />
                      함께할 때, 비로소 진정한 변화가 시작됩니다."
                    </p>
                  </div>

                  <p className="text-base">
                    매일 수많은 분들이 이 플랫폼에서 자신의 이야기를 기록하고 있습니다. 
                    그 하나하나가 모여 의미 있는 변화를 만들어냅니다. 
                    <span className="font-semibold text-primary"> 여러분의 데이터는 단순한 숫자가 아닌, 
                    여러분만의 성장 스토리</span>가 됩니다.
                  </p>

                  <p className="text-base">
                    우리는 AI 시대를 피할 수 없습니다. 하지만 우리는 선택할 수 있습니다. 
                    <span className="font-semibold text-primary"> 기술이 사람을 대체하는 것이 아닌, 
                    사람을 더 깊이 이해하고 돕는 도구</span>로 만들어가는 것을요.
                  </p>

                  <p className="text-base">
                    여러분의 여정에 함께할 수 있어 진심으로 감사합니다. 
                    우리는 멈추지 않고 계속 발전하겠습니다. 여러분의 목소리에 귀 기울이며, 
                    더 나은 내일을 함께 만들어가겠습니다.
                  </p>

                  <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-right text-foreground/70">
                      진심을 담아,<br />
                      <span className="font-semibold text-primary text-lg">AI하이라이트PRO 창립자</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 더 많은 칼럼 보기 버튼 */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/column')}
              className="border-primary/30 hover:bg-primary/5"
            >
              창립자의 칼럼 더보기
              <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderLetterSection;
