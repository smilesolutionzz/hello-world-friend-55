import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquarePlus, Send, Eye, EyeOff, Trash2, Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

interface ExpertComment {
  id: string;
  comment_text: string;
  comment_type: string;
  highlighted_section: string | null;
  is_visible_to_parent: boolean;
  created_at: string;
  parent_viewed_at: string | null;
}

interface ExpertCommentLayerProps {
  reportShareId?: string;
  reportHistoryId?: string;
  institutionId?: string;
  isExpert?: boolean;
  isReadOnly?: boolean;
  /** 검증된 코멘트가 1개 이상 존재할 때 호출 — 'Expert Verified' 배지 활성화에 사용 */
  onVerifiedChange?: (hasVerified: boolean) => void;
}

const commentTypeLabels: Record<string, { ko: string; en: string; color: string }> = {
  general: { ko: '일반', en: 'General', color: 'bg-slate-100 text-slate-700' },
  recommendation: { ko: '권고사항', en: 'Recommendation', color: 'bg-blue-100 text-blue-700' },
  warning: { ko: '주의사항', en: 'Warning', color: 'bg-amber-100 text-amber-700' },
  followup: { ko: '추적관찰', en: 'Follow-up', color: 'bg-purple-100 text-purple-700' },
};

const ExpertCommentLayer: React.FC<ExpertCommentLayerProps> = ({
  reportShareId,
  reportHistoryId,
  institutionId,
  isExpert = false,
  isReadOnly = false,
  onVerifiedChange,
}) => {
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const t = (ko: string, en: string) => isEnglish ? en : ko;

  const [comments, setComments] = useState<ExpertComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('general');
  const [visibleToParent, setVisibleToParent] = useState(false);
  const [section, setSection] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [reportShareId, reportHistoryId]);

  // 검증 완료 코멘트(학부모 공개) 1개 이상이면 부모 컴포넌트에 통보
  useEffect(() => {
    const hasVerified = comments.some(c => c.is_visible_to_parent);
    onVerifiedChange?.(hasVerified);
  }, [comments, onVerifiedChange]);

  const fetchComments = async () => {
    setLoading(true);
    let query = supabase
      .from('expert_report_comments' as any)
      .select('*')
      .order('created_at', { ascending: true });

    if (reportShareId) query = query.eq('report_share_id', reportShareId);
    if (reportHistoryId) query = query.eq('report_history_id', reportHistoryId);

    const { data, error } = await query;
    if (!error && data) setComments(data as any[]);
    setLoading(false);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('expert_report_comments' as any)
      .insert({
        report_share_id: reportShareId || null,
        report_history_id: reportHistoryId || null,
        expert_user_id: user.id,
        institution_id: institutionId || null,
        comment_text: newComment.trim(),
        comment_type: commentType,
        highlighted_section: section || null,
        is_visible_to_parent: visibleToParent,
      } as any);

    if (error) {
      toast({ title: t('코멘트 저장 실패', 'Failed to save comment'), variant: 'destructive' });
      return;
    }

    toast({ title: t('코멘트가 저장되었습니다', 'Comment saved') });
    setNewComment('');
    setSection('');
    setShowForm(false);
    fetchComments();
  };

  const updateComment = async (id: string) => {
    if (!editText.trim()) return;
    
    const { error } = await supabase
      .from('expert_report_comments' as any)
      .update({ comment_text: editText.trim() } as any)
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchComments();
    }
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase
      .from('expert_report_comments' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setComments(prev => prev.filter(c => c.id !== id));
      toast({ title: t('코멘트가 삭제되었습니다', 'Comment deleted') });
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    const { error } = await supabase
      .from('expert_report_comments' as any)
      .update({ is_visible_to_parent: visible } as any)
      .eq('id', id);

    if (!error) {
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_visible_to_parent: visible } : c));
      toast({
        title: visible
          ? t('학부모에게 공개됩니다', 'Visible to parent')
          : t('학부모에게 비공개됩니다', 'Hidden from parent'),
      });
    }
  };

  // For parents: only show visible comments
  const visibleComments = isReadOnly
    ? comments.filter(c => c.is_visible_to_parent)
    : comments;

  if (loading) return null;

  if (isReadOnly && visibleComments.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4 text-blue-600" />
          {t('전문가 코멘트', 'Expert Comments')}
          {visibleComments.length > 0 && (
            <Badge variant="secondary" className="text-xs">{visibleComments.length}</Badge>
          )}
        </h3>
        {isExpert && !isReadOnly && (
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            {t('코멘트 추가', 'Add Comment')}
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && isExpert && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('전문가 소견을 작성하세요...', 'Write your expert comment...')}
            className="min-h-[100px] text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('유형', 'Type')}</Label>
              <Select value={commentType} onValueChange={setCommentType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(commentTypeLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {isEnglish ? val.en : val.ko}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">{t('관련 섹션', 'Section')}</Label>
              <input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder={t('예: 정서 발달', 'e.g., Emotional Development')}
                className="w-full h-8 px-3 text-xs border border-input rounded-md bg-background"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={visibleToParent}
                onCheckedChange={setVisibleToParent}
                id="visible-toggle"
              />
              <Label htmlFor="visible-toggle" className="text-xs text-slate-600">
                {visibleToParent
                  ? t('학부모에게 공개', 'Visible to parent')
                  : t('전문가만 열람', 'Expert only')}
              </Label>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-xs h-8">
                {t('취소', 'Cancel')}
              </Button>
              <Button onClick={addComment} size="sm" className="text-xs h-8 gap-1 bg-blue-600 hover:bg-blue-700">
                <Send className="w-3 h-3" /> {t('저장', 'Save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {visibleComments.map(comment => {
        const typeInfo = commentTypeLabels[comment.comment_type] || commentTypeLabels.general;
        const isEditing = editingId === comment.id;

        return (
          <div key={comment.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${typeInfo.color}`}>
                  {isEnglish ? typeInfo.en : typeInfo.ko}
                </Badge>
                {comment.highlighted_section && (
                  <span className="text-[10px] text-slate-400">
                    {t('섹션', 'Section')}: {comment.highlighted_section}
                  </span>
                )}
                {!isReadOnly && (
                  <span className="text-[10px]">
                    {comment.is_visible_to_parent
                      ? <Eye className="w-3 h-3 text-emerald-500 inline" />
                      : <EyeOff className="w-3 h-3 text-slate-400 inline" />}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(comment.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-7 text-xs">
                    <X className="w-3 h-3 mr-1" /> {t('취소', 'Cancel')}
                  </Button>
                  <Button size="sm" onClick={() => updateComment(comment.id)} className="h-7 text-xs">
                    <Check className="w-3 h-3 mr-1" /> {t('저장', 'Save')}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {comment.comment_text}
              </p>
            )}

            {isExpert && !isReadOnly && !isEditing && (
              <div className="flex gap-1 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditingId(comment.id); setEditText(comment.comment_text); }}
                  className="h-6 text-[10px] text-slate-400 hover:text-slate-600 px-2"
                >
                  <Edit2 className="w-3 h-3 mr-1" /> {t('수정', 'Edit')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVisibility(comment.id, !comment.is_visible_to_parent)}
                  className="h-6 text-[10px] text-slate-400 hover:text-slate-600 px-2"
                >
                  {comment.is_visible_to_parent
                    ? <><EyeOff className="w-3 h-3 mr-1" /> {t('비공개', 'Hide')}</>
                    : <><Eye className="w-3 h-3 mr-1" /> {t('공개', 'Show')}</>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteComment(comment.id)}
                  className="h-6 text-[10px] text-red-400 hover:text-red-600 px-2"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> {t('삭제', 'Delete')}
                </Button>
              </div>
            )}

            {comment.parent_viewed_at && !isReadOnly && (
              <p className="text-[10px] text-emerald-500">
                ✓ {t('학부모 확인', 'Parent viewed')}: {new Date(comment.parent_viewed_at).toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExpertCommentLayer;
