// src/money/moneyClassLogic.ts

import { UserState } from './types'; 

// 수호자(Guardian) 직업: 일정 확률로 방어막 발동
export const checkGuardianShield = (user: UserState): boolean => {
  if (!user || !user.jobTitle) return false;
  
  if (user.jobTitle !== 'Guardian') return false;
  // 20% 확률로 데미지 무효화 (또는 경감)
  return Math.random() < 0.2;
};

// 드루이드(Druid) 직업: 회복량 보너스
export const getDruidRecoveryBonus = (user: UserState): number => {
  if (!user || !user.jobTitle) return 1.0;

  if (user.jobTitle === 'Druid') {
    return 1.5; // 회복 효과 50% 증가
  }
  return 1.0;
};
