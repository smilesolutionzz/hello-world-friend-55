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
  Building, 
  Plus, 
  Trash2, 
  Edit, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Users,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  address: string;
  phone?: string;
  email?: string;
  website_url?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  established_year?: number;
  total_experts: number;
  rating: number;
  review_count: number;
  services_offered: string[];
  specializations: string[];
  facilities: string[];
  parking_available: boolean;
  partnership_status: string;
  created_at: string;
}

interface InstitutionFormData {
  name: string;
  institution_type: string;
  address: string;
  phone: string;
  email: string;
  website_url: string;
  description: string;
  established_year: number;
  services_offered: string;
  specializations: string;
  facilities: string;
  parking_available: boolean;
}

export function InstitutionManagement() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [formData, setFormData] = useState<InstitutionFormData>({
    name: '',
    institution_type: 'development_center',
    address: '',
    phone: '',
    email: '',
    website_url: '',
    description: '',
    established_year: new Date().getFullYear(),
    services_offered: '',
    specializations: '',
    facilities: '',
    parking_available: true
  });
  const { toast } = useToast();

  const institutionTypes = [
    { value: 'development_center', label: '발달센터' },
    { value: 'counseling_center', label: '상담센터' },
    { value: 'hospital', label: '병원' },
    { value: 'clinic', label: '의원' },
    { value: 'therapy_center', label: '치료센터' },
    { value: 'education_center', label: '교육센터' }
  ];

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partner_institutions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('제휴기관 목록 조회 실패:', error);
      toast({
        title: "조회 실패",
        description: "제휴기관 목록을 불러올 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const institutionData = {
        ...formData,
        services_offered: formData.services_offered.split(',').map(s => s.trim()).filter(s => s),
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
        facilities: formData.facilities.split(',').map(s => s.trim()).filter(s => s),
        partnership_status: 'active',
        total_experts: 0,
        rating: 0,
        review_count: 0
      };

      if (editingInstitution) {
        // 수정
        const { error } = await supabase
          .from('partner_institutions')
          .update(institutionData)
          .eq('id', editingInstitution.id);

        if (error) throw error;

        toast({
          title: "제휴기관 정보 수정",
          description: "제휴기관 정보가 성공적으로 수정되었습니다.",
        });
      } else {
        // 새 기관 추가
        const { error } = await supabase
          .from('partner_institutions')
          .insert([institutionData]);

        if (error) throw error;

        toast({
          title: "제휴기관 등록",
          description: "새 제휴기관이 성공적으로 등록되었습니다.",
        });
      }

      setIsDialogOpen(false);
      setEditingInstitution(null);
      resetForm();
      fetchInstitutions();
    } catch (error) {
      console.error('제휴기관 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "제휴기관 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (institution: Institution) => {
    setEditingInstitution(institution);
    setFormData({
      name: institution.name,
      institution_type: institution.institution_type,
      address: institution.address,
      phone: institution.phone || '',
      email: institution.email || '',
      website_url: institution.website_url || '',
      description: institution.description || '',
      established_year: institution.established_year || new Date().getFullYear(),
      services_offered: institution.services_offered.join(', '),
      specializations: institution.specializations.join(', '),
      facilities: institution.facilities.join(', '),
      parking_available: institution.parking_available
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (institutionId: string) => {
    if (!confirm('정말로 이 제휴기관을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('partner_institutions')
        .delete()
        .eq('id', institutionId);

      if (error) throw error;

      toast({
        title: "제휴기관 삭제",
        description: "제휴기관이 성공적으로 삭제되었습니다.",
      });

      fetchInstitutions();
    } catch (error) {
      console.error('제휴기관 삭제 실패:', error);
      toast({
        title: "삭제 실패",
        description: "제휴기관 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const togglePartnershipStatus = async (institutionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('partner_institutions')
        .update({ partnership_status: newStatus })
        .eq('id', institutionId);

      if (error) throw error;

      toast({
        title: "제휴 상태 변경",
        description: `제휴 상태가 ${newStatus === 'active' ? '활성' : '비활성'}으로 변경되었습니다.`,
      });

      fetchInstitutions();
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
      name: '',
      institution_type: 'development_center',
      address: '',
      phone: '',
      email: '',
      website_url: '',
      description: '',
      established_year: new Date().getFullYear(),
      services_offered: '',
      specializations: '',
      facilities: '',
      parking_available: true
    });
  };

  const openAddDialog = () => {
    setEditingInstitution(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getInstitutionTypeName = (type: string) => {
    return institutionTypes.find(t => t.value === type)?.label || type;
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>제휴기관 관리</CardTitle>
          <CardDescription>플랫폼의 제휴기관을 등록하고 관리합니다</CardDescription>
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
              <Building className="h-5 w-5" />
              제휴기관 관리
            </CardTitle>
            <CardDescription>플랫폼의 제휴기관을 등록하고 관리합니다</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                제휴기관 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingInstitution ? '제휴기관 정보 수정' : '새 제휴기관 등록'}
                </DialogTitle>
                <DialogDescription>
                  제휴기관의 상세 정보를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="name">기관명 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="institution_type">기관 유형 *</Label>
                    <Select 
                      value={formData.institution_type} 
                      onValueChange={(value) => setFormData({...formData, institution_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {institutionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="established_year">설립년도</Label>
                    <Input
                      id="established_year"
                      type="number"
                      value={formData.established_year}
                      onChange={(e) => setFormData({...formData, established_year: parseInt(e.target.value) || new Date().getFullYear()})}
                    />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="address">주소 *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
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
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="website_url">웹사이트</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">기관 소개</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="기관에 대한 간단한 소개를 입력해주세요"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="services_offered">제공 서비스 (쉼표로 구분)</Label>
                  <Input
                    id="services_offered"
                    value={formData.services_offered}
                    onChange={(e) => setFormData({...formData, services_offered: e.target.value})}
                    placeholder="예: 언어치료, 인지치료, 작업치료"
                  />
                </div>
                
                <div>
                  <Label htmlFor="specializations">전문 분야 (쉼표로 구분)</Label>
                  <Input
                    id="specializations"
                    value={formData.specializations}
                    onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                    placeholder="예: 자폐스펙트럼, ADHD, 언어발달지연"
                  />
                </div>
                
                <div>
                  <Label htmlFor="facilities">시설 (쉼표로 구분)</Label>
                  <Input
                    id="facilities"
                    value={formData.facilities}
                    onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                    placeholder="예: 개별치료실, 그룹치료실, 놀이치료실"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="parking_available"
                    checked={formData.parking_available}
                    onChange={(e) => setFormData({...formData, parking_available: e.target.checked})}
                  />
                  <Label htmlFor="parking_available">주차장 이용 가능</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit">
                    {editingInstitution ? '수정' : '등록'}
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
                <TableHead>기관명</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>주소</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>서비스</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{institution.name}</div>
                      {institution.established_year && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {institution.established_year}년 설립
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getInstitutionTypeName(institution.institution_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {institution.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {institution.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {institution.phone}
                        </div>
                      )}
                      {institution.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {institution.email}
                        </div>
                      )}
                      {institution.website_url && (
                        <div className="flex items-center gap-1 text-sm">
                          <Globe className="h-3 w-3" />
                          <a href={institution.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            웹사이트
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {institution.services_offered.slice(0, 2).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {institution.services_offered.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{institution.services_offered.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant={institution.partnership_status === 'active' ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => togglePartnershipStatus(institution.id, institution.partnership_status)}
                      >
                        {institution.partnership_status === 'active' ? '활성' : '비활성'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {institution.rating} ({institution.review_count})
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(institution)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(institution.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {institutions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">등록된 제휴기관이 없습니다.</p>
              <p className="text-sm text-muted-foreground">첫 번째 제휴기관을 추가해보세요.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}