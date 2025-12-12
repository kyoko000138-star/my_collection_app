// src/money/components/LibraryView.tsx

import React, { useState } from 'react';

interface Props {
  onRecordSpend: (amount: number, category: string) => void; // 그림자 생성 핸들러
  onOpenSubs: () => void;
  onBack: () => void;
}

export const LibraryView: React.FC<Props> = ({ onRecordSpend, onOpenSubs, onBack }) => {
  const [tab, setTab] = useState<'SPEND' | 'INSTALLMENT' | 'LOAN'>('SPEND');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  
  // [NEW] 이펙트 상태
  const [showEffect, setShowEffect] = useState(false);

  const handleSubmit = () => {
    const val = parseInt(amount.replace(/,/g, ''), 10);
    if (!val || val <= 0) return alert("금액을 입력하세요.");

    // 1. 이펙트 발동
    setShowEffect(true);

    // 2. 실제 데이터 처리 (잠시 딜레이 후)
    setTimeout(() => {
      // 카테고리명을 탭 이름으로 전달 (예: '할부', '지출')
      const categoryName = tab === 'SPEND' ? '일반 지출' : tab === 'INSTALLMENT' ? '할부' : '대출 상환';
      onRecordSpend(val, categoryName);
      
      // 초기화
      setAmount('');
      setDesc('');
      setShowEffect(false);
    }, 1500); // 1.5초 동안 연출
  };

  return (
    <div style={styles.container}>
      {/* 배경 장식 */}
      <div style={styles.bgBooks} />
      
      {/* 탭 메뉴 */}
      <div style={styles.tabs}>
        <button style={tab === 'SPEND' ? styles.activeTab : styles.tab} onClick={() => setTab('SPEND')}>일반 지출</button>
        <button style={tab === 'INSTALLMENT' ? styles.activeTab : styles.tab} onClick={() => setTab('INSTALLMENT')}>할부</button>
        <button style={tab === 'LOAN' ? styles.activeTab : styles.tab} onClick={() => setTab('LOAN')}>대출</button>
        <button style={styles.subTab} onClick={onOpenSubs}>구독 관리</button>
      </div>

      {/* 입력 폼 */}
      <div style={styles.formCard}>
        <div style={styles.label}>
          {tab === 'SPEND' ? "무엇을 소비하셨나요?" : tab === 'INSTALLMENT' ? "새로운 할부인가요?" : "대출 이자/원금인가요?"}
        </div>
        <input 
          placeholder="내용 (선택)" 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
          style={styles.input} 
        />
        
        <div style={styles.label}>금액</div>
        <input 
          type="number" 
          placeholder="0" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          style={styles.inputAmount} 
        />

        <button onClick={handleSubmit} style={styles.submitBtn}>
          ✒️ 기록하기 (그림자 생성)
        </button>
      </div>

      {/* [NEW] 그림자 생성 이펙트 오버레이 */}
      {showEffect && (
        <div style={styles.effectOverlay}>
          <div style={styles.shadowSpirit}>👻</div>
          <div style={styles.effectText}>기록이 그림자가 되어 필드로 날아갑니다...</div>
        </div>
      )}

      <button onClick={onBack} style={styles.backBtn}>나가기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#2e1065', position: 'relative', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column' },
  bgBooks: { position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#fff 2px, transparent 2px)', backgroundSize: '100% 40px' },
  
  tabs: { display: 'flex', gap: '5px', marginBottom: '15px', zIndex: 10, flexWrap: 'wrap' },
  tab: { flex: 1, padding: '8px', backgroundColor: '#1e1b4b', color: '#a5b4fc', border: '1px solid #4338ca', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
  activeTab: { flex: 1, padding: '8px', backgroundColor: '#4338ca', color: '#fff', border: '1px solid #fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' },
  subTab: { flex: 1, padding: '8px', backgroundColor: '#be185d', color: '#fff', border: '1px solid #fff', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },

  formCard: { backgroundColor: '#1e1b4b', padding: '20px', borderRadius: '12px', border: '2px solid #4338ca', zIndex: 10, flex: 1 },
  label: { color: '#c7d2fe', fontSize: '12px', marginBottom: '6px' },
  input: { width: '100%', padding: '10px', backgroundColor: '#312e81', border: '1px solid #6366f1', borderRadius: '6px', color: '#fff', marginBottom: '15px' },
  inputAmount: { width: '100%', padding: '10px', backgroundColor: '#312e81', border: '1px solid #6366f1', borderRadius: '6px', color: '#fbbf24', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },

  backBtn: { marginTop: '10px', padding: '10px', backgroundColor: 'transparent', color: '#a5b4fc', border: '1px solid #6366f1', borderRadius: '8px', cursor: 'pointer', zIndex: 10 },

  // 이펙트 스타일
  effectOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  shadowSpirit: { fontSize: '80px', animation: 'float 1s infinite ease-in-out', filter: 'blur(2px)' },
  effectText: { color: '#fca5a5', marginTop: '20px', fontSize: '14px', animation: 'pulse 1s infinite' }
};
