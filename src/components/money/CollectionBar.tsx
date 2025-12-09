// src/components/money/CollectionBar.tsx
import React from 'react';
import { Leaf, Coffee, Flame } from 'lucide-react';

const CollectionBar: React.FC<any> = () => {
  // TODO: 나중에 Leaf 포인트 계산해서 실제 수집 현황 보여주기
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 16,
        border: '1px solid #e5e5e5',
        backgroundColor: '#fcfaf5',
        fontSize: 13,
        color: '#555',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#b59a7a',
          marginBottom: 6,
        }}
      >
        COLLECTION
      </div>
      <div style={{ fontSize: 15, marginBottom: 6, color: '#333' }}>
        이번 달 재정 컬렉션
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Leaf size={14} /> x 0
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Coffee size={14} /> x 0
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Flame size={14} /> x 0
        </span>
      </div>
    </div>
  );
};

export default CollectionBar;
