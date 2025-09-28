import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FrameExtractionRequest {
  videoUrl: string;
  frameCount?: number;
  interval?: number; // seconds between frames
}

interface FrameExtractionResult {
  frames: string[]; // base64 encoded images
  frameTimestamps: number[]; // timestamps in seconds
  totalDuration: number;
  frameCount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: FrameExtractionRequest = await req.json();
    const { videoUrl, frameCount = 10, interval = 2 } = body;

    if (!videoUrl) {
      throw new Error('Video URL is required');
    }

    console.log('Starting frame extraction:', {
      videoUrl: videoUrl.substring(0, 50) + '...',
      frameCount,
      interval
    });

    // FFmpeg를 사용하여 비디오에서 프레임 추출
    // 실제 구현에서는 FFmpeg binary가 필요하지만, 
    // 여기서는 Mock 구현으로 시연용 데이터 생성
    
    // 실제로는 다음과 같은 FFmpeg 명령어를 사용:
    // ffmpeg -i ${videoUrl} -vf fps=1/${interval} -vframes ${frameCount} -f image2 -c:v png -
    
    // Mock 프레임 데이터 생성 (실제 구현에서는 FFmpeg 출력을 사용)
    const mockFrames: string[] = [];
    const mockTimestamps: number[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      // 실제로는 비디오에서 추출한 프레임의 base64 데이터
      const mockFrameData = generateMockFrame(i);
      mockFrames.push(mockFrameData);
      mockTimestamps.push(i * interval);
    }

    const result: FrameExtractionResult = {
      frames: mockFrames,
      frameTimestamps: mockTimestamps,
      totalDuration: frameCount * interval,
      frameCount: mockFrames.length
    };

    console.log('Frame extraction completed:', {
      extractedFrames: result.frameCount,
      totalDuration: result.totalDuration
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in frame extraction:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Frame extraction failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Mock 프레임 생성 함수 (실제로는 FFmpeg에서 추출한 이미지 데이터)
function generateMockFrame(frameNumber: number): string {
  // 실제로는 비디오 프레임의 base64 인코딩된 이미지 데이터
  // 여기서는 작은 투명 PNG의 base64 데이터를 반환
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
}