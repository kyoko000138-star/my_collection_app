// src/money/components/BattleView.tsx

import React, { useState, useEffect } from 'react';
import { MonsterStat } from '../types';

interface Props {
  monster: MonsterStat;
  playerMp: number;
  // [NEW] 플레이어 스탯을 받습니다
  playerStats: { attack: number; defense: number }; 
  onWin: () => void;
  onRun: () => void;
  onConsumeMp: (amount: number) => void;
}

export const BattleView: React.FC<Props> = ({ 
  monster, playerMp, playerStats, onWin, onRun, onConsumeMp 
}) => {
  const [enemyHp, setEnemyHp] = useState(monster.hp);
  const [log, setLog] = useState<string[]>([]);
  const [turn, setTurn] = useState(0); // 0: Player, 1: Enemy
  const [effect, setEffect] = useState('');

  // 몬스터 공격 턴
  useEffect(() => {
    if (turn === 1 && enemyHp > 0) {
      setTimeout(() => {
        // 방어력 적용: 몬스터 공격력 - (내 방어력 / 2)
        const dmg = Math.max(1, monster.attack - Math.floor(playerStats.defense / 2));
        
        // MP 데미지 (의지력 깎임)
        onConsumeMp(dmg);
        addLog(`👻 ${monster.name}의 공격! MP가 ${dmg} 감소했습니다.`);
        setEffect('shake');
        setTimeout(() => setEffect(''), 500);
        setTurn(0);
      }, 1000);
    }
  }, [turn, enemyHp]);

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 3));
  };

  const handleAttack = () => {
    if (playerMp <= 0) {
      addLog("💦 의지력(MP)이 없어 공격할 수 없습니다!");
      return;
    }

    // 공격력 적용: 내 공격력 + 랜덤(0~2)
    const dmg = playerStats.attack + Math.floor(Math.random() * 3);
    
    // MP 소모 (기본 2)
    onConsumeMp(2);
    
    setEnemyHp(prev => {
      const next = prev - dmg;
      if (next <= 0) {
        setTimeout(onWin, 800);
        return 0;
      }
      return next;
    });
    
    addLog(`⚔️ 당신의 공격! ${dmg}의 피해를 입혔습니다.`);
    setTurn(1); // 턴 넘기기
  };

  return (
    <div style={{...styles.container, animation: effect === 'shake' ? 'shake 0.5s' : ''}}>
      <div style={styles.scene}>
        {/* 적 영역 */}
        <div style={styles.enemyArea}>
          <div style={styles.enemySprite}>{monster.sprite}</div>
          <div style={styles.hpBarBg}>
            <div style={{...styles.hpBarFill, width: `${(enemyHp / monster.maxHp) * 100}%`}} />
          </div>
          <div style={styles.nameTag}>{monster.name} (HP: {enemyHp})</div>
        </div>

        {/* 플레이어 영역 */}
        <div style={styles.playerArea}>
          <div style={styles.statBox}>
            <div>🗡️ 공격력: {playerStats.attack}</div>
            <div>🛡️ 방어력: {playerStats.defense}</div>
          </div>
          <div style={styles.mpTag}>MP: {playerMp}</div>
        </div>
      </div>

      {/* 콘솔 (로그 & 커맨드) */}
      <div style={styles.console}>
        <div style={styles.logBox}>
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <div style={styles.cmdGrid}>
          <button style={styles.btnAttack} onClick={handleAttack}>
            ⚔️ 정화 (MP 2)
          </button>
          <button style={styles.btnRun} onClick={onRun}>
            🏃 도망가기
          </button>
        </div>
      </div>
      
      {/* 쉐이크 애니메이션 스타일 주입 */}
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1a0505', overflow: 'hidden' },
  scene: { flex: 1, position: 'relative', background: 'linear-gradient(#2d3748 50%, #1a202c 50%)' },
  
  enemyArea: { position: 'absolute', top: '15%', right: '20%', textAlign: 'center', transform: 'scale(1.2)' },
  enemySprite: { fontSize: '80px', filter: 'drop-shadow(0 0 10px #ef4444)', animation: 'float 3s infinite ease-in-out' },
  hpBarBg: { width: '100px', height: '8px', backgroundColor: '#555', margin: '5px auto', borderRadius: 4, border: '1px solid #fff' },
  hpBarFill: { height: '100%', backgroundColor: '#ef4444', borderRadius: 2, transition: 'width 0.3s' },
  nameTag: { backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '12px', padding: '2px 6px', borderRadius: 4, marginTop: '4px' },
  
  playerArea: { position: 'absolute', bottom: '5%', left: '10%', width: '80%' },
  statBox: { fontSize: '12px', color: '#fbbf24', marginBottom: '4px', display: 'flex', gap: '10px' },
  mpTag: { color: '#60a5fa', fontWeight: 'bold', fontSize: '16px', textShadow: '1px 1px 0 #000' },
  
  console: { height: '160px', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px' },
  logBox: { color: '#cbd5e1', fontSize: '12px', height: '60px', overflowY: 'auto', marginBottom: '10px', fontFamily: 'monospace' },
  
  cmdGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  btnAttack: { backgroundColor: '#ef4444', color: '#fff', border: '2px solid #fff', borderRadius: 8, padding: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  btnRun: { backgroundColor: '#4b5563', color: '#fff', border: '2px solid #fff', borderRadius: 8, padding: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
};
