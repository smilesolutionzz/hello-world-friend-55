import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 1500,
  className = ""
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, pauseDuration);
    } else if (isTyping) {
      const targetText = phrases[currentPhraseIndex];
      if (currentText.length < targetText.length) {
        timeout = setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        setIsPaused(true);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    currentPhraseIndex,
    isTyping,
    isPaused,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseDuration
  ]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};