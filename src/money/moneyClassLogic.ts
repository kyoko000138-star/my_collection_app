import { UserState } from './types';
import { CLASS_TYPES } from './constants';

// 1. 수호자(Guardian): 20% 확률로 방어 (데미지 무효화 X, 심리적 방어 O)
export const checkGuardianShield = (user: UserState): boolean => {
  // 방어 코드가 없거나 직업이 수호자가 아니면 실패
  if (!user || user.jobTitle !== CLASS_TYPES.GUARDIAN) return false;
  
  // 20% 확률 성공
  return Math.random() < 0.2;
};

// 2. 드루이드(Druid): 회복 보너스 (생리 기간/휴식기일 때 +2 추가 회복)
export const getDruidRecoveryBonus = (user: UserState, isPeriodOrRest: boolean): number => {
  if (!user || user.jobTitle !== CLASS_TYPES.DRUID) return 0;
  
  // 힘든 시기(Period/PMS)에는 자연의 힘으로 더 많이 회복
  return isPeriodOrRest ? 2 : 1; 
};

// 3. [복구 완료] 연금술사(Alchemist): 정화 시 30% 확률로 재료 2배 획득
export const checkAlchemistBonus = (user: UserState): boolean => {
  if (!user || user.jobTitle !== CLASS_TYPES.ALCHEMIST) return false;
  
  // 30% 확률 성공
  return Math.random() < 0.3; 
};
