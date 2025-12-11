import React, { useState } from 'react';

interface BattleViewProps {
  dungeonName: string; // 예: "food"
  onAttack: (amount: number) => void;
  onFlee: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ dungeonName, onAttack, onFlee }) => {
  const [amount, setAmount] = useState('');

  const getMonster = (cat: string) => {
    switch(cat) {
      case 'food': return { name: '배달음식 슬라임', icon: '🍕' };
      case 'transport': return { name: '택시 미믹', icon: '🚖' };
      case 'shopping': return { name: '충동구매 유령', icon: '👻' };
      default: return { name: '지출 몬스터', icon: '👾' };
    }
  };

  const monster = getMonster(dungeonName);

  const handleSubmit = () => {
    const val = parseInt(amount.replace(/,/g, ''), 10);
    if (val > 0) onAttack(val);
  };

  return (
    <div style={styles.container}>
      <div style={styles.scene}>
        <div style={styles.monsterArea}>
          <div style={styles.monsterIcon}>{monster.icon}</div>
          <div style={styles.monsterName}>Lv.5 {monster.name}</div>
        </div>
      </div>

      <div style={styles.dialog}>
        <p>야생의 <b>{monster.name}</b>(이)가 나타났다!</p>
        <p>얼마의 데미지(지출)를 입었습니까?</p>
      </div>

      <div style={styles.inputArea}>
        <input 
          type="number" 
          placeholder="금액 입력" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
          style={styles.input}
        />
        <div style={styles.btnRow}>
          <button onClick={onFlee} style={styles.btnFlee}>🏳️ 도망가기</button>
          <button onClick={handleSubmit} style={styles.btnAttack}>🔥 공격 (입력)</button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%' },
  scene: { 
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', 
    backgroundColor: '#111827', border: '4px solid #374151', borderRadius: '12px', marginBottom: '15px'
  },
  monsterArea: { textAlign: 'center', animation: 'float 3s infinite ease-in-out' },
  monsterIcon: { fontSize: '80px', marginBottom: '10px' },
  monsterName: { fontSize: '16px', fontWeight: 'bold', color: '#fca5a5' },
  dialog: { 
    padding: '15px', border: '4px double #fff', borderRadius: '8px', marginBottom: '15px',
    backgroundColor: '#000', fontSize: '14px', lineHeight: '1.5'
  },
  inputArea: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { 
    padding: '15px', fontSize: '18px', backgroundColor: '#1f2937', color: 'white', 
    border: '2px solid #4b5563', borderRadius: '8px', outline: 'none' 
  },
  btnRow: { display: 'flex', gap: '10px' },
  btnFlee: { flex: 1, padding: '15px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btnAttack: { flex: 2, padding: '15px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
};
