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
    <Preview>{SITE_NAME} 도입 검토에 도움이 될 자료를 보내드립니다</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>도입 검토에 도움이 될 자료를 보내드립니다</Heading>
        <Text style={text}>
          {contactName ? `${contactName}님, ` : ''}안녕하세요. {SITE_NAME} 비즈니스 팀입니다.
        </Text>
        <Text style={text}>
          어제 {institutionName ? `${institutionName}에서 ` : ''}보내주신 문의 잘 받았습니다.
          내부 검토에 도움이 될 만한 핵심 자료 3가지를 정리해 보내드립니다.
        </Text>

        <Section style={card}>
          <Text style={cardTitle}>01 · 데모 리포트 (PDF · 화이트라벨)</Text>
          <Text style={cardDesc}>
            기관 로고를 넣어 그대로 보호자/내담자에게 전달할 수 있는 샘플 리포트입니다.
          </Text>
          <Button href="https://aihpro.app/b2b-demo-report" style={button}>
            데모 리포트 보기
          </Button>
        </Section>

        <Section style={card}>
          <Text style={cardTitle}>02 · 요금제 비교</Text>
          <Text style={cardDesc}>
            Starter / Growth / Enterprise 3개 플랜과 EAP 대비 비용 절감 효과를 한눈에 보실 수 있습니다.
          </Text>
          <Button href="https://aihpro.app/b2b-pricing" style={button}>
            가격표 보기
          </Button>
        </Section>

        <Section style={card}>
          <Text style={cardTitle}>03 · 직장 정신건강 솔루션 소개</Text>
          <Text style={cardDesc}>
            익명 코칭 · 부서별 리포트 · HR 대시보드까지 — 도입 후 운영 흐름을 확인하실 수 있습니다.
          </Text>
          <Button href="https://aihpro.app/business" style={button}>
            솔루션 허브 보기
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={small}>
          15분 온라인 미팅이 가장 빠릅니다. 회신 메일로 편하신 시간 2~3개만 알려주세요.
        </Text>
        <Text style={footer}>© {SITE_NAME} · aihpro.app</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: '도입 검토에 도움이 될 자료 3가지 보내드립니다',
  displayName: 'B2B 후속 — D+1 자료 안내',
  previewData: { contactName: '홍길동', institutionName: '○○ 상담센터' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Pretendard, -apple-system, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.01em' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '1.7', margin: '0 0 14px' }
const card = { background: '#FAF8F2', borderLeft: `3px solid ${GOLD}`, borderRadius: '12px', padding: '18px 20px', margin: '14px 0' }
const cardTitle = { fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '0 0 6px', letterSpacing: '0.02em' }
const cardDesc = { fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 12px' }
const button = { background: '#0f172a', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e2e8f0', margin: '28px 0 16px' }
const small = { fontSize: '13px', color: '#475569', margin: '0 0 12px', lineHeight: '1.6' }
const footer = { fontSize: '11px', color: '#94a3b8', margin: '12px 0 0', textAlign: 'right' as const }
