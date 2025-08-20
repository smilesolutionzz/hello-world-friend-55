import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  UserPlus,
  Baby,
  Users as ChildIcon,
  UserCheck,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  display_name: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  role: string;
}

interface FamilyMember {
  id: string;
  relationship: string;
  is_primary_caregiver: boolean;
  profile: Profile;
}

interface Family {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  family_members: FamilyMember[];
}

interface FamilyManagementProps {
  families: Family[];
  onUpdate: () => void;
}

const FamilyManagement = ({ families, onUpdate }: FamilyManagementProps) => {
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [familyData, setFamilyData] = useState({
    name: "",
    description: ""
  });

  const [memberData, setMemberData] = useState({
    displayName: "",
    phone: "",
    birthDate: "",
    gender: "",
    relationship: "",
    isPrimaryCaregiver: false
  });

  const createFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("사용자 인증이 필요합니다.");

      // Get current user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error("사용자 프로필을 찾을 수 없습니다.");

      // For now, create family members directly without families table
      const familyId = crypto.randomUUID();

      // Family created successfully

      // Add creator as primary caregiver
      await supabase
        .from('family_members')
        .insert({
          family_id: familyId,
          user_id: user.id,
          name: familyData.name,
          relationship: 'parent'
        });

      setFamilyData({ name: "", description: "" });
      setShowCreateFamily(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const addFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("사용자 인증이 필요합니다.");

      // Create a temporary user account for the family member
      // In a real app, you might want to send an invitation instead
      const tempPassword = Math.random().toString(36).substring(2, 15);
      const tempEmail = `temp_${Date.now()}@family.local`;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        user_metadata: {
          display_name: memberData.displayName,
          phone: memberData.phone,
          birth_date: memberData.birthDate,
          gender: memberData.gender,
          is_family_member: true
        }
      });

      if (authError) {
        // If admin functions aren't available, create profile directly
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id, // Temporary - in real app, this would be the new user's ID
            display_name: memberData.displayName,
            phone: memberData.phone,
            birth_date: memberData.birthDate,
            gender: memberData.gender,
            role: 'child'
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // Add to family
        await supabase
          .from('family_members')
          .insert({
            family_id: selectedFamily,
            user_id: user.id,
            name: memberData.displayName,
            relationship: memberData.relationship,
            age: memberData.birthDate ? Math.floor((Date.now() - new Date(memberData.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null
          });
      }

      setMemberData({
        displayName: "",
        phone: "",
        birthDate: "",
        gender: "",
        relationship: "",
        isPrimaryCaregiver: false
      });
      setShowAddMember(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getAgeGroupIcon = (birthDate?: string) => {
    if (!birthDate) return <UserCheck className="w-4 h-4" />;
    
    const age = getAgeFromBirthDate(birthDate);
    if (age < 3) return <Baby className="w-4 h-4" />;
    if (age < 18) return <ChildIcon className="w-4 h-4" />;
    return <UserCheck className="w-4 h-4" />;
  };

  const getAgeGroupLabel = (birthDate?: string) => {
    if (!birthDate) return "연령 미입력";
    
    const age = getAgeFromBirthDate(birthDate);
    if (age < 3) return `유아 (${age}세)`;
    if (age < 18) return `아동/청소년 (${age}세)`;
    return `성인 (${age}세)`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">가족 관리</h2>
        <Dialog open={showCreateFamily} onOpenChange={setShowCreateFamily}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              새 가족 만들기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 가족 만들기</DialogTitle>
            </DialogHeader>
            <form onSubmit={createFamily} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family-name">가족 이름</Label>
                <Input
                  id="family-name"
                  placeholder="예: 김씨 가족"
                  value={familyData.name}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="family-description">설명 (선택)</Label>
                <Textarea
                  id="family-description"
                  placeholder="가족에 대한 간단한 설명"
                  value={familyData.description}
                  onChange={(e) => setFamilyData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "생성 중..." : "가족 만들기"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="border-destructive/50 text-destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Family List */}
      {families.length > 0 ? (
        <div className="space-y-6">
          {families.map(family => (
            <Card key={family.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{family.name}</h3>
                  {family.description && (
                    <p className="text-muted-foreground text-sm">{family.description}</p>
                  )}
                </div>
                
                <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFamily(family.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      구성원 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>가족 구성원 추가</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={addFamilyMember} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="member-name">이름</Label>
                        <Input
                          id="member-name"
                          placeholder="구성원 이름"
                          value={memberData.displayName}
                          onChange={(e) => setMemberData(prev => ({ ...prev, displayName: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="member-relationship">관계</Label>
                        <Select 
                          value={memberData.relationship}
                          onValueChange={(value) => setMemberData(prev => ({ ...prev, relationship: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="관계를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">부모</SelectItem>
                            <SelectItem value="child">자녀</SelectItem>
                            <SelectItem value="spouse">배우자</SelectItem>
                            <SelectItem value="sibling">형제자매</SelectItem>
                            <SelectItem value="grandparent">조부모</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="member-birth">생년월일</Label>
                        <Input
                          id="member-birth"
                          type="date"
                          value={memberData.birthDate}
                          onChange={(e) => setMemberData(prev => ({ ...prev, birthDate: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="member-gender">성별</Label>
                        <Select 
                          value={memberData.gender}
                          onValueChange={(value) => setMemberData(prev => ({ ...prev, gender: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="성별을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">남성</SelectItem>
                            <SelectItem value="female">여성</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="member-phone">전화번호 (선택)</Label>
                        <Input
                          id="member-phone"
                          type="tel"
                          placeholder="전화번호"
                          value={memberData.phone}
                          onChange={(e) => setMemberData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "추가 중..." : "구성원 추가"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {family.family_members.map(member => (
                  <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          {getAgeGroupIcon(member.profile.birth_date)}
                        </div>
                        <div>
                          <h4 className="font-medium">{member.profile.display_name}</h4>
                          <p className="text-sm text-muted-foreground">{member.relationship}</p>
                        </div>
                      </div>
                      {member.is_primary_caregiver && (
                        <Badge variant="outline" className="text-xs">
                          주 보호자
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">
                        {getAgeGroupLabel(member.profile.birth_date)}
                      </Badge>
                      
                      {member.profile.phone && (
                        <p className="text-xs text-muted-foreground">
                          📞 {member.profile.phone}
                        </p>
                      )}
                      
                      {member.profile.birth_date && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(member.profile.birth_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">아직 가족이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            첫 번째 가족을 만들어 통합 케어를 시작해보세요
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            첫 번째 가족 만들기
          </Button>
        </Card>
      )}
    </div>
  );
};

export default FamilyManagement;