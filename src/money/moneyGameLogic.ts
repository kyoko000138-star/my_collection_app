// src/money/moneyGameLogic.ts

import { UserState, AssetBuildingView, PendingTransaction } from './types';
import { GAME_CONSTANTS, COLLECTION_DB, DUNGEONS } from './constants';
import { RECIPE_DB, ITEM_DB } from './gameData'; // [NEW] 데이터베이스 import
import {
  checkGuardianShield,
  getDruidRecoveryBonus,
  checkAlchemistBonus,
} from './moneyClassLogic'; 
import { calculateLunaPhase } from './moneyLuna';

// --- Helpers ---

// 한국 시간(KST) 기준 날짜 문자열 반환 (YYYY-MM-DD)
const getTodayString = () => {
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.toISOString().split('T')[0];
};

// 한국 시간(KST) 기준 ISO 문자열 반환
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

// [수정] 인벤토리 추가 헬퍼 (ITEM_DB 활용하여 자동 데이터 채움)
const addInventoryItem = (
  state: UserState,
  itemId: string,
  count: number = 1,
) => {
  if (!state.inventory) state.inventory = [];
  
  const itemData = ITEM_DB[itemId];
  // DB에 있으면 그 정보를, 없으면 ID를 이름으로 사용 (예외 처리)
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

// RPG 스탯 계산 함수
export const calculateStats = (state: UserState) => {
  const noSpendDays = Object.keys(state.counters.noSpendStamps || {}).length;
  
  // 공격력: 무지출 일수 + 레벨
  const baseAttack = Math.floor(noSpendDays / 10) + state.level; 
  
  // 방어력: 누적 방어 횟수
  const baseDefense = Math.floor((state.counters.cumulativeDefense || 0) / 5) + 10;

  return {
    attack: baseAttack,
    defense: baseDefense
  };
};

// --- Core Logic ---

// 1. 일일 리셋
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();

  if (state.counters.lastDailyResetDate === today) return state;

  const luna = calculateLunaPhase(state.lunaCycle);
  const druidBonus = getDruidRecoveryBonus(
    state,
    luna.phaseName.includes('Rest') || luna.isPeriod,
  );

  const newMp = Math.min(
    state.maxMp,
    state.mp + GAME_CONSTANTS.MP_RECOVERY_ACCESS + druidBonus,
  );

  return {
    ...state,
    mp: newMp,
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
};

// 2. 지출 (피격)
export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean,
  categoryId: string = 'etc',
): { newState: UserState; message: string } => {
  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  let message = '';

  newState.currentBudget -= amount;
  newState.counters.hadSpendingToday = true;
  newState.counters.dailyTotalSpend += amount;

  const dungeonName = DUNGEONS[categoryId as keyof typeof DUNGEONS]?.name || '지출';
  const newTx: PendingTransaction = {
    id: Date.now().toString(),
    amount,
    note: dungeonName,
    createdAt: getNowISOString(),
  };

  newState.pending = [newTx, ...newState.pending].slice(0, 50);

  const isGuarded = checkGuardianShield(state);

  if (isGuarded) {
    message = `🛡️ [수호자] 방어 발동! 의지력을 지켰습니다.`;
  } else {
    newState.counters.noSpendStreak = 0;

    if (
      !isFixedCost &&
      amount >= GAME_CONSTANTS.JUNK_THRESHOLD &&
      newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT
    ) {
      newState.junk += 1;
      newState.counters.junkObtainedToday += 1;
      message = `💥 HP -${amount.toLocaleString()}.\nJunk 획득!`;

      if (Math.random() < 0.2) {
        const randomIndex = Math.floor(Math.random() * COLLECTION_DB.JUNK_FOREST.length);
        const randomJunk = COLLECTION_DB.JUNK_FOREST[randomIndex];
        const isNew = addCollectionItem(newState, randomJunk, 'JUNK');
        if (isNew) message += ` (✨New: ${randomJunk.name})`;
      }
    } else {
      message = `💥 HP -${amount.toLocaleString()}.`;
    }
  }

  // 예산 초과(흑화) 체크
  if (newState.garden) {
    if (newState.currentBudget < 0) {
      newState.garden.flowerState = 'withered';
      if (Math.random() < 0.5) {
        newState.garden.weedCount = (newState.garden.weedCount || 0) + 1;
        message += `\n💀 예산 초과! 정원에 잡초가 자라납니다.`;
      } else {
        message += `\n🥀 예산 초과! 꽃이 시들었습니다.`;
      }
    }
  }

  return { newState, message };
};

// 3. 방어
export const applyDefense = (state: UserState): UserState => {
  if (state.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT)
    return state;

  const newState: UserState = {
    ...state,
    mp: Math.min(state.maxMp, state.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE),
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1,
      cumulativeDefense: (state.counters.cumulativeDefense || 0) + 1, 
    },
  };

  // 방어 성공 시 보상 (호미/영양제)
  if (newState.garden && Math.random() < 0.3) {
    const itemId = Math.random() < 0.5 ? 'hoe' : 'nutrient'; // ITEM_DB 키 사용
    addInventoryItem(newState, itemId, 1);
  }

  return newState;
};

// 4. 하루 마감
export const applyDayEnd = (
  state: UserState,
): { newState: UserState; message: string } => {
  const today = getTodayString();
  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  const logs: string[] = [];
  
  // 스탯 업데이트
  newState.stats = calculateStats(newState);

  // 자연 먼지
  newState.junk += 1;
  logs.push('🧹 Natural Dust +1');

  // 무지출 보상
  if (!state.counters.hadSpendingToday) {
    newState.counters.noSpendStreak += 1;
    newState.salt += 1;
    
    // 무지출 스탬프
    newState.counters.noSpendStamps = { 
        ...(newState.counters.noSpendStamps || {}), 
        [today]: true 
    };

    logs.push(`✨ 무지출! Salt +1 (Streak: ${newState.counters.noSpendStreak})`);

    if (newState.garden) {
      addInventoryItem(newState, 'water_can', 1); // 물뿌리개

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

// 5. 정화 (Junk -> Essence) [RECIPE_DB 연동]
export const applyPurifyJunk = (
    state: UserState,
): { newState: UserState; success: boolean; message: string } => {
    // DB에서 기본 정화 레시피 로드
    const recipe = RECIPE_DB['PURE_ESSENCE_BASIC']; 
    const nextState = JSON.parse(JSON.stringify(state)) as UserState;

    // 안전한 재료 접근을 위한 초기화
    if (!nextState.materials) nextState.materials = {};

    if (nextState.junk < recipe.junkCost || nextState.salt < recipe.saltCost) {
        return { newState: state, success: false, message: "재료(Junk/Salt)가 부족합니다." };
    }
    if (nextState.mp < recipe.mpCost) {
        return { newState: state, success: false, message: `의지력(MP)이 ${recipe.mpCost} 부족합니다.` };
    }

    // 자원 소모
    nextState.junk -= recipe.junkCost;
    nextState.salt -= recipe.saltCost;
    nextState.mp -= recipe.mpCost;
    
    // 결과물 획득
    nextState.materials['PURE_ESSENCE'] = (nextState.materials['PURE_ESSENCE'] || 0) + recipe.resultCount;

    // 연금술사 보너스 체크
    const isBonus = checkAlchemistBonus(state);
    if (isBonus) {
        nextState.materials['PURE_ESSENCE'] += 1;
        return { newState: nextState, success: true, message: `✨ 정화 대성공! (연금술사 보너스 +1)` };
    }

    return { newState: nextState, success: true, message: `Junk를 정화하여 ${recipe.resultCount}개의 정수를 얻었습니다.` };
};

// 6. 장비 제작 [RECIPE_DB 연동]
export const applyCraftEquipment = (
    state: UserState,
    recipeId: string,
): { newState: UserState; success: boolean; message: string } => {
    
    const recipe = RECIPE_DB[recipeId];
    if (!recipe) return { newState: state, success: false, message: "레시피를 찾을 수 없습니다." };

    const nextState = JSON.parse(JSON.stringify(state)) as UserState;
    if (!nextState.materials) nextState.materials = {};
    if (!nextState.inventory) nextState.inventory = [];

    const currentEssence = nextState.materials['PURE_ESSENCE'] || 0;
    
    // 비용 체크
    if (currentEssence < recipe.essenceCost) return { newState: state, success: false, message: "Pure Essence가 부족합니다." };
    if (nextState.mp < recipe.mpCost) return { newState: state, success: false, message: "MP가 부족합니다." };
    if (nextState.junk < recipe.junkCost) return { newState: state, success: false, message: "Junk가 부족합니다." };
    if (nextState.salt < recipe.saltCost) return { newState: state, success: false, message: "Salt가 부족합니다." };

    // 추가 재료(materials) 체크
    if (recipe.materials) {
        for (const [matId, qty] of Object.entries(recipe.materials)) {
             // 편의상 materials 객체에서 체크 (실제로는 인벤토리 체크가 필요할 수 있음)
             if ((nextState.materials[matId] || 0) < qty) {
                 return { newState: state, success: false, message: `재료(${ITEM_DB[matId]?.name || matId})가 부족합니다.` };
             }
        }
    }

    // 자원 소모
    nextState.materials['PURE_ESSENCE'] -= recipe.essenceCost;
    nextState.mp -= recipe.mpCost;
    nextState.junk -= recipe.junkCost;
    nextState.salt -= recipe.saltCost;
    
    if (recipe.materials) {
        for (const [matId, qty] of Object.entries(recipe.materials)) {
            nextState.materials[matId] -= qty;
        }
    }

    // 결과물 지급
    addInventoryItem(nextState, recipe.resultItemId, recipe.resultCount);

    // 결과물 이름 가져오기
    const itemName = ITEM_DB[recipe.resultItemId]?.name || recipe.resultItemId;

    return { newState: nextState, success: true, message: `⚒️ ${itemName} 제작 완료!` };
};

// 7. 자산 뷰 헬퍼
export const getAssetBuildingsView = (
  state: UserState,
): AssetBuildingView[] => {
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

// 8. 데일리 몬스터 생성기
export const getDailyMonster = (pending: PendingTransaction[]) => {
  let monsterType = 'etc';
  if (pending && pending.length > 0) {
    const lastNote = pending[0].note || '';
    if (lastNote.includes('배달') || lastNote.includes('식비')) monsterType = 'food';
    else if (lastNote.includes('택시') || lastNote.includes('교통')) monsterType = 'transport';
    else if (lastNote.includes('지름') || lastNote.includes('쇼핑')) monsterType = 'shopping';
  }
  return monsterType;
};

// 9. 구독료 자동 청구
export const applySubscriptionChargesIfDue = (
    state: UserState,
): { newState: UserState, logs: string[] } => {
    const newState = JSON.parse(JSON.stringify(state)) as UserState;
    const logs: string[] = [];
    const today = getTodayString();
    const todayDate = new Date(today).getDate();

    newState.subscriptions = newState.subscriptions.map(sub => {
        if (!sub.isActive) return sub;
        if (sub.billingDay === todayDate) {
            // 오늘 이미 청구됐는지 확인 (날짜 문자열 비교)
            const lastCharged = sub.lastChargedDate ? sub.lastChargedDate.split('T')[0] : '';
            if (lastCharged !== today) {
                newState.currentBudget -= sub.amount;
                logs.push(`[자동 청구] ${sub.name}: ${sub.amount.toLocaleString()} G`);
                sub.lastChargedDate = getNowISOString();
            }
        }
        return sub;
    });

    return { newState, logs };
};
