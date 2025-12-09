// src/money/moneyGameLogic.ts

// 타입 정의 (임시) - 실제로는 인터페이스 파일에서 가져와도 됩니다.
type AnyTransaction = any;
type AnyDayStatus = any;
type AnyInstallment = any;
type AnyMonthlyBudget = any;

// ------------------------------------------------------------------
// 🛡️ [핵심 기능 1] Luna 실드 & 콤보 계산
// ------------------------------------------------------------------
export function calcNoSpendComboWithShield(
  dayStatuses: AnyDayStatus[] = [], // 👈 기본값 [] 추가 (오류 방지)
  lunaMode: 'normal' | 'pms' | 'rest' = 'normal',
): { combo: number; shieldUsed: boolean } {
  // 방어 코드: 데이터가 없으면 0 리턴
  if (!dayStatuses || dayStatuses.length === 0) return { combo: 0, shieldUsed: false };

  const shieldAvailable = lunaMode === 'pms' || lunaMode === 'rest';
  let shieldUsed = false;
  let combo = 0;

  // 최신 날짜부터 역순 탐색
  for (let i = dayStatuses.length - 1; i >= 0; i--) {
    const day = dayStatuses[i];
    if (!day) continue; 

    if (day.isNoSpend) {
      combo += 1;
    } else {
      // 실패한 날인데, 실드가 있고 아직 안 썼다면?
      if (shieldAvailable && !shieldUsed) {
        shieldUsed = true; // 실드 사용 처리
        continue; // 콤보는 안 오르지만, 끊기지 않고 넘어감 (다리 역할)
      } else {
        break; // 콤보 끊김
      }
    }
  }

  return { combo, shieldUsed };
}

// ------------------------------------------------------------------
// 📊 [핵심 기능 2] RPG 스탯 & 레벨
// ------------------------------------------------------------------
export interface RPGStats {
  str: number;
  int: number;
  dex: number;
  totalPower: number;
}

export function calcRPGStats(
  transactions: AnyTransaction[] = [], // 👈 기본값 []
  dayStatuses: AnyDayStatus[] = [],    // 👈 기본값 []
  savedAmount: number = 0
): RPGStats {
  const safeDays = dayStatuses || [];
  const safeTxs = transactions || [];

  // STR: 무지출 1일 = 10점
  const str = safeDays.filter(d => d.isNoSpend).length * 10;
  // INT: 기록 1건 = 5점
  const int = safeTxs.length * 5;
  // DEX: 저축액 기반
  const dex = Math.floor(savedAmount / 1000);

  return { str, int, dex, totalPower: str + int + dex };
}

export function calcAdvancedXP(
  stats: RPGStats | undefined, // undefined 들어올 수 있음
  installments: AnyInstallment[] = []
): { currentExp: number; level: number; maxExp: number } {
  // 방어 코드
  if (!stats) return { currentExp: 0, level: 1, maxExp: 100 };
  
  let rawExp = stats.totalPower;
  const safeInstalls = installments || [];

  // 보너스 XP: 할부 완납
  const clearedInstallments = safeInstalls.filter(i => i.paidAmount >= i.totalAmount).length;
  rawExp += (clearedInstallments * 100);

  const level = Math.floor(rawExp / 100) + 1;
  const currentExp = rawExp % 100;
  const maxExp = 100;

  return { currentExp, level, maxExp };
}

// ------------------------------------------------------------------
// ⚔️ [핵심 기능 3] 장비 진화
// ------------------------------------------------------------------
export function getEquippedItems(stats: RPGStats | undefined) {
  // 기본 장비
  let weapon = { name: '녹슨 검', icon: '🗡️', grade: 'C' };
  let armor = { name: '천 옷', icon: '👕', grade: 'C' };
  let accessory = { name: '실 반지', icon: '💍', grade: 'C' };

  if (!stats) return { weapon, armor, accessory };

  // STR -> 갑옷
  if (stats.str >= 30) armor = { name: '강철 갑옷', icon: '🛡️', grade: 'B' };
  if (stats.str >= 70) armor = { name: '용의 판금', icon: '🐉', grade: 'A' };

  // INT -> 무기
  if (stats.int >= 30) weapon = { name: '마법 깃펜', icon: '✒️', grade: 'B' };
  if (stats.int >= 70) weapon = { name: '현자의 지팡이', icon: '🪄', grade: 'A' };

  // DEX -> 악세서리
  if (stats.dex >= 30) accessory = { name: '금화 주머니', icon: '💰', grade: 'B' };
  if (stats.dex >= 70) accessory = { name: '다이아 목걸이', icon: '💎', grade: 'A' };

  return { weapon, armor, accessory };
}

// ------------------------------------------------------------------
// 💰 [기본 기능] HP / MP / DEF 계산 (안전장치 추가됨)
// ------------------------------------------------------------------

// 1. HP 계산 (PMS 회복 간식 로직 포함)
export function calcHP(monthlyBudget: AnyMonthlyBudget | null, transactions: AnyTransaction[] = []): number {
  if (!monthlyBudget || monthlyBudget.variableBudget <= 0) return 0;
  
  const safeTxs = transactions || [];

  // 지출 합계 (회복 간식은 데미지 제외!)
  const totalUsed = safeTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => {
      if (t.isRecoverySnack) return sum; // 회복 간식은 0원 처리
      return sum + t.amount;
    }, 0);

  const remain = Math.max(monthlyBudget.variableBudget - totalUsed, 0);
  return Math.round((remain / monthlyBudget.variableBudget) * 100);
}

// 2. MP 계산
export function calcMP(monthlyBudget: AnyMonthlyBudget | null, dayStatuses: AnyDayStatus[] = []): number {
  if (!monthlyBudget || monthlyBudget.noSpendTarget <= 0) return 0;
  const safeDays = dayStatuses || [];

  const noSpendDays = safeDays.filter(d => d.isNoSpend).length;
  const raw = (noSpendDays / monthlyBudget.noSpendTarget) * 10; 
  return Math.min(10, Math.round(raw));
}

// 3. DEF 계산
export function calcDEF(installments: AnyInstallment[] = []): number {
  const safeInstalls = installments || [];
  const total = safeInstalls.reduce((sum, ins) => sum + ins.totalAmount, 0);
  if (total <= 0) return 0;
  const paid = safeInstalls.reduce((sum, ins) => sum + ins.paidAmount, 0);
  return Math.round((paid / total) * 100);
}

// 4. Leaf 포인트 (컬렉션용)
export function calcLeafPoints(
  transactions: AnyTransaction[] = [],
  dayStatuses: AnyDayStatus[] = [],
  installments: AnyInstallment[] = [],
): number {
  const safeTxs = transactions || [];
  const safeDays = dayStatuses || [];
  const safeInstalls = installments || [];

  const txPoints = safeTxs.length * 1; 
  const noSpendSuccess = safeDays.filter(d => d.isNoSpend).length * 2; 
  const paidInstallments = safeInstalls.filter(ins => ins.paidAmount >= ins.totalAmount && ins.totalAmount > 0).length * 3;

  return txPoints + noSpendSuccess + paidInstallments;
}

// 5. 컬렉션 아이템 개수 변환
export function deriveCollection(leafPoints: number) {
  const incense = Math.floor(leafPoints / 30);
  const afterIncense = leafPoints % 30;
  const tea = Math.floor(afterIncense / 10);
  const afterTea = afterIncense % 10;
  const leaves = Math.floor(afterTea / 2);

  return { leaves, tea, incense };
}

// ------------------------------------------------------------------
// 🎭 [RPG] 상태 이상 & 직업 (안전장치 추가됨)
// ------------------------------------------------------------------
export interface StatusEffect {
  id: string; name: string; icon: string; color: string; desc?: string;
}

export function calcStatusEffects(
  transactions: AnyTransaction[] = [], 
  dayStatuses: AnyDayStatus[] = []
): StatusEffect[] {
  const effects: StatusEffect[] = [];
  const safeDays = dayStatuses || [];
  const safeTxs = transactions || [];
  
  // (1) 철벽: 최근 3일간 무지출 성공 여부
  const recentDays = safeDays.slice(-3);
  if (recentDays.some(d => d.isNoSpend)) {
    effects.push({ id: 'shield', name: '철벽 방어', icon: '🛡️', color: '#4caf50', desc: '지출 유혹을 1회 방어합니다.' });
  }

  // (2) 식곤증: 식비 50% 이상
  const expenseTx = safeTxs.filter(t => t.type === 'expense');
  const totalSpend = expenseTx.reduce((acc, t) => acc + t.amount, 0);
  const foodSpend = expenseTx
    .filter(t => t.category && (t.category.includes('식비') || t.category.includes('배달') || t.category.includes('카페')))
    .reduce((acc, t) => acc + t.amount, 0);
  
  if (totalSpend > 0 && (foodSpend / totalSpend) > 0.5) {
    effects.push({ id: 'full', name: '식곤증', icon: '😪', color: '#ff9800', desc: '배달 음식 과다로 몸이 무겁습니다.' });
  }

  // (3) 출혈: 최근 3건 연속 같은 날짜 지출
  if (safeTxs.length >= 3) {
     const last3 = safeTxs.slice(0, 3);
     if (last3.length === 3 && last3[0].date === last3[2].date) {
        effects.push({ id: 'bleeding', name: '지갑 출혈', icon: '🩸', color: '#f44336', desc: '돈이 줄줄 새고 있습니다!' });
     }
  }

  return effects;
}

export function calcUserClass(transactions: AnyTransaction[] = []): { name: string; icon: string } {
  const safeTxs = transactions || [];
  
  if (safeTxs.length === 0) return { name: '모험가 지망생', icon: '🌱' };

  const totalIncome = safeTxs.filter(t => t.type === 'income').length;
  const totalExpense = safeTxs.filter(t => t.type === 'expense').length;
  
  // 수입이 더 많으면 상인
  if (totalIncome > totalExpense) return { name: '대상인', icon: '💰' };
  
  // 소액 지출만 있으면 수도승
  const expenses = safeTxs.filter(t => t.type === 'expense');
  if (expenses.length > 0 && expenses.every(t => t.amount <= 10000)) {
       return { name: '절약의 수도승', icon: '🙏' };
  }
  
  return { name: '방랑 검사', icon: '⚔️' };
}
