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

export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();
  
  if (state.counters.lastDailyResetDate === today) {
    return state;
  }

  // 루나 모드 확인
  const currentMode = getLunaMode(today, state.luna.nextPeriodDate);

  // 드루이드 보너스
  const druidBonus = getDruidRecoveryBonus(state, currentMode);
  
  // MP 회복 (기본 X, 드루이드만 O)
  const newMp = Math.min(
    GAME_CONSTANTS.MAX_MP, 
    state.runtime.mp + druidBonus
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

// 리턴값이 { newState, message } 객체임에 유의하세요.
export const applySpend = (
  state: UserState, 
  amount: number, 
  isFixedCost: boolean
): { newState: UserState, message: string } => {
  
  const newState = { ...state };
  let message = '';

  // 1. 예산 차감
  newState.budget.current -= amount;

  // 2. 수호자 패시브 체크
  const isGuarded = checkGuardianShield(state, amount);

  if (isGuarded) {
    message = `🛡️ [수호자] ${amount.toLocaleString()}원 지출을 방어했습니다! (스트릭 유지)`;
  } else {
    // 일반 피격
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
      mp: newMp
    },
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1
    }
  };
};
