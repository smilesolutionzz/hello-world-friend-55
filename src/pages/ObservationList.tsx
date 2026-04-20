import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Plus, 
  Sparkles, 
  Loader2, 
  BookOpen,
  ChevronRight,
  ArrowLeft,
  PenLine,
  Feather
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";
import ReportHubReadyBanner from "@/components/report/ReportHubReadyBanner";

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
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-background flex items-center justify-center">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto shadow-lg">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
          <p className="text-amber-700 font-medium">일지를 불러오는 중...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-amber-50/95 to-amber-50/80 backdrop-blur-md border-b border-amber-200/50">
        <div className="container mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="shrink-0 hover:bg-amber-100/50 text-amber-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md">
                  <Feather className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-amber-900">관찰일지</h1>
                  <p className="text-xs text-amber-600/80">아이의 성장 기록</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate("/observation")}
              size="sm"
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md border-0"
            >
              <Plus className="w-4 h-4" />
              새 기록
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <ReportHubReadyBanner />
        {/* 통계 */}
        {observations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-amber-200/50 shadow-sm"
          >
            <div className="flex-1 text-center border-r border-amber-200/50">
              <p className="text-2xl font-bold text-amber-900">{observations.length}</p>
              <p className="text-xs text-amber-600">전체 기록</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-orange-600">{observations.filter(o => o.expert_advice).length}</p>
              <p className="text-xs text-amber-600">AI 분석</p>
            </div>
          </motion.div>
        )}

        {/* 빈 상태 */}
        {observations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">
              첫 번째 기록을 남겨보세요
            </h3>
            <p className="text-amber-600 mb-8 max-w-xs mx-auto leading-relaxed">
              아이의 소중한 순간을 기록하고<br/>
              AI의 전문적인 분석을 받아보세요
            </p>
            <Button 
              onClick={() => navigate("/observation")} 
              size="lg"
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg border-0 rounded-xl"
            >
              <PenLine className="w-5 h-5" />
              첫 기록 작성하기
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {observations.map((obs, index) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/observation/${obs.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-amber-200/50 shadow-sm hover:shadow-md hover:bg-white/90 transition-all duration-300">
                  {/* AI 분석 배지 */}
                  {obs.expert_advice && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* 날짜 */}
                    <div className="shrink-0 w-14 text-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 flex flex-col items-center justify-center border border-amber-200/50">
                        <span className="text-xs text-amber-500 font-medium uppercase">
                          {format(new Date(obs.created_at), "MMM", { locale: ko })}
                        </span>
                        <span className="text-xl font-bold text-amber-800">
                          {format(new Date(obs.created_at), "d")}
                        </span>
                      </div>
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-amber-900 mb-1 truncate">
                        {obs.title || "제목 없음"}
                      </h3>
                      <p className="text-sm text-amber-700/70 line-clamp-2 leading-relaxed mb-2">
                        {obs.content}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(obs.created_at), "yyyy년 M월 d일 (E)", { locale: ko })}
                      </div>
                    </div>

                    {/* 화살표 */}
                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}