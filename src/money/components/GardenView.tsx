// src/money/components/GardenView.tsx
import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../money/moneyLuna';

interface Props {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
  onDayEnd: () => void;
}

export const GardenView: React.FC<Props> = ({ user, onChangeScene, onDayEnd }) => {
  const { treeLevel, flowerState, weedCount } = user.garden;
  const assets = user.assets;
  const luna = calculateLunaPhase(user.lunaCycle);

  // 나무 상태
  const treeEmoji = treeLevel === 0 ? '🌱' : treeLevel < 3 ? '🌿' : treeLevel < 5 ? '🌳' : '🌲';
  
  // 배경 (루나 반영)
  const skyColor = luna.isPeriod ? 'linear-gradient(#7f1d1d, #fca5a5)' : 'linear-gradient(#60a5fa, #bfdbfe)';

  return (
    <div style={{...styles.container, background: skyColor}}>
      {/* 1. 배경 요소 */}
      <div style={styles.sun}>{luna.isPeriod ? '🔴' : '☀️'}</div>
      <div style={styles.ground} />

      {/* 2. 자산 오브젝트 (실제 정원 요소로 표현) */}
      <div style={styles.mansion}>
        <div style={{fontSize: '40px'}}>{assets.mansion >= 10 ? '🏰' : '🏠'}</div>
      </div>
      
      {/* 울타리 (방어) */}
      <div style={styles.fence}>
        {Array.from({length: 6}).map((_,i) => <span key={i}>I</span>)}
      </div>

      {/* 3. 중앙 꿈의 나무 */}
      <div style={styles.tree}>
        <div style={{fontSize: `${40 + treeLevel*15}px`, filter:'drop-shadow(0 10px 5px rgba(0,0,0,0.3))`}}>{treeEmoji}</div>
      </div>

      {/* 4. 잡초 및 꽃 */}
      <div style={styles.plants}>
        {weedCount > 0 && <span style={{filter:'grayscale(100%)'}}>🕸️</span>}
        {flowerState === 'blooming' && <span>🌷 🌻</span>}
      </div>

      {/* 5. 캐릭터 및 NPC */}
      <div style={styles.player}>
        <div className="animate-bounce">🧙‍♀️</div>
      </div>

      {/* 6. UI */}
      <div style={styles.topBar}>
        <div style={styles.locationTag}>🏡 나의 자산 정원</div>
      </div>

      {/* 마을로 나가기 버튼 */}
      <button onClick={() => onChangeScene(Scene.VILLAGE_MAP)} style={styles.exitBtn}>
        🚪 마을로 나가기
      </button>
      
      <button onClick={onDayEnd} style={styles.restBtn}>🛏️ 하루 마감</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
  ground: { position: 'absolute', top: '40%', width: '100%', height: '60%', backgroundColor: '#4ade80', borderRadius: '50% 50% 0 0 / 20px' },
  sun: { position: 'absolute', top: 20, right: 20, fontSize: 30 },
  mansion: { position: 'absolute', top: '30%', left: '10%', zIndex: 5 },
  fence: { position: 'absolute', top: '45%', width: '100%', textAlign: 'center', fontSize: 20, color: '#78350f', letterSpacing: 10, zIndex: 4 },
  tree: { position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -30%)', zIndex: 6, textAlign: 'center' },
  plants: { position: 'absolute', bottom: '20%', width: '100%', textAlign: 'center', fontSize: 24, zIndex: 5 },
  player: { position: 'absolute', bottom: '25%', left: '50%', transform: 'translateX(-50%)', fontSize: 40, zIndex: 10 },
  topBar: { position: 'absolute', top: 10, left: 10, zIndex: 20 },
  locationTag: { backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 },
  exitBtn: { position: 'absolute', bottom: 10, left: 10, padding: '8px', backgroundColor: '#3b82f6', color: '#fff', border: '2px solid #fff', borderRadius: 8, cursor: 'pointer', zIndex: 20 },
  restBtn: { position: 'absolute', bottom: 10, right: 10, padding: '8px', backgroundColor: '#f59e0b', color: '#fff', border: '2px solid #fff', borderRadius: 8, cursor: 'pointer', zIndex: 20 }
};
