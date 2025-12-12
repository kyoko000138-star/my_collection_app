import React, { useMemo } from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../moneyLuna'; // 경로 주의!
import { DialogueBox } from '../../game/components/DialogueBox';
import { useDialogue } from '../../game/useDialogue';
import { FIRST_MEET_ANGEL_NORMAL } from '../../game/dialogueScriptsFirstMeet';

interface VillageViewProps {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
  onDayEnd: () => void;
}

export const VillageView: React.FC<VillageViewProps> = ({
  user,
  onChangeScene,
  onDayEnd,
}) => {
  // --- 1. 데이터 추출 ---
  const { treeLevel, flowerState, weedCount } = user.garden;
  const assets = user.assets;
  
  // 루나 상태 계산 (배경 분위기용)
  const luna = useMemo(() => calculateLunaPhase(user.lunaCycle), [user.lunaCycle]);

  // 대화 시스템 훅
  const { currentLine, visible, startScript, next } = useDialogue();

  // --- 2. 비주얼 결정 로직 ---
  
  // 나무: 레벨별 이모지 및 크기
  const treeEmoji = treeLevel === 0 ? '🌱' : treeLevel < 2 ? '🌿' : treeLevel < 4 ? '🌳' : '🌲';
  const treeSize = 40 + (treeLevel * 15);

  // 꽃: 상태별 이모지
  const getFlowers = () => {
    if (flowerState === 'withered') return '🥀';
    if (flowerState === 'blooming') return '🌷';
    return '🌱';
  };

  // 배경색: 루나 사이클(생리/PMS)에 따라 붉은 기운 추가
  const getSkyStyle = () => {
    if (luna.isPeriod) return styles.skyPeriod; // 붉은 하늘
    if (luna.phaseName.includes('PMS')) return styles.skyPMS; // 어두운 보라
    return styles.skyNormal; // 맑은 파랑
  };

  // NPC 대화 핸들러 (천사)
  const handleTalk = () => {
    startScript(FIRST_MEET_ANGEL_NORMAL);
  };

  return (
    <div style={styles.container}>
      
      {/* --- [Layer 1] 배경 (하늘/땅) --- */}
      <div style={{ ...styles.skyBase, ...getSkyStyle() }}>
        {/* 달/해 표시 */}
        <div style={styles.celestialBody}>
          {luna.isPeriod ? '🔴' : luna.phaseName.includes('PMS') ? '🌑' : '☀️'}
        </div>
      </div>
      <div style={styles.groundBase} />

      {/* --- [Layer 2] 정원 오브젝트 (자산 시각화) --- */}

      {/* 1. 저택 (고정비) - 좌측 상단 */}
      <div style={styles.housePos}>
        <div style={styles.objEmoji}>{assets.mansion >= 10 ? '🏰' : assets.mansion >= 5 ? '🏡' : '🏠'}</div>
        <div style={styles.objLabel}>Lv.{Math.floor(assets.mansion / 10) + 1} 마이홈</div>
      </div>

      {/* 2. 온실/비행장 (무지출) - 우측 상단 */}
      <div style={styles.airfieldPos}>
        <div style={styles.objEmoji}>{assets.greenhouse >= 10 ? '🚀' : '⛺'}</div>
      </div>

      {/* 3. 울타리 (방어) - 중앙 띠 */}
      <div style={styles.fenceRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} style={{ opacity: assets.fence > i * 5 ? 1 : 0.3 }}>🚧</span>
        ))}
      </div>

      {/* 4. 꿈의 나무 (저축) - 중앙 */}
      <div style={styles.treePos}>
        <div style={{ fontSize: `${treeSize}px`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.4))' }}>
          {treeEmoji}
        </div>
      </div>

      {/* 5. 꽃밭 (지출 상태) - 나무 주변 */}
      <div style={styles.flowerLeft}>
        {getFlowers()} {getFlowers()}
      </div>
      <div style={styles.flowerRight}>
        {getFlowers()} {getFlowers()}
      </div>

      {/* 6. 잡초 (부채/과소비) - 바닥에 깔림 */}
      {weedCount > 0 && (
        <div style={styles.weedLayer}>
          {Array.from({ length: Math.min(weedCount, 8) }).map((_, i) => (
            <span key={i} style={styles.weed}>🕸️</span>
          ))}
        </div>
      )}

      {/* --- [Layer 3] 캐릭터 & NPC --- */}
      
      {/* 플레이어 */}
      <div style={styles.player}>
        <div style={{ animation: 'bounce 2s infinite' }}>🧙‍♀️</div>
        <div style={styles.shadow} />
        {/* 말풍선 (상태 메시지) */}
        <div style={styles.bubble}>
          {luna.isPeriod ? "몸이 무거워..." : weedCount > 3 ? "정원 정리가 필요해." : "평화롭구나."}
        </div>
      </div>

      {/* 천사 NPC (클릭 가능) */}
      <div style={styles.npcAngel} onClick={handleTalk}>
        👼
      </div>

      {/* --- [Layer 4] 상호작용 UI --- */}
      
      {/* 여관 (하루 마감) 버튼 */}
      <button onClick={onDayEnd} style={styles.restBtn}>
        🛏️ 하루 마감 (Rest)
      </button>

      {/* 대화창 컴포넌트 */}
      <DialogueBox line={currentLine} visible={visible} onNext={next} />
    </div>
  );
};

// ---------------------------------------------------------
// 🎨 스타일 정의 (Pixel Art Vibe)
// ---------------------------------------------------------
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
    backgroundColor: '#86efac', // Fallback
    fontFamily: '"NeoDungGeunMo", monospace',
  },

  // 배경
  skyBase: {
    position: 'absolute', top: 0, width: '100%', height: '40%',
    borderBottom: '4px solid rgba(0,0,0,0.1)',
    transition: 'background 1s ease',
  },
  skyNormal: { background: 'linear-gradient(to bottom, #3b82f6, #93c5fd)' }, // 파란 하늘
  skyPeriod: { background: 'linear-gradient(to bottom, #7f1d1d, #fca5a5)' }, // 붉은 하늘 (경고)
  skyPMS: { background: 'linear-gradient(to bottom, #312e81, #818cf8)' },    // 보라색 밤 (우울)

  groundBase: {
    position: 'absolute', top: '40%', width: '100%', height: '60%',
    backgroundColor: '#4ade80', // 잔디색
    backgroundImage: 'radial-gradient(#22c55e 15%, transparent 16%)', // 도트 패턴
    backgroundSize: '20px 20px',
  },
  celestialBody: {
    position: 'absolute', top: '20px', right: '20px', fontSize: '32px',
    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))'
  },

  // 오브젝트 위치
  housePos: { position: 'absolute', top: '25%', left: '10%', zIndex: 5, textAlign: 'center' },
  airfieldPos: { position: 'absolute', top: '30%', right: '10%', zIndex: 4, fontSize: '30px' },
  
  treePos: { 
    position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -20%)', 
    zIndex: 6, textAlign: 'center' 
  },
  
  flowerLeft: { position: 'absolute', top: '55%', left: '25%', fontSize: '20px', zIndex: 5 },
  flowerRight: { position: 'absolute', top: '55%', right: '25%', fontSize: '20px', zIndex: 5 },
  
  fenceRow: { 
    position: 'absolute', top: '48%', width: '100%', textAlign: 'center', 
    zIndex: 3, opacity: 0.9, fontSize: '18px', letterSpacing: '10px' 
  },

  weedLayer: {
    position: 'absolute', bottom: '15%', width: '100%', textAlign: 'center', 
    zIndex: 7, pointerEvents: 'none'
  },
  weed: { display: 'inline-block', fontSize: '24px', margin: '0 10px', filter: 'grayscale(50%)' },

  objEmoji: { fontSize: '48px', filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.2))' },
  objLabel: { 
    backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', 
    padding: '2px 4px', borderRadius: 4, marginTop: '-5px' 
  },

  // 캐릭터
  player: {
    position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-50%)',
    fontSize: '42px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  shadow: {
    width: '30px', height: '8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '50%', marginTop: '-5px'
  },
  bubble: {
    position: 'absolute', top: '-40px', backgroundColor: '#fff', color: '#000',
    padding: '4px 8px', borderRadius: '8px', fontSize: '11px', whiteSpace: 'nowrap',
    border: '2px solid #000', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
  },

  // NPC
  npcAngel: {
    position: 'absolute', top: '20%', right: '40%', fontSize: '30px', 
    cursor: 'pointer', animation: 'float 3s infinite ease-in-out', zIndex: 8
  },

  // UI 버튼
  restBtn: {
    position: 'absolute', bottom: '10px', right: '10px',
    backgroundColor: '#f59e0b', color: '#fff',
    border: '2px solid #fff', borderRadius: '8px',
    padding: '8px 12px', fontSize: '12px', fontWeight: 'bold',
    cursor: 'pointer', zIndex: 20, boxShadow: '0 4px 0 #b45309'
  }
};
