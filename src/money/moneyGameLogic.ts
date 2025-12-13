// src/money/moneyGameLogic.ts
import { UserState } from './types';

// [1] 지출 적용 (현실성: 예산은 절대 방어 불가)
export const applySpend = (state: UserState, amount: number, isImpulse: boolean, category: string) => {
  const nextHp = state.currentBudget - amount;
  let isExhausted = false;
  let message = `💸 ${amount.toLocaleString()}원을 지출했습니다.`;

  // 탈진 체크
  if (nextHp <= 0) {
    isExhausted = true;
    message += `\n🚨 [경고] 예산이 바닥났습니다! (탈진)\n더 이상 이동할 수 없습니다.`;
  }

  const newState = {
    ...state,
    currentBudget: nextHp,
    isExhausted: isExhausted,
    counters: {
      ...state.counters,
      dailyTotalSpend: (state.counters.dailyTotalSpend || 0) + amount,
      hadSpendingToday: true,
    }
  };

  return { newState, message };
};

// [2] 정화 스킬 (플레이어 기본 스킬)
export const applyPurifySkill = (state: UserState) => {
  const MP_COST = 5;
  
  if (state.mp < MP_COST) {
    return { success: false, message: "의지력(MP)이 부족합니다." };
  }
  
  if (state.junk <= 0) {
      return { success: false, message: "정화할 Junk가 없습니다." };
  }

  // 직업 보정 (알케미스트 효율 증가)
  const efficiency = state.jobTitle === 'ALCHEMIST' ? 2 : 1;
  const expGain = 10 * efficiency;

  return {
    success: true,
    newState: {
      ...state,
      mp: state.mp - MP_COST,
      junk: state.junk - 1,
      salt: (state.salt || 0) + 1,
      exp: state.exp + expGain,
    },
    message: "✨ 정화 성공! (MP -5)"
  };
};

// ... 기존 로직 유지 (Dummy implementations for compilation) ...
export const checkDailyReset = (s: UserState) => ({ newState: s, logs: [] });
export const applyTransaction = (s: UserState, tx: any) => ({ newState: s, message: '' });
export const applyDayEnd = (s: UserState) => ({ newState: s, message: '' });
export const applySubscriptionChargesIfDue = (s: UserState) => ({ newState: s, logs: [] });
export const getAssetBuildingsView = (s: UserState) => s.assets;
export const applyUseGardenItem = (s: UserState, id: string) => ({ success: true, newState: s, message: '' });
export const applyEquipItem = (s: UserState, id: string) => ({ success: true, newState: s, message: '' });
export const applyBuyItem = (s: UserState, id: string) => ({ success: true, newState: s, message: '' });
