// src/money/moneyHealthyLogic.ts

import { UserState } from './types';

// garden이 없던 구버전 save가 로드되어도 안 터지게 안전보정
const ensureGarden = (s: UserState) => {
  if (!s.garden) {
    // @ts-expect-error: 구버전 세이브 대응
    s.garden = { treeLevel: 1, pondLevel: 1, flowerState: 'normal', weedCount: 0 };
  }
  return s;
};

// 1) 대출/할부 상환 → 잡초 제거
export const applyRepayment = (
  state: UserState,
  amount: number,
): { newState: UserState; msg: string } => {
  const nextState = JSON.parse(JSON.stringify(state)) as UserState;
  ensureGarden(nextState);

  const weedsRemoved = Math.max(1, Math.floor(amount / 100000));
  nextState.garden.weedCount = Math.max(0, nextState.garden.weedCount - weedsRemoved);

  return {
    newState: nextState,
    msg: `🧹 대출/할부 상환! 가시덩굴 ${weedsRemoved}개를 걷어냈습니다.`,
  };
};

// 2) 저축/이체 → 나무 성장 + 황금 비료 지급
export const applySavings = (
  state: UserState,
  amount: number,
): { newState: UserState; msg: string } => {
  const nextState = JSON.parse(JSON.stringify(state)) as UserState;
  ensureGarden(nextState);

  nextState.garden.treeLevel = Math.min(5, nextState.garden.treeLevel + 1);
  nextState.garden.flowerState = 'blooming';

  const idx = nextState.inventory.findIndex((i) => i.id === 'gold_fertilizer');
  if (idx > -1) nextState.inventory[idx].count += 1;
  else
    nextState.inventory.push({
      id: 'gold_fertilizer',
      name: '황금 비료',
      type: 'consumable',
      count: 1,
    });

  return {
    newState: nextState,
    msg: '💰 저축 성공! 꿈의 나무가 자랐어요. (황금 비료 +1)',
  };
};

// 3) 멘탈 케어 이벤트 트리거(옵션)
export const checkMentalCare = (state: UserState): string | null => {
  const max = state.maxBudget || 0;
  if (max <= 0) return null;

  const hpPercent = (state.currentBudget / max) * 100;
  if (hpPercent < 10) return 'gardener_tea_time';
  return null;
};
