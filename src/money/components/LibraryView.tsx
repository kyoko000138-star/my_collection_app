// src/money/components/LibraryView.tsx

import React, { useState } from 'react';
import { UserState, Transaction, CategoryId, IntentTag } from '../types';

interface Props {
  user: UserState; // 장부 보여주기용
  onRecordTransaction: (tx: any) => void; // 부모에게 데이터 전달
  onOpenSubs: () => void;
  onBack: () => void;
}

// v4 카테고리 메타데이터 (아이콘 & 이름)
const CATEGORY_META: Record<CategoryId | 'etc', { label: string; icon: string; color: string }> = {
  'fixed.housing': { label: '주거', icon: '🏠', color: '#64748b' },
  'fixed.utilities': { label: '공과금', icon: '💡', color: '#64748b' },
  'fixed.telecom': { label: '통신', icon: '📡', color: '#64748b' },
  'fixed.subscription': { label: '구독', icon: '🔄', color: '#64748b' },
  'fixed.insurance': { label: '보험', icon: '🛡️', color: '#64748b' },
  'fixed.fees': { label: '수수료', icon: '💸', color: '#64748b' },
  
  'food.groceries': { label: '장보기', icon: '🥦', color: '#10b981' },
  'food.out': { label: '외식/배달', icon: '🍔', color: '#f59e0b' },
  'food.cafe_snack': { label: '카페/간식', icon: '☕', color: '#f59e0b' },
  'life.supplies': { label: '생활용품', icon: '🧻', color: '#10b981' },
  
  'move.transport': { label: '대중교통', icon: '🚌', color: '#3b82f6' },
  'move.travel': { label: '여행', icon: '✈️', color: '#3b82f6' },
  
  'health.medical': { label: '병원', icon: '🏥', color: '#ef4444' },
  'health.meds': { label: '약국', icon: '💊', color: '#ef4444' },
  'health.fitness': { label: '운동', icon: '💪', color: '#ef4444' },
  
  'fun.hobby': { label: '취미/덕질', icon: '🎨', color: '#8b5cf6' },
  'social.gift': { label: '선물', icon: '🎁', color: '#ec4899' },
  'social.meetup': { label: '모임', icon: '🥂', color: '#ec4899' },
  'self.dev': { label: '자기계발', icon: '📚', color: '#8b5cf6' },
  'big.oneoff': { label: '큰지출', icon: '💎', color: '#6366f1' },
  'life.pet': { label: '반려동물', icon: '🐾', color: '#f97316' },
  'life.family': { label: '가족', icon: '👨‍👩‍👧', color: '#f97316' },

  'save.goal': { label: '목표저축', icon: '🌱', color: '#22c55e' },
  'save.emergency': { label: '비상금', icon: '🚨', color: '#22c55e' },
  'save.debt': { label: '부채상환', icon: '⛓️', color: '#06b6d4' }, // 특별 취급
  'invest.isa': { label: 'ISA/투자', icon: '📈', color: '#22c55e' },
  'invest.pension': { label: '연금', icon: '👵', color: '#22c55e' },
  'invest.brokerage': { label: '주식', icon: '📊', color: '#22c55e' },
  'invest.cash_equiv': { label: '현금성', icon: '💰', color: '#22c55e' },
  
  // 나머지 처리
  'save.buffer': { label: '예비비', icon: '💧', color: '#22c55e' },
  'save.deposit': { label: '예적금', icon: '🏦', color: '#22c55e' },
  'etc': { label: '기타', icon: '❓', color: '#9ca3af' },
};

export const LibraryView: React.FC<Props> = ({ user, onRecordTransaction, onOpenSubs, onBack }) => {
  // 모드: LIST(목록) | INPUT(입력)
  const [mode, setMode] = useState<'LIST' | 'INPUT'>('LIST');
  
  // 입력 상태
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCat, setSelectedCat] = useState<CategoryId | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<IntentTag | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // 1단계: 카테고리 선택
  const renderStep1 = () => (
    <div style={styles.gridContainer}>
      <h3 style={styles.stepTitle}>1. 그림자의 형태 (분류)</h3>
      <div style={styles.runeGrid}>
        {(Object.keys(CATEGORY_META) as CategoryId[]).map((cat) => (
          <button 
            key={cat} 
            style={{
              ...styles.runeBtn,
              borderColor: CATEGORY_META[cat]?.color,
              backgroundColor: selectedCat === cat ? CATEGORY_META[cat]?.color : 'transparent'
            }}
            onClick={() => {
              setSelectedCat(cat);
              setStep(2);
            }}
          >
            <div style={styles.runeIcon}>{CATEGORY_META[cat]?.icon}</div>
            <div style={styles.runeLabel}>{CATEGORY_META[cat]?.label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // 2단계: 의도(Intent) 선택
  const renderStep2 = () => (
    <div style={styles.stepContainer}>
      <h3 style={styles.stepTitle}>2. 본질 주입 (의도)</h3>
      <div style={styles.intentGrid}>
        {/* 소비 태그 */}
        <div style={styles.tagGroup}>
          <h4>지출의 성격</h4>
          {['necessary', 'planned', 'social_duty', 'impulse', 'self_care', 'reward', 'explore'].map(tag => (
            <button 
              key={tag} 
              style={{
                ...styles.tagBtn,
                backgroundColor: selectedIntent === tag ? '#f59e0b' : '#334155'
              }}
              onClick={() => {
                setSelectedIntent(tag as IntentTag);
                setStep(3);
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
        {/* 저축 태그 (카테고리가 save일 때만 보여줘도 됨) */}
        <div style={styles.tagGroup}>
          <h4>저축/투자 목적</h4>
          {['goal_growth', 'goal_house', 'goal_debt', 'goal_big'].map(tag => (
            <button 
              key={tag} 
              style={{
                ...styles.tagBtn,
                backgroundColor: selectedIntent === tag ? '#10b981' : '#334155'
              }}
              onClick={() => {
                setSelectedIntent(tag as IntentTag);
                setStep(3);
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
      <button style={styles.backStepBtn} onClick={() => setStep(1)}>◀ 다시 고르기</button>
    </div>
  );

  // 3단계: 금액 입력 및 봉인
  const renderStep3 = () => (
    <div style={styles.stepContainer}>
      <h3 style={styles.stepTitle}>3. 영혼 봉인 (금액)</h3>
      <div style={styles.confirmCard}>
        <div style={styles.confirmIcon}>{selectedCat ? CATEGORY_META[selectedCat].icon : ''}</div>
        <div style={styles.confirmLabel}>
          {selectedCat ? CATEGORY_META[selectedCat].label : ''} 
          <span style={{opacity:0.7, fontSize:'12px', marginLeft:'5px'}}>#{selectedIntent}</span>
        </div>
      </div>
      
      <input 
        type="number" 
        placeholder="금액 (예: 5000)" 
        style={styles.input} 
        value={amount} 
        onChange={e => setAmount(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="메모 (선택)" 
        style={styles.input} 
        value={note} 
        onChange={e => setNote(e.target.value)} 
      />

      <div style={styles.btnRow}>
        <button style={styles.backStepBtn} onClick={() => setStep(2)}>◀ 뒤로</button>
        <button 
          style={styles.sealBtn}
          onClick={() => {
            if (!selectedCat || !amount) return;
            onRecordTransaction({
              amount: parseInt(amount),
              category: selectedCat,
              intent: selectedIntent,
              note: note || CATEGORY_META[selectedCat].label
            });
            // 초기화 및 목록으로 복귀
            setAmount(''); setNote(''); setSelectedCat(null); setSelectedIntent(null); setStep(1); setMode('LIST');
          }}
        >
          🔮 봉인 (기록)
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* --- LIST MODE (기본) --- */}
      {mode === 'LIST' && (
        <>
          <div style={styles.header}>
            <h2 style={styles.title}>📜 기록의 도서관</h2>
            <div style={styles.headerBtns}>
              <button style={styles.subBtn} onClick={onOpenSubs}>구독 관리</button>
            </div>
          </div>

          <div style={styles.listArea}>
            {user.pending.length === 0 ? (
              <div style={styles.emptyMsg}>
                <p>아직 기록된 그림자가 없습니다.</p>
                <p>우측 하단 [+] 버튼을 눌러 기록하세요.</p>
              </div>
            ) : (
              user.pending.map((tx, idx) => (
                <div key={tx.id || idx} style={styles.logRow}>
                  <div style={styles.logIcon}>
                    {CATEGORY_META[tx.category as CategoryId]?.icon || '❓'}
                  </div>
                  <div style={styles.logContent}>
                    <div style={styles.logTitle}>
                      {tx.note} <span style={styles.tagBadge}>#{tx.intent || 'etc'}</span>
                    </div>
                    <div style={styles.logDate}>{tx.createdAt.substring(5, 16).replace('T', ' ')}</div>
                  </div>
                  <div style={{
                    ...styles.logAmount,
                    color: (tx.category as string).startsWith('save') ? '#4ade80' : '#f87171'
                  }}>
                    {(tx.category as string).startsWith('save') ? '+' : '-'}{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 하단 플로팅 액션 버튼 (FAB) */}
          <button style={styles.fab} onClick={() => setMode('INPUT')}>
            🖋️
          </button>
          
          <div style={styles.footer}>
            <button onClick={onBack} style={styles.backBtn}>마을로 나가기</button>
          </div>
        </>
      )}

      {/* --- INPUT MODE (마법진 오버레이) --- */}
      {mode === 'INPUT' && (
        <div style={styles.overlay}>
          <div style={styles.overlayHeader}>
            <span>의식 진행 중...</span>
            <button style={styles.closeBtn} onClick={() => setMode('LIST')}>✖</button>
          </div>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', color: '#fff', position: 'relative' },
  
  header: { padding: '20px', backgroundColor: '#0f172a', borderBottom: '2px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '18px', color: '#e2e8f0' },
  headerBtns: { display: 'flex', gap: '5px' },
  subBtn: { fontSize: '11px', padding: '4px 8px', backgroundColor: '#334155', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer' },

  listArea: { flex: 1, overflowY: 'auto', padding: '15px' },
  emptyMsg: { textAlign: 'center', color: '#64748b', marginTop: '50px', fontSize: '14px', lineHeight: '1.6' },

  logRow: { display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#334155', marginBottom: '8px', borderRadius: '8px', borderLeft: '4px solid #64748b' },
  logIcon: { fontSize: '20px', marginRight: '10px' },
  logContent: { flex: 1 },
  logTitle: { fontSize: '13px', fontWeight: 'bold', color: '#f1f5f9' },
  logDate: { fontSize: '10px', color: '#94a3b8' },
  logAmount: { fontSize: '14px', fontWeight: 'bold' },
  tagBadge: { fontSize: '10px', color: '#94a3b8', backgroundColor: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px', marginLeft: '5px' },

  footer: { padding: '15px', borderTop: '2px solid #334155', backgroundColor: '#0f172a' },
  backBtn: { width: '100%', padding: '12px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },

  fab: { position: 'absolute', bottom: '80px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f59e0b', color: '#fff', fontSize: '24px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // --- Overlay Styles ---
  overlay: { position: 'absolute', inset: 0, backgroundColor: '#0f172a', zIndex: 50, display: 'flex', flexDirection: 'column' },
  overlayHeader: { padding: '15px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', color: '#94a3b8' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' },
  
  stepContainer: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  gridContainer: { flex: 1, padding: '10px', overflowY: 'auto' }, // 스크롤 가능하게
  stepTitle: { color: '#fbbf24', marginBottom: '20px', textAlign: 'center' },

  // Step 1: Rune Grid
  runeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingBottom: '20px' },
  runeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px', backgroundColor: '#1e293b', border: '2px solid #334155', borderRadius: '12px', cursor: 'pointer', color: '#fff' },
  runeIcon: { fontSize: '24px', marginBottom: '5px' },
  runeLabel: { fontSize: '11px', color: '#cbd5e1' },

  // Step 2: Intent Tags
  intentGrid: { width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' },
  tagGroup: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' },
  tagBtn: { padding: '8px 12px', borderRadius: '20px', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer' },

  // Step 3: Input
  confirmCard: { backgroundColor: '#334155', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', width: '100%', boxSizing: 'border-box' },
  confirmIcon: { fontSize: '30px' },
  confirmLabel: { fontSize: '16px', fontWeight: 'bold' },
  input: { width: '100%', padding: '15px', borderRadius: '8px', border: '2px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '16px', marginBottom: '10px', boxSizing: 'border-box' },
  
  btnRow: { display: 'flex', gap: '10px', width: '100%', marginTop: '20px' },
  backStepBtn: { flex: 1, padding: '12px', backgroundColor: '#475569', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
  sealBtn: { flex: 2, padding: '12px', backgroundColor: '#8b5cf6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }
};
