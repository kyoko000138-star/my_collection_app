// src/money/components/LibraryView.tsx
import React from 'react';

interface Props {
  onOpenSubs: () => void; // 구독 모달 열기
  onBack: () => void;
}

export const LibraryView: React.FC<Props> = ({ onOpenSubs, onBack }) => {
  return (
    <div style={styles.container}>
      <div style={styles.wall} />
      <div style={styles.floor} />
      
      {/* 사서 NPC */}
      <div style={styles.npc}>
        <div style={{fontSize: '50px'}}>🧐</div>
        <div style={styles.bubble}>"고정 지출은 제게 맡기세요."</div>
      </div>

      {/* 책상 (상호작용) */}
      <div style={styles.desk} onClick={onOpenSubs}>
        <div style={{fontSize: '40px'}}>📜</div>
        <div style={styles.label}>[구독 관리 대장] 펼치기</div>
      </div>

      {/* 책장 (장식) */}
      <div style={styles.bookshelf}>📚 📕 📗</div>

      <button onClick={onBack} style={styles.btnBack}>나가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
  wall: { position: 'absolute', top: 0, width: '100%', height: '40%', backgroundColor: '#78350f', borderBottom: '4px solid #451a03' },
  floor: { position: 'absolute', top: '40%', width: '100%', height: '60%', backgroundColor: '#92400e' },
  npc: { position: 'absolute', top: '30%', left: '20%', textAlign: 'center' },
  bubble: { backgroundColor: '#fff', padding: '4px 8px', borderRadius: 8, fontSize: '10px', color: '#000', marginBottom: 4, whiteSpace: 'nowrap' },
  desk: { 
    position: 'absolute', bottom: '25%', right: '20%', 
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    cursor: 'pointer', animation: 'float 3s infinite ease-in-out'
  },
  label: { backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '2px 4px', borderRadius: 4 },
  bookshelf: { position: 'absolute', top: '10%', right: '10%', fontSize: '30px' },
  btnBack: { position: 'absolute', bottom: 10, left: 10, padding: '8px 16px', backgroundColor: '#451a03', color: '#fff', border: '2px solid #d97706', borderRadius: 8, cursor: 'pointer' }
};
