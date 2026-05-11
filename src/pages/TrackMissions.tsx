/**
 * 트랙별 30일 미션 매트릭스 — 체크/검색/다운로드 통합 화면
 * - 9 트랙 × 30일 = 270 미션
 * - 완료 체크 + 트랙별 진행률 (localStorage 영구 저장)
 * - 오늘의 액션 카드 (트랙 시작일 기준 day, 미시작이면 day 1)
 * - 키워드 검색 (전체 270개 across 트랙)
 * - Word(.doc) / PDF 다운로드 per 트랙
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Search, Download, FileText, Check, Calendar, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MIND_TRACK_FOCUSES,
  type MindTrackFocusId,
} from "@/lib/mindTrackFocusTracks";
import {
  TRACK_DAYS,
  ASSESSMENT_DAYS,
  type DayDef,
} from "@/lib/mindTrackTrackContent";
import { downloadResultAsPDF } from "@/utils/pdfDownload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CHILD_MISSIONS_BY_AGE,
  CHILD_WEEKLY_THEMES,
  AGE_BUCKET_LABEL,
  getAgeBucket,
  getAgeYears,
  renderName,
  type ChildAgeBucket,
} from "@/lib/mindTrackChildMissions";
import {
  buildOverrideMap,
  getOverrideDay,
  PAIN_OVERRIDE_DAYS,
  type OverrideMap,
} from "@/lib/childPainPointMissions";
import ChildProfileSetup, { type ChildProfile } from "@/components/mind-track/ChildProfileSetup";
import { Sparkles, UserCog, Info } from "lucide-react";

const STORAGE_KEY = "track-missions:completed:v1";
const START_KEY = "track-missions:started-at:v1";

type CompletedMap = Record<string, boolean>; // key: `${trackId}:${day}` -> true

function loadCompleted(): CompletedMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function loadStartedAt(trackId: MindTrackFocusId): number {
  try {
    const map = JSON.parse(localStorage.getItem(START_KEY) || "{}");
    if (!map[trackId]) {
      map[trackId] = Date.now();
      localStorage.setItem(START_KEY, JSON.stringify(map));
    }
    return map[trackId];
  } catch {
    return Date.now();
  }
}

function getCurrentDay(startedAt: number): number {
  const days = Math.floor((Date.now() - startedAt) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(30, days));
}

function trackProgress(trackId: MindTrackFocusId, completed: CompletedMap): { done: number; pct: number } {
  let done = 0;
  for (let d = 1; d <= 30; d++) if (completed[`${trackId}:${d}`]) done++;
  return { done, pct: Math.round((done / 30) * 100) };
}

export default function TrackMissions() {
  const { toast } = useToast();
  const [completed, setCompleted] = useState<CompletedMap>({});
  const [selected, setSelected] = useState<MindTrackFocusId>("stress");
  const [search, setSearch] = useState("");
  const matrixRef = useRef<HTMLDivElement>(null);

  // Child personalization
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [personalLines, setPersonalLines] = useState<Record<number, string>>({}); // day -> line
  const [aiLoadingDay, setAiLoadingDay] = useState<number | null>(null);

  useEffect(() => {
    setCompleted(loadCompleted());
  }, []);

  // Load child profile when user is signed in
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("user_child_profiles")
        .select("id, child_nickname, birth_date, pain_points, goal_text")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled && data) setChildProfile(data as ChildProfile);
    })();
    return () => { cancelled = true; };
  }, []);

  // Reset cached personal lines when profile changes
  useEffect(() => { setPersonalLines({}); }, [childProfile?.id]);

  const ageBucket: ChildAgeBucket | null = childProfile ? getAgeBucket(childProfile.birth_date) : null;
  const isChildTrack = selected === "child_development";
  const useChildData = isChildTrack && !!childProfile && !!ageBucket;

  const baseDays: DayDef[] = useChildData
    ? CHILD_MISSIONS_BY_AGE[ageBucket!].map((d) => ({
        ...d,
        mission: renderName(d.mission, childProfile!.child_nickname),
        actionTitle: renderName(d.actionTitle, childProfile!.child_nickname),
        actionHowTo: renderName(d.actionHowTo, childProfile!.child_nickname),
      }))
    : TRACK_DAYS[selected];

  const toggle = (trackId: MindTrackFocusId, day: number) => {
    setCompleted((prev) => {
      const next = { ...prev, [`${trackId}:${day}`]: !prev[`${trackId}:${day}`] };
      if (!next[`${trackId}:${day}`]) delete next[`${trackId}:${day}`];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const startedAt = useMemo(() => loadStartedAt(selected), [selected]);
  const currentDay = getCurrentDay(startedAt);
  const todayMission: DayDef = baseDays[currentDay - 1];
  const todayAssessment = ASSESSMENT_DAYS[currentDay] ?? null;

  const focus = MIND_TRACK_FOCUSES.find((f) => f.id === selected)!;
  const { done, pct } = trackProgress(selected, completed);

  const weeklyThemes = useChildData ? CHILD_WEEKLY_THEMES[ageBucket!] : focus.weeklyThemes;

  const fetchPersonalLine = async (day: number) => {
    if (!useChildData || personalLines[day] || aiLoadingDay === day) return;
    setAiLoadingDay(day);
    try {
      const { data, error } = await supabase.functions.invoke("personalize-child-mission", {
        body: {
          childProfileId: childProfile!.id,
          day,
          baseMission: baseDays[day - 1]?.mission ?? "",
        },
      });
      if (error) throw error;
      const line = (data as { personalLine?: string })?.personalLine;
      if (line) setPersonalLines((prev) => ({ ...prev, [day]: line }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI 호출 실패";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setAiLoadingDay(null);
    }
  };

  // Auto-fetch today's personal line when entering child track
  useEffect(() => {
    if (useChildData && !personalLines[currentDay] && aiLoadingDay !== currentDay) {
      fetchPersonalLine(currentDay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useChildData, currentDay, childProfile?.id]);

  // 검색: 전체 270개에서 매칭 (child_development는 연령별로 동적이므로 기본 데이터로만 검색)
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const out: Array<{ trackId: MindTrackFocusId; day: number; def: DayDef; trackLabel: string }> = [];
    for (const f of MIND_TRACK_FOCUSES) {
      TRACK_DAYS[f.id].forEach((def, idx) => {
        const hay = `${def.mission} ${def.actionTitle} ${def.actionHowTo}`.toLowerCase();
        if (hay.includes(q)) {
          out.push({ trackId: f.id, day: idx + 1, def, trackLabel: f.label });
        }
      });
    }
    return out.slice(0, 50);
  }, [search]);

  const downloadWord = () => {
    const rows = baseDays.map((d, i) => {
      const day = i + 1;
      const isAssess = !!ASSESSMENT_DAYS[day];
      const isDone = !!completed[`${selected}:${day}`];
      const personal = useChildData ? (personalLines[day] || "") : "";
      return `<tr style="${isAssess ? "background:#FBF7EA;" : ""}">
        <td style="padding:8px;border:1px solid #DDD;text-align:center;font-weight:600;">${day}${isAssess ? " [진단]" : ""}</td>
        <td style="padding:8px;border:1px solid #DDD;">${d.mission}</td>
        <td style="padding:8px;border:1px solid #DDD;">${d.actionTitle}${personal ? `<br/><em style="color:#C8B88A;">${personal}</em>` : ""}</td>
        <td style="padding:8px;border:1px solid #DDD;">${d.actionHowTo}</td>
        <td style="padding:8px;border:1px solid #DDD;text-align:center;">${d.actionMinutes}분</td>
        <td style="padding:8px;border:1px solid #DDD;text-align:center;">${isDone ? "✓ 완료" : "—"}</td>
      </tr>`;
    }).join("");

    const headerLabel = useChildData
      ? `${childProfile!.child_nickname} (만 ${getAgeYears(childProfile!.birth_date)}세) — ${focus.label}`
      : focus.label;

    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${headerLabel} 30일 미션</title><style>@page{size:A4 landscape;margin:1.5cm;}body{font-family:'Malgun Gothic','맑은 고딕',sans-serif;color:#111;}h1{color:#C8B88A;border-bottom:2px solid #C8B88A;padding-bottom:8px;}h2{color:#111;margin-top:20px;font-size:14pt;}table{width:100%;border-collapse:collapse;font-size:10pt;margin-top:10px;}th{background:#111;color:#fff;padding:8px;border:1px solid #111;}</style></head><body>
      <h1>${headerLabel} — 30일 미션 매트릭스</h1>
      <p style="color:#6B6B6B;">${focus.desc}</p>
      <p>진행률: ${done} / 30 완료 (${pct}%)</p>
      <h2>주차별 핵심 흐름</h2>
      <table><tr><th>Week 1</th><th>Week 2</th><th>Week 3</th><th>Week 4</th></tr><tr>
        ${weeklyThemes.map((t) => `<td style="padding:8px;border:1px solid #DDD;background:#F6F1E3;">${t}</td>`).join("")}
      </tr></table>
      <h2>30일 미션</h2>
      <table>
        <tr><th>Day</th><th>미션</th><th>오늘의 액션</th><th>실행법</th><th>시간</th><th>완료</th></tr>
        ${rows}
      </table>
      <p style="margin-top:30px;color:#888;font-size:9pt;">AIHPRO · 마음트랙 30일 — aihpro.app</p>
    </body></html>`;

    const blob = new Blob(["\ufeff" + html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `마음트랙_${focus.label}_30일미션.doc`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Word 다운로드 시작", description: `${focus.label} 미션표가 저장됩니다.` });
  };

  const downloadPdf = async () => {
    if (!matrixRef.current) return;
    matrixRef.current.id = "track-mission-pdf-target";
    await downloadResultAsPDF(
      "track-mission-pdf-target",
      `마음트랙_${focus.label}_30일미션`,
      () => toast({ title: "PDF 다운로드 완료" }),
      () => toast({ title: "PDF 생성 실패", variant: "destructive" }),
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>마음트랙 30일 미션 매트릭스 | AIHPRO</title>
        <meta name="description" content="9개 트랙 × 30일 = 270개 미션. 트랙별 진행률 저장, 오늘의 액션, Word/PDF 다운로드, 키워드 검색." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> 홈으로
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            마음트랙 30일 미션 매트릭스
          </h1>
          <p className="mt-2 text-muted-foreground">
            9개 트랙 × 30일 = 270개 미션. 체크하면 트랙별 진행률이 자동 저장됩니다.
          </p>
        </header>

        {/* 검색 */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="키워드로 270개 미션 검색 (예: 호흡, 수면, 거절)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-2xl"
            />
          </div>
          {search && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">검색 결과 {searchResults.length}건</p>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={`${r.trackId}-${r.day}`}
                    onClick={() => { setSelected(r.trackId); setSearch(""); }}
                    className="text-left p-3 rounded-xl border hover:border-primary hover:bg-primary/5 transition"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{r.trackLabel}</Badge>
                      <span className="text-xs text-muted-foreground">Day {r.day}</span>
                    </div>
                    <p className="text-sm font-medium">{r.def.mission}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.def.actionTitle} · {r.def.actionHowTo}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 트랙 선택 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-8">
          {MIND_TRACK_FOCUSES.map((f) => {
            const p = trackProgress(f.id, completed);
            const active = f.id === selected;
            return (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                className={`text-left p-3 rounded-2xl border transition ${
                  active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`text-xs ${active ? "text-background/80" : "text-muted-foreground"}`}>{p.done}/30</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-tight">{f.label}</p>
                <Progress value={p.pct} className={`mt-2 h-1 ${active ? "bg-background/20" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* 아이 프로필 배너 (child_development 트랙 전용) */}
        {isChildTrack && (
          <Card className="p-4 md:p-5 mb-4 rounded-2xl border" style={{ borderColor: "#C8B88A", background: "#FBF8EE" }}>
            {childProfile ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-medium tracking-wider" style={{ color: "#C8B88A" }}>맞춤 코칭 활성</p>
                  <p className="font-semibold mt-0.5">
                    {childProfile.child_nickname} · 만 {getAgeYears(childProfile.birth_date)}세 · {ageBucket && AGE_BUCKET_LABEL[ageBucket]}
                  </p>
                  {childProfile.pain_points?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">고민: {childProfile.pain_points.join(" · ")}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
                  <UserCog className="w-4 h-4 mr-1" /> 프로필 수정
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold">아이 정보를 입력하면 미션이 개인화됩니다</p>
                  <p className="text-xs text-muted-foreground mt-1">연령대별 미션 + 매일 AI 맞춤 한 줄</p>
                </div>
                <Button onClick={() => setProfileOpen(true)} style={{ background: "#C8B88A" }}>
                  <Sparkles className="w-4 h-4 mr-1" /> 내 아이에 맞게 시작
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* 오늘의 액션 */}
        <Card className="p-5 md:p-6 mb-6 rounded-2xl border-2" style={{ borderColor: "#C8B88A" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#C8B88A" }}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium tracking-wider" style={{ color: "#C8B88A" }}>
                오늘의 액션 · {focus.label} · Day {currentDay}
              </p>
              <h2 className="mt-1 text-xl md:text-2xl font-bold">{todayMission.actionTitle}</h2>
              <p className="mt-2 text-muted-foreground">{todayMission.actionHowTo}</p>
              {useChildData && (
                <div className="mt-3 p-3 rounded-xl border" style={{ background: "#FBF8EE", borderColor: "#E7DEC4" }}>
                  <p className="text-[11px] font-medium tracking-wider flex items-center gap-1" style={{ color: "#C8B88A" }}>
                    <Sparkles className="w-3 h-3" /> {childProfile!.child_nickname} 맞춤 한 줄
                  </p>
                  <p className="text-sm mt-1">
                    {personalLines[currentDay] || (aiLoadingDay === currentDay ? "AI가 한 줄을 만드는 중..." : "맞춤 한 줄을 불러오는 중...")}
                  </p>
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">미션: {todayMission.mission}</Badge>
                <Badge variant="outline">{todayMission.actionMinutes}분</Badge>
                {todayAssessment && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">진단: {todayAssessment.title}</Badge>
                )}
              </div>
              <Button
                className="mt-4"
                onClick={() => toggle(selected, currentDay)}
                variant={completed[`${selected}:${currentDay}`] ? "secondary" : "default"}
              >
                {completed[`${selected}:${currentDay}`] ? (
                  <><Check className="w-4 h-4 mr-1" /> 오늘 완료됨</>
                ) : (
                  "오늘의 액션 완료 표시"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* 진행률 + 다운로드 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold">{focus.label} — 30일 매트릭스</h3>
            <p className="text-sm text-muted-foreground">진행률 {done}/30 ({pct}%)</p>
            <Progress value={pct} className="mt-2 h-2 w-64" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadWord}>
              <FileText className="w-4 h-4 mr-1" /> Word
            </Button>
            <Button variant="outline" onClick={downloadPdf}>
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
          </div>
        </div>

        {/* 30일 매트릭스 */}
        <div ref={matrixRef} className="bg-white">
          {/* 주차 테마 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {weeklyThemes.map((t, i) => (
              <div key={i} className="p-3 rounded-xl border" style={{ background: "#FBF8EE" }}>
                <p className="text-[10px] font-medium tracking-wider" style={{ color: "#C8B88A" }}>WEEK 0{i + 1}</p>
                <p className="text-sm font-semibold mt-1">{t}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            {baseDays.map((def, i) => {
              const day = i + 1;
              const isAssess = !!ASSESSMENT_DAYS[day];
              const isDone = !!completed[`${selected}:${day}`];
              const isToday = day === currentDay;
              return (
                <Card
                  key={day}
                  className={`p-4 rounded-xl transition ${
                    isDone ? "bg-emerald-50/50 border-emerald-200" : isAssess ? "bg-amber-50/40 border-amber-200" : ""
                  } ${isToday ? "ring-2 ring-foreground/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isDone}
                      onCheckedChange={() => toggle(selected, day)}
                      className="mt-1 h-5 w-5"
                    />
                    <div className="flex-shrink-0 w-12 text-center">
                      <p className="text-[10px] text-muted-foreground">DAY</p>
                      <p className="text-xl font-bold leading-none">{String(day).padStart(2, "0")}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{def.mission}</p>
                        {isAssess && <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">진단</Badge>}
                        {isToday && <Badge className="bg-foreground text-background text-[10px]">오늘</Badge>}
                        <Badge variant="outline" className="text-[10px]">{def.actionMinutes}분</Badge>
                      </div>
                      <p className="text-sm mt-1">
                        <span className="font-medium">{def.actionTitle}</span>
                        <span className="text-muted-foreground"> · {def.actionHowTo}</span>
                      </p>
                      {useChildData && personalLines[day] && (
                        <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: "#FBF8EE", color: "#8A7A4F" }}>
                          <Sparkles className="w-3 h-3 inline mr-1" />{personalLines[day]}
                        </p>
                      )}
                      {useChildData && !personalLines[day] && (
                        <button
                          className="text-xs mt-2 underline"
                          style={{ color: "#C8B88A" }}
                          onClick={() => fetchPersonalLine(day)}
                          disabled={aiLoadingDay === day}
                        >
                          {aiLoadingDay === day ? "생성 중..." : "맞춤 한 줄 보기"}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <ChildProfileSetup
        open={profileOpen}
        initial={childProfile}
        onClose={() => setProfileOpen(false)}
        onSaved={(p) => setChildProfile(p)}
      />
    </div>
  );
}
