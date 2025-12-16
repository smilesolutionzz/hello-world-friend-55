import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { LucideIcon } from "lucide-react";

interface MobileChartCardProps {
  title: string;
  icon?: LucideIcon;
  chartType: 'bar' | 'radar' | 'pie';
  data: any[];
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  height?: number;
  description?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const MobileChartCard = ({
  title,
  icon: Icon,
  chartType,
  data,
  dataKey,
  nameKey = 'name',
  colors = COLORS,
  height = 180,
  description
}: MobileChartCardProps) => {
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis 
                dataKey={nameKey} 
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip 
                contentStyle={{ 
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Bar 
                dataKey={dataKey} 
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey={nameKey} 
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar
                dataKey={dataKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-2 px-3 pt-3 md:px-6 md:pt-6">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3 md:px-4 md:pb-4">
          {renderChart()}
          {description && (
            <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-2">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
