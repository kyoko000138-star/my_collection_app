// src/pages/MoneyRoomPage.tsx

const MoneyRoomPage: React.FC = () => {
  // ...

  const [showDailyLog, setShowDailyLog] = useState(false);

  const handleDayEnd = () => {
    const { newState, message } = applyDayEnd(gameState, todayStr);
    setGameState(newState);
    // 필요하면 alert(message) 대신 모달에서 보여줄 수도 있음
    setShowDailyLog(true);
  };

  return (
    <div style={{ ...styles.appContainer, backgroundColor: theme.bg }}>
      {/* ...기존 내용... */}

      {/* ✅ 하루 마감 버튼 (하단 고정) */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        display: 'flex',
        gap: 8,
      }}>
        <button
          onClick={handleDayEnd}
          style={{
            padding: '8px 12px',
            borderRadius: 999,
            border: '1px solid #1f2937',
            backgroundColor: '#020617',
            color: '#f9fafb',
            fontSize: 12,
          }}
        >
          🌙 하루 마감
        </button>
      </div>

      {/* ✅ DailyLogModal 연결 */}
      <DailyLogModal
        open={showDailyLog}
        onClose={() => setShowDailyLog(false)}
        today={todayStr}
        hp={Math.round((gameState.currentBudget / (gameState.maxBudget || 1)) * 100)}
        mp={gameState.mp}
        def={gameState.counters.defenseActionsToday}
        junkToday={gameState.counters.junkObtainedToday}
        defenseActionsToday={gameState.counters.defenseActionsToday}
        noSpendStreak={gameState.counters.noSpendStreak}
        pending={gameState.pending}
      />

      {/* Reset 디버그는 한쪽 구석에만 */}
      <div style={styles.debugArea}>
        <button onClick={...}>Reset</button>
      </div>
    </div>
  );
};
