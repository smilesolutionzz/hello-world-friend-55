import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Plus, Edit, Save, X, Clock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface ExpertNote {
  id: string;
  text: string;
  author_id: string;
  is_visible_to_family: boolean;
  created_at: string;
  updated_at: string;
  author_profile?: {
    display_name: string;
  };
}

interface ExpertNotesPanelProps {
  observationId: string;
  isSubscriber?: boolean;
}

const ExpertNotesPanel = ({ observationId, isSubscriber = false }: ExpertNotesPanelProps) => {
  const [notes, setNotes] = useState<ExpertNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [editNoteText, setEditNoteText] = useState('');
  const [isVisibleToFamily, setIsVisibleToFamily] = useState(false);
  const { toast } = useToast();
  const { userRole, canWriteExpertNotes, canViewExpertNotes } = useUserRole();

  useEffect(() => {
    if (canViewExpertNotes()) {
      loadExpertNotes();
    }
  }, [observationId, canViewExpertNotes]);

  const loadExpertNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_notes')
        .select(`
          id,
          text,
          author_id,
          is_visible_to_family,
          created_at,
          updated_at
        `)
        .eq('observation_id', observationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get author profiles separately
      const authorIds = data?.map(note => note.author_id) || [];
      if (authorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', authorIds);

        if (profilesError) throw profilesError;

        const notesWithProfiles = data?.map(note => {
          const profile = profiles?.find(p => p.user_id === note.author_id);
          return {
            id: note.id,
            text: note.text,
            author_id: note.author_id,
            is_visible_to_family: note.is_visible_to_family,
            created_at: note.created_at,
            updated_at: note.updated_at,
            author_profile: profile ? {
              display_name: profile.display_name
            } : { display_name: '알 수 없음' }
          };
        }) || [];

        setNotes(notesWithProfiles);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading expert notes:', error);
      toast({
        title: "오류",
        description: "전문가 메모를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim()) {
      toast({
        title: "입력 오류",
        description: "메모 내용을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('expert_notes')
        .insert({
          observation_id: observationId,
          author_id: user.id,
          text: newNoteText,
          is_visible_to_family: isVisibleToFamily
        });

      if (error) throw error;

      toast({
        title: "메모 저장",
        description: "전문가 메모가 저장되었습니다."
      });

      setNewNoteText('');
      setIsVisibleToFamily(false);
      setIsWriting(false);
      loadExpertNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "오류",
        description: "메모 저장에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editNoteText.trim()) {
      toast({
        title: "입력 오류",
        description: "메모 내용을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('expert_notes')
        .update({ text: editNoteText })
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: "메모 수정",
        description: "전문가 메모가 수정되었습니다."
      });

      setEditingId(null);
      setEditNoteText('');
      loadExpertNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "오류",
        description: "메모 수정에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const startEdit = (note: ExpertNote) => {
    setEditingId(note.id);
    setEditNoteText(note.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNoteText('');
  };

  const toggleVisibility = async (noteId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('expert_notes')
        .update({ is_visible_to_family: !currentVisibility })
        .eq('id', noteId);

      if (error) throw error;

      loadExpertNotes();
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "오류",
        description: "공개 설정 변경에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  if (!isSubscriber) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-2">구독자 전용 기능</h3>
          <p className="text-sm text-muted-foreground">
            전문가 메모는 구독자만 이용할 수 있습니다.
          </p>
        </div>
      </Card>
    );
  }

  if (!canViewExpertNotes()) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-2">접근 권한 없음</h3>
          <p className="text-sm text-muted-foreground">
            전문가 메모를 볼 권한이 없습니다.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            전문가 메모
          </h3>
          {canWriteExpertNotes() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWriting(!isWriting)}
            >
              {isWriting ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  취소
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  메모 작성
                </>
              )}
            </Button>
          )}
        </div>

        {isWriting && (
          <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Textarea
              placeholder="전문가 의견을 작성해주세요..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              rows={4}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="family-visible"
                  checked={isVisibleToFamily}
                  onCheckedChange={setIsVisibleToFamily}
                />
                <Label htmlFor="family-visible" className="text-sm">
                  가족에게 공개
                </Label>
              </div>
              <Button onClick={handleSaveNote}>
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">로딩 중...</p>
            </div>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {note.author_profile?.display_name}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleDateString('ko-KR')}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(note.id, note.is_visible_to_family)}
                      className="h-6 px-2"
                    >
                      {note.is_visible_to_family ? (
                        <Eye className="w-3 h-3 text-green-600" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {canWriteExpertNotes() && note.author_id === userRole && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(note)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        취소
                      </Button>
                      <Button size="sm" onClick={() => handleEditNote(note.id)}>
                        저장
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{note.text}</p>
                )}
                
                {note.updated_at !== note.created_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    수정됨: {new Date(note.updated_at).toLocaleDateString('ko-KR')}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-medium mb-2">작성된 메모가 없습니다</h4>
              <p className="text-sm text-muted-foreground">
                {canWriteExpertNotes() 
                  ? "첫 번째 전문가 메모를 작성해보세요." 
                  : "전문가가 메모를 작성하면 여기에 표시됩니다."
                }
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExpertNotesPanel;