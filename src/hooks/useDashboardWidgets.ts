import { useState, useEffect } from 'react';

export type WidgetType = 
  | 'stats'
  | 'comparison'
  | 'charts'
  | 'timeline'
  | 'personality'
  | 'goals'
  | 'recent'
  | 'recommendations';

export interface Widget {
  id: WidgetType;
  title: string;
  enabled: boolean;
  order: number;
}

const defaultWidgets: Widget[] = [
  { id: 'stats', title: '통계', enabled: true, order: 0 },
  { id: 'timeline', title: '최근 활동', enabled: true, order: 1 },
  { id: 'comparison', title: '검사 비교', enabled: true, order: 2 },
  { id: 'charts', title: '차트', enabled: true, order: 3 },
  { id: 'goals', title: '목표 추적', enabled: true, order: 4 },
  { id: 'personality', title: 'AI 성격 분석', enabled: true, order: 5 },
  { id: 'recent', title: '최근 검사', enabled: true, order: 6 },
  { id: 'recommendations', title: '추천 기능', enabled: true, order: 7 }
];

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultWidgets;
      }
    }
    return defaultWidgets;
  });

  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
  }, [widgets]);

  const reorderWidgets = (newOrder: Widget[]) => {
    setWidgets(newOrder);
  };

  const toggleWidget = (id: WidgetType) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id 
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );
  };

  const resetWidgets = () => {
    setWidgets(defaultWidgets);
  };

  return {
    widgets: widgets.sort((a, b) => a.order - b.order),
    reorderWidgets,
    toggleWidget,
    resetWidgets
  };
}