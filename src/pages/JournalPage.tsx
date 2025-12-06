import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Smile,
  Home,
  Coffee,
  Briefcase,
  ShoppingBag,
  Utensils,
  StickyNote,
  BarChart3,
  Footprints,
  Sparkles,
  Music,
  Coffee as CoffeeIcon,
  Flame,
  Waves,
  Droplets,
  Paperclip,
  Mail,
  Dumbbell,
  CalendarDays,
  Pin,
} from 'lucide-react';

// ===========================================
// 1. Constants & Data
// ===========================================

const WEATHER_ICONS = [
  {
    id: 'sun',
    icon: <Sun size={22} color="#F59E0B" fill="#F59E0B" />,
    label: '맑음',
  },
  {
    id: 'cloud',
    icon: <Cloud size={22} color="#94A3B8" fill="#94A3B8" />,
    label: '흐림',
  },
  {
    id: 'rain',
    icon: <CloudRain size={22} color="#3B82F6" fill="#E0F2FE" />,
    label: '비',
  },
  {
    id: 'snow',
    icon: <Snowflake size={22} color="#93C5FD" fill="#EFF6FF" />,
    label: '눈',
  },
  { id: 'wind', icon: <Wind size={22} color="#64748B" />, label: '바람' },
];

const DAY_MOODS = [
  {
    id: 'bright',
    icon: <Sun size={20} color="#FDB813" fill="#FDB813" />,
    label: '맑음',
  },
  {
    id: 'calm',
    icon: <CoffeeIcon size={20} color="#8D6E63" />,
    label: '차분',
  },
  {
    id: 'tired',
    icon: <span style={{ fontSize: 20 }}>😪</span>,
    label: '피곤',
  },
  {
    id: 'blue',
    icon: <CloudRain size={20} color="#3B82F6" />,
    label: '우울',
  },
  {
    id: 'anxious',
    icon: <Waves size={20} color="#1D4ED8" />,
    label: '불안',
  },
];

// 아이콘 8개 (약속, 기타 포함)
const PLACE_PRESETS = [
  { id: 'home', label: '집', icon: <Home size={16} /> },
  { id: 'work', label: '회사', icon: <Briefcase size={16} /> },
  { id: 'cafe', label: '카페', icon: <Coffee size={16} /> },
  { id: 'food', label: '식당', icon: <Utensils size={16} /> },
  { id: 'mart', label: '마트', icon: <ShoppingBag size={16} /> },
  { id: 'health', label: '운동', icon: <Dumbbell size={16} /> },
  { id: 'promise', label: '약속', icon: <CalendarDays size={16} /> },
  { id: 'etc', label: '기타', icon: <Pin size={16} /> },
];

// 기분 스티커
const ALL_MOOD_STAMPS = [
  {
    id: 'sun',
    icon: <Sun size={40} color="#FDB813" fill="#FDB813" />,
    label: '개운',
    type: 'success',
  },
  {
    id: 'sparkle',
    icon: <Sparkles size={40} color="#FFD700" fill="#FFD700" />,
    label: '뿌듯',
    type: 'success',
  },
  {
    id: 'smile',
    icon: <Smile size={40} color="#FF6B6B" fill="#FFF0F0" />,
    label: '좋음',
    type: 'success',
  },
  {
    id: 'music',
    icon: <Music size={40} color="#4ECDC4" />,
    label: '신남',
    type: 'success',
  },
  {
    id: 'seed',
    icon: <span style={{ fontSize: '40px' }}>🌱</span>,
    label: '다짐',
    type: 'calm',
  },
  {
    id: 'mug',
    icon: <CoffeeIcon size={40} color="#8D6E63" />,
    label: '휴식',
    type: 'calm',
  },
  {
    id: 'candle',
    icon: <span style={{ fontSize: '40px' }}>🕯️</span>,
    label: '무던',
    type: 'calm',
  },
  {
    id: 'moon',
    icon: <span style={{ fontSize: '40px' }}>🌙</span>,
    label: '피곤',
    type: 'calm',
  },
  {
    id: 'cloud',
    icon: <Cloud size={40} color="#90A4AE" fill="#90A4AE" />,
    label: '우울',
    type: 'cheer',
  },
  {
    id: 'tear',
    icon: <Droplets size={40} color="#4FC3F7" fill="#E1F5FE" />,
    label: '슬픔',
    type: 'cheer',
  },
  {
    id: 'wave',
    icon: <Waves size={40} color="#1A237E" />,
    label: '불안',
    type: 'cheer',
  },
  {
    id: 'fire',
    icon: <Flame size={40} color="#FF5722" fill="#FF5722" />,
    label: '분노',
    type: 'cheer',
  },
  {
    id: 'clip',
    icon: <Paperclip size={40} color="#555" />,
    label: '복잡',
    type: 'cheer',
  },
  {
    id: 'post',
    icon: <Mail size={40} color="#795548" />,
    label: '회피',
    type: 'cheer',
  },
];

// 밈 스탬프
const STAMP_VARIANTS = {
  success: [
    { text: '찢었다', shape: 'rect_double', color: '#D32F2F' },
    { text: '내가\n해냄', shape: 'circle_filled', color: '#304FFE' },
    { text: '이걸\n해냄', shape: 'rect', color: '#D32F2F' },
    { text: '이게\n되네', shape: 'rect_double', color: '#1976D2' },
    { text: '폼\n미쳤다', shape: 'rect', color: '#304FFE' },
  ],
  cheer: [
    { text: '이건\n안되네', shape: 'rect_double', color: '#555555' },
    { text: '중요한건\n꺾이지\n않는마음', shape: 'rect_lg', color: '#D32F2F' },
    { text: '가보자고', shape: 'rect_double', color: '#D32F2F' },
    { text: '존버는\n승리\n한다', shape: 'circle', color: '#304FFE' },
    { text: '고생\n했다', shape: 'circle', color: '#D32F2F' },
  ],
  calm: [
    { text: '오히려\n좋아', shape: 'circle', color: '#1976D2' },
    { text: '알잘\n딱깔센', shape: 'rect', color: '#D32F2F' },
    { text: '소확행', shape: 'circle', color: '#304FFE' },
    { text: '어쩔\n티비', shape: 'circle_filled', color: '#D32F2F' },
    { text: '내일\n하자', shape: 'circle', color: '#555555' },
  ],
};

// 멘탈케어 글감 60개 (생략 없이 그대로)
const PROMPTS = [
  {
    id: 1,
    title: '오늘 미루지 않고 바로 해치운 아주 작은 일은?',
    category: 'action',
  },
  { id: 2, title: '오늘 "이 정도면 충분해"라고 멈춘 순간', category: 'action' },
  {
    id: 3,
    title: '오늘 충동적인 행동을 참아낸 순간이 있었나요?',
    category: 'action',
  },
  {
    id: 4,
    title: '완벽하지 않아도 괜찮았던 오늘의 결과물',
    category: 'action',
  },
  { id: 5, title: '오늘 나를 덜 피곤하게 만든 요령(꼼수)', category: 'action' },
  {
    id: 6,
    title: '오늘 계획대로 안 됐지만 큰일 나지 않은 일',
    category: 'action',
  },
  { id: 7, title: '오늘 늦었지만 포기하지 않고 시작한 일', category: 'action' },
  { id: 8, title: '오늘 침대에서 벗어나기 위해 쓴 방법', category: 'action' },
  { id: 9, title: '오늘 깜빡했지만 수습 가능했던 일', category: 'action' },
  {
    id: 10,
    title: '오늘 나를 도와준 도구(알람, 메모, 약 등)',
    category: 'action',
  },
  {
    id: 11,
    title: '오늘 밥을 챙겨 먹은 나에게 칭찬 한마디',
    category: 'action',
  },
  {
    id: 12,
    title: '오늘 씻거나 양치한 것만으로도 성공이다',
    category: 'action',
  },
  {
    id: 13,
    title: '오늘 스마트폰을 내려놓고 딴짓 한 시간',
    category: 'action',
  },
  { id: 14, title: '오늘 10분이라도 집중했던 순간', category: 'action' },
  {
    id: 15,
    title: '오늘 귀찮았지만 막상 하고 나니 괜찮았던 일',
    category: 'action',
  },
  {
    id: 16,
    title: '오늘 불안했지만 실제로 일어나지 않은 걱정은?',
    category: 'mind',
  },
  {
    id: 17,
    title: '오늘 내 머릿속 생각과 실제 사실을 구분해 본다면?',
    category: 'mind',
  },
  {
    id: 18,
    title: '오늘 "해야만 해"를 "하면 좋지"로 바꿔본 일',
    category: 'mind',
  },
  {
    id: 19,
    title: '오늘 남의 눈치 안 보고 내가 원하는 걸 선택한 일',
    category: 'mind',
  },
  {
    id: 20,
    title: '오늘 나에게 닥친 문제를 작게 쪼개서 생각한 일',
    category: 'mind',
  },
  {
    id: 21,
    title: '오늘 반복되는 강박적인 생각을 흘려보낸 순간',
    category: 'mind',
  },
  {
    id: 22,
    title: '오늘 "모르겠다"라고 솔직하게 인정한 순간',
    category: 'mind',
  },
  {
    id: 23,
    title: '오늘 타인의 감정을 내 것으로 가져오지 않은 일',
    category: 'mind',
  },
  { id: 24, title: '오늘 나를 자책하지 않고 넘어간 순간', category: 'mind' },
  { id: 25, title: '오늘 거절하거나 경계를 지킨 일', category: 'mind' },
  {
    id: 26,
    title: '오늘 미래의 걱정 대신 당장 할 일에 집중한 순간',
    category: 'mind',
  },
  {
    id: 27,
    title: '오늘 남과 비교하지 않고 나에게 집중한 순간',
    category: 'mind',
  },
  {
    id: 28,
    title: '오늘 "망했다"고 생각했지만 사실은 별거 아니었던 일',
    category: 'mind',
  },
  {
    id: 29,
    title: '오늘 내가 통제할 수 없는 일을 받아들인 순간',
    category: 'mind',
  },
  {
    id: 30,
    title: '오늘 하루, 버텨낸 것만으로도 충분한 이유',
    category: 'mind',
  },
  {
    id: 31,
    title: '지금 당장 내 몸에서 느껴지는 감각 3가지',
    category: 'sensory',
  },
  {
    id: 32,
    title: '오늘 밥을 먹을 때 느꼈던 맛이나 식감',
    category: 'sensory',
  },
  {
    id: 33,
    title: '오늘 샤워할 때 물의 온도나 비누 향기',
    category: 'sensory',
  },
  {
    id: 34,
    title: '오늘 듣기 좋았던 소리 (빗소리, 타자 소리 등)',
    category: 'sensory',
  },
  {
    id: 35,
    title: '오늘 눈에 들어온 편안한 색깔이나 풍경',
    category: 'sensory',
  },
  { id: 36, title: '오늘 깊게 숨을 들이마시고 내쉰 순간', category: 'sensory' },
  {
    id: 37,
    title: '오늘 과한 자극(소음, 빛)에서 잠시 멀어진 시간',
    category: 'sensory',
  },
  {
    id: 38,
    title: '오늘 멍하니 보내며 뇌를 쉬게 해준 시간',
    category: 'sensory',
  },
  {
    id: 39,
    title: '오늘 햇볕이나 바람을 느꼈던 찰나의 시간',
    category: 'sensory',
  },
  { id: 40, title: '오늘 푹신한 이불이나 의자의 감촉', category: 'sensory' },
  { id: 41, title: '오늘 마신 물이나 음료의 온도', category: 'sensory' },
  {
    id: 42,
    title: '오늘 몸을 움직여서(스트레칭 등) 기분 전환한 일',
    category: 'sensory',
  },
  { id: 43, title: '오늘 나를 위해 정리정돈을 한 공간', category: 'sensory' },
  { id: 44, title: '오늘 잠시라도 하늘을 올려다본 순간', category: 'sensory' },
  {
    id: 45,
    title: '오늘 내 몸이 보내는 신호(통증, 피로)를 알아챘나요?',
    category: 'sensory',
  },
  {
    id: 46,
    title: '오늘 나를 조금이라도 웃게 한 아주 작은 순간',
    category: 'emotion',
  },
  {
    id: 47,
    title: '오늘 내가 억지로 참지 않고 표현한 감정',
    category: 'emotion',
  },
  {
    id: 48,
    title: '오늘 예민해졌을 때 나를 진정시켜준 방법',
    category: 'emotion',
  },
  {
    id: 49,
    title: '오늘 내 감정을 판단하지 않고 그냥 바라본 경험',
    category: 'emotion',
  },
  {
    id: 50,
    title: '오늘 약속을 취소해서 오히려 편안해졌나요?',
    category: 'emotion',
  },
  {
    id: 51,
    title: '오늘 나를 지지해주는 사람(혹은 동물) 생각하기',
    category: 'emotion',
  },
  {
    id: 52,
    title: '오늘 좋아하는 음악이나 영상을 보며 쉰 시간',
    category: 'emotion',
  },
  {
    id: 53,
    title: '오늘 카페인이나 당을 조절해서 기분이 어땠나요?',
    category: 'emotion',
  },
  {
    id: 54,
    title: '오늘 내가 정한 작은 규칙을 지켜서 뿌듯한 점',
    category: 'emotion',
  },
  {
    id: 55,
    title: '오늘 아무것도 하지 않아도 불안해하지 않았던 시간',
    category: 'emotion',
  },
  {
    id: 56,
    title: '오늘 나를 짓누르던 책임감을 조금 내려놓은 일',
    category: 'emotion',
  },
  {
    id: 57,
    title: '오늘 실수했지만 쿨하게 넘긴 나에게 칭찬',
    category: 'emotion',
  },
  { id: 58, title: '오늘 내 기분을 날씨로 표현한다면?', category: 'emotion' },
  {
    id: 59,
    title: '오늘 잃어버린 물건 없이 잘 챙긴 나에게 칭찬',
    category: 'emotion',
  },
  {
    id: 60,
    title: '오늘 나를 재촉하지 않고 기다려준 순간',
    category: 'emotion',
  },
];

const PROMPTS_PER_DAY = 3;

// ===========================================
// 2. Helpers & Types
// ===========================================

type TimelineItem = {
  id: string;
  time: string;
  category: string;
  place: string;
};

type AnswerData = {
  text: string;
  moodId: string | null;
  stampVariant?: {
    text: string;
    shape: string;
    color: string;
    rotation?: number;
  } | null;
};

type JournalEntryData = {
  dateKey: string;
  weatherId: string | null;
  dayMoodId: string | null;
  promptIds: number[];
  answers: Record<number, AnswerData>;
  freeContent: string;
  timeline: TimelineItem[];
  updatedAt: number;
};

type MonthlyMemoItem = {
  id: string;
  text: string;
  done: boolean;
};

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatHandwrittenDate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${dayName}요일`;
}

function pickRandomPromptIds(count: number): number[] {
  const indices = PROMPTS.map((p) => p.id);
  return indices.sort(() => 0.5 - Math.random()).slice(0, count);
}

// 스마트 스탬프 로직
function getSmartStamp(moodId: string | null, promptId: number) {
  if (!moodId) return null;
  const prompt = PROMPTS.find((p) => p.id === promptId);
  const moodInfo = ALL_MOOD_STAMPS.find((m) => m.id === moodId);
  if (!prompt || !moodInfo) return null;

  const moodType = moodInfo.type;
  const promptCat = prompt.category || 'neutral';
  let candidates =
    STAMP_VARIANTS[moodType as keyof typeof STAMP_VARIANTS] || [];

  if (
    promptCat === 'action' &&
    (moodType === 'success' || moodType === 'calm')
  ) {
    const targetTexts = ['찢었다', '내가\n해냄', '이게\n되네', '알잘\n딱깔센'];
    const matches = candidates.filter((c) => targetTexts.includes(c.text));
    if (matches.length > 0)
      return matches[Math.floor(Math.random() * matches.length)];
  }

  if (promptCat === 'mind' && (moodType === 'cheer' || moodType === 'calm')) {
    const targetTexts = [
      '존버는\n승리\n한다',
      '중요한건\n꺾이지\n않는마음',
      '오히려\n좋아',
      '버팀',
    ];
    const matches = candidates.filter((c) => targetTexts.includes(c.text));
    if (matches.length > 0)
      return matches[Math.floor(Math.random() * matches.length)];
  }

  if (promptCat === 'emotion' && moodType === 'cheer') {
    const targetTexts = ['고생\n했다', '이건\n안되네', '토닥\n토닥'];
    const matches = candidates.filter((c) => targetTexts.includes(c.text));
    if (matches.length > 0)
      return matches[Math.floor(Math.random() * matches.length)];
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

const STORAGE_KEY = 'journal_v25_final_v13';
const MEMO_STORAGE_KEY = 'journal_monthly_memos';

// localStorage helpers
async function loadAllEntries(): Promise<Record<string, JournalEntryData>> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  return JSON.parse(raw);
}

async function loadJournalEntry(
  dateKey: string
): Promise<JournalEntryData | null> {
  const all = await loadAllEntries();
  return all[dateKey] || null;
}

async function saveJournalEntry(dateKey: string, data: JournalEntryData) {
  const all = await loadAllEntries();
  all[dateKey] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// 이달의 메모 체크리스트 로딩
function loadMonthlyMemo(year: number, month: number): MonthlyMemoItem[] {
  const raw = localStorage.getItem(MEMO_STORAGE_KEY);
  if (!raw) return [];
  try {
    const memos = JSON.parse(raw);
    const key = `${year}-${month}`;
    const data = memos[key];

    if (!data) return [];

    if (Array.isArray(data)) return data as MonthlyMemoItem[];

    if (typeof data === 'string') {
      if (!data.trim()) return [];
      return data.split('\n').map((line: string) => ({
        id: Math.random().toString(36).slice(2),
        text: line.trim(),
        done: false,
      }));
    }
    return [];
  } catch (e) {
    console.error('Failed to load monthly memo', e);
    return [];
  }
}

function saveMonthlyMemo(
  year: number,
  month: number,
  items: MonthlyMemoItem[]
) {
  const raw = localStorage.getItem(MEMO_STORAGE_KEY);
  let memos: any = {};
  try {
    memos = raw ? JSON.parse(raw) : {};
  } catch {
    memos = {};
  }
  memos[`${year}-${month}`] = items;
  localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
}

// ===========================================
// 3. Styles (Modern Korean Edition)
// ===========================================

const LINE_HEIGHT = 32;

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&family=Black+Han+Sans&display=swap');
  
  body {
    background-color: #f0f0f0;
    margin: 0;
    color: #2c2c2c;
    font-family: 'Noto Sans KR', sans-serif; 
  }

  .lined-textarea {
    font-family: 'Nanum Myeongjo', serif;
    font-size: 16px !important;
    line-height: ${LINE_HEIGHT}px !important;
    padding-top: 6px !important;
    color: #111;
    font-weight: 400;
  }

  .light-placeholder::placeholder {
    color: #bbb; 
    font-family: 'Nanum Myeongjo', serif;
    font-style: normal;
  }

  /* ✨ 오늘의 생각 전용: 폰트/줄간격 줄이기 */
  .answer-textarea {
    font-size: 14px !important;
    line-height: 24px !important;
  }

  @keyframes stamp-in {
    0% { opacity: 0; transform: scale(2); }
    70% { opacity: 1; transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  .stamp-animation {
    animation: stamp-in 0.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }
`;

const styles: any = {
  wrapper: {
    minHeight: '100vh',
    padding: '24px 20px 40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F7F7F7',
  },
  paper: {
    width: '100%',
    maxWidth: '460px',
    minHeight: '850px',
    backgroundColor: '#FFFFFF',
    padding: '20px 30px 80px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    position: 'relative' as const,
    backgroundImage: `linear-gradient(transparent ${
      LINE_HEIGHT - 1
    }px, #EEEEEE ${LINE_HEIGHT - 1}px)`,
    backgroundSize: `100% ${LINE_HEIGHT}px`,
    backgroundAttachment: 'local',
    backgroundPosition: '0 10px',
    borderRadius: '4px',
    margin: '0 auto',
  },

  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '5px',
    borderBottom: '2px solid #111',
  },

  dateBlock: {
    flex: 1,
    marginLeft: '8px',
    textAlign: 'center' as const, // ✅ 가운데 정렬
  },

  dateTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111',
    fontFamily: "'Noto Sans KR', sans-serif",
    letterSpacing: '-0.5px',
    whiteSpace: 'nowrap' as const, // ✅ "화요일"이 둘로 안 찢어지게
  },

  dateMetaRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },

  dateMetaLabel: {
    fontSize: '12px',
    color: '#999',
    fontFamily: "'Noto Sans KR', sans-serif",
  },

  dateSubTitle: {
    fontSize: '14px',
    color: '#444',
    fontFamily: "'Noto Sans KR', sans-serif",
  },

  dateTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111',
    fontFamily: "'Noto Sans KR', sans-serif",
    letterSpacing: '-0.5px',
  },

  headerStatusRow: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column', // 위·아래로 쌓기
    justifyContent: 'space-between',
    marginTop: '6px',
    marginBottom: '16px',
  },

  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // 왼쪽: 라벨, 오른쪽: 아이콘
    width: '100%',
  },

  statusLabel: {
    fontSize: '11px',
    color: '#777',
    fontFamily: "'Noto Sans KR', sans-serif",
  },

  weatherSmallRow: {
    display: 'flex',
    gap: '8px',
  },

  weatherSmallBtn: (selected: boolean) => ({
    width: 30,
    height: 30,
    borderRadius: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: selected ? '1px solid #111' : '1px solid transparent',
    backgroundColor: selected ? '#111' : 'transparent',
    opacity: selected ? 1 : 0.4,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),

  dayMoodRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },

  dayMoodBtn: (selected: boolean) => ({
    width: 32,
    height: 32,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: selected ? '1px solid #111' : '1px solid #E5E7EB',
    backgroundColor: selected ? '#111' : '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),

  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '15px',
    cursor: 'pointer',
    color: '#555',
    fontFamily: "'Noto Sans KR', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500',
  },

  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: '20px',
    fontWeight: '700',
    color: '#111',
  },
  calendarBody: { backgroundColor: 'transparent', padding: '0' },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '10px',
  },
  dayCell: (hasEntry: boolean, isToday: boolean) => ({
    height: '44px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    borderRadius: '12px',
    backgroundColor: isToday ? '#222' : hasEntry ? '#F3F4F6' : 'transparent',
    color: isToday ? '#fff' : '#111',
    border: 'none',
    fontSize: '15px',
    fontWeight: isToday ? '700' : hasEntry ? '600' : '400',
  }),

  modulesArea: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  moduleBox: {
    position: 'relative' as const,
    padding: '20px',
    backgroundColor: '#FAFAFA',
    borderRadius: '16px',
  },
  moduleTitle: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: '14px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  weatherArea: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '40px',
  },
  weatherBtn: (isSelected: boolean) => ({
    border: 'none',
    background: 'transparent',
    opacity: isSelected ? 1 : 0.3,
    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
    transition: 'all 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
  }),

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
    marginBottom: '12px',
    borderBottom: '1px solid #ddd',
    paddingBottom: '6px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontFamily: "'Noto Sans KR', sans-serif",
    fontWeight: '700',
    color: '#111',
  },
  refreshBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#888',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontFamily: "'Noto Sans KR', sans-serif",
  },

  promptContainer: { marginBottom: '24px', position: 'relative' as const },
  promptHeaderRow: {
    display: 'flex',
    alignItems: 'flex-start',
    paddingRight: '40px',
    marginBottom: '4px',
  },
  promptQ: {
    fontFamily: "'Nanum Myeongjo', serif",
    fontWeight: '700',
    fontSize: '16px',
    color: '#999',
    lineHeight: '1.4',
    minWidth: '24px',
  },
  promptText: {
    fontFamily: "'Nanum Myeongjo', serif",
    fontWeight: '700',
    fontSize: '15px',
    color: '#222',
    lineHeight: '1.4',
    wordBreak: 'keep-all' as const,
  },

  inputWrapper: { position: 'relative' as const, width: '100%' },
  textarea: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    resize: 'none' as const,
    minHeight: `${LINE_HEIGHT * 2}px`,
    overflow: 'hidden',
    textAlign: 'left' as const,
    paddingRight: '60px',
    paddingLeft: '28px',
    boxSizing: 'border-box' as const,
  },

  // 스탬프 위치/스타일
  stampZone: {
    position: 'absolute' as const,
    right: '-10px',
    bottom: '24px',
    width: 'auto',
    height: 'auto',
    pointerEvents: 'none' as const,
    zIndex: 10,
  },
  stampBody: (color: string, shape: string) => ({
    border: shape.includes('rect_double')
      ? `4px double ${color}`
      : `3px solid ${color}`,
    backgroundColor: shape.includes('filled') ? color : 'transparent',
    color: shape.includes('filled') ? '#fff' : color,
    fontFamily: "'Black Han Sans', sans-serif",
    fontSize: shape.includes('rect_lg') ? '28px' : '26px',
    padding: shape.includes('rect') ? '8px 16px' : '0',
    width: shape.includes('circle') ? '90px' : 'auto',
    height: shape.includes('circle') ? '90px' : 'auto',
    borderRadius: shape.includes('circle') ? '50%' : '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    whiteSpace: 'pre-line' as const,
    lineHeight: '1.1',
    mixBlendMode: 'multiply' as const,
    opacity: 0.95,
    boxShadow: '0 0 0 1px transparent',
  }),

  moodTrigger: {
    position: 'absolute' as const,
    right: '0px',
    top: '0px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#ccc',
    padding: '6px',
  },
  moodSelectorPopup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: '20px',
    border: '1px solid #eee',
    marginBottom: '15px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
    borderRadius: '12px',
    zIndex: 20,
    position: 'relative' as const,
  },
  moodItem: (index: number) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    cursor: 'pointer',
    gap: '4px',
    transform: `rotate(${index % 2 === 0 ? 2 : -2}deg)`,
    margin: '4px',
  }),
  moodLabel: {
    fontSize: '11px',
    fontFamily: "'Noto Sans KR', sans-serif",
    color: '#666',
  },

  // 오늘의 여정 프리셋
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px 6px',
    marginBottom: '16px',
  },
  placePresetBtn: (isSelected: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    border: isSelected ? '2px solid #222' : '1px solid #eee',
    backgroundColor: isSelected ? '#222' : '#fff',
    padding: '8px 0',
    borderRadius: '14px',
    fontSize: '12px',
    fontWeight: '500',
    color: isSelected ? '#fff' : '#4B5563',
    fontFamily: "'Noto Sans KR', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.1s',
  }),

  timelineInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    boxSizing: 'border-box',
    paddingBottom: '8px',
    borderBottom: '1px solid #ccc',
    overflow: 'hidden', // 줄 안에서만 보이게
  },
  selectedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#222',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    flexShrink: 0,
  },

  saveBtn: {
    marginTop: '48px',
    backgroundColor: '#222',
    border: 'none',
    borderRadius: '8px',
    padding: '16px 0',
    width: '100%',
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'Noto Sans KR', sans-serif",
  },
};

// ===========================================
// 4. Components
// ===========================================

export default function App() {
  const [view, setView] = useState<'calendar' | 'journal'>('calendar');
  const [targetDate, setTargetDate] = useState(new Date());

  const handleDateClick = (date: Date) => {
    setTargetDate(date);
    setView('journal');
  };

  const handleBack = () => setView('calendar');

  return (
    <>
      <style>{fontStyle}</style>
      <div style={styles.wrapper}>
        {view === 'calendar' ? (
          <CalendarView onDateSelect={handleDateClick} />
        ) : (
          <JournalView targetDate={targetDate} onBack={handleBack} />
        )}
      </div>
    </>
  );
}

function CalendarView({ onDateSelect }: { onDateSelect: (d: Date) => void }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [entryMap, setEntryMap] = useState<Record<string, boolean>>({});
  const [monthlyMemoItems, setMonthlyMemoItems] = useState<MonthlyMemoItem[]>(
    []
  );
  const [moodStats, setMoodStats] = useState<
    { icon: any; label: string; count: number }[]
  >([]);
  const [escapeStats, setEscapeStats] = useState<
    { place: string; count: number }[]
  >([]);
  const [allData, setAllData] = useState<Record<string, JournalEntryData>>({});

  useEffect(() => {
    loadAllEntries().then((data) => {
      setAllData(data);
      const map: Record<string, boolean> = {};
      Object.keys(data).forEach((key) => (map[key] = true));
      setEntryMap(map);
    });
  }, [year, month]);

  useEffect(() => {
    setMonthlyMemoItems(loadMonthlyMemo(year, month + 1));
    calculateStats(allData, year, month);
  }, [allData, year, month]);

  useEffect(() => {
    saveMonthlyMemo(year, month + 1, monthlyMemoItems);
  }, [monthlyMemoItems, year, month]);

  const calculateStats = (
    data: Record<string, JournalEntryData>,
    y: number,
    m: number
  ) => {
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
    const monthlyEntries = Object.values(data).filter((e) =>
      e.dateKey.startsWith(prefix)
    );

    const moodCounts: Record<string, number> = {};
    monthlyEntries.forEach((e) => {
      Object.values(e.answers).forEach((ans) => {
        if (ans.moodId)
          moodCounts[ans.moodId] = (moodCounts[ans.moodId] || 0) + 1;
      });
    });

    setMoodStats(
      Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, count]) => {
          const info = ALL_MOOD_STAMPS.find((s) => s.id === id);
          return info ? { icon: info.icon, label: info.label, count } : null;
        })
        .filter(Boolean) as any[]
    );

    const placeCounts: Record<string, number> = {};
    monthlyEntries.forEach((e) => {
      e.timeline.forEach((t) => {
        if (t.category !== 'home' && t.category !== 'work') {
          const placeName = t.place.trim() || '외출';
          placeCounts[placeName] = (placeCounts[placeName] || 0) + 1;
        }
      });
    });
    setEscapeStats(
      Object.entries(placeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([p, c]) => ({ place: p, count: c }))
    );
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handlePrev = () =>
    month === 0 ? (setMonth(11), setYear(year - 1)) : setMonth(month - 1);

  const handleNext = () =>
    month === 11 ? (setMonth(0), setYear(year + 1)) : setMonth(month + 1);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(year, month, d);
    const dKey = formatDateKey(dObj);
    const isToday = formatDateKey(new Date()) === dKey;
    const hasEntry = entryMap[dKey];
    days.push(
      <div
        key={d}
        style={styles.dayCell(hasEntry, isToday)}
        onClick={() => onDateSelect(dObj)}
      >
        <span style={{ zIndex: 1 }}>{d}</span>
      </div>
    );
  }

  const handleAddMemoItem = () => {
    setMonthlyMemoItems((prev) => [
      ...prev,
      { id: Date.now().toString(), text: '', done: false },
    ]);
  };
  const handleToggleMemoItem = (id: string) => {
    setMonthlyMemoItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };
  const handleChangeMemoText = (id: string, text: string) => {
    setMonthlyMemoItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };
  const handleRemoveMemoItem = (id: string) => {
    setMonthlyMemoItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div style={styles.paper}>
      <div style={styles.calendarHeader}>
        <button onClick={handlePrev} style={styles.backBtn}>
          <ChevronLeft size={20} />
        </button>
        <span>
          {year}년 {month + 1}월
        </span>
        <button onClick={handleNext} style={styles.backBtn}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={styles.calendarBody}>
        <div style={styles.calendarGrid}>
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <div
              key={d}
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#888',
                fontWeight: '500',
              }}
            >
              {d}
            </div>
          ))}
          {days}
        </div>
      </div>

      <div style={styles.modulesArea}>
        {/* 이달의 메모 - 체크리스트 */}
        <div style={styles.moduleBox}>
          <div style={styles.moduleTitle}>
            <StickyNote size={16} /> 이달의 메모
          </div>
          <div style={{ marginTop: '4px' }}>
            {monthlyMemoItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => handleToggleMemoItem(item.id)}
                  style={{ width: 16, height: 16 }}
                />
                <input
                  value={item.text}
                  onChange={(e) =>
                    handleChangeMemoText(item.id, e.target.value)
                  }
                  placeholder="해야 할 일 혹은 기억하고 싶은 것..."
                  className="lined-textarea"
                  style={{
                    ...styles.textarea,
                    paddingLeft: '4px',
                    paddingRight: 0,
                    minHeight: LINE_HEIGHT,
                    fontSize: 14,
                    borderBottom: '1px dashed #ddd',
                  }}
                />
                <button
                  onClick={() => handleRemoveMemoItem(item.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#bbb',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddMemoItem}
              style={{
                marginTop: '6px',
                border: 'none',
                background: 'none',
                color: '#555',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} /> 항목 추가
            </button>
          </div>
        </div>

        {/* 기분 통계 */}
        <div style={styles.moduleBox}>
          <div style={styles.moduleTitle}>
            <BarChart3 size={16} /> 기분 통계
          </div>
          <div
            style={{
              display: 'flex',
              gap: '30px',
              marginTop: '10px',
              paddingLeft: '4px',
            }}
          >
            {moodStats.length > 0 ? (
              moodStats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px' }}>{s.icon}</div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#111',
                      fontWeight: '600',
                      marginTop: '6px',
                    }}
                  >
                    {s.count}회
                  </div>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '14px', color: '#bbb' }}>
                데이터 없음
              </span>
            )}
          </div>
        </div>

        {/* 방문 장소 */}
        <div style={styles.moduleBox}>
          <div style={styles.moduleTitle}>
            <Footprints size={16} /> 방문 장소
          </div>
          <div style={{ marginTop: '10px', paddingLeft: '4px' }}>
            {escapeStats.length > 0 ? (
              escapeStats.map((s, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#fff',
                    border: '1px solid #eee',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#444',
                    marginRight: '6px',
                    marginBottom: '6px',
                    fontFamily: "'Noto Sans KR', sans-serif",
                  }}
                >
                  {s.place}{' '}
                  <span style={{ opacity: 0.5, fontSize: '11px' }}>
                    ({s.count})
                  </span>
                </span>
              ))
            ) : (
              <span style={{ fontSize: '14px', color: '#bbb' }}>
                집/회사 위주
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JournalView({
  targetDate,
  onBack,
}: {
  targetDate: Date;
  onBack: () => void;
}) {
  const dateKey = useMemo(() => formatDateKey(targetDate), [targetDate]);

  const [selectedWeatherId, setSelectedWeatherId] = useState<string | null>(
    null
  );
  const [dayMoodId, setDayMoodId] = useState<string | null>(null);
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, AnswerData>>({});
  const [freeContent, setFreeContent] = useState('');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const [tlTime, setTlTime] = useState('');
  const [tlPlace, setTlPlace] = useState('');
  const [tlCategory, setTlCategory] = useState<string>('');

  const [activeMoodSelector, setActiveMoodSelector] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadJournalEntry(dateKey).then((data) => {
      if (data) {
        setSelectedWeatherId(data.weatherId || null);
        setDayMoodId(data.dayMoodId || null);
        setSelectedPromptIds(data.promptIds);
        setAnswers(data.answers || {});
        setFreeContent(data.freeContent || '');
        setTimeline(data.timeline || []);
      } else {
        setSelectedPromptIds(pickRandomPromptIds(PROMPTS_PER_DAY));
        setAnswers({});
      }
    });
  }, [dateKey]);

  const handleShuffle = () => {
    setSelectedPromptIds(pickRandomPromptIds(PROMPTS_PER_DAY));
    setAnswers({});
  };

  const handleAnswerChange = (id: number, val: string) =>
    setAnswers((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { moodId: null }), text: val },
    }));

  const handleMoodSelect = (promptId: number, moodId: string) => {
    const baseStamp = getSmartStamp(moodId, promptId);
    const rotation = Math.random() * 22 - 14;
    const stamp =
      baseStamp && ({ ...baseStamp, rotation } as AnswerData['stampVariant']);

    setAnswers((prev) => ({
      ...prev,
      [promptId]: {
        ...(prev[promptId] || { text: '' }),
        moodId,
        stampVariant: stamp,
      },
    }));
    setActiveMoodSelector(null);
  };

  // 시간 포맷터: 숫자 -> HH:MM
  const formatTimeDigits = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';

    let h = '00';
    let m = '00';

    if (digits.length <= 2) {
      h = digits.padStart(2, '0');
    } else if (digits.length === 3) {
      h = digits.slice(0, 1).padStart(2, '0');
      m = digits.slice(1).padEnd(2, '0').slice(0, 2);
    } else {
      h = digits.slice(0, 2);
      m = digits.slice(2, 4).padEnd(2, '0').slice(0, 2);
    }

    let hourNum = Math.min(parseInt(h, 10) || 0, 23);
    let minNum = Math.min(parseInt(m, 10) || 0, 59);
    return `${hourNum.toString().padStart(2, '0')}:${minNum
      .toString()
      .padStart(2, '0')}`;
  };

  const handleTimeChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    setTlTime(digits);
  };

  const handleTimeBlur = () => {
    if (!tlTime) return;
    setTlTime(formatTimeDigits(tlTime));
  };

  const handlePresetClick = (id: string) => {
    setTlCategory(id);
  };

  const handleAddTimeline = () => {
    const formattedTime = tlTime.includes(':')
      ? tlTime
      : formatTimeDigits(tlTime);

    const cat = tlCategory || 'etc';
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      time: formattedTime || '00:00',
      place: tlPlace,
      category: cat,
    };
    setTimeline((prev) => [...prev, newItem]);
    setTlTime('');
    setTlPlace('');
    // 카테고리는 유지
  };

  const handleUpdateTimeline = (id: string, newVal: string) => {
    setTimeline((prev) =>
      prev.map((t) => (t.id === id ? { ...t, place: newVal } : t))
    );
  };

  const handleRemoveTimeline = (id: string) =>
    setTimeline((prev) => prev.filter((t) => t.id !== id));

  const handleSave = async () => {
    const data: JournalEntryData = {
      dateKey,
      weatherId: selectedWeatherId,
      dayMoodId,
      promptIds: selectedPromptIds,
      answers,
      freeContent,
      timeline,
      updatedAt: Date.now(),
    };
    await saveJournalEntry(dateKey, data);
    alert('저장되었습니다.');
  };

  return (
    <div style={styles.paper}>
      <div style={styles.headerRow}>
        <button onClick={onBack} style={styles.backBtn}>
          <ChevronLeft size={1} /> 목록
        </button>

        {/* ✅ 가운데 정렬된 날짜 한 줄 */}
        <div style={styles.dateBlock}>
          <span style={styles.dateTitle}>
            {formatHandwrittenDate(targetDate)}
          </span>
        </div>

        <div style={{ width: '40px' }} />
      </div>

      {/* 날짜 바로 아래: 오늘의 날씨 / 오늘의 기분 */}
      <div style={styles.headerStatusRow}>
        <div style={styles.statusGroup}>
          <span style={styles.statusLabel}>오늘의 날씨</span>
          <div style={styles.weatherSmallRow}>
            {WEATHER_ICONS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWeatherId(w.id)}
                style={styles.weatherSmallBtn(selectedWeatherId === w.id)}
              >
                {w.icon}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.statusGroup}>
          <span style={styles.statusLabel}>오늘의 기분</span>
          <div style={styles.dayMoodRow}>
            {DAY_MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setDayMoodId(m.id)}
                style={styles.dayMoodBtn(dayMoodId === m.id)}
              >
                {m.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 오늘의 여정 */}
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>오늘의 여정</span>
      </div>

      <div style={{ marginBottom: '32px' }}>
        {/* 프리셋 아이콘 그리드 */}
        <div style={styles.presetGrid}>
          {PLACE_PRESETS.map((p) => (
            <div
              key={p.id}
              onClick={() => handlePresetClick(p.id)}
              style={styles.placePresetBtn(tlCategory === p.id)}
            >
              {p.icon}
              <span>{p.label}</span>
            </div>
          ))}
        </div>

        {/* ➕ 새 타임라인 입력 줄 */}
        <div style={styles.timelineInputRow}>
          {/* 시간 입력 */}
          <input
            placeholder="00:00"
            value={tlTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            onBlur={handleTimeBlur}
            style={{
              border: 'none',
              background: 'transparent',
              width: '50px',
              fontFamily: "'Noto Sans KR'",
              fontSize: '16px',
              textAlign: 'center',
              flexShrink: 0,
            }}
          />

          {/* 선택된 장소 뱃지 */}
          {tlCategory && (
            <div style={styles.selectedBadge}>
              {PLACE_PRESETS.find((p) => p.id === tlCategory)?.icon}
              {PLACE_PRESETS.find((p) => p.id === tlCategory)?.label}
            </div>
          )}

          {/* 장소 텍스트 입력 – 여기만 한 개! */}
          <input
            placeholder={
              tlCategory ? '오늘 다녀온 곳은' : '위의 장소를 선택해주세요'
            }
            value={tlPlace}
            onChange={(e) => setTlPlace(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              flex: 1, // 남는 공간 다 먹고
              minWidth: 0, // 👉 줄 밖으로 안 튀어나오게
              fontFamily: "'Noto Sans KR'",
              fontSize: '13px',
              paddingLeft: '1px',
            }}
          />

          {/* 추가 버튼 */}
          <button
            onClick={handleAddTimeline}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Plus size={20} color="#222" />
          </button>
        </div>

        {/* 타임라인 리스트 */}
        <div style={{ marginTop: '20px', paddingLeft: '4px' }}>
          {timeline.map((t) => {
            const preset =
              PLACE_PRESETS.find((p) => p.id === t.category) ||
              PLACE_PRESETS[7];

            return (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden', // 여기도 혹시 모를 튀어나옴 방지
                }}
              >
                {/* 시간 */}
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    fontFamily: "'Noto Sans KR'",
                    color: '#666',
                    minWidth: '45px',
                    flexShrink: 0,
                  }}
                >
                  {t.time}
                </span>

                {/* 카테고리 뱃지 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#f5f5f5',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#555',
                    flexShrink: 0,
                  }}
                >
                  {preset.icon} {preset.label}
                </div>

                {/* 장소 내용 입력 */}
                <input
                  value={t.place}
                  onChange={(e) => handleUpdateTimeline(t.id, e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    flex: 1,
                    minWidth: 0, // 여기도 핵심!
                    fontFamily: "'Nanum Myeongjo'",
                    fontSize: '16px',
                    borderBottom: '1px dashed #eee',
                  }}
                />

                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleRemoveTimeline(t.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#ccc',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 오늘의 생각 */}
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>오늘의 생각</span>
        <button onClick={handleShuffle} style={styles.refreshBtn}>
          <RotateCcw size={14} /> 질문 바꾸기
        </button>
      </div>

      {selectedPromptIds.map((pid, idx) => {
        const prompt = PROMPTS.find((p) => p.id === pid);
        const ans = answers[pid] || { text: '', moodId: null };
        const stamp = ans.stampVariant;

        return (
          <div key={pid} style={styles.promptContainer}>
            <div style={styles.promptHeaderRow}>
              <span style={styles.promptQ}>Q.</span>
              <span style={styles.promptText}>{prompt?.title}</span>
              <button
                style={styles.moodTrigger}
                onClick={() =>
                  setActiveMoodSelector(activeMoodSelector === pid ? null : pid)
                }
              >
                {ans.moodId ? (
                  <span style={{ fontSize: '28px' }}>
                    {ALL_MOOD_STAMPS.find((m) => m.id === ans.moodId)?.icon}
                  </span>
                ) : (
                  <Smile size={24} color="#ddd" />
                )}
              </button>
            </div>

            {activeMoodSelector === pid && (
              <div style={styles.moodSelectorPopup}>
                {ALL_MOOD_STAMPS.map((m, i) => (
                  <div
                    key={m.id}
                    style={styles.moodItem(i)}
                    onClick={() => handleMoodSelect(pid, m.id)}
                  >
                    {m.icon}
                    <span style={styles.moodLabel}>{m.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.inputWrapper}>
              <textarea
                className="light-placeholder lined-textarea answer-textarea"
                style={{
                  ...styles.textarea,
                  maxHeight: 96, // 3줄 정도까지만 보이고
                  overflowY: 'auto', // 길어지면 안에서 스크롤
                }}
                value={ans.text}
                onChange={(e) => handleAnswerChange(pid, e.target.value)}
                placeholder={idx === 0 ? '이곳에 적어주세요...' : ''}
                rows={2}
              />
              <div style={styles.stampZone}>
                {stamp && (
                  <div
                    className="stamp-animation"
                    style={{
                      ...styles.stampBody(stamp.color, stamp.shape),
                      transform: `rotate(${
                        stamp.rotation ?? -10
                      }deg) translate(-4px, -4px)`,
                    }}
                  >
                    {stamp.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* 자유 공간 */}
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>자유 공간</span>
      </div>
      <textarea
        className="lined-textarea"
        style={{
          ...styles.textarea,
          minHeight: '200px',
          paddingRight: 0,
          paddingLeft: '4px',
        }}
        value={freeContent}
        onChange={(e) => setFreeContent(e.target.value)}
        placeholder="자유롭게 기록해보세요..."
      />

      <div style={{ textAlign: 'center' }}>
        <button onClick={handleSave} style={styles.saveBtn}>
          작성 완료
        </button>
      </div>
    </div>
  );
}
