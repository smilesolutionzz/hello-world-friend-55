import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessage {
  id: string;
  avatar: string;
  userName: string;
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
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    userName: '김지현',
    message: {
      prefix: '아이의 ',
      highlight: '발달 상태',
      suffix: '가 정확히 어느 수준인지 궁금했어요',
    },
    time: '오후 12:00',
  },
  {
    id: '2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    userName: '박성민',
    message: {
      prefix: '전문가 상담 없이는 ',
      highlight: '해결 불가한 문제',
      suffix: '는 무엇인가요?',
    },
    time: '오후 12:01',
  },
  {
    id: '3',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    userName: '이수연',
    message: {
      prefix: '초기 단계에서 알아야 할 중요한 ',
      highlight: '우선순위',
      suffix: '는 무엇일까요?',
    },
    time: '오후 12:02',
  },
];

const hashtags = [
  '#심리검사궁금증',
  '#한번에해결',
  '#AI분석리포트',
  '#무엇이든물어보세요',
  '#2025년_최신_AI분석',
  '#전문가상담',
];

export const CoffeeChatReviews = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          {/* Chat Card */}
          <div className="bg-gradient-to-br from-slate-200 via-slate-100 to-purple-100 dark:from-slate-800 dark:via-slate-700 dark:to-purple-900/30 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-transparent dark:from-purple-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-20 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-transparent dark:from-blue-500/10 rounded-full blur-xl" />

            {/* Logo/Brand */}
            <div className="flex justify-end mb-6">
              <span className="text-lg font-bold text-primary">AIHUMANPRO</span>
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 relative z-10">
              {chatMessages.map((chat) => (
                <div key={chat.id} className="flex items-start gap-3">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-600 shadow-md flex-shrink-0">
                    <AvatarImage src={chat.avatar} alt={chat.userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {chat.userName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Bubble */}
                  <div className="flex-1">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm inline-block max-w-[90%]">
                      <p className="text-sm text-foreground leading-relaxed">
                        {chat.message.prefix}
                        <span className="font-bold text-primary">{chat.message.highlight}</span>
                        {chat.message.suffix}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-xs text-muted-foreground mt-3 flex-shrink-0">
                    {chat.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Title Section */}
            <div className="mt-8 pt-6 border-t border-slate-300/50 dark:border-slate-600/50 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                AIHUMANPRO <span className="font-semibold text-foreground">전문가 상담</span>과 함께 하는
              </p>
              <h3 className="text-3xl md:text-4xl font-black text-primary mb-4">
                사용자들의
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10">솔직후기</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/20 -z-0 rounded" />
                </span>
              </h3>

              {/* Hashtags */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-default"
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
