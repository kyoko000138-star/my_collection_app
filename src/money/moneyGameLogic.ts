// moneyGameLogic.ts
지금 구조도 훌륭하지만, **"내가 쓴 돈(행동)이 게임 캐릭터에게 직접적인 영향을 주는 느낌"**을 더 강하게 주면 몰입도가 확 올라갑니다.

단순히 수치만 변하는 게 아니라, **상태 이상(Debuff)**이 걸리거나 **직업(Class)**이 바뀌는 시스템을 추천해요.

이 3가지 요소를 추가하면 **"가계부 쓰는 맛"**이 완전히 달라질 겁니다.

🔥 RPG 요소 강화 아이디어 3대장
1. "상태 이상(Status Effect)" 시스템 🩸
지출 패턴에 따라 캐릭터에게 **버프(이로운 효과)**나 **디버프(해로운 효과)**가 걸리게 합니다.

폭식(배달비 과다): 🐷 [무거움] 상태 (회피율 감소 연출)

충동구매(쇼핑 과다): 💸 [출혈] 상태 (HP가 매일 조금씩 자동 감소)

무지출 3일 연속: 🛡️ [철벽] 상태 (다음번 지출 데미지 1회 방어)

2. "전직(Class Change)" 시스템 ⚔️
단순 레벨업 말고, 나의 소비 성향에 따라 직업이 바뀝니다.

식비 절약형: → [수도승] (밥을 굶어도 HP가 덜 깎임)

수입 증대형: → [상인] (돈을 잘 범)

밸런스형: → [성기사] (방어력이 높음)

3. "랜덤 인카운터(Random Encounter)" 🎲
가계부를 쓰려고 들어왔을 때, 가끔 깜짝 이벤트가 발생합니다.

"길가다 떨어진 동전을 주웠습니다! (+100원)"

"세일의 유혹이 덮쳐옵니다! (의지력 테스트 필요)"

🛠️ 바로 적용하기: "상태 이상 & 전직" 코드
기존 MoneyRoomPage.tsx의 캐릭터 카드 부분에 이 로직을 끼워 넣으면 됩니다.

1. 로직 추가 (moneyGameLogic.ts 혹은 페이지 상단)
TypeScript

// 상태 이상(Buff/Debuff) 계산 로직
export interface StatusEffect {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
}

export function calcStatusEffects(transactions: any[], dayStatuses: any[]): StatusEffect[] {
  const effects: StatusEffect[] = [];
  
  // 1. 최근 3일간 무지출이 있다? -> [철벽]
  const recentDays = dayStatuses.slice(-3);
  if (recentDays.some(d => d.isNoSpend)) {
    effects.push({ id: 'shield', name: '철벽 방어', icon: '🛡️', color: '#4caf50', desc: '지출 유혹을 1회 방어합니다.' });
  }

  // 2. 식비가 전체 지출의 50% 이상? -> [배부름] (이동 속도 저하 컨셉)
  const foodSpend = transactions.filter(t => t.category.includes('식비') || t.category.includes('배달')).reduce((acc, t) => acc + t.amount, 0);
  const totalSpend = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  
  if (totalSpend > 0 && (foodSpend / totalSpend) > 0.5) {
    effects.push({ id: 'full', name: '식곤증', icon: '😪', color: '#ff9800', desc: '배달 음식 과다로 몸이 무겁습니다.' });
  }

  // 3. 오늘 지출 건수가 3건 이상? -> [지출 출혈]
  const todayTxCount = transactions.filter(t => t.date === new Date().toISOString().slice(0, 10)).length;
  if (todayTxCount >= 3) {
    effects.push({ id: 'bleeding', name: '지갑 출혈', icon: '🩸', color: '#f44336', desc: '돈이 줄줄 새고 있습니다!' });
  }

  return effects;
}

// 직업(Class) 결정 로직
export function calcUserClass(transactions: any[]): string {
  const totalIncome = transactions.filter(t => t.type === 'income').length;
  const totalExpense = transactions.filter(t => t.type === 'expense').length;
  
  if (transactions.length === 0) return '모험가 지망생';
  if (totalIncome > totalExpense) return '대상인 (Merchant)'; // 수입이 더 많음
  if (transactions.every(t => t.amount < 10000)) return '짠돌이 수도승 (Monk)'; // 소액 지출 위주
  return '방랑 검사 (Fighter)'; // 일반
}


// 이번 달 지출 총합
export function calcMonthlyExpense(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

// HP: 생활비 체력 (0~100)
export function calcHP(monthlyBudget: MonthlyBudget | null, transactions: Transaction[]): number {
  if (!monthlyBudget || monthlyBudget.variableBudget <= 0) return 0;
  const used = calcMonthlyExpense(transactions);
  const remain = Math.max(monthlyBudget.variableBudget - used, 0);
  return Math.round((remain / monthlyBudget.variableBudget) * 100);
}

// MP: 무지출/퀘스트 포인트 (0~10 기준 예시)
export function calcMP(monthlyBudget: MonthlyBudget | null, dayStatuses: DayStatus[]): number {
  if (!monthlyBudget || monthlyBudget.noSpendTarget <= 0) return 0;

  const noSpendDays = dayStatuses.filter(d => d.isNoSpend).length;
  const questBonus = dayStatuses.reduce((sum, d) => sum + d.completedQuests, 0) * 0.5; // 퀘스트 2개 = +1pt

  const raw = (noSpendDays / monthlyBudget.noSpendTarget) * 10 + questBonus;
  return Math.min(10, Math.round(raw));
}

// DEF: 할부 방어도 (0~100)
export function calcDEF(installments: Installment[]): number {
  const total = installments.reduce((sum, ins) => sum + ins.totalAmount, 0);
  if (total <= 0) return 0;
  const paid = installments.reduce((sum, ins) => sum + ins.paidAmount, 0);
  return Math.round((paid / total) * 100);
}

// Leaf 포인트 (누적 점수 느낌)
export function calcLeafPoints(
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
export function deriveCollection(leafPoints: number) {
  const incense = Math.floor(leafPoints / 30);
  const afterIncense = leafPoints % 30;
  const tea = Math.floor(afterIncense / 10);
  const afterTea = afterIncense % 10;
  const leaves = Math.floor(afterTea / 2); // 2점당 잎 1개

  return { leaves, tea, incense };
}
