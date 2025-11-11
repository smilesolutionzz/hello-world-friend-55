import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Download, Clock, User, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SessionTimelineProps {
  messages: Message[];
  sessionStartTime: Date;
  onDownload?: () => void;
}

export const SessionTimeline = ({ messages, sessionStartTime, onDownload }: SessionTimelineProps) => {
  const getElapsedTime = (timestamp: Date) => {
    const elapsed = timestamp.getTime() - sessionStartTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-background/95 backdrop-blur-sm border-border p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          상담 타임라인
        </h3>
        {onDownload && (
          <Button onClick={onDownload} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {/* Timeline dot */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  msg.role === 'user' 
                    ? 'bg-primary/20 border-2 border-primary' 
                    : 'bg-secondary/20 border-2 border-secondary'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-5 h-5 text-primary" />
                  ) : (
                    <Bot className="w-5 h-5 text-secondary" />
                  )}
                </div>

                {/* Message content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {msg.role === 'user' ? '나' : 'AI 상담사'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getElapsedTime(msg.timestamp)}
                    </span>
                  </div>
                  <Card className={`p-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-secondary/10 border-secondary/20'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
