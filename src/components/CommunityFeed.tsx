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
  CheckCircle,
  X
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
  },
  {
    id: '5',
    type: 'question',
    author: {
      name: '새콤달콤맘',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '4세 딸, 또래관계에서 소극적이에요',
    content: '어린이집에서 친구들과 잘 놀지 못하고 혼자 있는 시간이 많다고 합니다. 집에서는 활발한데 밖에서만 소극적이라서 걱정됩니다. 사회성 향상을 위한 방법이 있을까요?',
    tags: ['사회성', '4세', '또래관계', '질문'],
    timestamp: '3시간 전',
    likes: 8,
    hasLiked: false,
    comments: []
  },
  {
    id: '6',
    type: 'success',
    author: {
      name: '익명',
      isAnonymous: true,
      isExpert: false,
      isInstitution: false
    },
    title: '감각통합치료 6개월 후 놀라운 변화!',
    content: '6세 아들이 감각과민으로 힘들어했는데, 참소리센터에서 감각통합치료를 받고 일상생활이 많이 편해졌어요. 이제 새로운 음식도 시도하고, 촉감놀이도 즐겁게 합니다. 정말 감사해요!',
    tags: ['감각통합치료', '6세', '감각과민', '성공사례'],
    timestamp: '5시간 전',
    likes: 22,
    hasLiked: false,
    comments: [
      {
        id: '7',
        author: {
          name: '참소리센터',
          isExpert: false,
          isInstitution: true,
          title: '아동발달센터'
        },
        content: '아이가 정말 많이 발전했어요! 앞으로도 꾸준히 함께해요 😊',
        timestamp: '3시간 전',
        likes: 5
      }
    ]
  },
  {
    id: '7',
    type: 'review',
    author: {
      name: '하늘이네',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '창원 우리ABA센터 솔직후기',
    content: '자폐스펙트럼 진단받은 5세 아들을 1년간 치료받았습니다. 개별 맞춤 프로그램이 정말 체계적이고, 선생님들이 아이를 진심으로 아껴주시는 게 느껴졌어요. 부모교육도 함께 해주셔서 집에서도 일관성 있게 지도할 수 있었습니다.',
    tags: ['우리ABA센터', '창원', '자폐스펙트럼', '리뷰'],
    timestamp: '6시간 전',
    likes: 19,
    hasLiked: false,
    comments: []
  },
  {
    id: '8',
    type: 'question',
    author: {
      name: '익명',
      isAnonymous: true,
      isExpert: false,
      isInstitution: false
    },
    title: '3세 아이 말이 늦어서 걱정이에요',
    content: '3세 2개월인데 아직 두 단어 조합이 어려워요. 주변에서는 남자아이라 늦다고 하는데, 언제까지 기다려봐야 할까요? 언어치료를 시작해야 하는 시기가 궁금합니다.',
    tags: ['언어발달', '3세', '말늦은아이', '질문'],
    timestamp: '8시간 전',
    likes: 15,
    hasLiked: false,
    comments: [
      {
        id: '8',
        author: {
          name: '이소영',
          isExpert: true,
          isInstitution: false,
          title: '언어치료사',
          avatar: '/api/placeholder/30/30'
        },
        content: '3세에 두 단어 조합이 어렵다면 언어평가를 받아보시는 걸 추천드려요. 조기 개입이 중요하니 늦지 않게 전문가 상담받아보세요.',
        timestamp: '6시간 전',
        likes: 12,
        isExpertAnswer: true
      }
    ]
  },
  {
    id: '9',
    type: 'success',
    author: {
      name: '별빛엄마',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '선택적 함묵증 극복 성공담',
    content: '7세 딸이 집에서는 말을 잘 하는데 학교에서는 전혀 말을 하지 않았어요. 선택적 함묵증 진단 후 별하센터에서 9개월간 치료받고 이제는 학교에서도 친구들과 대화할 수 있게 되었습니다!',
    tags: ['선택적함묵증', '7세', '별하센터', '성공사례'],
    timestamp: '10시간 전',
    likes: 26,
    hasLiked: false,
    comments: []
  },
  {
    id: '10',
    type: 'question',
    author: {
      name: '고민맘',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '틱장애 있는 9세, 어떻게 도와줘야 할까요?',
    content: '최근 눈 깜빡임과 어깨 들썩임이 심해졌어요. 병원에서는 틱장애라고 하는데, 아이가 스트레스받지 않게 하면서도 증상 개선에 도움이 되는 방법이 있을까요?',
    tags: ['틱장애', '9세', '스트레스', '질문'],
    timestamp: '12시간 전',
    likes: 11,
    hasLiked: false,
    comments: [
      {
        id: '9',
        author: {
          name: '정민수',
          isExpert: true,
          isInstitution: false,
          title: '행동치료사',
          avatar: '/api/placeholder/30/30'
        },
        content: '틱장애는 스트레스와 밀접한 관련이 있습니다. 아이의 스트레스 요인을 파악하고 이완훈련을 통해 도움을 받을 수 있어요. 상세한 상담을 추천드립니다.',
        timestamp: '10시간 전',
        likes: 8,
        isExpertAnswer: true
      }
    ]
  },
  {
    id: '11',
    type: 'review',
    author: {
      name: '행복한하루',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '엘림센터 인지치료 후기',
    content: '경계선지능으로 학습에 어려움을 겪던 8세 아들이 엘림센터에서 1년간 인지치료를 받았습니다. 아이의 속도에 맞춰 천천히 지도해주신 덕분에 자신감도 생기고 학습능력도 향상되었어요.',
    tags: ['엘림센터', '인지치료', '경계선지능', '리뷰'],
    timestamp: '1일 전',
    likes: 17,
    hasLiked: false,
    comments: []
  },
  {
    id: '12',
    type: 'success',
    author: {
      name: '익명',
      isAnonymous: true,
      isExpert: false,
      isInstitution: false
    },
    title: '불안장애 청소년, 상담치료로 회복했어요',
    content: '16세 딸이 심한 사회불안으로 학교생활이 어려웠는데, 전문상담사와 8개월간 치료받으며 점차 회복되었습니다. 이제는 발표도 할 수 있게 되었어요. 포기하지 말고 전문가의 도움을 받으시길 추천해요.',
    tags: ['불안장애', '16세', '상담치료', '성공사례'],
    timestamp: '1일 전',
    likes: 21,
    hasLiked: false,
    comments: []
  },
  {
    id: '13',
    type: 'question',
    author: {
      name: '걱정엄마',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '5세 아이 과격한 행동, 어떻게 대처해야 할까요?',
    content: '친구들을 때리거나 물건을 던지는 행동이 자주 일어나요. 말로 타이르면 그 순간은 듣는데 또 반복됩니다. 어떤 접근이 효과적일까요?',
    tags: ['공격적행동', '5세', '행동수정', '질문'],
    timestamp: '1일 전',
    likes: 9,
    hasLiked: false,
    comments: [
      {
        id: '10',
        author: {
          name: '김현아',
          isExpert: true,
          isInstitution: false,
          title: 'ABA치료사',
          avatar: '/api/placeholder/30/30'
        },
        content: '공격적 행동의 원인을 먼저 파악하는 것이 중요해요. 감정조절 어려움, 의사소통 문제 등 다양한 원인이 있을 수 있습니다. 개별 평가 후 체계적인 행동수정 프로그램을 추천드려요.',
        timestamp: '20시간 전',
        likes: 7,
        isExpertAnswer: true
      }
    ]
  },
  {
    id: '14',
    type: 'review',
    author: {
      name: '희망가득',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '해오름센터 놀이치료 솔직 후기',
    content: '4세 딸의 사회성 문제로 해오름센터에서 놀이치료를 받았습니다. 처음에는 효과가 있을까 의심스러웠는데, 6개월 후 아이가 먼저 친구들에게 다가가는 모습을 보고 깜짝 놀랐어요. 정말 감사합니다!',
    tags: ['해오름센터', '놀이치료', '사회성', '리뷰'],
    timestamp: '2일 전',
    likes: 14,
    hasLiked: false,
    comments: []
  },
  {
    id: '15',
    type: 'success',
    author: {
      name: '무지개엄마',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '발달지연 3세, 통합치료로 빠른 발전!',
    content: '운동발달과 언어발달이 모두 늦었던 아들이 해우터음센터에서 통합치료를 받고 6개월 만에 눈에 띄는 발전을 보였어요. 여러 영역을 함께 치료받으니 시너지 효과가 컸습니다.',
    tags: ['발달지연', '3세', '통합치료', '성공사례'],
    timestamp: '2일 전',
    likes: 28,
    hasLiked: false,
    comments: []
  },
  {
    id: '16',
    type: 'question',
    author: {
      name: '익명',
      isAnonymous: true,
      isExpert: false,
      isInstitution: false
    },
    title: '자해행동 하는 11세, 어떻게 도와줘야 할까요?',
    content: '스트레스받을 때 자신을 때리거나 머리카락을 뽑는 행동을 합니다. 병원에서는 약물치료를 권하는데, 다른 방법은 없을까요? 정말 걱정됩니다.',
    tags: ['자해행동', '11세', '스트레스', '질문'],
    timestamp: '2일 전',
    likes: 13,
    hasLiked: false,
    comments: [
      {
        id: '11',
        author: {
          name: '박지혜',
          isExpert: true,
          isInstitution: false,
          title: '임상심리사',
          avatar: '/api/placeholder/30/30'
        },
        content: '자해행동은 즉시 전문적인 개입이 필요합니다. 약물치료와 함께 인지행동치료, 감정조절 훈련 등을 병행하면 더 효과적입니다. 꼭 전문가와 상담받아보세요.',
        timestamp: '1일 전',
        likes: 11,
        isExpertAnswer: true
      }
    ]
  },
  {
    id: '17',
    type: 'review',
    author: {
      name: '사랑가득집',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '한점미소센터 언어치료 1년 후기',
    content: '2세 때부터 언어발달이 늦었던 아들이 한점미소센터에서 3년간 치료받았습니다. 이제 7세가 되어 또래와 자연스럽게 대화하며 학교생활도 잘 하고 있어요. 긴 시간이었지만 포기하지 않길 잘했습니다.',
    tags: ['한점미소센터', '언어치료', '장기치료', '리뷰'],
    timestamp: '3일 전',
    likes: 33,
    hasLiked: false,
    comments: []
  },
  {
    id: '18',
    type: 'success',
    author: {
      name: '희망나무',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '강박증 치료 성공 사례 공유',
    content: '13세 아들의 강박증상(손씻기, 확인행동)이 심해져서 일상생활이 어려웠는데, 인지행동치료를 통해 6개월 만에 많이 호전되었습니다. 가족치료도 함께 받아서 전체적인 도움이 되었어요.',
    tags: ['강박증', '13세', '인지행동치료', '성공사례'],
    timestamp: '3일 전',
    likes: 19,
    hasLiked: false,
    comments: []
  },
  {
    id: '19',
    type: 'question',
    author: {
      name: '첫째맘',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '아스퍼거 증후군 진단, 어떤 치료가 효과적일까요?',
    content: '8세 아들이 최근 아스퍼거 증후군 진단을 받았습니다. 사회성은 부족하지만 학습능력은 뛰어난 편이에요. 어떤 치료나 교육이 도움이 될까요?',
    tags: ['아스퍼거', '8세', '사회성', '질문'],
    timestamp: '3일 전',
    likes: 7,
    hasLiked: false,
    comments: [
      {
        id: '12',
        author: {
          name: '서영희',
          isExpert: true,
          isInstitution: false,
          title: '발달장애전문가',
          avatar: '/api/placeholder/30/30'
        },
        content: '아스퍼거 증후군의 경우 사회기술훈련과 감정인식 프로그램이 효과적입니다. 아이의 강점을 활용한 개별화된 접근이 중요해요.',
        timestamp: '2일 전',
        likes: 6,
        isExpertAnswer: true
      }
    ]
  },
  {
    id: '20',
    type: 'success',
    author: {
      name: '익명',
      isAnonymous: true,
      isExpert: false,
      isInstitution: false
    },
    title: '소리엘센터에서 받은 감동적인 치료 경험',
    content: '중증 자폐진단을 받은 4세 아들이 소리엘센터에서 2년간 ABA치료를 받았습니다. 처음에는 눈맞춤도 어려웠는데, 이제는 간단한 의사소통이 가능해졌어요. 선생님들의 전문성과 사랑에 정말 감사해요.',
    tags: ['소리엘센터', '중증자폐', 'ABA치료', '성공사례'],
    timestamp: '4일 전',
    likes: 41,
    hasLiked: false,
    comments: [
      {
        id: '13',
        author: {
          name: '소리엘센터',
          isExpert: false,
          isInstitution: true,
          title: '아동발달센터'
        },
        content: '아이의 발전하는 모습을 보며 저희도 큰 기쁨을 느꼈습니다. 앞으로도 함께 노력해나가요! 💪',
        timestamp: '3일 전',
        likes: 12
      }
    ]
  },
  {
    id: '21',
    type: 'review',
    author: {
      name: '꿈나무엄마',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '우아함센터 미술치료 후기',
    content: '감정표현이 서툰 6세 딸이 우아함센터에서 미술치료를 받았어요. 그림을 통해 마음을 표현하는 법을 배우면서 정서적으로 많이 안정되었습니다. 창의성도 늘어나서 일석이조예요!',
    tags: ['우아함센터', '미술치료', '감정표현', '리뷰'],
    timestamp: '4일 전',
    likes: 16,
    hasLiked: false,
    comments: []
  },
  {
    id: '22',
    type: 'question',
    author: {
      name: '초보엄마',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '2세 아이 떼쓰기가 너무 심해요',
    content: '마트에서, 집에서 원하는 게 안 되면 바닥에 드러누워서 30분 넘게 울어요. 어떻게 대처해야 올바른 양육일까요? 주변 시선도 신경 쓰여서 스트레스가 심합니다.',
    tags: ['떼쓰기', '2세', '양육', '질문'],
    timestamp: '5일 전',
    likes: 18,
    hasLiked: false,
    comments: [
      {
        id: '14',
        author: {
          name: '김나연',
          isExpert: true,
          isInstitution: false,
          title: '아동심리상담사',
          avatar: '/api/placeholder/30/30'
        },
        content: '2세는 자기조절능력이 아직 미숙한 시기예요. 일관성 있는 반응과 감정 공감이 중요합니다. 떼를 쓸 때 안전한 환경에서 감정을 수용해주되, 원하는 것을 들어주지는 않는 것이 좋아요.',
        timestamp: '4일 전',
        likes: 15,
        isExpertAnswer: true
      }
    ]
  },
  {
    id: '23',
    type: 'success',
    author: {
      name: '행복이네',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '학습장애 극복 성공기',
    content: '9세 아들의 난독증으로 인한 학습장애가 정관센터의 학습치료를 통해 많이 개선되었어요. 특수교육과 일반교육을 병행하며 아이의 자존감도 회복되었습니다. 포기하지 않으시길!',
    tags: ['학습장애', '난독증', '정관센터', '성공사례'],
    timestamp: '5일 전',
    likes: 25,
    hasLiked: false,
    comments: []
  },
  {
    id: '24',
    type: 'review',
    author: {
      name: '감사한마음',
      isAnonymous: false,
      isExpert: false,
      isInstitution: false,
      avatar: '/api/placeholder/40/40'
    },
    title: '메이플ABA센터 체험 후기',
    content: '자폐스펙트럼 5세 아들을 위해 여러 센터를 둘러본 중 메이플ABA센터가 가장 체계적이었어요. 개별화된 프로그램과 데이터 기반 접근법이 인상적이었습니다. 치료 시작 예정이에요!',
    tags: ['메이플ABA센터', '자폐스펙트럼', '체험후기', '리뷰'],
    timestamp: '6일 전',
    likes: 12,
    hasLiked: false,
    comments: []
  }
];

export const CommunityFeed = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [showNewPost, setShowNewPost] = useState(false);
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [commentAuthor, setCommentAuthor] = useState<{[key: string]: string}>({});

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
    const author = commentAuthor[postId];
    if (!comment?.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: {
        name: author?.trim() || '익명',
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
    setCommentAuthor({ ...commentAuthor, [postId]: '' });
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments.filter(comment => comment.id !== commentId) }
        : post
    ));
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
                        <div className="flex items-center justify-between">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(post.id, comment.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            title="댓글 삭제"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 댓글 작성 */}
            <div className="space-y-2 pt-2">
              <Input
                placeholder="닉네임 (선택사항)"
                value={commentAuthor[post.id] || ''}
                onChange={(e) => setCommentAuthor({ ...commentAuthor, [post.id]: e.target.value })}
                className="text-sm"
              />
              <div className="flex gap-2">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};