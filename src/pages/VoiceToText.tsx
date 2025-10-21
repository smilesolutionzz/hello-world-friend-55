import React, { useState } from 'react';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scroll } from 'lucide-react';

export default function VoiceToTextPage() {
  const [transcription, setTranscription] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">음성→텍스트 변환</h1>
          <p className="text-muted-foreground">AI가 음성을 정확하게 텍스트로 변환합니다</p>
        </div>

        <div className="grid gap-6">
          <VoiceRecorder onTranscription={setTranscription} />

          {transcription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scroll className="w-5 h-5" />
                  변환된 텍스트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{transcription}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>💡 명확하게 발음하면 더 정확한 결과를 얻을 수 있습니다</p>
          <p>🔒 모든 음성 데이터는 안전하게 처리됩니다</p>
        </div>
      </div>
    </div>
  );
}
