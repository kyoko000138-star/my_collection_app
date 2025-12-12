// src/money/components/MyRoomView.tsx 수정본

import React from 'react';
import { UserState } from '../types';

interface Props {
  user: UserState;
  onBack: () => void;
  onOpenInventory: () => void; // [NEW]
  onOpenSettings: () => void;  // [NEW]
}

export const MyRoomView: React.FC<Props> = ({ user, onBack, onOpenInventory, onOpenSettings }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏰 MY ROOM</h2>
        <button onClick={onBack} style={styles.closeBtn}>✕</button>
      </div>

      <div style={styles.content}>
        {/* 캐릭터 정보 */}
        <div style={styles.portraitSection}>
          <div style={styles.avatar}>🧙‍♀️</div>
          <div style={styles.info}>
            <div style={styles.name}>{user.name} <span style={styles.job}>{user.jobTitle}</span></div>
            <div style={styles.level}>Lv.{user.level}</div>
          </div>
        </div>

        {/* 메뉴 버튼 그리드 */}
        <div style={styles.menuGrid}>
          <button onClick={onOpenInventory} style={styles.menuBtn}>
            <span style={{fontSize:'24px'}}>🎒</span>
            <span>인벤토리</span>
          </button>
          <button onClick={onOpenSettings} style={styles.menuBtn}>
            <span style={{fontSize:'24px'}}>⚙️</span>
            <span>환경설정</span>
          </button>
          <button style={{...styles.menuBtn, opacity:0.5}}>
            <span style={{fontSize:'24px'}}>👗</span>
            <span>장비(준비중)</span>
          </button>
          <button style={{...styles.menuBtn, opacity:0.5}}>
            <span style={{fontSize:'24px'}}>🏆</span>
            <span>업적(준비중)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ... (styles는 이전과 유사하되 menuGrid 추가)
const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#111827', color: '#fff', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #374151', paddingBottom: '10px', marginBottom: '20px' },
  title: { margin: 0, fontSize: '18px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '18px' },
  content: { display: 'flex', flexDirection: 'column', gap: '20px' },
  portraitSection: { display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#1f2937', padding: '15px', borderRadius: '10px' },
  avatar: { fontSize: '40px', backgroundColor: '#000', padding: '10px', borderRadius: '8px' },
  info: { display: 'flex', flexDirection: 'column' },
  name: { fontWeight: 'bold', fontSize: '16px' },
  job: { fontSize: '10px', backgroundColor: '#4f46e5', padding: '2px 5px', borderRadius: '4px', marginLeft: '5px' },
  level: { color: '#fbbf24', fontSize: '12px' },
  
  menuGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  menuBtn: { backgroundColor: '#374151', border: 'none', borderRadius: '8px', padding: '15px', color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }
};
