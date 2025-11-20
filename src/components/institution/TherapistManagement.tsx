import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus,
  Users, 
  Edit, 
  Trash2, 
  Clock,
  Phone,
  Mail,
  Calendar,
  Award
} from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  phone?: string;
  email?: string;
  color_code: string;
  is_active: boolean;
  working_hours: any;
  created_at: string;
}

interface TherapistFormData {
  name: string;
  specialization: string;
  phone: string;
  email: string;
  color_code: string;
  is_active: boolean;
  working_hours: {
    mon: { start: string; end: string; };
    tue: { start: string; end: string; };
    wed: { start: string; end: string; };
    thu: { start: string; end: string; };
    fri: { start: string; end: string; };
    sat: { start: string; end: string; };
    sun: { start: string; end: string; };
  };
}

interface TherapistManagementProps {
  institutionId: string;
}

export default function TherapistManagement({ institutionId }: TherapistManagementProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<TherapistFormData>({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    color_code: '#22c55e',
    is_active: true,
    working_hours: {
      mon: { start: '09:00', end: '18:00' },
      tue: { start: '09:00', end: '18:00' },
      wed: { start: '09:00', end: '18:00' },
      thu: { start: '09:00', end: '18:00' },
      fri: { start: '09:00', end: '18:00' },
      sat: { start: '09:00', end: '13:00' },
      sun: { start: '', end: '' }
    }
  });

  useEffect(() => {
    fetchTherapists();
  }, [institutionId]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTherapists(data || []);
    } catch (error: any) {
      console.error('Error fetching therapists:', error);
      toast({
        title: "치료사 조회 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTherapist) {
        // 수정
        const { error } = await supabase
          .from('therapists')
          .update({
            name: formData.name,
            specialization: formData.specialization,
            phone: formData.phone || null,
            email: formData.email || null,
            color_code: formData.color_code,
            is_active: formData.is_active,
            working_hours: formData.working_hours
          })
          .eq('id', editingTherapist.id);

        if (error) throw error;

        toast({
          title: "치료사 정보 수정 완료",
          description: "치료사 정보가 성공적으로 수정되었습니다.",
        });
      } else {
        // 등록
        const { error } = await supabase
          .from('therapists')
          .insert({
            institution_id: institutionId,
            name: formData.name,
            specialization: formData.specialization,
            phone: formData.phone || null,
            email: formData.email || null,
            color_code: formData.color_code,
            is_active: formData.is_active,
            working_hours: formData.working_hours
          });

        if (error) throw error;

        toast({
          title: "치료사 등록 완료",
          description: "새로운 치료사가 성공적으로 등록되었습니다.",
        });
      }

      resetForm();
      setShowDialog(false);
      await fetchTherapists();
    } catch (error: any) {
      console.error('Error saving therapist:', error);
      toast({
        title: editingTherapist ? "수정 실패" : "등록 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (therapist: Therapist) => {
    setEditingTherapist(therapist);
    setFormData({
      name: therapist.name,
      specialization: therapist.specialization,
      phone: therapist.phone || '',
      email: therapist.email || '',
      color_code: therapist.color_code,
      is_active: therapist.is_active,
      working_hours: therapist.working_hours || {
        mon: { start: '09:00', end: '18:00' },
        tue: { start: '09:00', end: '18:00' },
        wed: { start: '09:00', end: '18:00' },
        thu: { start: '09:00', end: '18:00' },
        fri: { start: '09:00', end: '18:00' },
        sat: { start: '09:00', end: '13:00' },
        sun: { start: '', end: '' }
      }
    });
    setShowDialog(true);
  };

  const handleDelete = async (therapist: Therapist) => {
    if (!confirm(`${therapist.name} 치료사를 삭제하시겠습니까?`)) return;

    try {
      const { error } = await supabase
        .from('therapists')
        .delete()
        .eq('id', therapist.id);

      if (error) throw error;

      toast({
        title: "치료사 삭제 완료",
        description: "치료사가 성공적으로 삭제되었습니다.",
      });

      await fetchTherapists();
    } catch (error: any) {
      console.error('Error deleting therapist:', error);
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      phone: '',
      email: '',
      color_code: '#22c55e',
      is_active: true,
      working_hours: {
        mon: { start: '09:00', end: '18:00' },
        tue: { start: '09:00', end: '18:00' },
        wed: { start: '09:00', end: '18:00' },
        thu: { start: '09:00', end: '18:00' },
        fri: { start: '09:00', end: '18:00' },
        sat: { start: '09:00', end: '13:00' },
        sun: { start: '', end: '' }
      }
    });
    setEditingTherapist(null);
  };

  const updateWorkingHours = (day: string, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours[day as keyof typeof prev.working_hours],
          [field]: value
        }
      }
    }));
  };

  const dayNames = {
    mon: '월요일',
    tue: '화요일', 
    wed: '수요일',
    thu: '목요일',
    fri: '금요일',
    sat: '토요일',
    sun: '일요일'
  };

  if (loading) {
    return <div className="flex justify-center p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">치료사 관리</h2>
          <p className="text-muted-foreground">치료사를 등록하고 관리하세요</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              치료사 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTherapist ? '치료사 정보 수정' : '새 치료사 등록'}
              </DialogTitle>
              <DialogDescription>
                치료사의 기본 정보와 근무 시간을 설정하세요
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">기본 정보</TabsTrigger>
                <TabsTrigger value="schedule">근무 시간</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="치료사 이름"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">전문 분야 *</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="언어치료, 작업치료, 인지치료 등"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">연락처</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">캘린더 색상</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color_code}
                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                        className="w-16 h-10"
                      />
                      <span className="text-sm text-muted-foreground">
                        일정에 표시될 색상
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">활성 상태</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">근무 시간 설정</h3>
                  {Object.entries(dayNames).map(([day, name]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium">{name}</div>
                      <Input
                        type="time"
                        value={formData.working_hours[day as keyof typeof formData.working_hours].start}
                        onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                        className="w-32"
                      />
                      <span>~</span>
                      <Input
                        type="time"
                        value={formData.working_hours[day as keyof typeof formData.working_hours].end}
                        onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">
                        (시간을 비워두면 휴무)
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.specialization}>
                {editingTherapist ? '수정' : '등록'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 치료사</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{therapists.length}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 치료사</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {therapists.filter(t => t.is_active).length}명
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전문 분야</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(therapists.map(t => t.specialization)).size}개
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 치료사 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {therapists.map((therapist) => (
          <Card key={therapist.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: therapist.color_code }}
                  />
                  <CardTitle className="text-lg">{therapist.name}</CardTitle>
                </div>
                <Badge variant={therapist.is_active ? "default" : "secondary"}>
                  {therapist.is_active ? "활성" : "비활성"}
                </Badge>
              </div>
              <CardDescription>{therapist.specialization}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {therapist.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {therapist.phone}
                </div>
              )}
              {therapist.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {therapist.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                근무시간 설정됨
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(therapist)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(therapist)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {therapists.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">등록된 치료사가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              첫 번째 치료사를 등록해 보세요
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              치료사 등록
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}