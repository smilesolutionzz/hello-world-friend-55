import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Building2, Users, Zap, Crown, Gift, Shield, Brain, TrendingUp, Bell, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/common/SEOHead";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useTranslation } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { localePath } = useLanguage();
  const p = t.pricingPage;

  const freeFeatures = [
    { icon: FileText, label: p.freeFeature1, description: p.freeFeature1Desc },
    { icon: Brain, label: p.freeFeature2, description: p.freeFeature2Desc },
    { icon: TrendingUp, label: p.freeFeature3, description: p.freeFeature3Desc },
    { icon: Bell, label: p.freeFeature4, description: p.freeFeature4Desc },
  ];

  const premiumPlans = [
    {
      id: "premium_basic",
      name: p.premiumBasicName,
      icon: Sparkles,
      description: p.premiumBasicDesc,
      price: p.premiumBasicPrice,
      highlight: false,
      badge: null as string | null,
      features: p.premiumBasicFeatures,
      notIncluded: p.premiumBasicNotIncluded,
      cta: p.premiumBasicCta,
    },
    {
      id: "premium_plus",
      name: p.premiumPlusName,
      icon: Crown,
      description: p.premiumPlusDesc,
      price: p.premiumPlusPrice,
      highlight: true,
      badge: p.premiumPlusBadge,
      features: p.premiumPlusFeatures,
      notIncluded: [] as readonly string[],
      cta: p.premiumPlusCta,
    },
  ];

  const expertFees = [
    { type: p.expertFee1Type, fee: p.expertFee1Amount, description: p.expertFee1Desc },
    { type: p.expertFee2Type, fee: p.expertFee2Amount, description: p.expertFee2Desc },
    { type: p.expertFee3Type, fee: p.expertFee3Amount, description: p.expertFee3Desc },
  ];

  const b2bPlans = [
    {
      id: "institution_basic",
      name: p.b2bBasicName,
      icon: Building2,
      description: p.b2bBasicDesc,
      price: p.b2bBasicPrice,
      period: p.wonPerMonth.includes('month') ? 'mo' : '월',
      features: p.b2bBasicFeatures,
    },
    {
      id: "institution_pro",
      name: p.b2bProName,
      icon: Shield,
      description: p.b2bProDesc,
      price: p.b2bProPrice,
      period: "",
      features: p.b2bProFeatures,
    },
  ];

  const handlePlanSelect = (planId: string) => {
    if (planId.includes("institution")) {
      navigate(localePath("/contact"));
    } else {
      navigate(localePath("/auth"));
    }
  };

  return (
    <>
      <SEOHead
        title={p.seoTitle}
        description={p.seoDesc}
        keywords="free, premium, subscription, AI analysis, expert consultation"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
              <Gift className="w-3 h-3 mr-1" />
              {p.badge}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {p.headline}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {p.subtitle1} <strong className="text-foreground">{p.subtitleBold}</strong>{p.subtitle2}<br />
              {p.subtitle3}
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
                  {p.freePlanTitle}
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700">{p.freePlanForever}</Badge>
                </CardTitle>
                <CardDescription className="text-base">
                  {p.freePlanNoCard}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-green-600">{p.freePlanPrice}</span>
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
                  {p.startFreeBtn}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Premium Plans */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-2">{p.premiumSectionTitle}</h2>
            <p className="text-muted-foreground text-center mb-8">{p.premiumSectionSubtitle}</p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {premiumPlans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card 
                      className={`relative h-full transition-all duration-300 hover:shadow-xl ${
                        plan.highlight 
                          ? "border-primary shadow-lg ring-2 ring-primary/20" 
                          : "hover:border-primary/50"
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                          {plan.badge}
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${
                          plan.highlight ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Icon className={`w-7 h-7 ${plan.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground"> {p.wonPerMonth}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {plan.notIncluded.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2">{t.tokenSubscription.notIncluded}:</p>
                            <ul className="space-y-1">
                              {plan.notIncluded.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <X className="w-3 h-3" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={plan.highlight ? "default" : "outline"}
                          size="lg"
                          onClick={() => handlePlanSelect(plan.id)}
                        >
                          {plan.cta}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Expert Fees */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  {p.expertFeeSectionTitle}
                </CardTitle>
                <CardDescription>{p.expertFeeSectionDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {expertFees.map((fee, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-background/50 text-center">
                      <p className="font-semibold text-lg text-purple-600">{fee.fee}</p>
                      <p className="font-medium text-sm mt-1">{fee.type}</p>
                      <p className="text-xs text-muted-foreground">{fee.description}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  {p.expertFeeNote}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* B2B */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-2">{p.b2bBadge}</Badge>
              <h2 className="text-2xl font-bold">{p.b2bTitle}</h2>
              <p className="text-muted-foreground">{p.b2bSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {b2bPlans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          {plan.period && <span className="text-muted-foreground"> {p.wonPerMonth}</span>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handlePlanSelect(plan.id)}
                        >
                          {plan.id === "institution_pro" ? p.requestConsultation : t.common.startNow}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">{p.comparisonTitle}</h2>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">{p.compFeature}</th>
                      <th className="text-center p-4 font-medium text-green-600">{p.compFree}</th>
                      <th className="text-center p-4 font-medium">{p.compPremium}</th>
                      <th className="text-center p-4 font-medium bg-primary/5">{p.compPremiumPlus}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">{p.compObservation}</td>
                      <td className="text-center p-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center p-4 bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">{p.compAIReport}</td>
                      <td className="text-center p-4 text-muted-foreground">{p.compAIReportFree}</td>
                      <td className="text-center p-4">{p.compUnlimited}</td>
                      <td className="text-center p-4 bg-primary/5">{p.compUnlimited}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">{p.compDevAnalysis}</td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                      <td className="text-center p-4 bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">{p.compExpert}</td>
                      <td className="text-center p-4 text-muted-foreground">{p.compExpertFree}</td>
                      <td className="text-center p-4 text-muted-foreground">{p.compExpertPremium}</td>
                      <td className="text-center p-4 bg-primary/5">{p.compExpertPlus}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">{p.compCrisis}</td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4 bg-primary/5"><Check className="w-4 h-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4">{p.compExpertDiscount}</td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-4 h-4 text-muted-foreground mx-auto" /></td>
                      <td className="text-center p-4 bg-primary/5">{p.compExpertDiscountPlus}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">{p.ctaTitle}</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  {p.ctaSubtitle1}<br />
                  {p.ctaSubtitle2}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => navigate(localePath("/auth"))}
                  >
                    {p.ctaFreeBtn}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate(localePath("/token-subscription"))}
                  >
                    {p.ctaPremiumBtn}
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
