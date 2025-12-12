// src/money/rewardData.ts
export type RewardRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGEND';
export type RewardType = 'DECOR' | 'ITEM' | 'BADGE' | 'MATERIAL';

export interface RewardItem {
  id: string;
  name: string;
  desc: string;
  rarity: RewardRarity;
  type: RewardType;
}

export const DECOR_EMOJI: Record<string, string> = {
  grass_tuft: '🌿',
  pebble: '🪨',
  mushroom: '🍄',
  lantern: '🏮',
  bench: '🪑',
  pond: '🫧',
  stone_path: '🧱',
  windchime: '🎐',
};

export const REWARD_POOL: RewardItem[] = [
  // COMMON (데코)
  { id: 'grass_tuft', name: '풀숲', desc: '정원 가장자리에 작은 풀숲이 자랐어요.', rarity: 'COMMON', type: 'DECOR' },
  { id: 'pebble', name: '조약돌', desc: '발밑에서 작은 돌이 반짝입니다.', rarity: 'COMMON', type: 'DECOR' },

  // RARE (데코/아이템)
  { id: 'mushroom', name: '버섯', desc: '습한 날에만 보이는 작은 버섯.', rarity: 'RARE', type: 'DECOR' },
  { id: 'windchime', name: '풍경', desc: '가만히 두면 마음이 가라앉아요.', rarity: 'RARE', type: 'DECOR' },
  { id: 'tea_ticket', name: '정원사 티타임 초대장', desc: '정원사 이벤트를 1회 호출할 수 있어요.', rarity: 'RARE', type: 'ITEM' },

  // EPIC
  { id: 'lantern', name: '등롱', desc: '밤에도 정원을 지켜주는 작은 빛.', rarity: 'EPIC', type: 'DECOR' },
  { id: 'bench', name: '작은 벤치', desc: '앉아서 숨을 고르는 자리.', rarity: 'EPIC', type: 'DECOR' },

  // LEGEND
  { id: 'pond', name: '연못', desc: '정원에 물길이 생겼습니다. 마음이 안정돼요.', rarity: 'LEGEND', type: 'DECOR' },
];

const rarityWeight: Record<RewardRarity, number> = {
  COMMON: 70,
  RARE: 22,
  EPIC: 7,
  LEGEND: 1,
};

export const pullGacha = (): RewardItem => {
  const bag: RewardItem[] = [];
  for (const item of REWARD_POOL) {
    const w = rarityWeight[item.rarity] ?? 1;
    for (let i = 0; i < w; i++) bag.push(item);
  }
  return bag[Math.floor(Math.random() * bag.length)];
};
