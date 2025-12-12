// 건물 위치 정의
const BUILDINGS = [
  { id: 'library', name: '도서관', x: 20, y: 30, icon: '🏛️' }, // 구독/기록
  { id: 'garden', name: '내 정원', x: 50, y: 50, icon: '🏡' }, // 집으로
  { id: 'shop', name: '잡화점', x: 80, y: 40, icon: '🏪' },   // 아이템
  { id: 'well', name: '정화의 우물', x: 30, y: 70, icon: '⛲' }, // 정화
  { id: 'gate', name: '성 밖으로', x: 50, y: 90, icon: '🚪' }, // 월드맵/탐험
];

// 캐릭터가 건물 근처에서 A버튼 누르면 해당 Scene으로 이동
