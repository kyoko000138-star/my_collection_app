// src/money/moneyQuests.ts

export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestType = 'noSpend' | 'tracking' | 'awareness' | 'installment' | 'saving';

export interface MoneyQuest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  type: QuestType;
}

// 👇 기본 퀘스트 풀 (원하면 나중에 더 추가해도 됨)
export const ALL_MONEY_QUESTS: MoneyQuest[] = [
  {
    id: 'no-delivery-today',
    title: '배달앱 열지 않기',
    description: '오늘 하루는 배달앱을 열지 않고 집에 있는 재료로 해결해 보기.',
    difficulty: 'easy',
    type: 'noSpend',
  },
  {
    id: 'log-3-transactions',
    title: '지출 3건 기록하기',
    description: '오늘 쓴 돈(또는 최근 며칠치)을 최소 3건 이상 머니룸에 기록해 보기.',
    difficulty: 'easy',
    type: 'tracking',
  },
  {
    id: 'check-installments',
    title: '할부 목록 점검하기',
    description: '이번 달 카드 명세서에서 할부 내역만 쭉 훑어보고, 곧 끝나는 할부에 표시해 두기.',
    difficulty: 'medium',
    type: 'installment',
  },
  {
    id: 'no-impulse-shopping',
    title: '충동구매 쉬어가기',
    description: '오늘은 장바구니에만 담고 결제는 내일로 미루기. 내일 봐도 사고 싶으면 그때 생각하기.',
    difficulty: 'medium',
    type: 'noSpend',
  },
  {
    id: 'write-money-memo',
    title: '한 줄 머니 회고',
    description: '오늘 돈을 쓴(또는 안 쓴) 이유를 한 줄로만 메모해 보기.',
    difficulty: 'easy',
    type: 'awareness',
  },
  {
    id: 'small-saving-pot',
    title: '작은 저금통 쌓기',
    description: '오늘 안 쓴 금액 1,000~3,000원 정도를 “이번 달 작은 저금통”으로 따로 적립해 두기.',
    difficulty: 'easy',
    type: 'saving',
  },
  {
    id: 'category-review',
    title: '지출 카테고리 한 번 보기',
    description: '최근 1주일 지출에서 가장 많이 쓴 카테고리 하나만 골라서, 다음 주에 1~2번만 줄일 아이디어 떠올려 보기.',
    difficulty: 'medium',
    type: 'awareness',
  },
];

// ── 같은 날짜에는 항상 같은 퀘스트가 나오도록 간단한 해시 사용 ──
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDailyMoneyQuests(date: Date, count = 2): MoneyQuest[] {
  const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const seed = hashString(key);
  const result: MoneyQuest[] = [];
  const used = new Set<number>();

  const max = Math.min(count, ALL_MONEY_QUESTS.length);
  let i = 0;

  while (result.length < max && i < ALL_MONEY_QUESTS.length * 2) {
    const idx = (seed + i * 7) % ALL_MONEY_QUESTS.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(ALL_MONEY_QUESTS[idx]);
    }
    i++;
  }

  return result;
}
