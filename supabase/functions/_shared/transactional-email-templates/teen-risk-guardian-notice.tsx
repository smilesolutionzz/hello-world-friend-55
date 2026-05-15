/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'

interface Props {
  guardianUrl?: string
  riskLevel?: 'moderate' | 'high' | 'critical'
  ageBand?: string
  region?: string
  expertUrl?: string
  centerCount?: number
}

const labelByRisk = {
  moderate: '주의 신호',
  high: '높은 주의 신호',
  critical: '즉시 확인이 필요한 신호',
} as const

const TeenRiskGuardianNoticeEmail = ({
  guardianUrl = 'https://aihpro.app',
  riskLevel = 'high',
  ageBand,
  region,
  expertUrl = 'https://aihpro.app/expert-hiring?urgent=true',
  centerCount = 0,
}: Props) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>자녀 마음 상태에서 확인이 필요한 신호가 감지되었습니다.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>AIHPRO · GUARDIAN NOTICE</Text>
        <Heading style={h1}>자녀의 마음 상태에 확인이 필요한 신호가 감지됐어요</Heading>
        <Text style={text}>
          자녀가 동의한 검사 결과를 바탕으로, AIHPRO가 보호자께 안내드릴
          {' '}<b>{labelByRisk[riskLevel] ?? '주의 신호'}</b>를 발견했습니다.
          {ageBand ? ` 연령대 ${ageBand}` : ''}{region ? ` · ${region}` : ''}.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>지금 보호자가 할 수 있는 것</Text>
          <Text style={text}>
            아래 버튼을 누르면 <b>이 1건만</b> 안전하게 열람할 수 있는 보호자 전용 페이지가 열립니다.
            인근 학교 위(Wee)센터·청소년상담복지센터 {centerCount}곳과 AIHPRO 전문가 1:1 상담을 한 화면에서 확인할 수 있습니다.
          </Text>
        </Section>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={guardianUrl} style={button}>보호자 안내 페이지 열기</Button>
        </Section>

        <Text style={smallText}>
          만약 자녀에게 즉각적인 위험 신호(자해·자살 표현 등)가 보인다면 가까운 응급실·112·119로 먼저 연락해 주세요.
          AIHPRO 전문가 즉시 상담은 <a href={expertUrl} style={link}>이 링크</a>에서 가능합니다.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          이 메일은 자녀가 보호자 알림에 동의한 경우에만 1회 발송됩니다.
          AIHPRO는 의료 진단을 하지 않으며, 발달·정서 코칭과 전문가 연계를 지원합니다.
        </Text>
        <Text style={footer}>— {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TeenRiskGuardianNoticeEmail,
  subject: '[AIHPRO] 자녀 마음 상태에 확인이 필요한 신호가 감지되었습니다',
  displayName: '청소년 위기 보호자 안내',
  previewData: {
    guardianUrl: 'https://aihpro.app/g/abc123def456',
    riskLevel: 'high',
    ageBand: '13-15',
    region: '서울특별시 강남구',
    expertUrl: 'https://aihpro.app/expert-hiring?urgent=true',
    centerCount: 3,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Pretendard, -apple-system, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const eyebrow = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#8a7a4d', textTransform: 'uppercase' as const, margin: '0 0 8px' }
const h1 = { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.4 }
const text = { fontSize: '14px', color: '#334155', lineHeight: 1.7, margin: '0 0 8px' }
const card = { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', margin: '12px 0' }
const cardLabel = { fontSize: '11px', color: '#64748b', margin: '0 0 6px', letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontWeight: 700 }
const button = { backgroundColor: '#0f172a', color: '#ffffff', fontSize: '15px', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', display: 'inline-block' }
const smallText = { fontSize: '12px', color: '#64748b', lineHeight: 1.7, margin: '12px 0 0' }
const link = { color: '#0f172a', textDecoration: 'underline' }
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer = { fontSize: '11px', color: '#94a3b8', margin: '6px 0 0', lineHeight: 1.6 }
