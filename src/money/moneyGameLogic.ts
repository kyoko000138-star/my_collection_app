// src/money/moneyGameLogic.ts
import { UserState } from './types';
import { GAME_CONSTANTS } from './constants';
import { checkGuardianShield, getDruidRecoveryBonus } from './moneyClassLogic';
import { getLunaMode } from './moneyLuna';

const getTodayString = () => new Date().toISOString().split('T')[0];

export const getHp = (current: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (current / total) * 100;
  return Math.max(0, Math.min(100, Math.floor(percentage)));
};

/**
 * 앱 최초 진입 시 / 날짜가 바뀌었을 때 호출.
 * - 일일 카운터 리셋
 * - 드루이드 REST 보너스 적용
 * - 새로운 날이므로 hadSpendingToday = false
 */
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();

  if (state.counters.lastDailyResetDate === today) {
    return state;
  }

  // 루나 모드 확인
  const currentMode = getLunaMode(today, state.luna.nextPeriodDate);

  // 드루이드 보너스
  const druidBonus = getDruidRecoveryBonus(state, currentMode);

  // MP 회복 (드루이드 REST 보너스만 적용)
  const newMp = Math.min(
    GAME_CONSTANTS.MAX_MP,
    state.runtime.mp + druidBonus
  );

  return {
    ...state,
    runtime: {
      ...state.runtime,
      mp: newMp,
    },
    counters: {
      ...state.counters,
      defenseActionsToday: 0,
      junkObtainedToday: 0,
      lastDailyResetDate: today,
      // 새로운 날이므로 아직 지출 없음
      hadSpendingToday: false,
    },
  };
};

/**
 * 지출 처리
 * - 예산 차감
 * - Guardian 패시브 체크
 * - Junk 조건부 획득
 * - 무지출 콤보 리셋
 * - hadSpendingToday = true
 *
 * 리턴값: { newState, message }
 */
export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean
): { newState: UserState; message: string } => {
  // 깊은 복사 (budget, counters, inventory만)
  const newState: UserState = {
    ...state,
    budget: { ...state.budget },
    counters: { ...state.counters },
    inventory: { ...state.inventory },
  };

  let message = '';

  // 1. 예산 차감
  newState.budget.current -= amount;

  // 2. 오늘 지출 발생 플래그
  newState.counters.hadSpendingToday = true;

  // 3. 수호자 패시브 체크
  const isGuarded = checkGuardianShield(state, amount);

  if (isGuarded) {
    // 수호자: 소액 지출 방어 (콤보 유지)
    message = `🛡️ [수호자] ${amount.toLocaleString()}원 지출을 방어했습니다! (무지출 콤보 유지)`;
  } else {
    // 일반 피격: 무지출 콤보 리셋
    newState.counters.noSpendStreak = 0;

    // Junk 획득 로직
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
 * 방어 행동 처리
 * - 하루 최대 DAILY_DEFENSE_LIMIT회까지 MP 회복
 */
export const applyDefense = (state: UserState): UserState => {
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
      mp: newMp,
    },
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1,
    },
  };
};

/**
 * ✅ 하루 마감 처리 (DayEnd)
 *
 * - 하루에 한 번만 동작 (lastDayEndDate === today면 아무 변화 없음)
 * - Natural Dust: Junk 1개 자동 지급
 * - 오늘 지출이 한 번도 없었다면:
 *    - Salt 1개 지급
 *    - noSpendStreak +1
 * - hadSpendingToday 플래그를 내일을 위해 false로 초기화
 *
 * 리턴값: { newState, message }
 */
export const applyDayEnd = (
  state: UserState,
  today: string
): { newState: UserState; message: string } => {
  // 이미 오늘 마감했다면 아무것도 안 함
  if (state.counters.lastDayEndDate === today) {
    return {
      newState: state,
      message: '오늘은 이미 마감 처리되었습니다.',
    };
  }

  // 깊은 복사
  const newState: UserState = {
    ...state,
    counters: { ...state.counters },
    inventory: { ...state.inventory },
  };

  const logs: string[] = [];

  // 1. Natural Dust (하루 1회)
  newState.inventory.junk += 1;
  logs.push('🧹 Natural Dust 1개가 쌓였습니다. (Junk +1)');

  // 2. 무지출 보상
  if (!state.counters.hadSpendingToday) {
    newState.counters.noSpendStreak = state.counters.noSpendStreak + 1;
    newState.inventory.salt = (state.inventory.salt ?? 0) + 1;
    logs.push('✨ 무지출 보상: Salt +1, 무지출 콤보 +1');
  } else {
    logs.push('오늘은 지출이 있어 무지출 보상은 지급되지 않습니다.');
  }

  // 3. 오늘 마감일 기록 + 내일을 위한 플래그 초기화
  newState.counters.lastDayEndDate = today;
  newState.counters.hadSpendingToday = false;

  return {
    newState,
    message: logs.join(' '),
  };
};
