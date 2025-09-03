import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </div>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">이용약관</h1>
          
          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
              <p>
                이 약관은 하이라이트 AI (이하 "회사")가 제공하는 심리 상담 및 분석 서비스(이하 "서비스")의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제2조 (정의)</h2>
              <div className="space-y-2">
                <p>1. "서비스"란 회사가 제공하는 AI 기반 심리 분석, 상담 연결, 관찰일지 등의 서비스를 말합니다.</p>
                <p>2. "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
                <p>3. "회원"란 회사와 서비스 이용계약을 체결하고 이용자 아이디를 부여받은 자를 말합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제3조 (서비스의 성격)</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-yellow-800 mb-2">⚠️ 중요 고지사항</p>
                <div className="space-y-2 text-yellow-700">
                  <p>1. 본 서비스는 참고용 자가체크 및 심리상담 연결 서비스입니다.</p>
                  <p>2. 의학적 진단이나 치료행위는 포함되지 않습니다.</p>
                  <p>3. 정확한 진단과 치료는 반드시 의료기관에서 받으시기 바랍니다.</p>
                  <p>4. 응급상황 시에는 즉시 119 또는 전문 상담기관(1577-0199)에 연락하시기 바랍니다.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제4조 (서비스 이용)</h2>
              <div className="space-y-2">
                <p>1. 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.</p>
                <p>2. 회사는 시스템 점검, 보수 또는 교체 등의 경우 서비스 제공을 일시 중단할 수 있습니다.</p>
                <p>3. 무료 서비스의 경우 이용 횟수나 기능에 제한이 있을 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제5조 (회원가입)</h2>
              <div className="space-y-2">
                <p>1. 회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
                <p>2. 회원가입신청자가 관계법령에 위배되거나 그 밖에 회사가 정하는 승낙요건에 미비된 경우 회사는 승낙을 하지 않을 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제6조 (개인정보보호)</h2>
              <p>
                회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 
                개인정보의 보호 및 사용에 대해서는 관련법령 및 회사의 개인정보처리방침이 적용됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제7조 (이용료 및 결제)</h2>
              <div className="space-y-2">
                <p>1. 서비스 이용료는 회사가 정한 요금표에 따릅니다.</p>
                <p>2. 결제는 신용카드, 계좌이체, 기타 회사가 정한 방법으로 할 수 있습니다.</p>
                <p>3. 환불정책은 관련법령 및 회사 정책에 따릅니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제8조 (면책조항)</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="space-y-2 text-red-700">
                  <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                  <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                  <p>3. 회사는 서비스를 통해 제공되는 정보의 정확성, 완전성을 보장하지 않습니다.</p>
                  <p>4. 본 서비스는 의료행위가 아니며, 의학적 진단이나 치료를 대체할 수 없습니다.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제9조 (분쟁해결)</h2>
              <p>
                서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">부칙</h2>
              <p>이 약관은 2024년 1월 1일부터 적용됩니다.</p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;