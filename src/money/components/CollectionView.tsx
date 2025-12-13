// src/money/components/CollectionView.tsx

import React, { useState } from 'react';
import { UserState } from '../types';
import { COLLECTION_DB } from '../gameData';

interface Props {
  user: UserState;
  onBack: () => void;
}

export const CollectionView: React.FC<Props> = ({ user, onBack }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 획득 여부 확인 헬퍼
  const isCollected = (id: string) => user.collection.some(c => c.id === id);

  const selectedItem = COLLECTION_DB.find(c => c.id === selectedId);
  const hasSelected = selectedId ? isCollected(selectedId) : false;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📖 수집 도감</h2>
        <div style={styles.stats}>
          달성률: {Math.round((user.collection.length / COLLECTION_DB.length) * 100)}%
        </div>
      </div>

      <div style={styles.gridArea}>
        {COLLECTION_DB.map((item) => {
          const collected = isCollected(item.id);
          return (
            <div 
              key={item.id} 
              style={{
                ...styles.slot,
                backgroundColor: collected ? '#4338ca' : '#1e1b4b',
                border: collected ? '2px solid #fbbf24' : '1px dashed #4b5563',
                opacity: collected ? 1 : 0.5
              }}
              onClick={() => setSelectedId(item.id)}
            >
              <div style={styles.icon}>{collected ? (item.type === 'BADGE' ? '🏅' : '💎') : '?'}</div>
            </div>
          );
        })}
      </div>

      {/* 상세 정보 패널 */}
      <div style={styles.detailPanel}>
        {selectedItem ? (
          <>
            <h3 style={styles.itemName}>
              {hasSelected ? selectedItem.name : '???'}
            </h3>
            <p style={styles.itemDesc}>
              {hasSelected ? selectedItem.desc : '아직 획득하지 못했습니다.'}
            </p>
          </>
        ) : (
          <p style={styles.placeholderText}>슬롯을 터치하여 정보를 확인하세요.</p>
        )}
      </div>

      <button onClick={onBack} style={styles.backBtn}>닫기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#312e81', display: 'flex', flexDirection: 'column', color: '#fff', padding: '20px', boxSizing: 'border-box' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { margin: 0, fontSize: '20px', color: '#fbbf24' },
  stats: { fontSize: '12px', color: '#c7d2fe', marginTop: '5px' },
  
  gridArea: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', overflowY: 'auto', alignContent: 'start' },
  slot: { aspectRatio: '1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s' },
  icon: { fontSize: '24px' },

  detailPanel: { marginTop: '15px', padding: '15px', backgroundColor: '#1e1b4b', borderRadius: '12px', minHeight: '80px', border: '1px solid #4338ca' },
  itemName: { margin: '0 0 5px 0', fontSize: '16px', color: '#fbbf24' },
  itemDesc: { margin: 0, fontSize: '13px', color: '#e0e7ff', lineHeight: '1.4' },
  placeholderText: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '10px' },

  backBtn: { marginTop: '15px', padding: '12px', backgroundColor: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};
