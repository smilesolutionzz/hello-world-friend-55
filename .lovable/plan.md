# Resend Connector 기반 뉴스레터 CRM

## 핵심 방향
Resend API 키를 직접 받지 않고 **Lovable Connector(게이트웨이)** 로 Resend를 연결합니다. 
→ 토큰 관리 / 인증 갱신을 Lovable이 대신 처리, 코드에는 `LOVABLE_API_KEY` + `RESEND_API_KEY`(게이트웨이용)만 사용.

게이트웨이 URL: `https://connector-gateway.lovable.dev/resend/...`

---

## 01. 연결 절차 (사용자 1클릭)

1. Lovable이 `standard_connectors--connect(connector_id="resend")` 호출
2. 채팅에 Resend 연결 모달이 뜸 → 사용자가 Resend 계정 OAuth 또는 API Key 입력
3. 연결 완료 시 `RESEND_API_KEY` 환경변수 자동 주입 (실제 키 아님, 게이트웨이 통과용)
4. 발신 도메인은 기존 `news@aihpro.app` 사용 (Resend 대시보드에서 도메인 인증 필요 — 이미 했으면 스킵)

---

## 02. 데이터 모델 (신규 2개 테이블)

**`newsletter_issues`** — 뉴스레터 호(號)
- issue_number, subject, hook_line, content_html, content_json
- status: `draft` | `approved` | `sending` | `sent`
- scheduled_at, sent_at, sent_count, open_count, click_count

**`newsletter_recipients`** — 발송 로그
- issue_id, user_id, recipient_email
- status: `pending` | `sent` | `failed` | `opened` | `clicked` | `unsubscribed`
- sent_at, opened_at, clicked_at, resend_message_id

RLS: admin만 issues 읽기/쓰기, 본인만 자신의 recipient 행 읽기.
재사용: 기존 `email_unsubscribe_tokens`, `email_send_log`, `marketing_email_opt_in` 컬럼.

---

## 03. 엣지 함수 (신규 3개)

| 함수 | 트리거 | 역할 |
|---|---|---|
| `generate-newsletter-draft` | pg_cron 일요일 22:00 KST | Gemini 3.1로 다음 주 초안 자동 생성 → `status='draft'` |
| `send-newsletter-issue` | admin 수동 트리거 + pg_cron 화요일 08:00 KST | `status='approved'`인 호를 배치 200건씩 게이트웨이로 발송 |
| `resend-webhook` | Resend webhook | open/click/bounce 이벤트 → recipients 상태 업데이트 |

모든 발송은:
```
POST https://connector-gateway.lovable.dev/resend/emails
Authorization: Bearer ${LOVABLE_API_KEY}
X-Connection-Api-Key: ${RESEND_API_KEY}
```

---

## 04. Admin UI (신규 탭)

`AdminNewsletterPanel` → 기존 admin 대시보드에 새 탭으로 추가:
- 초안 목록 / 미리보기 (모바일·데스크탑)
- 후킹 문구·제목 수정, 테스트 발송 (본인에게)
- 승인(approve) → 화요일 cron이 자동 발송
- 즉시 발송 버튼 (긴급용)
- 호별 통계: 발송/오픈/클릭/구독해지

---

## 05. 사용자 UI (신규 1페이지)

`/email-preferences` — 수신 설정 페이지
- 마케팅 이메일 on/off
- 발송 빈도 (주 1회 / 받지 않음)
- 푸터 unsubscribe 링크에서 진입

---

## 06. 뉴스레터 콘텐츠 구조 (AIHPRO WEEKLY)

매주 5섹션 (Instrument Serif 헤딩 + 골드 #C8B88A 액센트 + 흰 배경):
1. **HOOK** — 이번 주 한 줄 (예: "당신이 놓친 신호 3가지")
2. **INSIGHT** — 멤버 데이터 기반 트렌드 1개
3. **CASE** — 익명화된 멤버 사례 (display_name 사용)
4. **EXPERT PICK** — 이번 주 추천 전문가 + `/expert-hiring` CTA
5. **NEXT** — 다음 주 예고 + `/mind-track` CTA

> 위기 콘텐츠 금지, 외부 핫라인 노출 금지, 의료 진단 표현 금지 (코칭 톤 유지).

---

## 07. 발송 정책

- **대상**: `marketing_email_opt_in = true` AND `email_verified = true` 회원
- **빈도**: 주 1회 화요일 08:00 KST (1차 MVP)
- **배치**: 200통/배치, 배치간 2초 sleep (Resend rate limit 준수)
- **중복방지**: `newsletter_recipients (issue_id, user_id) UNIQUE`
- **PMF 기간**: 발송 전 admin 승인 필수 (자동 발송 X)

---

## 진행 순서

1. `standard_connectors--connect resend` → 사용자가 연결
2. DB 마이그레이션 (테이블 2개 + RLS + GRANT)
3. 엣지 함수 3개 + pg_cron 2개
4. Admin 탭 + `/email-preferences` 페이지
5. 1호 초안 생성 → admin 검수 → 본인 테스트 발송 → 전체 발송

---

## 제외 (이번 범위 밖)

- Resend Audiences API 동기화 (멤버 DB가 source of truth)
- 일간 발송 (기존 daily coaching email로 대체)
- A/B 테스트, 세그먼트 분기 (2차)

승인하시면 Connector 연결부터 시작합니다.