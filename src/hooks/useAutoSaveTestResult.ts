import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResultData {
  testType: string;
  results: any;
  analysis?: string;
  severity?: string;
  ageGroup?: string;
}

export const useAutoSaveTestResult = (testData: TestResultData) => {
  const { toast } = useToast();
  const hasSaved = useRef(false);
  const savedResultId = useRef<string | null>(null);
  const lastAnalysis = useRef<string | undefined>(undefined);

  useEffect(() => {
    // analysis가 업데이트 되었고 이미 저장된 결과가 있으면 업데이트
    if (hasSaved.current && savedResultId.current && testData.analysis && testData.analysis !== lastAnalysis.current) {
      lastAnalysis.current = testData.analysis;
      updateSavedResult();
      return;
    }
    
    // 이미 저장했으면 스킵
    if (hasSaved.current) return;
    
    const autoSaveResult = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('User not logged in, skipping auto-save');
          return;
        }

        // test_type 찾거나 생성
        let testTypeId = '';
        
        const { data: existingTestType } = await supabase
          .from('test_types')
          .select('id')
          .eq('name', testData.testType)
          .maybeSingle();
        
        if (existingTestType) {
          testTypeId = existingTestType.id;
        } else {
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
            return;
          }
          testTypeId = newTestType.id;
        }

        // 중복 저장 방지 - 최근 5분 내 같은 검사 결과가 있는지 확인
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: recentResult } = await supabase
          .from('test_results')
          .select('id')
          .eq('user_id', user.id)
          .eq('test_type_id', testTypeId)
          .gte('created_at', fiveMinutesAgo)
          .limit(1);

        if (recentResult && recentResult.length > 0) {
          console.log('Recent test result exists, skipping auto-save');
          hasSaved.current = true;
          savedResultId.current = recentResult[0].id;
          return;
        }

        // 검사 결과 저장 - 상세 데이터 포함
        const testResultData = {
          test_type_id: testTypeId,
          user_id: user.id,
          scores: {
            // 원본 결과 데이터
            results: testData.results,
            // AI 분석 결과
            analysis: testData.analysis || null,
            // 심각도
            severity: testData.severity || null,
            // 연령대
            ageGroup: testData.ageGroup || null,
            // 요약 점수
            total_score: testData.results?.total || testData.results?.totalScore || null,
            average: testData.results?.average || null,
            // 저장 시간
            savedAt: new Date().toISOString()
          }
        };

        const { data: insertedResult, error } = await supabase
          .from('test_results')
          .insert(testResultData)
          .select('id')
          .single();

        if (error) {
          console.error('Auto-save error:', error);
          return;
        }

        hasSaved.current = true;
        savedResultId.current = insertedResult.id;
        lastAnalysis.current = testData.analysis;
        console.log('✅ Test result auto-saved:', testData.testType, 'with analysis:', !!testData.analysis);
        
        toast({
          title: "검사 결과 자동 저장됨",
          description: "검사 저장소에서 다시 확인할 수 있습니다.",
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    // 약간의 딜레이 후 저장 (결과 로딩 완료 대기)
    const timer = setTimeout(autoSaveResult, 1000);
    return () => clearTimeout(timer);
  }, [testData.testType, testData.results, testData.analysis, toast]);

  // 이미 저장된 결과가 있으면 분석 데이터 업데이트
  const updateSavedResult = async () => {
    if (!savedResultId.current || !testData.analysis) return;
    
    try {
      const { error } = await supabase
        .from('test_results')
        .update({
          scores: {
            results: testData.results,
            analysis: testData.analysis,
            severity: testData.severity,
            ageGroup: testData.ageGroup,
            total_score: testData.results?.total || testData.results?.totalScore || null,
            average: testData.results?.average || null,
            savedAt: new Date().toISOString()
          }
        })
        .eq('id', savedResultId.current);

      if (error) {
        console.error('Update error:', error);
      } else {
        console.log('✅ Test result updated with analysis');
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
};
