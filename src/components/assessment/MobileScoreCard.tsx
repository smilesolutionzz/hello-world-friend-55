import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface ScoreItem {
  label: string;
  value: string | number;
  subtext?: string;
}

interface MobileScoreCardProps {
  severity: string;
  severityLabel?: string;
  severityColor: string;
  icon?: LucideIcon;
  scores: ScoreItem[];
  testDate?: string;
}

export const MobileScoreCard = ({
  severity,
  severityLabel,
  severityColor,
  icon: Icon,
  scores,
  testDate
}: MobileScoreCardProps) => {
  const { isEnglish } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="overflow-hidden">
        {/* 심각도 헤더 */}
        <div className={`p-3 md:p-4 ${severityColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6" />}
              <div>
                <p className="text-xs md:text-sm font-medium opacity-80">
                  {severityLabel || (isEnglish ? 'Test Result' : '검사 결과')}
                </p>
                <p className="text-base md:text-lg font-bold">{severity}</p>
              </div>
            </div>
            {testDate && (
              <Badge variant="secondary" className="text-[10px] md:text-xs">
                {testDate}
              </Badge>
            )}
          </div>
        </div>

        {/* 점수 그리드 */}
        <div className="p-3 md:p-4">
          <div className={`grid gap-3 ${scores.length <= 2 ? 'grid-cols-2' : scores.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {scores.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="text-center p-2 md:p-3 bg-muted/30 rounded-lg"
              >
                <p className="text-[10px] md:text-xs text-muted-foreground mb-0.5">
                  {item.label}
                </p>
                <p className="text-lg md:text-xl font-bold text-foreground">
                  {item.value}
                </p>
                {item.subtext && (
                  <p className="text-[9px] md:text-[10px] text-muted-foreground">
                    {item.subtext}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
