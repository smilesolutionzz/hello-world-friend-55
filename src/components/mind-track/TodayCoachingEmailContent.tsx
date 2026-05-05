import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, Brain, Clock, Target, Sunset, Loader2, PlayCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VideoItem {
  videoId: string;
  title?: string;
  channelTitle?: string;
  thumbnail?: string;
  duration?: string;
}

interface EmailContent {
  day_number: number;
  subject: string | null;
  category_label: string | null;
  mission_summary: string | null;
  mission_content: string | null;
  why_today: string | null;
  micro_script: string[] | null;
  key_actions: string[] | null;
  expected_outcome: string | null;
  evening_reflection: string | null;
  insight_content: string | null;
  research_base: string | null;
  videos: VideoItem[] | null;
  send_date: string;
}

/**
 * 오늘 발송된 데일리 코칭 메일 콘텐츠를 대시보드에 그대로 노출.
 * email_send_log 와 daily_coaching_email_log 의 단일 진실원천을 활용.
 * 메일을 안 열어도 모든 박사급 코칭 콘텐츠를 대시보드에서 확인 가능.
 */
export default function TodayCoachingEmailContent() {
  const [content, setContent] = useState<EmailContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("daily_coaching_email_log")
        .select("day_number, subject, category_label, mission_summary, mission_content, why_today, micro_script, key_actions, expected_outcome, evening_reflection, insight_content, research_base, videos, send_date")
        .eq("user_id", user.id)
        .eq("status", "sent")
        .order("send_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setContent(data as any);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="px-4 pb-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  if (!content) {
    return (
      <section className="px-4 pb-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 text-center">
          <Mail className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 break-keep">
            오늘의 코칭 메일이 아직 도착하지 않았어요. 매일 아침 자동 발송됩니다.
          </p>
        </div>
      </section>
    );
  }

  const microScript = Array.isArray(content.micro_script) ? content.micro_script : [];
  const keyActions = Array.isArray(content.key_actions) ? content.key_actions : [];
  const videos = Array.isArray(content.videos) ? content.videos : [];

  return (
    <section className="px-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* 헤더 */}
        <div className="px-6 md:px-8 pt-6 pb-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#C8B88A]/15 flex items-center justify-center">
            <Mail className="w-4 h-4 text-[#8B7838]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              오늘 받은 코칭 메일
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">
              Day {String(content.day_number).padStart(2, "0")} · {content.category_label || "오늘의 미션"}
            </p>
          </div>
        </div>

        <div className="px-6 md:px-8 py-6 space-y-6">
          {/* 01. 오늘의 미션 */}
          {(content.mission_summary || content.mission_content) && (
            <Block label="01" title="오늘의 미션" icon={<Sparkles className="w-4 h-4" />}>
              {content.mission_summary && (
                <p className="text-base font-bold text-slate-900 break-keep leading-snug mb-2">
                  {content.mission_summary}
                </p>
              )}
              {content.mission_content && (
                <p className="text-sm text-slate-700 break-keep leading-relaxed whitespace-pre-line">
                  {content.mission_content}
                </p>
              )}
            </Block>
          )}

          {/* 02. 왜 오늘 이 미션인가 */}
          {content.why_today && (
            <Block label="02" title="왜 오늘 이 미션인가" icon={<Brain className="w-4 h-4" />}>
              <p className="text-sm text-slate-700 break-keep leading-relaxed">
                {content.why_today}
              </p>
            </Block>
          )}

          {/* 03. 5분 실행 스크립트 */}
          {microScript.length > 0 && (
            <Block label="03" title="5분 실행 스크립트" icon={<Clock className="w-4 h-4" />}>
              <ol className="space-y-2 bg-slate-900 rounded-2xl p-4">
                {microScript.map((step, i) => (
                  <li key={i} className="text-sm text-slate-100 break-keep leading-relaxed flex gap-3">
                    <span className="text-[#C8B88A] font-mono text-xs flex-shrink-0 mt-0.5">
                      {String(i).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {/* 04. 핵심 행동 */}
          {keyActions.length > 0 && (
            <Block label="04" title="핵심 행동" icon={<Target className="w-4 h-4" />}>
              <ul className="space-y-1.5">
                {keyActions.map((a, i) => (
                  <li key={i} className="text-sm text-slate-700 break-keep leading-relaxed flex gap-2">
                    <span className="text-[#8B7838] mt-0.5">·</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {/* 05. 기대 변화 */}
          {content.expected_outcome && (
            <Block label="05" title="오늘 기대할 수 있는 변화" icon={<Sparkles className="w-4 h-4" />}>
              <p className="text-sm text-slate-700 break-keep leading-relaxed">
                {content.expected_outcome}
              </p>
            </Block>
          )}

          {/* 06. 추천 영상 */}
          {videos.length > 0 && (
            <Block label="06" title="오늘의 추천 영상" icon={<PlayCircle className="w-4 h-4" />}>
              <div className="space-y-2">
                {videos.slice(0, 3).map((v) => (
                  <a
                    key={v.videoId}
                    href={`https://www.youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 p-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    {v.thumbnail && (
                      <img src={v.thumbnail} alt="" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2 break-keep leading-snug">
                        {v.title || "추천 영상"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {v.channelTitle}{v.duration ? ` · ${v.duration}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 self-center flex-shrink-0" />
                  </a>
                ))}
              </div>
            </Block>
          )}

          {/* 07. 저녁 회고 */}
          {content.evening_reflection && (
            <Block label="07" title="오늘 저녁의 한 줄 회고" icon={<Sunset className="w-4 h-4" />}>
              <p className="text-sm text-slate-700 break-keep leading-relaxed italic">
                "{content.evening_reflection}"
              </p>
            </Block>
          )}

          {/* 인사이트 + 근거 */}
          {(content.insight_content || content.research_base) && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              {content.insight_content && (
                <p className="text-xs text-slate-600 break-keep leading-relaxed">
                  {content.insight_content}
                </p>
              )}
              {content.research_base && (
                <p className="text-[11px] text-slate-400 break-keep">
                  근거: {content.research_base}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function Block({
  label,
  title,
  icon,
  children,
}: {
  label: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono font-bold text-[#8B7838] tracking-wider">{label}</span>
        <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{title}</p>
      </div>
      <div className="pl-7">{children}</div>
    </div>
  );
}
