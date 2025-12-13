// src/money/components/ForgeView.tsx

import React, { useState } from 'react';
import { UserState } from '../types';
// [수정된 경로 반영] ForgeView는 components 폴더에 있으므로 '../moneyGameLogic'으로 수정
import { applyPurifyJunk, applyCraftEquipment, RECIPES } from '../moneyGameLogic'; 

interface Props {
  user: UserState;
  onUpdateUser: (newState: UserState) => void;
  onBack: () => void;
}

export const ForgeView: React.FC<Props> = ({ user, onUpdateUser, onBack }) => {
  const [tab, setTab] = useState<'PURIFY' | 'CRAFT'>('PURIFY');
  const [message, setMessage] = useState('');
  
  const currentEssence = user.materials['PURE_ESSENCE'] || 0;

  // --- Junk 정화 핸들러 ---
  const handlePurify = () => {
    const result = applyPurifyJunk(user);
    setMessage(result.message);
    if (result.success) {
      onUpdateUser(result.newState);
    }
  };

  // --- 장비 제작 핸들러 ---
  const handleCraft = (recipeId: keyof typeof RECIPES) => {
    // RECIPES는 moneyGameLogic.ts에서 정의되어야 합니다.
    const result = applyCraftEquipment(user, recipeId);
    setMessage(result.message);
    if (result.success) {
      onUpdateUser(result.newState);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚒️ 대장간 (MP 소모)</h2>
      
      <div style={styles.tabs}>
        <button style={tab === 'PURIFY' ? styles.activeTab : styles.tab} onClick={() => setTab('PURIFY')}>
          정화 (Junk → Essence)
        </button>
        <button style={tab === 'CRAFT' ? styles.activeTab : styles.tab} onClick={() => setTab('CRAFT')}>
          제작 (장비)
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.status}>
          🔮 Essence 보유: {currentEssence} | MP 잔량: {user.mp}
        </div>
        
        {/* --- 정화 탭 --- */}
        {tab === 'PURIFY' && (
          <div style={styles.purifyCard}>
            <p style={styles.purifyDesc}>
              Junk와 Salt를 연금하여 **PURE ESSENCE**를 만듭니다. (성공 확률 100%)
            </p>
            <p style={styles.cost}>
              소모: Junk 10, Salt 5, MP 3
            </p>
            <button onClick={handlePurify} style={styles.btnPurify}>
              🔮 정화 시작
            </button>
          </div>
        )}

        {/* --- 제작 탭 --- */}
        {tab === 'CRAFT' && (
          <div style={styles.craftList}>
            {/* 예시: 순환의 지팡이 (RECIPES.CIRCULATION_WAND) */}
            {/* 실제 레시피는 moneyGameLogic.ts에서 RECIPES를 순회하여 표시해야 함 */}
            <div style={styles.recipeItem}>
              <div style={styles.recipeHeader}>
                <span> 순환의 지팡이 </span>
                <span style={styles.mpCost}>MP 5</span>
              </div>
              <p style={styles.recipeDesc}>Junk 정화 시 MP 소량 회복 효과 부여.</p>
              <p style={styles.recipeCost}>
                필요: Essence x4, Salt x5, 시간의 톱니바퀴 x1
              </p>
              <button 
                onClick={() => handleCraft('CIRCULATION_WAND' as keyof typeof RECIPES)} 
                // 임시 체크 로직 (실제 재료 체크는 moneyGameLogic에서)
                style={currentEssence >= 4 ? styles.btnCraft : styles.btnDisabled}
              >
                제작
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={styles.message}>{message}</p>
      <button onClick={onBack} style={styles.backBtn}>나가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#451a03', padding: '20px', display: 'flex', flexDirection: 'column', color: '#fff' },
  title: { textAlign: 'center', borderBottom: '2px solid #d97706', paddingBottom: '10px', marginBottom: '20px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '15px' },
  tab: { flex: 1, padding: '10px', backgroundColor: '#57534e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  activeTab: { flex: 1, padding: '10px', backgroundColor: '#d97706', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  
  content: { flex: 1, overflowY: 'auto' },
  status: { backgroundColor: '#57534e', padding: '8px', borderRadius: '6px', textAlign: 'center', marginBottom: '15px', fontSize: '12px', color: '#fff' },

  purifyCard: { backgroundColor: '#57534e', padding: '20px', borderRadius: '12px', textAlign: 'center' },
  purifyDesc: { fontSize: '14px', color: '#fbbf24' },
  cost: { margin: '15px 0', fontSize: '13px', color: '#fed7aa' },
  btnPurify: { padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },

  craftList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  recipeItem: { backgroundColor: '#57534e', padding: '15px', borderRadius: '12px', border: '1px solid #78716c' },
  recipeHeader: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', color: '#d97706', marginBottom: '5px' },
  mpCost: { backgroundColor: '#d97706', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' },
  recipeDesc: { fontSize: '12px', color: '#a8a29e', marginBottom: '10px' },
  recipeCost: { fontSize: '11px', color: '#fed7aa' },
  btnCraft: { marginTop: '10px', padding: '10px', backgroundColor: '#34d399', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnDisabled: { marginTop: '10px', padding: '10px', backgroundColor: '#78716c', color: '#a8a29e', border: 'none', borderRadius: '6px', cursor: 'not-allowed' },

  message: { textAlign: 'center', color: '#fca5a5', marginTop: '10px' },
  backBtn: { marginTop: '15px', padding: '12px', backgroundColor: '#44403c', border: '1px solid #78716c', color: '#fff', borderRadius: '8px', cursor: 'pointer' }
};
