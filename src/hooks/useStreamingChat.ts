import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseStreamingChatOptions {
  onError?: (error: Error) => void;
  assessmentResults?: any;
  sessionType?: string;
  systemPrompt?: string;
}

export const useStreamingChat = (options: UseStreamingChatOptions = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (content: string, conversationHistory: Message[] = []) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // 임시 AI 메시지 생성
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const SUPABASE_URL = 'https://hrcqxjetmzxoephgyjlb.supabase.co';
      const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg';
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-counselor-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          message: content,
          conversationHistory,
          assessmentResults: options.assessmentResults,
          sessionType: options.sessionType,
          systemPrompt: options.systemPrompt
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        }
        if (response.status === 402) {
          throw new Error('크레딧이 부족합니다. 충전 후 다시 시도해주세요.');
        }
        throw new Error('스트리밍 요청 실패');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      if (!reader) throw new Error('Response body reader not available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // SSE 라인 단위로 처리
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            
            if (delta) {
              fullContent += delta;
              // 실시간으로 메시지 업데이트
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            }
          } catch (e) {
            // JSON 파싱 실패 시 무시
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }

      // 남은 버퍼 처리
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (!line.trim() || line.startsWith(':') || !line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            }
          } catch (e) {
            console.warn('Failed to parse final SSE data:', data);
          }
        }
      }

    } catch (error) {
      console.error('Streaming error:', error);
      
      // 에러 메시지 표시
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: error instanceof Error 
                  ? `죄송합니다. ${error.message}` 
                  : '일시적인 오류가 발생했습니다. 다시 시도해주세요.'
              }
            : msg
        )
      );

      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    setMessages,
    clearMessages
  };
};
