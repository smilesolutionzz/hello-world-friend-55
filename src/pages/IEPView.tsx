import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Share, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IEPData {
  id: string;
  student_name: string;
  student_age: number;
  student_concerns?: string;
  teacher_observations?: string;
  assessment_results?: any;
  annual_goals?: any;
  special_education_services?: any;
  assessment_modifications?: any;
  accommodations?: any;
  current_performance?: any;
  plan_status: string;
  valid_from: string;
  valid_to: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const IEPView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [iepData, setIepData] = useState<IEPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchIEPData();
    }
  }, [id]);

  const fetchIEPData = async () => {
    try {
      const { data, error } = await supabase
        .from('individual_education_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setIepData(data);
    } catch (error) {
      console.error('IEP 데이터 조회 오류:', error);
      toast.error('IEP 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast.info('PDF 다운로드 기능은 곧 추가됩니다.');
  };

  const handleShare = () => {
    toast.info('공유 기능은 곧 추가됩니다.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">IEP 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!iepData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">IEP를 찾을 수 없습니다</h3>
            <p className="text-muted-foreground mb-4">요청하신 개별교육계획을 찾을 수 없습니다.</p>
            <Button onClick={() => navigate('/iep-generator')}>
              새 IEP 생성하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/iep-generator')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">개별교육계획서 (IEP)</h1>
              <p className="text-muted-foreground">생성일: {new Date(iepData.created_at).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              공유
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              PDF 다운로드
            </Button>
          </div>
        </div>

        {/* 학생 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>학생 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">이름</label>
                <p className="text-lg font-semibold">{iepData.student_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">나이</label>
                <p className="text-lg font-semibold">{iepData.student_age}세</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IEP 내용 */}
        <div className="space-y-6">
          {/* 현재 수행 수준 */}
          {iepData.current_performance && (
            <Card>
              <CardHeader>
                <CardTitle>현재 수행 수준</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{JSON.stringify(iepData.current_performance)}</p>
              </CardContent>
            </Card>
          )}

          {/* 연간 목표 */}
          {iepData.annual_goals && (
            <Card>
              <CardHeader>
                <CardTitle>연간 목표</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(iepData.annual_goals) ? (
                    iepData.annual_goals.map((goal: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">목표 {index + 1}</h4>
                        <p className="text-muted-foreground">{typeof goal === 'string' ? goal : JSON.stringify(goal)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">{JSON.stringify(iepData.annual_goals)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 특수교육 서비스 */}
          {iepData.special_education_services && (
            <Card>
              <CardHeader>
                <CardTitle>특수교육 서비스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{JSON.stringify(iepData.special_education_services)}</p>
              </CardContent>
            </Card>
          )}

          {/* 평가 수정사항 */}
          {iepData.assessment_modifications && (
            <Card>
              <CardHeader>
                <CardTitle>평가 수정사항</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{JSON.stringify(iepData.assessment_modifications)}</p>
              </CardContent>
            </Card>
          )}

          {/* 편의 제공 */}
          {iepData.accommodations && (
            <Card>
              <CardHeader>
                <CardTitle>편의 제공</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{JSON.stringify(iepData.accommodations)}</p>
              </CardContent>
            </Card>
          )}

          {/* 학생 우려사항 */}
          {iepData.student_concerns && (
            <Card>
              <CardHeader>
                <CardTitle>학부모 우려사항</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{iepData.student_concerns}</p>
              </CardContent>
            </Card>
          )}

          {/* 교사 관찰사항 */}
          {iepData.teacher_observations && (
            <Card>
              <CardHeader>
                <CardTitle>교사 관찰사항</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{iepData.teacher_observations}</p>
              </CardContent>
            </Card>
          )}

          {/* 평가 결과 */}
          {iepData.assessment_results && (
            <Card>
              <CardHeader>
                <CardTitle>평가 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{JSON.stringify(iepData.assessment_results)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IEPView;