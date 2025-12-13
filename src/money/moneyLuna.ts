// src/money/moneyLuna.ts

import { LunaCycle, LunaPhase, PeriodRecord } from './types';

// --------------------------------------------------------
// 1. 날짜 헬퍼 함수
// --------------------------------------------------------

// 두 날짜 사이의 일수 차이 (절댓값 아님, d2 - d1)
const getDaysDiff = (d1: string, d2: string): number => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  // 시간을 0으로 맞춰 오차 제거
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// 날짜 더하기
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// --------------------------------------------------------
// 2. 평균 주기 재계산 로직 (AI 예측)
// --------------------------------------------------------
const recalculateAverages = (history: PeriodRecord[]) => {
  // 기본값
  let newAvgCycle = 28;
  let newAvgPeriod = 5;

  if (history.length >= 2) {
    // 날짜순 정렬 (최신순)
    const sorted = [...history].sort((a, b) => new Date(b).startDate.getTime() - new Date(a).startDate.getTime());
    
    // 최근 6개월치만 사용
    const recent = sorted.slice(0, 6);
    
    // 1) 평균 생리 기간 (Period Length)
    const totalPeriodDays = recent.reduce((sum, rec) => {
      const len = getDaysDiff(rec.startDate, rec.endDate) + 1; // 시작~끝 포함
      return sum + (len > 0 && len < 10 ? len : 5); // 노이즈 필터링
    }, 0);
    newAvgPeriod = Math.round(totalPeriodDays / recent.length);

    // 2) 평균 주기 (Cycle Length) - 시작일 간의 간격
    let totalCycleDays = 0;
    let gapCount = 0;
    
    for (let i = 0; i < recent.length - 1; i++) {
      const currentStart = recent[i].startDate;
      const prevStart = recent[i+1].startDate;
      const diff = getDaysDiff(prevStart, currentStart);
      
      // 20~45일 사이만 유효한 주기로 인정 (노이즈 제거)
      if (diff >= 20 && diff <= 45) {
        totalCycleDays += diff;
        gapCount++;
      }
    }

    if (gapCount > 0) {
      newAvgCycle = Math.round(totalCycleDays / gapCount);
    }
  }

  return { avgCycle: newAvgCycle, avgPeriod: newAvgPeriod };
};

// --------------------------------------------------------
// 3. 루나 사이클 상태 업데이트 (메인 함수)
// --------------------------------------------------------
export const updateLunaCycle = (currentCycle: LunaCycle): LunaCycle => {
  const history = currentCycle.history;
  
  // 기록이 없으면 초기 상태 반환
  if (!history || history.length === 0) {
    return {
      ...currentCycle,
      currentPhase: 'FOLLICULAR', // 기본은 황금기(여포기)
      nextPeriodDate: '',
      dDay: 0
    };
  }

  // 1. 평균값 재계산
  const { avgCycle, avgPeriod } = recalculateAverages(history);

  // 2. 현재 상태 계산
  // 가장 최근 기록(마지막 생리 시작일)
  const lastRecord = history.reduce((prev, curr) => {
    return new Date(prev.startDate) > new Date(curr.startDate) ? prev : curr;
  });
  const lastStart = lastRecord.startDate;
  const today = new Date().toISOString().split('T')[0];
  
  // 생리 시작일로부터 경과한 일수 (Day N)
  const dayIndex = getDaysDiff(lastStart, today);

  // 다음 예정일
  const nextStart = addDays(lastStart, avgCycle);
  const dDay = getDaysDiff(today, nextStart); // 남은 일수

  // 3. 페이즈 판정 로직 (의학적 기준 + 게임 밸런스)
  // Day 0 ~ : Menstrual (생리 중)
  // End of Period ~ : Follicular (여포기 - 황금기)
  // Cycle - 14 : Ovulation (배란기)
  // After Ovulation : Luteal (황체기)
  // Cycle - 7 : PMS (월경전 증후군)

  let phase: LunaPhase = 'LUTEAL'; // 기본값

  if (dayIndex < avgPeriod) {
    phase = 'MENSTRUAL';
  } else if (dayIndex < avgPeriod + 7) {
    phase = 'FOLLICULAR'; // 생리 끝난 후 일주일
  } else if (dayIndex >= avgCycle - 16 && dayIndex <= avgCycle - 12) {
    phase = 'OVULATION'; // 예정일 14일 전 부근
  } else if (dayIndex >= avgCycle - 7) {
    phase = 'PMS'; // 예정일 일주일 전부터
  } else {
    phase = 'LUTEAL'; // 그 외 기간
  }

  // 데이터 갱신하여 반환
  return {
    ...currentCycle,
    avgCycleLength: avgCycle,
    avgPeriodLength: avgPeriod,
    currentPhase: phase,
    nextPeriodDate: nextStart,
    dDay: dDay
  };
};

// --------------------------------------------------------
// 4. 게임 내 버프/디버프 정보 (UI용)
// --------------------------------------------------------
export const getLunaBuffInfo = (phase: LunaPhase) => {
  switch (phase) {
    case 'MENSTRUAL': // 월경기
      return { 
        title: "🩸 월경기 (Reset)", 
        desc: "방어력 저하. 무리하지 말고 휴식하세요.", 
        effect: "MP 회복량 ▼, 방어 비용 ▲", 
        color: "#ef4444" 
      };
    case 'FOLLICULAR': // 여포기 (황금기)
      return { 
        title: "✨ 여포기 (Golden)", 
        desc: "컨디션 최상! 무엇이든 할 수 있습니다.", 
        effect: "저축 효율 ▲, 채집 운 ▲", 
        color: "#10b981" 
      };
    case 'OVULATION': // 배란기
      return { 
        title: "🥚 배란기 (Energy)", 
        desc: "에너지가 넘치지만 충동 구매를 조심하세요.", 
        effect: "상점 아이템 매력도 ▲", 
        color: "#f59e0b" 
      };
    case 'PMS': // 월경전 증후군
      return { 
        title: "🔥 PMS (Warning)", 
        desc: "감정과 식욕이 폭발합니다. 지갑을 사수하세요!", 
        effect: "지출 몬스터 강화, 방어 실패율 ▲", 
        color: "#8b5cf6" 
      };
    case 'LUTEAL': // 황체기
    default:
      return { 
        title: "🍂 황체기 (Calm)", 
        desc: "차분하게 다음 주기를 준비하는 시기입니다.", 
        effect: "기본 상태", 
        color: "#64748b" 
      };
  }
};
