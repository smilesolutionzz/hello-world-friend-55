import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedTestSave } from './useEnhancedTestSave';
import type { DomainScore, EnvironmentalFactors } from '@/types/enhancedTestResult';

export const useTestResultActions = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // 고급 저장 훅 통합
  const enhancedSave = useEnhancedTestSave();

  // 결과 화면을 이미지로 저장하는 함수
  const saveResultAsImage = async (elementId: string, testType: string) => {
    try {
      setIsGeneratingImage(true);
      
      const element = document.getElementById(elementId);
      if (!element) {
        toast({
          title: "이미지 저장 실패",
          description: "저장할 결과 영역을 찾을 수 없습니다.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "이미지 생성 중...",
        description: "잠시만 기다려주세요.",
      });

      const html2canvas = (await import('html2canvas')).default;
      
      // 원본 스타일 저장
      const originalBackground = element.style.background;
      const originalPadding = element.style.padding;
      
      // 캡처를 위한 스타일 조정
      element.style.background = '#ffffff';
      element.style.padding = '20px';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // 복제된 문서에서 불필요한 요소 숨기기
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            // 버튼들 숨기기
            const buttons = clonedElement.querySelectorAll('button');
            buttons.forEach(btn => {
              (btn as HTMLElement).style.display = 'none';
            });
          }
        }
      });
      
      // 스타일 복원
      element.style.background = originalBackground;
      element.style.padding = originalPadding;
      
      // 이미지 다운로드
      const link = document.createElement('a');
      const filename = `${testType}_결과_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/\s/g, '')}.png`;
      link.download = filename;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast({
        title: "이미지 저장 완료",
        description: "검사 결과 이미지가 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('이미지 저장 오류:', error);
      toast({
        title: "이미지 저장 실패",
        description: "이미지 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generatePDFReport = async (testData: {
    testType: string;
    results: any;
    analysis?: string;
    testInfo?: any;
    chartData?: any;
  }) => {
    try {
      setIsGeneratingPDF(true);
      
      console.log('📊 PDF 생성 시작:', testData);
      
      // 결과 데이터 유효성 검사
      if (!testData.results || Object.keys(testData.results).length === 0) {
        console.error('❌ 빈 결과 데이터:', testData);
        toast({
          title: "PDF 생성 실패",
          description: "검사 결과 데이터가 비어있습니다. 검사를 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      // 1) 결과 저장 시도 (히스토리 보존) - 실패해도 PDF 생성은 계속 진행 (조용히 시도)
      await saveTestResult({
        testType: testData.testType,
        results: testData.results,
        analysis: testData.analysis,
        testInfo: testData.testInfo,
        chartData: testData.chartData
      }, { silent: true });
      
      // 2) 리포트 HTML 생성 (엣지 함수가 있으면 사용, 없으면 로컬 템플릿 사용)
      let reportHtml: string | null = null;
      try {
        console.log('🔧 엣지 함수 호출 중...');
        const { data, error } = await supabase.functions.invoke('generate-test-report', {
          body: testData
        });
        console.log('📥 엣지 함수 응답:', { data, error });
        if (!error && data?.reportData?.html) {
          reportHtml = data.reportData.html as string;
          console.log('✅ 엣지 함수에서 HTML 받음');
        }
      } catch (err) {
        console.error('⚠️ 엣지 함수 오류:', err);
        // 엣지 함수 미배포 등으로 실패할 수 있음 - 로컬 템플릿로 폴백
      }
      
      // Markdown을 HTML로 변환하는 함수
      const convertMarkdownToHTML = (text: string): string => {
        if (!text) return '';
        
        return text
          // 헤더 변환 (## 헤더)
          .replace(/\*\*(\d+\.\s+[^\*]+)\*\*/g, '<h3 style="color: #1e40af; margin-top: 20px; margin-bottom: 10px; font-size: 16px;">$1</h3>')
          // 굵은 글씨
          .replace(/\*\*([^\*]+)\*\*/g, '<strong style="color: #1e40af;">$1</strong>')
          // 번호 목록 (숫자.)
          .replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin: 8px 0; padding-left: 20px; line-height: 1.6;"><strong>$1.</strong> $2</div>')
          // 하이픈 목록
          .replace(/^-\s+(.+)$/gm, '<div style="margin: 5px 0; padding-left: 20px; line-height: 1.6;">• $1</div>')
          // 이모지가 있는 섹션 헤더
          .replace(/^(#+)?\s*([🔥📋⚠️💪✨🎯]+)\s*(.+)$/gm, '<h3 style="color: #1e40af; margin-top: 20px; margin-bottom: 10px; font-size: 16px;">$2 $3</h3>')
          // 새 줄을 br 태그로
          .replace(/\n\n/g, '</p><p style="margin: 10px 0; line-height: 1.6;">')
          .replace(/\n/g, '<br>');
      };
      
      if (!reportHtml) {
        console.log('📝 로컬 템플릿 사용');
        // 간단한 로컬 템플릿 - 결과 데이터를 더 보기 좋게 표시
        const resultsTable = Object.entries(testData.results)
          .map(([key, value]) => `
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #374151;">${key}</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; color: #3b82f6; font-weight: 600;">${typeof value === 'number' ? value.toFixed(1) : value}</td>
            </tr>
          `).join('');
        
        const formattedAnalysis = convertMarkdownToHTML(testData.analysis || '');
        
        reportHtml = `
          <div id="pdf-content" style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; background: white;">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #3b82f6;">
              <div style="font-size: 28px; font-weight: bold; color: #3b82f6; letter-spacing: 2px;">AIHPRO.COM</div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 8px;">AIH 기반 심리검사 전문 플랫폼</div>
            </div>
            <h1 style="margin:0 0 10px 0; color: #1e40af; text-align: center; font-size: 24px;">${testData.testType} 결과 보고서</h1>
            <p style="color:#6b7280; margin:0 0 30px 0; text-align: center; font-size: 14px;">${new Date().toLocaleString('ko-KR')}</p>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 16px; font-size: 18px;">검사 결과 요약</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${resultsTable}
              </table>
            </div>
            
            ${testData.analysis ? `
              <div style="background: white; padding: 24px; border-radius: 12px; border: 2px solid #e2e8f0; margin-top: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 16px; font-size: 18px;">전문가 분석</h3>
                <div style="line-height: 1.8; color: #374151;">
                  <p style="margin: 10px 0; line-height: 1.6;">${formattedAnalysis}</p>
                </div>
              </div>
            ` : ''}
            
            <div style="margin-top: 40px; padding: 20px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 12px; color: #6b7280; background: #f9fafb; border-radius: 8px;">
              <p style="margin: 5px 0;"><strong style="color: #374151;">중요 안내사항</strong></p>
              <p style="margin: 5px 0;">본 리포트는 참고용이며 의학적 진단이 아닙니다.</p>
              <p style="margin: 5px 0;">정확한 진단과 치료를 위해서는 전문의와 상담하시기 바랍니다.</p>
              <p style="margin-top: 15px; color: #9ca3af; font-size: 11px;">© 2024 AIHPRO.COM. All rights reserved.</p>
            </div>
          </div>`;
      }

      // 3) html2pdf로 즉시 다운로드
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-99999px';
      container.style.top = '0';
      container.style.width = '794px'; // A4 width in pixels (210mm at 96 DPI)
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '0';
      container.style.margin = '0';
      container.innerHTML = reportHtml;
      document.body.appendChild(container);

      // lazy import to keep bundle size small
      const html2pdf = (await import('html2pdf.js')).default;
      const filename = `${testData.testType}_결과_${new Date().toLocaleDateString('ko-KR').replace(/\./g,'').replace(/\s/g,'')}.pdf`;

      await html2pdf().set({
        margin: [15, 15, 15, 15],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 3, 
          useCORS: true, 
          letterRendering: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794, // A4 width in pixels at 96 DPI
          windowHeight: 1123 // A4 height in pixels at 96 DPI
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      }).from(container.firstElementChild as HTMLElement).save();

      document.body.removeChild(container);

      console.log('✅ PDF 다운로드 완료');
      toast({
        title: "PDF 다운로드 완료",
        description: "검사 결과 PDF가 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      toast({
        title: "PDF 생성 실패",
        description: "리포트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 고급 저장 (상세 데이터 포함)
  const saveTestResultEnhanced = async (testData: {
    testType: string;
    results: any;
    analysis?: string;
    testInfo?: any;
    ageGroup?: string;
    chartData?: any;
    // 고급 옵션
    responses?: Array<{
      questionId: string;
      questionText?: string;
      answer: number | string;
      responseTimeMs?: number;
    }>;
    environmentalFactors?: EnvironmentalFactors;
    userNotes?: string;
    userAge?: number;
    gender?: string;
  }, options?: { silent?: boolean; runAIAnalysis?: boolean }) => {
    // 도메인 점수 변환
    const domainScores: DomainScore[] = Object.entries(testData.results)
      .filter(([key]) => !['total', 'average', 'severity', 'level', 'riskLevel'].includes(key))
      .map(([domain, score]) => ({
        domain,
        rawScore: Number(score) || 0,
        maxScore: 100,
        percentage: Math.min(100, Math.round(Number(score) || 0))
      }));

    const totalScore = testData.results.total || 
      testData.results.average ||
      domainScores.reduce((sum, d) => sum + d.rawScore, 0);

    return enhancedSave.saveEnhancedTestResult({
      testType: testData.testType,
      totalScore,
      maxPossibleScore: domainScores.length * 100 || 100,
      domainScores,
      responses: testData.responses || [],
      answeredCount: testData.responses?.length || Object.keys(testData.results).length,
      skippedCount: 0,
      ageGroup: testData.ageGroup,
      userAge: testData.userAge,
      gender: testData.gender,
      userNotes: testData.userNotes,
      environmentalFactors: testData.environmentalFactors,
      aiAnalysis: testData.analysis ? {
        summary: testData.analysis.substring(0, 200),
        detailedAnalysis: testData.analysis,
        strengths: [],
        areasOfConcern: [],
        personalizedRecommendations: [],
        analysisTimestamp: new Date().toISOString()
      } : undefined
    }, {
      silent: options?.silent,
      generateComparison: true,
      calculateRisk: true,
      runAIAnalysis: options?.runAIAnalysis
    });
  };

  // 기본 저장 (하위 호환성 유지)
  const saveTestResult = async (testData: {
    testType: string;
    results: any;
    analysis?: string;
    testInfo?: any;
    ageGroup?: string;
    chartData?: any;
  }, options?: { silent?: boolean }) => {
    try {
      setIsSaving(true);
      
      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!options?.silent) {
          toast({
            title: "로그인 필요",
            description: "결과 저장을 위해 로그인이 필요합니다.",
            variant: "destructive",
          });
        }
        return false;
      }
      
      // 먼저 test_type을 찾거나 생성
      let testTypeId = '';
      
      // 기존 test_type 확인
      const { data: existingTestType, error: typeSelectError } = await supabase
        .from('test_types')
        .select('id')
        .eq('name', testData.testType)
        .maybeSingle();
      
      if (typeSelectError && typeSelectError.code !== 'PGRST116') {
        console.error('Test type 조회 오류:', typeSelectError);
        throw typeSelectError;
      }
      
      if (existingTestType) {
        testTypeId = existingTestType.id;
      } else {
        // 새로운 test_type 생성 시도
        const { data: newTestType, error: createError } = await supabase
          .from('test_types')
          .insert({
            name: testData.testType,
            description: `${testData.testType} 검사`
          })
          .select('id')
          .single();
        
        if (createError) {
          console.error('Test type 생성 오류:', createError);
          throw createError;
        }
        testTypeId = newTestType.id;
      }

      // 이전 검사 비교 데이터 생성
      const { data: previousResults } = await supabase
        .from('test_results')
        .select('id, scores, completed_at')
        .eq('user_id', user.id)
        .eq('test_type_id', testTypeId)
        .order('completed_at', { ascending: false })
        .limit(5);

      const comparisonData = previousResults && previousResults.length > 0 ? {
        previousTestId: previousResults[0].id,
        previousTestDate: previousResults[0].completed_at,
        previousTotalScore: (previousResults[0].scores as any)?.totalScore || 
          (previousResults[0].scores as any)?.results?.total,
        consecutiveTestCount: previousResults.length + 1,
        trend: 'stable' as const
      } : {
        trend: 'first_test' as const,
        consecutiveTestCount: 1
      };

      // 도메인 점수 변환
      const domainScores: DomainScore[] = Object.entries(testData.results)
        .filter(([key]) => !['total', 'average', 'severity', 'level', 'riskLevel'].includes(key))
        .map(([domain, score]) => ({
          domain,
          rawScore: Number(score) || 0,
          maxScore: 100,
          percentage: Math.min(100, Math.round(Number(score) || 0))
        }));

      const totalScore = testData.results.total || 
        testData.results.average ||
        domainScores.reduce((sum, d) => sum + d.rawScore, 0);

      // 검사 결과를 고급 형식으로 저장
      const enhancedScores = {
        // 기본 정보
        testType: testData.testType,
        testVersion: '1.0',
        
        // 점수 데이터
        totalScore,
        maxPossibleScore: domainScores.length * 100 || 100,
        percentageScore: Math.round((totalScore / (domainScores.length * 100 || 100)) * 100),
        domainScores,
        
        // 레거시 호환
        results: testData.results,
        analysis: testData.analysis,
        chartData: testData.chartData,
        testInfo: testData.testInfo,
        ageGroup: testData.ageGroup,
        
        // 비교 데이터
        comparisonData,
        
        // 세션 정보
        sessionMetadata: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          durationSeconds: 0,
          completionRate: 100,
          deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
        },
        
        // 메타데이터
        riskLevel: testData.results?.severity || testData.results?.riskLevel || 'unknown',
        scoreSummary: {
          average: testData.results?.average,
          total: testData.results?.total,
          severity: testData.results?.severity
        }
      };

      const { data, error } = await supabase
        .from('test_results')
        .insert({
          test_type_id: testTypeId,
          user_id: user.id,
          scores: enhancedScores as any
        })
        .select()
        .single();

      if (error) throw error;

      if (data && !options?.silent) {
        const changeText = comparisonData.previousTotalScore 
          ? `이전 검사 대비 ${totalScore - comparisonData.previousTotalScore > 0 ? '+' : ''}${totalScore - comparisonData.previousTotalScore}점 변화`
          : '첫 번째 검사가 저장되었습니다.';
          
        toast({
          title: "검사 결과 저장 완료",
          description: changeText,
        });
        return true;
      }
    } catch (error) {
      console.error('결과 저장 오류:', error);
      if (!options?.silent) {
        toast({
          title: "저장 실패",
          description: "결과 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    generatePDFReport,
    saveResultAsImage,
    saveTestResult,
    saveTestResultEnhanced,
    isGeneratingPDF,
    isGeneratingImage,
    isSaving,
    // 고급 세션 관리 함수들
    startTestSession: enhancedSave.startTestSession,
    recordQuestionTime: enhancedSave.recordQuestionTime,
    pauseSession: enhancedSave.pauseSession,
    resumeSession: enhancedSave.resumeSession,
    isAnalyzing: enhancedSave.isAnalyzing
  };
};