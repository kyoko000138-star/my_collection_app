// src/money/components/ForgeView.tsx

import React, { useState } from 'react';
import { UserState } from '../types';
import { applyPurifyJunk, applyCraftEquipment } from '../moneyGameLogic';
import { RECIPE_DB, ITEM_DB } from '../gameData'; // [NEW] 데이터 불러오기

// ... (Props 유지) ...

export const ForgeView: React.FC<Props> = ({ user, onUpdateUser, onBack }) => {
  const [tab, setTab] = useState<'PURIFY' | 'CRAFT'>('PURIFY');
  const [message, setMessage] = useState('');
  
  const safeMaterials = user.materials || {};
  const currentEssence = safeMaterials['PURE_ESSENCE'] || 0;

  const handleCraft = (recipeId: string) => {
    const safeUser = { ...user, materials: user.materials || {} };
    const result = applyCraftEquipment(safeUser, recipeId);
    setMessage(result.message);
    if (result.success) {
      onUpdateUser(result.newState);
    }
  };

  // 렌더링 할 레시피 필터링
  const equipmentRecipes = Object.values(RECIPE_DB).filter(r => r.category === 'EQUIPMENT' || r.category === 'CONSUMABLE');

  return (
    <div style={styles.container}>
      {/* ... (제목, 탭 UI 유지) ... */}
      
      <div style={styles.content}>
        {/* ... (상태창 유지) ... */}

        {/* 정화 탭 */}
        {tab === 'PURIFY' && (
           /* ... 기존 정화 UI 유지 (핸들러만 연결) ... */
           <div style={styles.purifyCard}>
             {/* ... */}
             <button onClick={() => {
                 const res = applyPurifyJunk({ ...user, materials: user.materials || {} });
                 setMessage(res.message);
                 if(res.success) onUpdateUser(res.newState);
             }} style={styles.btnPurify}>
               🔮 정화 시작
             </button>
           </div>
        )}

        {/* 제작 탭 (동적 렌더링) */}
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
          </div>
        )}
      </div>
      {/* ... (메시지, 나가기 버튼 유지) ... */}
    </div>
  );
};
// ... (styles 유지) ...
