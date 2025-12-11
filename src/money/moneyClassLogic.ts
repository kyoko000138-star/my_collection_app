// src/money/moneyClassLogic.ts
import type { UserState, LunaMode } from './types';
import { CLASS_TYPES, CLASS_CONSTANTS } from './constants';

/ src/money/moneyClassLogic.ts

import { UserState } from './types'; 

// 수호자(Guardian) 직업: 일정 확률로 방어막 발동
export const checkGuardianShield = (user: UserState): boolean => {
  if (user.jobTitle !== 'Guardian') return false;
  // 20% 확률로 데미지 무효화 (또는 경감)
  return Math.random() < 0.2;
};

// 드루이드(Druid) 직업: 회복량 보너스
export const getDruidRecoveryBonus = (user: UserState): number => {
  if (user.jobTitle === 'Druid') {
    return 1.5; // 회복 효과 50% 증가
  }
  return 1.0;
};

/**
 * 수호자(Guardian) 패시브: 철벽 방어
 * 소액 지출(예: 3000원 이하)은 스트릭을 깨지 않고 방어한 것으로 간주합니다.
 */
export const checkGuardianShield = (
  state: UserState,
  amount: number
): boolean => {
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
