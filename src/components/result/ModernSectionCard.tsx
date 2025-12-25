import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ModernSectionCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  delay?: number;
  variant?: 'default' | 'highlight' | 'gradient';
  className?: string;
}

export const ModernSectionCard: React.FC<ModernSectionCardProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-primary',
  children,
  delay = 0,
  variant = 'default',
  className = '',
}) => {
  const variants = {
    default: 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-700/50',
    highlight: 'bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-primary/20',
    gradient: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 border-violet-200/50 dark:border-violet-800/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`${variants[variant]} border shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base md:text-lg">
            <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${iconColor}`}>
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-slate-900 dark:text-white font-semibold">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ModernSectionCard;
