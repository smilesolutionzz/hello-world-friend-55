import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Send, ArrowLeft, AlertCircle } from "lucide-react";

// Timeline save function
const saveObservationToTimeline = async (sessionId: string, sessionName: string, observerName: string, sessionData: any, mediaFiles: any[], progress: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('timeline_activities')
      .insert({
        family_id: 'temp-family-id',
        type: 'NOTE',
        title: `관찰일지: ${sessionName}`,
        summary: `${observerName}가 작성한 관찰 기록입니다. 관찰 기간: ${sessionData.observation_period_start} ~ ${sessionData.observation_period_end}`,
        tags: ['관찰일지', '행동관찰'],
        files: mediaFiles.map(file => ({
          url: file.url,
          type: file.type === 'image' ? 'image' : 'video',
          name: file.name
        })),
        actor: { role: 'user', name: observerName || user.email || '사용자' },
        meta: { 
          session_id: sessionId,
          observation_items: Object.keys(sessionData).length,
          completion_rate: Math.round(progress)
        }
      });

    console.log('Observation saved to timeline');
  } catch (error) {
    console.error('Error saving observation to timeline:', error);
  }
};

interface ObservationSessionFormProps {
  template: any;
  onSessionCreated: () => void;
  onCancel: () => void;
}

const ObservationSessionForm = ({ template, onSessionCreated, onCancel }: ObservationSessionFormProps) => {
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState({
    session_name: '',
    observer_name: '',
    observation_period_start: '',
    observation_period_end: '',
    notes: ''
  });
  const [observationData, setObservationData] = useState<any>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [showSubscriptionGate, setShowSubscriptionGate] = useState(false);
  const [usageData, setUsageData] = useState<any>(null);

  const categories = template.items || [];
  const totalItems = categories.reduce((sum: number, cat: any) => sum + (cat.items?.length || 0), 0);
  const completedItems = Object.keys(observationData).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  useEffect(() => {
    // Initialize observation data structure
    const initialData: any = {};
    categories.forEach((category: any) => {
      category.items?.forEach((item: any) => {
        initialData[item.id] = 3; // Default to middle value
      });
    });
    setObservationData(initialData);
  }, [template]);

  const handleInputChange = (field: string, value: string) => {
    setSessionData(prev => ({ ...prev, [field]: value }));
  };

  const handleObservationChange = (itemId: string, value: number) => {
    setObservationData((prev: any) => ({ ...prev, [itemId]: value }));
  };

  const validateForm = () => {
    if (!sessionData.session_name.trim()) {
      toast({
        title: "입력 오류",
        description: "관찰명을 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }
    if (!sessionData.observer_name.trim()) {
      toast({
        title: "입력 오류",
        description: "관찰자명을 입력해주세요.",
        variant: "destructive",
      });
      return false;
    }
    if (!sessionData.observation_period_start || !sessionData.observation_period_end) {
      toast({
        title: "입력 오류",
        description: "관찰 기간을 설정해주세요.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const saveSession = async (status: string = 'in_progress') => {
    if (!validateForm()) return null;

    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('인증이 필요합니다.');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('프로필을 찾을 수 없습니다.');

      const sessionPayload = {
        profile_id: profile.id,
        template_id: template.id,
        session_name: sessionData.session_name,
        domain: template.domain,
        observer_name: sessionData.observer_name,
        observation_period_start: sessionData.observation_period_start,
        observation_period_end: sessionData.observation_period_end,
        status,
        raw_data: observationData
      };

      const { data, error } = await supabase
        .from('observation_sessions')
        .insert(sessionPayload)
        .select()
        .single();

      if (error) throw error;

      // Save to timeline when completed
      if (status === 'completed' && data) {
        await saveObservationToTimeline(
          data.id,
          sessionData.session_name,
          sessionData.observer_name,
          sessionData,
          mediaFiles,
          progress
        );
      }

      toast({
        title: status === 'completed' ? "관찰 완료" : "저장 완료",
        description: status === 'completed' ? 
          "관찰이 완료되었습니다." : 
          "관찰 데이터가 저장되었습니다.",
      });

      return data;
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "저장 오류",
        description: "관찰 데이터 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const analyzeSession = async () => {
    const session = await saveSession('completed');
    if (!session) return;

    try {
      setAnalyzing(true);

      const { data, error } = await supabase.functions.invoke('observation-analyzer', {
        body: {
          observationData,
          domain: template.domain,
          ageGroup: 'adult', // This should be determined based on context
          observerInfo: {
            name: sessionData.observer_name,
            period: `${sessionData.observation_period_start} ~ ${sessionData.observation_period_end}`
          }
        }
      });

      if (error) throw error;

      // Update session with analysis results
      const { error: updateError } = await supabase
        .from('observation_sessions')
        .update({
          status: 'analyzed',
          analysis_data: data,
          ai_analysis: data.analysis,
          recommendations: data.recommendations
        })
        .eq('id', session.id);

      if (updateError) throw updateError;

      toast({
        title: "분석 완료",
        description: "AI 분석이 완료되었습니다.",
      });

      onSessionCreated();
    } catch (error) {
      console.error('Error analyzing session:', error);
      toast({
        title: "분석 오류",
        description: "AI 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const currentCategory = categories[currentCategoryIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">새 관찰 세션</h2>
          <p className="text-muted-foreground">{template.name}</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm text-muted-foreground">
              {completedItems}/{totalItems} 항목
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session_name">관찰명 *</Label>
              <Input
                id="session_name"
                value={sessionData.session_name}
                onChange={(e) => handleInputChange('session_name', e.target.value)}
                placeholder="예: 김○○ 아동발달 관찰"
              />
            </div>
            <div>
              <Label htmlFor="observer_name">관찰자명 *</Label>
              <Input
                id="observer_name"
                value={sessionData.observer_name}
                onChange={(e) => handleInputChange('observer_name', e.target.value)}
                placeholder="관찰자 이름"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">관찰 시작일 *</Label>
              <Input
                id="start_date"
                type="date"
                value={sessionData.observation_period_start}
                onChange={(e) => handleInputChange('observation_period_start', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">관찰 종료일 *</Label>
              <Input
                id="end_date"
                type="date"
                value={sessionData.observation_period_end}
                onChange={(e) => handleInputChange('observation_period_end', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">추가 메모</Label>
            <Textarea
              id="notes"
              value={sessionData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="특이사항이나 추가 설명을 입력하세요"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>관찰 영역</CardTitle>
            <div className="text-sm text-muted-foreground">
              {currentCategoryIndex + 1} / {categories.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category: any, index: number) => (
              <Button
                key={index}
                variant={index === currentCategoryIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentCategoryIndex(index)}
              >
                {category.category}
              </Button>
            ))}
          </div>

          {currentCategory && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{currentCategory.category}</h3>
                <Badge variant="outline">
                  {currentCategory.items?.length || 0}개 항목
                </Badge>
              </div>

              <div className="space-y-4">
                {currentCategory.items?.map((item: any, index: number) => (
                  <Card key={item.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.text}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            현재 점수: {observationData[item.id] || 3}점
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Slider
                          value={[observationData[item.id] || 3]}
                          onValueChange={(value) => handleObservationChange(item.id, value[0])}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1점 (매우 부족)</span>
                          <span>3점 (보통)</span>
                          <span>5점 (매우 우수)</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          모든 항목을 확인한 후 분석을 요청하세요
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => saveSession('in_progress')}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? '저장 중...' : '임시저장'}
          </Button>
          
          <Button 
            onClick={analyzeSession}
            disabled={saving || analyzing}
            className="bg-primary"
          >
            <Send className="h-4 w-4 mr-2" />
            {analyzing ? 'AI 분석 중...' : '분석 요청'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ObservationSessionForm;