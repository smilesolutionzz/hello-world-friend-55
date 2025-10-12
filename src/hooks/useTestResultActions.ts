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
      
      if (!reportHtml) {
        console.log('📝 로컬 템플릿 사용');
        // 간단한 로컬 템플릿 - 결과 데이터를 더 보기 좋게 표시
        const resultsTable = Object.entries(testData.results)
          .map(([key, value]) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${key}</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${typeof value === 'number' ? value.toFixed(1) : value}</td>
            </tr>
          `).join('');
        
        reportHtml = `
          <div id="pdf-content" style="font-family: system-ui, -apple-system, Segoe UI, Roboto; padding: 24px; max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6; letter-spacing: 1px;">AIHPRO.COM</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">AIH 기반 심리검사 전문 플랫폼</div>
            </div>
            <h1 style="margin:0 0 8px 0; color: #3b82f6; text-align: center;">${testData.testType} 결과 보고서</h1>
            <p style="color:#555; margin:0 0 24px 0; text-align: center;">${new Date().toLocaleString('ko-KR')}</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e40af; margin-top: 0;">검사 결과 요약</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${resultsTable}
              </table>
            </div>
            
            ${testData.analysis ? `
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 20px;">
                <h3 style="color: #1e40af; margin-top: 0;">전문가 분석</h3>
                <p style="white-space:pre-wrap; line-height: 1.8; color: #374151;">${testData.analysis}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #666;">
              <p><strong>중요 안내사항</strong></p>
              <p>본 리포트는 참고용이며 의학적 진단이 아닙니다.</p>
              <p>정확한 진단과 치료를 위해서는 전문의와 상담하시기 바랍니다.</p>
            </div>
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