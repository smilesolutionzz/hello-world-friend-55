import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Plus, Image, Video, Sparkles, Brain, ArrowRight, Loader2, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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

      {/* Hero Section */}
      <section className="py-6 md:py-8 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="relative inline-block mb-4">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent" style={{ fontFamily: "'Gowun Batang', serif" }}>
                📔 내 관찰일지
              </h1>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            </div>
            <p className="text-amber-700/70 dark:text-amber-300/70 mt-4" style={{ fontFamily: "'Gowun Batang', serif" }}>
              기록된 관찰일지를 확인하고 관리하세요
            </p>
          </motion.div>

          {/* Action Button */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <Button 
              onClick={() => navigate("/observation")} 
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 rounded-2xl px-6 py-3 h-auto font-medium"
              style={{ fontFamily: "'Gowun Batang', serif" }}
            >
              <Plus className="w-5 h-5 mr-2" />
              새 관찰일지 작성
            </Button>
          </motion.div>

          {/* Stats Summary */}
          {observations.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border-2 border-amber-200 dark:border-amber-700 shadow-sm">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  총 {observations.length}개의 기록
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 shadow-sm">
                <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  {observations.filter(o => o.expert_advice).length}개 AI 분석 완료
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 pb-12 relative z-10">
        <div className="container mx-auto max-w-4xl">
          {observations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-700 shadow-xl">
                <CardContent className="py-16 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mx-auto mb-6">
                    <ClipboardList className="w-12 h-12 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-3" style={{ fontFamily: "'Gowun Batang', serif" }}>
                    아직 작성된 관찰일지가 없습니다
                  </h3>
                  <p className="text-amber-600/70 dark:text-amber-400/70 mb-8 max-w-sm mx-auto">
                    첫 관찰일지를 작성하고 AI의 전문가 수준 분석을 받아보세요
                  </p>
                  <Button 
                    onClick={() => navigate("/observation")}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 rounded-xl px-8 py-3 h-auto"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    첫 관찰일지 작성하기
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {observations.map((obs, index) => {
                const mediaCount = getMediaCount(obs);
                return (
                  <motion.div
                    key={obs.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden"
                      onClick={() => navigate(`/observation/${obs.id}`)}
                    >
                      <CardContent className="p-5 md:p-6">
                        <div className="flex items-start gap-4">
                          {/* Date Badge */}
                          <div className="flex-shrink-0 hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-200 dark:border-amber-700">
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                              {format(new Date(obs.created_at), "MMM", { locale: ko })}
                            </span>
                            <span className="text-xl font-bold text-amber-800 dark:text-amber-200">
                              {format(new Date(obs.created_at), "d")}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 truncate" style={{ fontFamily: "'Gowun Batang', serif" }}>
                                {obs.title || "제목 없음"}
                              </h3>
                              {obs.expert_advice && (
                                <Badge className="flex-shrink-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs whitespace-nowrap">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI 분석 ✓
                                </Badge>
                              )}
                            </div>

                            {/* Mobile Date */}
                            <div className="flex items-center gap-2 text-xs text-amber-600/70 dark:text-amber-400/70 mb-3 md:hidden">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(obs.created_at), "yyyy년 M월 d일 (E)", { locale: ko })}
                            </div>

                            <p className="text-sm text-amber-700/60 dark:text-amber-300/60 line-clamp-2 mb-3">
                              {obs.content}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Desktop Date */}
                                <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-600/70 dark:text-amber-400/70">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(obs.created_at), "yyyy년 M월 d일 (E)", { locale: ko })}
                                </div>

                                {/* Media Count */}
                                {(mediaCount.images > 0 || mediaCount.videos > 0) && (
                                  <div className="flex gap-2 text-xs text-amber-600/70 dark:text-amber-400/70">
                                    {mediaCount.images > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100/50 dark:bg-amber-900/20 rounded-md">
                                        <Image className="w-3 h-3" />
                                        <span>{mediaCount.images}</span>
                                      </div>
                                    )}
                                    {mediaCount.videos > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100/50 dark:bg-amber-900/20 rounded-md">
                                        <Video className="w-3 h-3" />
                                        <span>{mediaCount.videos}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Arrow */}
                              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-300">
                                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:text-white transition-colors" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
