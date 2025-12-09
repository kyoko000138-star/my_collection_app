// src/money/moneyWeapons.ts

// 일단 타입 충돌 안 나게 전부 any로
type AnyTransaction = any;
type AnyDayStatus = any;
type AnyInstallment = any;

export interface ShardCounts {
  recordShard: number;     // 기록의 파편
  disciplineShard: number; // 절제의 파편 (무지출)
  repayShard: number;      // 상환의 파편 (할부 완납)
}

export interface WeaponBonus {
  hp?: number;
  mp?: number;
  def?: number;
}

export interface Weapon {
  id: string;
  name: string;
  description: string;
  cost: Partial<ShardCounts>;
  bonus: WeaponBonus;
}

// 👉 파편 계산 로직
export function calcShards(
  transactions: AnyTransaction[] = [],
  dayStatuses: AnyDayStatus[] = [],
  installments: AnyInstallment[] = [],
): ShardCounts {
  const recordShard = Math.floor(transactions.length / 5); // 기록 5건당 1조각

  const noSpendDays = dayStatuses.filter((d) => d?.isNoSpend).length;
  const disciplineShard = Math.floor(noSpendDays / 2); // 무지출 2일당 1조각

  const repayShard = installments.filter(
    (ins) => (ins?.paidAmount ?? 0) >= (ins?.totalAmount ?? 0) && (ins?.totalAmount ?? 0) > 0,
  ).length; // 완납 1건당 1조각

  return { recordShard, disciplineShard, repayShard };
}

// 👉 기본 장비 목록
export const WEAPONS: Weapon[] = [
  {
    id: 'ledger-blade',
    name: '잔잔한 장부검',
    description: '매일 장부를 펼치는 사람만 쥘 수 있는 검.',
    cost: { recordShard: 3, disciplineShard: 1 },
    bonus: { mp: 1 },
  },
  {
    id: 'tea-shield',
    name: '차향 방패',
    description: '충동을 한 번 가라앉혀 주는 방패.',
    cost: { disciplineShard: 3 },
    bonus: { hp: 10 },
  },
  {
    id: 'repay-ring',
    name: '상환의 반지',
    description: '갚아 나간 시간만큼 단단해지는 반지.',
    cost: { repayShard: 1 },
    bonus: { def: 5 },
  },
];

export function canCraft(weapon: Weapon, shards: ShardCounts): boolean {
  const cost = weapon.cost;
  if ((cost.recordShard ?? 0) > shards.recordShard) return false;
  if ((cost.disciplineShard ?? 0) > shards.disciplineShard) return false;
  if ((cost.repayShard ?? 0) > shards.repayShard) return false;
  return true;
}
