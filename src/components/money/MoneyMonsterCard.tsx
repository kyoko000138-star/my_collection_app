// src/components/money/MoneyMonsterCard.tsx
import React, { useMemo } from 'react';
import { 
  getTopDiscretionaryCategory, 
  pickMonsterForCategory, 
  calcMonsterHp, 
  MoneyMonster 
} from '../../money/moneyMonsters';

interface MoneyMonsterCardProps {
  transactions?: any[];
  dayStatuses?: any[];
}

const MoneyMonsterCard: React.FC<MoneyMonsterCardProps> = ({
  transactions = [],
  dayStatuses = [],
}) => {
  const topCategory = useMemo(() => getTopDiscretionaryCategory(transactions), [transactions]);
  const monster = useMemo(() => pickMonsterForCategory(topCategory), [topCategory]);
  const noSpendDays = useMemo(() => (dayStatuses || []).filter((d: any) => d?.isNoSpend).length, [dayStatuses]);
  const currentHp = useMemo(() => calcMonsterHp(monster, { noSpendDays }), [monster, noSpendDays]);
  
  // 3D 이모지 매핑 (기존 아이콘 대신 큰 이모지 사용)
  const monsterEmoji = (() => {
    switch (monster.id) {
      case 'delivery-dragon': return '🐲'; // 배달 드래곤
      case 'shopping-slime': return '🛍️'; // 지름 슬라임
      case 'cafe-ghost': return '👻';     // 카페 고스트
      default: return '💧';               // 텅장 슬라임
    }
  })();

  const hpRatio = monster.maxHp ? (currentHp / monster.maxHp) * 100 : 100;
  const isDead = currentHp === 0;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '320px', // 카드 높이 고정 (카드 게임처럼)
      borderRadius: '20px',
      backgroundColor: '#2a2a2a', // 어두운 배경 (몬스터 강조)
      color: '#fff',
      overflow: 'hidden',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      border: '4px solid #444'
    }}>
      
      {/* 배경 효과 (은은한 빛) */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
        zIndex: 0
      }} />

      {/* 📛 몬스터 이름 & 카테고리 */}
      <div style={{ zIndex: 1, marginTop: 20 }}>
        <div style={{ fontSize: 12, color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>WANTED</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'serif', margin: '4px 0' }}>{monster.name}</div>
        <div style={{ fontSize: 12, padding: '4px 10px', backgroundColor: '#444', borderRadius: '12px', display: 'inline-block' }}>
           출몰지: {topCategory || '미발견'}
        </div>
      </div>

      {/* 🐲 몬스터 비주얼 (엄청 크게!) */}
      <div style={{ 
        zIndex: 1, 
        fontSize: '100px', 
        margin: '20px 0',
        filter: isDead ? 'grayscale(100%) blur(2px)' : 'drop-shadow(0 0 20px rgba(255,0,0,0.3))',
        transform: isDead ? 'scale(0.8)' : 'scale(1)',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {monsterEmoji}
      </div>

      {isDead && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-15deg)',
          fontSize: '40px',
          fontWeight: '900',
          color: '#ff4444',
          border: '4px solid #ff4444',
          padding: '4px 12px',
          zIndex: 10,
          opacity: 0.8
        }}>
          CLEARED
        </div>
      )}

      {/* ❤️ HP 바 (게임 UI처럼) */}
      <div style={{ width: '80%', zIndex: 1, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#ff6b6b', fontWeight: 'bold' }}>
          <span>HP</span>
          <span>{currentHp} / {monster.maxHp}</span>
        </div>
        <div style={{ width: '100%', height: '12px', backgroundColor: '#111', borderRadius: '6px', border: '1px solid #555', overflow: 'hidden' }}>
          <div style={{
            width: `${hpRatio}%`,
            height: '100%',
            backgroundColor: '#ff4444',
            transition: 'width 0.5s ease',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3)'
          }} />
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
          {isDead ? "토벌 성공! 보상을 확인하세요." : monster.tip}
        </div>
      </div>

    </div>
  );
};

export default MoneyMonsterCard;
