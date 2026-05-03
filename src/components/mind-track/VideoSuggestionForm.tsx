/**
 * VideoSuggestionForm — 사용자 추천 영상 제출
 * 사용자가 추천하고 싶은 유튜브 링크를 제출하면 관리자가 검토 후 큐레이션에 반영합니다.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Youtube, Send } from 'lucide-react';

const extractVideoId = (url: string): string | null => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  return m ? m[1] : null;
};

interface Props {
  defaultDay?: number;
}

export default function VideoSuggestionForm({ defaultDay }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [day, setDay] = useState<string>(defaultDay ? String(defaultDay) : '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error('유튜브 링크를 입력해 주세요');
      return;
    }
    const videoId = extractVideoId(trimmed);
    if (!videoId) {
      toast.error('올바른 YouTube 링크가 아닙니다');
      return;
    }
    if (note.length > 500) {
      toast.error('메모는 500자 이내로 작성해 주세요');
      return;
    }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        toast.error('로그인이 필요합니다');
        return;
      }
      const dayNum = day ? parseInt(day, 10) : null;
      const { error } = await supabase.from('mind_track_video_suggestions').insert({
        user_id: u.user.id,
        youtube_url: trimmed,
        video_id: videoId,
        suggested_for_day: dayNum && dayNum >= 1 && dayNum <= 30 ? dayNum : null,
        note: note.trim() || null,
      });
      if (error) throw error;
      toast.success('추천 감사합니다! 검토 후 큐레이션에 반영하겠습니다.');
      setUrl('');
      setNote('');
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || '제출 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-300 text-sm text-slate-600 hover:border-[#C8B88A] hover:text-slate-900 hover:bg-amber-50/40 transition"
      >
        <Sparkles className="w-4 h-4 text-[#C8B88A]" />
        도움이 됐던 유튜브 영상이 있나요? 추천하기
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Youtube className="w-5 h-5 text-red-600" />
        <h4 className="text-sm font-bold text-slate-900">영상 추천하기</h4>
      </div>
      <p className="text-xs text-slate-500 break-keep">
        제출한 링크는 큐레이션 팀이 검토 후 다른 회원에게도 추천될 수 있습니다.
      </p>
      <div className="space-y-2">
        <Label className="text-xs">YouTube 링크 *</Label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtu.be/..."
          maxLength={500}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="text-xs">추천 Day (선택)</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="1-30"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">메모 (선택)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="이 영상이 어떤 미션에 도움이 됐는지 알려주세요"
          rows={3}
          maxLength={500}
        />
        <p className="text-[10px] text-slate-400 text-right">{note.length}/500</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          className="flex-1"
          disabled={saving}
        >
          취소
        </Button>
        <Button
          onClick={submit}
          disabled={saving}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          {saving ? '제출 중...' : '제출하기'}
        </Button>
      </div>
    </div>
  );
}
