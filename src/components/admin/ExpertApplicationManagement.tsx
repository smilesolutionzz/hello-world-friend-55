import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  Star
} from 'lucide-react';

interface ExpertApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  address: string;
  specializations: string[];
  consultation_methods: string[];
  target_age_groups: string[];
  license_number: string;
  years_experience: number;
  certifications: string[];
  education_background: string[];
  work_experience: any;
  hourly_rate: number;
  bio: string;
  application_reason: string;
  application_status: string;
  terms_agreed: boolean;
  privacy_agreed: boolean;
  created_at: string;
  admin_notes: string;
}

export const ExpertApplicationManagement = () => {
  const [applications, setApplications] = useState<ExpertApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ExpertApplication | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "오류",
          description: "신청서를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('expert_applications')
        .update({ 
          application_status: status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application:', error);
        toast({
          title: "오류",
          description: "신청서 상태 업데이트 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "완료",
        description: `신청서가 ${status === 'approved' ? '승인' : '거절'}되었습니다.`,
      });

      fetchApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />승인</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />거절</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />대기중</Badge>;
    }
  };

  const pendingApplications = applications.filter(app => app.application_status === 'pending');
  const processedApplications = applications.filter(app => app.application_status !== 'pending');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">신청서를 불러오는 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            전문가 신청서 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                대기중 ({pendingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="processed">
                처리완료 ({processedApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  대기중인 신청서가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApplications.map((application) => (
                    <Card key={application.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{application.full_name}</h3>
                              {getStatusBadge(application.application_status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {application.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {application.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {application.years_experience}년 경력
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {application.specializations.slice(0, 3).map((spec, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                              {application.specializations.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{application.specializations.length - 3}개 더
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setSelectedApplication(application)}
                              variant="outline"
                              size="sm"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              상세보기
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="processed" className="space-y-4">
              {processedApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  처리된 신청서가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {processedApplications.map((application) => (
                    <Card key={application.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{application.full_name}</h3>
                              {getStatusBadge(application.application_status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(application.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {application.years_experience}년 경력
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => setSelectedApplication(application)}
                            variant="outline"
                            size="sm"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            상세보기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 상세보기 모달 */}
      {selectedApplication && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl max-h-[90vh] overflow-auto">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedApplication.full_name} - 신청서 상세</CardTitle>
                  <Button
                    onClick={() => setSelectedApplication(null)}
                    variant="outline"
                    size="sm"
                  >
                    닫기
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 기본 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">이름</label>
                    <p className="text-sm">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">이메일</label>
                    <p className="text-sm">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">전화번호</label>
                    <p className="text-sm">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">경력</label>
                    <p className="text-sm">{selectedApplication.years_experience}년</p>
                  </div>
                </div>

                {/* 전문분야 */}
                <div>
                  <label className="text-sm font-medium text-gray-600">전문분야</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedApplication.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>

                {/* 상담 방법 */}
                <div>
                  <label className="text-sm font-medium text-gray-600">상담 방법</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedApplication.consultation_methods.map((method, index) => (
                      <Badge key={index} variant="secondary">{method}</Badge>
                    ))}
                  </div>
                </div>

                {/* 자기소개 */}
                <div>
                  <label className="text-sm font-medium text-gray-600">자기소개</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedApplication.bio}</p>
                </div>

                {/* 지원동기 */}
                <div>
                  <label className="text-sm font-medium text-gray-600">지원동기</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">{selectedApplication.application_reason}</p>
                </div>

                {/* 승인/거절 버튼 */}
                {selectedApplication.application_status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      승인
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      거절
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
};