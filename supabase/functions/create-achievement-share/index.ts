import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, shareType, title, description, achievementData } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Creating achievement share with image...');

    // AI로 인증샷 이미지 생성
    const imagePrompt = getImagePrompt(shareType, achievementData);
    
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: imagePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    });

    let imageUrl = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      imageUrl = imageData.data[0]?.b64_json 
        ? `data:image/png;base64,${imageData.data[0].b64_json}`
        : imageData.data[0]?.url;
      console.log('Achievement image generated successfully');
    } else {
      console.error('Image generation failed:', await imageResponse.text());
    }

    // 공유 저장
    const { data: share, error: saveError } = await supabase
      .from('life_achievement_shares')
      .insert({
        user_id: userId,
        share_type: shareType,
        title,
        description,
        image_url: imageUrl,
        achievement_data: achievementData,
        is_public: true
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving share:', saveError);
      throw saveError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        share
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-achievement-share:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getImagePrompt(shareType: string, data: any): string {
  switch (shareType) {
    case 'goal_completed':
      return `A celebration image for completing a life goal: ${data.goalText}. Show achievement, success, and happiness. Vibrant colors, inspirational style, digital art`;
    case 'milestone':
      return `A milestone achievement image showing ${data.level} level reached with ${data.score}% completion. Trophy, stars, success theme, golden colors, digital illustration`;
    case 'badge_earned':
      return `A badge award ceremony image for earning "${data.badgeName}" badge. Epic achievement moment, glowing badge, celebration atmosphere, fantasy style digital art`;
    case 'weekly_report':
      return `A progress report visualization showing improvement from ${data.previousScore}% to ${data.currentScore}%. Growth, upward trend, positive energy, modern infographic style`;
    default:
      return 'A general achievement celebration image with confetti and success symbols, vibrant and joyful digital art';
  }
}