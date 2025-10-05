import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Download, 
  Share2, 
  RotateCcw, 
  Heart, 
  Pill, 
  Activity, 
  Home,
  ExternalLink,
  Loader2,
  Star,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import html2pdf from "html2pdf.js";

interface HanMedicineResultProps {
  result: any;
  onRestart: () => void;
}

export const HanMedicineResult: React.FC<HanMedicineResultProps> = ({ result, onRestart }) => {
  const { toast } = useToast();
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<string | null>(null);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const generateEnhancedAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    setAnalysisError(null);
    
    try {
      console.log('Generating enhanced analysis for:', result.type);
      
      const { data, error } = await supabase.functions.invoke('han-medicine-analyzer', {
        body: {
          testType: result.type,
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.percentage,
          answers: result.answers,
          severity: result.severity
        }
      });

      console.log('Analysis response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data && data.analysis) {
        // Parse structured JSON analysis
        const parsedAnalysis = typeof data.analysis === 'string' 
          ? JSON.parse(data.analysis) 
          : data.analysis;
        
        setEnhancedAnalysis(parsedAnalysis);
        setClinicInfo(data.clinicInfo);
        toast({
          title: "AI 분석 완료",
          description: "30년 경력 한의사 수준의 전문 분석이 완료되었습니다.",
        });
      } else {
        throw new Error('Invalid analysis data');
      }
    } catch (error) {
      console.error('분석 생성 중 오류:', error);
      setAnalysisError("AI 분석 서비스 일시 중단. 기본 분석을 제공합니다.");
      toast({
        title: "기본 분석 제공",
        description: "현재 AI 분석 서비스에 일시적 문제가 있어 기본 분석을 제공합니다.",
        variant: "default"
      });
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const generateBasicAnalysis = () => {
    const testNames = {
      adhd: 'ADHD',
      autism: '자폐 스펙트럼',
      atopy: '아토피',
      intellectual: '인지능력',
      stress: '스트레스'
    };

    const testName = testNames[result.type as keyof typeof testNames] || '한방';

    return `🔍 **${testName} 검사 결과 분석**

📊 **검사 점수**: ${result.score}/${result.maxScore}점 (${result.percentage}%)
🏥 **심각도**: ${result.severity} 단계

💊 **한의학적 접근법**:
검사 결과를 바탕으로 한의학적 체질 진단과 맞춤형 치료가 필요합니다. ${result.severity === '높음' ? '즉시 전문 한의사와 상담하여 정밀 진단을 받으시길 권합니다.' : '정기적인 관리와 예방 차원의 한방 치료를 고려해보세요.'}

🌿 **추천 관리법**:
- 개인 체질에 맞는 한약 처방
- 생활습관 개선 및 식이요법
- 스트레스 관리와 충분한 휴식
- 정기적인 전문 상담

⚕️ **전문 상담 권장**:
더 정확한 진단과 맞춤 치료를 위해 가까이한의원에서 전문 한의사와 상담받으시길 권합니다.

📞 상담 예약: 가까이한의원 1588-1234`;
  };

  const goHome = () => {
    window.location.href = '/';
  };

  const downloadResults = async () => {
    try {
      // Create PDF content element
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #059669; padding-bottom: 20px;">
            <h1 style="font-size: 28px; margin: 0 0 10px 0; color: #059669; font-weight: bold;">한의학 체질검사 결과 보고서</h1>
            <h2 style="font-size: 20px; margin: 0 0 10px 0; color: #047857;">${getTestTypeName(result.type)}</h2>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">검사일: ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">검사 점수: ${result.score}/${result.maxScore}점 (${result.percentage}%)</p>
            <div style="display: inline-block; background: ${getSeverityBgColor(result.severity)}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px;">
              ${result.severity} 단계
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; color: #059669; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E5E7EB;">🔍 한의학적 분석</h3>
            <div style="background: linear-gradient(135deg, #ECFDF5, #F0FDF4); border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px;">
              <div style="white-space: pre-wrap; line-height: 1.7; font-size: 14px; color: #374151;">
                ${enhancedAnalysis || result.analysis}
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; color: #059669; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E5E7EB;">💊 한약 처방 및 치료법</h3>
            <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px;">
              ${generateHerbalPrescription(result.type, result.severity)}
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; color: #059669; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #E5E7EB;">🌿 치료 추천사항</h3>
            <div style="display: grid; gap: 10px;">
              ${result.recommendations.map((rec: string, index: number) => `
                <div style="background: #F0FDF4; border-left: 4px solid #059669; padding: 12px 16px; border-radius: 6px;">
                  <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="background: #059669; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">
                      ${index + 1}
                    </span>
                    <p style="margin: 0; font-size: 14px; color: #374151;">${rec}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin-top: 30px;">
            <h4 style="color: #92400E; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">⚠️ 중요 안내사항</h4>
            <p style="margin: 0; font-size: 12px; color: #92400E; line-height: 1.5;">
              본 검사 결과는 AI 기반 한의학적 분석을 통해 제공되는 참고 자료입니다. 
              정확한 진단이나 치료가 필요한 경우 반드시 전문 한의사와 상담하시기 바랍니다.
              한약 처방은 개인의 체질과 상태에 따라 달라질 수 있으므로, 실제 복용 전 반드시 한의사의 진료를 받으시기 바랍니다.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; font-size: 12px; color: #9CA3AF;">가까이한의원 연계 | 전문 한의학 체질검사</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #9CA3AF;">상담 문의: https://naver.me/xk1XPBhl</p>
          </div>
        </div>
      `;
      
      // Configure PDF options
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `한의학체질검사_${getTestTypeName(result.type)}_${new Date().toLocaleDateString().replace(/\./g, '')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      
      // Generate PDF
      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "PDF 다운로드 완료",
        description: "한의학 체질검사 결과 보고서가 성공적으로 다운로드되었습니다.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF 생성 오류", 
        description: "PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
        variant: "destructive"
      });
    }
  };

  const generateHerbalPrescription = (type: string, severity: string) => {
    const prescriptions: Record<string, any> = {
      adhd: {
        name: "감맥대조탕가감 (甘麥大棗湯加減)",
        ingredients: ["감초 6g", "대조 12g", "소맥 15g", "용골 10g", "모려 10g", "산조인 12g", "원지 6g"],
        effects: "심신을 안정시키고 집중력을 높이는 효과",
        usage: "1일 2-3회, 식후 30분에 복용",
        duration: "4-6주 지속 복용 권장"
      },
      autism: {
        name: "정지환가감 (定志丸加減)", 
        ingredients: ["인삼 9g", "복신 12g", "원지 6g", "창포 6g", "용골 10g", "모려 10g", "백자인 12g"],
        effects: "정신을 안정시키고 소통 능력을 향상시키는 효과",
        usage: "1일 2회, 아침·저녁 식후 복용",
        duration: "8-12주 지속 복용 권장"
      },
      atopy: {
        name: "소풍산가감 (消風散加減)",
        ingredients: ["형개 6g", "방풍 6g", "우방자 9g", "선퇴 6g", "고삼 9g", "지황 12g", "당귀 9g"],
        effects: "피부 염증을 완화하고 가려움증을 억제하는 효과",
        usage: "1일 2-3회, 식간에 복용",
        duration: "6-8주 지속 복용 권장"
      },
      intellectual: {
        name: "보양환오탕가감 (補陽還五湯加減)",
        ingredients: ["황기 30g", "당귀미 6g", "적작약 6g", "천궁 6g", "도인 6g", "홍화 6g", "지룡 6g"],
        effects: "뇌 기능을 활성화하고 인지능력을 개선하는 효과", 
        usage: "1일 2회, 아침·점심 식후 복용",
        duration: "12주 이상 지속 복용 권장"
      },
      stress: {
        name: "안신정지환가감 (安神定志丸加減)",
        ingredients: ["인삼 9g", "백출 9g", "복령 12g", "감초 6g", "용골 12g", "모려 12g", "산조인 15g"],
        effects: "스트레스를 완화하고 정신을 안정시키는 효과",
        usage: "1일 2-3회, 식후 또는 스트레스 상황 전 복용", 
        duration: "4-8주 지속 복용 권장"
      }
    };

    const prescription = prescriptions[type] || prescriptions.stress;
    const intensityAdjustment = severity === '높음' ? 
      "고농도 처방으로 집중 치료 필요" : 
      severity === '중간' ? 
      "표준 농도로 꾸준한 관리 필요" : 
      "저농도로 예방적 관리 권장";

    return `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #059669; font-size: 16px; margin-bottom: 10px; font-weight: bold;">🍃 추천 한약 처방</h4>
        <div style="background: white; border: 1px solid #D1FAE5; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #047857; font-size: 15px;">${prescription.name}</p>
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151;">${prescription.effects}</p>
          
          <h5 style="margin: 10px 0 5px 0; font-size: 14px; color: #059669;">📋 구성 약재:</h5>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 5px; margin-bottom: 10px;">
            ${prescription.ingredients.map((ingredient: string) => `
              <span style="background: #F0FDF4; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #047857; border: 1px solid #BBF7D0;">${ingredient}</span>
            `).join('')}
          </div>
          
          <h5 style="margin: 10px 0 5px 0; font-size: 14px; color: #059669;">💊 복용법:</h5>
          <p style="margin: 0 0 5px 0; font-size: 13px; color: #374151;">${prescription.usage}</p>
          <p style="margin: 0 0 5px 0; font-size: 13px; color: #374151;">${prescription.duration}</p>
          <p style="margin: 0; font-size: 12px; color: #F59E0B; font-weight: bold;">⚠️ ${intensityAdjustment}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #059669; font-size: 16px; margin-bottom: 10px; font-weight: bold;">🏥 추가 한방 치료법</h4>
        <div style="display: grid; gap: 10px;">
          <div style="background: white; border: 1px solid #D1FAE5; border-radius: 8px; padding: 12px;">
            <h5 style="margin: 0 0 5px 0; font-size: 13px; color: #047857; font-weight: bold;">침술 치료 (週 2-3회)</h5>
            <p style="margin: 0; font-size: 12px; color: #374151;">백회, 신정, 인당 등 정신안정 혈자리 자침으로 뇌 기능 활성화</p>
          </div>
          <div style="background: white; border: 1px solid #D1FAE5; border-radius: 8px; padding: 12px;">
            <h5 style="margin: 0 0 5px 0; font-size: 13px; color: #047857; font-weight: bold;">추나 요법 (週 1-2회)</h5>
            <p style="margin: 0; font-size: 12px; color: #374151;">경추와 흉추 정렬로 뇌 혈류 개선 및 자율신경 안정</p>
          </div>
          <div style="background: white; border: 1px solid #D1FAE5; border-radius: 8px; padding: 12px;">
            <h5 style="margin: 0 0 5px 0; font-size: 13px; color: #047857; font-weight: bold;">한방 아로마 요법</h5>
            <p style="margin: 0; font-size: 12px; color: #374151;">계피, 정향, 박하 등 천연 한약재 향기로 심신 안정</p>
          </div>
        </div>
      </div>
    `;
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case '높음': return '#DC2626';
      case '중간': return '#F59E0B';
      case '경미': return '#059669';
      default: return '#6B7280';
    }
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '한방 검사 결과',
          text: `한방 검사 결과: ${result.percentage}% - 가까이한의원에서 전문 상담 받으세요!`,
          url: 'https://naver.me/xk1XPBhl'
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText('https://naver.me/xk1XPBhl');
      toast({
        title: "링크 복사됨",
        description: "가까이한의원 상담 링크가 클립보드에 복사되었습니다.",
      });
    }
  };

  const getTestTypeName = (type: string) => {
    const names: Record<string, string> = {
      autism: '자폐 스펙트럼 진단',
      adhd: 'ADHD 진단',
      intellectual: '인지능력 진단',
      atopy: '아토피 진단',
      stress: '스트레스 진단'
    };
    return names[type] || '한방 진단';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '높음': return 'bg-red-100 text-red-800';
      case '중간': return 'bg-yellow-100 text-yellow-800';
      case '경미': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestIcon = (type: string) => {
    switch (type) {
      case 'autism': return <Heart className="h-6 w-6 text-blue-500" />;
      case 'adhd': return <Activity className="h-6 w-6 text-orange-500" />;
      case 'intellectual': return <Pill className="h-6 w-6 text-purple-500" />;
      case 'atopy': return <Heart className="h-6 w-6 text-rose-500" />;
      case 'stress': return <Activity className="h-6 w-6 text-teal-500" />;
      default: return <Heart className="h-6 w-6 text-blue-500" />;
    }
  };

  const renderStructuredAnalysis = (analysis: any) => {
    if (typeof analysis === 'string') {
      return <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</div>;
    }

    return (
      <div className="space-y-6">
        {/* 체질 분석 */}
        {analysis.constitution && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              🏥 체질 분석
            </h3>
            <p className="text-sm leading-relaxed text-blue-900/80">{analysis.constitution}</p>
          </div>
        )}

        {/* 한약 추천 */}
        {analysis.herbalRecommendation && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
              🌿 한약 추천
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-green-800 mb-1">{analysis.herbalRecommendation.name}</h4>
                <p className="text-sm text-green-900/70">{analysis.herbalRecommendation.description}</p>
              </div>
              {analysis.herbalRecommendation.ingredients && (
                <div className="flex flex-wrap gap-2">
                  {analysis.herbalRecommendation.ingredients.map((ingredient: string, idx: number) => (
                    <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-green-700 border border-green-200">
                      {ingredient}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 한의사 분석 */}
        {analysis.professionalAnalysis && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
              👨‍⚕️ 전문가 소견
            </h3>
            <p className="text-sm leading-relaxed text-purple-900/80">{analysis.professionalAnalysis}</p>
          </div>
        )}

        {/* 식단 추천 */}
        {analysis.dietaryAdvice && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
            <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
              🍽️ 식단 관리
            </h3>
            <div className="space-y-2">
              {analysis.dietaryAdvice.recommended && (
                <div>
                  <p className="text-xs font-semibold text-orange-800 mb-1">추천 음식</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.dietaryAdvice.recommended.map((food: string, idx: number) => (
                      <span key={idx} className="bg-white px-2 py-1 rounded text-xs text-orange-700 border border-orange-200">
                        ✓ {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis.dietaryAdvice.avoid && (
                <div>
                  <p className="text-xs font-semibold text-orange-800 mb-1 mt-3">주의 음식</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.dietaryAdvice.avoid.map((food: string, idx: number) => (
                      <span key={idx} className="bg-white px-2 py-1 rounded text-xs text-red-700 border border-red-200">
                        ✗ {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 생활 관리 */}
        {analysis.lifestyleAdvice && (
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
            <h3 className="text-lg font-bold text-teal-900 mb-3 flex items-center gap-2">
              💪 생활 관리
            </h3>
            <ul className="space-y-2">
              {analysis.lifestyleAdvice.map((advice: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-teal-900/80">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 치료 계획 */}
        {analysis.treatmentPlan && (
          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 border border-rose-200">
            <h3 className="text-lg font-bold text-rose-900 mb-3 flex items-center gap-2">
              📋 치료 계획
            </h3>
            <p className="text-sm leading-relaxed text-rose-900/80">{analysis.treatmentPlan}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {getTestIcon(result.type)}
              <CardTitle className="text-2xl ml-3">{getTestTypeName(result.type)} 결과</CardTitle>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Badge className={getSeverityColor(result.severity)}>
                {result.severity} 단계
              </Badge>
              <span className="text-3xl font-bold text-primary">
                {result.percentage}%
              </span>
              <span className="text-sm text-muted-foreground">
                ({result.score}/{result.maxScore}점)
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* AI 분석 생성 버튼 */}
        {!enhancedAnalysis && (
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <h3 className="text-lg font-semibold">전문 한의사 수준 AI 분석</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                🏥 <strong>GPT-4.1</strong>이 30년 경력 한의사의 전문 지식으로 <br/>
                <strong>2000자 이상 상세 체질별 맞춤 진단</strong>과 치료법을 제공합니다
              </p>
              <div className="flex items-center justify-center mb-4 space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  장부변증 분석
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  맞춤 한약재 추천
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                  생활요법 처방
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                  경혈 마사지법
                </div>
              </div>
              <Button 
                onClick={generateEnhancedAnalysis}
                disabled={isGeneratingAnalysis}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                {isGeneratingAnalysis ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    전문 분석 생성 중... (약 60초)
                  </>
                ) : (
                  '🔍 상세 전문 분석 받기 (무료)'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 분석 결과 */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2 text-primary" />
              {enhancedAnalysis ? '🏥 전문 한의사 수준 AI 분석' : '기본 한의학적 분석'}
            </CardTitle>
            {analysisError && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">⚠️ {analysisError}</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {enhancedAnalysis ? (
              renderStructuredAnalysis(enhancedAnalysis)
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
              </div>
            )}
            
            {enhancedAnalysis && clinicInfo && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  📋 연계 전문 상담 가능
                </h4>
                <p className="text-sm text-green-700">
                  위 분석을 바탕으로 {clinicInfo.name}에서 더 정밀한 진단과 맞춤 치료를 받으실 수 있습니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 추천사항 */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-rose-500" />
              치료 추천사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {result.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 프리미엄 정밀 체질체크 CTA */}
        {!enhancedAnalysis && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-purple-900">프리미엄 정밀 체질체크</h3>
                    <Badge className="bg-purple-600 text-white">NEW</Badge>
                  </div>
                  <p className="text-purple-800/80">상세하고 정확한 맞춤 분석</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <span className="font-semibold text-purple-900">정밀 사상체질 + 대사타입 분석</span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <span className="font-semibold text-purple-900">개인 맞춤 식단표 제공</span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <span className="font-semibold text-purple-900">운동법 + 한약재 추천</span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <span className="font-semibold text-purple-900">전문가 1:1 상담 가능</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.location.href = '/han-medicine-test'}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold shadow-lg"
              >
                정밀 체질체크 받기
                <ExternalLink className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 가까이한의원 연계 섹션 */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Phone className="h-5 w-5 mr-2" />
              전문 한의원 1:1 맞춤 상담
            </CardTitle>
            <CardDescription>
              검사 결과를 바탕으로 전문 한의사의 맞춤 상담을 받아보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  제공 서비스
                </h4>
                <ul className="text-sm space-y-2 bg-white/60 rounded-lg p-3">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    개별 체질 진단
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    맞춤 한약 처방
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    지속적 관리 프로그램
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    생활습관 개선 지도
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  상담 혜택
                </h4>
                <ul className="text-sm space-y-2 bg-white/60 rounded-lg p-3">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    검사 결과 무료 해석
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    초회 상담료 할인
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    맞춤 치료 계획 제공
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    24시간 상담 가능
                  </li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md"
              >
                <Phone className="h-4 w-4 mr-2" />
                전문 한의원 상담받기
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://naver.me/xk1XPBhl', '_blank')}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                온라인 예약
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={goHome} className="flex items-center">
            <Home className="h-4 w-4 mr-2" />
            홈으로
          </Button>
          <Button variant="outline" onClick={downloadResults} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            결과 저장
          </Button>
          <Button variant="outline" onClick={shareResults} className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            공유하기
          </Button>
          <Button variant="outline" onClick={onRestart} className="flex items-center">
            <RotateCcw className="h-4 w-4 mr-2" />
            다시 검사
          </Button>
        </div>

        {/* 신뢰성 표시 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-6 py-3">
            <span className="text-lg">✨</span>
            <span className="font-medium text-foreground">
              전문 한의원 검증 완료 AI 진단
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};