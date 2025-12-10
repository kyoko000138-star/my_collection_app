// src/money/moneyGameLogic.ts
import { 
  TransactionLike, DayStatusLike, MonthlyBudgetLike, 
  InstallmentLike, Building,
  ResidueType, MaterialType
} from './types';
import { ITEM_DB } from './items';

// ==========================================
// 1. ⚔️ 전투 시스템 (Battle Mechanics)
// ==========================================

// 💥 피격 데미지 계산
export const calcDamage = (
  amount: number, 
  isRecoverySnack: boolean, 
  lunaMode: 'normal' | 'pms' | 'rest',
  defStats: { damageReduction: number } 
): number => {
  if (lunaMode === 'pms' && isRecoverySnack) return 0;

  let damage = amount;

  if (lunaMode === 'rest') {
    damage = damage * 0.8; 
  }

  if (defStats.damageReduction > 0) {
    damage = damage * (1 - defStats.damageReduction);
  }

  return Math.floor(damage);
};

// ⚔️ 공격력 계산
export const calcAttackDamage = (
  actionType: 'check' | 'quest' | 'saving' | 'income',
  amount: number = 0
): number => {
  switch (actionType) {
    case 'check': return 500; 
    case 'quest': return 2000; 
    case 'saving': return amount * 2; 
    case 'income': return amount; 
    default: return 0;
  }
};

// ==========================================
// 2. 📊 스탯 계산기 (MoneyStats.tsx 호환용)
// ==========================================

// 🛡️ HP(예산) 계산기
export const calcHP = (budget: MonthlyBudgetLike, transactions: TransactionLike[]): number => {
  if (!budget || budget.variableBudget <= 0) return 0;
  const safeTxs = transactions || [];

  const totalDamage = safeTxs
    .filter(t => t.type === 'expense' && !t.isRecoverySnack)
    .reduce((sum, t) => sum + t.amount, 0);

  const hpRatio = (budget.variableBudget - totalDamage) / budget.variableBudget;
  return Math.max(0, Math.floor(hpRatio * 100));
};

// 🔮 MP(집중도) 계산기 (UI 호환용 복구)
export const calcMP = (budget: MonthlyBudgetLike, dayStatuses: DayStatusLike[]): number => {
  if (!budget || budget.noSpendTarget <= 0) return 0;
  const safeDays = dayStatuses || [];
  
  const noSpendDays = safeDays.filter(d => d.isNoSpend).length;
  // 최대 10점 만점 기준으로 환산 (UI 게이지바용)
  const raw = (noSpendDays / budget.noSpendTarget) * 10; 
  return Math.min(10, Math.round(raw));
};

// 🧱 DEF(방어력/상환) 계산기 (UI 호환용 복구)
export const calcDEF = (installments: InstallmentLike[]): number => {
  const safeInstalls = installments || [];
  if (safeInstalls.length === 0) return 100; // 무부채 = 방어력 MAX

  const total = safeInstalls.reduce((sum, ins) => sum + ins.totalAmount, 0);
  if (total <= 0) return 100; 
  
  const paid = safeInstalls.reduce((sum, ins) => sum + ins.paidAmount, 0);
  return Math.round((paid / total) * 100);
};

// ==========================================
// 3. 🎒 파밍 & 정화 (Loot & Purify)
// ==========================================

export const getResidueFromCategory = (category: string): ResidueType => {
  if (['식비', '간식', '카페', '음료'].includes(category)) return 'sticky_slime';
  if (['쇼핑', '의류', '패션', '잡화'].includes(category)) return 'tangled_thread';
  if (['교통', '차량', '택시'].includes(category)) return 'rusty_gear';
  if (['문화', '취미', '구독', '도서'].includes(category)) return 'fog_dust';
  return 'unknown_stone'; 
};

export const purifyResidue = (
  residue: ResidueType, 
  hasSalt: boolean, 
  currentMp: number
): { success: boolean; result?: MaterialType; costMp: number; msg: string } => {
  
  if (currentMp < 3) return { success: false, costMp: 0, msg: '마력(MP)이 부족합니다.' };
  if (!hasSalt) return { success: false, costMp: 0, msg: '정화의 소금이 필요합니다.' };

  const table: Record<ResidueType, MaterialType> = {
    'sticky_slime': 'sugar_crystal',
    'tangled_thread': 'fine_silk',
    'rusty_gear': 'iron_plate',
    'fog_dust': 'mana_powder',
    'unknown_stone': 'purifying_salt',
    'wet_moss': 'tea_essence',     // (추가된 잔해 매핑)
    'torn_receipt': 'leaf_fragment',
    'broken_glass': 'sea_glass',
    'soaked_box': 'timber_plank',
    'dried_syrup': 'dried_date',
    'crushed_can': 'salt_crystal',
    'expired_coupon': 'knowledge_shard',
    'crumpled_paper': 'contract_ink',
    'fake_gem': 'gold_leaf',
    'faded_ribbon': 'aged_wood'
  };

  return { 
    success: true, 
    result: table[residue] || 'purifying_salt', 
    costMp: 3, 
    msg: '정화 성공! 재료를 얻었습니다.' 
  };
};

// ==========================================
// 4. 🏰 자산의 왕국 (Building)
// ==========================================

export const updateBuildingExp = (
  building: Building, 
  amount: number,
  isDailyLimitReached: boolean
): Building => {
  if (amount <= 0) return building;

  let addedExp = 0;
  if (!isDailyLimitReached) {
    addedExp += 10;
  }
  addedExp += Math.floor(amount / 10000);

  let newExp = building.currentExp + addedExp;
  let newLevel = building.level;
  const reqExp = newLevel * 100;

  if (newExp >= reqExp) {
    newLevel += 1;
    newExp -= reqExp; 
  }

  return {
    ...building,
    level: newLevel,
    currentExp: newExp,
    totalSavings: building.totalSavings + amount,
    lastSavingDate: new Date().toISOString().split('T')[0]
  };
};

// ==========================================
// 5. 🍃 컬렉션 포인트 (CollectionBar.tsx 호환용)
// ==========================================

export const calcLeafPoints = (
  transactions: TransactionLike[] = [],
  dayStatuses: DayStatusLike[] = [],
  installments: InstallmentLike[] = [],
): number => {
  const safeTxs = transactions || [];
  const safeDays = dayStatuses || [];
  const safeInstalls = installments || [];

  const txPoints = safeTxs.length * 1; 
  const noSpendSuccess = safeDays.filter(d => d.isNoSpend).length * 2; 
  const paidInstallments = safeInstalls.filter(ins => ins.paidAmount >= ins.totalAmount && ins.totalAmount > 0).length * 3;

  return txPoints + noSpendSuccess + paidInstallments;
};

export const deriveCollection = (leafPoints: number) => {
  const incense = Math.floor(leafPoints / 30);
  const afterIncense = leafPoints % 30;
  const tea = Math.floor(afterIncense / 10);
  const afterTea = afterIncense % 10;
  const leaves = Math.floor(afterTea / 2);

  return { leaves, tea, incense };
};

// RPG 스탯 (MoneyWeaponCard.tsx 호환용)
export const calcRPGStats = (
  transactions: TransactionLike[] = [],
  dayStatuses: DayStatusLike[] = [],
  savedGold: number = 0
) => {
  const str = (dayStatuses || []).filter(d => d.isNoSpend).length * 10;
  const int = (transactions || []).length * 5;
  const dex = Math.floor(savedGold / 1000);
  return { str, int, dex, totalPower: str + int + dex };
};

export const getEquippedItems = (stats: {str:number, int:number, dex:number} | undefined) => {
  // 기본 장비
  let weapon = { name: '녹슨 검', icon: '🗡️', grade: 'C' };
  let armor = { name: '천 옷', icon: '👕', grade: 'C' };
  let accessory = { name: '실 반지', icon: '💍', grade: 'C' };

  if (!stats) return { weapon, armor, accessory };

  if (stats.str >= 30) armor = { name: '강철 갑옷', icon: '🛡️', grade: 'B' };
  if (stats.str >= 70) armor = { name: '용의 판금', icon: '🐉', grade: 'A' };

  if (stats.int >= 30) weapon = { name: '마법 깃펜', icon: '✒️', grade: 'B' };
  if (stats.int >= 70) weapon = { name: '현자의 지팡이', icon: '🪄', grade: 'A' };

  if (stats.dex >= 30) accessory = { name: '금화 주머니', icon: '💰', grade: 'B' };
  if (stats.dex >= 70) accessory = { name: '다이아 목걸이', icon: '💎', grade: 'A' };

  return { weapon, armor, accessory };
}
