import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Building2, Gift, Brain, TrendingUp, Bell, FileText } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import MindTrackCheckoutHero from "@/components/pricing/MindTrackCheckoutHero";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productParam = searchParams.get("product");
  const isMindTrack = productParam === "mind_track_30";
  const { t } = useTranslation();
  const { localePath } = useLanguage();
  const p = t.pricingPage;

  const freeFeatures = [
    { icon: FileText, label: p.freeFeature1, description: p.freeFeature1Desc },
    { icon: Brain, label: p.freeFeature2, description: p.freeFeature2Desc },
    { icon: TrendingUp, label: p.freeFeature3, description: p.freeFeature3Desc },
    { icon: Bell, label: p.freeFeature4, description: p.freeFeature4Desc },
  ];

  return (
    <>
      <SEOHead
        title="요금제 · 30일 마음 챌린지 ₩19,900"
        description="가입은 무료, 검사는 모두 무료. 깊은 변화는 30일 마음 챌린지 한 가지 상품으로."
        keywords="30일 챌린지, 마음 건강, 무료 검사, AI 분석"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
        <section className="container mx-auto px-4 pt-24 md:pt-28 pb-16">
          {/* 30일 챌린지 = 메인 상품. mind_track 쿼리가 없어도 항상 노출 */}
          <MindTrackCheckoutHero />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            id="other-plans"
            className="text-center mb-12 mt-20 scroll-mt-24"
          >
            <Badge className="mb-4 bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
              <Gift className="w-3 h-3 mr-1" />
              {p.badge}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              가입은 무료, 검사도 모두 무료
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              회원가입만 해도 모든 검사·결과 리포트·관찰 기록을 무료로 사용할 수 있어요.
              <br />깊은 변화가 필요할 때 <strong className="text-foreground">30일 챌린지</strong> 단 하나를 선택하세요.
            </p>
          </motion.div>

          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  무료 멤버
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700">{p.freePlanForever}</Badge>
                </CardTitle>
                <CardDescription className="text-base">
                  카드 등록 없이 지금 바로 시작
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-green-600">₩0</span>
                  <span className="text-muted-foreground ml-2">{p.freePlanPriceLabel}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {freeFeatures.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{feature.label}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate(localePath("/auth"))}
                >
                  무료로 가입하기
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* B2B */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-2">{p.b2bBadge}</Badge>
              <h2 className="text-2xl font-bold">{p.b2bTitle}</h2>
              <p className="text-muted-foreground">{p.b2bSubtitle}</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">기관 도입 문의</CardTitle>
                      <CardDescription>학교·상담센터·복지기관 맞춤 견적</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /><span className="text-sm">기관 전용 대시보드 + 다중 사용자 관리</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /><span className="text-sm">화이트라벨 리포트 PDF 발급</span></li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5" /><span className="text-sm">단체 30일 챌린지 라이선스</span></li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={() => navigate(localePath("/contact"))}>
                    상담 요청하기
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="py-12">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">30일 후, 다른 사람이 되어 있을 거예요</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  매일 5분, 임상 통계 기반 워크북과 함께하는 마음 변화 프로그램.
                  <br />단 한 번의 결제로 평생의 베이스라인을 만드세요.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    30일 챌린지 시작하기 · ₩19,900
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate(localePath("/auth"))}
                  >
                    먼저 무료로 둘러보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
