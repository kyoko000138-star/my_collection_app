// src/money/moneyGameLogic.ts

// ----- 타입 정의 (충돌 방지를 위해 여기서 간단히 정의) -----
type AnyTransaction = any;
type AnyDayStatus = any;
type AnyInstallment = any;
type AnyMonthlyBudget = any;

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
