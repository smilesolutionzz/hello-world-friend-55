import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, Brain, Eye, Gamepad2, Mic,
  BarChart3, FileText, ChevronDown, ChevronUp, Loader2, AlertCircle, Microscope, Heart, MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface DataItem {
  id: string;
  source: string;
  label: string;
  detail: string;
  date: string;
  riskLevel?: string;
  selected: boolean;
}

export interface DataCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  items: DataItem[];
  expanded: boolean;
}

interface ReportDataChecklistProps {
  onSelectionChange: (selectedData: Record<string, string[]>, selectedCount: number, totalCount: number) => void;
}

const analysisTypeLabels: Record<string, string> = {
  language_delay: '언어발달 분석',
  motor_function: '운동기능 분석',
  child_behavior: '아동 행동 분석',
};

const personalityTypeLabels: Record<string, string> = {
  AIH_CREATIVE_ANALYSIS: 'AIH 창의성 분석',
  TCI_ANALYSIS: 'TCI 기질 분석',
};

export default function ReportDataChecklist({ onSelectionChange }: ReportDataChecklistProps) {
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchUserData(); }, []);

  useEffect(() => {
    const selectedData: Record<string, string[]> = {};
    let selectedCount = 0;
    let totalCount = 0;
    categories.forEach(c => {
      const ids = c.items.filter(i => i.selected).map(i => i.id);
      if (ids.length > 0) selectedData[c.key] = ids;
      selectedCount += ids.length;
      totalCount += c.items.length;
    });
    onSelectionChange(selectedData, selectedCount, totalCount);
  }, [categories]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // AIHPRO 7대 데이터 소스: 간편검사, 심층검사, 관찰일지, 게임검사, 음성상담, 고민/인사이트, 고민 리포트
      const [testRes, enhancedRes, observationRes, gameRes, voiceRes, progressRes, insightsRes, concernRes] = await Promise.all([
        // 1. 간편검사 (심리검사 결과)
        supabase.from('test_results').select('id, test_type_id, scores, completed_at, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        // 2. 심층검사 (심층 분석 리포트)
        supabase.from('assessment_enhanced_analysis').select('id, assessment_type, risk_level, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        // 3. 관찰일지 (AI 관찰 분석)
        supabase.from('ai_observation_results').select('id, analysis_type, input_type, title, risk_level, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        // 4. 게임검사 (금쪽상담소 해바라기 마을 - play_assessment_results)
        supabase.from('play_assessment_results').select('id, age_group, style, cognitive_score, emotional_score, social_score, physical_score, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        // 5. 음성상담 (AI 코칭 세션)
        supabase.from('ai_coaching_sessions').select('id, session_type, session_summary, mood_before, mood_after, created_at, completed_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        // 변화 추적 (종단 분석용 보조 데이터)
        supabase.from('progress_tracking').select('id, source_type, source_label, summary, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        // 6. 고민/건강 인사이트 (부모 고민, 상담 인사이트)
        supabase.from('ai_health_insights').select('id, insight_type, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        // 7. 고민 리포트 (메인페이지 고민 입력 → AI 분석)
        supabase.from('concern_storage').select('id, concern_text, analysis_type, analysis_severity, analysis_advice, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      const testTypeIds = [...new Set((testRes.data || []).map(t => t.test_type_id))];
      let testTypeMap: Record<string, string> = {};
      if (testTypeIds.length > 0) {
        const { data: types } = await supabase.from('test_types').select('id, name').in('id', testTypeIds);
        (types || []).forEach(t => { testTypeMap[t.id] = t.name; });
      }

      const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

      const newCategories: DataCategory[] = [
        {
          key: 'tests', label: '간편검사', icon: <Brain className="w-4 h-4" />, color: 'text-blue-600', expanded: true,
          items: (testRes.data || []).map(t => ({ id: t.id, source: 'test_results', label: testTypeMap[t.test_type_id] || '심리검사', detail: t.completed_at ? '완료' : '진행중', date: formatDate(t.completed_at || t.created_at), selected: true })),
        },
        {
          key: 'enhanced', label: '심층검사', icon: <Microscope className="w-4 h-4" />, color: 'text-amber-600', expanded: true,
          items: (enhancedRes.data || []).map(t => ({ id: t.id, source: 'assessment_enhanced_analysis', label: t.assessment_type || '심층 분석', detail: t.risk_level ? `위험도: ${t.risk_level}` : '완료', date: formatDate(t.created_at), riskLevel: t.risk_level || undefined, selected: true })),
        },
        {
          key: 'observations', label: '관찰일지', icon: <Eye className="w-4 h-4" />, color: 'text-emerald-600', expanded: true,
          items: (observationRes.data || []).map(t => ({ id: t.id, source: 'ai_observation_results', label: t.title || analysisTypeLabels[t.analysis_type] || t.analysis_type, detail: `${t.input_type} 기반`, date: formatDate(t.created_at), riskLevel: t.risk_level || undefined, selected: true })),
        },
        {
          key: 'game', label: '게임검사', icon: <Gamepad2 className="w-4 h-4" />, color: 'text-pink-600', expanded: true,
          items: (gameRes.data || []).map(t => ({ id: t.id, source: 'play_assessment_results', label: `게임검사 (${t.age_group || '전연령'})`, detail: `인지:${t.cognitive_score} 정서:${t.emotional_score} 사회:${t.social_score}`, date: formatDate(t.created_at), selected: true })),
        },
        {
          key: 'voice', label: '음성상담', icon: <Mic className="w-4 h-4" />, color: 'text-violet-600', expanded: true,
          items: (voiceRes.data || []).map(t => ({ id: t.id, source: 'ai_coaching_sessions', label: t.session_type === 'voice' ? '음성 상담' : (t.session_type || '상담'), detail: t.mood_before && t.mood_after ? `기분 ${t.mood_before}→${t.mood_after}` : (t.session_summary ? t.session_summary.substring(0, 25) + '...' : '완료'), date: formatDate(t.completed_at || t.created_at), selected: true })),
        },
        {
          key: 'progress', label: '변화 추적', icon: <BarChart3 className="w-4 h-4" />, color: 'text-orange-600', expanded: true,
          items: (progressRes.data || []).map(t => ({ id: t.id, source: 'progress_tracking', label: t.source_label || t.source_type || '변화 추적', detail: t.summary ? t.summary.substring(0, 30) + '...' : '기록됨', date: formatDate(t.created_at), selected: true })),
        },
        {
          key: 'concerns', label: '고민/인사이트', icon: <Heart className="w-4 h-4" />, color: 'text-rose-600', expanded: true,
          items: (insightsRes.data || []).map(t => {
            const typeLabels: Record<string, string> = {
              structured_counseling: '구조화 상담',
              sct_analysis: 'SCT 분석',
              mood_check: '기분 체크',
              concern: '고민 입력',
            };
            return {
              id: t.id,
              source: 'ai_health_insights',
              label: typeLabels[t.insight_type] || t.insight_type || '고민/인사이트',
              detail: t.content ? t.content.substring(0, 30) + '...' : '기록됨',
              date: formatDate(t.created_at),
              selected: true,
            };
          }),
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
      c.key === catKey ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, selected: !i.selected } : i) } : c
    ));
  };

  const toggleCategory = (catKey: string) => {
    setCategories(prev => prev.map(c => c.key === catKey ? { ...c, expanded: !c.expanded } : c));
  };

  const toggleAllInCategory = (catKey: string, selected: boolean) => {
    setCategories(prev => prev.map(c => c.key === catKey ? { ...c, items: c.items.map(i => ({ ...i, selected })) } : c));
  };

  const selectedCount = categories.reduce((sum, c) => sum + c.items.filter(i => i.selected).length, 0);
  const totalCount = categories.reduce((sum, c) => sum + c.items.length, 0);

  const getRiskBadge = (level?: string) => {
    if (!level) return null;
    const map: Record<string, { cls: string; text: string }> = {
      high: { cls: 'bg-red-100 text-red-700 border-red-200', text: '주의' },
      medium: { cls: 'bg-amber-100 text-amber-700 border-amber-200', text: '관찰' },
      low: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: '양호' },
    };
    const info = map[level] || map.medium;
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${info.cls}`}>{info.text}</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400 mb-2" />
        <p className="text-sm text-slate-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <h3 className="font-semibold text-slate-700 mb-1">아직 데이터가 없습니다</h3>
        <p className="text-sm text-slate-500">검사, 관찰, 훈련 등을 진행하면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-semibold text-slate-800">
              <span className="text-lg text-emerald-600">{selectedCount}</span>
              <span className="text-slate-400">/{totalCount}개 선택됨</span>
            </span>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => categories.forEach(c => toggleAllInCategory(c.key, true))}
              className="text-[11px] h-7 px-2.5 border-slate-200 text-slate-600 hover:bg-slate-50">전체 선택</Button>
            <Button variant="outline" size="sm" onClick={() => categories.forEach(c => toggleAllInCategory(c.key, false))}
              className="text-[11px] h-7 px-2.5 border-slate-200 text-slate-600 hover:bg-slate-50">전체 해제</Button>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      {categories.map(cat => {
        const selectedInCat = cat.items.filter(i => i.selected).length;
        return (
          <div key={cat.key} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header */}
            <button
              onClick={() => toggleCategory(cat.key)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={cat.color}>{cat.icon}</span>
                <span className="font-semibold text-sm text-slate-800">{cat.label}</span>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {selectedInCat}/{cat.items.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleAllInCategory(cat.key, selectedInCat !== cat.items.length); }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                >
                  {selectedInCat === cat.items.length ? '해제' : '전체'}
                </button>
                {cat.expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* Items */}
            {cat.expanded && (
              <div className="border-t border-slate-100">
                {cat.items.map((item, idx) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                      idx !== cat.items.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <Checkbox checked={item.selected} onCheckedChange={() => toggleItem(cat.key, item.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate">{item.label}</span>
                        {getRiskBadge(item.riskLevel)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-500">{item.detail}</span>
                        <span className="text-[11px] text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400">{item.date}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
