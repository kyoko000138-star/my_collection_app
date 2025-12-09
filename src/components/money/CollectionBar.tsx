// src/components/money/CollectionBar.tsx
import React, { useMemo } from 'react';
import { Leaf, Coffee, Flame } from 'lucide-react';

// moneyGameLogic.ts 위치에 맞게 경로만 확인!
// 예: src/money/moneyGameLogic.ts 라면 ../../money/moneyGameLogic
import { calcLeafPoints, deriveCollection } from '../../money/moneyGameLogic';

interface CollectionBarProps {
  transactions?: any[];
  dayStatuses?: any[];
  installments?: any[];
}

const CollectionBar: React.FC<CollectionBarProps> = ({
  transactions = [],
  dayStatuses = [],
  installments = [],
}) => {
  const { leafPoints, leaves, tea, incense } = useMemo(() => {
    const lp = calcLeafPoints(transactions, dayStatuses, installments);
    const { leaves, tea, incense } = deriveCollection(lp);
    return { leafPoints: lp, leaves, tea, incense };
  }, [transactions, dayStatuses, installments]);

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
      <div style={{ fontSize: 15, marginBottom: 4, color: '#333' }}>
        이번 달 재정 컬렉션
      </div>

      <div style={{ fontSize: 12, marginBottom: 8, color: '#8b7760' }}>
        Leaf 포인트: <strong>{leafPoints}</strong>
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Leaf size={14} /> x {leaves}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Coffee size={14} /> x {tea}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Flame size={14} /> x {incense}
        </span>
      </div>
    </div>
  );
};

export default CollectionBar;
