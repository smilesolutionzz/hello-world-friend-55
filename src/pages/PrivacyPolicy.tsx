import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
              <p className="text-sm text-muted-foreground">최종 수정일: 2026년 3월 8일 | 시행일: 2026년 3월 15일</p>
            </CardHeader>
            
            <CardContent>
              {/* 핵심 요약 */}
              <div className="grid md:grid-cols-3 gap-4 mb-8 p-6 bg-primary/5 rounded-lg">
                <div className="text-center space-y-2">
                  <Lock className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-semibold">안전한 보관</h3>
                  <p className="text-xs text-muted-foreground">AES-256 암호화, Supabase RLS 적용</p>
                </div>
                <div className="text-center space-y-2">
                  <Eye className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-semibold">투명한 사용</h3>
                  <p className="text-xs text-muted-foreground">명시된 목적으로만 사용, AI 학습 미사용</p>
                </div>
                <div className="text-center space-y-2">
                  <Trash2 className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-semibold">언제든 삭제</h3>
                  <p className="text-xs text-muted-foreground">요청 시 30일 이내 완전 삭제</p>
                </div>
              </div>

              <ScrollArea className="h-[700px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. 개인정보의 수집 및 이용 목적</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>AIHumanPro(이하 "회사")는 「개인정보 보호법」 제15조 및 제22조에 따라 다음의 목적을 위하여 개인정보를 처리합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공, 본인확인, 부정 이용 방지</li>
                        <li><strong>서비스 제공:</strong> AI 심리검사, 관찰일지 분석, 전문가 매칭 및 상담, 두뇌 훈련</li>
                        <li><strong>결제 및 정산:</strong> 월간 구독(₩19,900) 결제, 환불 처리</li>
                        <li><strong>서비스 개선:</strong> 익명화된 통계 분석, 서비스 품질 향상 (AI 모델 학습에는 사용하지 않음)</li>
                        <li><strong>법적 의무 이행:</strong> 전자상거래법, 개인정보보호법 등 관련 법령 준수</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. 수집하는 개인정보 항목</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>필수 수집 항목:</strong></p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>이메일 주소, 비밀번호(해시 처리), 닉네임</li>
                      </ul>
                      <p className="mt-2"><strong>선택 수집 항목:</strong></p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>이름, 전화번호, 생년월일, 프로필 이미지</li>
                        <li>가족 구성원 정보(관찰일지 서비스 이용 시)</li>
                      </ul>
                      <p className="mt-2"><strong>자동 수집 정보:</strong></p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>IP 주소, 기기 정보, 브라우저 정보, 서비스 이용 기록</li>
                        <li>쿠키 및 세션 정보</li>
                      </ul>
                      <p className="mt-2"><strong>민감 정보 (별도 동의):</strong></p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>심리검사 결과, 관찰일지 내용, 상담 기록</li>
                        <li>해당 정보는 서비스 제공 목적 외 활용되지 않으며, AI 모델 학습에 사용되지 않습니다</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      <strong>14세 미만 아동의 개인정보 수집</strong><br />
                      회사는 만 14세 미만 아동의 개인정보를 수집하는 경우, 「개인정보 보호법」 제22조에 따라 
                      법정대리인의 동의를 받습니다. 관찰일지 서비스에서 아동의 정보를 입력하는 경우, 
                      해당 아동의 법정대리인(부모 등)이 직접 정보를 입력하는 것으로 간주하며, 
                      별도의 법정대리인 동의 절차를 진행합니다.
                    </AlertDescription>
                  </Alert>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. 개인정보의 보유 및 이용 기간</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이용자의 개인정보는 원칙적으로 수집·이용 목적이 달성되면 지체 없이 파기합니다. 단, 관련 법령에 따라 다음과 같이 보관합니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>계약 또는 청약철회 기록:</strong> 5년 (전자상거래법)</li>
                        <li><strong>대금결제 및 재화공급 기록:</strong> 5년 (전자상거래법)</li>
                        <li><strong>소비자 불만·분쟁 처리 기록:</strong> 3년 (전자상거래법)</li>
                        <li><strong>접속 로그:</strong> 3개월 (통신비밀보호법)</li>
                        <li><strong>금융 감사 로그:</strong> 7년 (회계 관련 법률)</li>
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
                        <li>결제 처리를 위해 토스페이먼츠에 필요 최소한의 정보를 전달하는 경우 (이름, 이메일)</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">5. 개인정보 처리 위탁</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 서비스 향상을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다:</p>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="p-2 text-left font-semibold">수탁업체</th>
                              <th className="p-2 text-left font-semibold">위탁 업무</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="p-2">Supabase Inc.</td>
                              <td className="p-2">데이터베이스 호스팅 및 인증 서비스</td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-2">주식회사 토스페이먼츠</td>
                              <td className="p-2">결제 처리</td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-2">OpenAI, Inc.</td>
                              <td className="p-2">AI 분석 처리 (데이터 학습 미사용 설정)</td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-2">Google LLC (Gemini)</td>
                              <td className="p-2">AI 분석 처리 (데이터 학습 미사용 설정)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">6. 개인정보의 파기 절차 및 방법</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>파기 절차:</strong> 목적 달성 후 별도 DB로 이관, 내부 방침에 따라 일정 기간 보관 후 파기</li>
                        <li><strong>파기 방법:</strong> 전자적 파일은 복구 불가능한 방법으로 삭제, 종이 문서는 분쇄 또는 소각</li>
                        <li><strong>회원 탈퇴 시:</strong> 요청 접수 후 30일 이내 모든 개인정보 완전 삭제 (법령 보관 의무 항목 제외)</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">7. 이용자의 권리·의무 및 행사방법</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이용자 및 법정대리인은 다음의 권리를 행사할 수 있습니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>열람권:</strong> 개인정보 처리 현황 열람 요청</li>
                        <li><strong>정정·삭제권:</strong> 부정확한 개인정보의 정정 또는 삭제 요청</li>
                        <li><strong>처리정지권:</strong> 개인정보 처리 정지 요청</li>
                        <li><strong>동의 철회권:</strong> 동의한 개인정보 처리의 철회</li>
                        <li><strong>이동권:</strong> 개인정보 다운로드 요청 (서비스 내 데이터 내보내기 기능 제공)</li>
                      </ul>
                      <p className="mt-2">권리 행사는 설정 페이지 또는 이메일(privacy@aihpro.app)을 통해 가능하며, 접수 후 10일 이내 처리합니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">8. 개인정보의 안전성 확보 조치</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 다음과 같은 안전성 확보 조치를 취하고 있습니다:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>기술적 조치:</strong> 데이터 암호화(전송 시 TLS 1.3, 저장 시 AES-256), Row Level Security(RLS) 적용, 접근 권한 관리</li>
                        <li><strong>관리적 조치:</strong> 개인정보 취급자 최소화, 정기 보안 교육, 접근 로그 기록 및 감사</li>
                        <li><strong>물리적 조치:</strong> 클라우드 서비스 이용에 따른 데이터센터 물리적 보안(Supabase/AWS)</li>
                      </ul>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">9. 쿠키의 설치·운영 및 거부</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>회사는 이용자에게 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키를 허용하거나 거부할 수 있습니다. 쿠키 저장을 거부할 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.</p>
                    </div>
                  </section>

                  <Separator />

                  <section>
                    <h2 className="text-xl font-semibold mb-3">10. 개인정보 보호책임자</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>개인정보 보호책임자:</strong> 이수석 (대표)</li>
                        <li><strong>이메일:</strong> privacy@aihpro.app</li>
                        <li><strong>전화:</strong> 1234-5678</li>
                      </ul>
                      <p className="mt-2">이용자는 서비스 이용 중 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제를 개인정보 보호책임자에게 문의할 수 있습니다.</p>
                      <p className="mt-2"><strong>권익침해 구제기관:</strong></p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>개인정보침해신고센터 (privacy.kisa.or.kr / 118)</li>
                        <li>개인정보분쟁조정위원회 (www.kopico.go.kr / 1833-6972)</li>
                        <li>대검찰청 사이버수사과 (www.spo.go.kr / 1301)</li>
                        <li>경찰청 사이버수사국 (ecrm.police.go.kr / 182)</li>
                      </ul>
                    </div>
                  </section>
                  
                  <Separator />
                  
                  <section>
                    <h2 className="text-xl font-semibold mb-3">11. 개인정보처리방침의 변경</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p>이 개인정보처리방침은 2026년 3월 15일부터 적용됩니다.</p>
                      <p>개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전에 서비스 내 공지사항을 통해 고지할 것입니다. 다만, 이용자 권리의 중대한 변경이 발생하는 경우에는 최소 30일 전에 고지합니다.</p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>개인정보 관련 문의사항이 있으시면 개인정보 보호책임자에게 연락주세요.</p>
            <p className="mt-2">이메일: privacy@aihpro.app | 전화: 1234-5678</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
