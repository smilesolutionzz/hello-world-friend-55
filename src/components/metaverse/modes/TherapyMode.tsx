import { getTherapistProfile } from '@/utils/TherapistProfiles';
import type { TherapistType } from '@/types/therapist';
import MetaverseVoiceCounseling from '../MetaverseVoiceCounseling';

interface TherapyModeProps {
  therapistType: TherapistType;
  userConcern: string;
}

export const TherapyMode = ({ therapistType, userConcern }: TherapyModeProps) => {
  return (
    <MetaverseVoiceCounseling
      mode="therapy"
      therapistType={therapistType}
      therapyUserConcern={userConcern}
    />
  );
};
