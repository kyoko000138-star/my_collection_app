// src/money/moneyGameLogic.ts

import { UserState, AssetBuildingView, PendingTransaction } from './types';
import { GAME_CONSTANTS, COLLECTION_DB, DUNGEONS } from './constants';
import {
  checkGuardianShield,
  getDruidRecoveryBonus,
  checkAlchemistBonus,
} from './moneyClassLogic'; // 경로 확인 필요
import { calculateLunaPhase } from './moneyLuna';

// --- Helpers ---

// [수정] 한국 시간(KST) 기준 날짜 문자열 반환 (YYYY-MM-DD)
const getTodayString = () => {
  const now = new Date();
  // UTC + 9시간
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kstDate.toISOString().split('T')[0];
};

// [수정] 한국 시간(KST) 기준 ISO 문자열 반환 (로그용)
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
      obtainedAt: getNowISOString(), // [수정] KST 적용
      category,
    });
    return true;
  }
  return false;
};

// [NEW] 정원/아이템용 상수 & 인벤토리 헬퍼
const GARDEN_ITEM_IDS = {
  WATER: 'water_can', // 물뿌리개 (무지출 보상)
  HOE: 'hoe', // 호미 (방어 보상)
  NUTRIENT: 'nutrient', // 영양제 (나중에 꽃 회복용)
} as const;

type GardenItemId = (typeof GARDEN_ITEM_IDS)[keyof typeof GARDEN_ITEM_IDS];

const addInventoryItem = (
  state: UserState,
  itemId: GardenItemId | string,
  name: string,
  count: number = 1,
) => {
  if (!state.inventory) return;
  const idx = state.inventory.findIndex((i) => i.id === itemId);
  if (idx > -1) {
    state.inventory[idx].count += count;
  } else {
    state.inventory.push({
      id: itemId,
      name,
      type: 'consumable',
      count,
    });
  }
};

// --- RPG Stats Logic (NEW) ---

// [NEW] RPG 스탯 계산 함수 (UserState의 파생값)
export const calculateStats = (state: UserState) => {
  const noSpendDays = Object.keys(state.counters.noSpendStamps || {}).length;
  
  // 공격력(정화력): 무지출 일수와 레벨에 비례 (장기적 절약 습관)
  const baseAttack = Math.floor(noSpendDays / 10) + state.level; 
  
  // 방어력(의지력): 방어 성공 횟수(누적)에 비례 (단기적 자제력)
  const baseDefense = Math.floor((state.counters.cumulativeDefense || 0) / 5) + 10;

  return {
    attack: baseAttack,
    defense: baseDefense
  };
};

// --- Forge Recipes (NEW) ---

// [NEW] 레시피 데이터 (moneyGameLogic에서 export)
export const RECIPES = {
    PURE_ESSENCE_BASIC: {
        id: 'PURE_ESSENCE',
        junkCost: 10,
        saltCost: 5,
        mpCost: 3, // 제작/정화 시 MP 소모
        resultItem: 'PURE_ESSENCE',
        resultCount: 1,
    },
    CIRCULATION_WAND: { // W02: 금화 지팡이 (MP 소모 감소)
        id: 'CIRCULATION_WAND',
        junkCost: 0,
        saltCost: 5,
        mpCost: 5,
        essenceCost: 4, // PURE_ESSENCE 소모
        resultItem: '순환의 지팡이',
        resultCount: 1,
        materials: { '시간의 톱니바퀴': 1 }, // Herb/Drop 재료 (임시)
    },
    SWORD_OF_LEDGER: { // W01: 장부 검
        id: 'SWORD_OF_LEDGER',
        junkCost: 0,
        saltCost: 10,
        mpCost: 7,
        essenceCost: 3, 
        resultItem: '장부 검',
        resultCount: 1,
    }
    // ... 다른 레시피 추가 예정
};

// --- Core Logic ---

// 1. 일일 리셋 & 데일리 몬스터 생성
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();

  // 이미 오늘 리셋을 했다면 그대로 반환
  if (state.counters.lastDailyResetDate === today) return state;

  const luna = calculateLunaPhase(state.lunaCycle);
  const druidBonus = getDruidRecoveryBonus(
    state,
    luna.phaseName.includes('Rest') || luna.isPeriod,
  );

  // MP 회복
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
  const newState = JSON.parse(JSON.stringify(state)) as UserState; // Deep Copy
  let message = '';

  // 기본 데미지 적용
  newState.currentBudget -= amount;
  newState.counters.hadSpendingToday = true;
  newState.counters.dailyTotalSpend += amount;

  // 기록(Pending) 추가
  const dungeonName =
    DUNGEONS[categoryId as keyof typeof DUNGEONS]?.name || '지출';
  const newTx: PendingTransaction = {
    id: Date.now().toString(),
    amount,
    note: dungeonName,
    createdAt: getNowISOString(), // [수정] KST 적용
  };

  // 최근 50개 유지
  newState.pending = [newTx, ...newState.pending].slice(0, 50);

  // 수호자(Guardian) 체크
  const isGuarded = checkGuardianShield(state);

  if (isGuarded) {
    message = `🛡️ [수호자] 심리적 방어 발동! 데미지는 입었지만 의지력은 지켰습니다.`;
  } else {
    newState.counters.noSpendStreak = 0; // 콤보 끊김

    // Junk 획득 로직 (고정비 제외, 일정 금액 이상, 하루 제한 미만)
    if (
      !isFixedCost &&
      amount >= GAME_CONSTANTS.JUNK_THRESHOLD &&
      newState.counters.junkObtainedToday <
        GAME_CONSTANTS.DAILY_JUNK_LIMIT
    ) {
      newState.junk += 1;
      newState.counters.junkObtainedToday += 1;
      // [수정] 창고 성장 (assets.warehouse)
      // newState.assets.warehouse += 1; 

      message = `💥 HP -${amount.toLocaleString()}.\nJunk 획득!`;

      // 랜덤 도감 드랍 (20% 확률)
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

  // [수정] 저택 성장 (assets.mansion)
  if (isFixedCost) {
    // newState.assets.mansion += 1; 
  }

  // [NEW] 예산 초과 시 정원 패널티
  if (newState.garden) {
    const isBudgetOver = newState.currentBudget < 0;

    if (isBudgetOver) {
      newState.garden.flowerState = 'withered';
      if (Math.random() < 0.5) {
        newState.garden.weedCount = (newState.garden.weedCount || 0) + 1;
        message += `\n💀 예산을 넘겨서 정원에 잡초가 자라났습니다.`;
      } else {
        message += `\n🥀 꽃이 시들어버렸어요. 다음에 다시 가꿔봅시다.`;
      }
    } else {
      // 예산 안에서 쓴 날에는 꽃을 보통 상태로 유지
      if (newState.garden.flowerState === 'normal') {
        // 그대로 두거나, 상황에 따라 나중에 로직 추가 가능
      }
    }
  }

  return { newState, message };
};

// 3. 방어 (MP 회복)
export const applyDefense = (state: UserState): UserState => {
  if (
    state.counters.defenseActionsToday >=
    GAME_CONSTANTS.DAILY_DEFENSE_LIMIT
  )
    return state;

  const newState: UserState = {
    ...state,
    mp: Math.min(
      state.maxMp,
      state.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE,
    ),
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1,
      // [NEW] 누적 방어 횟수 증가 (스탯 반영용)
      cumulativeDefense: (state.counters.cumulativeDefense || 0) + 1, 
    },
    // [수정] 요새 성장 (assets.fortress)
    // assets: { ...state.assets, fortress: state.assets.fortress + 1 }, 
  };

  // [NEW] 방어 성공 시 정원 관련 아이템 드랍(확률)
  if (newState.garden) {
    // 30% 확률로 호미 또는 영양제 지급
    if (Math.random() < 0.3) {
      const itemId =
        Math.random() < 0.5
          ? GARDEN_ITEM_IDS.HOE
          : GARDEN_ITEM_IDS.NUTRIENT;
      const name = itemId === GARDEN_ITEM_IDS.HOE ? '호미' : '영양제';
      addInventoryItem(newState, itemId, name, 1);
    }
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
  
  // ⚔️ 스탯 업데이트
  newState.stats = calculateStats(newState); // [NEW]

  // Natural Dust (시간이 지나면 쌓이는 먼지)
  newState.junk += 1;
  logs.push('🧹 Natural Dust +1');

  // 무지출 보상
  if (!state.counters.hadSpendingToday) {
    newState.counters.noSpendStreak += 1;
    newState.salt += 1;
    // [수정] 비행장 성장 (assets.airfield)
    // newState.assets.airfield += 1;
    
    // [NEW] 무지출 스탬프 기록
    newState.counters.noSpendStamps = { 
        ...(newState.counters.noSpendStamps || {}), 
        [today]: true 
    };

    logs.push(
      `✨ 무지출! Salt +1 (Streak: ${newState.counters.noSpendStreak})`,
    );

    // [NEW] 무지출이면 정원에 물뿌리개 지급 + 꽃 상태 개선
    if (newState.garden) {
      addInventoryItem(newState, GARDEN_ITEM_IDS.WATER, '물뿌리개', 1);

      if (newState.garden.flowerState !== 'withered') {
        newState.garden.flowerState = 'blooming';
      }
      logs.push('💧 정원이 촉촉해졌습니다. (물뿌리개 +1)');
    }

    if (newState.counters.noSpendStreak === 3) {
      addCollectionItem(
        newState,
        COLLECTION_DB.BADGES.NO_SPEND_3,
        'BADGE',
      );
    }
  }

  newState.counters.lastDayEndDate = today;
  return { newState, message: logs.join('\n') };
};

// 5. 정화 (Junk -> Essence)
// [NEW] ForgeView에서 정화 탭 로직으로 사용
export const applyPurifyJunk = (
    state: UserState,
): { newState: UserState; success: boolean; message: string } => {
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
    // [수정] 마법탑 성장 (assets.tower)
    // nextState.assets.tower += 1;

    // 연금술사 보너스 (기존 로직 이관 - 선택 사항)
    const isBonus = checkAlchemistBonus(state);
    const amount = isBonus ? 2 : 1;
    nextState.materials['PURE_ESSENCE'] += (amount - 1);

    return { newState: nextState, success: true, message: `Junk를 정화하여 PURE_ESSENCE ${amount}개를 획득했습니다!` };
};

// 6. 제작 (ForgeView에서 호출)
export const applyCraftEquipment = (
    state: UserState,
    recipeId: keyof typeof RECIPES, // recipeId를 인수로 받음
): { newState: UserState; success: boolean; message: string } => {
    
    // [수정] 이전에 중복 선언되어 오류를 일으켰던 함수를 최종 버전으로 사용
    const recipe = RECIPES[recipeId];
    const nextState = JSON.parse(JSON.stringify(state)) as UserState;

    const currentEssence = nextState.materials['PURE_ESSENCE'] || 0;
    
    // Essence 및 MP 체크
    if (currentEssence < (recipe.essenceCost || 0) || nextState.mp < recipe.mpCost) {
        return { newState: state, success: false, message: "재료 또는 MP가 부족합니다." };
    }
    
    // 추가 재료 체크 (Herb/Drop Items) - 생략

    // 자원 소모 및 제작
    nextState.materials['PURE_ESSENCE'] -= (recipe.essenceCost || 0);
    nextState.mp -= recipe.mpCost;

    // 장비 인벤토리에 추가 
    const existingItemIndex = nextState.inventory.findIndex(item => item.name === recipe.resultItem);
    if (existingItemIndex !== -1) {
        nextState.inventory[existingItemIndex].count += recipe.resultCount;
    } else {
        nextState.inventory.push({
            id: recipe.resultItem.replace(/\s/g, '_'),
            name: recipe.resultItem,
            type: 'equipment', 
            count: recipe.resultCount,
        });
    }

    // [수정] 창고 성장 (assets.warehouse)
    // nextState.assets.warehouse += 5;

    return { newState: nextState, success: true, message: `${recipe.resultItem} 제작 성공! MP ${recipe.mpCost} 소모.` };
};

// 7. 자산 뷰 헬퍼 (구 왕국 건물 -> 정원 건물 매핑 필요)
export const getAssetBuildingsView = (
  state: UserState,
): AssetBuildingView[] => {
  const calc = (cnt: number) => {
    if (cnt >= 100) return { level: 4, nextTarget: null };
    if (cnt >= 30) return { level: 3, nextTarget: 100 };
    if (cnt >= 10) return { level: 2, nextTarget: 30 };
    return { level: 1, nextTarget: 10 };
  };

  // [수정 필요] 자산 ID를 정원 테마(fence, greenhouse 등)로 변경해야 함.
  // 현재는 구 버전(fortress, airfield 등)으로 유지됨.
  return [
    {
      id: 'fortress',
      label: '요새 (방어)',
      // ...
      count: state.assets.fortress,
    },
    // ... (나머지 건물들 유지) ...
    {
      id: 'warehouse',
      label: '창고 (파밍)',
      // ...
      count: state.assets.warehouse,
    },
  ];
};

// 8. 데일리 몬스터 생성기 (Pending 내역 기반 추론)
export const getDailyMonster = (pending: PendingTransaction[]) => {
  let monsterType = 'etc';
  if (pending && pending.length > 0) {
    const lastNote = pending[0].note || '';
    if (lastNote.includes('배달') || lastNote.includes('식비'))
      monsterType = 'food';
    else if (lastNote.includes('택시') || lastNote.includes('교통'))
      monsterType = 'transport';
    else if (lastNote.includes('지름') || lastNote.includes('쇼핑'))
      monsterType = 'shopping';
  }
  return monsterType;
};

// [NEW] 9. 구독료 자동 청구 로직 (Export 필수)
export const applySubscriptionChargesIfDue = (
    state: UserState,
): { newState: UserState, logs: string[] } => {
    const newState = JSON.parse(JSON.stringify(state)) as UserState;
    const logs: string[] = [];
    const today = getTodayString();
    const todayDate = new Date(today).getDate(); // 오늘 날짜 (1일~31일)

    newState.subscriptions = newState.subscriptions.map(sub => {
        if (!sub.isActive) return sub;

        // 청구일이 오늘이라면
        if (sub.billingDay === todayDate) {
            
            // HP(예산) 차감
            newState.currentBudget -= sub.amount;
            logs.push(`[자동 청구] ${sub.name}: ${sub.amount.toLocaleString()} G 차감.`);
            
            // 마지막 청구일 업데이트
            sub.lastChargedDate = getNowISOString();
            
            // 해당 지출 금액을 그림자로 생성할 수도 있음 (현재는 단순 차감만)
            
        }
        return sub;
    });

    // HP가 0 이하로 떨어지면 DARK MODE 로직 추가 가능
    if (newState.currentBudget < 0 && newState.status.mode !== 'DARK') {
        newState.status.mode = 'DARK';
        logs.push("💀 예산 초과! DARK MODE가 발동됩니다.");
    }

    return { newState, logs };
};
