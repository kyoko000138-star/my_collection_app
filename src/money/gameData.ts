// src/money/gameData.ts

import { ItemData, CraftRecipe } from './types';

// ---------------------------------------------------------
// 1. 아이템 DB (Items)
// ---------------------------------------------------------
export const ITEM_DB: Record<string, ItemData> = {
  // --- 재료 (Materials) ---
  'PURE_ESSENCE': { id: 'PURE_ESSENCE', name: '순수 정수', type: 'material', desc: 'Junk를 정화하여 얻은 결정체.' },
  'HERB_LEAF': { id: 'HERB_LEAF', name: '신선한 약초 잎', type: 'material', desc: '필드에서 채집한 약초.' },
  'TIME_GEAR': { id: 'TIME_GEAR', name: '시간의 톱니바퀴', type: 'material', desc: '희귀한 제작 재료.' },
  
  // --- 도구/소모품 (Consumables) ---
  'water_can': { id: 'water_can', name: '물뿌리개', type: 'consumable', desc: '정원의 꽃을 생기있게 만듭니다.', effectType: 'GROWTH_BOOST', effectValue: 1 },
  'hoe': { id: 'hoe', name: '호미', type: 'consumable', desc: '잡초를 제거합니다.', effectType: 'JUNK_CLEAN', effectValue: 1 },
  'potion_mp_s': { id: 'potion_mp_s', name: '의지력 물약(소)', type: 'consumable', desc: 'MP를 5 회복합니다.', effectType: 'MP_RESTORE', effectValue: 5 },
  
  // --- 장비 (Equipment) ---
  'circ_wand': { id: 'circ_wand', name: '순환의 지팡이', type: 'equipment', desc: '정화 시 MP 소모를 줄여줍니다.', effectType: 'MP_COST_DOWN', effectValue: 1 },
  'ledger_sword': { id: 'ledger_sword', name: '장부 검', type: 'equipment', desc: '전투 중 Junk 획득량이 증가합니다.', effectType: 'SALT_BOOST', effectValue: 10 },
  'mini_vault': { id: 'mini_vault', name: '미니 금고', type: 'equipment', desc: 'Salt를 안전하게 보관합니다.', effectType: 'NONE' },
  
  // --- NPC 선물 (Gifts) ---
  'npc_tea': { id: 'npc_tea', name: '고요한 차 잎', type: 'consumable', desc: '정원사가 좋아하는 차.', effectType: 'NPC_LOVE', effectValue: 15 },
  'npc_record': { id: 'npc_record', name: '완벽한 기록 증서', type: 'consumable', desc: '천사가 좋아하는 증서.', effectType: 'NPC_LOVE', effectValue: 20 },
};

// ---------------------------------------------------------
// 2. 제작 레시피 DB (Recipes)
// ---------------------------------------------------------
export const RECIPE_DB: Record<string, CraftRecipe> = {
  // [기본] 정화 (Junk -> Essence)
  'PURE_ESSENCE_BASIC': {
    id: 'PURE_ESSENCE_BASIC',
    name: '기본 정화 (Junk→Essence)',
    resultItemId: 'PURE_ESSENCE',
    resultCount: 1,
    junkCost: 10,
    saltCost: 5,
    mpCost: 3,
    essenceCost: 0,
    category: 'BASIC'
  },
  
  // [장비] 순환의 지팡이
  'CRAFT_CIRC_WAND': {
    id: 'CRAFT_CIRC_WAND',
    name: '순환의 지팡이',
    resultItemId: 'circ_wand',
    resultCount: 1,
    junkCost: 0,
    saltCost: 5,
    mpCost: 5,
    essenceCost: 4,
    materials: { 'TIME_GEAR': 1 },
    category: 'EQUIPMENT'
  },

  // [장비] 장부 검
  'CRAFT_LEDGER_SWORD': {
    id: 'CRAFT_LEDGER_SWORD',
    name: '장부 검',
    resultItemId: 'ledger_sword',
    resultCount: 1,
    junkCost: 15,
    saltCost: 10,
    mpCost: 7,
    essenceCost: 0,
    materials: { 'HERB_LEAF': 1 },
    category: 'EQUIPMENT'
  },

  // [소모품] 물뿌리개
  'CRAFT_WATER_CAN': {
    id: 'CRAFT_WATER_CAN',
    name: '물뿌리개',
    resultItemId: 'water_can',
    resultCount: 1,
    junkCost: 5,
    saltCost: 2,
    mpCost: 2,
    essenceCost: 0,
    category: 'CONSUMABLE'
  },
  
  // [소모품] 호미
  'CRAFT_HOE': {
    id: 'CRAFT_HOE',
    name: '호미',
    resultItemId: 'hoe',
    resultCount: 1,
    junkCost: 8,
    saltCost: 3,
    mpCost: 3,
    essenceCost: 0,
    category: 'CONSUMABLE'
  }
};
