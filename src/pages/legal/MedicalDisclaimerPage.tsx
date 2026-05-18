import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import SEOHead from "@/components/common/SEOHead";
import { LegalVersionBadge } from "@/components/legal/LegalVersionBadge";
import { ShieldAlert } from "lucide-react";

const MedicalDisclaimerPage = () => {
  return (
    <>
      <SEOHead
        title="의료 비면책 고지 - AIHPRO"
        description="AIHPRO는 의료 진단·치료·예방을 목적으로 하지 않는 발달 코칭 및 의사결정 보조 도구입니다."
        noIndex
      />
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-6 py-12 max-w-3xl pb-32">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">
                  의료 비면책 고지
                </CardTitle>
              </div>
              <LegalVersionBadge doc="medical-disclaimer" />
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none break-keep">
              <h2>1. 서비스 성격</h2>
              <p>
                AIHPRO(이하 “서비스”)는 <strong>발달 코칭 및 의사결정 보조
                도구</strong>입니다. 의료 진단·치료·예방을 목적으로 하지
                않으며, 의료법상 의료기기·의료행위에 해당하지 않습니다.
              </p>

              <h2>2. 결과·분석의 의미</h2>
              <ul>
                <li>
                  서비스가 제공하는 모든 점수·해석·리포트는{" "}
                  <strong>참고용 인사이트</strong>이며, 의학적 진단을 대체하지
                  않습니다.
                </li>
                <li>
                  AIHPRO는 임상 환경에서 검증된 진단 기준(DSM/ICD 등)을 직접
                  적용하지 않으며, 자체 분석 모델을 통한 코칭/관찰 보조 정보를
                  제공합니다.
                </li>
                <li>
                  AI/통계 분석은 잘못된 결론을 도출할 수 있으며, 사용자는 결과를
                  단독으로 신뢰하여 의료·법적·교육적 결정을 내려서는 안 됩니다.
                </li>
              </ul>

              <h2>3. 전문가 상담 권고</h2>
              <p>
                임상적 판단이 필요한 경우 반드시 정신건강의학과 의사, 임상심리
                전문가, 발달 전문 기관 등 <strong>자격을 갖춘 전문가</strong>와
                상담하시기 바랍니다. 본 서비스의 ‘전문가 매칭’은 자격이 확인된
                협력 전문가 연결을 보조할 뿐, 의료행위를 수행하지 않습니다.
              </p>

              <h2>4. 표시·광고 원칙</h2>
              <ul>
                <li>
                  서비스 화면/리포트/마케팅에서 의료 효능·치료 효과를 단정적으로
                  광고하지 않습니다.
                </li>
                <li>
                  과학적 인용·통계 자료가 포함되더라도 이는 일반 정보 제공
                  목적이며 개인의 의료 상태를 진단하지 않습니다.
                </li>
              </ul>

              <h2>5. 위기 상황</h2>
              <p>
                자해·자살·타인 위해의 위험이 있다면 본 서비스가 아닌 즉시
                자격을 갖춘 전문가에게 도움을 요청해야 합니다. 자세한 사항은
                <a href="/legal/crisis"> 위기 대응 안내</a>를 참고하세요.
              </p>

              <h2>6. 책임 한계</h2>
              <p>
                사용자가 본 서비스의 결과를 근거로 한 모든 행동·의사결정의
                결과에 대해 AIHPRO는 관계 법령이 허용하는 최대 범위에서 책임을
                지지 않습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MedicalDisclaimerPage;
