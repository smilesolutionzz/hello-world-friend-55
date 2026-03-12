import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Users, Target } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface PlayActivityRecommendationsProps {
  cognitiveScore: number;
  emotionalScore: number;
  socialScore: number;
  physicalScore: number;
  ageGroup: string;
  childAge: number;
}

const PlayActivityRecommendations = ({
  cognitiveScore,
  emotionalScore,
  socialScore,
  physicalScore,
  ageGroup,
  childAge,
}: PlayActivityRecommendationsProps) => {
  const { isEnglish } = useLanguage();

  const domainLabels = isEnglish
    ? { cognitive: 'Cognitive', emotional: 'Emotional', social: 'Social', physical: 'Physical' }
    : { cognitive: '인지', emotional: '정서', social: '사회성', physical: '신체' };

  const scores = [
    { domain: domainLabels.cognitive, score: cognitiveScore, key: 'cognitive' },
    { domain: domainLabels.emotional, score: emotionalScore, key: 'emotional' },
    { domain: domainLabels.social, score: socialScore, key: 'social' },
    { domain: domainLabels.physical, score: physicalScore, key: 'physical' },
  ].sort((a, b) => a.score - b.score);

  const weakestDomain = scores[0];
  const secondWeakest = scores[1];

  const p1 = isEnglish ? 'Parent' : '부모 1명';
  const p1f = isEnglish ? 'Parent + siblings' : '부모 1명 + 형제자매';
  const p1fam = isEnglish ? 'Parent + family' : '부모 1명 + 가족';
  const pFriends = isEnglish ? 'Friends' : '친구들';
  const pFriendsFamily = isEnglish ? 'Friends or family' : '친구들 또는 가족';
  const pClass = isEnglish ? 'Class participation' : '수업 참여';
  const pParentFriend = isEnglish ? 'Parent or friend' : '부모 1명 또는 친구';
  const none = isEnglish ? 'None' : '없음';
  const anytime = isEnglish ? 'Anytime' : '수시로';

  const activities = isEnglish ? {
    infant: {
      cognitive: [
        { title: 'Sound Toy Exploration', description: 'Provide toys that make various sounds to help baby understand cause and effect.', duration: '10-15 min', participants: p1, materials: 'Rattles, musical toys, sound books' },
        { title: 'Peekaboo', description: 'Cover and reveal your face to develop object permanence.', duration: '5-10 min', participants: p1, materials: 'Handkerchief or hands' },
        { title: 'Cup Stacking', description: 'Stack and knock down cups of various sizes to develop spatial awareness.', duration: '10-15 min', participants: p1, materials: 'Plastic cup set' },
      ],
      emotional: [
        { title: 'Skin Contact & Eye Contact', description: 'Hold baby gently and make eye contact to build emotional bonding.', duration: anytime, participants: p1, materials: none },
        { title: 'Emotion Songs', description: 'Sing songs with various emotions matching baby\'s mood.', duration: '5-10 min', participants: p1, materials: none },
        { title: 'Mirror Play', description: 'Let baby explore their face and expressions in a mirror.', duration: '5-10 min', participants: p1, materials: 'Safe mirror' },
      ],
      social: [
        { title: 'Imitation Play', description: 'Mimic baby\'s sounds and gestures to teach the joy of interaction.', duration: '5-10 min', participants: p1, materials: none },
        { title: 'Play Mat Together', description: 'Lie on the play mat together, exchanging toys and interacting.', duration: '15-20 min', participants: p1, materials: 'Play mat, toys' },
      ],
      physical: [
        { title: 'Tummy Time Encouragement', description: 'Place fun toys slightly out of reach to encourage crawling.', duration: '10-15 min', participants: p1, materials: 'Soft mat, toys' },
        { title: 'Texture Play', description: 'Touch various textured fabrics and materials to develop senses.', duration: '10-15 min', participants: p1, materials: 'Various fabrics, texture balls' },
        { title: 'Ball Rolling', description: 'Roll a soft ball back and forth to develop gross motor skills.', duration: '10-15 min', participants: p1, materials: 'Soft ball' },
      ],
    },
    child: {
      cognitive: [
        { title: 'Color & Shape Sorting', description: 'Sort blocks by color and shape to develop logical thinking.', duration: '15-20 min', participants: p1, materials: 'Various blocks, sorting boxes' },
        { title: 'Counting Games', description: 'Count together while climbing stairs or eating snacks.', duration: '10-15 min', participants: p1, materials: 'Countable objects' },
        { title: 'Puzzle Solving', description: 'Complete age-appropriate puzzles together to build problem-solving skills.', duration: '15-20 min', participants: p1, materials: '4-12 piece puzzles' },
      ],
      emotional: [
        { title: 'Emotion Cards', description: 'Use cards with various emotions to understand and express feelings.', duration: '10-15 min', participants: p1, materials: 'Emotion cards or pictures' },
        { title: 'Doll Role Play', description: 'Talk with dolls to express emotions in various situations.', duration: '20-30 min', participants: p1, materials: 'Dolls, props' },
        { title: 'Story Time & Emotion Talk', description: 'Discuss the emotions of characters in picture books.', duration: '15-20 min', participants: p1, materials: 'Emotion-themed picture books' },
      ],
      social: [
        { title: 'Store Play', description: 'Take turns as shopkeeper and customer to practice social interaction.', duration: '20-30 min', participants: p1f, materials: 'Play money, items' },
        { title: 'Cooperative Block Building', description: 'Build a big structure together to learn cooperation.', duration: '20-30 min', participants: pParentFriend, materials: 'Block set' },
        { title: 'Turn-Taking Games', description: 'Practice waiting for turns with simple board games.', duration: '15-20 min', participants: p1fam, materials: 'Simple board games' },
      ],
      physical: [
        { title: 'Obstacle Course', description: 'Create an obstacle course with cushions and chairs.', duration: '20-30 min', participants: p1, materials: 'Cushions, chairs, boxes' },
        { title: 'Catch & Throw', description: 'Practice throwing and catching a ball at increasing distances.', duration: '15-20 min', participants: p1, materials: 'Soft ball' },
        { title: 'Dancing', description: 'Dance freely to favorite music.', duration: '15-20 min', participants: p1fam, materials: 'Music' },
      ],
    },
    school: {
      cognitive: [
        { title: 'Strategy Board Games', description: 'Play chess, Go, or other strategy games to develop thinking skills.', duration: '30-45 min', participants: pParentFriend, materials: 'Board games' },
        { title: 'Science Experiments', description: 'Conduct simple science experiments to foster curiosity.', duration: '30-45 min', participants: p1, materials: 'Experiment materials' },
        { title: 'Reading & Discussion', description: 'Read books and discuss content to develop critical thinking.', duration: '30-45 min', participants: p1, materials: 'Books' },
      ],
      emotional: [
        { title: 'Emotion Journal', description: 'Express daily emotions in a journal and discuss them.', duration: '15-20 min', participants: p1, materials: 'Journal, pen' },
        { title: 'Stress Relief Activities', description: 'Find stress relief methods like drawing or listening to music.', duration: '20-30 min', participants: p1, materials: 'Various materials' },
        { title: 'Role Playing', description: 'Practice handling difficult situations through role play.', duration: '20-30 min', participants: p1fam, materials: none },
      ],
      social: [
        { title: 'Team Sports', description: 'Build teamwork and leadership through soccer, basketball, etc.', duration: '45-60 min', participants: pFriends, materials: 'Sports equipment' },
        { title: 'Cooperative Projects', description: 'Learn cooperation by planning and creating things together.', duration: '1-2 hours', participants: pFriendsFamily, materials: 'Project materials' },
        { title: 'Volunteer Work', description: 'Develop empathy through volunteer activities with family or friends.', duration: '2-3 hours', participants: pFriendsFamily, materials: 'Volunteer supplies' },
      ],
      physical: [
        { title: 'Sports Activities', description: 'Build fitness through regular practice of a favorite sport.', duration: '1 hour', participants: pFriendsFamily, materials: 'Sports equipment' },
        { title: 'Bike Riding', description: 'Develop balance and endurance through cycling.', duration: '30-45 min', participants: pParentFriend, materials: 'Bicycle, helmet' },
        { title: 'Dance or Martial Arts', description: 'Develop body control through dance or martial arts lessons.', duration: '45-60 min', participants: pClass, materials: 'Workout clothes' },
      ],
    },
  } : {
    infant: {
      cognitive: [
        { title: '소리 나는 장난감 탐색', description: '다양한 소리가 나는 장난감을 제공하고 아기가 원인과 결과를 이해하도록 도와주세요.', duration: '10-15분', participants: p1, materials: '딸랑이, 악기 장난감, 소리나는 책' },
        { title: '까꿍 놀이', description: '얼굴을 가렸다 보이며 대상 영속성 개념을 발달시켜주세요.', duration: '5-10분', participants: p1, materials: '손수건이나 손' },
        { title: '컵 쌓기', description: '다양한 크기의 컵을 쌓고 무너뜨리며 공간 지각력을 키워주세요.', duration: '10-15분', participants: p1, materials: '플라스틱 컵 세트' },
      ],
      emotional: [
        { title: '스킨십과 눈 맞춤', description: '아기를 부드럽게 안고 눈을 맞추며 정서적 유대감을 형성하세요.', duration: anytime, participants: p1, materials: none },
        { title: '감정 노래 부르기', description: '아기의 기분에 맞춰 다양한 감정을 담은 노래를 불러주세요.', duration: '5-10분', participants: p1, materials: none },
        { title: '거울 보기', description: '거울을 보며 자신의 얼굴과 표정을 탐색하게 해주세요.', duration: '5-10분', participants: p1, materials: '안전한 거울' },
      ],
      social: [
        { title: '모방 놀이', description: '아기의 소리나 몸짓을 따라하며 상호작용의 즐거움을 알려주세요.', duration: '5-10분', participants: p1, materials: none },
        { title: '함께 놀이매트에서 놀기', description: '놀이매트에 함께 누워 장난감을 주고받으며 상호작용하세요.', duration: '15-20분', participants: p1, materials: '놀이매트, 장난감' },
      ],
      physical: [
        { title: '배밀이 격려하기', description: '재미있는 장난감을 조금 떨어진 곳에 두고 배밀이를 격려하세요.', duration: '10-15분', participants: p1, materials: '부드러운 매트, 장난감' },
        { title: '촉감 놀이', description: '다양한 질감의 천이나 재료를 만지며 감각을 발달시켜주세요.', duration: '10-15분', participants: p1, materials: '다양한 천, 촉감볼' },
        { title: '공 굴리기', description: '부드러운 공을 굴려주고 잡으며 대근육을 발달시켜주세요.', duration: '10-15분', participants: p1, materials: '부드러운 공' },
      ],
    },
    child: {
      cognitive: [
        { title: '색깔과 모양 분류 놀이', description: '다양한 색깔과 모양의 블록을 분류하며 논리적 사고를 키워주세요.', duration: '15-20분', participants: p1, materials: '다양한 블록, 분류 상자' },
        { title: '숫자 세기 놀이', description: '계단을 오르거나 과자를 먹을 때 함께 숫자를 세어보세요.', duration: '10-15분', participants: p1, materials: '셀 수 있는 물건들' },
        { title: '퍼즐 맞추기', description: '연령에 맞는 퍼즐을 함께 맞추며 문제 해결 능력을 키워주세요.', duration: '15-20분', participants: p1, materials: '4-12조각 퍼즐' },
      ],
      emotional: [
        { title: '감정 카드 놀이', description: '다양한 감정이 그려진 카드를 보며 감정을 이해하고 표현해보세요.', duration: '10-15분', participants: p1, materials: '감정 카드 또는 그림' },
        { title: '인형 역할놀이', description: '인형과 대화하며 다양한 상황에서의 감정을 표현해보세요.', duration: '20-30분', participants: p1, materials: '인형, 소품' },
        { title: '그림책 읽고 감정 이야기하기', description: '그림책 속 인물의 감정에 대해 이야기 나누세요.', duration: '15-20분', participants: p1, materials: '감정 관련 그림책' },
      ],
      social: [
        { title: '가게 놀이', description: '가게 주인과 손님 역할을 번갈아하며 사회적 상호작용을 연습하세요.', duration: '20-30분', participants: p1f, materials: '장난감 돈, 물건' },
        { title: '협동 블록 쌓기', description: '함께 큰 건물을 만들며 협력하는 방법을 배워요.', duration: '20-30분', participants: pParentFriend, materials: '블록 세트' },
        { title: '차례 지키기 게임', description: '간단한 보드게임으로 차례를 기다리는 연습을 해요.', duration: '15-20분', participants: p1fam, materials: '간단한 보드게임' },
      ],
      physical: [
        { title: '장애물 코스', description: '쿠션, 의자 등으로 장애물 코스를 만들어 통과해보세요.', duration: '20-30분', participants: p1, materials: '쿠션, 의자, 상자' },
        { title: '공 던지고 받기', description: '점점 거리를 늘려가며 공을 던지고 받는 연습을 해요.', duration: '15-20분', participants: p1, materials: '부드러운 공' },
        { title: '춤추기', description: '좋아하는 음악에 맞춰 자유롭게 춤을 춰보세요.', duration: '15-20분', participants: p1fam, materials: '음악' },
      ],
    },
    school: {
      cognitive: [
        { title: '전략 보드게임', description: '체스, 장기, 오목 등 전략이 필요한 게임으로 사고력을 키워요.', duration: '30-45분', participants: pParentFriend, materials: '보드게임' },
        { title: '과학 실험', description: '간단한 과학 실험으로 호기심과 탐구력을 키워요.', duration: '30-45분', participants: p1, materials: '실험 재료' },
        { title: '독서와 토론', description: '책을 읽고 내용에 대해 토론하며 비판적 사고를 키워요.', duration: '30-45분', participants: p1, materials: '책' },
      ],
      emotional: [
        { title: '감정 일기 쓰기', description: '하루 동안 느낀 감정을 일기로 표현하고 이야기 나눠요.', duration: '15-20분', participants: p1, materials: '일기장, 펜' },
        { title: '스트레스 해소 활동', description: '그림 그리기, 음악 듣기 등 스트레스를 해소하는 방법을 찾아요.', duration: '20-30분', participants: p1, materials: '다양한 재료' },
        { title: '역할극', description: '어려운 상황을 역할극으로 연습하며 대처 방법을 배워요.', duration: '20-30분', participants: p1fam, materials: none },
      ],
      social: [
        { title: '팀 스포츠', description: '축구, 농구 등 팀 스포츠로 협동심과 리더십을 키워요.', duration: '45-60분', participants: pFriends, materials: '운동 용구' },
        { title: '협동 프로젝트', description: '함께 무언가를 만들거나 계획하며 협력하는 방법을 배워요.', duration: '1-2시간', participants: pFriendsFamily, materials: '프로젝트에 필요한 재료' },
        { title: '봉사활동', description: '가족이나 친구들과 함께 봉사활동을 하며 공감 능력을 키워요.', duration: '2-3시간', participants: pFriendsFamily, materials: '봉사활동 준비물' },
      ],
      physical: [
        { title: '스포츠 활동', description: '좋아하는 스포츠를 정기적으로 하며 체력을 키워요.', duration: '1시간', participants: pFriendsFamily, materials: '운동 용구' },
        { title: '자전거 타기', description: '자전거를 타며 균형감과 지구력을 키워요.', duration: '30-45분', participants: pParentFriend, materials: '자전거, 헬멧' },
        { title: '댄스나 무술', description: '댄스나 무술을 배우며 신체 조절 능력을 키워요.', duration: '45-60분', participants: pClass, materials: '운동복' },
      ],
    },
  };

  const recommendedActivities = [
    ...(activities[ageGroup as keyof typeof activities]?.[weakestDomain.key as keyof typeof activities.infant] || []).slice(0, 3),
    ...(activities[ageGroup as keyof typeof activities]?.[secondWeakest.key as keyof typeof activities.infant] || []).slice(0, 2),
  ];

  const devLabel = isEnglish ? 'Development' : '발달';

  return (
    <Card className="shadow-lg mb-6">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          {isEnglish ? 'Personalized Play Activity Recommendations' : '맞춤형 놀이 활동 추천'}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          {isEnglish
            ? `Activities to strengthen ${weakestDomain.domain} (${weakestDomain.score}pts) and ${secondWeakest.domain} (${secondWeakest.score}pts) development.`
            : `${weakestDomain.domain} 발달(${weakestDomain.score}점)과 ${secondWeakest.domain} 발달(${secondWeakest.score}점)을 강화할 수 있는 활동을 추천드립니다.`}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {recommendedActivities.map((activity, index) => (
            <Card key={index} className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-purple-700">{activity.title}</h3>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {index < 3 ? weakestDomain.domain : secondWeakest.domain} {devLabel}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{activity.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>{activity.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span>{activity.participants}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span>{activity.materials}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>{isEnglish ? '💡 Tip:' : '💡 활동 팁:'}</strong> {isEnglish
              ? 'Doing these activities consistently for 15-30 minutes daily is most effective. Adjust flexibly based on your child\'s interest and condition.'
              : '매일 15-30분씩 꾸준히 진행하면 효과적입니다. 아이의 흥미와 컨디션을 고려하여 유연하게 조정하세요.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayActivityRecommendations;
