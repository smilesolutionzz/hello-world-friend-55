import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Brain, Target, Users, Clock, CheckCircle, Coins } from 'lucide-react';
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
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [parentConcerns, setParentConcerns] = useState('');
  const [teacherObservations, setTeacherObservations] = useState('');
  const { toast } = useToast();
  const { consumeTokens, checkTokenAvailability, loading: tokenLoading } = useTokens();

  const handleGenerateIEP = async () => {
    if (!studentName || !studentAge) {
      toast({
        title: "입력 필요",
        description: "학생 이름과 나이를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    // 토큰 소진 시도
    const tokenConsumed = await consumeTokens(TOKEN_COSTS.IEP_GENERATION);
    if (!tokenConsumed) {
      toast({
        title: "토큰 부족",
        description: `IEP 생성에는 ${TOKEN_COSTS.IEP_GENERATION}토큰이 필요합니다.`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-iep', {
        body: {
          studentName,
          studentAge: parseInt(studentAge),
          assessmentResults,
          parentConcerns: parentConcerns.split('\n').filter(c => c.trim()),
          teacherObservations: teacherObservations.split('\n').filter(o => o.trim()),
          currentPerformance: {}
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "IEP 생성 완료",
          description: `개별교육계획이 성공적으로 생성되었습니다. (${TOKEN_COSTS.IEP_GENERATION}토큰 소진)`,
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

  // 토큰 확인 컴포넌트
  if (!checkTokenAvailability(TOKEN_COSTS.IEP_GENERATION)) {
    return (
      <TokenGate
        tokensRequired={TOKEN_COSTS.IEP_GENERATION}
        featureName="IEP 생성"
        onProceed={handleGenerateIEP}
        category="premium"
      />
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-primary" />
          <CardTitle className="text-2xl">개별교육계획(IEP) 생성기</CardTitle>
        </div>
        <p className="text-muted-foreground">
          평가 결과를 바탕으로 AI가 맞춤형 개별교육계획을 생성합니다
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 평가 결과 요약 */}
        {Object.keys(assessmentResults).length > 0 && (
          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                연결된 평가 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(assessmentResults).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 학생 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">학생 이름 *</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="학생의 이름을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentAge">나이 *</Label>
            <Input
              id="studentAge"
              type="number"
              value={studentAge}
              onChange={(e) => setStudentAge(e.target.value)}
              placeholder="학생의 나이를 입력하세요"
              min="3"
              max="22"
            />
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parentConcerns">부모 우려사항</Label>
            <Textarea
              id="parentConcerns"
              value={parentConcerns}
              onChange={(e) => setParentConcerns(e.target.value)}
              placeholder="부모가 걱정하는 부분들을 한 줄씩 입력하세요&#10;예: 언어 발달이 늦음&#10;사회적 상호작용 어려움"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherObservations">교사 관찰 내용</Label>
            <Textarea
              id="teacherObservations"
              value={teacherObservations}
              onChange={(e) => setTeacherObservations(e.target.value)}
              placeholder="교사의 관찰 내용을 한 줄씩 입력하세요&#10;예: 집중력이 짧음&#10;또래와의 놀이 선호"
              rows={4}
            />
          </div>
        </div>

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

        {/* 토큰 안내 */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900">토큰 사용 안내</h3>
                <p className="text-amber-800 text-sm">
                  IEP 생성에는 <strong>{TOKEN_COSTS.IEP_GENERATION}토큰</strong>이 소진됩니다. 
                  고품질 AI 분석으로 맞춤형 교육계획을 제공합니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 생성 버튼 */}
        <Button
          onClick={handleGenerateIEP}
          disabled={isGenerating || !studentName || !studentAge || tokenLoading}
          className="w-full py-6 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 animate-spin" />
              IEP 생성 중... (약 30초 소요)
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              개별교육계획(IEP) 생성하기 ({TOKEN_COSTS.IEP_GENERATION}토큰)
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
            <li>평가 결과와 입력 정보를 종합하여 개별화된 계획을 작성합니다</li>
            <li>생성 후 언제든지 내용을 수정하고 업데이트할 수 있습니다</li>
            <li>IEP는 학교와 가정에서 공유하여 일관된 지원을 제공합니다</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default IEPGenerator;