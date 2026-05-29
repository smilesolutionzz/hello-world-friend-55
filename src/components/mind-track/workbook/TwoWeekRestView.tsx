import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, MessageSquareHeart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getRestDayContent, getNextSessionDay } from '@/lib/mindTrack2WeekContent';
import type { MindTrackAudience } from '@/lib/mindTrackDayCopy';

interface Props {
  enrollmentId: string;
  day: number;
  audience: MindTrackAudience;
}

interface PastSession {
  day_number: number;
  feedback: string | null;
}

export default function TwoWeekRestView({ enrollmentId, day, audience }: Props) {
  const navigate = useNavigate();
  const content = getRestDayContent(day, audience);
  const next = getNextSessionDay(day);
  const [lastSession, setLastSession] = useState<PastSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('mind_track_session_logs')
        .select('day_number, feedback')
        .eq('enrollment_id', enrollmentId)
        .lt('day_number', day)
        .eq('step', 'completed')
        .order('day_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) setLastSession(data as PastSession);
    })();
    return () => { cancelled = true; };
  }, [enrollmentId, day]);

  const lastFeedback = lastSession?.feedback || undefined;

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <button
          onClick={() => navigate('/mind-track/dashboard')}
          className="text-sm text-slate-500 hover:text-slate-900 mb-6 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> 대시보드
        </button>

        <div className="mb-6">
          <p className="text-xs tracking-wider text-[#8a7a4d] font-semibold mb-2">DAY {day}</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 break-keep">{content.title}</h1>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-full bg-amber-50">
              <Coffee className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-slate-800 leading-relaxed break-keep">{content.message}</p>
              <p className="text-sm text-slate-500 mt-3 break-keep">{content.reflectionHint}</p>
            </div>
          </div>
        </Card>

        {next && next !== day && (
          <Card className="p-5 mt-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div className="flex-1">
              <p className="text-sm text-slate-500">다음 세션</p>
              <p className="text-base font-semibold text-slate-900">Day {next} · D-{next - day}</p>
            </div>
          </Card>
        )}

        {lastFeedback && (
          <Card className="p-6 mt-4 bg-white border border-[#C8B88A]/40 rounded-2xl">
            <div className="flex items-center gap-2 text-[#8a7a4d] text-sm font-semibold mb-3">
              <MessageSquareHeart className="w-4 h-4" /> 지난 세션 회고 (Day {lastSession?.day_number})
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line break-keep line-clamp-6">
              {lastFeedback}
            </p>
          </Card>
        )}

        <Button
          variant="outline"
          className="w-full mt-6 h-12 rounded-2xl"
          onClick={() => navigate('/mind-track/dashboard')}
        >
          오늘은 여기까지
        </Button>
      </div>
    </div>
  );
}
