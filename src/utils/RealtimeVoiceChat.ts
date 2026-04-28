import { supabase } from '@/integrations/supabase/client';

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer.slice(0) as ArrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  clear() {
    this.queue = [];
    this.isPlaying = false;
  }
}

export class RealtimeVoiceChat {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private audioQueue: AudioQueue | null = null;
  public audioContext: AudioContext | null = null;
  private isSessionStarted = false;
  private isSessionConfigured = false;
  private pendingResponseAfterTranscription = false;

  constructor(
    private onMessage: (message: any) => void,
    private onSpeakingChange: (speaking: boolean) => void,
    private options: {
      instructions?: string;
      voice?: string;
      useServerVad?: boolean;
    } = {}
  ) {}

  async init() {
    try {
      console.log("Initializing Realtime Voice Chat...");

      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.audioQueue = new AudioQueue(this.audioContext);

      // Get auth token for WebSocket
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || '';
      const wsUrl = `wss://hrcqxjetmzxoephgyjlb.functions.supabase.co/functions/v1/realtime-voice?token=${encodeURIComponent(accessToken)}`;

      console.log("Connecting to:", wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected, waiting for session.created...");
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Received:", data.type);

          if (data.type === 'session.created' && !this.isSessionStarted) {
            console.log("✅ Session created, sending configuration...");
            this.isSessionStarted = true;

            this.ws?.send(JSON.stringify({
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'],
                instructions: this.options.instructions ?? '당신은 친절하고 공감적인 한국어 심리 상담사입니다. 사용자의 발화를 끝까지 경청한 뒤 2~3문장으로 간결하게 답하고, 입력이 불명확하면 추측하지 말고 다시 물어보세요.',
                voice: this.options.voice ?? 'shimmer',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                  model: 'gpt-4o-transcribe',
                  language: 'ko'
                },
                turn_detection: this.options.useServerVad
                  ? {
                      type: 'server_vad',
                      threshold: 0.55,
                      prefix_padding_ms: 280,
                      silence_duration_ms: 650,
                      create_response: true,
                    }
                  : null,
                temperature: 0.7,
                max_response_output_tokens: 320
              }
            }));

            this.isSessionConfigured = true;
            this.onSpeakingChange(false);
            console.log("🎤 Session configured. Waiting for user input.");
            return;
          }

          if (data.type === 'response.audio.delta' && data.delta) {
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await this.audioQueue?.addToQueue(bytes);
            this.onMessage(data);
            return;
          }

          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            const transcript = typeof data.transcript === 'string' ? data.transcript.trim() : '';

            if (!transcript || transcript.length < 2) {
              if (this.pendingResponseAfterTranscription) {
                this.pendingResponseAfterTranscription = false;
                this.onSpeakingChange(false);
                this.onMessage({
                  type: 'input.transcript.ignored',
                  reason: 'empty_or_too_short'
                });
              }
              return;
            }

            this.onMessage({ ...data, transcript });

            if (this.pendingResponseAfterTranscription && this.ws?.readyState === WebSocket.OPEN) {
              this.pendingResponseAfterTranscription = false;
              this.ws.send(JSON.stringify({ type: 'response.create' }));
            }
            return;
          }

          if (data.type === 'conversation.item.input_audio_transcription.failed') {
            if (this.pendingResponseAfterTranscription) {
              this.pendingResponseAfterTranscription = false;
              this.onSpeakingChange(false);
              this.onMessage({ type: 'input.transcript.ignored', reason: 'transcription_failed' });
            }
            return;
          }

          if (data.type === 'response.created') {
            this.onSpeakingChange(true);
          } else if (data.type === 'response.audio.done' || data.type === 'response.done') {
            this.onSpeakingChange(false);
          }

          this.onMessage(data);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
      };

      this.ws.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        this.cleanup();
      };
    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  private async startRecordingInternal() {
    try {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }

      if (!this.isSessionConfigured) {
        throw new Error('Voice session is not ready yet');
      }

      if (this.recorder) {
        return;
      }

      console.log("Starting audio recording...");
      this.pendingResponseAfterTranscription = false;
      if (!this.options.useServerVad) {
        this.ws.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
      }

      this.recorder = new AudioRecorder((audioData) => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          const base64Audio = encodeAudioForAPI(audioData);
          this.ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          }));
        }
      });

      await this.recorder.start();
      this.onSpeakingChange(false);
      console.log("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }

  public async startRecording() {
    return this.startRecordingInternal();
  }

  public async stopRecordingAndSend() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    if (!this.recorder) {
      return;
    }

    this.recorder.stop();
    this.recorder = null;

    if (this.options.useServerVad) {
      // server VAD handles commit + response automatically
      return;
    }

    this.pendingResponseAfterTranscription = true;
    this.ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
    console.log("Recording stopped, waiting for finalized transcript...");
  }

  sendTextMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    console.log("Sending text message:", text);
    this.ws.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    this.ws.send(JSON.stringify({ type: 'response.create' }));
  }

  private cleanup() {
    this.recorder?.stop();
    this.recorder = null;
    this.pendingResponseAfterTranscription = false;
    this.isSessionConfigured = false;
    this.isSessionStarted = false;

    this.audioQueue?.clear();
    this.audioContext?.close();
    this.audioContext = null;
  }

  disconnect() {
    this.cleanup();
    this.ws?.close();
    this.ws = null;
  }
}
