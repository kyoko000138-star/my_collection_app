// src/pages/MoneyRoomPage.tsx

import React, { useEffect, useState } from 'react';
import { GAME_CONSTANTS, CLASS_TYPES, type ClassType } from '../money/constants';
import type { UserState } from '../money/types';
import { getHp, applySpend, applyDefense, checkDailyReset } from '../money/moneyGameLogic';
import { getLunaMode, getLunaTheme } from '../money/moneyLuna';

// [MOCK DATA] 초기 상태
const INITIAL_STATE: UserState = {
  profile: { name: 'Player 1', classType: CLASS_TYPES.GUARDIAN, level: 1 },
  luna: {
    nextPeriodDate: '2025-12-15', // 테스트 날짜 (PMS 유도용)
    averageCycle: 28,
    isTracking: true,
  },
  budget: {
    total: 1_000_000,
    current: 850_000,
    fixedCost: 300_000,
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
  const [feedbackMsg, setFeedbackMsg] = useState<string>('던전에 입장했습니다.');

  // 1. HP 및 모드 계산
  const hp = getHp(gameState.budget.current, gameState.budget.total);
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMode = getLunaMode(todayStr, gameState.luna.nextPeriodDate);
  const theme = getLunaTheme(currentMode);

  // 2. 초기화 로직 (마운트 시 일일 리셋 체크)
  useEffect(() => {
    setGameState((prev) => checkDailyReset(prev));
  }, []);

  // 3. UI 헬퍼
  const getHpColor = (hp: number) => {
    if (hp > 50) return '#4ade80'; // Green
    if (hp > 30) return '#facc15'; // Yellow
    return '#ef4444';              // Red
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

  // 4. 행동 핸들러
  const handleSpend = () => {
    // 테스트: 3000원 지출 (수호자라면 방어됨)
    const spendAmount = 3000;

    const { newState, message } = applySpend(gameState, spendAmount, false);

    setGameState(newState);
    setFeedbackMsg(message);
  };

  const handleDefense = () => {
    if (gameState.counters.defenseActionsToday >= GAME_CONSTANTS.DAILY_DEFENSE_LIMIT) {
      setFeedbackMsg('오늘의 방어 태세가 이미 한계에 도달했습니다.');
      return;
    }

    const nextState = applyDefense(gameState);
    setGameState(nextState);
    setFeedbackMsg(
      `방어 성공. MP가 회복되었습니다. (${nextState.counters.defenseActionsToday}/${GAME_CONSTANTS.DAILY_DEFENSE_LIMIT})`
    );
  };

  return (
    <div style={{ ...styles.container, backgroundColor: theme.bgColor }}>
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={styles.date}>{todayStr}</span>
          <span style={{ fontSize: '14px', color: '#60a5fa', marginTop: '4px' }}>
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
            <span style={{ color: '#60a5fa' }}>{gameState.runtime.mp}</span>
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

      {/* --- FEEDBACK AREA --- */}
      <div style={{ ...styles.feedbackArea, borderColor: theme.color }}>
        {feedbackMsg === '던전에 입장했습니다.' ? theme.message : feedbackMsg}
      </div>

      {/* --- ACTIONS --- */}
      <footer style={styles.actionArea}>
        <button onClick={handleSpend} style={styles.btnHit}>
          🔥 지출 (Hit 3k)
        </button>
        <button onClick={handleDefense} style={styles.btnGuard}>
          🛡️ 방어 (Guard)
        </button>
      </footer>
    </div>
  );
};

// 스타일
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
  date: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  modeBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  heroSection: {
    marginBottom: '30px',
  },
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
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  statMax: {
    fontSize: '12px',
    color: '#6b7280',
  },
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
  },
  actionArea: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  btnHit: {
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '16px',
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
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 0 #1d4ed8',
  },
};

export default MoneyRoomPage;
