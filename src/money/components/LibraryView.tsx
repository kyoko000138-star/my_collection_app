// src/money/components/LibraryView.tsx

import React, { useState } from 'react';
import { UserState, CategoryId, IntentTag } from '../types';

interface Props {
  user: UserState;
  onRecordTransaction: (tx: any) => void;
  onOpenSubs: () => void;
  onBack: () => void;
}

// ------------------------------------------------------------------
// 1. 데이터 정의 (한글화 & 그룹화)
// ------------------------------------------------------------------

// 소비(Expense) 카테고리 그룹
const EXPENSE_GROUPS = {
  'FIXED': { title: '숨만 쉬어도 (고정)', list: ['fixed.housing', 'fixed.utilities', 'fixed.telecom', 'fixed.subscription', 'fixed.insurance'] },
  'LIVING': { title: '먹고 사는 것 (생활)', list: ['food.groceries', 'food.out', 'food.cafe_snack', 'life.supplies', 'health.medical'] },
  'JOY': { title: '삶의 기쁨 (취미/관계)', list: ['fun.hobby', 'social.gift', 'social.meetup', 'self.dev', 'move.travel'] },
  'ETC': { title: '기타/이동', list: ['move.transport', 'big.oneoff', 'life.pet', 'etc'] }
};

// 저축/투자(Save) 카테고리 그룹
const SAVE_GROUPS = {
  'SAVE': { title: '미래를 위한 씨앗 (저축)', list: ['save.goal', 'save.emergency', 'save.buffer', 'save.deposit'] },
  'INVEST': { title: '자산 불리기 (투자)', list: ['invest.isa', 'invest.pension', 'invest.brokerage', 'invest.cash_equiv'] },
  'DEBT': { title: '족쇄 끊기 (상환)', list: ['save.debt'] } // 대출 상환 분리
};

// 아이콘 및 라벨 매핑
const CAT_META: Record<string, { label: string; icon: string }> = {
  // Fixed
  'fixed.housing': { label: '월세/관리비', icon: '🏠' },
  'fixed.utilities': { label: '공과금', icon: '💡' },
  'fixed.telecom': { label: '통신비', icon: '📡' },
  'fixed.subscription': { label: '구독/멤버십', icon: '🔄' },
  'fixed.insurance': { label: '보험료', icon: '🛡️' },
  // Food & Life
  'food.groceries': { label: '장보기', icon: '🥦' },
  'food.out': { label: '외식/배달', icon: '🥘' },
  'food.cafe_snack': { label: '카페/간식', icon: '☕' },
  'life.supplies': { label: '생활용품', icon: '🧻' },
  'health.medical': { label: '병원/약국', icon: '💊' },
  // Joy
  'fun.hobby': { label: '취미/덕질', icon: '🎨' },
  'social.gift': { label: '선물/경조사', icon: '🎁' },
  'social.meetup': { label: '모임/회식', icon: '🥂' },
  'self.dev': { label: '자기계발', icon: '📚' },
  'move.travel': { label: '여행', icon: '✈️' },
  // Etc
  'move.transport': { label: '교통비', icon: '🚌' },
  'big.oneoff': { label: '큰지출', icon: '💎' },
  'life.pet': { label: '반려동물', icon: '🐾' },
  'etc': { label: '기타', icon: '❓' },
  // Save
  'save.goal': { label: '목표저축', icon: '🎯' },
  'save.emergency': { label: '비상금', icon: '🚨' },
  'save.buffer': { label: '예비비', icon: '💧' },
  'save.deposit': { label: '예적금', icon: '🏦' },
  'save.debt': { label: '대출 상환', icon: '⛓️' }, // 아이콘 변경
  // Invest
  'invest.isa': { label: 'ISA/계좌', icon: '📈' },
  'invest.pension': { label: '연금', icon: '👵' },
  'invest.brokerage': { label: '주식/코인', icon: '📊' },
  'invest.cash_equiv': { label: '현금성', icon: '💰' },
};

// 의도(Intent) 한글 매핑 (마도서 페이지 느낌)
const INTENT_DESC: Record<string, string> = {
  // 소비
  'necessary': '생존을 위해 필수적이었습니다.',
  'planned': '미리 계획했던 지출입니다.',
  'social_duty': '관계와 예의를 위한 지출입니다.',
  'self_care': '나를 돌보고 회복하는 시간이었습니다.',
  'efficiency': '미래의 효율을 위한 투자입니다.',
  'reward': '수고한 나에게 주는 보상입니다.',
  'explore': '새로운 경험과 취향을 탐구했습니다.',
  'impulse': '충동적인 유혹에 굴복했습니다...',
  'unavoidable': '예상치 못한 사고/고장이었습니다.',
  // 저축
  'goal_growth': '자산을 불리기 위해서.',
  'goal_house': '내 집 마련의 꿈을 위해.',
  'goal_debt': '빚을 갚아 자유를 얻기 위해.',
  'goal_big': '나중에 큰 돈을 쓰기 위해.',
};

export const LibraryView: React.FC<Props> = ({ user, onRecordTransaction, onOpenSubs, onBack }) => {
  const [mode, setMode] = useState<'LIST' | 'INPUT'>('LIST');
  
  // 입력 상태
  const [bookTab, setBookTab] = useState<'EXPENSE' | 'SAVING'>('EXPENSE'); // 책의 챕터 (소비 vs 저축)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCat, setSelectedCat] = useState<CategoryId | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<IntentTag | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // ------------------------------------------------
  // UI Components
  // ------------------------------------------------

  // [Step 1] 카테고리 선택 (챕터별 렌더링)
  const renderStep1 = () => {
    const groups = bookTab === 'EXPENSE' ? EXPENSE_GROUPS : SAVE_GROUPS;
    
    return (
      <div style={styles.gridContainer}>
        <div style={styles.bookHeader}>
          <div style={styles.chapterTitle}>
            {bookTab === 'EXPENSE' ? '제1장. 그림자의 기록 (지출)' : '제2장. 빛의 저장 (저축/투자)'}
          </div>
          <div style={styles.tabToggle}>
            <button 
              style={{...styles.tabBtn, opacity: bookTab === 'EXPENSE' ? 1 : 0.5}} 
              onClick={() => setBookTab('EXPENSE')}
            >💀 소비</button>
            <button 
              style={{...styles.tabBtn, opacity: bookTab === 'SAVING' ? 1 : 0.5}} 
              onClick={() => setBookTab('SAVING')}
            >🌱 저축</button>
          </div>
        </div>

        <div style={styles.scrollArea}>
          {Object.entries(groups).map(([groupKey, group]) => (
            <div key={groupKey} style={styles.groupSection}>
              <div style={styles.groupTitle}>{group.title}</div>
              <div style={styles.runeGrid}>
                {group.list.map((catId) => {
                  const meta = CAT_META[catId] || { label: catId, icon: '❓' };
                  return (
                    <button 
                      key={catId} 
                      style={{
                        ...styles.runeBtn,
                        borderColor: selectedCat === catId ? '#fbbf24' : '#334155',
                        backgroundColor: selectedCat === catId ? 'rgba(251, 191, 36, 0.1)' : '#1e293b'
                      }}
                      onClick={() => {
                        setSelectedCat(catId as CategoryId);
                        setStep(2);
                      }}
                    >
                      <div style={styles.runeIcon}>{meta.icon}</div>
                      <div style={styles.runeLabel}>{meta.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // [Step 2] 의도 선택 (마도서 문장 완성)
  const renderStep2 = () => {
    const isExpense = bookTab === 'EXPENSE';
    const intents = isExpense 
      ? ['necessary', 'planned', 'social_duty', 'self_care', 'reward', 'explore', 'impulse', 'unavoidable']
      : ['goal_growth', 'goal_house', 'goal_debt', 'goal_big'];

    return (
      <div style={styles.stepContainer}>
        <h3 style={styles.stepTitle}>
          {isExpense ? '이 소비의 본질은 무엇입니까?' : '이 자금의 목적은 무엇입니까?'}
        </h3>
        
        <div style={styles.intentList}>
          {intents.map(tag => (
            <button 
              key={tag} 
              style={{
                ...styles.intentRow,
                border: selectedIntent === tag ? '1px solid #fbbf24' : '1px solid #334155',
                background: selectedIntent === tag ? 'rgba(251, 191, 36, 0.1)' : 'transparent'
              }}
              onClick={() => {
                setSelectedIntent(tag as IntentTag);
                setStep(3);
              }}
            >
              <span style={{marginRight:'10px'}}>
                {tag === 'impulse' ? '🔥' : (tag === 'goal_debt' ? '⛓️' : '✒️')}
              </span>
              {INTENT_DESC[tag] || tag}
            </button>
          ))}
        </div>
        <button style={styles.backStepBtn} onClick={() => setStep(1)}>◀ 다시 고르기</button>
      </div>
    );
  };

  // [Step 3] 금액 입력 (봉인)
  const renderStep3 = () => {
    const meta = selectedCat ? CAT_META[selectedCat] : null;
    return (
      <div style={styles.stepContainer}>
        <h3 style={styles.stepTitle}>기록 봉인</h3>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>{meta?.icon}</div>
          <div style={styles.summaryText}>
            <div style={styles.summaryCat}>{meta?.label}</div>
            <div style={styles.summaryIntent}>"{selectedIntent ? INTENT_DESC[selectedIntent] : ''}"</div>
          </div>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>금액</label>
          <input 
            type="number" 
            placeholder="0" 
            style={styles.input} 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>메모 (선택)</label>
          <input 
            type="text" 
            placeholder="내용을 입력하세요..." 
            style={styles.input} 
            value={note} 
            onChange={e => setNote(e.target.value)} 
          />
        </div>

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
                note: note || meta?.label
              });
              // Reset
              setAmount(''); setNote(''); setSelectedCat(null); setSelectedIntent(null); setStep(1); setMode('LIST');
            }}
          >
            🔮 기록 완료
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* --- LIST MODE --- */}
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
                <p>기록된 내용이 없습니다.</p>
                <p>우측 하단 깃펜을 눌러 기록을 시작하세요.</p>
              </div>
            ) : (
              user.pending.map((tx, idx) => {
                const isSave = (tx.category as string).startsWith('save') || (tx.category as string).startsWith('invest');
                return (
                  <div key={tx.id || idx} style={styles.logRow}>
                    <div style={styles.logIcon}>
                      {CAT_META[tx.category]?.icon || '❓'}
                    </div>
                    <div style={styles.logContent}>
                      <div style={styles.logTitle}>{tx.note}</div>
                      <div style={styles.logDate}>{tx.createdAt.substring(5, 16).replace('T', ' ')}</div>
                    </div>
                    <div style={{
                      ...styles.logAmount,
                      color: isSave ? '#4ade80' : '#f87171'
                    }}>
                      {isSave ? '+' : '-'}{tx.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Floating Action Button (FAB) */}
          <button style={styles.fab} onClick={() => setMode('INPUT')}>
            ✒️
          </button>
          
          <div style={styles.footer}>
            <button onClick={onBack} style={styles.backBtn}>마을로 나가기</button>
          </div>
        </>
      )}

      {/* --- INPUT MODE (Grimoire Overlay) --- */}
      {mode === 'INPUT' && (
        <div style={styles.overlay}>
          <div style={styles.overlayHeader}>
            <span>기록 의식</span>
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
  title: { margin: 0, fontSize: '18px', fontFamily: 'serif', color: '#e2e8f0' },
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

  footer: { padding: '15px', borderTop: '2px solid #334155', backgroundColor: '#0f172a' },
  backBtn: { width: '100%', padding: '12px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },

  fab: { position: 'absolute', bottom: '80px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f59e0b', color: '#fff', fontSize: '24px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // --- Overlay & Input Styles ---
  overlay: { position: 'absolute', inset: 0, backgroundColor: '#0f172a', zIndex: 50, display: 'flex', flexDirection: 'column' },
  overlayHeader: { padding: '15px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontFamily: 'serif' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' },
  
  stepContainer: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  gridContainer: { flex: 1, padding: '0 20px', overflowY: 'auto' },
  stepTitle: { color: '#fbbf24', margin: '20px 0', textAlign: 'center', fontFamily: 'serif', fontSize: '18px' },

  // Book Header (Step 1)
  bookHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', borderBottom: '1px solid #334155', paddingBottom: '10px' },
  chapterTitle: { fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' },
  tabToggle: { display: 'flex', gap: '10px' },
  tabBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' },

  scrollArea: { paddingBottom: '30px' },
  groupSection: { marginBottom: '25px' },
  groupTitle: { fontSize: '12px', color: '#64748b', marginBottom: '10px', borderLeft: '3px solid #64748b', paddingLeft: '8px' },
  
  runeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  runeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', color: '#fff', height: '70px' },
  runeIcon: { fontSize: '20px', marginBottom: '4px' },
  runeLabel: { fontSize: '10px', color: '#cbd5e1', textAlign: 'center', wordBreak: 'keep-all' },

  // Intent List (Step 2)
  intentList: { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' },
  intentRow: { padding: '15px', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center' },

  // Summary (Step 3)
  summaryCard: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', width: '100%', boxSizing: 'border-box', border: '1px solid #475569' },
  summaryIcon: { fontSize: '32px' },
  summaryText: { display: 'flex', flexDirection: 'column' },
  summaryCat: { fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  summaryIntent: { fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' },

  inputGroup: { width: '100%', marginBottom: '15px' },
  label: { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' },
  input: { width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '16px', boxSizing: 'border-box' },
  
  btnRow: { display: 'flex', gap: '10px', width: '100%', marginTop: 'auto', marginBottom: '20px' },
  backStepBtn: { flex: 1, padding: '15px', backgroundColor: '#334155', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' },
  sealBtn: { flex: 2, padding: '15px', backgroundColor: '#8b5cf6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }
};
