import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import IEPGenerator from '@/components/iep/IEPGenerator';
import { supabase } from '@/integrations/supabase/client';

const IEPGeneratorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assessmentResults, setAssessmentResults] = useState<Record<string, any>>({});

  useEffect(() => {
    // URL 파라미터나 state에서 평가 결과 가져오기
    if (location.state?.assessmentResults) {
      setAssessmentResults(location.state.assessmentResults);
    }
    
    // 최근 평가 결과 자동 연결 (옵션)
    fetchRecentAssessments();
  }, [location]);

  const fetchRecentAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_enhanced_analysis')
        .select('assessment_type, raw_results, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (data && data.length > 0) {
        const recentResults = data.reduce((acc, item) => {
          acc[item.assessment_type] = item.raw_results;
          return acc;
        }, {} as Record<string, any>);

        setAssessmentResults(prev => ({ ...prev, ...recentResults }));
      }
    } catch (error) {
      console.error('최근 평가 결과 조회 오류:', error);
    }
  };

  const handleIEPGenerated = (iepId: string) => {
    navigate(`/iep-view/${iepId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              개별교육계획(IEP) 생성
            </h1>
            <p className="text-muted-foreground">
              AI 기반 맞춤형 교육계획 수립 (무료)
            </p>
          </div>
        </div>

        {/* 평가 결과 연결 안내 */}
        {Object.keys(assessmentResults).length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    연결된 평가 결과가 있습니다
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    최근 실시한 평가 결과들이 자동으로 연결되어 더욱 정확한 IEP 생성이 가능합니다.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(assessmentResults).map((key) => (
                      <span 
                        key={key}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* IEP 생성기 */}
        <IEPGenerator 
          assessmentResults={assessmentResults}
          onGenerated={handleIEPGenerated}
        />

        {/* 추가 안내 */}
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">IEP(개별교육계획)란?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              개별교육계획(Individualized Education Program)은 특별한 교육적 지원이 필요한 학생을 위한 
              맞춤형 교육 로드맵입니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">포함 내용:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 현재 학습 수준 평가</li>
                  <li>• 연간 및 단기 교육 목표</li>
                  <li>• 필요한 특수교육 서비스</li>
                  <li>• 평가 방법 및 기준</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">활용 방법:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 학교와 가정 간 정보 공유</li>
                  <li>• 체계적인 교육 계획 수립</li>
                  <li>• 주기적 진전 상황 점검</li>
                  <li>• 전문가 협력 기반 마련</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IEPGeneratorPage;