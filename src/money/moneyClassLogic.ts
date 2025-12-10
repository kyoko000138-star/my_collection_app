// src/money/moneyClassLogic.ts

import type { UserState, LunaMode } from './types';
import { CLASS_TYPES, CLASS_CONSTANTS } from './constants';

/**
 * 수호자(Guardian) 패시브: 철벽 방어
 * 소액 지출(예: 3000원 이하)은 스트릭을 깨지 않고 방어한 것으로 간주합니다.
 */
export const checkGuardianShield = (state: UserState, amount: number): boolean => {
  if (state.profile.classType !== CLASS_TYPES.GUARDIAN) return false;
  return amount <= CLASS_CONSTANTS.GUARDIAN_DEFENSE_THRESHOLD;
};

/**
 * 드루이드(Druid) 패시브: 자연 치유
 * Luna Mode가 REST일 때, 일일 리셋 시 추가 회복을 제공합니다.
 */
export const getDruidRecoveryBonus = (
  state: UserState,
  currentLunaMode: LunaMode
): number => {
  if (state.profile.classType !== CLASS_TYPES.DRUID) return 0;
  if (currentLunaMode === 'REST') return CLASS_CONSTANTS.DRUID_REST_HEAL;
  return 0;
};
