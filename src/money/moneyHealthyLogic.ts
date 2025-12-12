// src/money/moneyHealthyLogic.ts

import { UserState } from './types';

// 흑화 진정 공통 처리
const calmDarkness = (state: UserState, amount: number) => {
  if (!state.status) state.status = { mode: 'NORMAL', darkLevel: 0 };

  // 금액 클수록 더 진정(대충 스케일만 잡음: 10만원당 -5)
  const reduce = Math.max(5, Math.floor(amount / 100000) * 5);
  state.status.darkLevel = Math.max(0, (state.status.darkLevel || 0) - reduce);

  if (state.status.darkLevel === 0) {
    state.status.mode = 'NORMAL';
  }
};

// 1) 대출/할부 상환 → 잡초 제거 + 흑화 진정
export const applyRepayment = (
  state: UserState,
  amount: number,
): { newState: UserState; msg: string } => {
  const next = JSON.parse(JSON.stringify(state)) as UserState;

  if (!next.garden) {
    next.garden = { treeLevel: 0, pondLevel: 0, flowerState: 'normal', weedCount: 0 };
  }

  const weedsRemoved = Math.max(1, Math.floor(amount / 100000));
  next.garden.weedCount = Math.max(0, next.garden.weedCount - weedsRemoved);

  calmDarkness(next, amount);

  // 상환하면 꽃도 조금 회복
  if (next.status.mode === 'NORMAL' && next.garden.flowerState === 'withered') {
    next.garden.flowerState = 'normal';
  }

  return {
    newState: next,
    msg: `🧹 상환 완료! 가시덩굴 ${weedsRemoved}개를 걷어냈습니다.\n(흑화 진정: ${next.status.mode === 'DARK' ? '진정 중…' : '안정'})`,
  };
};

// 2) 저축 → 나무 성장 + 비료 지급 + 흑화 진정
export const applySavings = (
  state: UserState,
  amount: number,
): { newState: UserState; msg: string } => {
  const next = JSON.parse(JSON.stringify(state)) as UserState;

  if (!next.garden) {
    next.garden = { treeLevel: 0, pondLevel: 0, flowerState: 'normal', weedCount: 0 };
  }

  next.garden.treeLevel = Math.min(5, next.garden.treeLevel + 1);
  next.garden.flowerState = 'blooming';

  // 비료 아이템 지급
  const idx = next.inventory.findIndex((i) => i.id === 'gold_fertilizer');
  if (idx > -1) next.inventory[idx].count += 1;
  else {
    next.inventory.push({
      id: 'gold_fertilizer',
      name: '황금 비료',
      type: 'consumable',
      count: 1,
    });
  }

  calmDarkness(next, amount);

  return {
    newState: next,
    msg: `💰 저축 성공! 꿈의 나무가 자랐어요. (황금 비료 +1)\n(흑화 진정: ${next.status.mode === 'DARK' ? '진정 중…' : '안정'})`,
  };
};

// 3) 멘탈 케어 트리거
export const checkMentalCare = (state: UserState): string | null => {
  if (!state.maxBudget || state.maxBudget <= 0) return null;
  const hpPercent = (state.currentBudget / state.maxBudget) * 100;

  if (hpPercent < 10) return 'gardener_tea_time';
  return null;
};
