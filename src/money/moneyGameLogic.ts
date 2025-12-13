// src/money/moneyGameLogic.ts

import { UserState, AssetBuildingView, Transaction, CategoryId, ShadowMonster, PendingTransaction } from './types';
import { GAME_CONSTANTS, COLLECTION_DB } from './constants';
import { RECIPE_DB, ITEM_DB } from './gameData';
import {
  checkGuardianShield,
  getDruidRecoveryBonus,
  checkAlchemistBonus,
} from './moneyClassLogic'; 
import { updateLunaCycle } from './moneyLuna';

// --- Helpers ---
const getTodayString = () => {
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.toISOString().split('T')[0];
};

const getNowISOString = () => {
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.toISOString();
};

const addCollectionItem = (
  user: UserState,
  itemData: { id: string; name: string; desc: string },
  category: 'JUNK' | 'BADGE',
): boolean => {
  if (!user.collection) user.collection = [];
  const exists = user.collection.some((item) => item.id === itemData.id);
  if (!exists) {
    user.collection.push({
      id: itemData.id,
      name: itemData.name,
      description: itemData.desc,
      obtainedAt: getNowISOString(),
      category,
    });
    return true;
  }
  return false;
};

const addInventoryItem = (
  state: UserState,
  itemId: string,
  count: number = 1,
) => {
  if (!state.inventory) state.inventory = [];
  
  const itemData = ITEM_DB[itemId];
  const name = itemData ? itemData.name : itemId; 
  const type = itemData ? itemData.type : 'consumable';

  const idx = state.inventory.findIndex((i) => i.id === itemId);
  if (idx > -1) {
    state.inventory[idx].count += count;
  } else {
    state.inventory.push({
      id: itemId,
      name,
      type: type as any,
      count,
    });
  }
};

// --- RPG Stats Logic ---
export const calculateStats = (state: UserState) => {
  const noSpendDays = Object.keys(state.counters.noSpendStamps || {}).length;
  
  let attack = Math.floor(noSpendDays / 10) + state.level; 
  let defense = Math.floor((state.counters.cumulativeDefense || 0) / 5) + 10;

  if (state.equipped) {
    Object.values(state.equipped).forEach(itemId => {
      if (!itemId) return;
      const item = ITEM_DB[itemId];
      if (!item) return;

      if (item.equipSlot === 'weapon' && item.effectValue) {
         attack += item.effectValue; 
      }
      if (item.equipSlot === 'armor' && item.effectValue) {
         defense += item.effectValue;
      }
      if (item.equipSlot === 'accessory' && item.effectValue) {
         defense += item.effectValue;
      }
    });
  }

  return { attack, defense };
};

// --- Core Logic ---

// 1. 일일 리셋
export const checkDailyReset = (state: UserState): { newState: UserState, resetOccurred: boolean } => {
  const today = getTodayString();
  if (state.counters.lastDailyResetDate === today) return { newState: state, resetOccurred: false };

  // Luna System v2 적용
  const updatedLuna = updateLunaCycle(state.lunaCycle);
  const phase = updatedLuna.currentPhase;

  // 페이즈별 MP 회복량 보정
  let recovery = GAME_CONSTANTS.MP_RECOVERY_ACCESS; // 기본 10
  
  const druidBonus = getDruidRecoveryBonus(
    state,
    phase === 'MENSTRUAL'
  );

  if (phase === 'MENSTRUAL') recovery -= 5;
  if (phase === 'FOLLICULAR') recovery += 5;

  const newMp = Math.min(
    state.maxMp,
    state.mp + recovery + druidBonus,
  );

  const nextState = {
    ...state,
    mp: newMp,
    lunaCycle: updatedLuna,
    counters: {
      ...state.counters,
      defenseActionsToday: 0,
      junkObtainedToday: 0,
      dailyTotalSpend: 0,
      hadSpendingToday: false,
      guardPromptShownToday: false,
      lastDailyResetDate: today,
    },
  };
  
  return { newState: nextState, resetOccurred: true };
};

// [NEW] 지출 기록 -> 그림자 생성 (전투 분리 핵심)
// 기존 applyTransaction 로직을 확장하여 그림자를 생성합니다.
export const applyRecordSpend = (
  state: UserState, 
  amount: number, 
  category: string, 
  desc: string
): { newState: UserState; message: string } => {
  
  const newState = JSON.parse(JSON.stringify(state)) as UserState;

  // 1. 예산 차감 (현실)
  newState.currentBudget -= amount;
  const isDark = newState.currentBudget <= 0;

  // 2. 그림자 생성 (판타지)
  const newShadow: ShadowMonster = {
    id: `shadow_${Date.now()}`,
    amount, 
    category,
    createdAt: new Date().toISOString(),
    x: Math.floor(Math.random() * 80 + 10),
    y: Math.floor(Math.random() * 80 + 10),
  };

  if (!newState.unresolvedShadows) newState.unresolvedShadows = [];
  newState.unresolvedShadows.push(newShadow);

  // 3. 거래 내역 생성
  const newTx: Transaction = {
    id: `tx_${Date.now()}`,
    amount,
    note: desc,
    createdAt: new Date().toISOString(),
    category: category,
    type: 'EXPENSE',
    intent: 'planned'
  };

  newState.pending = [newTx, ...newState.pending].slice(0, 100);
  newState.status = { ...newState.status, mode: isDark ? 'DARK' : 'NORMAL' };
  
  newState.counters.dailyTotalSpend += amount;
  newState.counters.hadSpendingToday = true;

  // 4. 예산 초과(흑화) 체크 메시지
  let message = `[기록] ${amount.toLocaleString()}원 지출.\n필드에 '지출의 그림자'가 생성되었습니다.`;
  if (isDark && newState.garden.flowerState !== 'withered') {
    newState.garden.flowerState = 'withered';
    message += "\n🥀 예산이 바닥나 꽃이 시들었습니다.";
  }

  return { newState, message };
};

// [EXISTING] applyTransaction (v4 통합 처리) - 호환성 유지
export const applyTransaction = (
  state: UserState,
  txData: Omit<Transaction, 'id' | 'createdAt'>
): { newState: UserState; message: string } => {
  // 저축인 경우 기존 로직 사용, 지출인 경우 applyRecordSpend 사용
  const catStr = txData.category as string;
  const isSave = catStr.startsWith('save.') || catStr.startsWith('invest.');

  if (isSave) {
    const newState = JSON.parse(JSON.stringify(state)) as UserState;
    if (!newState.gardenNutrients) newState.gardenNutrients = { savedAmount: 0, debtRepaid: 0 };

    newState.currentBudget -= txData.amount;
    newState.gardenNutrients.savedAmount += txData.amount;

    let growthMultiplier = 1;
    if (newState.lunaCycle.currentPhase === 'FOLLICULAR') growthMultiplier = 1.5;

    const growthPower = Math.ceil((txData.amount / 10000) * growthMultiplier); 
    newState.garden.treeLevel += growthPower;
    
    let message = `🌱 미래를 위한 씨앗을 심었습니다! (나무 성장 +${growthPower})`;
    if (growthMultiplier > 1) message += " (✨황금기 보너스!)";

    if (txData.category === 'save.debt') {
      newState.gardenNutrients.debtRepaid += txData.amount;
      const removedWeeds = Math.min(newState.garden.weedCount, 5);
      newState.garden.weedCount -= removedWeeds;
      message = `🔗 족쇄를 끊어냈습니다! 정원의 잡초가 ${removedWeeds}개 사라집니다.`;
    }
    
    // 거래 내역 추가
    const newTx: Transaction = { ...txData, id: `tx_${Date.now()}`, createdAt: new Date().toISOString() };
    newState.pending = [newTx, ...newState.pending];
    
    return { newState, message };
  } else {
    return applyRecordSpend(state, txData.amount, txData.category, txData.note || '지출');
  }
};

// [Legacy] applySpend 호환성 유지
export const applySpend = (
  state: UserState, amount: number, isFixedCost: boolean, categoryId: string = 'etc'
): { newState: UserState; message: string } => {
  return applyRecordSpend(state, amount, categoryId, isFixedCost ? '고정비' : '지출');
};

// 3. 방어 (기존 유지)
export const applyDefense = (state: UserState): UserState => {
  if (state.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) return state;

  const newState: UserState = {
    ...state,
    mp: Math.min(state.maxMp, state.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE),
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1,
      cumulativeDefense: (state.counters.cumulativeDefense || 0) + 1, 
    },
  };
  
  newState.assets.fence += 1;

  if (newState.garden && Math.random() < 0.3) {
    const itemId = Math.random() < 0.5 ? 'hoe' : 'potion_mp_s'; // 아이템 ID 수정
    addInventoryItem(newState, itemId, 1);
  }
  return newState;
};

// 4. 하루 마감 (기존 유지)
export const applyDayEnd = (state: UserState): { newState: UserState; message: string } => {
  const today = getTodayString();
  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  const logs: string[] = [];
  
  newState.stats = calculateStats(newState);
  newState.junk += 1;
  logs.push('🧹 Natural Dust +1');

  if (!state.counters.hadSpendingToday) {
    newState.counters.noSpendStreak += 1;
    newState.salt += 1;
    newState.assets.greenhouse += 1;

    newState.counters.noSpendStamps = { 
        ...(newState.counters.noSpendStamps || {}), 
        [today]: true 
    };
    logs.push(`✨ 무지출! Salt +1 (Streak: ${newState.counters.noSpendStreak})`);

    if (newState.garden) {
      addInventoryItem(newState, 'water_can', 1);
      if (newState.garden.flowerState !== 'withered') {
        newState.garden.flowerState = 'blooming';
      }
      logs.push('💧 물뿌리개 획득! 정원이 촉촉해졌습니다.');
    }

    if (newState.counters.noSpendStreak === 3) {
      addCollectionItem(newState, COLLECTION_DB.BADGES.NO_SPEND_3, 'BADGE');
    }
  }

  newState.counters.lastDayEndDate = today;
  return { newState, message: logs.join('\n') };
};

// 5. 정화 (Junk -> Essence) (기존 유지)
export const applyPurify = (state: UserState): { newState: UserState; success: boolean; message: string } => {
    // 레시피 기반이 아니라 단순 정화라면
    if (state.junk < 5 || state.salt < 1 || state.mp < 3) {
        return { newState: state, success: false, message: "재료(Junk 5, Salt 1) 또는 MP(3)가 부족합니다." };
    }
    const nextState = JSON.parse(JSON.stringify(state)) as UserState;
    nextState.junk -= 5;
    nextState.salt -= 1;
    nextState.mp -= 3;
    
    if (!nextState.materials) nextState.materials = {};
    nextState.materials['PURE_ESSENCE'] = (nextState.materials['PURE_ESSENCE'] || 0) + 1;
    nextState.assets.fountain += 1;

    const isBonus = checkAlchemistBonus(state);
    if (isBonus) {
        nextState.materials['PURE_ESSENCE'] += 1;
        return { newState: nextState, success: true, message: `✨ 정화 대성공! (연금술사 보너스 +1)` };
    }
    return { newState: nextState, success: true, message: `Junk를 정화하여 정수를 얻었습니다.` };
};

// 6. 제작 (기존 유지)
export const applyCraftEquipment = (state: UserState, recipeId?: string): { newState: UserState; success: boolean; message: string } => {
    // recipeId가 없으면 기본 제작
    const recipe = RECIPE_DB[recipeId || 'CRAFT_WATER_CAN']; 
    if (!recipe) return { newState: state, success: false, message: "레시피 오류" };

    const nextState = JSON.parse(JSON.stringify(state)) as UserState;
    if (!nextState.materials) nextState.materials = {};
    if (!nextState.inventory) nextState.inventory = [];
    const currentEssence = nextState.materials['PURE_ESSENCE'] || 0;
    
    if (currentEssence < recipe.essenceCost) return { newState: state, success: false, message: "Essence 부족" };
    if (nextState.mp < recipe.mpCost) return { newState: state, success: false, message: "MP 부족" };
    if (nextState.junk < recipe.junkCost) return { newState: state, success: false, message: "Junk 부족" };
    if (nextState.salt < recipe.saltCost) return { newState: state, success: false, message: "Salt 부족" };

    // 재료 소모
    nextState.materials['PURE_ESSENCE'] -= recipe.essenceCost;
    nextState.mp -= recipe.mpCost;
    nextState.junk -= recipe.junkCost;
    nextState.salt -= recipe.saltCost;
    
    addInventoryItem(nextState, recipe.resultItemId, recipe.resultCount);
    nextState.assets.barn += 1;

    const itemName = ITEM_DB[recipe.resultItemId]?.name || recipe.resultItemId;
    return { newState: nextState, success: true, message: `⚒️ ${itemName} 제작 완료!` };
};

// 7. 자산 뷰 (기존 유지)
export const getAssetBuildingsView = (state: UserState): AssetBuildingView[] => {
  const calc = (cnt: number) => {
    if (cnt >= 100) return { level: 4, nextTarget: null };
    if (cnt >= 30) return { level: 3, nextTarget: 100 };
    if (cnt >= 10) return { level: 2, nextTarget: 30 };
    return { level: 1, nextTarget: 10 };
  };
  return [
    { id: 'fence', label: '울타리 (방어)', ...calc(state.assets.fence), count: state.assets.fence },
    { id: 'greenhouse', label: '온실 (무지출)', ...calc(state.assets.greenhouse), count: state.assets.greenhouse },
    { id: 'mansion', label: '저택 (고정비)', ...calc(state.assets.mansion), count: state.assets.mansion },
    { id: 'fountain', label: '분수 (정화)', ...calc(state.assets.fountain), count: state.assets.fountain },
    { id: 'barn', label: '헛간 (파밍)', ...calc(state.assets.barn), count: state.assets.barn },
  ];
};

// 8. 몬스터 생성 (Legacy support)
export const getDailyMonster = (pending: any[]) => {
  let monsterType = 'etc';
  if (pending && pending.length > 0) {
    const lastNote = pending[0].note || '';
    if (lastNote.includes('배달') || lastNote.includes('식비')) monsterType = 'food';
    else if (lastNote.includes('택시') || lastNote.includes('교통')) monsterType = 'transport';
    else if (lastNote.includes('지름') || lastNote.includes('쇼핑')) monsterType = 'shopping';
  }
  return monsterType;
};

// 9. 구독료 (기존 유지)
export const applySubscriptionChargesIfDue = (
  input: { newState: UserState; resetOccurred: boolean }
): { newState: UserState, logs: string[] } => {
    let state = input.newState;
    if (!input.resetOccurred) return { newState: state, logs: [] };

    const logs: string[] = [];
    const today = getTodayString();
    const todayDate = new Date(today).getDate();

    state.subscriptions = state.subscriptions.map(sub => {
        if (!sub.isActive) return sub;
        if (sub.billingDay === todayDate) {
            const lastCharged = sub.lastChargedDate ? sub.lastChargedDate.split('T')[0] : '';
            if (lastCharged !== today) {
                // 구독료 지출 기록 -> 그림자 생성
                const res = applyRecordSpend(state, sub.amount, sub.categoryId || 'fixed', `[고정비] ${sub.name}`);
                state = res.newState;
                logs.push(`${sub.name}: ${sub.amount.toLocaleString()} G`);
                return { ...sub, lastChargedDate: getNowISOString() };
            }
        }
        return sub;
    });
    return { newState: state, logs };
};

// 10. 정원 아이템 사용 (기존 유지)
export const applyUseGardenItem = (state: UserState, itemId: string): { newState: UserState; success: boolean; message: string } => {
  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  const invIndex = newState.inventory.findIndex(i => i.id === itemId);
  if (invIndex === -1 || newState.inventory[invIndex].count <= 0) {
    return { newState: state, success: false, message: "아이템이 없습니다." };
  }

  let effectMsg = "";
  let isUsed = false;

  switch (itemId) {
    case 'water_can': 
      if (newState.garden.flowerState === 'withered') {
        newState.garden.flowerState = 'normal';
        effectMsg = "시든 꽃이 다시 고개를 들었습니다.";
        isUsed = true;
      } else if (newState.garden.flowerState === 'normal') {
        newState.garden.flowerState = 'blooming';
        effectMsg = "꽃이 활짝 피어났습니다!";
        isUsed = true;
      } else {
        return { newState: state, success: false, message: "이미 꽃이 만개했습니다." };
      }
      break;
    case 'hoe': 
      if (newState.garden.weedCount > 0) {
        newState.garden.weedCount -= 1;
        effectMsg = "잡초를 하나 뽑았습니다.";
        isUsed = true;
      } else {
        return { newState: state, success: false, message: "뽑을 잡초가 없습니다." };
      }
      break;
    case 'nutrient': 
      newState.garden.treeLevel += 1;
      effectMsg = "꿈의 나무가 성장했습니다!";
      isUsed = true;
      break;
    case 'potion_mp_s':
      newState.mp = Math.min(newState.maxMp, newState.mp + 5);
      effectMsg = "MP 5 회복!";
      isUsed = true;
      break;
    default:
      // 기타 아이템 효과 처리
      return { newState: state, success: false, message: "사용 효과가 없는 아이템입니다." };
  }

  if (isUsed) {
    newState.inventory[invIndex].count -= 1;
    if (newState.inventory[invIndex].count === 0) {
      newState.inventory.splice(invIndex, 1);
    }
  }
  return { newState, success: true, message: effectMsg };
};

// 11. 아이템 착용/해제 (기존 유지)
export const applyEquipItem = (state: UserState, itemId: string): { newState: UserState; success: boolean; message: string } => {
  const item = ITEM_DB[itemId];
  if (!item || item.type !== 'equipment' || !item.equipSlot) {
    return { newState: state, success: false, message: "착용할 수 없는 아이템입니다." };
  }

  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  
  if (!newState.equipped) {
    newState.equipped = { weapon: null, armor: null, accessory: null };
  }

  const slot = item.equipSlot;
  const currentEquippedId = newState.equipped[slot];

  if (currentEquippedId === itemId) {
    newState.equipped[slot] = null;
    newState.stats = calculateStats(newState);
    return { newState, success: true, message: `[해제] ${item.name}` };
  }

  newState.equipped[slot] = itemId;
  newState.stats = calculateStats(newState);
  return { newState, success: true, message: `[장착] ${item.name}` };
};

// 12. 상점 구매 (기존 유지)
export const applyBuyItem = (
  state: UserState,
  itemId: string
): { newState: UserState; success: boolean; message: string } => {
  const item = ITEM_DB[itemId];
  if (!item || !item.price) {
    return { newState: state, success: false, message: "판매하지 않는 아이템입니다." };
  }

  const newState = JSON.parse(JSON.stringify(state)) as UserState;

  if (newState.salt < item.price) {
    return { newState: state, success: false, message: "Salt(소금)가 부족합니다." };
  }

  newState.salt -= item.price;
  addInventoryItem(newState, itemId, 1);

  return { newState, success: true, message: `${item.name} 구매 완료!` };
};
