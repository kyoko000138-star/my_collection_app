// src/money/moneyMonsters.ts

export interface MoneyMonster {
  id: string;
  name: string;
  description: string;
  tip: string;
  maxHp: number;
  targetCategory: string | 'any';
}

// ⚠️ 트랜잭션은 any로 느슨하게 받자 (프로젝트 타입과 충돌 방지)
type AnyTransaction = any;

export const MONEY_MONSTERS: MoneyMonster[] = [
  {
    id: 'delivery-dragon',
    name: '배달 드래곤',
    description: '따뜻한 배달 음식의 향기를 몰고 오는 작은 드래곤.',
    tip: '이번 달에 배달/외식 없는 날을 조금만 늘려 보면, 배달 드래곤의 HP가 서서히 줄어듭니다.',
    maxHp: 10,
    targetCategory: '배달/외식',
  },
  {
    id: 'shopping-slime',
    name: '지름 슬라임',
    description: '새로운 물건의 반짝임을 보면 금세 부풀어 오르는 슬라임.',
    tip: '장바구니에만 담고 하루를 넘겨 보는 것만으로도 지름 슬라임은 조금씩 작아집니다.',
    maxHp: 8,
    targetCategory: '쇼핑',
  },
  {
    id: 'cafe-ghost',
    name: '카페 고스트',
    description: '언제든 “잠깐만” 들르게 만드는 카페의 유혹.',
    tip: '집에서 차를 한 번 내려 마시는 날이 늘어날수록, 카페 고스트는 서서히 희미해집니다.',
    maxHp: 7,
    targetCategory: '간식/카페',
  },
  {
    id: 'idle-slime',
    name: '잠든 텅장 슬라임',
    description: '아직 뚜렷한 패턴은 없지만, 깨어날 준비를 하고 있는 슬라임.',
    tip: '지금처럼만 차분히 기록을 남기면, 이 슬라임은 끝까지 잠든 채로 있을지도 몰라요.',
    maxHp: 5,
    targetCategory: 'any',
  },
];

// 비필수 지출 중 가장 많이 쓴 카테고리 찾기
export function getTopDiscretionaryCategory(
  transactions: AnyTransaction[],
): string | null {
  const spend = (transactions || []).filter(
    (t) => t?.type === 'expense' && !t?.isEssential,
  );
  if (!spend.length) return null;

  const byCat = new Map<string, number>();
  for (const t of spend) {
    const cat = (t.category as string) || '기타';
    byCat.set(cat, (byCat.get(cat) ?? 0) + (t.amount ?? 0));
  }

  const sorted = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}

// 카테고리에 맞는 몬스터 선택
export function pickMonsterForCategory(category: string | null): MoneyMonster {
  if (!category) {
    return MONEY_MONSTERS.find((m) => m.id === 'idle-slime')!;
  }

  // 카테고리 이름에 따라 간단 매칭
  if (category.includes('배달') || category.includes('외식')) {
    return MONEY_MONSTERS.find((m) => m.id === 'delivery-dragon')!;
  }
  if (category.includes('쇼핑') || category.includes('구매') || category.includes('물건')) {
    return MONEY_MONSTERS.find((m) => m.id === 'shopping-slime')!;
  }
  if (category.includes('카페') || category.includes('간식') || category.includes('음료')) {
    return MONEY_MONSTERS.find((m) => m.id === 'cafe-ghost')!;
  }

  // 못 찾으면 기본 슬라임
  return MONEY_MONSTERS.find((m) => m.id === 'idle-slime')!;
}

export interface MonsterHpInput {
  noSpendDays: number; // 이번 달 무지출 성공 일수
}

// HP 계산: 무지출 1일당 1 데미지
export function calcMonsterHp(
  monster: MoneyMonster,
  { noSpendDays }: MonsterHpInput,
): number {
  const damage = noSpendDays;
  return Math.max(0, monster.maxHp - damage);
}
