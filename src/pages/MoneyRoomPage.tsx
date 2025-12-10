// src/pages/MoneyRoomPage.tsx

// ...imports

// 1. 초기값 상수를 컴포넌트 밖으로 뺍니다 (재사용 위해)
const INITIAL_USER_STATE: UserState = {
  meta: { lastLoginDate: new Date().toISOString().slice(0, 10), lastLoginTime: '00:00', currentYear: 2025, currentMonth: 12 },
  status: { hp: 100, mp: 10, credit: 0 },
  budget: { year: 2025, month: 12, variableBudget: 500000, noSpendTarget: 10, snackRecoveryBudget: 30000 },
  cycle: { lastPeriodStart: '2025-12-01', cycleLength: 28 }, // 기본값
  inventory: { 
    gold: 0, leaf: 0, potions: 3, 
    shards: { record: 0, discipline: 0, freedom: 0 }, 
    items: {}, materials: {}, consumables: {},
    collection: [], equipped: {} 
  },
  buildings: [
    { id: 'main_bank', name: '비상금 창고', type: 'warehouse', level: 1, currentExp: 0, totalSavings: 0, monthStreak: 0 }
  ],
  job: { currentJob: 'novice', tier: 0, exp: 0, unlockedSkills: [] },
  journey: { nodes: [], currentNodeId: 0, routeTheme: 'forest' },
  buffs: {},
  seenPMSAlert: false
};

const MoneyRoomPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const todayStr = today.toISOString().slice(0, 10);

  // 2. 상태 초기화 로직 수정 (안전한 병합)
  const [user, setUser] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('mr_user_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 🛡️ [Fix] 저장된 데이터(parsed)에 없는 필드는 초기값(INITIAL_USER_STATE)으로 채움
        // 특히 cycle 객체가 없는 구버전 데이터일 경우를 대비해 깊은 병합이나 기본값 할당 필요
        return {
          ...INITIAL_USER_STATE,
          ...parsed,
          cycle: parsed.cycle || INITIAL_USER_STATE.cycle, // cycle 없으면 기본값 사용
          inventory: { ...INITIAL_USER_STATE.inventory, ...(parsed.inventory || {}) } // 인벤토리도 안전하게 병합
        };
      }
    } catch (e) {
      console.error("데이터 로드 실패, 초기화합니다.", e);
    }
    return INITIAL_USER_STATE;
  });

  // ... (이하 코드 동일)
