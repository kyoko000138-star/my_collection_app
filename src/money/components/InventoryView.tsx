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
      {/* 고정 헤더 */}
      <div style={styles.fixedHeader}>
        <h2 style={styles.title}>🎒 인벤토리</h2>
        <div style={styles.statRow}>
          <span>Junk: {user.junk}</span>
          <span>Salt: {user.salt}</span>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div style={styles.scrollContent}>
        {user.inventory.length === 0 ? (
          <div style={styles.emptyMsg}>가방이 비었습니다.</div>
        ) : (
          <div style={styles.grid}>
            {user.inventory.map((item, idx) => (
              <div key={`${item.id}_${idx}`} style={styles.itemCard}>
                <div style={styles.itemIcon}>
                  {item.type === 'equipment' ? '⚔️' : item.type === 'consumable' ? '💊' : '📦'}
                </div>
                <div style={styles.itemName}>{item.name}</div>
                <div style={styles.itemCount}>x{item.count}</div>
              </div>
            ))}
            {/* 하단 여백 */}
            <div style={{ height: '40px' }}></div>
          </div>
        )}
      </div>

      {/* 고정 푸터 */}
      <div style={styles.fixedFooter}>
        <button onClick={onBack} style={styles.backBtn}>돌아가기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' },
  
  fixedHeader: { padding: '20px', flexShrink: 0, borderBottom: '2px solid #334155', backgroundColor: '#1e293b', zIndex: 10 },
  title: { textAlign: 'center', margin: '0 0 10px 0', fontSize: '18px' },
  statRow: { display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '14px', color: '#94a3b8' },

  scrollContent: { 
    flex: 1, 
    overflowY: 'auto', 
    minHeight: 0, 
    padding: '20px',
    WebkitOverflowScrolling: 'touch' 
  },

  fixedFooter: { padding: '20px', flexShrink: 0, backgroundColor: '#1e293b', borderTop: '2px solid #334155' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  emptyMsg: { textAlign: 'center', color: '#64748b', marginTop: '50px' },

  itemCard: { backgroundColor: '#334155', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #475569' },
  itemIcon: { fontSize: '24px', marginBottom: '5px' },
  itemName: { fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginBottom: '2px' },
  itemCount: { fontSize: '10px', color: '#94a3b8' },

  backBtn: { width: '100%', padding: '12px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};
