/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'

interface Props {
  contactName?: string
  institutionName?: string
  institutionType?: string
  requestType?: string
}

const TYPE_LABEL: Record<string, string> = {
  school: '학교/교육기관',
  counseling: '상담센터',
  welfare: '복지기관',
  corporate: '기업/HR',
}

const REQUEST_LABEL: Record<string, string> = {
  free_trial: '14일 무료 체험 신청',
  paid_inquiry: '도입 상담 신청',
  demo_download: '데모 리포트 다운로드',
}

const Email = ({ contactName, institutionName, institutionType, requestType }: Props) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>{SITE_NAME} {REQUEST_LABEL[requestType || 'free_trial'] || '신청'}이 정상 접수되었습니다</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>신청이 접수되었습니다 ✅</Heading>
        <Text style={text}>
          {contactName ? `${contactName}님, ` : ''}안녕하세요. {SITE_NAME}입니다.
        </Text>
        <Text style={text}>
          아래 내용으로 신청이 정상 접수되었습니다. 영업일 기준 1일 이내에 전담 매니저가 회신드립니다.
        </Text>
        <Section style={infoBox}>
          <Text style={infoRow}><strong>신청 종류</strong> : {REQUEST_LABEL[requestType || 'free_trial'] || requestType}</Text>
          <Text style={infoRow}><strong>기관명</strong> : {institutionName || '-'}</Text>
          <Text style={infoRow}><strong>기관 유형</strong> : {TYPE_LABEL[institutionType || ''] || institutionType || '-'}</Text>
          <Text style={infoRow}><strong>담당자</strong> : {contactName || '-'}</Text>
        </Section>
        <Hr style={hr} />
        <Text style={small}>
          본 메일은 발신 전용입니다. 문의는 kijung_kku@naver.com 으로 회신해 주세요.
        </Text>
        <Text style={footer}>© {SITE_NAME} · aihpro.app</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `[${SITE_NAME}] ${REQUEST_LABEL[d.requestType || 'free_trial'] || '신청'}이 접수되었습니다`,
  displayName: 'B2B 신청 접수 확인',
  previewData: {
    contactName: '홍길동',
    institutionName: '○○ 초등학교',
    institutionType: 'school',
    requestType: 'free_trial',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Pretendard, -apple-system, sans-serif' }
const container = { padding: '24px 24px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 12px' }
const infoBox = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', margin: '16px 0' }
const infoRow = { fontSize: '13px', color: '#0f172a', margin: '4px 0', lineHeight: '1.6' }
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const small = { fontSize: '12px', color: '#64748b', margin: '0 0 8px' }
const footer = { fontSize: '11px', color: '#94a3b8', margin: '12px 0 0', textAlign: 'right' as const }
