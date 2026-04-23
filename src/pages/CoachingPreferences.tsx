import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useToast } from '@/hooks/use-toast';

const TOPICS = [
  { key: 'stress', label: '스트레스 관리' },
  { key: 'depression', label: '우울감 회복' },
  { key: 'anxiety', label: '불안 완화' },
  { key: 'sleep', label: '수면 개선' },
  { key: 'adhd', label: '집중력·ADHD' },
  { key: 'parenting', label: '양육·정서코칭' },
  { key: 'self_esteem', label: '자존감·자기자비' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: '입문', desc: '쉬운 가이드 위주' },
  { value: 'intermediate', label: '중급', desc: '실천형 콘텐츠' },
  { value: 'advanced', label: '심화', desc: '연구·전문가 강의' },
];

const DURATIONS = [
  { value: 'short', label: '5분 이내' },
  { value: 'medium', label: '5~15분' },
  { value: 'long', label: '15~20분' },
  { value: 'any', label: '상관없음' },
];

const CoachingPreferences: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthGuard();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('beginner');
  const [duration, setDuration] = useState<string>('medium');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await (supabase as any)
        .from('user_video_preferences')
        .select('interest_topics, difficulty_level, preferred_duration')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setTopics(data.interest_topics || []);
        setDifficulty(data.difficulty_level || 'beginner');
        setDuration(data.preferred_duration || 'medium');
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleTopic = (key: string) => {
    setTopics((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: '로그인이 필요합니다', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any)
      .from('user_video_preferences')
      .upsert(
        {
          user_id: user.id,
          interest_topics: topics,
          difficulty_level: difficulty,
          preferred_duration: duration,
        },
        { onConflict: 'user_id' }
      );
    setSaving(false);
    if (error) {
      toast({ title: '저장 실패', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: '선호 설정이 저장되었어요 ✨', description: '내일 추천 영상부터 반영됩니다.' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-5 pt-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> 뒤로
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 데일리 코칭 메일 개인화
          </div>
          <h1 className="text-2xl font-bold mb-2">코칭 영상 추천 설정</h1>
          <p className="text-sm text-muted-foreground leading-relaxed break-keep">
            관심 주제와 난이도, 영상 길이를 설정하면 매일 메일에서 더 잘 맞는 유튜브 영상 2개를 추천해 드려요.
          </p>
        </div>

        <Card className="p-6 mb-5">
          <h2 className="text-base font-semibold mb-4">관심 주제 (복수 선택)</h2>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map((t) => (
              <label
                key={t.key}
                className="flex items-center gap-2.5 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition"
              >
                <Checkbox
                  checked={topics.includes(t.key)}
                  onCheckedChange={() => toggleTopic(t.key)}
                />
                <span className="text-sm font-medium">{t.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-5">
          <h2 className="text-base font-semibold mb-4">난이도</h2>
          <RadioGroup value={difficulty} onValueChange={setDifficulty} className="space-y-2">
            {DIFFICULTIES.map((d) => (
              <label
                key={d.value}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition"
              >
                <RadioGroupItem value={d.value} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{d.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.desc}</div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-base font-semibold mb-4">선호 영상 길이</h2>
          <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-2 gap-2">
            {DURATIONS.map((d) => (
              <label
                key={d.value}
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition"
              >
                <RadioGroupItem value={d.value} />
                <span className="text-sm font-medium">{d.label}</span>
              </label>
            ))}
          </RadioGroup>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />저장 중...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />선호 설정 저장</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CoachingPreferences;
