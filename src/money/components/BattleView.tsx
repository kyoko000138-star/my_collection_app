// src/money/components/BattleView.tsx

import React, { useState, useEffect, useRef } from 'react';
import { MONSTERS } from '../constants';

interface BattleViewProps {
  dungeonId: string;
  playerHp: number;
  maxHp: number;
  onSpend: (amount: number) => void;
  onGuard: () => void;
  onRun: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ 
  dungeonId, playerHp, maxHp, onSpend, onGuard, onRun 
}) => {
  const [phase, setPhase] = useState<'APPEAR' | 'COMMAND' | 'SPEND_INPUT'>('APPEAR');
  const [amount, setAmount] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const monster = MONSTERS[dungeonId as keyof typeof MONSTERS] || MONSTERS.etc;
  const hpPercent = maxHp > 0 ? (playerHp / maxHp) * 100 : 0;

  useEffect(() => {
    const timer = setTimeout(() => setPhase('COMMAND'), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'SPEND_INPUT' && inputRef.current) inputRef.current.focus();
  }, [phase]);

  const handleSubmit = () => {
    const val = parseInt(amount.replace(/,/g, ''), 10);
    if (!val || val <= 0) return alert('금액을 입력해주세요.');
    onSpend(val);
  };

  return (
    <div style={styles.container}>
      <div style={styles.scene}>
        <div style={styles.monsterArea}>
          <div style={{fontSize: '80px', animation: 'bounce 1s infinite'}}>{monster.sprite}</div>
          <div style={styles.monsterName}>{monster.name}</div>
        </div>
        
        <div style={styles.statusBox}>
          <div style={{fontSize:'12px'}}>내 예산(HP)</div>
          <div style={styles.hpBarBg}>
            <div style={{...styles.hpBarFill, width: `${Math.max(0, hpPercent)}%`}} />
          </div>
          <div style={{textAlign:'right', fontSize:'12px'}}>{playerHp.toLocaleString()}</div>
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.messageBox}>
          {phase === 'APPEAR' && `야생의 ${monster.name}(이)가 나타났다!`}
          {phase === 'COMMAND' && `지출의 유혹이 느껴진다...`}
          {phase === 'SPEND_INPUT' && `얼마를 사용하여 기록(격퇴)하시겠습니까?`}
        </div>

        {phase === 'COMMAND' && (
          <div style={styles.btnGrid}>
            <button onClick={() => setPhase('SPEND_INPUT')} style={styles.btnAttack}>💸 지출 기록</button>
            <button onClick={onGuard} style={styles.btnGuard}>🛡️ 방어 (절약)</button>
            <button onClick={onRun} style={styles.btnRun}>🏃 도망치기</button>
          </div>
        )}

        {phase === 'SPEND_INPUT' && (
          <div style={styles.inputArea}>
            <input 
              ref={inputRef}
              type="number" 
              placeholder="금액 입력"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleSubmit} style={styles.btnConfirm}>확인</button>
            <button onClick={() => setPhase('COMMAND')} style={styles.btnCancel}>취소</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#2d3748' },
  scene: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(#1a202c, #2d3748)' },
  monsterArea: { textAlign: 'center', marginBottom: '40px' },
  monsterName: { marginTop: '10px', color: '#fff', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '10px' },
  statusBox: { position: 'absolute', bottom: '10px', left: '10px', right: '10px', backgroundColor: '#171717', padding: '10px', borderRadius: '8px', border: '2px solid #fff', color: '#fff' },
  hpBarBg: { width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', margin: '4px 0' },
  hpBarFill: { height: '100%', backgroundColor: '#4ade80', borderRadius: '4px' },
  panel: { padding: '15px', backgroundColor: '#000', borderTop: '4px solid #fff' },
  messageBox: { color: '#fff', marginBottom: '15px', minHeight: '20px' },
  btnGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  btnAttack: { padding: '12px', backgroundColor: '#ef4444', color: '#fff', border: '2px solid #fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  btnGuard: { padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: '2px solid #fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  btnRun: { padding: '12px', backgroundColor: '#4b5563', color: '#fff', border: '2px solid #fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  inputArea: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', fontSize: '16px' },
  btnConfirm: { padding: '10px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px' },
  btnCancel: { padding: '10px 20px', backgroundColor: '#4b5563', color: '#fff', border: 'none', borderRadius: '4px' }
};
