// src/money/moneyGameLogic.ts
import { 
  TransactionLike, DayStatusLike, MonthlyBudgetLike, 
  InstallmentLike, UserState, InventoryState, Building,
  ResidueType, MaterialType, ItemData
} from './types';
import { ITEM_DB } from './items';

// ==========================================
// 1. ⚔️ 전투 시스템 (Battle Mechanics)
// ==========================================

// 💥 피격 데미지 계산 (지출 발생 시)
export const calcDamage = (
  amount: number, 
  isRecoverySnack: boolean, 
  lunaMode: 'normal' | 'pms' | 'rest',
  defStats: { damageReduction: number } // 장비/전직 효과
): number => {
  // 포션(회복간식) 사용 시 데미지 0 (단, 예산 차감은 별도 로직)
  if (lunaMode === 'pms' && isRecoverySnack) return 0;

  let damage = amount;

  // REST 모드에서 배달/휴식 관련 지출 보정 (예: 50% 경감)
  if (lunaMode === 'rest') {
    damage = damage * 0.8; // 20% 감소
  }

  // 방어력/스킬로 인한 감소
  if (defStats.damageReduction > 0) {
    damage = damage * (1 - defStats.damageReduction);
  }

  return Math.floor(damage);
};

// ⚔️ 공격력 계산 (평타/강타)
export const calcAttackDamage = (
  actionType: 'check' | 'quest' | 'saving' | 'income',
  amount: number = 0
): number => {
  switch (actionType) {
    case 'check': return 500; // 눈팅 (평타)
    case 'quest': return 2000; // 생활 퀘스트 (스킬)
    case 'saving': return amount * 2; // 저축 (강타 - 2배 효율)
    case 'income': return amount; // 수입 (월말 레이드용)
    default: return 0;
  }
};

// 🛡️ HP(예산) 계산기
export const calcHP = (budget: MonthlyBudgetLike, transactions: TransactionLike[]): number => {
  if (budget.variableBudget <= 0) return 0;

  // 전체 지출 중 '회복 포션'이 아닌 것만 합산
  const totalDamage = transactions
    .filter(t => t.type === 'expense' && !t.isRecoverySnack)
    .reduce((sum, t) => sum + t.amount, 0);

  const hpRatio = (budget.variableBudget - totalDamage) / budget.variableBudget;
  return Math.max(0, Math.floor(hpRatio * 100));
};


// ==========================================
// 2. 🎒 파밍 & 정화 (Loot & Purify)
// ==========================================

// 👾 지출 카테고리 -> 오염된 잔해 매핑
export const getResidueFromCategory = (category: string): ResidueType => {
  if (['식비', '간식', '카페', '음료'].includes(category)) return 'sticky_slime';
  if (['쇼핑', '의류', '패션', '잡화'].includes(category)) return 'tangled_thread';
  if (['교통', '차량', '택시'].includes(category)) return 'rusty_gear';
  if (['문화', '취미', '구독', '도서'].includes(category)) return 'fog_dust';
  return 'unknown_stone'; // 기타
};

// 🧪 정화 (잔해 + 소금 -> 재료 변환)
export const purifyResidue = (
  residue: ResidueType, 
  hasSalt: boolean, 
  currentMp: number
): { success: boolean; result?: MaterialType; costMp: number; msg: string } => {
  
  if (currentMp < 3) return { success: false, costMp: 0, msg: '마력(MP)이 부족합니다.' };
  if (!hasSalt) return { success: false, costMp: 0, msg: '정화의 소금이 필요합니다.' };

  // 변환 테이블
  const table: Record<ResidueType, MaterialType> = {
    'sticky_slime': 'sugar_crystal',
    'tangled_thread': 'fine_silk',
    'rusty_gear': 'iron_plate',
    'fog_dust': 'mana_powder',
    'unknown_stone': 'purifying_salt' // 돌은 정화하면 소금이 됨 (순환)
  };

  return { 
    success: true, 
    result: table[residue], 
    costMp: 3, 
    msg: '정화 성공! 재료를 얻었습니다.' 
  };
};


// ==========================================
// 3. 🏰 자산의 왕국 (Building Growth)
// ==========================================

// 건물 성장 로직 (저축 입력 시 호출)
export const updateBuildingExp = (
  building: Building, 
  amount: number,
  isDailyLimitReached: boolean
): Building => {
  if (amount <= 0) return building;

  let addedExp = 0;

  // 1. 횟수 경험치 (하루 제한 안 걸렸을 때만)
  if (!isDailyLimitReached) {
    addedExp += 10;
  }

  // 2. 금액 보너스 (만원당 1XP)
  addedExp += Math.floor(amount / 10000);

  // 레벨업 계산 (단순화: 레벨 * 100 XP 필요)
  let newExp = building.currentExp + addedExp;
  let newLevel = building.level;
  const reqExp = newLevel * 100;

  if (newExp >= reqExp) {
    newLevel += 1;
    newExp -= reqExp; // 초과분 이월
  }

  return {
    ...building,
    level: newLevel,
    currentExp: newExp,
    totalSavings: building.totalSavings + amount,
    lastSavingDate: new Date().toISOString().split('T')[0]
  };
};
