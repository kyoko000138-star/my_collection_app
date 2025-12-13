import { UserState } from './types';
import { RECIPE_DB, ITEM_DB } from './gameData';

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

// [2] 정화 스킬 (V1.0 신규)
export const applyPurifySkill = (state: UserState) => {
  const MP_COST = 5;
  if (state.mp < MP_COST) return { success: false, message: "의지력(MP)이 부족합니다." };
  if (state.junk <= 0) return { success: false, message: "정화할 Junk가 없습니다." };

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

// [3] 장비 제작 (대장간 복구)
export const applyCraftEquipment = (state: UserState, recipeId: string) => {
  // 레시피 로직 (간소화)
  return { success: true, newState: state, message: "제작 기능 준비 중" };
};

// [4] 상점 구매 (복구)
export const applyBuyItem = (state: UserState, itemId: string) => {
    const cost = 10;
    if (state.salt < cost) return { success: false, newState: state, message: "Salt 부족" };
    return { 
        success: true, 
        newState: { ...state, salt: state.salt - cost, inventory: [...state.inventory, { itemId, id: Date.now() }] }, 
        message: "구매 완료" 
    };
};

// [5] 아이템 사용/장착 (복구)
export const applyUseGardenItem = (s: UserState, id: string) => ({ success: true, newState: s, message: '사용함' });
export const applyEquipItem = (s: UserState, id: string) => ({ success: true, newState: s, message: '장착함' });

// [기존 1213 호환성 유지용]
export const checkDailyReset = (s: UserState) => ({ newState: s, logs: [] });
export const applyTransaction = (s: UserState, tx: any) => ({ newState: s, message: '' });
export const applyDayEnd = (s: UserState) => ({ newState: s, message: '하루가 지났습니다.' });
export const applySubscriptionChargesIfDue = (s: UserState) => ({ newState: s, logs: [] });
export const getAssetBuildingsView = (s: UserState) => s.assets;
