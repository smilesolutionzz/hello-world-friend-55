import { supabase } from "@/integrations/supabase/client";

export interface ImageGenerationParams {
  prompt: string;
  type: 'healing' | 'psychology-art' | 'meditation' | 'emotion-diary';
  context?: {
    emotions?: string[];
    colors?: string[];
    style?: string;
    intensity?: 'low' | 'medium' | 'high';
    assessmentResults?: Record<string, any>;
    selectedTraits?: string[];
  };
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  type: string;
  metadata?: Record<string, any>;
}

class ReplicateService {
  async generateImage(params: ImageGenerationParams): Promise<GeneratedImage> {
    try {
      const enhancedPrompt = this.enhancePrompt(params);
      
      console.log('Generating image with enhanced prompt:', enhancedPrompt);
      
      const { data, error } = await supabase.functions.invoke('replicate-image-generator', {
        body: {
          prompt: enhancedPrompt,
          type: params.type,
          context: params.context,
          aspectRatio: params.type === 'meditation' ? '16:9' : '1:1',
          style: this.getStyleForType(params.type)
        }
      });

      if (error) throw error;

      return {
        url: data.output?.[0] || data.imageUrl,
        prompt: enhancedPrompt,
        type: params.type,
        metadata: {
          originalPrompt: params.prompt,
          context: params.context,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      throw new Error('이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  private enhancePrompt(params: ImageGenerationParams): string {
    const basePrompt = params.prompt;
    
    switch (params.type) {
      case 'healing':
        return `${basePrompt}, peaceful, therapeutic, calming colors, soft lighting, natural elements, healing atmosphere, serene landscape, ultra high resolution, professional photography style`;
      
      case 'psychology-art':
        return `${basePrompt}, abstract psychological visualization, emotional depth, symbolic representation, artistic interpretation, modern art style, meaningful composition, ultra high resolution`;
      
      case 'meditation':
        return `${basePrompt}, meditation background, zen atmosphere, minimalist, peaceful, soft gradient colors, calming environment, spiritual ambiance, ultra high resolution, wide aspect ratio`;
      
      case 'emotion-diary':
        return `${basePrompt}, emotional journal visualization, personal story illustration, warm and intimate style, diary-like aesthetic, gentle colors, ultra high resolution`;
      
      default:
        return `${basePrompt}, ultra high resolution`;
    }
  }

  private getStyleForType(type: string): string {
    switch (type) {
      case 'healing':
        return 'photorealistic, natural, peaceful';
      case 'psychology-art':
        return 'abstract, artistic, symbolic';
      case 'meditation':
        return 'minimalist, zen, gradient';
      case 'emotion-diary':
        return 'warm, personal, illustrated';
      default:
        return 'artistic';
    }
  }

  generateHealingPrompt(emotions: string[], intensity: 'low' | 'medium' | 'high'): string {
    const emotionMap: Record<string, string[]> = {
      stressed: ['calm forest path', 'gentle ocean waves', 'peaceful mountain valley'],
      anxious: ['soft morning sunlight', 'quiet garden sanctuary', 'serene lake reflection'],
      sad: ['warm sunset glow', 'cozy indoor fireplace', 'gentle spring meadow'],
      angry: ['cool mountain stream', 'vast open sky', 'peaceful zen garden'],
      tired: ['restful hammock scene', 'soft cloud formations', 'gentle rain on leaves']
    };

    const intensityMap = {
      low: 'subtle, gentle',
      medium: 'comforting, embracing',
      high: 'deeply healing, transformative'
    };

    const selectedScenes = emotions.flatMap(emotion => 
      emotionMap[emotion] || ['peaceful natural landscape']
    );
    
    const randomScene = selectedScenes[Math.floor(Math.random() * selectedScenes.length)];
    
    return `${randomScene}, ${intensityMap[intensity]} atmosphere`;
  }

  generatePsychologyArt(assessmentResults: Record<string, any>): string {
    const traits = Object.keys(assessmentResults).slice(0, 3);
    const artStyles = ['flowing organic shapes', 'geometric patterns', 'abstract landscapes', 'symbolic elements'];
    const colors = this.getColorsForTraits(traits);
    
    return `abstract visualization representing ${traits.join(', ')}, ${artStyles[Math.floor(Math.random() * artStyles.length)]}, ${colors} color palette`;
  }

  private getColorsForTraits(traits: string[]): string {
    const colorMap: Record<string, string> = {
      extroversion: 'warm vibrant',
      introversion: 'cool calming',
      openness: 'creative rainbow',
      conscientiousness: 'structured blue and green',
      agreeableness: 'gentle pastel',
      neuroticism: 'dynamic contrasting'
    };

    return traits.map(trait => colorMap[trait] || 'harmonious').join(' and ');
  }
}

export const replicateService = new ReplicateService();