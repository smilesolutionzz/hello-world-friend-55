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
  keyActions?: string[]
  insight?: string
  researchBase?: string
  videos?: YouTubeVideoData[]
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
  keyActions = ['타이머 5분 설정', '호흡에 주의 집중', '전·후 감정 점수 기록'],
  insight = '일관된 자기 관찰 기록은 30일 후 평균 23%의 증상 완화를 가져옵니다.',
  researchBase = 'Kabat-Zinn MBSR 프로그램',
  videos = [],
}: DailyCoachingProps) => {
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

          <Section style={actionsBlock}>
            <Text style={sectionLabel}>02 · 핵심 행동 3</Text>
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
            <Text style={sectionLabel}>03 · 임상적 근거</Text>
            <Text style={insightText}>{insight}</Text>
            <Text style={researchText}>{`근거 기반: ${researchBase}`}</Text>
          </Section>

          {videos && videos.length > 0 && (
            <Section style={videosBlock}>
              <Text style={sectionLabel}>04 · 오늘의 추천 영상</Text>
              <Text style={videoIntro}>오늘 미션과 가장 잘 맞는 영상을 골랐어요. 시청 후 아래 "오늘의 기록 남기기"에서 한 줄 기록을 남겨주세요.</Text>
              {videos.map((v) => {
                const thumb = v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
                const watchUrl = buildYouTubeUrl(v.videoId, dayLabel)
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
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `<details style="margin:8px 0 0 0;"><summary style="cursor:pointer;font-size:12px;color:#8a7a4d;font-weight:600;list-style:none;outline:none;">▸ 큐레이션 이유 보기</summary><p style="margin:6px 0 0 0;font-size:13px;line-height:1.6;color:#475569;">${String(v.reason).replace(/</g, '&lt;')}</p></details>`,
                          }}
                        />
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
            </Section>
          )}

          <Section style={recordCallout}>
            <Text style={recordCalloutLabel}>05 · 오늘의 기록</Text>
            <Text style={recordCalloutText}>
              미션 또는 영상을 마친 뒤, 아래 버튼을 눌러 오늘 느낀 변화를 한 줄로 기록해 주세요. 30일간의 변화 그래프가 자동으로 누적됩니다.
            </Text>
            <Button
              href={buildMindTrackUrl(dayLabel, 'cta', firstVideoId)}
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
    keyActions: ['타이머 5분 설정하기', '호흡에만 주의 집중', '전·후 긴장도 점수 기록'],
    insight:
      'Kabat-Zinn MBSR 프로그램 연구에 따르면, 매일 5분의 마음챙김 호흡 훈련은 8주 후 코르티솔 수치를 평균 19% 감소시킵니다.',
    researchBase: 'Kabat-Zinn MBSR 프로그램',
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
