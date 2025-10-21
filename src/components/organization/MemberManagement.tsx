import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface MemberManagementProps {
  organizationId: string;
}

interface Member {
  id: string;
  user_id: string;
  member_identifier: string;
  name: string;
  added_at: string;
}

export const MemberManagement = ({ organizationId }: MemberManagementProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    userEmail: '',
    memberIdentifier: '',
    name: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: '오류',
        description: '멤버 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      // 이메일로 사용자 검색
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', newMember.userEmail)
        .single();

      if (userError) {
        toast({
          title: '사용자를 찾을 수 없습니다',
          description: '해당 이메일로 등록된 사용자가 없습니다.',
          variant: 'destructive'
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: userData.user_id,
          member_identifier: newMember.memberIdentifier,
          name: newMember.name,
          added_by: user?.id
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: '이미 등록된 멤버',
            description: '해당 사용자는 이미 등록되어 있습니다.',
            variant: 'destructive'
          });
          return;
        }
        throw error;
      }

      toast({
        title: '멤버 추가 완료',
        description: '새로운 멤버가 추가되었습니다.'
      });

      setIsAddDialogOpen(false);
      setNewMember({ userEmail: '', memberIdentifier: '', name: '' });
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: '오류',
        description: '멤버 추가에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('정말로 이 멤버를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: '멤버 삭제 완료',
        description: '멤버가 삭제되었습니다.'
      });

      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: '오류',
        description: '멤버 삭제에 실패했습니다.',
        variant: 'destructive'
      });
    }
  };

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.member_identifier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>멤버 관리</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                멤버 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 멤버 추가</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>사용자 이메일</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newMember.userEmail}
                    onChange={(e) => setNewMember({ ...newMember, userEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>멤버 식별자 (학번/사번 등)</Label>
                  <Input
                    placeholder="예: 2024001"
                    value={newMember.memberIdentifier}
                    onChange={(e) => setNewMember({ ...newMember, memberIdentifier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>이름</Label>
                  <Input
                    placeholder="홍길동"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddMember} className="w-full">
                  추가
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="이름 또는 식별자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>식별자</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      등록된 멤버가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map(member => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name || '-'}</TableCell>
                      <TableCell>{member.member_identifier || '-'}</TableCell>
                      <TableCell>{new Date(member.added_at).toLocaleDateString('ko-KR')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
