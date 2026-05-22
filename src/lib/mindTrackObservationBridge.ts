/**
 * 7일 마음 트랙 ↔ 관찰일지 브릿지
 *
 * 미션 완료 시 reflection_payload + note를 자연어 노트로 변환해
 * observation_logs 에 자동 저장합니다. 같은 (user, day, enrollment)에 대해서는
 * 태그 매칭으로 update, 없으면 insert (manual upsert).
 *
 * observation_logs는 기존 관찰분석 화면(/observation-analysis)에서
 * 그대로 분석·시각화됩니다.
 */
import { supabase } from "@/integrations/supabase/client";
import type { MissionStepsPayload } from "@/components/mind-track/seven-day/MissionStepsForm";

export function payloadToObservationText(
  payload: MissionStepsPayload | null,
  note: string | null,
): string {
  const lines: string[] = [];
  if (payload?.steps?.length) {
    for (const s of payload.steps) {
      if (s.kind === "check") {
        lines.push(`- ${s.label}: ${s.value ? "완료" : "미완료"}`);
      } else if (s.kind === "list") {
        const items = (s.value as string[]).filter((v) => v?.trim());
        if (items.length) lines.push(`- ${s.label}\n  · ${items.join("\n  · ")}`);
      } else if (s.kind === "chips") {
        const items = s.value as string[];
        if (items.length) lines.push(`- ${s.label}: ${items.join(", ")}`);
      } else if (s.kind === "text") {
        const v = (s.value as string).trim();
        if (v) lines.push(`- ${s.label}\n  ${v}`);
      }
    }
  }
  if (note?.trim()) lines.push(`\n[자유 메모]\n${note.trim()}`);
  return lines.join("\n");
}

interface SyncArgs {
  userId: string;
  enrollmentId: string;
  day: number;
  audience?: string;
  missionTitle?: string | null;
  note: string | null;
  payload: MissionStepsPayload | null;
}

/** mind_track 미션을 observation_logs로 동기화 */
export async function syncCheckinToObservation(args: SyncArgs): Promise<string | null> {
  const description = payloadToObservationText(args.payload, args.note);
  if (!description.trim()) return null;

  const tag = `mind_track:${args.enrollmentId}:day${args.day}`;
  const title = args.missionTitle?.trim()
    ? `[7일 트랙 Day ${args.day}] ${args.missionTitle}`
    : `7일 마음 트랙 Day ${args.day} 관찰`;

  // 기존 동일 일자 기록 검색
  const { data: existing } = await supabase
    .from("observation_logs")
    .select("id")
    .eq("user_id", args.userId)
    .contains("tags", [tag])
    .limit(1)
    .maybeSingle();

  const tags = [
    "mind_track",
    `day_${args.day}`,
    args.audience ? `audience_${args.audience}` : null,
    tag,
  ].filter(Boolean) as string[];

  if (existing?.id) {
    const { error } = await supabase
      .from("observation_logs")
      .update({ title, description, tags })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("observation_logs")
    .insert({
      user_id: args.userId,
      title,
      description,
      session_name: `7일 트랙 · Day ${args.day}`,
      behavior_type: "mind_track_reflection",
      severity: 0,
      tags,
    } as any)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
