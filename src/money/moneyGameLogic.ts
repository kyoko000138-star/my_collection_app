// src/money/moneyGameLogic.ts
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

// [2] 정화 스킬 (플레이어 기본 스킬 - 'A'버튼)
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

// [3] 장비 제작 (대장간용)
export const applyCraftEquipment = (state: UserState, recipeId: string) => {
  const recipe = RECIPE_DB[recipeId];
  if (!recipe) return { success: false, newState: state, message: "알 수 없는 레시피입니다." };

  // 비용 체크
  if (state.salt < recipe.saltCost) return { success: false, newState: state, message: "Salt가 부족합니다." };
  if (state.junk < recipe.junkCost) return { success: false, newState: state, message: "Junk가 부족합니다." };
  if (state.mp < recipe.mpCost) return { success: false, newState: state, message: "제작할 기력(MP)이 부족합니다." };

  // 제작 성공
  const newItem = {
    id: `item_${Date.now()}`,
    itemId: recipe.resultItemId,
    obtainedAt: new Date().toISOString()
  };

  return {
    success: true,
    newState: {
      ...state,
      salt: state.salt - recipe.saltCost,
      junk: state.junk - recipe.junkCost,
      mp: state.mp - recipe.mpCost,
      inventory: [...state.inventory, newItem],
      exp: state.exp + 50 // 제작 경험치
    },
    message: `🔨 ${recipe.name} 제작 완료!`
  };
};

// [4] 아이템 사용 (인벤토리)
export const applyUseGardenItem = (state: UserState, itemId: string) => {
  // 실제 아이템 효과 로직 (예: 물뿌리개)
  const itemData = ITEM_DB[itemId];
  if (!itemData) return { success: false, newState: state, message: "아이템 정보 오류" };

  // 여기에 아이템별 효과 분기 처리 가능
  // 예: if (itemId === 'water_can') ...

  return { 
    success: true, 
    newState: {
        ...state,
        // 소모품이면 인벤토리에서 제거 로직 필요 (생략시 무한사용)
    }, 
    message: `${itemData.name}을(를) 사용했습니다.` 
  };
};

// [5] 장비 장착
export const applyEquipItem = (state: UserState, itemId: string) => {
    // 장착 로직 (간소화)
    return { success: true, newState: state, message: "장비가 장착되었습니다." };
};

// [6] 상점 구매
export const applyBuyItem = (state: UserState, itemId: string) => {
    // 구매 로직 (간소화: Salt 차감 -> 인벤토리 추가)
    const cost = 10; // 임시 가격
    if (state.salt < cost) return { success: false, newState: state, message: "Salt가 부족합니다." };
    
    return { 
        success: true, 
        newState: {
            ...state,
            salt: state.salt - cost,
            inventory: [...state.inventory, { id: `buy_${Date.now()}`, itemId, obtainedAt: new Date().toISOString() }]
        }, 
        message: "구매해주셔서 감사합니다!" 
    };
};

// --- 기타 필수 유틸리티 (Dummy for compatibility) ---
export const checkDailyReset = (s: UserState) => ({ newState: s, logs: [] });
export const applyTransaction = (s: UserState, tx: any) => ({ newState: s, message: '' });
export const applyDayEnd = (s: UserState) => ({ newState: s, message: '' });
export const applySubscriptionChargesIfDue = (s: UserState) => ({ newState: s, logs: [] });
export const getAssetBuildingsView = (s: UserState) => s.assets;
