import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n';

const MESSAGES_KO = [
  '오늘 심리검사 완료 수가 150건을 넘었습니다',
  '이번 주 AI 분석 리포트가 800건 이상 생성되었습니다',
  '지금 42명이 검사를 진행 중입니다',
  '전문가 상담 만족도 4.8/5.0 달성 중',
  '이번 달 신규 회원이 200명을 돌파했습니다',
  '누적 검사 완료 건수 50,000건 돌파',
];

const MESSAGES_EN = [
  'Over 150 assessments completed today',
  'More than 800 AI reports generated this week',
  '42 users are taking assessments right now',
  'Expert consultation satisfaction: 4.8/5.0',
  'Over 200 new members joined this month',
  'Cumulative assessments surpassed 50,000',
];

export const SocialProofToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const { isEnglish } = useLanguage();

  const messages = isEnglish ? MESSAGES_EN : MESSAGES_KO;

  const showNotification = useCallback(() => {
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    setVisible(true);
    setTimeout(() => setVisible(false), 4000);
  }, [messages]);

  useEffect(() => {
    const initial = setTimeout(showNotification, 15000);
    const interval = setInterval(showNotification, 240000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [showNotification]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-50"
        >
          <div className="relative flex items-center gap-3 px-4 py-3.5 rounded-xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">
                {message}
              </p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
