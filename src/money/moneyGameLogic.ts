// src/money/moneyGameLogic.ts

import type { UserState } from './types';
import { GAME_CONSTANTS } from './constants';
import { checkGuardianShield, getDruidRecoveryBonus } from './moneyClassLogic';
import { getLunaMode } from './moneyLuna';

const getTodayString = (): string => new Date().toISOString().split('T')[0];

export const getHp = (current: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (current / total) * 100;
  return Math.max(0, Math.min(100, Math.floor(percentage)));
};

// --- Guard Prompt 계산용 타입 & 헬퍼 ---

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getDaysLeftInMonth = (todayStr: string): number => {
  const date = new Date(todayStr);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based
  const lastDate = new Date(year, month + 1, 0); // 이번 달 말일
  const diff =
    Math.floor((lastDate.getTime() - date.getTime()) / MS_PER_DAY) + 1;
  return Math.max(diff, 1);
};

export interface GuardPromptInfo {
  shouldShow: boolean;
  hpBefore: number;
  hpAfter: number;
  avgAvailablePerDay: number;
}

/**
 * Guard Prompt 정보 계산
 * - 이 지출을 했을 때 HP 변화
 * - 남은 기간(이번 달) 일평균 사용 가능 금액
 * - 오늘 이미 프롬프트를 띄웠는지 여부에 따라 shouldShow 결정
 */
export const getGuardPromptInfo = (
  state: UserState,
  amount: number,
  isFixedCost: boolean
): GuardPromptInfo => {
  const todayStr = getTodayString();

  const hpBefore = getHp(state.budget.current, state.budget.total);
  const hpAfter = getHp(state.budget.current - amount, state.budget.total);

  const daysLeft = getDaysLeftInMonth(todayStr);
  const remainingAfterSpend = state.budget.current - amount;
  const avgAvailablePerDay =
    daysLeft > 0 ? Math.floor(remainingAfterSpend / daysLeft) : 0;

  const isHighRiskAmount = amount >= GAME_CONSTANTS.JUNK_THRESHOLD;
  const isHpDropRisk = hpAfter < GAME_CONSTANTS.HP_WARNING_THRESHOLD;

  const shouldShow =
    !isFixedCost &&
    !state.counters.guardPromptShownToday &&
    (isHighRiskAmount || isHpDropRisk);

  return {
    shouldShow,
    hpBefore,
    hpAfter,
    avgAvailablePerDay,
  };
};

/**
 * 일일 리셋 처리
 * - 방어/정크 카운터 0으로
 * - Guard Prompt 노출 플래그 초기화
 * - 드루이드 & REST 모드일 경우 MP 보너스
 */
export const checkDailyReset = (state: UserState): UserState => {
  const today = getTodayString();

  if (state.counters.lastDailyResetDate === today) {
    return state;
  }

  // 루나 모드 확인
  const currentMode = getLunaMode(today, state.luna.nextPeriodDate);

  // 드루이드 보너스
  const druidBonus = getDruidRecoveryBonus(state, currentMode);

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
      guardPromptShownToday: false,
      lastDailyResetDate: today,
    },
  };
};

/**
 * 지출 처리 로직
 * - 예산 차감
 * - 수호자 패시브 판정
 * - Junk 생성 여부 판정
 * - noSpendStreak 리셋
 */
export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean
): { newState: UserState; message: string } => {
  // 수호자 패시브 판정 (state는 불변)
  const isGuarded = checkGuardianShield(state, amount);

  // 예산 계산
  const nextBudgetCurrent = state.budget.current - amount;

  // 예산 반영된 기본 상태
  const baseState: UserState = {
    ...state,
    budget: {
      ...state.budget,
      current: nextBudgetCurrent,
    },
  };

  // Guarded 지출: 스트릭 유지, 카운터 변화 없음
  if (isGuarded) {
    const guardedState: UserState = {
      ...baseState,
    };

    return {
      newState: guardedState,
      message: `🛡️ [수호자] ${amount.toLocaleString()}원 지출이 방어되었습니다. (스트릭 유지)`,
    };
  }

  // 방어되지 않은 일반 피격
  const resetCounters = {
    ...state.counters,
    noSpendStreak: 0,
  };

  const canGainJunk =
    !isFixedCost &&
    amount >= GAME_CONSTANTS.JUNK_THRESHOLD &&
    state.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT;

  if (canGainJunk) {
    const updatedState: UserState = {
      ...baseState,
      counters: {
        ...resetCounters,
        junkObtainedToday: state.counters.junkObtainedToday + 1,
      },
      inventory: {
        ...state.inventory,
        junk: state.inventory.junk + 1,
      },
    };

    return {
      newState: updatedState,
      message: `💥 피격(Hit) 발생. Junk 1개를 획득했습니다.`,
    };
  }

  // 피격이지만 Junk는 안 생기는 경우
  const hitState: UserState = {
    ...baseState,
    counters: resetCounters,
  };

  return {
    newState: hitState,
    message: `💥 피격(Hit) 발생. 예산이 차감되었습니다.`,
  };
};

/**
 * 방어 행동 로직
 * - 하루 최대 DAILY_DEFENSE_LIMIT회
 * - MP 회복 (클램프)
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
    runtime: {
      ...state.runtime,
      mp: newMp,
    },
    counters: {
      ...state.counters,
      defenseActionsToday: state.counters.defenseActionsToday + 1,
    },
  };
};

/**
 * 오늘 마감하기 (Day End)
 * - 하루에 한 번만 동작 (lastDayEndDate로 체크)
 * - 오늘 비고정비 지출이 없으면 → 무지출 데이
 *   - Salt 1개, noSpendStreak +1
 * - 항상 Natural Dust 1개 지급
 */
export const applyDayEnd = (
  state: UserState
): { newState: UserState; message: string } => {
  const todayStr = getTodayString();

  // 이미 오늘 마감했으면 재실행 금지
  if (state.counters.lastDayEndDate === todayStr) {
    return {
      newState: state,
      message: '이미 오늘은 마감 처리되었습니다.',
    };
  }

  // 오늘 비고정비 지출 여부 확인
  const hadVariableSpendToday = state.transactions.some(
    (tx) =>
      tx.date === todayStr &&
      !tx.isFixedCost &&
      tx.amount > 0
  );

  const isNoSpendDay = !hadVariableSpendToday;

  const prevSalt = state.inventory.salt;
  const prevDust = state.inventory.shards['naturalDust'] ?? 0;

  const nextSalt = isNoSpendDay ? prevSalt + 1 : prevSalt;
  const nextDust = prevDust + 1;

  const nextNoSpendStreak = isNoSpendDay
    ? state.counters.noSpendStreak + 1
    : state.counters.noSpendStreak;

  const newState: UserState = {
    ...state,
    inventory: {
      ...state.inventory,
      salt: nextSalt,
      shards: {
        ...state.inventory.shards,
        naturalDust: nextDust,
      },
    },
    counters: {
      ...state.counters,
      noSpendStreak: nextNoSpendStreak,
      lastDayEndDate: todayStr,
    },
  };

  if (isNoSpendDay) {
    return {
      newState,
      message: `방어 데이를 기록했습니다. Salt 1개와 Natural Dust 1개를 획득했습니다. (연속 ${nextNoSpendStreak}일)`,
    };
  }

  return {
    newState,
    message: '오늘은 지출이 있었습니다. Natural Dust 1개를 획득했습니다.',
  };
};

/**
 * 정화(Purify) 루프
 * - 비용: Junk 1개 + Salt 1개 + MP 1
 * - 보상: materials['pureEssence'] 1개
 * - 자원이 부족하면 state 그대로 + 안내 메시지
 */
export const applyPurify = (
  state: UserState
): { newState: UserState; message: string } => {
  const { junk, salt, materials } = state.inventory;
  const { mp } = state.runtime;

  const canPurify = junk > 0 && salt > 0 && mp > 0;

  if (!canPurify) {
    return {
      newState: state,
      message: '정화에 필요한 자원이 부족합니다. (Junk, Salt, MP를 확인하세요.)',
    };
  }

  const prevEssence = materials['pureEssence'] ?? 0;

  const newState: UserState = {
    ...state,
    runtime: {
      ...state.runtime,
      mp: mp - 1,
    },
    inventory: {
      ...state.inventory,
      junk: junk - 1,
      salt: salt - 1,
      materials: {
        ...materials,
        pureEssence: prevEssence + 1,
      },
    },
  };

  return {
    newState,
    message: '정화 완료. Material [pureEssence] 1개를 획득했습니다.',
  };
};

/**
 * 장비 제작 (Craft Equipment)
 * - 비용: pureEssence N개 (GAME_CONSTANTS.EQUIPMENT_COST_PURE_ESSENCE)
 * - 보상: equipment 배열에 "잔잔한 장부검" 1개 추가
 */
export const applyCraftEquipment = (
  state: UserState
): { newState: UserState; message: string } => {
  const cost = GAME_CONSTANTS.EQUIPMENT_COST_PURE_ESSENCE;
  const currentEssence = state.inventory.materials['pureEssence'] ?? 0;

  if (currentEssence < cost) {
    return {
      newState: state,
      message: `장비 제작에 필요한 재료가 부족합니다. (필요: pureEssence ${cost}개)`,
    };
  }

  const newEssence = currentEssence - cost;

  const newState: UserState = {
    ...state,
    inventory: {
      ...state.inventory,
      materials: {
        ...state.inventory.materials,
        pureEssence: newEssence,
      },
      equipment: [...state.inventory.equipment, '잔잔한 장부검'],
    },
  };

  return {
    newState,
    message: '장비 [잔잔한 장부검] 1개가 제작되었습니다.',
  };
};
