// src/components/money/MoneyInventory.tsx
// 상단 import 추가
import MoneyInventory from '../components/money/MoneyInventory';
import React, { useState } from 'react';
import { Package, Sparkles, Beaker, Scroll, Shield, Gem } from 'lucide-react';
import confetti from 'canvas-confetti';

import { UserState, ResidueType } from '../../money/types';
import { ITEM_DB } from '../../money/items';
import { purifyResidue } from '../../money/moneyGameLogic';

interface Props {
  user: UserState;
  setUser: React.Dispatch<React.SetStateAction<UserState>>;
}

type TabType = 'residue' | 'material' | 'consumable' | 'equipment' | 'relic';

const MoneyInventory: React.FC<Props> = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState<TabType>('residue');

  // 1. 🧪 정화 액션 (잔해 -> 재료)
  const handlePurify = (residueKey: string) => {
    const residueId = residueKey as ResidueType;
    const count = user.inventory.materials[residueKey] || 0; // materials 필드 공유 (잔해도 materials에 저장됨)
    
    // (주의: types.ts 정의상 잔해/재료 모두 inventory.materials에 저장된다고 가정)
    // 만약 분리했다면 user.inventory.residues 등 경로 수정 필요.
    // 여기선 v3.0 기획대로 통합 관리한다고 가정하되, 로직에서 키값으로 구분.

    if (count <= 0) return;

    // 로직 호출
    const hasSalt = (user.inventory.materials['purifying_salt'] || 0) > 0;
    const result = purifyResidue(residueId, hasSalt, user.status.mp);

    if (!result.success) {
      alert(`🚫 ${result.msg}`);
      return;
    }

    // 성공 시 상태 업데이트
    setUser(prev => {
      const newMaterials = { ...prev.inventory.materials };
      
      // 1. 잔해 소모
      newMaterials[residueKey] = newMaterials[residueKey] - 1;
      if (newMaterials[residueKey] <= 0) delete newMaterials[residueKey];

      // 2. 소금 소모
      newMaterials['purifying_salt'] = newMaterials['purifying_salt'] - 1;
      if (newMaterials['purifying_salt'] <= 0) delete newMaterials['purifying_salt'];

      // 3. 결과물 획득
      const resultId = result.result || 'sugar_crystal';
      newMaterials[resultId] = (newMaterials[resultId] || 0) + 1;

      return {
        ...prev,
        status: { ...prev.status, mp: prev.status.mp - result.costMp },
        inventory: { ...prev.inventory, materials: newMaterials }
      };
    });

    confetti({ colors: ['#a78bfa', '#fff'] }); // 보라색 마법 효과
    alert(`✨ 정화 성공! [${ITEM_DB[result.result!]?.name || result.result}] 획득!`);
  };

  // 렌더링 도우미: 보유 아이템 리스트 필터링
  const getItemsByTab = () => {
    const allItems = { 
        ...user.inventory.materials, 
        ...user.inventory.consumables, 
        ...user.inventory.items 
    }; 
    // 실제 구현에선 user.inventory 구조에 따라 유연하게 가져옴
    
    return Object.entries(allItems).filter(([key, count]) => {
      const itemDef = ITEM_DB[key];
      if (!itemDef) return false;
      if (count <= 0) return false;
      return itemDef.category === activeTab;
    });
  };

  return (
    <div style={{ padding: '0 0 80px 0' }}>
      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>🎒 여행자의 배낭</h2>

      {/* 상단 탭 */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 12 }}>
        <TabButton active={activeTab==='residue'} onClick={()=>setActiveTab('residue')} icon={<Package size={16}/>} label="잔해" />
        <TabButton active={activeTab==='material'} onClick={()=>setActiveTab('material')} icon={<Gem size={16}/>} label="재료" />
        <TabButton active={activeTab==='consumable'} onClick={()=>setActiveTab('consumable')} icon={<Beaker size={16}/>} label="소비" />
        <TabButton active={activeTab==='equipment'} onClick={()=>setActiveTab('equipment')} icon={<Shield size={16}/>} label="장비" />
        <TabButton active={activeTab==='relic'} onClick={()=>setActiveTab('relic')} icon={<Scroll size={16}/>} label="도감" />
      </div>

      {/* 아이템 리스트 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {getItemsByTab().length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888', background: '#f5f5f5', borderRadius: 12 }}>
            (비어있음)
          </div>
        ) : (
          getItemsByTab().map(([key, count]) => {
            const item = ITEM_DB[key];
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: 12, borderRadius: 12, border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 32, marginRight: 16 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item.name} <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: '#eee' }}>x{count}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.description}</div>
                </div>
                
                {/* 잔해 탭일 때만 '정화' 버튼 노출 */}
                {activeTab === 'residue' && (
                  <button 
                    onClick={() => handlePurify(key)}
                    style={{ 
                      padding: '8px 12px', background: '#7c3aed', color: '#fff', 
                      border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <Sparkles size={12} /> 정화
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 도움말 */}
      {activeTab === 'residue' && (
        <div style={{ marginTop: 20, padding: 12, background: '#f3e8ff', borderRadius: 8, fontSize: 12, color: '#6b21a8' }}>
          💡 <b>Tip:</b> 오염된 잔해는 <b>[정화의 소금]</b>과 <b>[MP]</b>가 있어야 정화할 수 있습니다. 무지출을 통해 소금을 모으세요!
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, border: 'none',
      whiteSpace: 'nowrap', background: active ? '#333' : '#eee', color: active ? '#fff' : '#555', fontWeight: active?'bold':'normal'
    }}
  >
    {icon} {label}
  </button>
);

// return 문 내부 수정
  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, padding: '20px', paddingBottom: '100px', transition: 'background 0.5s' }}>
      
      {/* 1. 배틀 화면 (기존 HUD + 몬스터 + 컨트롤러) */}
      {currentTab === 'battle' && (
        <>
          {/* ... 기존의 <header> ... */}
          {/* ... 기존의 몬스터 카드 <div> ... */}
          {/* ... 기존의 전투 컨트롤러 <div> ... */}
          
          {/* (원래 있던 HUD부터 컨트롤러까지의 코드를 여기 안에 둠) */}
          {/* 팁: 코드가 너무 길면 나중에 MoneyBattleView.tsx로 분리해도 됨 */}
        </>
      )}

      {/* 2. 인벤토리 화면 */}
      {currentTab === 'inventory' && (
        <MoneyInventory user={user} setUser={setUser} />
      )}

      {/* 3. 월드맵/왕국 화면 (아직 빈 화면) */}
      {currentTab === 'map' && <div style={{textAlign:'center', marginTop:50}}>🗺️ 월드맵 준비중...</div>}
      {currentTab === 'kingdom' && <div style={{textAlign:'center', marginTop:50}}>🏰 왕국 건설 준비중...</div>}


      {/* --- 하단 메뉴 (네비게이션) 수정 --- */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #eee', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        {/* 클릭 시 setCurrentTab 호출 */}
        <div onClick={() => setCurrentTab('battle')}><NavButton icon={<Swords size={20}/>} label="전투" active={currentTab==='battle'} /></div>
        <div onClick={() => setCurrentTab('inventory')}><NavButton icon={<ShoppingBag size={20}/>} label="인벤토리" active={currentTab==='inventory'} /></div>
        <div onClick={() => setCurrentTab('map')}><NavButton icon={<MapIcon size={20}/>} label="월드맵" active={currentTab==='map'} /></div>
        <div onClick={() => setCurrentTab('kingdom')}><NavButton icon={<Crown size={20}/>} label="왕국" active={currentTab==='kingdom'} /></div>
      </div>

    </div>
  );

export default MoneyInventory;
