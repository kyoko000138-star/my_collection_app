// moneyGameLogic.ts

export const applySpend = (
  state: UserState,
  amount: number,
  isFixedCost: boolean
): { newState: UserState; message: string } => {
  // 1. 먼저 수호자 패시브 판정 (state는 그대로 사용)
  const isGuarded = checkGuardianShield(state, amount);

  // 2. 예산 계산 (음수 허용/불허는 정책에 따라 조정 가능)
  const nextBudgetCurrent = state.budget.current - amount;

  // 공통으로 들어가는 예산 업데이트
  const baseState: UserState = {
    ...state,
    budget: {
      ...state.budget,
      current: nextBudgetCurrent,
    },
  };

  // 3. 수호자에게 방어된 경우
  if (isGuarded) {
    const guardedState: UserState = {
      ...baseState,
      // 수호자는 스트릭 유지, 다른 카운터 변화 없음
    };

    return {
      newState: guardedState,
      message: `🛡️ [수호자] ${amount.toLocaleString()}원 지출이 방어되었습니다. (스트릭 유지)`,
    };
  }

  // 4. 방어되지 않은 일반 피격
  const resetCounters = {
    ...state.counters,
    noSpendStreak: 0,
  };

  const canGainJunk =
    !isFixedCost &&
    amount >= GAME_CONSTANTS.JUNK_THRESHOLD &&
    state.counters.junkObtainedToday < GAME_CONSTANTS.DAILY_JUNK_LIMIT;

  if (canGainJunk) {
    const updatedState: UserState = {
      ...baseState,
      counters: {
        ...resetCounters,
        junkObtainedToday: state.counters.junkObtainedToday + 1,
      },
      inventory: {
        ...state.inventory,
        junk: state.inventory.junk + 1,
      },
    };

    return {
      newState: updatedState,
      message: `💥 피격(Hit) 발생. Junk 1개를 획득했습니다.`,
    };
  }

  // 5. 피격이지만 Junk는 안 생기는 경우
  const hitState: UserState = {
    ...baseState,
    counters: resetCounters,
  };

  return {
    newState: hitState,
    message: `💥 피격(Hit) 발생. 예산이 차감되었습니다.`,
  };
};
