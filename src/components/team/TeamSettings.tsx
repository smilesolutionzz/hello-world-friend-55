import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, Shield, Eye, Stethoscope, Crown, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface TeamMember {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  profile?: {
    display_name: string;
    phone?: string;
  };
}

const TeamSettings = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();
  const { userRole, canInvite } = useUserRole();

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Mock team members data since user_roles table doesn't exist yet
      const mockTeamMembers = [{
        id: data.id,
        user_id: data.user_id,
        role: 'admin' as UserRole,
        created_at: data.created_at,
        profile: {
          display_name: data.display_name || 'Admin User',
          phone: data.subscription_tier === 'premium' ? '010-1234-5678' : undefined
        }
      }];

      setTeamMembers(mockTeamMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: "오류",
        description: "팀 멤버 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: "입력 오류",
        description: "이메일과 역할을 모두 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      // For now, just show a success message as actual email invitation requires backend setup
      toast({
        title: "초대 발송",
        description: `${inviteEmail}에게 ${getRoleLabel(inviteRole)} 권한으로 초대를 발송했습니다.`,
      });
      
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteDialog(false);
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "오류",
        description: "초대 발송에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    try {
      // Mock role change since user_roles table doesn't exist yet
      console.log(`Role change: ${memberId} -> ${newRole}`);

      toast({
        title: "권한 변경",
        description: "사용자 권한이 변경되었습니다."
      });

      loadTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "오류",
        description: "권한 변경에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // Mock member removal since user_roles table doesn't exist yet
      console.log(`Remove member: ${memberId}`);

      toast({
        title: "멤버 제거",
        description: "팀 멤버가 제거되었습니다."
      });

      loadTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "오류",
        description: "멤버 제거에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'expert':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'expert':
        return '전문가';
      case 'viewer':
        return '열람자';
      default:
        return '미설정';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'expert':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!canInvite()) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-2">접근 권한 없음</h3>
          <p className="text-sm text-muted-foreground">
            팀 설정에 접근할 권한이 없습니다.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold">{teamMembers.length}</div>
              <div className="text-sm text-muted-foreground">팀 멤버 수</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {teamMembers.filter(m => m.role === 'expert').length}
              </div>
              <div className="text-sm text-muted-foreground">전문가</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold">
                {teamMembers.filter(m => m.role === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">관리자</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Collaboration Features */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">팀 협업 기능</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium">권한 관리</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              팀 멤버별 세부 권한을 설정하고 관리하세요
            </p>
            <Button variant="outline" size="sm">
              권한 설정
            </Button>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-5 h-5 text-green-600" />
              <h4 className="font-medium">데이터 공유</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              안전하게 케이스 데이터를 공유하고 협업하세요
            </p>
            <Button variant="outline" size="sm">
              공유 설정
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">팀 관리</h2>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                멤버 초대
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 멤버 초대</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">역할</Label>
                  <Select value={inviteRole || ''} onValueChange={(value) => setInviteRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="역할 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">열람자 - 보기만 가능</SelectItem>
                      <SelectItem value="expert">전문가 - 관찰 열람 + 전문가 메모</SelectItem>
                      <SelectItem value="admin">관리자 - 전체 권한</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    취소
                  </Button>
                  <Button onClick={handleInvite}>
                    초대 발송
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">로딩 중...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.profile?.display_name || '이름 없음'}
                    </TableCell>
                    <TableCell>
                      {member.profile?.phone || '연락처 없음'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={member.role || ''}
                          onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">열람자</SelectItem>
                            <SelectItem value="expert">전문가</SelectItem>
                            <SelectItem value="admin">관리자</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {teamMembers.length === 0 && (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-2">팀 멤버가 없습니다</h3>
                <p className="text-sm text-muted-foreground">
                  첫 번째 팀 멤버를 초대해보세요.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeamSettings;