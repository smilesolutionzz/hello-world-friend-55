/**
 * VideoFeedbackButton — 영상이 미션과 안 맞다고 느낄 때 신고/피드백
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Flag } from 'lucide-react';

interface Props {
  day: number;
  videoId: string;
}

const REASONS: { value: string; label: string }[] = [
  { value: 'mismatch', label: '미션과 영상이 맞지 않아요' },
  { value: 'low_quality', label: '영상 품질/내용이 별로예요' },
  { value: 'unavailable', label: '재생되지 않거나 삭제된 영상' },
  { value: 'inappropriate', label: '부적절한 내용' },
  { value: 'other', label: '기타' },
];

export default function VideoFeedbackButton({ day, videoId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('mismatch');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (comment.length > 500) {
      toast.error('의견은 500자 이내로 작성해 주세요');
      return;
    }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        toast.error('로그인이 필요합니다');
        return;
      }
      const { error } = await supabase.from('mind_track_video_feedback').insert({
        user_id: u.user.id,
        day,
        video_id: videoId,
        reason_type: reason,
        comment: comment.trim() || null,
      });
      if (error) throw error;
      toast.success('소중한 의견 감사합니다. 더 나은 영상으로 교체하겠습니다.');
      setComment('');
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || '제출 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition"
          aria-label="이 영상 신고/피드백"
        >
          <Flag className="w-3 h-3" />
          미션과 안 맞나요?
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">영상 피드백</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">사유</Label>
            <div className="space-y-1">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 text-sm"
                >
                  <input
                    type="radio"
                    name="feedback-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <span className="break-keep">{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">상세 의견 (선택)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="어떤 점이 아쉬웠는지 알려주세요"
            />
          </div>
          <Button
            onClick={submit}
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
          >
            {saving ? '제출 중...' : '피드백 보내기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
