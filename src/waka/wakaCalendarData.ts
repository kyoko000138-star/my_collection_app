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

// 12월 11~20일 계절 흐름용 와카 (古今和歌集 冬歌 320, 321, 322, 324, 326, 327, 328, 329, 338, 339)

export const decemberSecondTen: WakaEntry[] = [
  {
    id: '1211',
    date: {
      month: 12,
      day: 11,
      solarLabel: '양력 12월 11일',
      lunarLabel: '음력 11월 하순 무렵',
      seasonalLabel: '녹는 눈과 강물의 겨울소리',
    },
    tags: ['12월', '겨울', '눈녹은물', '강', '단풍', '계절이행', '생동감', 'energy'],
    content: {
      original: {
        right: 'この川に\nもみぢは流る\n奥山の',
        left: '雪げの水ぞ\n今まさるらし',
        hiragana:
          'このかわに もみじはながる おくやまの ゆきげのみずぞ いままさるらし',
      },
      info: {
        author: '고금와카집 겨울가 (작자 정보 미입력)',
        source: '古今和歌集 冬歌 320번',
      },
      translations: {
        modernJapanese:
          'この川にも奥山から流れてきた紅葉が浮かんでいる。山で降った雪どけの水が、前よりいっそう増しているのだろうと感じられる。',
        korean:
          '이 강으로도 깊은 산에서 흘러 내려온 단풍잎이 떠내려온다. 산에 내린 눈이 녹아 흘러온 물이 예전보다 한층 더 불어난 것 같구나.',
      },
      commentary:
        '눈이 내린 산속에서 녹아 흘러내리는 물과, 그 물에 실려 내려온 단풍잎을 함께 그린 노래다. 이미 가을은 지나갔지만 단풍과 눈 녹은 물이 한 강물 안에서 만나는 장면을 통해, 계절이 겹쳐지는 겨울 초입의 기운을 보여 준다.',
    },
  },
  {
    id: '1212',
    date: {
      month: 12,
      day: 12,
      solarLabel: '양력 12월 12일',
      lunarLabel: '음력 11월 하순 무렵',
      seasonalLabel: '눈 잦아들 틈 없는 산고향',
    },
    tags: ['12월', '겨울', '산촌', '눈', '고향', '끊임없는눈', '고요', 'calm'],
    content: {
      original: {
        right: 'ふるさとは\nよしのの山し\n近ければ',
        left: '一日もみ雪\n降らぬ日はなし',
        hiragana:
          'ふるさとは よしののやまし ちかければ ひとひもみゆき ふらぬひはなし',
      },
      info: {
        author: '고금와카집 겨울가 (작자 정보 미입력)',
        source: '古今和歌集 冬歌 321번',
      },
      translations: {
        modernJapanese:
          '私のふるさとは吉野の山に近いので、一日として深い雪が降らない日はないのだと感じられる。',
        korean:
          '내 고향은 요시노 산과 가까운 곳이라, 눈이 깊이 내리지 않는 날이 하루도 없다. 늘 눈 속에 잠긴 산고향의 겨울을 떠올린 노래다.',
      },
      commentary:
        '요시노라는 지명을 통해 실제 공간을 지적하면서, “하루도 눈이 내리지 않는 날이 없다”는 과장된 표현으로 산간 지방 겨울의 혹독함을 드러낸다. 고향의 풍경을 떠올리는 동시에, 늘 눈 속에 잠겨 있는 장소가 지닌 고요와 고립감을 함께 담았다.',
    },
  },
  {
    id: '1213',
    date: {
      month: 12,
      day: 13,
      solarLabel: '양력 12월 13일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '발길 끊긴 집의 고요',
    },
    tags: ['12월', '겨울', '집', '눈', '고독', '무인한집', '정적', 'solitude'],
    content: {
      original: {
        right: 'わが宿は\n雪降りしきて\n道もなし',
        left: '踏み分けて問ふ\n人しなければ',
        hiragana:
          'わがやどは ゆきふりしきて みちもなし ふみわけてとふ ひとしなければ',
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '古今和歌集 冬歌 322번',
      },
      translations: {
        modernJapanese:
          '私の家のあたりは雪が激しく降り続き、道らしい 길도 남지 않았다。발자국을 내며 찾아와 주는 사람조차 없으니, 쓸쓸함만이 쌓여 간다.',
        korean:
          '내 집 근처에는 눈이 쉼 없이 내려, 이제는 길이라고 할 만한 자취도 남지 않았다. 눈을 헤치며 찾아와 줄 이도 없으니, 고요함과 외로움만이 깊어갈 뿐이다.',
      },
      commentary:
        '눈이 쏟아져 “길도 없다”고 말하는 과장된 표현 속에, 실제로는 사람의 발길이 끊긴 외로움이 겹쳐 있다. 물리적으로도, 관계적으로도 닫혀 버린 겨울의 공간감을 짧은 구절 안에서 선명하게 보여 준다.',
    },
  },
  {
    id: '1214',
    date: {
      month: 12,
      day: 14,
      solarLabel: '양력 12월 14일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '눈꽃에 덮인 바위와 들판',
    },
    tags: ['12월', '겨울', '눈꽃', '들판', '바위', '상상력', '밝은설경', 'calm'],
    content: {
      original: {
        right: '白雪の\nところもわかず\n降りしけば',
        left: '岩ほにも咲く\n花とこそ見れ',
        hiragana:
          'しらゆきの ところもわかず ふりしけば いわほにもさく はなとこそみれ',
      },
      info: {
        author: '고금와카집 겨울가 (작자 정보 미입력)',
        source: '古今和歌集 冬歌 324번',
      },
      translations: {
        modernJapanese:
          '白い雪が地面の区別もつかないほど降り積もると、岩の上にまでも花が咲いたように見えてくる。',
        korean:
          '새하얀 눈이 땅의 경계조차 알 수 없을 만큼 내려 쌓이니, 바위 위에도 흰 꽃이 피어난 것처럼 보인다.',
      },
      commentary:
        '눈이 모든 색과 경계를 덮어 버리자, 거친 바위 위의 눈까지도 “꽃”으로 읽어내는 시선이 돋보인다. 실제 풍경을 바꾸기보다는, 바라보는 마음이 풍경을 다른 계절의 장면으로 바꾸어 버리는 겨울 특유의 상상력이 잘 드러난다.',
    },
  },
  {
    id: '1215',
    date: {
      month: 12,
      day: 15,
      solarLabel: '양력 12월 15일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '바닷가에 내려앉은 눈과 파도',
    },
    tags: ['12월', '겨울', '바다', '눈', '흰파도', '원경', '움직임', 'energy'],
    content: {
      original: {
        right: '浦ちかく\n降りくる雪は\n白波の',
        left: '末の松山\n越すかとぞ見る',
        hiragana:
          'うらちかく ふりくるゆきは しらなみの すえのまつやま こすかとぞみる',
      },
      info: {
        author: '고금와카집 겨울가 (작자 정보 미입력)',
        source: '古今和歌集 冬歌 326번',
      },
      translations: {
        modernJapanese:
          '海辺近くに降りしきる雪は、まるで白波が末の松山を越えていくのではないかと思われるほどである。',
        korean:
          '바닷가 가까이 내려오는 눈은, 마치 흰 파도가 말로 유명한 마쓰야마를 넘어가려는 듯 보인다.',
      },
      commentary:
        '눈발과 흰 파도를 겹쳐 보면서, “말로만 듣던 파도도 넘지 못한다”는 속담의 지명인 “末の松山”을 끌어들인다. 실제 풍경과 고사(故事)가 한 화면에서 겹쳐지며, 겨울 바닷가 특유의 역동성과 신비감이 함께 살아난다.',
    },
  },
  {
    id: '1216',
    date: {
      month: 12,
      day: 16,
      solarLabel: '양력 12월 16일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '설산 속 소식 끊긴 사람',
    },
    tags: ['12월', '겨울', '요시노', '눈길', '그리움', '부재', 'nostalgia', 'reflection'],
    content: {
      original: {
        right: 'み吉野の\n山の白雪\n踏みわけて',
        left: '入りにし人の\n音づれもせぬ',
        hiragana:
          'みよしのの やまのしらゆき ふみわけて いりにしひとの おとづれもせぬ',
      },
      info: {
        author: '고금와카집 겨울가 (작자 정보 미입력)',
        source: '古今和歌集 冬歌 327번',
      },
      translations: {
        modernJapanese:
          'み吉野の山の白雪を踏み分けて入って行ったあの人からは、その後なんのたよりも届かない。',
        korean:
          '미요시노 산의 흰 눈을 헤치고 들어가던 그 사람에게서, 그 뒤로는 아무런 소식도 들려오지 않는다.',
      },
      commentary:
        '“눈을 헤치고 들어갔다”는 표현은 실제 산행이자, 관계 속으로 깊이 들어간 과거의 순간을 상징하기도 한다. 설산 안으로 사라져 버린 사람의 행방과 함께, 기다리는 쪽의 불안과 그리움이 조용히 배어 있다.',
    },
  },
  {
    id: '1217',
    date: {
      month: 12,
      day: 17,
      solarLabel: '양력 12월 17일',
      lunarLabel: '음력 12월 중순 무렵',
      seasonalLabel: '눈 속에 묻힌 산마을의 생각들',
    },
    tags: ['12월', '겨울', '산촌', '폭설', '고립', '내면', '사색', 'reflection'],
    content: {
      original: {
        right: '白雪の\n降りてつもれる\n山里は',
        left: '住む人さへや\n思ひ消ゆらむ',
        hiragana:
          'しらゆきの ふりてつもれる やまざとは すむひとさえや おもいきゆらむ',
      },
      info: {
        author: '壬生忠岑 미부노 타다미네',
        source: '古今和歌集 冬歌 328번',
      },
      translations: {
        modernJapanese:
          '白い雪が降り積もった山里では、そこに住む人までもが、自分の思いさえ消えてしまいそうに感じているのではないだろうか。',
        korean:
          '새하얀 눈이 내려 산마을을 깊이 덮어 버리니, 그곳에 사는 사람들조차 자신의 마음이 사라져 버릴 것만 같다고 느끼고 있지 않을까.',
      },
      commentary:
        '눈에 둘러싸여 바깥과의 연결이 끊기면, 바깥세상뿐 아니라 스스로의 마음까지 희미해지는 듯한 감각이 찾아온다. “사람까지 사라질 것 같다”는 과장 속에, 설산 산촌이 가진 고립과 내면화의 풍경이 담겨 있다.',
    },
  },
  {
    id: '1218',
    date: {
      month: 12,
      day: 18,
      solarLabel: '양력 12월 18일',
      lunarLabel: '음력 12월 중순 무렵',
      seasonalLabel: '발자국마저 지워지는 눈길',
    },
    tags: ['12월', '겨울', '눈길', '무인한길', '쓸쓸함', '허무감', 'solitude'],
    content: {
      original: {
        right: '雪降りて\n人も通はぬ\n道なれや',
        left: '跡ばかもなく\n思ひ消ゆらむ',
        hiragana:
          'ゆきふりて ひともかよわぬ みちなれや あとはかもなく おもいきゆらむ',
      },
      info: {
        author: '고금와카집 겨울가 (작자 정보 미입력)',
        source: '古今和歌集 冬歌 329번',
      },
      translations: {
        modernJapanese:
          '雪が降って人も通わなくなった道なのだろうか。足跡さえあとかたもなく消えてしまうように、思いもまた消え入ってしまいそうだ。',
        korean:
          '눈이 내려 사람들도 더는 오가지 않는 길이 되어 버렸을까. 발자국마저 자취 없이 지워지듯, 마음속 생각들도 사라져 버릴 것만 같다.',
      },
      commentary:
        '눈길에서 “발자국이 지워진다”는 장면을, 마음속 생각이 사라지는 이미지와 포개어 놓았다. 외부 세계의 흔적이 지워질수록, 안쪽 세계도 함께 사라지는 듯한 겨울 특유의 허무와 고요가 드러난다.',
    },
  },
  {
    id: '1219',
    date: {
      month: 12,
      day: 19,
      solarLabel: '양력 12월 19일',
      lunarLabel: '음력 12월 중순 무렵',
      seasonalLabel: '연말, 다시 오지 않는 이들',
    },
    tags: ['12월', '겨울', '연말', '사람', '부재', '추억', 'nostalgia', 'reflection'],
    content: {
      original: {
        right: 'わかまたぬ\n年は来ぬれど\n冬草の',
        left: '枯れにし人は\n音づれもせず',
        hiragana:
          'わかまたぬ としはきぬれど ふゆくさの かれにしひとは おとづれもせず',
      },
      info: {
        author: '凡河内躬恒 오시코치노 미츠네',
        source: '古今和歌集 冬歌 338번',
      },
      translations: {
        modernJapanese:
          '自分のものでない新しい年がまたやって来たけれど、冬の草が枯れてしまったように、この世を去った人々からは何の便りもない。',
        korean:
          '나의 해가 아닌 새해가 또다시 돌아왔지만, 겨울 풀잎이 말라 버리듯 이 세상을 떠난 이들에게서는 아무런 소식도 올 리 없다.',
      },
      commentary:
        '“나의 해가 아닌 해”라는 표현은, 살아 있는 자의 시간과 이미 떠난 이들의 시간이 더 이상 맞닿지 않음을 말한다. 계절의 반복 속에서 돌아오지 않는 사람들을 떠올리며, 연말 특유의 쓸쓸한 정조를 겨울 풀의 마름에 비유한다.',
    },
  },
  {
    id: '1220',
    date: {
      month: 12,
      day: 20,
      solarLabel: '양력 12월 20일',
      lunarLabel: '음력 12월 중순 무렵',
      seasonalLabel: '해 저무는 해와 쌓여가는 눈',
    },
    tags: ['12월', '겨울', '연말', '눈', '세월', '노년감', '성찰', 'reflection'],
    content: {
      original: {
        right: 'あらたまの\n年のをはりに\nなることに',
        left: '雪もわが身も\n降り増さりつつ',
        hiragana:
          'あらたまの としのをはりに なることに ゆきもわがみも ふりまさりつつ',
      },
      info: {
        author: '在原元方 아리와라노 모토카타',
        source: '古今和歌集 冬歌 339번',
      },
      translations: {
        modernJapanese:
          '新しい年も終わりに近づくにつれて、雪もまた、わが身の年齢もともに降り積もり、重なっていくように思われる。',
        korean:
          '새해라 부르던 그 해가 저물어 갈수록, 내리는 눈도, 나 자신의 세월도 함께 더해져 쌓여 가는 듯하다.',
      },
      commentary:
        '눈이 “쌓여 가는” 모습과, 나이가 “더해지는” 감각을 한 동사로 겹쳐 표현한 노래다. 한 해의 끝자락에서 쌓여 가는 눈을 바라보며, 자신의 몸에도 시간이라는 눈이 내려앉고 있음을 조용히 자각하는 장면으로 읽을 수 있다.',
    },
  },
];
export const wakaCalendarData: WakaEntry[] = [...decemberSecondTen];


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
