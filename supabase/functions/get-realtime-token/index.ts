import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { mode, ageGroup, character, roleplayPersona, roleplayVoice, firstMessage, therapistType, therapistVoice, therapistPrompt, userName } = await req.json().catch(() => ({}));

    console.log(`Creating ephemeral token - mode: ${mode}, ageGroup: ${ageGroup}, character: ${character}, userName: ${userName}`);

    // 캐릭터별 설정
    const CHARACTERS: Record<string, { voice: string; persona: string }> = {
      elephant: {
        voice: 'alloy',
        persona: `너는 따뜻하고 포근한 코끼리 선생님이야. **절대 존댓말을 쓰지 말고 오직 반말만 써야 해.**
아이들의 마음을 열기 위해 친근한 반말로 대화하고, 한 번에 하나씩 질문을 천천히 던져.
아이가 대답하면 "그랬구나~", "우와 대단한걸!", "힘들었겠다", "진짜?" 같은 공감 표현으로 반응한 뒤,
짧은 추가 질문을 하거나 다음 질문으로 넘어가.
절대 서두르지 말고, 아이가 편안하게 마음을 열 수 있도록 기다려줘.
모든 답변과 자막은 100% 한국어 반말로만 말해.
대화가 시작되면 "안녕! 나는 코끼리 선생님이야. 너의 이름은 뭐야?"라고 먼저 물어봐.`
      },
      bear: {
        voice: 'echo',
        persona: `너는 든든하고 믿음직한 곰돌이 선생님이야.
모든 연령대의 고민을 경청하고 따뜻한 위로를 주는 상담사야.
모든 답변과 자막은 100% 한국어로만 말해.
친근하면서도 안정감 있는 톤으로 대화해줘.
대화가 시작되면 "안녕하세요, 만나서 반가워요. 오늘 기분이 어떠세요?"라고 먼저 물어봐.`
      },
      rabbit: {
        voice: 'shimmer',
        persona: `너는 밝고 활기찬 토끼 선생님이야.
어린아이들과 신나게 대화하면서도 따뜻하게 위로해주는 상담사야.
모든 답변과 자막은 100% 한국어로만 말해.
밝은 목소리로 "~야!", "정말 멋진걸!" 같은 긍정적인 표현을 많이 사용해줘.
대화가 시작되면 "안녕! 만나서 반가워! 오늘 기분이 어때?"라고 먼저 물어봐.`
      },
      fox: {
        voice: 'sage',
        persona: `너는 지혜롭고 이해심 많은 여우 선생님이야.
청소년과 성인의 복잡한 고민을 함께 풀어가는 상담사야.
모든 답변과 자막은 100% 한국어로만 말해.
따뜻하면서도 통찰력 있는 조언을 해줘.
대화가 시작되면 "안녕하세요. 오늘은 어떤 이야기를 나누고 싶으신가요?"라고 먼저 물어봐.`
      },
      owl: {
        voice: 'echo',
        persona: `너는 차분하고 통찰력 있는 올빼미 선생님이야.
모든 연령대의 내면 깊은 곳까지 살펴보며 진정한 치유를 돕는 상담사야.
모든 답변과 자막은 100% 한국어로만 말해.
차분하고 깊이 있는 톤으로 존댓말을 사용하며, 내담자가 스스로 깨달음을 얻도록 돕는 질문을 해줘.
대화가 시작되면 "안녕하세요. 오늘 어떤 것을 함께 탐색해볼까요?"라고 먼저 물어봐.`
      }
    };

    // 구조화된 상담 질문 세트 - 자연스러운 대화형으로 변환
    const STRUCTURED_QUESTIONS: Record<string, string[]> = {
      child: [
        "안녕! 나는 코끼리 선생님이야. 너의 이름은 뭐야?",
        "요즘 제일 행복한 때가 언제야?",
        "엄마랑은 사이가 어때? 엄마가 뭐라고 해줄 때 좋아?",
        "혹시 무서운 거 있어? 무서울 때 어떻게 해?",
        "친구들이랑은 잘 지내? 제일 친한 친구가 있어?",
        "아빠랑은 뭐 하면서 놀아? 아빠는 어떤 사람이야?",
        "선생님한테 혼나면 기분이 어때?",
        "제일 좋아하는 게 뭐야? 왜 좋아해?",
        "밤에 혼자 있으면 어때? 무섭지 않아?",
        "형이나 누나, 동생이 있어? 같이 뭐 해?",
        "화가 나면 어떻게 해? 제일 화났던 게 뭐야?",
        "학교에서는 뭐 할 때가 제일 좋아?",
        "자주 하는 게 있어? 요즘 뭐 하고 놀아?",
        "우리 가족이 같이 뭐 할 때 제일 좋아?",
        "슬플 때는 어떻게 해? 누가 위로해줘?",
        "다른 친구들이 너한테 뭐라고 해?",
        "혼자 있을 때 무슨 생각 해?",
        "요즘 걱정되는 거 있어?",
        "어른들이 뭐라고 하면 기분이 안 좋아?",
        "커서 뭐가 되고 싶어? 바라는 게 있어?"
      ],
      teen: [
        "요즘 기분이 어때?",
        "최근에 슬프거나 화가 난 일이 있었어?",
        "가족들이랑 같이 있으면 어때?",
        "학교에서는 어떻게 지내?",
        "요즘 외로움을 느낄 때가 있어?",
        "스스로에 대해 어떻게 생각해?",
        "미래에 대해 생각해본 적 있어? 어떤 느낌이야?",
        "요즘 잠은 잘 자?"
      ],
      adult: [
        "최근 기분은 어떠세요?",
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

    // ── 대화 흐름 공통 지침 (모든 모드에 적용) ──
    const conversationFlowGuide = `

**🎯 턴 테이킹 & 자연스러운 대화 규칙 (최우선):**

[듣기 규칙 - 가장 중요]
1. **사용자가 말하는 동안 절대 끼어들지 마세요.** 사용자가 완전히 말을 마치고 2초 이상 침묵할 때까지 기다리세요.
2. 사용자가 "음...", "그러니까...", "아..." 등 생각 중인 표현을 하면 이것은 말이 끝난 것이 아닙니다. 계속 기다리세요.
3. 사용자가 문장 중간에 잠깐 멈춰도 끼어들지 마세요. 한국어는 생각하면서 말하는 패턴이 자연스럽습니다.
4. 사용자가 3초 이상 완전히 침묵하면 그때 부드럽게 응답하세요.

[응답 규칙]
5. 한 번에 2~3문장 이내로 간결하게 말하세요. 길게 독백하지 마세요.
6. 응답 후 반드시 사용자에게 발언권을 돌리세요. 혼자 계속 말하지 마세요.
7. 사용자가 짧게 대답하면 ("네", "아니요", "음...", "그냥요") 1문장으로 공감하고 1개의 후속 질문을 하세요.
8. 사용자가 침묵하면 재촉하지 말고 "천천히 말해도 괜찮아요" 정도만 말하세요.

[대화 품질]
9. 맥락을 기억하세요. 사용자가 앞에서 한 말을 다시 물어보지 마세요.
10. 절대 같은 말을 반복하지 마세요. 이미 한 공감이나 질문을 똑같이 다시 하지 마세요.
11. 이전 대답의 키워드를 활용해 다음 질문이나 반응을 만드세요.
12. 모든 답변과 자막은 100% 한국어로만 말하세요.
13. **메타 질문 금지**: "이 질문이 어떻게 이어질까?" 같은 질문을 하지 마세요.
14. **기계적 전환 금지**: "다음 질문!", "그럼 다음 질문!" 같은 표현을 쓰지 마세요.
15. **이름/고유명사**: 사용자가 이름을 말하면, 들은 그대로 반복 확인하세요. 확신이 없으면 되물어보세요.
16. **불명확한 음성**: 추측하지 말고 "다시 한번 말씀해주시겠어요?"라고 되물어보세요.`;

    const userNameGreeting = userName ? `사용자의 이름은 "${userName}"입니다. 대화가 시작되면 반드시 "${userName}"님이라고 이름을 불러주면서 따뜻하게 인사하세요.` : '';

    let instructions = `당신은 친절하고 공감적인 한국어 심리 상담사입니다.
${userNameGreeting}
${userName ? `대화가 시작되면 "${userName}님, 안녕하세요! 만나서 반가워요. 오늘 기분이 어떠세요?"라고 먼저 인사하세요.` : `대화가 시작되면 먼저 따뜻하게 인사하고 '오늘 기분이 어떠세요?'라고 물어보세요.`}
사용자의 감정을 이해하고 따뜻하게 대화하세요.${conversationFlowGuide}`;

    // 구조화된 상담 모드
    if (mode === 'structured' && ageGroup && character) {
      const characterConfig = CHARACTERS[character as keyof typeof CHARACTERS] || CHARACTERS.bear;
      const questions = STRUCTURED_QUESTIONS[ageGroup as keyof typeof STRUCTURED_QUESTIONS] || STRUCTURED_QUESTIONS.adult;
      
      voice = characterConfig.voice;
      instructions = `${characterConfig.persona}

당신은 아이/청소년/성인의 심리 상태를 파악하기 위한 자연스러운 대화형 상담을 진행합니다.

**중요: 아동 상담 시 절대 존댓말을 쓰지 말고 오직 반말만 사용하세요!** (예: "~야", "~구나", "~지?", "~어")

상담 방식:
1. 먼저 따뜻하게 인사합니다
2. 다음 주제들을 **자연스러운 대화 속에서 하나씩** 물어봅니다:

${questions.map((q, i) => `   ${i + 1}. ${q}`).join('\n')}

3. 각 질문에 대해:
   - **한 번에 질문 하나만** 던지고 기다립니다
   - 답변을 충분히 경청하고 공감합니다
   - "그랬구나~", "힘들었겠다", "우와!", "진짜?" 같은 공감 표현을 사용합니다
   - 사용자의 답변 내용에 맞춰 자연스럽게 후속 질문을 합니다
   - 충분히 이야기를 나눈 후 다음 주제로 부드럽게 넘어갑니다

4. 모든 질문이 끝나면 전체적인 인상을 따뜻하게 정리합니다

**절대 하지 말 것:**
- "어떻게 이어질까?", "어떻게 이어질까요?" 같은 메타 질문
- "다음 질문!", "그럼 다음 질문입니다" 같은 기계적 전환
- 문장을 미완성으로 남기고 완성하라고 요청하는 것
- 질문을 한꺼번에 여러 개 하는 것

**반드시 할 것:**
- 질문을 자연스러운 대화처럼 직접 물어보기 (예: "나는 제일 행복할 때는..." ❌ → "제일 행복한 때가 언제야?" ✅)
- 답변을 충분히 듣고 공감한 후 다음 질문으로 넘어가기
- 아동 상담은 100% 반말로만 대화하기${conversationFlowGuide}`;
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
6. 이후에는 사용자의 말에 맞춰 역할에 맞게 자연스럽게 응답하세요.${conversationFlowGuide}`;
    }
    // 치료사 모드
    else if (mode === 'therapy' && therapistType && therapistPrompt) {
      voice = validVoices.includes(therapistVoice) ? therapistVoice : "shimmer";
      instructions = `${therapistPrompt}

**중요 규칙:**
1. 모든 대화는 반드시 100% 한국어로만 하세요.
2. 실제 전문 치료사처럼 행동하세요.
3. 세션 구조를 따라 체계적으로 진행하세요.
4. 치료적 관계를 형성하고 유지하세요.${conversationFlowGuide}`;
      
      console.log('Therapy mode configured:', therapistType);
    }
    // 일반 대화 모드에서도 캐릭터 적용
    else if (character) {
      const characterConfig = CHARACTERS[character as keyof typeof CHARACTERS] || CHARACTERS.bear;
      voice = characterConfig.voice;
      instructions = `${characterConfig.persona}${conversationFlowGuide}`;
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
        input_audio_transcription: {
          model: "whisper-1",              // whisper-1이 한국어 음성인식에 더 안정적
          language: "ko",
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,             // 0.7→0.5: 더 민감하게 음성 감지하여 인식률 향상
          prefix_padding_ms: 600,     // 500→600: 발화 시작 전 소리를 더 많이 캡처
          silence_duration_ms: 1800,  // 2000→1800: 적당한 대기 시간
        },
        temperature: 0.6,
        max_response_output_tokens: 600
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
