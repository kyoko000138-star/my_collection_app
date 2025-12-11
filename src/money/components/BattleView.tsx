// src/money/components/BattleView.tsx

import React, { useState, useEffect } from 'react';
import { MONSTERS } from '../constants';

interface BattleViewProps {
  dungeonId: string;
  playerHp: number;
  maxHp: number;
  onSpend: (amount: number) => void; // 지출 (피격)
  onGuard: () => void; // 방어 (절약)
  onRun: () => void; // 도망 (취소)
}

export const BattleView: React.FC<BattleViewProps> = ({ 
  dungeonId, playerHp, maxHp, onSpend, onGuard, onRun 
}) => {
  const [phase, setPhase] = useState<'APPEAR' | 'COMMAND' | 'SPEND_INPUT'>('APPEAR');
  const [amount, setAmount] = useState('');
  
  // 몬스터 정보 로드
  const monster = MONSTERS[dungeonId as keyof typeof MONSTERS] || MONSTERS.etc;

  useEffect(() => {
    const timer = setTimeout(() => setPhase('COMMAND'), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSpendSubmit = () => {
    const val = parseInt(amount.replace(/,/g, ''), 10);
    if (val > 0) onSpend(val);
  };

  return (
    <div style={styles.container}>
      {/* 📺 [상단] 배틀 스테이지 (GBA 스타일) */}
      <div style={styles.stage}>
        {/* 배경 & 바닥 */}
        <div style={styles.platformEnemy} />
        <div style={styles.platformPlayer} />

        {/* 👾 몬스터 (우상단) */}
        <div style={styles.enemyPos}>
          <div style={styles.hudBox}>
            <div style={styles.hudName}>{monster.name} <span style={{fontSize:'10px'}}>Lv.50</span></div>
            <div style={styles.hpBarBase}><div style={{...styles.hpBarFill, width: '100%'}} /></div>
          </div>
          <div style={styles.spriteEnemy}>{monster.sprite}</div>
        </div>

        {/* 🧑 플레이어 (좌하단) */}
        <div style={styles.playerPos}>
          <div style={styles.spritePlayer}>🧢</div>
          <div style={styles.hudBox}>
            <div style={styles.hudName}>내 지갑 <span style={{fontSize:'10px'}}>Lv.1</span></div>
            <div style={styles.hpBarBase}>
              <div style={{
                ...styles.hpBarFill, 
                width: `${(playerHp / maxHp) * 100}%`,
                backgroundColor: playerHp < 30 ? '#ef4444' : '#4ade80'
              }} />
            </div>
            <div style={styles.hpText}>{playerHp.toLocaleString()} / {maxHp.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 🎮 [하단] 커맨드 콘솔 */}
      <div style={styles.console}>
        <div style={styles.textBox}>
          {phase === 'APPEAR' && <p>야생의 <b>{monster.name}</b>(이)가 나타났다!</p>}
          {phase === 'COMMAND' && <p><b>지출의 유혹</b>이 느껴진다... 어떻게 할까?</p>}
          {phase === 'SPEND_INPUT' && <p>얼마의 데미지(지출)를 입겠습니까?</p>}
        </div>

        {/* 커맨드 메뉴 */}
        {phase === 'COMMAND' && (
          <div style={styles.commandGrid}>
            <button onClick={() => setPhase('SPEND_INPUT')} style={styles.btnSpend}>
              💸 지출한다 (Hit)
            </button>
            <button onClick={onGuard} style={styles.btnGuard}>
              🛡️ 참아낸다 (Guard)
            </button>
            <button style={styles.btnDisabled}>🎒 인벤토리</button>
            <button onClick={onRun} style={styles.btnRun}>
              🏃 도망친다
            </button>
          </div>
        )}

        {/* 지출 입력창 */}
        {phase === 'SPEND_INPUT' && (
          <div style={styles.inputRow}>
            <input 
              type="number" autoFocus placeholder="금액 입력"
              value={amount} onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSpendSubmit()}
              style={styles.input}
            />
            <button onClick={handleSpendSubmit} style={styles.btnConfirm}>확인</button>
            <button onClick={() => setPhase('COMMAND')} style={styles.btnCancel}>취소</button>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎨 Retro Pixel Styles
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#222', borderRadius: '12px', border: '4px solid #d4d4d8', overflow: 'hidden' },
  
  // Stage
  stage: { flex: 3, position: 'relative', backgroundColor: '#f8fafc', backgroundImage: 'linear-gradient(#60a5fa 50%, #86efac 50%)' },
  platformEnemy: { position: 'absolute', top: '90px', right: '10px', width: '120px', height: '40px', backgroundColor: '#bbf7d0', borderRadius: '50%', border: '2px solid #86efac' },
  platformPlayer: { position: 'absolute', bottom: '30px', left: '10px', width: '120px', height: '40px', backgroundColor: '#bbf7d0', borderRadius: '50%', border: '2px solid #86efac' },
  
  enemyPos: { position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  spriteEnemy: { fontSize: '60px', marginTop: '5px', filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.2))', animation: 'bounce 2s infinite' },
  
  playerPos: { position: 'absolute', bottom: '20px', left: '20px' },
  spritePlayer: { fontSize: '50px', marginLeft: '30px', transform: 'scaleX(-1)', filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.2))' },

  hudBox: { backgroundColor: '#fff', border: '3px solid #78350f', borderRadius: '8px', padding: '5px 10px', minWidth: '120px', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' },
  hudName: { fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: '#000' },
  hpBarBase: { width: '100%', height: '8px', backgroundColor: '#525252', borderRadius: '4px', border: '1px solid #fff', marginTop: '2px' },
  hpBarFill: { height: '100%', backgroundColor: '#4ade80', borderRadius: '4px', transition: 'width 0.3s' },
  hpText: { fontSize: '10px', textAlign: 'right', marginTop: '2px', color: '#000' },

  // Console
  console: { flex: 2, backgroundColor: '#262626', borderTop: '4px solid #fff', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' },
  textBox: { flex: 1, backgroundColor: '#fff', border: '3px double #78350f', borderRadius: '4px', padding: '10px', fontSize: '14px', lineHeight: '1.5', color: '#000' },
  
  commandGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', height: '80px' },
  btnSpend: { backgroundColor: '#fca5a5', border: '2px solid #ef4444', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#7f1d1d' },
  btnGuard: { backgroundColor: '#86efac', border: '2px solid #22c55e', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#14532d' },
  btnRun: { backgroundColor: '#e5e7eb', border: '2px solid #9ca3af', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#374151' },
  btnDisabled: { backgroundColor: '#d1d5db', border: '2px solid #9ca3af', borderRadius: '4px', color: '#9ca3af', cursor: 'not-allowed' },

  inputRow: { display: 'flex', gap: '5px', height: '50px' },
  input: { flex: 1, padding: '10px', fontSize: '16px', border: '2px solid #fff', backgroundColor: '#404040', color: '#fff', outline: 'none' },
  btnConfirm: { padding: '0 15px', backgroundColor: '#ef4444', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontWeight: 'bold' },
  btnCancel: { padding: '0 15px', backgroundColor: '#525252', color: '#fff', border: '2px solid #a3a3a3', cursor: 'pointer' },
};
