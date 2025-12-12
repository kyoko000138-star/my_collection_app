// src/money/components/VillageView.tsx

import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../money/moneyLuna';

interface VillageViewProps {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
  onDayEnd: () => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ user, onChangeScene, onDayEnd }) => {
  const { treeLevel, flowerState, weedCount } = user.garden;
  const assets = user.assets;

  // 나무 크기 계산
  const treeSize = 40 + (treeLevel * 20);
  const treeEmoji = treeLevel === 0 ? '🌱' : treeLevel < 3 ? '🌿' : treeLevel < 5 ? '🌳' : '🌲';

  // 꽃 이모지
  const getFlowers = () => {
    if (flowerState === 'withered') return '🥀 🥀';
    if (flowerState === 'blooming') return '🌷 🌻 🌹';
    return '🌱 🌱';
  };

  return (
    <div style={styles.container}>
      {/* --- [배경 레이어] --- */}
      <div style={styles.ground} />
      <div style={styles.sky} />

      {/* --- [오브젝트 레이어] --- */}
      
      {/* 1. 내 집 (고정비 레벨에 따라 변화) */}
      <div style={styles.houseArea}>
        <div style={styles.houseEmoji}>{assets.mansion > 10 ? '🏰' : '🏠'}</div>
        <div style={styles.label}>Lv.{Math.floor(assets.mansion/10)+1} 마이홈</div>
      </div>

      {/* 2. 중앙 꿈의 나무 (저축) */}
      <div style={styles.treeArea}>
        <div style={{ fontSize: `${treeSize}px`, lineHeight: 1, filter:'drop-shadow(0 10px 5px rgba(0,0,0,0.3))' }}>
          {treeEmoji}
        </div>
      </div>

      {/* 3. 꽃밭 (좌우 배치) */}
      <div style={{ ...styles.flowerPatch, left: '10%' }}>{getFlowers()}</div>
      <div style={{ ...styles.flowerPatch, right: '10%' }}>{getFlowers()}</div>

      {/* 4. 잡초 (부채) */}
      {weedCount > 0 && (
        <div style={styles.weeds}>
          {Array.from({ length: Math.min(weedCount, 5) }).map((_, i) => (
            <span key={i} style={{ animation: 'sway 2s infinite' }}>🕸️</span>
          ))}
        </div>
      )}

      {/* 5. 울타리 (방어) */}
      <div style={styles.fenceRow}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} style={{ fontSize: '20px' }}>🚧</span>
        ))}
      </div>

      {/* 6. 플레이어 캐릭터 (중앙 하단) */}
      <div style={styles.player}>
        <div className="animate-bounce">🧙‍♂️</div>
        <div style={styles.shadow} />
      </div>

      {/* --- [UI 레이어] --- */}
      <div style={styles.speechBubble}>
        "오늘도 정원을 가꿔볼까요?"
      </div>

      {/* 여관 버튼 (우측 하단) */}
      <button onClick={onDayEnd} style={styles.innBtn}>
        🛏️ 휴식 (Day End)
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    backgroundColor: '#86efac', // 잔디색
  },
  sky: {
    position: 'absolute', top: 0, width: '100%', height: '30%',
    background: 'linear-gradient(to bottom, #60a5fa, #bfdbfe)',
    borderBottom: '4px solid #4ade80'
  },
  ground: {
    position: 'absolute', top: '30%', width: '100%', height: '70%',
    backgroundImage: 'radial-gradient(#4ade80 20%, transparent 20%)',
    backgroundSize: '20px 20px',
    backgroundColor: '#86efac'
  },
  
  houseArea: {
    position: 'absolute', top: '20%', left: '10%', textAlign: 'center', zIndex: 5
  },
  houseEmoji: { fontSize: '50px', filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.2))' },
  label: { backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: 4 },

  treeArea: {
    position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)',
    zIndex: 4, textAlign: 'center'
  },

  flowerPatch: {
    position: 'absolute', top: '55%', fontSize: '24px', zIndex: 3
  },
  weeds: {
    position: 'absolute', bottom: '20%', width: '100%', textAlign: 'center',
    fontSize: '24px', opacity: 0.8, zIndex: 6
  },
  fenceRow: {
    position: 'absolute', top: '45%', width: '100%', textAlign: 'center',
    whiteSpace: 'nowrap', opacity: 0.9, zIndex: 2
  },

  player: {
    position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-50%)',
    fontSize: '40px', zIndex: 10
  },
  shadow: {
    width: '30px', height: '8px', backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: '50%', margin: '-5px auto 0'
  },

  speechBubble: {
    position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#fff', padding: '6px 12px', borderRadius: '12px',
    border: '2px solid #333', fontSize: '12px', fontWeight: 'bold',
    whiteSpace: 'nowrap', zIndex: 20,
    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
  },
  
  innBtn: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: '#f59e0b', border: '2px solid #fff',
    borderRadius: '8px', padding: '6px 10px',
    color: '#fff', fontWeight: 'bold', fontSize: '12px',
    cursor: 'pointer', zIndex: 30,
    boxShadow: '0 4px 0 #b45309'
  }
};
