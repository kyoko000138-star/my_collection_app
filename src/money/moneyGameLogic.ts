export function calcHP(...) { ... }
export function calcMP(...) { ... }
// ...



// 이번 달 지출 총합
function calcMonthlyExpense(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

// HP: 생활비 체력 (0~100)
function calcHP(monthlyBudget: MonthlyBudget | null, transactions: Transaction[]): number {
  if (!monthlyBudget || monthlyBudget.variableBudget <= 0) return 0;
  const used = calcMonthlyExpense(transactions);
  const remain = Math.max(monthlyBudget.variableBudget - used, 0);
  return Math.round((remain / monthlyBudget.variableBudget) * 100);
}

// MP: 무지출/퀘스트 포인트 (0~10 기준 예시)
function calcMP(monthlyBudget: MonthlyBudget | null, dayStatuses: DayStatus[]): number {
  if (!monthlyBudget || monthlyBudget.noSpendTarget <= 0) return 0;

  const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
  const questBonus = dayStatuses.reduce((sum, d) => sum + d.completedQuests, 0) * 0.5; // 퀘스트 2개 = +1pt

  const raw = (noSpendDays / monthlyBudget.noSpendTarget) * 10 + questBonus;
  return Math.min(10, Math.round(raw));
}

// DEF: 할부 방어도 (0~100)
function calcDEF(installments: Installment[]): number {
  const total = installments.reduce((sum, ins) => sum + ins.totalAmount, 0);
  if (total <= 0) return 0;
  const paid = installments.reduce((sum, ins) => sum + ins.paidAmount, 0);
  return Math.round((paid / total) * 100);
}

// Leaf 포인트 (누적 점수 느낌)
function calcLeafPoints(
  transactions: Transaction[],
  dayStatuses: DayStatus[],
  installments: Installment[],
): number {
  const txPoints = transactions.length * 1; // 기록 자체에 1점
  const noSpendSuccess = dayStatuses.filter(d => d.isNoSpend).length * 2;
  const questPoints = dayStatuses.reduce((sum, d) => sum + d.completedQuests, 0) * 1;
  const paidInstallments = installments.filter(ins => ins.paidAmount >= ins.totalAmount).length * 3;

  return txPoints + noSpendSuccess + questPoints + paidInstallments;
}

// Leaf 포인트 → 아이콘 수로 변환
function deriveCollection(leafPoints: number) {
  const incense = Math.floor(leafPoints / 30);
  const afterIncense = leafPoints % 30;
  const tea = Math.floor(afterIncense / 10);
  const afterTea = afterIncense % 10;
  const leaves = Math.floor(afterTea / 2); // 2점당 잎 1개

  return { leaves, tea, incense };
}
