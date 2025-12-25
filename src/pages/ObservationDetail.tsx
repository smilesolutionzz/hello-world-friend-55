import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import { motion } from "framer-motion";

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
  const [adviceOpen, setAdviceOpen] = useState(false);

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

  const renderDetailedAdvice = () => {
    if (!observation?.detailed_advice) return null;

    const sections = observation.detailed_advice.split(/(?=##\s)/g);
    
    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          const lines = section.trim().split('\n');
          const title = lines[0]?.replace(/^##\s*/, '').trim();
          const content = lines.slice(1).join('\n').trim();

          if (!title || title.startsWith('---')) return null;

          return (
            <Card key={index} className="bg-white/90 dark:bg-slate-800/90 border-2 border-amber-200 dark:border-amber-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base text-amber-900 dark:text-amber-100">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap leading-relaxed text-amber-800/80 dark:text-amber-200/80">
                  {content}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading || !observation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
            <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <p className="text-amber-700 dark:text-amber-300" style={{ fontFamily: "'Gowun Batang', serif" }}>로딩 중...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* 일기장 배경 패턴 */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 31px,
              #d4a574 31px,
              #d4a574 32px
            )
          `,
          backgroundSize: '100% 32px'
        }} />
      </div>

      <UnifiedNavigation />
      <div className="h-20" />

      <div className="container mx-auto max-w-4xl px-4 py-6 md:py-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/observation-list")}
            className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span style={{ fontFamily: "'Gowun Batang', serif" }}>목록으로</span>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/observation?edit=${observation.id}`)}
              className="border-2 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShareDialogOpen(true)}
              className="border-2 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Title & Date Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-700 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl md:text-2xl text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Gowun Batang', serif" }}>
                      {observation.title || "제목 없음"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-amber-600/70 dark:text-amber-400/70 mt-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(observation.created_at), "yyyy년 M월 d일 (E) HH:mm", { locale: ko })}
                    </div>
                  </div>
                  {observation.expert_advice && (
                    <Badge className="flex-shrink-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI 분석 완료
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* AI Quick Advice */}
          {observation.expert_advice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    AI 전문가 조언
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-emerald-800/80 dark:text-emerald-200/80">
                    {observation.expert_advice}
                  </p>
                  {observation.detailed_advice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 p-0 h-auto text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
                      onClick={() => setAdviceOpen(true)}
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      상세 조언 보기 →
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Observation Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-700 shadow-lg rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  관찰 내용
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-amber-800/80 dark:text-amber-200/80">
                  {observation.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media Gallery */}
          {(images.length > 0 || videos.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-700 shadow-lg rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-white" />
                    </div>
                    첨부 미디어
                    <Badge variant="secondary" className="ml-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                      {images.length + videos.length}개
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all"
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
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all"
                        onClick={() => setSelectedMedia(url)}
                      >
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Video className="w-6 h-6 text-amber-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-900 dark:text-amber-100">정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className="text-amber-700/70 dark:text-amber-300/70">
              이 작업은 되돌릴 수 없습니다. 관찰일지와 첨부된 모든 미디어가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-amber-200 dark:border-amber-700">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-700">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-amber-100">가족에게 공유</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-amber-800 dark:text-amber-200">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="border-amber-200 dark:border-amber-700 focus:border-amber-400 dark:focus:border-amber-500"
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-amber-800 dark:text-amber-200">메시지 (선택)</Label>
              <Textarea
                id="message"
                placeholder="함께 보면 좋을 것 같아서 공유합니다..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={3}
                className="border-amber-200 dark:border-amber-700 focus:border-amber-400 dark:focus:border-amber-500"
              />
            </div>
            <Button 
              onClick={handleShare} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detailed Advice Dialog */}
      <Dialog open={adviceOpen} onOpenChange={setAdviceOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 border-2 border-emerald-200 dark:border-emerald-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              전문가 상세 조언
            </DialogTitle>
          </DialogHeader>
          <Separator className="my-4 bg-emerald-200 dark:bg-emerald-700" />
          {renderDetailedAdvice()}
        </DialogContent>
      </Dialog>

      {/* Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 bg-black/95 border-none">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-50 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="w-5 h-5" />
          </Button>
          {selectedMedia && (
            <div className="relative w-full min-h-[50vh] max-h-[85vh] flex items-center justify-center p-4 md:p-6">
              {selectedMedia.includes('.mp4') || selectedMedia.includes('.mov') ? (
                <video 
                  src={selectedMedia} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-[80vh] rounded-lg"
                />
              ) : (
                <img 
                  src={selectedMedia} 
                  alt="미디어 미리보기" 
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
