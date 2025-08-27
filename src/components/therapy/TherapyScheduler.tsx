import { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Calendar as CalendarIcon, Clock } from "lucide-react";

moment.locale('ko');
const localizer = momentLocalizer(moment);

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  color_code: string;
  phone?: string;
  email?: string;
}

interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    therapist_id: string;
    therapist_name: string;
    client_name: string;
    appointment_type: string;
    status: string;
    notes?: string;
    color: string;
  };
}

interface TherapySchedulerProps {
  institutionId: string;
}

export function TherapyScheduler({ institutionId }: TherapySchedulerProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showTherapistDialog, setShowTherapistDialog] = useState(false);
  const { toast } = useToast();

  // 폼 상태
  const [appointmentForm, setAppointmentForm] = useState({
    therapist_id: '',
    client_name: '',
    appointment_type: '개별치료',
    start_time: '',
    end_time: '',
    notes: ''
  });

  const [therapistForm, setTherapistForm] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    color_code: '#22c55e'
  });

  const fetchTherapists = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTherapists(data || []);
    } catch (error: any) {
      console.error('Error fetching therapists:', error);
      toast({
        title: "치료사 조회 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [institutionId, toast]);

  const fetchAppointments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('therapy_appointments')
        .select(`
          *,
          therapists!inner(name, color_code)
        `)
        .eq('institution_id', institutionId)
        .gte('start_time', moment().startOf('month').toISOString())
        .lte('end_time', moment().endOf('month').add(1, 'month').toISOString());

      if (error) throw error;

      const formattedAppointments: Appointment[] = (data || []).map(apt => ({
        id: apt.id,
        title: `${apt.client_name} (${apt.therapists.name})`,
        start: new Date(apt.start_time),
        end: new Date(apt.end_time),
        resource: {
          therapist_id: apt.therapist_id,
          therapist_name: apt.therapists.name,
          client_name: apt.client_name,
          appointment_type: apt.appointment_type,
          status: apt.status,
          notes: apt.notes,
          color: apt.therapists.color_code
        }
      }));

      setAppointments(formattedAppointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "일정 조회 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [institutionId, toast]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTherapists(), fetchAppointments()]);
      setLoading(false);
    };
    loadData();
  }, [fetchTherapists, fetchAppointments]);

  const handleSelectSlot = useCallback((slotInfo: any) => {
    setSelectedSlot(slotInfo);
    setAppointmentForm({
      therapist_id: '',
      client_name: '',
      appointment_type: '개별치료',
      start_time: moment(slotInfo.start).format('YYYY-MM-DDTHH:mm'),
      end_time: moment(slotInfo.end).format('YYYY-MM-DDTHH:mm'),
      notes: ''
    });
    setShowAppointmentDialog(true);
  }, []);

  const handleSelectEvent = useCallback((event: Appointment) => {
    setSelectedEvent(event);
    setAppointmentForm({
      therapist_id: event.resource.therapist_id,
      client_name: event.resource.client_name,
      appointment_type: event.resource.appointment_type,
      start_time: moment(event.start).format('YYYY-MM-DDTHH:mm'),
      end_time: moment(event.end).format('YYYY-MM-DDTHH:mm'),
      notes: event.resource.notes || ''
    });
    setShowAppointmentDialog(true);
  }, []);

  const saveAppointment = async () => {
    try {
      const appointmentData = {
        institution_id: institutionId,
        therapist_id: appointmentForm.therapist_id,
        client_name: appointmentForm.client_name,
        appointment_type: appointmentForm.appointment_type,
        start_time: appointmentForm.start_time,
        end_time: appointmentForm.end_time,
        notes: appointmentForm.notes,
        status: 'scheduled'
      };

      if (selectedEvent) {
        const { error } = await supabase
          .from('therapy_appointments')
          .update(appointmentData)
          .eq('id', selectedEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('therapy_appointments')
          .insert(appointmentData);
        if (error) throw error;
      }

      toast({
        title: selectedEvent ? "일정 수정 완료" : "일정 등록 완료",
        description: "치료 일정이 성공적으로 저장되었습니다.",
      });

      setShowAppointmentDialog(false);
      setSelectedEvent(null);
      await fetchAppointments();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveTherapist = async () => {
    try {
      const { error } = await supabase
        .from('therapists')
        .insert({
          institution_id: institutionId,
          ...therapistForm
        });

      if (error) throw error;

      toast({
        title: "치료사 등록 완료",
        description: "새로운 치료사가 등록되었습니다.",
      });

      setShowTherapistDialog(false);
      setTherapistForm({
        name: '',
        specialization: '',
        phone: '',
        email: '',
        color_code: '#22c55e'
      });
      await fetchTherapists();
    } catch (error: any) {
      console.error('Error saving therapist:', error);
      toast({
        title: "등록 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const eventStyleGetter = (event: Appointment) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        borderColor: event.resource.color,
        color: 'white',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px',
      }
    };
  };

  if (loading) {
    return <div className="flex justify-center p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">치료 일정 관리</h2>
          <p className="text-muted-foreground">치료사와 클라이언트의 일정을 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTherapistDialog} onOpenChange={setShowTherapistDialog}>
            <DialogTrigger asChild>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                치료사 등록
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 치료사 등록</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={therapistForm.name}
                    onChange={(e) => setTherapistForm({...therapistForm, name: e.target.value})}
                    placeholder="치료사 이름"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">전문 분야</Label>
                  <Input
                    id="specialization"
                    value={therapistForm.specialization}
                    onChange={(e) => setTherapistForm({...therapistForm, specialization: e.target.value})}
                    placeholder="언어치료, 작업치료 등"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    value={therapistForm.phone}
                    onChange={(e) => setTherapistForm({...therapistForm, phone: e.target.value})}
                    placeholder="010-0000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={therapistForm.email}
                    onChange={(e) => setTherapistForm({...therapistForm, email: e.target.value})}
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="color">캘린더 색상</Label>
                  <Input
                    id="color"
                    type="color"
                    value={therapistForm.color_code}
                    onChange={(e) => setTherapistForm({...therapistForm, color_code: e.target.value})}
                  />
                </div>
                <Button onClick={saveTherapist} className="w-full">
                  등록
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">등록된 치료사</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{therapists.length}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이달의 예약</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 예약</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(apt => 
                moment(apt.start).isSame(moment(), 'day')
              ).length}건
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 치료사 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>치료사 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {therapists.map(therapist => (
              <Badge
                key={therapist.id}
                variant="outline"
                style={{ borderColor: therapist.color_code, color: therapist.color_code }}
              >
                {therapist.name} - {therapist.specialization}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 캘린더 */}
      <Card>
        <CardHeader>
          <CardTitle>치료 일정 캘린더</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={appointments}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              defaultView="week"
              step={30}
              timeslots={2}
              min={new Date(0, 0, 0, 8, 0, 0)}
              max={new Date(0, 0, 0, 20, 0, 0)}
              messages={{
                next: "다음",
                previous: "이전",
                today: "오늘",
                month: "월",
                week: "주",
                day: "일",
                agenda: "일정",
                date: "날짜",
                time: "시간",
                event: "일정",
                noEventsInRange: "이 기간에는 일정이 없습니다.",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 일정 등록/수정 다이얼로그 */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? '일정 수정' : '새 일정 등록'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="therapist">치료사</Label>
              <Select
                value={appointmentForm.therapist_id}
                onValueChange={(value) => setAppointmentForm({...appointmentForm, therapist_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="치료사를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map(therapist => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.name} - {therapist.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client_name">클라이언트 이름</Label>
              <Input
                id="client_name"
                value={appointmentForm.client_name}
                onChange={(e) => setAppointmentForm({...appointmentForm, client_name: e.target.value})}
                placeholder="클라이언트 이름"
              />
            </div>
            <div>
              <Label htmlFor="appointment_type">치료 유형</Label>
              <Select
                value={appointmentForm.appointment_type}
                onValueChange={(value) => setAppointmentForm({...appointmentForm, appointment_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="개별치료">개별치료</SelectItem>
                  <SelectItem value="그룹치료">그룹치료</SelectItem>
                  <SelectItem value="평가">평가</SelectItem>
                  <SelectItem value="상담">상담</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start_time">시작 시간</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={appointmentForm.start_time}
                  onChange={(e) => setAppointmentForm({...appointmentForm, start_time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="end_time">종료 시간</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={appointmentForm.end_time}
                  onChange={(e) => setAppointmentForm({...appointmentForm, end_time: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                placeholder="추가 메모"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveAppointment} className="flex-1">
                {selectedEvent ? '수정' : '등록'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAppointmentDialog(false);
                  setSelectedEvent(null);
                }}
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}