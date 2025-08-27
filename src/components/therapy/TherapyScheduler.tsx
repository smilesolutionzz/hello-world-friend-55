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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Calendar as CalendarIcon, Clock, X } from "lucide-react";

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
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showTherapistDialog, setShowTherapistDialog] = useState(false);
  const { toast } = useToast();

  // 폼 상태
  const [appointmentForm, setAppointmentForm] = useState({
    therapist_id: '',
    client_name: '',
    appointment_type: '제휴',
    program_type: '언어-언어치료',
    start_date: '',
    start_time: '',
    end_time: '',
    notes: '',
    repeat_type: 'none',
    repeat_end_date: '',
    repeat_days: [] as string[]
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
      appointment_type: '제휴',
      program_type: '언어-언어치료',
      start_date: moment(slotInfo.start).format('YYYY-MM-DD'),
      start_time: moment(slotInfo.start).format('HH:mm'),
      end_time: moment(slotInfo.end).format('HH:mm'),
      notes: '',
      repeat_type: 'none',
      repeat_end_date: '',
      repeat_days: []
    });
    setShowAppointmentDialog(true);
  }, []);

  const handleSelectEvent = useCallback((event: Appointment) => {
    setSelectedEvent(event);
    setAppointmentForm({
      therapist_id: event.resource.therapist_id,
      client_name: event.resource.client_name,
      appointment_type: event.resource.appointment_type,
      program_type: '언어-언어치료',
      start_date: moment(event.start).format('YYYY-MM-DD'),
      start_time: moment(event.start).format('HH:mm'),
      end_time: moment(event.end).format('HH:mm'),
      notes: event.resource.notes || '',
      repeat_type: 'none',
      repeat_end_date: '',
      repeat_days: []
    });
    setShowAppointmentDialog(true);
  }, []);

  const generateRecurringAppointments = (baseData: any) => {
    const appointments = [];
    const startDate = moment(appointmentForm.start_date);
    const endDate = appointmentForm.repeat_end_date ? moment(appointmentForm.repeat_end_date) : startDate.clone().add(6, 'months');
    
    if (appointmentForm.repeat_type === 'daily') {
      let current = startDate.clone();
      while (current.isSameOrBefore(endDate)) {
        appointments.push({
          ...baseData,
          start_time: current.format('YYYY-MM-DD') + 'T' + appointmentForm.start_time,
          end_time: current.format('YYYY-MM-DD') + 'T' + appointmentForm.end_time,
        });
        current.add(1, 'day');
      }
    } else if (appointmentForm.repeat_type === 'weekly') {
      let current = startDate.clone();
      while (current.isSameOrBefore(endDate)) {
        if (appointmentForm.repeat_days.length === 0 || appointmentForm.repeat_days.includes(current.format('dddd'))) {
          appointments.push({
            ...baseData,
            start_time: current.format('YYYY-MM-DD') + 'T' + appointmentForm.start_time,
            end_time: current.format('YYYY-MM-DD') + 'T' + appointmentForm.end_time,
          });
        }
        current.add(1, 'day');
      }
    } else {
      // 단일 일정
      appointments.push({
        ...baseData,
        start_time: appointmentForm.start_date + 'T' + appointmentForm.start_time,
        end_time: appointmentForm.start_date + 'T' + appointmentForm.end_time,
      });
    }
    
    return appointments;
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    
    try {
      const { error } = await supabase
        .from('therapy_appointments')
        .delete()
        .eq('id', selectedEvent.id);
      
      if (error) throw error;

      toast({
        title: "일정 삭제 완료",
        description: "치료 일정이 삭제되었습니다.",
      });

      setShowDeleteConfirmDialog(false);
      setShowAppointmentDialog(false);
      setSelectedEvent(null);
      await fetchAppointments();
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveAppointment = async () => {
    try {
      const baseData = {
        institution_id: institutionId,
        therapist_id: appointmentForm.therapist_id,
        client_name: appointmentForm.client_name,
        appointment_type: appointmentForm.appointment_type,
        notes: appointmentForm.notes,
        status: 'scheduled'
      };

      if (selectedEvent) {
        // 기존 일정 수정
        const appointmentData = {
          ...baseData,
          start_time: appointmentForm.start_date + 'T' + appointmentForm.start_time,
          end_time: appointmentForm.start_date + 'T' + appointmentForm.end_time,
        };
        
        const { error } = await supabase
          .from('therapy_appointments')
          .update(appointmentData)
          .eq('id', selectedEvent.id);
        if (error) throw error;
      } else {
        // 새 일정 등록 (반복 포함)
        const appointments = generateRecurringAppointments(baseData);
        
        const { error } = await supabase
          .from('therapy_appointments')
          .insert(appointments);
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

      {/* 일정 등록/수정 다이얼로그 - 케어플센터 스타일 */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                일정등록 - 제휴
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAppointmentDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 일정 유형 선택 */}
            <div className="space-y-3">
              <RadioGroup 
                value={appointmentForm.appointment_type} 
                onValueChange={(value) => setAppointmentForm({...appointmentForm, appointment_type: value})}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="제휴" id="affiliate" />
                  <Label htmlFor="affiliate" className="text-base font-medium">제휴</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="상담/평가" id="consultation" />
                  <Label htmlFor="consultation" className="text-base font-medium">상담/평가</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="기타" id="other" />
                  <Label htmlFor="other" className="text-base font-medium">기타</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 선생님 선택 */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-red-500">* 선생님</Label>
              <Select
                value={appointmentForm.therapist_id}
                onValueChange={(value) => setAppointmentForm({...appointmentForm, therapist_id: value})}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="작업치료사 / 언어재활사 선택" />
                </SelectTrigger>
                <SelectContent>
                  {therapists.map(therapist => (
                    <SelectItem key={therapist.id} value={therapist.id} className="text-base py-3">
                      {therapist.name} - {therapist.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 이용자 입력 */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-red-500">* 이용자</Label>
              <Input
                value={appointmentForm.client_name}
                onChange={(e) => setAppointmentForm({...appointmentForm, client_name: e.target.value})}
                placeholder="이용자를 선택하세요..."
                className="h-12 text-base"
              />
            </div>

            {/* 프로그램 선택 */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-red-500">* 프로그램</Label>
              <Select
                value={appointmentForm.program_type}
                onValueChange={(value) => setAppointmentForm({...appointmentForm, program_type: value})}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="언어-언어치료" className="text-base py-3">언어-언어치료</SelectItem>
                  <SelectItem value="작업-작업치료" className="text-base py-3">작업-작업치료</SelectItem>
                  <SelectItem value="물리-물리치료" className="text-base py-3">물리-물리치료</SelectItem>
                  <SelectItem value="심리-심리치료" className="text-base py-3">심리-심리치료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 일자 선택 */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-red-500">* 일자</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={appointmentForm.start_date}
                  onChange={(e) => setAppointmentForm({...appointmentForm, start_date: e.target.value})}
                  className="h-12 text-base flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-3"
                  onClick={() => setAppointmentForm({
                    ...appointmentForm,
                    repeat_type: appointmentForm.repeat_type === 'none' ? 'weekly' : 'none'
                  })}
                >
                  반복
                </Button>
              </div>
            </div>

            {/* 시간 선택 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium text-red-500">* 시작시간</Label>
                <Input
                  type="time"
                  value={appointmentForm.start_time}
                  onChange={(e) => setAppointmentForm({...appointmentForm, start_time: e.target.value})}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium text-red-500">* 종료시간</Label>
                <Input
                  type="time"
                  value={appointmentForm.end_time}
                  onChange={(e) => setAppointmentForm({...appointmentForm, end_time: e.target.value})}
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* 반복 설정 섹션 */}
            {!selectedEvent && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">반복 설정</Label>
                  <Select
                    value={appointmentForm.repeat_type}
                    onValueChange={(value) => setAppointmentForm({...appointmentForm, repeat_type: value})}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">반복 없음</SelectItem>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {appointmentForm.repeat_type === 'weekly' && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">반복 요일</Label>
                    <div className="flex gap-2">
                      {['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].map(day => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={appointmentForm.repeat_days.includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setAppointmentForm({
                                  ...appointmentForm,
                                  repeat_days: [...appointmentForm.repeat_days, day]
                                });
                              } else {
                                setAppointmentForm({
                                  ...appointmentForm,
                                  repeat_days: appointmentForm.repeat_days.filter(d => d !== day)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={day} className="text-sm">{day.substring(0, 1)}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {appointmentForm.repeat_type !== 'none' && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">반복 종료일</Label>
                    <Input
                      type="date"
                      value={appointmentForm.repeat_end_date}
                      onChange={(e) => setAppointmentForm({...appointmentForm, repeat_end_date: e.target.value})}
                      className="h-12 text-base"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 메모 */}
            <div className="space-y-2">
              <Label className="text-base font-medium">메모</Label>
              <Textarea
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                placeholder="메모를 입력하세요"
                rows={4}
                className="text-base resize-none"
              />
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={saveAppointment} className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700">
              {selectedEvent ? '수정' : '저장'}
            </Button>
            {selectedEvent && (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirmDialog(true)}
                className="h-12 text-base px-6"
              >
                삭제
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAppointmentDialog(false);
                setSelectedEvent(null);
              }}
              className="flex-1 h-12 text-base"
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일정 삭제</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-lg">진짜 삭제하시겠습니까?</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="flex-1"
            >
              확인
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirmDialog(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}