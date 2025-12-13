import React from 'react';
import { UserState } from '../types';

interface Props {
  user: UserState;
  onBack: () => void;
  onUseItem?: (id: string) => void;
  onEquipItem?: (id: string) => void;
}

export const InventoryView: React.FC<Props> = ({ user, onBack, onUseItem }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🎒 모험가의 가방</h2>
        <button onClick={onBack} style={styles.closeBtn}>✕</button>
      </div>

      <div style={styles.grid}>
        <div style={styles.slot}><div style={styles.icon}>📄</div><div style={styles.count}>{user.junk}</div><div style={styles.name}>Junk</div></div>
        <div style={styles.slot}><div style={styles.icon}>🧂</div><div style={styles.count}>{user.salt}</div><div style={styles.name}>Salt</div></div>
        <div style={styles.slot}><div style={styles.icon}>🌱</div><div style={styles.count}>{user.seedPackets || 0}</div><div style={styles.name}>씨앗</div></div>

        {user.inventory.map((item, idx) => (
          <div key={idx} style={styles.slot} onClick={() => onUseItem && onUseItem(item.id)}>
            <div style={styles.icon}>📦</div>
            <div style={styles.count}>{item.count}</div>
            <div style={styles.name}>{item.name}</div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, 9 - user.inventory.length) }).map((_, i) => (
          <div key={`empty_${i}`} style={styles.emptySlot} />
        ))}
      </div>
      <button onClick={onBack} style={styles.backBtn}>돌아가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#3f3f46', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box' },
  header: { borderBottom: '2px solid #fff', marginBottom: '15px', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' },
  title: { margin: 0, color: '#fff', fontSize: '18px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', flex: 1, alignContent: 'start' },
  slot: { backgroundColor: '#27272a', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #52525b', position: 'relative', cursor: 'pointer' },
  emptySlot: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '2px dashed #52525b', minHeight: '60px' },
  icon: { fontSize: '24px', marginBottom: '4px' },
  count: { position: 'absolute', top: 2, right: 4, fontSize: '10px', color: '#fbbf24', fontWeight: 'bold' },
  name: { fontSize: '10px', color: '#d4d4d8', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' },
  backBtn: { padding: '12px', backgroundColor: '#18181b', color: '#fff', border: '2px solid #71717a', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};
