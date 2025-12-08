// src/waka/wakaCalendarData.ts
// @ts-ignore  // 타입 정의가 없는 라이브러리라 TS 경고 무시
import solarlunar from 'solarlunar';

export interface WakaEntry {
  id: string;
  date: {
    month: number;
    day: number;
    solarLabel: string;
    lunarLabel?: string;      // 이건 '음력 11월 중순 무렵' 같은 메타, UI에는 안 쓸 예정
    seasonalLabel?: string;   // 이것도 내부 분류용
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

// 지정한 월·일(양력)을 기준으로, 해당 연도의 실제 음력 날짜 라벨 생성
export function getDynamicLunarLabel(
  month: number,
  day: number,
  year: number = new Date().getFullYear()
): string | null {
  try {
    const info: any = (solarlunar as any).solar2lunar(year, month, day);
    if (!info) return null;

    const lMonth =
      info.lMonth ?? info.lunarMonth ?? info.month ?? null;
    const lDay =
      info.lDay ?? info.lunarDay ?? info.day ?? null;
    const isLeap =
      info.isLeap ?? info.isLeapMonth ?? false;

    if (!lMonth || !lDay) return null;

    const monthText = isLeap ? `윤${lMonth}월` : `${lMonth}월`;
    return `음력 ${monthText} ${lDay}일`;
  } catch {
    // 라이브러리 오류나 범위 밖이면 그냥 null 리턴
    return null;
  }
}


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

/**
 * 12월 1~10일 계절 흐름용 와카
 */
export const decemberFirstTen: WakaEntry[] = [
  {
    id: '1201',
    date: {
      month: 12,
      day: 1,
      solarLabel: '양력 12월 1일',
      lunarLabel: '음력 10월 하순 무렵',
      seasonalLabel: '겨울 초입 산촌의 고요',
    },
    tags: ['12월', '겨울', '산촌', '고독', '정적', '초겨울', '평온', 'calm'],
    content: {
      original: {
        right: '山里は\n冬ぞさびしさ\nまさりける',
        left: '人目も草も\nかれぬと思へば',
        hiragana:
          'やまざとは ふゆぞさびしさ まさりける\nひとめもくさも かれぬとおもへば',
      },
      info: {
        author: '源宗于朝臣 미나모토노 무네유키',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '山里というところはどの季節も寂しいが、冬にはその寂しさがいっそう増す。訪れる人の姿も絶え、草まで枯れてしまうからである。',
        korean:
          '산골 마을은 어느 계절이나 쓸쓸하지만,\n겨울이 되면 그 쓸쓸함이 더욱 깊어진다.\n찾아오는 이도 끊기고 풀마저 마르는 까닭이다.',
      },
      commentary:
        '산촌이라는 고립된 공간을 배경으로, 사람의 발길과 풀의 마름을 나란히 놓아 겨울이 인간과 자연의 움직임을 함께 멎게 하는 계절임을 드러낸다. 눈 그 자체보다 발길이 끊긴다는 인상과 메마른 들판을 통해 계절의 깊어짐을 보여 주는 구도다.',
    },
  },
  {
    id: '1202',
    date: {
      month: 12,
      day: 2,
      solarLabel: '양력 12월 2일',
      lunarLabel: '음력 10월 하순 무렵',
      seasonalLabel: '초겨울 저녁 한기',
    },
    tags: ['12월', '겨울', '저녁', '추위', '산', '예감', '섬세함', 'sensitive'],
    content: {
      original: {
        right: '夕されば\n衣手さむし\nみよしのの',
        left: '吉野の山に\nみ雪ふるらし',
        hiragana:
          'ゆうされば ころもでさむし みよしのの\nよしののやまに みゆきふるらし',
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '夕方になると袖のあたりまで冷え込んでくる。吉野の山では、いま雪が降っているのだろうと思われる。',
        korean:
          '저녁이 되니 옷소매까지 한기가 스며든다.\n저 아름다운 미요시노의 요시노 산에는\n지금쯤 눈이 내리고 있겠지.',
      },
      commentary:
        '저녁이 되어 옷소매에서 느껴지는 냉기를 단서로 눈 내리는 요시노 산을 떠올리는 구성이다. 몸에 와 닿는 감각과 멀리 보이지 않는 산의 설경을 연결해, 산간 지방에 스며든 초겨울의 추위를 섬세하게 포착한다.',
    },
  },
  {
    id: '1203',
    date: {
      month: 12,
      day: 3,
      solarLabel: '양력 12월 3일',
      lunarLabel: '음력 11월 초순 무렵',
      seasonalLabel: '산눈 소식과 옛 도읍의 추위',
    },
    tags: ['12월', '겨울', '눈', '옛도읍', '고향', '추위', '계절심화', 'reflection'],
    content: {
      original: {
        right: 'みよしのの\n山の白雪\nつもるらし',
        left: 'ふるさと寒く\nなりまさるなり',
        hiragana:
          'みよしのの やまのしらゆき つもるらし\nふるさとさむく なりまさるなり',
      },
      info: {
        author: '坂上是則 사카노우에노 코레노리',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '吉野の山には白い雪が積もっているらしい。そのせいか、古い都の里でも寒さがいよいよつのってきたと感じられる。',
        korean:
          '미요시노 산에는 흰 눈이 쌓였나 보다.\n그 때문인지 옛 도읍이던 이 고향도\n추위가 점점 더 깊어져 간다.',
      },
      commentary:
        '눈이 쌓인 요시노 산과 옛 도읍이라는 두 공간을 연결해, 먼 산의 설경이 도시에 사는 사람의 체감 온도까지 바꾸는 듯한 구조를 만든다. 시선을 멀리 두고도 삶의 터전에서 느껴지는 한기를 통해 넓은 지역을 감싸는 겨울의 도래를 표현한다.',
    },
  },
  {
    id: '1204',
    date: {
      month: 12,
      day: 4,
      solarLabel: '양력 12월 4일',
      lunarLabel: '음력 11월 초순 무렵',
      seasonalLabel: '첫눈 뒤 들뜬 겨울뜰',
    },
    tags: ['12월', '겨울', '첫눈', '집', '정원', '설렘', '일상', '소망'],
    content: {
      original: {
        right: '今よりは\nつぎて降らなむ\n我が宿の',
        left: 'すすきおしなみ\n降れる白雪',
        hiragana:
          'いまよりは つぎてふらなむ わがやどの\nすすきおしなみ ふれるしらゆき',
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '今この時から、このまま降り続いてほしい。わが家の庭で、すすきを押し伏せながら降り積もる白い雪よ。',
        korean:
          '지금부터는 이대로 계속 내려다오.\n우리 집 뜰의 억새를 눌러 쓰러뜨리며\n소복이 쌓이는 저 흰눈이여.',
      },
      commentary:
        '억새를 눌러 쓰러뜨리는 눈의 무게를 그대로 살리면서도, 그 광경을 바라보는 화자는 더 계속 내리기를 바라며 설경 자체에 마음을 기울인다. 날씨의 엄혹함보다 눈이 만들어 내는 흰 정원을 즐기는 시선이 강조되어 일상 공간 속 겨울의 도착을 밝게 그린다.',
    },
  },
  {
    id: '1205',
    date: {
      month: 12,
      day: 5,
      solarLabel: '양력 12월 5일',
      lunarLabel: '음력 11월 초순 무렵',
      seasonalLabel: '겨울나기와 눈꽃',
    },
    tags: ['12월', '겨울', '눈', '계절꽃', '실내', '포근함', '자연', 'winterFlower'],
    content: {
      original: {
        right: '冬ごもり\n思ひかけぬを\nこのまより',
        left: '花と見るまで\n雪ぞ降りける',
        hiragana:
          'ふゆごもり おもひかけぬを このまより\nはなとみるまで ゆきぞふりける',
      },
      info: {
        author: '紀貫之 키노 쓰라유키',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '冬ごもりの折には思いもよらなかったが、この木立のあいだから眺めると、花かと見まがうほどに雪が降り積もっている。',
        korean:
          '겨울을 나느라 틀어박혀 있는데\n뜻밖에도 나무 사이로 내다보이는 것이\n꽃인 듯 보일 만큼 눈이 내려 쌓였구나.',
      },
      commentary:
        '겨울나기라는 폐쇄된 시간과 눈꽃 이미지를 한 폭 안에 포개어, 움츠러든 계절과 눈의 밝기를 대비한다. 나무 사이로 보이는 눈을 꽃으로 읽어내며, 혹한기 안에서도 색채와 빛을 발견하는 시적 시선을 드러낸다.',
    },
  },
  {
    id: '1206',
    date: {
      month: 12,
      day: 6,
      solarLabel: '양력 12월 6일',
      lunarLabel: '음력 11월 중순 무렵',
      seasonalLabel: '눈꽃의 정원',
    },
    tags: ['12월', '겨울', '눈꽃', '계절꽃', '정원', '상상', '봄그림자'],
    content: {
      original: {
        right: '雪ふれば\n冬ごもりせる\n草も木も',
        left: '春に知られぬ\n花ぞ咲きける',
        hiragana:
          'ゆきふれば ふゆごもりせる くさもきも\nはるにしられぬ はなぞさきける',
      },
      info: {
        author: '紀貫之 키노 쓰라유키',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '雪が降ると、冬ごもりしている草も木も、春には見ることのない白い花を咲かせたかのように覆われていく。',
        korean:
          '눈이 내리니 겨울잠 든 풀도 나무도\n봄에는 볼 수 없는\n새하얀 꽃을 피운 듯 보인다.',
      },
      commentary:
        '눈이 내리자 잎사귀를 감추고 잠든 풀과 나무 위에만 흰 꽃이 피어난 듯 보인다는 설정이다. 계절꽃이 사라진 시기에도 겨울의 눈이 대신 꽃 역할을 한다는 관점에서, 계절 감각과 상상력이 결합된 설경을 보여 준다.',
    },
  },
  {
    id: '1207',
    date: {
      month: 12,
      day: 7,
      solarLabel: '양력 12월 7일',
      lunarLabel: '음력 11월 중순 무렵',
      seasonalLabel: '소설 지나 겨울 꽃눈',
    },
    tags: ['12월', '겨울', '눈', '꽃비유', '계절경계', '봄예감', '환상'],
    content: {
      original: {
        right: '冬ながら\n空より花の\n散りくるは',
        left: '雲のあなたは\n春にやあるらむ',
        hiragana:
          'ふゆながら そらよりはなの ちりくるは\nくものあなたは はるにやあるらむ',
      },
      info: {
        author: '清原深養父 기요하라노 후카야부',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '冬だというのに、空から花びらのようなものが散りこぼれてくる。雲の向こう側では、もう春になっているのだろうか。',
        korean:
          '겨울인데도 하늘에서 꽃잎 같은 것이\n흩날리며 떨어지는구나.\n구름 너머 저쪽은 어쩌면\n벌써 봄이 되어 있는 것일까.',
      },
      commentary:
        '겨울 하늘에서 흩날리는 눈을 꽃잎처럼 바라보고, 구름 너머는 이미 봄일지도 모른다고 상상하는 전개다. 시간상으로는 한겨울이지만, 눈을 매개로 계절의 경계를 넘나들며 먼 곳의 봄 기운을 더듬어 보는 구성이 특징이다.',
    },
  },
  {
    id: '1208',
    date: {
      month: 12,
      day: 8,
      solarLabel: '양력 12월 8일',
      lunarLabel: '음력 11월 중순 무렵',
      seasonalLabel: '녹는 눈과 산골 급류',
    },
    tags: ['12월', '겨울', '눈', '물소리', '논리적사유', '움직임', '생동감', 'energy'],
    content: {
      original: {
        right: '降る雪は\nかつぞ消ぬらし\nあしびきの',
        left: '山のたぎつ瀬\n音まさるなり',
        hiragana:
          'ふるゆきは かつぞけぬらし あしびきの\nやまのたぎつせ おとまさるなり',
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '降りしきる雪は、降るそばから消えていくのだろう。山中の急な瀬を流れる川の音が、いっそう高く響いてくるからである。',
        korean:
          '내리는 눈은\n떨어지는 자리에서 곧 사라지는 모양이다.\n산속 급한 여울을 흐르는 물소리가\n한층 더 거세게 들려오는 것을 보면.',
      },
      commentary:
        '내리는 눈과 산골 여울의 물소리를 함께 놓고, 눈이 떨어지자마자 녹아 급류를 불리고 있다는 추론을 이끌어 낸다. 하얀 눈의 정적과 물이 끓어오르는 듯한 역동성이 한 장면 안에서 교차하며 겨울 산중의 움직임을 또렷이 부각한다.',
    },
  },
  {
    id: '1209',
    date: {
      month: 12,
      day: 9,
      solarLabel: '양력 12월 9일',
      lunarLabel: '음력 11월 중순 무렵',
      seasonalLabel: '눈빛이 밝히는 새벽',
    },
    tags: ['12월', '겨울', '새벽', '눈', '달빛', '맑음', '경외', 'calm'],
    content: {
      original: {
        right: '朝ぼらけ\n有明の月と\n見るまでに',
        left: '吉野の里に\n降れる白雪',
        hiragana:
          'あさぼらけ ありあけのつきと みるまでに\nよしののさとに ふれるしらゆき',
      },
      info: {
        author: '坂上是則 사카노우에노 코레노리',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '空がほのかに明るくなり始める明け方、有明の月の光かと思うほどに、吉野の里には白い雪が降り積もっている。',
        korean:
          '새벽녘, 하늘이 희미하게 밝아올 즈음이면\n마치 새벽달 빛인 듯 환하게\n요시노 고을에 흰 눈이 내려 쌓이는구나.',
      },
      commentary:
        '새벽빛과 눈빛, 달빛이 뒤섞이는 순간을 포착한 노래다. 희미하게 밝아오는 하늘을 새벽달의 광채로 착각할 만큼, 고을에 내리는 눈이 주변을 환히 비춘다는 구성으로 요시노의 설경과 새벽 공기의 긴장을 함께 보여 준다.',
    },
  },
  {
    id: '1210',
    date: {
      month: 12,
      day: 10,
      solarLabel: '양력 12월 10일',
      lunarLabel: '음력 11월 하순 무렵',
      seasonalLabel: '맑은 겨울밤 얼어붙은 물',
    },
    tags: ['12월', '겨울밤', '달', '얼음', '맑은공기', '성찰', '차분함', 'calm'],
    content: {
      original: {
        right: '大空の\n月の光し\nきよければ',
        left: '影見し水ぞ\nまづこほりける',
        hiragana:
          'おおぞらの つきのひかりし きよければ\nかげみしみずぞ まずこおりける',
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese:
          '大空にかかる月の光があまりにも澄んでいるので、その影を映していた水が、何より先に凍りついてしまった。',
        korean:
          '넓은 하늘에 걸린 달빛이 너무도 맑아서\n그 모습을 비추고 있던 물이\n무엇보다 먼저 얼어붙고 말았다.',
      },
      commentary:
        '넓은 하늘에 떠 있는 달빛의 맑음과 그 빛을 받아 얼어붙는 물을 대응시켜, 겨울밤의 냉기와 투명함을 동시에 드러낸다. 풍경을 세밀하게 설명하기보다는 빛과 얼음의 관계를 통해 계절의 차가운 정서를 간결하게 표현한다.',
    },
  },
];
export const wakaCalendarData: WakaEntry[] = [...decemberFirstTen];

// ─────────────────────
// 오늘의 와카 / 추천 와카
// ─────────────────────

// (디버그용: 오늘 어떤 값이 잡히는지 확인하고 싶으면)
// console.log('[wakaCalendarData length]', wakaCalendarData.length);

export function getTodayWaka(today: Date = new Date()): WakaEntry {
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const found = wakaCalendarData.find(
    (w) => w.date.month === month && w.date.day === day,
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

// ─────────────────────
// 즐겨찾기
// ─────────────────────

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

// ─────────────────────
// 기분(태그) 기반 추천
// ─────────────────────

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
