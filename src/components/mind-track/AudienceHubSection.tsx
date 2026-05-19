import { useNavigate, useSearchParams } from 'react-router-dom';
import { Baby, Sparkles, HeartPulse, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { trackTrackEntryClick, type TrackAudience } from '@/lib/trackEntryAnalytics';

type Card = {
  audience: TrackAudience;
  to: string;
  icon: typeof Baby;
  label: string;
  title: string;
  desc: string;
  status?: 'beta' | 'soon';
};

const CARDS: Card[] = [
  {
    audience: 'child',
    to: '/mind-track?audience=child',
    icon: Baby,
    label: '아동',
    title: '아이의 발달·정서',
    desc: '0~12세 발달·소통·훈육을 7일 코칭 루틴으로 정돈합니다.',
  },
  {
    audience: 'teen',
    to: '/track/teen',
    icon: Sparkles,
    label: '청소년',
    title: '청소년 자기이해',
    desc: '학업·관계 스트레스를 안전한 자기탐색으로 풀어갑니다.',
    status: 'soon',
  },
  {
    audience: 'adult',
    to: '/track/adult',
    icon: HeartPulse,
    label: '성인',
    title: '번아웃·불안 통합',
    desc: '직장·관계로 지친 어른을 위한 7일 회복 루틴.',
    status: 'beta',
  },
  {
    audience: 'parent',
    to: '/track/parent',
    icon: Users,
    label: '부모',
    title: '부모 번아웃·죄책감',
    desc: '"나부터 채우는" 부모 전용 7일 코칭 트랙.',
    status: 'beta',
  },
];

/**
 * /mind-track 진입 허브.
 * - 4개 audience 카드 노출 (child / teen / adult / parent)
 * - 클릭 시 trackEvent('track_entry_click') + user_analytics_events 기록
 * - ?audience= 파라미터에 따라 현재 카드를 하이라이트
 */
export default function AudienceHubSection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentAudience = (searchParams.get('audience') ?? 'child') as TrackAudience;

  const handleClick = (card: Card) => {
    trackTrackEntryClick({
      audience: card.audience,
      source: 'mind_track_hub',
      destination: card.to,
      from_audience: currentAudience,
    });
    navigate(card.to);
  };

  return (
    <section className="px-4 pb-10 pt-2">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.2em] text-muted-foreground mb-2">
            CHOOSE YOUR TRACK
          </p>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 break-keep">
            누구의 마음을 돌볼까요?
          </h2>
          <p className="text-sm text-slate-500 mt-2 break-keep">
            대상별로 다르게 설계된 4개의 7일 트랙
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CARDS.map((c) => {
            const Icon = c.icon;
            const active = currentAudience === c.audience;
            const isSoon = c.status === 'soon';
            return (
              <button
                key={c.audience}
                onClick={() => handleClick(c)}
                className={[
                  'group text-left rounded-2xl border bg-white p-4 md:p-5 transition-all',
                  active
                    ? 'border-[#C8B88A] ring-2 ring-[#C8B88A]/30 shadow-sm'
                    : 'border-foreground/10 hover:border-foreground/25 hover:shadow-sm',
                ].join(' ')}
                aria-label={`${c.label} 트랙으로 이동`}
                data-audience={c.audience}
                data-source="mind_track_hub"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C8B88A]/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#8a7a4c]" />
                  </div>
                  {c.status && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5 border-foreground/15 text-muted-foreground"
                    >
                      {isSoon ? 'SOON' : 'BETA'}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] tracking-wider text-muted-foreground mb-1">
                  {c.label.toUpperCase()}
                </p>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-1 break-keep">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed break-keep mb-3 line-clamp-3">
                  {c.desc}
                </p>
                <span className="inline-flex items-center text-xs font-medium text-[#8a7a4c]">
                  바로가기
                  <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
