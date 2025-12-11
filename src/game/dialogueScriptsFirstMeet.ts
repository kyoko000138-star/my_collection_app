import type { DialogueScript } from './dialogueTypes';

/** 천사 – 보통 첫 만남 */
export const FIRST_MEET_ANGEL_NORMAL: DialogueScript = {
  id: 'angel_first_meet_normal',
  lines: [
    {
      id: '1',
      speakerType: 'NPC',
      speakerId: 'angel',
      // [수정] 홑따옴표(') -> 백틱(`)으로 변경
      text: `처음 뵙네요.
이 마을의 수호 천사예요.
당신이 통장 때문에 너무 지치지 않도록 지켜보는 역할을 맡았어요.`,
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
      // [수정] 홑따옴표(') -> 백틱(`)으로 변경
      text: `걱정 마세요.
저는 벌주는 존재가 아니라, 같이 숫자를 바라봐 주는 존재예요.
완벽해지려고 하지 말고, 오늘부터 “도망치지 않기”부터 연습해요.`,
    },
    {
      id: '4',
      speakerType: 'NPC',
      speakerId: 'angel',
      text: `힘들 땐 숨도 돌려야 하니까요.
괜찮다면, 이번 달 이야기부터 조금씩 들려주시겠어요?`,
    },
  ],
};
