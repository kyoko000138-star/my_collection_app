// src/money/moneyLuna.ts
import { LunaMode } from './types';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * 날짜 차이 계산 (target - today)
 * 양수: target이 미래 (D-Day)
 * 0: 당일
 * 음수: target이 과거
 */
const getDayDiff = (todayStr: string, targetStr: string): number => {
  const today = new Date(todayStr).getTime();
  const target = new Date(targetStr).getTime();
  return Math.floor((target - today) / MILLISECONDS_PER_DAY);
};

/**
 * 현재 Luna Mode 판별
 * * Rules:
 * 1. PMS: 예정일 10일 전 ~ 예정일 전날 (D-10 ~ D-1)
 * 2. REST: 예정일 당일 ~ 4일 후 (총 5일간)
 * 3. NORMAL: 그 외 기간
 */
export const getLunaMode = (todayStr: string, nextPeriodDate: string): LunaMode => {
  const diff = getDayDiff(todayStr, nextPeriodDate);

  // REST: 생리 시작일(0) 부터 4일 뒤(-4)까지 -> 총 5일
  // diff가 0 이거나, 음수이면서 -4보다 크거나 같을 때 (즉, 0, -1, -2, -3, -4)
  if (diff <= 0 && diff >= -4) {
    return 'REST';
  }

  // PMS: 예정일 10일 전(10) 부터 1일 전(1)까지
  if (diff > 0 && diff <= 10) {
    return 'PMS';
  }

  return 'NORMAL';
};

/**
 * 모드에 따른 UI 테마 및 버프 정보 반환
 */
export const getLunaTheme = (mode: LunaMode) => {
  switch (mode) {
    case 'PMS':
      return {
        label: '🩸 PMS WARNING',
        color: '#ef4444', // Red
        bgColor: '#450a0a', // Dark Red Bg
        message: '충동구매 경보 발령. [회복 포션] 사용이 허가됩니다.',
        buff: 'None (난이도 상승)',
      };
    case 'REST':
      return {
        label: '🛌 REST PERIOD',
        color: '#a78bfa', // Purple
        bgColor: '#2e1065', // Dark Purple Bg
        message: '휴식 기간입니다. MP 회복량이 2배로 증가합니다.',
        buff: 'MP Recovery x2, Mental Dmg -50%',
      };
    default:
      return {
        label: '🟢 NORMAL MODE',
        color: '#10b981', // Green
        bgColor: '#111827', // Default Gray
        message: '평온한 상태입니다. 정화 루틴을 수행하세요.',
        buff: 'None',
      };
  }
};
