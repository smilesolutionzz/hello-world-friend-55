import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Trash2, Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  message_count: number;
  title: string | null;
  transcript: { role: 'user' | 'assistant'; text: string; ts: number }[];
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
const fmtDur = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
};

const VoiceCounselingHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('voice_counseling_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      toast({ title: '불러오기 실패', description: error.message, variant: 'destructive' });
    } else {
      setItems((data as any) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('이 대화를 삭제할까요?')) return;
    const { error } = await supabase.from('voice_counseling_sessions').delete().eq('id', id);
    if (error) {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' });
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF7] via-white to-[#F5F2EC]">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/voice-counseling')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> 뒤로
          </Button>
          <div className="text-sm text-neutral-700">코끼리와의 대화 기록</div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/voice-counseling')} className="gap-1.5">
            <Mic className="w-4 h-4" /> 새 대화
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 break-keep">
            <div className="text-5xl mb-3">🐘</div>
            아직 대화 기록이 없어요. 코끼리와 첫 대화를 시작해보세요.
            <div className="mt-6">
              <Button onClick={() => navigate('/voice-counseling')} className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white">
                대화 시작하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => {
              const open = openId === s.id;
              return (
                <div key={s.id} className="rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenId(open ? null : s.id)}
                    className="w-full text-left p-4 hover:bg-neutral-50 transition-colors flex items-center gap-3"
                  >
                    <MessageCircle className="w-5 h-5 text-[#8B7A4A] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate break-keep">
                        {s.title || '코끼리와의 대화'}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {fmtDate(s.started_at)} · {fmtDur(s.duration_seconds)} · {s.message_count}개 메시지
                      </div>
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-black/5 bg-[#FAFAF7] p-4 space-y-2 max-h-[50vh] overflow-y-auto">
                      {(s.transcript || []).map((m, i) => (
                        <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                          <div
                            className={cn(
                              'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-keep whitespace-pre-wrap',
                              m.role === 'user'
                                ? 'bg-neutral-900 text-white rounded-br-md'
                                : 'bg-white text-neutral-800 rounded-bl-md border border-black/5'
                            )}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-end">
                        <Button onClick={() => remove(s.id)} variant="ghost" size="sm" className="text-red-500 gap-1.5">
                          <Trash2 className="w-4 h-4" /> 삭제
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default VoiceCounselingHistory;
