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
    id: 'december-01',
    date: {
      month: 12,
      day: 1,
      solarLabel: '양력 12월 1일',
      lunarLabel: '음력 11월 초',
      seasonalLabel: '가을의 여신이 떠나고 겨울이 시작되는 날',
    },
    tags: ['12월', '겨울', '가을', '단풍', '비', 'sensitive', '절기'],
    content: {
      original: {
        right: '龍田姫\nたむける神の\nあればこそ',
        left: '秋の木の葉の\nぬさと散るらめ',
        hiragana: 'たつたひめ たむけるかみの あればこそ あきのこのはの ぬさとちるらめ',
      },
      info: {
        author: '兼覧王 카네미 오오키미',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese: '秋をつかさどる竜田姫が、手向けをする神冬の神がいらっしゃるからこそ、こうして秋の木の葉が幣ぬさのように散っているのだろう。',
        korean: '가을의 여신 다쓰타 히메가 제사를 올릴 겨울 신이 계시기에, 가을 낙엽이 이토록 제물처럼 흩날리는 것이리라.',
      },
      commentary: '가을에서 겨울로 넘어가는 계절의 교체를 신화적으로 해석한 와카다. 가을 여신이 다가오는 겨울 신에게 경의를 표하며 낙엽을 제물누사로 뿌린다는 상상이 아름답다. 12월의 시작과 함께 흩날리는 낙엽을 보며 계절의 엄숙한 인수인계를 느낄 수 있다.',
    },
  },
  {
    id: 'december-02',
    date: {
      month: 12,
      day: 2,
      solarLabel: '양력 12월 2일',
      lunarLabel: '음력 11월 초',
      seasonalLabel: '아직 붉은 잎 위로 차가운 겨울비가 내릴 때',
    },
    tags: ['12월', '겨울', '비', '단풍', '눈', 'wait', '시구레'],
    content: {
      original: {
        right: '雪降らで\nしぐれのみ降る\n今日なれば',
        left: 'まだ紅葉ばの\n散らざりけるか',
        hiragana: 'ゆきふらで しぐれのみふる きようなれば まだもみじばの ちらざりけるか',
      },
      info: {
        author: '紀貫之 키노 쓰라유키',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese: '雪が降らないで、冷たい時雨ばかりが降る今日であるのは、まだ紅葉が散らないで残っているからなのだろうか。',
        korean: '눈은 오지 않고 차가운 겨울비만 내리는 오늘인 것은, 아직 단풍잎이 다 지지 않고 남아있기 때문일까.',
      },
      commentary: '겨울 초입, 눈 대신 ‘시구레늦가을~초겨울의 한때 비’가 내리는 이유를 문학적으로 풀이했다. 눈은 흰색이라 붉은 단풍과 어울리지 않으니, 단풍이 다 질 때까지 하늘이 눈을 아끼고 비를 내린다는 시인의 섬세한 자연 관찰이 돋보인다.',
    },
  },
  {
    id: 'december-03',
    date: {
      month: 12,
      day: 3,
      solarLabel: '양력 12월 3일',
      lunarLabel: '음력 11월 초',
      seasonalLabel: '하얀 국화 위로 첫 서리가 내려앉은 아침',
    },
    tags: ['12월', '겨울', '서리', '국화', '아침', 'sensitive', '착각'],
    content: {
      original: {
        right: '心あてに\n折らばや折らむ\n初霜の',
        left: '置きまどはせる\n白菊の花',
        hiragana: 'こころあてに おらばやおらむ はつしもの おきまどはせる しらぎくのはな',
      },
      info: {
        author: '凡河内躬恒 오시코치노 미츠네',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese: 'あてずっぽうに折るなら折ってみようか。初霜が降りて、その白さと見分けがつかなくなっている白菊の花を。',
        korean: '마음 가는 대로 짐작하여 꺾으려면 꺾어볼까, 첫 서리가 내려 그 하얀 빛깔과 뒤섞여버린 흰 국화꽃을.',
      },
      commentary: '하얀 국화꽃 위에 하얀 서리가 내려앉아 무엇이 꽃이고 무엇이 서리인지 구별할 수 없는 몽환적인 아침 풍경이다. 눈으로 구별하기 힘든 순백의 세계를 손의 감각짐작에 의지해 꺾어보겠다는 표현에서 초겨울의 차갑고도 우아한 정취가 느껴진다.',
    },
  },
  {
    id: 'december-04',
    date: {
      month: 12,
      day: 4,
      solarLabel: '양력 12월 4일',
      lunarLabel: '음력 11월 초',
      seasonalLabel: '하늘에서 꽃잎처럼 흩날리는 눈송이',
    },
    tags: ['12월', '겨울', '눈', '하늘', '꽃', 'calm', '은유'],
    content: {
      original: {
        right: '冬ながら\n空より花の\n散りくるは',
        left: '雲のあなたは\n春にやあるらむ',
        hiragana: 'ふゆながら そらよりはなの ちりくるは くものあなたは はるにやあるらむ',
      },
      info: {
        author: '清原深養父 키요하라노 후카야부',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese: '今は冬であるのに、空から花びら雪が散ってくるのは、雲の向こう側は春であるからなのだろうか。',
        korean: '한겨울인데도 하늘에서 꽃잎이 흩날려 내려오는 것은, 저 구름 너머에는 이미 봄이 와 있기 때문인 것일까.',
      },
      commentary: '내리는 눈을 ‘꽃잎’에 비유한 고전적인 명시名詩다. 회색빛 겨울 하늘에서 떨어지는 눈을 보며, 구름 위 천상계는 이미 봄이라서 꽃이 넘쳐흐르는 게 아니냐는 낭만적인 상상력을 펼쳤다. 춥고 어두운 겨울 하늘을 화사하게 바꿔놓는 시선이다.',
    },
  },
  {
    id: 'december-05',
    date: {
      month: 12,
      day: 5,
      solarLabel: '양력 12월 5일',
      lunarLabel: '음력 11월 초',
      seasonalLabel: '강안개가 걷히며 드러나는 겨울 강의 풍경',
    },
    tags: ['12월', '겨울', '강', '안개', '아침', 'calm', '우지강'],
    content: {
      original: {
        right: '朝ぼらけ\n宇治の川霧\nたえだえに',
        left: 'あらはれわたる\n瀬々の網代木',
        hiragana: 'あさぼらけ うじのかわぎり たえだえに あらはれわたる せぜのあじろぎ',
      },
      info: {
        author: '権中納言定頼 곤주나곤 사다요리',
        source: '千載和歌集 冬歌 천재와카집 겨울가',
      },
      translations: {
        modernJapanese: '夜が明けようとするころ、宇治川の川霧がとぎれとぎれに晴れていくにつれて、川瀬に立てられた網代木が次々と現れてくることだ。',
        korean: '동틀 무렵, 우지강의 안개가 듬성듬성 걷혀감에 따라 여울마다 박아놓은 그물 말뚝들이 차례차례 드러나는구나.',
      },
      commentary: '겨울 아침, 자욱했던 강안개가 서서히 걷히며 물고기를 잡기 위해 설치한 말뚝아지로기들이 드러나는 과정을 한 폭의 수묵화처럼 묘사했다. 정적인 안개와 흐르는 강물, 인공물인 말뚝이 어우러져 고요하고 서정적인 겨울 강변의 아침을 보여준다.',
    },
  },
  {
    id: 'december-06',
    date: {
      month: 12,
      day: 6,
      solarLabel: '양력 12월 6일',
      lunarLabel: '음력 11월 중순',
      seasonalLabel: '먼 산봉우리에 하얗게 쌓인 눈을 바라봄',
    },
    tags: ['12월', '겨울', '눈', '산', '후지산', 'energy', '절경'],
    content: {
      original: {
        right: '田子の浦に\nうち出でてみれば\n白妙の',
        left: '富士の高嶺に\n雪は降りつつ',
        hiragana: 'たごのうらに うちいでてみれば しろたえの ふじのたかねに ゆきはふりつつ',
      },
      info: {
        author: '山部赤人 야마베노 아카히토',
        source: '新古今和歌集 冬歌 신고금와카집 겨울가',
      },
      translations: {
        modernJapanese: '田子の浦に出て広々とした先を眺めてみると、真っ白な布のような雪が、富士の高い峰に今もしきりに降り積もっている。',
        korean: '타고노우라 해변에 나가 탁 트인 곳을 바라보니, 새하얀 베처럼 후지산 높은 봉우리에 지금도 눈이 내리고 있구나.',
      },
      commentary: '일본의 겨울을 상징하는 가장 유명한 와카 중 하나다. 푸른 바다와 대조되는 후지산의 웅장한 설경을 ‘시로타에하얀 베’에 비유하며, 눈이 계속해서 내리고 있는 현재 진행형의 생동감을 포착했다. 겨울의 맑고 장엄한 아름다움이 느껴진다.',
    },
  },
  {
    id: 'december-07',
    date: {
      month: 12,
      day: 7,
      solarLabel: '양력 12월 7일',
      lunarLabel: '음력 11월 중순',
      seasonalLabel: '절기 대설, 흐르지 못하고 멈춰 선 겨울 강물',
    },
    tags: ['12월', '겨울', '강', '얼음', '정체', 'reflection', '대설'],
    content: {
      original: {
        right: '冬川の\n水ぎはなきて\nこほれるは',
        left: '波をせきとむ\nしがらみなりけり',
        hiragana: 'ふゆがわの みずぎわなきて こほれるは なみをせきとむ しがらみなりけり',
      },
      info: {
        author: '源宗于 미나모토노 무네유키',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese: '冬の川の水際がなくなって凍りついているのは、波をせき止める柵しがらみとなっているからなのだなあ。',
        korean: '겨울 강의 물가가 사라지고 꽁꽁 얼어붙은 것은, 그 얼음이 파도를 가로막는 울타리가 되었기 때문이로구나.',
      },
      commentary: '대설大雪 무렵, 강 가장자리부터 얼어붙어 물과 뭍의 경계가 사라진 풍경을 노래했다. 흐르던 물을 멈춰 세운 얼음을 ‘울타리시가라미’에 비유하며, 흐름을 정지시키는 겨울의 엄혹한 힘과 그로 인해 만들어진 정적의 미학을 탐구한다.',
    },
  },
  {
    id: 'december-08',
    date: {
      month: 12,
      day: 8,
      solarLabel: '양력 12월 8일',
      lunarLabel: '음력 11월 중순',
      seasonalLabel: '서리 맞은 마른 들판의 쓸쓸한 정취',
    },
    tags: ['12월', '겨울', '들판', '서리', '갈대', 'reflection', '고독'],
    content: {
      original: {
        right: '津の国の\n難波の春は\n夢なれや',
        left: '蘆の枯れ葉に\n風わたるなり',
        hiragana: 'つのくにの なにわのはるは ゆめなれや あしのかれはに かぜわたるなり',
      },
      info: {
        author: '西行法師 사이교 법사',
        source: '新古今和歌集 冬歌 신고금와카집 겨울가',
      },
      translations: {
        modernJapanese: '摂津の国、難波の春の華やかさは夢だったのだろうか。今はただ、蘆あしの枯れ葉に冬の風が吹き渡る音がするばかりだ。',
        korean: '셋츠 지방 나니와에서 보았던 봄날의 영화는 꿈이었던가, 지금은 그저 갈대 마른 잎 위로 겨울 바람이 스쳐 지나갈 뿐이네.',
      },
      commentary: '과거 봄날의 화려함과 현재 겨울 들판의 황량함을 대비시켜 무상감을 극대화한 노래다. 마른 갈대밭을 스치는 건조한 바람 소리만이 들리는 풍경에서, 화려한 계절 뒤에 찾아오는 겨울의 본질적인 고독과 허무를 응시한다.',
    },
  },
  {
    id: 'december-09',
    date: {
      month: 12,
      day: 9,
      solarLabel: '양력 12월 9일',
      lunarLabel: '음력 11월 중순',
      seasonalLabel: '얼어붙는 밤, 달빛마저 차갑게 느껴지는 시간',
    },
    tags: ['12월', '겨울', '밤', '달', '얼음', 'sensitive', '달빛'],
    content: {
      original: {
        right: 'ひとり寝る\n山鳥の尾の\nしだり尾に',
        left: '霜おきまよふ\n床の月かげ',
        hiragana: 'ひとりぬる やまどりのおの しだりおに しもおきまよふ とこのつきかげ',
      },
      info: {
        author: '藤原定家 후지와라노 테이카',
        source: '新古今和歌集 冬歌 신고금와카집 겨울가',
      },
      translations: {
        modernJapanese: '独り寝る私の夜具の上に、山鳥の長く垂れた尾のように長く夜が続く中、霜が降りたかと見紛うほどに冷たく月の光が差している。',
        korean: '홀로 잠든 이 긴 밤, 산새의 길게 늘어진 꼬리처럼 끝없는 시간에, 마치 서리가 내린 듯 차가운 달빛만이 잠자리를 비추네.',
      },
      commentary: '홀로 지새우는 겨울 밤의 길고 추운 느낌을 ‘산새의 긴 꼬리’와 ‘서리 같은 달빛’으로 표현했다. 방 안에 스며든 달빛이 너무나 희고 차가워, 실내임에도 마치 서리가 내린 것 같다는 감각적 착각을 통해 사무치는 한기를 전한다.',
    },
  },
  {
    id: 'december-10',
    date: {
      month: 12,
      day: 10,
      solarLabel: '양력 12월 10일',
      lunarLabel: '음력 11월 중순',
      seasonalLabel: '도시는 얕은 눈, 산속은 깊은 눈',
    },
    tags: ['12월', '겨울', '눈', '산', '도시', 'wait', '대비'],
    content: {
      original: {
        right: '都には\nまだふみもみず\nおもひきや',
        left: '吉田の山に\n雪つもるとは',
        hiragana: 'みやこには まだふみもみず おもひきや よしだのやまに ゆきつもるとは',
      },
      info: {
        author: '藤原興風 후지와라노 오키카제',
        source: '古今和歌集 冬歌 고금와카집 겨울가',
      },
      translations: {
        modernJapanese: '都ではまだ雪を踏んでみることもないのに、思いもしなかったことだ。近くの吉田山にもうこんなに雪が積もっていようとは。',
        korean: '도읍에서는 아직 눈을 밟아보지도 못했는데 생각이나 했겠는가, 바로 곁 요시다 산에는 벌써 이토록 눈이 쌓여 있을 줄이야.',
      },
      commentary: '사람들이 사는 도시와 자연 그대로의 산이 보여주는 겨울의 속도 차이를 노래했다. 평지에는 아직 겨울이 얕게 왔지만, 조금만 눈을 돌려 산을 보면 이미 깊은 겨울이 와 있음을 깨닫는 놀라움이 담겨 있다.',
    },
  },
];

export const decemberSecondTen: WakaEntry[] = [
  {
    id: 'december-11',
    date: {
      month: 12,
      day: 11,
      solarLabel: '양력 12월 11일',
      lunarLabel: '음력 11월 중순',
      seasonalLabel: '눈이 내려 나무마다 꽃처럼 피어나는 시기',
    },
    tags: ['12월', '겨울', '눈', '꽃', '매화', 'sensitive', '설경'],
    content: {
      original: {
        right: '雪ふれば\n木ごとの花ぞ\n咲きにける',
        left: 'いづれを梅と\nわきて折らまし',
        hiragana: 'ゆきふれば きごとのはなぞ さきにける いづれをうめと わきておらまし',
      },
      info: {
        author: '紀友則 (키노 토모노리)',
        source: '古今和歌集 冬歌 (고금와카집 겨울가)',
      },
      translations: {
        modernJapanese: '雪が降ったので、どの木にも白い花が咲いたようになっている。どれを本物の梅の花と区別して折ればよいのだろうか。',
        korean: '눈이 내리니 나무마다 꽃이 피었구나, 어느 것을 매화라 하여 구별해 꺾을 수 있으리오.',
      },
      commentary: '한겨울 눈이 소복이 쌓인 나무를 보며 마치 흰 매화꽃이 만발한 것 같다고 노래한 서정적인 작품이다. 삭막한 겨울 풍경 속에서 백설을 꽃으로 치환해 바라보는 시인의 미적 감각이 돋보이며, 차가운 공기 속에서도 화사한 봄의 이미지를 중첩시켜 겨울의 아름다움을 발견해낸다.',
    },
  },
  {
    id: 'december-12',
    date: {
      month: 12,
      day: 12,
      solarLabel: '양력 12월 12일',
      lunarLabel: '음력 11월 중순',
      seasonalLabel: '산골 마을에 깊어지는 겨울의 고독',
    },
    tags: ['12월', '겨울', '산촌', '고독', 'reflection', '산'],
    content: {
      original: {
        right: '山里は\n冬ぞさびしさ\nまさりける',
        left: '人目も草も\nかれぬと思へば',
        hiragana: 'やまざとは ふゆぞさびしさ まさりける ひとめもくさも かれぬとおもへば',
      },
      info: {
        author: '源宗于 (미나모토노 무네유키)',
        source: '古今和歌集 冬歌 (고금와카집 겨울가)',
      },
      translations: {
        modernJapanese: '山里は冬こそ寂しさがまさるものだ。人の訪れも途絶え、草も枯れてしまったと思うと。',
        korean: '산 속 마을은 겨울이 되니 외로움이 더해지는구나, 찾아오는 사람도 끊기고 풀마저 다 시들어버렸음을 생각하니.',
      },
      commentary: '겨울철 산골 마을의 적막함을 노래한 대표적인 와카다. ‘가레(かれ)’라는 발음을 통해 ‘풀이 마르다(枯れ)’와 ‘사람이 멀어지다(離れ)’는 중의적 의미를 담아냈다. 화려한 색채가 사라진 무채색의 풍경 속에서, 단절과 고립이 주는 쓸쓸함을 담담하게 응시하고 있다.',
    },
  },
  {
    id: 'december-13',
    date: {
      month: 12,
      day: 13,
      solarLabel: '양력 12월 13일',
      lunarLabel: '음력 11월 하순',
      seasonalLabel: '얼어붙은 연못 위로 맑게 비치는 달빛',
    },
    tags: ['12월', '겨울', '밤', '얼음', '달', 'calm', '연못'],
    content: {
      original: {
        right: '冬の夜の\n池の氷の\nさやけきは',
        left: '月の光の\n磨くなりけり',
        hiragana: 'ふゆのよの いけのこおりの さやけきは つきのひかりの みがくなりけり',
      },
      info: {
        author: '清原元輔 (키요하라노 모토스케)',
        source: '拾遺和歌集 冬歌 (습유와카집 겨울가)',
      },
      translations: {
        modernJapanese: '冬の夜の池の氷がこれほど清く澄んでいるのは、月の光が氷を磨いているからなのだなあ。',
        korean: '겨울 밤 연못의 얼음이 이토록 맑고 깨끗한 것은, 달빛이 내려와 갈고 닦았기 때문이로구나.',
      },
      commentary: '차가운 겨울 밤, 꽁꽁 언 연못의 표면이 거울처럼 맑게 빛나는 모습을 달빛의 작용으로 해석한 재치 있는 노래다. 차가운 얼음과 창백한 달빛이 만나 빚어내는 투명하고 정밀한 세계를 묘사하여, 추위 속에서도 느껴지는 청아한 아름다움을 전한다.',
    },
  },
  {
    id: 'december-14',
    date: {
      month: 12,
      day: 14,
      solarLabel: '양력 12월 14일',
      lunarLabel: '음력 11월 하순',
      seasonalLabel: '밤하늘의 서리와 깊어가는 겨울 밤',
    },
    tags: ['12월', '겨울', '밤', '서리', '별', 'calm', '은하수'],
    content: {
      original: {
        right: 'かささぎの\n渡せる橋に\nおく霜の',
        left: '白きを見れば\n夜ぞふけにける',
        hiragana: 'かささぎの わたせるはしに おくしもの しろきをみれば よぞふけにける',
      },
      info: {
        author: '大伴家持 (오토모노 야카모치)',
        source: '新古今和歌集 冬歌 (신고금와카집 겨울가)',
      },
      translations: {
        modernJapanese: '七夕の夜にかささぎが渡すという橋、その天の川に置いた霜のように白くさえわたる星の光を見ていると、夜もずいぶん更けたのだなあと感じる。',
        korean: '까치가 놓았다는 다리 위에 내려앉은 서리처럼, 하얗게 빛나는 밤하늘을 보니 밤이 이미 깊었음을 알겠구나.',
      },
      commentary: '궁궐의 계단 혹은 밤하늘의 은하수를 ‘까치가 놓은 다리’에 비유하며, 그 위에 내린 서리 같은 하얀 빛을 통해 깊은 밤의 정취를 노래했다. 맑고 차가운 겨울 공기 속에서 더욱 또렷하게 빛나는 별과 서리의 이미지가 어우러져 고요하고 신비로운 분위기를 자아낸다.',
    },
  },
  {
    id: 'december-15',
    date: {
      month: 12,
      day: 15,
      solarLabel: '양력 12월 15일',
      lunarLabel: '음력 11월 하순',
      seasonalLabel: '눈 내리는 산길을 떠나는 이에 대한 염려',
    },
    tags: ['12월', '겨울', '눈', '산', '이별', 'wait', '기원'],
    content: {
      original: {
        right: 'あしびきの\n山路越えむと\nする君を',
        left: '雪なふりそと\n思ひけるかな',
        hiragana: 'あしびきの やまぢこえむと するきみを ゆきなふりそと おもひけるかな',
      },
      info: {
        author: '紀貫之 (키노 쓰라유키)',
        source: '古今和歌集 離別歌 (고금와카집 이별가)',
      },
      translations: {
        modernJapanese: '険しい山道を越えていこうとするあなたのために、どうか雪よ降らないでくれと、心から思ったことですよ。',
        korean: '험한 산길을 넘어가려는 그대를 위해, 제발 눈이 내리지 말았으면 하고 간절히 바랐습니다.',
      },
      commentary: '겨울철 험난한 산을 넘어야 하는 사람을 배웅하며 부른 노래다. 본격적인 눈 시즌이 시작되는 시기에, 떠나는 이의 안전을 걱정하는 따뜻한 마음이 ‘눈이 오지 않기를’ 바라는 기원에 담겨 있다. 차가운 겨울 풍경과 대조되는 인간적인 온기가 느껴진다.',
    },
  },
  {
    id: 'december-16',
    date: {
      month: 12,
      day: 16,
      solarLabel: '양력 12월 16일',
      lunarLabel: '음력 11월 하순',
      seasonalLabel: '눈 덮인 저녁, 길 멈춘 여행자의 고독',
    },
    tags: ['12월', '겨울', '눈', '저녁', '바람', 'sensitive', '여정'],
    content: {
      original: {
        right: '駒とめて\n袖うちはらふ\nかげもなし',
        left: '佐野のわたりの\n雪の夕暮れ',
        hiragana: 'こまとめて そでうちはらふ かげもなし さののわたりの ゆきのゆうぐれ',
      },
      info: {
        author: '藤原定家 (후지와라노 테이카)',
        source: '新古今和歌集 冬歌 (신고금와카집 겨울가)',
      },
      translations: {
        modernJapanese: '馬を止めて、袖に降りかかった雪を払い落とすような物陰さえない。この佐野の渡し場の、雪が降りしきる夕暮れよ。',
        korean: '말을 멈추고 소매의 눈을 털어낼 나무 그늘 하나 없구나, 사노 나루터의 눈 내리는 저녁 무렵이여.',
      },
      commentary: '겨울 와카의 정점 중 하나로 꼽히는 명작이다. 쉴 곳 하나 없는 허허벌판 나루터에 눈이 쏟아지는 저녁, 압도적인 고독과 추위를 흑백의 회화처럼 묘사했다. 인간을 거부하는 듯한 혹독한 자연 속에서 느끼는 적막함과 유현(幽玄)한 아름다움이 극대화되어 있다.',
    },
  },
  {
    id: 'december-17',
    date: {
      month: 12,
      day: 17,
      solarLabel: '양력 12월 17일',
      lunarLabel: '음력 11월 하순',
      seasonalLabel: '새벽 달빛과 어우러진 하얀 눈',
    },
    tags: ['12월', '겨울', '새벽', '눈', '달', 'calm', '요시노'],
    content: {
      original: {
        right: '朝ぼらけ\n有明の月と\n見るまでに',
        left: '吉野の里に\nふれる白雪',
        hiragana: 'あさぼらけ ありあけのつきと みるまでに よしののさとに ふれるしらゆき',
      },
      info: {
        author: '坂上是則 (사카노우에노 코레노리)',
        source: '古今和歌集 冬歌 (고금와카집 겨울가)',
      },
      translations: {
        modernJapanese: '夜がほのぼのと明けるころ、空に残っている有明の月の光かと見間違えるほどに、吉野の里には白雪が降り積もっていることだ。',
        korean: '동틀 무렵, 하늘에 남은 새벽달인가 하고 착각할 정도로 요시노 마을에는 흰 눈이 하얗게 쌓여 있구나.',
      },
      commentary: '새벽녘의 희미한 빛 속에서 눈 쌓인 풍경을 달빛으로 착각할 만큼 환하고 아름답다고 노래했다. 눈의 명소인 요시노를 배경으로, 새벽의 푸르스름한 공기와 순백의 눈이 어우러진 청명하고 환상적인 순간을 포착하고 있다.',
    },
  },
  {
    id: 'december-18',
    date: {
      month: 12,
      day: 18,
      solarLabel: '양력 12월 18일',
      lunarLabel: '음력 11월 말',
      seasonalLabel: '강안개 속 물떼새 소리와 겨울 아침',
    },
    tags: ['12월', '겨울', '강', '안개', '새', 'sensitive', '아침'],
    content: {
      original: {
        right: '千鳥鳴く\n佐保の川霧\n立ちわたり',
        left: '幾夜へぬらむ\n雪のあけぼの',
        hiragana: 'ちどりなく さほのかわぎり たちわたり いくよへぬらむ ゆきのあけぼの',
      },
      info: {
        author: '藤原家隆 (후지와라노 이에타카)',
        source: '新古今和歌集 冬歌 (신고금와카집 겨울가)',
      },
      translations: {
        modernJapanese: '千鳥が鳴く佐保川に川霧が一面に立ちこめ、こうして雪の降る明け方を幾夜過ごしてきたことだろうか。',
        korean: '물떼새 우는 사호강에 물안개가 자욱하게 피어오르니, 눈 내리는 이 새벽을 벌써 몇 밤이나 지새웠던가.',
      },
      commentary: '강가에 피어오르는 차가운 물안개와 물떼새의 울음소리가 어우러진 겨울 아침의 정경이다. 시각적으로는 흐릿한 안개와 눈, 청각적으로는 새소리가 결합되어 겨울 특유의 몽환적이면서도 쓸쓸한 감각을 자아낸다.',
    },
  },
  {
    id: 'december-19',
    date: {
      month: 12,
      day: 19,
      solarLabel: '양력 12월 19일',
      lunarLabel: '음력 11월 말',
      seasonalLabel: '적막한 집에 찾아오는 매서운 겨울 바람',
    },
    tags: ['12월', '겨울', '바람', '집', '고독', 'reflection', '방문'],
    content: {
      original: {
        right: 'おのづから\nいふこともなき\nわが宿に',
        left: '木枯しの風ぞ\nとはに来りける',
        hiragana: 'おのづから いふこともなき わがやどに こがらしのかぜぞ とはにきたりける',
      },
      info: {
        author: '源経信 (미나모토노 츠네노부)',
        source: '千載和歌集 冬歌 (천재와카집 겨울가)',
      },
      translations: {
        modernJapanese: '自然と訪れる人もなく話すこともない私の家に、ただ木枯らしの風だけが訪ねて来たのだった。',
        korean: '저절로 말할 일도 없이 적막해진 나의 집에, 오직 매서운 초겨울 바람만이 안부를 물으러 찾아왔구나.',
      },
      commentary: '찾아오는 이 없는 은거 생활의 고요함을 노래했다. 유일한 방문객은 차가운 된바람(코가라시)뿐이라는 표현에서 역설적으로 자연과 하나 된 삶의 태도가 드러난다. 겨울의 심장부로 들어갈수록 깊어지는 내면의 침묵을 보여준다.',
    },
  },
  {
    id: 'december-20',
    date: {
      month: 12,
      day: 20,
      solarLabel: '양력 12월 20일',
      lunarLabel: '음력 11월 말',
      seasonalLabel: '동지를 앞두고 한 해를 돌아보는 마음',
    },
    tags: ['12월', '겨울', '연말', '세월', '한탄', 'reflection', '마무리'],
    content: {
      original: {
        right: '数ふれば\n年の残りも\nなかりけり',
        left: '老いぬるばかり\n悲しきはなし',
        hiragana: 'かぞふれば としののこりも なかりけり おいぬるばかり かなしきはなし',
      },
      info: {
        author: '古今和歌集 (읽는이 미상)',
        source: '古今和歌集 冬歌 (고금와카집 겨울가)',
      },
      translations: {
        modernJapanese: '指折り数えてみると、今年も残りがなくなってしまったなあ。年をとることほど悲しいことはないものだ。',
        korean: '손꼽아 세어보니 올해도 남은 날이 없구나, 나이 들어가는 것만큼 서글픈 일은 다시 없어라.',
      },
      commentary: '동지 무렵, 한 해가 끝나감을 실감하며 흐르는 시간에 대한 아쉬움을 솔직하게 토로한 노래다. 12월 중순을 지나 하순으로 넘어가는 시점에서 누구나 한 번쯤 느끼는 보편적인 무상감과, 가는 세월을 붙잡을 수 없는 인간의 안타까움이 담겨 있다.',
    },
  },
];

export const decemberThirdTen: WakaEntry[] = [
{
id: '12-21-yukifureba',
date: {
month: 12,
day: 21,
solarLabel: '양력 12월 21일',
lunarLabel: '음력 11월 하순, 동지 무렵',
seasonalLabel: '한겨울 첫눈이 산과 들을 덮는 시기',
},
tags: ['12월', '겨울', '눈', '겨울꽃', '산촌', 'calm', '숨은생명', '동지무렵'],
content: {
original: {
right: '雪降れば\n冬ごもりせる\n草も木も',
left: '春に知られぬ\n花ぞ咲きける',
hiragana: 'ゆきふれば ふゆごもりせる くさもきも はるにしられぬ はなぞさきける',
},
info: {
author: '紀貫之 키노 츠라유키',
source: '古今和歌集 冬歌 고금와카집 겨울가',
},
translations: {
modernJapanese:
'雪が降ると、冬ごもりをしていた草や木の上にも、春には誰にも気づかれないはずの白い花が一面に咲いたように見えてくる。',
korean:
'눈이 내리면 겨울 내내 웅크리고 있던 풀과 나무들 위에도, 봄이 와도 아무에게도 알려지지 않을 꽃이 피어난 것처럼 보인다.',
},
commentary:
'눈을 풀과 나무 위에 피어나는 숨은 꽃으로 본 시로, 가장 깊은 겨울 속에서도 봄의 기운을 읽어내는 시인의 시선을 보여 준다. 겉으로는 모두 마르고 멈춘 듯한 풍경이지만, 눈꽃을 통해 보이지 않는 생명과 시간이 조용히 움직이고 있음을 감지하게 한다. 동지 즈음의 어두운 계절에 은근한 희망과 설렘을 불어넣어 주며, 한 해의 끝과 다음 해의 시작이 맞닿아 있음을 느끼게 하는 노래다.',
},
},
{
id: '12-22-miyoshino-tsumoru',
date: {
month: 12,
day: 22,
solarLabel: '양력 12월 22일',
lunarLabel: '음력 11월 하순, 깊어가는 동짓달',
seasonalLabel: '깊은 산의 눈이 옛 도읍까지 냉기를 보내는 때',
},
tags: ['12월', '겨울', '눈', '요시노', '옛도읍', 'sensitive', '산풍경'],
content: {
original: {
right: 'み吉野の\n山の白雪\n積もるらし',
left: '故里寒く\n成りまさるなり',
hiragana: 'みよしのの やまのしらゆき つもるらし ふるさとさむく なりまさるなり',
},
info: {
author: '坂上是則 사카노에노 코레노리',
source: '古今和歌集 冬歌 고금와카집 겨울가',
},
translations: {
modernJapanese:
'み吉野の山には白い雪が深く積もっているらしく、そのせいか都のあるふるさともいよいよ寒さが募ってきたように感じられる。',
korean:
'미요시노 산에는 흰 눈이 잔뜩 쌓인 듯하여, 그 때문인지 내가 사는 옛 도읍도 한층 더 차갑게 얼어 오는 것만 같다.',
},
commentary:
'요시노 산의 설경을 직접 보지 않으면서도 공기의 차가움과 소문을 통해 상상해 내는 시다. 산의 흰 눈이 옛 도읍의 집집까지 냉기를 전해 오는 듯한 표현 속에서, 산골과 도성 사이를 오가는 겨울 기류가 느껴진다. 겨울이 깊어지며 도읍까지 얼려 오는 추위와, 해가 조금씩 다시 길어지기 시작하는 동짓달의 미묘한 공기를 함께 전해 준다.',
},
},
{
id: '12-23-urachikaku',
date: {
month: 12,
day: 23,
solarLabel: '양력 12월 23일',
lunarLabel: '음력 11월 하순 무렵',
seasonalLabel: '해안까지 눈과 바람이 몰려오는 겨울바다의 날',
},
tags: ['12월', '겨울', '눈', '바다', '파도', 'energy', '해안풍경'],
content: {
original: {
right: '浦近く\n降りくる雪は\n白波の',
left: '末の松山\n越すかとぞ見る',
hiragana: 'うらちかく ふりくるゆきは しらなみの すえのまつやま こすかとぞみる',
},
info: {
author: '藤原興風 후지와라노 오키카제',
source: '古今和歌集 冬歌 고금와카집 겨울가',
},
translations: {
modernJapanese:
'浦の近くに激しく降りしきる雪は、白波が末の松山の峰をも越えていくのではないかと思われるほどの勢いで見える。',
korean:
'포구 가까이에 세차게 내려오는 눈은, 흰 파도가 스에노마쓰야마의 산마루까지 넘어서려는 모습과도 같이 보인다.',
},
commentary:
'눈발과 흰 파도를 겹쳐 보는 비유를 통해 겨울 바다의 거친 움직임과 역동성을 강하게 전해 주는 시다. 산까지 넘을 듯한 눈과 파도의 이미지에서 계절의 힘, 날씨의 변화무쌍함이 생생하게 느껴진다. 정지된 설경이 아니라 끊임없이 출렁이는 풍경을 보여 주어, 연말의 분주함과 거센 겨울바람을 함께 떠올리게 한다.',
},
},
{
id: '12-24-miyoshino-fumiwakete',
date: {
month: 12,
day: 24,
solarLabel: '양력 12월 24일',
lunarLabel: '음력 11월 하순, 해가 가장 짧은 시기',
seasonalLabel: '사람 발길이 끊긴 산길과 깊은 눈의 고요',
},
tags: ['12월', '겨울', '눈', '산길', '요시노', 'wait', '산골', '고요'],
content: {
original: {
right: 'み吉野の\n山の白雪\n踏み分けて',
left: '入りにし人の\nおとづれもせぬ',
hiragana: 'みよしのの やまのしらゆき ふみわけて いりにしひとの おとづれもせぬ',
},
info: {
author: '壬生忠岑 미부노 다다미네',
source: '古今和歌集 冬歌 고금와카집 겨울가',
},
translations: {
modernJapanese:
'み吉野の山の白雪を踏み分けて山奥へ入っていったあの人からは、その後は何の便りもまったく届かない。',
korean:
'미요시노 산의 흰 눈을 헤치며 산속으로 들어가 버린 그 사람에게서, 그 뒤로는 아무 소식도 전혀 들려오지 않는다.',
},
commentary:
'눈 덮인 요시노 산속으로 들어가 버린 사람에게서 아무런 소식도 오지 않는다는 내용으로, 설경 속 고요와 기다림의 마음을 함께 담고 있다. 깊은 눈을 헤치고 들어간 산길은 실제 거리뿐 아니라 마음의 거리도 상징하며, 신호가 끊긴 겨울의 관계를 떠올리게 한다. 해가 가장 짧은 무렵의 길어진 밤과 잘 어울리는 노래로, 멈춰 버린 시간 속에서 소식을 기다리는 정서를 섬세하게 포착한다.',
},
},
{
id: '12-25-fuyunagara',
date: {
month: 12,
day: 25,
solarLabel: '양력 12월 25일',
lunarLabel: '음력 11월 그믐 무렵',
seasonalLabel: '눈 속에서도 어렴풋이 봄빛을 느끼는 겨울 하늘',
},
tags: ['12월', '겨울', '눈', '꽃', '구름', '봄기운', 'wait', '경계의계절'],
content: {
original: {
right: '冬ながら\n空より花の\n散りくるは',
left: '雲のあなたは\n春にやあるらむ',
hiragana: 'ふゆながら そらよりはなの ちりくるは くものあなたは はるにやあるらむ',
},
info: {
author: '清原深養父 키요하라노 후카야부',
source: '古今和歌集 冬歌 고금와카집 겨울가',
},
translations: {
modernJapanese:
'冬だというのに空から花びらが散るように雪が舞い落ちてくるのを見ると、雲の向こう側はもう春なのだろうかとふと思われる。',
korean:
'한겨울인데도 하늘에서 꽃잎이 흩날리듯 눈이 내려오는 것을 보고 있으면, 구름 너머 저쪽은 이미 봄이 되어 있는 것이 아닐까 하고 문득 생각하게 된다.',
},
commentary:
'겨울 눈을 꽃잎으로, 구름 너머를 아직 보이지 않는 봄으로 겹쳐 본 대표적인 계절 시다. 차갑고 무거운 눈조차도 하늘 어딘가에 이미 도착해 있을지 모를 봄의 기운을 전해 주는 매개로 바꾸어 놓는다. 한겨울과 봄기운이 겹쳐지는 전환기의 미묘한 공기를 담고 있어, 연말에 다가온 다음 해의 기척을 조용히 느끼게 해 준다.',
},
},
{
id: '12-26-yamazato-wa',
date: {
month: 12,
day: 26,
solarLabel: '양력 12월 26일',
lunarLabel: '음력 11월 그믐 무렵',
seasonalLabel: '긴 겨울밤, 사람 발길이 끊긴 산마을의 적막',
},
tags: ['12월', '겨울', '산촌', '고요', '풀', 'reflection', '외로움', '겨울밤'],
content: {
original: {
right: '山里は\n冬ぞさびしさ\nまさりける',
left: '人目も草も\nかれぬと思へば',
hiragana: 'やまざとは ふゆぞさびしさ まさりける ひとめもくさも かれぬとおもへば',
},
info: {
author: '源宗于朝臣 미나모토노 무네유키',
source: '古今和歌集 冬歌 고금와카집 겨울가',
},
translations: {
modernJapanese:
'山里はいつの季節も寂しいものだが、とりわけ冬にはその寂しさがいっそうつのる。訪れてくれる人影も絶え、草までが枯れてしまうように思われるからである。',
korean:
'산마을은 언제나 쓸쓸하지만 그 가운데서도 겨울이면 그 쓸쓸함이 더욱 커진다. 찾아오는 사람의 발길도 끊기고 풀들도 모두 시들어 버릴 것만 같기 때문이다.',
},
commentary:
'산골 겨울의 정경과 정서를 가장 전형적으로 보여 주는 노래 가운데 하나다. 사람의 발길도 끊기고 풀까지 모두 말라 버린 듯한 풍경은 외부 세계와의 연결이 거의 사라진 고립과 적막을 상징한다. 연말의 긴 밤과 차가운 공기 속에서, 혼자 남아 있는 듯한 감각과 고요한 내면의 시간을 떠올리게 하는 시다.',
},
},
{
id: '12-27-yuki-no-miya',
date: {
month: 12,
day: 27,
solarLabel: '양력 12월 27일',
lunarLabel: '음력 11월 그믐을 앞둔 시기',
seasonalLabel: '해마다 쌓인 눈과 세월이 함께 무게를 더하는 때',
},
tags: ['12월', '겨울', '눈', '산촌', '세월', 'reflection', '연말', '시간의층'],
content: {
original: {
right: '雪のみや\nふりぬと思ふ\n山里に',
left: 'われも多くの\n年ぞ積もれる',
hiragana: 'ゆきのみや ふりぬとおもふ やまざとに われもおおくの としぞつもれる',
},
info: {
author: '紀貫之 키노 츠라유키',
source: '新古今和歌集 冬歌 신고금와카집 겨울가',
},
translations: {
modernJapanese:
'雪ばかりが降り積もったと思うこの山里には、ふり返れば自分の歳月もまた多く積もってしまったのだと感じられる。',
korean:
'눈만이 소복이 내려 쌓였다고 여겨지는 이 산속 마을에서 돌아보면, 나 또한 여러 해를 겹겹이 쌓으며 살아 왔음을 느끼게 된다.',
},
commentary:
'궁궐 쪽에서 흘러온 듯한 눈이 산마을에 소복이 쌓이는 모습과 그 속에서 쌓여 온 자기 나이를 겹쳐 보는 시다. 눈의 층과 세월의 층을 포개어 한 해 한 해가 쌓여 어느새 무게를 더해 버린 시간을 실감하게 한다. 연말로 향하는 며칠 동안 조용히 지나온 해들을 되짚어 보는 마음에 잘 어울리는 노래다.',
},
},
{
id: '12-28-aratama-no-toshi',
date: {
month: 12,
day: 28,
solarLabel: '양력 12월 28일',
lunarLabel: '음력 11월 그믐 즈음',
seasonalLabel: '연말 눈발 사이로 한 해의 무게를 돌아보는 날',
},
tags: ['12월', '겨울', '눈', '연말', '나이듦', 'reflection', '한해마무리'],
content: {
original: {
right: '新玉の\n年の終はりに\nなるごとに',
left: '雪も我が身も\nふりまさりつつ',
hiragana: 'あらたまの としのおはりに なるごとに ゆきもわがみも ふりまさりつつ',
},
info: {
author: '在原元方 아리와라노 모토카타',
source: '古今和歌集 冬歌 고금와카집 겨울가',
},
translations: {
modernJapanese:
'新しい年の終わりになるたびに、降りしきる雪の量も、自分の身の古びていくさまも、どちらもひときわ増していくように思われる。',
korean:
'새해라고 부르던 한 해의 끝자락이 올 때마다 더욱 세차게 내려 쌓이는 눈과 함께, 나 자신의 늙어감도 한층 더해져 가는 것처럼 느껴진다.',
},
commentary:
'해마다 찾아오는 새해조차 끝을 향해 갈 때는 눈도 나이도 함께 불어난다고 말하는 시로, 세월의 변화와 신체적 노화를 동시에 의식하고 있다. 맑은 설경 속에서도 한 해의 끝이 가져오는 쓸쓸함과 체념이 은근히 배어 있다. 매년 같은 순환이 반복된다는 인식 속에서 시간의 흐름을 담담히 받아들이는 태도도 느껴져, 조용한 연말의 저녁에 잘 어울린다.',
},
},
{
id: '12-29-kaeritewa',
date: {
month: 12,
day: 29,
solarLabel: '양력 12월 29일',
lunarLabel: '음력 11월 그믐 즈음',
seasonalLabel: '보낼 해를 조용히 떠나보내며 새해를 준비하는 고요한 시각',
},
tags: ['12월', '겨울', '연말', 'reflection', '세월', '내면', '조용한밤'],
content: {
original: {
right: 'かへりては\n身にそふ物と\nしりなから',
left: 'くれゆくとしを\nなにしたふらむ',
hiragana: 'かへりては みにそふものと しりなから くれゆくとしを なにしたふらむ',
},
info: {
author: '上西門院兵衛 조세이몬인 효에',
source: '新古今和歌集 冬歌 신고금와카집 겨울가',
},
translations: {
modernJapanese:
'めぐり戻っては自分の身に添ってゆくものが歳月だと知りながら、暮れゆく年をどうしてこれほどまでに惜しみ慕うのだろうかと自問している。',
korean:
'해마다 되돌아와 내 몸에 스며드는 것이 세월이라는 것을 알면서도, 저물어 가는 해를 왜 이토록 애틋하게 붙잡으려 하는가 하고 스스로 묻게 된다.',
},
commentary:
'해는 다시 돌아와 몸에 스며드는 것이라는 인식과 그럼에도 지나가는 해를 아쉬워하는 마음 사이의 모순을 정면에서 응시한 시다. 연말이 되면 누구나 올해도 벌써 끝이라는 말을 반복하지만, 정작 그 해가 떠나는 것을 막을 수 없다는 아이러니가 담겨 있다. 지나간 시간을 붙잡으려는 마음과 이미 몸에 쌓여 버린 세월 사이의 거리감을 차분한 어조로 드러내며, 한 해를 보내는 마음가짐을 되묻게 한다.',
},
},
{
id: '12-30-hetateyuku',
date: {
month: 12,
day: 30,
solarLabel: '양력 12월 30일',
lunarLabel: '음력 11월 그믐 직전',
seasonalLabel: '지난 해들의 기억이 눈과 함께 뒤섞여 희미해지는 연말 밤',
},
tags: ['12월', '겨울', '눈', '연말', '기억', 'reflection', '긴밤'],
content: {
original: {
right: 'へたてゆく\nよよのおもかげ\nかきくらし',
left: '雪とふりぬる\nとしのくれかな',
hiragana: 'へたてゆく よよのおもかげ かきくらし ゆきとふりぬる としのくれかな',
},
info: {
author: '皇太后宮大夫俊成女 고타이고구노 다이부 도시나리노 무스메',
source: '新古今和歌集 冬歌 신고금와카집 겨울가',
},
translations: {
modernJapanese:
'隔たってゆく幾世もの面影を、降り積もる雪がかき暗くしてしまうように思われる、そんな雪まじりの年の暮れである。',
korean:
'차례차례 멀어져 가는 지난 해들의 모습이, 내리는 눈에 뒤섞여 어둑해지는 듯하여, 눈까지 겹겹이 쌓이는 한 해의 끝이다.',
},
commentary:
'해마다 거리를 두고 멀어져 가는 지난 세월의 모습이 눈과 함께 뒤섞여 희미해지는 연말의 풍경을 그리고 있다. 쌓이는 눈과 거듭되는 해의 기억이 한꺼번에 흩뿌려져 시야를 가리는 듯한 표현은, 시간 감각이 흐려지는 연말 특유의 몽롱함을 잘 포착한다. 구체적인 사건보다 이렇게까지 시간이 흘러버렸다는 감각 자체를 정면에서 마주하게 하는 노래로, 섣달 그믐을 바로 앞둔 밤의 공기와 어울린다.',
},
},
{
id: '12-31-kazofureba',
date: {
month: 12,
day: 31,
solarLabel: '양력 12월 31일',
lunarLabel: '음력 12월 초, 정월을 코앞에 둔 때',
seasonalLabel: '남은 날을 헤아리며 나이 듦을 자각하는 섣달 그믐의 마음',
},
tags: ['12월', '겨울', '연말', '섣달그믐', '세월', 'reflection', '나이듦', '슬픔'],
content: {
original: {
right: 'かぞふれば\n年の残りも\nなかりけり',
left: '老いぬるばかり\nかなしきはなし',
hiragana: 'かぞふれば としののこりも なかりけり おいぬるばかり かなしきはなし',
},
info: {
author: '和泉式部 이즈미 시키부',
source: '新古今和歌集 冬歌 신고금와카집 겨울가',
},
translations: {
modernJapanese:
'日数を数えてみると、この年にもはや残りというものはないのだと分かる。老いてしまった自分だけが残っているようで、それほど悲しいことはないと感じられる。',
korean:
'날수를 헤아려 보니 이 해에도 남은 날이 이제는 하나도 없다는 것을 알게 된다. 남은 것은 늙어 버린 나 자신뿐인 듯하여, 이보다 더 슬픈 일은 없다고 느껴진다.',
},
commentary:
'남은 날을 실제로 세어 본 끝에 이제 이 해에는 더 이상 남은 시간이 없다는 사실을 깨닫는 장면에서 출발하는 시다. 남은 것은 나이가 든 자신뿐이라는 인식이 새해의 설렘보다 나이듦의 슬픔을 먼저 떠올리게 한다. 섣달 그믐 무렵 들뜬 공기와는 조금 다른 방향에서 조용히 자기 나이를 응시하는 시선으로, 한 해의 끝을 깊이 있게 마무리해 주는 노래다.',
},
},
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
