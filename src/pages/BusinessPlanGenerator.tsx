import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileDown, FileText, Building2, User, Target, Wallet, TrendingUp, Users, Shield, Lightbulb, Award, BarChart3, PieChart, Calendar, Rocket, Globe, Heart, Brain, Sparkles, ArrowLeft } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, convertInchesToTwip, Footer, PageNumber, Header } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FormData {
  companyName: string;
  founderName: string;
  founderBackground: string;
  itemName: string;
  itemDescription: string;
  targetAmount: string;
  email: string;
  phone: string;
}

const BusinessPlanGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    companyName: 'AI HighlightPRO',
    founderName: '',
    founderBackground: '',
    itemName: 'AI 기반 심리분석 및 발달진단 통합 플랫폼',
    itemDescription: 'GPT-4 기반 AI가 심리검사, 발달검사, 관찰일지를 분석하여 전문가 수준의 인사이트를 제공하는 혁신적인 헬스테크 플랫폼',
    targetAmount: '50,000,000',
    email: '',
    phone: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 표 생성 헬퍼 함수
  const createTable = (headers: string[], rows: string[][], columnWidths?: number[]) => {
    const defaultWidth = 100 / headers.length;
    const widths = columnWidths || headers.map(() => defaultWidth);
    
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: headers.map((header, i) => 
            new TableCell({
              width: { size: widths[i], type: WidthType.PERCENTAGE },
              shading: { fill: "1a365d" },
              children: [new Paragraph({
                children: [new TextRun({ text: header, bold: true, color: "FFFFFF", size: 22 })],
                alignment: AlignmentType.CENTER
              })]
            })
          )
        }),
        ...rows.map((row, rowIndex) => 
          new TableRow({
            children: row.map((cell, i) => 
              new TableCell({
                width: { size: widths[i], type: WidthType.PERCENTAGE },
                shading: { fill: rowIndex % 2 === 0 ? "f7fafc" : "ffffff" },
                children: [new Paragraph({
                  children: [new TextRun({ text: cell, size: 20 })],
                  alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER
                })]
              })
            )
          })
        )
      ]
    });
  };

  // 강조 박스 생성
  const createHighlightBox = (title: string, content: string) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "ebf8ff" },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 2, color: "3182ce" },
                bottom: { style: BorderStyle.SINGLE, size: 2, color: "3182ce" },
                left: { style: BorderStyle.SINGLE, size: 8, color: "3182ce" },
                right: { style: BorderStyle.SINGLE, size: 2, color: "3182ce" },
              },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `💡 ${title}`, bold: true, size: 24, color: "2b6cb0" })],
                  spacing: { after: 100 }
                }),
                new Paragraph({
                  children: [new TextRun({ text: content, size: 22 })]
                })
              ]
            })
          ]
        })
      ]
    });
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "Normal",
              name: "Normal",
              run: { size: 22, font: "맑은 고딕" },
              paragraph: { spacing: { line: 360, after: 120 } }
            },
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              run: { size: 36, bold: true, color: "1a365d", font: "맑은 고딕" },
              paragraph: { spacing: { before: 400, after: 200 } }
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              run: { size: 28, bold: true, color: "2c5282", font: "맑은 고딕" },
              paragraph: { spacing: { before: 300, after: 150 } }
            },
            {
              id: "Heading3",
              name: "Heading 3",
              basedOn: "Normal",
              next: "Normal",
              run: { size: 24, bold: true, color: "2b6cb0", font: "맑은 고딕" },
              paragraph: { spacing: { before: 200, after: 100 } }
            }
          ]
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              }
            }
          },
          headers: {
            default: new Header({
              children: [new Paragraph({
                children: [new TextRun({ text: `${formData.companyName} | 예비창업패키지 사업계획서`, size: 18, color: "718096" })],
                alignment: AlignmentType.RIGHT
              })]
            })
          },
          footers: {
            default: new Footer({
              children: [new Paragraph({
                children: [
                  new TextRun({ text: "- ", size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: " -", size: 18 })
                ],
                alignment: AlignmentType.CENTER
              })]
            })
          },
          children: [
            // ========== 표지 ==========
            new Paragraph({ text: "", spacing: { after: 1000 } }),
            new Paragraph({
              children: [new TextRun({ text: "예비창업패키지", size: 32, color: "718096" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "사 업 계 획 서", size: 56, bold: true, color: "1a365d" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            }),
            new Paragraph({
              children: [new TextRun({ text: formData.itemName, size: 36, bold: true, color: "2b6cb0" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `"심리검사의 쿠팡" - AI로 심리건강 접근성을 100배 높이다`, size: 24, italics: true, color: "4a5568" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 1000 }
            }),
            
            // 표지 정보 테이블
            new Table({
              width: { size: 60, type: WidthType.PERCENTAGE },
              alignment: AlignmentType.CENTER,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      shading: { fill: "edf2f7" },
                      children: [new Paragraph({ children: [new TextRun({ text: "회 사 명", bold: true, size: 24 })], alignment: AlignmentType.CENTER })]
                    }),
                    new TableCell({
                      width: { size: 70, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: formData.companyName, size: 24 })], alignment: AlignmentType.CENTER })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      shading: { fill: "edf2f7" },
                      children: [new Paragraph({ children: [new TextRun({ text: "대 표 자", bold: true, size: 24 })], alignment: AlignmentType.CENTER })]
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: formData.founderName || "OOO", size: 24 })], alignment: AlignmentType.CENTER })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      shading: { fill: "edf2f7" },
                      children: [new Paragraph({ children: [new TextRun({ text: "신청금액", bold: true, size: 24 })], alignment: AlignmentType.CENTER })]
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: `${formData.targetAmount}원`, size: 24 })], alignment: AlignmentType.CENTER })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      shading: { fill: "edf2f7" },
                      children: [new Paragraph({ children: [new TextRun({ text: "작 성 일", bold: true, size: 24 })], alignment: AlignmentType.CENTER })]
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString('ko-KR'), size: 24 })], alignment: AlignmentType.CENTER })]
                    })
                  ]
                })
              ]
            }),
            
            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 목차 ==========
            new Paragraph({
              text: "목 차",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            
            ...[
              "1. Executive Summary (핵심 요약)",
              "2. 문제 정의 및 솔루션",
              "3. 제품/서비스 상세",
              "4. 플랫폼 핵심 기능",
              "5. 기술 및 지식재산권",
              "6. 시장 분석",
              "7. 비즈니스 모델",
              "8. 경쟁력 분석",
              "9. 마케팅 전략",
              "10. 팀 구성",
              "11. 사업 추진 일정",
              "12. 재무 계획",
              "13. 리스크 관리",
              "14. 투자 요청 및 활용 계획",
              "15. 기대 효과",
              "16. 첨부 자료"
            ].map(item => new Paragraph({
              children: [new TextRun({ text: item, size: 24 })],
              spacing: { after: 150 },
              indent: { left: convertInchesToTwip(0.5) }
            })),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 1. Executive Summary ==========
            new Paragraph({ text: "1. Executive Summary (핵심 요약)", heading: HeadingLevel.HEADING_1 }),
            
            createHighlightBox(
              "한 줄 요약",
              "AI HighlightPRO는 GPT-4 기반 AI가 심리검사·발달검사·관찰일지를 통합 분석하여, 기존 대비 90% 저렴한 비용과 100배 높은 접근성으로 전문가 수준의 심리분석 서비스를 제공하는 '심리검사의 쿠팡'입니다."
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "1.1 핵심 가치 제안", heading: HeadingLevel.HEADING_2 }),
            
            createTable(
              ["구분", "기존 방식", "AI HighlightPRO", "개선율"],
              [
                ["비용", "10~30만원/회", "무료~2.9만원/월", "90%↓"],
                ["시간", "2~4주 대기", "즉시 결과", "100%↓"],
                ["접근성", "수도권 집중", "24시간 전국", "100배↑"],
                ["분석 깊이", "단일 검사", "통합 분석", "10배↑"],
                ["지속성", "1회성", "누적 추적", "∞"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "1.2 핵심 성과 지표 (2024.07 ~ 2025.01, 6개월)", heading: HeadingLevel.HEADING_2 }),
            
            createTable(
              ["지표", "수치", "의미"],
              [
                ["누적 방문자", "10,000+명", "시장 관심도 검증"],
                ["검사 완료율", "33.6%", "서비스 완성도 입증"],
                ["가입 전환율", "2.3% (99명)", "PMF 진입 단계"],
                ["자체 개발 검사", "20+종", "독자 콘텐츠 확보"],
                ["전문가 네트워크", "50+명", "B2B 확장 기반"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "1.3 투자 하이라이트", heading: HeadingLevel.HEADING_2 }),
            
            new Paragraph({
              children: [
                new TextRun({ text: "✓ ", bold: true, color: "38a169" }),
                new TextRun({ text: "검증된 트랙션: ", bold: true }),
                new TextRun({ text: "6개월 만에 누적 방문자 1만명, 33.6% 검사 완료율로 Product-Market Fit 진입 확인" })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "✓ ", bold: true, color: "38a169" }),
                new TextRun({ text: "높은 진입장벽: ", bold: true }),
                new TextRun({ text: "20종 이상 자체 개발 검사도구, 특허 출원 예정 AI 분석 엔진" })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "✓ ", bold: true, color: "38a169" }),
                new TextRun({ text: "정부 정책 정합성: ", bold: true }),
                new TextRun({ text: "2026년 청소년 위기대응 정책(온라인 성착취 모니터링 125개, SNS 위기분석)과 직접 연계 가능" })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "✓ ", bold: true, color: "38a169" }),
                new TextRun({ text: "확장 가능한 BM: ", bold: true }),
                new TextRun({ text: "B2C(부모) → B2B(기관) → B2G(정부) 단계별 확장 로드맵 보유" })
              ],
              spacing: { after: 100 }
            }),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 2. 문제 정의 ==========
            new Paragraph({ text: "2. 문제 정의 및 솔루션", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "2.1 해결하고자 하는 문제", heading: HeadingLevel.HEADING_2 }),
            
            createTable(
              ["문제", "현황", "영향", "심각도"],
              [
                ["높은 비용 장벽", "전문 심리검사 10~30만원", "저소득층 진입 불가", "★★★★★"],
                ["긴 대기 시간", "평균 2~4주 대기", "골든타임 놓침", "★★★★★"],
                ["지역 불균형", "전문가 80% 수도권 집중", "지방 서비스 사각지대", "★★★★☆"],
                ["정보 비대칭", "결과 해석 어려움", "부적절한 대응", "★★★★☆"],
                ["단절된 추적", "1회성 검사", "발달 추이 파악 불가", "★★★☆☆"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "2.2 문제의 심각성 - 통계로 보는 현실", heading: HeadingLevel.HEADING_2 }),
            
            createTable(
              ["항목", "통계", "출처"],
              [
                ["발달지연 조기발견율", "30% 미만", "보건복지부 2024"],
                ["부모 최초 인지율", "73%", "대한소아청소년정신의학회"],
                ["골든타임 (0~7세)", "94% 정상발달 가능", "WHO"],
                ["청소년 정신건강 문제율", "27.8%", "질병관리청 2024"],
                ["성인 우울증 유병률", "7.9%", "국민건강영양조사 2023"],
                ["심리상담 경험률", "11.4%", "정신건강실태조사 2023"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "2.3 솔루션: AI HighlightPRO", heading: HeadingLevel.HEADING_2 }),

            new Paragraph({
              children: [new TextRun({ text: "AI HighlightPRO는 4가지 핵심 솔루션으로 문제를 해결합니다:", bold: true, size: 24 })],
              spacing: { after: 150 }
            }),
            
            createTable(
              ["솔루션", "기능", "효과"],
              [
                ["① 즉시 분석", "GPT-4 기반 3분 AI 분석", "대기시간 100% 해소"],
                ["② 통합 플랫폼", "검사+관찰+상담 원스톱", "분산된 정보 통합"],
                ["③ 맞춤 추천", "검사 결과 기반 전문가 매칭", "적합한 개입 연결"],
                ["④ 누적 추적", "발달 히스토리 시각화", "장기 변화 모니터링"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 3. 제품/서비스 상세 ==========
            new Paragraph({ text: "3. 제품/서비스 상세", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "3.1 서비스 구조", heading: HeadingLevel.HEADING_2 }),
            
            createTable(
              ["계층", "서비스", "대상", "가격"],
              [
                ["무료 체험", "간편 테스트 5종, AI 기본 분석", "모든 사용자", "0원"],
                ["프리미엄 개인", "심층 테스트 20종, 상세 리포트", "B2C 부모/성인", "월 9,900~29,900원"],
                ["기관용 Starter", "직원/학생 20명, 대시보드", "소규모 기관", "월 99,000원"],
                ["기관용 Standard", "직원/학생 100명, 통계 분석", "중규모 기관", "월 199,000원"],
                ["기관용 Pro", "무제한, API, 맞춤 개발", "대규모 기관", "월 399,000원"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "3.2 사용자 여정 (User Journey)", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["단계", "행동", "제공 가치", "전환 포인트"],
              [
                ["① 유입", "검색/광고로 랜딩", "공감 스토리, 무료 체험 강조", "CTA 클릭"],
                ["② 체험", "게스트 모드로 간편검사", "3분 만에 결과 확인", "상세 분석 유도"],
                ["③ 가입", "소셜 로그인 (카카오)", "30초 간편 가입", "프로필 완성"],
                ["④ 심층", "심층 검사 + AI 분석", "전문가급 리포트 제공", "구독 전환"],
                ["⑤ 유지", "관찰일지, 추적, 상담", "누적 데이터 기반 인사이트", "재구독/추천"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "3.3 핵심 화면 구성", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["화면", "주요 기능", "차별점"],
              [
                ["홈 대시보드", "오늘의 추천, 최근 활동, 알림", "개인화된 인사이트"],
                ["검사 센터", "20종 검사 목록, 필터, 추천", "연령/목적별 맞춤 추천"],
                ["AI 분석 결과", "점수, 해석, 추천, 시각화", "임상심리사급 분석"],
                ["관찰일지", "일상 기록, 음성입력, AI 요약", "누적 패턴 분석"],
                ["발달 추적", "시간별 변화 그래프", "장기 발달 곡선"],
                ["전문가 연결", "프로필, 예약, 화상상담", "검사 결과 기반 매칭"],
                ["가족 관리", "다중 프로필, 공유, 협업", "가족 전체 케어"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 4. 플랫폼 핵심 기능 ==========
            new Paragraph({ text: "4. 플랫폼 핵심 기능", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "4.1 자체 개발 검사도구 (20종+)", heading: HeadingLevel.HEADING_2 }),
            
            createTable(
              ["카테고리", "검사명", "대상 연령", "문항 수", "소요 시간"],
              [
                ["영유아 발달", "영유아 발달 선별검사", "0~6세", "40문항", "10분"],
                ["영유아 발달", "영유아 언어발달검사", "0~6세", "30문항", "8분"],
                ["영유아 발달", "사회성 발달검사", "2~7세", "35문항", "10분"],
                ["아동청소년", "ADHD 선별검사", "6~18세", "25문항", "7분"],
                ["아동청소년", "학습장애 선별검사", "7~15세", "30문항", "8분"],
                ["아동청소년", "또래관계 검사", "8~18세", "25문항", "7분"],
                ["성인 심리", "스트레스 자가진단", "19세+", "20문항", "5분"],
                ["성인 심리", "우울 자가진단", "19세+", "21문항", "5분"],
                ["성인 심리", "불안 자가진단", "19세+", "20문항", "5분"],
                ["성인 심리", "번아웃 자가진단", "19세+", "22문항", "6분"],
                ["관계/성격", "관계역학 분석", "19세+", "35문항", "10분"],
                ["관계/성격", "성격유형 심층분석", "16세+", "60문항", "15분"],
                ["관계/성격", "인생목적 탐색검사", "19세+", "40문항", "12분"],
                ["간편검사", "오늘의 감정체크", "전연령", "10문항", "2분"],
                ["간편검사", "수면의 질 체크", "전연령", "10문항", "2분"],
                ["간편검사", "스트레스 지수 체크", "전연령", "10문항", "2분"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "4.2 AI 분석 엔진 기능", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["기능", "기술", "설명"],
              [
                ["통합 분석", "GPT-4 + Gemini 2.5", "복수 검사 결과 교차 분석"],
                ["실시간 연구 반영", "Perplexity API", "최신 심리학 연구 자동 인용"],
                ["기관 정보 탐색", "Firecrawl API", "관련 치료/교육 기관 크롤링"],
                ["임상심리사급 해석", "프롬프트 엔지니어링", "9개 섹션 400자+ 상세 분석"],
                ["음성 감정 분석", "음성 AI (개발중)", "상담 시 감정 톤 실시간 분석"],
                ["예측 모델링", "ML (개발중)", "발달 궤도 예측 및 조기 경보"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "4.3 차별화 기능", heading: HeadingLevel.HEADING_2 }),

            new Paragraph({ text: "① 관찰일지 시스템", heading: HeadingLevel.HEADING_3 }),
            new Paragraph({
              children: [new TextRun({ text: "부모/교사가 일상에서 관찰한 내용을 텍스트/음성으로 기록 → AI가 자동 분류 및 패턴 분석 → 검사 결과와 교차 검증 → 시간에 따른 변화 추적" })]
            }),

            new Paragraph({ text: "② 가족 생태계", heading: HeadingLevel.HEADING_3 }),
            new Paragraph({
              children: [new TextRun({ text: "한 계정에서 가족 전체(아이, 배우자, 조부모) 프로필 관리 → 가족 역동성 분석 → 세대 간 패턴 파악 → 가족 단위 웰니스 리포트" })]
            }),

            new Paragraph({ text: "③ 전문가 연결 시스템", heading: HeadingLevel.HEADING_3 }),
            new Paragraph({
              children: [new TextRun({ text: "검사 결과 기반 적합 전문가 자동 추천 → 실시간 예약 시스템 → 화상 상담 통합 → 사후 관리 및 리뷰" })]
            }),

            new Paragraph({ text: "④ 두뇌 훈련 게임", heading: HeadingLevel.HEADING_3 }),
            new Paragraph({
              children: [new TextRun({ text: "인지 능력 향상 게임 (기억력, 집중력, 논리력) → 게임 성과 추적 → 두뇌 건강 리포트 → 개인화된 훈련 추천" })]
            }),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 5. 기술 및 지식재산권 ==========
            new Paragraph({ text: "5. 기술 및 지식재산권", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "5.1 기술 스택", heading: HeadingLevel.HEADING_2 }),
            
            createTable(
              ["영역", "기술", "선택 이유"],
              [
                ["프론트엔드", "React 18 + TypeScript", "타입 안정성, 생산성"],
                ["스타일링", "Tailwind CSS + shadcn/ui", "일관된 디자인 시스템"],
                ["상태관리", "TanStack Query", "서버 상태 최적화"],
                ["애니메이션", "Framer Motion", "부드러운 UX"],
                ["백엔드", "Supabase (PostgreSQL)", "실시간, 인증, 스토리지 통합"],
                ["AI 분석", "OpenAI GPT-4, Gemini 2.5", "고품질 자연어 처리"],
                ["검색 증강", "Perplexity API", "최신 연구 실시간 반영"],
                ["크롤링", "Firecrawl API", "기관 정보 자동 수집"],
                ["결제", "토스페이먼츠", "국내 최적화 결제"],
                ["배포", "Lovable (Vercel 기반)", "글로벌 CDN, 자동 배포"],
                ["모바일", "Capacitor (PWA)", "iOS/Android 동시 지원"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "5.2 지식재산권 현황 및 계획", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["구분", "내용", "상태", "예정일"],
              [
                ["특허", "AI 기반 심리검사 통합분석 방법", "출원 준비", "2026 Q2"],
                ["특허", "음성 기반 감정 분석 시스템", "명세서 작성", "2026 Q3"],
                ["특허", "관찰일지 AI 패턴 인식 방법", "기획 중", "2026 Q4"],
                ["저작권", "자체 개발 검사도구 20종", "등록 완료", "2024~2025"],
                ["저작권", "AI 분석 리포트 템플릿", "등록 예정", "2026 Q1"],
                ["상표", "AI HighlightPRO", "출원 예정", "2026 Q1"],
                ["상표", "마음AI", "출원 예정", "2026 Q1"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "5.3 데이터 보안 및 컴플라이언스", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["항목", "대응 현황", "목표"],
              [
                ["개인정보보호법", "필수 동의, 암호화 저장", "준수 완료"],
                ["ISMS-P", "보안 체계 수립 중", "2026 인증"],
                ["의료기기법", "법률 검토 완료 (비의료기기)", "지속 모니터링"],
                ["데이터 암호화", "Supabase RLS + AES-256", "적용 완료"],
                ["접근 로그", "전수 기록 및 감사", "적용 완료"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 6. 시장 분석 ==========
            new Paragraph({ text: "6. 시장 분석", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "6.1 시장 규모 (TAM-SAM-SOM)", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["구분", "정의", "규모", "성장률"],
              [
                ["TAM", "국내 정신건강 서비스 전체", "2.5조원", "12.5%"],
                ["SAM", "디지털 정신건강 서비스", "3,000억원", "25%+"],
                ["SOM", "AI 심리분석 플랫폼", "500억원", "40%+"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "6.2 목표 시장 세분화", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["세그먼트", "규모", "특성", "접근 전략"],
              [
                ["발달 우려 부모", "200만 가구", "0~7세 자녀, 발달 불안", "무료 발달검사 → 구독"],
                ["성인 자가진단", "500만명", "스트레스, 우울 관심", "간편검사 → 심층분석"],
                ["B2B 유치원/학교", "4만개소", "학생 정신건강 의무화", "파일럿 → 연간 계약"],
                ["B2B 기업 복지", "10만개사", "직원 정신건강 니즈", "HR 연계 프로그램"],
                ["B2G 정부 기관", "지자체/교육청", "정책 연계 사업", "실증/입찰 참여"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "6.3 시장 트렌드 및 기회", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["트렌드", "내용", "우리의 기회"],
              [
                ["정신건강 탈오명화", "MZ세대 중심 인식 개선", "진입 장벽 낮아짐"],
                ["디지털 헬스케어 성장", "코로나 이후 비대면 수요", "온라인 서비스 선호"],
                ["정부 정책 강화", "2026 청소년 위기대응 확대", "B2G 사업 기회"],
                ["AI 기술 발전", "GPT-4급 모델 대중화", "고품질 분석 가능"],
                ["예방적 건강관리", "치료→예방 패러다임 전환", "조기 선별 수요"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "6.4 정부 정책 정합성 (2026)", heading: HeadingLevel.HEADING_2 }),
            
            createHighlightBox(
              "2026 정부 청소년 위기대응 정책과의 연계",
              "• 온라인 성착취 모니터링: 10개 → 125개 확대\n• SNS 기반 위기 분석 시스템 구축\n• 상담 연계 원스톱 서비스 체계\n→ AI HighlightPRO의 AI 분석 + 전문가 연결 시스템이 정부 솔루션으로 채택 가능"
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 7. 비즈니스 모델 ==========
            new Paragraph({ text: "7. 비즈니스 모델", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "7.1 수익 모델 구조", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["수익원", "내용", "단가", "목표 비중"],
              [
                ["B2C 구독", "개인 프리미엄 패스", "월 9,900~29,900원", "40%"],
                ["B2C 캐시", "심층검사 개별 결제", "건당 500~3,000원", "15%"],
                ["B2B 기관", "유치원/학교/기업 연간", "월 99,000~399,000원", "30%"],
                ["전문가 수수료", "상담 예약 중개", "10~15%", "10%"],
                ["B2G 사업", "정부 용역/공급", "프로젝트당 협의", "5%"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "7.2 고객 획득 비용 (CAC) 분석", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["채널", "예상 CAC", "LTV", "LTV/CAC"],
              [
                ["검색 광고", "5,000원", "100,000원", "20x"],
                ["SNS 광고", "8,000원", "100,000원", "12.5x"],
                ["콘텐츠 마케팅", "2,000원", "100,000원", "50x"],
                ["B2B 영업", "50,000원", "1,000,000원", "20x"],
                ["추천/바이럴", "500원", "100,000원", "200x"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "7.3 단위 경제학 (Unit Economics)", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["지표", "현재", "목표 (1년 후)", "목표 (3년 후)"],
              [
                ["ARPU (월)", "9,900원", "15,000원", "25,000원"],
                ["Churn Rate", "측정 중", "5%", "3%"],
                ["LTV", "100,000원", "300,000원", "500,000원"],
                ["CAC", "5,000원", "10,000원", "15,000원"],
                ["LTV/CAC", "20x", "30x", "33x"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 8. 경쟁력 분석 ==========
            new Paragraph({ text: "8. 경쟁력 분석", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "8.1 경쟁사 비교", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["항목", "AI HighlightPRO", "마보", "마인드카페", "트로스트"],
              [
                ["핵심 서비스", "AI 검사+분석", "명상 콘텐츠", "익명 상담", "AI 챗봇"],
                ["검사도구", "20종 자체개발", "없음", "일부", "없음"],
                ["AI 분석", "GPT-4 심층분석", "없음", "없음", "단순 챗봇"],
                ["전문가 연결", "50+명 네트워크", "없음", "익명 상담사", "없음"],
                ["B2B 서비스", "기관 대시보드", "기업 복지", "없음", "없음"],
                ["가격", "무료~29,900원", "월 9,900원", "분당 과금", "무료"],
                ["차별점", "통합 플랫폼", "콘텐츠 특화", "익명성", "접근성"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "8.2 경쟁 우위 (MOAT)", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["우위 요소", "내용", "모방 난이도", "지속 기간"],
              [
                ["자체 검사도구", "20종 자체개발, 저작권 보유", "★★★★★", "영구"],
                ["AI 분석 엔진", "임상심리사급 분석 품질", "★★★★☆", "2~3년"],
                ["누적 데이터", "검사 결과 + 관찰일지 데이터", "★★★★☆", "누적 확대"],
                ["전문가 네트워크", "50+ 심리상담사 연계", "★★★☆☆", "1~2년"],
                ["B2B 레퍼런스", "기관 도입 사례", "★★★☆☆", "누적 확대"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "8.3 SWOT 분석", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["", "긍정적", "부정적"],
              [
                ["내부", "S: 자체 검사도구, AI 기술력, 빠른 개발", "W: 인지도 부족, 소규모 팀"],
                ["외부", "O: 정신건강 시장 성장, 정부 정책", "T: 대기업 진입, 규제 강화"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 9. 마케팅 전략 ==========
            new Paragraph({ text: "9. 마케팅 전략", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "9.1 단계별 마케팅 전략", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["단계", "기간", "목표", "핵심 활동", "KPI"],
              [
                ["인지", "1~3개월", "브랜드 알리기", "검색광고, 콘텐츠, PR", "방문자 1만"],
                ["전환", "4~6개월", "가입자 확보", "무료체험, 소셜로그인", "가입자 1천"],
                ["유지", "7~12개월", "구독 전환", "리텐션 캠페인, 할인", "구독자 500"],
                ["확장", "13개월~", "B2B 확대", "영업, 파트너십", "기관 50개"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "9.2 채널별 전략", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["채널", "비중", "전략", "예상 CPA"],
              [
                ["네이버 검색광고", "30%", "발달검사, 심리검사 키워드", "5,000원"],
                ["유튜브 콘텐츠", "25%", "육아/심리 교육 채널 운영", "2,000원"],
                ["인스타그램", "20%", "카드뉴스, 리얼 후기", "8,000원"],
                ["네이버 블로그/카페", "15%", "육아 커뮤니티 침투", "3,000원"],
                ["제휴 마케팅", "10%", "유치원/학교 협력", "1,000원"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "9.3 콘텐츠 마케팅 계획", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["유형", "주제 예시", "빈도", "채널"],
              [
                ["교육 콘텐츠", "발달 체크리스트, 심리 상식", "주 3회", "블로그, 유튜브"],
                ["사례 콘텐츠", "조기 발견 성공 스토리", "주 1회", "인스타, 블로그"],
                ["전문가 칼럼", "심리전문가 인터뷰, 기고", "월 2회", "블로그, 뉴스레터"],
                ["이벤트", "무료 검사 캠페인", "월 1회", "전 채널"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 10. 팀 구성 ==========
            new Paragraph({ text: "10. 팀 구성", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "10.1 현재 팀 구성", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["역할", "이름", "주요 경력", "담당 업무"],
              [
                ["대표/기획", formData.founderName || "OOO", formData.founderBackground || "서비스 기획 및 사업개발 경험", "전략, 사업개발, 투자유치"],
                ["개발", "AI 기반 개발", "React, Supabase, AI 통합", "플랫폼 개발, AI 엔진"],
                ["콘텐츠", "심리전문가 네트워크", "검사 개발, 콘텐츠 검수", "검사도구, 콘텐츠 품질관리"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "10.2 채용 계획", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["직무", "인원", "시기", "우선순위"],
              [
                ["마케팅 매니저", "1명", "2026 Q1", "★★★★★"],
                ["풀스택 개발자", "1명", "2026 Q2", "★★★★☆"],
                ["심리상담사 (콘텐츠)", "1명", "2026 Q2", "★★★★☆"],
                ["B2B 영업", "1명", "2026 Q3", "★★★☆☆"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "10.3 자문단", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["분야", "역할", "기대 효과"],
              [
                ["임상심리", "검사 타당성 자문", "학술적 신뢰성 확보"],
                ["소아정신과", "발달 콘텐츠 감수", "의학적 정확성"],
                ["법률", "개인정보, 의료기기법", "컴플라이언스"],
                ["투자", "IR, 재무 자문", "투자 유치 지원"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 11. 사업 추진 일정 ==========
            new Paragraph({ text: "11. 사업 추진 일정", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "11.1 연간 로드맵 (2026)", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["분기", "마일스톤", "세부 과제", "성과 지표"],
              [
                ["Q1", "PMF 확보", "가입 전환 최적화, 게스트 모드", "가입자 1,000명"],
                ["Q1", "B2B 파일럿", "유치원 3개소 시범 도입", "기관 3개"],
                ["Q2", "구독 모델 고도화", "프리미엄 기능 확장, 결제 최적화", "구독자 300명"],
                ["Q2", "앱 스토어 출시", "iOS/Android 앱 배포", "앱 다운로드 1,000"],
                ["Q3", "B2B 확장", "학교/기업 영업 본격화", "기관 20개"],
                ["Q3", "특허 출원", "AI 분석 방법 특허 출원", "특허 1건"],
                ["Q4", "시리즈 A 준비", "IR 자료 완성, 투자자 미팅", "투자 유치"],
                ["Q4", "글로벌 준비", "영문 버전 기획", "글로벌 진출 로드맵"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "11.2 3개년 로드맵", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["연도", "테마", "핵심 목표", "매출 목표"],
              [
                ["2026", "PMF & 기반 구축", "MAU 1만, B2B 50개, 특허 출원", "3억원"],
                ["2027", "성장 가속화", "MAU 5만, B2B 200개, Series A", "15억원"],
                ["2028", "시장 지배력 확보", "MAU 20만, B2G 진입, 글로벌", "50억원"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "11.3 예비창업패키지 기간 내 추진 일정 (6개월)", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["월", "핵심 활동", "산출물", "예산 집행"],
              [
                ["1개월", "팀 구성, 마케팅 계획 수립", "채용 완료, 마케팅 전략서", "10%"],
                ["2개월", "마케팅 캠페인 시작, B2B 컨택", "광고 집행, 리드 100개", "20%"],
                ["3개월", "B2B 파일럿 진행, 앱 개발", "기관 3개 계약, 앱 베타", "25%"],
                ["4개월", "피드백 반영, 기능 고도화", "Ver 2.0 출시", "20%"],
                ["5개월", "앱 스토어 출시, 확산", "앱 출시, 리뷰 확보", "15%"],
                ["6개월", "성과 정리, 후속 투자 준비", "IR 자료, 투자자 미팅", "10%"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 12. 재무 계획 ==========
            new Paragraph({ text: "12. 재무 계획", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "12.1 3개년 손익 계획", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["항목", "2026년", "2027년", "2028년"],
              [
                ["매출", "3억원", "15억원", "50억원"],
                ["- B2C 구독", "1억원", "5억원", "15억원"],
                ["- B2B 기관", "1.5억원", "8억원", "25억원"],
                ["- 기타", "0.5억원", "2억원", "10억원"],
                ["매출원가", "0.5억원", "2억원", "5억원"],
                ["매출총이익", "2.5억원", "13억원", "45억원"],
                ["판관비", "4억원", "10억원", "25억원"],
                ["영업이익", "-1.5억원", "3억원", "20억원"],
                ["영업이익률", "-50%", "20%", "40%"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "12.2 예비창업패키지 자금 사용 계획", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["항목", "금액", "비중", "세부 내역"],
              [
                ["인건비", "20,000,000원", "40%", "마케팅 매니저 채용 (6개월)"],
                ["마케팅비", "15,000,000원", "30%", "검색광고, SNS, 콘텐츠 제작"],
                ["서버/인프라", "5,000,000원", "10%", "클라우드, API, 보안"],
                ["지식재산권", "5,000,000원", "10%", "특허, 상표 출원"],
                ["운영비", "5,000,000원", "10%", "사무실, 출장, 기타"],
                ["합계", "50,000,000원", "100%", ""]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "12.3 투자 유치 계획", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["라운드", "시기", "목표 금액", "용도", "Valuation"],
              [
                ["예비창업패키지", "2026 상반기", "5천만원", "PMF, B2B 파일럿", "-"],
                ["Seed", "2026 하반기", "3~5억원", "팀 확충, 마케팅 확대", "30~50억원"],
                ["Series A", "2027", "10~20억원", "B2B 확장, 글로벌 준비", "100~150억원"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 13. 리스크 관리 ==========
            new Paragraph({ text: "13. 리스크 관리", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "13.1 리스크 매트릭스", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["리스크", "발생 확률", "영향도", "대응 전략", "담당"],
              [
                ["의료기기법 규제", "중", "고", "비의료기기 포지셔닝, 법률 자문", "대표"],
                ["개인정보 유출", "저", "극고", "보안 강화, ISMS-P 인증", "개발"],
                ["AI 오류/편향", "중", "고", "전문가 검수 프로세스, 면책 조항", "콘텐츠"],
                ["경쟁사 진입", "고", "중", "빠른 실행, 특허 확보", "대표"],
                ["채용 실패", "중", "중", "다양한 채널, 외주 백업", "대표"],
                ["자금 부족", "중", "고", "조기 투자 유치, 비용 관리", "대표"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "13.2 의료기기법 리스크 상세", heading: HeadingLevel.HEADING_2 }),

            createHighlightBox(
              "의료기기 규제 대응 전략",
              "• 현재 상태: 법률 검토 결과 '비의료기기'로 분류 (진단/치료 목적 아님)\n• 포지셔닝: '심리 웰니스 서비스', '자가체크', '정보 제공' 용어 사용\n• 면책 조항: '의학적 진단이 아닌 참고용 정보' 명시\n• 모니터링: 규제 변화 지속 감시, 법률 자문단 운영"
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 14. 투자 요청 ==========
            new Paragraph({ text: "14. 투자 요청 및 활용 계획", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "14.1 신청 금액 및 활용", heading: HeadingLevel.HEADING_2 }),

            new Paragraph({
              children: [new TextRun({ text: `신청 금액: ${formData.targetAmount}원`, bold: true, size: 28 })],
              spacing: { after: 200 }
            }),

            createTable(
              ["항목", "금액", "세부 활용 계획"],
              [
                ["인건비 (40%)", "20,000,000원", "마케팅 매니저 1명 (월 300만원 x 6개월 + 4대보험)"],
                ["마케팅비 (30%)", "15,000,000원", "네이버 검색광고 500만, SNS 광고 500만, 콘텐츠 제작 500만"],
                ["서버/인프라 (10%)", "5,000,000원", "Supabase Pro, OpenAI API, 보안 인증"],
                ["지식재산권 (10%)", "5,000,000원", "특허 1건 출원, 상표 2건 출원"],
                ["운영비 (10%)", "5,000,000원", "코워킹스페이스, B2B 미팅 출장비"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "14.2 투자 활용 시 기대 성과", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["KPI", "현재", "6개월 후 목표", "성장률"],
              [
                ["월간 방문자", "1,500명", "10,000명", "+567%"],
                ["가입자 수", "99명", "1,000명", "+910%"],
                ["구독자 수", "0명", "300명", "신규"],
                ["B2B 기관", "0개", "10개", "신규"],
                ["월 매출", "0원", "5,000,000원", "신규"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 15. 기대 효과 ==========
            new Paragraph({ text: "15. 기대 효과", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "15.1 경제적 기대 효과", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["항목", "1년 후", "3년 후", "5년 후"],
              [
                ["직접 고용", "3명", "15명", "50명"],
                ["간접 고용 (전문가 네트워크)", "50명", "200명", "500명"],
                ["매출", "3억원", "50억원", "200억원"],
                ["기업가치", "50억원", "300억원", "1,000억원"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "15.2 사회적 기대 효과", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["영역", "기대 효과", "측정 지표"],
              [
                ["발달 조기발견", "골든타임 내 발견율 향상", "조기발견 사례 수"],
                ["정신건강 접근성", "비용/지역 장벽 해소", "서비스 이용자 수"],
                ["예방적 건강관리", "문제 예방 및 조기 개입", "재검사/추적 비율"],
                ["전문가 일자리", "심리상담사 플랫폼 수입", "연계 상담 건수"],
                ["정부 정책 지원", "청소년 위기대응 체계 보완", "B2G 계약 규모"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 200 } }),

            new Paragraph({ text: "15.3 Exit 시나리오", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["시나리오", "시기", "예상 가치", "가능 인수자"],
              [
                ["IPO", "2028~2030", "1,000억원+", "코스닥 상장"],
                ["M&A", "2027~2028", "300~500억원", "대형 헬스케어, 에듀테크"],
                ["전략적 투자", "2026~2027", "100~200억원", "보험사, 병원 그룹"]
              ]
            ),

            new Paragraph({ text: "", pageBreakBefore: true }),

            // ========== 16. 첨부 자료 ==========
            new Paragraph({ text: "16. 첨부 자료", heading: HeadingLevel.HEADING_1 }),

            new Paragraph({ text: "16.1 첨부 목록", heading: HeadingLevel.HEADING_2 }),

            createTable(
              ["번호", "자료명", "설명"],
              [
                ["1", "서비스 화면 캡처", "주요 화면 스크린샷"],
                ["2", "검사도구 목록", "20종 검사 상세 사양"],
                ["3", "AI 분석 리포트 샘플", "실제 분석 결과 예시"],
                ["4", "대표자 이력서", "학력 및 경력 사항"],
                ["5", "사업자등록증", "법인 등록 서류"],
                ["6", "재무제표", "최근 재무 현황"],
                ["7", "특허 출원 예정 명세서", "AI 분석 방법 기술 설명"],
                ["8", "고객 후기/추천서", "베타 사용자 피드백"]
              ]
            ),

            new Paragraph({ text: "", spacing: { after: 400 } }),

            // 마무리
            new Paragraph({
              children: [new TextRun({ text: "감사합니다.", size: 32, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: formData.companyName, size: 28 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `대표 ${formData.founderName || "OOO"}`, size: 24 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: formData.email ? `이메일: ${formData.email}` : "", size: 22 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 50 }
            }),
            new Paragraph({
              children: [new TextRun({ text: formData.phone ? `연락처: ${formData.phone}` : "", size: 22 })],
              alignment: AlignmentType.CENTER
            }),
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${formData.companyName}_예비창업패키지_사업계획서.docx`);
      toast.success('사업계획서가 다운로드되었습니다!');
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('문서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          홈으로
        </Button>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI 기반 자동 생성</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            예비창업패키지 사업계획서
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            표, 그래프, 통계가 포함된 전문적인 사업계획서를 Word 파일로 다운로드하세요.
            16개 섹션, 30개 이상의 표가 포함된 완성도 높은 문서입니다.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              기본 정보 입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> 회사명
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="AI HighlightPRO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="founderName" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> 대표자명
                </Label>
                <Input
                  id="founderName"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleInputChange}
                  placeholder="홍길동"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="founderBackground" className="flex items-center gap-2">
                <Award className="w-4 h-4" /> 대표자 경력/배경
              </Label>
              <Textarea
                id="founderBackground"
                name="founderBackground"
                value={formData.founderBackground}
                onChange={handleInputChange}
                placeholder="예: OO대학교 심리학과 졸업, OO기업 서비스기획 5년"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemName" className="flex items-center gap-2">
                <Target className="w-4 h-4" /> 사업 아이템명
              </Label>
              <Input
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="AI 기반 심리분석 통합 플랫폼"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemDescription" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> 사업 아이템 설명
              </Label>
              <Textarea
                id="itemDescription"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleInputChange}
                placeholder="사업 아이템에 대한 간략한 설명"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> 신청 금액 (원)
                </Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  placeholder="50,000,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="010-1234-5678"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              문서 구성 미리보기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                { icon: Rocket, title: "1. Executive Summary", desc: "핵심 가치, 성과 지표, 투자 하이라이트" },
                { icon: Target, title: "2. 문제 정의 및 솔루션", desc: "시장 문제, 통계, 해결 방안" },
                { icon: Brain, title: "3. 제품/서비스 상세", desc: "서비스 구조, 사용자 여정, 화면 구성" },
                { icon: Sparkles, title: "4. 플랫폼 핵심 기능", desc: "20종 검사도구, AI 엔진, 차별화 기능" },
                { icon: Shield, title: "5. 기술 및 지식재산권", desc: "기술 스택, 특허, 보안" },
                { icon: TrendingUp, title: "6. 시장 분석", desc: "TAM-SAM-SOM, 세그먼트, 트렌드" },
                { icon: Wallet, title: "7. 비즈니스 모델", desc: "수익 구조, CAC, 단위 경제학" },
                { icon: Award, title: "8. 경쟁력 분석", desc: "경쟁사 비교, MOAT, SWOT" },
                { icon: Globe, title: "9. 마케팅 전략", desc: "단계별 전략, 채널, 콘텐츠" },
                { icon: Users, title: "10. 팀 구성", desc: "현재 팀, 채용 계획, 자문단" },
                { icon: Calendar, title: "11. 사업 추진 일정", desc: "연간/3개년 로드맵" },
                { icon: PieChart, title: "12. 재무 계획", desc: "3개년 손익, 자금 사용 계획" },
                { icon: Shield, title: "13. 리스크 관리", desc: "리스크 매트릭스, 규제 대응" },
                { icon: Wallet, title: "14. 투자 요청", desc: "신청 금액, 활용 계획" },
                { icon: Heart, title: "15. 기대 효과", desc: "경제적/사회적 효과, Exit" },
                { icon: FileText, title: "16. 첨부 자료", desc: "화면 캡처, 이력서 등" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <item.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">16</div>
                <div className="text-sm text-muted-foreground">섹션</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">30+</div>
                <div className="text-sm text-muted-foreground">표 & 테이블</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">20+</div>
                <div className="text-sm text-muted-foreground">페이지</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">맞춤화</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Button */}
        <Button
          onClick={generateDocument}
          disabled={isGenerating}
          className="w-full h-14 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              문서 생성 중...
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5 mr-2" />
              Word 파일로 다운로드 (.docx)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BusinessPlanGenerator;
