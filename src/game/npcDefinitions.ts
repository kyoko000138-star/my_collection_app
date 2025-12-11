// src/game/npcDefinitions.ts

export type NpcId = 'angel' | 'demon' | 'gardener' | 'curator';

interface NpcDefinition {
  id: NpcId;
  nameKo: string;
  nameEn?: string;
  emoji?: string;
}

export const NPC_DEFINITIONS: Record<NpcId, NpcDefinition> = {
  angel: {
    id: 'angel',
    nameKo: '약속의 천사',
    nameEn: 'Guardian Angel',
    emoji: '👼',
  },
  demon: {
    id: 'demon',
    nameKo: '유혹의 악마',
    nameEn: 'Tempter',
    emoji: '😈',
  },
  gardener: {
    id: 'gardener',
    nameKo: '회복의 정원사',
    nameEn: 'Gardener',
    emoji: '🌿',
  },
  curator: {
    id: 'curator',
    nameKo: '기록의 큐레이터',
    nameEn: 'Curator',
    emoji: '📜',
  },
};
