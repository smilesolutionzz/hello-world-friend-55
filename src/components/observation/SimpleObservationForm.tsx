import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleObservationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const SimpleObservationForm: React.FC<SimpleObservationFormProps> = ({ onBack, onSuccess }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "관찰일지를 저장하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('observation_logs')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          tags: formData.tags,
          created_at: formData.date
        });

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "관찰일지가 성공적으로 저장되었습니다.",
      });

      // Reset form
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        tags: []
      });
      
      onSuccess();
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">간단 관찰일지</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>관찰 내용 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="예: 오늘의 행동 관찰"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">날짜</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">관찰 내용 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="관찰한 내용을 자유롭게 작성해주세요. 행동, 정서, 상황 등을 포함해서 기록하면 좋습니다."
                rows={6}
                required
              />
              <div className="text-sm text-muted-foreground mt-1">
                {formData.description.length}/500자
              </div>
            </div>

            <div>
              <Label>태그 (선택사항)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="태그 입력"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  추가
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
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
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onBack}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "저장 중..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};