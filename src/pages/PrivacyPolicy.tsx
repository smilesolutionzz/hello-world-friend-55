import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Trash2 } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      <SEOHead 
        title="개인정보처리방침 - AIHumanPro"
        description="AIHumanPro 개인정보처리방침을 확인하세요"
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">개인정보처리방침</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">최종 수정일: 2025년 1월 4일</p>
            </CardHeader>
            
            <CardContent>
              {/* 핵심 요약 */}
              <div className="grid md:grid-cols-3 gap-4 mb-8 p-6 bg-primary/5 rounded-lg">
                <div className="text-center space-y-2">
                  <Lock className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-semibold">안전한 보관</h3>
                  <p className="text-xs text-muted-foreground">암호화하여 안전하게 보관</p>
                </div>
                <div className="text-center space-y-2">
                  <Eye className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-semibold">투명한 사용</h3>
                  <p className="text-xs text-muted-foreground">명시된 목적으로만 사용</p>
                </div>
                <div className="text-center space-y-2">
                  <Trash2 className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-semibold">언제든 삭제</h3>
                  <p className="text-xs text-muted-foreground">요청 시 즉시 삭제</p>
                </div>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. 개인정보의 수집 및 이용 목적</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>AIHumanPro(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공, 본인확인, 부정 이용 방지</li>
                        <li><strong>서비스 제공:</strong> AI 심리검사, 관찰일지 분석, 전문가 매칭 및 상담</li>
                        <li><strong>결제 및 정산:</strong> 유료 서비스 이용에 따른 요금 결제 및 환불 처리</li>
                        <li><strong>마케팅 및 광고:</strong> 신규 서비스 개발, 이벤트 정보 제공 (동의 시에만)</li>
                        <li><strong>서비스 개선:</strong> 통계 분석, 서비스 품질 향상</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. 수집하는 개인정보 항목</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 다음의 개인정보 항목을 수집합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>필수 정보:</strong> 이름, 이메일 주소, 비밀번호, 연락처</li>
                        <li><strong>선택 정보:</strong> 주소, 성별, 생년월일</li>
                        <li><strong>자동 수집 정보:</strong> IP 주소, 쿠키, 서비스 이용 기록, 기기 정보</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. 개인정보의 보유 및 이용 기간</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 명시된 기간 동안 보존합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>보존 항목:</strong> 결제 기록, 서비스 이용 기록</li>
                        <li><strong>보존 근거:</strong> 전자상거래 등에서의 소비자보호에 관한 법률</li>
                        <li><strong>보존 기간:</strong> 5년</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">4. 개인정보의 제3자 제공</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>이용자가 사전에 동의한 경우</li>
                        <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. 개인정보의 파기 절차 및 방법</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 개인정보 파기의 절차 및 방법은 다음과 같습니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>파기 절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 따라 일정 기간 저장된 후 파기됩니다.</li>
                        <li><strong>파기 방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. 이용자 및 법정대리인의 권리</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이용자 및 법정 대리인은 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 가입 해지를 요청할 수도 있습니다.</p>
                      <p>개인정보 조회, 수정 또는 해지를 위해서는 개인정보관리책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. 개인정보 자동 수집 장치의 설치, 운영 및 거부에 관한 사항</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 이용자에게 개인 맞춤 서비스를 제공하기 위해 쿠키(cookie)를 사용할 수 있습니다. 쿠키는 웹사이트가 이용자의 컴퓨터 브라우저에 보내는 소량의 텍스트 파일이며, 이용자의 컴퓨터 하드디스크에 저장됩니다.</p>
                      <p>이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">8. 개인정보 보호책임자</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>개인정보 보호책임자:</strong> 이수석</li>
                        <li><strong>연락처:</strong> privacy@aihpro.app, 1234-5678</li>
                      </ul>
                      <p>이용자는 회사의 서비스를 이용하면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의할 수 있습니다. 회사는 이용자의 문의에 대해 지체 없이 답변 및 처리할 것입니다.</p>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3">9. 개인정보처리방침의 변경</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이 개인정보처리방침은 2025년 1월 4일부터 적용됩니다.</p>
                      <p>개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전에 홈페이지를 통해 고지할 것입니다.</p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>개인정보 관련 문의사항이 있으시면 개인정보 보호책임자에게 연락주세요.</p>
            <p className="mt-2">이메일: privacy@aihpro.com | 전화: 1234-5678</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

