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
