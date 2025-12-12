// src/money/components/MyRoomView.tsx

import React from 'react';
import { UserState } from '../types';

interface Props {
  user: UserState;
  onBack: () => void;
}

export const MyRoomView: React.FC<Props> = ({ user, onBack }) => {
  return (
    <div style={styles.container}>
      <div style={styles.window}>
        <h2 style={styles.title}>🏰 MY ROOM</h2>
        
        {/* 프로필 섹션 */}
        <div style={styles.section}>
          <div style={styles.avatar}>🧙‍♀️</div>
          <div style={styles.info}>
            <div style={styles.name}>{user.name} <span style={styles.job}>{user.jobTitle}</span></div>
            <div style={styles.level}>Lv.{user.level}</div>
          </div>
        </div>

        {/* 스탯 섹션 */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <span style={styles.label}>HP (예산)</span>
            <span style={styles.value}>{user.currentBudget.toLocaleString()}</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.label}>MP (의지)</span>
            <span style={styles.value}>{user.mp} / {user.maxMp}</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.label}>Junk</span>
            <span style={styles.value}>{user.junk}</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.label}>Salt</span>
            <span style={styles.value}>{user.salt}</span>
          </div>
        </div>

        <button onClick={onBack} style={styles.backBtn}>돌아가기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  window: { width: '90%', backgroundColor: '#2d3748', border: '4px solid #fff', borderRadius: 8, padding: 20, color: '#fff' },
  title: { textAlign: 'center', borderBottom: '2px solid #fff', paddingBottom: 10, marginBottom: 20 },
  section: { display: 'flex', gap: 15, marginBottom: 20 },
  avatar: { fontSize: 50, border: '2px solid #fff', borderRadius: 8, padding: 10, backgroundColor: '#1a202c' },
  info: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  job: { fontSize: 12, backgroundColor: '#4a5568', padding: '2px 6px', borderRadius: 4, marginLeft: 8 },
  level: { fontSize: 14, color: '#fbbf24' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  statBox: { backgroundColor: '#1a202c', padding: 10, borderRadius: 6, display: 'flex', flexDirection: 'column' },
  label: { fontSize: 10, color: '#a0aec0' },
  value: { fontSize: 16, fontWeight: 'bold' },
  backBtn: { width: '100%', padding: 12, marginTop: 20, backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }
};
