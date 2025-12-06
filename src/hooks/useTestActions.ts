import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  testType: string;
  total: number;
  average: number;
  severity?: string;
  level?: string;
  ageGroup?: string;
  answers?: any;
  scores?: any;
  analysis?: string;
  recommendations?: string[];
}

export const useTestActions = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // PDF 리포트 생성
  const generatePDFReport = async (testResult: TestResult, isPremium: boolean = false) => {
    if (!isPremium) {
      toast({
        title: "프리미엄 기능",
        description: "PDF 리포트는 프리미엄 구독자만 이용할 수 있습니다.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "PDF 생성을 위해 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      // Supabase edge function 호출
      const response = await supabase.functions.invoke('generate-test-report', {
        body: {
          testType: testResult.testType,
          results: testResult,
          userId: user.id,
          language: 'ko'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // PDF 다운로드
      const { pdfUrl } = response.data;
      if (pdfUrl) {
        // 새 탭에서 PDF 열기
        window.open(pdfUrl, '_blank');
        
        toast({
          title: "PDF 생성 완료",
          description: "검사 결과 PDF가 생성되었습니다.",
        });
      }

    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 결과 저장
  const saveTestResult = async (testResult: TestResult) => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "결과 저장을 위해 로그인이 필요합니다.",
          variant: "destructive"
        });
        return;
      }

      // 사용자 프로필 조회
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "프로필 오류",
          description: "사용자 프로필을 찾을 수 없습니다.",
          variant: "destructive"
        });
        return;
      }

      // 결과 저장 (analysis 포함)
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          profile_id: profile.id,
          age_group: testResult.ageGroup || 'adult',
          age_at_assessment: 25, // 기본값
          results: testResult as any, // JSON 타입으로 변환
          analysis: testResult.analysis || null,
          recommendations: testResult.recommendations || null,
          risk_level: testResult.severity || testResult.level || 'medium'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "결과 저장 완료",
        description: "검사 결과가 성공적으로 저장되었습니다. 마이페이지에서 확인할 수 있습니다.",
      });

      return data;

    } catch (error) {
      console.error('Save result failed:', error);
      toast({
        title: "저장 실패",
        description: "결과 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    generatePDFReport,
    saveTestResult,
    isGeneratingPDF,
    isSaving
  };
};