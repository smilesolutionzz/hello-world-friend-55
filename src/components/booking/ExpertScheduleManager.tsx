import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: '일요일' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => 
  `${String(i).padStart(2, '0')}:00:00`
);

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const ExpertScheduleManager = ({ expertId }: { expertId: string }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 1,
    start_time: '09:00:00',
    end_time: '17:00:00'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSchedules();
  }, [expertId]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_schedules')
        .select('*')
        .eq('expert_id', expertId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('스케줄 로딩 실패:', error);
      toast({
        title: '스케줄 로딩 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  };

  const addSchedule = async () => {
    if (newSchedule.start_time >= newSchedule.end_time) {
      toast({
        title: '잘못된 시간',
        description: '종료 시간은 시작 시간보다 늦어야 합니다.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('expert_schedules')
        .insert({
          expert_id: expertId,
          ...newSchedule
        });

      if (error) throw error;

      toast({
        title: '스케줄 추가 완료',
        description: '새로운 가용 시간이 추가되었습니다.'
      });

      loadSchedules();
      setNewSchedule({
        day_of_week: 1,
        start_time: '09:00:00',
        end_time: '17:00:00'
      });
    } catch (error) {
      console.error('스케줄 추가 실패:', error);
      toast({
        title: '스케줄 추가 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('expert_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: '스케줄 삭제 완료',
        description: '선택한 시간이 삭제되었습니다.'
      });

      loadSchedules();
    } catch (error) {
      console.error('스케줄 삭제 실패:', error);
      toast({
        title: '스케줄 삭제 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (scheduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('expert_schedules')
        .update({ is_available: !currentStatus })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: '상태 변경 완료',
        description: !currentStatus ? '예약 가능으로 변경되었습니다.' : '예약 불가로 변경되었습니다.'
      });

      loadSchedules();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast({
        title: '상태 변경 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  };

  const getDayLabel = (day: number) => {
    return DAYS_OF_WEEK.find(d => d.value === day)?.label || '알 수 없음';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          주간 스케줄 관리
        </CardTitle>
        <CardDescription>
          상담 가능한 요일과 시간을 설정하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 새 스케줄 추가 */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold">새 스케줄 추가</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={String(newSchedule.day_of_week)}
              onValueChange={(value) => setNewSchedule({ ...newSchedule, day_of_week: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map(day => (
                  <SelectItem key={day.value} value={String(day.value)}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newSchedule.start_time}
              onValueChange={(value) => setNewSchedule({ ...newSchedule, start_time: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="시작 시간" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(time => (
                  <SelectItem key={time} value={time}>
                    {time.substring(0, 5)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newSchedule.end_time}
              onValueChange={(value) => setNewSchedule({ ...newSchedule, end_time: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="종료 시간" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(time => (
                  <SelectItem key={time} value={time}>
                    {time.substring(0, 5)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={addSchedule} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              추가
            </Button>
          </div>
        </div>

        {/* 스케줄 목록 */}
        <div className="space-y-2">
          <h3 className="font-semibold">현재 스케줄</h3>
          {schedules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              등록된 스케줄이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {schedules.map(schedule => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium min-w-[80px]">
                      {getDayLabel(schedule.day_of_week)}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      schedule.is_available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {schedule.is_available ? '예약 가능' : '예약 불가'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(schedule.id, schedule.is_available)}
                      disabled={loading}
                    >
                      {schedule.is_available ? '비활성화' : '활성화'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSchedule(schedule.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
