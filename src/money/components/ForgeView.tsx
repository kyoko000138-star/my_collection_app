// src/money/components/ForgeView.tsx
import React, { useState } from 'react';
import { UserState } from '../types';
import { applyCraftEquipment } from '../moneyGameLogic'; // [수정] 정화 함수 제거, 제작 함수 추가
import { RECIPE_DB, ITEM_DB } from '../gameData';

interface Props {
  user: UserState;
  onUpdateUser: (newState: UserState) => void;
  onBack: () => void;
}

export const ForgeView: React.FC<Props> = ({ user, onUpdateUser, onBack }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const handleCraft = () => {
    if (!selectedRecipeId) return;
    
    const result = applyCraftEquipment(user, selectedRecipeId);
    if (result.success) {
      alert(result.message);
      onUpdateUser(result.newState);
    } else {
      alert(`🚫 ${result.message}`);
    }
  };

  // 제작 가능한 레시피만 필터링 (장비류)
  const recipes = Object.values(RECIPE_DB || {}).filter(r => r.category === 'EQUIPMENT');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>⚒️ 대장간</h2>
        <p style={{fontSize: '12px', color:'#aaa'}}>Junk와 Salt로 장비를 제작합니다.</p>
      </div>

      <div style={styles.content}>
        <div style={styles.recipeList}>
          {recipes.map(recipe => (
            <div 
              key={recipe.id} 
              style={{
                ...styles.recipeItem,
                borderColor: selectedRecipeId === recipe.id ? '#fbbf24' : '#4b5563'
              }}
              onClick={() => setSelectedRecipeId(recipe.id)}
            >
              <div style={{fontWeight:'bold'}}>{recipe.name}</div>
              <div style={{fontSize:'11px', color:'#9ca3af'}}>
                필요: Junk {recipe.junkCost} / Salt {recipe.saltCost} / MP {recipe.mpCost}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.preview}>
          {selectedRecipeId ? (
            <div style={{textAlign:'center'}}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>⚔️</div>
                <button style={styles.craftBtn} onClick={handleCraft}>
                  제작하기
                </button>
            </div>
          ) : (
            <div style={{color:'#666', marginTop:'40px'}}>레시피를 선택하세요</div>
          )}
        </div>
      </div>

      <button onClick={onBack} style={styles.backBtn}>나가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#1c1917', color: '#fff', display: 'flex', flexDirection: 'column', padding: '20px' },
  header: { borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '10px' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  recipeList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  recipeItem: { padding: '10px', backgroundColor: '#292524', border: '1px solid', borderRadius: '8px', cursor: 'pointer' },
  preview: { height: '150px', borderTop: '1px solid #444', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  craftBtn: { padding: '10px 24px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  backBtn: { marginTop: '10px', padding: '10px', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};
