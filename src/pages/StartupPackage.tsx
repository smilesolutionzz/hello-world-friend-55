import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const sections = [
  {
    id: 'motivation',
    title: '1. 참여동기',
    content: `대한민국의 정신건강 서비스는 구조적 한계에 직면해 있습니다. 전문 심리검사 1회에 8~15만 원, 상담 대기 기간은 평균 2~4주에 달하며, 수도권 외 지역에서는 전문가 접근 자체가 어렵습니다.

저는 교육학 석사(아동심리 전공) 과정에서 아동발달센터 실무를 병행하며, 조기 선별의 중요성과 현장의 괴리를 동시에 체감했습니다. 이 문제를 기술로 해결하기 위해 직접 AI 기반 심리 선별 플랫폼 'AIHPRO(AI Human Pro)'를 개발했습니다.

현재 MVP가 운영 중이며, 월간 활성 사용자(MAU) 200명, 검사 전환율 39.6%, 30종 이상의 심리검사를 탑재했습니다. 23,000명 구독자의 유튜브 채널과 50곳의 B2B 협력기관을 확보하고 있어, 예비창업패키지를 통해 서비스 고도화와 시장 확장에 집중하고자 합니다.

본 아이템은 의료 행위가 아닌 '선별(Screening) 및 전문가 연결 플랫폼'으로, AI 분석 결과를 기반으로 적합한 전문가를 매칭하는 게이트웨이 역할을 합니다.`
  },
  {
    id: 'competency',
    title: '2. 보유역량 (전문성)',
    content: `[대표자] CMO (마케팅·사업 총괄)
- 교육학 석사, 아동심리 전공
- 아동발달센터 3년 근무 경험 (심리검사 실시·해석)
- 23,000명 구독자 유튜브 채널 운영 (콘텐츠 마케팅 전문)
- AI/ML 개발자 과정 수료, React·TypeScript·Supabase 기반 풀스택 개발
- AIHPRO 플랫폼 기획·개발·운영 1인 창업 경험

[대표] 이수석 — CEO (대표·제품 총괄)
- 발달재활 석사, 14년 아동발달 현장 경력
- 발달검사 설계 및 AI 분석 시스템 구축
- 제품 기획·UX 전략·사업 전략 총괄
- 사용자 데이터 기반 제품 고도화 주도

[공동대표 2] 이일석 — CTO (기술·글로벌 전략)
- Harvard University 졸업
- 미국 보스턴 20년 거주, 글로벌 시장 네트워크 보유
- AI·데이터 분석 기술 총괄
- 해외 시장 진출 및 글로벌 파트너십 전략 수립

[공동대표 3] 김기정 — 네트워크·기관 협력 총괄
- 여성가족부 산하 사단법인 협회 회장
- 교육·복지 분야 정부 기관 및 지자체 네트워크 보유
- 50곳 이상 B2B 파트너 기관 협력 체계 구축 주도
- 정부 정책 자금 및 공공 사업 연계 전문

[핵심 역량 요약]
- 기술: MVP 개발 완료, 30종 심리검사 엔진, AI 분석 리포트 자동 생성
- 마케팅: 23,000명 유튜브 구독자 기반 저비용 고효율 유입 채널
- 네트워크: 병원·아동발달센터·학교 등 50곳 B2B 파트너 확보
- 글로벌: Harvard 출신 공동대표의 미국 시장 진출 기반
- 공공: 여성가족부 산하 협회장의 정부·기관 네트워크`
  },
  {
    id: 'item-summary',
    title: '3. 창업 아이템 개요',
    content: `[서비스명]
AIHPRO (AI Human Pro) — AI 기반 심리 선별 및 전문가 매칭 플랫폼

[서비스 개요]
24시간 접근 가능한 웹 기반 심리검사 플랫폼으로, AI가 검사 결과를 분석하여 개인 맞춤형 리포트를 생성하고 적합한 전문가를 연결합니다.

[핵심 기능]
1. AI 심리 선별 검사: 30종 이상의 전문 심리검사 (ADHD, 우울, 불안, 발달, 성격, 스트레스 등)
2. AI 분석 리포트: Gemini 2.5 Pro 기반 심층 분석 및 개인화된 리포트 자동 생성
3. 영상 관찰 분석: 아동 행동 영상을 업로드하면 AI가 발달 상태를 분석
4. 전문가 매칭: 검사 결과 기반으로 적합한 전문 상담사·치료사 자동 매칭
5. 가족 통합 관리: 가족 구성원별 검사 이력 및 발달 추이 통합 대시보드

[가격 정책]
- 심리검사 1회: 990원 (기본 검사 2회 무료 체험)
- AI 심층 분석 리포트 1회: 3,900원
- 월간 구독 (무제한): 9,900원/월
- 연간 구독 (무제한): 99,000원/년 (약 17% 할인, 월 8,250원)

[고객 제공 혜택]
- 접근성: 24시간 어디서나 전문 수준의 심리 선별 가능
- 경제성: 기존 오프라인 검사 대비 비용 90% 절감, 시간 95% 단축
- 지속성: AI 기반 장기 모니터링 및 발달 추이 분석
- 연결성: 선별 결과 기반 전문가 즉시 매칭`
  },
  {
    id: 'problem',
    title: '4. 문제인식 (Problem)',
    content: `[시장 현황]
국내 정신건강 서비스 시장 규모는 약 1조 2천억 원(2023년)이며, 아동 정신건강 서비스 수요는 연평균 15% 증가하고 있습니다. 그러나 현재의 서비스 공급 구조는 이 수요를 충족하지 못하고 있습니다.

[핵심 문제 4가지]

1. 접근성 제약
심리 전문가의 수도권 편중으로 지방 거주자는 서비스 접근이 어렵습니다. 초진 대기 기간이 평균 2~4주에 달하며, 아동발달 전문기관은 더 긴 대기가 필요합니다.

2. 고비용 구조
전문 심리검사 1회에 8~15만 원, 상담 1회에 8~12만 원으로, 일반 가정이 지속적으로 이용하기에는 부담이 큽니다. 조기 발견이 중요한 아동 발달 영역에서 비용 장벽은 치명적입니다.

3. 표준화 부족
기관별로 사용하는 검사 도구와 해석 기준이 상이하여, 동일 아동이 다른 기관에서 다른 결과를 받는 경우가 빈번합니다. 이는 부모의 혼란과 불신을 야기합니다.

4. 연속성 부족
대부분의 심리검사가 일회성으로 종료되며, 시간에 따른 변화 추이를 추적하기 어렵습니다. 특히 발달 과정에 있는 아동은 정기적 모니터링이 필수적입니다.

[해외 벤치마크]
- 미국 BetterHelp: $200M+ 매출, 온라인 심리상담 선두
- 미국 Headspace: $100M+ 매출, 명상 및 정신건강 앱
- 국내에는 AI 기반 종합 심리 선별 + 전문가 연결 플랫폼이 부재

[개발 필요성]
조기 발견과 지속적 관리가 핵심인 정신건강 분야에서, AI 기술을 활용한 저비용·고접근성 선별 도구는 사회적 필요를 넘어 시장 기회입니다. 특히 아동 발달 영역에서의 조기 개입은 사회적 비용을 크게 절감할 수 있습니다.`
  },
  {
    id: 'solution',
    title: '5. 실현 가능성 (Solution)',
    content: `[현재 개발 현황 — MVP 운영 중]
AIHPRO는 이미 MVP가 운영 중이며, 실제 사용자 데이터를 확보하고 있습니다.

- 플랫폼 상태: 웹 서비스 운영 중 (https://aihpro.app)
- 심리검사: 30종 이상 탑재 완료
- AI 분석 엔진: Gemini 2.5 Pro 기반 리포트 자동 생성
- 영상 관찰 분석: 아동 행동 영상 AI 분석 기능 구현 완료
- 월간 활성 사용자(MAU): 200명
- 검사 전환율: 39.6% (업계 평균 5~10% 대비 4~8배)
- 월간 페이지뷰: 10,000회

[기술 스택]
- 프론트엔드: React, TypeScript, Tailwind CSS
- 백엔드: Supabase (PostgreSQL, Edge Functions, Auth, Storage)
- AI 엔진: Google Gemini 2.5 Pro API
- 결제: 토스페이먼츠(Toss Payments)
- 호스팅: Lovable Cloud

[사업기간 내 개발 계획 (10개월)]

Phase 1 (1~3개월): 서비스 고도화
- AI 분석 정확도 개선 (전문가 피드백 루프 구축)
- 전문가 매칭 알고리즘 고도화
- 모바일 반응형 최적화 및 PWA 전환

Phase 2 (4~6개월): 시장 확장
- 유튜브 23,000명 구독자 기반 마케팅 본격화
- B2B 파트너 기관 유료 전환 (50곳 중 10곳 목표)
- 기관용(어린이집, 학교) 대시보드 개발

Phase 3 (7~10개월): 수익 안정화
- MAU 5,000명 달성
- 월 매출 2,000만 원 목표 (ARR 2억 원)
- Series A 투자 유치 준비

[차별성 및 경쟁력]

1. 기술적 차별성
- 30종 이상 심리검사 + AI 심층 분석의 원스톱 서비스
- 영상 기반 아동 행동 관찰 분석 (국내 유일)
- 실시간 AI 리포트 생성 (기존 2~3일 → 즉시)

2. 시장 차별성
- 23,000명 유튜브 구독자를 통한 고객 획득 비용(CAC) 800~1,800원 달성
- 50곳 B2B 파트너 기관 네트워크 확보
- 여성가족부 산하 협회장의 공공 네트워크 활용

3. 비즈니스 차별성
- B2C(개인 구독) + B2B(기관용 라이선스) 이중 수익 모델
- LTV:CAC 비율 150:1 목표 (고효율 유닛 이코노믹스)
- 데이터 축적에 따른 AI 정확도 향상 → 경쟁 해자(Moat) 강화`
  },
  {
    id: 'scaleup',
    title: '6. 성장전략 (Scale-up)',
    content: `[경쟁사 분석]

| 구분 | AIHPRO | 트로스트(Trost) | 마인드카페 | 오프라인 상담센터 |
|------|--------|----------------|-----------|-----------------|
| 서비스 범위 | 전 연령 통합 (아동~성인) | 성인 중심 | 성인 상담 중심 | 특정 대상 |
| 검사 종류 | 30종+ AI 분석 | 기본 자가진단 | 자가진단 | 전문가 수동 |
| 가격 | 990원~ (구독 9,900원) | 월 49,000원~ | 상담 50,000원~/회 | 80,000~150,000원/회 |
| AI 활용도 | AI 심층 분석 + 영상 관찰 | 매칭 위주 | 제한적 | 없음 |
| 접근성 | 24시간 웹 | 앱 기반 | 앱 기반 | 오프라인 예약제 |
| 전문가 연결 | AI 기반 자동 매칭 | 수동 매칭 | 수동 매칭 | 직접 |

[목표 시장 및 진입 전략]

1차 타겟 (0~1년): 직접 유입
- 자녀 발달이 걱정되는 30~40대 부모 (추정 50만 가구)
- 심리 상태를 객관적으로 확인하고 싶은 20~30대 (추정 100만 명)
- 유입 채널: 유튜브 23,000명 구독자, SEO, 커뮤니티 마케팅

2차 확장 (1~2년): B2B 시장
- 교육기관 (어린이집, 유치원, 초등학교): 기관용 선별 도구
- 기업체 EAP(직원 지원 프로그램): 직원 정신건강 관리
- 지자체 위탁: 여성가족부 산하 네트워크 활용

3차 확장 (2~3년): 글로벌
- Harvard 출신 공동대표의 미국 시장 네트워크 활용
- 영문 서비스 런칭 (현재 다국어 지원 인프라 구축 완료)
- 동남아 시장 진출 (한류 콘텐츠 연계)

[비즈니스 모델]

수익원 구성:
1. B2C 구독 수익 (60%): 월 9,900원 / 연 99,000원 무제한 구독
2. 단건 결제 (15%): 검사 990원, 리포트 3,900원
3. 전문가 매칭 수수료 (15%): 상담 연결 수수료 30%
4. B2B 라이선스 (10%): 기관용 솔루션 월 30~100만 원

[매출 전망 (보수적 추정)]
- 6개월 차: MAU 1,000명, 월 매출 500만 원
- 12개월 차: MAU 5,000명, 월 매출 2,000만 원 (ARR 2억 원)
- 24개월 차: MAU 15,000명 + B2B 10곳, 월 매출 8,000만 원
- 36개월 차: MAU 30,000명 + B2B 30곳, 월 매출 2억 원

[자금 활용 계획 (예비창업패키지 1억 원 기준)]
- 서비스 고도화 (40%): AI 엔진 개선, 전문가 매칭, 모바일 최적화
- 마케팅 (25%): 유튜브 광고, SEO, 커뮤니티 마케팅
- 인건비 (25%): 백엔드 개발자 계약(3개월), 마케팅 담당자
- 운영비 (10%): 서버, API 비용, 법률·특허

[투자 유치 로드맵]
- 현재: 예비창업패키지 (1억 원) — 서비스 고도화 및 초기 시장 검증
- 6개월 후: 엔젤 투자 (2억 원) — MAU 확장 및 B2B 파일럿
- 12개월 후: Series A (20~30억 원) — 시장 확장, 글로벌 진출
- 기업 가치 목표: 1년 내 30~50억 원`
  },
  {
    id: 'team',
    title: '7. 팀 구성 (Team)',
    content: `[핵심 경영진]

대표 (CMO — 마케팅·사업 총괄)
- 교육학 석사, 아동심리 전공
- 아동발달센터 3년 실무 (심리검사 실시·해석·보호자 상담)
- 23,000명 구독자 유튜브 채널 운영 (콘텐츠 마케팅)
- AIHPRO 플랫폼 1인 기획·개발·운영 (React, TypeScript, Supabase)
- 담당: 사업 전략, 마케팅, 콘텐츠, 투자 유치

공동대표 — 이수석 (CPO — 제품·사용자 경험 총괄)
- 제품 기획 및 UX 전략 수립
- 사용자 데이터 기반 서비스 개선 주도
- AI 서비스 제품화 및 운영 경험
- 담당: 제품 로드맵, UX/UI 전략, 사용자 리서치, 서비스 품질 관리

공동대표 — 이일석 (CTO — 기술·글로벌 전략)
- Harvard University 졸업
- 미국 보스턴 20년 거주
- AI, 데이터 분석, 시스템 아키텍처 전문
- 담당: 기술 총괄, AI 엔진 고도화, 글로벌 시장 진출 전략, 해외 파트너십

공동대표 — 김기정 (네트워크·공공 협력 총괄)
- 여성가족부 산하 사단법인 협회 회장
- 교육·복지 분야 정부 기관 및 지자체 광역 네트워크
- 공공 사업 연계 및 정책 자금 확보 전문
- 담당: B2B 기관 협력, 정부 사업 연계, 공공 네트워크 확장, 제휴 전략

[자문위원]
- 아동발달 전문의 2명 (임상 자문)
- 임상심리사 3명 (검사 도구 검증)
- 서울대 심리학과 교수 (학술 자문)

[확장 채용 계획 (사업기간 내)]
- 백엔드 개발자 1명 (3개월 계약, AI API 연동 및 데이터 파이프라인)
- 마케팅 매니저 1명 (유튜브·SNS 운영, 커뮤니티 관리)
- 고객 성공 매니저 1명 (B2B 기관 온보딩 및 CS)

[업무 파트너 및 협력 네트워크]
- B2B 파트너: 병원·아동발달센터·학교 등 50곳 제휴 확보
- 기술 파트너: Google Cloud (Gemini AI), Supabase, 토스페이먼츠
- 공공 파트너: 여성가족부 산하 기관, 지자체 교육·복지 부서
- 전문가 네트워크: 임상심리사 50명, 상담심리사 40명, 아동발달 전문의 10명`
  }
];

const StartupPackage = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>('motivation');

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('클립보드에 복사되었습니다!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = async () => {
    const allContent = sections.map(s => `[${s.title}]\n\n${s.content}`).join('\n\n---\n\n');
    await navigator.clipboard.writeText(allContent);
    toast.success('전체 내용이 복사되었습니다!');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-sm font-medium text-blue-200 mb-2">2026 K-STARTUP 예비창업패키지</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AIHPRO 사업계획서</h1>
          <p className="text-blue-200 text-lg">AI 기반 심리 선별 및 전문가 매칭 플랫폼</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm">MAU 200명</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm">전환율 39.6%</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm">검사 30종+</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm">B2B 50곳</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm">YouTube 23K</span>
          </div>
          <Button 
            onClick={handleCopyAll}
            className="mt-6 bg-white text-blue-900 hover:bg-blue-50 font-bold"
          >
            <Copy className="w-4 h-4 mr-2" /> 전체 복사
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
        <p className="text-sm text-gray-500 mb-6">
          각 섹션의 [복사] 버튼을 눌러 해당 항목만 복사할 수 있습니다. 예비창업패키지 온라인 신청서의 각 입력란에 붙여넣기 하세요.
        </p>

        {sections.map((section) => {
          const isExpanded = expandedId === section.id;
          return (
            <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : section.id)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(section.content, section.id);
                    }}
                    className="text-xs h-8"
                  >
                    {copiedId === section.id ? (
                      <><Check className="w-3 h-3 mr-1 text-green-600" /> 복사됨</>
                    ) : (
                      <><Copy className="w-3 h-3 mr-1" /> 복사</>
                    )}
                  </Button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-6 py-5 bg-white">
                  <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-gray-800">
                    {section.content}
                  </pre>
                </div>
              )}
            </div>
          );
        })}

        {/* Tips */}
        <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-bold text-amber-900 mb-3">💡 작성 팁</h3>
          <ul className="text-sm text-amber-800 space-y-2">
            <li>• 온라인 신청서에 붙여넣기 후, 글자 수 제한에 맞게 조정하세요.</li>
            <li>• '선별(Screening) 플랫폼'으로 일관되게 표현하여 의료법 이슈를 회피합니다.</li>
            <li>• 실제 트랙션 데이터(MAU 200, 전환율 39.6%)를 반드시 강조하세요.</li>
            <li>• 팀의 다양성(아동심리 + Harvard + 여성가족부)이 핵심 차별점입니다.</li>
            <li>• 매출 전망은 보수적으로 작성되어 있어 현실성 있는 수치입니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StartupPackage;
