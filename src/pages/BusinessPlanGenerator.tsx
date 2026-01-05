import { useState } from 'react';
import MobileOptimizedLayout from '@/components/MobileOptimizedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileText, Sparkles } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

const BusinessPlanGenerator = () => {
  const [formData, setFormData] = useState({
    companyName: 'AI하이라이트PRO',
    founderName: '',
    itemName: 'AI 기반 심리분석 및 발달진단 플랫폼',
    targetAmount: '5,000',
    coreValue: '3분 만에 완성하는 AI 심리분석 - 기존 대비 90% 비용 절감, 100배 접근성 향상',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateWordDocument = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // 표지
            new Paragraph({
              children: [new TextRun({ text: '', break: 3 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: '예비창업패키지',
                  bold: true,
                  size: 48,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: '사업계획서',
                  bold: true,
                  size: 72,
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: '', break: 4 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: formData.itemName,
                  bold: true,
                  size: 36,
                  color: '6B21A8',
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: '', break: 6 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `기업명: ${formData.companyName}`,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `대표자: ${formData.founderName || 'OOO'}`,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `작성일: ${new Date().toLocaleDateString('ko-KR')}`,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }),

            // 목차
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '목 차', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),
            ...[
              '1. 창업아이템 개요',
              '2. 문제 정의 및 솔루션',
              '3. 제품/서비스 상세',
              '4. 시장 분석',
              '5. 비즈니스 모델',
              '6. 경쟁력 분석',
              '7. 마케팅 전략',
              '8. 팀 구성',
              '9. 사업화 로드맵',
              '10. 자금 운용 계획',
              '11. 리스크 관리',
              '12. 기대 효과',
            ].map(item => new Paragraph({
              children: [new TextRun({ text: item, size: 24 })],
              spacing: { after: 200 },
            })),

            // 1. 창업아이템 개요
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '1. 창업아이템 개요', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),
            
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '1.1 아이템명', bold: true })],
            }),
            new Paragraph({
              children: [new TextRun({ text: formData.itemName })],
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '1.2 핵심 가치 제안 (Value Proposition)', bold: true })],
            }),
            new Paragraph({
              children: [new TextRun({ text: formData.coreValue })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '1.3 사업 개요', bold: true })],
            }),
            createTable([
              ['구분', '내용'],
              ['서비스명', formData.companyName],
              ['핵심 서비스', 'AI 기반 심리검사, 발달진단, 전문가 상담 연결'],
              ['타겟 고객', 'B2C: 부모/성인 | B2B: 유치원/학교/상담센터'],
              ['핵심 차별점', '20종 자체 개발 검사, 50+ 전문가 네트워크, 즉시 결과'],
              ['수익 모델', '구독제 + 토큰 결제 + B2B 라이선스'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '1.4 현재까지 성과', bold: true })],
            }),
            createTable([
              ['지표', '수치', '기간'],
              ['누적 방문자', '10,000명+', '6개월 (2025.07~2026.01)'],
              ['검사 완료율', '33.6%', '업계 평균 대비 2배'],
              ['회원 가입자', '99명', '전환율 2.3%'],
              ['페이지뷰', '10,390회', '최근 90일'],
              ['개발 검사 수', '20종', '자체 개발'],
            ]),

            // 2. 문제 정의 및 솔루션
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '2. 문제 정의 및 솔루션', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '2.1 해결하고자 하는 문제', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '문제 1: 높은 비용 장벽', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '전문 심리검사 1회 비용이 10~30만원에 달하며, 발달검사의 경우 50만원 이상 소요됩니다. 경제적 여건이 어려운 가정의 아이들은 적시에 적절한 검사를 받지 못해 골든타임을 놓치는 경우가 빈번합니다.' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '문제 2: 긴 대기시간', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '대형 병원 기준 심리검사 예약 대기시간이 평균 2~4주이며, 전문 발달센터의 경우 2~3개월 이상 소요되기도 합니다. 특히 발달장애의 경우 만 3세 이전 조기 개입이 중요하나, 대기시간으로 인해 골든타임을 놓치게 됩니다.' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '문제 3: 지역 간 격차', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '아동심리 전문가의 약 70%가 수도권에 집중되어 있어, 지방 및 소도시 거주자들은 전문적인 심리서비스를 받기 어렵습니다. 이로 인해 조기 발견과 개입이 지연되고 있습니다.' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '문제 4: 정보 비대칭', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '부모들은 자녀의 발달이나 심리 상태에 문제를 감지해도 어디서 어떤 도움을 받아야 할지 모르는 경우가 많습니다. 신뢰할 수 있는 정보와 전문가 연결 채널이 부재합니다.' }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '2.2 솔루션', bold: true })],
            }),
            createTable([
              ['기존 방식', '당사 솔루션', '개선 효과'],
              ['오프라인 검사 (30분~2시간)', '온라인 AI 분석 (3분)', '시간 90% 단축'],
              ['결과 대기 1~2주', '즉시 결과 확인', '대기시간 제로'],
              ['검사당 10~30만원', '무료~월 29,900원', '비용 90% 절감'],
              ['수도권 중심 서비스', '전국 어디서나 24시간', '접근성 100배 향상'],
              ['전문가 찾기 어려움', 'AI 기반 전문가 매칭', '즉시 연결'],
            ]),

            // 3. 제품/서비스 상세
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '3. 제품/서비스 상세', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '3.1 서비스 구성', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '① AI 심리검사 (20종 자체 개발)', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '- 발달선별검사: 영유아 발달 지연 조기 발견\n- ADHD 스크리닝: 주의력결핍/과잉행동 선별\n- 정서검사: 스트레스, 우울, 불안 척도\n- 성격검사: MBTI, 애착유형, 방어기제\n- 관계검사: 연애 스타일, 의사소통 유형\n- 적성검사: 진로, 직업 가치관' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '② AI 분석 리포트', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '- GPT-4 기반 정밀 분석\n- 9개 섹션 구조화된 전문가급 리포트\n- 실시간 연구자료 검색 (Perplexity API 연동)\n- PDF/워드 다운로드, 이메일 공유 기능' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '③ 전문가 상담 연결', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '- 50+ 검증된 심리상담사 네트워크\n- 실시간 화상/채팅 상담\n- AI 기반 전문가 매칭 알고리즘\n- 토큰 기반 간편 결제' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '④ 관찰일지 및 성장 추적', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '- 일일 관찰 기록 작성\n- AI 기반 패턴 분석\n- 시간에 따른 변화 추이 시각화\n- IEP(개별화교육계획) 자동 생성' }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '3.2 핵심 기술', bold: true })],
            }),
            createTable([
              ['기술 영역', '적용 기술', '활용 방안'],
              ['AI 분석 엔진', 'GPT-4, Gemini 2.5 Pro', '심리분석, 자연어 처리'],
              ['음성 인식', 'OpenAI Whisper, ElevenLabs', '음성 감정 분석, TTS'],
              ['실시간 검색', 'Perplexity API', '최신 연구자료 검색'],
              ['웹 크롤링', 'Firecrawl API', '기관 정보 수집'],
              ['인프라', 'Supabase, Vercel', '서버리스 아키텍처'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '3.3 지식재산권 확보 계획', bold: true })],
            }),
            createTable([
              ['구분', '내용', '출원/등록 시기'],
              ['특허', 'AI 심리분석 알고리즘', '2026년 2분기'],
              ['특허', '음성 기반 감정 인식 시스템', '2026년 3분기'],
              ['특허', '발달 패턴 예측 모델', '2026년 4분기'],
              ['저작권', '자체 개발 심리검사 20종', '등록 완료'],
              ['상표', 'AI하이라이트PRO', '출원 중'],
            ]),

            // 4. 시장 분석
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '4. 시장 분석', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '4.1 시장 규모', bold: true })],
            }),
            createTable([
              ['시장 구분', '2025년 규모', '2028년 전망', 'CAGR'],
              ['TAM (국내 심리상담 시장)', '2.5조원', '4조원', '15%'],
              ['SAM (온라인 심리서비스)', '3,000억원', '7,000억원', '25%'],
              ['SOM (AI 심리검사)', '500억원', '1,500억원', '40%'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '4.2 시장 동향 및 기회', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '① 정부 정책 기회', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '2026년 정부는 청소년 위기 대응 시스템을 대폭 강화할 예정입니다. 온라인 성착취 모니터링 플랫폼을 기존 10개에서 125개로 확대하고, SNS 위기 분석 및 상담 연계 시스템을 구축합니다. 당사 플랫폼은 이러한 정부 사업의 민간 파트너로서 참여 가능한 기술력과 데이터를 보유하고 있습니다.' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '② 디지털 헬스케어 성장', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '코로나19 이후 비대면 의료 및 심리서비스에 대한 수요가 급증했습니다. 디지털 헬스케어 시장은 연평균 20% 이상 성장하고 있으며, 특히 정신건강 영역의 성장세가 두드러집니다.' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '③ AI 기술 발전', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'GPT-4, Gemini 등 대규모 언어모델(LLM)의 발전으로 정교한 심리분석이 가능해졌습니다. 음성 감정 인식, 자연어 처리 기술의 발전은 비대면 심리서비스의 질을 크게 향상시켰습니다.' }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '4.3 타겟 고객 분석', bold: true })],
            }),
            createTable([
              ['세그먼트', '특성', '니즈', '접근 전략'],
              ['부모 (B2C)', '자녀 발달 우려, 30~40대', '빠르고 저렴한 검사', '무료 체험 → 구독 전환'],
              ['성인 (B2C)', '심리 상태 궁금, 20~30대', '재미있고 정확한 검사', 'SNS 바이럴'],
              ['유치원/학교 (B2B)', '발달선별 의무', '효율적인 대규모 검사', '파일럿 → 정식 도입'],
              ['상담센터 (B2B)', '검사 외주 필요', '전문적이고 저렴한 도구', '제휴 프로그램'],
            ]),

            // 5. 비즈니스 모델
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '5. 비즈니스 모델', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '5.1 수익 구조', bold: true })],
            }),
            createTable([
              ['수익원', '가격', '예상 비중', '설명'],
              ['B2C 구독 (Basic)', '월 9,900원', '15%', '기본 검사 무제한'],
              ['B2C 구독 (Pro)', '월 19,900원', '10%', '고급 분석 + 상담 할인'],
              ['B2C 구독 (Premium)', '월 29,900원', '5%', '전문가 리포트 + 우선 상담'],
              ['B2B 기관 (Starter)', '월 99,000원', '20%', '10명 이하 기관'],
              ['B2B 기관 (Standard)', '월 199,000원', '20%', '50명 이하 기관'],
              ['B2B 기관 (Pro)', '월 399,000원', '10%', '무제한 + 맞춤 리포트'],
              ['전문가 상담 중개', '건당 10% 수수료', '15%', '상담 예약 수수료'],
              ['기업 복지 솔루션', '협의', '5%', 'EAP 연계'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '5.2 고객 획득 전략', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '무료 체험 → 회원가입 → 유료 전환 퍼널', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '1. 무료 검사 8종 제공 (게스트 모드)\n2. 결과 일부 공개 → 전체 결과는 회원가입 필요\n3. 3개월 무료 베타 → 유료 전환\n\n목표 전환율: 무료→가입 8%, 가입→유료 15%' }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '5.3 Unit Economics', bold: true })],
            }),
            createTable([
              ['지표', '현재', '목표 (12개월 후)'],
              ['CAC (고객획득비용)', '15,000원', '10,000원'],
              ['LTV (고객생애가치)', '89,000원', '150,000원'],
              ['LTV/CAC 비율', '5.9x', '15x'],
              ['월간 이탈률', '측정 중', '5% 이하'],
              ['ARPU', '9,900원', '15,000원'],
            ]),

            // 6. 경쟁력 분석
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '6. 경쟁력 분석', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '6.1 경쟁사 비교', bold: true })],
            }),
            createTable([
              ['항목', '마보', '트로스트', '닥터나우', '당사'],
              ['핵심 서비스', '명상/마음건강', '심리상담', '비대면 의료', 'AI 심리검사'],
              ['검사 기능', '제한적', '없음', '없음', '20종 보유'],
              ['AI 분석', '없음', '없음', '없음', 'GPT-4 연동'],
              ['B2B 서비스', '없음', '없음', '없음', '기관용 요금제'],
              ['가격대', '무료~15,000원', '50,000원~', '진료비 별도', '무료~29,900원'],
              ['전문가 네트워크', '제한적', '있음', '의사 중심', '50+ 심리전문가'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '6.2 핵심 경쟁 우위', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '① 진입장벽: ', bold: true }),
                new TextRun({ text: '20종의 자체 개발 심리검사와 50+ 전문가 네트워크는 단기간에 복제 불가능한 핵심 자산입니다.' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '② 기술 우위: ', bold: true }),
                new TextRun({ text: 'GPT-4, Perplexity, Firecrawl 등 최신 AI 기술을 통합한 분석 엔진은 타 서비스 대비 월등한 품질을 제공합니다.' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '③ 데이터 우위: ', bold: true }),
                new TextRun({ text: '10,000+ 검사 데이터 축적으로 분석 정확도가 지속적으로 개선됩니다.' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '④ 가격 우위: ', bold: true }),
                new TextRun({ text: '자동화된 AI 분석으로 기존 대비 90% 저렴한 가격 제공이 가능합니다.' }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '6.3 SWOT 분석', bold: true })],
            }),
            createTable([
              ['Strengths (강점)', 'Weaknesses (약점)'],
              ['• 20종 자체 개발 검사\n• 최신 AI 기술 통합\n• 전문가 네트워크 확보\n• 검증된 트랙션 (1만 방문자)', '• 브랜드 인지도 낮음\n• 소규모 팀 (자원 제약)\n• 수익 모델 검증 필요'],
            ]),
            createTable([
              ['Opportunities (기회)', 'Threats (위협)'],
              ['• 정부 청소년 정책 확대\n• 비대면 서비스 수요 증가\n• AI 기술 발전\n• B2B 시장 성장', '• 대기업 진출 가능성\n• 규제 리스크\n• 기술 변화 속도'],
            ]),

            // 7. 마케팅 전략
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '7. 마케팅 전략', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '7.1 마케팅 채널 전략', bold: true })],
            }),
            createTable([
              ['채널', '목적', '예산 비중', 'KPI'],
              ['구글/네이버 검색광고', '의도 기반 고객 획득', '40%', 'CPC 500원 이하'],
              ['인스타그램/페이스북', '인지도 확대', '25%', 'CPM 5,000원 이하'],
              ['육아 커뮤니티', '바이럴/신뢰 구축', '15%', '월 100+ 언급'],
              ['인플루언서 협업', '인지도 확대', '10%', '팔로워 10만+ 협업'],
              ['B2B 직접 영업', '기관 고객 확보', '10%', '월 5개 미팅'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '7.2 단계별 마케팅 계획', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Phase 1: 인지도 구축 (1~3개월)', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• 네이버/구글 검색광고 집중 (심리검사, 발달검사 키워드)\n• 육아 커뮤니티 콘텐츠 마케팅\n• 무료 체험 이벤트 진행\n• 목표: MAU 3,000명 달성' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Phase 2: 전환율 최적화 (4~6개월)', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• 게스트 모드로 진입장벽 최소화\n• 부분 결과 공개 → 회원가입 유도\n• 카카오 소셜 로그인 도입\n• 목표: 가입 전환율 8% 달성' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Phase 3: B2B 확장 (7~12개월)', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• 유치원/어린이집 파일럿 프로그램\n• 교육청/지자체 제안\n• 성공 사례 기반 확산\n• 목표: B2B 기관 10개 확보' }),
              ],
              spacing: { after: 200 },
            }),

            // 8. 팀 구성
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '8. 팀 구성', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '8.1 현재 팀 구성', bold: true })],
            }),
            createTable([
              ['역할', '담당자', '주요 역량', '담당 업무'],
              ['대표/기획', formData.founderName || 'OOO', '서비스 기획, 사업 개발', '전략 수립, 투자 유치, 제휴'],
              ['개발', 'AI 기반 개발', 'React, Supabase, AI 연동', '플랫폼 개발, AI 연동'],
              ['자문', '심리전문가 네트워크', '임상심리, 발달심리', '검사 개발, 콘텐츠 검수'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '8.2 채용 계획', bold: true })],
            }),
            createTable([
              ['직무', '인원', '채용 시기', '핵심 역량'],
              ['풀스택 개발자', '1명', '1분기', 'React, Node.js, AI'],
              ['마케터', '1명', '2분기', '퍼포먼스 마케팅'],
              ['심리전문가 (풀타임)', '1명', '3분기', '임상심리사 자격'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '8.3 외주 불가 핵심 역량', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '1. 심리 전문성: 검사 개발 및 품질 관리는 내부 전문가가 직접 수행해야 신뢰성 확보\n2. AI 품질 관리: 분석 결과 정확도 검증 및 개선은 서비스 핵심 경쟁력\n3. 전문가 생태계 운영: 상담사 네트워크 관리 및 품질 유지' }),
              ],
              spacing: { after: 200 },
            }),

            // 9. 사업화 로드맵
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '9. 사업화 로드맵', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '9.1 단기 로드맵 (2026년)', bold: true })],
            }),
            createTable([
              ['분기', '목표', '세부 과제', 'KPI'],
              ['Q1', 'PMF 검증', '유료 전환 시작, 게스트 모드 도입', 'MAU 3,000명'],
              ['Q2', '성장 가속', 'B2B 파일럿 5개 기관', '월매출 300만원'],
              ['Q3', 'B2B 확장', '기관 10개 확보', '월매출 700만원'],
              ['Q4', '수익화 안정', '연간 구독 런칭', '월매출 1,000만원'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '9.2 중장기 로드맵 (2027~2028년)', bold: true })],
            }),
            createTable([
              ['연도', '목표', 'KPI'],
              ['2027년', 'B2B 확장 및 시리즈A', 'B2B 100개 기관, 월매출 1억원, 10억 투자 유치'],
              ['2028년', '시장 지배 및 해외 진출', '정부 사업 수주, 일본 시장 진출, 월매출 5억원'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '9.3 주요 마일스톤', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '✓ 2025.07 MVP 출시\n✓ 2025.09 5,000 방문자 달성\n✓ 2025.11 B2B 파일럿 시작\n✓ 2026.01 10,000 방문자 달성 ◀ 현재\n○ 2026.03 유료 전환 시작 (목표)\n○ 2026.06 B2B 10개 기관 (목표)\n○ 2026.12 월 매출 1,000만원 (목표)\n○ 2027.06 시리즈A 투자 유치\n○ 2028.01 정부 사업 수주' }),
              ],
              spacing: { after: 200 },
            }),

            // 10. 자금 운용 계획
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '10. 자금 운용 계획', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: `10.1 신청 금액: ${formData.targetAmount}만원`, bold: true })],
            }),
            createTable([
              ['항목', '금액 (만원)', '비중', '상세 용도'],
              ['인건비', '2,000', '40%', '개발자 1명 (6개월) - 월 330만원'],
              ['마케팅비', '1,500', '30%', '검색광고 800, SNS 500, 이벤트 200'],
              ['서버/인프라', '500', '10%', '클라우드 서버, AI API 비용'],
              ['지식재산권', '500', '10%', '특허 2건, 상표 1건 출원'],
              ['운영비', '500', '10%', '사무실, 법률자문, 기타'],
              ['합계', formData.targetAmount, '100%', '-'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '10.2 월별 자금 집행 계획', bold: true })],
            }),
            createTable([
              ['월', '인건비', '마케팅', '인프라', '기타', '합계'],
              ['1월', '330', '200', '80', '100', '710'],
              ['2월', '330', '250', '80', '80', '740'],
              ['3월', '330', '300', '90', '100', '820'],
              ['4월', '340', '250', '90', '80', '760'],
              ['5월', '340', '250', '80', '70', '740'],
              ['6월', '330', '250', '80', '70', '730'],
              ['합계', '2,000', '1,500', '500', '500', '4,500'],
            ]),
            new Paragraph({
              children: [new TextRun({ text: '* 지식재산권 500만원은 별도 집행 예정', italics: true, size: 20 })],
              spacing: { after: 200 },
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '10.3 예상 수익 계획', bold: true })],
            }),
            createTable([
              ['구분', 'Q1', 'Q2', 'Q3', 'Q4', '연간'],
              ['B2C 매출', '50', '150', '300', '500', '1,000'],
              ['B2B 매출', '0', '200', '500', '800', '1,500'],
              ['기타 매출', '0', '50', '100', '200', '350'],
              ['총 매출', '50', '400', '900', '1,500', '2,850'],
            ]),
            new Paragraph({
              children: [new TextRun({ text: '* 단위: 만원', italics: true, size: 20 })],
              spacing: { after: 200 },
            }),

            // 11. 리스크 관리
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '11. 리스크 관리', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '11.1 리스크 식별 및 대응', bold: true })],
            }),
            createTable([
              ['리스크', '발생 가능성', '영향도', '대응 전략'],
              ['대기업 진출', '중', '상', '니치 시장 집중, 전문성 차별화'],
              ['규제 변화', '중', '중', '법률 자문, 사전 규제 대응'],
              ['기술 변화', '상', '중', '지속적 R&D, 외부 기술 제휴'],
              ['고객 이탈', '중', '상', '서비스 품질 향상, 커뮤니티 구축'],
              ['인력 이탈', '중', '상', '스톡옵션, 성장 기회 제공'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '11.2 법적/윤리적 고려사항', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '① 개인정보보호: ', bold: true }),
                new TextRun({ text: '개인정보보호법 및 GDPR 준수, 데이터 암호화, 접근 권한 관리' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '② 의료법 준수: ', bold: true }),
                new TextRun({ text: '검사 결과는 의료 진단이 아닌 참고 자료임을 명시, 전문 상담 권유' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '③ AI 윤리: ', bold: true }),
                new TextRun({ text: 'AI 분석 결과의 한계 명시, 사람에 의한 최종 판단 강조' }),
              ],
              spacing: { after: 200 },
            }),

            // 12. 기대 효과
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun({ text: '12. 기대 효과', bold: true })],
              pageBreakBefore: true,
            }),
            new Paragraph({ children: [new TextRun({ text: '' })] }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '12.1 사회적 기대 효과', bold: true })],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '① 발달장애 조기 발견율 향상: ', bold: true }),
                new TextRun({ text: '접근성 향상으로 더 많은 아이들이 골든타임 내 진단 가능' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '② 정신건강 사각지대 해소: ', bold: true }),
                new TextRun({ text: '저비용 서비스로 경제적 약자도 심리서비스 이용 가능' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '③ 지역 격차 완화: ', bold: true }),
                new TextRun({ text: '온라인 서비스로 지방/소도시 거주자도 전문 서비스 이용 가능' }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '12.2 경제적 기대 효과', bold: true })],
            }),
            createTable([
              ['구분', '1년차', '2년차', '3년차'],
              ['매출액', '2,850만원', '1.5억원', '6억원'],
              ['고용 창출', '2명', '5명', '10명'],
              ['B2B 기관 수', '10개', '100개', '300개'],
              ['서비스 이용자', '5만명', '20만명', '50만명'],
            ]),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun({ text: '12.3 투자자 어필 포인트', bold: true })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ 
                  text: '"심리검사의 쿠팡"', 
                  bold: true, 
                  size: 32,
                  color: '6B21A8',
                }),
              ],
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ 
                  text: '기존 대비 90% 비용 절감, 100배 접근성 향상',
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '1. 시장 타이밍: ', bold: true }),
                new TextRun({ text: '2026년 정부 청소년 위기 대응 정책과 완벽 연계' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '2. 진입장벽: ', bold: true }),
                new TextRun({ text: '20종 자체 검사 + 50+ 전문가 네트워크 + 토큰 시스템' }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '3. 확장성: ', bold: true }),
                new TextRun({ text: 'B2C → B2B → SaaS → 데이터 자산화' }),
              ],
              spacing: { after: 200 },
            }),

            // 끝
            new Paragraph({
              children: [new TextRun({ text: '', break: 2 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: '- 끝 -', bold: true, size: 24 }),
              ],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${formData.companyName}_예비창업패키지_사업계획서.docx`);
      toast.success('사업계획서가 다운로드되었습니다!');
    } catch (error) {
      console.error('문서 생성 오류:', error);
      toast.error('문서 생성 중 오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MobileOptimizedLayout showBackButton title="예비창업패키지 사업계획서">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-primary to-purple-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">예비창업패키지</h1>
                <p className="text-white/80 text-sm">사업계획서 생성기</p>
              </div>
            </div>
            <p className="text-white/90 text-sm">
              AI하이라이트PRO 실적 기반의 상세한 사업계획서를 워드 파일로 다운로드하세요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              기본 정보 입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">기업명</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founderName">대표자명</Label>
              <Input
                id="founderName"
                value={formData.founderName}
                onChange={(e) => handleInputChange('founderName', e.target.value)}
                placeholder="홍길동"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemName">아이템명</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">신청 금액 (만원)</Label>
              <Input
                id="targetAmount"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coreValue">핵심 가치 제안</Label>
              <Textarea
                id="coreValue"
                value={formData.coreValue}
                onChange={(e) => handleInputChange('coreValue', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">포함 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                '1. 창업아이템 개요',
                '2. 문제 정의 및 솔루션',
                '3. 제품/서비스 상세',
                '4. 시장 분석',
                '5. 비즈니스 모델',
                '6. 경쟁력 분석',
                '7. 마케팅 전략',
                '8. 팀 구성',
                '9. 사업화 로드맵',
                '10. 자금 운용 계획',
                '11. 리스크 관리',
                '12. 기대 효과',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={generateWordDocument}
          disabled={isGenerating}
          className="w-full h-14 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>생성 중...</>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              워드 파일 다운로드 (.docx)
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          * 실제 사업계획서 제출 시 추가 수정이 필요할 수 있습니다
        </p>
      </div>
    </MobileOptimizedLayout>
  );
};

// 테이블 생성 헬퍼 함수
function createTable(data: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: data.map((row, rowIndex) =>
      new TableRow({
        children: row.map((cell) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cell,
                    bold: rowIndex === 0,
                    size: 20,
                  }),
                ],
              }),
            ],
            width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
            shading: rowIndex === 0 ? { fill: 'E9D5FF' } : undefined,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            },
          })
        ),
      })
    ),
  });
}

export default BusinessPlanGenerator;
