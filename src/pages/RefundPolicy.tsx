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
              <p className="text-sm text-muted-foreground">최종 수정일: 2026년 3월 8일 | 시행일: 2026년 3월 15일</p>
            </CardHeader>
            
            <CardContent>
              {/* 핵심 요약 */}
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>핵심 요약:</strong> 구독 결제 후 14일 이내 미사용 시 전액 환불 가능합니다. 
                  일부 사용한 경우 사용일수를 제외한 금액을 환불해드립니다. (전자상거래법 준수)
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[700px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. 환불 기본 원칙</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>AIHumanPro는 「전자상거래 등에서의 소비자보호에 관한 법률」 및 「콘텐츠산업진흥법」에 따라 공정한 환불 정책을 운영합니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>청약철회 기간: 결제일로부터 <strong>14일</strong> (전자상거래법 제17조)</li>
                        <li>서비스 미사용 시 14일 이내 전액 환불</li>
                        <li>일부 사용 시 사용일수를 차감한 금액 환불</li>
                        <li>회사의 귀책사유로 인한 서비스 이용 불가 시 전액 환불</li>
                        <li>환불 요청 후 영업일 기준 3~5일 이내 처리</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. 월간 구독 환불 정책</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">전액 환불 가능한 경우</p>
                            <ul className="list-disc pl-4 mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
                              <li>결제 후 14일 이내 서비스 미사용 상태에서 환불 요청</li>
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
                              <li>결제 후 14일 이내 서비스 일부 사용 후 환불 요청 시</li>
                              <li>환불액 = 결제금액(₩19,900) - (사용일수 × 일할 금액)</li>
                              <li>일할 금액 = ₩19,900 ÷ 30일 = ₩663/일</li>
                              <li>예시: 5일 사용 → 환불액 = ₩19,900 - (5 × ₩663) = ₩16,585</li>
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
                              <li>결제 후 14일 경과 및 서비스 사용 이력이 있는 경우</li>
                              <li>불법적인 서비스 이용</li>
                              <li>약관 위반으로 인한 서비스 중지</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. 전문가 상담 환불 정책</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>전문가 상담은 상담 예약 취소 시점에 따라 환불 금액이 달라집니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li><strong>상담 시작 24시간 전 취소:</strong> 전액 환불</li>
                        <li><strong>상담 시작 12시간 전 취소:</strong> 50% 환불</li>
                        <li><strong>상담 시작 12시간 이내 취소 또는 불참:</strong> 환불 불가</li>
                      </ul>
                      <p>전문가의 사정으로 상담이 불가능할 경우 전액 환불됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">4. 환불 절차</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>환불 요청은 다음 방법으로 접수할 수 있습니다:</p>
                      <div className="bg-muted/50 p-4 rounded-lg mt-2 space-y-2">
                        <p><strong>방법 1:</strong> 서비스 내 설정 &gt; 구독 관리 &gt; 환불 요청</p>
                        <p><strong>방법 2:</strong> 이메일 접수 (refund@aihpro.app)</p>
                        <p><strong>방법 3:</strong> 고객센터 전화 (1234-5678, 평일 09:00-18:00)</p>
                      </div>
                      <p className="mt-3">환불 요청 시 다음 정보를 제공해야 합니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-1">
                        <li>가입 이메일 주소</li>
                        <li>결제일 및 결제 금액</li>
                        <li>환불 사유</li>
                      </ul>
                      <p className="mt-2">환불은 원결제 수단(카드 취소)으로 처리되며, 영업일 기준 3~5일 소요됩니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. 청약철회 제한 사항</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>「전자상거래법」 제17조 제2항에 따라, 다음의 경우 청약철회가 제한될 수 있습니다:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>이용자에게 책임 있는 사유로 서비스가 멸실·훼손된 경우</li>
                        <li>디지털 콘텐츠의 경우, 이용을 시작한 경우 (단, 가분적 콘텐츠의 미이용 부분은 환불 가능)</li>
                      </ul>
                      <p className="mt-2">회사는 청약철회 제한 사유에 해당하는 경우, 그 사실을 서비스 이용 전 명확히 고지합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. 분쟁 해결</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>환불 정책과 관련된 분쟁이 발생할 경우:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>1차: 회사와 이용자 간 상호 협의</li>
                        <li>2차: 한국소비자원 (www.kca.go.kr / 1372) 분쟁조정</li>
                        <li>3차: 대한민국 법률에 따른 법적 절차</li>
                      </ul>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. 정책 변경</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>본 환불 정책은 2026년 3월 15일부터 시행됩니다.</p>
                      <p>환불 정책 변경 시 최소 7일 전에 서비스 내 공지사항을 통해 고지합니다.</p>
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
