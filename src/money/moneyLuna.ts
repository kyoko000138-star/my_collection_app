// src/money/moneyLuna.ts

export interface LunaCycle {
  startDate: string;   // 마지막 생리 시작일 (YYYY-MM-DD)
  periodLength: number; // 생리 지속 기간 (일)
  cycleLength: number;  // 주기 (일, 보통 28)
}

export interface LunaPhaseResult {
  dayInCycle: number;
  phaseName: string; // 표시될 텍스트 (예: "Period", "Follicular")
  isPeriod: boolean; // 피격(지출) 시 경고 여부
  intensity: number; // 0~100 (환경 난이도)
}

// 로직 함수 (내부 로직은 동일)
const calculateLunaPhase = (cycle: LunaCycle): LunaPhaseResult => {
  if (!cycle.startDate) {
    return { dayInCycle: 0, phaseName: "Unknown", isPeriod: false, intensity: 0 };
  }

  const start = new Date(cycle.startDate);
  const today = new Date();
  
  // 날짜 차이 계산 (밀리초 -> 일)
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  // 현재 주기 내의 일차 (1일 ~ 28일)
  const dayInCycle = (diffDays % cycle.cycleLength) + 1;

  let phaseName = "";
  let isPeriod = false;
  let intensity = 0;

  // 단계 판별 (단순화된 모델)
  if (dayInCycle <= cycle.periodLength) {
    // 월경 기 (Menstrual Phase) -> 가장 힘든 시기
    phaseName = "🩸 Reset (Period)";
    isPeriod = true;
    intensity = 80;
  } else if (dayInCycle <= 14) {
    // 난포기 (Follicular) -> 활력
    phaseName = "🌱 Energy (Follicular)";
    isPeriod = false;
    intensity = 10;
  } else if (dayInCycle <= 17) {
    // 배란기 (Ovulation) -> 충동 구매 주의
    phaseName = "🔥 Spark (Ovulation)";
    isPeriod = false;
    intensity = 40;
  } else {
    // 황체기 (Luteal/PMS) -> 우울, 방어력 저하
    phaseName = "🌑 Shadow (PMS)";
    isPeriod = false;
    intensity = 60;
  }

  return {
    dayInCycle,
    phaseName,
    isPeriod,
    intensity
  };
};

// 핵심: 기존 로직을 'getLunaMode'라는 이름으로 내보냅니다.
export const getLunaMode = calculateLunaPhase;
