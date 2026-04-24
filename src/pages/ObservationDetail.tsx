import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ReportHubCTA from "@/components/report/ReportHubCTA";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Calendar,
  Lightbulb,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  Send,
  Sparkles,
  Brain,
  Loader2,
  MoreHorizontal,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HighlightedObservationContent from "@/components/observation/HighlightedObservationContent";

interface Observation {
  id: string;
  title: string;
  content: string;
  expert_advice: string | null;
  detailed_advice: string | null;
  media_urls: any;
  created_at: string;
  user_id: string;
}

export default function ObservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [observation, setObservation] = useState<Observation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showDetailedAdvice, setShowDetailedAdvice] = useState(false);

  useEffect(() => {
    fetchObservation();
  }, [id]);

  const fetchObservation = async () => {
    try {
      const { data, error } = await supabase
        .from("observations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setObservation(data);
    } catch (error: any) {
      toast({
        title: "불러오기 실패",
        description: error.message,
        variant: "destructive",
      });
      navigate("/observation-list");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("observations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "관찰일지가 삭제되었습니다.",
      });
      navigate("/observation-list");
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!shareEmail || !observation) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

      const { error } = await supabase
        .from("observation_shares")
        .insert({
          observation_id: observation.id,
          shared_by: user.id,
          shared_with_email: shareEmail,
          share_message: shareMessage,
        });

      if (error) throw error;

      toast({
        title: "공유 완료",
        description: `${shareEmail}에게 관찰일지를 공유했습니다.`,
      });
      setShareDialogOpen(false);
      setShareEmail("");
      setShareMessage("");
    } catch (error: any) {
      toast({
        title: "공유 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || !observation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  const mediaUrls = observation.media_urls && Array.isArray(observation.media_urls) 
    ? observation.media_urls 
    : [];
  const images = mediaUrls.filter(url => typeof url === 'string' && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg')));
  const videos = mediaUrls.filter(url => typeof url === 'string' && (url.includes('.mp4') || url.includes('.mov')));

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 네비게이션 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/observation-list")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              목록
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/observation?edit=${observation.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* 제목 및 날짜 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3 mb-2">
            {observation.expert_advice && (
              <Badge variant="secondary" className="gap-1 shrink-0">
                <Sparkles className="w-3 h-3" />
                AI 분석 완료
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {observation.title || "제목 없음"}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(observation.created_at), "yyyy년 M월 d일 (E) HH:mm", { locale: ko })}
          </div>
        </motion.div>

        {/* AI 전문가 리포트 */}
        {(observation.expert_advice || observation.detailed_advice) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold">AI 발달 분석 리포트</span>
                    <p className="text-xs text-muted-foreground font-normal">전문가 수준의 심층 분석</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI 분석
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 요약 조언 */}
                {observation.expert_advice && (
                  <div className="p-4 bg-white/60 dark:bg-background/40 rounded-xl border border-amber-200/30 dark:border-amber-700/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-sm">핵심 요약</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {observation.expert_advice}
                    </p>
                  </div>
                )}
                
                {/* 상세 리포트 - 기본적으로 펼침 */}
                {observation.detailed_advice && (
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between bg-white/40 dark:bg-background/20 hover:bg-white/60 dark:hover:bg-background/30"
                      onClick={() => setShowDetailedAdvice(!showDetailedAdvice)}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <FileText className="w-4 h-4 text-amber-600" />
                        상세 분석 리포트 {showDetailedAdvice ? '접기' : '펼치기'}
                      </span>
                      {showDetailedAdvice ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <AnimatePresence>
                      {showDetailedAdvice && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          {observation.detailed_advice.split(/(?=###?\s)/g).map((section, index) => {
                            const lines = section.trim().split('\n');
                            const titleLine = lines[0]?.replace(/^###?\s*\**/, '').replace(/\*+$/, '').trim();
                            const content = lines.slice(1).join('\n').trim();
                            
                            if (!titleLine || titleLine.startsWith('---') || titleLine.length < 2) return null;
                            
                            return (
                              <motion.div 
                                key={index} 
                                className="p-4 bg-white/80 dark:bg-background/60 rounded-xl border border-amber-100 dark:border-amber-800/30"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  {titleLine}
                                </h4>
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed pl-8">
                                  {content.split('\n').map((line, lineIndex) => {
                                    // 리스트 아이템 스타일링
                                    if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                                      return (
                                        <p key={lineIndex} className="flex gap-2 mb-1">
                                          <span className="text-amber-500">•</span>
                                          <span>{line.replace(/^[\s*-]+/, '')}</span>
                                        </p>
                                      );
                                    }
                                    return <p key={lineIndex} className="mb-1">{line}</p>;
                                  })}
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 관찰 내용 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                관찰 내용
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HighlightedObservationContent
                content={observation.content}
                expertAdvice={observation.expert_advice}
                detailedAdvice={observation.detailed_advice}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* 미디어 갤러리 */}
        {(images.length > 0 || videos.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  첨부 미디어
                  <Badge variant="secondary" className="ml-auto">
                    {images.length + videos.length}개
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border hover:border-primary/50 transition-colors"
                      onClick={() => setSelectedMedia(url)}
                    >
                      <img
                        src={url}
                        alt={`관찰 이미지 ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                  {videos.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border hover:border-primary/50 transition-colors"
                      onClick={() => setSelectedMedia(url)}
                    >
                      <video src={url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                          <Video className="w-5 h-5 text-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 🎯 리포트 허브 통일 CTA */}
        <div className="mt-8">
          <ReportHubCTA originLabel="이 관찰일지" sources={['observations', 'tests']} />
        </div>
      </main>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 관찰일지와 첨부된 모든 미디어가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 공유 다이얼로그 */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관찰일지 공유</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shareEmail">받는 사람 이메일</Label>
              <Input
                id="shareEmail"
                type="email"
                placeholder="example@email.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareMessage">메시지 (선택)</Label>
              <Textarea
                id="shareMessage"
                placeholder="함께 전달할 메시지를 입력하세요"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleShare} disabled={!shareEmail}>
              <Send className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 미디어 뷰어 */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="w-5 h-5" />
          </Button>
          {selectedMedia && (
            selectedMedia.includes('.mp4') || selectedMedia.includes('.mov') ? (
              <video src={selectedMedia} controls className="w-full" autoPlay />
            ) : (
              <img src={selectedMedia} alt="미디어" className="w-full" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
