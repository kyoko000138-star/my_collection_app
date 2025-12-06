// src/waka/wakaSoundSystem.ts
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

const soundMap: Record<Season, Record<TimeOfDay, string[]>> = {
  spring: {
    morning: ['spring_morning_01.mp3', 'spring_morning_02.mp3'],
    day:     ['spring_day_01.mp3',     'spring_day_02.mp3'],
    evening: ['spring_evening_01.mp3', 'spring_evening_02.mp3'],
    night:   ['spring_night_01.mp3',   'spring_night_02.mp3'],
  },
  summer: {
    morning: ['summer_morning_01.mp3', 'summer_morning_02.mp3'],
    day:     ['summer_day_01.mp3',     'summer_day_02.mp3'],
    evening: ['summer_evening_01.mp3', 'summer_evening_02.mp3'],
    night:   ['summer_night_01.mp3',   'summer_night_02.mp3'],
  },
  autumn: {
    morning: ['autumn_morning_01.mp3', 'autumn_morning_02.mp3'],
    day:     ['autumn_day_01.mp3',     'autumn_day_02.mp3'],
    evening: ['autumn_evening_01.mp3', 'autumn_evening_02.mp3'],
    night:   ['autumn_night_01.mp3',   'autumn_night_02.mp3'],
  },
  winter: {
    morning: ['winter_morning_01.mp3', 'winter_morning_02.mp3'],
    day:     ['winter_day_01.mp3',     'winter_day_02.mp3'],
    evening: ['winter_evening_01.mp3', 'winter_evening_02.mp3'],
    night:   ['winter_night_01.mp3',   'winter_night_02.mp3'],
  },
};

function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getAmbientSound(month: number): string {
  const season = getSeason(month);
  const timeOfDay = getTimeOfDay();
  const list = soundMap[season][timeOfDay];
  const idx = Math.floor(Math.random() * list.length);
  return `/sounds/${list[idx]}`;   // 👉 public/sounds 기준 절대경로
}
