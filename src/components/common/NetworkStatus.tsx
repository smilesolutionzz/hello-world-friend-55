import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const NetworkStatus = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (isOnline && wasOffline) {
      toast({
        title: "인터넷 연결 복구됨",
        description: "다시 온라인 상태입니다.",
      });
    } else if (!isOnline) {
      toast({
        title: "인터넷 연결 끊김",
        description: "인터넷 연결을 확인해주세요.",
        variant: "destructive"
      });
    }
  }, [isOnline, wasOffline, toast]);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert variant="destructive" className="rounded-none border-0">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          인터넷 연결이 불안정합니다. 일부 기능이 제한될 수 있습니다.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NetworkStatus;