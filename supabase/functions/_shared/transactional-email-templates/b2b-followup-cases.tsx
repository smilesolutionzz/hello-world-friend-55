/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'
const GOLD = '#C8B88A'

interface Props {
  contactName?: string
  institutionName?: string
}

const Email = ({ contactName, institutionName }: Props) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>비슷한 규모 기관의 도입 사례를 정리해 드립니다</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>비슷한 기관의 도입 사례를 정리해 드립니다</Heading>
        <Text style={text}>
          {contactName ? `${contactName}님, ` : ''}{SITE_NAME} 비즈니스 팀입니다.
        </Text>
        <Text style={text}>
          {institutionName ? `${institutionName}과 ` : ''}유사한 환경에서 운영 중인 도입 케이스 3가지의 핵심 지표를
          요약해 보내드립니다. 의사결정에 참고가 되었으면 합니다.
        </Text>

        <Section style={card}>
          <Text style={metric}>01 · 200인 규모 IT 기업</Text>
          <Text style={cardDesc}>
            도입 3개월 — 결근일 <strong>-38%</strong>, EAP 비용 대비 운영비 <strong>-62%</strong>.
            HR 대시보드로 부서별 스트레스 추이 모니터링.
          </Text>
        </Section>

        <Section style={card}>
          <Text style={metric}>02 · 지역 청소년 상담센터</Text>
          <Text style={cardDesc}>
            화이트라벨 리포트로 보호자 면담 시간 <strong>-45%</strong>, 재방문율 <strong>+28%</strong>.
            상담사 1인당 케이스 처리량 1.6배.
          </Text>
        </Section>

        <Section style={card}>
          <Text style={metric}>03 · 사립 초등학교</Text>
          <Text style={cardDesc}>
            전교생 정서 스크리닝 4주 운영 — 위험군 조기 발견 <strong>2.3배</strong>,
            보호자 만족도 <strong>4.7/5.0</strong>.
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={ctaBox}>
          <Text style={ctaTitle}>15분 온라인 미팅 — 귀 기관에 맞는 시나리오 정리</Text>
          <Text style={cardDesc}>
            기관 규모/운영 목표에 맞춰 ROI 시뮬레이션과 도입 로드맵을 함께 그려드립니다.
          </Text>
          <Button href="https://aihpro.app/b2b-proposal" style={button}>
            미팅 일정 잡기
          </Button>
        </Section>

        <Text style={small}>
          이번 메일을 끝으로 자동 안내는 마무리됩니다. 추가 자료가 필요하시면 회신 부탁드립니다.
        </Text>
        <Text style={footer}>© {SITE_NAME} · aihpro.app</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: '비슷한 규모 기관의 도입 사례 3가지',
  displayName: 'B2B 후속 — D+3 케이스 스터디',
  previewData: { contactName: '홍길동', institutionName: '○○ 기업' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Pretendard, -apple-system, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.01em' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '1.7', margin: '0 0 14px' }
const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', margin: '12px 0' }
const metric = { fontSize: '13px', fontWeight: 600, color: GOLD, margin: '0 0 6px', letterSpacing: '0.04em' }
const cardDesc = { fontSize: '13px', color: '#334155', lineHeight: '1.7', margin: '0' }
const ctaBox = { background: '#FAF8F2', borderRadius: '14px', padding: '20px', margin: '20px 0', textAlign: 'center' as const }
const ctaTitle = { fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px' }
const button = { background: '#0f172a', color: '#ffffff', padding: '11px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '10px' }
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const small = { fontSize: '12px', color: '#64748b', margin: '16px 0 0', lineHeight: '1.6' }
const footer = { fontSize: '11px', color: '#94a3b8', margin: '12px 0 0', textAlign: 'right' as const }
