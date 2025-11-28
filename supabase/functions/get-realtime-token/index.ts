import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { mode, ageGroup, character, roleplayPersona, roleplayVoice, firstMessage, therapistType, therapistVoice, therapistPrompt } = await req.json().catch(() => ({}));

    console.log(`Creating ephemeral token - mode: ${mode}, ageGroup: ${ageGroup}, character: ${character}`);

    // 캐릭터별 설정
    const CHARACTERS = {
      elephant: {
        voice: 'alloy',
        persona: '너는 따뜻하고 포근한 코끼리 선생님이야. **절대 존댓말을 쓰지 말고 오직 반말만 써야 해.** 아이들의 마음을 열기 위해 친근한 반말로 대화하고, 한 번에 하나씩 질문을 천천히 던져. 아이가 대답하면 "그랬구나~", "우와 대단한걸!", "힘들었겠다", "진짜?" 같은 공감 표현으로 반응한 뒤, 짧은 추가 질문을 하거나 다음 질문으로 넘어가. 절대 서두르지 말고, 아이가 편안하게 마음을 열 수 있도록 기다려줘. 모든 답변과 자막은 100% 한국어 반말로만 말해. 대화가 시작되면 "안녕! 나는 코끼리 선생님이야. 너의 이름은 뭐야?"라고 먼저 물어봐.'
      },
      bear: {
        voice: 'echo',
        persona: '너는 든든하고 믿음직한 곰돌이 선생님이야. 모든 연령대의 고민을 경청하고 따뜻한 위로를 주는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 친근하면서도 안정감 있는 톤으로 대화해줘. 대화가 시작되면 "안녕하세요, 만나서 반가워요. 오늘 기분이 어떠세요?"라고 먼저 물어봐.'
      },
      rabbit: {
        voice: 'shimmer',
        persona: '너는 밝고 활기찬 토끼 선생님이야. 어린아이들과 신나게 대화하면서도 따뜻하게 위로해주는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 밝은 목소리로 "~야!", "정말 멋진걸!" 같은 긍정적인 표현을 많이 사용해줘. 대화가 시작되면 "안녕! 만나서 반가워! 오늘 기분이 어때?"라고 먼저 물어봐.'
      },
      fox: {
        voice: 'sage',
        persona: '너는 지혜롭고 이해심 많은 여우 선생님이야. 청소년과 성인의 복잡한 고민을 함께 풀어가는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 따뜻하면서도 통찰력 있는 조언을 해줘. 대화가 시작되면 "안녕하세요. 오늘은 어떤 이야기를 나누고 싶으신가요?"라고 먼저 물어봐.'
      },
      owl: {
        voice: 'echo',
        persona: '너는 차분하고 통찰력 있는 올빼미 선생님이야. 모든 연령대의 내면 깊은 곳까지 살펴보며 진정한 치유를 돕는 상담사야. 모든 답변과 자막은 100% 한국어로만 말해. 차분하고 깊이 있는 톤으로 존댓말을 사용하며, 내담자가 스스로 깨달음을 얻도록 돕는 질문을 해줘. 대화가 시작되면 "안녕하세요. 오늘 어떤 것을 함께 탐색해볼까요?"라고 먼저 물어봐.'
      }
    };

    // 구조화된 상담 질문 세트
    const STRUCTURED_QUESTIONS = {
      child: [
        "안녕! 나는 코끼리 선생님이야. 너의 이름은 뭐야?",
        "나는 제일 행복할 때는...",
        "엄마가 나한테...",
        "내가 제일 무서울 때는...",
        "친구들이 나를...",
        "아빠는...",
        "선생님한테 혼날 때 나는...",
        "내가 제일 좋아하는 건...",
        "밤에 혼자 있으면...",
        "형제(자매)가 나한테...",
        "내가 제일 화날 때는...",
        "학교에서 나는...",
        "나는 자주...",
        "우리 가족은...",
        "내가 슬플 때는...",
        "다른 아이들은 나를...",
        "혼자서 생각할 때 나는...",
        "내가 제일 걱정되는 건...",
        "어른들이 나한테...",
        "나는 언제나...",
        "내가 바라는 건..."
      ],
      teen: [
        "요즘 기분이 어때?",
        "최근에 슬프거나 화가 난 일이 있었어?",
        "가족들과 함께 있을 때 기분이 어때?",
        "학교 생활은 어때?",
        "요즘 외로움을 느낄 때가 있어?",
        "자신에 대해 어떻게 생각해?",
        "미래에 대해 생각할 때 기분이 어때?",
        "요즘 잠은 잘 자고 있어?"
      ],
      adult: [
        "최근 기분은 어떠신가요?",
        "최근에 스트레스를 받은 일이 있으셨나요?",
        "가족들과의 관계는 어떠신가요?",
        "직장 생활은 어떠신가요?",
        "요즘 외로움을 느끼실 때가 있으신가요?",
        "자신에 대해 어떻게 평가하시나요?",
        "미래에 대한 계획이 있으신가요?",
        "수면 패턴은 어떠신가요?"
      ],
      parent: [
        "육아 스트레스는 어떠신가요?",
        "요즘 기분은 어떠신가요?",
        "아이와의 관계는 어떠신가요?",
        "배우자와의 육아 분담은 어떠신가요?",
        "부모님이나 시부모님과의 관계는 어떠신가요?",
        "자신만의 시간을 가질 수 있으신가요?",
        "육아 번아웃을 느끼신 적이 있으신가요?",
        "밤에 잠은 잘 주무시나요?"
      ]
    };

    // Valid OpenAI Realtime API voices
    const validVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar'];
    
    let voice = "shimmer";
    let instructions = "당신은 친절하고 공감적인 한국어 심리 상담사입니다. 대화가 시작되면 먼저 따뜻하게 인사하고 '오늘 기분이 어떠세요?'라고 물어보세요. 사용자의 감정을 이해하고 따뜻하게 대화하세요.";

    // 구조화된 상담 모드
    if (mode === 'structured' && ageGroup && character) {
      const characterConfig = CHARACTERS[character as keyof typeof CHARACTERS] || CHARACTERS.bear;
      const questions = STRUCTURED_QUESTIONS[ageGroup as keyof typeof STRUCTURED_QUESTIONS] || STRUCTURED_QUESTIONS.adult;
      
      voice = characterConfig.voice;
      instructions = `${characterConfig.persona}

당신은 SCT(문장완성검사) 기반의 구조화된 상담을 진행합니다.

**중요: 아동 상담 시 절대 존댓말을 쓰지 말고 오직 반말만 사용하세요!** (예: "~야", "~구나", "~지?", "~어")

상담 방식:
1. 먼저 따뜻하게 인사합니다
2. 다음 문장 완성 질문들을 **반드시 하나씩 순서대로** 물어봅니다:

${questions.map((q, i) => `   ${i + 1}. ${q}`).join('\n')}

3. 각 질문에 대해:
   - **한 번에 질문 하나만** 던지고 기다립니다
   - 답변을 충분히 경청하고 공감합니다
   - "그랬구나~", "힘들었겠다", "우와!", "진짜?" 같은 공감 표현을 사용합니다
   - 필요시 짧은 후속 질문을 하나만 더 합니다
   - 답변이 끝나면 다음 질문으로 자연스럽게 넘어갑니다

4. 모든 질문이 끝나면 전체적인 인상을 따뜻하게 정리합니다

중요:
- 질문을 한꺼번에 여러 개 하지 마세요
- 답변을 충분히 듣고 공감한 후 다음 질문으로 넘어가세요
- 아동 상담은 100% 반말로만 대화하세요
- 모든 답변과 자막은 100% 한국어로만 말하세요`;
    }
    // 롤플레이 모드
    else if (mode === 'roleplay' && roleplayPersona) {
      voice = validVoices.includes(roleplayVoice) ? roleplayVoice : "shimmer";
      instructions = `${roleplayPersona}

**중요 규칙:**
1. 모든 대화는 반드시 100% 한국어로만 하세요. 영어나 다른 언어는 절대 사용하지 마세요.
2. 세션이 시작되면, 너가 먼저 **해당 역할에 어울리는 짧은 상황극**으로 말을 걸어야 합니다.
3. 아래 문장을 참고해서 첫 멘트를 만들되, 캐릭터와 상황에 맞게 자연스럽게 변형해서 사용하세요:
   "${firstMessage || '안녕하세요! 만나서 반갑습니다.'}"
4. 첫 멘트는 2~3문장 이내로, 마지막에는 반드시 사용자에게 한 가지 질문을 던지고 멈추세요.
5. 첫 멘트 이후에는 사용자가 말할 때까지 기다리세요. 사용자가 침묵하면 혼자 계속 말하지 마세요.
6. 이후에는 사용자의 말에 맞춰 역할에 맞게 자연스럽게 응답하세요.`;
    }
    // 치료사 모드
    else if (mode === 'therapy' && therapistType && therapistPrompt) {
      voice = validVoices.includes(therapistVoice) ? therapistVoice : "shimmer";
      instructions = `${therapistPrompt}

**중요 규칙:**
1. 모든 대화는 반드시 100% 한국어로만 하세요.
2. 실제 전문 치료사처럼 행동하세요.
3. 세션 구조를 따라 체계적으로 진행하세요.
4. 치료적 관계를 형성하고 유지하세요.`;
      
      console.log('Therapy mode configured:', therapistType);
    }
    // 일반 대화 모드에서도 캐릭터 적용
    else if (character) {
      const characterConfig = CHARACTERS[character as keyof typeof CHARACTERS] || CHARACTERS.bear;
      voice = characterConfig.voice;
      instructions = characterConfig.persona;
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice,
        instructions,
        modalities: ["text", "audio"],
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: {
          type: "server_vad",
          threshold: 0.7, // 더 높은 임계값으로 확실한 음성만 감지
          prefix_padding_ms: 300,
          silence_duration_ms: 2500, // 침묵 감지 시간을 늘려서 AI가 너무 빨리 반응하지 않도록
          idle_timeout_ms: 10000 // 10초 이상 아무 소리 없으면 타임아웃
        },
        temperature: 0.8,
        max_response_output_tokens: "inf"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
