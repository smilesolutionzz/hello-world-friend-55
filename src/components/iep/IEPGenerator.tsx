import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Brain, Target, Users, Clock, CheckCircle, Coins, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTokens } from '@/hooks/useTokens';
import { TOKEN_COSTS } from '@/constants/tokenCosts';
import TokenGate from '@/components/TokenGate';

interface IEPGeneratorProps {
  assessmentResults?: Record<string, any>;
  onGenerated?: (iepId: string) => void;
}

const IEPGenerator = ({ assessmentResults = {}, onGenerated }: IEPGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 기본 정보
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentGender, setStudentGender] = useState('');
  const [disability, setDisability] = useState('');
  
  // 현재 수행 수준
  const [currentAcademic, setCurrentAcademic] = useState('');
  const [currentSocial, setCurrentSocial] = useState('');
  const [currentBehavior, setCurrentBehavior] = useState('');
  const [currentLife, setCurrentLife] = useState('');
  
  // 관찰 및 우려사항
  const [parentConcerns, setParentConcerns] = useState('');
  const [teacherObservations, setTeacherObservations] = useState('');
  const [strengths, setStrengths] = useState('');
  const [needs, setNeeds] = useState('');
  
  // 관찰일지
  const [observationLogs, setObservationLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  const { consumeTokens, checkTokenAvailability, loading: tokenLoading } = useTokens();

  // 관찰일지 데이터 로드
  useEffect(() => {
    loadObservationLogs();
  }, []);

  const loadObservationLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // observation_sessions에서 AI 분석이 완료된 관찰일지만 가져오기
      const { data: sessions, error } = await supabase
        .from('observation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_type', 'observation')
        .not('observations->ai_analysis', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // observation_logs에서도 AI 분석이 완료된 데이터 가져오기
      const { data: logs, error: logsError } = await supabase
        .from('observation_logs')
        .select('*')
        .eq('user_id', user.id)
        .not('analysis_data->ai_analysis', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      // 두 데이터를 합쳐서 최신순으로 정렬
      const allObservations = [
        ...(sessions || []).map(session => ({
          id: session.id,
          type: 'session',
          session_name: (session.observations as any)?.session_name || '관찰 세션',
          target_name: (session.observations as any)?.target_name,
          ai_analysis: (session.observations as any)?.ai_analysis,
          created_at: session.created_at,
          raw_data: (session.observations as any)?.raw_data || session.summary
        })),
        ...(logs || []).map(log => ({
          id: log.id,
          type: 'log',
          session_name: log.session_name || '관찰 기록',
          target_name: (log as any).analysis_data?.target_name,
          ai_analysis: (log as any).analysis_data?.ai_analysis,
          created_at: log.created_at,
          raw_data: (log as any).raw_data
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setObservationLogs(allObservations);

      // 첫 번째 관찰일지에서 대상자 이름과 나이 자동 입력
      if (allObservations.length > 0 && allObservations[0].target_name) {
        setStudentName(allObservations[0].target_name);
      }

    } catch (error) {
      console.error('관찰일지 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIEP = async () => {
    if (!studentName || !studentAge) {
      toast({
        title: "입력 필요",
        description: "학생 이름과 나이를 필수로 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 관찰일지 최소 요구사항 제거 (검사 결과만으로도 생성 가능)
    // if (observationLogs.length < 3) {
    //   toast({
    //     title: "관찰일지 부족",
    //     description: "맞춤형 IEP 생성을 위해 최소 3개의 관찰일지 분석이 필요합니다.",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    // 무료 기능으로 변경 - 토큰 소진 제거
    // const tokenConsumed = await consumeTokens(TOKEN_COSTS.IEP_GENERATION);
    // if (!tokenConsumed) {
    //   toast({
    //     title: "토큰 부족",
    //     description: `IEP 생성에는 ${TOKEN_COSTS.IEP_GENERATION}토큰이 필요합니다.`,
    //     variant: "destructive"
    //   });
    //   return;
    // }

    setIsGenerating(true);

    try {
      // 관찰일지 데이터를 분석용으로 구조화
      const observationData = observationLogs.slice(0, 5).map(log => ({
        session_name: log.session_name,
        target_name: log.target_name,
        ai_analysis: log.ai_analysis,
        raw_data: log.raw_data,
        created_at: log.created_at
      }));

      const { data, error } = await supabase.functions.invoke('generate-iep', {
        body: {
          studentName,
          studentAge: parseInt(studentAge),
          studentGrade,
          studentGender,
          disability,
          assessmentResults,
          observationLogs: observationData,
          parentConcerns: parentConcerns.split('\n').filter(c => c.trim()),
          teacherObservations: teacherObservations.split('\n').filter(o => o.trim()),
          strengths: strengths.split('\n').filter(s => s.trim()),
          needs: needs.split('\n').filter(n => n.trim()),
          currentPerformance: {
            academic: currentAcademic,
            social: currentSocial,
            behavior: currentBehavior,
            life: currentLife
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "맞춤형 IEP 생성 완료",
          description: observationLogs.length > 0 
            ? `${observationLogs.length}개의 관찰일지를 기반으로 개별교육계획이 생성되었습니다.`
            : "검사 결과를 기반으로 개별교육계획이 생성되었습니다.",
        });
        
        if (onGenerated) {
          onGenerated(data.iep.id);
        }
      } else {
        throw new Error(data.error || 'IEP 생성에 실패했습니다');
      }

    } catch (error) {
      console.error('IEP 생성 오류:', error);
      toast({
        title: "오류 발생",
        description: "IEP 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-muted-foreground mt-4">관찰일지 데이터를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  // 무료 기능으로 변경 - TokenGate 제거
  // if (!checkTokenAvailability(TOKEN_COSTS.IEP_GENERATION)) {
  //   return (
  //     <TokenGate
  //       tokensRequired={TOKEN_COSTS.IEP_GENERATION}
  //       featureName="맞춤형 IEP 생성"
  //       onProceed={handleGenerateIEP}
  //       category="premium"
  //     />
  //   );
  // }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-primary" />
          <CardTitle className="text-2xl">개별교육계획(IEP) 생성기</CardTitle>
          <Badge className="bg-green-500">무료</Badge>
        </div>
        <p className="text-muted-foreground">
          {observationLogs.length > 0 
            ? `${observationLogs.length}개의 관찰일지 분석 결과와 검사 결과를 바탕으로 AI가 맞춤형 개별교육계획을 생성합니다`
            : "검사 결과를 바탕으로 AI가 맞춤형 개별교육계획을 생성합니다"
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 관찰일지 연결 상태 */}
        {observationLogs.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <Eye className="w-5 h-5" />
                연결된 관찰일지 ({observationLogs.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {observationLogs.slice(0, 3).map((log, index) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium">{log.session_name}</p>
                      <p className="text-sm text-muted-foreground">
                        대상자: {log.target_name} | {new Date(log.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <Badge variant="secondary">AI 분석 완료</Badge>
                  </div>
                ))}
                {observationLogs.length > 3 && (
                  <p className="text-sm text-green-700 text-center">
                    외 {observationLogs.length - 3}개의 관찰일지가 더 연결되어 있습니다.
                  </p>
                )}
              </div>
              <p className="text-sm text-green-700 mt-3">
                관찰일지와 검사 결과를 함께 활용하여 더 정확한 IEP를 생성합니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 학생 기본 정보 */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">📋 학생 기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">학생 이름 *</Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="예: 홍길동"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentAge">나이 *</Label>
                <Input
                  id="studentAge"
                  type="number"
                  value={studentAge}
                  onChange={(e) => setStudentAge(e.target.value)}
                  placeholder="예: 8"
                  min="3"
                  max="22"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentGrade">학년</Label>
                <Input
                  id="studentGrade"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  placeholder="예: 초등학교 2학년"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentGender">성별</Label>
                <Input
                  id="studentGender"
                  value={studentGender}
                  onChange={(e) => setStudentGender(e.target.value)}
                  placeholder="예: 남 / 여"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="disability">진단명 / 장애 유형</Label>
                <Input
                  id="disability"
                  value={disability}
                  onChange={(e) => setDisability(e.target.value)}
                  placeholder="예: 자폐스펙트럼장애, ADHD, 학습장애 등"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 현재 수행 수준 */}
        <Card className="bg-gradient-to-br from-green-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-lg">📊 현재 수행 수준 평가</CardTitle>
            <p className="text-sm text-muted-foreground">학생의 현재 능력과 수준을 각 영역별로 작성해주세요</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentAcademic">학업 영역 (읽기, 쓰기, 수학 등)</Label>
              <Textarea
                id="currentAcademic"
                value={currentAcademic}
                onChange={(e) => setCurrentAcademic(e.target.value)}
                placeholder="예: 한글 자모음 인지 가능, 단어 읽기 어려움. 수 개념은 10까지 이해."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSocial">사회성 및 의사소통</Label>
              <Textarea
                id="currentSocial"
                value={currentSocial}
                onChange={(e) => setCurrentSocial(e.target.value)}
                placeholder="예: 또래와의 상호작용 제한적, 눈맞춤 가능하나 대화 지속 어려움"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentBehavior">행동 및 정서</Label>
              <Textarea
                id="currentBehavior"
                value={currentBehavior}
                onChange={(e) => setCurrentBehavior(e.target.value)}
                placeholder="예: 집중 시간 5-10분, 좌석 이탈 빈번, 정서적으로 안정적"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLife">일상생활 및 자립</Label>
              <Textarea
                id="currentLife"
                value={currentLife}
                onChange={(e) => setCurrentLife(e.target.value)}
                placeholder="예: 식사, 화장실 사용 독립적 가능. 옷 입기는 부분 도움 필요"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 강점 및 지원 필요 영역 */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-lg">💪 강점 및 지원 필요 영역</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strengths">학생의 강점 (한 줄씩)</Label>
              <Textarea
                id="strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="예:&#10;시각적 학습 능력 우수&#10;규칙적인 일과 선호&#10;음악 활동 흥미 높음"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="needs">지원이 필요한 영역 (한 줄씩)</Label>
              <Textarea
                id="needs"
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                placeholder="예:&#10;언어 표현 능력 향상&#10;또래 상호작용 기술&#10;집중력 및 과제 지속성"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* 관찰 및 우려사항 */}
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50">
          <CardHeader>
            <CardTitle className="text-lg">👨‍👩‍👧 부모 및 교사 의견</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentConcerns">부모 우려사항 (한 줄씩)</Label>
              <Textarea
                id="parentConcerns"
                value={parentConcerns}
                onChange={(e) => setParentConcerns(e.target.value)}
                placeholder="예:&#10;언어 발달이 또래보다 느림&#10;사회적 상호작용이 어려움&#10;특정 소리나 촉감에 민감함"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacherObservations">교사 관찰 내용 (한 줄씩)</Label>
              <Textarea
                id="teacherObservations"
                value={teacherObservations}
                onChange={(e) => setTeacherObservations(e.target.value)}
                placeholder="예:&#10;집중 시간이 짧고 산만함&#10;또래와의 놀이 선호하지 않음&#10;시각 자료 사용 시 이해도 향상"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* IEP 특징 안내 */}
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              생성될 IEP 구성요소
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                현재 수행 수준 분석
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                연간 목표 설정
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                단기 목표 및 평가기준
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                특수교육 서비스 계획
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                관련 서비스 추천
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                평가 수정사항 제안
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 무료 안내 */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">완전 무료 서비스</h3>
                <p className="text-green-800 text-sm">
                  IEP 생성은 <strong>완전 무료</strong>입니다. 
                  {observationLogs.length > 0 
                    ? `${observationLogs.length}개의 관찰일지와 검사 결과를 종합하여 맞춤형 교육계획을 제공합니다.`
                    : "검사 결과를 바탕으로 맞춤형 교육계획을 제공합니다."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 생성 버튼 */}
        <Button
          onClick={handleGenerateIEP}
          disabled={isGenerating || !studentName || !studentAge}
          className="w-full py-8 text-xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:shadow-lg transition-all"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 animate-spin" />
              <div>
                <div>AI로 맞춤형 IEP 생성 중...</div>
                <div className="text-sm font-normal opacity-90">그래프와 이미지 생성 포함 (약 90초 소요)</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <div>AI 맞춤형 IEP 생성하기 (완전 무료)</div>
                <div className="text-sm font-normal opacity-90">
                  {observationLogs.length > 0 
                    ? `${observationLogs.length}개 관찰일지 + 검사 결과 + 그래프 + 이미지 생성`
                    : "검사 결과 기반 + 그래프 + AI 이미지 생성"
                  }
                </div>
              </div>
            </div>
          )}
        </Button>

        {/* 안내사항 */}
        <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg">
          <p className="mb-2">
            <strong>안내사항:</strong>
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>생성된 IEP는 초안으로, 전문가의 검토와 수정이 필요합니다</li>
            <li>검사 결과를 바탕으로 개별화된 교육계획을 작성합니다</li>
            {observationLogs.length > 0 && (
              <li>연결된 {observationLogs.length}개의 관찰일지가 있어 더 정확한 IEP를 생성할 수 있습니다</li>
            )}
            <li>생성 후 언제든지 내용을 수정하고 업데이트할 수 있습니다</li>
            <li>IEP는 학교와 가정에서 공유하여 일관된 지원을 제공합니다</li>
            <li>완전 무료로 이용 가능합니다</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default IEPGenerator;