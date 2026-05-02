/**
 * 관리자 전용 — Mind Track Day별 콘텐츠 편집 화면
 *
 * 코드 기본값(`mindTrackDailyContent.ts`)은 그대로 유지하고,
 * `mind_track_daily_content_overrides` 테이블에 부분 오버라이드만 저장합니다.
 * 관리자가 한 필드만 바꿔도 나머지 두 필드는 코드 기본값을 그대로 사용해
 * 안전하게 운영할 수 있습니다.
 */

import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, RotateCcw, Loader2, BarChart3, Pencil } from 'lucide-react';
import {
  getDefaultDailyContent,
  mergeDailyOverride,
  type MindTrackDailyContent,
} from '@/lib/mindTrackDailyContent';
import MindTrackContentHistoryPanel from '@/components/admin/MindTrackContentHistoryPanel';
import MindTrackVideoStatsPanel from '@/components/admin/MindTrackVideoStatsPanel';

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

interface OverrideRow {
  day_number: number;
  assessment: MindTrackDailyContent['assessment'] | null;
  video: MindTrackDailyContent['video'] | null;
  action: MindTrackDailyContent['action'] | null;
  is_active: boolean;
}

export default function AdminMindTrackContent() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [tab, setTab] = useState<'edit' | 'stats'>('edit');
  const [day, setDay] = useState(1);
  const [override, setOverride] = useState<OverrideRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const baseContent = useMemo(() => getDefaultDailyContent(day), [day]);
  const merged = useMemo(
    () =>
      mergeDailyOverride(day, {
        assessment: override?.assessment ?? undefined,
        video: override?.video ?? undefined,
        action: override?.action ?? undefined,
      }),
    [day, override],
  );

  // 선택한 day 의 오버라이드 로드
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from('mind_track_daily_content_overrides')
      .select('*')
      .eq('day_number', day)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setOverride((data as unknown as OverrideRow | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [day, isAdmin]);

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  // 변경 직전 스냅샷을 history 에 보관
  const archiveCurrent = async (
    changeType: 'save' | 'delete',
    snapshot: OverrideRow | null,
  ) => {
    if (!snapshot) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('mind_track_daily_content_history').insert({
        day_number: day,
        assessment: snapshot.assessment as never,
        video: snapshot.video as never,
        action: snapshot.action as never,
        is_active: snapshot.is_active,
        change_type: changeType,
        changed_by: user?.id ?? null,
      });
    } catch (e) {
      // 이력 기록 실패는 사용자 흐름을 막지 않음
      console.warn('[AdminMindTrackContent] archive failed', e);
    }
  };

  // 현재 화면 상태(merged)를 오버라이드 row 로 저장
  const handleSave = async () => {
    setSaving(true);
    // 직전 스냅샷 보관 (있을 때만)
    await archiveCurrent('save', override);
    const payload = {
      day_number: day,
      assessment: merged.assessment as never,
      video: merged.video as never,
      action: merged.action as never,
      is_active: true,
    };
    const { error } = await supabase
      .from('mind_track_daily_content_overrides')
      .upsert(payload, { onConflict: 'day_number' });
    setSaving(false);
    if (error) {
      toast({ title: '저장 실패', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Day ' + day + ' 저장 완료', description: '대시보드에 즉시 반영됩니다.' });
    setOverride({ ...payload });
    setHistoryRefreshKey((k) => k + 1);
  };

  // 코드 기본값으로 되돌리기 (DB row 삭제)
  const handleReset = async () => {
    if (!confirm(`Day ${day} 오버라이드를 삭제하고 코드 기본값으로 되돌릴까요?`)) return;
    await archiveCurrent('delete', override);
    const { error } = await supabase
      .from('mind_track_daily_content_overrides')
      .delete()
      .eq('day_number', day);
    if (error) {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' });
      return;
    }
    setOverride(null);
    setHistoryRefreshKey((k) => k + 1);
    toast({ title: '코드 기본값으로 복원' });
  };

  // 부분 필드 업데이트 헬퍼
  const updateAssessment = (patch: Partial<NonNullable<MindTrackDailyContent['assessment']>>) => {
    const current = merged.assessment ?? baseContent.assessment;
    if (!current) return;
    setOverride((prev) => ({
      day_number: day,
      assessment: { ...current, ...patch },
      video: prev?.video ?? null,
      action: prev?.action ?? null,
      is_active: true,
    }));
  };
  const updateVideo = (patch: Partial<MindTrackDailyContent['video']>) => {
    setOverride((prev) => ({
      day_number: day,
      assessment: prev?.assessment ?? null,
      video: { ...merged.video, ...patch },
      action: prev?.action ?? null,
      is_active: true,
    }));
  };
  const updateAction = (patch: Partial<MindTrackDailyContent['action']>) => {
    setOverride((prev) => ({
      day_number: day,
      assessment: prev?.assessment ?? null,
      video: prev?.video ?? null,
      action: { ...merged.action, ...patch },
      is_active: true,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-1" /> 관리자</Link>
            </Button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900">
                Mind Track · Day별 콘텐츠 편집
              </h1>
              <p className="text-xs text-slate-500">
                코드 기본값 위에 오버라이드만 저장됩니다. 빈 필드는 코드 기본값을 그대로 사용해요.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 탭 */}
            <div className="hidden md:flex items-center gap-1 mr-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setTab('edit')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  tab === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                <Pencil className="w-3 h-3" /> 편집
              </button>
              <button
                onClick={() => setTab('stats')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  tab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                <BarChart3 className="w-3 h-3" /> 영상 통계
              </button>
            </div>
            {tab === 'edit' && (
              <>
                <Button variant="outline" size="sm" onClick={handleReset} disabled={!override}>
                  <RotateCcw className="w-4 h-4 mr-1" /> 기본값
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  저장
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {tab === 'stats' ? (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <MindTrackVideoStatsPanel />
        </div>
      ) : (
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[180px_1fr] gap-6">
        {/* Day 사이드바 */}
        <aside className="bg-white rounded-xl border p-2 h-fit md:sticky md:top-24 max-h-[70vh] overflow-y-auto">
          <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2 py-1">
            30일 전체
          </p>
          <div className="grid grid-cols-5 md:grid-cols-3 gap-1">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`text-xs font-semibold rounded-lg py-2 transition-colors ${
                  d === day
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </aside>

        {/* 편집 영역 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Day {String(day).padStart(2, '0')}
                </h2>
                {override ? (
                  <Badge className="bg-amber-100 text-amber-800 border-0">오버라이드 적용</Badge>
                ) : (
                  <Badge variant="outline">코드 기본값</Badge>
                )}
              </div>

              {/* 검사 */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">01 · 오늘의 검사</h3>
                  {merged.assessment ? (
                    <button
                      className="text-xs text-rose-600 hover:underline"
                      onClick={() =>
                        setOverride((prev) => ({
                          day_number: day,
                          assessment: null,
                          video: prev?.video ?? null,
                          action: prev?.action ?? null,
                          is_active: true,
                        }))
                      }
                    >
                      검사 없음으로 비우기
                    </button>
                  ) : (
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() =>
                        updateAssessment(
                          baseContent.assessment ?? {
                            route: '/assessment',
                            title: '검사 제목',
                            desc: '한 줄 설명',
                            minutes: 5,
                            why: '왜 오늘?',
                          },
                        )
                      }
                    >
                      검사 추가
                    </button>
                  )}
                </div>
                {merged.assessment && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="제목">
                      <Input
                        value={merged.assessment.title}
                        onChange={(e) => updateAssessment({ title: e.target.value })}
                      />
                    </Field>
                    <Field label="라우트">
                      <Input
                        value={merged.assessment.route}
                        onChange={(e) => updateAssessment({ route: e.target.value })}
                      />
                    </Field>
                    <Field label="소요 시간(분)">
                      <Input
                        type="number"
                        min={1}
                        value={merged.assessment.minutes}
                        onChange={(e) =>
                          updateAssessment({ minutes: parseInt(e.target.value) || 1 })
                        }
                      />
                    </Field>
                    <Field label="설명">
                      <Input
                        value={merged.assessment.desc}
                        onChange={(e) => updateAssessment({ desc: e.target.value })}
                      />
                    </Field>
                    <Field label="왜 오늘?" className="md:col-span-2">
                      <Textarea
                        rows={2}
                        value={merged.assessment.why}
                        onChange={(e) => updateAssessment({ why: e.target.value })}
                      />
                    </Field>
                  </div>
                )}
              </Card>

              {/* 영상 */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">02 · 오늘의 영상</h3>
                  <a
                    href={`https://www.youtube.com/watch?v=${merged.video.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    유튜브에서 미리보기 →
                  </a>
                </div>
                <div className="grid md:grid-cols-[160px_1fr] gap-4">
                  <img
                    src={`https://i.ytimg.com/vi/${merged.video.videoId}/hqdefault.jpg`}
                    alt=""
                    className="w-full aspect-video object-cover rounded-lg bg-slate-100"
                  />
                  <div className="grid gap-3">
                    <Field label="유튜브 videoId">
                      <Input
                        value={merged.video.videoId}
                        onChange={(e) => updateVideo({ videoId: e.target.value.trim() })}
                      />
                    </Field>
                    <Field label="제목">
                      <Input
                        value={merged.video.title}
                        onChange={(e) => updateVideo({ title: e.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="채널">
                        <Input
                          value={merged.video.channel}
                          onChange={(e) => updateVideo({ channel: e.target.value })}
                        />
                      </Field>
                      <Field label="러닝타임">
                        <Input
                          value={merged.video.durationLabel}
                          onChange={(e) => updateVideo({ durationLabel: e.target.value })}
                        />
                      </Field>
                    </div>
                    <Field label="큐레이션 이유">
                      <Textarea
                        rows={2}
                        value={merged.video.reason}
                        onChange={(e) => updateVideo({ reason: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              </Card>

              {/* 액션 */}
              <Card className="p-5 space-y-3">
                <h3 className="font-bold text-slate-900">03 · 5분 액션</h3>
                <div className="grid md:grid-cols-[1fr_140px] gap-3">
                  <Field label="제목">
                    <Input
                      value={merged.action.title}
                      onChange={(e) => updateAction({ title: e.target.value })}
                    />
                  </Field>
                  <Field label="소요(분)">
                    <Input
                      type="number"
                      min={1}
                      value={merged.action.minutes}
                      onChange={(e) =>
                        updateAction({ minutes: parseInt(e.target.value) || 1 })
                      }
                    />
                  </Field>
                </div>
                <Field label="실천 방법">
                  <Textarea
                    rows={3}
                    value={merged.action.howTo}
                    onChange={(e) => updateAction({ howTo: e.target.value })}
                  />
                </Field>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-slate-600 mb-1 block">{label}</Label>
      {children}
    </div>
  );
}
