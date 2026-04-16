import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  test_type: string | null;
  reminder_type: string;
  scheduled_at: string;
  status: string;
  message: string | null;
}

export const useReportReminder = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReminders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('report_reassessment_reminders' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true });
    
    if (!error && data) {
      setReminders(data as any[]);
    }
    setLoading(false);
  };

  const createReminder = async (options: {
    testType?: string;
    reminderType?: string;
    monthsLater?: number;
    message?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const months = options.monthsLater || 3;
    const scheduledAt = new Date();
    scheduledAt.setMonth(scheduledAt.getMonth() + months);

    const { error } = await supabase
      .from('report_reassessment_reminders' as any)
      .insert({
        user_id: user.id,
        test_type: options.testType || null,
        reminder_type: options.reminderType || `${months}month`,
        scheduled_at: scheduledAt.toISOString(),
        message: options.message || `${months}개월 후 재검사를 권장합니다.`,
        status: 'pending',
      } as any);

    if (error) {
      console.error('Reminder creation error:', error);
      return false;
    }

    toast({
      title: '🔔 재검사 알림 설정 완료',
      description: `${months}개월 후 재검사 알림이 설정되었습니다.`,
    });

    fetchReminders();
    return true;
  };

  const dismissReminder = async (reminderId: string) => {
    const { error } = await supabase
      .from('report_reassessment_reminders' as any)
      .update({ status: 'dismissed' } as any)
      .eq('id', reminderId);

    if (!error) {
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    }
  };

  const getDueReminders = () => {
    const now = new Date();
    return reminders.filter(r => new Date(r.scheduled_at) <= now);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return {
    reminders,
    loading,
    createReminder,
    dismissReminder,
    getDueReminders,
    fetchReminders,
  };
};
