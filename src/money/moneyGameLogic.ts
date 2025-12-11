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
      newState.assets.warehouse += 1; // 창고 성장

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

  if (isFixedCost) newState.assets.mansion += 1; // 저택 성장

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
      // 예산 안에서 쓴 날에는 꽃을 보통 상태로 유지 (이미 blooming이면 그대로)
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
    },
    assets: { ...state.assets, fortress: state.assets.fortress + 1 },
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

  // Natural Dust (시간이 지나면 쌓이는 먼지)
  newState.junk += 1;
  logs.push('🧹 Natural Dust +1');

  // 무지출 보상
  if (!state.counters.hadSpendingToday) {
    newState.counters.noSpendStreak += 1;
    newState.salt += 1;
    newState.assets.airfield += 1;
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

// 5. 정화 (연금술사 보너스 포함)
export const applyPurify = (
  state: UserState,
): { newState: UserState; message: string } => {
  const cost = {
    mp: GAME_CONSTANTS.PURIFY_COST_MP,
    junk: GAME_CONSTANTS.PURIFY_COST_JUNK,
    salt: GAME_CONSTANTS.PURIFY_COST_SALT,
  };

  if (
    state.mp < cost.mp ||
    state.junk < cost.junk ||
    state.salt < cost.salt
  ) {
    return { newState: state, message: '자원이 부족합니다.' };
  }

  const newState = { ...state };
  newState.mp -= cost.mp;
  newState.junk -= cost.junk;
  newState.salt -= cost.salt;

  // 연금술사 보너스
  const isBonus = checkAlchemistBonus(state);
  const amount = isBonus ? 2 : 1;

  newState.materials['PURE_ESSENCE'] =
    (newState.materials['PURE_ESSENCE'] || 0) + amount;
  newState.assets.tower += 1;

  return {
    newState,
    message: `✨ 정화 성공!\nPure Essence +${amount} ${
      isBonus ? '(연금술사 보너스!)' : ''
    }`,
  };
};

// 6. 제작
export const applyCraftEquipment = (
  state: UserState,
): { newState: UserState; message: string } => {
  const cost = 3;
  if ((state.materials['PURE_ESSENCE'] || 0) < cost)
    return {
      newState: state,
      message: 'Pure Essence가 부족합니다.',
    };

  const newState = { ...state };
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
    {
      id: 'fortress',
      label: '요새 (방어)',
      ...calc(state.assets.fortress),
      count: state.assets.fortress,
    },
    {
      id: 'airfield',
      label: '비행장 (무지출)',
      ...calc(state.assets.airfield),
      count: state.assets.airfield,
    },
    {
      id: 'mansion',
      label: '저택 (고정비)',
      ...calc(state.assets.mansion),
      count: state.assets.mansion,
    },
    {
      id: 'tower',
      label: '마법탑 (정화)',
      ...calc(state.assets.tower),
      count: state.assets.tower,
    },
    {
      id: 'warehouse',
      label: '창고 (파밍)',
      ...calc(state.assets.warehouse),
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
