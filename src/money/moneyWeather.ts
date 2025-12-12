// src/money/moneyWeather.ts
import { UserState } from './types';

export type MoneyWeatherId = 'SUNNY' | 'CLOUDY' | 'RAIN' | 'STORM' | 'RAINBOW' | 'SNOW';

export const getKSTDateString = (date = new Date()) => {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
};

export const getMoneyWeather = (state: UserState): MoneyWeatherId => {
  const max = state.maxBudget || 0;
  const hpRate = max > 0 ? state.currentBudget / max : 1;

  const hadSpend = !!state.counters?.hadSpendingToday;
  const pendingLen = state.pending?.length || 0;
  const noSpendStreak = state.counters?.noSpendStreak || 0;

  // ❄️ 완전 동결(기록 자체가 거의 없는 날) – 룰북의 “눈(동결)” 아이디어 응용 :contentReference[oaicite:2]{index=2}
  if (!hadSpend && pendingLen === 0) return 'SNOW';

  // 🌈 무지출 달성
  if (!hadSpend) return 'RAINBOW';

  // ⛈️ 예산 바닥/초과
  if (state.currentBudget < 0 || hpRate <= 0.05) return 'STORM';

  // ☔ 위기권
  if (hpRate <= 0.25) return 'RAIN';

  // ☁️ 애매권
  if (hpRate <= 0.5) return 'CLOUDY';

  return 'SUNNY';
};

export const getWeatherMeta = (w: MoneyWeatherId) => {
  switch (w) {
    case 'SUNNY': return { icon: '☀️', label: '맑음' };
    case 'CLOUDY': return { icon: '☁️', label: '흐림' };
    case 'RAIN': return { icon: '🌧️', label: '비' };
    case 'STORM': return { icon: '⛈️', label: '폭풍' };
    case 'RAINBOW': return { icon: '🌈', label: '무지개' };
    case 'SNOW': return { icon: '❄️', label: '동결' };
  }
};
