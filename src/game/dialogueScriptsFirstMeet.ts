// src/game/dialogueScriptsFirstMeet.ts
import type { DialogueScript } from './dialogueTypes';

/** 천사 – 보통 첫 만남 */
export const FIRST_MEET_ANGEL_NORMAL: DialogueScript = {
  id: 'angel_first_meet_normal',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'angel',
      text: '처음 뵙네요. 이 마을의 수호 천사예요.\n당신이 통장 때문에 너무 지치지 않도록 지켜보는 역할을 맡았어요.',
    },
    {
      id: '2',
      speakerType: 'PLAYER',
      text: '…통장까지 지켜보는 천사라니, 좀 무서운데요?',
    },
    {
      id: '3',
      speakerType: 'NPC',
      speakerId: 'angel',
      text: '걱정 마세요. 저는 벌주는 존재가 아니라, 같이 숫자를 바라봐 주는 존재예요.\n완벽해지려고 하지 말고, 오늘부터 “도망치지 않기”부터 연습해요.',
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'angel',
      text: '힘들 땐 숨도 돌려야 하니까요.\n괜찮다면, 이번 달 이야기부터 조금씩 들려주시겠어요?',
    },
  ],
};

/** 천사 – 최악의 첫 만남 */
export const FIRST_MEET_ANGEL_BAD: DialogueScript = {
  id: 'angel_first_meet_bad',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'angel',
      text: '…여기까지 오는 길, 꽤 힘들지 않았나요?\n카드값 알림을 일부러 안 눌러 본 흔적이 잔뜩 보여요.',
    },
    {
      id: '2',
      speakerType: 'PLAYER',
      text: '그, 그걸 어떻게… 설마 통장도 다 보고 있는 건 아니죠?',
    },
    {
      id: '3',
      speakerType: 'NPC',
      speakerId: 'angel',
      text: '네, 다는 아니에요. 하지만 “얼마나 피하고 있었는지”는 느껴져요.\n오늘은 조금… 쓴소리를 할지도 모르겠네요.',
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'angel',
      text: '그래도 괜찮다면, 도망치지만 않겠다고 약속해 줄래요?\n저는 당신 편이에요. 그래서 더 이상 외면하게 두고 싶지 않거든요.',
    },
  ],
};

/** 악마 – 보통 첫 만남 */
export const FIRST_MEET_DEMON_NORMAL: DialogueScript = {
  id: 'demon_first_meet_normal',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'demon',
      text: '드디어 왔네. 꽤 늦게 나타나는 타입이네, 너.',
    },
    {
      id: '2',
      speakerType: 'PLAYER',
      text: '…우리가 아는 그 “악마” 맞아요? 지갑 털어가는 그 쪽?',
    },
    {
      id: '3',
      speakerType: 'NPC',
      speakerId: 'demon',
      text: '오해네. 나는 “오늘의 즐거움 담당”에 가까워.\n다만, 가끔 선을 너무 넘게 만들기도 하지.',
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'demon',
      text: '괜찮아, 네가 진짜로 망가지는 건 나도 원치 않아.\n대신, 어디까지가 괜찮은 선인지… 우리 같이 실험해보는 건 어때?',
    },
  ],
};

/** 악마 – 최악의 첫 만남 */
export const FIRST_MEET_DEMON_BAD: DialogueScript = {
  id: 'demon_first_meet_bad',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'demon',
      text: '하하, 솔직히 말해도 돼?\n나 없이도 꽤 위험하게 놀고 있더라, 요즘.',
    },
    {
      id: '2',
      speakerType: 'PLAYER',
      text: '…그건 칭찬인가요, 비난인가요.',
    },
    {
      id: '3',
      speakerType: 'NPC',
      speakerId: 'demon',
      text: '둘 다. 그래서 눈에 띄었어. “아, 이건 개입해야겠다” 싶을 정도로.',
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'demon',
      text: '앞으로는 아무 때나 “에라 모르겠다”라고 말하게 두진 않을 거야.\n즐기는 건 좋지만, 그 다음 날 네 표정까지는… 나도 책임지고 싶거든.',
    },
  ],
};

/** 정원사 – 보통 첫 만남 */
export const FIRST_MEET_GARDENER_NORMAL: DialogueScript = {
  id: 'gardener_first_meet_normal',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'gardener',
      text: '어서 와요. 여기까지 오는 동안, 조금은 숨 돌릴 수 있었나요?',
    },
    {
      id: '2',
      speakerType: 'PLAYER',
      text: '솔직히… 돈 생각하면 숨이 더 막히는 느낌인데요.',
    },
    {
      id: '3',
      speakerType: 'NPC',
      speakerId: 'gardener',
      text: '그래서 제가 있어요.\n몸이랑 마음이 망가지면, 숫자를 아무리 정리해도 허물어지거든요.',
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'gardener',
      text: '오늘은 “잘 쓴 돈”보다 “잘 쉰 시간”부터 같이 찾아볼래요?\n작은 식사, 따뜻한 차, 짧은 휴식 같은 것들이요.',
    },
  ],
};

/** 정원사 – 최악의 첫 만남 */
export const FIRST_MEET_GARDENER_BAD: DialogueScript = {
  id: 'gardener_first_meet_bad',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'gardener',
      text: '…요즘 잠은 좀 자고 있나요?\n기록을 보니까, 야식이랑 카페인만 늘어나 있던데요.',
    },
    {
      id: '2',
      speakerType: 'PLAYER',
      text: '그게… 그나마 위로가 돼서요. 안 그러면 버티질 못하겠어서.',
    },
    {
      id: '3',
      speakerType: 'NPC',
      speakerId: 'gardener',
      text: '그 마음, 이해해요. 그래서 더 조심스러운 거예요.\n지금 패턴이 계속되면, 돈보다 먼저 몸이 쓰러질 것 같아서.',
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'gardener',
      text: '당장 완벽해지자는 얘기는 안 할게요.\n대신, 오늘 내 몸을 위해 해 줄 수 있는 일 한 가지만 골라볼까요?',
    },
  ],
};

/** 큐레이터 – 보통 첫 만남 */
export const FIRST_MEET_CURATOR_NORMAL: DialogueScript = {
  id: 'curator_first_meet_normal',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'curator',
      text: '환영합니다. 당신의 소비와 선택을 전시하는 작은 박물관이에요.',
    },
    {
      id: '2',
      speakerType: 'PLAYER',
      text: '전시라니요, 부끄러운 내역이 훨씬 많은데요…?',
    },
    {
      id: '3',
      speakerType: 'NPC',
      speakerId: 'curator',
      text: '부끄러운 기록도 “살아온 증거”예요.\n그리고 증거가 많을수록, 다음 전시를 더 잘 큐레이션할 수 있죠.',
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'curator',
      text: '오늘부터는 지우지 말고, 그냥 남겨둬 봐요.\n우리는 “잘한 소비”만이 아니라, “배운 소비”도 함께 모을 테니까요.',
    },
  ],
};

/** 큐레이터 – 최악의 첫 만남 */
export const FIRST_MEET_CURATOR_BAD: DialogueScript = {
  id: 'curator_first_meet_bad',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'curator',
      text: '음… 전시관이 많이 비어 있네요.\n최근 몇 주는, 거의 아무것도 남겨두지 않았어요.',
    },
    {
      id: '2',
      speakerType: 'PLAYER',
      text: '볼 때마다 스트레스라서요. 그냥 안 적으면… 없는 것 같아서.',
    },
    {
      id: '3',
      speakerType: 'NPC',
      speakerId: 'curator',
      text: '기분은 이해해요. 하지만, 기록이 없으면 “무서움”은 더 커져요.\n보이지 않는 방은, 상상 속에서 더 어두워지니까요.',
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'curator',
      text: '오늘부터는 평가하지 말고, 그냥 적어두는 것부터 해봐요.\n평가는 나중에, 우리 둘이 같이 천천히 해도 되니까요.',
    },
  ],
};
