import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { X, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JournalModalProps {
  onClose: () => void;
}

export const JournalModal = ({ onClose }: JournalModalProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [moodBefore, setMoodBefore] = useState(50);
  const [moodAfter, setMoodAfter] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      // AI 피드백 요청
      const { data: feedbackData, error: feedbackError } = await supabase.functions.invoke('ai-journal-feedback', {
        body: { content, moodBefore, moodAfter }
      });

      if (feedbackError) throw feedbackError;

      // 일기 저장
      const { error } = await supabase
        .from('metaverse_journals')
        .insert({
          user_id: user.id,
          content,
          mood_before: moodBefore,
          mood_after: moodAfter,
          ai_feedback: feedbackData.feedback
        });

      if (error) throw error;

      setAiFeedback(feedbackData.feedback);

      toast({
        title: "일기가 저장되었습니다",
        description: "AI 피드백을 확인해보세요",
      });
    } catch (error) {
      console.error('Error saving journal:', error);
      toast({
        title: "일기 저장 실패",
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900/95 border border-purple-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            📔 메타버스 일기
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!aiFeedback ? (
          <div className="space-y-6">
            <div>
              <label className="text-white text-sm mb-2 block">오늘 하루는 어땠나요?</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="자유롭게 작성해보세요..."
                className="min-h-[200px] bg-black/30 border-purple-500/30 text-white resize-none"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">일기 쓰기 전 기분: {moodBefore}%</label>
              <Slider
                value={[moodBefore]}
                onValueChange={(v) => setMoodBefore(v[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">일기 쓴 후 기분: {moodAfter}%</label>
              <Slider
                value={[moodAfter]}
                onValueChange={(v) => setMoodAfter(v[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  AI 피드백 받는 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  저장하고 AI 피드백 받기
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI 피드백
              </h4>
              <p className="text-white/90 whitespace-pre-wrap">{aiFeedback}</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={onClose} className="flex-1">
                닫기
              </Button>
              <Button
                onClick={() => {
                  setContent('');
                  setMoodBefore(50);
                  setMoodAfter(50);
                  setAiFeedback('');
                }}
                variant="outline"
                className="flex-1"
              >
                새 일기 작성
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};