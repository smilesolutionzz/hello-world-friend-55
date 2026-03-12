import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ModernScoreCardProps {
  title: string;
  subtitle?: string;
  score: number;
  maxScore: number;
  percentage?: number;
  interpretation: string;
  level: 'excellent' | 'good' | 'average' | 'warning' | 'danger';
  icon: LucideIcon;
  delay?: number;
  compact?: boolean;
}

const levelStyles = {
  excellent: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    border: 'border-emerald-200/50 dark:border-emerald-800/50',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-500 hover:bg-emerald-600',
  },
  good: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    border: 'border-blue-200/50 dark:border-blue-800/50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-500 hover:bg-blue-600',
  },
  average: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
    border: 'border-amber-200/50 dark:border-amber-800/50',
    iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-500 hover:bg-amber-600',
  },
  warning: {
    bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30',
    border: 'border-orange-200/50 dark:border-orange-800/50',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-500',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-500 hover:bg-orange-600',
  },
  danger: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30',
    border: 'border-rose-200/50 dark:border-rose-800/50',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
    text: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-500 hover:bg-rose-600',
  },
};

export const ModernScoreCard: React.FC<ModernScoreCardProps> = ({
  title,
  subtitle,
  score,
  maxScore,
  percentage,
  interpretation,
  level,
  icon: Icon,
  delay = 0,
  compact = false,
}) => {
  const { isEnglish } = useLanguage();
  const styles = levelStyles[level];
  const displayPercentage = percentage ?? Math.round((score / maxScore) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`${styles.bg} ${styles.border} border shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
        <CardContent className={compact ? 'p-4' : 'p-5 md:p-6'}>
          <div className="flex items-start gap-4">
            <div className={`${styles.iconBg} p-2.5 md:p-3 rounded-xl text-white shrink-0 shadow-lg`}>
              <Icon className={compact ? 'w-5 h-5' : 'w-6 h-6 md:w-7 md:h-7'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className={`font-semibold text-slate-900 dark:text-white ${compact ? 'text-sm' : 'text-base md:text-lg'}`}>
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                  )}
                </div>
                <Badge className={`${styles.badge} text-white shrink-0`}>
                  {displayPercentage}%
                </Badge>
              </div>
              
              <div className="flex items-baseline gap-2 mt-2 mb-2.5">
                <span className={`font-bold text-slate-900 dark:text-white ${compact ? 'text-2xl' : 'text-3xl md:text-4xl'}`}>
                  {score}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  / {maxScore}점
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden mb-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayPercentage}%` }}
                  transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
                  className={`h-full ${styles.iconBg} rounded-full`}
                />
              </div>
              
              <p className={`${styles.text} font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                {interpretation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModernScoreCard;
