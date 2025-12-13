import React, { useState, useEffect } from 'react';
import { MonsterStat } from '../types';

interface BattleViewProps {
  monster: MonsterStat;
  playerMp: number;
  playerStats?: { attack: number; defense: number };
  onWin: () => void;
  onRun: () => void;
  onConsumeMp: (amount: number) => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ 
  monster, playerMp, playerStats, onWin, onRun, onConsumeMp 
}) => {
  const [enemyHp, setEnemyHp] = useState(monster.hp);
  const [log, setLog] = useState<string>(`야생의 ${monster.name} 등장!`);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [anim, setAnim] = useState('');

  // 적 턴 (자동 진행)
  useEffect(() => {
    if (!isPlayerTurn && enemyHp > 0) {
      setTimeout(() => {
        setLog(`${monster.name}의 저항!`);
        setAnim('shake');
        setTimeout(() => {
          setAnim('');
          setIsPlayerTurn(true);
        }, 800);
      }, 1000);
    }
  }, [isPlayerTurn, enemyHp]);

  // 공격 (정화) - MP 소모
  const handleAttack = () => {
    if (playerMp < 1) {
      setLog("의지력(MP)이 부족해 정화할 수 없습니다!");
      return;
    }
    
    onConsumeMp(1); // MP 1 소모
    const baseDmg = playerStats?.attack || 10;
    const dmg = Math.floor(Math.random() * 5) + baseDmg; 
    const nextHp = Math.max(0, enemyHp - dmg);
    
    setEnemyHp(nextHp);
    setLog(`정화의 빛! ${dmg} 데미지!`);
    setAnim('attack');
    
    if (nextHp <= 0) {
      setTimeout(() => onWin(), 1000);
    } else {
      setIsPlayerTurn(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{...styles.scene, animation: anim === 'shake' ? 'shake 0.5s' : ''}}>
        <div style={styles.enemyArea}>
          <div style={{...styles.enemySprite, animation: anim === 'attack' ? 'flash 0.2s' : 'float 3s infinite'}}>
            {monster.sprite}
          </div>
          <div style={styles.hpBarBg}>
            <div style={{...styles.hpBarFill, width: `${(enemyHp/monster.maxHp)*100}%`}} />
          </div>
          <div style={styles.nameTag}>{monster.name} (HP {enemyHp})</div>
        </div>

        <div style={styles.playerArea}>
          <div style={{fontSize:'60px'}}>🧙‍♀️</div>
          <div style={styles.mpTag}>MP {playerMp}</div>
        </div>
      </div>

      <div style={styles.console}>
        <div style={styles.logBox}>{log}</div>
        
        {isPlayerTurn ? (
          <div style={styles.cmdGrid}>
            <button onClick={handleAttack} style={styles.btnAttack}>⚔️ 정화 (MP 1)</button>
            <button style={styles.btnDefend} onClick={() => setLog("방어 태세를 취했습니다.")}>🛡️ 방어</button>
            <button style={styles.btnItem} onClick={() => setLog("아직 사용할 아이템이 없습니다.")}>🎒 도구</button>
            <button onClick={onRun} style={styles.btnRun}>🏃 도망</button>
          </div>
        ) : (
          <div style={styles.waitMsg}>적의 턴...</div>
        )}
      </div>
      <style>{`
        @keyframes shake { 0% { transform: translate(0,0); } 25% { transform: translate(5px,0); } 75% { transform: translate(-5px,0); } 100% { transform: translate(0,0); } }
        @keyframes flash { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1a0505' },
  scene: { flex: 1, position: 'relative', background: 'linear-gradient(#2d3748 50%, #1a202c 50%)' },
  enemyArea: { position: 'absolute', top: '15%', right: '25%', textAlign: 'center' },
  enemySprite: { fontSize: '80px', filter: 'drop-shadow(0 0 10px #ef4444)' },
  hpBarBg: { width: '100px', height: '8px', backgroundColor: '#555', margin: '5px auto', borderRadius: 4 },
  hpBarFill: { height: '100%', backgroundColor: '#ef4444', borderRadius: 4, transition: 'width 0.3s' },
  nameTag: { backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '12px', padding: '2px 6px', borderRadius: 4 },
  playerArea: { position: 'absolute', bottom: '5%', left: '20%', textAlign: 'center' },
  mpTag: { color: '#60a5fa', fontWeight: 'bold', fontSize: '14px', textShadow: '1px 1px 0 #000', backgroundColor:'rgba(0,0,0,0.6)', padding:'2px 8px', borderRadius:4 },
  console: { height: '150px', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '10px' },
  logBox: { color: '#fbbf24', fontSize: '14px', marginBottom: '10px', minHeight: '20px' },
  cmdGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  waitMsg: { color: '#a0aec0', textAlign: 'center', marginTop: '20px' },
  btnAttack: { backgroundColor: '#ef4444', color: '#fff', border: '2px solid #fff', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 'bold' },
  btnDefend: { backgroundColor: '#3b82f6', color: '#fff', border: '2px solid #fff', borderRadius: 8, padding: '10px', cursor: 'pointer' },
  btnItem: { backgroundColor: '#f59e0b', color: '#fff', border: '2px solid #fff', borderRadius: 8, padding: '10px', cursor: 'pointer' },
  btnRun: { backgroundColor: '#4b5563', color: '#fff', border: '2px solid #fff', borderRadius: '8px', padding: '10px', cursor: 'pointer' },
};
