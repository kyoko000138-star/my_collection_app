// src/money/components/ForgeView.tsx

import React, { useState } from 'react';
import { UserState } from '../types';
import { applyPurifyJunk, applyCraftEquipment } from '../moneyGameLogic';
import { RECIPE_DB, ITEM_DB } from '../gameData';

interface Props {
  user: UserState;
  onUpdateUser: (newState: UserState) => void;
  onBack: () => void;
}

export const ForgeView: React.FC<Props> = ({ user, onUpdateUser, onBack }) => {
  const [tab, setTab] = useState<'PURIFY' | 'CRAFT'>('PURIFY');
  const [message, setMessage] = useState('');
  
  const safeMaterials = user.materials || {};
  const currentEssence = safeMaterials['PURE_ESSENCE'] || 0;

  const handlePurify = () => {
    const safeUser = { ...user, materials: user.materials || {} };
    const result = applyPurifyJunk(safeUser);
    setMessage(result.message);
    if (result.success) {
      onUpdateUser(result.newState);
    }
  };

  const handleCraft = (recipeId: string) => {
    const safeUser = { ...user, materials: user.materials || {} };
    const result = applyCraftEquipment(safeUser, recipeId);
    setMessage(result.message);
    if (result.success) {
      onUpdateUser(result.newState);
    }
  };

  const equipmentRecipes = Object.values(RECIPE_DB).filter(r => r.category === 'EQUIPMENT' || r.category === 'CONSUMABLE');

  return (
    <div style={styles.container}>
      {/* 1. 고정 헤더 영역 */}
      <div style={styles.fixedHeader}>
        <h2 style={styles.title}>⚒️ 대장간 (MP 소모)</h2>
        <div style={styles.tabs}>
          <button style={tab === 'PURIFY' ? styles.activeTab : styles.tab} onClick={() => setTab('PURIFY')}>
            정화
          </button>
          <button style={tab === 'CRAFT' ? styles.activeTab : styles.tab} onClick={() => setTab('CRAFT')}>
            제작
          </button>
        </div>
        <div style={styles.status}>
          🔮 Essence: {currentEssence} | MP: {user.mp} | Junk: {user.junk}
        </div>
      </div>

      {/* 2. 스크롤 영역 (남은 공간 차지) */}
      <div style={styles.scrollContent}>
        
        {/* 정화 탭 내용 */}
        {tab === 'PURIFY' && (
          <div style={styles.purifyCard}>
            <p style={styles.purifyDesc}>
              Junk와 Salt를 연금하여 <b>PURE ESSENCE</b>를 만듭니다.<br/>
              (성공 확률 100%)
            </p>
            <p style={styles.cost}>
              소모: Junk 10, Salt 5, MP 3
            </p>
            <button onClick={handlePurify} style={styles.btnPurify}>
              🔮 정화 시작
            </button>
          </div>
        )}

        {/* 제작 탭 내용 (리스트) */}
        {tab === 'CRAFT' && (
          <div style={styles.craftList}>
            {equipmentRecipes.map(recipe => {
              const itemInfo = ITEM_DB[recipe.resultItemId];
              return (
                <div key={recipe.id} style={styles.recipeItem}>
                  <div style={styles.recipeHeader}>
                    <span>{recipe.name}</span>
                    <span style={styles.mpCost}>MP {recipe.mpCost}</span>
                  </div>
                  <p style={styles.recipeDesc}>{itemInfo?.desc || '설명 없음'}</p>
                  <p style={styles.recipeCost}>
                    비용: {recipe.essenceCost > 0 && `Essence x${recipe.essenceCost} `}
                    {recipe.saltCost > 0 && `Salt x${recipe.saltCost} `}
                    {recipe.junkCost > 0 && `Junk x${recipe.junkCost}`}
                  </p>
                  <button 
                    onClick={() => handleCraft(recipe.id)}
                    style={styles.btnCraft}
                  >
                    제작
                  </button>
                </div>
              );
            })}
            {/* 리스트가 짧아도 스크롤 확인용 여백 */}
            <div style={{ height: '20px' }} />
          </div>
        )}
      </div>

      {/* 3. 고정 푸터 영역 */}
      <div style={styles.fixedFooter}>
        <p style={styles.message}>{message}</p>
        <button onClick={onBack} style={styles.backBtn}>나가기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  // 전체 컨테이너: 화면 꽉 채움, 스크롤 없음 (내부에서 처리)
  container: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: '#451a03', 
    display: 'flex', 
    flexDirection: 'column', 
    color: '#fff', 
    overflow: 'hidden' 
  },
  
  // 고정 헤더: 줄어들지 않음 (flexShrink: 0)
  fixedHeader: {
    padding: '20px 20px 0 20px',
    flexShrink: 0, 
    backgroundColor: '#451a03',
    zIndex: 10
  },
  
  // 스크롤 영역: 남은 공간 모두 차지 (flex: 1), 내부 스크롤 (overflowY: auto)
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    minHeight: 0, // Flexbox 스크롤 버그 방지 필수 속성
    padding: '10px 20px',
    // 모바일 터치 스크롤 부드럽게
    WebkitOverflowScrolling: 'touch', 
  },

  // 고정 푸터: 줄어들지 않음
  fixedFooter: {
    padding: '10px 20px 20px 20px',
    flexShrink: 0,
    backgroundColor: '#451a03',
    borderTop: '1px solid #78716c'
  },

  // --- 내부 요소 스타일 ---
  title: { textAlign: 'center', borderBottom: '2px solid #d97706', paddingBottom: '10px', marginBottom: '15px', margin: '0 0 15px 0', fontSize: '18px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '15px' },
  tab: { flex: 1, padding: '10px', backgroundColor: '#57534e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  activeTab: { flex: 1, padding: '10px', backgroundColor: '#d97706', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  
  status: { backgroundColor: '#57534e', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '12px', color: '#fff' },

  purifyCard: { backgroundColor: '#57534e', padding: '20px', borderRadius: '12px', textAlign: 'center' },
  purifyDesc: { fontSize: '14px', color: '#fbbf24', lineHeight: '1.5' },
  cost: { margin: '15px 0', fontSize: '13px', color: '#fed7aa' },
  btnPurify: { padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },

  craftList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  recipeItem: { backgroundColor: '#57534e', padding: '15px', borderRadius: '12px', border: '1px solid #78716c' },
  recipeHeader: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', color: '#d97706', marginBottom: '5px' },
  mpCost: { backgroundColor: '#d97706', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' },
  recipeDesc: { fontSize: '12px', color: '#a8a29e', marginBottom: '10px' },
  recipeCost: { fontSize: '11px', color: '#fed7aa' },
  btnCraft: { marginTop: '10px', padding: '10px', backgroundColor: '#34d399', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },

  message: { textAlign: 'center', color: '#fca5a5', marginBottom: '10px', minHeight: '20px', fontSize: '12px' },
  backBtn: { padding: '12px', backgroundColor: '#44403c', border: '1px solid #78716c', color: '#fff', borderRadius: '8px', cursor: 'pointer', width: '100%' }
};
