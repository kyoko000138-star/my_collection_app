// src/waka/wakaCalendarData.ts

export interface WakaEntry {
  id: string;
  date: {
    month: number;
    day: number;
    solarLabel: string;
    lunarLabel?: string;
    seasonalLabel?: string;
  };
  tags: string[];
  content: {
    original: {
      right: string;
      left: string;
      hiragana: string;
    };
    info: {
      author: string;
      source: string;
    };
    translations: {
      modernJapanese: string;
      korean: string;
    };
    commentary: string;
  };
}

// 일단 예시 1개만 넣어둔 버전
export const wakaCalendarData: WakaEntry[] = [
  {
    id: '0101-mountain-snow',
    date: {
      month: 1,
      day: 1,
      solarLabel: '양력 1월 1일',
      lunarLabel: '',
      seasonalLabel: '설경 · 깊은 산',
    },
    tags: [
      '1월',
      '깊은산',
      '눈',
      '소나무',
      '비단',
      '꽃',
      '기다림',
      '현실직시',
      'realityCheck',
    ],
    content: {
      original: {
        right: 'み山には 松の雪だに 消えなくに',
        left: '錦をるてふ 花見がてら',
        hiragana:
          'みやまには まつのゆきだに きえなくに にしきおるちょう はなみがてら',
      },
      info: {
        author: '紀貫之（키노 쓰라유키）',
        source: '古今和歌集',
      },
      translations: {
        modernJapanese:
          '奥深い山では、松に積もった雪さえまだ消えていないというのに、錦を織るというあの花見に出かけようとしているのですか。',
        korean:
          '깊은 산에는 소나무에 쌓인 눈조차 아직 녹지 않았는데, 비단을 짜 놓은 듯 곱다는 꽃을 보러 가려 하는가.',
      },
      commentary:
        '아직 준비되지 않은 상태(눈이 녹지 않음)에서 성급하게 봄을 찾으러 가는 마음을, 산속 풍경과 대비시켜 현실을 직시하게 만드는 노래.',
    },
  },
  {
    id: 'test-calm-01',
    date: {
      month: 1,
      day: 2,
      solarLabel: '양력 1월 2일 (테스트 calm)',
      lunarLabel: '',
      seasonalLabel: '테스트 · 차분',
    },
    tags: ['1월', '테스트', 'calm'], // 👈 calm 태그가 핵심
    content: {
      original: {
        right: 'テスト用 和歌 その一',
        left: 'ここには何を書いても大丈夫です',
        hiragana:
          'てすとよう わか そのいち ここには なにをかいても だいじょうぶです',
      },
      info: {
        author: '테스트 데이터',
        source: '개발용',
      },
      translations: {
        modernJapanese: 'これは開発用のテスト和歌です。',
        korean: '개발용 테스트 와카입니다. calm 태그가 붙어 있어요.',
      },
      commentary:
        '심리테스트 로직이 잘 작동하는지 확인하기 위한 더미 데이터입니다.',
    },
  },
];

export function getTodayWaka(today: Date = new Date()): WakaEntry {
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const found = wakaCalendarData.find(
    (w) => w.date.month === month && w.date.day === day
  );
  return found || wakaCalendarData[0];
}

export function getRecommendedWaka(): WakaEntry {
  if (wakaCalendarData.length === 0) {
    throw new Error('wakaCalendarData가 비어 있습니다.');
  }
  const index = Math.floor(Math.random() * wakaCalendarData.length);
  return wakaCalendarData[index];
}

const FAVORITE_STORAGE_KEY = 'wakaFavorites';

function loadFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAVORITE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id) => typeof id === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function isFavorite(id: string): boolean {
  const ids = loadFavoriteIds();
  return ids.includes(id);
}

export function toggleFavorite(id: string): boolean {
  const ids = loadFavoriteIds();
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  saveFavoriteIds(next);
  return !exists;
}

export function getFavoriteWakas(): WakaEntry[] {
  const favIds = loadFavoriteIds();
  return wakaCalendarData.filter((w) => favIds.includes(w.id));
}

// 기분에 맞는 와카 추천 (없으면 전체에서 랜덤)
export function getRecommendedWakaForMood(mood: string): WakaEntry {
  // mood 태그가 들어간 와카만 필터링
  const candidates = wakaCalendarData.filter((w) => w.tags.includes(mood));

  // 해당 mood 태그가 하나도 없으면, 전체 랜덤으로 fallback
  if (candidates.length === 0) {
    return getRecommendedWaka();
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}
