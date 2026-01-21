import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import Footer from "@/components/ui/footer";
import SEOHead from "@/components/common/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, User, Baby, HeartPulse, Lock, Crown } from "lucide-react";
import { AdultReportContent } from "@/components/sample-reports/AdultReportContent";
import { ChildReportContent } from "@/components/sample-reports/ChildReportContent";
import { SeniorReportContent } from "@/components/sample-reports/SeniorReportContent";
import { useSubscription } from "@/hooks/useSubscription";
import { CashBalanceDisplay } from "@/components/paywall/CashBalanceDisplay";
import { BlurredContent } from "@/components/paywall/BlurredContent";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SampleReport = () => {
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const isPremium = isPremiumUser() || isLifetimeUser();
  const navigate = useNavigate();
  
  return (
    <>
      <SEOHead
        title="종합 심리 리포트 예시 - AIHumanPro"
        description="AI와 전문가가 함께 만드는 초개인화 종합 심리 분석 리포트 예시를 확인해보세요."
        keywords="심리리포트,AI심리분석,개인화리포트,정신건강리포트,심리검사결과,아동발달평가"
      />

      <div className="min-h-screen bg-background">
        <UnifiedNavigation />

        <main className="container mx-auto px-4 py-12 max-w-5xl">
          {/* 캐시 잔액 표시 */}
          <div className="mb-6">
            <CashBalanceDisplay />
          </div>
          
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">초개인화 AI 리포트 예시</span>
              {isPremium && (
                <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              종합 분석 리포트 샘플
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              성인 심리, 아동 발달, 노인 건강 평가의 실제 리포트 예시를 확인해보세요
            </p>
            
            {!isPremium && (
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-center gap-2 text-amber-800 mb-2">
                  <Lock className="w-5 h-5" />
                  <span className="font-semibold">전체 리포트는 프리미엄 전용입니다</span>
                </div>
                <p className="text-sm text-amber-700 mb-3">
                  샘플의 일부만 미리보기로 제공됩니다. 전체 리포트를 확인하려면 프리미엄 구독이 필요합니다.
                </p>
                <Button 
                  onClick={() => navigate('/token-purchase?type=subscription&id=premium_pass')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  프리미엄 구독하기
                </Button>
              </div>
            )}
          </div>

          {/* Accordion for Report Types */}
          <Accordion type="single" collapsible className="mb-8">
            {/* 아동 발달 리포트 */}
            <AccordionItem value="child" className="border border-secondary/20 rounded-lg mb-4 px-6 bg-gradient-to-br from-secondary/5 to-background">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 shrink-0">
                    <Baby className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">아동 발달 평가 리포트</h2>
                    <p className="text-sm text-muted-foreground mt-1">종합 발달 검사 결과 및 양육 가이드 (박○○, 만 5세 3개월)</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <BlurredContent
                  title="아동 발달 평가 리포트"
                  description="전체 아동 발달 평가 리포트를 확인하려면 프리미엄 구독이 필요합니다."
                  requiredCash={15000}
                >
                  <ChildReportContent />
                </BlurredContent>
              </AccordionContent>
            </AccordionItem>

            {/* 성인 리포트 */}
            <AccordionItem value="adult" className="border border-primary/20 rounded-lg mb-4 px-6 bg-gradient-to-br from-primary/5 to-background">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">성인 종합 심리 리포트</h2>
                    <p className="text-sm text-muted-foreground mt-1">30일간의 데이터 기반 심층 분석 (김○○ 님, 가명)</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <BlurredContent
                  title="성인 종합 심리 리포트"
                  description="전체 성인 심리 리포트를 확인하려면 프리미엄 구독이 필요합니다."
                  requiredCash={15000}
                >
                  <AdultReportContent />
                </BlurredContent>
              </AccordionContent>
            </AccordionItem>

            {/* 노인 건강 리포트 */}
            <AccordionItem value="senior" className="border border-primary/20 rounded-lg px-6 bg-gradient-to-br from-primary/5 to-background">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                    <HeartPulse className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">노인 건강 종합 리포트</h2>
                    <p className="text-sm text-muted-foreground mt-1">인지·건강 평가 및 맞춤 관리 계획 (이○○ 님, 만 72세)</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-6">
                <BlurredContent
                  title="노인 건강 종합 리포트"
                  description="전체 노인 건강 리포트를 확인하려면 프리미엄 구독이 필요합니다."
                  requiredCash={15000}
                >
                  <SeniorReportContent />
                </BlurredContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center text-sm text-muted-foreground space-y-2 mt-12">
            <p>
              * 본 리포트는 AI 분석 기반 예시이며, 실제 리포트는 개인의 데이터에 따라 다르게 생성됩니다.
            </p>
            <p>
              * 의학적 진단이나 치료를 대체할 수 없으며, 필요시 전문의 상담을 받으시기 바랍니다.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SampleReport;