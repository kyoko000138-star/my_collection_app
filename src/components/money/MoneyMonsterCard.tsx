// src/components/money/MoneyMonsterCard.tsx
import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { 
  getTopDiscretionaryCategory, 
  pickMonsterForCategory, 
  calcMonsterHp 
} from '../../money/moneyMonsters';
import { FIELD_IMAGES } from '../../money/moneyImages'; // 👈 이미지 import

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
  
  const monsterEmoji = (() => {
    switch (monster.id) {
      case 'delivery-dragon': return '🐲';
      case 'shopping-slime': return '🛍️';
      case 'cafe-ghost': return '👻';
      default: return '💧';
    }
  })();

  const hpRatio = monster.maxHp ? (currentHp / monster.maxHp) * 100 : 100;
  const isDead = currentHp === 0;

  // 🖼️ 배경 이미지 선택
  const bgImage = FIELD_IMAGES[monster.id] || FIELD_IMAGES['default'];

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '320px', borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      border: '4px solid #333',
      color: '#fff'
    }}>
      
      {/* 🖼️ 배경 이미지 (어둡게 처리) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.4)', // 글자 잘 보이게 어둡게
        zIndex: 0,
        transition: 'all 0.5s ease'
      }} />

      {/* 📍 필드 이름 배지 */}
      <div style={{ 
        zIndex: 1, position: 'absolute', top: 16, left: 16, 
        display: 'flex', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '12px',
        fontSize: 11, border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <MapPin size={12} color="#ff6b6b" />
        <span>위험 지역: {topCategory || '평화로운 숲'}</span>
      </div>

      {/* 몬스터 정보 */}
      <div style={{ zIndex: 1, marginTop: 10 }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          {monster.name}
        </div>
      </div>

      {/* 몬스터 비주얼 */}
      <div style={{ 
        zIndex: 1, fontSize: '100px', margin: '20px 0',
        filter: isDead ? 'grayscale(100%) blur(2px)' : 'drop-shadow(0 0 20px rgba(0,0,0,0.5))',
        transform: isDead ? 'scale(0.8)' : 'scale(1)',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {monsterEmoji}
      </div>

      {isDead && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)',
          fontSize: '40px', fontWeight: '900', color: '#ff4444', border: '4px solid #ff4444', padding: '4px 12px', zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.8)'
        }}>CLEARED</div>
      )}

      {/* HP 바 */}
      <div style={{ width: '80%', zIndex: 1, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          <span>HP</span>
          <span>{currentHp} / {monster.maxHp}</span>
        </div>
        <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
          <div style={{
            width: `${hpRatio}%`, height: '100%',
            backgroundColor: ratio <= 0.3 ? '#ff4444' : '#ffaa00',
            transition: 'width 0.5s ease',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3)'
          }} />
        </div>
      </div>
    </div>
  );
};

export default MoneyMonsterCard;
