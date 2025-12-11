// src/game/dialogueTypes.ts
import type { NpcId } from './npcDefinitions';

export type SpeakerType = 'NPC' | 'SYSTEM' | 'PLAYER';

export interface DialogueLine {
  id: string;
  speakerType: SpeakerType;
  speakerId?: NpcId;     // NPC일 때
  speakerName?: string;  // SYSTEM/PLAYER 이름 커스텀용
  text: string;
  emotion?: 'normal' | 'happy' | 'sad' | 'angry' | 'tsundere';
}

export interface DialogueScript {
  id: string;            // 예: 'angel_first_meet_normal'
  lines: DialogueLine[];
}
