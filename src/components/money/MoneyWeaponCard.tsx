// src/components/money/MoneyWeaponCard.tsx
import React, { useMemo } from 'react';
import { calcRPGStats, getEquippedItems } from '../../money/moneyGameLogic';

interface MoneyWeaponCardProps {
  transactions?: any[];
  dayStatuses?: any[];
  savedAmount?: number; // 저축액 (게임 골드)
}

const MoneyWeaponCard: React.FC<MoneyWeaponCardProps> = ({
  transactions = [],
  dayStatuses = [],
  savedAmount = 0,
}) => {
  // 스탯 계산
  const stats = useMemo(() => calcRPGStats(transactions, dayStatuses, savedAmount), [transactions, dayStatuses, savedAmount]);
  
  // 스탯에 따른 장비 자동 장착
  const gears = useMemo(() => getEquippedItems(stats), [stats]);

  return (
    <div style={{
      width: '100%',
      marginTop: 16,
      paddingTop: 16,
      borderTop: '1px dashed #eee',
    }}>
      <div style={{ fontSize: 11, color: '#b59a7a', letterSpacing: '1px', marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}>
        CURRENT EQUIPMENT
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <GearSlot type="무기" gear={gears.weapon} statName="INT" statVal={stats.int} color="#4da6ff" />
        <GearSlot type="방어구" gear={gears.armor} statName="STR" statVal={stats.str} color="#ff6b6b" />
        <GearSlot type="장신구" gear={gears.accessory} statName="DEX" statVal={stats.dex} color="#ffd700" />
      </div>
      
      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 10, color: '#aaa' }}>
        * 행동(기록/무지출/파밍)을 하면 스탯이 오르고 장비가 진화합니다.
      </div>
    </div>
  );
};

// 작은 장비 슬롯 컴포넌트 (내부용)
const GearSlot = ({ type, gear, statName, statVal, color }: any) => (
  <div style={{ 
    flex: 1, 
    backgroundColor: '#fbfbfb', 
    borderRadius: '12px', 
    padding: '10px 4px', 
    textAlign: 'center',
    border: `1px solid ${gear.grade === 'A' ? color : '#eee'}`,
    boxShadow: gear.grade === 'A' ? `0 0 10px ${color}30` : 'none',
    transition: 'all 0.3s ease'
  }}>
    <div style={{ fontSize: '28px', marginBottom: 6 }}>{gear.icon}</div>
    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 2 }}>{gear.name}</div>
    <div style={{ fontSize: 10, color: '#999', marginBottom: 4 }}>
      {type} <span style={{ color, fontWeight: 'bold' }}>{gear.grade}급</span>
    </div>
    <div style={{ fontSize: 9, color: '#aaa', backgroundColor: '#eee', display: 'inline-block', padding: '2px 6px', borderRadius: '4px' }}>
      {statName} {statVal}
    </div>
  </div>
);

export default MoneyWeaponCard;
