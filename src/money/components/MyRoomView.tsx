// src/money/components/MyRoomView.tsx

import React from 'react';
import { UserState } from '../types';
import { calculateLunaPhase } from '../moneyLuna'; // 경로 확인 필요 (../money/moneyLuna.ts 등)

interface Props {
  user: UserState;
  onBack: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
}

export const MyRoomView: React.FC<Props> = ({ user, onBack, onOpenInventory, onOpenSettings }) => {
  const hpPercent = user.maxBudget > 0 ? Math.round((user.currentBudget / user.maxBudget) * 100) : 0;
  const mpPercent = Math.round((user.mp / user.maxMp) * 100);
  const luna = calculateLunaPhase(user.lunaCycle);

  // 재무 데이터
  const usedBudget = user.maxBudget - user.currentBudget;
  const dailySpend = user.counters.dailyTotalSpend;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏰 MY ROOM</h2>
        <button onClick={onBack} style={styles.closeBtn}>✕</button>
      </div>

      <div style={styles.scrollContent}>
        {/* 1. 상단: 캐릭터 프로필 */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>🧙‍♀️</div>
          <div style={styles.profileInfo}>
            <div style={styles.name}>{user.name} <span style={styles.job}>{user.jobTitle}</span></div>
            <div style={styles.level}>Lv.{user.level}</div>
            <div style={styles.lunaBadge}>{luna.phaseName}</div>
          </div>
        </div>

        {/* 2. 중단: 재무 현황 (HP/예산) - [요청 반영] */}
        <div style={styles.sectionTitle}>💰 이번 달 재무 상태</div>
        <div style={styles.financeCard}>
          <div style={styles.barContainer}>
            <div style={styles.barLabel}>
              <span>예산 잔액 (HP)</span>
              <span style={{color: hpPercent < 30 ? '#ef4444' : '#fff'}}>{hpPercent}%</span>
            </div>
            <div style={styles.barBg}>
              <div style={{...styles.barFill, width: `${Math.max(0, hpPercent)}%`, backgroundColor: '#ef4444'}} />
            </div>
            <div style={styles.barValue}>
              {user.currentBudget.toLocaleString()} / {user.maxBudget.toLocaleString()}
            </div>
          </div>

          <div style={styles.financeGrid}>
            <div style={styles.financeItem}>
              <span style={styles.fLabel}>총 사용</span>
              <span style={styles.fValue}>{usedBudget.toLocaleString()}</span>
            </div>
            <div style={styles.financeItem}>
              <span style={styles.fLabel}>오늘 지출</span>
              <span style={styles.fValue}>{dailySpend.toLocaleString()}</span>
            </div>
            <div style={styles.financeItem}>
              <span style={styles.fLabel}>무지출 연속</span>
              <span style={styles.fValue}>🔥 {user.counters.noSpendStreak}일</span>
            </div>
          </div>
        </div>

        {/* 3. 하단: RPG 스탯 & 메뉴 */}
        <div style={styles.sectionTitle}>🎒 모험가 스탯</div>
        <div style={styles.rpgCard}>
          <div style={styles.barContainer}>
            <div style={styles.barLabel}>
              <span>의지력 (MP)</span>
              <span>{user.mp} / {user.maxMp}</span>
            </div>
            <div style={styles.barBg}>
              <div style={{...styles.barFill, width: `${mpPercent}%`, backgroundColor: '#3b82f6'}} />
            </div>
          </div>
          
          <div style={styles.resourceRow}>
            <span>📄 Junk {user.junk}</span>
            <span>🧂 Salt {user.salt}</span>
          </div>

          <div style={styles.menuGrid}>
            <button onClick={onOpenInventory} style={styles.menuBtn}>🎒 가방</button>
            <button onClick={onOpenSettings} style={styles.menuBtn}>⚙️ 설정</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#111827', color: '#fff', display: 'flex', flexDirection: 'column' },
  header: { padding: '10px 15px', borderBottom: '2px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '16px', margin: 0, color: '#fbcfe8' },
  closeBtn: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' },
  
  scrollContent: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px' },
  
  profileCard: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#1f2937', padding: '15px', borderRadius: '12px', border: '1px solid #374151' },
  avatar: { fontSize: '40px', backgroundColor: '#000', padding: '10px', borderRadius: '8px', border: '2px solid #333' },
  profileInfo: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: '16px' },
  job: { fontSize: '10px', backgroundColor: '#4f46e5', padding: '2px 6px', borderRadius: 4, marginLeft: 6 },
  level: { color: '#fbbf24', fontSize: '12px' },
  lunaBadge: { fontSize: '10px', color: '#fca5a5', marginTop: 4 },

  sectionTitle: { fontSize: '12px', color: '#9ca3af', marginBottom: '-10px', marginLeft: '5px' },
  
  financeCard: { backgroundColor: '#1f2937', padding: '15px', borderRadius: '12px', border: '1px solid #374151' },
  financeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' },
  financeItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#111', padding: '8px', borderRadius: '6px' },
  fLabel: { fontSize: '10px', color: '#9ca3af' },
  fValue: { fontSize: '12px', fontWeight: 'bold' },

  rpgCard: { backgroundColor: '#1f2937', padding: '15px', borderRadius: '12px', border: '1px solid #374151' },
  resourceRow: { display: 'flex', gap: '15px', fontSize: '12px', marginTop: '10px', color: '#fbbf24' },
  menuGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' },
  menuBtn: { padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: '#fff', cursor: 'pointer' },

  barContainer: { marginBottom: '5px' },
  barLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' },
  barBg: { width: '100%', height: '8px', backgroundColor: '#111', borderRadius: '4px' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  barValue: { fontSize: '10px', textAlign: 'right', marginTop: '2px', color: '#9ca3af' },
};
