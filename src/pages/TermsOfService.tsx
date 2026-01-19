import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const TermsOfService = () => {
  return (
    <>
      <SEOHead 
        title="이용약관 - AIHumanPro"
        description="AIHumanPro 서비스 이용약관을 확인하세요"
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">서비스 이용약관</CardTitle>
              <p className="text-sm text-muted-foreground">최종 수정일: 2025년 1월 4일</p>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">제1조 (목적)</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      본 약관은 AIHumanPro(이하 "회사")가 제공하는 AI 심리 검사, 관찰일지, 전문가 상담 등의 서비스(이하 "서비스")를 
                      이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제2조 (용어의 정의)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>1. "서비스"</strong>란 회사가 제공하는 AI 심리 검사, 관찰일지, 전문가 상담 등 모든 부가 서비스를 의미합니다.</p>
                      <p><strong>2. "이용자"</strong>란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
                      <p><strong>3. "회원"</strong>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</p>
                      <p><strong>4. "토큰"</strong>이란 서비스 이용을 위한 가상의 재화로서, 현금 등의 결제수단을 통해 구매할 수 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제3조 (약관의 효력 및 변경)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</p>
                      <p>2. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 본 약관을 개정할 수 있습니다.</p>
                      <p>3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 서비스 내에 공지합니다.</p>
                      <p>4. 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제4조 (서비스의 제공 및 변경)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 다음과 같은 서비스를 제공합니다.</p>
                      <ul className="list-disc list-inside">
                        <li>AI 심리 검사 서비스</li>
                        <li>관찰일지 작성 및 분석 서비스</li>
                        <li>전문가 상담 서비스 (텍스트, 음성, 화상)</li>
                        <li>기타 회사가 추가 개발하거나 제공하는 서비스</li>
                      </ul>
                      <p>2. 회사는 서비스의 내용, 이용방법, 이용시간 등을 변경할 수 있습니다.</p>
                      <p>3. 서비스 변경 시에는 변경 사유, 변경될 서비스의 내용 및 제공일자 등을 서비스 내에 공지합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제5조 (서비스 이용 제한 및 중지)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 중지할 수 있습니다.</p>
                      <ul className="list-disc list-inside">
                        <li>이용자가 회사의 서비스 운영을 방해하는 경우</li>
                        <li>이용자가 본 약관을 위반한 경우</li>
                        <li>시스템 점검, 증설, 교체, 고장 등의 사유가 발생한 경우</li>
                        <li>전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지했을 경우</li>
                        <li>국가비상사태, 정전, 서비스 설비의 장애 또는 이용량 폭주 등으로 서비스 이용에 지장이 있는 경우</li>
                      </ul>
                      <p>2. 회사는 서비스 이용 제한 또는 중지에 따라 발생하는 이용자의 손해에 대해 책임을 지지 않습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제6조 (회원의 의무)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회원은 다음 행위를 하여서는 안 됩니다.</p>
                      <ul className="list-disc list-inside">
                        <li>회사의 명예를 훼손하거나 업무를 방해하는 행위</li>
                        <li>타인의 개인정보를 도용하는 행위</li>
                        <li>불법적인 콘텐츠를 게시, 게재, 또는 전송하는 행위</li>
                        <li>서비스의 안정적인 운영을 방해하는 행위</li>
                        <li>기타 법령 또는 본 약관에 위배되는 행위</li>
                      </ul>
                      <p>2. 회원은 자신의 계정 정보를 안전하게 관리해야 하며, 제3자에게 계정 이용을 허락해서는 안 됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제7조 (회사의 의무)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 관련 법령과 본 약관을 준수하며, 지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.</p>
                      <p>2. 회사는 회원의 개인정보를 보호하기 위해 보안 시스템을 구축하고 개인정보처리방침을 준수합니다.</p>
                      <p>3. 회사는 서비스 이용과 관련하여 회원이 제기한 의견이나 불만을 신속하게 처리하기 위해 노력합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제8조 (개인정보보호)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 이용자의 개인정보보호를 중요시하며, 개인정보처리방침에 따라 이용자의 개인정보를 수집, 이용, 관리합니다.</p>
                      <p>회사의 개인정보처리방침은 서비스 내에 게시되어 있으며, 이용자는 언제든지 확인할 수 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제9조 (책임제한)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                      <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</p>
                      <p>3. 회사는 이용자가 서비스에 게재한 정보, 자료, 사실의 신뢰도, 정확성 등에 대해서는 책임을 지지 않습니다.</p>
                      <p>4. 회사는 이용자 상호간 또는 이용자와 제3자 상호간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임도 없습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제10조 (분쟁 해결)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사와 이용자 간에 발생한 분쟁은 상호 협의하여 원만하게 해결하도록 노력합니다.</p>
                      <p>2. 협의가 이루어지지 않을 경우, 대한민국 법률에 따라 해결합니다.</p>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3">부칙</h2>
                    <p className="text-muted-foreground">본 약관은 2025년 1월 4일부터 시행됩니다.</p>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>문의사항이 있으시면 고객센터로 연락주세요.</p>
            <p className="mt-2">이메일: support@aihpro.app | 전화: 1234-5678</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
