import React from 'react';

interface KakaoShareButtonProps {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  buttonText?: string;
  referralCode?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const KakaoShareButton: React.FC<KakaoShareButtonProps> = ({
  className = '',
}) => {
  void className;
  return null;
};