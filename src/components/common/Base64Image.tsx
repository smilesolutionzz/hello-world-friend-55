import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Base64ImageProps {
  onImageConverted?: (base64: string) => void;
}

export function Base64Image({ onImageConverted }: Base64ImageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Result, setBase64Result] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('파일 크기는 2MB 이하여야 합니다');
      return;
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    setSelectedFile(file);

    try {
      const base64 = await convertToBase64(file);
      setBase64Result(base64);
      onImageConverted?.(base64);
      toast.success('이미지가 Base64로 변환되었습니다');
    } catch (error) {
      toast.error('이미지 변환에 실패했습니다');
      console.error(error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(base64Result);
      setCopied(true);
      toast.success('Base64 코드가 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('복사에 실패했습니다');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          이미지를 Base64로 변환
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-2">
            * 2MB 이하의 이미지 파일만 업로드 가능합니다
          </p>
        </div>

        {selectedFile && (
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">파일명:</span> {selectedFile.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">크기:</span> {(selectedFile.size / 1024).toFixed(1)}KB
              </p>
            </div>

            {base64Result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Base64 결과:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? '복사됨' : '복사'}
                  </Button>
                </div>
                <textarea
                  value={base64Result}
                  readOnly
                  className="w-full h-32 p-2 text-xs bg-muted border rounded font-mono resize-none"
                  placeholder="Base64 코드가 여기에 표시됩니다..."
                />
                
                {/* 미리보기 */}
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">미리보기:</p>
                  <img 
                    src={base64Result} 
                    alt="Base64 미리보기" 
                    className="max-w-full max-h-48 object-contain border rounded"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>사용법:</strong></p>
          <p>1. 이미지 파일을 선택하세요</p>
          <p>2. 생성된 Base64 코드를 복사하세요</p>
          <p>3. 컴포넌트에서 src에 직접 사용하세요</p>
          <p className="font-mono bg-muted p-1 rounded">
            {'<img src="data:image/png;base64,..." alt="..." />'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}