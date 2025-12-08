import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Check, CheckCheck, FileIcon, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  isOwn,
  timestamp,
  isRead,
  messageType,
  fileUrl
}) => {
  const renderContent = () => {
    if (messageType === 'image' && fileUrl) {
      return (
        <div className="space-y-2">
          <img 
            src={fileUrl} 
            alt={content}
            className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(fileUrl, '_blank')}
          />
          <p className="text-xs opacity-70">{content}</p>
        </div>
      );
    }

    if (messageType === 'file' && fileUrl) {
      return (
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <FileIcon className="w-5 h-5" />
          <span className="text-sm underline">{content}</span>
        </a>
      );
    }

    return <p className="text-sm whitespace-pre-wrap break-words">{content}</p>;
  };

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        {renderContent()}
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-[10px] opacity-60">
            {formatDistanceToNow(new Date(timestamp), { 
              addSuffix: true,
              locale: ko 
            })}
          </span>
          {isOwn && (
            isRead ? (
              <CheckCheck className="w-3 h-3 text-blue-400" />
            ) : (
              <Check className="w-3 h-3 opacity-60" />
            )
          )}
        </div>
      </div>
    </div>
  );
};
