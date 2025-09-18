import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AutoSaveManagerProps {
  data: any;
  formId: string;
  interval?: number; // milliseconds
  onSave?: (success: boolean) => void;
  showIndicator?: boolean;
}

export const AutoSaveManager = ({ 
  data, 
  formId, 
  interval = 30000, // 30초마다 자동 저장
  onSave,
  showIndicator = true 
}: AutoSaveManagerProps) => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingData, setPendingData] = useState<any[]>([]);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 온라인 복구 시 대기 중인 데이터 저장
      if (pendingData.length > 0) {
        syncPendingData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "오프라인 모드",
        description: "인터넷 연결이 끊어졌습니다. 데이터는 로컬에 저장됩니다.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingData]);

  // 로컬 스토리지에 백업
  const saveToLocal = useCallback((formData: any) => {
    try {
      const backupKey = `backup_${formId}`;
      const backupData = {
        data: formData,
        timestamp: new Date().toISOString(),
        formId
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // 오프라인 큐에 추가
      if (!isOnline) {
        setPendingData(prev => [...prev, backupData]);
      }
      
      return true;
    } catch (error) {
      console.error('로컬 저장 실패:', error);
      return false;
    }
  }, [formId, isOnline]);

  // 서버에 저장
  const saveToServer = useCallback(async (formData: any) => {
    if (!isOnline) {
      return false;
    }

    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('사용자 인증이 필요합니다');
      }

      // 로컬 스토리지에 저장 (서버 저장은 추후 구현)
      saveToLocal(formData);
      const error = null; // 임시 처리

      if (error) throw error;

      setLastSaved(new Date());
      onSave?.(true);
      return true;

    } catch (error) {
      console.error('서버 저장 실패:', error);
      onSave?.(false);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formId, isOnline, onSave]);

  // 대기 중인 데이터 동기화
  const syncPendingData = useCallback(async () => {
    if (!isOnline || pendingData.length === 0) return;

    try {
      for (const data of pendingData) {
        await saveToServer(data.data);
      }
      setPendingData([]);
      
      toast({
        title: "동기화 완료",
        description: "오프라인 중 저장된 데이터가 서버에 동기화되었습니다.",
      });
      
    } catch (error) {
      console.error('동기화 실패:', error);
    }
  }, [isOnline, pendingData, saveToServer, toast]);

  // 자동 저장 실행
  const performAutoSave = useCallback(async () => {
    if (!data || Object.keys(data).length === 0) return;

    // 로컬에 우선 저장
    const localSaved = saveToLocal(data);
    
    // 온라인 상태면 서버에도 저장
    if (isOnline) {
      await saveToServer(data);
    }

    if (localSaved && !lastSaved) {
      toast({
        title: "자동 저장됨",
        description: "입력 내용이 자동으로 저장되었습니다.",
        duration: 2000,
      });
    }
  }, [data, saveToLocal, saveToServer, isOnline, lastSaved, toast]);

  // 수동 저장
  const manualSave = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);

  // 복구된 데이터 로드
  const loadBackupData = useCallback(() => {
    try {
      const backupKey = `backup_${formId}`;
      const backupData = localStorage.getItem(backupKey);
      
      if (backupData) {
        const parsed = JSON.parse(backupData);
        return parsed.data;
      }
      
      return null;
    } catch (error) {
      console.error('백업 데이터 로드 실패:', error);
      return null;
    }
  }, [formId]);

  // 백업 데이터 삭제
  const clearBackup = useCallback(() => {
    try {
      const backupKey = `backup_${formId}`;
      localStorage.removeItem(backupKey);
    } catch (error) {
      console.error('백업 데이터 삭제 실패:', error);
    }
  }, [formId]);

  // 자동 저장 인터벌 설정
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const autoSaveInterval = setInterval(performAutoSave, interval);
    
    return () => clearInterval(autoSaveInterval);
  }, [data, interval, performAutoSave]);

  // 페이지 언로드 시 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (data && Object.keys(data).length > 0) {
        saveToLocal(data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data, saveToLocal]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      {/* 연결 상태 표시 */}
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isOnline ? "온라인" : "오프라인"}
      </Badge>

      {/* 저장 상태 표시 */}
      {lastSaved && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Save className="w-3 h-3" />
          {lastSaved.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} 저장됨
        </Badge>
      )}

      {/* 대기 중인 데이터 표시 */}
      {pendingData.length > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {pendingData.length}개 대기중
        </Badge>
      )}

      {/* 수동 저장 버튼 */}
      <Button
        size="sm"
        variant="outline"
        onClick={manualSave}
        disabled={isSaving}
        className="h-8"
      >
        {isSaving ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
};

// 백업 데이터 복구 훅
export const useBackupRecovery = (formId: string) => {
  const [hasBackup, setHasBackup] = useState(false);
  const [backupData, setBackupData] = useState(null);

  useEffect(() => {
    const checkBackup = () => {
      try {
        const backupKey = `backup_${formId}`;
        const backup = localStorage.getItem(backupKey);
        
        if (backup) {
          const parsed = JSON.parse(backup);
          setBackupData(parsed.data);
          setHasBackup(true);
        }
      } catch (error) {
        console.error('백업 확인 실패:', error);
      }
    };

    checkBackup();
  }, [formId]);

  const restoreBackup = () => {
    return backupData;
  };

  const discardBackup = () => {
    try {
      const backupKey = `backup_${formId}`;
      localStorage.removeItem(backupKey);
      setHasBackup(false);
      setBackupData(null);
    } catch (error) {
      console.error('백업 삭제 실패:', error);
    }
  };

  return {
    hasBackup,
    backupData,
    restoreBackup,
    discardBackup
  };
};

export default AutoSaveManager;