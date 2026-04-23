/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'

interface ReportSummaryProps {
  nickname?: string
  reportTitle?: string
  reportUrl?: string
  generatedAt?: string
  summary?: string
  highlights?: string[]
  senderName?: string
}

const ReportSummaryEmail = ({
  nickname,
  reportTitle,
  reportUrl,
  generatedAt,
  summary,
  highlights,
  senderName,
}: ReportSummaryProps) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>
      {reportTitle ? `${reportTitle} 요약` : 'AIHPRO 종합 리포트 요약'}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {nickname ? `${nickname}님,` : '안녕하세요,'} 종합 리포트 요약입니다
        </Heading>
        {senderName ? (
          <Text style={muted}>{senderName}님이 보낸 리포트입니다.</Text>
        ) : null}
        <Text style={text}>
          {SITE_NAME}에서 생성된 종합 발달 코칭 리포트의 핵심 요약을 확인해 보세요.
          전체 내용은 아래 버튼을 통해 웹에서 안전하게 열람할 수 있습니다.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>리포트</Text>
          <Text style={cardTitle}>{reportTitle ?? '종합 발달 코칭 리포트'}</Text>
          {generatedAt ? (
            <Text style={cardMeta}>생성일 · {generatedAt}</Text>
          ) : null}
        </Section>

        {summary ? (
          <Section style={summaryBox}>
            <Text style={sectionLabel}>핵심 요약</Text>
            <Text style={summaryText}>{summary}</Text>
          </Section>
        ) : null}

        {highlights && highlights.length > 0 ? (
          <Section style={{ margin: '0 0 24px' }}>
            <Text style={sectionLabel}>주요 인사이트</Text>
            {highlights.map((h, i) => (
              <Text key={i} style={highlightItem}>
                <span style={highlightNum}>{String(i + 1).padStart(2, '0')}</span>
                {h}
              </Text>
            ))}
          </Section>
        ) : null}

        {reportUrl ? (
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={reportUrl} style={button}>
              전체 리포트 열어보기
            </Button>
            <Text style={linkFallback}>
              버튼이 동작하지 않으면 아래 링크를 복사해 주세요.<br />
              <span style={{ color: '#475569', wordBreak: 'break-all' }}>{reportUrl}</span>
            </Text>
          </Section>
        ) : null}

        <Hr style={hr} />

        <Text style={smallText}>
          본 리포트는 의료 진단·치료를 대체하지 않으며, 발달 코칭 및 자기관찰 도구로 제공됩니다.
        </Text>
        <Text style={footer}>— {SITE_NAME} 팀</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReportSummaryEmail,
  subject: (data: Record<string, any>) =>
    data?.reportTitle
      ? `[${SITE_NAME}] ${data.reportTitle} 요약`
      : `[${SITE_NAME}] 종합 리포트 요약`,
  displayName: '리포트 요약 메일',
  previewData: {
    nickname: '별이엄마',
    reportTitle: '종합 발달 코칭 리포트',
    reportUrl: 'https://aihpro.app/my-journey',
    generatedAt: '2026-04-23',
    summary: '전반적으로 정서 조절 능력이 안정 구간에 있으며, 최근 2주간 스트레스 지표가 12% 감소했습니다. 수면 규칙성 개선이 가장 큰 변화 요인으로 분석되었습니다.',
    highlights: [
      '정서 조절: 안정 구간 유지 (RCI +0.8)',
      '스트레스: 최근 14일 평균 12% 감소',
      '추천 다음 단계: 마음챙김 5분 루틴 4주 유지',
    ],
    senderName: '기정',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.4 }
const muted = { fontSize: '13px', color: '#64748b', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '0 0 20px' }
const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px 22px',
  margin: '8px 0 24px',
}
const cardLabel = {
  fontSize: '11px',
  color: '#64748b',
  margin: '0 0 6px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
}
const cardTitle = { fontSize: '17px', fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }
const cardMeta = { fontSize: '13px', color: '#94a3b8', margin: 0 }
const summaryBox = {
  borderLeft: '3px solid #0f172a',
  padding: '4px 0 4px 16px',
  margin: '0 0 24px',
}
const sectionLabel = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}
const summaryText = { fontSize: '15px', lineHeight: 1.7, color: '#0f172a', margin: 0 }
const highlightItem = {
  fontSize: '14px',
  lineHeight: 1.65,
  color: '#334155',
  margin: '0 0 10px',
  paddingLeft: '4px',
}
const highlightNum = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#0f172a',
  background: '#e2e8f0',
  borderRadius: '4px',
  padding: '2px 6px',
  marginRight: '8px',
  letterSpacing: '0.05em',
}
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
const linkFallback = { fontSize: '11px', color: '#94a3b8', margin: '14px 0 0', lineHeight: 1.5 }
const hr = { borderColor: '#e2e8f0', margin: '28px 0' }
const smallText = { fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 12px' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '20px 0 0' }
