import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold mb-8 text-center">개인정보처리방침</h1>
          
          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. 개인정보의 처리목적</h2>
              <p>
                하이라이트 AI(이하 '회사')는 다음의 목적을 위하여 개인정보를 처리합니다. 
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <div className="mt-4 space-y-2">
                <p>• 서비스 제공 및 회원관리</p>
                <p>• AI 분석 및 맞춤형 서비스 제공</p>
                <p>• 전문가 상담 연결 서비스</p>
                <p>• 고객 지원 및 문의 응답</p>
                <p>• 서비스 개선 및 품질 향상</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. 처리하는 개인정보의 항목</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">가. 필수항목</h3>
                  <p>• 이름, 이메일 주소, 휴대폰번호</p>
                  <p>• 로그인ID, 비밀번호</p>
                  <p>• 서비스 이용 기록, 접속 로그, 쿠키</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">나. 선택항목</h3>
                  <p>• 프로필 사진</p>
                  <p>• 자가진단 결과 및 상담 내용</p>
                  <p>• 관찰일지 및 업로드 미디어</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. 개인정보의 처리 및 보유기간</h2>
              <div className="space-y-2">
                <p>• 회원 탈퇴 시까지 (단, 관련 법령에 따라 보존이 필요한 경우 해당 기간)</p>
                <p>• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</p>
                <p>• 신용정보의 수집/처리 및 이용 등에 관한 기록: 3년</p>
                <p>• 본인확인에 관한 기록: 6개월</p>
                <p>• 웹사이트 방문기록: 3개월</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-800 mb-2">원칙적으로 개인정보를 제3자에게 제공하지 않습니다.</p>
                <p className="text-blue-700">
                  다만, 다음의 경우에는 예외로 합니다:
                </p>
                <div className="mt-2 space-y-1 text-blue-700">
                  <p>• 정보주체의 동의가 있는 경우</p>
                  <p>• 법령의 규정에 의한 경우</p>
                  <p>• 전문가 상담 연결을 위해 필요최소한의 정보 제공 (사전 동의)</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. 개인정보 처리의 위탁</h2>
              <div className="space-y-2">
                <p>원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
                <div className="mt-4">
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <p className="font-medium">• 클라우드 서비스: Supabase</p>
                    <p className="text-sm text-gray-600">위탁업무: 데이터 저장 및 관리</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
              <div className="space-y-2">
                <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
                <div className="mt-4 space-y-1">
                  <p>• 개인정보 처리현황 통지 요구</p>
                  <p>• 개인정보 열람 요구</p>
                  <p>• 개인정보 정정·삭제 요구</p>
                  <p>• 개인정보 처리정지 요구</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. 개인정보의 안전성 확보조치</h2>
              <div className="space-y-2">
                <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
                <div className="mt-4 space-y-1">
                  <p>• 개인정보 암호화</p>
                  <p>• 해킹 등에 대비한 기술적 대책</p>
                  <p>• 개인정보에 대한 접근 제한</p>
                  <p>• 접속기록의 보관 및 위변조 방지</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. 개인정보보호 책임자</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  <p><strong>개인정보보호 책임자</strong></p>
                  <p>• 성명: 개인정보보호 담당자</p>
                  <p>• 연락처: privacy@highlight-ai.com</p>
                  <p>• 문의시간: 평일 09:00~18:00</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. 개인정보처리방침의 변경</h2>
              <p>
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">부칙</h2>
              <p>이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.</p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;