import MetaverseVoiceCounseling from '@/components/metaverse/MetaverseVoiceCounseling';
import type { RolePlayScenario } from '@/utils/RolePlayScenarios';

interface RolePlayModeProps {
  scenario: RolePlayScenario;
}

export const RolePlayMode = ({ scenario }: RolePlayModeProps) => {
  // MetaverseVoiceCounseling이 자체 입장 화면을 가지고 있으므로
  // 바로 렌더링하고 mode='roleplay'와 시나리오를 전달
  return (
    <MetaverseVoiceCounseling 
      mode="roleplay"
      roleplayScenario={scenario}
    />
  );
};
