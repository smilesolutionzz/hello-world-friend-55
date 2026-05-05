import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Img,
  Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://aihpro.app'
const TRACK_URL = 'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/track-daily-coaching'

interface YouTubeVideoData {
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  reason?: string
}

interface DailyCoachingProps {
  nickname?: string
  dayNumber?: number
  totalDays?: number
  categoryLabel?: string
  missionSummary?: string
  mission?: string
  whyToday?: string
  microScript?: string[]
  keyActions?: string[]
  insight?: string
  researchBase?: string
  expectedOutcome?: string
  eveningReflection?: string
  videos?: YouTubeVideoData[]
  trackingToken?: string
}

/**
 * Build a YouTube watch URL with UTM tracking parameters that will be
 * forwarded to /mind-track when the user comes back to log today's record.
 *
 * NOTE: YouTube ignores extra query params on watch URLs, but they are
 * preserved in the referrer / Lovable email click logs, which is enough
 * for downstream analytics to attribute the click to a specific videoId
 * + day.
 */
const buildYouTubeUrl = (videoId: string, dayLabel: string) => {
  const params = new URLSearchParams({
    v: videoId,
    utm_source: 'daily_email',
    utm_medium: 'email',
    utm_campaign: 'daily_coaching_video',
    utm_content: videoId,
    aih_day: dayLabel,
  })
  return `https://www.youtube.com/watch?${params.toString()}`
}

const buildMindTrackUrl = (
  dayLabel: string,
  source: 'cta' | 'after_video',
  videoId?: string,
) => {
  const params = new URLSearchParams({
    utm_source: 'daily_email',
    utm_medium: 'email',
    utm_campaign: 'daily_coaching',
    utm_content: source,
    day: dayLabel,
  })
  if (videoId) params.set('after_video', videoId)
  return `${SITE_URL}/mind-track/dashboard?${params.toString()}`
}

const DailyCoachingEmail = ({
  nickname = '회원',
  dayNumber = 1,
  totalDays = 30,
  categoryLabel = '스트레스 회복탄력성',
  missionSummary = '오늘 5분으로 마음을 정돈하기',
  mission = '오늘은 5분간 호흡에 집중하며 현재 감정 강도를 1~10점으로 기록해보세요.',
  whyToday = '오늘은 자기관찰의 기초를 쌓는 단계입니다. 어제까지의 알아차림 위에, 오늘 한 번 더 호흡을 통해 현재로 돌아오는 회로를 강화합니다.',
  microScript = [
    '0:00 — 휴대폰 무음, 등 펴고 앉기',
    '0:30 — 코로 4초 들숨, 6초 날숨 3회',
    '1:30 — 지금 감정을 한 단어로 호명',
    '3:00 — 1~10점으로 강도 기록',
    '4:30 — 한 줄 변화 노트 작성',
  ],
  keyActions = ['타이머 5분 설정', '호흡에 주의 집중', '전·후 감정 점수 기록'],
  insight = '일관된 자기 관찰 기록은 30일 후 평균 23%의 증상 완화를 가져옵니다.',
  researchBase = 'Kabat-Zinn MBSR 프로그램',
  expectedOutcome = '5분 뒤, 어깨와 턱의 긴장이 풀리고 감정 강도가 1~2점 정도 내려간 것을 감지할 수 있습니다.',
  eveningReflection = '오늘 미션 전과 후, 내 몸의 어디가 가장 다르게 느껴졌는가?',
  videos = [],
  trackingToken,
}: DailyCoachingProps) => {
  const wrapTrack = (url: string) =>
    trackingToken
      ? `${TRACK_URL}?t=${encodeURIComponent(trackingToken)}&e=click&u=${encodeURIComponent(url)}`
      : url
  const openPixelUrl = trackingToken
    ? `${TRACK_URL}?t=${encodeURIComponent(trackingToken)}&e=open`
    : null
  const progressPct = Math.min(100, Math.round((dayNumber / totalDays) * 100))
  const dayLabel = String(dayNumber).padStart(2, '0')
  const firstVideoId = videos?.[0]?.videoId

  return (
    <Html lang="ko" dir="ltr">
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Head>
      <Preview>{`Day ${dayLabel} · ${categoryLabel} · 오늘의 미션`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>AIHPRO Daily Coaching</Text>
          <Text style={subEyebrow}>{`${nickname}님 · ${categoryLabel} 트랙`}</Text>

          <Section style={dayBlock}>
            <Heading as="h1" style={dayHeading}>
              {`Day ${dayLabel}`}
            </Heading>
            <Text style={dayMeta}>{`/ ${totalDays}일 트랙`}</Text>
          </Section>

          <Section style={progressTrack}>
            <Section style={{ ...progressFill, width: `${progressPct}%` }} />
          </Section>

          <Section style={summaryBlock}>
            <Text style={summaryEyebrow}>오늘의 한 줄</Text>
            <Text style={summaryText}>{missionSummary}</Text>
          </Section>

          <Section style={missionBlock}>
            <Text style={sectionLabel}>01 · 오늘의 미션</Text>
            <Text style={missionText}>{mission}</Text>
          </Section>

          {whyToday && (
            <Section style={whyBlock}>
              <Text style={sectionLabel}>02 · 왜 하필 오늘 이 미션인가</Text>
              <Text style={whyText}>{whyToday}</Text>
            </Section>
          )}

          {microScript && microScript.length >= 3 && (
            <Section style={scriptBlock}>
              <Text style={sectionLabel}>03 · 5분 실행 스크립트</Text>
              {microScript.slice(0, 6).map((line, i) => (
                <Text key={i} style={scriptLine}>{line}</Text>
              ))}
            </Section>
          )}

          <Section style={actionsBlock}>
            <Text style={sectionLabel}>04 · 핵심 행동 3</Text>
            {keyActions.slice(0, 3).map((a, i) => (
              <table key={i} cellPadding={0} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                <tbody>
                  <tr>
                    <td style={actionNumber}>{i + 1}</td>
                    <td style={actionText}>{a}</td>
                  </tr>
                </tbody>
              </table>
            ))}
          </Section>

          <Section style={insightBlock}>
            <Text style={sectionLabel}>05 · 임상적 근거</Text>
            <Text style={insightText}>{insight}</Text>
            <Text style={researchText}>{`근거 기반: ${researchBase}`}</Text>
          </Section>

          {expectedOutcome && (
            <Section style={outcomeBlock}>
              <Text style={sectionLabel}>06 · 끝낸 직후 기대되는 변화</Text>
              <Text style={outcomeText}>{expectedOutcome}</Text>
            </Section>
          )}

          <Section style={videosBlock}>
            <Text style={sectionLabel}>07 · 오늘의 추천 영상</Text>
            {videos && videos.length > 0 ? (
              <>
                <Text style={videoIntro}>오늘 미션과 가장 잘 맞는 영상을 골랐어요. 시청 후 아래 "오늘의 기록 남기기"에서 한 줄 기록을 남겨주세요.</Text>
                {videos.map((v) => {
                  const thumb = v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
                  const watchUrl = wrapTrack(buildYouTubeUrl(v.videoId, dayLabel))
                  return (
                    <Section key={v.videoId} style={videoCard}>
                      <Link href={watchUrl} style={videoThumbLink}>
                        <Img
                          src={thumb}
                          alt={v.title}
                          width="512"
                          height="288"
                          style={thumbStyle}
                        />
                      </Link>
                      <Section style={videoTextBlock}>
                        <Link href={watchUrl} style={videoTitleLink}>
                          <Text style={videoTitle}>{v.title}</Text>
                        </Link>
                        <Text style={videoChannel}>{v.channelTitle}</Text>
                        {v.reason && (
                          <Text style={videoReason}>{`▸ ${v.reason}`}</Text>
                        )}
                        <Section style={videoActionRow}>
                          <Link href={watchUrl} style={videoPrimaryBtn}>
                            ▶ YouTube에서 영상 보기
                          </Link>
                        </Section>
                      </Section>
                    </Section>
                  )
                })}
              </>
            ) : (
              <Text style={videoIntro}>오늘은 추천 영상 대신 미션 실천에 집중해 보세요. 내일은 새로운 큐레이션 영상이 도착합니다.</Text>
            )}
          </Section>

          {eveningReflection && (
            <Section style={reflectionBlock}>
              <Text style={sectionLabel}>08 · 잠들기 전 한 줄 회고</Text>
              <Text style={reflectionText}>{`"${eveningReflection}"`}</Text>
            </Section>
          )}

          <Section style={recordCallout}>
            <Text style={recordCalloutLabel}>09 · 오늘의 기록</Text>
            <Text style={recordCalloutText}>
              미션 또는 영상을 마친 뒤, 아래 버튼을 눌러 오늘 느낀 변화를 한 줄로 기록해 주세요. 30일간의 변화 그래프가 자동으로 누적됩니다.
            </Text>
            <Button
              href={wrapTrack(buildMindTrackUrl(dayLabel, 'cta', firstVideoId))}
              style={ctaButton}
            >
              오늘의 기록 남기기 →
            </Button>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>
            본 메일은 의료 진단·치료를 대체하지 않으며, 발달 코칭 및 자기관찰 도구로 제공됩니다.
            <br />© AIHPRO · 매일 아침 8시(KST) 자동 발송
          </Text>
          {openPixelUrl && (
            <Img src={openPixelUrl} alt="" width="1" height="1" style={{ display: 'block', width: '1px', height: '1px', opacity: 0 }} />
          )}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: DailyCoachingEmail,
  subject: (data: Record<string, any>) =>
    `[Day ${String(data?.dayNumber ?? 1).padStart(2, '0')}] ${data?.categoryLabel ?? '코칭'} - 오늘의 미션`,
  displayName: '데일리 코칭 메일',
  previewData: {
    nickname: '테스트',
    dayNumber: 7,
    totalDays: 30,
    categoryLabel: '스트레스 회복탄력성',
    missionSummary: '5분 호흡으로 오늘의 긴장을 풀어내기',
    mission:
      '오늘은 마음챙김 호흡을 5분간 시도하고, 호흡 전후의 긴장감을 1~10점으로 기록해보세요.',
    whyToday:
      'Day 07은 1주차 자각 훈련을 마무리하고 2주차 실험으로 넘어가는 분수령입니다. 어제까지 쌓은 신체 관찰을 바탕으로, 오늘은 호흡으로 의도적 휴지(休止)를 만들어 반응 사이의 틈을 확보합니다.',
    microScript: [
      '0:00 — 휴대폰 무음, 등 펴고 의자에 앉기',
      '0:30 — 코로 4초 들숨, 6초 날숨 3회',
      '1:30 — 지금 감정을 한 단어로 호명',
      '3:00 — 1~10점으로 강도 기록',
      '4:30 — 한 줄 변화 노트 작성',
    ],
    keyActions: ['타이머 5분 설정하기', '호흡에만 주의 집중', '전·후 긴장도 점수 기록'],
    insight:
      'Kabat-Zinn MBSR 프로그램 연구에 따르면, 매일 5분의 마음챙김 호흡 훈련은 8주 후 코르티솔 수치를 평균 19% 감소시킵니다.',
    researchBase: 'Kabat-Zinn MBSR 프로그램',
    expectedOutcome:
      '5분 뒤, 어깨와 턱의 긴장이 풀리고 호흡이 깊어지며 감정 강도가 1~2점 정도 내려간 것을 감지할 수 있습니다.',
    eveningReflection: '오늘 미션 전과 후, 내 몸의 어디가 가장 다르게 느껴졌는가?',
    videos: [
      {
        videoId: 'inpok4MKVLM',
        title: '5분 마음챙김 호흡 명상',
        channelTitle: '명상 채널',
        thumbnail: 'https://i.ytimg.com/vi/inpok4MKVLM/mqdefault.jpg',
        reason: '오늘 미션과 직접 연결되는 5분 가이드 명상',
      },
    ],
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, 'Pretendard Variable', Inter, 'Segoe UI', sans-serif",
  color: '#0f172a',
  margin: 0,
  padding: 0,
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }
const eyebrow = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}
const subEyebrow = { fontSize: '13px', color: '#475569', margin: '0 0 24px' }
const dayBlock = { margin: '0 0 6px' }
const dayHeading = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '42px',
  fontWeight: 600,
  color: '#0f172a',
  lineHeight: 1,
  margin: 0,
  display: 'inline-block',
}
const dayMeta = {
  fontSize: '13px',
  color: '#94a3b8',
  display: 'inline-block',
  marginLeft: '12px',
}
const progressTrack = {
  height: '4px',
  background: '#f1f5f9',
  borderRadius: '99px',
  margin: '18px 0 32px',
  overflow: 'hidden' as const,
}
const progressFill = {
  height: '4px',
  background: 'linear-gradient(90deg,#0f172a,#3b82f6)',
}
const missionBlock = {
  borderLeft: '3px solid #0f172a',
  padding: '4px 0 4px 16px',
  margin: '0 0 28px',
}
const sectionLabel = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}
const missionText = {
  fontSize: '16px',
  lineHeight: 1.65,
  color: '#0f172a',
  fontWeight: 500,
  margin: 0,
}
const insightBlock = {
  background: '#f8fafc',
  borderRadius: '12px',
  padding: '20px 22px',
  margin: '0 0 28px',
}
const insightText = {
  fontSize: '14px',
  lineHeight: 1.7,
  color: '#334155',
  margin: '0 0 14px',
}
const researchText = {
  fontSize: '11px',
  color: '#94a3b8',
  fontStyle: 'italic' as const,
  margin: 0,
}
const ctaButton = {
  display: 'inline-block',
  background: '#0f172a',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '14px 28px',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.02em',
}
const recordCallout = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '22px 22px 24px',
  margin: '4px 0 0',
  textAlign: 'center' as const,
}
const recordCalloutLabel = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}
const recordCalloutText = {
  fontSize: '13px',
  lineHeight: 1.65,
  color: '#334155',
  margin: '0 0 16px',
  wordBreak: 'keep-all' as const,
}
const divider = { borderColor: '#e2e8f0', margin: '40px 0 24px' }
const footer = {
  fontSize: '11px',
  lineHeight: 1.7,
  color: '#94a3b8',
  margin: 0,
}
const videosBlock = { margin: '0 0 28px' }
const videoCard = {
  display: 'block',
  textDecoration: 'none',
  color: '#0f172a',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '0',
  marginBottom: '14px',
  overflow: 'hidden' as const,
}
const videoThumbLink = { display: 'block', textDecoration: 'none' }
const thumbStyle = {
  width: '100%',
  height: 'auto',
  maxHeight: '288px',
  objectFit: 'cover' as const,
  display: 'block',
  borderRadius: '0',
}
const videoTextBlock = { padding: '14px 16px 16px' }
const videoTitleLink = { textDecoration: 'none', color: '#0f172a' }
const videoTitle = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#0f172a',
  lineHeight: 1.45,
  margin: '0 0 6px',
  wordBreak: 'keep-all' as const,
}
const videoChannel = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 8px',
}
const videoReason = {
  fontSize: '12px',
  color: '#475569',
  lineHeight: 1.55,
  margin: '0 0 12px',
  wordBreak: 'keep-all' as const,
}
const videoIntro = {
  fontSize: '12px',
  color: '#475569',
  lineHeight: 1.6,
  margin: '0 0 12px',
}
const videoActionRow = { margin: '4px 0 0' }
const videoPrimaryBtn = {
  display: 'inline-block',
  background: '#ef4444',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '9px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 600,
  marginRight: '8px',
  marginBottom: '6px',
}
const videoSecondaryBtn = {
  display: 'inline-block',
  background: '#0f172a',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '9px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 600,
  marginBottom: '6px',
}
const summaryBlock = { background: '#0f172a', borderRadius: '12px', padding: '18px 20px', margin: '0 0 24px' }
const summaryEyebrow = { fontSize: '11px', letterSpacing: '0.16em', color: '#94a3b8', textTransform: 'uppercase' as const, margin: '0 0 6px' }
const summaryText = { fontSize: '17px', fontWeight: 600, color: '#ffffff', lineHeight: 1.5, margin: 0 }
const actionsBlock = { margin: '0 0 28px' }
const actionNumber = { width: '22px', height: '22px', borderRadius: '99px', background: '#0f172a', color: '#ffffff', fontSize: '11px', fontWeight: 600, textAlign: 'center' as const, verticalAlign: 'top' as const, paddingTop: '3px' }
const actionText = { fontSize: '14px', color: '#0f172a', lineHeight: 1.5, paddingLeft: '10px', verticalAlign: 'top' as const }

// === Premium upgrade sections ===
const whyBlock = { background: '#fffaf0', border: '1px solid #f0e6d2', borderRadius: '12px', padding: '18px 20px', margin: '0 0 24px' }
const whyText = { fontSize: '14px', lineHeight: 1.75, color: '#3f3a2e', margin: 0, wordBreak: 'keep-all' as const }
const scriptBlock = { background: '#0f172a', borderRadius: '12px', padding: '20px 22px', margin: '0 0 28px' }
const scriptLine = { fontSize: '14px', lineHeight: 1.7, color: '#e2e8f0', margin: '0 0 8px', fontFamily: "'SF Mono', ui-monospace, Menlo, Consolas, monospace" }
const outcomeBlock = { background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: '12px', padding: '18px 20px', margin: '0 0 28px' }
const outcomeText = { fontSize: '14px', lineHeight: 1.7, color: '#065f46', margin: 0, wordBreak: 'keep-all' as const }
const reflectionBlock = { borderLeft: '3px solid #C8B88A', padding: '4px 0 4px 16px', margin: '0 0 28px' }
const reflectionText = { fontSize: '15px', lineHeight: 1.65, color: '#0f172a', fontStyle: 'italic' as const, margin: 0, wordBreak: 'keep-all' as const }
