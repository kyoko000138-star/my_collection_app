// src/money/components/GardenView.tsx

import React, { useState } from 'react';
import { UserState, Scene } from '../types';

interface Props {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
  onDayEnd: () => void;
  // [NEW] 아이템 사용을 부모에게 요청하는 함수
  onUseItem: (itemId: string) => void; 
}

export const GardenView: React.FC<Props> = ({ user, onChangeScene, onDayEnd, onUseItem }) => {
  const [showBag, setShowBag] = useState(false);
  
  // 1. 시각적 요소 계산
  const { treeLevel, pondLevel, flowerState, weedCount } = user.garden;
  
  // 나무 상태
  const getTreeIcon = () => {
    if (treeLevel === 0) return '🌱'; 
    if (treeLevel < 5) return '🌳';   
    if (treeLevel < 10) return '🌲';  
    return '🍎'; 
  };

  // 꽃 상태
  const getFlowerIcon = () => {
    if (flowerState === 'withered') return '🥀';
    if (flowerState === 'blooming') return '🌻';
    return '🌷'; 
  };

  // 잡초 (개수에 따라 반복)
  const renderWeeds = () => {
    return Array.from({ length: Math.min(5, weedCount) }).map((_, i) => (
      <span key={i} style={styles.weed}>🌿</span>
    ));
  };

  // 아이템 사용 핸들러 (부모 호출 + 가방 닫기)
  const handleUseItem = (itemId: string) => {
    onUseItem(itemId);
    setShowBag(false);
  };

  return (
    <div style={styles.container}>
      {/* 1. 배경 (하늘 & 땅) */}
      <div style={styles.sky}>
        <div style={styles.cloud}>☁️</div>
        <div style={{...styles.cloud, left: '70%', top: '20%'}}>☁️</div>
      </div>
      <div style={styles.ground} />

      {/* 2. 오브젝트 배치 */}
      <div style={styles.sceneLayer}>
        {/* 나무 (중앙) */}
        <div style={styles.treeArea}>
          <div style={styles.treeIcon}>{getTreeIcon()}</div>
          <div style={styles.labelBadge}>Lv.{treeLevel} 꿈의 나무</div>
        </div>

        {/* 꽃밭 (좌측) */}
        <div style={styles.flowerArea}>
          <div style={styles.flowerIcon}>{getFlowerIcon()}</div>
          <div style={styles.labelBadge}>{flowerState}</div>
        </div>

        {/* 연못 (우측) */}
        <div style={styles.pondArea}>
          <div style={styles.pondIcon}>{pondLevel > 0 ? '💧' : '🕳️'}</div>
        </div>

        {/* 잡초 */}
        <div style={styles.weedArea}>
          {renderWeeds()}
          {weedCount > 5 && <span style={styles.weedPlus}>+{weedCount-5}</span>}
        </div>

        {/* 집 (배경) */}
        <div style={styles.house} onClick={() => onChangeScene(Scene.MY_ROOM)}>
          🏠
        </div>
      </div>

      {/* 3. UI 오버레이 */}
      <div style={styles.uiLayer}>
        {/* 메시지 */}
        <div style={styles.messageBox}>
          {"오늘도 정원은 평화롭습니다."}
        </div>

        {/* 하단 버튼 그룹 */}
        <div style={styles.btnGroup}>
          <button style={styles.actionBtn} onClick={() => setShowBag(!showBag)}>
            🎒 가방
          </button>
          <button style={styles.sleepBtn} onClick={onDayEnd}>
            🛌 하루 마감
          </button>
        </div>

        {/* 미니 가방 (아이템 사용) */}
        {showBag && (
          <div style={styles.bagPopup}>
            <div style={styles.bagTitle}>정원 도구함</div>
            <div style={styles.bagGrid}>
              <div style={styles.bagItem} onClick={() => handleUseItem('water_can')}>
                <span>🚿</span> 물뿌리개
              </div>
              <div style={styles.bagItem} onClick={() => handleUseItem('hoe')}>
                <span>⛏️</span> 호미
              </div>
              <div style={styles.bagItem} onClick={() => handleUseItem('nutrient')}>
                <span>🧪</span> 영양제
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  
  sky: { flex: 1, backgroundColor: '#60a5fa', position: 'relative' },
  ground: { height: '35%', backgroundColor: '#4ade80', borderTop: '4px solid #22c55e' },
  cloud: { position: 'absolute', top: '10%', left: '10%', fontSize: '40px', opacity: 0.8, animation: 'float 6s infinite ease-in-out' },

  sceneLayer: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  
  treeArea: { position: 'absolute', bottom: '25%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'auto' },
  treeIcon: { fontSize: '80px', filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.3))' },
  
  flowerArea: { position: 'absolute', bottom: '20%', left: '20%', textAlign: 'center' },
  flowerIcon: { fontSize: '40px' },

  pondArea: { position: 'absolute', bottom: '20%', right: '20%' },
  pondIcon: { fontSize: '40px' },

  weedArea: { position: 'absolute', bottom: '15%', width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px' },
  weed: { fontSize: '20px', filter: 'grayscale(100%)' },
  weedPlus: { fontSize: '12px', color: '#15803d', fontWeight: 'bold' },

  house: { position: 'absolute', bottom: '30%', right: '10%', fontSize: '50px', cursor: 'pointer', pointerEvents: 'auto' },

  labelBadge: { backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', marginTop: '-5px' },

  uiLayer: { position: 'absolute', bottom: 0, width: '100%', padding: '15px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 20 },
  
  messageBox: { backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', marginBottom: '5px' },
  
  btnGroup: { display: 'flex', gap: '10px' },
  actionBtn: { flex: 1, padding: '12px', backgroundColor: '#f59e0b', border: '2px solid #fff', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', pointerEvents: 'auto' },
  sleepBtn: { flex: 1, padding: '12px', backgroundColor: '#3b82f6', border: '2px solid #fff', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', pointerEvents: 'auto' },

  bagPopup: { position: 'absolute', bottom: '80px', left: '15px', right: '15px', backgroundColor: '#fff', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', pointerEvents: 'auto' },
  bagTitle: { color: '#333', fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' },
  bagGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
  bagItem: { backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', color: '#333', border: '1px solid #ddd' }
};
