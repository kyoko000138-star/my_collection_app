// src/money/moneyGameLogic.ts

import { UserState, PendingTransaction } from './types';
import { GAME_CONSTANTS, DUNGEONS } from './constants';
import { checkGuardianShield, getDruidRecoveryBonus } from './moneyClassLogic';
import { calculateLunaPhase } from './moneyLuna';
import { ITEM_IDS } from './moneyGardenLogic'; // [NEW]

// ... getTodayString / getNowISOString / addCollectionItem 유지 ...

// 헬퍼: 인벤토리에 아이템 추가 (정원용)
const addItem = (
  state: UserState,
  itemId: string,
  name: string,
  count: number = 1,
) => {
  const idx = state.inventory.findIndex((i) => i.id === itemId);
  if (idx > -1) state.inventory[idx].count += count;
  else state.inventory.push({ id: itemId, name, type: 'consumable', count });
};

// 2. 지출 (피격)
export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean,
  categoryId: string = 'etc',
): { newState: UserState; message: string } => {
  const newState: UserState = JSON.parse(JSON.stringify(state));
  let message = '';

  // 기존 데미지/카운터/기록 로직 그대로...
  newState.currentBudget -= amount;
  newState.counters.hadSpendingToday = true;
  newState.counters.dailyTotalSpend += amount;

  const dungeonName =
    DUNGEONS[categoryId as keyof typeof DUNGEONS]?.name || '지출';
  const newTx: PendingTransaction = {
    id: Date.now().toString(),
    amount,
    note: dungeonName,
    createdAt: getNowISOString(),
  };

  newState.pending = [newTx, ...newState.pending].slice(0, 50);

  const isGuarded = checkGuardianShield(state);

  if (isGuarded) {
    message = '🛡️ [수호자] 방어 발동! 데미지는 입었지만 의지력은 지켰습니다.';
  } else {
    // 무지출 스트릭 끊김
    newState.counters.noSpendStreak = 0;

    // Junk 드랍 (기존)
    if (
      !isFixedCost &&
      amount >= GAME_CONSTANTS.JUNK_THRESHOLD &&
      newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT
    ) {
      newState.junk += 1;
      newState.counters.junkObtainedToday += 1;
      newState.assets.warehouse += 1;

      message = `💥 HP -${amount} / 잔해 +1 (창고 성장)`;
    } else {
      message = `💥 HP -${amount}`;
    }
  }

  // [NEW] 예산 초과 시 정원 패널티
  const isBudgetOver = newState.currentBudget < 0;
  if (isBudgetOver) {
    newState.garden.flowerState = 'withered';
    if (Math.random() < 0.5) {
      newState.garden.weedCount += 1;
      message += '\n💀 예산을 넘겨서 정원에 잡초가 자라났습니다.';
    } else {
      message += '\n🥀 꽃이 시들어버렸어요. 다음에 다시 가꿔봅시다.';
    }
  }

  return { newState, message };
};

// 3. 방어 액션 (무지출/절약의 날)
export const applyDefense = (state: UserState): UserState => {
  const newState: UserState = JSON.parse(JSON.stringify(state));

  // 기존 방어 로직 유지 + [NEW] 정원 아이템 드랍
  if (Math.random() < 0.3) {
    const item = Math.random() < 0.5 ? ITEM_IDS.HOE : ITEM_IDS.NUTRIENT;
    const name = item === ITEM_IDS.HOE ? '호미' : '영양제';
    addItem(newState, item, name, 1);
  }

  return newState;
};

// 4. 하루 마감
export const applyDayEnd = (
  state: UserState,
): { newState: UserState; logs: string[] } => {
  const newState: UserState = JSON.parse(JSON.stringify(state));
  const logs: string[] = [];

  // 기존 일일 리셋/정산 로직…

  // 무지출/저지출 보상
  if (!state.counters.hadSpendingToday) {
    newState.counters.noSpendStreak += 1;
    addItem(newState, ITEM_IDS.WATER, '물뿌리개', 1);
    logs.push('💧 오늘은 무지출! 물뿌리개를 얻었습니다.');
  }

  return { newState, logs };
};
