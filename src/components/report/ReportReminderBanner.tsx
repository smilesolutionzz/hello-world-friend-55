import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Calendar, X } from 'lucide-react';
import { useReportReminder } from '@/hooks/useReportReminder';
import { useLanguage } from '@/i18n/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportReminderBannerProps {
  testType?: string;
  onSetReminder?: () => void;
}

const ReportReminderBanner: React.FC<ReportReminderBannerProps> = ({ testType, onSetReminder }) => {
  const { createReminder, getDueReminders, dismissReminder } = useReportReminder();
  const { isEnglish } = useLanguage();
  const t = (ko: string, en: string) => isEnglish ? en : ko;
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const dueReminders = getDueReminders();

  const handleSetReminder = async (months: number) => {
    setIsSettingReminder(true);
    const success = await createReminder({
      testType,
      monthsLater: months,
      message: t(
        `${months}개월 후 재검사로 변화를 추적하세요.`,
        `Track your progress with a follow-up test in ${months} months.`
      ),
    });
    setIsSettingReminder(false);
    if (success) {
      setReminderSet(true);
      onSetReminder?.();
    }
  };

  return (
    <div className="space-y-3">
      {/* Due reminders */}
      <AnimatePresence>
        {dueReminders.map(reminder => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
          >
            <Bell className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                {t('재검사 시기입니다!', 'Time for a follow-up test!')}
              </p>
              <p className="text-xs text-amber-600 mt-1">{reminder.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissReminder(reminder.id)}
              className="h-7 w-7 p-0 text-amber-400 hover:text-amber-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Set reminder CTA */}
      {!reminderSet && (
        <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-xl">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                {t('다음 검사 알림을 설정하세요', 'Set a follow-up reminder')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('정기적인 재검사로 변화를 추적하면 더 정확한 분석이 가능합니다.',
                   'Regular follow-up tests enable more accurate longitudinal analysis.')}
              </p>
              <div className="flex gap-2 mt-3">
                {[3, 6].map(months => (
                  <Button
                    key={months}
                    onClick={() => handleSetReminder(months)}
                    disabled={isSettingReminder}
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-blue-200 hover:bg-blue-100 text-blue-700"
                  >
                    <Bell className="w-3 h-3 mr-1" />
                    {months}{t('개월 후', 'mo later')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {reminderSet && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2"
        >
          <BellOff className="w-4 h-4 text-emerald-600" />
          <p className="text-xs text-emerald-700 font-medium">
            {t('알림이 설정되었습니다. 때가 되면 알려드릴게요!', 'Reminder set! We\'ll notify you when it\'s time.')}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ReportReminderBanner;
