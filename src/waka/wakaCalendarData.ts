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
  // ─────────────────────────────
// 12월 1일
// ─────────────────────────────
{
  id: '1201-kokin-314-tatsutagawa',
  date: {
    month: 12,
    day: 1,
    solarLabel: '양력 12월 1일',
    lunarLabel: '음력 10월 하순 무렵',
    seasonalLabel: '늦가을 단풍 · 초겨울 시우',
  },
  tags: ['12월', '늦가을', '초겨울', '단풍', '강', '시우', '계절의경계', 'wait'],
  content: {
    original: {
      right: '竜田河 錦おりかく 神な月',
      left: 'しぐれの雨を たてぬきにして',
      hiragana:
        'たつたがは にしきおりかく かみなづき しぐれのあめを たてぬきにして',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '竜田川では、錦のような紅葉の上に、神無月の時雨が縦糸のように降りかかっている。',
      korean:
        '타쓰타강에는 비단처럼 곱게 물든 단풍 위로, 신사개월의 시우가 날실처럼 비스듬히 내리꽂히고 있다.',
    },
    commentary:
      '단풍의 절정 위로 초겨울 비가 내려, 가을과 겨울이 겹쳐지는 순간을 직조(織) 이미지로 포착한 노래. 12월의 문턱에서 “한 해의 색이 천천히 수습되는 느낌”을 담기 좋다.',
  },
},

// ─────────────────────────────
// 12월 2일
// ─────────────────────────────
{
  id: '1202-kokin-315-yamazato',
  date: {
    month: 12,
    day: 2,
    solarLabel: '양력 12월 2일',
    lunarLabel: '음력 10월 하순~11월 초순',
    seasonalLabel: '산촌 · 겨울 고요',
  },
  tags: ['12월', '겨울', '산촌', '고요', '고독', '정주', 'calm'],
  content: {
    original: {
      right: '山里は 冬ぞさびしさ まさりける',
      left: '人目も草も かれぬと思へば',
      hiragana:
        'やまざとは ふゆぞさびしさ まさりける ひとめもくさも かれぬとおもへば',
    },
    info: {
      author: '紀貫之（키노 쓰라유키）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '山里は、冬になるといっそう寂しさが増してくる。人の訪れもなく、草さえ枯れてしまったと思うからだ。',
      korean:
        '산골 마을은 겨울이 오면 더욱 쓸쓸해진다. 사람 그림자도, 풀빛조차도 모두 사라져 버린 듯하기 때문이다.',
    },
    commentary:
      '사람의 왕래가 끊긴 산촌의 겨울을 통해, “관계와 시간의 쇠퇴”를 체감하게 하는 노래. 도시의 번잡함에서 잠시 물러나, 일부러 고요 속에 자신을 놓고 싶을 때 어울린다.',
  },
},

// ─────────────────────────────
// 12월 3일
// ─────────────────────────────
{
  id: '1203-kokin-316-moon-ice',
  date: {
    month: 12,
    day: 3,
    solarLabel: '양력 12월 3일',
    lunarLabel: '음력 11월 초순',
    seasonalLabel: '달빛 · 첫얼음',
  },
  tags: ['12월', '겨울', '달', '물', '얼음', '맑음', '성찰', 'calm'],
  content: {
    original: {
      right: '大空の 月の光し きよければ',
      left: '影見し水ぞ まづこほりける',
      hiragana:
        'おおぞらの つきのひかりし きよければ かげみしみずぞ まずこおりける',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '大空にかかる月の光があまりに澄みきっているので、その姿を映していた水こそが真っ先に凍ってしまったのだ。',
      korean:
        '드넓은 하늘에 뜬 달빛이 너무도 맑아서, 그 모습을 비추던 물이 가장 먼저 얼어붙고 말았구나.',
    },
    commentary:
      '달빛의 맑음과 얼음의 차가움을 겹쳐 놓은 노래. 너무 투명한 시선과 의식이, 오히려 감정을 얼어붙게 만들 때의 감각과도 겹쳐 읽을 수 있다.',
  },
},

// ─────────────────────────────
// 12월 4일
// ─────────────────────────────
{
  id: '1204-kokin-317-yoshino-snow',
  date: {
    month: 12,
    day: 4,
    solarLabel: '양력 12월 4일',
    lunarLabel: '음력 11월 초순',
    seasonalLabel: '저녁녘 · 요시노의 눈',
  },
  tags: ['12월', '겨울', '저녁', '요시노', '눈', '추위', 'travel', 'wait'],
  content: {
    original: {
      right: '夕されば 衣手さむし み吉野の',
      left: '吉野の山に み雪降るらし',
      hiragana:
        'ゆうされば ころもでさむし みよしのの よしののやまに みゆきふるらし',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '夕方になると袖口が冷たく感じられる。吉野の山には雪が降っているらしい。',
      korean:
        '해가 저물자 옷소매가 싸늘해진다. 미요시노의 산에는 눈이 내리고 있는 모양이다.',
    },
    commentary:
      '직접 보이지 않는 곳의 눈을, 몸으로 느끼는 찬기와 상상으로 짚어 보는 구성. 직접 닿지 못한 장소와 시간, 사람을 떠올릴 때의 “간접적인 체감”과 잘 겹친다.',
  },
},

// ─────────────────────────────
// 12월 5일
// ─────────────────────────────
{
  id: '1205-kokin-318-home-snow',
  date: {
    month: 12,
    day: 5,
    solarLabel: '양력 12월 5일',
    lunarLabel: '음력 11월 초순~중순',
    seasonalLabel: '집 둘레의 억새 · 하얀 눈',
  },
  tags: ['12월', '겨울', '집', '억새', '눈', '일상풍경', 'calm'],
  content: {
    original: {
      right: '今よりは つきて降らなむ わが宿の',
      left: 'すすきおしなみ ふれる白雪',
      hiragana:
        'いまよりは つきてふらなむ わがやどの すすきおしなみ ふれるしらゆき',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        'これからは絶え間なく降ってほしい、我が家のまわりのすすきを押し伏せるこの白い雪よ。',
      korean:
        '이제부터는 끊이지 말고 내려다오, 우리 집 둘레의 억새를 눌러 쓰러뜨리는 이 흰 눈이여.',
    },
    commentary:
      '억새밭을 덮는 눈을 바라보며 “이 계절이라면 차라리 충분히 내려주길” 바라는 마음. 겨울을 피하기보다, 한 번 온전히 통과해 보고 싶을 때 고를 수 있는 노래.',
  },
},

// ─────────────────────────────
// 12월 6일
// ─────────────────────────────
{
  id: '1206-kokin-319-waterfall-snow',
  date: {
    month: 12,
    day: 6,
    solarLabel: '양력 12월 6일',
    lunarLabel: '음력 11월 중순',
    seasonalLabel: '산 폭포 · 눈소리',
  },
  tags: ['12월', '겨울', '산', '폭포', '눈', '물소리', 'energy'],
  content: {
    original: {
      right: '降る雪は かつぞ消ぬらし あしひきの',
      left: '山の滝つ瀬 音まさるなり',
      hiragana:
        'ふるゆきは かつぞけぬらし あしひきの やまのたきつせ おとまさるなり',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '降る雪はすぐに溶けてしまうのだろう。山の滝の流れは、いつもより音高く響いている。',
      korean:
        '내리는 눈은 곧 녹아 사라지는 모양이다. 산골 폭포 물소리는 평소보다 더욱 크게 울려 퍼진다.',
    },
    commentary:
      '쌓이지 못하고 녹아 흘러가는 눈과, 더 커진 폭포 소리를 함께 그리며 “정체보다 흐름”을 강조하는 겨울 풍경. 막혀 있던 것이 조금씩 움직이기 시작할 때 떠올리기 좋다.',
  },
},

// ─────────────────────────────
// 12월 7일
// ─────────────────────────────
{
  id: '1207-kokin-320-river-thaw',
  date: {
    month: 12,
    day: 7,
    solarLabel: '양력 12월 7일',
    lunarLabel: '음력 11월 중순',
    seasonalLabel: '골짜기 물 · 눈녹은 물',
  },
  tags: ['12월', '겨울', '골짜기', '물', '단풍', '눈녹은물', 'flow', 'energy'],
  content: {
    original: {
      right: 'この川に もみぢは流る 奥山の',
      left: '雪げの水ぞ 今まさるらし',
      hiragana:
        'このかわに もみじはながる おくやまの ゆきげのみずぞ いままさるらし',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        'この川には紅葉が流れている。奥山からは、雪どけの水がいよいよ増してきたのだろう。',
      korean:
        '이 강물에는 단풍잎이 떠내려가고, 깊은 산에서 눈이 녹은 물이 이제 더욱 불어나 밀려오는 듯하다.',
    },
    commentary:
      '물길 위로는 가을의 잔재(紅葉), 그 밑으로는 겨울의 눈녹은 물이 흘러드는, 두 계절이 겹쳐지는 장면. “겉으로는 아직 가을, 속에서는 이미 다음 시기로 넘어가는 상황”을 비유하기도 좋다.',
  },
},

// ─────────────────────────────
// 12월 8일
// ─────────────────────────────
{
  id: '1208-kokin-321-yoshino-hometown',
  date: {
    month: 12,
    day: 8,
    solarLabel: '양력 12월 8일',
    lunarLabel: '음력 11월 중순',
    seasonalLabel: '요시노 · 눈 많은 고향',
  },
  tags: ['12월', '겨울', '고향', '요시노', '눈', '향수', 'wait'],
  content: {
    original: {
      right: 'ふるさとは 吉野の山し 近ければ',
      left: 'ひと日もみ雪 降らぬ日はなし',
      hiragana:
        'ふるさとは よしののやまし ちかければ ひとひもみゆき ふらぬひはなし',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '私の故郷は吉野の山が近いので、一日として雪が降らない日はないのだ。',
      korean:
        '내가 자란 고향은 요시노 산이 가까워서, 눈이 내리지 않는 날이 하루도 없다.',
    },
    commentary:
      '“눈이 많이 오는 곳”이라는 지리적 사실 속에, 고향에 대한 애착과 약간의 체념이 함께 배어 있다. 익숙하지만 힘든 환경을 담담히 받아들이는 마음에 어울린다.',
  },
},

// ─────────────────────────────
// 12월 9일
// ─────────────────────────────
{
  id: '1209-kokin-322-snowed-path',
  date: {
    month: 12,
    day: 9,
    solarLabel: '양력 12월 9일',
    lunarLabel: '음력 11월 중순~하순',
    seasonalLabel: '발길 끊긴 길 · 적설',
  },
  tags: ['12월', '겨울', '눈길', '고립', '집', '고독', 'wait'],
  content: {
    original: {
      right: 'わが宿は 雪ふりしきて 道もなし',
      left: 'ふみわけて問ふ 人しなければ',
      hiragana:
        'わがやどは ゆきふりしきて みちもなし ふみわけてとふ ひとしなければ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        'わが家には雪が激しく降りしきって、道も見えない。雪を踏み分けて訪ねてくる人もいないのだ。',
      korean:
        '우리 집에는 눈이 매섭게 내려 길조차 보이지 않는다. 눈을 헤치며 찾아오는 이도 하나 없다.',
    },
    commentary:
      '물리적인 고립(눈에 막힌 길)과 정서적인 고립(찾아오는 이 없음)을 겹쳐 둔 노래. 외부 자극이 끊어진 날, 일부러 이 고립을 “잠깐의 동굴”처럼 활용하고 싶을 때도 쓸 수 있다.',
  },
},

// ─────────────────────────────
// 12월 10일
// ─────────────────────────────
{
  id: '1210-kokin-323-winter-flowers',
  date: {
    month: 12,
    day: 10,
    solarLabel: '양력 12월 10일',
    lunarLabel: '음력 11월 하순',
    seasonalLabel: '눈 속의 꽃 · 겨울나기',
  },
  tags: ['12월', '겨울', '눈', '꽃', '생명력', '대비', 'energy'],
  content: {
    original: {
      right: '雪ふれば 冬ごもりせる 草も木も',
      left: '春に知られぬ 花ぞ咲きける',
      hiragana:
        'ゆきふれば ふゆごもりせる くさもきも はるにしられぬ はなぞさきける',
    },
    info: {
      author: '紀貫之（키노 쓰라유키）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '雪が降ると、冬ごもりしている草木に、春には見られないような花が咲くのだ。',
      korean:
        '눈이 내리면 겨울잠 든 풀과 나무에도, 봄에는 볼 수 없는 꽃이 피어난다.',
    },
    commentary:
      '혹독한 계절에만 드러나는 “겨울만의 꽃”을 떠올리게 하는 노래. 편안한 시기에는 보이지 않던 자질과 강인함이, 추위 속에서 오히려 피어나는 느낌과 맞닿아 있다.',
  },
},

// ─────────────────────────────
// 12월 11일
// ─────────────────────────────
{
  id: '1211-kokin-324-rock-flowers',
  date: {
    month: 12,
    day: 11,
    solarLabel: '양력 12월 11일',
    lunarLabel: '음력 11월 하순',
    seasonalLabel: '바위에도 피는 흰꽃(눈)',
  },
  tags: ['12월', '겨울', '눈', '바위', '환상', '자연비유', 'calm'],
  content: {
    original: {
      right: '白雪の ところもわかず 降り敷けば',
      left: '岩をにも咲く 花とこそ見れ',
      hiragana:
        'しらゆきの ところもわかず ふりしけば いわをにもさく はなとこそみれ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '白い雪が一面に降り積もると、岩の上にも花が咲いているように見える。',
      korean:
        '새하얀 눈이 곳 가리지 않고 수북이 쌓이니, 바위 위에도 꽃이 피어 있는 듯 보이는구나.',
    },
    commentary:
      '눈을 “바위 위에 피어난 꽃”으로 보는 시선. 삭막한 배경 위에도 얼마든지 미감을 발견할 수 있다는, 겨울다운 낙관이 담겨 있다.',
  },
},

// ─────────────────────────────
// 12월 12일
// ─────────────────────────────
{
  id: '1212-kokin-325-yoshino-deep',
  date: {
    month: 12,
    day: 12,
    solarLabel: '양력 12월 12일',
    lunarLabel: '음력 11월 하순',
    seasonalLabel: '요시노의 깊은 눈 · 한겨울',
  },
  tags: ['12월', '겨울', '요시노', '설경', '고향', '한겨울', 'calm'],
  content: {
    original: {
      right: 'み吉野の 山の白雪 つもるらし',
      left: 'ふるさと寒く なりまさるなり',
      hiragana:
        'みよしのの やまのしらゆき つもるらし ふるさとさむく なりまさるなり',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '吉野の山には白い雪が積もっているらしい。故郷はいよいよ寒さを増していくのだ。',
      korean:
        '미요시노 산에는 흰 눈이 쌓여 가는 모양이다. 고향은 점점 더 추워지고 있구나.',
    },
    commentary:
      '눈 소식 하나로 고향의 기온과 공기까지 떠올리는 노래. 직접 가지 못하는 장소를 “기상 이미지”로 더듬어 보는 감각이 담겨 있다.',
  },
},

// ─────────────────────────────
// 12월 13일
// ─────────────────────────────
{
  id: '1213-kokin-326-seashore-snow',
  date: {
    month: 12,
    day: 13,
    solarLabel: '양력 12월 13일',
    lunarLabel: '음력 11월 하순',
    seasonalLabel: '바닷가 눈 · 흰파도',
  },
  tags: ['12월', '겨울', '바다', '눈', '흰파도', '원경', 'calm'],
  content: {
    original: {
      right: '浦ちかく 降りくる雪は 白浪の',
      left: '末の松山 こすかとぞ見る',
      hiragana:
        'うらちかく ふりくるゆきは しらなみの すえのまつやま こすかとぞみる',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '浦近くに降ってくる雪は、白波が末の松山を越えていくのかと見まがうほどだ。',
      korean:
        '바닷가 가까이 내리는 눈은, 마치 흰 파도가 스에노마쓰야마를 넘어가는 것처럼 보인다.',
    },
    commentary:
      '바다의 흰 파도와 하늘에서 내리는 눈을 겹쳐 보는 시선. 수평선 근처의 날씨를 바라보는 “먼 시야”가 인상적인 노래다.',
  },
},

// ─────────────────────────────
// 12월 14일
// ─────────────────────────────
{
  id: '1214-kokin-327-deep-yoshino-absence',
  date: {
    month: 12,
    day: 14,
    solarLabel: '양력 12월 14일',
    lunarLabel: '음력 11월 하순~12월 초순',
    seasonalLabel: '눈 쌓인 산길 · 소식 없음',
  },
  tags: ['12월', '겨울', '요시노', '눈길', '부재', '기다림', 'wait'],
  content: {
    original: {
      right: 'み吉野の 山の白雪 ふみ分けて',
      left: '入りにし人の 音づれもせぬ',
      hiragana:
        'みよしのの やまのしらゆき ふみわけて いりにしひとの おとづれもせぬ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '吉野の山の白雪を踏み分けて入って行ったあの人からは、何の便りも届かない。',
      korean:
        '요시노의 흰 눈을 헤치며 산으로 들어갔던 그 사람에게서, 아무런 소식도 들려오지 않는다.',
    },
    commentary:
      '구체적인 연애 표현 없이, “눈 속으로 사라진 사람”과 소식 없는 기다림을 그린 노래. 물리적 거리와 계절의 험함이 덧붙여져, 기다림의 시간이 더 길게 느껴진다.',
  },
},

// ─────────────────────────────
// 12월 15일
// ─────────────────────────────
{
  id: '1215-kokin-328-snowy-village',
  date: {
    month: 12,
    day: 15,
    solarLabel: '양력 12월 15일',
    lunarLabel: '음력 12월 초순 무렵',
    seasonalLabel: '쌓인 눈 · 사람 마음',
  },
  tags: ['12월', '겨울', '산촌', '눈', '삶의무게', '성찰', 'calm'],
  content: {
    original: {
      right: '白雪の 降りてつもれる 山里は',
      left: '住む人さへや 思ひ消ゆらむ',
      hiragana:
        'しらゆきの ふりてつもれる やまざとは すむひとさえや おもいきゆらむ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '白雪が降り積もった山里では、そこに住む人の心さえ消え入りそうになっているのだろうか。',
      korean:
        '하얀 눈이 소복이 쌓인 산골 마을에서는, 사는 이들의 마음까지 사라져 버릴 듯한 기분이 드는 것일까.',
    },
    commentary:
      '풍경의 고요가 너무 깊어져서 “살고 있는 사람의 존재감”마저 옅어지는 듯한 감각. 번잡함에 지쳐, 일부러 존재감을 희미하게 만들고 싶을 때도 떠올릴 수 있는 노래다.',
  },
},

// ─────────────────────────────
// 12월 16일
// ─────────────────────────────
{
  id: '1216-kokin-329-snow-and-trace',
  date: {
    month: 12,
    day: 16,
    solarLabel: '양력 12월 16일',
    lunarLabel: '음력 12월 초순',
    seasonalLabel: '눈발 속 사라지는 자국',
  },
  tags: ['12월', '겨울', '눈', '발자국', '기억', '무상', 'wait'],
  content: {
    original: {
      right: '雪ふりて 人も通はぬ 道なれや',
      left: '跡もかもなく 思ひ消ゆらむ',
      hiragana:
        'ゆきふりて ひともかよわぬ みちなれや あともかもなく おもいきゆらむ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '雪が降って人も通わなくなった道なのだろうか。足跡もすっかり消えてしまうように、思いも消えていくのだろう。',
      korean:
        '눈이 내려 이제는 아무도 다니지 않는 길이 된 것일까. 발자국이 자취 없이 사라지듯, 마음속 생각도 사라져 가겠지.',
    },
    commentary:
      '눈에 지워지는 발자국처럼, 마음의 자국도 사라져 간다는 비유. 억지로 떨치기보다, 자연스럽게 희미해지는 망각의 과정을 받아들이고 싶을 때 어울린다.',
  },
},

// ─────────────────────────────
// 12월 17일
// ─────────────────────────────
{
  id: '1217-kokin-330-winter-flowers-from-sky',
  date: {
    month: 12,
    day: 17,
    solarLabel: '양력 12월 17일',
    lunarLabel: '음력 12월 초순',
    seasonalLabel: '겨울 · 하늘에서 오는 꽃',
  },
  tags: ['12월', '겨울', '눈', '꽃비유', '하늘', '계절의겹침', 'energy'],
  content: {
    original: {
      right: '冬ながら 空より花の 散りくるは',
      left: '雲のあなたは 春にやあるらむ',
      hiragana:
        'ふゆながら そらよりはなの ちりくるは くものあなたは はるにやあるらむ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '冬だというのに、空から花が散ってくるのは、雲の向こう側はもう春なのであろうか。',
      korean:
        '아직 겨울인데도 하늘에서 꽃이 흩날리듯 눈이 내리니, 구름 너머 저편에는 벌써 봄이 온 것일까.',
    },
    commentary:
      '눈을 “하늘에서 흩날리는 꽃”으로 보며, 구름 너머에 이미 도착한 봄을 상상하게 하는 노래. 12월 중순, 아직 오지 않은 계절을 마음속에서 먼저 열어 보고 싶을 때 잘 맞는다.',
  },
},

// ─────────────────────────────
// 12월 18일
// ─────────────────────────────
{
  id: '1218-kokin-331-winter-into-flowers',
  date: {
    month: 12,
    day: 18,
    solarLabel: '양력 12월 18일',
    lunarLabel: '음력 12월 중순 무렵',
    seasonalLabel: '겨울나기 · 눈이 꽃이 되는 순간',
  },
  tags: ['12월', '겨울', '눈', '꽃', '놀라움', '전환', 'energy'],
  content: {
    original: {
      right: '冬ごもり 思ひかけぬを 木の間より',
      left: '花と見るまで 雪ぞ降りける',
      hiragana:
        'ふゆごもり おもいかけぬを このまより はなとみるまで ゆきぞふりける',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '冬ごもりしていて思いもよらぬうちに、木々の間から花かと思うほどに雪が降ってきた。',
      korean:
        '겨울을 칩거하며 지내는 사이, 뜻밖에도 나뭇가지 사이로 꽃인가 싶을 만큼 눈이 쏟아져 내렸다.',
    },
    commentary:
      '“생각도 못한 사이에” 계절의 얼굴이 확 바뀌는 순간을 포착한 노래. 조용히 지내던 시간 위로 갑자기 새로운 국면이 찾아올 때의 놀람과도 닮아 있다.',
  },
},

// ─────────────────────────────
// 12월 19일
// ─────────────────────────────
{
  id: '1219-kokin-332-yoshino-dawn-snow',
  date: {
    month: 12,
    day: 19,
    solarLabel: '양력 12월 19일',
    lunarLabel: '음력 12월 중순',
    seasonalLabel: '새벽 · 달과 눈',
  },
  tags: ['12월', '겨울', '새벽', '달', '요시노', '설경', 'calm'],
  content: {
    original: {
      right: 'あさぼらけ 有明の月と 見るまでに',
      left: '吉野の里に 降れる白雪',
      hiragana:
        'あさぼらけ ありあけのつきと みるまでに よしののさとに ふれるしらゆき',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '夜明け方、ありあけの月かと思うほどに、吉野の里には白い雪が降り積もっている。',
      korean:
        '새벽녘, 새벽달인가 싶을 만큼 희끄무레한 빛 속에서, 요시노 마을에는 하얀 눈이 소복이 내려앉아 있다.',
    },
    commentary:
      '빛의 근원이 분간되지 않는 새벽의 분위기를, 달빛과 눈빛이 뒤섞인 장면으로 그려낸 노래. 하루의 시작을 아주 조용히 열고 싶을 때 잘 어울린다.',
  },
},

// ─────────────────────────────
// 12월 20일
// ─────────────────────────────
{
  id: '1220-kokin-333-spring-haze-far',
  date: {
    month: 12,
    day: 20,
    solarLabel: '양력 12월 20일',
    lunarLabel: '음력 12월 중순~동지 무렵',
    seasonalLabel: '눈 위의 봄 안개 예감',
  },
  tags: ['12월', '겨울', '눈', '봄예감', '안개', '계절의연결', 'wait'],
  content: {
    original: {
      right: 'けぬかうへに 又も降りしけ 春霞',
      left: '立ちなば雪は まれにこそ見め',
      hiragana:
        'けぬかうえに またもふりしけ はるがすみ たちなばゆきは まれにこそみめ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '昨日の上に今日もまた雪が降り積もっているが、春霞が立てば、雪を見ることも稀になるのだろう。',
      korean:
        '어제 쌓인 눈 위에 오늘도 눈이 내리지만, 봄 안개가 피어오르면 이 눈도 드물게나 보게 되겠지.',
    },
    commentary:
      '눈이 계속 쌓이는 지금 이 순간에도, 곧 안개와 함께 사라져 갈 것이라는 “유통기한이 정해진 풍경”을 의식하는 노래. 붙잡고 싶지만 머무르지 않는 시간의 감각을 담는다.',
  },
},

// ─────────────────────────────
// 12월 21일
// ─────────────────────────────
{
  id: '1221-kokin-334-plum-or-snow',
  date: {
    month: 12,
    day: 21,
    solarLabel: '양력 12월 21일',
    lunarLabel: '음력 11월 하순~12월 동지',
    seasonalLabel: '눈과 매화 · 분간 안 됨',
  },
  tags: ['12월', '겨울', '눈', '매화', '꽃', '혼재', '봄예감', 'calm'],
  content: {
    original: {
      right: '梅の花 それとも見えず ひさかたの',
      left: '天きる雪の なべて降れれば',
      hiragana:
        'うめのはな それともみえず ひさかたの あまきるゆきの なべてふれれば',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '梅の花かどうかも分からないほどに、空を切るように雪が一面に降りしきっている。',
      korean:
        '매화인지 아닌지도 알 수 없을 만큼, 하늘을 가르듯 온통 눈이 내려 쌓이고 있다.',
    },
    commentary:
      '눈과 매화가 한 덩어리로 보이는 시점에서, 겨울과 이른 봄의 경계가 흐려진다. 언제부터를 “새해의 기운”으로 볼 것인가를 스스로 정해 보고 싶은 날에 어울린다.',
  },
},

// ─────────────────────────────
// 12월 22일
// ─────────────────────────────
{
  id: '1222-kokin-335-plum-fragrance',
  date: {
    month: 12,
    day: 22,
    solarLabel: '양력 12월 22일',
    lunarLabel: '동지 무렵',
    seasonalLabel: '향으로 아는 꽃 · 동지',
  },
  tags: ['12월', '겨울', '눈', '매화', '향기', '감각', 'calm'],
  content: {
    original: {
      right: '花の色は 雪にまじりて 見えずとも',
      left: '香をだに匂へ 人の知るべく',
      hiragana:
        'はなのいろは ゆきにまじりて みえずとも かをだににおえ ひとのしるべく',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '花の色は雪にまじって見えなくとも、せめて香りだけは匂って、人にその存在を知らせてほしい。',
      korean:
        '꽃빛은 눈과 섞여 보이지 않더라도, 향기만큼은 풍겨서, 사람들이 그 존재를 알아차리게 해 다오.',
    },
    commentary:
      '겉모습이 지워져도 향기만은 남는 매화를 통해, 눈에 보이지 않는 “고유한 기운”을 떠올리게 하는 노래. 형태보다 내적 향에 집중하고 싶을 때 골라 쓰기 좋다.',
  },
},

// ─────────────────────────────
// 12월 23일
// ─────────────────────────────
{
  id: '1223-kokin-336-plum-snow-mixed',
  date: {
    month: 12,
    day: 23,
    solarLabel: '양력 12월 23일',
    lunarLabel: '음력 12월 하순',
    seasonalLabel: '눈과 매화 · 구분의 어려움',
  },
  tags: ['12월', '겨울', '눈', '매화', '선택', '판별', 'reflection'],
  content: {
    original: {
      right: '梅の花の 降りおける雪に まがひせば',
      left: 'たれかことごと 分きて折らまし',
      hiragana:
        'うめのはなの ふりおけるゆきに まがいせば たれかことごと わきておらまし',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '梅の花が降りかかった雪と見分けがつかないとしたら、いったい誰が一つ一つ分けて折り取ることができようか。',
      korean:
        '매화와 그 위에 내려앉은 눈이 서로 구분되지 않는다면, 누가 그것을 하나하나 가려 꺾을 수 있을까.',
    },
    commentary:
      '무언가를 명확히 구분하고 선택하는 일 자체가, 때로는 불가능에 가깝다는 통찰을 담고 있다. 경계가 흐린 상태를 있는 그대로 두고 싶은 날의 노래.',
  },
},

// ─────────────────────────────
// 12월 24일
// ─────────────────────────────
{
  id: '1224-kokin-337-snow-flowers-everywhere',
  date: {
    month: 12,
    day: 24,
    solarLabel: '양력 12월 24일',
    lunarLabel: '음력 12월 하순',
    seasonalLabel: '나무마다 피는 눈꽃 · 성탄 전야 느낌',
  },
  tags: ['12월', '겨울', '눈', '눈꽃', '숲', '축제감', 'energy'],
  content: {
    original: {
      right: '雪ふれば 木ごとに花ぞ 咲きにける',
      left: 'いづれを梅と 分きて折らまし',
      hiragana:
        'ゆきふれば きごとにはなぞ さきにける いずれをうめと わきておらまし',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '雪が降ると、木という木が皆、花を咲かせたようになってしまう。どれを梅と見分けて折ればよいのだろう。',
      korean:
        '눈이 내리니 숲의 나무마다 꽃을 피운 듯하다. 이 가운데 무엇을 매화라 가려 꺾어야 한단 말인가.',
    },
    commentary:
      '숲 전체가 눈꽃으로 뒤덮인 광경을 “모두가 꽃이 된 상태”로 표현한 노래. 특정한 하나가 아니라, 풍경 전체를 통째로 좋아하고 싶을 때 어울린다.',
  },
},

// ─────────────────────────────
// 12월 25일
// ─────────────────────────────
{
  id: '1225-kokin-339-year-end-snow-age',
  date: {
    month: 12,
    day: 25,
    solarLabel: '양력 12월 25일',
    lunarLabel: '음력 11월·12월 사이',
    seasonalLabel: '한 해의 끝 · 눈과 나이',
  },
  tags: ['12월', '겨울', '연말', '눈', '세월', '노화', 'reflection'],
  content: {
    original: {
      right: 'あらたまの 年のをはりに なるごとに',
      left: '雪もわが身も 降りまさりつつ',
      hiragana:
        'あらたまの としのおわりに なるごとに ゆきもわがみも ふりまさりつつ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        'あらたまの年の終わりになるたびに、雪も、そして我が身の年齢も、降り積もるように増していく。',  
      korean:
        '해가 저물 때마다, 내리는 눈도, 내 나이도, 포슬포슬 더해져 쌓여 간다.',
    },
    commentary:
      '눈의 “쌓임”과 나이의 “쌓임”을 겹쳐 본 연말가. 축적된 세월을 부정하기보다, 한 겹 한 겹의 층으로 받아들이고 싶을 때 읽기 좋은 노래다.',
  },
},

// ─────────────────────────────
// 12월 26일
// ─────────────────────────────
{
  id: '1226-kokin-340-year-end-pine',
  date: {
    month: 12,
    day: 26,
    solarLabel: '양력 12월 26일',
    lunarLabel: '음력 12월 중·하순',
    seasonalLabel: '연말 · 시들지 않는 소나무',
  },
  tags: ['12월', '겨울', '연말', '눈', '소나무', '영속성', 'reflection'],
  content: {
    original: {
      right: '雪ふりて 年のくれぬる 時にこそ',
      left: 'つひにもみぢぬ 松も見えけれ',
      hiragana:
        'ゆきふりて としのくれぬる ときにこそ ついにもみじぬ まつもみえけれ',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '雪が降り、年が暮れていく時になってはじめて、ついにも紅葉しない松の姿が見えてくるのだ。',
      korean:
        '눈이 내리고 한 해가 저물어갈 때가 되어서야, 끝내 물들지 않는 소나무가 비로소 눈에 들어온다.',
    },
    commentary:
      '모두가 색을 바꾸는 가운데, 끝까지 변하지 않는 존재(소나무)를 연말에 비로소 인식하게 된다는 노래. 주변과 달라도 괜찮은 “상록의 리듬”을 떠올리게 한다.',
  },
},

// ─────────────────────────────
// 12월 27일
// ─────────────────────────────
{
  id: '1227-kokin-341-asuka-time',
  date: {
    month: 12,
    day: 27,
    solarLabel: '양력 12월 27일',
    lunarLabel: '음력 12월 하순',
    seasonalLabel: '날짜 감각 · 흐르는 아스카',
  },
  tags: ['12월', '연말', '시간흐름', '강', '무상', 'reflection'],
  content: {
    original: {
      right: '昨日といひ 今日と暮らして 飛鳥川',
      left: '流れて早き 月日なりけり',
      hiragana:
        'きのうといい きょうとくらして あすかがわ ながれてはやき つきひなりけり',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '昨日だ、今日はと日々を過ごしているうちに、飛鳥川は流れ、月日もまた早く過ぎ去ってしまうのだ。',
      korean:
        '어제다, 오늘이다 하며 지내는 사이, 아스카 강은 흐르고, 세월 또한 너무나도 빨리 흘러가 버린다.',
    },
    commentary:
      '“어제”와 “오늘”이라는 작은 단위가 모여, 어느새 연말이 되어 버리는 시간을 강물 흐름에 비유한 노래. 달력 마지막 장을 넘기기 직전의 마음과 잘 겹친다.',
  },
},

// ─────────────────────────────
// 12월 28일
// ─────────────────────────────
{
  id: '1228-kokin-342-leaving-year-mirror',
  date: {
    month: 12,
    day: 28,
    solarLabel: '양력 12월 28일',
    lunarLabel: '음력 12월 하순',
    seasonalLabel: '가는 해 · 거울 속 그림자',
  },
  tags: ['12월', '연말', '거울', '자기성찰', '시간', 'reflection'],
  content: {
    original: {
      right: '行く年の 惜しくもあるかな ます鏡',
      left: '見る影さへに 暮れぬと思へば',
      hiragana:
        'ゆくとしの おしくもあるかな ますかがみ みるかげさえに くれぬとおもえば',
    },
    info: {
      author: '古今和歌集 冬歌 所収歌（고금와카집 겨울가 수록 시）',
      source: '古今和歌集 巻六 冬歌（고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '過ぎ去っていく年が惜しいことだ。増鏡に映る自分の姿さえ、暮れていくように感じられるのだから。',
      korean:
        '저물어 가는 해가 아쉬운 법이다. 손 거울에 비친 내 모습조차, 함께 저물어 가는 것만 같으니.',
    },
    commentary:
      '거울 속 자신의 모습까지 “해가 저무는 풍경”에 겹쳐 보는 노래. 외부의 변화와 내 모습을 나란히 놓고 돌아보고 싶을 때 어울린다.',
  },
},

// ─────────────────────────────
// 12월 29일 – “해 안에서 온 봄”
// ─────────────────────────────
{
  id: '1229-kokin-001-year-within',
  date: {
    month: 12,
    day: 29,
    solarLabel: '양력 12월 29일',
    lunarLabel: '음력 12월 하순',
    seasonalLabel: '한 해 안에 찾아온 봄',
  },
  tags: ['12월', '연말', '봄예감', '새해', '시간의겹침', 'energy'],
  content: {
    original: {
      right: '年のうちに 春は来にけり ひととせを',
      left: 'こぞとやいはむ ことしとやいはむ',
      hiragana:
        'としのうちに はるはきにけり ひととせを こぞとやいわむ ことしとやいわむ',
    },
    info: {
      author: '在原元方（아리와라노 모토카타）',
      source: '古今和歌集 春歌上（고금와카집 봄가 상）',
    },
    translations: {
      modernJapanese:
        '年のうちに春が来てしまった。この一年を、去年と言おうか、それとも今年と言おうか。',
      korean:
        '해가 다 가기 전에 봄이 와버렸으니, 이 한 해를 작년이라 해야 할까, 아니면 올해라 해야 할까.',
    },
    commentary:
      '달력의 구분과 계절의 감각이 어긋나는 지점을 유머러스하게 짚은 노래. 12월 말, 이미 마음속에서는 다음 해와 다음 계절을 준비하고 있을 때 잘 맞는다.',
  },
},

// ─────────────────────────────
// 12월 30일 – “얼음이 풀리며 솟는 물꽃”
// ─────────────────────────────
{
  id: '1230-kokin-012-valley-ice',
  date: {
    month: 12,
    day: 30,
    solarLabel: '양력 12월 30일',
    lunarLabel: '음력 12월 하순',
    seasonalLabel: '얼음 사이 물결 · 첫 꽃',
  },
  tags: ['12월', '겨울끝', '얼음', '물결', '봄의기운', 'energy'],
  content: {
    original: {
      right: '谷風に とくるこほりの ひまごとに',
      left: 'うちいつる浪や 春のはつ花',
      hiragana:
        'たにかぜに とくるこおりの ひまごとに うちいつるなみや はるのはつはな',
    },
    info: {
      author: '源昌純（미나모토노 마사스미）',
      source: '古今和歌集 春歌上（고금와카집 봄가 상）',
    },
    translations: {
      modernJapanese:
        '谷風に解けていく氷の隙間ごとに、ほとばしり出る波こそが春の初めの花なのだろう。',
      korean:
        '골짜기 바람에 녹아가는 얼음 틈마다 솟구쳐 나오는 물결이야말로, 봄의 첫 꽃이리라.',
    },
    commentary:
      '얼음이 풀리며 튀어오르는 물을 “봄의 첫 꽃”으로 본 노래. 아직 겨울 속에 있지만, 마음은 이미 다음 계절의 에너지를 느끼고 있을 때 잘 어울린다.',
  },
},

// ─────────────────────────────
// 12월 31일 – “후지산 설경으로 맺는 해”
// ─────────────────────────────
{
  id: '1231-manyou-fuji-snow',
  date: {
    month: 12,
    day: 31,
    solarLabel: '양력 12월 31일',
    lunarLabel: '음력 섣달 그믐',
    seasonalLabel: '후지산 설경 · 한 해의 끝',
  },
  tags: ['12월', '겨울', '눈', '후지산', '원경', '새해맞이', 'calm'],
  content: {
    original: {
      right: '田子の浦に うち出でて見れば 白妙の',
      left: '富士の高嶺に 雪は降りつつ',
      hiragana:
        'たごのうらに うちいでてみれば しろたへの ふじのたかねに ゆきはふりつつ',
    },
    info: {
      author: '山部赤人（야마베노 아카히토）',
      source: '万葉集・新古今和歌集 冬歌（만요슈 · 신고금와카집 겨울가）',
    },
    translations: {
      modernJapanese:
        '田子の浦に出て眺めてみると、真っ白な布のような富士の高嶺に雪が降り続いている。',
      korean:
        '다가노우라에 나와 바라보니, 흰 베와도 같은 후지의 높은 봉우리에 눈이 한결같이 내리고 있다.',
    },
    commentary:
      '넓은 바다와 눈 덮인 후지산을 한 화면에 담은, 대표적인 설경의 노래. 사소한 일상에서 한 걸음 물러나 “올해 전체의 풍경”을 멀리서 바라보고 싶을 때 맺음말처럼 쓸 수 있다.',
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
