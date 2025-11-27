import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpaceTransitionProps {
  isTransitioning: boolean;
  targetSpaceName?: string;
}

export const SpaceTransition = ({ isTransitioning, targetSpaceName }: SpaceTransitionProps) => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      // 페이드 인 시작 후 0.3초 뒤에 텍스트 표시
      const timer = setTimeout(() => setShowText(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowText(false);
    }
  }, [isTransitioning]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black pointer-events-none"
        >
          {showText && targetSpaceName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-2">
                {targetSpaceName}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
