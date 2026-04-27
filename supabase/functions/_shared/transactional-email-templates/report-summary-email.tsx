/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Column, Container, Head, Heading, Hr, Html, Preview, Row, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'
const GOLD = '#C8B88A'
const INK = '#0F172A'
const SUBINK = '#475569'
const MUTED = '#94A3B8'
const LINE = '#E5E7EB'
const SOFT = '#F8FAFC'

interface Metric {
  label: string
  value: string
  delta?: string // e.g. "▲ 12%"
  tone?: 'positive' | 'negative' | 'neutral'
}

interface ReportSummaryProps {
  nickname?: string
  reportTitle?: string
  reportUrl?: string
  generatedAt?: string
  summary?: string
  highlights?: string[]
  metrics?: Metric[]
  recommendation?: string
  senderName?: string
}

const toneColor = (t?: string) =>
  t === 'positive' ? '#0E7C66' : t === 'negative' ? '#B4493B' : INK

const ReportSummaryEmail = ({
  nickname,
  reportTitle,
  reportUrl,
  generatedAt,
  summary,
  highlights,
  metrics,
  recommendation,
  senderName,
}: ReportSummaryProps) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>
      {reportTitle ? `${reportTitle} 핵심 요약` : 'AIHPRO 전문가 종합 분석 리포트 요약'}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header band */}
        <Section style={header}>
          <Text style={brandTag}>{SITE_NAME} · EXPERT REPORT</Text>
          <Heading style={h1}>
            {nickname ? `${nickname}님의 ` : ''}전문가 종합 분석 요약
          </Heading>
          <Text style={subtitle}>
            누적된 데이터를 임상 통계 모델로 교차 분석한 핵심 결과입니다.
          </Text>
          {senderName ? (
            <Text style={muted}>{senderName}님이 공유한 리포트입니다.</Text>
          ) : null}
        </Section>

        {/* Title card */}
        <Section style={titleCard}>
          <Row>
            <Column>
              <Text style={cardLabel}>REPORT</Text>
              <Text style={cardTitle}>{reportTitle ?? '종합 발달 코칭 리포트'}</Text>
              {generatedAt ? (
                <Text style={cardMeta}>생성일 · {generatedAt}</Text>
              ) : null}
            </Column>
          </Row>
        </Section>

        {/* Executive summary */}
        {summary ? (
          <Section style={summaryCard}>
            <Text style={sectionLabel}>01 · 핵심 요약</Text>
            <Text style={summaryText}>{summary}</Text>
          </Section>
        ) : null}

        {/* Metrics grid */}
        {metrics && metrics.length > 0 ? (
          <Section style={{ margin: '0 0 22px' }}>
            <Text style={sectionLabel}>02 · 주요 지표</Text>
            <Section style={metricsGrid}>
              {metrics.slice(0, 4).map((m, i) => (
                <Section key={i} style={metricCell}>
                  <Text style={metricLabel}>{m.label}</Text>
                  <Text style={metricValue}>{m.value}</Text>
                  {m.delta ? (
                    <Text style={{ ...metricDelta, color: toneColor(m.tone) }}>
                      {m.delta}
                    </Text>
                  ) : null}
                </Section>
              ))}
            </Section>
          </Section>
        ) : null}

        {/* Highlights */}
        {highlights && highlights.length > 0 ? (
          <Section style={{ margin: '0 0 22px' }}>
            <Text style={sectionLabel}>
              {metrics && metrics.length > 0 ? '03' : '02'} · 인사이트
            </Text>
            {highlights.slice(0, 5).map((h, i) => (
              <Section key={i} style={insightRow}>
                <Text style={insightNum}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={insightText}>{h}</Text>
              </Section>
            ))}
          </Section>
        ) : null}

        {/* Recommendation */}
        {recommendation ? (
          <Section style={recoCard}>
            <Text style={recoLabel}>다음 단계 추천</Text>
            <Text style={recoText}>{recommendation}</Text>
          </Section>
        ) : null}

        {/* CTA */}
        {reportUrl ? (
          <Section style={{ textAlign: 'center', margin: '8px 0 24px' }}>
            <Button href={reportUrl} style={button}>
              전체 리포트 열어보기
            </Button>
            <Text style={linkFallback}>
              버튼이 동작하지 않으면 아래 링크를 복사해 주세요.<br />
              <span style={{ color: SUBINK, wordBreak: 'break-all' }}>{reportUrl}</span>
            </Text>
          </Section>
        ) : null}

        <Hr style={hr} />
        <Text style={smallText}>
          본 리포트는 의료 진단·치료를 대체하지 않으며, 발달 코칭 및 자기관찰 도구로 제공됩니다.
        </Text>
        <Text style={footer}>— {SITE_NAME} 팀 · aihpro.app</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReportSummaryEmail,
  subject: (data: Record<string, any>) =>
    data?.reportTitle
      ? `[${SITE_NAME}] ${data.reportTitle} · 전문가 종합 분석 요약`
      : `[${SITE_NAME}] 전문가 종합 분석 리포트 요약`,
  displayName: '리포트 요약 메일 (Premium)',
  previewData: {
    nickname: '별이엄마',
    reportTitle: '종합 발달 코칭 리포트',
    reportUrl: 'https://aihpro.app/my-journey',
    generatedAt: '2026. 04. 27.',
    summary:
      '본 대상자의 데이터를 교차 분석한 결과, 정서 조절 안정성이 회복 구간에 진입했습니다. 최근 14일간 스트레스 지표가 12% 감소했고 수면 규칙성이 가장 큰 긍정 요인으로 분석되었습니다.',
    metrics: [
      { label: '정서 안정성', value: '안정', delta: '▲ RCI +0.8', tone: 'positive' },
      { label: '스트레스', value: '12% ↓', delta: '14일 누적', tone: 'positive' },
      { label: '수면 규칙성', value: '양호', delta: '▲ 9%', tone: 'positive' },
      { label: '집중·실행', value: '주의', delta: '▼ 4%', tone: 'negative' },
    ],
    highlights: [
      '정서 조절: 안정 구간 유지 (RCI +0.8, 임계값 ±0.5)',
      '스트레스: 14일 평균 12% 감소, 야간 각성도 함께 완화',
      '수면 규칙성 개선이 가장 큰 회복 요인으로 분석됨',
      '집중·실행 영역은 일관성 부족 — 루틴 점검 필요',
    ],
    recommendation:
      '4주 마음챙김 5분 루틴과 주 2회 30분 산책을 유지하고, 집중 영역은 포모도로 25분 4세트로 재정렬을 권장합니다.',
    senderName: undefined,
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: 0,
}
const container = { padding: '36px 28px', maxWidth: '600px', margin: '0 auto' }

const header = {
  borderTop: `3px solid ${GOLD}`,
  paddingTop: '20px',
  marginBottom: '24px',
}
const brandTag = {
  fontSize: '11px',
  letterSpacing: '0.2em',
  color: GOLD,
  fontWeight: 700,
  margin: '0 0 10px',
  textTransform: 'uppercase' as const,
}
const h1 = {
  fontSize: '24px',
  fontWeight: 700,
  color: INK,
  margin: '0 0 10px',
  lineHeight: 1.35,
  letterSpacing: '-0.01em',
}
const subtitle = { fontSize: '14px', color: SUBINK, lineHeight: 1.65, margin: '0 0 6px' }
const muted = { fontSize: '12px', color: MUTED, margin: '6px 0 0' }

const titleCard = {
  backgroundColor: SOFT,
  border: `1px solid ${LINE}`,
  borderRadius: '14px',
  padding: '20px 22px',
  margin: '0 0 22px',
}
const cardLabel = {
  fontSize: '10px',
  color: MUTED,
  margin: '0 0 6px',
  letterSpacing: '0.18em',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
}
const cardTitle = { fontSize: '17px', fontWeight: 700, color: INK, margin: '0 0 6px' }
const cardMeta = { fontSize: '12px', color: MUTED, margin: 0 }

const summaryCard = {
  backgroundColor: '#FFFFFF',
  border: `1px solid ${LINE}`,
  borderLeft: `3px solid ${GOLD}`,
  borderRadius: '12px',
  padding: '20px 22px',
  margin: '0 0 22px',
}
const sectionLabel = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  color: GOLD,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  margin: '0 0 12px',
}
const summaryText = { fontSize: '15px', lineHeight: 1.75, color: INK, margin: 0 }

const metricsGrid = {
  border: `1px solid ${LINE}`,
  borderRadius: '12px',
  overflow: 'hidden',
}
const metricCell = {
  borderBottom: `1px solid ${LINE}`,
  padding: '14px 18px',
  backgroundColor: '#FFFFFF',
}
const metricLabel = {
  fontSize: '11px',
  letterSpacing: '0.12em',
  color: MUTED,
  fontWeight: 600,
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
}
const metricValue = { fontSize: '18px', fontWeight: 700, color: INK, margin: '0 0 2px' }
const metricDelta = { fontSize: '12px', fontWeight: 600, margin: 0 }

const insightRow = {
  borderBottom: `1px solid ${LINE}`,
  padding: '12px 4px',
}
const insightNum = {
  fontSize: '11px',
  fontWeight: 700,
  color: GOLD,
  letterSpacing: '0.08em',
  margin: '0 0 4px',
}
const insightText = { fontSize: '14px', lineHeight: 1.65, color: INK, margin: 0 }

const recoCard = {
  background: 'linear-gradient(180deg, #FAF8F2 0%, #FFFFFF 100%)',
  border: `1px solid ${GOLD}66`,
  borderRadius: '14px',
  padding: '20px 22px',
  margin: '0 0 26px',
}
const recoLabel = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  color: GOLD,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}
const recoText = { fontSize: '14px', lineHeight: 1.7, color: INK, margin: 0 }

const button = {
  backgroundColor: INK,
  color: '#FFFFFF',
  fontSize: '15px',
  fontWeight: 600,
  padding: '14px 30px',
  borderRadius: '10px',
  textDecoration: 'none',
  display: 'inline-block',
  letterSpacing: '0.01em',
}
const linkFallback = { fontSize: '11px', color: MUTED, margin: '14px 0 0', lineHeight: 1.5 }
const hr = { borderColor: LINE, margin: '28px 0' }
const smallText = { fontSize: '12px', color: MUTED, lineHeight: 1.65, margin: '0 0 12px' }
const footer = { fontSize: '12px', color: MUTED, margin: '20px 0 0' }
