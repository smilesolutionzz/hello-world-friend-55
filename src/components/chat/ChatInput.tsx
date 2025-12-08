import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Image, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendFile: (file: File) => void;
  onTyping: () => void;
  isSending: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendFile,
  onTyping,
  isSending,
  disabled
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (selectedFile) {
      onSendFile(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    } else if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);

    if (isImage && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    e.target.value = '';
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="p-4 border-t bg-background">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded object-cover" />
            ) : (
              <div className="w-12 h-12 bg-muted-foreground/20 rounded flex items-center justify-center">
                <Paperclip className="w-5 h-5" />
              </div>
            )}
            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={clearFile}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileSelect(e, false)}
        />
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, true)}
        />

        {/* File buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || isSending}
          className="shrink-0"
        >
          <Image className="w-5 h-5 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
          className="shrink-0"
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </Button>

        {/* Text input */}
        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder={selectedFile ? "파일을 전송하려면 전송 버튼을 누르세요" : "메시지를 입력하세요..."}
          disabled={disabled || isSending || !!selectedFile}
          className="flex-1"
        />

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={disabled || isSending || (!message.trim() && !selectedFile)}
          size="icon"
          className="shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
