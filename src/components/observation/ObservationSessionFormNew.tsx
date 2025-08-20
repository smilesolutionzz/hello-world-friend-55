import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Save, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MediaUploader from './MediaUploader';
import SubscriptionGate from './SubscriptionGate';

interface ObservationSessionFormProps {
  template: any;
  onSessionCreated: (sessionId: string) => void;
  onCancel: () => void;
}

const ObservationSessionForm: React.FC<ObservationSessionFormProps> = ({ template, onSessionCreated, onCancel }) => {
  const { toast } = useToast();
  
  const [sessionData, setSessionData] = useState({
    sessionName: '',
    observerName: '',
    observationPeriodStart: '',
    observationPeriodEnd: '',
    notes: ''
  });
  
  const [observationData, setObservationData] = useState<Record<string, number>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [showSubscriptionGate, setShowSubscriptionGate] = useState(false);
  const [usageData, setUsageData] = useState<any>(null);

  // Initialize observation data structure based on template
  useEffect(() => {
    if (template?.items) {
      const initialData: Record<string, number> = {};
      template.items.forEach((item: any) => {
        initialData[item.id] = 3; // Default to middle value
      });
      setObservationData(initialData);
    }
  }, [template]);

  // Check usage and subscription status
  useEffect(() => {
    checkUsageStatus();
  }, []);

  const checkUsageStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Usage check error:', error);
        return;
      }

      const usage = data || { usage_count: 0, status: 'inactive', trial_used: false };
      setUsageData(usage);

      // Show subscription gate if needed
      if ((usage as any).status !== 'active' && (usage as any).usage_count >= 3) {
        setShowSubscriptionGate(true);
      }
    } catch (error) {
      console.error('Usage status check failed:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSessionData(prev => ({ ...prev, [field]: value }));
  };

  const handleObservationChange = (itemId: string, value: number) => {
    setObservationData(prev => ({ ...prev, [itemId]: value }));
  };

  const validateForm = () => {
    if (!sessionData.sessionName.trim()) {
      toast({
        title: "입력 오류",
        description: "관찰명을 입력해주세요.",
        variant: "destructive"
      });
      return false;
    }
    if (!sessionData.observerName.trim()) {
      toast({
        title: "입력 오류", 
        description: "관찰자명을 입력해주세요.",
        variant: "destructive"
      });
      return false;
    }
    if (!sessionData.observationPeriodStart || !sessionData.observationPeriodEnd) {
      toast({
        title: "입력 오류",
        description: "관찰 기간을 설정해주세요.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const saveSession = async (status: string = 'in_progress') => {
    if (!validateForm()) return null;

    setSaving(true);
    try {
      // Check authentication with better UX
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "로그인이 필요합니다",
          description: "데이터를 저장하려면 먼저 로그인해주세요.",
          variant: "destructive",
          action: (
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'}>
              로그인하기
            </Button>
          )
        });
        throw new Error('사용자 인증이 만료되었습니다.');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('프로필을 찾을 수 없습니다.');

      const sessionPayload = {
        profile_id: profile.id,
        template_id: template.id,
        session_name: sessionData.sessionName,
        domain: template.domain,
        observer_name: sessionData.observerName,
        observation_period_start: sessionData.observationPeriodStart,
        observation_period_end: sessionData.observationPeriodEnd,
        status,
        raw_data: observationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('observation_sessions')
        .insert({
          user_id: user.id,
          session_type: 'observation',
          observations: sessionPayload
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: status === 'completed' ? "관찰 완료" : "저장 완료",
        description: status === 'completed' ? 
          "관찰이 완료되었습니다." : 
          "관찰 데이터가 저장되었습니다."
      });

      return data.id;

    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "저장 실패",
        description: error.message || "저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const analyzeSession = async () => {
    if (!validateForm()) return;

    setAnalyzing(true);
    try {
      // First save the session as completed
      const sessionId = await saveSession('completed');
      
      if (!sessionId) {
        throw new Error('Failed to save session');
      }

      console.log('Starting analysis for session:', sessionId);
      
      // Include media files in analysis
      const analysisPayload = {
        sessionId,
        observationData,
        domain: template.domain,
        ageGroup: 'adult', // You might want to make this dynamic
        sessionData: {
          ...sessionData,
          mediaFiles: mediaFiles.filter(f => f.uploaded).map(f => ({
            url: f.url,
            type: f.type,
            description: f.description
          }))
        },
        observerInfo: {
          name: sessionData.observerName,
          period: `${sessionData.observationPeriodStart} - ${sessionData.observationPeriodEnd}`
        }
      };
      
      // Then analyze the data
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('observation-analyzer', {
        body: analysisPayload
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw analysisError;
      }

      console.log('Analysis completed:', analysisData);

      // Update the session with analysis results
      const { error: updateError } = await supabase
        .from('observation_sessions')
        .update({
          ai_analysis: analysisData.analysis,
          analysis_data: analysisData,
          status: 'completed',
          media_files: mediaFiles.filter(f => f.uploaded).map(f => ({
            url: f.url,
            type: f.type,
            description: f.description
          })),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Update usage count for free users
      if (usageData?.subscription_status === 'free') {
        await updateUsageCount();
      }

      // Save to timeline for better data tracking
      await saveObservationToTimeline(sessionId, analysisData);

      toast({
        title: "분석 완료",
        description: "관찰 데이터 분석이 성공적으로 완료되었습니다."
      });

      onSessionCreated(sessionId);

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 실패",
        description: error.message || "분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const updateUsageCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('subscriptions')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Usage count update error:', error);
      }
    } catch (error) {
      console.error('Failed to update usage count:', error);
    }
  };

  const saveObservationToTimeline = async (sessionId: string, analysisData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: family } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('profile_id', profile.id)
        .single();

      await supabase
        .from('timeline_activities')
        .insert({
          family_id: family?.family_id || 'default',
          member_id: profile.id,
          type: 'OBSERVATION',
          title: `관찰일지: ${sessionData.sessionName}`,
          summary: `${template.domain} 영역 관찰 분석 완료`,
          actor: {
            name: sessionData.observerName,
            profile_id: profile.id
          },
          meta: {
            sessionId,
            domain: template.domain,
            observer: sessionData.observerName,
            period: `${sessionData.observationPeriodStart} ~ ${sessionData.observationPeriodEnd}`,
            analysis_summary: analysisData.analysis?.substring(0, 200) + '...',
            template_name: template.name
          },
          score_overall: Math.round((analysisData.averageScore || 0) * 20), // Convert to 0-100 scale
          tags: [template.domain, 'observation'],
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to save to timeline:', error);
    }
  };

  if (showSubscriptionGate) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <SubscriptionGate 
          onProceed={() => setShowSubscriptionGate(false)}
          sessionCount={usageData?.usage_count || 0}
        />
      </div>
    );
  }

  if (!template) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">템플릿을 선택해주세요.</p>
        </CardContent>
      </Card>
    );
  }

  const categories = template.items.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryNames = Object.keys(categories);
  const currentCategory = categoryNames[currentCategoryIndex];
  const currentItems = categories[currentCategory] || [];

  // Calculate progress
  const totalItems = template.items.length;
  const completedItems = Object.keys(observationData).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Get scale labels for current domain
  const getScaleLabels = () => {
    switch (template.domain) {
      case 'child_development':
        return ["전혀 관찰되지 않음", "가끔 관찰됨", "보통 수준", "자주 관찰됨", "항상 관찰됨"];
      case 'psychology':
        return ["전혀 나타나지 않음", "경미하게 나타남", "보통 수준", "자주 나타남", "매우 심각함"];
      case 'elderly_care':
        return ["매우 부족", "부족", "보통", "양호", "매우 양호"];
      default:
        return ["1점", "2점", "3점", "4점", "5점"];
    }
  };

  // Show usage warning for free users
  const showUsageWarning = usageData?.subscription_status === 'free' && usageData?.usage_count >= 2;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Usage Warning */}
      {showUsageWarning && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                무료 체험 마지막 기회입니다! 
                이번이 {3 - (usageData?.usage_count || 0)}번째 관찰일지입니다.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {template.name} - 관찰 기록
          </CardTitle>
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {completedItems}/{totalItems} 완료
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">관찰명 *</label>
              <Input
                value={sessionData.sessionName}
                onChange={(e) => handleInputChange('sessionName', e.target.value)}
                placeholder="예: 김○○ 아동발달 관찰"
              />
            </div>
            <div>
              <label className="text-sm font-medium">관찰자명 *</label>
              <Input
                value={sessionData.observerName}
                onChange={(e) => handleInputChange('observerName', e.target.value)}
                placeholder="관찰자 이름"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">관찰 시작일 *</label>
              <Input
                type="date"
                value={sessionData.observationPeriodStart}
                onChange={(e) => handleInputChange('observationPeriodStart', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">관찰 종료일 *</label>
              <Input
                type="date"
                value={sessionData.observationPeriodEnd}
                onChange={(e) => handleInputChange('observationPeriodEnd', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">추가 메모</label>
            <Textarea
              value={sessionData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="특이사항이나 추가 설명을 입력하세요"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <MediaUploader 
        onMediaChange={setMediaFiles}
        existingMedia={mediaFiles}
      />

      {/* Observation Items */}
      <Card>
        <CardHeader>
          <CardTitle>관찰 항목</CardTitle>
          <div className="flex items-center gap-2">
            {categoryNames.map((categoryName, index) => (
              <Button
                key={categoryName}
                variant={index === currentCategoryIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentCategoryIndex(index)}
              >
                {categoryName}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{currentCategory}</h3>
              <Badge variant="outline">
                {currentItems.length}개 항목
              </Badge>
            </div>

            <div className="space-y-6">
              {currentItems.map((item: any) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{item.text}</h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{getScaleLabels()[0]}</span>
                        <span>{getScaleLabels()[4]}</span>
                      </div>
                      <Slider
                        value={[observationData[item.id] || 3]}
                        onValueChange={(value) => handleObservationChange(item.id, value[0])}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-center space-y-2">
                        <Badge variant="outline">
                          {observationData[item.id] || 3}점
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {getScaleLabels()[(observationData[item.id] || 3) - 1]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentCategoryIndex(Math.max(0, currentCategoryIndex - 1))}
                disabled={currentCategoryIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                이전
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {currentCategoryIndex + 1} / {categoryNames.length}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentCategoryIndex(Math.min(categoryNames.length - 1, currentCategoryIndex + 1))}
                disabled={currentCategoryIndex === categoryNames.length - 1}
              >
                다음
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => saveSession('in_progress')}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '저장 중...' : '임시저장'}
          </Button>

          <Button
            onClick={analyzeSession}
            disabled={analyzing || saving}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {analyzing ? 'AI 분석 중...' : 'AI 분석 시작'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ObservationSessionForm;