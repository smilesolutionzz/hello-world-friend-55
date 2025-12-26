// 아동 운동발달 자가체크 검사 - 창작형 문항
// 이동운동, 조작운동, 균형감각 등 대근육/소근육 발달 평가

export interface MotorDevelopmentQuestion {
  id: string;
  category: 'locomotor' | 'object_control' | 'balance' | 'coordination' | 'fine_motor';
  text: string;
  description?: string;
  ageRange: {
    min: number; // months
    max: number;
  };
  options: {
    value: number;
    label: string;
    description: string;
  }[];
}

export const motorDevelopmentQuestions: MotorDevelopmentQuestion[] = [
  // === 이동운동 (Locomotor Skills) ===
  {
    id: 'loco_1',
    category: 'locomotor',
    text: '아이가 일정한 리듬으로 뛰어다닐 수 있나요?',
    description: '두 발이 동시에 땅에서 떨어지며 앞으로 나아가는 동작',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '리듬감 있게 자연스럽게 뜁니다' },
      { value: 2, label: '대체로 가능', description: '가끔 리듬이 깨지지만 가능합니다' },
      { value: 1, label: '어려워함', description: '자주 넘어지거나 리듬을 유지하기 어렵습니다' },
    ]
  },
  {
    id: 'loco_2',
    category: 'locomotor',
    text: '한 발로 깡충깡충 뛰기가 가능한가요?',
    description: '한쪽 발로 연속해서 3회 이상 뛰는 동작',
    ageRange: { min: 48, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '양쪽 발 모두 자유롭게 뜁니다' },
      { value: 2, label: '대체로 가능', description: '한쪽 발은 잘 되지만 다른 쪽은 어렵습니다' },
      { value: 1, label: '어려워함', description: '한 발로 뛰기를 어려워합니다' },
    ]
  },
  {
    id: 'loco_3',
    category: 'locomotor',
    text: '스킵(발을 번갈아 가며 깡충깡충 뛰기)을 할 수 있나요?',
    description: '한 발씩 번갈아 가며 리듬감 있게 뛰는 동작',
    ageRange: { min: 60, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '자연스럽고 리듬감 있게 스킵합니다' },
      { value: 2, label: '대체로 가능', description: '시도하지만 리듬이 불규칙합니다' },
      { value: 1, label: '어려워함', description: '스킵 동작을 이해하거나 수행하기 어렵습니다' },
    ]
  },
  {
    id: 'loco_4',
    category: 'locomotor',
    text: '옆으로 미끄러지듯 이동(슬라이드)할 수 있나요?',
    description: '양발을 번갈아 가며 옆으로 이동하는 동작',
    ageRange: { min: 48, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '부드럽게 옆으로 이동합니다' },
      { value: 2, label: '대체로 가능', description: '동작이 다소 어색하지만 가능합니다' },
      { value: 1, label: '어려워함', description: '옆으로 이동하는 것을 어려워합니다' },
    ]
  },
  {
    id: 'loco_5',
    category: 'locomotor',
    text: '제자리에서 멀리뛰기를 할 수 있나요?',
    description: '두 발을 모으고 앞으로 힘차게 뛰는 동작',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '팔을 이용해 멀리 뜁니다' },
      { value: 2, label: '대체로 가능', description: '뛸 수 있지만 거리가 짧습니다' },
      { value: 1, label: '어려워함', description: '제자리뛰기를 어려워합니다' },
    ]
  },
  {
    id: 'loco_6',
    category: 'locomotor',
    text: '갤럽(말 뛰듯이 앞으로 나아가기)을 할 수 있나요?',
    description: '한 발을 앞으로 내딛고 뒷발이 따라오는 동작',
    ageRange: { min: 48, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '리듬감 있게 갤럽합니다' },
      { value: 2, label: '대체로 가능', description: '시도하지만 리듬이 불안정합니다' },
      { value: 1, label: '어려워함', description: '갤럽 동작을 이해하기 어렵습니다' },
    ]
  },

  // === 물체조작 운동 (Object Control Skills) ===
  {
    id: 'obj_1',
    category: 'object_control',
    text: '제자리에서 공을 바닥에 튀기며 드리블할 수 있나요?',
    description: '공을 손으로 쳐서 연속으로 바닥에 튀기는 동작',
    ageRange: { min: 48, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '연속 5회 이상 드리블합니다' },
      { value: 2, label: '대체로 가능', description: '2-4회 정도 드리블합니다' },
      { value: 1, label: '어려워함', description: '공을 연속으로 튀기기 어렵습니다' },
    ]
  },
  {
    id: 'obj_2',
    category: 'object_control',
    text: '두 손으로 날아오는 공을 잡을 수 있나요?',
    description: '가볍게 던져주는 공을 두 손으로 받는 동작',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '대부분의 공을 안정적으로 잡습니다' },
      { value: 2, label: '대체로 가능', description: '절반 정도 성공합니다' },
      { value: 1, label: '어려워함', description: '공을 잡기 어려워합니다' },
    ]
  },
  {
    id: 'obj_3',
    category: 'object_control',
    text: '한 손으로 위에서 아래로 공을 던질 수 있나요?',
    description: '오버핸드 스로우로 목표물 방향으로 던지는 동작',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '정확하고 힘있게 던집니다' },
      { value: 2, label: '대체로 가능', description: '던지지만 방향이 불안정합니다' },
      { value: 1, label: '어려워함', description: '한 손으로 던지기 어렵습니다' },
    ]
  },
  {
    id: 'obj_4',
    category: 'object_control',
    text: '발로 정지된 공을 차서 목표로 보낼 수 있나요?',
    description: '바닥에 놓인 공을 발로 차는 동작',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '정확하게 목표를 향해 찹니다' },
      { value: 2, label: '대체로 가능', description: '차지만 방향 조절이 어렵습니다' },
      { value: 1, label: '어려워함', description: '공을 차기 어려워합니다' },
    ]
  },
  {
    id: 'obj_5',
    category: 'object_control',
    text: '배트나 막대기로 던져진 공을 칠 수 있나요?',
    description: '날아오는 공을 도구로 타격하는 동작',
    ageRange: { min: 60, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '타이밍 맞춰 정확히 칩니다' },
      { value: 2, label: '대체로 가능', description: '가끔 맞추지만 일관성이 부족합니다' },
      { value: 1, label: '어려워함', description: '공을 치기 어려워합니다' },
    ]
  },
  {
    id: 'obj_6',
    category: 'object_control',
    text: '공을 아래에서 위로 던져 굴릴 수 있나요?',
    description: '언더핸드 스로우로 공을 앞으로 보내는 동작',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '목표를 향해 정확히 굴립니다' },
      { value: 2, label: '대체로 가능', description: '굴리지만 방향이 어긋납니다' },
      { value: 1, label: '어려워함', description: '공 굴리기를 어려워합니다' },
    ]
  },

  // === 균형 운동 (Balance Skills) ===
  {
    id: 'bal_1',
    category: 'balance',
    text: '한 발로 5초 이상 균형을 잡고 서 있을 수 있나요?',
    description: '눈을 뜬 상태에서 한 발로 서기',
    ageRange: { min: 48, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '10초 이상 안정적으로 섭니다' },
      { value: 2, label: '대체로 가능', description: '5-10초 정도 버팁니다' },
      { value: 1, label: '어려워함', description: '5초 미만으로 쓰러집니다' },
    ]
  },
  {
    id: 'bal_2',
    category: 'balance',
    text: '일직선 위를 발을 번갈아 가며 걸을 수 있나요?',
    description: '바닥에 그려진 선을 따라 걷기',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '선을 벗어나지 않고 걷습니다' },
      { value: 2, label: '대체로 가능', description: '가끔 선을 벗어납니다' },
      { value: 1, label: '어려워함', description: '선을 따라 걷기 어렵습니다' },
    ]
  },
  {
    id: 'bal_3',
    category: 'balance',
    text: '뒤로 걷기가 자연스럽게 가능한가요?',
    description: '뒤를 보지 않고 뒤로 걸어가기',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '안정적으로 뒤로 걷습니다' },
      { value: 2, label: '대체로 가능', description: '천천히 뒤로 걸을 수 있습니다' },
      { value: 1, label: '어려워함', description: '뒤로 걷기를 어려워합니다' },
    ]
  },
  {
    id: 'bal_4',
    category: 'balance',
    text: '낮은 평균대나 줄 위를 걸을 수 있나요?',
    description: '폭 10cm 정도의 평균대 위 걷기',
    ageRange: { min: 48, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '떨어지지 않고 끝까지 걷습니다' },
      { value: 2, label: '대체로 가능', description: '중간에 한두 번 떨어집니다' },
      { value: 1, label: '어려워함', description: '평균대 위 걷기를 무서워하거나 어려워합니다' },
    ]
  },

  // === 협응 운동 (Coordination Skills) ===
  {
    id: 'coord_1',
    category: 'coordination',
    text: '양손과 양발을 번갈아 사용하여 기어오르기가 가능한가요?',
    description: '정글짐이나 사다리 오르기',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '손발을 교대로 사용하여 안정적으로 오릅니다' },
      { value: 2, label: '대체로 가능', description: '천천히 오를 수 있습니다' },
      { value: 1, label: '어려워함', description: '기어오르기를 어려워합니다' },
    ]
  },
  {
    id: 'coord_2',
    category: 'coordination',
    text: '줄넘기를 연속으로 5번 이상 넘을 수 있나요?',
    description: '줄을 돌리며 뛰어넘기',
    ageRange: { min: 60, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '10회 이상 연속으로 넘습니다' },
      { value: 2, label: '대체로 가능', description: '5-10회 정도 넘습니다' },
      { value: 1, label: '어려워함', description: '5회 미만으로 걸립니다' },
    ]
  },
  {
    id: 'coord_3',
    category: 'coordination',
    text: '음악에 맞춰 몸을 움직이거나 춤을 출 수 있나요?',
    description: '리듬에 맞춰 신체 움직이기',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '리듬에 맞춰 자연스럽게 춤춥니다' },
      { value: 2, label: '대체로 가능', description: '음악에 반응하지만 리듬이 맞지 않을 때가 있습니다' },
      { value: 1, label: '어려워함', description: '음악에 맞춰 움직이기 어려워합니다' },
    ]
  },
  {
    id: 'coord_4',
    category: 'coordination',
    text: '공중에서 팔과 다리를 동시에 움직일 수 있나요?',
    description: '점프하면서 팔 벌리기 등 복합 동작',
    ageRange: { min: 48, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '점프와 팔 동작이 조화롭습니다' },
      { value: 2, label: '대체로 가능', description: '시도하지만 조화가 부족합니다' },
      { value: 1, label: '어려워함', description: '복합 동작을 어려워합니다' },
    ]
  },
  {
    id: 'coord_5',
    category: 'coordination',
    text: '공을 튕기면서 걸을 수 있나요?',
    description: '이동하면서 드리블하기',
    ageRange: { min: 60, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '걸으면서 안정적으로 드리블합니다' },
      { value: 2, label: '대체로 가능', description: '걸으면 드리블이 불안정해집니다' },
      { value: 1, label: '어려워함', description: '이동 드리블을 어려워합니다' },
    ]
  },

  // === 소근육 발달 (Fine Motor Skills) ===
  {
    id: 'fine_1',
    category: 'fine_motor',
    text: '연필이나 색연필을 올바르게 쥐고 글씨나 그림을 그릴 수 있나요?',
    description: '엄지, 검지, 중지를 이용한 세 손가락 잡기',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '정확한 그립으로 세밀하게 그립니다' },
      { value: 2, label: '대체로 가능', description: '그립이 불안정하지만 그릴 수 있습니다' },
      { value: 1, label: '어려워함', description: '연필 잡기가 서툽니다' },
    ]
  },
  {
    id: 'fine_2',
    category: 'fine_motor',
    text: '가위로 직선이나 곡선을 따라 자를 수 있나요?',
    description: '종이를 선을 따라 가위질하기',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '선을 따라 정확하게 자릅니다' },
      { value: 2, label: '대체로 가능', description: '자를 수 있지만 선에서 벗어납니다' },
      { value: 1, label: '어려워함', description: '가위질을 어려워합니다' },
    ]
  },
  {
    id: 'fine_3',
    category: 'fine_motor',
    text: '단추를 끼우거나 지퍼를 올릴 수 있나요?',
    description: '옷 입기와 관련된 소근육 활동',
    ageRange: { min: 36, max: 120 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '혼자서 단추와 지퍼를 다룹니다' },
      { value: 2, label: '대체로 가능', description: '시간이 걸리지만 할 수 있습니다' },
      { value: 1, label: '어려워함', description: '도움이 필요합니다' },
    ]
  },
  {
    id: 'fine_4',
    category: 'fine_motor',
    text: '작은 블록이나 레고를 조립할 수 있나요?',
    description: '작은 부품을 끼우고 조립하는 활동',
    ageRange: { min: 36, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '정교하게 블록을 조립합니다' },
      { value: 2, label: '대체로 가능', description: '간단한 조립은 가능합니다' },
      { value: 1, label: '어려워함', description: '작은 블록 조립을 어려워합니다' },
    ]
  },
  {
    id: 'fine_5',
    category: 'fine_motor',
    text: '구슬 꿰기나 실 끼우기를 할 수 있나요?',
    description: '작은 구멍에 실이나 끈을 통과시키기',
    ageRange: { min: 36, max: 120 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '정확하게 구슬을 꿸 수 있습니다' },
      { value: 2, label: '대체로 가능', description: '시간이 걸리지만 가능합니다' },
      { value: 1, label: '어려워함', description: '구슬 꿰기를 어려워합니다' },
    ]
  },
  {
    id: 'fine_6',
    category: 'fine_motor',
    text: '젓가락이나 포크를 사용해서 음식을 집을 수 있나요?',
    description: '식사 도구를 사용한 음식 집기',
    ageRange: { min: 36, max: 120 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '도구를 자연스럽게 사용합니다' },
      { value: 2, label: '대체로 가능', description: '사용하지만 음식을 흘리기도 합니다' },
      { value: 1, label: '어려워함', description: '도구 사용이 서툽니다' },
    ]
  },
  {
    id: 'fine_7',
    category: 'fine_motor',
    text: '종이접기(비행기, 배 등)를 할 수 있나요?',
    description: '종이를 접어 간단한 형태 만들기',
    ageRange: { min: 48, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '여러 가지 종이접기를 합니다' },
      { value: 2, label: '대체로 가능', description: '간단한 것은 접을 수 있습니다' },
      { value: 1, label: '어려워함', description: '종이접기를 어려워합니다' },
    ]
  },
  {
    id: 'fine_8',
    category: 'fine_motor',
    text: '신발 끈을 묶을 수 있나요?',
    description: '끈을 교차하여 매듭짓기',
    ageRange: { min: 60, max: 144 },
    options: [
      { value: 3, label: '능숙하게 잘함', description: '혼자서 끈을 잘 묶습니다' },
      { value: 2, label: '대체로 가능', description: '시간이 걸리지만 묶을 수 있습니다' },
      { value: 1, label: '어려워함', description: '끈 묶기가 어렵습니다' },
    ]
  },
];

export const categoryInfo = {
  locomotor: {
    name: '이동운동',
    description: '걷기, 뛰기, 점프 등 신체를 이동시키는 능력',
    icon: '🏃',
  },
  object_control: {
    name: '물체조작',
    description: '공 던지기, 받기, 차기 등 물체를 다루는 능력',
    icon: '⚽',
  },
  balance: {
    name: '균형감각',
    description: '한 발 서기, 평균대 걷기 등 균형을 유지하는 능력',
    icon: '🧘',
  },
  coordination: {
    name: '협응력',
    description: '여러 신체 부위를 조화롭게 움직이는 능력',
    icon: '🤸',
  },
  fine_motor: {
    name: '소근육',
    description: '손과 손가락의 정교한 움직임 능력',
    icon: '✋',
  },
};
