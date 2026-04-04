import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RewardPoints {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface AttendanceInfo {
  checkedToday: boolean;
  currentStreak: number;
  weekAttendance: boolean[]; // 7일간 출석 여부
}

interface RewardHistoryItem {
  id: string;
  points: number;
  action_type: string;
  description: string | null;
  created_at: string;
}

export function useRewards() {
  const [points, setPoints] = useState<RewardPoints>({ balance: 0, totalEarned: 0, totalSpent: 0 });
  const [attendance, setAttendance] = useState<AttendanceInfo>({ checkedToday: false, currentStreak: 0, weekAttendance: [false, false, false, false, false, false, false] });
  const [rouletteSpunToday, setRouletteSpunToday] = useState(false);
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadPoints = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_reward_points')
      .select('balance, total_earned, total_spent')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPoints({ balance: data.balance, totalEarned: data.total_earned, totalSpent: data.total_spent });
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // 오늘 출석 여부
    const { data: todayCheck } = await supabase
      .from('reward_attendance')
      .select('streak_days')
      .eq('user_id', user.id)
      .eq('check_date', today)
      .single();

    // 최근 7일 출석 기록
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const { data: weekData } = await supabase
      .from('reward_attendance')
      .select('check_date, streak_days')
      .eq('user_id', user.id)
      .gte('check_date', weekAgo.toISOString().split('T')[0])
      .order('check_date', { ascending: true });

    const weekAttendance: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weekAttendance.push(weekData?.some(r => r.check_date === dateStr) ?? false);
    }

    // 현재 연속 출석 수: 오늘 출석했으면 오늘의 streak, 아니면 어제의 streak
    let currentStreak = 0;
    if (todayCheck) {
      currentStreak = todayCheck.streak_days;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { data: yesterdayCheck } = await supabase
        .from('reward_attendance')
        .select('streak_days')
        .eq('user_id', user.id)
        .eq('check_date', yesterday.toISOString().split('T')[0])
        .single();
      currentStreak = yesterdayCheck?.streak_days ?? 0;
    }

    setAttendance({
      checkedToday: !!todayCheck,
      currentStreak,
      weekAttendance,
    });
  }, []);

  const loadRouletteStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('reward_roulette_spins')
      .select('id')
      .eq('user_id', user.id)
      .eq('spin_date', today)
      .single();

    setRouletteSpunToday(!!data);
  }, []);

  const loadHistory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('reward_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setHistory(data);
  }, []);

  const checkAttendance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_attendance', { p_user_id: user.id });
      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast({ title: '출석 완료! 🎉', description: `₩${result.points} 포인트 적립! (${result.streak}일 연속)` });
        await Promise.all([loadPoints(), loadAttendance(), loadHistory()]);
        return result;
      } else {
        toast({ title: '출석 체크', description: result.error, variant: 'destructive' });
        return null;
      }
    } catch (e: any) {
      toast({ title: '오류', description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const spinRoulette = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('spin_roulette', { p_user_id: user.id });
      if (error) throw error;

      const result = data as any;
      if (result.success) {
        await Promise.all([loadPoints(), loadRouletteStatus(), loadHistory()]);
        return result;
      } else {
        toast({ title: '룰렛', description: result.error, variant: 'destructive' });
        return null;
      }
    } catch (e: any) {
      toast({ title: '오류', description: e.message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadAll = useCallback(async () => {
    await Promise.all([loadPoints(), loadAttendance(), loadRouletteStatus(), loadHistory()]);
  }, [loadPoints, loadAttendance, loadRouletteStatus, loadHistory]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    points,
    attendance,
    rouletteSpunToday,
    history,
    isLoading,
    checkAttendance,
    spinRoulette,
    loadAll,
  };
}
