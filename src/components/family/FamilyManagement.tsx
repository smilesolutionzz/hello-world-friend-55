import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  User, 
  Baby, 
  Calendar,
  Heart,
  Brain,
  Phone,
  Mail,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
  email?: string;
  is_primary_caregiver: boolean;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

interface FamilyManagementProps {
  onUpdate?: () => void;
}

const FamilyManagement: React.FC<FamilyManagementProps> = ({ onUpdate }) => {
  const { user } = useAuthGuard();
  const { toast } = useToast();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birth_date: '',
    gender: '',
    phone: '',
    email: '',
    is_primary_caregiver: false,
    notes: ''
  });

  const relationshipOptions = [
    { value: 'parent', label: '부모' },
    { value: 'spouse', label: '배우자' },
    { value: 'child', label: '자녀' },
    { value: 'sibling', label: '형제/자매' },
    { value: 'grandparent', label: '조부모' },
    { value: 'other', label: '기타' }
  ];

  const loadFamilyMembers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map old data structure to new interface
      const mappedData = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        relationship: item.relationship,
        birth_date: item.birth_date,
        gender: item.gender,
        phone: item.phone,
        email: item.email,
        is_primary_caregiver: item.is_primary_caregiver || false,
        notes: item.notes,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setFamilyMembers(mappedData);
    } catch (error) {
      console.error('Error loading family members:', error);
      toast({
        title: '오류',
        description: '가족 구성원을 불러올 수 없습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamilyMembers();
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      birth_date: '',
      gender: '',
      phone: '',
      email: '',
      is_primary_caregiver: false,
      notes: ''
    });
    setEditingMember(null);
  };

  const handleSave = async () => {
    if (!user || !formData.name || !formData.relationship) {
      toast({
        title: '입력 오류',
        description: '이름과 관계는 필수 입력 항목입니다.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingMember) {
        // Update existing member
        const { error } = await supabase
          .from('family_members')
          .update({
            ...formData,
            birth_date: formData.birth_date || null
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        
        toast({
          title: '수정 완료',
          description: '가족 구성원 정보가 수정되었습니다.'
        });
      } else {
        // Add new member
        const { error } = await supabase
          .from('family_members')
          .insert({
            ...formData,
            user_id: user.id,
            birth_date: formData.birth_date || null
          });

        if (error) throw error;
        
        toast({
          title: '추가 완료',
          description: '새 가족 구성원이 추가되었습니다.'
        });
      }

      resetForm();
      setShowAddModal(false);
      loadFamilyMembers();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving family member:', error);
      toast({
        title: '오류',
        description: '저장 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setFormData({
      name: member.name,
      relationship: member.relationship,
      birth_date: member.birth_date || '',
      gender: member.gender || '',
      phone: member.phone || '',
      email: member.email || '',
      is_primary_caregiver: member.is_primary_caregiver,
      notes: member.notes || ''
    });
    setEditingMember(member);
    setShowAddModal(true);
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('정말로 이 가족 구성원을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      toast({
        title: '삭제 완료',
        description: '가족 구성원이 삭제되었습니다.'
      });
      
      loadFamilyMembers();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: '오류',
        description: '삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  const getAgeFromBirthDate = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'child': return <Baby className="w-5 h-5" />;
      case 'parent': return <User className="w-5 h-5" />;
      case 'spouse': return <Heart className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">가족 관리</h2>
        </div>
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">로딩 중...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">가족 관리</h2>
          <p className="text-muted-foreground">가족 구성원의 정보를 관리하고 통합 케어를 제공하세요</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              구성원 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? '구성원 정보 수정' : '새 구성원 추가'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="이름을 입력하세요"
                />
              </div>
              
              <div>
                <Label htmlFor="relationship">관계 *</Label>
                <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="관계를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="birth_date">생년월일</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="gender">성별</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">남성</SelectItem>
                    <SelectItem value="female">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="전화번호를 입력하세요"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_primary_caregiver"
                  checked={formData.is_primary_caregiver}
                  onChange={(e) => setFormData({ ...formData, is_primary_caregiver: e.target.checked })}
                />
                <Label htmlFor="is_primary_caregiver">주 보호자</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingMember ? '수정' : '추가'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Family Members Grid */}
      {familyMembers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {familyMembers.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    {getRelationshipIcon(member.relationship)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {relationshipOptions.find(r => r.value === member.relationship)?.label}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {member.birth_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{getAgeFromBirthDate(member.birth_date)}세</span>
                  </div>
                )}
                
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{member.phone}</span>
                  </div>
                )}

                {member.is_primary_caregiver && (
                  <Badge variant="secondary" className="text-xs">
                    주 보호자
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">가족 구성원을 추가해보세요</h3>
          <p className="text-muted-foreground mb-6">
            가족 구성원을 등록하여 통합 케어를 시작하세요
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            첫 번째 구성원 추가
          </Button>
        </Card>
      )}

      {/* Statistics */}
      {familyMembers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{familyMembers.length}</div>
            <div className="text-sm text-muted-foreground">등록된 구성원</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {familyMembers.filter(m => m.is_primary_caregiver).length}
            </div>
            <div className="text-sm text-muted-foreground">주 보호자</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {familyMembers.filter(m => m.relationship === 'child').length}
            </div>
            <div className="text-sm text-muted-foreground">자녀</div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;