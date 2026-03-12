import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '@/i18n';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Heart, ArrowLeft, ExternalLink, Loader2, MessageCircle, Brain, Copy, Download, Share2, Instagram, Sparkles, Crown, Wallet, Lock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProductRecommendation from "@/components/ProductRecommendation";
import { useTestResultActions } from '@/hooks/useTestResultActions';
import { NextStepSuggestion } from '@/components/onboarding/NextStepSuggestion';
import { useShareText, formatPsychTestResult } from '@/utils/shareUtils';
import SocialShareButtons from '@/components/social/SocialShareButtons';
import VoiceFeature from '@/components/voice/VoiceFeature';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizedProductRecommendation } from '@/components/product/PersonalizedProductRecommendation';
import { ExpertConsultationNotice } from './ExpertConsultationNotice';
import { downloadResultAsPDF } from '@/utils/pdfDownload';
import { PDFHeader } from '@/components/common/PDFHeader';
import { useToast } from '@/hooks/use-toast';
import { ExpertMatchRecommendation } from './ExpertMatchRecommendation';
import { useAutoSaveTestResult } from '@/hooks/useAutoSaveTestResult';
import { CashBalanceDisplay } from '@/components/paywall/CashBalanceDisplay';
import { BlurredContent } from '@/components/paywall/BlurredContent';
import { useSubscription } from '@/hooks/useSubscription';

interface DepressionTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
    ageGroup?: string;
  };
  onBack: () => void;
  onRestart?: () => void;
}

// Helper to normalize severity for comparison (handles both EN and KO)
const normalizeSeverity = (severity: string): 'normal' | 'mild' | 'moderate' | 'severe' => {
  const s = severity.toLowerCase();
  if (s === '정상' || s === 'normal') return 'normal';
  if (s === '가벼운 우울' || s === 'mild depression') return 'mild';
  if (s === '중등도 우울' || s === 'moderate depression') return 'moderate';
  if (s === '심한 우울' || s === 'severe depression') return 'severe';
  return 'normal';
};

const DepressionTestResult = ({ results, onBack, onRestart }: DepressionTestResultProps) => {
  const navigate = useNavigate();
  const { total, average, severity, answers } = results;
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();
  const { shareAsText } = useShareText();
  const { isEnglish } = useLanguage();

  const sev = normalizeSeverity(severity);

  // 자동 저장 - AI 분석 포함
  useAutoSaveTestResult({
    testType: isEnglish ? 'Depression Test' : '우울증 검사',
    results: { total, average, answers },
    analysis: aiAnalysis,
    severity,
    ageGroup: results.ageGroup
  });
  
  const chartData = [
    {
      name: isEnglish ? 'Total' : '총점',
      value: total,
      fullMark: 42,
    }
  ];

  useEffect(() => {
    const getAIAnalysis = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('depression-analyzer', {
          body: { results, answers: results.answers }
        });
        if (error) throw error;
        if (data?.analysis) {
          setAiAnalysis(data.analysis);
        } else {
          setAiAnalysis(isEnglish ? "An error occurred while loading AI analysis. Showing basic analysis." : "AI 분석을 가져오는 중 오류가 발생했습니다. 기본 분석을 제공합니다.");
        }
      } catch (error) {
        console.error('AI analysis error:', error);
        setAiAnalysis(isEnglish ? "An error occurred while loading AI analysis. Showing basic analysis." : "AI 분석을 가져오는 중 오류가 발생했습니다. 기본 분석을 제공합니다.");
      } finally {
        setIsLoading(false);
      }
    };
    getAIAnalysis();
  }, [results]);

  const getSeverityColor = (sev: string) => {
    const n = normalizeSeverity(sev);
    switch (n) {
      case 'normal': return "bg-green-100 text-green-800 border-green-200";
      case 'mild': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'moderate': return "bg-orange-100 text-orange-800 border-orange-200";
      case 'severe': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const severityLabel = isEnglish
    ? { normal: 'Normal', mild: 'Mild Depression', moderate: 'Moderate Depression', severe: 'Severe Depression' }[sev]
    : { normal: '정상', mild: '가벼운 우울', moderate: '중등도 우울', severe: '심한 우울' }[sev];

  const handleShareText = () => {
    const formattedText = formatPsychTestResult('depression', results, aiAnalysis);
    shareAsText(formattedText, isEnglish ? 'Depression Level Check Result' : '우울감 수준 검사 결과');
  };

  const getRecommendation = () => {
    switch (sev) {
      case 'normal':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: isEnglish ? "Normal Range" : "정상 범위",
          description: isEnglish ? "Your depression symptoms are within normal range. You are maintaining a healthy mental state." : "현재 우울증상이 정상 범위에 있습니다. 건강한 정신상태를 유지하고 계십니다."
        };
      case 'mild':
        return {
          icon: <Heart className="w-6 h-6 text-yellow-600" />,
          title: isEnglish ? "Mild Depression" : "가벼운 우울증상",
          description: isEnglish ? "You have mild depression symptoms. Lifestyle changes and stress management can help improve symptoms." : "가벼운 우울증상이 있습니다. 생활습관 개선과 스트레스 관리를 통해 증상 완화가 가능합니다."
        };
      case 'moderate':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          title: isEnglish ? "Moderate Depression" : "중등도 우울증상",
          description: isEnglish ? "Moderate depression symptoms detected. Professional consultation is recommended, treatment may be needed." : "중등도 우울증상이 확인됩니다. 전문가와의 상담을 권장하며, 치료가 필요할 수 있습니다."
        };
      case 'severe':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          title: isEnglish ? "Severe Depression" : "심한 우울증상",
          description: isEnglish ? "Immediate professional help is needed. We strongly recommend consulting with a specialist." : "즉시 전문가의 도움이 필요합니다. 통합건강의학과 전문의와 상담받으시기를 적극 권장드립니다."
        };
      default:
        return {
          icon: <Heart className="w-6 h-6 text-gray-600" />,
          title: isEnglish ? "Assessment Complete" : "검사 완료",
          description: isEnglish ? "Assessment completed." : "검사가 완료되었습니다."
        };
    }
  };

  const recommendation = getRecommendation();
  const { toast } = useToast();

  const handlePDFDownload = async () => {
    await downloadResultAsPDF(
      'depression-result-content',
      isEnglish ? 'Depression_Check_Result' : '우울감_체크_결과',
      () => {
        toast({
          title: isEnglish ? "PDF Download Complete" : "PDF 다운로드 완료",
          description: isEnglish ? "Depression check result saved." : "우울감 체크 결과가 저장되었습니다.",
        });
      },
      (error) => {
        toast({
          title: isEnglish ? "Download Failed" : "다운로드 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    );
  };

  const localePath = (path: string) => isEnglish ? `/en${path}` : path;

  return (
    <div id="depression-result-content" className="space-y-4 md:space-y-6 px-4 md:px-0">
      <PDFHeader testName={isEnglish ? "Depression Check Result" : "우울감 체크 결과"} />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg -mx-4 px-4 py-3 border-b border-border/50 md:relative md:mx-0 md:px-0 md:py-0 md:bg-transparent md:border-0">
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-xs">{isEnglish ? 'Back' : '뒤로'}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePDFDownload} className="h-8 px-2">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-lg font-bold text-foreground">{isEnglish ? 'Depression Check Result' : '우울감 체크 결과'}</h1>
          <p className="text-xs text-muted-foreground">{isEnglish ? 'Self-assessment reference' : '참고용 자가 진단'}</p>
        </div>
        
        <div className="hidden md:flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? 'Back' : '뒤로가기'}
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-gradient">{isEnglish ? 'Depression Check Result (Reference)' : '우울감 체크 결과 (참고용)'}</h1>
          <Button variant="outline" onClick={handlePDFDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {isEnglish ? 'PDF Download' : 'PDF 다운로드'}
          </Button>
        </div>
      </div>

      {/* Legal notice */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
        <p className="text-blue-800 dark:text-blue-200 text-xs md:text-sm">
          <span className="font-semibold">📊 {isEnglish ? 'Reference Result' : '참고용 결과'}</span>
          <span className="hidden md:inline"><br />⚠️ {isEnglish ? 'This result is for reference only and is not a professional evaluation. Please consult a professional if you experience persistent difficulties.' : '이 결과는 참고용이며 전문적 평가가 절대 아닙니다. 지속적 어려움이 있으시면 반드시 전문가와 상담하세요.'}</span>
          <span className="md:hidden"> · {isEnglish ? 'Not a professional evaluation' : '전문 평가 아님'}</span>
        </p>
      </div>

      {/* Result summary */}
      <Card className="overflow-hidden">
        <div className={`p-3 md:p-4 ${getSeverityColor(severity)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {recommendation.icon}
              <div>
                <p className="text-[10px] md:text-xs font-medium opacity-80">{isEnglish ? 'Depression Level' : '우울 수준'}</p>
                <p className="text-sm md:text-lg font-bold">{severityLabel}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] md:text-xs">
              {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR')}
            </Badge>
          </div>
        </div>

        <div className="p-3 md:p-6">
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
            <div className="text-center p-2 md:p-3 bg-muted/30 rounded-lg">
              <p className="text-[10px] md:text-xs text-muted-foreground">{isEnglish ? 'Total' : '총점'}</p>
              <p className="text-lg md:text-2xl font-bold text-primary">{total}</p>
              <p className="text-[9px] md:text-xs text-muted-foreground">/ 42{isEnglish ? 'pts' : '점'}</p>
            </div>
            <div className="text-center p-2 md:p-3 bg-muted/30 rounded-lg">
              <p className="text-[10px] md:text-xs text-muted-foreground">{isEnglish ? 'Average' : '평균'}</p>
              <p className="text-lg md:text-2xl font-bold text-primary">{(total / 21).toFixed(1)}</p>
              <p className="text-[9px] md:text-xs text-muted-foreground">/ 2.0{isEnglish ? 'pts' : '점'}</p>
            </div>
            <div className="text-center p-2 md:p-3 bg-muted/30 rounded-lg">
              <p className="text-[10px] md:text-xs text-muted-foreground">{isEnglish ? 'Percentile' : '백분율'}</p>
              <p className="text-lg md:text-2xl font-bold text-primary">{Math.round((total/42)*100)}%</p>
              <p className="text-[9px] md:text-xs text-muted-foreground">{isEnglish ? 'of total' : '만점 대비'}</p>
            </div>
          </div>

          <div className="hidden md:block h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 42]} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Score classification */}
      <Card className="p-3 md:p-6 no-break page-break">
        <h3 className="text-sm md:text-xl font-semibold mb-3 md:mb-4">📊 {isEnglish ? 'Score Classification' : '점수 분류 기준'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="p-2 md:p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="font-semibold text-green-800 dark:text-green-300 text-xs md:text-base">{isEnglish ? 'Normal' : '정상'}</p>
            <p className="text-[10px] md:text-sm text-green-600 dark:text-green-400">0-13{isEnglish ? 'pts' : '점'}</p>
          </div>
          <div className="p-2 md:p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="font-semibold text-yellow-800 dark:text-yellow-300 text-xs md:text-base">{isEnglish ? 'Mild' : '가벼운'}</p>
            <p className="text-[10px] md:text-sm text-yellow-600 dark:text-yellow-400">14-19{isEnglish ? 'pts' : '점'}</p>
          </div>
          <div className="p-2 md:p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="font-semibold text-orange-800 dark:text-orange-300 text-xs md:text-base">{isEnglish ? 'Moderate' : '중등도'}</p>
            <p className="text-[10px] md:text-sm text-orange-600 dark:text-orange-400">20-28{isEnglish ? 'pts' : '점'}</p>
          </div>
          <div className="p-2 md:p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-semibold text-red-800 dark:text-red-300 text-xs md:text-base">{isEnglish ? 'Severe' : '심한'}</p>
            <p className="text-[10px] md:text-sm text-red-600 dark:text-red-400">29-42{isEnglish ? 'pts' : '점'}</p>
          </div>
        </div>
      </Card>

      {/* Detailed analysis */}
      <Card className="p-3 md:p-6 no-break page-break overflow-hidden">
        <h3 className="text-sm md:text-xl font-bold text-foreground mb-3 md:mb-6">✨ {isEnglish ? 'Detailed Analysis' : '상세 분석 결과'}</h3>
        
        <div className="space-y-4 md:space-y-6">
          {/* Desktop score grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{isEnglish ? 'Depression Score' : '우울감 점수'}</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{total}{isEnglish ? 'pts' : '점'} / 42{isEnglish ? 'pts' : '점'}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{isEnglish ? `${Math.round((total/42)*100)}% of max` : `만점 대비 ${Math.round((total/42)*100)}%`}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{isEnglish ? 'Severity' : '심각도'}</p>
              <p className={`text-xl font-bold ${getSeverityColor(severity).includes('green') ? 'text-green-700 dark:text-green-400' : 
                getSeverityColor(severity).includes('yellow') ? 'text-yellow-700 dark:text-yellow-400' :
                getSeverityColor(severity).includes('orange') ? 'text-orange-700 dark:text-orange-400' : 'text-red-700 dark:text-red-400'}`}>
                {severityLabel}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{isEnglish ? 'Range' : '범위'}: {
                sev === 'normal' ? `0-13${isEnglish ? 'pts' : '점'}` :
                sev === 'mild' ? `14-19${isEnglish ? 'pts' : '점'}` :
                sev === 'moderate' ? `20-28${isEnglish ? 'pts' : '점'}` : `29-42${isEnglish ? 'pts' : '점'}`
              }</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{isEnglish ? 'Test Date' : '검사일'}</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{new Date().toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR')}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{isEnglish ? 'Reference result' : '참고용 결과'}</p>
            </div>
          </div>
          
          {/* Expert interpretation */}
          <div className="p-3 md:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm md:text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2 md:mb-4">🔍 {isEnglish ? 'Expert Detailed Interpretation' : '전문가 상세 해석'}</h4>
            <div className="prose prose-sm max-w-none">
              {isLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs md:text-sm text-muted-foreground">{isEnglish ? 'Generating analysis...' : '분석 생성 중...'}</span>
                </div>
              ) : (
                <div className="text-xs md:text-sm leading-relaxed text-gray-800 dark:text-gray-200 space-y-3">
                  <p className="font-medium">
                    {isEnglish ? (
                      <>Your score of <span className="text-primary font-bold">{total}pts</span> {
                        sev === 'normal' ? 'indicates your depression symptoms are within a healthy, normal range.' :
                        sev === 'mild' ? 'suggests mild depression symptoms.' :
                        sev === 'moderate' ? 'indicates moderate depression symptoms.' :
                        'indicates severe depression symptoms.'
                      }</>
                    ) : (
                      <>현재 점수 <span className="text-primary font-bold">{total}점</span>은{' '}
                      {sev === 'normal' && "우울 증상이 정상 범위에 있는 건강한 상태입니다."}
                      {sev === 'mild' && "가벼운 우울 증상이 있는 수준입니다."}
                      {sev === 'moderate' && "중등도 우울 증상을 나타냅니다."}
                      {sev === 'severe' && "심각한 우울 증상을 나타냅니다."}</>
                    )}
                  </p>
                  
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-2 md:p-3">
                    <p className="font-semibold text-purple-700 dark:text-purple-300 mb-2 text-xs md:text-sm">
                      💡 {isEnglish ? 'Recommended Management' : '권장 관리 방법'}
                    </p>
                    <ul className="space-y-1 text-[11px] md:text-xs">
                      {sev === 'normal' && (isEnglish ? (
                        <>
                          <li>• Maintain a regular lifestyle pattern</li>
                          <li>• Exercise at least 3 times per week</li>
                          <li>• Keep a gratitude journal</li>
                        </>
                      ) : (
                        <>
                          <li>• 규칙적인 생활 패턴 유지</li>
                          <li>• 주 3회 이상 운동</li>
                          <li>• 감사 일기 작성</li>
                        </>
                      ))}
                      {sev === 'mild' && (isEnglish ? (
                        <>
                          <li>• Track your mood daily</li>
                          <li>• Ensure adequate sleep (7-8 hours)</li>
                          <li>• Talk with someone you trust</li>
                        </>
                      ) : (
                        <>
                          <li>• 매일 기분 상태 기록</li>
                          <li>• 충분한 수면 확보 (7-8시간)</li>
                          <li>• 신뢰할 수 있는 사람과 대화</li>
                        </>
                      ))}
                      {sev === 'moderate' && (isEnglish ? (
                        <>
                          <li>• Professional consultation recommended</li>
                          <li>• Consider cognitive behavioral therapy</li>
                          <li>• Maintain a regular daily routine</li>
                        </>
                      ) : (
                        <>
                          <li>• 전문가 상담 권장</li>
                          <li>• 인지행동치료 고려</li>
                          <li>• 규칙적인 일과 유지</li>
                        </>
                      ))}
                      {sev === 'severe' && (isEnglish ? (
                        <>
                          <li>• Seek professional help immediately</li>
                          <li>• Inform your family of the situation</li>
                          <li>• Keep crisis hotline numbers available</li>
                        </>
                      ) : (
                        <>
                          <li>• 즉시 전문가 상담 필요</li>
                          <li>• 가족에게 상황 알리기</li>
                          <li>• 위기상담 전화 확보</li>
                        </>
                      ))}
                    </ul>
                  </div>
                  
                  <p className="text-[10px] md:text-xs text-muted-foreground border-t border-purple-200 dark:border-purple-700 pt-2 mt-2">
                    ⏰ {isEnglish ? 'Recommended re-assessment' : '재평가 권장'}: {
                      sev === 'normal' ? (isEnglish ? 'in 3-6 months' : '3-6개월 후') :
                      sev === 'mild' ? (isEnglish ? 'in 1-3 months' : '1-3개월 후') :
                      sev === 'moderate' ? (isEnglish ? 'in 4-8 weeks' : '4-8주 후') : (isEnglish ? 'in 1-2 weeks' : '1-2주 후')
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center pt-2">
            <a 
              href="https://drive.google.com/file/d/17WD3mhW2T4TdkfxTzLpfH5bzFARxz_Vh/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline text-xs md:text-sm"
            >
              👉 {isEnglish ? 'Get a more detailed analysis report' : '더 정밀한 분석 리포트 받기'}
            </a>
          </div>
        </div>
      </Card>

      {/* Recommendation Card */}
      <Card className="p-3 md:p-6 no-break">
        <div className="flex items-start gap-3">
          <div className="shrink-0">{recommendation.icon}</div>
          <div className="flex-1 space-y-2">
            <h3 className="text-sm md:text-xl font-bold text-foreground">{recommendation.title}</h3>
            <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
              {recommendation.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Button 
            className="btn-brand h-12 md:h-16 text-xs md:text-sm"
            onClick={() => window.open(localePath('/expert-hiring'), '_self')}
          >
            <ExternalLink className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">{isEnglish ? 'Expert Consult' : '전문가 상담'}</div>
              <div className="text-[10px] md:text-sm opacity-90 hidden md:block">{isEnglish ? 'Depression specialist' : '우울감 전문가'}</div>
            </div>
          </Button>

          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white h-12 md:h-16 text-xs md:text-sm"
            onClick={() => navigate(localePath('/ai-counselor'), { state: { assessmentResults: { ...results, testType: 'depression' } } })}
          >
            <Brain className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">{isEnglish ? 'AI Counseling' : 'AI 상담'}</div>
              <div className="text-[10px] md:text-sm opacity-90 hidden md:block">{isEnglish ? 'Quick session' : '빠른 상담'}</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 md:h-16 text-xs md:text-sm"
            onClick={() => generatePDFReport({
              testType: isEnglish ? 'Depression Test' : '우울증 검사',
              results: { total: results.total, average: results.average, severity, answers: results.answers },
              analysis: `${isEnglish ? 'Depression test analysis' : '우울증 검사 결과 분석'}: ${recommendation.description}`,
              testInfo: { ageGroup: 'adult', generatedAt: new Date().toISOString(), version: '1.0' }
            })}
            disabled={isGeneratingPDF}
          >
            <Download className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">{isGeneratingPDF ? (isEnglish ? 'Generating...' : '생성 중...') : 'PDF'}</div>
              <div className="text-[10px] md:text-sm text-muted-foreground hidden md:block">{isEnglish ? 'Save report' : '리포트 저장'}</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-12 md:h-16 text-xs md:text-sm"
            onClick={() => saveTestResult({
              testType: isEnglish ? 'Depression Test' : '우울증 검사',
              results: { total: results.total, average: results.average, severity, answers: results.answers },
              analysis: `${isEnglish ? 'Depression test analysis' : '우울증 검사 결과 분석'}: ${recommendation.description}`,
              ageGroup: 'adult',
              testInfo: { generatedAt: new Date().toISOString(), version: '1.0' }
            })}
            disabled={isSaving}
          >
            <Heart className="w-4 h-4 mr-1 md:mr-2 shrink-0" />
            <div className="text-left truncate">
              <div className="font-semibold">{isSaving ? (isEnglish ? 'Saving...' : '저장 중...') : (isEnglish ? 'Save' : '저장')}</div>
              <div className="text-[10px] md:text-sm text-muted-foreground hidden md:block">{isEnglish ? 'Keep record' : '기록 보관'}</div>
            </div>
          </Button>
        </div>
        
        <Button onClick={handleShareText} variant="secondary" size="sm" className="w-full text-xs md:text-sm h-9 md:h-10">
          <Copy className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          📋 {isEnglish ? 'Copy as text' : '텍스트로 복사하기'}
        </Button>
      </div>

      {/* Expert match */}
      <ExpertMatchRecommendation
        testType="depression"
        severity={severity}
        ageGroup={results.ageGroup}
        scores={{ total: results.total, average: results.average }}
      />

      <NextStepSuggestion className="mb-6" />

      <ProductRecommendation category="depression" severity={severity} />

      {/* Additional info */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">{isEnglish ? 'Important Notice' : '참고사항'}</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          {isEnglish 
            ? 'This check is a reference tool for self-observation of depressive symptoms and cannot replace professional evaluation. Please consult a specialist for accurate diagnosis and treatment.'
            : '이 체크는 우울증상 자가관찰을 위한 참고도구로, 전문적 평가를 대체할 수 없습니다. 정확한 진단과 치료를 위해서는 반드시 전문의와 상담하시기 바랍니다.'}
        </p>
      </Card>

      {/* Voice feature */}
      <VoiceFeature 
        title={isEnglish ? "Depression Test Result Voice Guide" : "우울증 검사 결과 음성 안내"}
        text={isEnglish 
          ? `Your depression self-check result: Total score ${total} points, ${severityLabel} level. Please consult a specialist for accurate diagnosis.`
          : `우울증 자가진단 결과를 알려드리겠습니다. 총점 ${total}점으로 ${severityLabel} 수준입니다. 정확한 진단을 위해 전문의와 상담받으시기 바랍니다.`}
        type="result"
      />

      {/* Sharing section */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            {isEnglish ? 'Share with Friends' : '친구들에게 공유하기'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isEnglish ? '"Where did you take this?" Your friends will ask! 🔥' : '"이거 어디서 했어?" 친구들이 물어볼 거예요! 🔥'}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button
            onClick={handlePDFDownload}
            className="flex-col h-auto py-3 bg-gradient-to-br from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
          >
            <Download className="w-5 h-5 mb-1" />
            <span className="text-[10px]">{isEnglish ? 'Save PDF' : 'PDF 저장'}</span>
          </Button>

          <Button
            onClick={() => {
              const message = isEnglish 
                ? `💚 Depression Check Result\n\nTotal: ${total}pts\nStatus: ${severityLabel}\n\n🔗 Try it: ${window.location.origin}/en/assessment\n\n#DepressionTest #SelfCheck #AIHPRO`
                : `💚 우울감 체크 결과\n\n총점: ${total}점\n상태: ${severityLabel}\n\n🔗 나도 해보기: ${window.location.origin}/assessment\n\n#우울증테스트 #자가진단 #AIHPRO`;
              if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                window.location.href = `kakaotalk://send?text=${encodeURIComponent(message)}`;
              } else {
                navigator.clipboard.writeText(message);
                toast({ title: isEnglish ? "Copied! Paste to share 💬" : "카카오톡에 붙여넣기 하세요! 💬" });
              }
            }}
            className="flex-col h-auto py-3 bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            <MessageCircle className="w-5 h-5 mb-1" />
            <span className="text-[10px]">{isEnglish ? 'Share' : '카카오톡'}</span>
          </Button>

          <Button
            onClick={() => {
              handlePDFDownload();
              toast({ title: isEnglish ? "PDF saved!" : "PDF를 저장했어요!", description: isEnglish ? "Upload to your Instagram Story 📸" : "인스타 스토리에 업로드하세요 📸" });
            }}
            className="flex-col h-auto py-3 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-90"
          >
            <Instagram className="w-5 h-5 mb-1" />
            <span className="text-[10px]">{isEnglish ? 'Instagram' : '인스타'}</span>
          </Button>

          <Button
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: isEnglish ? `Depression Check: ${severityLabel}` : `우울감 체크 결과: ${severityLabel}`,
                    text: isEnglish ? `Score ${total}pts, ${severityLabel} level.\n\nTry the test!` : `총점 ${total}점으로 ${severityLabel} 수준입니다.\n\n나도 테스트해보기!`,
                    url: `${window.location.origin}${localePath('/assessment')}`,
                  });
                } catch (error) {
                  console.log('Share cancelled');
                }
              } else {
                handleShareText();
              }
            }}
            variant="outline"
            className="flex-col h-auto py-3"
          >
            <Share2 className="w-5 h-5 mb-1" />
            <span className="text-[10px]">{isEnglish ? 'More' : '더보기'}</span>
          </Button>
        </div>

        <Button onClick={handleShareText} variant="outline" className="w-full" size="sm">
          <Copy className="w-4 h-4 mr-2" />
          {isEnglish ? 'Copy result link' : '결과 링크 복사하기'}
        </Button>
      </Card>

      {/* Viral prompt */}
      <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <p className="text-sm">
          💡 <strong>{isEnglish ? 'Share with a friend' : '친구도 테스트하면'}</strong> {isEnglish ? 'and compare your results!' : '서로 결과 비교할 수 있어요!'}
        </p>
      </div>

      <ExpertConsultationNotice />
      
      <PersonalizedProductRecommendation testType="depression" testResult={results} />
    </div>
  );
};

export default DepressionTestResult;
