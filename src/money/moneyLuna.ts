// src/money/moneyLuna.ts
import { LunaMode, CycleSettings } from './types';

export const calcCycleStatus = (today: Date, settings: CycleSettings | undefined) => {
  // 🛡️ [Fix] settings가 없거나 lastPeriodStart가 없으면 기본값 반환
  if (!settings || !settings.lastPeriodStart) {
    return { mode: 'normal' as LunaMode, dayInCycle: 0, message: '설정에서 주기 정보를 입력해주세요.' };
  }

  const lastStart = new Date(settings.lastPeriodStart);
  const diffTime = today.getTime() - lastStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // (이하 로직 동일)
  const currentDayInCycle = diffDays >= 0 ? diffDays % settings.cycleLength : 0;

  const restDuration = 5; 
  const pmsDuration = 10;
  const pmsStartDay = settings.cycleLength - pmsDuration;

  let mode: LunaMode = 'normal';
  let message = "평온한 일상입니다.";

  if (currentDayInCycle < restDuration) {
    mode = 'rest';
    message = "☕ 휴식 주간입니다. 무리하지 마세요.";
  } else if (currentDayInCycle >= pmsStartDay) {
    mode = 'pms';
    message = "🚨 붉은 달 경보! 호르몬 변화에 주의하세요.";
  }

  return { mode, dayInCycle: currentDayInCycle, message };
};
