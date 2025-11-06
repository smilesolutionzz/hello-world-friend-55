import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingNotification {
  id: string;
  type: 'new_booking' | 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder';
  bookingId: string;
  message: string;
  createdAt: string;
}

export const useBookingNotifications = () => {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get expert ID if user is an expert
      const { data: expertProfile } = await supabase
        .from('experts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Subscribe to bookings for this user or expert
      const channel = supabase
        .channel('booking-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'consultation_bookings',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New booking for user:', payload);
            const notification: BookingNotification = {
              id: payload.new.id,
              type: 'new_booking',
              bookingId: payload.new.id,
              message: '새로운 예약이 생성되었습니다',
              createdAt: payload.new.created_at
            };
            
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast({
              title: '새 예약',
              description: notification.message
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'consultation_bookings',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Booking updated:', payload);
            
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            
            if (oldStatus !== newStatus) {
              let message = '';
              let type: BookingNotification['type'] = 'booking_confirmed';
              
              if (newStatus === 'confirmed') {
                message = '예약이 확정되었습니다';
                type = 'booking_confirmed';
              } else if (newStatus === 'cancelled') {
                message = '예약이 취소되었습니다';
                type = 'booking_cancelled';
              }
              
              if (message) {
                const notification: BookingNotification = {
                  id: `${payload.new.id}-${Date.now()}`,
                  type,
                  bookingId: payload.new.id,
                  message,
                  createdAt: new Date().toISOString()
                };
                
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                toast({
                  title: '예약 상태 변경',
                  description: message
                });
              }
            }
          }
        );

      // If user is an expert, also subscribe to their bookings
      if (expertProfile) {
        channel.on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'consultation_bookings',
            filter: `expert_id=eq.${expertProfile.id}`
          },
          (payload) => {
            console.log('New booking for expert:', payload);
            const notification: BookingNotification = {
              id: payload.new.id,
              type: 'new_booking',
              bookingId: payload.new.id,
              message: '새로운 상담 예약을 받았습니다',
              createdAt: payload.new.created_at
            };
            
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast({
              title: '새 예약',
              description: notification.message,
              duration: 5000
            });
          }
        );
      }

      channel.subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [toast]);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications
  };
};
