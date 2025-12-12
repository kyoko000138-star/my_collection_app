// src/money/components/InventoryView.tsx

import React from 'react';
import { UserState } from '../types';

interface Props {
  user: UserState;
  onBack: () => void;
}

export const InventoryView: React.FC<Props> = ({ user, onBack }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🎒 모험가의 가방</h2>
      </div>

      <div style={styles.grid}>
        {/* 고정 아이템 */}
        <div style={styles.slot}>
          <div style={styles.icon}>📄</div>
          <div style={styles.count}>{user.junk}</div>
          <div style={styles.name}>Junk</div>
        </div>
        <div style={styles.slot}>
          <div style={styles.icon}>🧂</div>
          <div style={styles.count}>{user.salt}</div>
          <div style={styles.name}>Salt</div>
        </div>
        <div style={styles.slot}>
          <div style={styles.icon}>🌱</div>
          <div style={styles.count}>{user.seedPackets || 0}</div>
          <div style={styles.name}>씨앗</div>
        </div>

        {/* 인벤토리 아이템 */}
        {user.inventory.map((item, idx) => (
          <div key={idx} style={styles.slot}>
            <div style={styles.icon}>📦</div>
            <div style={styles.count}>{item.count}</div>
            <div style={styles.name}>{item.name}</div>
          </div>
        ))}
        
        {/* 빈 슬롯 채우기 */}
        {Array.from({ length: 9 - user.inventory.length }).map((_, i) => (
          <div key={`empty_${i}`} style={styles.emptySlot} />
        ))}
      </div>

      <div style={styles.desc}>
        "정화(연금술)를 통해 아이템을 제작하세요."
      </div>

      <button onClick={onBack} style={styles.backBtn}>돌아가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#3f3f46', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box' },
  header: { borderBottom: '2px solid #fff', marginBottom: '15px', paddingBottom: '10px' },
  title: { margin: 0, color: '#fff', fontSize: '18px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', flex: 1 },
  slot: { backgroundColor: '#27272a', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #52525b', position: 'relative' },
  emptySlot: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '2px dashed #52525b' },
  icon: { fontSize: '24px', marginBottom: '4px' },
  count: { position: 'absolute', top: 2, right: 4, fontSize: '10px', color: '#fbbf24', fontWeight: 'bold' },
  name: { fontSize: '10px', color: '#d4d4d8', textAlign: 'center' },
  desc: { fontSize: '12px', color: '#a1a1aa', textAlign: 'center', margin: '15px 0' },
  backBtn: { padding: '12px', backgroundColor: '#18181b', color: '#fff', border: '2px solid #71717a', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};
