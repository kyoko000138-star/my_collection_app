// src/money/moneyGameLogic.ts


type AnyTransaction = any;
type AnyDayStatus = any;
type AnyInstallment = any;
type AnyMonthlyBudget = any;

// ----- 타입 정의 (충돌 방지를 위해 여기서 간단히 정의) -----
type AnyTransaction = any;
type AnyDayStatus = any;
type AnyInstallment = any;
type AnyMonthlyBudget = any;

// 1. 📊 RPG 스탯 계산기
export interface RPGStats {
  str: number; // 무지출 힘
  int: number; // 기록 지능
  dex: number; // 저축/파밍 민첩
  totalPower: number; // 전투력
}

export function calcRPGStats(
  transactions: AnyTransaction[],
  dayStatuses: AnyDayStatus[],
  savedAmount: number // 이번 달 저축액 (가상의 값 or 파밍으로 획득한 돈)
): RPGStats {
  // STR: 무지출 1일 = 10점
  const str = dayStatuses.filter(d => d.isNoSpend).length * 10;

  // INT: 기록 1건 = 5점
  const int = transactions.length * 5;

  // DEX: 저축 1,000원당 1점 (예시) + 파밍 횟수(나중에 추가 가능)
  const dex = Math.floor(savedAmount / 1000);

  return { 
    str, 
    int, 
    dex, 
    totalPower: str + int + dex 
  };
}

// 2. 🆙 경험치(XP) 시스템 강화
// 행동 하나하나가 전부 경험치가 됨
export function calcAdvancedXP(
  stats: RPGStats,
  installments: AnyInstallment[]
): { currentExp: number; level: number; maxExp: number } {
  
  // 기본 XP = 전투력(스탯 총합)
  let rawExp = stats.totalPower;

  // 보너스 XP: 할부 완납 1건당 100XP
  const clearedInstallments = installments.filter(i => i.paidAmount >= i.totalAmount).length;
  rawExp += (clearedInstallments * 100);

  // 레벨 계산 (누적 방식: 레벨 * 100이 필요 경험치라고 가정)
  // 예: Lv.1 -> 100xp 필요, Lv.2 -> 200xp 필요...
  // 간단하게 100 단위로 레벨 나눔
  const level = Math.floor(rawExp / 100) + 1;
  const currentExp = rawExp % 100;
  const maxExp = 100;

  return { currentExp, level, maxExp };
}

// 3. ⚔️ 장비 진화 로직 (스탯에 따라 장비가 바뀜!)
export function getEquippedItems(stats: RPGStats) {
  let weapon = { name: '녹슨 검', icon: '🗡️', grade: 'C' };
  let armor = { name: '천 옷', icon: '👕', grade: 'C' };
  let accessory = { name: '실 반지', icon: '💍', grade: 'C' };

  // STR(무지출)이 높으면 갑옷 업그레이드
  if (stats.str >= 30) armor = { name: '강철 갑옷', icon: '🛡️', grade: 'B' };
  if (stats.str >= 70) armor = { name: '용의 판금', icon: '🐉', grade: 'A' };

  // INT(기록)가 높으면 무기 업그레이드 (지능캐 컨셉)
  if (stats.int >= 30) weapon = { name: '마법 깃펜', icon: '✒️', grade: 'B' };
  if (stats.int >= 70) weapon = { name: '현자의 지팡이', icon: '🪄', grade: 'A' };

  // DEX(저축)가 높으면 악세서리 업그레이드
  if (stats.dex >= 30) accessory = { name: '금화 주머니', icon: '💰', grade: 'B' };
  if (stats.dex >= 70) accessory = { name: '다이아 목걸이', icon: '💎', grade: 'A' };

  return { weapon, armor, accessory };
}

// 1. 이번 달 지출 총합
export function calcMonthlyExpense(transactions: AnyTransaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

// 2. HP: 생활비 체력 (0~100)
export function calcHP(monthlyBudget: AnyMonthlyBudget | null, transactions: AnyTransaction[]): number {
  if (!monthlyBudget || monthlyBudget.variableBudget <= 0) return 0;
  const used = calcMonthlyExpense(transactions);
  const remain = Math.max(monthlyBudget.variableBudget - used, 0);
  return Math.round((remain / monthlyBudget.variableBudget) * 100);
}

// 3. MP: 무지출 포인트
export function calcMP(monthlyBudget: AnyMonthlyBudget | null, dayStatuses: AnyDayStatus[]): number {
  if (!monthlyBudget || monthlyBudget.noSpendTarget <= 0) return 0;

  const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
  const raw = (noSpendDays / monthlyBudget.noSpendTarget) * 10; 
  return Math.min(10, Math.round(raw));
}

// 4. DEF: 할부 방어도
export function calcDEF(installments: AnyInstallment[]): number {
  const total = installments.reduce((sum, ins) => sum + ins.totalAmount, 0);
  if (total <= 0) return 0;
  const paid = installments.reduce((sum, ins) => sum + ins.paidAmount, 0);
  return Math.round((paid / total) * 100);
}

// 5. Leaf 포인트 (누적 점수)
export function calcLeafPoints(
  transactions: AnyTransaction[],
  dayStatuses: AnyDayStatus[],
  installments: AnyInstallment[],
): number {
  const txPoints = transactions.length * 1; // 기록 1건당 1점
  const noSpendSuccess = dayStatuses.filter(d => d.isNoSpend).length * 2; // 무지출 1일당 2점
  const paidInstallments = installments.filter(ins => ins.paidAmount >= ins.totalAmount && ins.totalAmount > 0).length * 3; // 완납 1건당 3점

  return txPoints + noSpendSuccess + paidInstallments;
}

// 6. 아이콘 컬렉션 계산
export function deriveCollection(leafPoints: number) {
  const incense = Math.floor(leafPoints / 30);
  const afterIncense = leafPoints % 30;
  const tea = Math.floor(afterIncense / 10);
  const afterTea = afterIncense % 10;
  const leaves = Math.floor(afterTea / 2);

  return { leaves, tea, incense };
}

// 7. [RPG] 상태 이상(Status Effect) 계산 로직
export interface StatusEffect {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc?: string;
}

export function calcStatusEffects(transactions: AnyTransaction[], dayStatuses: AnyDayStatus[]): StatusEffect[] {
  const effects: StatusEffect[] = [];
  
  // (1) 철벽: 최근 3일간 무지출 성공 여부
  const recentDays = dayStatuses.slice(-3); // 배열 끝에서 3개
  if (recentDays.some(d => d.isNoSpend)) {
    effects.push({ id: 'shield', name: '철벽 방어', icon: '🛡️', color: '#4caf50', desc: '지출 유혹을 1회 방어합니다.' });
  }

  // (2) 식곤증: 식비/배달 비중이 50% 이상
  const expenseTx = transactions.filter(t => t.type === 'expense');
  const totalSpend = expenseTx.reduce((acc, t) => acc + t.amount, 0);
  
  const foodSpend = expenseTx
    .filter(t => t.category.includes('식비') || t.category.includes('배달') || t.category.includes('카페') || t.category.includes('간식'))
    .reduce((acc, t) => acc + t.amount, 0);
  
  if (totalSpend > 0 && (foodSpend / totalSpend) > 0.5) {
    effects.push({ id: 'full', name: '식곤증', icon: '😪', color: '#ff9800', desc: '배달 음식 과다로 몸이 무겁습니다.' });
  }

  // (3) 출혈: 최근 3건 연속 지출 (같은 날짜 등)
  if (transactions.length >= 3) {
     const last3 = transactions.slice(0, 3);
     // 간단히 최근 3건의 날짜가 같다면 출혈로 간주 (데모용)
     if (last3.length === 3 && last3[0].date === last3[2].date) {
        effects.push({ id: 'bleeding', name: '지갑 출혈', icon: '🩸', color: '#f44336', desc: '돈이 줄줄 새고 있습니다!' });
     }
  }

  return effects;
}

// 8. [RPG] 직업(Class) 결정 로직
export function calcUserClass(transactions: AnyTransaction[]): { name: string; icon: string } {
  const totalIncome = transactions.filter(t => t.type === 'income').length;
  const totalExpense = transactions.filter(t => t.type === 'expense').length;
  
  if (transactions.length === 0) return { name: '모험가 지망생', icon: '🌱' };
  
  // 수입 기록이 더 많으면 상인
  if (totalIncome > totalExpense) return { name: '대상인 (Merchant)', icon: '💰' };
  
  // 모든 지출이 10000원 이하면 수도승
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length > 0 && expenses.every(t => t.amount <= 10000)) {
      return { name: '절약의 수도승', icon: '🙏' };
  }
  
  // 기본
  return { name: '방랑 검사', icon: '⚔️' };
}
