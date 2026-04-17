import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Hash, Database, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface VerificationMeta {
  reportId: string;
  shareToken: string;
  generatedAt: string;
  modelVersion?: string;
  dataPoints?: number;
  reviewerId?: string;
  statisticalBasis?: string;
}

interface Props {
  meta: VerificationMeta;
  origin?: string;
}

/**
 * STEP 6: 리포트 신뢰성 외부 증명
 * - 공유 리포트에 검증 메타데이터 표시
 * - QR 코드로 외부에서 위변조 검증 가능
 * - 학교/병원 제출 시 신뢰성 확보
 */
export const ReportVerificationBadge = ({ meta, origin }: Props) => {
  const baseUrl = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://aihpro.app');
  const verifyUrl = `${baseUrl}/verify-report/${meta.shareToken}`;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 print:break-inside-avoid">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* QR Code */}
        <div className="bg-white p-3 rounded-lg shadow-sm border flex-shrink-0">
          <QRCodeSVG 
            value={verifyUrl} 
            size={120} 
            level="H"
            includeMargin={false}
          />
          <p className="text-[10px] text-center mt-1 text-muted-foreground font-mono">
            SCAN TO VERIFY
          </p>
        </div>

        {/* Metadata */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">검증 메타데이터 (Verification)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-start gap-2">
              <Hash className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="break-keep">
                <p className="text-muted-foreground">리포트 ID</p>
                <p className="font-mono text-foreground truncate" title={meta.reportId}>
                  {meta.reportId.slice(0, 8)}...{meta.reportId.slice(-4)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Database className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="break-keep">
                <p className="text-muted-foreground">분석 모델</p>
                <p className="font-medium text-foreground">
                  {meta.modelVersion || 'Gemini 3.1 + RCI v1.96'}
                </p>
              </div>
            </div>

            {meta.dataPoints !== undefined && (
              <div className="flex items-start gap-2">
                <Database className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="break-keep">
                  <p className="text-muted-foreground">데이터 N수</p>
                  <p className="font-medium text-foreground">{meta.dataPoints}건</p>
                </div>
              </div>
            )}

            {meta.reviewerId && (
              <div className="flex items-start gap-2">
                <UserCheck className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="break-keep">
                  <p className="text-muted-foreground">검토자</p>
                  <p className="font-mono text-foreground">{meta.reviewerId}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground break-keep leading-relaxed">
              본 리포트는 AIHPRO 발달 코칭 플랫폼이 발급한 분석 결과입니다.
              QR 코드를 스캔하면 발급 정보, 통계 모델, 데이터 무결성을 외부에서 확인할 수 있습니다.
              생성일시: {new Date(meta.generatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
