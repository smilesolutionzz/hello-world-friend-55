import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText } from 'lucide-react';

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
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">서비스 이용약관</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">최종 수정일: 2026년 3월 8일 | 시행일: 2026년 3월 15일</p>
            </CardHeader>
            
            <CardContent>
              {/* 의료 면책 경고 */}
              <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>⚠️ 중요 고지:</strong> 본 서비스는 의료행위가 아니며, 질병의 진단·치료·예방을 목적으로 하지 않습니다. 
                  AI가 제공하는 모든 분석 결과는 참고용이며, 정확한 진단과 치료는 반드시 의료 전문가와 상담하시기 바랍니다.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[700px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">제1조 (목적)</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      본 약관은 AIHumanPro(이하 "회사")가 제공하는 AI 심리 검사, 관찰일지, 전문가 상담, 두뇌 훈련 등의 서비스(이하 "서비스")를 
                      이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제2조 (용어의 정의)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>1. "서비스"</strong>란 회사가 제공하는 AI 심리 검사, 관찰일지, 전문가 상담, 두뇌 훈련 등 모든 부가 서비스를 의미합니다.</p>
                      <p><strong>2. "이용자"</strong>란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
                      <p><strong>3. "회원"</strong>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</p>
                      <p><strong>4. "구독"</strong>이란 월간 정기 결제(₩19,900/월)를 통해 서비스의 프리미엄 기능을 이용하는 것을 말합니다.</p>
                      <p><strong>5. "AI 분석 결과"</strong>란 인공지능이 생성한 참고용 분석 정보로서, 의학적 진단이 아닌 정보 제공 목적의 결과물을 말합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제3조 (약관의 효력 및 변경)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</p>
                      <p>2. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 본 약관을 개정할 수 있습니다.</p>
                      <p>3. 약관 개정 시 적용일자 및 개정사유를 명시하여 최소 7일 전 서비스 내에 공지합니다. 이용자에게 불리한 변경의 경우 최소 30일 전 공지합니다.</p>
                      <p>4. 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제4조 (서비스의 제공 및 변경)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>AI 심리 검사 서비스 (스트레스, 우울, ADHD, 애착 유형 등 30종 이상)</li>
                        <li>관찰일지 작성 및 AI 분석 서비스</li>
                        <li>전문가 매칭 및 상담 서비스</li>
                        <li>두뇌 훈련 서비스</li>
                        <li>AI 코칭 및 웰니스 서비스</li>
                        <li>기타 회사가 추가 개발하거나 제공하는 서비스</li>
                      </ul>
                      <p>2. 서비스 이용은 무료 체험과 유료 구독으로 구분됩니다:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li><strong>무료 체험:</strong> 기능별 1~2회 무료 이용 가능</li>
                        <li><strong>프리미엄 구독:</strong> 월 19,900원, 모든 기능 무제한 이용</li>
                      </ul>
                      <p>3. 회사는 서비스의 내용, 이용방법, 이용시간 등을 변경할 수 있으며, 변경 시 사전에 공지합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제5조 (AI 서비스의 한계 및 면책)</h2>
                    <div className="space-y-2 text-muted-foreground bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="font-semibold text-amber-800 dark:text-amber-200">⚠️ AI 서비스 면책 조항 (필독)</p>
                      <p>1. 본 서비스에서 제공하는 AI 분석 결과는 <strong>의료행위가 아니며</strong>, 질병의 진단, 치료, 예방을 목적으로 하지 않습니다.</p>
                      <p>2. AI가 제공하는 모든 분석, 점수, 해석, 추천은 <strong>참고 정보</strong>로서, 전문적인 의학적 조언을 대체할 수 없습니다.</p>
                      <p>3. 의료 관련 의사결정은 반드시 <strong>의료기관 및 전문의와 상담</strong> 후 진행하시기 바랍니다.</p>
                      <p>4. 이용자가 AI 분석 결과만을 근거로 의료적 판단을 내린 경우, 그로 인한 결과에 대해 회사는 <strong>법적 책임을 지지 않습니다</strong>.</p>
                      <p>5. AI 모델의 특성상 분석 결과에 오류가 포함될 수 있으며, 회사는 결과의 100% 정확성을 보장하지 않습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제6조 (이용 연령 제한)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 본 서비스는 만 14세 이상의 개인이 직접 이용할 수 있습니다.</p>
                      <p>2. 만 14세 미만의 아동에 대한 서비스 이용(관찰일지 등)은 반드시 법정대리인(부모 등)이 직접 수행해야 합니다.</p>
                      <p>3. 만 14세 미만 아동의 개인정보 수집 시 「개인정보 보호법」에 따라 법정대리인의 동의를 받습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제7조 (결제 및 구독)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 유료 서비스는 토스페이먼츠를 통한 카드 결제로 이용할 수 있습니다.</p>
                      <p>2. 구독 기간은 결제일로부터 30일이며, 현재 자동 갱신은 지원되지 않습니다.</p>
                      <p>3. 구독 만료 후 재결제하지 않으면 무료 이용 상태로 전환됩니다.</p>
                      <p>4. 결제 취소 및 환불은 별도의 환불 정책에 따릅니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제8조 (서비스 이용 제한 및 중지)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 중지할 수 있습니다:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>이용자가 회사의 서비스 운영을 방해하는 경우</li>
                        <li>이용자가 본 약관을 위반한 경우</li>
                        <li>시스템 점검, 증설, 교체, 고장 등의 사유가 발생한 경우</li>
                        <li>국가비상사태, 정전, 서비스 설비의 장애 또는 이용량 폭주 등의 경우</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제9조 (회원의 의무)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회원은 다음 행위를 하여서는 안 됩니다:</p>
                      <ul className="list-disc list-inside ml-2">
                        <li>타인의 개인정보를 도용하는 행위</li>
                        <li>AI 분석 결과를 의료 진단 용도로 무단 유포하는 행위</li>
                        <li>서비스를 역설계하거나 자동화된 방법으로 대량 접근하는 행위</li>
                        <li>불법적인 콘텐츠를 게시, 게재, 또는 전송하는 행위</li>
                        <li>서비스의 안정적인 운영을 방해하는 행위</li>
                      </ul>
                      <p>2. 회원은 자신의 계정 정보를 안전하게 관리해야 하며, 제3자에게 계정 이용을 허락해서는 안 됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제10조 (회사의 의무)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 관련 법령과 본 약관을 준수하며, 지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.</p>
                      <p>2. 회사는 회원의 개인정보를 보호하기 위해 보안 시스템을 구축하고 개인정보처리방침을 준수합니다.</p>
                      <p>3. 회사는 서비스 이용과 관련하여 회원이 제기한 의견이나 불만을 신속하게 처리합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제11조 (지적재산권)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 서비스에서 사용되는 AI 모델, 알고리즘, 디자인, 소프트웨어 등의 지적재산권은 회사에 귀속됩니다.</p>
                      <p>2. 이용자가 서비스를 통해 생성한 데이터(검사 결과, 관찰일지 등)의 소유권은 이용자에게 귀속됩니다.</p>
                      <p>3. 이용자는 자신의 데이터를 언제든지 내보내기(export) 할 수 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제12조 (책임제한)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우 면책됩니다.</p>
                      <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</p>
                      <p>3. AI 분석 결과의 해석 및 활용에 대한 최종 판단과 책임은 이용자에게 있습니다.</p>
                      <p>4. 회사는 이용자 상호간 또는 이용자와 제3자 상호간에 서비스를 매개로 발생한 분쟁에 대해 개입할 의무가 없습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">제13조 (분쟁 해결)</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사와 이용자 간에 발생한 분쟁은 상호 협의하여 원만하게 해결하도록 노력합니다.</p>
                      <p>2. 협의가 이루어지지 않을 경우, 회사 소재지 관할 법원을 전속 관할 법원으로 하며 대한민국 법률에 따라 해결합니다.</p>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3">부칙</h2>
                    <p className="text-muted-foreground">본 약관은 2026년 3월 15일부터 시행됩니다.</p>
                    <p className="text-muted-foreground mt-1">이전 약관(2025년 1월 4일 시행)은 본 약관 시행일에 폐지됩니다.</p>
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
