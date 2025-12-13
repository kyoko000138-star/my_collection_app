// src/money/moneyGameLogic.ts

import { UserState, AssetBuildingView, PendingTransaction } from './types';
import { GAME_CONSTANTS, COLLECTION_DB, DUNGEONS } from './constants';
import {
  checkGuardianShield,
  getDruidRecoveryBonus,
  checkAlchemistBonus,
} from './moneyClassLogic';
import { calculateLunaPhase } from './moneyLuna';


// [NEW] 레시피 데이터 (임시 - types/constants로 분리 예정)
const RECIPES = {
    PURE_ESSENCE_BASIC: {
        id: 'PURE_ESSENCE',
        junkCost: 10,
        saltCost: 5,
        mpCost: 3, // 제작/정화 시 MP 소모
        resultItem: 'PURE_ESSENCE',
        resultCount: 1,
    },
    CIRCULATION_WAND: { // R17: 순환의 지팡이 (무기)
        id: 'CIRCULATION_WAND',
        junkCost: 0, // PURE_ESSENCE로 제작하므로 Junk는 0
        saltCost: 5,
        mpCost: 5,
        essenceCost: 4, // PURE_ESSENCE 소모
        resultItem: '순환의 지팡이',
        resultCount: 1,
        materials: { '시간의 톱니바퀴': 1 }, // Herb/Drop 재료
    }
    // ... 다른 레시피 추가 예정
};


// [NEW] Junk 정화 -> PURE_ESSENCE 생성
export const applyPurifyJunk = (state: UserState): { newState: UserState, success: boolean, message: string } => {
    const recipe = RECIPES.PURE_ESSENCE_BASIC;
    const nextState = JSON.parse(JSON.stringify(state)) as UserState;

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
    
    // PURE_ESSENCE 획득 (재료에 추가)
    nextState.materials['PURE_ESSENCE'] = (nextState.materials['PURE_ESSENCE'] || 0) + recipe.resultCount;

    return { newState: nextState, success: true, message: `Junk ${recipe.junkCost}를 정화하여 PURE_ESSENCE 1개를 획득했습니다!` };
};


// [NEW] 장비 제작
export const applyCraftEquipment = (state: UserState, recipeId: keyof typeof RECIPES): { newState: UserState, success: boolean, message: string } => {
    const recipe = RECIPES[recipeId];
    const nextState = JSON.parse(JSON.stringify(state)) as UserState;

    if (!recipe.essenceCost) {
        return { newState: state, success: false, message: "이 레시피는 Essence가 필요하지 않습니다." };
    }

    const currentEssence = nextState.materials['PURE_ESSENCE'] || 0;
    
    if (currentEssence < recipe.essenceCost || nextState.mp < recipe.mpCost) {
        return { newState: state, success: false, message: "재료 또는 MP가 부족합니다." };
    }
    
    // 추가 재료 체크 (Herb/Drop Items)
    if (recipe.materials) {
        for (const [materialId, requiredCount] of Object.entries(recipe.materials)) {
            if ((nextState.materials[materialId] || 0) < requiredCount) {
                return { newState: state, success: false, message: `${materialId} 재료가 부족합니다.` };
            }
        }
    }

    // 자원 소모 및 제작
    nextState.materials['PURE_ESSENCE'] -= recipe.essenceCost;
    nextState.mp -= recipe.mpCost;

    // 장비 인벤토리에 추가 (Item 타입에 맞게 처리 필요)
    // 임시: Inventory에 추가 (item.name = resultItem)
    const existingItemIndex = nextState.inventory.findIndex(item => item.name === recipe.resultItem);
    if (existingItemIndex !== -1) {
        nextState.inventory[existingItemIndex].count += recipe.resultCount;
    } else {
        nextState.inventory.push({
            id: recipe.resultItem.replace(/\s/g, '_'),
            name: recipe.resultItem,
            type: 'equipment', // 장비 타입으로 가정
            count: recipe.resultCount,
        });
    }

    return { newState: nextState, success: true, message: `${recipe.resultItem} 제작 성공! MP ${recipe.mpCost} 소모.` };
};

export { RECIPES }; // 레시피 목록 외부 노출
// --- Helpers ---

// 한국 시간(KST) 기준 날짜 문자열 (YYYY-MM-DD)
const getTodayString = () => {
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.toISOString().split('T')[0];
};

// 한국 시간(KST) 기준 ISO 문자열 (로그용)
const getNowISOString = () => {
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.toISOString();
};

// KST 기준 “일(day of month)”
const getTodayDayNumberKST = () => {
  const now = new Date();
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.getUTCDate();
};

const ensureGarden = (user: any) => {
  if (!user.garden) {
    user.garden = {
      treeLevel: 0,
      pondLevel: 0,
      flowerState: 'normal',
      weedCount: 0,
    };
  }
};

const ensureStatus = (user: any) => {
  if (!user.status) {
    user.status = { mode: 'NORMAL', darkLevel: 0 };
  }
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

// --- Core Logic ---

// 0. (NEW) 구독/고정비 “오늘 결제일” 자동 청구
export const applySubscriptionChargesIfDue = (
  state: UserState,
): { newState: UserState; logs: string[] } => {
  const today = getTodayString();
  const day = getTodayDayNumberKST();

  // 깊은 복사
  let working = JSON.parse(JSON.stringify(state)) as UserState;
  const logs: string[] = [];

  if (!Array.isArray(working.subscriptions) || working.subscriptions.length === 0) {
    return { newState: working, logs };
  }

  // billingDay는 1~28 권장(29~31은 정책 필요)
  for (let i = 0; i < working.subscriptions.length; i++) {
    const s = working.subscriptions[i];
    if (!s?.isActive) continue;
    if (s.cycle && s.cycle !== 'MONTHLY') continue; // 지금은 MONTHLY만 자동 처리
    if (s.billingDay !== day) continue;
    if (s.lastChargedDate === today) continue;

    const res = applySpend(working, s.amount, true, s.categoryId || 'subscription');
    working = res.newState;

    // applySpend가 deep copy를 만들기 때문에, 현재 working에서 다시 찍어줘야 안전
    if (working.subscriptions?.[i]) {
      working.subscriptions[i].lastChargedDate = today;
    }

    logs.push(`🏰 구독의 탑: ${s.name} -${s.amount.toLocaleString()} 청구`);
  }

  return { newState: working, logs };
};

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

// 2. 지출 (피격) + 흑화 모드 반영
export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean,
  categoryId: string = 'etc',
): { newState: UserState; message: string } => {
  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  ensureGarden(newState);
  ensureStatus(newState);

  let message = '';

  // 기본 데미지 적용
  newState.currentBudget -= amount;
  newState.counters.hadSpendingToday = true;
  newState.counters.dailyTotalSpend += amount;

  // 기록(Pending) 추가
  const dungeonName = (DUNGEONS as any)?.[categoryId]?.name || '지출';
  const newTx: PendingTransaction = {
    id: Date.now().toString(),
    amount,
    note: dungeonName,
    createdAt: getNowISOString(),
    categoryId,
    kind: isFixedCost ? 'SPEND' : 'SPEND',
  };

  newState.pending = [newTx, ...newState.pending].slice(0, 50);

  // 수호자(Guardian) 체크
  const isGuarded = checkGuardianShield(state);

  if (isGuarded) {
    message = `🛡️ [수호자] 심리적 방어 발동! 데미지는 입었지만 의지력은 지켰습니다.`;
  } else {
    newState.counters.noSpendStreak = 0;

    // Junk 획득 로직
    if (
      !isFixedCost &&
      amount >= GAME_CONSTANTS.JUNK_THRESHOLD &&
      newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT
    ) {
      newState.junk += 1;
      newState.counters.junkObtainedToday += 1;
      newState.assets.warehouse += 1;

      message = `💥 HP -${amount.toLocaleString()}.\nJunk 획득!`;

      if (Math.random() < 0.2) {
        const randomIndex = Math.floor(
          Math.random() * COLLECTION_DB.JUNK_FOREST.length,
        );
        const randomJunk = COLLECTION_DB.JUNK_FOREST[randomIndex];
        const isNew = addCollectionItem(newState, randomJunk, 'JUNK');
        if (isNew) message += ` (✨New: ${randomJunk.name})`;
      }
    } else {
      message = `💥 HP -${amount.toLocaleString()}.`;
    }
  }

  if (isFixedCost) newState.assets.mansion += 1;

  // ✅ 흑화 모드: HP가 0 이하로 내려가면 “정원 직격”
  if (newState.maxBudget > 0 && newState.currentBudget <= 0) {
    newState.status.mode = 'DARK';
    newState.status.darkLevel = Math.min(100, (newState.status.darkLevel || 0) + 10);

    // 정원 타격: 꽃 시들고 잡초 증가(부채/압박 시각화)
    newState.garden.flowerState = 'withered';
    newState.garden.weedCount = (newState.garden.weedCount || 0) + 1;

    message += `\n🖤 흑화 모드 발동… 정원이 시들기 시작합니다.`;
  }

  return { newState, message };
};

// 3. 방어 (MP 회복)
export const applyDefense = (state: UserState): UserState => {
  if (state.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT)
    return state;

  return {
    ...state,
    mp: Math.min(state.maxMp, state.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE),
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1,
    },
    assets: { ...state.assets, fortress: state.assets.fortress + 1 },
  };
};

// 4. 하루 마감
export const applyDayEnd = (
  state: UserState,
): { newState: UserState; message: string } => {
  const today = getTodayString();
  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  ensureGarden(newState);
  ensureStatus(newState);

  const logs: string[] = [];

  // Natural Dust
  newState.junk += 1;
  logs.push('🧹 Natural Dust +1');

  // 무지출 보상
  if (!state.counters.hadSpendingToday) {
    newState.counters.noSpendStreak += 1;
    newState.salt += 1;
    newState.assets.airfield += 1;
    logs.push(`✨ 무지출! Salt +1 (Streak: ${newState.counters.noSpendStreak})`);

    if (newState.counters.noSpendStreak === 3) {
      addCollectionItem(newState, COLLECTION_DB.BADGES.NO_SPEND_3, 'BADGE');
    }
  }

  newState.counters.lastDayEndDate = today;
  return { newState, message: logs.join('\n') };
};

// 5. 정화 (연금술사 보너스 포함)
export const applyPurify = (
  state: UserState,
): { newState: UserState; message: string } => {
  const cost = {
    mp: GAME_CONSTANTS.PURIFY_COST_MP,
    junk: GAME_CONSTANTS.PURIFY_COST_JUNK,
    salt: GAME_CONSTANTS.PURIFY_COST_SALT,
  };

  if (state.mp < cost.mp || state.junk < cost.junk || state.salt < cost.salt) {
    return { newState: state, message: '자원이 부족합니다.' };
  }

  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  ensureGarden(newState);
  ensureStatus(newState);

  newState.mp -= cost.mp;
  newState.junk -= cost.junk;
  newState.salt -= cost.salt;

  const isBonus = checkAlchemistBonus(state);
  const amount = isBonus ? 2 : 1;

  newState.materials['PURE_ESSENCE'] = (newState.materials['PURE_ESSENCE'] || 0) + amount;
  newState.assets.tower += 1;

  return {
    newState,
    message: `✨ 정화 성공!\nPure Essence +${amount} ${isBonus ? '(연금술사 보너스!)' : ''}`,
  };
};

// 6. 제작
export const applyCraftEquipment = (
  state: UserState,
): { newState: UserState; message: string } => {
  const cost = 3;
  if ((state.materials['PURE_ESSENCE'] || 0) < cost)
    return { newState: state, message: 'Pure Essence가 부족합니다.' };

  const newState = JSON.parse(JSON.stringify(state)) as UserState;
  ensureGarden(newState);
  ensureStatus(newState);

  newState.materials['PURE_ESSENCE'] -= cost;
  newState.inventory.push({
    id: 'sword_01',
    name: '잔잔한 장부검',
    type: 'equipment',
    count: 1,
  });
  newState.assets.warehouse += 5;

  return { newState, message: '⚒️ 잔잔한 장부검 제작 완료!' };
};

// 7. 자산 뷰 헬퍼
export const getAssetBuildingsView = (state: UserState): AssetBuildingView[] => {
  const calc = (cnt: number) => {
    if (cnt >= 100) return { level: 4, nextTarget: null };
    if (cnt >= 30) return { level: 3, nextTarget: 100 };
    if (cnt >= 10) return { level: 2, nextTarget: 30 };
    return { level: 1, nextTarget: 10 };
  };

  return [
    { id: 'fortress', label: '요새 (방어)', ...calc(state.assets.fortress), count: state.assets.fortress },
    { id: 'airfield', label: '비행장 (무지출)', ...calc(state.assets.airfield), count: state.assets.airfield },
    { id: 'mansion', label: '저택 (고정비)', ...calc(state.assets.mansion), count: state.assets.mansion },
    { id: 'tower', label: '마법탑 (정화)', ...calc(state.assets.tower), count: state.assets.tower },
    { id: 'warehouse', label: '창고 (파밍)', ...calc(state.assets.warehouse), count: state.assets.warehouse },
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
