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

  // 쿨타임 지남 -> MP 지급
  return {
    ...state,
    runtime: {
      mp: Math.min(GAME_CONSTANTS.MAX_MP, state.runtime.mp + GAME_CONSTANTS.MP_RECOVERY_ACCESS)
    },
    counters: { ...state.counters, lastAccessDate: now.toISOString() }
  };
};
