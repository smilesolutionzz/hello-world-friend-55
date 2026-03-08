import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RefundPolicy = () => {
  return (
    <>
      <SEOHead 
        title="환불 정책 - AIHumanPro"
        description="AIHumanPro 환불 정책을 확인하세요"
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">환불 정책</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">최종 수정일: 2025년 1월 4일</p>
            </CardHeader>
            
            <CardContent>
              {/* 핵심 요약 */}
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>핵심 요약:</strong> 서비스 미사용 시 7일 이내 전액 환불 가능합니다. 
                  일부 사용한 경우 사용분을 제외한 금액을 환불해드립니다.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. 환불 기본 원칙</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>AIHumanPro는 전자상거래법 및 콘텐츠산업진흥법에 따라 공정한 환불 정책을 운영합니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>서비스 미사용 시 구매일로부터 7일 이내 전액 환불</li>
                        <li>일부 사용 시 사용분을 차감한 금액 환불</li>
                        <li>회사의 귀책사유로 인한 서비스 이용 불가 시 전액 환불</li>
                        <li>환불 요청 후 영업일 기준 3-5일 이내 처리</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. 토큰 환불 정책</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">전액 환불 가능한 경우</p>
                            <ul className="list-disc pl-4 mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
                              <li>토큰 구매 후 미사용 상태에서 7일 이내 환불 요청</li>
                              <li>시스템 오류로 인한 중복 결제</li>
                              <li>회사의 귀책사유로 서비스 이용 불가</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-yellow-800 dark:text-yellow-200">부분 환불 가능한 경우</p>
                            <ul className="list-disc pl-4 mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                              <li>토큰 일부 사용 후 7일 이내 환불 요청 시</li>
                              <li>환불액 = 결제금액 - (사용토큰 × 개당 단가)</li>
                              <li>예시: 100토큰 구매 후 30토큰 사용 → 70토큰에 해당하는 금액 환불</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-red-800 dark:text-red-200">환불 불가능한 경우</p>
                            <ul className="list-disc pl-4 mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                              <li>토큰 구매 후 7일 경과</li>
                              <li>불법적인 서비스 이용</li>
                              <li>본인 부주의로 인한 계정 정보 유출</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. 구독 환불 정책</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>AIHumanPro 구독 서비스는 다음의 환불 규정을 따릅니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li><strong>월간 구독:</strong> 결제 후 7일 이내 미사용 시 전액 환불 가능. 사용 시에는 사용일수에 해당하는 금액을 제외하고 환불.</li>
                        <li><strong>연간 구독:</strong> 결제 후 7일 이내 미사용 시 전액 환불 가능. 사용 시에는 사용월수에 해당하는 금액 및 해지 수수료(총 금액의 10%)를 제외하고 환불.</li>
                        <li>자동 결제 해지는 언제든지 가능하며, 해지 시 다음 결제일부터 과금되지 않습니다.</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">4. 심리 검사 환불 정책</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>AI 심리 검사는 검사 시작 전에는 전액 환불이 가능합니다. 검사 시작 후에는 환불이 불가능합니다.</p>
                      <p>결과 해석 오류 등 회사의 귀책사유가 있는 경우 전액 환불됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. 전문가 상담 환불 정책</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>전문가 상담은 상담 예약 취소 시점에 따라 환불 금액이 달라집니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>상담 시작 24시간 전 취소: 전액 환불</li>
                        <li>상담 시작 12시간 전 취소: 50% 환불</li>
                        <li>상담 시작 12시간 이내 취소 또는 불참: 환불 불가</li>
                      </ul>
                      <p>전문가의 사정으로 상담이 불가능할 경우 전액 환불됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. 환불 절차</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>환불 요청은 고객센터를 통해 접수할 수 있습니다. 환불 접수 시 다음 정보를 제공해야 합니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>환불 요청 사유</li>
                        <li>결제 정보 (결제일시, 결제수단, 결제금액)</li>
                        <li>환불받을 계좌 정보 (은행명, 계좌번호, 예금주)</li>
                      </ul>
                      <p>환불은 요청 접수 후 영업일 기준 3-5일 이내에 처리됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. 환불 제한 사항</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>다음의 경우에는 환불이 제한될 수 있습니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>이용자의 귀책사유로 서비스 이용이 불가능하게 된 경우</li>
                        <li>무료로 제공된 서비스 또는 이벤트 상품</li>
                        <li>환불 요청 시 필요한 정보를 제공하지 않는 경우</li>
                        <li>비정상적인 방법으로 서비스를 이용한 경우</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">8. 분쟁 해결</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>환불 정책과 관련된 분쟁이 발생할 경우, 회사와 이용자는 상호 협의하여 원만하게 해결하도록 노력합니다.</p>
                      <p>협의가 이루어지지 않을 경우, 대한민국 법률에 따라 해결합니다.</p>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3">9. 정책 변경</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>본 환불 정책은 2025년 1월 4일부터 시행됩니다.</p>
                      <p>환불 정책의 내용이 변경될 경우, 변경 사항은 최소 7일 전에 웹사이트를 통해 공지됩니다.</p>
                      <p>변경된 약관은 공지한 날로부터 효력이 발생합니다.</p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>환불 관련 문의사항이 있으시면 고객센터로 연락주세요.</p>
            <p className="mt-2">이메일: refund@aihpro.app | 전화: 1234-5678 (평일 09:00-18:00)</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
