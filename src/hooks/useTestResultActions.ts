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
      
      // 먼저 검사 결과 저장
      await saveTestResult({
        testType: testData.testType,
        results: testData.results,
        analysis: testData.analysis,
        testInfo: testData.testInfo,
        chartData: testData.chartData
      });
      
      const { data, error } = await supabase.functions.invoke('generate-test-report', {
        body: testData
      });

      if (error) throw error;

      if (data.success) {
        // HTML 리포트를 새 창에서 열기
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.reportData.html);
          newWindow.document.close();
        }
        
        toast({
          title: "PDF 리포트 생성 완료",
          description: "새 창에서 리포트를 확인하세요. 브라우저의 인쇄 기능을 사용하여 PDF로 저장할 수 있습니다.",
        });
      }
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
      
      // 먼저 test_type을 찾거나 생성
      let testTypeId = '';
      
      // 기존 test_type 확인
      const { data: existingTestType } = await supabase
        .from('test_types')
        .select('id')
        .eq('name', testData.testType)
        .single();
      
      if (existingTestType) {
        testTypeId = existingTestType.id;
      } else {
        // 새로운 test_type 생성
        const { data: newTestType, error: createError } = await supabase
          .from('test_types')
          .insert({
            name: testData.testType,
            description: `${testData.testType} 검사`
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
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