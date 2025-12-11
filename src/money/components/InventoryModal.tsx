// src/money/components/InventoryModal.tsx

import React, { useState } from 'react';
import { CollectionItem } from '../types';

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
  junk: number;
  salt: number;
  materials: Record<string, number>;
  equipment: string[];
  collection: CollectionItem[];
  canPurify: boolean;
  
  // [NEW] 제작 관련
  onPurify: () => void;
  onCraft: () => void; // 장비 제작 핸들러
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  open, onClose, junk, salt, materials, equipment, canPurify, onPurify, onCraft
}) => {
  const [tab, setTab] = useState<'ITEMS' | 'CRAFT'>('ITEMS');

  if (!open) return null;

  const pureEssence = materials['PURE_ESSENCE'] || 0;
  const hasSword = equipment.includes('잔잔한 장부검');
  const canCraftSword = pureEssence >= 3;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modalContent}>
        <h2 style={styles.title}>🎒 인벤토리</h2>

        {/* 탭 메뉴 */}
        <div style={styles.tabs}>
          <button style={tab === 'ITEMS' ? styles.activeTab : styles.tab} onClick={()=>setTab('ITEMS')}>📦 자원</button>
          <button style={tab === 'CRAFT' ? styles.activeTab : styles.tab} onClick={()=>setTab('CRAFT')}>⚒️ 제작</button>
        </div>

        {tab === 'ITEMS' && (
          <div style={styles.section}>
            <div style={styles.resourceRow}>
              <span>📄 Junk</span> <span style={{fontWeight:'bold'}}>{junk}</span>
            </div>
            <div style={styles.resourceRow}>
              <span>🧂 Salt</span> <span style={{fontWeight:'bold'}}>{salt}</span>
            </div>
            <div style={styles.resourceRow}>
              <span>🔮 Pure Essence</span> <span style={{color:'#a78bfa', fontWeight:'bold'}}>{pureEssence}</span>
            </div>
            
            <div style={styles.divider} />
            
            <button onClick={onPurify} disabled={!canPurify} style={canPurify ? styles.btnAction : styles.btnDisabled}>
              🔄 정화 (Junk+Salt+MP 소모)
            </button>
            <p style={styles.helperText}>정화하여 'Pure Essence'를 얻으세요.</p>
          </div>
        )}

        {tab === 'CRAFT' && (
          <div style={styles.section}>
            <div style={styles.recipeCard}>
              <div style={styles.recipeHeader}>
                <span style={{fontSize:'20px'}}>🗡️ 잔잔한 장부검</span>
                {hasSword && <span style={styles.ownedBadge}>보유중</span>}
              </div>
              <p style={styles.recipeDesc}>기록 시 MP 소모를 줄여주는 마법의 펜촉 검.</p>
              <div style={styles.costRow}>
                필요 재료: 🔮 Pure Essence 3개
              </div>
              
              {!hasSword ? (
                <button 
                  onClick={onCraft} 
                  disabled={!canCraftSword}
                  style={canCraftSword ? styles.btnCraft : styles.btnDisabled}
                >
                  {canCraftSword ? "⚒️ 제작하기" : "재료 부족"}
                </button>
              ) : (
                <button disabled style={styles.btnDisabled}>제작 완료</button>
              )}
            </div>
          </div>
        )}

        <button onClick={onClose} style={styles.btnClose}>닫기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxWidth: '380px', backgroundColor: '#1f2937', borderRadius: '16px', padding: '20px', color: '#f3f4f6' },
  title: { textAlign: 'center', marginBottom: '15px' },
  tabs: { display: 'flex', marginBottom: '20px', borderBottom: '1px solid #374151' },
  tab: { flex: 1, padding: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' },
  activeTab: { flex: 1, padding: '10px', background: 'none', borderBottom: '2px solid #8b5cf6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' },
  resourceRow: { display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#111827', borderRadius: '8px' },
  divider: { height: '1px', backgroundColor: '#374151', margin: '10px 0' },
  helperText: { fontSize: '11px', color: '#6b7280', textAlign: 'center' },
  recipeCard: { backgroundColor: '#111827', padding: '15px', borderRadius: '10px', border: '1px solid #374151' },
  recipeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' },
  ownedBadge: { fontSize: '10px', backgroundColor: '#059669', padding: '2px 6px', borderRadius: '4px' },
  recipeDesc: { fontSize: '12px', color: '#9ca3af', marginBottom: '10px' },
  costRow: { fontSize: '12px', color: '#fca5a5', marginBottom: '15px', fontWeight: 'bold' },
  btnAction: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
  btnCraft: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#8b5cf6', color: 'white', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
  btnDisabled: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#6b7280', cursor: 'not-allowed', width: '100%' },
  btnClose: { marginTop: '15px', padding: '12px', width: '100%', backgroundColor: 'transparent', border: '1px solid #4b5563', color: '#9ca3af', borderRadius: '8px', cursor: 'pointer' },
};

export default InventoryModal;
