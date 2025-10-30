import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User, FileText, Camera, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import ShareObservationButton from '@/components/observation/ShareObservationButton';
import { MemoryLegacyRecommendation } from '@/components/cross-promotion/MemoryLegacyRecommendation';

interface ObservationLogProps {
  profileId: string;
  onSave?: () => void;
}

export const ObservationLog: React.FC<ObservationLogProps> = ({ profileId, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    observation_date: new Date().toISOString().split('T')[0],
    duration_minutes: '',
    setting: '',
    observer_name: '',
    child_age_months: '',
    observation_type: 'structured',
    behaviors_observed: '',
    social_interactions: '',
    communication_patterns: '',
    motor_skills_noted: '',
    emotional_responses: '',
    attention_focus: '',
    notable_incidents: '',
    intervention_strategies: '',
    next_steps: '',
    tags: [] as string[],
  });

  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMemoryLegacy, setShowMemoryLegacy] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('observation_sessions')
        .insert({
          user_id: user.id,
          session_type: formData.setting || 'general',
          observations: {
            observation_date: formData.observation_date,
            duration_minutes: parseInt(formData.duration_minutes) || 0,
            setting: formData.setting,
            observer_name: formData.observer_name,
            behaviors_observed: formData.behaviors_observed,
            social_interactions: formData.social_interactions,
            communication_patterns: formData.communication_patterns,
            motor_skills_noted: formData.motor_skills_noted,
            emotional_responses: formData.emotional_responses,
            attention_focus: formData.attention_focus,
            notable_incidents: formData.notable_incidents,
            intervention_strategies: formData.intervention_strategies,
            next_steps: formData.next_steps,
            tags: formData.tags
          }
        } as any);

      if (error) throw error;

      toast({
        title: "관찰일지 저장 완료",
        description: "관찰 내용이 성공적으로 저장되었습니다.",
      });

      // Memory Legacy 추천 표시
      setShowMemoryLegacy(true);

      onSave?.();
    } catch (error) {
      console.error('Error saving observation:', error);
      toast({
        title: "저장 실패",
        description: "관찰일지 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MemoryLegacyRecommendation 
        show={showMemoryLegacy}
        onDismiss={() => setShowMemoryLegacy(false)}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">관찰일지 작성</h2>
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="observation_date">관찰 날짜</Label>
            <Input
              id="observation_date"
              type="date"
              value={formData.observation_date}
              onChange={(e) => handleInputChange('observation_date', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration_minutes">관찰 시간 (분)</Label>
            <Input
              id="duration_minutes"
              type="number"
              placeholder="30"
              value={formData.duration_minutes}
              onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="child_age_months">아동 나이 (개월)</Label>
            <Input
              id="child_age_months"
              type="number"
              placeholder="36"
              value={formData.child_age_months}
              onChange={(e) => handleInputChange('child_age_months', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="setting">관찰 환경</Label>
            <Select value={formData.setting} onValueChange={(value) => handleInputChange('setting', value)}>
              <SelectTrigger>
                <SelectValue placeholder="환경 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">가정</SelectItem>
                <SelectItem value="daycare">어린이집</SelectItem>
                <SelectItem value="kindergarten">유치원</SelectItem>
                <SelectItem value="therapy_center">치료실</SelectItem>
                <SelectItem value="playground">놀이터</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observation_type">관찰 유형</Label>
            <Select value={formData.observation_type} onValueChange={(value) => handleInputChange('observation_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="structured">구조화된 관찰</SelectItem>
                <SelectItem value="natural">자연스러운 관찰</SelectItem>
                <SelectItem value="play_based">놀이 기반 관찰</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observer_name">관찰자</Label>
            <Input
              id="observer_name"
              placeholder="관찰자 이름"
              value={formData.observer_name}
              onChange={(e) => handleInputChange('observer_name', e.target.value)}
              required
            />
          </div>
        </div>

        {/* 관찰 내용 */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="behaviors_observed">관찰된 행동</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.behaviors_observed;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('behaviors_observed', newValue);
                }}
              />
            </div>
            <Textarea
              id="behaviors_observed"
              placeholder="아동이 보인 주요 행동들을 구체적으로 기록해주세요..."
              value={formData.behaviors_observed}
              onChange={(e) => handleInputChange('behaviors_observed', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="social_interactions">사회적 상호작용</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.social_interactions;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('social_interactions', newValue);
                }}
              />
            </div>
            <Textarea
              id="social_interactions"
              placeholder="다른 아이들이나 성인과의 상호작용 패턴을 기록해주세요..."
              value={formData.social_interactions}
              onChange={(e) => handleInputChange('social_interactions', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="communication_patterns">의사소통 패턴</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.communication_patterns;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('communication_patterns', newValue);
                }}
              />
            </div>
            <Textarea
              id="communication_patterns"
              placeholder="언어적/비언어적 의사소통 방식을 기록해주세요..."
              value={formData.communication_patterns}
              onChange={(e) => handleInputChange('communication_patterns', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="motor_skills_noted">운동능력</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.motor_skills_noted;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('motor_skills_noted', newValue);
                }}
                className="ml-2"
              />
            </div>
            <Textarea
              id="motor_skills_noted"
              placeholder="대근육/소근육 운동 능력..."
              value={formData.motor_skills_noted}
              onChange={(e) => handleInputChange('motor_skills_noted', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="emotional_responses">정서적 반응</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.emotional_responses;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('emotional_responses', newValue);
                }}
                className="ml-2"
              />
            </div>
            <Textarea
              id="emotional_responses"
              placeholder="정서 표현 및 조절 능력..."
              value={formData.emotional_responses}
              onChange={(e) => handleInputChange('emotional_responses', e.target.value)}
              rows={2}
            />
          </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="attention_focus">주의집중</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.attention_focus;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('attention_focus', newValue);
                }}
              />
            </div>
            <Textarea
              id="attention_focus"
              placeholder="주의집중 지속 시간, 집중 방해 요인 등을 기록해주세요..."
              value={formData.attention_focus}
              onChange={(e) => handleInputChange('attention_focus', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="notable_incidents">특이사항</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.notable_incidents;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('notable_incidents', newValue);
                }}
              />
            </div>
            <Textarea
              id="notable_incidents"
              placeholder="특별히 주목할 만한 사건이나 행동이 있다면 기록해주세요..."
              value={formData.notable_incidents}
              onChange={(e) => handleInputChange('notable_incidents', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="intervention_strategies">개입 전략</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.intervention_strategies;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('intervention_strategies', newValue);
                }}
              />
            </div>
            <Textarea
              id="intervention_strategies"
              placeholder="사용한 개입 방법이나 전략이 있다면 기록해주세요..."
              value={formData.intervention_strategies}
              onChange={(e) => handleInputChange('intervention_strategies', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="next_steps">향후 계획</Label>
              <VoiceInputButton 
                onTranscription={(text) => {
                  const currentValue = formData.next_steps;
                  const newValue = currentValue ? `${currentValue} ${text}` : text;
                  handleInputChange('next_steps', newValue);
                }}
              />
            </div>
            <Textarea
              id="next_steps"
              placeholder="다음 관찰이나 개입에 대한 계획을 기록해주세요..."
              value={formData.next_steps}
              onChange={(e) => handleInputChange('next_steps', e.target.value)}
              rows={3}
            />
          </div>

          {/* 태그 */}
          <div>
            <Label>태그</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="태그 입력"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? '저장 중...' : '관찰일지 저장'}
          </Button>
        </div>
      </Card>
    </form>
    </>
  );
};