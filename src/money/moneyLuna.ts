// src/money/moneyLuna.ts
import { LunaMode, CycleSettings } from './types';

export const calcCycleStatus = (today: Date, settings: CycleSettings) => {
  // 데이터 없으면 기본값
  if (!settings.lastPeriodStart) return { mode: 'normal' as LunaMode, dayInCycle: 0 };

  const lastStart = new Date(settings.lastPeriodStart);
  const diffTime = today.getTime() - lastStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 주기 내 현재 일차 (예: 15일차)
  const currentDayInCycle = diffDays >= 0 ? diffDays % settings.cycleLength : 0;

  // [v3.0 로직] 
  // 1. REST: 시작일 포함 5일간 (0,1,2,3,4)
  // 2. PMS: 예정일 10일 전 ~ 예정일
  
  const restDuration = 5;
  const pmsDuration = 10;
  const pmsStartDay = settings.cycleLength - pmsDuration;

  let mode: LunaMode = 'normal';
  let message = "평온한 일상입니다.";

  if (currentDayInCycle < restDuration) {
    mode = 'rest';
    message = "휴식 기간입니다. MP 회복량이 증가합니다.";
  } else if (currentDayInCycle >= pmsStartDay) {
    mode = 'pms';
    message = "경보! 붉은 달 기간입니다. 포션 사용이 가능합니다.";
  }

  return { mode, dayInCycle: currentDayInCycle, message };
};
