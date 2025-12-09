// src/components/money/JourneyMap.tsx
import React from 'react';
import { Castle, Trees, Landmark, Map } from 'lucide-react'; // Map 아이콘 추가
import { MoneyJourneyState, JourneyNode, RouteMode } from '../../money/moneyJourney';

interface JourneyMapProps {
  journey: MoneyJourneyState;
  onChangeRoute: (mode: RouteMode) => void; // 모드 변경 핸들러
}

const JourneyMap: React.FC<JourneyMapProps> = ({ journey, onChangeRoute }) => {
  const { nodes, currentNodeId, routeMode } = journey;

  return (
    <div
      style={{
        margin: '0 4px 12px',
        padding: '12px',
        borderRadius: 16,
        border: '1px solid #e5e5e5',
        backgroundColor: '#fbf8f3', // 종이 질감 색상
      }}
    >
      {/* 헤더: 제목 + 루트 선택 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b7760' }}>
          <Map size={14} />
          <span style={{ fontSize: 11, fontWeight: 'bold', letterSpacing: '0.05em' }}>WORLD MAP</span>
        </div>

        {/* 루트 선택 토글 */}
        <div style={{ display: 'flex', backgroundColor: '#efeadd', borderRadius: 20, padding: 2 }}>
          <button
            onClick={() => onChangeRoute('calm')}
            style={{
              padding: '4px 10px',
              borderRadius: 16,
              fontSize: 10,
              border: 'none',
              backgroundColor: routeMode === 'calm' ? '#fff' : 'transparent',
              color: routeMode === 'calm' ? '#5a4d3b' : '#a89b88',
              boxShadow: routeMode === 'calm' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              fontWeight: routeMode === 'calm' ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            차분 루트
          </button>
          <button
            onClick={() => onChangeRoute('adventure')}
            style={{
              padding: '4px 10px',
              borderRadius: 16,
              fontSize: 10,
              border: 'none',
              backgroundColor: routeMode === 'adventure' ? '#fff' : 'transparent',
              color: routeMode === 'adventure' ? '#b91c1c' : '#a89b88', // 도전은 약간 붉은색 포인트
              boxShadow: routeMode === 'adventure' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              fontWeight: routeMode === 'adventure' ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            도전 루트
          </button>
        </div>
      </div>

      {/* 노드 그리기 (기존 로직 유지) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* 진행 바 배경 */}
        <div style={{ position: 'absolute', top: 14, left: 10, right: 10, height: 2, backgroundColor: '#eaddcf', zIndex: 0 }} />
        
        {/* 진행 바 채움 (계산식 간단히) */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 14, left: 10, 
            width: `${(currentNodeId / (nodes.length - 1)) * 100}%`, // 진행도 퍼센트
            height: 2, 
            backgroundColor: '#8b7760', 
            zIndex: 0,
            transition: 'width 0.5s ease'
          }} 
        />

        {nodes.map((node) => {
          const isCurrent = node.id === currentNodeId;
          const isPassed = node.id < currentNodeId;
          
          // 아이콘 결정
          let Icon = Trees;
          if (node.type === 'town') Icon = Landmark;
          if (node.type === 'dungeon') Icon = Castle;

          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: 40 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: isCurrent ? '#3f3428' : isPassed ? '#8b7760' : '#fdfdfd',
                  border: isCurrent ? '2px solid #3f3428' : '2px solid #dcd3c5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isCurrent || isPassed ? '#fff' : '#dcd3c5',
                  transition: 'all 0.3s',
                  marginBottom: 6,
                }}
              >
                <Icon size={14} />
              </div>
              <span style={{ fontSize: 9, color: isCurrent ? '#3f3428' : '#aaa', fontWeight: isCurrent ? 'bold' : 'normal', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* 현재 위치 설명 */}
      <div style={{ marginTop: 12, padding: '8px', backgroundColor: '#fff', borderRadius: 8, fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
        Currently at: <strong>{nodes[currentNodeId].label}</strong>
        <div style={{fontSize: 10, color:'#9ca3af', marginTop:2}}>{nodes[currentNodeId].description}</div>
      </div>
    </div>
  );
};

export default JourneyMap;
