// src/money/components/InventoryView.tsx (전체 수정)

import React, { useState } from 'react';
import { UserState } from '../types';
import { ITEM_DB } from '../gameData';

interface Props {
  user: UserState;
  onBack: () => void;
  onUseItem: (itemId: string) => void;   // 소모품 사용
  onEquipItem: (itemId: string) => void; // 장비 착용
}

export const InventoryView: React.FC<Props> = ({ user, onBack, onUseItem, onEquipItem }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 아이템 클릭 핸들러
  const handleItemClick = (item: any) => {
    // 상세 정보 표시 또는 액션
    if (selectedId === item.id) {
      setSelectedId(null); // 토글
    } else {
      setSelectedId(item.id);
    }
  };

  const handleAction = (item: any) => {
    if (item.type === 'consumable') {
      onUseItem(item.id);
    } else if (item.type === 'equipment') {
      onEquipItem(item.id);
    }
    setSelectedId(null);
  };

  // 착용 여부 확인 헬퍼
  const isEquipped = (itemId: string) => {
    if (!user.equipped) return false;
    return Object.values(user.equipped).includes(itemId);
  };

  return (
    <div style={styles.container}>
      <div style={styles.fixedHeader}>
        <h2 style={styles.title}>🎒 인벤토리</h2>
        <div style={styles.statRow}>
          <span>Junk: {user.junk}</span>
          <span>Salt: {user.salt}</span>
        </div>
      </div>

      <div style={styles.scrollContent}>
        {user.inventory.length === 0 ? (
          <div style={styles.emptyMsg}>가방이 비었습니다.</div>
        ) : (
          <div style={styles.grid}>
            {user.inventory.map((item, idx) => {
              const equipped = isEquipped(item.id);
              const isSelected = selectedId === item.id;
              const dbInfo = ITEM_DB[item.id];
              const desc = dbInfo?.desc || '설명 없음';

              return (
                <div 
                  key={`${item.id}_${idx}`} 
                  style={isSelected ? styles.itemCardSelected : styles.itemCard}
                  onClick={() => handleItemClick(item)}
                >
                  <div style={styles.itemIcon}>
                    {item.type === 'equipment' ? '⚔️' : item.type === 'consumable' ? '💊' : '📦'}
                  </div>
                  
                  <div style={styles.itemName}>
                    {item.name} {equipped && <span style={styles.equippedBadge}>[E]</span>}
                  </div>
                  <div style={styles.itemCount}>x{item.count}</div>

                  {/* 선택 시 나타나는 액션 버튼 및 설명 */}
                  {isSelected && (
                    <div style={styles.actionArea}>
                      <div style={styles.desc}>{desc}</div>
                      <button 
                        style={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(item);
                        }}
                      >
                        {item.type === 'equipment' 
                          ? (equipped ? '해제' : '장착') 
                          : '사용'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ height: '40px' }}></div>
          </div>
        )}
      </div>

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
  scrollContent: { flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px', WebkitOverflowScrolling: 'touch' },
  fixedFooter: { padding: '20px', flexShrink: 0, backgroundColor: '#1e293b', borderTop: '2px solid #334155' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  emptyMsg: { textAlign: 'center', color: '#64748b', marginTop: '50px' },
  
  itemCard: { backgroundColor: '#334155', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #475569', cursor: 'pointer', transition: 'all 0.2s' },
  itemCardSelected: { backgroundColor: '#475569', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #60a5fa', cursor: 'pointer', gridColumn: 'span 2' }, // 선택되면 확장
  
  itemIcon: { fontSize: '24px', marginBottom: '5px' },
  itemName: { fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginBottom: '2px' },
  itemCount: { fontSize: '10px', color: '#94a3b8' },
  equippedBadge: { color: '#4ade80', fontWeight: 'bold' },
  
  actionArea: { marginTop: '10px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
  desc: { fontSize: '11px', color: '#cbd5e1', textAlign: 'center' },
  actionBtn: { padding: '6px 12px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px', cursor: 'pointer' },
  
  backBtn: { width: '100%', padding: '12px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};
