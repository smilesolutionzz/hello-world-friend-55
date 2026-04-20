import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, FileText, BarChart3, Clock, Users, Brain, 
  Gamepad2, Eye, MessageCircle, ArrowLeft, Loader2, 
  ChevronDown, ChevronUp, Sparkles, AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { useToast } from '@/hooks/use-toast';

interface DataItem {
  id: string;
  source: string;
  label: string;
  detail: string;
  date: string;
  riskLevel?: string;
  selected: boolean;
}

interface DataCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  items: DataItem[];
  expanded: boolean;
}

export default function ComprehensiveReporting() {
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [testRes, personalityRes, observationRes, brainRes, enhancedRes, playRes, progressRes] = await Promise.all([
        supabase.from('test_results').select('id, test_type_id, scores, completed_at, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('personality_test_results').select('id, personality_type, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ai_observation_results').select('id, analysis_type, input_type, title, risk_level, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('brain_training_sessions').select('id, game_type, game_name, score, max_score, session_date, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('assessment_enhanced_analysis').select('id, assessment_type, risk_level, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('play_assessment_results').select('id, age_group, style, cognitive_score, emotional_score, social_score, physical_score, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('progress_tracking').select('id, source_type, source_label, summary, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      // Also fetch test type names
      const testTypeIds = [...new Set((testRes.data || []).map(t => t.test_type_id))];
      let testTypeMap: Record<string, string> = {};
      if (testTypeIds.length > 0) {
        const { data: types } = await supabase.from('test_types').select('id, name').in('id', testTypeIds);
        (types || []).forEach(t => { testTypeMap[t.id] = t.name; });
      }

      const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

      const analysisTypeLabels: Record<string, string> = {
        language_delay: '언어발달 분석',
        motor_function: '운동기능 분석',
        child_behavior: '아동 행동 분석',
      };

      const personalityTypeLabels: Record<string, string> = {
        AIH_CREATIVE_ANALYSIS: 'AIH 창의성 분석',
        TCI_ANALYSIS: 'TCI 기질 분석',
      };

      const newCategories: DataCategory[] = [
        {
          key: 'tests',
          label: '심리검사 결과',
          icon: <Brain className="w-5 h-5" />,
          color: 'text-primary',
          expanded: true,
          items: (testRes.data || []).map(t => ({
            id: t.id,
            source: 'test_results',
            label: testTypeMap[t.test_type_id] || '심리검사',
            detail: t.completed_at ? '완료' : '진행중',
            date: formatDate(t.completed_at || t.created_at),
            selected: true,
          })),
        },
        {
          key: 'personality',
          label: '성격/기질 검사',
          icon: <Users className="w-5 h-5" />,
          color: 'text-violet-500',
          expanded: true,
          items: (personalityRes.data || []).map(t => ({
            id: t.id,
            source: 'personality_test_results',
            label: personalityTypeLabels[t.personality_type] || t.personality_type,
            detail: '완료',
            date: formatDate(t.created_at),
            selected: true,
          })),
        },
        {
          key: 'enhanced',
          label: '심층 분석 리포트',
          icon: <FileText className="w-5 h-5" />,
          color: 'text-amber-500',
          expanded: true,
          items: (enhancedRes.data || []).map(t => ({
            id: t.id,
            source: 'assessment_enhanced_analysis',
            label: t.assessment_type || '심층 분석',
            detail: t.risk_level ? `위험도: ${t.risk_level}` : '완료',
            date: formatDate(t.created_at),
            riskLevel: t.risk_level || undefined,
            selected: true,
          })),
        },
        {
          key: 'observations',
          label: 'AI 관찰 분석',
          icon: <Eye className="w-5 h-5" />,
          color: 'text-emerald-500',
          expanded: true,
          items: (observationRes.data || []).map(t => ({
            id: t.id,
            source: 'ai_observation_results',
            label: t.title || analysisTypeLabels[t.analysis_type] || t.analysis_type,
            detail: `${t.input_type} 기반`,
            date: formatDate(t.created_at),
            riskLevel: t.risk_level || undefined,
            selected: true,
          })),
        },
        {
          key: 'brain',
          label: '두뇌훈련 기록',
          icon: <Gamepad2 className="w-5 h-5" />,
          color: 'text-blue-500',
          expanded: false,
          items: (brainRes.data || []).map(t => ({
            id: t.id,
            source: 'brain_training_sessions',
            label: t.game_name || t.game_type,
            detail: `${t.score}/${t.max_score}점`,
            date: formatDate(t.session_date || t.created_at),
            selected: false,
          })),
        },
        {
          key: 'play',
          label: '놀이 평가',
          icon: <Sparkles className="w-5 h-5" />,
          color: 'text-pink-500',
          expanded: true,
          items: (playRes.data || []).map(t => ({
            id: t.id,
            source: 'play_assessment_results',
            label: `놀이 평가 (${t.age_group || '전연령'})`,
            detail: `인지:${t.cognitive_score} 정서:${t.emotional_score} 사회:${t.social_score} 신체:${t.physical_score}`,
            date: formatDate(t.created_at),
            selected: true,
          })),
        },
        {
          key: 'progress',
          label: '변화 추적 기록',
          icon: <BarChart3 className="w-5 h-5" />,
          color: 'text-orange-500',
          expanded: true,
          items: (progressRes.data || []).map(t => ({
            id: t.id,
            source: 'progress_tracking',
            label: t.source_label || t.source_type || '변화 추적',
            detail: t.summary ? t.summary.substring(0, 40) + '...' : '기록됨',
            date: formatDate(t.created_at),
            selected: true,
          })),
        },
      ].filter(c => c.items.length > 0);

      setCategories(newCategories);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (catKey: string, itemId: string) => {
    setCategories(prev => prev.map(c => 
      c.key === catKey 
        ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, selected: !i.selected } : i) }
        : c
    ));
  };

  const toggleCategory = (catKey: string) => {
    setCategories(prev => prev.map(c => 
      c.key === catKey ? { ...c, expanded: !c.expanded } : c
    ));
  };

  const toggleAllInCategory = (catKey: string, selected: boolean) => {
    setCategories(prev => prev.map(c => 
      c.key === catKey ? { ...c, items: c.items.map(i => ({ ...i, selected })) } : c
    ));
  };

  const selectedCount = categories.reduce((sum, c) => sum + c.items.filter(i => i.selected).length, 0);
  const totalCount = categories.reduce((sum, c) => sum + c.items.length, 0);

  const handleGenerateReport = async () => {
    if (selectedCount === 0) {
      toast({ title: '데이터를 선택해주세요', description: '리포트에 포함할 데이터를 1개 이상 선택해주세요.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGenerateProgress(0);

    try {
      const selectedData: Record<string, string[]> = {};
      categories.forEach(c => {
        const ids = c.items.filter(i => i.selected).map(i => i.id);
        if (ids.length > 0) selectedData[c.key] = ids;
      });

      const steps = [
        { label: '선택된 데이터 수집 중...', progress: 20 },
        { label: '데이터 교차 분석 중...', progress: 45 },
        { label: 'AI 행동 패턴 분석 중...', progress: 70 },
        { label: '맞춤형 리포트 생성 중...', progress: 90 },
        { label: '최종 검증 완료', progress: 100 },
      ];

      for (const step of steps) {
        setGenerateProgress(step.progress);
        await new Promise(r => setTimeout(r, 800));
      }

      const { data, error } = await supabase.functions.invoke('generate-comprehensive-report', {
        body: {
          selectedData,
          selectedCount,
          requestDate: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast({
        title: '맞춤형 행동데이터 리포트 생성 완료! 🎉',
        description: `${selectedCount}개 데이터 소스를 기반으로 리포트가 생성되었습니다.`,
        duration: 5000,
      });
    } catch (err) {
      console.error('Report generation failed:', err);
      toast({
        title: '리포트 생성 중 오류',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGenerateProgress(0);
    }
  };

  const getRiskBadge = (level?: string) => {
    if (!level) return null;
    const map: Record<string, { variant: 'destructive' | 'secondary' | 'default'; text: string }> = {
      high: { variant: 'destructive', text: '주의' },
      medium: { variant: 'secondary', text: '관찰' },
      low: { variant: 'default', text: '양호' },
    };
    const info = map[level] || map.medium;
    return <Badge variant={info.variant} className="text-[10px] px-1.5 py-0">{info.text}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">맞춤형 행동데이터 리포트</h1>
            <p className="text-sm text-muted-foreground">포함할 데이터를 직접 선택하세요</p>
          </div>
        </div>

        {/* Summary Bar */}
        <Card className="mb-4 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  <span className="text-primary text-lg">{selectedCount}</span>
                  <span className="text-muted-foreground text-sm">/{totalCount}개 선택됨</span>
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => categories.forEach(c => toggleAllInCategory(c.key, true))}
                  className="text-xs"
                >
                  전체 선택
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => categories.forEach(c => toggleAllInCategory(c.key, false))}
                  className="text-xs"
                >
                  전체 해제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Data */}
        {categories.length === 0 && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-medium mb-1">아직 데이터가 없습니다</h3>
              <p className="text-sm text-muted-foreground mb-4">
                검사, 관찰, 훈련 등을 진행하면 여기에 표시됩니다.
              </p>
              <Button onClick={() => navigate('/')}>홈으로 이동</Button>
            </CardContent>
          </Card>
        )}

        {/* Data Categories */}
        <div className="space-y-3 mb-6">
          {categories.map(cat => {
            const selectedInCat = cat.items.filter(i => i.selected).length;
            return (
              <Card key={cat.key} className="overflow-hidden">
                {/* Category Header */}
                <button 
                  onClick={() => toggleCategory(cat.key)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={cat.color}>{cat.icon}</span>
                    <span className="font-medium text-sm">{cat.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedInCat}/{cat.items.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAllInCategory(cat.key, selectedInCat !== cat.items.length);
                      }}
                    >
                      {selectedInCat === cat.items.length ? '해제' : '전체'}
                    </Button>
                    {cat.expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Items */}
                {cat.expanded && (
                  <div className="border-t">
                    {cat.items.map((item, idx) => (
                      <label 
                        key={item.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors ${idx !== cat.items.length - 1 ? 'border-b border-border/40' : ''}`}
                      >
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItem(cat.key, item.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{item.label}</span>
                            {getRiskBadge(item.riskLevel)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{item.detail}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Generate Section */}
        {isGenerating && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium">리포트 생성 중...</span>
              </div>
              <Progress value={generateProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {categories.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  선택한 <span className="font-bold text-primary">{selectedCount}개</span> 데이터를 기반으로
                </p>
                <p className="font-medium">맞춤형 행동데이터 리포트를 생성합니다</p>
              </div>

              {/* What's included */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                {[
                  '검사 결과 교차 분석',
                  '행동 패턴 도출',
                  '위험도 종합 평가',
                  '맞춤 개선 전략',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={selectedCount === 0 || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    리포트 생성하기 ({selectedCount}개 데이터 반영)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Process Info */}
        <Card className="mt-4 mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              리포트 생성 과정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { step: 1, title: '데이터 선택', desc: '리포트에 포함할 검사·관찰·훈련 데이터를 직접 선택합니다.' },
              { step: 2, title: 'AI 교차 분석', desc: '선택한 데이터 간 상관관계와 행동 패턴을 분석합니다.' },
              { step: 3, title: '맞춤 리포트 생성', desc: '개인화된 행동데이터 리포트와 개선 전략을 제공합니다.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
