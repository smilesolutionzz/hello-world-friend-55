import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Trash2 } from 'lucide-react';
import { LegalVersionBadge } from '@/components/legal/LegalVersionBadge';

const PrivacyPolicy = () => {
  return (
    <>
      <SEOHead 
        title="개인정보처리방침 - AIHPRO"
        description="AIHPRO 개인정보처리방침. AI 심리·발달 분석 플랫폼의 개인정보 보호 정책."
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        
        <div className="container mx-auto px-6 py-12 max-w-4xl pb-32">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">개인정보처리방침</CardTitle>
              </div>
              <LegalVersionBadge doc="privacy" />
            
            <CardContent>
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
                      <p>AIHPRO(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공, 본인확인, 부정 이용 방지</li>
                        <li><strong>서비스 제공:</strong> AI 심리검사, 발달검사, 행동관찰 분석, 전문가 매칭 및 상담, AI 코칭</li>
                        <li><strong>결제 및 정산:</strong> 구독 결제, 이용권 결제, 상담비 결제 및 환불 처리</li>
                        <li><strong>고객 지원:</strong> 문의 대응, 서비스 관련 공지사항 전달</li>
                        <li><strong>서비스 개선:</strong> 이용 통계 분석, AI 분석 정확도 향상, 신규 서비스 개발</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. 수집하는 개인정보 항목</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 다음의 개인정보 항목을 수집합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>필수 정보:</strong> 이메일 주소, 비밀번호 (소셜 로그인 시 해당 없음)</li>
                        <li><strong>선택 정보:</strong> 이름, 연락처, 자녀 정보(생년월일, 성별)</li>
                        <li><strong>검사 관련:</strong> 심리검사 응답 내용, 행동관찰 기록, AI 분석 결과</li>
                        <li><strong>결제 정보:</strong> 결제 수단 정보, 결제 이력 (토스페이먼츠 경유)</li>
                        <li><strong>자동 수집:</strong> IP 주소, 기기 정보, 서비스 이용 기록, 쿠키</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. 개인정보의 보유 및 이용 기간</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이용자의 개인정보는 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 단, 다음의 경우 법령에 따라 보존합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>결제 및 공급 기록:</strong> 5년 (전자상거래법)</li>
                        <li><strong>소비자 불만 처리:</strong> 3년 (전자상거래법)</li>
                        <li><strong>로그인 기록:</strong> 3개월 (통신비밀보호법)</li>
                        <li><strong>검사 결과 데이터:</strong> 회원 탈퇴 시 즉시 삭제 (별도 보존 동의 시 1년)</li>
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
                        <li>전문가 상담 매칭 시 상담 전문가에게 필요 최소한의 정보 제공 (사전 동의)</li>
                        <li>법령의 규정에 의거하거나 수사기관의 적법한 요구가 있는 경우</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. 개인정보 처리 위탁</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 서비스 향상을 위해 다음과 같이 개인정보를 위탁하고 있습니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>토스페이먼츠(주):</strong> 결제 처리 및 정산</li>
                        <li><strong>Supabase Inc.:</strong> 클라우드 데이터베이스 호스팅</li>
                        <li><strong>Google LLC:</strong> 서비스 이용 통계 분석 (Google Analytics)</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. 개인정보의 파기</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>개인정보 보유기간 경과 또는 처리목적 달성 시 지체 없이 파기합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>전자적 파일:</strong> 복구 불가능한 기술적 방법으로 삭제</li>
                        <li><strong>종이 문서:</strong> 분쇄기로 분쇄 또는 소각</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. 이용자 및 법정대리인의 권리</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이용자(또는 법정대리인)는 언제든지 다음의 권리를 행사할 수 있습니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>개인정보 열람, 정정, 삭제 요청</li>
                        <li>개인정보 처리 정지 요청</li>
                        <li>회원 탈퇴 요청</li>
                        <li>동의 철회</li>
                      </ul>
                      <p>요청은 서비스 내 설정 또는 고객센터(support@aihpro.app)를 통해 가능합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">8. 14세 미만 아동의 개인정보 보호</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>1. 회사는 14세 미만 아동의 개인정보를 수집할 경우 법정대리인의 동의를 받습니다.</p>
                      <p>2. 아동의 심리검사 및 발달검사는 보호자(법정대리인)가 대리로 진행하며, 결과는 보호자에게 제공됩니다.</p>
                      <p>3. 법정대리인은 아동의 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.</p>
                      <p>4. 법정대리인의 동의 없이 수집된 아동의 개인정보는 확인 즉시 삭제합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">9. 쿠키 및 자동 수집 장치</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 서비스 개선을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">10. 개인정보 보호책임자</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 개인정보 처리에 관한 업무를 총괄하여 책임지는 개인정보 보호책임자를 지정합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>담당:</strong> AIHPRO 개인정보보호팀</li>
                        <li><strong>연락처:</strong> privacy@aihpro.app</li>
                      </ul>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3">11. 개인정보처리방침의 변경</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이 개인정보처리방침은 2026년 3월 24일부터 적용됩니다.</p>
                      <p>변경이 있을 시 최소 7일 전 서비스 내에 공지합니다.</p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>개인정보 관련 문의: privacy@aihpro.app</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
