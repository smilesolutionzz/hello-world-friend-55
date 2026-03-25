import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/i18n/LanguageContext';

const RefundPolicy = () => {
  const { isEnglish } = useLanguage();

  return (
    <>
      <SEOHead 
        title={isEnglish ? "Refund Policy - AIHPRO" : "환불 정책 - AIHPRO"}
        description={isEnglish ? "AIHPRO refund policy for subscriptions, passes, and expert consultations." : "AIHPRO 환불 정책. 구독, 이용권, 전문가 상담 환불 규정."}
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-6 py-12 max-w-4xl pb-32">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">{isEnglish ? 'Refund Policy' : '환불 정책'}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Last updated: March 24, 2026' : '최종 수정일: 2026년 3월 24일'}</p>
            </CardHeader>
            
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isEnglish
                    ? <><strong>Summary:</strong> Full refund available within 7 days if the service has not been used. After use, the used portion will be deducted from the refund.</>
                    : <><strong>핵심 요약:</strong> 서비스 미사용 시 7일 이내 전액 환불 가능합니다. 사용 후에는 사용분을 제외한 금액을 환불해드립니다.</>}
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">{isEnglish ? '1. General Refund Principles' : '1. 환불 기본 원칙'}</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{isEnglish ? 'AIHPRO operates a fair refund policy in accordance with applicable consumer protection laws:' : 'AIHPRO는 전자상거래법 및 콘텐츠산업진흥법에 따라 공정한 환불 정책을 운영합니다:'}</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        {isEnglish ? (
                          <>
                            <li>Full refund within 7 days of purchase if the service is unused</li>
                            <li>Partial refund with used portion deducted</li>
                            <li>Full refund if service is unavailable due to company fault</li>
                            <li>Refunds processed within 3–5 business days</li>
                          </>
                        ) : (
                          <>
                            <li>서비스 미사용 시 구매일로부터 7일 이내 전액 환불</li>
                            <li>일부 사용 시 사용분을 차감한 금액 환불</li>
                            <li>회사의 귀책사유로 인한 서비스 이용 불가 시 전액 환불</li>
                            <li>환불 요청 후 영업일 기준 3~5일 이내 처리</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">{isEnglish ? '2. Subscription Refund Policy' : '2. 구독 환불 정책'}</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">{isEnglish ? 'Full refund eligible' : '전액 환불 가능'}</p>
                            <ul className="list-disc pl-4 mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
                              {isEnglish ? (
                                <>
                                  <li>Within 7 days of subscription payment if unused</li>
                                  <li>Duplicate charges due to system error</li>
                                  <li>Service unavailable due to company fault</li>
                                </>
                              ) : (
                                <>
                                  <li>구독 결제 후 7일 이내 서비스 미사용 시</li>
                                  <li>시스템 오류로 인한 중복 결제</li>
                                  <li>회사 귀책사유로 서비스 이용 불가</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-yellow-800 dark:text-yellow-200">{isEnglish ? 'Partial refund' : '부분 환불'}</p>
                            <ul className="list-disc pl-4 mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                              {isEnglish ? (
                                <>
                                  <li><strong>Monthly:</strong> Refund excluding days used</li>
                                  <li><strong>Annual:</strong> Refund excluding months used and 10% cancellation fee</li>
                                </>
                              ) : (
                                <>
                                  <li><strong>월간 구독:</strong> 사용일수에 해당하는 금액을 제외하고 환불</li>
                                  <li><strong>연간 구독:</strong> 사용월수에 해당하는 금액 및 해지 수수료(10%)를 제외하고 환불</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {isEnglish ? (
                          <>
                            <p>• Auto-renewal can be cancelled anytime; charges stop from the next billing date.</p>
                            <p>• After cancellation, service remains active until the end of the current period.</p>
                          </>
                        ) : (
                          <>
                            <p>• 자동 결제 해지는 언제든 가능하며, 해지 시 다음 결제일부터 과금되지 않습니다.</p>
                            <p>• 구독 해지 후에도 남은 구독 기간 동안 서비스를 이용할 수 있습니다.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">{isEnglish ? '3. Single-Use Pass Refund Policy' : '3. 이용권(단건 결제) 환불 정책'}</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{isEnglish ? 'Single-use passes (Assessment ₩990, Report ₩3,900) are refunded as follows:' : '단건 이용권(검사 1회 ₩990, 리포트 1회 ₩3,900)은 다음과 같이 환불됩니다:'}</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        {isEnglish ? (
                          <>
                            <li><strong>Unused pass:</strong> Full refund within 7 days of purchase</li>
                            <li><strong>Used pass:</strong> No refund after viewing results</li>
                            <li><strong>System error:</strong> Full refund or pass reissue if assessment couldn't proceed</li>
                          </>
                        ) : (
                          <>
                            <li><strong>미사용 이용권:</strong> 구매 후 7일 이내 전액 환불</li>
                            <li><strong>사용 완료 이용권:</strong> 결과 확인 후에는 환불 불가</li>
                            <li><strong>검사 중 오류:</strong> 시스템 장애로 검사 진행 불가 시 전액 환불 또는 이용권 재발급</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">{isEnglish ? '4. Expert Consultation Refund Policy' : '4. 전문가 상담 환불 정책'}</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{isEnglish ? 'Expert consultations (40 min ₩49,000 / 80 min ₩79,000) refund depends on cancellation timing:' : '전문가 상담(40분 ₩49,000 / 80분 ₩79,000)은 예약 취소 시점에 따라 환불 금액이 달라집니다:'}</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        {isEnglish ? (
                          <>
                            <li>Cancelled <strong>24+ hours</strong> before: Full refund</li>
                            <li>Cancelled <strong>12+ hours</strong> before: 50% refund</li>
                            <li>Cancelled <strong>within 12 hours</strong> or no-show: No refund</li>
                          </>
                        ) : (
                          <>
                            <li>상담 시작 <strong>24시간 전</strong> 취소: 전액 환불</li>
                            <li>상담 시작 <strong>12시간 전</strong> 취소: 50% 환불</li>
                            <li>상담 시작 <strong>12시간 이내</strong> 취소 또는 불참: 환불 불가</li>
                          </>
                        )}
                      </ul>
                      <p className="mt-2">{isEnglish ? 'If the expert is unavailable, a full refund or rescheduling will be provided.' : '전문가의 사정으로 상담이 불가능할 경우 전액 환불 또는 일정 재조율이 가능합니다.'}</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">{isEnglish ? '5. Non-Refundable Cases' : '5. 환불 불가 사항'}</h2>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-800 dark:text-red-200">{isEnglish ? 'Refund is not available for' : '환불이 제한되는 경우'}</p>
                          <ul className="list-disc pl-4 mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                            {isEnglish ? (
                              <>
                                <li>Unused passes after 7 days of purchase</li>
                                <li>Used passes (results already viewed)</li>
                                <li>Free trial services</li>
                                <li>Services used through abnormal methods</li>
                                <li>Service unavailability due to user's own fault</li>
                              </>
                            ) : (
                              <>
                                <li>구매 후 7일이 경과한 미사용 이용권</li>
                                <li>검사 결과를 확인한 사용 완료 이용권</li>
                                <li>무료로 제공된 체험 서비스</li>
                                <li>비정상적 방법으로 서비스를 이용한 경우</li>
                                <li>이용자의 귀책사유로 서비스 이용이 불가능해진 경우</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">{isEnglish ? '6. Refund Process' : '6. 환불 절차'}</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{isEnglish ? 'You can request a refund through:' : '환불 요청은 다음 방법으로 가능합니다:'}</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        {isEnglish ? (
                          <>
                            <li>Settings &gt; Payment Management in the app</li>
                            <li>Email: refund@aihpro.app</li>
                          </>
                        ) : (
                          <>
                            <li>서비스 내 설정 &gt; 결제 관리에서 직접 환불 요청</li>
                            <li>이메일: refund@aihpro.app</li>
                          </>
                        )}
                      </ul>
                      <p className="mt-2">{isEnglish ? 'Payment details (date, amount) are required. Refunds are processed within 3–5 business days.' : '환불 접수 시 결제 정보(결제일시, 결제금액)가 필요하며, 영업일 기준 3~5일 이내 처리됩니다.'}</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">{isEnglish ? '7. Policy Changes' : '7. 정책 변경'}</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{isEnglish ? 'This refund policy is effective from March 24, 2026.' : '본 환불 정책은 2026년 3월 24일부터 시행됩니다.'}</p>
                      <p>{isEnglish ? 'Changes will be announced at least 7 days in advance.' : '변경 시 최소 7일 전 서비스 내에 공지합니다.'}</p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>{isEnglish ? 'Refund inquiries: refund@aihpro.app' : '환불 관련 문의: refund@aihpro.app'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
