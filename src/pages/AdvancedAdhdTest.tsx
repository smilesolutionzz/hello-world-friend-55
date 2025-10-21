import { useState, useEffect } from "react";
import AdvancedAdhdForm from "@/components/assessment/AdvancedAdhdForm";
import AdvancedAdhdResult from "@/components/assessment/AdvancedAdhdResult";
import { supabase } from "@/integrations/supabase/client";

const AdvancedAdhdTest = () => {
  const [results, setResults] = useState<any>(null);

  // 컴포넌트 마운트 시 저장된 결과 확인
  useEffect(() => {
    const savedResults = sessionStorage.getItem('adhdTestResults');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (error) {
        console.error('결과 로드 실패:', error);
      }
    }
  }, []);

  const handleComplete = async (testResults: any) => {
    // 세션 스토리지에 결과 저장
    sessionStorage.setItem('adhdTestResults', JSON.stringify(testResults));
    setResults(testResults);

    // 데이터베이스에 결과 저장
    try {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      
      if (currentUser) {
        // ADHD 검사 결과 저장
        await supabase
          .from('test_results')
          .insert({
            user_id: currentUser.id,
            test_type_id: 'adhd',
            scores: testResults as any
          });

        console.log('✅ ADHD 검사 결과 저장 완료');
      }
    } catch (error) {
      console.error('검사 결과 저장 중 오류:', error);
    }
  };

  const handleBack = () => {
    // 결과 초기화
    sessionStorage.removeItem('adhdTestResults');
    setResults(null);
  };

  const handleResetTest = () => {
    // 검사 다시 시작
    sessionStorage.removeItem('adhdTestResults');
    setResults(null);
  };

  if (results) {
    return <AdvancedAdhdResult results={results} />;
  }

  return <AdvancedAdhdForm onComplete={handleComplete} onBack={handleBack} />;
};

export default AdvancedAdhdTest;
