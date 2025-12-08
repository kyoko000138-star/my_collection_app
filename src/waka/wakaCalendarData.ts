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

export const decemberThirdTen: WakaEntry[] = [
  {
    id: '1221',
    date: {
      month: 12,
      day: 21,
      solarLabel: '양력 12월 21일',
      lunarLabel: '음력 11월 하순 무렵',
      seasonalLabel: '눈 속에서 드러나는 늘푸른 빛'
    },
    tags: ['12월', '겨울', '눈', '소나무', '연말', 'calm', 'reflection'],
    content: {
      original: {
        right: '雪降りて\n年の暮れぬる\n時にこそ',
        left: 'つひにもみぢぬ\n松も見えけれ',
        hiragana:
          'ゆきふりて としのくれぬる ときにこそ ついにもみぢぬ まつもみえけれ'
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '古今和歌集 冬歌 고금와카집 겨울가'
      },
      translations: {
        modernJapanese:
          '雪が降って一年が暮れていくこの時になってこそ、ついに紅葉することのない松がはっきりと見えてくるのだと感じている。',
        korean:
          '눈이 내려 해가 저무는 이때가 되어서야\n끝내 물들지 않는 저 소나무가\n또렷이 드러나는구나 하고 느낀다는 노래다.'
      },
      commentary:
        '연말의 눈 내리는 풍경 속에서, 항상 푸른빛을 잃지 않는 소나무를 통해 변치 않는 것과 변해 가는 것의 대비를 드러낸다. 사계절이 지나고 마지막에야 비로소 알아보게 되는 상징물로서의 소나무를 응시하며, 덧없이 흘러간 한 해를 돌아보는 정서를 담고 있다. 눈과 송백을 함께 두어 겨울 끝의 맑고도 쓸쓸한 분위기를 만든다.'
    }
  },
  {
    id: '1222',
    date: {
      month: 12,
      day: 22,
      solarLabel: '양력 12월 22일',
      lunarLabel: '음력 11월 하순 무렵',
      seasonalLabel: '해 짧은 겨울날의 고요'
    },
    tags: ['12월', '겨울', '해넘이', '그늘', '연말', 'reflection', 'sensitive'],
    content: {
      original: {
        right: '行く年の\n惜しくもあるかな\nます鏡',
        left: '見る影さへに\nくれぬと思へば',
        hiragana:
          'ゆくとしの おしくもあるかな ますかがみ みるかげさえに くれぬとおもへば'
      },
      info: {
        author: '紀貫之 키노 쓰라유키',
        source: '古今和歌集 冬歌 고금와카집 겨울가'
      },
      translations: {
        modernJapanese:
          '過ぎ去っていく年がなんとも惜しく思われる。鏡に映る自分の姿さえも暮れてしまうのだと思うと、なおさらそう感じられるのである。',
        korean:
          '저물어 가는 해가 못내 아쉽기만 하다.\n거울에 비친 내 모습마저 스러져 가는 듯하다 생각하니\n세월이 저무는 느낌이 더욱 짙게 와닿는다.'
      },
      commentary:
        '해가 바뀌어 가는 문턱에서, 거울 속 자신의 모습을 바라보며 세월의 흐름을 절감하는 정경을 그린다. 단순한 연말의 아쉬움이 아니라, 나이 들어 가는 몸과 함께 빛도 서서히 기울어 간다는 감각이 겹쳐져 있다. 고요한 방 안, 어둑해지는 빛과 함께 마음도 저물어 가는 순간을 섬세하게 포착한 노래다.'
    }
  },
  {
    id: '1223',
    date: {
      month: 12,
      day: 23,
      solarLabel: '양력 12월 23일',
      lunarLabel: '음력 11월 하순 무렵',
      seasonalLabel: '눈 덮인 옛 집과 그리움'
    },
    tags: ['12월', '겨울', '눈', '고향', '집', 'wait', 'reflection'],
    content: {
      original: {
        right: 'ふるさとに\n雪降りつつと\n人はいへど',
        left: '我が宿ばかり\nさびしかりけり',
        hiragana:
          'ふるさとに ゆきふりつつと ひとはいえど わがやどばかり さびしかりけり'
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '後撰和歌集 冬歌 고센와카집 겨울가'
      },
      translations: {
        modernJapanese:
          '故郷には雪が降り続いているのだと人々は言うけれど、寂しく感じられるのはこの私の宿ばかりであるように思われる。',
        korean:
          '고향엔 눈이 소복이 내린다 말들 하지만\n정작 쓸쓸하게 느껴지는 것은\n이 몸이 홀로 있는 이 집뿐인 듯하다.'
      },
      commentary:
        '먼 곳의 눈 소식을 들으며, 실제 눈보다도 마음의 외로움을 더 선명하게 의식하는 화자의 심정을 드러낸다. 고향과 현재 머무는 집을 대비시키지만, 정작 눈이 내리고 있는지는 중요하지 않고, 자신이 있는 자리의 고독이 전면에 나온다. 연말에 주변이 분주해질수록, 홀로 남은 공간의 적막이 강조되는 감각과 잘 겹친다.'
    }
  },
  {
    id: '1224',
    date: {
      month: 12,
      day: 24,
      solarLabel: '양력 12월 24일',
      lunarLabel: '음력 11월 그믐 무렵',
      seasonalLabel: '긴 겨울밤 등불 아래의 고요'
    },
    tags: ['12월', '겨울밤', '등불', '고요', '고독', 'sensitive', 'calm'],
    content: {
      original: {
        right: 'さむしろに\n衣かたしき\nひとりかも',
        left: 'かく冬の夜の\nねをたてつらむ',
        hiragana:
          'さむしろに ころもかたしき ひとりかも かくふゆのよの ねをたてつらむ'
      },
      info: {
        author: '凡河内躬恒 오노노 고노미쓰네',
        source: '古今和歌集 冬歌 고금와카집 겨울가'
      },
      translations: {
        modernJapanese:
          '冷たいむしろの上に衣の片方だけを敷いて、私はひとりこうして冬の夜に寝息を立てているのだろうかと、さびしく思っている。',
        korean:
          '차가운 돗자리 위에 옷자락 한쪽만 깔고는\n이 겨울밤을 나 홀로 이렇듯\n숨소리만 내며 누워 있는가 하고 문득 느끼는 노래다.'
      },
      commentary:
        '난방이 충분치 않은 옛날의 겨울밤, 간신히 옷을 깔고 누운 몸의 감각을 통해 외로움을 드러낸다. 주변에 아무도 없는 조용한 방과 얇은 옷감의 차가움이 강조되며, 몸의 냉기가 곧 마음의 쓸쓸함으로 이어진다. 현대의 침실과는 다른 구체적인 생활감 덕분에, 먼 시대의 겨울밤이 생생하게 떠오르는 작품이다.'
    }
  },
  {
    id: '1225',
    date: {
      month: 12,
      day: 25,
      solarLabel: '양력 12월 25일',
      lunarLabel: '음력 11월 그믐 무렵',
      seasonalLabel: '눈 속에서 버티는 매화눈봉오리'
    },
    tags: ['12월', '겨울', '매화', '눈', '봄예감', 'wait', 'sensitive'],
    content: {
      original: {
        right: '雪のうちに\n春は来にけり\nうぐひすの',
        left: '鳴く音にとけて\n匂ふ白梅',
        hiragana:
          'ゆきのうちに はるはきにけり うぐいすの なくねにとけて におうしらうめ'
      },
      info: {
        author: '藤原敏行 아리와라노 도시유키',
        source: '古今和歌集 春歌 고금와카집 봄가'
      },
      translations: {
        modernJapanese:
          '雪の残るうちにもう春はやって来たのだろうか。鶯の鳴き声に溶け合うように、白梅の花が香り立っていると感じられる。',
        korean:
          '눈 속인데도 어느새 봄이 와 버린 것일까.\n울음소리에 녹아드는 듯한 매화 향기가\n흰 꽃잎 사이에서 은근히 번져 온다.'
      },
      commentary:
        '달력으로는 아직 겨울이지만, 눈 속에서 피어나는 매화와 날아든 새소리를 통해 봄 기운을 감지하는 노래다. 계절의 경계는 명확히 갈리지 않고, 남은 눈과 첫 꽃이 한 화면 안에 공존한다. 연말에서 새해로 넘어가는 감각과도 잘 겹쳐, 차가움과 따뜻함이 동시에 드러나는 시기감을 전한다.'
    }
  },
  {
    id: '1226',
    date: {
      month: 12,
      day: 26,
      solarLabel: '양력 12월 26일',
      lunarLabel: '음력 11월 그믐 무렵',
      seasonalLabel: '얼음 사이로 흐르는 강물'
    },
    tags: ['12월', '겨울', '강', '얼음', '물소리', 'energy', 'reflection'],
    content: {
      original: {
        right: '寒き夜の\n川の瀬ごとに\n結ぶらむ',
        left: '氷のうへを\n風ぞ吹きける',
        hiragana:
          'さむきよの かわのせごとに むすぶらむ こおりのうえを かぜぞふきける'
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '新古今和歌集 冬歌 신고금와카집 겨울가'
      },
      translations: {
        modernJapanese:
          '寒い夜には川の瀬ごとに氷が張っているのだろう。その氷の上を風が絶え間なく吹き過ぎていくように思われる。',
        korean:
          '차가운 겨울밤, 여울마다 얼음이 얼어붙어 있을 강 위로\n바람이 쉼 없이 스쳐 지나가는 듯하다 느끼는 노래다.'
      },
      commentary:
        '민물의 흐름을 직접 보여 주기보다는, 얼음 위를 스쳐 가는 바람을 통해 강가의 추위를 표현한다. 물소리와 바람 소리가 겹쳐지는 겨울 강의 풍경 속에서, 얼어붙은 것과 여전히 흐르는 것의 대비가 암시된다. 한 해의 끝자락에서 잠시 멈춘 듯한 시간감과, 계속 흐르는 강물의 상징성이 함께 드러난다.'
    }
  },
  {
    id: '1227',
    date: {
      month: 12,
      day: 27,
      solarLabel: '양력 12월 27일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '서리 내린 새벽과 희미한 달빛'
    },
    tags: ['12월', '겨울', '서리', '새벽', '달', 'calm', 'sensitive'],
    content: {
      original: {
        right: '霜のうちに\n月の光の\n澄むころは',
        left: '有明方の\n空ぞさびしき',
        hiragana:
          'しものうちに つきのひかりの すむころは ありあけがたの そらぞさびしき'
      },
      info: {
        author: '藤原定家 후지와라노 데이카',
        source: '新古今和歌集 冬歌 신고금와카집 겨울가'
      },
      translations: {
        modernJapanese:
          '霜の降りた地面の上に月の光が澄み渡るころになると、有明の頃の空はなんとも寂しく感じられるものだとしみじみ思われる。',
        korean:
          '서리 내린 땅 위로 달빛이 맑게 번지는 무렵이 되면\n새벽녘 하늘이란 이렇듯\n왠지 모를 쓸쓸함으로 가득 차 오는구나 하고 느끼게 된다.'
      },
      commentary:
        '달빛과 서리를 겹쳐 놓아 겨울 새벽 특유의 찬 기운과 투명함을 표현한다. 아직 완전히 밝지는 않은 하늘, 그러나 어둠도 끝나 가는 시각을 포착함으로써, 밤과 아침, 한 해의 끝과 시작이 겹쳐지는 듯한 순간을 전한다. 정서를 직접 말하기보다, 맑고 차가운 빛의 이미지를 통해 마음의 고요함과 쓸쓸함을 함께 불러일으킨다.'
    }
  },
  {
    id: '1228',
    date: {
      month: 12,
      day: 28,
      solarLabel: '양력 12월 28일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '눈길 위 여행자의 숨결'
    },
    tags: ['12월', '겨울', '눈길', '여행', '바람', 'energy', 'wait'],
    content: {
      original: {
        right: '雪の道を\n分けつつ行けば\n吹く風の',
        left: '跡だに消えて\n跡もとどめず',
        hiragana:
          'ゆきのみちを わけつつゆけば ふくかぜの あとだにきえて あともとどめず'
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '後拾遺和歌集 冬歌 고슈이와카집 겨울가'
      },
      translations: {
        modernJapanese:
          '雪道をかき分けて進んでいくと、吹きつける風のせいで自分の足跡さえすぐに消えてしまい、何ひとつ跡が残らないように思われる。',
        korean:
          '눈길을 헤치며 나아가지만\n불어오는 바람에 발자국마저 금세 지워져\n아무 흔적도 남지 않는구나 하고 느끼는 노래다.'
      },
      commentary:
        '눈과 바람으로 인해 사라지는 발자국을 통해, 인생의 자취가 곧잘 지워져 버리는 허무함을 은근히 드러낸다. 여행길의 구체적인 풍경이면서도, 지나간 한 해의 흔적이 눈 속에 묻혀 사라지는 느낌과 겹쳐 읽힌다. 움직임이 분명히 있으나 곧 사라지는 장면이라, late 12월의 덧없음을 잘 담는다.'
    }
  },
  {
    id: '1229',
    date: {
      month: 12,
      day: 29,
      solarLabel: '양력 12월 29일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '잔일을 마친 집안의 고즈넉함'
    },
    tags: ['12월', '겨울', '연말', '집', '등불', 'reflection', 'calm'],
    content: {
      original: {
        right: '年の内に\n春は来にけり\nひととせを',
        left: 'こぞと思へば\nあらたしき年',
        hiragana:
          'としのうちに はるはきにけり ひととせを こぞとおもえば あらたしきとし'
      },
      info: {
        author: '在原元方 아리와라노 모토카타',
        source: '古今和歌集 春歌 고금와카집 봄가'
      },
      translations: {
        modernJapanese:
          '年が改まる前だというのに、暦の上ではもう春がやって来てしまった。一年というものを去年だと思えば、すでに新しい年が始まっているようにも感じられる。',
        korean:
          '해가 다 가기도 전에 달력 위로는 벌써 봄이 와 버렸다.\n한 해를 이제 막 지나간 해라 여겨 보면\n이미 새로운 해가 시작된 듯한 기분이 든다는 노래다.'
      },
      commentary:
        '봄 노래로 분류된 작품이지만, 해를 넘기기 직전의 애매한 시기를 노래하고 있어 연말의 감각과도 잘 어울린다. 아직 지나지 않은 해를 벌써 작년이라 부르며, 시간 감각이 앞서 가는 모순을 통해 세월의 빠름을 드러낸다. 겨울의 끝과 새봄의 시작이 달력 위에서만 먼저 겹쳐지는 상황을 유머러스하면서도 쓸쓸하게 담았다.'
    }
  },
  {
    id: '1230',
    date: {
      month: 12,
      day: 30,
      solarLabel: '양력 12월 30일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '마지막 밤을 적시는 눈과 등불'
    },
    tags: ['12월', '겨울밤', '눈', '등불', '연말', 'reflection', 'sensitive'],
    content: {
      original: {
        right: '降る雪に\n灯の影さへ\n消えぬ間は',
        left: '年の残りを\n数へてぞ見る',
        hiragana:
          'ふるゆきに ひのかげさえ きえぬまは としののこりを かぞえてぞみる'
      },
      info: {
        author: 'よみ人しらず 이름 미상',
        source: '拾遺和歌集 雑歌 슈이와카집 잡가'
      },
      translations: {
        modernJapanese:
          '降りしきる雪のなかでも灯火の明かりがまだ消えないあいだは、その光のもとで残り少ない年の日数を数えて眺めているように思われる。',
        korean:
          '퍼붓듯 내리는 눈 속에서도 등불이 아직 꺼지지 않는 동안만큼은\n그 빛 아래에서 남은 날짜를 하나하나 세어 보게 되는\n연말 사람의 마음을 그린 노래다.'
      },
      commentary:
        '실내에서 등불을 바라보며 눈 오는 밤을 보내는 장면을 통해, 한 해의 끝에서 느끼는 세밀한 시간 의식을 표현한다. 눈과 불빛, 창문이라는 제한된 요소만으로도 충분한 공간감이 형성된다. 남은 날을 숫자로 세어 보는 행위는, 지나온 날들을 되짚어 보는 마음의 움직임과 겹치며 조용한 자기 성찰의 분위기를 만들어 낸다.'
    }
  },
  {
    id: '1231',
    date: {
      month: 12,
      day: 31,
      solarLabel: '양력 12월 31일',
      lunarLabel: '음력 12월 초순 무렵',
      seasonalLabel: '묵은 해와 새해가 맞닿는 새벽'
    },
    tags: ['12월', '겨울', '새벽', '연말', '새해', 'reflection', 'calm'],
    content: {
      original: {
        right: 'としのくれ\nくる年かさね\n思ふ間に',
        left: '夢にも見ゆる\n初日の光',
        hiragana:
          'としのくれ くるとしかさね おもうあいだに ゆめにもみゆる はつひののひかり'
      },
      info: {
        author: '源宗于朝臣 미나모토노 무네유키',
        source: '後撰和歌集 冬歌 고센와카집 겨울가'
      },
      translations: {
        modernJapanese:
          '暮れていく年とやって来る年のことを思いめぐらしているうちに、夢の中にまでも初日の光が差し込んでくるように感じられる。',
        korean:
          '저물어 가는 해와 다가오는 새해를 번갈아 떠올리다 보면\n꿈속에서조차 첫날 아침 해가 비쳐 오는 듯\n새로운 빛이 엷게 스며든다고 노래한다.'
      },
      commentary:
        '의식은 아직 묵은 해에 머물러 있지만, 마음은 이미 새해의 첫 햇살을 그려 보고 있는 상태를 포착한다. 현실과 꿈, 끝과 시작이 겹쳐지는 순간을 통해 시간의 경계가 느슨해지는 연말 특유의 감각을 표현한다. 새해의 빛을 직접적으로 찬양하기보다, 잠 속에서 미리 비치는 희미한 광채로 그려 냄으로써 조용하고 사적인 기대감을 드러낸다.'
    }
  }
];


 export const wakaCalendarData: WakaEntry[] = [
   ...decemberFirstTen,
   ...decemberSecondTen,
   ...decemberThirdTen,
   
 ];



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
