// src/money/moneyGameLogic.ts
import { UserState, Transaction } from './types';
import { GAME_CONSTANTS } from './constants';

// 유틸리티: 날짜 문자열 비교 (YYYY-MM-DD)
const getTodayString = () => new Date().toISOString().split('T')[0];

/**
 * 1. HP 계산 (Derived Value)
 * 예산 대비 잔액 비율을 0~100으로 반환
 */
export const getHp = (current: number, total: number): number => {
  if (total === 0) return 0; // 예외 처리
  const percentage = (current / total) * 100;
  return Math.max(0, Math.min(100, Math.floor(percentage))); // 0~100 Clamp
};

/**
 * 2. 일일 리셋 체크 (Check Daily Reset)
 * 날짜가 바뀌었는지 확인하고 카운터를 초기화
 */
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();
  
  if (state.counters.lastDailyResetDate === today) {
    return state; // 이미 오늘 리셋됨
  }

  // 날짜가 변경되었으므로 리셋 수행
  return {
    ...state,
    counters: {
      ...state.counters,
      defenseActionsToday: 0,
      junkObtainedToday: 0,
      lastDailyResetDate: today,
      // Dust 지급 등 추가 로직 가능
    },
    // 접속 시 MP 회복 (쿨타임 무시하고 첫 접속 보너스 개념이라면 여기에 추가)
  };
};

/**
 * 3. 지출 적용 (Apply Spend) -> 피격(Hit) 로직
 * - 예산 차감
 * - 조건 충족 시 Junk 획득
 * - 무지출 스트릭 초기화
 */
export const applySpend = (
  state: UserState, 
  amount: number, 
  isFixedCost: boolean
): UserState => {
  const newState = { ...state };
  
  // 1. 예산 차감 (HP는 getHp로 계산하므로 current만 줄이면 됨)
  newState.budget.current -= amount;
  
  // 2. 무지출 스트릭 깨짐
  newState.counters.noSpendStreak = 0;

  // 3. Junk 획득 로직 (비고정비 && 5000원 이상 && 일일 제한 미달)
  if (
    !isFixedCost && 
    amount >= GAME_CONSTANTS.JUNK_THRESHOLD && 
    newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT
  ) {
    newState.inventory.junk += 1;
    newState.counters.junkObtainedToday += 1;
  }

  return newState;
};

/**
 * 4. 방어/참기 적용 (Apply Defense)
 * - MP 회복 (Max 30 제한)
 * - 일일 방어 횟수 증가
 */
export const applyDefense = (state: UserState): UserState => {
  // 하루 최대 방어 횟수 초과 시 상태 변경 없음 (혹은 메시지만 리턴)
  if (state.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) {
    return state;
  }

  const newMp = Math.min(
    GAME_CONSTANTS.MAX_MP, 
    state.runtime.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE
  );

  return {
    ...state,
    runtime: {
      ...state.runtime,
      mp: newMp
    },
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1
    }
  };
};

/**
 * 5. 접속 보너스 (Access Bonus)
 * - Attention is Power 핵심 로직
 * - 쿨타임 체크 후 MP 지급
 */
export const applyAccessBonus = (state: UserState): UserState => {
  const now = new Date();
  const lastAccess = state.counters.lastAccessDate 
    ? new Date(state.counters.lastAccessDate) 
    : new Date(0); // 처음이면 과거 시간

  const diff = now.getTime() - lastAccess.getTime();

  // 쿨타임 미달 시 갱신만 하고 MP는 안 줌
  if (diff < GAME_CONSTANTS.ACCESS_COOLDOWN_MS) {
    return {
      ...state,
      counters: { ...state.counters, lastAccessDate: now.toISOString() }
    };
  }

  // src/money/moneyGameLogic.ts (수정)
import { checkGuardianShield, getDruidRecoveryBonus } from './moneyClassLogic'; // Import 추가
import { getLunaMode } from './moneyLuna'; // Luna 모드 확인용

// ... (기존 getHp 함수 유지) ...

/**
 * [UPDATE] applySpend: 지출 적용 (수호자 패시브 적용)
 */
export const applySpend = (
  state: UserState, 
  amount: number, 
  isFixedCost: boolean
): { newState: UserState, message: string } => { // 리턴 타입 변경: 메시지 포함
  
  const newState = { ...state };
  let message = '';

  // 1. 예산 차감 (공통)
  newState.budget.current -= amount;

  // 2. 수호자 패시브 체크
  const isGuarded = checkGuardianShield(state, amount);

  if (isGuarded) {
    // 수호자: 소액 지출 시 스트릭 유지 + 방어 태그
    message = `🛡️ [수호자] ${amount.toLocaleString()}원 지출을 방어했습니다! (스트릭 유지)`;
    // noSpendStreak를 0으로 리셋하지 않음 (Pass)
    // 필요하다면 inventory에 기록하거나 stats.def를 소폭 상승시키는 로직 추가
  } else {
    // 일반 피격: 스트릭 깨짐
    newState.counters.noSpendStreak = 0;
    
    // Junk 획득 로직 (비고정비 & 5000원 이상)
    if (
      !isFixedCost && 
      amount >= GAME_CONSTANTS.JUNK_THRESHOLD && 
      newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT
    ) {
      newState.inventory.junk += 1;
      newState.counters.junkObtainedToday += 1;
      message = `💥 피격(Hit)! Junk 1개를 획득했습니다.`;
    } else {
      message = `💥 피격(Hit)! 예산이 차감되었습니다.`;
    }
  }

  return { newState, message };
};

/**
 * [UPDATE] checkDailyReset: 일일 초기화 (드루이드 패시브 적용)
 */
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();
  
  if (state.counters.lastDailyResetDate === today) {
    return state;
  }

  // 루나 모드 확인 (함수 호출에 필요한 데이터가 state에 있다고 가정)
  // 실제로는 nextPeriodDate를 넘겨받거나 state 안에 있어야 함.
  // 여기서는 state.luna가 있다고 가정합니다.
  const currentMode = getLunaMode(today, state.luna.nextPeriodDate);

  // 드루이드 보너스 계산
  const druidBonus = getDruidRecoveryBonus(state, currentMode);
  
  // 기본 MP 회복 + 드루이드 보너스
  const newMp = Math.min(
    GAME_CONSTANTS.MAX_MP, 
    state.runtime.mp + druidBonus // 리셋 시 기본 회복량은 없으나 드루이드는 회복함
  );

  return {
    ...state,
    runtime: {
      ...state.runtime,
      mp: newMp
    },
    counters: {
      ...state.counters,
      defenseActionsToday: 0,
      junkObtainedToday: 0,
      lastDailyResetDate: today,
    },
  };
};
  // 쿨타임 지남 -> MP 지급
  return {
    ...state,
    runtime: {
      mp: Math.min(GAME_CONSTANTS.MAX_MP, state.runtime.mp + GAME_CONSTANTS.MP_RECOVERY_ACCESS)
    },
    counters: { ...state.counters, lastAccessDate: now.toISOString() }
  };
};
