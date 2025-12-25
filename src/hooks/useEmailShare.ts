import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareContent {
  summary?: string;
  sections?: Array<{ title: string; content: string }>;
  scores?: Record<string, number>;
  interpretation?: string;
  recommendations?: string[];
  metadata?: Record<string, any>;
}

interface ShareEmailParams {
  email: string;
  type: 'report' | 'test_result' | 'analysis' | 'concern';
  title: string;
  recipientName?: string;
  senderName?: string;
  content: ShareContent;
}

export const useEmailShare = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendEmail = async (params: ShareEmailParams): Promise<boolean> => {
    setIsSending(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인이 필요합니다",
          description: "이메일 공유를 위해 로그인해주세요.",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('send-share-email', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || '이메일 발송에 실패했습니다.');
      }

      toast({
        title: "✅ 이메일 전송 완료",
        description: `${params.email}로 결과가 전송되었습니다.`,
      });
      
      return true;
    } catch (error: any) {
      console.error('이메일 전송 오류:', error);
      toast({
        title: "이메일 전송 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const shareReport = async (
    email: string, 
    title: string, 
    summary: string, 
    sections?: Array<{ title: string; content: string }>,
    recommendations?: string[]
  ) => {
    return sendEmail({
      email,
      type: 'report',
      title,
      content: { summary, sections, recommendations }
    });
  };

  const shareTestResult = async (
    email: string,
    title: string,
    scores: Record<string, number>,
    interpretation: string,
    recommendations?: string[]
  ) => {
    return sendEmail({
      email,
      type: 'test_result',
      title,
      content: { scores, interpretation, recommendations }
    });
  };

  const shareAnalysis = async (
    email: string,
    title: string,
    summary: string,
    sections?: Array<{ title: string; content: string }>
  ) => {
    return sendEmail({
      email,
      type: 'analysis',
      title,
      content: { summary, sections }
    });
  };

  const shareConcern = async (
    email: string,
    title: string,
    summary: string,
    recommendations?: string[]
  ) => {
    return sendEmail({
      email,
      type: 'concern',
      title,
      content: { summary, recommendations }
    });
  };

  return {
    isSending,
    sendEmail,
    shareReport,
    shareTestResult,
    shareAnalysis,
    shareConcern,
  };
};
