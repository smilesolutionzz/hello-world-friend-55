import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, Clock, MessageSquare, Eye, Download, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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

interface ShareData {
  id: string;
  share_id: string;
  family_id: string;
  member_id?: string;
  permission: 'read' | 'comment';
  expires_at: string;
  is_active: boolean;
}

const ShareView = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<TimelineActivity | null>(null);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const mockShareData: ShareData = {
    id: "share-1",
    share_id: shareId || "",
    family_id: "family-1",
    permission: "comment",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  };

  const mockActivities: TimelineActivity[] = [
    {
      id: "1",
      family_id: "family-1",
      member_id: "child-1",
      type: "TEST",
      title: isEnglish ? "Language Development 3-min Check" : "언어발달 3분 체크",
      summary: isEnglish ? "Quick check on language development level to assess current status." : "언어 발달 수준을 빠르게 체크하여 현재 상태를 파악했습니다.",
      score_overall: 65,
      tags: isEnglish ? ["Language", "Infant"] : ["언어", "영유아"],
      files: [],
      actor: { role: "user", name: isEnglish ? "K. Kim" : "김**" },
      meta: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "2",
      family_id: "family-1",
      type: "REPORT",
      title: isEnglish ? "AI Instant Report Summary" : "AI 즉시 리포팅 요약",
      summary: isEnglish ? "Comprehensive analysis results.\n• Language development: Normal range\n• Social skills: Above peers" : "종합적인 분석 결과입니다.\n• 언어 발달: 정상 범위\n• 사회성: 또래 대비 우수",
      files: [{ url: "/report.pdf", type: "pdf", name: isEnglish ? "ComprehensiveReport.pdf" : "종합분석리포트.pdf" }],
      tags: isEnglish ? ["AI Analysis", "Report"] : ["AI분석", "종합리포트"],
      actor: { role: "system", name: isEnglish ? "AI Analysis Engine" : "AI 분석 엔진" },
      meta: {},
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  useEffect(() => {
    if (shareId) {
      setShareData(mockShareData);
    }
  }, [shareId]);

  const handlePinSubmit = async () => {
    if (pinCode.length !== 6) {
      toast({
        title: isEnglish ? "Invalid PIN" : "잘못된 PIN 코드",
        description: isEnglish ? "Please enter a 6-digit PIN code." : "6자리 PIN 코드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (pinCode === "123456") {
        setIsAuthorized(true);
        setActivities(mockActivities);
        
        await logAccess('view');
        
        toast({
          title: isEnglish ? "Access Granted" : "접근 승인",
          description: isEnglish ? "You can now access the timeline." : "타임라인에 접근할 수 있습니다."
        });
      } else {
        toast({
          title: isEnglish ? "Access Denied" : "접근 거부",
          description: isEnglish ? "Invalid PIN code." : "올바르지 않은 PIN 코드입니다.",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: isEnglish ? "Error" : "오류 발생",
        description: isEnglish ? "An error occurred during verification." : "접근 확인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const logAccess = async (action: string) => {
    console.log('Logging access:', { action, shareId, timestamp: new Date() });
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast({
        title: isEnglish ? "Comment Required" : "코멘트 입력 필요",
        description: isEnglish ? "Please enter a comment." : "코멘트를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingComment(true);
    try {
      await logAccess('comment');
      
      toast({
        title: isEnglish ? "Comment Saved" : "코멘트 저장됨",
        description: isEnglish ? "Expert comment will be delivered to the family." : "전문가 코멘트가 가족에게 전달됩니다."
      });
      
      setComment("");
      setSelectedActivity(null);
    } catch {
      toast({
        title: isEnglish ? "Error" : "오류 발생",
        description: isEnglish ? "Failed to save comment." : "코멘트 저장에 실패했습니다.",
        variant: "destructive"
      });
    }
    setSubmittingComment(false);
  };

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
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = shareData && new Date() > new Date(shareData.expires_at);

  if (!shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{isEnglish ? 'Invalid Link' : '유효하지 않은 링크'}</h3>
            <p className="text-muted-foreground">
              {isEnglish ? 'This share link was not found or has expired.' : '공유 링크를 찾을 수 없거나 만료되었습니다.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{isEnglish ? 'Link Expired' : '링크 만료'}</h3>
            <p className="text-muted-foreground">
              {isEnglish ? 'This share link has expired. Please request a new link.' : '이 공유 링크는 만료되었습니다. 새로운 링크를 요청해주세요.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>{isEnglish ? 'Expert Access Verification' : '전문가 접근 인증'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="text-blue-800 font-medium mb-1">💡 {isEnglish ? 'Secure Access' : '안전한 접근'}</p>
              <p className="text-blue-700">
                {isEnglish ? 'PIN code verification is required to protect patient privacy.' : '환자 개인정보 보호를 위해 PIN 코드 인증이 필요합니다.'}
              </p>
            </div>
            
            <div>
              <Label htmlFor="pin">{isEnglish ? '6-digit PIN Code' : '6자리 PIN 코드'}</Label>
              <Input
                id="pin"
                type="text"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button 
              onClick={handlePinSubmit} 
              disabled={loading || pinCode.length !== 6}
              className="w-full"
            >
              {loading ? (isEnglish ? "Verifying..." : "확인 중...") : (isEnglish ? "Access" : "접근하기")}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              {isEnglish ? 'Expires:' : '만료일:'} {formatDate(shareData.expires_at)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-amber-50 border-b border-amber-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <p className="text-amber-800 text-sm">
            <strong>{isEnglish ? 'Coaching Reference:' : '코칭 참고 자료:'}</strong> {isEnglish ? 'This is a developmental coaching and decision-support reference. It does not replace medical diagnosis or treatment.' : '본 자료는 발달 코칭 및 의사결정 보조를 위한 참고용 분석이며, 의료 진단·치료를 대체하지 않습니다.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{isEnglish ? 'Family Timeline - Expert View' : '가족 타임라인 - 전문가 뷰'}</h1>
            <Badge variant="outline" className="text-sm">
              {shareData.permission === 'read' ? (isEnglish ? 'Read Only' : '읽기 전용') : (isEnglish ? 'Read + Comment' : '읽기 + 코멘트')}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>• {isEnglish ? `${activities.length} activities` : `총 ${activities.length}개 활동`}</span>
            <span>• {isEnglish ? 'Expires:' : '만료:'} {formatDate(shareData.expires_at)}</span>
          </div>
        </div>

        {/* Activities */}
        <div className="space-y-4">
          {activities.map(activity => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(activity.type)}</span>
                    <div>
                      <Badge variant="outline" className={getTypeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                      <h3 className="font-medium mt-1">{activity.title}</h3>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.created_at)}
                  </span>
                </div>
                
                {activity.member_id && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                    <Users className="h-3 w-3" />
                    <span>{isEnglish ? 'Subject: Anonymized' : '대상자: 익명화됨'}</span>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {activity.summary && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {activity.summary}
                  </p>
                )}
                
                {activity.score_overall && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{isEnglish ? 'Overall Score' : '종합 점수'}</span>
                      <span className="font-medium">{activity.score_overall}{isEnglish ? '' : '점'}</span>
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
                    {activity.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {activity.files.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">{isEnglish ? `${activity.files.length} attachments` : `첨부파일 ${activity.files.length}개`}</p>
                    <div className="flex gap-2">
                      {activity.files.map((file, idx) => (
                        <Button key={idx} size="sm" variant="outline" className="text-xs gap-1">
                          <Download className="h-3 w-3" />
                          {file.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs gap-1"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <Eye className="h-3 w-3" />
                    {isEnglish ? 'View Details' : '자세히 보기'}
                  </Button>
                  
                  {shareData.permission === 'comment' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs gap-1"
                      onClick={() => setSelectedActivity(activity)}
                    >
                      <MessageSquare className="h-3 w-3" />
                      {isEnglish ? 'Expert Comment' : '전문가 코멘트'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activities.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{isEnglish ? 'No Activity Records' : '활동 기록이 없습니다'}</h3>
              <p className="text-muted-foreground">
                {isEnglish ? 'No shared activity records found.' : '공유된 활동 기록이 없습니다.'}
              </p>
            </CardContent>
          </Card>
        )}
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
              {selectedActivity.summary && (
                <div>
                  <Label className="text-sm font-medium">{isEnglish ? 'Summary' : '요약'}</Label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                    {selectedActivity.summary}
                  </p>
                </div>
              )}
              
              {selectedActivity.score_overall && (
                <div>
                  <Label className="text-sm font-medium">{isEnglish ? 'Overall Score' : '종합 점수'}</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{isEnglish ? 'Score' : '점수'}</span>
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
              
              {shareData.permission === 'comment' && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">{isEnglish ? 'Expert Comment' : '전문가 코멘트'}</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isEnglish ? "Write your expert opinion on this activity..." : "이 활동에 대한 전문가 의견을 작성해주세요..."}
                    className="mt-2"
                    rows={4}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedActivity(null)}
                      className="flex-1"
                    >
                      {isEnglish ? 'Cancel' : '취소'}
                    </Button>
                    <Button 
                      onClick={handleSubmitComment}
                      disabled={submittingComment || !comment.trim()}
                      className="flex-1"
                    >
                      {submittingComment ? (isEnglish ? "Saving..." : "저장 중...") : (isEnglish ? "Save Comment" : "코멘트 저장")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ShareView;
