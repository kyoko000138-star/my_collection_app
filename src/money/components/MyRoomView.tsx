// src/money/components/MyRoomView.tsx

import React from 'react';
import { UserState } from '../types';
// [수정] 경로 변경: '../money/moneyLuna' -> '../moneyLuna'
import { calculateLunaPhase } from '../moneyLuna';

interface Props {
  user: UserState;
  onBack: () => void;
}

export const MyRoomView: React.FC<Props> = ({ user, onBack }) => {
  const hpPercent = user.maxBudget > 0 ? Math.round((user.currentBudget / user.maxBudget) * 100) : 0;
  const mpPercent = Math.round((user.mp / user.maxMp) * 100);
  const luna = calculateLunaPhase(user.lunaCycle);

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h2 style={styles.title}>🏰 MY ROOM</h2>
        <button onClick={onBack} style={styles.closeBtn}>✕</button>
      </div>

      <div style={styles.content}>
        {/* 1. 캐릭터 초상화 */}
        <div style={styles.portraitSection}>
          <div style={styles.portraitBox}>
            <div style={{fontSize: '60px', animation: 'bounce 2s infinite'}}>🧙‍♀️</div>
          </div>
          <div style={styles.nameBadge}>
            <span style={styles.job}>{user.jobTitle}</span>
            <div style={styles.name}>{user.name}</div>
            <div style={styles.level}>Lv.{user.level}</div>
          </div>
        </div>

        {/* 2. 스탯 (HP/MP/바이오리듬) */}
        <div style={styles.statSection}>
          {/* HP */}
          <div style={styles.statRow}>
            <div style={styles.statLabel}>
              <span>HP (예산)</span>
              <span style={{color: hpPercent < 30 ? '#ef4444' : '#fff'}}>{hpPercent}%</span>
            </div>
            <div style={styles.barBg}>
              <div style={{...styles.barFill, width: `${Math.max(0, hpPercent)}%`, backgroundColor: '#ef4444'}} />
            </div>
            <div style={styles.statValue}>
              {user.currentBudget.toLocaleString()} / {user.maxBudget.toLocaleString()}
            </div>
          </div>

          {/* MP */}
          <div style={styles.statRow}>
            <div style={styles.statLabel}>
              <span>MP (의지력)</span>
              <span>{user.mp} / {user.maxMp}</span>
            </div>
            <div style={styles.barBg}>
              <div style={{...styles.barFill, width: `${mpPercent}%`, backgroundColor: '#3b82f6'}} />
            </div>
          </div>

          {/* Luna */}
          <div style={styles.lunaBox}>
            <span>신체 주기: </span>
            <span style={{color: luna.isPeriod ? '#fca5a5' : '#86efac', fontWeight:'bold'}}>
              {luna.phaseName}
            </span>
          </div>
        </div>
      </div>

      {/* 3. 재무 요약 (MoneySummary 기능 통합) */}
      <div style={styles.detailSection}>
        <div style={styles.detailGrid}>
          <div style={styles.gridItem}>
            <div style={styles.gridLabel}>Junk (흔적)</div>
            <div style={styles.gridValue}>📄 {user.junk}</div>
          </div>
          <div style={styles.gridItem}>
            <div style={styles.gridLabel}>Salt (절약)</div>
            <div style={styles.gridValue}>🧂 {user.salt}</div>
          </div>
          <div style={styles.gridItem}>
            <div style={styles.gridLabel}>무지출 연속</div>
            <div style={styles.gridValue}>🔥 {user.counters.noSpendStreak}일</div>
          </div>
          <div style={styles.gridItem}>
            <div style={styles.gridLabel}>오늘 쓴 돈</div>
            <div style={styles.gridValue}>💸 {user.counters.dailyTotalSpend.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={styles.footerMsg}>
        "관리가 소홀하면 정원(자산)이 시들어버려요."
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', height: '100%',
    backgroundColor: '#111827', // Dark Theme
    color: '#fff',
    display: 'flex', flexDirection: 'column',
    fontFamily: '"NeoDungGeunMo", monospace',
    overflowY: 'auto'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 15px', borderBottom: '2px solid #374151',
    backgroundColor: '#1f2937'
  },
  title: { fontSize: '16px', margin: 0, color: '#fbcfe8' },
  closeBtn: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' },
  content: {
    display: 'flex', padding: '15px', gap: '15px',
    borderBottom: '2px dashed #374151'
  },
  portraitSection: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    backgroundColor: '#1f2937', borderRadius: '8px', padding: '10px',
    border: '2px solid #4b5563'
  },
  portraitBox: {
    width: '80px', height: '80px', backgroundColor: '#111', 
    borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '8px', border: '2px solid #333'
  },
  nameBadge: { textAlign: 'center', width: '100%' },
  job: { fontSize: '10px', backgroundColor: '#4f46e5', padding: '2px 6px', borderRadius: '4px' },
  name: { fontSize: '14px', fontWeight: 'bold', margin: '4px 0' },
  level: { fontSize: '12px', color: '#fbbf24' },
  statSection: { flex: 1.5, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' },
  statRow: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' },
  barBg: { width: '100%', height: '8px', backgroundColor: '#374151', borderRadius: '4px' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  statValue: { fontSize: '12px', textAlign: 'right', marginTop: '2px' },
  lunaBox: { fontSize: '11px', backgroundColor: '#1f2937', padding: '6px', borderRadius: '4px', textAlign: 'center', border: '1px solid #374151' },
  detailSection: { padding: '15px' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  gridItem: { backgroundColor: '#1f2937', padding: '10px', borderRadius: '8px', border: '1px solid #374151' },
  gridLabel: { fontSize: '10px', color: '#9ca3af', marginBottom: '4px' },
  gridValue: { fontSize: '14px', fontWeight: 'bold' },
  footerMsg: { textAlign: 'center', fontSize: '11px', color: '#6b7280', marginTop: 'auto', padding: '15px', fontStyle: 'italic' }
};
