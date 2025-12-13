// src/money/components/InventoryView.tsx
import React from 'react';
import { UserState } from '../types';
import { ITEM_DB } from '../gameData';

interface Props {
  user: UserState;
  onBack: () => void;
  onUseItem: (itemId: string) => void;
  onEquipItem: (itemId: string) => void;
}

export const InventoryView: React.FC<Props> = ({ user, onBack, onUseItem, onEquipItem }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎒 가방</h2>
      
      <div style={styles.grid}>
        {user.inventory.length === 0 ? (
            <div style={{gridColumn:'span 3', textAlign:'center', color:'#666', marginTop:'50px'}}>비어있음</div>
        ) : (
            user.inventory.map((invenItem, idx) => {
                const itemData = ITEM_DB[invenItem.itemId] || { name: '???', icon: '❓' };
                return (
                    <div key={idx} style={styles.itemCard}>
                        <div style={{fontSize:'24px'}}>{itemData.type === 'equipment' ? '⚔️' : '🧪'}</div>
                        <div style={styles.itemName}>{itemData.name}</div>
                        <div style={styles.btnGroup}>
                            {itemData.type === 'consumable' && (
                                <button onClick={() => onUseItem(invenItem.itemId)} style={styles.btn}>사용</button>
                            )}
                            {itemData.type === 'equipment' && (
                                <button onClick={() => onEquipItem(invenItem.itemId)} style={styles.btn}>장착</button>
                            )}
                        </div>
                    </div>
                );
            })
        )}
      </div>

      <button onClick={onBack} style={styles.backBtn}>닫기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#0f172a', padding: '20px', display: 'flex', flexDirection: 'column' },
  title: { color: '#fff', textAlign: 'center', marginBottom: '20px' },
  grid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', alignContent: 'start', overflowY: 'auto' },
  itemCard: { backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' },
  itemName: { fontSize: '11px', color: '#cbd5e1' },
  btnGroup: { display: 'flex', gap: '4px', marginTop: '4px' },
  btn: { padding: '4px 8px', fontSize: '10px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  backBtn: { marginTop: '20px', padding: '12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};
