import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Share, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IEPData {
  id: string;
  student_name: string;
  student_age: number;
  student_concerns?: string;
  teacher_observations?: string;
  assessment_results?: any;
  annual_goals?: any;
  short_term_objectives?: any;
  special_education_services?: any;
  related_services?: any;
  supplementary_aids?: any;
  assessment_modifications?: any;
  transition_services?: any;
  accommodations?: any;
  current_performance?: any;
  plan_status: string;
  valid_from: string;
  valid_to: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const IEPView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [iepData, setIepData] = useState<IEPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchIEPData();
    }
  }, [id]);

  const fetchIEPData = async () => {
    try {
      const { data, error } = await supabase
        .from('individual_education_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setIepData(data);
    } catch (error) {
      console.error('IEP 데이터 조회 오류:', error);
      toast({
        title: "오류",
        description: "IEP 데이터를 불러올 수 없습니다.",
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }
  };

  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-iep-pdf', {
        body: { iepId: id }
      })

      if (error) throw error

      // HTML 파일로 다운로드 (브라우저에서 PDF로 인쇄 가능)
      const blob = new Blob([data], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `IEP_${iepData?.student_name}_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "다운로드 완료",
        description: "IEP 파일이 다운로드되었습니다. 브라우저에서 열어 PDF로 인쇄할 수 있습니다."
      })
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      toast({
        title: "오류",
        description: "PDF 다운로드 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  const handleShare = async () => {
    const currentUrl = window.location.href
    
    try {
      if (navigator.share) {
        // 모바일 브라우저의 Web Share API 사용
        await navigator.share({
          title: `개별교육계획서 (IEP) - ${iepData?.student_name}`,
          text: 'AI 전문가 시스템으로 생성된 맞춤형 교육계획을 확인해보세요.',
          url: currentUrl
        })
        toast({
          title: "공유 완료",
          description: "공유가 완료되었습니다."
        })
      } else {
        // 클립보드에 URL 복사
        await navigator.clipboard.writeText(currentUrl)
        toast({
          title: "링크 복사",
          description: "링크가 클립보드에 복사되었습니다."
        })
      }
    } catch (error) {
      console.error('공유 오류:', error)
      // fallback: 수동으로 URL 복사
      try {
        await navigator.clipboard.writeText(currentUrl)
        toast({
          title: "링크 복사",
          description: "링크가 클립보드에 복사되었습니다."
        })
      } catch (clipboardError) {
        toast({
          title: "오류",
          description: "공유 기능을 사용할 수 없습니다.",
          variant: "destructive"
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">IEP 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!iepData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">IEP를 찾을 수 없습니다</h3>
            <p className="text-muted-foreground mb-4">요청하신 개별교육계획을 찾을 수 없습니다.</p>
            <Button onClick={() => navigate('/iep-generator')}>
              새 IEP 생성하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/iep-generator')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">개별교육계획서 (IEP)</h1>
              <p className="text-muted-foreground">생성일: {new Date(iepData.created_at).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              공유
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              PDF 다운로드
            </Button>
          </div>
        </div>

        {/* 학생 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>학생 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">이름</label>
                <p className="text-lg font-semibold">{iepData.student_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">나이</label>
                <p className="text-lg font-semibold">{iepData.student_age}세</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IEP 내용 */}
        <div className="space-y-6">
          {/* 현재 수행 수준 */}
          {iepData.current_performance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  현재 수행 수준
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {typeof iepData.current_performance === 'object' ? (
                  <div className="grid gap-6">
                    {iepData.current_performance.academicAchievement && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">학업 성취도</h4>
                        <p className="text-muted-foreground leading-relaxed">{iepData.current_performance.academicAchievement}</p>
                      </div>
                    )}
                    {iepData.current_performance.functionalPerformance && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">기능적 수행 능력</h4>
                        <p className="text-muted-foreground leading-relaxed">{iepData.current_performance.functionalPerformance}</p>
                      </div>
                    )}
                    {iepData.current_performance.strengthsAndNeeds && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">강점 및 지원 필요 영역</h4>
                        <p className="text-muted-foreground leading-relaxed">{iepData.current_performance.strengthsAndNeeds}</p>
                      </div>
                    )}
                    {iepData.current_performance.communicationSkills && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">의사소통 능력</h4>
                        <p className="text-muted-foreground leading-relaxed">{iepData.current_performance.communicationSkills}</p>
                      </div>
                    )}
                    {iepData.current_performance.behavioralCharacteristics && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">행동 특성</h4>
                        <p className="text-muted-foreground leading-relaxed">{iepData.current_performance.behavioralCharacteristics}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{JSON.stringify(iepData.current_performance)}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 연간 목표 */}
          {iepData.annual_goals && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  연간 목표
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.isArray(iepData.annual_goals) ? (
                    iepData.annual_goals.map((goal: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-lg">목표 {index + 1}</h4>
                          {goal.domain && <Badge variant="secondary" className="ml-2">{goal.domain}</Badge>}
                        </div>
                        
                        {goal.goal && (
                          <div className="mb-3">
                            <span className="font-medium text-primary">목표: </span>
                            <span className="text-muted-foreground">{goal.goal}</span>
                          </div>
                        )}
                        
                        {goal.measurableCriteria && (
                          <div className="mb-3">
                            <span className="font-medium text-primary">측정 기준: </span>
                            <span className="text-muted-foreground">{goal.measurableCriteria}</span>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {goal.timeframe && (
                            <div>
                              <span className="font-medium">기간:</span> <span className="text-muted-foreground">{goal.timeframe}</span>
                            </div>
                          )}
                          {goal.evaluationMethod && (
                            <div>
                              <span className="font-medium">평가 방법:</span> <span className="text-muted-foreground">{goal.evaluationMethod}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">{JSON.stringify(iepData.annual_goals)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 단기 목표 */}
          {iepData.short_term_objectives && Array.isArray(iepData.short_term_objectives) && iepData.short_term_objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  단기 목표
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {iepData.short_term_objectives.map((objective: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="mb-2">
                        <span className="font-medium text-primary">관련 목표: </span>
                        <span className="text-muted-foreground">{objective.relatedGoal}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-primary">목표: </span>
                        <span className="text-muted-foreground">{objective.objective}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {objective.criteria && (
                          <div>
                            <span className="font-medium">성취 기준:</span> <span className="text-muted-foreground">{objective.criteria}</span>
                          </div>
                        )}
                        {objective.schedule && (
                          <div>
                            <span className="font-medium">평가 일정:</span> <span className="text-muted-foreground">{objective.schedule}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 특수교육 서비스 */}
          {iepData.special_education_services && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  특수교육 서비스
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(iepData.special_education_services) ? (
                    iepData.special_education_services.map((service: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-primary">{service.service || '특수교육 서비스'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          {service.location && (
                            <div>
                              <span className="font-medium">장소:</span> <span className="text-muted-foreground">{service.location}</span>
                            </div>
                          )}
                          {service.frequency && (
                            <div>
                              <span className="font-medium">빈도:</span> <span className="text-muted-foreground">{service.frequency}</span>
                            </div>
                          )}
                          {service.duration && (
                            <div>
                              <span className="font-medium">기간:</span> <span className="text-muted-foreground">{service.duration}</span>
                            </div>
                          )}
                          {service.provider && (
                            <div>
                              <span className="font-medium">제공자:</span> <span className="text-muted-foreground">{service.provider}</span>
                            </div>
                          )}
                        </div>
                        {service.specificContent && (
                          <div className="mt-3">
                            <span className="font-medium text-primary">구체적 내용: </span>
                            <span className="text-muted-foreground">{service.specificContent}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">{JSON.stringify(iepData.special_education_services)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 관련 서비스 */}
          {iepData.related_services && Array.isArray(iepData.related_services) && iepData.related_services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  관련 서비스
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {iepData.related_services.map((service: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-primary">{service.service}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        {service.frequency && (
                          <div>
                            <span className="font-medium">빈도:</span> <span className="text-muted-foreground">{service.frequency}</span>
                          </div>
                        )}
                        {service.duration && (
                          <div>
                            <span className="font-medium">기간:</span> <span className="text-muted-foreground">{service.duration}</span>
                          </div>
                        )}
                        {service.provider && (
                          <div>
                            <span className="font-medium">제공자:</span> <span className="text-muted-foreground">{service.provider}</span>
                          </div>
                        )}
                      </div>
                      {service.goals && (
                        <div className="mt-3">
                          <span className="font-medium text-primary">목표: </span>
                          <span className="text-muted-foreground">{service.goals}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 보조 도구 */}
          {iepData.supplementary_aids && Array.isArray(iepData.supplementary_aids) && iepData.supplementary_aids.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  보조 도구 및 지원
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {iepData.supplementary_aids.map((aid: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 text-primary">{aid.aid}</h4>
                      {aid.purpose && (
                        <div className="mb-2">
                          <span className="font-medium">목적: </span>
                          <span className="text-muted-foreground">{aid.purpose}</span>
                        </div>
                      )}
                      {aid.usage && (
                        <div className="mb-2">
                          <span className="font-medium">사용 방법: </span>
                          <span className="text-muted-foreground">{aid.usage}</span>
                        </div>
                      )}
                      {aid.provider && (
                        <div>
                          <span className="font-medium">제공자: </span>
                          <span className="text-muted-foreground">{aid.provider}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 평가 수정사항 */}
          {iepData.assessment_modifications && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  평가 수정사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(iepData.assessment_modifications) ? (
                    iepData.assessment_modifications.map((modification: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-primary">{modification.modification}</h4>
                        {modification.reason && (
                          <div className="mb-2">
                            <span className="font-medium">수정 이유: </span>
                            <span className="text-muted-foreground">{modification.reason}</span>
                          </div>
                        )}
                        {modification.application && (
                          <div className="mb-2">
                            <span className="font-medium">적용 방법: </span>
                            <span className="text-muted-foreground">{modification.application}</span>
                          </div>
                        )}
                        {modification.subjects && (
                          <div>
                            <span className="font-medium">적용 과목: </span>
                            <span className="text-muted-foreground">{modification.subjects}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">{JSON.stringify(iepData.assessment_modifications)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 전환 서비스 */}
          {iepData.transition_services && iepData.student_age >= 14 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  전환 서비스 (14세 이상)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeof iepData.transition_services === 'object' ? (
                  <div className="space-y-4">
                    {iepData.transition_services.postSecondaryGoals && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">중등교육 후 목표</h4>
                        <p className="text-muted-foreground">{iepData.transition_services.postSecondaryGoals}</p>
                      </div>
                    )}
                    {iepData.transition_services.transitionActivities && Array.isArray(iepData.transition_services.transitionActivities) && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">전환 활동</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {iepData.transition_services.transitionActivities.map((activity: string, index: number) => (
                            <li key={index} className="text-muted-foreground">{activity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {iepData.transition_services.agencyInvolvement && (
                      <div>
                        <h4 className="font-semibold text-primary mb-2">관련 기관 참여</h4>
                        <p className="text-muted-foreground">{iepData.transition_services.agencyInvolvement}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{JSON.stringify(iepData.transition_services)}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 학부모 우려사항 */}
          {iepData.student_concerns && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  학부모 우려사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{iepData.student_concerns}</p>
              </CardContent>
            </Card>
          )}

          {/* 교사 관찰사항 */}
          {iepData.teacher_observations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  교사 관찰사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{iepData.teacher_observations}</p>
              </CardContent>
            </Card>
          )}

          {/* 평가 결과 */}
          {iepData.assessment_results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  연결된 평가 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">이 IEP는 기존 평가 결과를 바탕으로 작성되었습니다.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI 전문가 시스템 정보 */}
        <Card className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Badge variant="default" className="bg-primary">AI 전문가</Badge>
              개별교육계획 생성 시스템 신뢰성 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 전문가 페르소나 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  AI 전문가 페르소나
                </h4>
                <div className="bg-background/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">경력:</span> 20년 이상의 특수교육 현장 경험
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">전문 분야:</span> 개별교육계획(IEP) 수립 및 실행
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">자격:</span> 특수교육 전문가, 교육과정 설계 전문
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">특기:</span> 학생 개개인의 특성을 고려한 맞춤형 교육계획 수립
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  한국 특수교육법 준수
                </h4>
                <div className="bg-background/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">법적 근거:</span> 장애인 등에 대한 특수교육법
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">준수 사항:</span> 개별화교육계획 작성 기준
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">교육과정:</span> 2022 개정 특수교육 교육과정 반영
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">품질 보장:</span> 법정 요구사항 완전 준수
                  </p>
                </div>
              </div>
            </div>

            {/* SMART 기준 */}
            <div className="space-y-3">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                SMART 기준 목표 설정 시스템
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-bold text-primary text-lg mb-1">S</div>
                  <div className="text-sm font-medium mb-1">Specific</div>
                  <div className="text-xs text-muted-foreground">구체적이고 명확한 목표</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-bold text-primary text-lg mb-1">M</div>
                  <div className="text-sm font-medium mb-1">Measurable</div>
                  <div className="text-xs text-muted-foreground">측정 가능한 기준</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-bold text-primary text-lg mb-1">A</div>
                  <div className="text-sm font-medium mb-1">Achievable</div>
                  <div className="text-xs text-muted-foreground">달성 가능한 수준</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-bold text-primary text-lg mb-1">R</div>
                  <div className="text-sm font-medium mb-1">Relevant</div>
                  <div className="text-xs text-muted-foreground">연관성 있는 내용</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3 text-center">
                  <div className="font-bold text-primary text-lg mb-1">T</div>
                  <div className="text-sm font-medium mb-1">Time-bound</div>
                  <div className="text-xs text-muted-foreground">시간 제한 설정</div>
                </div>
              </div>
            </div>

            {/* 품질 보장 */}
            <div className="bg-primary/10 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                품질 보장 시스템
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">AI 모델:</span> GPT-5 (2025년 안정화 버전)
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">검증:</span> 특수교육 전문가 감수 프롬프트
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">업데이트:</span> 최신 교육법 및 가이드라인 반영
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">정확성:</span> 연속적 품질 관리 및 개선
                  </p>
                </div>
              </div>
            </div>

            {/* 중요 안내사항 */}
            <div className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                ⚠️ 중요 안내사항
              </h5>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                본 AI 생성 개별교육계획은 전문적인 분석을 바탕으로 작성되었으나, 
                <span className="font-medium"> 반드시 해당 학교의 특수교육교사 및 전문가의 검토와 승인을 받아 사용</span>하시기 바랍니다. 
                개별 학생의 특성과 학교 환경에 따라 추가적인 수정이 필요할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IEPView;