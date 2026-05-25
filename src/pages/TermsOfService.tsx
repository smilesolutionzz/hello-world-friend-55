import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import { LegalVersionBadge } from '@/components/legal/LegalVersionBadge';

const TermsOfService = () => {
  return (
    <>
      <SEOHead 
        title="이용약관 - AIHPRO"
        description="AIHPRO 서비스 이용약관을 확인하세요. AI 기반 심리·발달 분석 플랫폼."
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-6 py-12 max-w-4xl pb-32">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">서비스 이용약관</CardTitle>
              </div>
              <LegalVersionBadge doc="terms" />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">제1조 (목적)</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      본 약관은 AIHPRO(이하 "회사")가 운영하는 AI 기반 심리·발달 분석 플랫폼 "AIHPRO"(https://aihpro.app, 이하 "서비스")를 
                      이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제2조 (용어의 정의)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>1. "서비스"</strong>란 회사가 제공하는 AI 심리검사, 발달검사, 행동관찰 분석, 전문가 상담 매칭, AI 코칭 등 모든 부가 서비스를 의미합니다.</p>
                      <p><strong>2. "이용자"</strong>란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
                      <p><strong>3. "회원"</strong>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</p>
                      <p><strong>4. "구독"</strong>이란 월간 또는 연간 단위로 서비스 이용 대금을 결제하고 무제한 이용 권한을 부여받는 것을 말합니다.</p>
                      <p><strong>5. "이용권"</strong>이란 단건 결제를 통해 검사 또는 리포트를 이용할 수 있는 1회성 권한을 말합니다.</p>
                      <p><strong>6. "AI 분석"</strong>이란 전문가 지식 기반으로 AI가 생성하는 심리·발달 분석 결과를 의미하며, 의료적 진단을 대체하지 않습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제3조 (약관의 효력 및 변경)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</p>
                      <p>2. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 본 약관을 개정할 수 있습니다.</p>
                      <p>3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 서비스 내에 최소 7일 전 공지합니다.</p>
                      <p>4. 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제4조 (서비스의 제공 및 변경)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
                      <ul className="list-disc list-inside">
                        <li>AI 심리검사 및 발달검사 서비스</li>
                        <li>행동관찰 AI 분석 서비스</li>
                        <li>전문가 심층 분석 리포트 서비스</li>
                        <li>전문가 상담 매칭 및 예약 서비스</li>
                        <li>AI 코칭 및 음성 상담 서비스</li>
                        <li>커뮤니티 및 교육 콘텐츠 서비스</li>
                        <li>B2B 기관용 발달관리 서비스</li>
                      </ul>
                      <p>2. 회사는 서비스의 내용, 이용방법, 이용시간 등을 변경할 수 있으며, 변경 시 서비스 내에 공지합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제5조 (결제 및 과금)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 서비스는 다음의 과금 체계로 운영됩니다:</p>
                      <ul className="list-disc list-inside">
                        <li><strong>무료 체험검사:</strong> 비회원 포함 모든 사용자에게 우울·스트레스·ADHD 등 체험검사 무제한 무료 제공</li>
                        <li><strong>7일 마음 트랙:</strong> ₩7,900 일시불 (정가 ₩49,000, 60% 할인) — 30일간 모든 심층 검사·AI 분석 리포트·전문가 코칭 가이드 무제한, 자동 결제 없음</li>
                        <li><strong>전문가 1:1 상담:</strong> 시간 구독형 — 시간당 ₩39,000 (5/10/20/30시간 시간권, 홈티 1.5배 차감, 만료 없음)</li>
                        <li><strong>B2B 기관 솔루션:</strong> 별도 견적 (학교·발달센터·기업 대상)</li>
                      </ul>
                      <p>2. 결제는 토스페이먼츠를 통해 카드, 계좌이체, 휴대폰 결제로 가능합니다.</p>
                      <p>3. 7일 마음 트랙은 일시불 결제 상품으로 자동 갱신되지 않습니다.</p>
                      <p>4. 가격은 변경될 수 있으며, 변경 시 최소 30일 전 공지합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제6조 (서비스 이용 제한 및 중지)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 중지할 수 있습니다:</p>
                      <ul className="list-disc list-inside">
                        <li>이용자가 회사의 서비스 운영을 방해하는 경우</li>
                        <li>이용자가 본 약관을 위반한 경우</li>
                        <li>시스템 점검, 증설, 교체, 고장 등의 사유가 발생한 경우</li>
                        <li>국가비상사태, 정전, 서비스 설비의 장애 등의 경우</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제7조 (회원의 의무)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회원은 다음 행위를 하여서는 안 됩니다:</p>
                      <ul className="list-disc list-inside">
                        <li>타인의 개인정보를 도용하거나 허위 정보를 등록하는 행위</li>
                        <li>서비스를 통해 얻은 정보를 상업적으로 무단 이용하는 행위</li>
                        <li>AI 분석 결과를 의료적 진단으로 왜곡하여 유포하는 행위</li>
                        <li>서비스의 안정적인 운영을 방해하는 행위</li>
                        <li>기타 법령 또는 본 약관에 위배되는 행위</li>
                      </ul>
                      <p>2. 회원은 자신의 계정 정보를 안전하게 관리해야 하며, 제3자에게 계정 이용을 허락해서는 안 됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제8조 (AI 분석 결과의 한계)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 본 서비스에서 제공하는 AI 분석 결과는 전문가 지식을 기반으로 생성된 참고 자료이며, 의학적·법적 진단을 대체하지 않습니다.</p>
                      <p>2. 정확한 진단 및 치료를 위해서는 반드시 관련 전문의 또는 전문가와 직접 상담하시기 바랍니다.</p>
                      <p>3. 회사는 AI 분석 결과에 기반한 이용자의 개인적 판단 및 행위에 대해 책임을 지지 않습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제9조 (14세 미만 아동의 개인정보 보호)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 14세 미만 아동의 개인정보를 수집·이용할 경우 법정대리인의 동의를 받습니다.</p>
                      <p>2. 아동의 심리검사 및 발달검사는 보호자(법정대리인)의 동의 하에 진행되며, 검사 결과는 보호자에게 제공됩니다.</p>
                      <p>3. 법정대리인은 아동의 개인정보 열람, 정정, 삭제를 요청할 수 있으며 회사는 이에 즉시 응합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제10조 (회사의 의무)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 관련 법령과 본 약관을 준수하며, 지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.</p>
                      <p>2. 회사는 회원의 개인정보를 보호하기 위해 보안 시스템을 구축하고 개인정보처리방침을 준수합니다.</p>
                      <p>3. 회사는 서비스 이용과 관련하여 회원이 제기한 의견이나 불만을 신속하게 처리하기 위해 노력합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제11조 (책임제한)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</p>
                      <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</p>
                      <p>3. 회사는 이용자가 서비스에 게재한 정보의 신뢰도, 정확성 등에 대해서는 책임을 지지 않습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제12조 (분쟁 해결)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사와 이용자 간에 발생한 분쟁은 상호 협의하여 원만하게 해결하도록 노력합니다.</p>
                      <p>2. 협의가 이루어지지 않을 경우, 관할 법원은 회사 소재지의 법원으로 합니다.</p>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3">부칙</h2>
                    <p className="text-muted-foreground">본 약관은 2026년 3월 24일부터 시행됩니다.</p>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>문의사항이 있으시면 고객센터로 연락주세요.</p>
            <p className="mt-2">이메일: support@aihpro.app</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
