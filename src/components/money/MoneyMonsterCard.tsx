// src/components/money/MoneyMonsterCard.tsx
import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { 
  getTopDiscretionaryCategory, 
  pickMonsterForCategory, 
  calcMonsterHp 
} from '../../money/moneyMonsters';

// 🖼️ 이미지 링크를 여기서 바로 정의 (파일 분리 X)
const FIELD_IMAGES: Record<string, string> = {
  'delivery-dragon': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
  'shopping-slime': 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?q=80&w=600&auto=format&fit=crop',
  'cafe-ghost': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
};

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

  // ⚠️ 에러 수정: ratio 변수 명확하게 정의
  const ratio = monster.maxHp ? currentHp / monster.maxHp : 1;
  const hpPercent = ratio * 100;
  const isDead = currentHp === 0;

  const bgImage = FIELD_IMAGES[monster.id] || FIELD_IMAGES['default'];

  return (
    <div style={{
      position: 'relative',
      width: '100%', 
      height: '260px', // 📉 높이 줄임 (320 -> 260)
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      border: '2px solid #333',
      color: '#fff',
      backgroundColor: '#222'
    }}>
      
      {/* 배경 이미지 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.35) blur(0.5px)', // 좀 더 어둡게 해서 글자 잘 보이게
        zIndex: 0,
        transition: 'all 0.5s ease'
      }} />

      {/* 📍 지역 배지 */}
      <div style={{ 
        zIndex: 1, position: 'absolute', top: 12, left: 12, 
        display: 'flex', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '8px',
        fontSize: 10, border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <MapPin size={10} color="#ff6b6b" />
        <span>{topCategory || '고요한 숲'}</span>
      </div>

      {/* 몬스터 이름 */}
      <div style={{ zIndex: 1, marginTop: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          {monster.name}
        </div>
      </div>

      {/* 몬스터 비주얼 (크기 축소) */}
      <div style={{ 
        zIndex: 1, 
        fontSize: '72px', // 📉 이모지 크기 줄임 (100 -> 72)
        margin: '12px 0',
        filter: isDead ? 'grayscale(100%) blur(2px)' : 'drop-shadow(0 0 20px rgba(0,0,0,0.6))',
        transform: isDead ? 'scale(0.8)' : 'scale(1)',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {monsterEmoji}
      </div>

      {isDead && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)',
          fontSize: '32px', fontWeight: '900', color: '#ff4444', border: '3px solid #ff4444', padding: '4px 12px', zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.8)', whiteSpace: 'nowrap'
        }}>CLEARED</div>
      )}

      {/* HP 바 */}
      <div style={{ width: '80%', zIndex: 1, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: '#fff', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          <span>HP</span>
          <span>{currentHp} / {monster.maxHp}</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
          <div style={{
            width: `${hpPercent}%`, height: '100%',
            backgroundColor: ratio <= 0.3 ? '#ff4444' : '#ffaa00', // ⚠️ 여기서 ratio 사용 (이제 정의됨)
            transition: 'width 0.5s ease',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3)'
          }} />
        </div>
      </div>
    </div>
  );
};

export default MoneyMonsterCard;
