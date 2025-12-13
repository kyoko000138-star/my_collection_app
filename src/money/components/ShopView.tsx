// src/money/components/ShopView.tsx

import React, { useState } from 'react';
import { ITEM_DB } from '../gameData';

interface Props {
  salt: number;
  onBuyItem: (itemId: string) => void;
  onBack: () => void;
}

export const ShopView: React.FC<Props> = ({ salt, onBuyItem, onBack }) => {
  // 판매 목록 필터링 (가격이 있는 것만)
  const shopItems = Object.values(ITEM_DB).filter(item => item.price && item.price > 0);

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h2 style={styles.title}>🏪 잡화점</h2>
        <div style={styles.wallet}>
          내 지갑: <span style={{color: '#fde047'}}>🧂 {salt} Salt</span>
        </div>
      </div>

      {/* 아이템 리스트 (스크롤) */}
      <div style={styles.listArea}>
        {shopItems.map(item => (
          <div key={item.id} style={styles.itemRow}>
            <div style={styles.itemInfo}>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.itemDesc}>{item.desc}</div>
            </div>
            <button 
              onClick={() => onBuyItem(item.id)}
              style={salt >= (item.price || 0) ? styles.btnBuy : styles.btnDisabled}
            >
              🧂 {item.price}
            </button>
          </div>
        ))}
        {shopItems.length === 0 && <div style={styles.emptyMsg}>진열된 상품이 없습니다.</div>}
      </div>

      {/* 푸터 */}
      <div style={styles.footer}>
        <button onClick={onBack} style={styles.backBtn}>나가기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#3f3cbb', display: 'flex', flexDirection: 'column', color: '#fff' },
  
  header: { padding: '20px', backgroundColor: '#312e81', borderBottom: '4px solid #4338ca', flexShrink: 0 },
  title: { margin: 0, fontSize: '18px', textAlign: 'center' },
  wallet: { textAlign: 'center', marginTop: '10px', fontSize: '14px', fontWeight: 'bold' },

  listArea: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 },
  
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#4338ca', padding: '12px', borderRadius: '8px', border: '1px solid #6366f1' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: '14px', fontWeight: 'bold', color: '#fff' },
  itemDesc: { fontSize: '11px', color: '#c7d2fe', marginTop: '2px' },
  
  btnBuy: { backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', minWidth: '60px' },
  btnDisabled: { backgroundColor: '#6b7280', color: '#d1d5db', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'not-allowed', minWidth: '60px' },

  emptyMsg: { textAlign: 'center', color: '#a5b4fc', marginTop: '50px' },

  footer: { padding: '15px', backgroundColor: '#312e81', borderTop: '2px solid #4338ca', flexShrink: 0 },
  backBtn: { width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};
