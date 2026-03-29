import React, { useState } from 'react';
import SEOHead from '@/components/common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, Brain, Heart, Target, Gift, Crown, Lock, ImageIcon, ArrowLeft } from 'lucide-react';
import { VisualCounselingUpload } from '@/components/ai-analysis/VisualCounselingUpload';
import { useTranslation } from '@/i18n/useTranslation';

const FreeTrialAssessment = () => {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showVisualAnalysis, setShowVisualAnalysis] = useState(false);
  const { t } = useTranslation();
  const f = t.freeTrialPage;

  const freeTests = [
    {
      id: 'basic-mental-health',
      title: f.basicMentalTitle,
      subtitle: f.basicMentalSubtitle,
      description: f.basicMentalDesc,
      duration: '3-5min',
      questions: 15,
      icon: Brain,
      gradient: 'from-blue-500 to-purple-600',
      badge: f.basicMentalBadge,
      route: '/assessment/mental-health-quick-test'
    },
    {
      id: 'stress-check',
      title: f.stressTitle,
      subtitle: f.stressSubtitle,
      description: f.stressDesc,
      duration: '4-6min',
      questions: 20,
      icon: Heart,
      gradient: 'from-red-500 to-pink-600',
      badge: f.stressBadge,
      route: '/assessment/stress-test'
    },
  ];

  const premiumTests = [
    { id: 'comprehensive', title: f.premiumTitle, description: f.premiumDesc, tokens: 8, locked: true },
    { id: 'adhd-screening', title: f.adhdTitle, description: f.adhdDesc, tokens: 12, locked: true },
    { id: 'depression-anxiety', title: f.depressionTitle, description: f.depressionDesc, tokens: 10, locked: true },
    {
      id: 'past-life-job', title: f.pastLifeTitle, subtitle: f.pastLifeSubtitle,
      description: f.pastLifeDesc, duration: '3-5min', questions: 12,
      icon: Crown, gradient: 'from-amber-500 to-orange-600', badge: f.pastLifeBadge,
      route: '/assessment/past-life-job-test'
    }
  ];

  const handleTestStart = (testId: string, route: string) => {
    setSelectedTest(testId);
    navigate(route);
  };

  if (showVisualAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => setShowVisualAnalysis(false)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />{f.backBtn}
          </Button>
          <VisualCounselingUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/40 to-purple-500/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-purple-400/40 to-pink-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
        <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-gradient-to-tr from-pink-400/40 to-orange-400/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-64 h-64 border-2 border-purple-300/30 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-80 h-80 border-2 border-blue-300/30 rounded-full"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl p-4 relative z-10">
        {/* Hero */}
        <section className="pt-16 pb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
              <Gift className="w-6 h-6" />
              <h1 className="text-2xl font-bold">{f.heroTitle}</h1>
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">{f.heroSubtitle}</p>
            
            <div className="relative overflow-hidden rounded-2xl p-8 mt-6 max-w-4xl mx-auto bg-white shadow-2xl border-2 border-purple-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50"></div>
              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-6">
                  <div className="text-3xl">💎</div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">{f.freeVsPro}</h3>
                    <p className="text-gray-600">{f.freeVsProSubtitle}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 rounded-xl bg-white border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">FREE</div>
                      <h4 className="font-bold text-lg text-gray-700">{f.freeLabel}</h4>
                    </div>
                    <ul className="text-gray-600 space-y-3">
                      <li className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-400 rounded-full"></div>{f.freeItem1}</li>
                      <li className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-400 rounded-full"></div>{f.freeItem2}</li>
                      <li className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-400 rounded-full"></div>{f.freeItem3}</li>
                    </ul>
                  </div>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">PRO</div>
                        <h4 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{f.proLabel}</h4>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2"><div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div><span className="font-semibold text-blue-700">{f.proItem1}</span></li>
                        <li className="flex items-center gap-2"><div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div><span className="font-semibold text-purple-700">{f.proItem2}</span></li>
                        <li className="flex items-center gap-2"><div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"></div><span className="font-semibold text-pink-700">{f.proItem3}</span></li>
                        <li className="flex items-center gap-2"><div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div><span className="font-semibold text-blue-700">{f.proItem4}</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
                  <p className="text-sm text-amber-900 text-center font-medium">{f.upgradeBanner}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free Tests */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">{f.freeTestsTitle}</h2>
            <p className="text-gray-600">{f.freeTestsSubtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {freeTests.map((test) => {
              const IconComponent = test.icon;
              return (
                <Card key={test.id} className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 border-gray-200 bg-white">
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-green-500 text-white font-bold px-3 py-1.5">{test.badge}</Badge>
                  </div>
                  <div className={`bg-gradient-to-r ${test.gradient} p-6 pr-16 text-white relative`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg"><IconComponent className="w-6 h-6" /></div>
                        <div>
                          <CardTitle className="text-lg font-bold">{test.title}</CardTitle>
                          <p className="text-sm opacity-90">{test.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">{test.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" />{test.duration}</div>
                      <div className="text-muted-foreground">{test.questions} {f.items}</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">{f.scoreAnalysis}</p>
                        <p>{f.scoreUpgrade}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleTestStart(test.id, test.route)} className={`w-full bg-gradient-to-r ${test.gradient} hover:opacity-90`}>
                      {f.freeStartBtn}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Visual Analysis Card */}
            <Card className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-2 border-purple-200 bg-white cursor-pointer" onClick={() => setShowVisualAnalysis(true)}>
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-purple-500 text-white font-bold px-3 py-1.5">{f.visualBadge}</Badge>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 pr-16 text-white relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg"><ImageIcon className="w-6 h-6" /></div>
                    <div>
                      <CardTitle className="text-lg font-bold">{f.visualTitle}</CardTitle>
                      <p className="text-sm opacity-90">Visual Material Analysis</p>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">{f.visualDesc}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" />3-5min</div>
                  <div className="text-muted-foreground">{f.visualMeta}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs text-purple-600">
                    <p className="font-medium mb-1">{f.visualAiContent}</p>
                    <p>{f.visualAiDesc}</p>
                  </div>
                </div>
                <Button onClick={() => setShowVisualAnalysis(true)} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90">
                  {f.visualStartBtn}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Deep Tests (Locked) */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 flex items-center justify-center gap-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              {f.deepTestTitle}
            </h2>
            <p className="text-gray-600">{f.deepTestSubtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {premiumTests.map((test) => (
              <Card key={test.id} className="relative overflow-hidden opacity-60 border-muted">
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-gray-500 text-white text-xs px-2 py-1">
                    <Lock className="w-2.5 h-2.5 mr-1" />
                    {(test as any).tokens}{f.tokenLabel}
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-600">{test.title}</h3>
                    <p className="text-sm text-gray-500">{test.description}</p>
                  </div>
                  <Button variant="outline" className="w-full border-2 border-dashed border-gray-300 text-gray-500" disabled>
                    {f.lockedBtn}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white rounded-3xl p-10 text-center shadow-2xl border-2 border-purple-200 max-w-5xl mx-auto">
          <Crown className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-4 text-gray-900">{f.ctaTitle}</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{f.ctaDesc}</p>
          
          <div className="bg-white/70 rounded-xl p-4 mb-6 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-600 flex items-center gap-2">{f.ctaFreeLabel}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {f.ctaFreeItems.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-blue-600 flex items-center gap-2">{f.ctaProLabel}</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  {f.ctaProItems.map((item, i) => <li key={i}>• <strong>{item}</strong></li>)}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button onClick={() => navigate('/token-subscription')} className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-white" size="lg">
              {f.ctaBtn}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1" size="lg">
              {f.ctaHomeBtn}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FreeTrialAssessment;
