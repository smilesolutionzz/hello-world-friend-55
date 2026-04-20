/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'

interface ReportReadyProps {
  nickname?: string
  reportTitle?: string
  reportUrl?: string
  generatedAt?: string
}

const ReportReadyEmail = ({
  nickname,
  reportTitle,
  reportUrl,
  generatedAt,
}: ReportReadyProps) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>
      {reportTitle ? `${reportTitle} 리포트가 준비되었어요` : '새 리포트가 준비되었어요'}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {nickname ? `${nickname}님,` : '안녕하세요,'} 리포트가 준비됐어요
        </Heading>
        <Text style={text}>
          {SITE_NAME}에서 누적된 데이터를 바탕으로 새 종합 리포트를 생성했어요.
          아래 버튼을 눌러 확인해 보세요.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>리포트</Text>
          <Text style={cardTitle}>{reportTitle ?? '종합 발달 코칭 리포트'}</Text>
          {generatedAt ? (
            <Text style={cardMeta}>생성일 · {generatedAt}</Text>
          ) : null}
        </Section>

        {reportUrl ? (
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={reportUrl} style={button}>
              리포트 열어보기
            </Button>
          </Section>
        ) : null}

        <Hr style={hr} />

        <Text style={smallText}>
          30일 후, 변화 추적(RCI 기반) 리포트가 자동으로 생성될 예정이에요.
          알림 수신을 원치 않으시면 아래 수신 거부 링크를 이용해주세요.
        </Text>
        <Text style={footer}>— {SITE_NAME} 팀</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReportReadyEmail,
  subject: (data: Record<string, any>) =>
    data?.reportTitle
      ? `[${SITE_NAME}] ${data.reportTitle} 리포트가 준비되었어요`
      : `[${SITE_NAME}] 새 리포트가 준비되었어요`,
  displayName: '리포트 준비 알림',
  previewData: {
    nickname: '별이엄마',
    reportTitle: '종합 발달 코칭 리포트',
    reportUrl: 'https://aihpro.app/my-journey',
    generatedAt: '2026-04-20',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#0f172a',
  margin: '0 0 16px',
  lineHeight: 1.4,
}
const text = {
  fontSize: '15px',
  color: '#475569',
  lineHeight: 1.6,
  margin: '0 0 20px',
}
const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px 22px',
  margin: '8px 0 24px',
}
const cardLabel = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 6px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
}
const cardTitle = {
  fontSize: '17px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 6px',
}
const cardMeta = { fontSize: '13px', color: '#94a3b8', margin: 0 }
const button = {
  backgroundColor: '#0f172a',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  padding: '14px 28px',
  borderRadius: '10px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e2e8f0', margin: '28px 0' }
const smallText = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: 1.6,
  margin: '0 0 12px',
}
const footer = { fontSize: '12px', color: '#94a3b8', margin: '20px 0 0' }
