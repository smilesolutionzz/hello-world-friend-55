import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export default function PlatformOnePager() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate a clean HTML doc for Word download
    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
@page { size: A4; margin: 20mm 18mm; }
body { font-family: 'Malgun Gothic','Apple SD Gothic Neo',sans-serif; line-height: 1.55; color: #1a1a1a; font-size: 10.5pt; margin: 0; padding: 0; }
h1 { font-size: 16pt; margin: 0 0 2px; color: #1e3a5f; letter-spacing: -0.5px; }
.subtitle { font-size: 9pt; color: #6b7280; margin-bottom: 14px; border-bottom: 2px solid #1e3a5f; padding-bottom: 6px; }
h2 { font-size: 11pt; color: #1e3a5f; margin: 12px 0 4px; border-left: 3px solid #3b82f6; padding-left: 8px; }
p, li { font-size: 9.5pt; margin: 2px 0; }
ul { margin: 2px 0 6px 18px; padding: 0; }
li { margin-bottom: 1px; }
.grid { display: flex; gap: 16px; }
.grid > div { flex: 1; }
table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 4px 0; }
th { background: #f0f4ff; text-align: left; padding: 4px 8px; border: 1px solid #d1d5db; color: #1e3a5f; }
td { padding: 4px 8px; border: 1px solid #d1d5db; }
.highlight { background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 8px 12px; margin: 6px 0; }
.footer { font-size: 8pt; color: #9ca3af; text-align: center; margin-top: 10px; border-top: 1px solid #e5e7eb; padding-top: 4px; }
strong { color: #1e3a5f; }
.tag { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 8pt; padding: 1px 6px; border-radius: 3px; margin-right: 4px; }
</style></head><body>
${contentRef.current?.innerHTML || ''}
</body></html>`;
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AIHPRO_플랫폼_요약서.doc';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      {/* Controls - hidden in print */}
      <div className="max-w-[210mm] mx-auto mb-4 flex gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />인쇄 / PDF 저장
        </Button>
        <Button onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />Word 다운로드
        </Button>
      </div>

      {/* A4 Page */}
      <div
        ref={contentRef}
        className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none"
        style={{
          padding: '20mm 18mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          overflow: 'hidden',
          fontSize: '10.5pt',
          lineHeight: '1.55',
          color: '#1a1a1a',
          fontFamily: "'Malgun Gothic','Apple SD Gothic Neo',sans-serif"
        }}
      >
        {/* Header */}
        <h1 style={{ fontSize: '16pt', margin: '0 0 2px', color: '#1e3a5f', letterSpacing: '-0.5px' }}>
          AIHPRO — AI 기반 심리건강 SaaS 플랫폼
        </h1>
        <div style={{ fontSize: '9pt', color: '#6b7280', marginBottom: '14px', borderBottom: '2px solid #1e3a5f', paddingBottom: '6px' }}>
          AI Human Pro | aihpro.app | 2026년 3월 기준 | 대표: 이수석
        </div>

        {/* 1. Value Proposition */}
        <h2 style={{ fontSize: '11pt', color: '#1e3a5f', margin: '12px 0 4px', borderLeft: '3px solid #3b82f6', paddingLeft: '8px' }}>
          1. 핵심 가치 제안 (Value Proposition)
        </h2>
        <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '8px 12px', margin: '6px 0' }}>
          <p style={{ fontSize: '9.5pt', margin: '2px 0' }}>
            <strong>30종 이상의 표준화된 심리검사</strong>를 AI 분석 엔진과 결합하여, 
            기존 대면 심리평가 대비 <strong>비용 90% 절감·시간 95% 단축</strong>을 실현하는 
            B2C+B2B SaaS 플랫폼. 검사 → AI 분석 → 전문가 매칭까지 <strong>원스톱 심리건강 인프라</strong>를 제공합니다.
          </p>
        </div>

        {/* 2. Traction */}
        <h2 style={{ fontSize: '11pt', color: '#1e3a5f', margin: '12px 0 4px', borderLeft: '3px solid #3b82f6', paddingLeft: '8px' }}>
          2. 실적 및 트랙션 (Traction)
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', margin: '4px 0' }}>
          <thead>
            <tr>
              <th style={{ background: '#f0f4ff', textAlign: 'left', padding: '4px 8px', border: '1px solid #d1d5db', color: '#1e3a5f' }}>지표</th>
              <th style={{ background: '#f0f4ff', textAlign: 'left', padding: '4px 8px', border: '1px solid #d1d5db', color: '#1e3a5f' }}>현재</th>
              <th style={{ background: '#f0f4ff', textAlign: 'left', padding: '4px 8px', border: '1px solid #d1d5db', color: '#1e3a5f' }}>12개월 목표</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['MAU (월간활성유저)', '200명', '5,000명'],
              ['누적 심리검사 수', '452건+', '50,000건'],
              ['검사 전환율', '39.6%', '45%+'],
              ['B2B 파트너 기관', '50곳', '150곳'],
              ['유튜브 구독자', '23,000명', '50,000명'],
              ['월 매출', '초기 수익화 단계', '2,000만 원'],
            ].map(([k, v1, v2], i) => (
              <tr key={i}>
                <td style={{ padding: '3px 8px', border: '1px solid #d1d5db', fontWeight: 600 }}>{k}</td>
                <td style={{ padding: '3px 8px', border: '1px solid #d1d5db' }}>{v1}</td>
                <td style={{ padding: '3px 8px', border: '1px solid #d1d5db' }}>{v2}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 3. Tech + Product */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '11pt', color: '#1e3a5f', margin: '12px 0 4px', borderLeft: '3px solid #3b82f6', paddingLeft: '8px' }}>
              3. 기술·제품 경쟁력
            </h2>
            <ul style={{ margin: '2px 0 6px 18px', padding: 0, fontSize: '9.5pt' }}>
              <li>GPT-4/Gemini 기반 <strong>박사급 종합 리포팅</strong></li>
              <li>AI 영상관찰 분석 (행동 패턴 자동 감지)</li>
              <li>30종 표준 심리검사 엔진 (MMPI, K-CBCL 등)</li>
              <li>기관용 대시보드 + 다국어 (한/영) 지원</li>
              <li>특허 출원 준비 중 (AI 심리 선별 알고리즘)</li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '11pt', color: '#1e3a5f', margin: '12px 0 4px', borderLeft: '3px solid #3b82f6', paddingLeft: '8px' }}>
              4. 수익 모델
            </h2>
            <ul style={{ margin: '2px 0 6px 18px', padding: 0, fontSize: '9.5pt' }}>
              <li><strong>B2C 구독</strong>: 프리미엄 월 29,900원 (AI 리포트 무제한)</li>
              <li><strong>B2B SaaS</strong>: 기관당 월 15~50만 원 (규모별 차등)</li>
              <li><strong>전문가 매칭</strong>: 상담 수수료 30%</li>
              <li><strong>콘텐츠</strong>: 유튜브 광고 + 교육 과정</li>
              <li>CAC ₩800~1,800 / LTV:CAC 150:1</li>
            </ul>
          </div>
        </div>

        {/* 5. Market */}
        <h2 style={{ fontSize: '11pt', color: '#1e3a5f', margin: '12px 0 4px', borderLeft: '3px solid #3b82f6', paddingLeft: '8px' }}>
          5. 시장 기회
        </h2>
        <p style={{ fontSize: '9.5pt', margin: '2px 0' }}>
          국내 정신건강 서비스 시장 <strong>1.2조 원</strong>(연 15% 성장) · 디지털 헬스케어 시장 연 25% 성장. 
          코로나 이후 비대면 심리상담 수요 급증으로 <strong>정부 정신건강 예산 5년간 2.4배 증가</strong>. 
          아동·청소년 정서행동 검사 의무화 추진으로 B2B 기관 수요 폭발적 성장 전망.
        </p>

        {/* 6. Team & Ask */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '11pt', color: '#1e3a5f', margin: '12px 0 4px', borderLeft: '3px solid #3b82f6', paddingLeft: '8px' }}>
              6. 팀 & 핵심 역량
            </h2>
            <ul style={{ margin: '2px 0 6px 18px', padding: 0, fontSize: '9.5pt' }}>
              <li><strong>김병훈 대표</strong> — AI 풀스택 개발 + 유튜브 23K 채널 운영</li>
              <li>아동발달 전문의 10명 + 임상심리사 30명 자문단</li>
              <li>B2B 파트너 기관 50곳 네트워크 확보</li>
              <li>RTPLANAI.COM 통합 AI 솔루션 IP 보유</li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '11pt', color: '#1e3a5f', margin: '12px 0 4px', borderLeft: '3px solid #3b82f6', paddingLeft: '8px' }}>
              7. 정책자금 활용 계획
            </h2>
            <ul style={{ margin: '2px 0 6px 18px', padding: 0, fontSize: '9.5pt' }}>
              <li><strong>AI 고도화</strong>: 검사 정밀도 향상 + 특허 출원 (40%)</li>
              <li><strong>시장 확대</strong>: B2B 영업 + 기관 온보딩 (30%)</li>
              <li><strong>인력 확충</strong>: 개발·임상 전문 인력 채용 (20%)</li>
              <li><strong>인프라</strong>: 보안 인증(ISO 27001) + 서버 (10%)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '8pt', color: '#9ca3af', textAlign: 'center', marginTop: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '4px' }}>
          본 자료는 투자 및 정책자금 검토용으로 작성되었습니다. | AIHPRO (AI Human Pro) | aihpro.app | contact: 김병훈 대표
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .shadow-lg { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
