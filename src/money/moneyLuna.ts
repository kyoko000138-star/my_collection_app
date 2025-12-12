// src/money/moneyLuna.ts

import { LunaCycle } from './types';

export interface LunaPhaseResult {
  dayInCycle: number;
  phaseName: string;
  isPeriod: boolean;
  intensity: number;
  daysUntilNext?: number; // 다음 예정일까지 남은 일수
}

// --------------------------------------------------------
// 1. 평균 주기 계산기 (AI 예측 로직)
// --------------------------------------------------------
export const recalculateCycle = (history: string[]): number => {
  // 데이터가 2개 미만이면 계산 불가 -> 기본값 28일 반환
  if (!history || history.length < 2) return 28;

  // 날짜순 정렬 (오름차순)
  const sortedDates = [...history].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  // 최근 5개만 사용 (너무 옛날 데이터는 배제)
  const recentDates = sortedDates.slice(-5);

  let totalDays = 0;
  let gapCount = 0;

  for (let i = 1; i < recentDates.length; i++) {
    const prev = new Date(recentDates[i - 1]);
    const curr = new Date(recentDates[i]);
    const diffTime = Math.abs(curr.getTime() - prev.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 비정상적인 데이터(10일 미만, 60일 초과)는 제외 (노이즈 필터링)
    if (diffDays > 10 && diffDays < 60) {
      totalDays += diffDays;
      gapCount++;
    }
  }

  if (gapCount === 0) return 28;
  
  return Math.round(totalDays / gapCount);
};

// --------------------------------------------------------
// 2. 현재 상태 및 예측 계산
// --------------------------------------------------------
export const calculateLunaPhase = (cycle: LunaCycle): LunaPhaseResult => {
  if (!cycle.startDate) {
    return { dayInCycle: 0, phaseName: "Unknown", isPeriod: false, intensity: 0 };
  }

  const start = new Date(cycle.startDate);
  const today = new Date();
  
  // 오늘 날짜 보정 (시간 제거)
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 현재 주기 일차 (1일 ~ )
  // 만약 diffDays가 음수라면(미래 날짜 입력 등), 1일차로 처리
  const dayInCycle = diffDays >= 0 ? (diffDays % cycle.cycleLength) + 1 : 1;

  // 다음 예정일 계산
  const nextDate = new Date(start);
  nextDate.setDate(start.getDate() + cycle.cycleLength);
  const timeUntilNext = nextDate.getTime() - today.getTime();
  const daysUntilNext = Math.ceil(timeUntilNext / (1000 * 60 * 60 * 24));

  let phaseName = "";
  let isPeriod = false;
  let intensity = 0;

  if (dayInCycle <= cycle.periodLength) {
    phaseName = "🩸 Reset (Period)";
    isPeriod = true;
    intensity = 80;
  } else if (dayInCycle <= 14) {
    phaseName = "🌱 Energy (Follicular)";
    isPeriod = false;
    intensity = 10;
  } else if (dayInCycle <= 17) {
    phaseName = "🔥 Spark (Ovulation)";
    isPeriod = false;
    intensity = 40;
  } else {
    // 황체기(PMS) 구간: 예정일이 가까워질수록 강도 높임
    phaseName = "🌑 Shadow (PMS)";
    isPeriod = false;
    // 예정일 3일 전부터는 intensity 70 (경고)
    intensity = daysUntilNext <= 3 ? 70 : 50; 
  }

  return {
    dayInCycle,
    phaseName,
    isPeriod,
    intensity,
    daysUntilNext
  };
};

// --------------------------------------------------------
// 3. 게임 내 알림 메시지 생성기 (Alert System)
// --------------------------------------------------------
export const getLunaAlertMessage = (result: LunaPhaseResult): string | null => {
  if (result.isPeriod) {
    return "🩸 [붉은 달] 현재 방어력이 저하된 상태입니다. 무리한 지출을 피하세요.";
  }
  
  if (result.daysUntilNext !== undefined) {
    if (result.daysUntilNext <= 3 && result.daysUntilNext > 0) {
      return `🌑 [경고] 붉은 달이 ${result.daysUntilNext}일 뒤에 떠오릅니다. 비상금을 확보하세요.`;
    }
    if (result.daysUntilNext === 0) {
      return `🌑 [임박] 오늘 밤, 붉은 달이 시작될 수 있습니다.`;
    }
  }
  
  if (result.phaseName.includes("Ovulation")) {
    return "🔥 [주의] 충동 구매 욕구가 강해지는 시기입니다.";
  }

  return null;
};

// 별칭 Export
export const getLunaMode = calculateLunaPhase;
