// src/money/moneyLuna.ts
import { LunaMode, CycleSettings } from './types';

export const calcCycleStatus = (today: Date, settings: CycleSettings) => {
  // 데이터가 없으면 기본값 반환
  if (!settings.lastPeriodStart) {
    return { mode: 'normal' as LunaMode, dayInCycle: 0, message: '주기 설정이 필요합니다.' };
  }

  const lastStart = new Date(settings.lastPeriodStart);
  const diffTime = today.getTime() - lastStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 주기 내 현재 일차 계산 (예: 28일 주기 중 15일차)
  // 주기가 지났으면 다시 0일차부터 시작 (나머지 연산)
  const currentDayInCycle = diffDays >= 0 ? diffDays % settings.cycleLength : 0;

  // [v3.0 로직 적용]
  // 1. REST: 시작일 포함 5일간 (0, 1, 2, 3, 4일차)
  // 2. PMS: 다음 예정일 10일 전 ~ 예정일
  
  const restDuration = 5; 
  const pmsDuration = 10;
  const pmsStartDay = settings.cycleLength - pmsDuration;

  let mode: LunaMode = 'normal';
  let message = "평온한 일상입니다.";

  // 우선순위: REST가 가장 높음 (생리 시작하면 무조건 휴식)
  if (currentDayInCycle < restDuration) {
    mode = 'rest';
    message = "☕ 휴식 주간입니다. 무리하지 마세요.";
  } else if (currentDayInCycle >= pmsStartDay) {
    mode = 'pms';
    message = "🚨 붉은 달 경보! 호르몬 변화에 주의하세요.";
  }

  return { mode, dayInCycle: currentDayInCycle, message };
};
