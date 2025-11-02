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

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    console.log('Adding audio to queue, size:', audioData.length);
    this.queue.push(audioData);
    if (!this.isPlaying) {
      console.log('Starting playback');
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      console.log('Audio queue empty');
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;
    console.log('Playing audio chunk, size:', audioData.length);

    try {
      // Ensure AudioContext is running
      if (this.audioContext.state === 'suspended') {
        console.log('Resuming AudioContext...');
        await this.audioContext.resume();
      }
      
      const wavData = this.createWavFromPCM(audioData);
      console.log('WAV data created, size:', wavData.length);
      
      // Create a new ArrayBuffer from the Uint8Array to avoid SharedArrayBuffer issues
      const arrayBuffer = wavData.buffer.slice(0) as ArrayBuffer;
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log('Audio decoded, duration:', audioBuffer.duration, 'seconds');
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        console.log('Audio chunk finished');
        this.playNext();
      };
      source.start(0);
      console.log('Audio playback started');
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }

  clear() {
    this.queue = [];
    this.isPlaying = false;
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

export class RealtimeVoiceChat {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  public audioContext: AudioContext | null = null;
  private audioQueue: AudioQueue | null = null;
  private onMessage: (message: any) => void;
  private onSpeakingChange: (speaking: boolean) => void;
  private isRecording = false;

  constructor(
    onMessage: (message: any) => void,
    onSpeakingChange: (speaking: boolean) => void
  ) {
    this.onMessage = onMessage;
    this.onSpeakingChange = onSpeakingChange;
  }

  async init() {
    try {
      // Only prepare audio pipeline (no WebSocket)
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      console.log('AudioContext state:', this.audioContext.state);

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('AudioContext resumed, new state:', this.audioContext.state);
      }

      this.audioQueue = new AudioQueue(this.audioContext);
      console.log('Audio pipeline ready');
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    }
  }

  private recordedPCM: Uint8Array[] = [];

  private float32ToPCM16(float32Array: Float32Array): Uint8Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return new Uint8Array(int16Array.buffer);
  }

  async startRecording() {
    if (this.isRecording) return;
    try {
      this.recordedPCM = [];
      this.recorder = new AudioRecorder((audioData) => {
        const bytes = this.float32ToPCM16(audioData);
        this.recordedPCM.push(bytes);
      });
      await this.recorder.start();
      this.isRecording = true;
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.buffer);
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const writeString = (v: DataView, o: number, s: string) => { for (let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
    const sampleRate = 24000, numChannels = 1, bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);
    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    return wavArray;
  }

  private toBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }
    return btoa(binary);
  }

  async stopRecordingAndSend() {
    if (!this.isRecording) return;
    try {
      this.recorder?.stop();
      this.isRecording = false;
      console.log('Recording stopped');

      // Concatenate PCM
      const totalLen = this.recordedPCM.reduce((acc, b) => acc + b.length, 0);
      const allPCM = new Uint8Array(totalLen);
      let offset = 0;
      for (const b of this.recordedPCM) { allPCM.set(b, offset); offset += b.length; }
      console.log('PCM concatenated length:', allPCM.length);

      // Make WAV and base64
      const wav = this.createWavFromPCM(allPCM);
      const wavBase64 = this.toBase64(wav);

      // Call edge function
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await (supabase as any).functions.invoke('voice-counselor', {
        body: { audio: wavBase64 }
      });

      if (error) {
        console.error('voice-counselor error:', error);
        throw new Error(error.message || 'Failed to get response');
      }

      const assistantText = data?.text as string | undefined;
      const assistantAudio = data?.audio as string | undefined;

      // Emit messages
      if (assistantText) {
        this.onMessage({ type: 'assistant.text', content: assistantText });
      }

      // Play audio
      if (assistantAudio && this.audioContext) {
        try {
          const binaryString = atob(assistantAudio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
          const source = this.audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(this.audioContext.destination);
          source.start(0);
          console.log('Assistant audio playback started');
        } catch (e) {
          console.error('Failed to play assistant audio:', e);
        }
      }
    } catch (error) {
      console.error('Error stopping/sending:', error);
      throw error;
    }
  }

  async sendMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(event));
    this.ws.send(JSON.stringify({ type: 'response.create' }));
  }

  private cleanup() {
    this.recorder?.stop();
    this.audioQueue?.clear();
    this.recorder = null;
    this.audioQueue = null;
  }

  disconnect() {
    this.cleanup();
    this.ws?.close();
    this.ws = null;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
