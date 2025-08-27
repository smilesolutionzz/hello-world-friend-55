import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Calendar,
  Phone,
  Mail,
  User,
  GraduationCap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InstitutionMember {
  id: string;
  institution_admin_id: string;
  member_user_id?: string;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  birth_date?: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  notes?: string;
  custom_fields: any;
  created_at: string;
  updated_at: string;
  test_count?: number;
  observation_count?: number;
  last_activity?: string;
}

interface MemberFormData {
  member_name: string;
  member_email: string;
  member_phone: string;
  birth_date: string;
  status: 'active' | 'inactive' | 'graduated';
  notes: string;
  grade?: string;
  parent_name?: string;
  parent_phone?: string;
  emergency_contact?: string;
}

interface MemberManagementProps {
  adminId: string;
}

export default function MemberManagement({ adminId }: MemberManagementProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<InstitutionMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<InstitutionMember | null>(null);
  const [formData, setFormData] = useState<MemberFormData>({
    member_name: '',
    member_email: '',
    member_phone: '',
    birth_date: '',
    status: 'active',
    notes: '',
    grade: '',
    parent_name: '',
    parent_phone: '',
    emergency_contact: ''
  });

  useEffect(() => {
    fetchMembers();
  }, [adminId]);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, statusFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('institution_members')
        .select('*')
        .eq('institution_admin_id', adminId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 각 회원의 활동 데이터도 가져오기
      const membersWithActivity = await Promise.all(
        data.map(async (member) => {
          let testCount = 0;
          let observationCount = 0;
          let lastActivity = member.created_at;

          if (member.member_user_id) {
            // 테스트 수 조회
            const { count: tests } = await supabase
              .from('test_results')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', member.member_user_id);

            // 관찰일지 수 조회
            const { count: observations } = await supabase
              .from('observation_logs')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', member.member_user_id);

            // 최근 활동 조회
            const { data: recentActivity } = await supabase
              .from('test_results')
              .select('completed_at')
              .eq('user_id', member.member_user_id)
              .order('completed_at', { ascending: false })
              .limit(1);

            testCount = tests || 0;
            observationCount = observations || 0;
            
            if (recentActivity && recentActivity.length > 0) {
              lastActivity = recentActivity[0].completed_at;
            }
          }

          return {
            ...member,
            test_count: testCount,
            observation_count: observationCount,
            last_activity: lastActivity
          };
        })
      );

      setMembers(membersWithActivity);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      toast({
        title: "회원 조회 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.member_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.member_phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
  };

  const resetForm = () => {
    setFormData({
      member_name: '',
      member_email: '',
      member_phone: '',
      birth_date: '',
      status: 'active',
      notes: '',
      grade: '',
      parent_name: '',
      parent_phone: '',
      emergency_contact: ''
    });
    setEditingMember(null);
  };

  const handleAddMember = async () => {
    try {
      if (!formData.member_name.trim()) {
        toast({
          title: "입력 오류",
          description: "회원명은 필수입니다.",
          variant: "destructive",
        });
        return;
      }

      const customFields = {
        grade: formData.grade,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        emergency_contact: formData.emergency_contact
      };

      const { error } = await supabase
        .from('institution_members')
        .insert({
          institution_admin_id: adminId,
          member_user_id: '', // 빈 문자열로 설정
          member_name: formData.member_name,
          member_email: formData.member_email || null,
          member_phone: formData.member_phone || null,
          birth_date: formData.birth_date || null,
          status: formData.status,
          notes: formData.notes || null,
          custom_fields: customFields
        });

      if (error) throw error;

      toast({
        title: "회원 등록 완료",
        description: `${formData.member_name} 회원이 등록되었습니다.`,
      });

      setShowAddDialog(false);
      resetForm();
      fetchMembers();
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast({
        title: "회원 등록 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    try {
      const customFields = {
        grade: formData.grade,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        emergency_contact: formData.emergency_contact
      };

      const { error } = await supabase
        .from('institution_members')
        .update({
          member_name: formData.member_name,
          member_email: formData.member_email || null,
          member_phone: formData.member_phone || null,
          birth_date: formData.birth_date || null,
          status: formData.status,
          notes: formData.notes || null,
          custom_fields: customFields
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      toast({
        title: "회원 정보 수정 완료",
        description: `${formData.member_name} 회원 정보가 수정되었습니다.`,
      });

      setEditingMember(null);
      resetForm();
      fetchMembers();
    } catch (error: any) {
      console.error('Error editing member:', error);
      toast({
        title: "회원 정보 수정 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (member: InstitutionMember) => {
    if (!confirm(`${member.member_name} 회원을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('institution_members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      toast({
        title: "회원 삭제 완료",
        description: `${member.member_name} 회원이 삭제되었습니다.`,
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error deleting member:', error);
      toast({
        title: "회원 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (member: InstitutionMember) => {
    setEditingMember(member);
    setFormData({
      member_name: member.member_name,
      member_email: member.member_email || '',
      member_phone: member.member_phone || '',
      birth_date: member.birth_date || '',
      status: member.status,
      notes: member.notes || '',
      grade: member.custom_fields?.grade || '',
      parent_name: member.custom_fields?.parent_name || '',
      parent_phone: member.custom_fields?.parent_phone || '',
      emergency_contact: member.custom_fields?.emergency_contact || ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />활성</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />비활성</Badge>;
      case 'graduated':
        return <Badge className="bg-blue-100 text-blue-800"><GraduationCap className="w-3 h-3 mr-1" />졸업</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age}세`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">회원 관리</h2>
          <p className="text-muted-foreground">기관 회원들을 등록하고 관리하세요</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="w-4 h-4 mr-2" />
              새 회원 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? '회원 정보 수정' : '새 회원 등록'}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? '회원 정보를 수정하세요.' : '기관에 새로운 회원을 등록하세요.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member_name">회원명 *</Label>
                  <Input
                    id="member_name"
                    value={formData.member_name}
                    onChange={(e) => setFormData({...formData, member_name: e.target.value})}
                    placeholder="회원명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="status">상태</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                      <SelectItem value="graduated">졸업</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member_email">이메일</Label>
                  <Input
                    id="member_email"
                    type="email"
                    value={formData.member_email}
                    onChange={(e) => setFormData({...formData, member_email: e.target.value})}
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="member_phone">전화번호</Label>
                  <Input
                    id="member_phone"
                    value={formData.member_phone}
                    onChange={(e) => setFormData({...formData, member_phone: e.target.value})}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birth_date">생년월일</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="grade">학년/반</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    placeholder="예: 3학년 2반"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parent_name">보호자명</Label>
                  <Input
                    id="parent_name"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
                    placeholder="보호자명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="parent_phone">보호자 연락처</Label>
                  <Input
                    id="parent_phone"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                    placeholder="보호자 연락처를 입력하세요"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency_contact">비상연락처</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  placeholder="비상연락처를 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="추가 메모사항을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  setEditingMember(null);
                  resetForm();
                }}>
                  취소
                </Button>
                <Button onClick={editingMember ? handleEditMember : handleAddMember}>
                  {editingMember ? '수정' : '등록'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="회원명, 이메일, 전화번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="상태별 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
            <SelectItem value="graduated">졸업</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>등록된 회원 목록</CardTitle>
          <CardDescription>
            총 {filteredMembers.length}명의 회원
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">회원 목록을 불러오는 중...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회원명</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>나이</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead>활동</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium">{member.member_name}</div>
                      {member.custom_fields?.grade && (
                        <div className="text-sm text-muted-foreground">{member.custom_fields.grade}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {member.member_email && (
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-1" />
                            {member.member_email}
                          </div>
                        )}
                        {member.member_phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1" />
                            {member.member_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {calculateAge(member.birth_date || '')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(member.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(member.enrollment_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">검사: {member.test_count || 0}회</div>
                        <div className="text-sm">관찰: {member.observation_count || 0}회</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            openEditDialog(member);
                            setShowAddDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMember(member)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <User className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">등록된 회원이 없습니다.</p>
                      <p className="text-sm text-muted-foreground">새 회원 등록 버튼을 눌러 회원을 추가하세요.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}