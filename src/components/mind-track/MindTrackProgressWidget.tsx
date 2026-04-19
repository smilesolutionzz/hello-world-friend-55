import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronRight, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function MindTrackProgressWidget() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: wbs } = await supabase
        .from("mind_track_workbooks")
        .select("*, mind_track_enrollments(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (!wbs || wbs.length === 0) { setLoading(false); return; }
      const wb = wbs[0] as any;
      const en = wb.mind_track_enrollments;
      const startedAt = en?.started_at ? new Date(en.started_at) : new Date();
      const currentDay = Math.min(Math.max(Math.floor((Date.now() - startedAt.getTime()) / 86400000) + 1, 1), 30);

      const [{ data: missions }, { data: checkins }] = await Promise.all([
        supabase.from("mind_track_daily_missions").select("*").eq("enrollment_id", en.id).eq("day_number", currentDay).maybeSingle(),
        supabase.from("mind_track_checkins").select("completed").eq("enrollment_id", en.id),
      ]);
      const completed = (checkins ?? []).filter((c) => c.completed).length;

      setData({ workbook: wb, currentDay, todayMission: missions, completed });
      setLoading(false);
    })();
  }, []);

  if (loading || !data) return null;

  return (
    <Card className="p-5 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 mb-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-200">
            <Sparkles className="w-3 h-3 mr-1" /> 30일 마음 트랙
          </Badge>
          <h3 className="font-bold text-slate-900 break-keep">{data.workbook.challenge_theme}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">진행</div>
          <div className="text-xl font-bold text-primary">Day {data.currentDay}/30</div>
        </div>
      </div>
      <Progress value={(data.currentDay / 30) * 100} className="h-1.5 mb-2" />
      <div className="text-xs text-slate-600 mb-3">{data.completed}일 체크인 완료</div>
      {data.todayMission && (
        <div className="p-3 rounded-lg bg-white/70 border border-slate-200 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-1">
            <Target className="w-3.5 h-3.5" /> 오늘의 미션
          </div>
          <div className="text-sm font-medium text-slate-900 break-keep">{data.todayMission.mission_title}</div>
        </div>
      )}
      <Button onClick={() => navigate("/mind-track/workbook")} className="w-full bg-gradient-to-r from-primary to-purple-600">
        워크북 열기 <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Card>
  );
}
