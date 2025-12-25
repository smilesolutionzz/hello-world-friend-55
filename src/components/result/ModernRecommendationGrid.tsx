import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Recommendation {
  icon: LucideIcon;
  title: string;
  items: string[];
  color: 'pink' | 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';
}

interface ModernRecommendationGridProps {
  recommendations: Recommendation[];
  delay?: number;
}

const colorStyles = {
  pink: {
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30',
    iconBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    iconColor: 'text-pink-500',
    titleColor: 'text-pink-700 dark:text-pink-300',
    bullet: 'text-pink-400',
  },
  violet: {
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    iconColor: 'text-violet-500',
    titleColor: 'text-violet-700 dark:text-violet-300',
    bullet: 'text-violet-400',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-700 dark:text-blue-300',
    bullet: 'text-blue-400',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-700 dark:text-emerald-300',
    bullet: 'text-emerald-400',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700 dark:text-amber-300',
    bullet: 'text-amber-400',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconColor: 'text-rose-500',
    titleColor: 'text-rose-700 dark:text-rose-300',
    bullet: 'text-rose-400',
  },
};

export const ModernRecommendationGrid: React.FC<ModernRecommendationGridProps> = ({
  recommendations,
  delay = 0,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((rec, index) => {
        const styles = colorStyles[rec.color];
        const Icon = rec.icon;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + index * 0.1 }}
            className={`${styles.bg} rounded-xl p-4 md:p-5 border border-slate-200/30 dark:border-slate-700/30`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`p-2 rounded-lg ${styles.iconBg}`}>
                <Icon className={`w-4 h-4 ${styles.iconColor}`} />
              </div>
              <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
                {rec.title}
              </h4>
            </div>
            <ul className="space-y-2">
              {rec.items.map((item, itemIndex) => (
                <li 
                  key={itemIndex}
                  className="flex items-start gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-300"
                >
                  <span className={`${styles.bullet} mt-0.5 shrink-0`}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ModernRecommendationGrid;
