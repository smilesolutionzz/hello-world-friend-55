/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'AIHPRO'

interface Props {
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  institutionName?: string
  institutionType?: string
  employeeCount?: number | string
  requestType?: string
  message?: string
  source?: string
}

const TYPE_LABEL: Record<string, string> = {
  school: '학교/교육기관',
  counseling: '상담센터',
  welfare: '복지기관',
  corporate: '기업/HR',
}

const REQUEST_LABEL: Record<string, string> = {
  free_trial: '14일 무료 체험',
  paid_inquiry: '도입 상담',
  demo_download: '데모 리포트',
}

const Email = (p: Props) => (
  <Html lang="ko" dir="ltr">
    <Head />
    <Preview>[관리자] {p.institutionName || '기관'} {REQUEST_LABEL[p.requestType || ''] || '신청'} 접수</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔔 신규 B2B 신청 접수</Heading>
        <Section style={infoBox}>
          <Text style={infoRow}><strong>신청 종류</strong> : {REQUEST_LABEL[p.requestType || ''] || p.requestType}</Text>
          <Text style={infoRow}><strong>기관 유형</strong> : {TYPE_LABEL[p.institutionType || ''] || p.institutionType}</Text>
          <Text style={infoRow}><strong>기관명</strong> : {p.institutionName}</Text>
          <Text style={infoRow}><strong>담당자</strong> : {p.contactName}</Text>
          <Text style={infoRow}><strong>이메일</strong> : {p.contactEmail}</Text>
          {p.contactPhone && <Text style={infoRow}><strong>연락처</strong> : {p.contactPhone}</Text>}
          {p.employeeCount ? <Text style={infoRow}><strong>임직원/대상자 수</strong> : {p.employeeCount}명</Text> : null}
          {p.source && <Text style={infoRow}><strong>유입 경로</strong> : {p.source}</Text>}
        </Section>
        {p.message && (
          <>
            <Heading style={h2}>요청 메시지</Heading>
            <Text style={msg}>{p.message}</Text>
          </>
        )}
        <Hr style={hr} />
        <Text style={small}>관리자 대시보드 · /admin → B2B Requests 에서 처리 상태를 업데이트해 주세요.</Text>
        <Text style={footer}>© {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `[관리자] ${d.institutionName || '기관'} · ${REQUEST_LABEL[d.requestType || ''] || '신청'} 접수`,
  displayName: 'B2B 신청 관리자 알림',
  previewData: {
    contactName: '홍길동',
    contactEmail: 'demo@school.kr',
    institutionName: '○○ 초등학교',
    institutionType: 'school',
    requestType: 'free_trial',
    message: '도입 검토 중입니다.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Pretendard, -apple-system, sans-serif' }
const container = { padding: '24px 24px', maxWidth: '560px' }
const h1 = { fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 16px' }
const h2 = { fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '16px 0 6px' }
const infoBox = { background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', margin: '8px 0 16px' }
const infoRow = { fontSize: '13px', color: '#0f172a', margin: '4px 0', lineHeight: '1.6' }
const msg = { fontSize: '13px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap' as const, padding: '12px', background: '#fafafa', borderRadius: '8px' }
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const small = { fontSize: '12px', color: '#64748b', margin: '0 0 8px' }
const footer = { fontSize: '11px', color: '#94a3b8', margin: '12px 0 0', textAlign: 'right' as const }
