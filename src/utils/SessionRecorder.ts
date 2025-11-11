export interface RecordedMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

export interface RecordedSession {
  id: string;
  startTime: number;
  endTime?: number;
  messages: RecordedMessage[];
  audioBlob?: Blob;
}

export class SessionRecorder {
  private isRecording = false;
  private currentSession: RecordedSession | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private sessions: RecordedSession[] = [];

  async startRecording(userConsent: boolean): Promise<string | null> {
    if (!userConsent) {
      console.log('User did not consent to recording');
      return null;
    }

    try {
      // 오디오 녹음 시작
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // 1초마다 데이터 수집

      // 세션 시작
      const sessionId = `session_${Date.now()}`;
      this.currentSession = {
        id: sessionId,
        startTime: Date.now(),
        messages: []
      };

      this.isRecording = true;
      console.log('Recording started:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return null;
    }
  }

  addMessage(role: 'user' | 'assistant', content: string) {
    if (!this.isRecording || !this.currentSession) return;

    this.currentSession.messages.push({
      role,
      content,
      timestamp: Date.now()
    });
  }

  async stopRecording(): Promise<RecordedSession | null> {
    if (!this.isRecording || !this.currentSession) return null;

    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          if (this.currentSession) {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.currentSession.audioBlob = audioBlob;
            this.currentSession.endTime = Date.now();
            
            // 세션 저장
            this.sessions.push(this.currentSession);
            
            // localStorage에 메타데이터 저장 (오디오는 제외)
            this.saveSessionMetadata(this.currentSession);
            
            const session = this.currentSession;
            this.currentSession = null;
            this.isRecording = false;
            
            // 스트림 정리
            if (this.mediaRecorder?.stream) {
              this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            
            resolve(session);
          }
        };
        
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  private saveSessionMetadata(session: RecordedSession) {
    try {
      const savedSessions = this.getSavedSessions();
      const metadata = {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        messageCount: session.messages.length
      };
      
      savedSessions.push(metadata);
      localStorage.setItem('counseling_sessions', JSON.stringify(savedSessions));
    } catch (error) {
      console.error('Failed to save session metadata:', error);
    }
  }

  getSavedSessions() {
    try {
      const saved = localStorage.getItem('counseling_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  getSession(sessionId: string): RecordedSession | null {
    return this.sessions.find(s => s.id === sessionId) || null;
  }

  downloadSession(sessionId: string) {
    const session = this.getSession(sessionId);
    if (!session) return;

    // 트랜스크립트 다운로드
    const transcript = this.generateTranscript(session);
    const textBlob = new Blob([transcript], { type: 'text/plain' });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement('a');
    textLink.href = textUrl;
    textLink.download = `session_${session.id}_transcript.txt`;
    textLink.click();

    // 오디오 다운로드
    if (session.audioBlob) {
      const audioUrl = URL.createObjectURL(session.audioBlob);
      const audioLink = document.createElement('a');
      audioLink.href = audioUrl;
      audioLink.download = `session_${session.id}_audio.webm`;
      audioLink.click();
    }
  }

  private generateTranscript(session: RecordedSession): string {
    let transcript = `상담 세션 기록\n`;
    transcript += `세션 ID: ${session.id}\n`;
    transcript += `시작 시간: ${new Date(session.startTime).toLocaleString('ko-KR')}\n`;
    if (session.endTime) {
      transcript += `종료 시간: ${new Date(session.endTime).toLocaleString('ko-KR')}\n`;
    }
    transcript += `\n${'='.repeat(50)}\n\n`;

    session.messages.forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR');
      const speaker = msg.role === 'user' ? '사용자' : 'AI 상담사';
      transcript += `[${time}] ${speaker}:\n${msg.content}\n\n`;
    });

    return transcript;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}
