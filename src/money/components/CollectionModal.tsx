// src/money/components/CollectionModal.tsx

import React, { useState } from 'react';
import { CollectionItem } from '../types';

interface CollectionModalProps {
  open: boolean;
  onClose: () => void;
  collection: CollectionItem[];
}

export const CollectionModal: React.FC<CollectionModalProps> = ({ open, onClose, collection }) => {
  const [tab, setTab] = useState<'JUNK' | 'BADGE'>('JUNK');

  if (!open) return null;

  // 카테고리별 필터링
  const items = collection.filter(item => item.category === tab);

  return (
    <div style={styles.backdrop}>
      <div style={styles.modalContent}>
        <h2 style={styles.title}>📖 수집 도감</h2>
        
        {/* 탭 메뉴 */}
        <div style={styles.tabs}>
          <button 
            style={tab === 'JUNK' ? styles.activeTab : styles.tab} 
            onClick={() => setTab('JUNK')}
          >
            🗑️ 전리품
          </button>
          <button 
            style={tab === 'BADGE' ? styles.activeTab : styles.tab} 
            onClick={() => setTab('BADGE')}
          >
            🏅 배지
          </button>
        </div>

        {/* 리스트 영역 */}
        <div style={styles.listArea}>
          {items.length === 0 ? (
            <div style={styles.emptyState}>
              아직 수집한 기록이 없습니다.<br/>
              <span style={{fontSize:'12px', color:'#6b7280'}}>
                {tab === 'JUNK' ? '(지출 시 확률적으로 발견)' : '(특정 조건 달성 시 획득)'}
              </span>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}_${idx}`} style={styles.itemCard}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemName}>{item.name}</span>
                  <span style={styles.itemDate}>{item.obtainedAt.split('T')[0]}</span>
                </div>
                <div style={styles.itemDesc}>{item.description}</div>
              </div>
            ))
          )}
        </div>

        <button onClick={onClose} style={styles.btnClose}>닫기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    width: '90%', maxWidth: '380px', height: '60vh',
    backgroundColor: '#1f2937', borderRadius: '16px', padding: '20px',
    display: 'flex', flexDirection: 'column', color: '#f3f4f6'
  },
  title: { margin: '0 0 20px 0', fontSize: '20px', textAlign: 'center' },
  tabs: { display: 'flex', marginBottom: '15px', borderBottom: '1px solid #374151' },
  tab: { flex: 1, padding: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' },
  activeTab: { flex: 1, padding: '10px', background: 'none', borderBottom: '2px solid #8b5cf6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  listArea: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  emptyState: { textAlign: 'center', color: '#6b7280', marginTop: '50px' },
  itemCard: { backgroundColor: '#111827', padding: '12px', borderRadius: '8px', border: '1px solid #374151' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  itemName: { fontWeight: 'bold', color: '#d1d5db' },
  itemDate: { fontSize: '10px', color: '#6b7280' },
  itemDesc: { fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' },
  btnClose: { marginTop: '15px', padding: '12px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};
