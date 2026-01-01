import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ThinkingLoaderProps {
  isLoading: boolean;
  phrases?: string[];
  className?: string;
  showTimer?: boolean;
  title?: string;
}

const defaultPhrases = [
  '데이터 수집 중...',
  '패턴 분석 중...',
  '심층 분석 수행 중...',
  '결과 정리 중...',
  '인사이트 생성 중...',
];

export const ThinkingLoader: React.FC<ThinkingLoaderProps> = ({
  isLoading,
  phrases = defaultPhrases,
  className = '',
  showTimer = true,
  title = 'AI가 분석 중입니다',
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentPhraseIndex(0);
      setElapsedSeconds(0);
      return;
    }

    const phraseInterval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2500);

    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(timerInterval);
    };
  }, [isLoading, phrases.length]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-3 ${className}`}
    >
      {/* Sparkle Icon with Pulse */}
      <div className="relative">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-5 h-5 text-violet-500"
        >
          <Sparkles className="w-full h-full" />
        </motion.div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-violet-400"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "linear"
              }}
              style={{
                transformOrigin: '10px 10px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {title}
          </span>
          {showTimer && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {elapsedSeconds}초
            </span>
          )}
        </div>
        
        {/* Animated Phrase */}
        <AnimatePresence mode="wait">
          <motion.span
            key={currentPhraseIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            {phrases[currentPhraseIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Animated Dots */}
      <div className="flex gap-1 ml-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-500"
            animate={{
              y: [0, -4, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Compact inline version for buttons/small spaces
export const ThinkingDots: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex gap-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-current"
        animate={{
          y: [0, -3, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
        }}
      />
    ))}
  </div>
);

// Card version for larger loading states
export const ThinkingCard: React.FC<{
  isLoading: boolean;
  title?: string;
  description?: string;
  phrases?: string[];
}> = ({
  isLoading,
  title = 'AI가 분석 중입니다',
  description = '잠시만 기다려주세요',
  phrases = defaultPhrases,
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentPhraseIndex(0);
      setElapsedSeconds(0);
      return;
    }

    const phraseInterval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2500);

    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(timerInterval);
    };
  }, [isLoading, phrases.length]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 
                 border border-violet-200/50 dark:border-violet-700/30 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-start gap-4">
        {/* Animated Icon */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 
                       flex items-center justify-center shadow-lg shadow-violet-500/30"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          
          {/* Pulse ring */}
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-xl border-2 border-violet-400"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h3>
            <span className="text-sm text-violet-600 dark:text-violet-400 font-mono">
              {elapsedSeconds}초
            </span>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            {description}
          </p>

          {/* Progress Phrases */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-violet-500"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPhraseIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-violet-600 dark:text-violet-400"
              >
                {phrases[currentPhraseIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThinkingLoader;
