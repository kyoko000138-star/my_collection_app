// src/pages/MoneyRoomPage.tsx
import React, { useState, useEffect } from 'react';
import { UserState, PendingTransaction } from '../money/types';
import { GAME_CONSTANTS, CLASS_TYPES, ClassType } from '../money/constants';
import {
  getHp,
  applySpend,
  applyDefense,
  checkDailyReset,
} from '../money/moneyGameLogic';
import { getLunaMode, getLunaTheme } from '../money/moneyLuna';
import InventoryModal from '../money/components/InventoryModal';
import KingdomModal, {
  KingdomBuilding,
} from '../money/components/KingdomModal';
import DailyLogModal from '../money/components/DailyLogModal';

// [MOCK DATA] 초기 상태
const INITIAL_STATE: UserState = {
  profile: { name: 'Player 1', classType: CLASS_TYPES.GUARDIAN, level: 1 },
  luna: {
    nextPeriodDate: '2025-12-15', // 테스트용 PMS 날짜
    averageCycle: 28,
    isTracking: true,
  },
  budget: {
    total: 1000000,
    current: 850000,
    fixedCost: 300000,
    startDate: '2025-12-01',
  },
  stats: { def: 50, creditScore: 0 },
  counters: {
    defenseActionsToday: 0,
    junkObtainedToday: 0,
    lastAccessDate: null,
    lastDailyResetDate: null,
    noSpendStreak: 3,
    lunaShieldsUsedThisMonth: 0,
  },
  runtime: { mp: 15 },
  inventory: {
    junk: 0,
    salt: 0,
    shards: {},
    materials: {},
    equipment: [],
    collection: [],
  },
  pending: [],
};

export const MoneyRoomPage: React.FC = () => {
  const [gameState, setGameState] = useState<UserState>(INITIAL_STATE);
  const [feedbackMsg, setFeedbackMsg] =
    useState<string>('던전에 입장했습니다.');
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isKingdomModalOpen, setIsKingdomModalOpen] = useState(false);
  const [isDailyLogModalOpen, setIsDailyLogModalOpen] = useState(false);

  // 1. HP 및 모드 계산
  const hp = getHp(gameState.budget.current, gameState.budget.total);
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMode = getLunaMode(todayStr, gameState.luna.nextPeriodDate);
  const theme = getLunaTheme(currentMode);

  // 2. 접속 시 하루 리셋 로직
  useEffect(() => {
    const refreshedState = checkDailyReset(gameState);
    setGameState(refreshedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. UI 헬퍼
  const getHpColor = (hp: number) => {
    if (hp > 50) return '#4ade80'; // Green
    if (hp > 30) return '#facc15'; // Yellow
    return '#ef4444'; // Red
  };

  const getClassBadge = (classType: ClassType | null) => {
    switch (classType) {
      case CLASS_TYPES.GUARDIAN:
        return '🛡️ 수호자 Lv.1';
      case CLASS_TYPES.SAGE:
        return '🔮 현자 Lv.1';
      case CLASS_TYPES.ALCHEMIST:
        return '💰 연금술사 Lv.1';
      case CLASS_TYPES.DRUID:
        return '🌿 드루이드 Lv.1';
      default:
        return '👶 모험가';
    }
  };

  // 4. 행동 핸들러 (지출 / 방어)
  const handleSpend = () => {
    const spendAmount = 3000; // 테스트용

    const { newState, message } = applySpend(gameState, spendAmount, false);

    setGameState(newState);
    setFeedbackMsg(message);
  };

  const handleDefense = () => {
    if (
      gameState.counters.defenseActionsToday >=
      GAME_CONSTANTS.DAILY_DEFENSE_LIMIT
    ) {
      setFeedbackMsg('오늘의 방어 태세가 이미 한계에 도달했습니다.');
      return;
    }
    const nextState = applyDefense(gameState);
    setGameState(nextState);
    setFeedbackMsg(
      `방어 성공. MP가 회복되었습니다. (${nextState.counters.defenseActionsToday}/${GAME_CONSTANTS.DAILY_DEFENSE_LIMIT})`,
    );
  };

  // 5. 인벤토리 / 정화 관련 파생값
  const junk = gameState.inventory.junk;
  const salt = gameState.inventory.salt;
  const dust = gameState.inventory.materials['dust'] || 0;
  const pureEssence = gameState.inventory.materials['pureEssence'] || 0;
  const equipment = gameState.inventory.equipment;

  const canPurify =
    junk > 0 && salt > 0 && gameState.runtime.mp > 0; // 간단 조건
  const canCraftSword = pureEssence >= 3; // 우선 고정 비용 3개로 가정

  const handlePurify = () => {
    if (!canPurify) {
      setFeedbackMsg('정화를 진행할 조건이 부족합니다.');
      return;
    }

    setGameState((prev) => {
      const prevDust = prev.inventory.materials['dust'] || 0;
      const prevEss = prev.inventory.materials['pureEssence'] || 0;

      return {
        ...prev,
        runtime: {
          ...prev.runtime,
          mp: Math.max(0, prev.runtime.mp - 1),
        },
        inventory: {
          ...prev.inventory,
          junk: Math.max(0, prev.inventory.junk - 1),
          salt: Math.max(0, prev.inventory.salt - 1),
          materials: {
            ...prev.inventory.materials,
            dust: prevDust + 1,
            pureEssence: prevEss + 1,
          },
        },
      };
    });

    setFeedbackMsg('정화 완료. pureEssence가 1 증가했습니다.');
  };

  const handleCraftSword = () => {
    if (!canCraftSword) {
      setFeedbackMsg('장비 제작에 필요한 pureEssence가 부족합니다.');
      return;
    }

    setGameState((prev) => {
      const prevEss = prev.inventory.materials['pureEssence'] || 0;
      const newEss = Math.max(0, prevEss - 3);

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          materials: {
            ...prev.inventory.materials,
            pureEssence: newEss,
          },
          equipment: [...prev.inventory.equipment, '잔잔한 장부검'],
        },
      };
    });

    setFeedbackMsg('장비 제작 완료: 잔잔한 장부검을 얻었습니다.');
  };

  // 6. 자산의 왕국 파생값 (임시 규칙)
  const buildings: KingdomBuilding[] = [
    {
      id: 'fortress',
      name: '요새',
      type: 'FORTRESS',
      level:
        1 + Math.min(3, Math.floor(gameState.counters.noSpendStreak / 10)),
      streak: gameState.counters.noSpendStreak,
    },
    {
      id: 'tower',
      name: '마법탑',
      type: 'TOWER',
      level: 1 + Math.min(3, Math.floor(gameState.stats.creditScore / 100)),
      streak: gameState.stats.creditScore,
    },
  ];

  // 7. "나중에 입력" 추가 핸들러
  const handleAddPending = () => {
    const note = window.prompt('나중에 입력할 메모를 적어 주세요.') || '';
    if (!note.trim()) {
      // 메모가 비어 있으면 생성하지 않음
      return;
    }

    const amountInput =
      window.prompt('금액을 입력하세요. (없으면 비워두기)') || '';
    let amount: number | undefined = undefined;

    if (amountInput.trim()) {
      const parsed = Number(amountInput.replace(/,/g, ''));
      if (!Number.isNaN(parsed) && parsed > 0) {
        amount = parsed;
      }
    }

    const now = new Date();
    const timeStr = now
      .toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(/^24:/, '00:'); // 혹시 모를 24시 처리

    const pendingItem: PendingTransaction = {
      id: `${now.getTime()}`,
      amount,
      note: note.trim(),
      createdAt: `${todayStr} ${timeStr}`,
    };

    setGameState((prev) => ({
      ...prev,
      pending: [...prev.pending, pendingItem],
    }));

    setFeedbackMsg('나중에 입력할 항목이 대기열에 추가되었습니다.');
  };

  return (
    <>
      <div style={{ ...styles.container, backgroundColor: theme.bgColor }}>
        {/* --- HEADER --- */}
        <header style={styles.header}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={styles.date}>{todayStr}</span>
            <span
              style={{
                fontSize: '14px',
                color: '#60a5fa',
                marginTop: '4px',
              }}
            >
              {getClassBadge(gameState.profile.classType)}
            </span>
          </div>
          <span
            style={{
              ...styles.modeBadge,
              color: theme.color,
              border: `1px solid ${theme.color}`,
            }}
          >
            {theme.label}
          </span>
        </header>

        {/* --- HERO: HP BAR --- */}
        <section style={styles.heroSection}>
          <div style={styles.hpLabel}>
            <span>HP (생존력)</span>
            <span>{hp}%</span>
          </div>
          <div style={styles.hpBarBg}>
            <div
              style={{
                ...styles.hpBarFill,
                width: `${hp}%`,
                backgroundColor: getHpColor(hp),
              }}
            />
          </div>
          <div style={styles.budgetDetail}>
            {gameState.budget.current.toLocaleString()} /{' '}
            {gameState.budget.total.toLocaleString()}
          </div>
        </section>

        {/* --- STATS GRID --- */}
        <section style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>MP</div>
            <div style={styles.statValue}>
              <span style={{ color: '#60a5fa' }}>
                {gameState.runtime.mp}
              </span>
              <span style={styles.statMax}> / {GAME_CONSTANTS.MAX_MP}</span>
            </div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>DEF</div>
            <div style={styles.statValue}>{gameState.stats.def}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Junk</div>
            <div style={styles.statValue}>{gameState.inventory.junk}</div>
          </div>
        </section>

        {/* --- FEEDBACK AREA (탭하면 오늘 로그 상세) --- */}
        <div
          style={{
            ...styles.feedbackArea,
            borderColor: theme.color,
          }}
          onClick={() => setIsDailyLogModalOpen(true)}
        >
          {feedbackMsg === '던전에 입장했습니다.'
            ? theme.message
            : feedbackMsg}
        </div>

        {/* --- ACTIONS --- */}
        <footer style={styles.actionArea}>
          <button onClick={handleSpend} style={styles.btnHit}>
            🔥 지출 (Hit 3k)
          </button>
          <button onClick={handleDefense} style={styles.btnGuard}>
            🛡️ 방어 (Guard)
          </button>
          <button
            onClick={handleAddPending}
            style={styles.btnPending}
          >
            📝 나중에 입력
          </button>
          <button
            onClick={() => setIsInventoryModalOpen(true)}
            style={styles.btnInventory}
          >
            🎒 인벤토리
          </button>
          <button
            onClick={() => setIsKingdomModalOpen(true)}
            style={styles.btnGuardAlt}
          >
            🏰 자산의 왕국
          </button>
        </footer>
      </div>

      {/* 인벤토리 / 정화 모달 */}
      <InventoryModal
        open={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        junk={junk}
        salt={salt}
        dust={dust}
        pureEssence={pureEssence}
        equipment={equipment}
        canPurify={canPurify}
        canCraft={canCraftSword}
        onPurify={handlePurify}
        onCraft={handleCraftSword}
      />

      {/* 자산의 왕국 모달 */}
      <KingdomModal
        open={isKingdomModalOpen}
        onClose={() => setIsKingdomModalOpen(false)}
        buildings={buildings}
      />

      {/* 오늘 로그 / Pending 모달 */}
      <DailyLogModal
        open={isDailyLogModalOpen}
        onClose={() => setIsDailyLogModalOpen(false)}
        today={todayStr}
        hp={hp}
        mp={gameState.runtime.mp}
        def={gameState.stats.def}
        junkToday={gameState.counters.junkObtainedToday}
        defenseActionsToday={gameState.counters.defenseActionsToday}
        noSpendStreak={gameState.counters.noSpendStreak}
        pending={gameState.pending}
      />
    </>
  );
};

// --- 스타일 ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '420px',
    margin: '0 auto',
    color: '#f3f4f6',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'column',
    transition: 'background-color 0.5s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  date: { fontSize: '18px', fontWeight: 'bold' },
  modeBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  heroSection: { marginBottom: '30px' },
  hpLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  hpBarBg: {
    width: '100%',
    height: '24px',
    backgroundColor: '#374151',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    transition: 'width 0.5s ease-in-out, background-color 0.5s',
  },
  budgetDetail: {
    marginTop: '8px',
    textAlign: 'right',
    fontSize: '12px',
    color: '#9ca3af',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginBottom: '30px',
  },
  statBox: {
    backgroundColor: '#1f2937',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  statLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  statValue: { fontSize: '20px', fontWeight: 'bold' },
  statMax: { fontSize: '12px', color: '#6b7280' },
  feedbackArea: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#d1d5db',
    marginBottom: '20px',
    border: '1px dashed #374151',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
  },
  actionArea: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  btnHit: {
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #b91c1c',
  },
  btnGuard: {
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #1d4ed8',
  },
  btnPending: {
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#f97316',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #c2410c',
  },
  btnInventory: {
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#22c55e',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #15803d',
  },
  btnGuardAlt: {
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#6366f1',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #4338ca',
  },
};

export default MoneyRoomPage;
