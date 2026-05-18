import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import SEOHead from "@/components/common/SEOHead";
import { LegalVersionBadge } from "@/components/legal/LegalVersionBadge";
import { LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CrisisPolicy = () => {
  const navigate = useNavigate();
  return (
    <>
      <SEOHead
        title="위기 대응 안내 - AIHPRO"
        description="자해/자살/긴급 위기 상황 시 AIHPRO가 어떻게 대응하며 어떤 도움을 받을 수 있는지 안내합니다."
        noIndex
      />
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-6 py-12 max-w-3xl pb-32">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <LifeBuoy className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">위기 대응 안내</CardTitle>
              </div>
              <LegalVersionBadge doc="crisis" />
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none break-keep">
              <p className="lead text-base">
                AIHPRO는 발달 코칭 및 의사결정 보조 도구이며 응급의료 서비스를
                제공하지 않습니다. 본 페이지는 위기 신호가 감지되거나 사용자가
                심각한 어려움을 호소할 때 서비스가 취하는 조치를 안내합니다.
              </p>

              <h2>1. 즉시 도움이 필요할 때</h2>
              <p>
                자해·자살·타인 위해의 즉각적 위험이 있다면, 본 서비스 대신 즉시
                자격을 갖춘 전문가의 도움을 받아야 합니다. AIHPRO 내에서는
                <strong> ‘긴급 전문가 매칭’ </strong>으로 우선 안내합니다.
              </p>
              <Button
                className="not-prose mt-2"
                onClick={() => navigate("/expert-hiring?urgent=true")}
              >
                긴급 전문가 매칭으로 이동
              </Button>

              <h2>2. 위기 신호 감지 시 서비스 동작</h2>
              <ul>
                <li>
                  자기보고 응답·일기·음성에서 위기 키워드가 감지되면 결과 화면을
                  잠시 중단하고 안전 안내 화면을 우선 노출합니다.
                </li>
                <li>
                  미성년자(만 14세 미만)는 보호자 동의/안내 절차가 동시에
                  진행됩니다.
                </li>
                <li>
                  결과/AI 분석은 진단이 아니며 임상적 판단이 필요한 경우 반드시
                  의료기관·자격을 갖춘 전문가를 통해야 합니다.
                </li>
              </ul>

              <h2>3. 한계</h2>
              <ul>
                <li>AIHPRO는 24/7 응급 대응을 제공하지 않습니다.</li>
                <li>실시간 자동 신고/구조 시스템과 연결되어 있지 않습니다.</li>
                <li>
                  내부 위기 감지는 보조적이며 누락/오탐 가능성이 있습니다.
                  사용자가 위기를 느낀다면 본 서비스에 의존하지 말고 즉시
                  자격을 갖춘 전문가에게 연락하시기 바랍니다.
                </li>
              </ul>

              <h2>4. 데이터 처리</h2>
              <p>
                위기 신호 감지 로그는 서비스 품질 개선과 안전 정책 보완 목적에
                한해 익명화되어 분석될 수 있으며, 보호자/관리자 통지에 필요한
                범위 내에서만 처리됩니다. 자세한 사항은
                <a href="/legal/privacy"> 개인정보처리방침</a>을 참고하세요.
              </p>

              <h2>5. 책임 한계</h2>
              <p>
                본 안내는 의료·법적 자문이 아니며, 위기 상황에서 발생할 수 있는
                결과에 대해 AIHPRO는 가능한 범위에서 안내·연계 역할만을
                수행합니다. 최종 판단과 행동의 책임은 사용자 및 보호자에게
                있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CrisisPolicy;
