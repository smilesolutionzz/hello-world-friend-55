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
              <span className="text-sm font-semibold text-primary">직접 작성</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-xl md:text-5xl font-bold text-foreground whitespace-nowrap">
                창립자 이수석의 손편지
              </h2>
              <ChevronDown 
                className={`w-6 h-6 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
            <p className="text-lg text-muted-foreground">
              2025년 12월, 한 해를 마무리하며
            </p>
          </div>

          {/* Letter Card - 아코디언 */}
          {isOpen && (
            <Card className="p-8 md:p-12 bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl animate-in slide-in-from-top-4 duration-500">
              <div className="prose prose-lg max-w-none">
                <div className="space-y-6 text-foreground/90 leading-relaxed">
                  <p className="text-xl font-medium text-primary">
                    2025년이 저물어갑니다.<br />
                    함께 걸어온 이 길을 돌아보며
                  </p>

                  <p className="text-base">
                    12월의 찬 공기가 느껴지는 요즘, 문득 올 한 해를 돌아봅니다. 
                    2025년은 AIHumanPro에게, 그리고 저에게 특별한 해였습니다. 
                    <span className="font-semibold text-primary">여러분과 함께 걸어온 이 여정이 
                    단순한 서비스 이상의 의미</span>를 갖게 되었기 때문입니다.
                  </p>

                  <p className="text-base">
                    처음 이 플랫폼을 구상할 때, 저는 한 가지 확신이 있었습니다. 
                    <span className="font-semibold text-primary">기술이 아무리 발전해도, 
                    사람의 마음을 이해하고 치유하는 것은 결국 사람의 손길이 필요하다</span>는 것이었습니다. 
                    그래서 우리는 AI와 전문가가 함께하는 길을 선택했습니다.
                  </p>

                  <p className="text-base">
                    올 한 해 동안 많은 분들이 자신의 이야기를 저희와 나누어주셨습니다. 
                    밤늦게까지 고민하던 부모님들, 자녀의 발달을 세심하게 관찰하시는 선생님들, 
                    자신의 마음 건강을 돌보려는 분들. <span className="font-semibold text-primary">
                    그 하나하나의 이야기가 모여 우리 플랫폼을 더욱 단단하게 만들었습니다.</span>
                  </p>

                  <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                    <p className="text-base font-medium italic">
                      "기술은 빠르게 변하지만,<br />
                      사람을 대하는 진심은 변하지 않습니다.<br />
                      이것이 AIHumanPro가 지켜갈 약속입니다."
                    </p>
                  </div>

                  <p className="text-base">
                    때로는 부족했고, 때로는 서툴렀습니다. 하지만 여러분의 피드백과 격려 덕분에 
                    한 걸음씩 앞으로 나아갈 수 있었습니다. <span className="font-semibold text-primary">
                    여러분이 보내주신 신뢰가 저희에게는 가장 큰 동력</span>이었습니다.
                  </p>

                  <p className="text-base">
                    다가오는 2026년에는 더 많은 분들께 실질적인 도움을 드리고 싶습니다.
                    AI 분석은 더욱 정교해지고, 전문가 네트워크는 더욱 확대될 것입니다. 
                    하지만 변하지 않을 것이 하나 있습니다. <span className="font-semibold text-primary">
                    한 분 한 분의 이야기에 귀 기울이고, 진심으로 돕고자 하는 우리의 마음</span>입니다.
                  </p>

                  <p className="text-base">
                    올 한 해 함께해주셔서 진심으로 감사합니다. 
                    추운 겨울, 따뜻한 마음으로 새해를 맞이하시길 바랍니다. 
                    2026년에도 여러분의 성장과 회복의 여정에 함께하겠습니다.
                  </p>

                  <p className="text-base">
                    언제나 여러분 곁에서, 함께 걷겠습니다.
                  </p>

                  <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-right text-foreground/70">
                      2025년 12월<br />
                      감사하는 마음을 담아,<br />
                      <span className="font-semibold text-primary text-lg">AIHumanPro 창립자 이수석</span>
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
              이수석칼럼 더보기
              <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderLetterSection;
