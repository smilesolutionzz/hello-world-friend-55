import React from 'react';

interface ChatMessage {
  id: string;
  userName: string;
  organization: string;
  userType: 'institution' | 'parent' | 'adult' | 'child';
  message: {
    prefix: string;
    highlight: string;
    suffix: string;
  };
  time: string;
}

const chatMessages: ChatMessage[] = [
  {
    id: '1',
    userName: '김미영 원장',
    organization: '서울 A발달센터',
    userType: 'institution',
    message: {
      prefix: '발달검사 분석 시간이 ',
      highlight: '2시간에서 10분으로',
      suffix: ' 줄었어요!',
    },
    time: '오전 9:30',
  },
  {
    id: '2',
    userName: '박성호 학부모',
    organization: '부산 초등학생 자녀',
    userType: 'parent',
    message: {
      prefix: '아이 발달 상태를 ',
      highlight: '전문적으로 파악',
      suffix: '할 수 있어서 좋아요',
    },
    time: '오전 10:15',
  },
  {
    id: '3',
    userName: '이정은 선생님',
    organization: '대전 B어린이집',
    userType: 'institution',
    message: {
      prefix: '학부모 상담이 ',
      highlight: '훨씬 수월해졌어요',
      suffix: '',
    },
    time: '오전 11:02',
  },
  {
    id: '4',
    userName: '최영수 대표',
    organization: '경기 C복지센터',
    userType: 'adult',
    message: {
      prefix: 'AI 분석 리포트로 이용자들의 만족도가 ',
      highlight: '확 높아졌어요',
      suffix: '',
    },
    time: '오후 2:45',
  },
  {
    id: '5',
    userName: '민서 (초등 3학년)',
    organization: '서울',
    userType: 'child',
    message: {
      prefix: '게임처럼 재미있어서 ',
      highlight: '또 하고 싶어요',
      suffix: '!',
    },
    time: '오후 3:20',
  },
];

const hashtags = ['#AI발달분석', '#시간단축', '#전문가상담', '#무료체험'];

export const CoffeeChatReviews = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Chat Window */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-border/50">
            {/* Header */}
            <div className="bg-slate-800 dark:bg-slate-950 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-white font-medium ml-3">AIHUMANPRO 고객 후기</span>
              </div>
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                실시간
              </span>
            </div>

            {/* Chat Messages */}
            <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900">
              {chatMessages.map((chat) => (
                <div key={chat.id} className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white text-sm font-bold">
                      {chat.userName.charAt(0)}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground text-sm">{chat.userName}</span>
                      <span className="text-xs text-muted-foreground">{chat.organization}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm inline-block max-w-full border border-border/30">
                      <p className="text-sm text-foreground leading-relaxed">
                        {chat.message.prefix}
                        <span className="font-bold text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-1 rounded">
                          {chat.message.highlight}
                        </span>
                        {chat.message.suffix}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 ml-1">{chat.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 px-6 py-8 text-center">
              <p className="text-white/90 text-sm mb-2">
                전국 200개+ 기관이 선택한
              </p>
              <h3 className="text-white text-2xl md:text-3xl font-black mb-4">
                AIHUMANPRO와 함께하세요
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoffeeChatReviews;
