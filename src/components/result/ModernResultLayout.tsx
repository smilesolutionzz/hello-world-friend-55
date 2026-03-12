import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Copy, Share2, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

interface ModernResultLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onBack: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  isDownloading?: boolean;
  className?: string;
}

export const ModernResultLayout: React.FC<ModernResultLayoutProps> = ({
  children,
  title,
  subtitle,
  icon,
  onBack,
  onCopy,
  onDownload,
  onShare,
  isDownloading = false,
  className = '',
}) => {
  const { isEnglish } = useLanguage();
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 ${className}`}>
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {/* 헤더 */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 -mx-4 px-4 py-3 mb-6 md:relative md:bg-transparent md:border-0 md:backdrop-blur-none"
        >
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="h-9 px-2 md:px-4 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-sm font-medium">뒤로</span>
            </Button>
            
            <div className="flex items-center gap-1.5 md:gap-2">
              {onCopy && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onCopy} 
                  className="h-9 px-2 md:px-3 border-slate-200 dark:border-slate-700"
                >
                  <Copy className="w-4 h-4 md:mr-1.5" />
                  <span className="hidden md:inline">복사</span>
                </Button>
              )}
              {onDownload && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onDownload} 
                  disabled={isDownloading} 
                  className="h-9 px-2 md:px-3 bg-gradient-to-r from-primary to-primary/90"
                >
                  <FileText className={`w-4 h-4 md:mr-1.5 ${isDownloading ? 'animate-pulse' : ''}`} />
                  <span className="hidden md:inline">{isDownloading ? '저장 중...' : '저장'}</span>
                </Button>
              )}
              {onShare && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onShare} 
                  className="h-9 px-2 md:px-3 border-slate-200 dark:border-slate-700"
                >
                  <Share2 className="w-4 h-4 md:mr-1.5" />
                  <span className="hidden md:inline">공유</span>
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-6 md:text-center">
            <div className="flex items-center gap-2.5 md:justify-center">
              {icon && <div className="text-primary">{icon}</div>}
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                {subtitle}
              </p>
            )}
          </div>
        </motion.header>

        {/* 컨텐츠 */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModernResultLayout;
