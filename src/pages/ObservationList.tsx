import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Plus, Image, Video } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Observation {
  id: string;
  title: string;
  content: string;
  expert_advice: string | null;
  detailed_advice: string | null;
  media_urls: any;
  created_at: string;
}

export default function ObservationList() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchObservations();
  }, []);

  const fetchObservations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("observations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setObservations(data || []);
    } catch (error: any) {
      toast({
        title: "불러오기 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMediaCount = (observation: Observation) => {
    const urls = observation.media_urls;
    if (!urls || !Array.isArray(urls)) {
      return { images: 0, videos: 0 };
    }
    
    const images = urls.filter((url: any) => 
      typeof url === 'string' && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'))
    ).length;
    
    const videos = urls.filter((url: any) => 
      typeof url === 'string' && (url.includes('.mp4') || url.includes('.mov'))
    ).length;
    
    return { images, videos };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">관찰일지</h1>
          <Button onClick={() => navigate("/observation")} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            새 일지
          </Button>
        </div>

        {observations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">작성된 관찰일지가 없습니다</p>
              <Button onClick={() => navigate("/observation")}>
                첫 관찰일지 작성하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {observations.map((obs) => {
              const mediaCount = getMediaCount(obs);
              return (
                <Card
                  key={obs.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/observation/${obs.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg truncate">
                          {obs.title || "제목 없음"}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-xs md:text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          {format(new Date(obs.created_at), "yyyy년 M월 d일 (E)", { locale: ko })}
                        </div>
                      </div>
                      {obs.expert_advice && (
                        <div className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md whitespace-nowrap">
                          AI 조언 ✓
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {obs.content}
                    </p>
                    {(mediaCount.images > 0 || mediaCount.videos > 0) && (
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {mediaCount.images > 0 && (
                          <div className="flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            <span>{mediaCount.images}</span>
                          </div>
                        )}
                        {mediaCount.videos > 0 && (
                          <div className="flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>{mediaCount.videos}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
