import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../moneyLuna';

interface VillageViewProps {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ user, onChangeScene }) => {
  // 1. 유저 데이터 로딩 전 처리
  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <p>L O A D I N G . . .</p>
      </div>
    );
  }

  // 2. 데이터 계산
  const currentHpPercent = user.maxBudget > 0 
    ? Math.max(0, Math.min(100, (user.currentBudget / user.maxBudget) * 100))
    : 0;

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.max(1, lastDay.getDate() - today.getDate() + 1);
  const dailySurvivalBudget = Math.floor(user.currentBudget / daysLeft);
  
  const luna = calculateLunaPhase(user.lunaCycle);

  // 3. 화면 렌더링 (인라인 스타일 적용)
  return (
    <div style={styles.container}>
      
      {/* [배경] */}
      <div style={styles.backgroundLayer}>
        <div style={styles.windowFrame}>
          <div style={styles.windowGlassUpper} />
          <div style={styles.windowBar} />
          <div style={styles.moonIcon}>
            {luna.isPeriod ? '🔴' : '🌙'}
          </div>
        </div>
      </div>

      {/* [캐릭터] */}
      <div style={styles.characterLayer}>
        <div style={styles.characterSprite}>
          <div style={styles.characterEmoji}>🧙‍♀️</div>
          <div style={styles.characterShadow} />
        </div>

        <div style={styles.dialogBox}>
          <p style={styles.dialogText}>
            "
            {luna.isPeriod ? '오늘은 몸이 무거워...' : '이번 달도 무사히 넘겨야 해.'}
            "
          </p>
          <div style={styles.dialogSubText}>(이번 달 {daysLeft}일 남음)</div>
        </div>
      </div>

      {/* [상태창 UI] */}
      <div style={styles.hudLeft}>
        <div style={styles.statusBox}>
          <div style={styles.statusHeader}>
            <span style={styles.userName}>{user.name}</span>
            <span style={styles.userLevel}>Lv.{user.level}</span>
          </div>
          <div style={styles.hpBarContainer}>
            <div style={{...styles.hpBarFill, width: `${currentHpPercent}%`}} />
            <span style={styles.hpText}>HP {Math.floor(currentHpPercent)}%</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={styles.budgetLabel}>남은 예산</p>
            <p style={styles.budgetValue}>{user.currentBudget.toLocaleString()} G</p>
          </div>
        </div>
      </div>

      <div style={styles.hudRight}>
        <div style={styles.limitBadge}>
          <span style={styles.limitLabel}>Today Limit</span>
          <span style={styles.limitValue}>{dailySurvivalBudget.toLocaleString()}</span>
        </div>
      </div>

      {/* [하단 버튼] */}
      <div style={styles.controllerArea}>
        <div style={styles.controllerBox}>
          <button onClick={() => onChangeScene(Scene.WORLD_MAP)} style={{...styles.controlBtn, backgroundColor: '#ef4444'}}>
            <span style={styles.btnIcon}>⚔️</span><span style={styles.btnLabel}>지출</span>
          </button>
          <button onClick={() => onChangeScene(Scene.INVENTORY)} style={{...styles.controlBtn, backgroundColor: '#3b82f6'}}>
            <span style={styles.btnIcon}>🎒</span><span style={styles.btnLabel}>가방</span>
          </button>
          <button onClick={() => onChangeScene(Scene.KINGDOM)} style={{...styles.controlBtn, backgroundColor: '#10b981'}}>
            <span style={styles.btnIcon}>🏰</span><span style={styles.btnLabel}>자산</span>
          </button>
          <button onClick={() => onChangeScene(Scene.COLLECTION)} style={{...styles.controlBtn, backgroundColor: '#f59e0b'}}>
            <span style={styles.btnIcon}>📖</span><span style={styles.btnLabel}>도감</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const styles: Record<string, React.CSSProperties> = {
  loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', backgroundColor: 'black' },
  container: { position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000', color: '#fff' },
  
  backgroundLayer: { position: 'absolute', inset: 0, backgroundColor: '#3b3247', opacity: 0.8 },
  windowFrame: { position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', backgroundColor: '#1e3a8a', border: '4px solid #78350f' },
  windowGlassUpper: { width: '100%', height: '50%', borderBottom: '2px solid #78350f' },
  windowBar: { position: 'absolute', top: 0, left: '50%', height: '100%', width: '2px', backgroundColor: '#78350f' },
  moonIcon: { position: 'absolute', top: '10px', right: '10px', fontSize: '20px' },

  characterLayer: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' },
  characterSprite: { fontSize: '80px', marginBottom: '10px' },
  characterEmoji: { zIndex: 10, position: 'relative' },
  characterShadow: { width: '60px', height: '10px', backgroundColor: 'black', borderRadius: '50%', opacity: 0.5, margin: '0 auto' },
  
  dialogBox: { backgroundColor: '#fff1cc', color: '#422006', padding: '8px 12px', borderRadius: '8px', border: '2px solid #6b4c35', textAlign: 'center' },
  dialogText: { margin: 0, fontSize: '14px', fontWeight: 'bold' },
  dialogSubText: { fontSize: '10px', color: '#854d0e', marginTop: '4px' },

  hudLeft: { position: 'absolute', top: '10px', left: '10px', width: '140px' },
  statusBox: { backgroundColor: '#eec39a', border: '2px solid #8b5a2b', borderRadius: '4px', padding: '6px', color: '#5d4037' },
  statusHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' },
  hpBarContainer: { width: '100%', height: '10px', backgroundColor: '#3e2723', marginBottom: '4px', position: 'relative' },
  hpBarFill: { height: '100%', backgroundColor: '#4ade80' },
  hpText: { position: 'absolute', top: -2, left: 0, width: '100%', textAlign: 'center', fontSize: '9px', color: 'white' },
  budgetLabel: { margin: 0, fontSize: '10px' },
  budgetValue: { margin: 0, fontSize: '12px', fontWeight: 'bold' },

  hudRight: { position: 'absolute', top: '10px', right: '10px' },
  limitBadge: { backgroundColor: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '12px', textAlign: 'center' },
  limitLabel: { display: 'block', fontSize: '9px' },
  limitValue: { fontSize: '12px', fontWeight: 'bold' },

  controllerArea: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' },
  controllerBox: { display: 'flex', gap: '5px', backgroundColor: '#fff1cc', padding: '5px', borderRadius: '8px' },
  controlBtn: { flex: 1, border: 'none', borderRadius: '4px', color: 'white', padding: '8px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  btnIcon: { fontSize: '18px' },
  btnLabel: { fontSize: '10px', marginTop: '2px' }
};
