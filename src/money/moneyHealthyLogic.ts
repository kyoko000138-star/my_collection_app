// src/money/moneyHealthyLogic.ts

import { UserState } from './types';
import { ITEM_IDS } from './moneyGardenLogic';

// 1. 대출/할부 상환 → 잡초(가시덩굴) 제거
export const applyRepayment = (
  state: UserState,
  amount: number,
): { newState: UserState; msg: string } => {
  const nextState = JSON.parse(JSON.stringify(state)) as UserState;

  // 10만원당 잡초 1개 제거 (최소 1개)
  const weedsRemoved = Math.max(1, Math.floor(amount / 100000));
  nextState.garden.weedCount = Math.max(
    0,
    nextState.garden.weedCount - weedsRemoved,
  );

  return {
    newState: nextState,
    msg: `🧹 대출 상환! 가시덩굴 ${weedsRemoved}개를 걷어냈습니다. 정원이 숨을 쉽니다.`,
  };
};

// 2. 저축 → 꿈의 나무 성장 + 황금 비료
export const applySavings = (
  state: UserState,
  amount: number,
): { newState: UserState; msg: string } => {
  const nextState = JSON.parse(JSON.stringify(state)) as UserState;

  // 간단하게: 저축할 때마다 레벨 1씩 (나중에 금액 비례로 조정 가능)
  nextState.garden.treeLevel = Math.min(5, nextState.garden.treeLevel + 1);
  nextState.garden.flowerState = 'blooming';

  // 황금 비료 아이템 지급
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
    msg: '💰 저축 성공! 꿈의 나무가 조금 더 자랐어요. (황금 비료 +1)',
  };
};

// 3. 멘탈 케어 → 예산 거의 바닥이면 정원사 이벤트
export const checkMentalCare = (state: UserState): string | null => {
  const hpPercent = (state.currentBudget / state.maxBudget) * 100;

  if (hpPercent < 10) {
    return 'gardener_tea_time';
  }
  return null;
};
