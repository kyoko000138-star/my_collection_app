import { LocationId } from './types';

// [V1.0] 맵 연결 정보
export const MAP_CONNECTIONS: Record<LocationId, { N?: LocationId, S?: LocationId, E?: LocationId, W?: LocationId }> = {
  'VILLAGE_BASE':    { N: 'FIELD_CROSSROAD' },
  'FIELD_CROSSROAD': { S: 'VILLAGE_BASE', W: 'FOREST_ENTRY', E: 'FIELD_PLAINS' },
  'FOREST_ENTRY':    { E: 'FIELD_CROSSROAD', W: 'FOREST_OUTLAW' },
  'FOREST_OUTLAW':   { E: 'FOREST_ENTRY' },
  'FIELD_PLAINS':    { W: 'FIELD_CROSSROAD', E: 'CITY_CAPITAL' },
  'CITY_CAPITAL':    { W: 'FIELD_PLAINS' }, 
  'REST_AREA':       {} 
};

// [V1.0] 맵 정보 (미니맵 좌표 포함)
export const MAP_INFO: Record<LocationId, { name: string; type: 'SAFE' | 'DANGER' | 'TOWN'; color: string; minimap: {x:number, y:number} }> = {
  'VILLAGE_BASE':    { name: '시작의 마을', type: 'TOWN', color: '#4ade80', minimap: {x: 2, y: 4} },
  'FIELD_CROSSROAD': { name: '운명의 갈림길', type: 'DANGER', color: '#d4d4d4', minimap: {x: 2, y: 3} },
  'FOREST_ENTRY':    { name: '깊은 숲 입구', type: 'DANGER', color: '#166534', minimap: {x: 1, y: 3} },
  'FOREST_OUTLAW':   { name: '무법자의 숲', type: 'DANGER', color: '#052e16', minimap: {x: 0, y: 3} },
  'FIELD_PLAINS':    { name: '바람의 들판', type: 'DANGER', color: '#86efac', minimap: {x: 3, y: 3} },
  'CITY_CAPITAL':    { name: '왕도 캐피탈', type: 'TOWN', color: '#60a5fa', minimap: {x: 4, y: 3} },
  'REST_AREA':       { name: '쉼터', type: 'SAFE', color: '#fcd34d', minimap: {x: 2, y: 2} }
};

// [V1.0] 자산 오브젝트
export const ASSET_OBJECTS = {
  fence: '🚧', hut: '⛺', house: '🏡', mansion: '🏰', castle: '🏯',
  fountain: '⛲', greenhouse: '🌿', statue: '🗿', barn: '🛖'
};

// [기존 1213 데이터 유지 - 실제 내용이 있어야 인벤토리 등 작동]
export const ITEM_DB: Record<string, any> = {
  'water_can': { id: 'water_can', name: '물뿌리개', type: 'consumable', desc: '정원 관리용' },
  'potion_mp_s': { id: 'potion_mp_s', name: '의지력 물약', type: 'consumable', desc: 'MP 5 회복' },
  // ... 필요 시 기존 데이터 추가
}; 
export const RECIPE_DB: Record<string, any> = {};
export const COLLECTION_DB = [];
export const WORLD_LOCATIONS = {}; // 구버전 호환용 빈 객체
