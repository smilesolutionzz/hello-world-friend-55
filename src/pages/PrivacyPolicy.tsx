import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              개인정보처리방침
            </CardTitle>
            <p className="text-center text-muted-foreground">
              최종 업데이트: 2025년 10월 중 공개
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-4">제1조 (개인정보의 처리목적)</h2>
              <p>
                하이라이트 AI (이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
                이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <div className="mt-4 space-y-2">
                <p>1. 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</p>
                <p>2. 서비스 제공 및 계약의 이행</p>
                <p>3. 회원관리, 서비스 이용에 따른 본인확인, 개인 식별</p>
                <p>4. 고충처리 목적으로 개인정보 주체의 신원 확인</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">▶ 필수항목</h3>
                  <div className="space-y-1">
                    <p>• 이메일 주소: 회원 탈퇴 시까지</p>
                    <p>• 심리검사 응답 데이터: 회원 탈퇴 후 1년</p>
                    <p>• 서비스 이용 기록: 3년</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">▶ 선택항목</h3>
                  <div className="space-y-1">
                    <p>• 프로필 정보(이름, 생년월일 등): 회원 탈퇴 시까지</p>
                    <p>• 관찰일지 데이터: 회원 탈퇴 시까지</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제3조 (개인정보의 제3자 제공)</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-800 mb-2">원칙적 제3자 제공 금지</p>
                <p className="text-blue-700">
                  회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 
                  다만, 아래의 경우에는 예외로 합니다:
                </p>
                <div className="mt-2 space-y-1 text-blue-700">
                  <p>1. 이용자가 사전에 동의한 경우</p>
                  <p>2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제4조 (개인정보처리 위탁)</h2>
              <p>현재 회사는 개인정보 처리업무를 외부에 위탁하고 있지 않습니다. 향후 위탁하는 경우 사전에 고지하겠습니다.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제5조 (정보주체의 권리·의무 및 행사방법)</h2>
              <div className="space-y-2">
                <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
                <div className="ml-4 space-y-1">
                  <p>1. 개인정보 처리현황 통지요구</p>
                  <p>2. 오류 등이 있을 경우 정정·삭제 요구</p>
                  <p>3. 처리정지 요구</p>
                </div>
                <p className="mt-4">
                  위 권리 행사는 회사에 대해 서면, 전화, 전자우편을 통하여 하실 수 있으며 
                  회사는 이에 대해 지체없이 조치하겠습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제6조 (개인정보의 안전성 확보조치)</h2>
              <div className="space-y-2">
                <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
                <div className="ml-4 space-y-1">
                  <p>1. 개인정보 취급 직원의 최소화 및 교육</p>
                  <p>2. 개인정보에 대한 접근 제한</p>
                  <p>3. 접속기록의 보관 및 위변조 방지</p>
                  <p>4. 개인정보의 암호화</p>
                  <p>5. 보안프로그램 설치 및 갱신</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제7조 (개인정보보호책임자)</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-semibold mb-2">개인정보보호책임자</p>
                <div className="space-y-1">
                  <p>• 성명: 개인정보보호책임자</p>
                  <p>• 연락처: privacy@highlight-ai.com</p>
                  <p>• 처리시간: 평일 09:00~18:00</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">제8조 (개인정보처리방침 변경)</h2>
              <p>
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">부칙</h2>
              <p>이 개인정보처리방침은 2025년 10월 중 공개부터 적용됩니다.</p>
            </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;