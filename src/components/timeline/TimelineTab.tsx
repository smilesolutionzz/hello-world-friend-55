import { useState } from "react";
import { Calendar, Clock, Users, Filter, Search, Share, Download, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TimelineActivity {
  id: string;
  family_id: string;
  member_id?: string;
  type: 'TEST' | 'REPORT' | 'NOTE' | 'CONSULT' | 'PAYMENT' | 'SYSTEM';
  title: string;
  summary?: string;
  score_overall?: number;
  tags: string[];
  files: Array<{url: string; type: 'image' | 'video' | 'pdf'; name: string}>;
  actor: {
    role: 'user' | 'expert' | 'system';
    id?: string;
    name?: string;
  };
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface FamilyMember {
  id: string;
  name: string;
  age_group: string;
  relation: string;
}

interface TimelineTabProps {
  familyId: string;
  members: FamilyMember[];
}

const TimelineTab = ({ familyId, members }: TimelineTabProps) => {
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<TimelineActivity | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePermission, setSharePermission] = useState<'read' | 'comment'>('read');
  const [shareExpireDays, setShareExpireDays] = useState(30);
  const [shareAgreed, setShareAgreed] = useState(false);
  const [anonymizeView, setAnonymizeView] = useState(false);
  
  const { toast } = useToast();

  // Mock data for development
  const mockActivities: TimelineActivity[] = [
    {
      id: "1",
      family_id: familyId,
      member_id: members[0]?.id,
      type: "TEST",
      title: "언어발달 3분 체크",
      summary: "언어 발달 수준을 빠르게 체크하여 현재 상태를 파악했습니다.",
      score_overall: 65,
      tags: ["언어", "영유아"],
      files: [],
      actor: { role: "user", name: "김엄마" },
      meta: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "2",
      family_id: familyId,
      type: "REPORT",
      title: "AI 즉시 리포팅 요약",
      summary: "종합적인 분석 결과입니다.\n• 언어 발달: 정상 범위\n• 사회성: 또래 대비 우수",
      files: [{ url: "/report.pdf", type: "pdf", name: "종합분석리포트.pdf" }],
      tags: ["AI분석", "종합리포트"],
      actor: { role: "system", name: "AI 분석 엔진" },
      meta: {},
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "3", 
      family_id: familyId,
      member_id: members[0]?.id,
      type: "CONSULT",
      title: "전문가 상담 예약 확정",
      summary: "8월 20일 오후 7시, Zoom을 통한 온라인 상담이 예정되어 있습니다.",
      tags: ["상담예약", "온라인"],
      files: [],
      actor: { role: "expert", name: "김상담사" },
      meta: { datetime: "2024-08-20T19:00:00", platform: "Zoom" },
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: "4",
      family_id: familyId,
      type: "NOTE",
      title: "오늘 놀이 관찰",
      summary: "공동 주의 반응이 3초 이내로 나타나며, 전반적으로 발달이 순조로워 보입니다.",
      tags: ["놀이관찰", "발달체크"],
      files: [{ url: "/observation.jpg", type: "image", name: "놀이모습.jpg" }],
      actor: { role: "user", name: "김엄마" },
      meta: {},
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: "5",
      family_id: familyId,
      type: "PAYMENT",
      title: "프리미엄 구독 결제 완료",
      summary: "월 구독료 29,900원이 정상적으로 결제되었습니다.",
      tags: ["결제", "프리미엄"],
      files: [],
      actor: { role: "system", name: "결제 시스템" },
      meta: { amount: 29900, method: "카드" },
      created_at: new Date(Date.now() - 345600000).toISOString(),
      updated_at: new Date(Date.now() - 345600000).toISOString()
    }
  ];

  const getTypeIcon = (type: TimelineActivity['type']) => {
    switch (type) {
      case 'TEST': return '🧪';
      case 'REPORT': return '📊';
      case 'NOTE': return '📝';
      case 'CONSULT': return '💬';
      case 'PAYMENT': return '💳';
      case 'SYSTEM': return '⚙️';
      default: return '📄';
    }
  };

  const getTypeColor = (type: TimelineActivity['type']) => {
    switch (type) {
      case 'TEST': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REPORT': return 'bg-green-100 text-green-800 border-green-200';
      case 'NOTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONSULT': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PAYMENT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'SYSTEM': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const groupActivitiesByDate = (activities: TimelineActivity[]) => {
    const groups: { [key: string]: TimelineActivity[] } = {
      '오늘': [],
      '이번 주': [],
      '이전': []
    };

    activities.forEach(activity => {
      const date = new Date(activity.created_at);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        groups['오늘'].push(activity);
      } else if (diffDays < 7) {
        groups['이번 주'].push(activity);
      } else {
        groups['이전'].push(activity);
      }
    });

    return groups;
  };

  const filteredActivities = mockActivities.filter(activity => {
    if (selectedType !== 'all' && activity.type !== selectedType) return false;
    if (selectedMember !== 'all' && activity.member_id !== selectedMember) return false;
    if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !activity.summary?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  const handleCreateShare = async () => {
    if (!shareAgreed) {
      toast({
        title: "동의 필요",
        description: "개인정보 처리 방침에 동의해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate share link logic here
      const shareId = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + shareExpireDays);
      
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "공유 링크 생성 완료",
        description: "링크가 클립보드에 복사되었습니다."
      });
      
      setShowShareModal(false);
      setShareAgreed(false);
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "공유 링크 생성에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const getMemberName = (memberId?: string) => {
    if (!memberId) return null;
    const member = members.find(m => m.id === memberId);
    if (!member) return null;
    
    if (anonymizeView) {
      return member.name.charAt(0) + '*'.repeat(member.name.length - 1);
    }
    return member.name;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">가족 타임라인</h2>
          <p className="text-muted-foreground">가족의 모든 활동 기록을 한눈에 확인하세요</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="anonymize" 
              checked={anonymizeView}
              onCheckedChange={(checked) => setAnonymizeView(checked === true)}
            />
            <Label htmlFor="anonymize" className="text-sm">익명화 보기</Label>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="제목이나 내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="활동 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="TEST">검사</SelectItem>
                <SelectItem value="REPORT">리포트</SelectItem>
                <SelectItem value="NOTE">관찰일지</SelectItem>
                <SelectItem value="CONSULT">상담</SelectItem>
                <SelectItem value="PAYMENT">결제</SelectItem>
                <SelectItem value="SYSTEM">시스템</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="구성원" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 구성원</SelectItem>
                {members.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {getMemberName(member.id) || member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              필터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Content */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([period, activities]) => {
          if (activities.length === 0) return null;
          
          return (
            <div key={period}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {period}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map(activity => (
                  <Card key={activity.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getTypeIcon(activity.type)}</span>
                          <Badge variant="outline" className={getTypeColor(activity.type)}>
                            {activity.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </span>
                      </div>
                      
                      <CardTitle className="text-base leading-snug">{activity.title}</CardTitle>
                      
                      {activity.member_id && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{getMemberName(activity.member_id)}</span>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      {activity.summary && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {activity.summary}
                        </p>
                      )}
                      
                      {activity.score_overall && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>종합 점수</span>
                            <span className="font-medium">{activity.score_overall}점</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${activity.score_overall}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {activity.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {activity.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{activity.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <span>작성자:</span>
                        <span>{activity.actor.name || activity.actor.role}</span>
                      </div>

                      {activity.files.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">첨부파일 {activity.files.length}개</p>
                          <div className="flex gap-1">
                            {activity.files.slice(0, 3).map((file, idx) => (
                              <div key={idx} className="w-8 h-8 bg-gray-100 rounded border text-xs flex items-center justify-center">
                                {file.type === 'pdf' ? '📄' : file.type === 'image' ? '🖼️' : '🎥'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs gap-1"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          <Eye className="h-3 w-3" />
                          자세히
                        </Button>
                        
                        {activity.files.some(f => f.type === 'pdf') && (
                          <Button size="sm" variant="outline" className="text-xs gap-1">
                            <Download className="h-3 w-3" />
                            PDF
                          </Button>
                        )}
                        
                        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-xs gap-1">
                              <Share className="h-3 w-3" />
                              공유
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>전문가 공유 링크 생성</DialogTitle>
                              <DialogDescription>
                                선택한 활동을 전문가와 안전하게 공유할 수 있습니다.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="permission">권한 설정</Label>
                                <Select value={sharePermission} onValueChange={(value: 'read' | 'comment') => setSharePermission(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="read">읽기 전용</SelectItem>
                                    <SelectItem value="comment">읽기 + 코멘트</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="expire">유효 기간</Label>
                                <Select value={shareExpireDays.toString()} onValueChange={(value) => setShareExpireDays(parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="7">7일</SelectItem>
                                    <SelectItem value="14">14일</SelectItem>
                                    <SelectItem value="30">30일</SelectItem>
                                    <SelectItem value="90">90일</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                                <p className="font-medium text-yellow-800 mb-1">⚠️ 개인정보 공유 안내</p>
                                <p className="text-yellow-700">
                                  이 링크에는 개인정보 및 민감정보가 포함될 수 있습니다. 
                                  신뢰할 수 있는 전문가에게만 공유하시고, 유효 기간이 
                                  만료되면 자동으로 접근이 차단됩니다.
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="agree" 
                                  checked={shareAgreed}
                                  onCheckedChange={(checked) => setShareAgreed(checked === true)}
                                />
                                <Label htmlFor="agree" className="text-sm">
                                  개인정보 공유에 동의하며, 위 내용을 확인했습니다.
                                </Label>
                              </div>
                              
                              <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setShowShareModal(false)} className="flex-1">
                                  취소
                                </Button>
                                <Button onClick={handleCreateShare} disabled={!shareAgreed} className="flex-1">
                                  공유 링크 생성
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getTypeIcon(selectedActivity.type)}</span>
                <Badge variant="outline" className={getTypeColor(selectedActivity.type)}>
                  {selectedActivity.type}
                </Badge>
              </div>
              <DialogTitle>{selectedActivity.title}</DialogTitle>
              <DialogDescription>
                {formatDate(selectedActivity.created_at)} • {selectedActivity.actor.name || selectedActivity.actor.role}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedActivity.member_id && (
                <div>
                  <Label className="text-sm font-medium">대상자</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getMemberName(selectedActivity.member_id)}
                  </p>
                </div>
              )}
              
              {selectedActivity.summary && (
                <div>
                  <Label className="text-sm font-medium">요약</Label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                    {selectedActivity.summary}
                  </p>
                </div>
              )}
              
              {selectedActivity.score_overall && (
                <div>
                  <Label className="text-sm font-medium">종합 점수</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>점수</span>
                      <span className="font-medium">{selectedActivity.score_overall}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full" 
                        style={{ width: `${selectedActivity.score_overall}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {selectedActivity.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">태그</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedActivity.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedActivity.files.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">첨부파일</Label>
                  <div className="mt-2 space-y-2">
                    {selectedActivity.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 border rounded">
                        <span className="text-xl">
                          {file.type === 'pdf' ? '📄' : file.type === 'image' ? '🖼️' : '🎥'}
                        </span>
                        <span className="text-sm">{file.name}</span>
                        <Button size="sm" variant="outline" className="ml-auto">
                          <Download className="h-3 w-3 mr-1" />
                          다운로드
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">활동 기록이 없습니다</h3>
            <p className="text-muted-foreground">
              검사나 상담을 진행하시면 여기에 기록이 표시됩니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimelineTab;