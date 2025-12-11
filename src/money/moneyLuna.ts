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

// 1. 주기 계산 로직
export const calculateLunaPhase = (cycle: LunaCycle): LunaPhaseResult => {
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

  // 단계 판별
  if (dayInCycle <= cycle.periodLength) {
    // 월경 기 (Menstrual Phase) -> 붉은 경고
    phaseName = "🩸 Reset (Period)";
    isPeriod = true;
    intensity = 80;
  } else if (dayInCycle <= 14) {
    // 난포기 (Follicular) -> 안정/회복
    phaseName = "🌱 Energy (Follicular)";
    isPeriod = false;
    intensity = 10;
  } else if (dayInCycle <= 17) {
    // 배란기 (Ovulation) -> 충동/유혹
    phaseName = "🔥 Spark (Ovulation)";
    isPeriod = false;
    intensity = 40;
  } else {
    // 황체기 (Luteal/PMS) -> 우울/그림자
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

// 2. 별칭 Export (다른 파일 호환성용)
export const getLunaMode = calculateLunaPhase;

// 3. [추가됨] 테마 색상 및 메시지 반환 함수
// MoneyRoomPage에서 배경색 등을 결정할 때 사용합니다.
export const getLunaTheme = (phase: LunaPhaseResult) => {
  if (phase.isPeriod) {
    return { 
      bg: '#1a0505', // 아주 어두운 붉은색
      accent: '#ef4444', 
      message: '⚠️ 생체 시스템 경고: 방어력 저하 구간' 
    };
  }
  if (phase.phaseName.includes('PMS')) {
    return { 
      bg: '#0f172a', // 어두운 남색 (우울)
      accent: '#64748b', 
      message: '🌑 심리적 시야 감소: 충동 억제력 약화' 
    };
  }
  if (phase.phaseName.includes('Ovulation')) {
    return { 
      bg: '#270a1f', // 어두운 보라색 (유혹)
      accent: '#d946ef', 
      message: '🔥 호르몬 과부하: 소비 욕구 증가 주의' 
    };
  }
  
  // 기본 (난포기 등)
  return { 
    bg: '#0c0a09', // 기본 검정
    accent: '#22c55e', // 초록
    message: '🌱 바이오 리듬 안정: 계획 실행 최적기' 
  };
};
