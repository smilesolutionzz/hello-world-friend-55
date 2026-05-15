/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'

interface MindTrackMissionProps {
  nickname?: string
  dayNumber?: number
  totalDays?: number
  phase?: string
  missionTitle?: string
  missionDescription?: string
  workbookUrl?: string
}

const MindTrackMissionEmail = ({
  nickname,
  dayNumber = 1,
  totalDays = 7,
  phase,
  missionTitle,
  missionDescription,
  workbookUrl = 'https://aihpro.app/mind-track/dashboard',
}: MindTrackMissionProps) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>{`Day ${dayNumber}/${totalDays} 미션이 도착했어요 — ${missionTitle ?? phase ?? '오늘의 마음 미션'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>{`AIHPRO MIND TRACK · DAY ${String(dayNumber).padStart(2, '0')}/${totalDays}`}</Text>
        <Heading style={h1}>
          {nickname ? `${nickname}님, 오늘의 미션이 준비됐어요` : '오늘의 미션이 준비됐어요'}
        </Heading>
        {phase ? <Text style={phaseText}>{phase}</Text> : null}

        <Section style={card}>
          <Text style={cardLabel}>오늘의 미션</Text>
          <Heading as="h2" style={h2}>{missionTitle ?? '오늘의 마음 미션'}</Heading>
          {missionDescription ? <Text style={text}>{missionDescription}</Text> : null}
        </Section>

        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button href={workbookUrl} style={button}>
            {`Day ${dayNumber} 미션 시작하기`}
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={smallText}>
          매일 오전 8시, 7일간 같은 시간에 도착해요. 5분만 투자하면 트랙이 끊기지 않습니다.
        </Text>
        <Text style={footer}>— {SITE_NAME} 마음 트랙</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MindTrackMissionEmail,
  subject: (data: Record<string, any>) => {
    const d = data?.dayNumber ?? 1
    const t = data?.totalDays ?? 7
    const title = data?.missionTitle ? ` · ${data.missionTitle}` : ''
    return `[${SITE_NAME}] Day ${d}/${t} 마음 미션${title}`
  },
  displayName: '7일 마음 트랙 · Day 미션',
  previewData: {
    nickname: '별이엄마',
    dayNumber: 3,
    totalDays: 7,
    phase: 'Day 3 · 뿌리 진단',
    missionTitle: '뿌리 패턴 진단 (심층 분석 리포트)',
    missionDescription:
      '2일간 쌓인 데이터를 박사급 AI가 분석해 핵심 패턴 1가지를 골라줘요. "왜 이렇게 사는지"가 보입니다.',
    workbookUrl: 'https://aihpro.app/mind-track/dashboard',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const eyebrow = {
  fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#8a7a4d',
  textTransform: 'uppercase' as const, margin: '0 0 8px',
}
const h1 = { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.4 }
const h2 = { fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '4px 0 8px', lineHeight: 1.45 }
const phaseText = { fontSize: '13px', color: '#8a7a4d', fontWeight: 600, margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: '0' }
const card = {
  backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: '14px', padding: '20px 22px', margin: '8px 0 4px',
}
const cardLabel = {
  fontSize: '11px', color: '#64748b', margin: '0 0 6px',
  letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontWeight: 600,
}
const button = {
  backgroundColor: '#0f172a', color: '#ffffff', fontSize: '15px', fontWeight: 700,
  padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: '#e2e8f0', margin: '28px 0' }
const smallText = { fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 12px' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '20px 0 0' }
