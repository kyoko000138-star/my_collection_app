// src/money/moneyHealthyLogic.ts
import { UserState } from './types';

const ensureGarden = (s: UserState) => {
  if (!s.garden) {
    (s as any).garden = { treeLevel: 0, weedCount: 0, flowerState: 'normal', decorations: [] };
  }
  if (!s.garden.decorations) s.garden.decorations = [];
};

const ensureInventory = (s: UserState) => {
  if (!s.inventory) (s as any).inventory = [];
};

// 1) 대출/할부 상환 → 잡초 제거
export const applyRepayment = (
  state: UserState,
  amount: number,
): { newState: UserState; msg: string } => {
  const next = JSON.parse(JSON.stringify(state)) as UserState;
  ensureGarden(next);

  const weedsRemoved = Math.max(1, Math.floor(amount / 100000));
  next.garden.weedCount = Math.max(0, next.garden.weedCount - weedsRemoved);

  return {
    newState: next,
    msg: `🧹 상환 기록! 가시덩굴 ${weedsRemoved}개를 걷어냈습니다.`,
  };
};

// 2) 저축 → 나무 성장 + 황금 비료(아이템)
export const applySavings = (
  state: UserState,
  amount: number,
): { newState: UserState; msg: string } => {
  const next = JSON.parse(JSON.stringify(state)) as UserState;
  ensureGarden(next);
  ensureInventory(next);

  next.garden.treeLevel = Math.min(5, next.garden.treeLevel + 1);
  next.garden.flowerState = 'blooming';

  const idx = next.inventory.findIndex((i: any) => i.id === 'gold_fertilizer');
  if (idx > -1) next.inventory[idx].count += 1;
  else
    next.inventory.push({
      id: 'gold_fertilizer',
      name: '황금 비료',
      type: 'consumable',
      count: 1,
    });

  return {
    newState: next,
    msg: '💰 저축 성공! 꿈의 나무가 자랐어요. (황금 비료 +1)',
  };
};

// 3) 멘탈 케어 트리거
export const checkMentalCare = (state: UserState): string | null => {
  const max = state.maxBudget || 0;
  const hpPercent = max > 0 ? (state.currentBudget / max) * 100 : 100;
  if (hpPercent < 10) return 'gardener_tea_time';
  return null;
};
