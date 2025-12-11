// src/money/components/VillageView.tsx

import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../moneyLuna';

interface VillageViewProps {
  user: UserState;
  onChangeScene: (scene: Scene) => void;
}

export const VillageView: React.FC<VillageViewProps> = ({ user, onChangeScene }) => {
  // 로딩 처리
  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <p>L O A D I N G . . .</p>
      </div>
    );
  }

  // --- 데이터 계산 ---
  const currentHpPercent = user.maxBudget > 0 
    ? Math.max(0, Math.min(100, (user.currentBudget / user.maxBudget) * 100))
    : 0;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const rawDaysLeft = lastDay.getDate() - today.getDate() + 1;
  const daysLeft = Math.max(1, rawDaysLeft);
  const dailySurvivalBudget = Math.floor(user.currentBudget / daysLeft);
  
  const luna = calculateLunaPhase(user.lunaCycle);

  return (
    // [전체 컨테이너] - Tailwind 제거하고 인라인 스타일 적용
    <div style={styles.container}>
      
      {/* 1. [배경 레이어] */}
      <div style={styles.backgroundLayer}>
        {/* 창문 효과 */}
        <div style={styles.windowFrame}>
          <div style={styles.windowGlassUpper} />
          <div style={styles.windowBar} />
          <div style={styles.moonIcon}>
            {luna.isPeriod ? '🔴' : '🌙'}
          </div>
        </div>
      </div>

      {/* 2. [캐릭터 레이어] */}
      <div style={styles.characterLayer}>
        {/* 캐릭터 스프라이트 */}
        <div style={styles.characterSprite}>
          <div style={styles.characterEmoji}>🧙‍♀️</div>
          <div style={styles.characterShadow} />
        </div>

        {/* 대사창 */}
        <div style={styles.dialogBox}>
          <p style={styles.dialogText}>
            "
            {luna.isPeriod
              ? '오늘은 몸이 무거워...'
              : '이번 달도 무사히 넘겨야 해.'}
            "
          </p>
          <div style={styles.dialogSubText}>
            (이번 달 {daysLeft}일 남음)
          </div>
          <div style={styles.dialogArrow} />
        </div>
      </div>

      {/* 3. [UI 레이어 - HUD] */}

      {/* (1) 좌측 상단: 상태창 */}
      <div style={styles.hudLeft}>
        <div style={styles.statusBox}>
          {/* 모서리 장식 */}
          <div style={{...styles.cornerDot, top: 4, left: 4}} />
          <div style={{...styles.cornerDot, top: 4, right: 4}} />
          <div style={{...styles.cornerDot, bottom: 4, left: 4}} />
          <div style={{...styles.cornerDot, bottom: 4, right: 4}} />

          <div style={styles.statusHeader}>
            <span style={styles.userName}>{user.name}</span>
            <span style={styles.userLevel}>Lv.{user.level}</span>
          </div>

          {/* HP Bar */}
          <div style={styles.hpBarContainer}>
            <div style={{
              ...styles.hpBarFill, 
              width: `${currentHpPercent}%`
            }} />
            <span style={styles.hpText}>HP {Math.floor(currentHpPercent)}%</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={styles.budgetLabel}>남은 예산</p>
            <p style={styles.budgetValue}>{user.currentBudget.toLocaleString()} G</p>
          </div>
        </div>
      </div>

      {/* (2) 우측 상단: Today Limit */}
      <div style={styles.hudRight}>
        <div style={styles.limitBadge}>
          <span style={styles.limitLabel}>Today Limit</span>
          <span style={styles.limitValue}>{dailySurvivalBudget.toLocaleString()}</span>
        </div>
      </div>

      {/* 4. [UI 레이어 - 컨트롤러] */}
      <div style={styles.controllerArea}>
        <div style={styles.controllerBox}>
          <button onClick={() => onChangeScene(Scene.WORLD_MAP)} style={{...styles.controlBtn, backgroundColor: '#ef4444', borderColor: '#991b1b'}}>
            <span style={styles.btnIcon}>⚔️</span>
            <span style={styles.btnLabel}>지출</span>
          </button>

          <button onClick={() => onChangeScene(Scene.INVENTORY)} style={{...styles.controlBtn, backgroundColor: '#3b82f6', borderColor: '#1e40af'}}>
            <span style={styles.btnIcon}>🎒</span>
            <span style={styles.btnLabel}>가방</span>
          </button>

          <button onClick={() => onChangeScene(Scene.KINGDOM)} style={{...styles.controlBtn, backgroundColor: '#10b981', borderColor: '#047857'}}>
            <span style={styles.btnIcon}>🏰</span>
            <span style={styles.btnLabel}>자산</span>
          </button>

          <button onClick={() => onChangeScene(Scene.COLLECTION)} style={{...styles.controlBtn, backgroundColor: '#f59e0b', borderColor: '#b45309'}}>
            <span style={styles.btnIcon}>📖</span>
            <span style={styles.btnLabel}>도감</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 스타일 정의 (Tailwind 대체) ---
const styles: Record<string, React.CSSProperties> = {
  loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', backgroundColor: 'black' },
  
  // 전체 컨테이너
  container: { position: 'relative', width: '100%', height: '100%', overflow: 'hidden', userSelect: 'none', backgroundColor: '#000', fontFamily: 'inherit' },

  // 배경
  backgroundLayer: {
    position: 'absolute', inset: 0, zIndex: 0, backgroundColor: '#3b3247',
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 40%)
    `,
    backgroundSize: '20px 20px, 20px 20px, 100% 100%',
  },
  windowFrame: {
    position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)',
    width: '128px', height: '128px', backgroundColor: '#1e3a8a',
    border: '4px solid #78350f', opacity: 0.8, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
  },
  windowGlassUpper: { width: '100%', height: '50%', borderBottom: '4px solid #78350f' },
  windowBar: { position: 'absolute', top: 0, left: '50%', height: '100%', width: '4px', backgroundColor: '#78350f', transform: 'translateX(-50%)' },
  moonIcon: { position: 'absolute', top: '16px', right: '16px', fontSize: '24px', filter: 'drop-shadow(0 0 5px rgba(255,255,100,0.8))' },

  // 캐릭터
  characterLayer: { position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', pointerEvents: 'none' },
  characterSprite: { position: 'relative', animation: 'bounce-slow 2s infinite' }, // 애니메이션은 CSS 파일 필요할 수 있음 (없어도 위치는 잡힘)
  characterEmoji: { fontSize: '100px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' },
  characterShadow: { position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '16px', backgroundColor: '#000', opacity: 0.4, borderRadius: '50%', filter: 'blur(4px)' },
  
  dialogBox: { marginTop: '16px', backgroundColor: '#fff1cc', color: '#422006', padding: '8px 16px', borderRadius: '8px', border: '2px solid #422006', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '80%', textAlign: 'center' },
  dialogText: { fontSize: '14px', fontWeight: 'bold', lineHeight: 1.2, margin: 0 },
  dialogSubText: { fontSize: '10px', color: '#854d0e', marginTop: '4px', fontWeight: 'bold' },
  dialogArrow: { position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '16px', height: '16px', backgroundColor: '#fff1cc', borderTop: '2px solid #422006', borderLeft: '2px solid #422006' },

  // HUD Left
  hudLeft: { position: 'absolute', top: '8px', left: '8px', zIndex: 20, width: '160px' },
  statusBox: { backgroundColor: '#eec39a', border: '3px solid #8b5a2b', borderRadius: '4px', padding: '8px', boxShadow: '2px 2px 0 #000', position: 'relative' },
  cornerDot: { position: 'absolute', width: '4px', height: '4px', backgroundColor: '#5d4037' },
  statusHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px', borderBottom: '1px solid #c19a6b', paddingBottom: '4px' },
  userName: { fontSize: '12px', fontWeight: 'bold', color: '#5d4037' },
  userLevel: { fontSize: '10px', color: '#8b5a2b' },
  
  hpBarContainer: { position: 'relative', width: '100%', height: '16px', backgroundColor: '#3e2723', border: '1px solid #5d4037', borderRadius: '2px', marginBottom: '4px' },
  hpBarFill: { height: '100%', backgroundColor: '#4ade80', transition: 'width 0.3s' },
  hpText: { position: 'absolute', inset: 0, fontSize: '9px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: '1px 1px 0 #000' },
  
  budgetLabel: { fontSize: '9px', color: '#5d4037', margin: 0 },
  budgetValue: { fontSize: '14px', fontWeight: 'bold', color: '#8b5a2b', textShadow: '0 1px 0 rgba(255,255,255,0.5)', margin: 0 },

  // HUD Right
  hudRight: { position: 'absolute', top: '8px', right: '8px', zIndex: 20 },
  limitBadge: { backgroundColor: '#3b82f6', border: '3px solid #1e3a8a', color: 'white', padding: '4px 12px', borderRadius: '999px', boxShadow: '2px 2px 0 #000', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  limitLabel: { fontSize: '10px', color: '#dbeafe' },
  limitValue: { fontSize: '14px', fontWeight: 'bold', color: '#fde047', textShadow: '0 1px 2px rgba(0,0,0,0.3)' },

  // Controller
  controllerArea: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30, padding: '8px', background: 'linear-gradient(to top, #000, transparent)' },
  controllerBox: { backgroundColor: '#fff1cc', border: '4px solid #6b4c35', borderRadius: '8px', padding: '4px', boxShadow: '0 0 10px rgba(0,0,0,0.8)', display: 'flex', gap: '4px', height: '80px' },
  controlBtn: { flex: 1, borderBottomWidth: '4px', borderRightWidth: '4px', borderTop: 'none', borderLeft: 'none', borderStyle: 'solid', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' },
  btnIcon: { fontSize: '20px', marginBottom: '2px' },
  btnLabel: { fontSize: '10px', fontWeight: 'bold', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.8)' },
};
