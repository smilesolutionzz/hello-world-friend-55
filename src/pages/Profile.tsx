import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Calendar, Building2, Crown, Edit2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProfileData {
  display_name: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  account_type: string | null;
  subscription_tier: string | null;
  organization_name: string | null;
}

const Profile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: null,
    email: null,
    phone: null,
    birth_date: null,
    account_type: null,
    subscription_tier: null,
    organization_name: null,
  });
  const [editedData, setEditedData] = useState<ProfileData>(profileData);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          display_name,
          email,
          phone,
          birth_date,
          account_type,
          subscription_tier,
          organization_id,
          organizations (
            name
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        const data = {
          display_name: profile.display_name,
          email: profile.email,
          phone: profile.phone,
          birth_date: profile.birth_date,
          account_type: profile.account_type,
          subscription_tier: profile.subscription_tier,
          organization_name: (profile as any).organizations?.name || null,
        };
        setProfileData(data);
        setEditedData(data);
      }
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      toast({
        title: "오류",
        description: "프로필 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editedData.display_name,
          phone: editedData.phone,
          birth_date: editedData.birth_date,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfileData(editedData);
      setEditing(false);
      toast({
        title: "성공",
        description: "프로필이 업데이트되었습니다.",
      });
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      toast({
        title: "오류",
        description: "프로필 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setEditing(false);
  };

  const getAccountTypeLabel = (type: string | null) => {
    const types: Record<string, string> = {
      parent: '부모',
      teacher: '교사',
      therapist: '치료사',
      admin: '관리자',
    };
    return type ? types[type] || type : '-';
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                프로필
              </CardTitle>
              <CardDescription>내 프로필 정보를 확인하고 수정할 수 있습니다</CardDescription>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                수정
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 프로필 사진 */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary/10">
                {getInitials(profileData.display_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{profileData.display_name || '이름 없음'}</h3>
              <p className="text-muted-foreground text-sm">{profileData.email || '이메일 없음'}</p>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display_name">이름</Label>
                {editing ? (
                  <Input
                    id="display_name"
                    value={editedData.display_name || ''}
                    onChange={(e) => setEditedData({ ...editedData, display_name: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {profileData.display_name || '-'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {profileData.email || '-'}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                {editing ? (
                  <Input
                    id="phone"
                    value={editedData.phone || ''}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    placeholder="010-0000-0000"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {profileData.phone || '-'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">생년월일</Label>
                {editing ? (
                  <Input
                    id="birth_date"
                    type="date"
                    value={editedData.birth_date || ''}
                    onChange={(e) => setEditedData({ ...editedData, birth_date: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {profileData.birth_date || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="pt-4 border-t space-y-4">
            <h4 className="font-semibold">계정 정보</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>계정 유형</Label>
                <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {getAccountTypeLabel(profileData.account_type)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>구독 등급</Label>
                <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted/50">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  {profileData.subscription_tier || '무료'}
                </div>
              </div>

              {profileData.organization_name && (
                <div className="space-y-2 md:col-span-2">
                  <Label>소속 기관</Label>
                  <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted/50">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {profileData.organization_name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
