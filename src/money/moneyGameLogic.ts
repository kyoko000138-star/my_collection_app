// src/money/moneyGameLogic.ts

import { UserState, CollectionItem, AssetBuildingView, PendingTransaction } from './types';
import { GAME_CONSTANTS, COLLECTION_DB, DUNGEONS } from './constants';
import { checkGuardianShield, getDruidRecoveryBonus, checkAlchemistBonus } from './moneyClassLogic';
import { calculateLunaPhase } from './moneyLuna';

// --- Helpers ---
const getTodayString = () => new Date().toISOString().split('T')[0];

const addCollectionItem = (user: UserState, itemData: { id: string, name: string, desc: string }, category: 'JUNK' | 'BADGE'): boolean => {
  const exists = user.collection.some(item => item.id === itemData.id);
  if (!exists) {
    user.collection.push({
      id: itemData.id,
      name: itemData.name,
      description: itemData.desc,
      obtainedAt: new Date().toISOString(),
      category,
    });
    return true;
  }
  return false;
};

// --- Core Logic ---

// 1. 일일 리셋 & 데일리 몬스터 생성
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();
  if (state.counters.lastDailyResetDate === today) return state;

  const luna = calculateLunaPhase(state.lunaCycle);
  const druidBonus = getDruidRecoveryBonus(state, luna.phaseName.includes('Rest') || luna.isPeriod);
  
  const newMp = Math.min(state.maxMp, state.mp + GAME_CONSTANTS.MP_RECOVERY_ACCESS + druidBonus);

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
    }
  };
};

// 2. 지출 (피격) - [고도화됨]
export const applySpend = (state: UserState, amount: number, isFixedCost: boolean, categoryId: string = 'etc'): { newState: UserState, message: string } => {
  const newState = JSON.parse(JSON.stringify(state)); // Deep Copy
  let message = '';

  // 기본 데미지
  newState.currentBudget -= amount;
  newState.counters.hadSpendingToday = true;
  newState.counters.dailyTotalSpend += amount;

  // 기록(Pending) 추가 - 소비 내역 추적용
  const newTx: PendingTransaction = {
    id: Date.now().toString(),
    amount,
    note: `${DUNGEONS[categoryId as keyof typeof DUNGEONS]?.name || '지출'}`,
    createdAt: new Date().toISOString()
  };
  newState.pending = [newTx, ...newState.pending].slice(0, 50); // 최근 50개 유지

  // 수호자 체크
  const isGuarded = checkGuardianShield(state);

  if (isGuarded) {
    message = `🛡️ [수호자] 심리적 방어 발동! 데미지는 입었지만 의지력은 지켰습니다.`;
  } else {
    newState.counters.noSpendStreak = 0; // 콤보 끊김
    
    // Junk 획득 로직 (고정비 제외, 일정 금액 이상)
    if (!isFixedCost && amount >= GAME_CONSTANTS.JUNK_THRESHOLD && newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT) {
      newState.junk += 1;
      newState.counters.junkObtainedToday += 1;
      newState.assets.warehouse += 1; // 창고 성장
      
      message = `💥 HP -${amount.toLocaleString()}. Junk 획득!`;
      
      // [복구됨] 랜덤 도감 드랍 (20% 확률)
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

  if (isFixedCost) newState.assets.mansion += 1; // 저택 성장

  return { newState, message };
};

// 3. 방어 (MP 회복)
export const applyDefense = (state: UserState): UserState => {
  if (state.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) return state;
  
  return {
    ...state,
    mp: Math.min(state.maxMp, state.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE),
    counters: { ...state.counters, defenseActionsToday: state.counters.defenseActionsToday + 1 },
    assets: { ...state.assets, fortress: state.assets.fortress + 1 }
  };
};

// 4. 하루 마감
export const applyDayEnd = (state: UserState, today: string): { newState: UserState, message: string } => {
  const newState = JSON.parse(JSON.stringify(state));
  const logs = [];

  // Natural Dust
  newState.junk += 1;
  logs.push('🧹 Natural Dust +1');

  // 무지출 보상
  if (!state.counters.hadSpendingToday) {
    newState.counters.noSpendStreak += 1;
    newState.salt += 1;
    newState.assets.airfield += 1;
    logs.push(`✨ 무지출! Salt +1 (Streak: ${newState.counters.noSpendStreak})`);
    
    if (newState.counters.noSpendStreak === 3) addCollectionItem(newState, COLLECTION_DB.BADGES.NO_SPEND_3, 'BADGE');
  }

  newState.counters.lastDayEndDate = today;
  return { newState, message: logs.join('\n') };
};

// 5. 정화 (연금술사 보너스 포함)
export const applyPurify = (state: UserState): { newState: UserState, message: string } => {
  const cost = { mp: 1, junk: 1, salt: 1 };
  if (state.mp < cost.mp || state.junk < cost.junk || state.salt < cost.salt) {
    return { newState: state, message: '자원이 부족합니다.' };
  }
  
  const newState = { ...state };
  newState.mp -= cost.mp;
  newState.junk -= cost.junk;
  newState.salt -= cost.salt;
  
  // [복구됨] 연금술사 보너스
  const isBonus = checkAlchemistBonus(state);
  const amount = isBonus ? 2 : 1;
  
  newState.materials['PURE_ESSENCE'] = (newState.materials['PURE_ESSENCE'] || 0) + amount;
  newState.assets.tower += 1;

  return { newState, message: `✨ 정화 성공! Pure Essence +${amount} ${isBonus ? '(연금술사 보너스!)' : ''}` };
};

// 6. 제작
export const applyCraftEquipment = (state: UserState): { newState: UserState, message: string } => {
  const cost = 3;
  if ((state.materials['PURE_ESSENCE'] || 0) < cost) return { newState: state, message: 'Pure Essence가 부족합니다.' };

  const newState = { ...state };
  newState.materials['PURE_ESSENCE'] -= cost;
  newState.inventory.push({ id: 'sword_01', name: '잔잔한 장부검', type: 'equipment', count: 1 });
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

// 8. [복구됨] 데일리 몬스터 생성기
export const getDailyMonster = (pending: PendingTransaction[]) => {
  // 오늘 지출 중 가장 많은 카테고리 찾기 (여기선 note로 단순 추론)
  let monsterType = 'etc';
  if (pending.length > 0) {
    const lastNote = pending[0].note;
    if (lastNote.includes('배달')) monsterType = 'food';
    else if (lastNote.includes('택시')) monsterType = 'transport';
    else if (lastNote.includes('지름')) monsterType = 'shopping';
  }
  return monsterType;
};
