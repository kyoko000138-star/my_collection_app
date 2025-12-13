// src/money/components/MyRoomView.tsx

import React from 'react';
import { UserState } from '../types';
// [수정] 구버전 calculateLunaPhase 제거, getLunaBuffInfo 추가
import { getLunaBuffInfo } from '../moneyLuna'; 

interface Props {
  user: UserState;
  rpgStats: { attack: number; defense: number };
  onBack: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
}

export const MyRoomView: React.FC<Props> = ({ user, rpgStats, onBack, onOpenInventory, onOpenSettings }) => {
  // [수정] 계산 로직 제거 -> user.lunaCycle 데이터 직접 사용
  // moneyGameLogic.ts의 checkDailyReset에서 이미 최신 상태로 갱신되어 있음
  const lunaCycle = user.lunaCycle;
  const currentPhase = lunaCycle.currentPhase;
  const dDay = lunaCycle.dDay;

  // 화면 표시용 정보 가져오기
  const buffInfo = getLunaBuffInfo(currentPhase);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏠 마이 룸</h2>

      {/* --- 프로필 카드 --- */}
      <div style={styles.card}>
        <div style={styles.profileRow}>
          <div style={styles.avatar}>🧙‍♂️</div>
          <div style={styles.infoCol}>
            <div style={styles.name}>{user.name} <span style={styles.job}>{user.jobTitle}</span></div>
            <div style={styles.level}>Lv.{user.level}</div>
          </div>
        </div>
        
        <div style={styles.statGrid}>
          <div style={styles.statItem}>
            <span>⚔️ 공격력</span>
            <span style={styles.val}>{rpgStats.attack}</span>
          </div>
          <div style={styles.statItem}>
            <span>🛡️ 방어력</span>
            <span style={styles.val}>{rpgStats.defense}</span>
          </div>
          <div style={styles.statItem}>
            <span>💧 의지력</span>
            <span style={styles.val}>{user.mp}/{user.maxMp}</span>
          </div>
          <div style={styles.statItem}>
            <span>🧂 Salt</span>
            <span style={styles.val}>{user.salt}</span>
          </div>
        </div>
      </div>

      {/* --- 루나 바이오리듬 카드 (NEW) --- */}
      <div style={{...styles.card, borderColor: buffInfo.color, borderWidth: '2px'}}>
        <div style={styles.cardHeader}>
          <span>🌙 바이오리듬 (Luna)</span>
          <span style={{color: buffInfo.color, fontWeight:'bold'}}>{buffInfo.title}</span>
        </div>
        
        <div style={styles.lunaContent}>
          <div style={styles.dDay}>
             {dDay > 0 ? `다음 예정일 D-${dDay}` : (dDay === 0 ? "오늘 시작 가능성" : "진행 중")}
          </div>
          <p style={styles.desc}>{buffInfo.desc}</p>
          <div style={styles.effectBox}>
            <span style={styles.effectLabel}>Effect:</span> {buffInfo.effect}
          </div>
        </div>
      </div>

      {/* --- 메뉴 버튼 --- */}
      <div style={styles.menuGrid}>
        <button style={styles.menuBtn} onClick={onOpenInventory}>
          🎒 인벤토리
        </button>
        <button style={styles.menuBtn} onClick={onOpenSettings}>
          ⚙️ 설정
        </button>
      </div>

      <button onClick={onBack} style={styles.backBtn}>나가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box', color: '#fff' },
  title: { textAlign: 'center', margin: '0 0 20px 0', fontSize: '20px' },
  
  card: { backgroundColor: '#334155', borderRadius: '12px', padding: '15px', marginBottom: '15px', border: '1px solid #475569' },
  profileRow: { display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #475569', paddingBottom: '10px' },
  avatar: { fontSize: '40px', marginRight: '15px', backgroundColor: '#1e293b', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  infoCol: { display: 'flex', flexDirection: 'column' },
  name: { fontSize: '18px', fontWeight: 'bold', color: '#fbbf24' },
  job: { fontSize: '12px', color: '#94a3b8', marginLeft: '5px', fontWeight: 'normal' },
  level: { fontSize: '14px', color: '#cbd5e1' },

  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  statItem: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', backgroundColor: '#1e293b', padding: '8px', borderRadius: '6px' },
  val: { fontWeight: 'bold', color: '#fff' },

  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' },
  lunaContent: { fontSize: '13px' },
  dDay: { fontSize: '12px', color: '#94a3b8', marginBottom: '5px' },
  desc: { marginBottom: '8px', lineHeight: '1.4' },
  effectBox: { backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px', fontSize: '12px' },
  effectLabel: { color: '#fbbf24', fontWeight: 'bold' },

  menuGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 'auto' },
  menuBtn: { padding: '15px', backgroundColor: '#475569', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },

  backBtn: { padding: '15px', backgroundColor: '#334155', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', marginTop: '10px' }
};
