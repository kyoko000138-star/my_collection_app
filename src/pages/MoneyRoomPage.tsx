import React from 'react';
import { UserState, Scene } from '../types';
import { calculateLunaPhase } from '../moneyLuna';

// 대화 시스템
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
  // --- 대화 훅 ---
  const { currentLine, visible, startScript, next } = useDialogue();

  const handleClickAngel = () => {
    startScript(FIRST_MEET_ANGEL_NORMAL);
  };

  if (!user) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        L O A D I N G . . .
      </div>
    );
  }

  // 데이터 계산
  const currentHpPercent = Math.max(
    0,
    Math.min(100, (user.currentBudget / user.maxBudget) * 100)
  );
  
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = lastDay.getDate() - today.getDate();
  const luna = calculateLunaPhase(user.lunaCycle);

  return (
    <div style={styles.container}>
      
      {/* 1. 상단 HUD (정보창) */}
      <div style={styles.hudArea}>
        <div style={styles.hudBox}>
          {/* 이름 & 날씨 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#fbbf24', fontSize: '12px' }}>Lv.{user.level} {user.name}</span>
            <span style={{ fontSize: '12px' }}>{luna.isPeriod ? '🔴' : '🌙'} Day {daysLeft}</span>
          </div>

          {/* HP Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', width: '20px' }}>HP</span>
            <div style={styles.barContainer}>
              <div style={{ ...styles.hpFill, width: `${currentHpPercent}%` }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: '#ccc', marginBottom: '4px' }}>
            {user.currentBudget.toLocaleString()} G
          </div>

          {/* MP Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', width: '20px' }}>MP</span>
            <div style={styles.barContainer}>
              <div style={{ ...styles.mpFill, width: `${(user.mp / user.maxMp) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 중앙 스테이지 (캐릭터 & 상호작용) */}
      <div style={styles.stageArea}>
        {/* 캐릭터 */}
        <div style={styles.characterSprite}>🧙‍♀️</div>

        {/* 캐릭터 독백 (말풍선) */}
        <div style={styles.dialogBox}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#fbbf24', fontSize: '11px' }}>[혼잣말]</p>
          <p style={{ margin: '4px 0 0 0' }}>
            "{luna.isPeriod ? '몸이 무거워...' : '이번 달도 무사히!'}"
          </p>
        </div>

        {/* 상호작용 버튼 (화면 안에 배치) */}
        <button onClick={handleClickAngel} style={{ ...styles.actionBtn, top: '10px', right: '10px' }}>
          👼 천사
        </button>
        <button onClick={onDayEnd} style={{ ...styles.actionBtn, top: '50px', right: '10px' }}>
          🛏 휴식
        </button>
      </div>

      {/* 3. 하단 커맨드 메뉴 */}
      <div style={styles.controllerArea}>
        <button style={styles.rpgButton} onClick={() => onChangeScene(Scene.WORLD_MAP)}>
          ⚔️ 지출 (Spend)
        </button>
        <button style={styles.rpgButton} onClick={() => onChangeScene(Scene.INVENTORY)}>
          🎒 가방 (Items)
        </button>
        <button style={styles.rpgButton} onClick={() => onChangeScene(Scene.KINGDOM)}>
          🏰 자산 (Asset)
        </button>
        <button style={styles.rpgButton} onClick={() => onChangeScene(Scene.COLLECTION)}>
          📖 도감 (Book)
        </button>
      </div>

      {/* 대화창 오버레이 (NPC 대화 시에만 뜸) */}
      <DialogueBox line={currentLine} visible={visible} onNext={next} />
    </div>
  );
};

// --- 🎨 JRPG 스타일 정의 (컴포넌트 밖으로 뺌) ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#20202d',
    fontFamily: '"NeoDungGeunMo", monospace',
    color: '#fff',
    overflow: 'hidden',
  },

  // 1. HUD Area
  hudArea: {
    height: '110px', // 높이 고정
    padding: '10px',
    backgroundColor: '#2d3748',
    borderBottom: '4px solid #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  hudBox: {
    width: '100%',
    backgroundColor: '#1a202c',
    border: '2px solid #a0aec0',
    borderRadius: '4px',
    padding: '8px',
    boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.3)',
  },
  barContainer: {
    flex: 1,
    height: '8px',
    backgroundColor: '#4a5568',
    border: '1px solid #fff',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  hpFill: { height: '100%', backgroundColor: '#ef4444', transition: 'width 0.3s' },
  mpFill: { height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s' },

  // 2. Stage Area (남은 공간 차지)
  stageArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#2d3748',
    // 도트 패턴 배경
    backgroundImage: 'radial-gradient(#4a5568 15%, transparent 16%)',
    backgroundSize: '16px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterSprite: {
    fontSize: '80px',
    filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.5))',
    animation: 'bounce 2s infinite',
    marginBottom: '20px',
  },
  dialogBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    border: '3px solid #fff',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '14px',
    lineHeight: '1.4',
    boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
    maxWidth: '80%',
    textAlign: 'center',
  },
  actionBtn: {
    position: 'absolute',
    backgroundColor: '#e2e8f0',
    color: '#1a202c',
    border: '2px solid #fff',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
  },

  // 3. Controller Area
  controllerArea: {
    height: '140px', // 높이 고정
    padding: '10px',
    backgroundColor: '#4a5568',
    borderTop: '4px solid #fff',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // 2열 그리드
    gap: '8px',
    zIndex: 10,
  },
  rpgButton: {
    backgroundColor: '#3182ce',
    color: 'white',
    border: '2px solid #bee3f8',
    boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.4)',
    padding: '10px',
    fontFamily: 'inherit',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
