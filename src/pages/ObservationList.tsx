import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  FileText, 
  Plus, 
  Sparkles, 
  Brain, 
  ArrowRight, 
  Loader2, 
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Home
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";

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
        navigate("/auth");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 네비게이션 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  AI 관찰일지
                </h1>
              </div>
            </div>
            <Button
              onClick={() => navigate("/observation")}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">새 일지</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-6">
        {/* 통계 요약 */}
        {observations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{observations.length}</p>
                  <p className="text-xs text-muted-foreground">총 기록</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{observations.filter(o => o.expert_advice).length}</p>
                  <p className="text-xs text-muted-foreground">AI 분석</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 관찰일지 목록 */}
        {observations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  아직 작성된 관찰일지가 없습니다
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  첫 관찰일지를 작성하고 AI의 전문가 수준 분석을 받아보세요
                </p>
                <Button onClick={() => navigate("/observation")} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  첫 관찰일지 작성하기
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {observations.map((obs, index) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                  onClick={() => navigate(`/observation/${obs.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* 날짜 */}
                      <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-muted text-center shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(obs.created_at), "MMM", { locale: ko })}
                        </span>
                        <span className="text-lg font-bold">
                          {format(new Date(obs.created_at), "d")}
                        </span>
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold truncate">
                            {obs.title || "제목 없음"}
                          </h3>
                          {obs.expert_advice && (
                            <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </Badge>
                          )}
                        </div>

                        {/* 모바일 날짜 */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 sm:hidden">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(obs.created_at), "M월 d일 (E)", { locale: ko })}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {obs.content}
                        </p>

                        {/* PC 날짜 */}
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(obs.created_at), "yyyy년 M월 d일 (E)", { locale: ko })}
                        </div>
                      </div>

                      {/* 화살표 */}
                      <div className="shrink-0 self-center">
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
