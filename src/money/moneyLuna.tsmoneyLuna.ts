// src/money/moneyLuna.ts

export type LunaMode = 'normal' | 'pms' | 'rest';

export interface CycleSettings {
  // 마지막 생리 시작일 (사용자가 직접 입력)
  lastPeriodStart: string; // "YYYY-MM-DD"
  // 평균 주기 (대략값, 예: 33)
  cycleLength: number;
  // 오늘 컨디션에 따라 직접 강제 지정하고 싶을 때
  manualMode?: LunaMode | null;
}

export interface CycleStatus {
  mode: LunaMode;
  daysFromLast: number | null;
  daysToNext: number | null;
}

// 오늘 날짜 + 설정값으로 Luna 모드 계산
export function calcCycleStatus(
  today: Date,
  settings: CycleSettings,
): CycleStatus {
  const { lastPeriodStart, cycleLength, manualMode } = settings;

  // 사용자가 직접 모드를 골랐으면 그 값 우선
  if (manualMode) {
    return {
      mode: manualMode,
      daysFromLast: null,
      daysToNext: null,
    };
  }

  if (!lastPeriodStart || !cycleLength || cycleLength <= 0) {
    return {
      mode: 'normal',
      daysFromLast: null,
      daysToNext: null,
    };
  }

  const start = new Date(lastPeriodStart + 'T00:00:00');
  // 날짜 유효성 체크
  if (Number.isNaN(start.getTime())) {
    return {
      mode: 'normal',
      daysFromLast: null,
      daysToNext: null,
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor(
    (today.getTime() - start.getTime()) / msPerDay,
  );

  if (diffDays < 0) {
    // 미래 날짜로 잘못 적어둔 경우 → 그냥 normal
    return {
      mode: 'normal',
      daysFromLast: diffDays,
      daysToNext: null,
    };
  }

  const daysFromLast = diffDays;
  const daysToNext = Math.max(cycleLength - diffDays, 0);

  // ★ 아주 단순한 게임용 규칙 ★
  // 0~5일: 생리 기간 → rest
  // (cycleLength-7) ~ cycleLength일: 예정 1주 전 → pms
  // 그 외: normal
  let mode: LunaMode = 'normal';

  if (diffDays >= 0 && diffDays <= 5) {
    mode = 'rest';
  } else if (
    diffDays >= cycleLength - 7 &&
    diffDays <= cycleLength
  ) {
    mode = 'pms';
  }

  return { mode, daysFromLast, daysToNext };
}
