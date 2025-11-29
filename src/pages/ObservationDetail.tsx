import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

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
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  const mediaUrls = observation.media_urls && Array.isArray(observation.media_urls) 
    ? observation.media_urls 
    : [];
  const images = mediaUrls.filter(url => typeof url === 'string' && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg')));
  const videos = mediaUrls.filter(url => typeof url === 'string' && (url.includes('.mp4') || url.includes('.mov')));

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/observation-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/observation?edit=${observation.id}`)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Title & Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">
              {observation.title || "제목 없음"}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(new Date(observation.created_at), "yyyy년 M월 d일 (E) HH:mm", { locale: ko })}
            </div>
          </CardHeader>
        </Card>

        {/* AI Quick Advice */}
        {observation.expert_advice && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                AI 전문가 조언
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{observation.expert_advice}</p>
              {observation.detailed_advice && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 p-0 h-auto"
                  onClick={() => setAdviceOpen(true)}
                >
                  상세 조언 보기 →
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Observation Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              관찰 내용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {observation.content}
            </p>
          </CardContent>
        </Card>

        {/* Media Gallery */}
        {(images.length > 0 || videos.length > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                첨부 미디어
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedMedia(url)}
                  >
                    <img
                      src={url}
                      alt={`관찰 이미지 ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
                {videos.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedMedia(url)}
                  >
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>가족에게 공유</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="message">메시지 (선택)</Label>
              <Textarea
                id="message"
                placeholder="함께 보면 좋을 것 같아서 공유합니다..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleShare} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detailed Advice Dialog */}
      <Dialog open={adviceOpen} onOpenChange={setAdviceOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              전문가 상세 조언
            </DialogTitle>
          </DialogHeader>
          <Separator className="my-4" />
          {renderDetailedAdvice()}
        </DialogContent>
      </Dialog>

      {/* Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-50"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="w-4 h-4" />
          </Button>
          {selectedMedia && (
            <div className="relative w-full">
              {selectedMedia.includes('.mp4') || selectedMedia.includes('.mov') ? (
                <video src={selectedMedia} controls className="w-full" />
              ) : (
                <img src={selectedMedia} alt="미디어" className="w-full" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
