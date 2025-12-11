// src/money/moneyGameLogic.ts

import { UserState, CollectionItem } from './types';
import { GAME_CONSTANTS, COLLECTION_DB } from './constants';
import { checkGuardianShield, getDruidRecoveryBonus } from './moneyClassLogic';
import { getLunaMode } from './moneyLuna';


// src/money/moneyGameLogic.ts 기존 내용 아래에 추가

/**
 * 🚨 가드 프롬프트(경고) 노출 여부 판단
 * 조건:
 * 1. 오늘 아직 경고를 본 적 없음 (1일 1회 제한)
 * 2. 고정비가 아님
 * 3. 금액이 10,000원 이상이거나, 이 지출로 HP가 30% 미만(경고)으로 떨어질 때
 */
export const shouldShowGuardPrompt = (state: UserState, amount: number, isFixedCost: boolean): boolean => {
  if (state.counters.guardPromptShownToday) return false; // 이미 봄
  if (isFixedCost) return false; // 고정비는 건드리지 않음

  const currentHp = getHp(state.budget.current, state.budget.total);
  const nextHp = getHp(state.budget.current - amount, state.budget.total);
  
  // 조건 A: 고액 지출 (설정 가능, 일단 1만원)
  const isHighAmount = amount >= 10000;
  
  // 조건 B: HP가 안전(>30)했다가 위험(<=30)으로 떨어지는 순간
  const isCriticalHit = currentHp > GAME_CONSTANTS.HP_WARNING_THRESHOLD && nextHp <= GAME_CONSTANTS.HP_WARNING_THRESHOLD;

  return isHighAmount || isCriticalHit;
};

/**
 * 가드 프롬프트 확인 처리 (플래그 true 설정)
 */
export const markGuardPromptShown = (state: UserState): UserState => {
  return {
    ...state,
    counters: {
      ...state.counters,
      guardPromptShownToday: true
    }
  };
};
// ------------------------------------------------------------------
// [HELPERS] 유틸리티 함수
// ------------------------------------------------------------------

const getTodayString = () => new Date().toISOString().split('T')[0];

export const getHp = (current: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (current / total) * 100;
  return Math.max(0, Math.min(100, Math.floor(percentage)));
};

/**
 * [HELPER] 도감 추가 함수 (중복 체크 후 추가)
 * @returns true if new item added, false if already exists
 */
const addCollectionItem = (
  inventory: any, 
  itemData: { id: string, name: string, desc: string }, 
  category: 'JUNK' | 'BADGE'
) => {
  // 이미 도감에 있는지 확인
  const exists = inventory.collection.some((item: CollectionItem) => item.id === itemData.id);
  
  if (!exists) {
    inventory.collection.push({
      id: itemData.id,
      name: itemData.name,
      description: itemData.desc,
      obtainedAt: new Date().toISOString(),
      category,
    });
    return true; // 새로 추가됨
  }
  return false; // 이미 있음
};


// ------------------------------------------------------------------
// [CORE LOGIC] 게임 핵심 로직
// ------------------------------------------------------------------

/**
 * 1. 앱 접속 / 날짜 변경 시 리셋
 */
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();

  if (state.counters.lastDailyResetDate === today) {
    return state;
  }

  // 루나 모드 & 드루이드 보너스 확인
  const currentMode = getLunaMode(today, state.luna.nextPeriodDate);
  const druidBonus = getDruidRecoveryBonus(state, currentMode);

  // MP 회복
  const newMp = Math.min(
    GAME_CONSTANTS.MAX_MP,
    state.runtime.mp + druidBonus
  );

  return {
    ...state,
    runtime: {
      ...state.runtime,
      mp: newMp,
    },
    counters: {
      ...state.counters,
      defenseActionsToday: 0,
      junkObtainedToday: 0,
      lastDailyResetDate: today,
      // 새로운 날이 시작되었으므로 아직 지출 없음
      hadSpendingToday: false, 
    },
  };
};

/**
 * 2. 지출(Hit) 처리
 * - 예산 차감
 * - 수호자 방어 체크
 * - Junk 생성 및 도감(Collection) 랜덤 획득
 */
export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean
): { newState: UserState; message: string } => {
  // 깊은 복사
  const newState: UserState = {
    ...state,
    budget: { ...state.budget },
    counters: { ...state.counters },
    inventory: { 
      ...state.inventory,
      // 배열도 깊은 복사 필요 (push 사용 시 원본 오염 방지)
      collection: [...state.inventory.collection] 
    },
  };

  let message = '';

  // 1. 예산 차감
  newState.budget.current -= amount;

  // 2. 오늘 지출 발생 플래그 ON
  newState.counters.hadSpendingToday = true;

  // 3. 수호자 패시브 체크
  const isGuarded = checkGuardianShield(state, amount);

  if (isGuarded) {
    message = `🛡️ [수호자] ${amount.toLocaleString()}원 지출을 방어했습니다! (무지출 콤보 유지)`;
  } else {
    // 일반 피격: 무지출 콤보 리셋
    newState.counters.noSpendStreak = 0;

    // Junk 획득 조건 체크
    if (
      !isFixedCost &&
      amount >= GAME_CONSTANTS.JUNK_THRESHOLD &&
      newState.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT
    ) {
      newState.inventory.junk += 1;
      newState.counters.junkObtainedToday += 1;
      message = `💥 피격(Hit)! Junk 1개를 획득했습니다.`;

      // ---------------------------------------------------
      // [NEW] 도감 시스템: 랜덤 정크 발견
      // ---------------------------------------------------
      if (Math.random() < 0.5) { // 50% 확률
        const randomJunk = COLLECTION_DB.JUNK_FOREST[Math.floor(Math.random() * COLLECTION_DB.JUNK_FOREST.length)];
        const isNew = addCollectionItem(newState.inventory, randomJunk, 'JUNK');
        
        if (isNew) {
          message += ` (✨도감 발견: ${randomJunk.name})`;
        }
      }

      // [NEW] 도감 시스템: 첫 Junk 배지
      addCollectionItem(newState.inventory, COLLECTION_DB.BADGES.FIRST_JUNK, 'BADGE');

    } else {
      message = `💥 피격(Hit)! 예산이 차감되었습니다.`;
    }
  }

  return { newState, message };
};

/**
 * 3. 방어(Guard) 행동
 */
export const applyDefense = (state: UserState): UserState => {
  if (state.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) {
    return state;
  }

  const newMp = Math.min(
    GAME_CONSTANTS.MAX_MP,
    state.runtime.mp + GAME_CONSTANTS.MP_RECOVERY_DEFENSE
  );

  return {
    ...state,
    runtime: { ...state.runtime, mp: newMp },
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1,
    },
  };
};

/**
 * 4. 하루 마감(DayEnd)
 * - Natural Dust 지급
 * - 무지출 시 Salt 보상 및 배지 획득
 */
export const applyDayEnd = (
  state: UserState,
  today: string
): { newState: UserState; message: string } => {
  
  if (state.counters.lastDayEndDate === today) {
    return {
      newState: state,
      message: '오늘은 이미 마감 처리되었습니다.',
    };
  }

  const newState: UserState = {
    ...state,
    counters: { ...state.counters },
    inventory: { 
      ...state.inventory,
      collection: [...state.inventory.collection] 
    },
  };

  const logs: string[] = [];

  // 1. Natural Dust (Junk) 지급
  newState.inventory.junk += 1;
  logs.push('🧹 Natural Dust 1개가 쌓였습니다. (Junk +1)');

  // 2. 무지출 보상 체크
  if (!state.counters.hadSpendingToday) {
    // 콤보 증가
    const newStreak = state.counters.noSpendStreak + 1;
    newState.counters.noSpendStreak = newStreak;
    
    // Salt 지급
    newState.inventory.salt = (state.inventory.salt ?? 0) + 1;
    logs.push(`✨ 무지출 보상: Salt +1, 무지출 콤보 ${newStreak}일째`);

    // ---------------------------------------------------
    // [NEW] 도감 시스템: 무지출 배지 체크
    // ---------------------------------------------------
    if (newStreak === 3) {
      const isNew = addCollectionItem(newState.inventory, COLLECTION_DB.BADGES.NO_SPEND_3, 'BADGE');
      if (isNew) logs.push(`🏅 배지 획득: 작은 인내`);
    }
    if (newStreak === 7) {
      const isNew = addCollectionItem(newState.inventory, COLLECTION_DB.BADGES.NO_SPEND_7, 'BADGE');
      if (isNew) logs.push(`🏅 배지 획득: 절제의 미학`);
    }

  } else {
    logs.push('오늘은 지출이 있어 무지출 보상은 지급되지 않습니다.');
  }

  // 3. 마감 처리
  newState.counters.lastDayEndDate = today;
  // hadSpendingToday는 여기서 false로 만들어 다음날을 준비하거나, 
  // checkDailyReset에서 초기화할 수도 있지만, 안전하게 여기서 리셋
  newState.counters.hadSpendingToday = false; 

  return {
    newState,
    message: logs.join(' '),
  };
};
