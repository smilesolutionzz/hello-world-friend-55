import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expert {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  specializations: string[];
  license_number?: string;
  years_experience?: number;
  education?: string;
  bio?: string;
  hourly_rate?: number;
  is_verified: boolean;
  is_available: boolean;
  profile_image_url?: string;
  created_at: string;
}

interface ExpertFormData {
  full_name: string;
  email: string;
  phone: string;
  specializations: string;
  license_number: string;
  years_experience: number;
  education: string;
  bio: string;
  hourly_rate: number;
}

export function ExpertManagement() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [formData, setFormData] = useState<ExpertFormData>({
    full_name: '',
    email: '',
    phone: '',
    specializations: '',
    license_number: '',
    years_experience: 0,
    education: '',
    bio: '',
    hourly_rate: 50000
  });
  const { toast } = useToast();

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExperts(data || []);
    } catch (error) {
      console.error('전문가 목록 조회 실패:', error);
      toast({
        title: "조회 실패",
        description: "전문가 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const expertData = {
        ...formData,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
        is_verified: true,
        is_available: true,
        professional_title: 'Specialist',
        user_id: crypto.randomUUID() // 임시 user_id 생성
      };

      if (editingExpert) {
        // 수정
        const { user_id, ...updateData } = expertData; // user_id 제외하고 업데이트
        const { error } = await supabase
          .from('experts')
          .update(updateData)
          .eq('id', editingExpert.id);

        if (error) throw error;

        toast({
          title: "전문가 정보 수정",
          description: "전문가 정보가 성공적으로 수정되었습니다.",
        });
      } else {
        // 새 전문가 추가
        const { error } = await supabase
          .from('experts')
          .insert([expertData]);

        if (error) throw error;

        toast({
          title: "전문가 등록",
          description: "새 전문가가 성공적으로 등록되었습니다.",
        });
      }

      setIsDialogOpen(false);
      setEditingExpert(null);
      resetForm();
      fetchExperts();
    } catch (error) {
      console.error('전문가 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "전문가 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
    setFormData({
      full_name: expert.full_name,
      email: expert.email || '',
      phone: expert.phone || '',
      specializations: expert.specializations.join(', '),
      license_number: expert.license_number || '',
      years_experience: expert.years_experience || 0,
      education: expert.education || '',
      bio: expert.bio || '',
      hourly_rate: expert.hourly_rate || 50000
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (expertId: string) => {
    if (!confirm('정말로 이 전문가를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('experts')
        .delete()
        .eq('id', expertId);

      if (error) throw error;

      toast({
        title: "전문가 삭제",
        description: "전문가가 성공적으로 삭제되었습니다.",
      });

      fetchExperts();
    } catch (error) {
      console.error('전문가 삭제 실패:', error);
      toast({
        title: "삭제 실패",
        description: "전문가 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const toggleExpertStatus = async (expertId: string, field: 'is_verified' | 'is_available', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('experts')
        .update({ [field]: !currentValue })
        .eq('id', expertId);

      if (error) throw error;

      toast({
        title: "상태 변경",
        description: `전문가 ${field === 'is_verified' ? '인증' : '활성'} 상태가 변경되었습니다.`,
      });

      fetchExperts();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast({
        title: "변경 실패",
        description: "상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      specializations: '',
      license_number: '',
      years_experience: 0,
      education: '',
      bio: '',
      hourly_rate: 50000
    });
  };

  const openAddDialog = () => {
    setEditingExpert(null);
    resetForm();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>전문가 관리</CardTitle>
          <CardDescription>플랫폼의 전문가를 등록하고 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              전문가 관리
            </CardTitle>
            <CardDescription>플랫폼의 전문가를 등록하고 관리합니다</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                전문가 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingExpert ? '전문가 정보 수정' : '새 전문가 등록'}
                </DialogTitle>
                <DialogDescription>
                  전문가의 상세 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">이름 *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_number">자격증 번호</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="years_experience">경력 (년)</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate">시간당 요금 (원)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({...formData, hourly_rate: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="specializations">전문 분야 (쉼표로 구분)</Label>
                  <Input
                    id="specializations"
                    value={formData.specializations}
                    onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                    placeholder="예: 아동발달, 학습장애, ADHD"
                  />
                </div>
                
                <div>
                  <Label htmlFor="education">학력</Label>
                  <Input
                    id="education"
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    placeholder="예: 서울대학교 심리학과 박사"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">소개</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="전문가 소개를 입력해주세요"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit">
                    {editingExpert ? '수정' : '등록'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>전문분야</TableHead>
                <TableHead>경력</TableHead>
                <TableHead>요금</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experts.map((expert) => (
                <TableRow key={expert.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{expert.full_name}</div>
                      {expert.education && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {expert.education}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {expert.specializations.slice(0, 2).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {expert.specializations.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{expert.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {expert.years_experience ? (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {expert.years_experience}년
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {expert.hourly_rate ? (
                      `₩${expert.hourly_rate.toLocaleString()}/시간`
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {expert.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {expert.email}
                        </div>
                      )}
                      {expert.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {expert.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant={expert.is_verified ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleExpertStatus(expert.id, 'is_verified', expert.is_verified)}
                      >
                        {expert.is_verified ? '인증됨' : '미인증'}
                      </Badge>
                      <Badge
                        variant={expert.is_available ? "default" : "destructive"}
                        className="cursor-pointer"
                        onClick={() => toggleExpertStatus(expert.id, 'is_available', expert.is_available)}
                      >
                        {expert.is_available ? '활성' : '비활성'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(expert)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(expert.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {experts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">등록된 전문가가 없습니다.</p>
              <p className="text-sm text-muted-foreground">첫 번째 전문가를 추가해보세요.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}