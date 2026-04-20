/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'

interface MindTrackCompletionProps {
  nickname?: string
  challengeTheme?: string
  stressDelta?: number
  energyDelta?: number
  clarityDelta?: number
  completedDays?: number
  reportUrl?: string
}

const fmtDelta = (n?: number) => {
  if (n === undefined || n === null) return '·'
  if (n > 0) return `▲ ${n}`
  if (n < 0) return `▼ ${Math.abs(n)}`
  return '·'
}

const MindTrackCompletionEmail = ({
  nickname,
  challengeTheme,
  stressDelta,
  energyDelta,
  clarityDelta,
  completedDays,
  reportUrl,
}: MindTrackCompletionProps) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>30일 마음 변화 트랙이 완료되었어요 — 종합 리포트가 준비됐어요</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {nickname ? `${nickname}님,` : '안녕하세요,'} 30일 여정이 끝났어요 🎉
        </Heading>
        <Text style={text}>
          지난 30일 동안 함께한 마음 변화 트랙이 완료되었어요.
          {challengeTheme ? ` "${challengeTheme}"` : ''} — 이 한 문장으로 시작했던 여정의
          변화를 종합 리포트로 정리해 드렸어요.
        </Text>

        <Section style={statsCard}>
          <Text style={cardLabel}>30일 변화 요약</Text>
          <Section style={{ display: 'block' }}>
            {[
              { label: '스트레스', value: fmtDelta(stressDelta) },
              { label: '에너지', value: fmtDelta(energyDelta) },
              { label: '명료성', value: fmtDelta(clarityDelta) },
            ].map((m) => (
              <Section key={m.label} style={statRow}>
                <Text style={statLabel}>{m.label}</Text>
                <Text style={statValue}>{m.value}</Text>
              </Section>
            ))}
            <Section style={statRow}>
              <Text style={statLabel}>완료한 미션</Text>
              <Text style={statValue}>{completedDays ?? 0} / 30일</Text>
            </Section>
          </Section>
        </Section>

        {reportUrl ? (
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={reportUrl} style={button}>
              종합 리포트 열어보기
            </Button>
          </Section>
        ) : null}

        <Hr style={hr} />
        <Text style={smallText}>
          리포트에는 30일 누적 데이터를 RCI(신뢰변화지수) 기반으로 분석한 변화 그래프와,
          앞으로의 3개월 실천 가이드가 포함되어 있어요.
        </Text>
        <Text style={footer}>— {SITE_NAME} 팀</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MindTrackCompletionEmail,
  subject: (data: Record<string, any>) =>
    `[${SITE_NAME}] 30일 마음 변화 트랙 종합 리포트가 준비되었어요`,
  displayName: '30일 트랙 완료 리포트',
  previewData: {
    nickname: '별이엄마',
    challengeTheme: '하루 5분, 나에게 집중하기',
    stressDelta: 18,
    energyDelta: 22,
    clarityDelta: 15,
    completedDays: 27,
    reportUrl: 'https://aihpro.app/mind-track/workbook',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', lineHeight: 1.4 }
const text = { fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }
const statsCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px 22px',
  margin: '8px 0 24px',
}
const cardLabel = {
  fontSize: '12px', color: '#64748b', margin: '0 0 12px',
  letterSpacing: '0.04em', textTransform: 'uppercase' as const,
}
const statRow = {
  borderBottom: '1px solid #e2e8f0',
  padding: '10px 0',
}
const statLabel = { fontSize: '13px', color: '#64748b', margin: 0, display: 'inline-block', width: '60%' }
const statValue = {
  fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0,
  display: 'inline-block', width: '40%', textAlign: 'right' as const,
}
const button = {
  backgroundColor: '#0f172a', color: '#ffffff', fontSize: '15px', fontWeight: 600,
  padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#e2e8f0', margin: '28px 0' }
const smallText = { fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 12px' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '20px 0 0' }
