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
      container.style.width = '210mm'; // A4 width
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
    saveTestResult,
    isGeneratingPDF,
    isSaving,
  };
};