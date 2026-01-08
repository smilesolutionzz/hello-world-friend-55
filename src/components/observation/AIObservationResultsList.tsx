import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Mic, 
  FileText, 
  Trash2, 
  Eye, 
  Calendar,
  Brain,
  Baby,
  UserRound,
  Users,
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAIObservationResults, 
  AIObservationResult,
  getAnalysisTypeLabel,
  getInputTypeLabel,
  getRiskLevelConfig
} from '@/hooks/useAIObservationResults';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AIObservationResultsListProps {
  onViewResult?: (result: AIObservationResult) => void;
}

export default function AIObservationResultsList({ onViewResult }: AIObservationResultsListProps) {
  const { results, loading, deleteResult } = useAIObservationResults();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Mic;
      default: return FileText;
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'child_behavior': return Baby;
      case 'language_delay': return Mic;
      case 'autism_screening': return Brain;
      case 'adult_psychology': return UserRound;
      case 'elderly_cognitive': return Users;
      case 'motor_function': return Activity;
      default: return Brain;
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteResult(id);
    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="text-amber-600 dark:text-amber-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 border-2 border-amber-200 dark:border-amber-700">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                저장된 분석 결과가 없습니다
              </h3>
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70 mt-1">
                영상, 음성, 텍스트 분석을 진행하면 여기에 저장됩니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Gowun Batang', serif" }}>
          📊 AI 분석 결과 목록
        </h2>
        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300">
          총 {results.length}건
        </Badge>
      </div>

      <AnimatePresence>
        {results.map((result, index) => {
          const InputIcon = getInputTypeIcon(result.input_type);
          const AnalysisIcon = getAnalysisTypeIcon(result.analysis_type);
          const riskConfig = getRiskLevelConfig(result.risk_level);

          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white/90 dark:bg-slate-800/90 border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all hover:shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg">
                        <AnalysisIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-amber-900 dark:text-amber-100 truncate">
                            {result.title || getAnalysisTypeLabel(result.analysis_type)}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <InputIcon className="w-3 h-3" />
                              {getInputTypeLabel(result.input_type)}
                            </Badge>
                            <Badge className={`text-xs ${riskConfig.bg} ${riskConfig.text}`}>
                              {riskConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {result.input_context && (
                        <p className="text-sm text-amber-700/70 dark:text-amber-300/70 mt-2 line-clamp-2">
                          {result.input_context}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-xs text-amber-600/60 dark:text-amber-400/60">
                          <Calendar className="w-3 h-3" />
                          {formatDate(result.created_at)}
                        </div>

                        <div className="flex items-center gap-2">
                          {onViewResult && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewResult(result)}
                              className="h-8 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              보기
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                disabled={deletingId === result.id}
                              >
                                {deletingId === result.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>분석 결과 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 분석 결과를 삭제하시겠습니까? 삭제된 결과는 복구할 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(result.id)}
                                  className="bg-rose-600 hover:bg-rose-700"
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
