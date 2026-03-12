import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Brain } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ModernAIAnalysisProps {
  analysis: string;
  isLoading?: boolean;
  fallbackText?: string;
  delay?: number;
}

export const ModernAIAnalysis: React.FC<ModernAIAnalysisProps> = ({
  analysis,
  isLoading = false,
  fallbackText = '',
  delay = 0,
}) => {
  const { isEnglish } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 border-violet-200/50 dark:border-violet-700/50 shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgxNjhiNyIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        
        <CardHeader className="pb-3 relative">
          <CardTitle className="flex items-center gap-2.5 text-base md:text-lg">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-semibold">AI 전문가 분석</span>
              <p className="text-xs text-violet-600 dark:text-violet-400 font-normal mt-0.5">
                Powered by Advanced AI
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative pt-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Brain className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-violet-300 dark:border-violet-600 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  AI가 분석 중입니다...
                </p>
                <p className="text-xs text-violet-500 dark:text-violet-400 mt-1">
                  잠시만 기다려주세요
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-violet-100 dark:border-violet-800/30">
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-200">
                {analysis || fallbackText || '분석 결과가 없습니다.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModernAIAnalysis;
