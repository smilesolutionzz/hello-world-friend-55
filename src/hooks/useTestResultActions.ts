import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTestResultActions = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const generatePDFReport = async (testData: {
    testType: string;
    results: any;
    analysis?: string;
    testInfo?: any;
    chartData?: any;
  }) => {
    try {
      setIsGeneratingPDF(true);
      
      // 1) 결과 저장 시도 (히스토리 보존)
      await saveTestResult({
        testType: testData.testType,
        results: testData.results,
        analysis: testData.analysis,
        testInfo: testData.testInfo,
        chartData: testData.chartData
      });
      
      // 2) 리포트 HTML 생성 (엣지 함수가 있으면 사용, 없으면 로컬 템플릿 사용)
      let reportHtml: string | null = null;
      try {
        const { data, error } = await supabase.functions.invoke('generate-test-report', {
          body: testData
        });
        if (!error && data?.reportData?.html) {
          reportHtml = data.reportData.html as string;
        }
      } catch (_) {
        // 엣지 함수 미배포 등으로 실패할 수 있음 - 로컬 템플릿로 폴백
      }
      
      if (!reportHtml) {
        // 간단한 로컬 템플릿
        reportHtml = `
          <div id="pdf-content" style="font-family: system-ui, -apple-system, Segoe UI, Roboto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 20px; font-weight: bold; color: #6366f1; letter-spacing: 1px;">aihpro.com</div>
            </div>
            <h1 style="margin:0 0 8px 0;">${testData.testType} 결과 보고서</h1>
            <p style="color:#555; margin:0 0 16px 0;">${new Date().toLocaleString('ko-KR')}</p>
            <pre style="white-space:pre-wrap; background:#f7f7f9; padding:16px; border-radius:8px;">${JSON.stringify(testData.results, null, 2)}</pre>
            ${testData.analysis ? `<h3>분석</h3><p style="white-space:pre-wrap;">${testData.analysis}</p>` : ''}
          </div>`;
      }

      // 3) html2pdf로 즉시 다운로드
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-99999px';
      container.style.top = '0';
      container.innerHTML = reportHtml;
      document.body.appendChild(container);

      // lazy import to keep bundle size small
      const html2pdf = (await import('html2pdf.js')).default;
      const filename = `${testData.testType}_결과_${new Date().toLocaleDateString('ko-KR').replace(/\./g,'').replace(/\s/g,'')}.pdf`;

      await html2pdf().set({
        margin: [10,10,10,10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(container.firstElementChild as HTMLElement).save();

      document.body.removeChild(container);

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

  const saveTestResult = async (testData: {
    testType: string;
    results: any;
    analysis?: string;
    testInfo?: any;
    ageGroup?: string;
    chartData?: any;
  }) => {
    try {
      setIsSaving(true);
      
      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "결과 저장을 위해 로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
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

      // 검사 결과를 기존 test_results 테이블 구조에 맞게 저장
      const testResultData = {
        test_type_id: testTypeId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        scores: {
          results: testData.results,
          analysis: testData.analysis,
          chartData: testData.chartData,
          testInfo: testData.testInfo,
          ageGroup: testData.ageGroup,
          riskLevel: testData.results?.severity || testData.results?.riskLevel || 'unknown',
          scoreSummary: {
            average: testData.results?.average,
            total: testData.results?.total,
            severity: testData.results?.severity
          }
        }
      };

      const { data, error } = await supabase
        .from('test_results')
        .insert(testResultData)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        toast({
          title: "검사 결과 저장 완료",
          description: "검사 결과가 성공적으로 저장되었습니다. 나의 검사기록에서 확인하실 수 있습니다.",
        });
        return true;
      }
    } catch (error) {
      console.error('결과 저장 오류:', error);
      toast({
        title: "저장 실패",
        description: "결과 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    generatePDFReport,
    saveTestResult,
    isGeneratingPDF,
    isSaving,
  };
};