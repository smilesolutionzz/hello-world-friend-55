import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, FileText, BarChart3, Download, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const HighlightNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: '홈', path: '/' },
    { icon: Brain, label: 'AI 분석', path: '/highlight-ai' },
    { icon: FileText, label: '관찰일지', path: '/observation' },
    { icon: BarChart3, label: '대시보드', path: '/dashboard' },
    { icon: Download, label: '리포트', path: '/highlight-ai?tab=reports' },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-6 py-4">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">AI Highlight</span>
          </div>
          
          <div className="flex items-center gap-2 ml-8">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};