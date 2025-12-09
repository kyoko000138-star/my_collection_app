// src/components/money/MoneyMonsterCard.tsx
import React from 'react';
import { MapPin } from 'lucide-react';

// 🖼️ 배경 이미지 (기존 유지)
const FIELD_IMAGES: Record<string, string> = {
  'shopping': 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?q=80&w=600&auto=format&fit=crop', // 쇼핑
  'delivery': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop', // 배달
  'cafe': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop', // 카페
  'default': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' // 기본 숲
};

// 👾 귀여운 몬스터 아바타 (이름에 따라 자동 변경)
const MONSTER_AVATARS: Record<string, string> = {
  'slime': 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png', // 슬라임 (쇼핑)
  'dragon': 'https://cdn-icons-png.flaticon.com/512/1236/1236237.png', // 용 (배달)
  'ghost': 'https://cdn-icons-png.flaticon.com/512/1236/1236248.png', // 유령 (카페)
  'golem': 'https://cdn-icons-png.flaticon.com/512/3062/3062650.png', // 골렘 (기타/할부)
};

interface MoneyMonsterCardProps {
  monsterName?: string;
  currentHp: number;
  maxHp: number;
  isHit?: boolean; // 공격 당함 여부 (애니메이션 트리거)
}

const MoneyMonsterCard: React.FC<MoneyMonsterCardProps> = ({ 
  monsterName = "낭비 슬라임", 
  currentHp, 
  maxHp,
  isHit = false 
}) => {
  const hpRatio = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const isDead = currentHp <= 0;

  // 1. 몬스터 이름에 따라 타입 추론 (이미지 매핑용)
  const getMonsterType = (name: string) => {
    if (name.includes('용') || name.includes('배달')) return 'dragon';
    if (name.includes('유령') || name.includes('카페')) return 'ghost';
    if (name.includes('골렘') || name.includes('고정')) return 'golem';
    return 'slime'; // 기본값 (쇼핑 등)
  };

  const type = getMonsterType(monsterName);

  // 2. 이미지 선택
  const avatarUrl = MONSTER_AVATARS[type];
  
  // 3. 배경 선택 (타입 기반 매핑)
  const bgKey = type === 'dragon' ? 'delivery' : type === 'ghost' ? 'cafe' : type === 'slime' ? 'shopping' : 'default';
  const bgImage = FIELD_IMAGES[bgKey];

  return (
    <div
      style={{
        position: 'relative',
        height: '280px', // 적절한 높이
        borderRadius: 16,
        overflow: 'hidden', // 배경 이미지가 둥근 모서리를 넘지 않게
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        textAlign: 'center',
        border: '1px solid #e5e5e5',
        // 💥 공격받으면 흔들리는 애니메이션
        transform: isHit ? 'translateX(-5px) rotate(-3deg)' : 'none',
        transition: 'transform 0.1s ease',
      }}
    >
      {/* 🖼️ 배경 이미지 (어둡게 처리) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.9) blur(1px)', // 배경 흐리게
        opacity: 0.2, // 투명도 조절 (너무 진하면 글씨 안보임)
        zIndex: 0,
      }} />

      {/* 컨텐츠 래퍼 (z-index로 배경 위로 올림) */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px', height: '100%', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        
        {/* 📍 지역 배지 */}
        <div style={{ 
          position: 'absolute', top: 12, left: 12, 
          display: 'flex', alignItems: 'center', gap: 4,
          backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: '12px',
          fontSize: 10, color: '#555', fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <MapPin size={10} color="#ff6b6b" />
          <span>{type === 'dragon' ? '배달의 계곡' : type === 'ghost' ? '카페 거리' : '쇼핑 숲'}</span>
        </div>

        {/* 몬스터 이름 & HP */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333', textShadow: '0 0 10px rgba(255,255,255,0.8)' }}>
            {monsterName}
          </div>
          <div style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
            HP {Math.round(currentHp)} / {maxHp}
          </div>
        </div>

        {/* 👾 몬스터 이미지 */}
        <div style={{ 
          height: 120, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: 16,
          // 맞으면 번쩍이는 필터 효과
          filter: isHit ? 'brightness(1.5) sepia(1) hue-rotate(-50deg) drop-shadow(0 0 10px red)' : 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))',
          transition: 'filter 0.1s'
        }}>
          <img 
            src={avatarUrl} 
            alt="Monster" 
            style={{ 
              height: '100%', 
              objectFit: 'contain', 
              opacity: isDead ? 0.3 : 1, 
              filter: isDead ? 'grayscale(100%)' : 'none',
              transform: isDead ? 'scale(0.9) rotate(10deg)' : 'scale(1)',
              transition: 'all 0.5s ease'
            }} 
          />
        </div>

        {/* HP 게이지 */}
        <div style={{ width: '100%', height: 12, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 6, overflow: 'hidden' }}>
          <div
            style={{
              width: `${hpRatio}%`,
              height: '100%',
              backgroundColor: hpRatio < 30 ? '#ef4444' : '#f59e0b',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* 💥 데미지 효과 텍스트 */}
        {isHit && (
          <div style={{
            position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)',
            fontSize: 32, fontWeight: '900', color: '#ff0000',
            textShadow: '2px 2px 0 #fff, 0 0 20px rgba(255,0,0,0.5)',
            zIndex: 20, pointerEvents: 'none'
          }}>
            HIT!
          </div>
        )}

        {/* 🏆 클리어 뱃지 */}
        {isDead && (
           <div style={{
             position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-10deg)',
             fontSize: '32px', fontWeight: '900', color: '#ef4444', 
             border: '4px solid #ef4444', padding: '4px 16px', borderRadius: 8,
             backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 10,
             whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
           }}>
             CLEARED
           </div>
        )}

      </div>
    </div>
  );
};

export default MoneyMonsterCard;
