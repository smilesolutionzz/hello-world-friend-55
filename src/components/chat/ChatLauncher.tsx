import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { RealtimeChatWidget } from './RealtimeChatWidget';
import { AnimatePresence, motion } from 'framer-motion';

export const ChatLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <RealtimeChatWidget onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>

      {/* Launcher Tab Button */}
      {!isOpen && (
        <motion.div
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          exit={{ x: 100 }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-l-xl rounded-r-none px-3 py-6 h-auto flex flex-col gap-2 shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 hover:pr-5"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium writing-mode-vertical">상담</span>
            
            {/* Online indicator */}
            <span className="absolute top-2 left-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </Button>
        </motion.div>
      )}
    </>
  );
};
