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
        title="환불 정책 - AIHPRO"
        description="AIHPRO 환불 정책. 구독, 이용권, 전문가 상담 환불 규정."
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-6 py-12 max-w-4xl pb-32">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">환불 정책</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">최종 수정일: 2026년 3월 24일</p>
            </CardHeader>
            
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>핵심 요약:</strong> 서비스 미사용 시 7일 이내 전액 환불 가능합니다.
                  사용 후에는 사용분을 제외한 금액을 환불해드립니다.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. 환불 기본 원칙</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>AIHPRO는 전자상거래법 및 콘텐츠산업진흥법에 따라 공정한 환불 정책을 운영합니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>서비스 미사용 시 구매일로부터 7일 이내 전액 환불</li>
                        <li>일부 사용 시 사용분을 차감한 금액 환불</li>
                        <li>회사의 귀책사유로 인한 서비스 이용 불가 시 전액 환불</li>
                        <li>환불 요청 후 영업일 기준 3~5일 이내 처리</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. 구독 환불 정책</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">전액 환불 가능</p>
                            <ul className="list-disc pl-4 mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
                              <li>구독 결제 후 7일 이내 서비스 미사용 시</li>
                              <li>시스템 오류로 인한 중복 결제</li>
                              <li>회사 귀책사유로 서비스 이용 불가</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-yellow-800 dark:text-yellow-200">부분 환불</p>
                            <ul className="list-disc pl-4 mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                              <li><strong>월간 구독:</strong> 사용일수에 해당하는 금액을 제외하고 환불</li>
                              <li><strong>연간 구독:</strong> 사용월수에 해당하는 금액 및 해지 수수료(10%)를 제외하고 환불</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>• 자동 결제 해지는 언제든 가능하며, 해지 시 다음 결제일부터 과금되지 않습니다.</p>
                        <p>• 구독 해지 후에도 남은 구독 기간 동안 서비스를 이용할 수 있습니다.</p>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. 이용권(단건 결제) 환불 정책</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>단건 이용권(검사 1회 ₩990, 리포트 1회 ₩3,900)은 다음과 같이 환불됩니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li><strong>미사용 이용권:</strong> 구매 후 7일 이내 전액 환불</li>
                        <li><strong>사용 완료 이용권:</strong> 결과 확인 후에는 환불 불가</li>
                        <li><strong>검사 중 오류:</strong> 시스템 장애로 검사 진행 불가 시 전액 환불 또는 이용권 재발급</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">4. 전문가 상담 환불 정책</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>전문가 상담(40분 ₩49,000 / 80분 ₩79,000)은 예약 취소 시점에 따라 환불 금액이 달라집니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>상담 시작 <strong>24시간 전</strong> 취소: 전액 환불</li>
                        <li>상담 시작 <strong>12시간 전</strong> 취소: 50% 환불</li>
                        <li>상담 시작 <strong>12시간 이내</strong> 취소 또는 불참: 환불 불가</li>
                      </ul>
                      <p className="mt-2">전문가의 사정으로 상담이 불가능할 경우 전액 환불 또는 일정 재조율이 가능합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. 환불 불가 사항</h2>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-800 dark:text-red-200">환불이 제한되는 경우</p>
                          <ul className="list-disc pl-4 mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                            <li>구매 후 7일이 경과한 미사용 이용권</li>
                            <li>검사 결과를 확인한 사용 완료 이용권</li>
                            <li>무료로 제공된 체험 서비스</li>
                            <li>비정상적 방법으로 서비스를 이용한 경우</li>
                            <li>이용자의 귀책사유로 서비스 이용이 불가능해진 경우</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. 환불 절차</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>환불 요청은 다음 방법으로 가능합니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>서비스 내 설정 &gt; 결제 관리에서 직접 환불 요청</li>
                        <li>이메일: refund@aihpro.app</li>
                      </ul>
                      <p className="mt-2">환불 접수 시 결제 정보(결제일시, 결제금액)가 필요하며, 영업일 기준 3~5일 이내 처리됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. 정책 변경</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>본 환불 정책은 2026년 3월 24일부터 시행됩니다.</p>
                      <p>변경 시 최소 7일 전 서비스 내에 공지합니다.</p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>환불 관련 문의: refund@aihpro.app</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
