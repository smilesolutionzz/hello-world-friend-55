import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';

interface ModernDisclaimerCardProps {
  variant?: 'info' | 'warning' | 'tip';
  title?: string;
  children: React.ReactNode;
  delay?: number;
}

const variantStyles = {
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    border: 'border-blue-200/50 dark:border-blue-800/50',
    icon: Info,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800 dark:text-blue-300',
    textColor: 'text-blue-700 dark:text-blue-200',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
    border: 'border-amber-200/50 dark:border-amber-800/50',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800 dark:text-amber-300',
    textColor: 'text-amber-700 dark:text-amber-200',
  },
  tip: {
    bg: 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    border: 'border-emerald-200/50 dark:border-emerald-800/50',
    icon: Lightbulb,
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
    textColor: 'text-emerald-700 dark:text-emerald-200',
  },
};

export const ModernDisclaimerCard: React.FC<ModernDisclaimerCardProps> = ({
  variant = 'info',
  title,
  children,
  delay = 0,
}) => {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`${styles.bg} ${styles.border} border`}>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg bg-white/50 dark:bg-slate-800/50 ${styles.iconColor} shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={`font-semibold text-sm mb-1 ${styles.titleColor}`}>
                  {title}
                </h4>
              )}
              <div className={`text-xs md:text-sm leading-relaxed ${styles.textColor}`}>
                {children}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModernDisclaimerCard;
