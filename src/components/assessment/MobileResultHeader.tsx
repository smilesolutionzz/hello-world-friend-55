import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslation } from '@/i18n/useTranslation';

interface MobileResultHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  isDownloading?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export const MobileResultHeader = ({
  title,
  subtitle,
  onBack,
  onDownload,
  onShare,
  isDownloading,
  gradientFrom = "from-primary/10",
  gradientTo = "to-primary/5"
}: MobileResultHeaderProps) => {
  const { isEnglish } = useLanguage();
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-0 z-10 bg-gradient-to-r ${gradientFrom} ${gradientTo} backdrop-blur-lg border-b border-border/50 -mx-4 px-4 py-3 mb-4 md:relative md:mx-0 md:px-0 md:py-0 md:bg-transparent md:border-0 md:mb-6`}
    >
      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="h-8 px-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-xs">{isEnglish ? 'Back' : '뒤로'}</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {onShare && (
              <Button variant="ghost" size="sm" onClick={onShare} className="h-8 w-8 p-0">
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            {onDownload && (
              <Button variant="ghost" size="sm" onClick={onDownload} disabled={isDownloading} className="h-8 w-8 p-0">
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        
        <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{subtitle}</p>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {isEnglish ? 'Back' : '뒤로가기'}
        </Button>
        
        <div className="text-center flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent whitespace-nowrap">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 whitespace-nowrap">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onShare && (
            <Button variant="outline" onClick={onShare} className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              {isEnglish ? 'Share' : '공유'}
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" onClick={onDownload} disabled={isDownloading} className="flex items-center gap-2">
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
              PDF
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
