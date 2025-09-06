import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share2,
  Verified,
  Trophy,
  Star,
  ThumbsUp,
  Clock,
  User,
  CheckCircle
} from "lucide-react";

interface CommunityPost {
  id: string;
  type: 'success' | 'question' | 'review';
  author: {
    name: string;
    isAnonymous: boolean;
    isExpert: boolean;
    isInstitution: boolean;
    avatar?: string;
    title?: string;
  };
  content: string;
  title?: string;
  tags: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  hasLiked: boolean;
}

interface Comment {
  id: string;
  author: {
    name: string;
    isExpert: boolean;
    isInstitution: boolean;
    isAnonymous?: boolean;
    avatar?: string;
    title?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isExpertAnswer?: boolean;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    type: 'success',
    author: {
      name: '민지엄마',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '5세 아들 언어발달 지연 극복 후기',
    content: '처음에는 정말 걱정이 많았는데, AIHPRO에서 추천받은 김미영 선생님과 6개월간 치료받으며 놀라운 변화를 경험했습니다. 이제 아이가 또래와 자연스럽게 대화할 수 있게 되었어요! 같은 고민을 하시는 분들께 희망이 되길 바라며 후기 남깁니다.',
    tags: ['언어치료', '5세', '성공사례'],
    timestamp: '2시간 전',
    likes: 24,
    hasLiked: false,
    comments: [
      {
        id: '1',
        author: {
          name: '김미영',
          isExpert: true,
          isInstitution: false,
          title: '언어치료사',
          avatar: '/api/placeholder/30/30'
        },
        content: '민지가 정말 열심히 했어요! 앞으로도 꾸준히 연습하면 더욱 좋아질 거예요 😊',
        timestamp: '1시간 전',
        likes: 8,
        isExpertAnswer: true
      },
      {
        id: '2',
        author: {
          name: '익명',
          isExpert: false,
          isInstitution: false
        },
        content: '저희 아이도 비슷한 상황인데 정말 용기가 납니다. 김미영 선생님께 상담 문의드려도 될까요?',
        timestamp: '30분 전',
        likes: 3
      }
    ]
  },
  {
    id: '2',
    type: 'question',
    author: {
      name: '익명',
      isAnonymous: true,
      isExpert: false,
      isInstitution: false
    },
    title: 'ADHD 7세 아이, 집중력 향상 방법이 궁금해요',
    content: '최근 ADHD 진단을 받은 7세 아들이 있습니다. 약물치료와 함께 집에서 할 수 있는 집중력 향상 방법이 있을까요? 특히 숙제할 때 계속 산만해져서 어떻게 도와줘야 할지 모르겠습니다.',
    tags: ['ADHD', '7세', '집중력', '질문'],
    timestamp: '4시간 전',
    likes: 12,
    hasLiked: true,
    comments: [
      {
        id: '3',
        author: {
          name: '박상훈',
          isExpert: true,
          isInstitution: false,
          title: 'BCBA 행동분석사',
          avatar: '/api/placeholder/30/30'
        },
        content: 'ADHD 아동의 경우 환경 조성이 매우 중요합니다. 1) 방해요소 최소화 2) 짧은 시간 집중 후 휴식 3) 시각적 스케줄 활용을 추천드려요. 더 자세한 상담이 필요하시면 언제든 연락주세요.',
        timestamp: '2시간 전',
        likes: 15,
        isExpertAnswer: true
      },
      {
        id: '4',
        author: {
          name: '도란도란센터',
          isExpert: false,
          isInstitution: true,
          title: '아동발달센터'
        },
        content: '저희 센터에서도 ADHD 전문 프로그램을 운영하고 있습니다. 개별화된 접근법으로 좋은 결과를 보고 있어요. 상담받아보시길 추천드립니다.',
        timestamp: '1시간 전',
        likes: 6
      }
    ]
  },
  {
    id: '3',
    type: 'review',
    author: {
      name: '수현이네',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '하늘자리 센터 후기 - 자폐스펙트럼 치료',
    content: '3세 아들의 자폐스펙트럼 진단 후 하늘자리 센터에서 1년간 치료받았습니다. 선생님들이 정말 전문적이고 아이의 특성을 잘 파악해주셨어요. 특히 ABA 치료 프로그램이 체계적이어서 만족스러웠습니다. ⭐⭐⭐⭐⭐',
    tags: ['하늘자리센터', '자폐스펙트럼', 'ABA치료', '리뷰'],
    timestamp: '1일 전',
    likes: 31,
    hasLiked: false,
    comments: [
      {
        id: '5',
        author: {
          name: '하늘자리센터',
          isExpert: false,
          isInstitution: true,
          title: '아동발달센터'
        },
        content: '수현이가 정말 많이 발전했어요! 앞으로도 계속 응원하겠습니다. 소중한 후기 감사드려요 💕',
        timestamp: '12시간 전',
        likes: 7
      }
    ]
  },
  {
    id: '4',
    type: 'success',
    author: {
      name: '테디엄마',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '14세 우울증 극복 성공 사례',
    content: '중학교 2학년 아들이 학교 적응에 어려움을 겪으며 우울증 증상을 보였습니다. AIHPRO를 통해 만난 박하진 선생님과 6개월간 상담받으며 서서히 회복되었고, 이제는 밝은 모습을 되찾았어요. 전문가의 도움이 정말 중요하다는 걸 느꼈습니다.',
    tags: ['우울증', '14세', '청소년상담', '성공사례'],
    timestamp: '2일 전',
    likes: 18,
    hasLiked: false,
    comments: [
      {
        id: '6',
        author: {
          name: '박하진',
          isExpert: true,
          isInstitution: false,
          title: '청소년상담사',
          avatar: '/api/placeholder/30/30'
        },
        content: '테디가 정말 용기있게 노력했어요. 부모님의 꾸준한 지지도 큰 힘이 되었습니다. 앞으로도 건강하게 성장하길 바라요!',
        timestamp: '1일 전',
        likes: 9,
        isExpertAnswer: true
      }
    ]
  }
];

export const CommunityFeed = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [showNewPost, setShowNewPost] = useState(false);
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
            hasLiked: !post.hasLiked 
          }
        : post
    ));
  };

  const handleCommentLike = (postId: string, commentId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, likes: comment.likes + 1 }
                : comment
            )
          }
        : post
    ));
  };

  const handleAddComment = (postId: string) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: {
        name: '익명 사용자',
        isExpert: false,
        isInstitution: false
      },
      content: comment,
      timestamp: '방금 전',
      likes: 0
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newCommentObj] }
        : post
    ));

    setNewComment({ ...newComment, [postId]: '' });
  };

  const handleSubmitPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      type: 'question',
      author: {
        name: '익명',
        isAnonymous: true,
        isExpert: false,
        isInstitution: false
      },
      title: newPost.title,
      content: newPost.content,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      timestamp: '방금 전',
      likes: 0,
      hasLiked: false,
      comments: []
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', tags: '' });
    setShowNewPost(false);
  };

  const getAuthorDisplay = (author: CommunityPost['author'] | Comment['author']) => {
    if ('isAnonymous' in author && author.isAnonymous) return '익명';
    return author.name;
  };

  const getAuthorBadge = (author: CommunityPost['author'] | Comment['author']) => {
    if (author.isExpert) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Verified className="w-3 h-3 mr-1" />전문가</Badge>;
    }
    if (author.isInstitution) {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200"><CheckCircle className="w-3 h-3 mr-1" />기관</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 새 글 작성 */}
      <Card className="border-dashed border-2 border-primary/30">
        <CardContent className="p-6">
          {!showNewPost ? (
            <Button 
              onClick={() => setShowNewPost(true)}
              variant="outline" 
              className="w-full h-12 text-muted-foreground hover:text-primary"
            >
              고민이나 성공사례를 익명으로 공유해보세요...
            </Button>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="제목을 입력하세요"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <Textarea
                placeholder="내용을 입력하세요"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
              />
              <Input
                placeholder="태그 (쉼표로 구분)"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitPost} className="bg-primary">
                  게시하기
                </Button>
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  취소
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 게시글 목록 */}
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {post.author.isAnonymous ? <User className="w-5 h-5" /> : post.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getAuthorDisplay(post.author)}</span>
                    {getAuthorBadge(post.author)}
                    {post.type === 'success' && <Trophy className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {post.timestamp}
                    {post.author.title && <span>• {post.author.title}</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{post.content}</p>
            
            {/* 태그 */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`gap-2 ${post.hasLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                {post.comments.length}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-gray-500">
                <Share2 className="w-4 h-4" />
                공유
              </Button>
            </div>

            {/* 댓글 섹션 */}
            {post.comments.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {comment.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          {getAuthorBadge(comment.author)}
                          {comment.isExpertAnswer && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <Star className="w-3 h-3 mr-1" />전문답변
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{comment.timestamp}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommentLike(post.id, comment.id)}
                            className="h-6 px-2 gap-1"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {comment.likes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 댓글 작성 */}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="댓글을 입력하세요..."
                value={newComment[post.id] || ''}
                onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment(post.id);
                  }
                }}
              />
              <Button 
                onClick={() => handleAddComment(post.id)}
                size="sm"
                className="bg-primary"
              >
                작성
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};