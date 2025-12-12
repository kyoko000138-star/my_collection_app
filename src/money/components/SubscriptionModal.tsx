// src/money/components/SubscriptionModal.tsx

import React, { useState } from 'react';
import { SubscriptionPlan, BillingCycle } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  onAdd: (plan: SubscriptionPlan) => void;
  onRemove: (id: string) => void;
}

export const SubscriptionModal: React.FC<Props> = ({ open, onClose, plans, onAdd, onRemove }) => {
  const [view, setView] = useState<'LIST' | 'ADD'>('LIST');
  
  // 입력 상태
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('1');

  if (!open) return null;

  const handleAdd = () => {
    if (!name || !amount) return alert('이름과 금액을 입력해주세요.');
    const billingDay = parseInt(day, 10);
    if (billingDay < 1 || billingDay > 31) return alert('유효한 날짜를 입력해주세요.');

    const newPlan: SubscriptionPlan = {
      id: Date.now().toString(),
      name,
      amount: parseInt(amount.replace(/,/g, ''), 10),
      billingDay,
      cycle: 'MONTHLY',
      isActive: true,
      categoryId: 'subscription',
      startedAt: new Date().toISOString().split('T')[0]
    };

    onAdd(newPlan);
    
    // 초기화 및 목록으로 복귀
    setName('');
    setAmount('');
    setDay('1');
    setView('LIST');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏰 고정비 관리소</h2>
        <p style={styles.desc}>매달 "자동으로" 생명력(예산)을 가져가는 계약들입니다.</p>

        {view === 'LIST' && (
          <>
            <div style={styles.listArea}>
              {plans.length === 0 ? (
                <div style={styles.empty}>
                  등록된 고정비가 없습니다.<br/>
                  [추가하기]를 눌러 월세, 구독료 등을 등록하세요.
                </div>
              ) : (
                plans.map(p => (
                  <div key={p.id} style={styles.item}>
                    <div style={styles.itemInfo}>
                      <div style={styles.itemName}>{p.name}</div>
                      <div style={styles.itemMeta}>매월 {p.billingDay}일 · {p.amount.toLocaleString()} G</div>
                    </div>
                    <button onClick={() => onRemove(p.id)} style={styles.btnRemove}>해지</button>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setView('ADD')} style={styles.btnAddMode}>
              ➕ 새로운 계약 추가
            </button>
          </>
        )}

        {view === 'ADD' && (
          <div style={styles.formArea}>
            <label style={styles.label}>이름 (예: 넷플릭스)</label>
            <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="항목 이름" />
            
            <label style={styles.label}>금액 (원)</label>
            <input style={styles.input} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="30000" />
            
            <label style={styles.label}>결제일 (매월)</label>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <input style={{...styles.input, width:'60px'}} type="number" value={day} onChange={e => setDay(e.target.value)} />
              <span>일</span>
            </div>

            <div style={styles.btnGroup}>
              <button onClick={handleAdd} style={styles.btnSave}>저장</button>
              <button onClick={() => setView('LIST')} style={styles.btnCancel}>취소</button>
            </div>
          </div>
        )}

        <button onClick={onClose} style={styles.btnClose}>닫기</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  card: { width: '90%', maxWidth: '380px', backgroundColor: '#1f2937', borderRadius: '16px', padding: '20px', color: '#f3f4f6', border: '1px solid #374151' },
  title: { textAlign: 'center', fontSize: '18px', marginBottom: '4px', color: '#c084fc' },
  desc: { textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginBottom: '20px' },
  
  listArea: { maxHeight: '300px', overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' },
  empty: { padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '12px', border: '1px dashed #374151', borderRadius: '8px' },
  
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '12px', borderRadius: '8px' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: '14px', fontWeight: 'bold' },
  itemMeta: { fontSize: '11px', color: '#9ca3af', marginTop: '2px' },
  
  btnRemove: { padding: '6px 10px', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
  btnAddMode: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  
  formArea: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '12px', color: '#d1d5db' },
  input: { padding: '10px', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: 'white', fontSize: '14px' },
  
  btnGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  btnSave: { flex: 1, padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btnCancel: { flex: 1, padding: '12px', backgroundColor: '#4b5563', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  
  btnClose: { marginTop: '15px', width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px solid #4b5563', color: '#9ca3af', borderRadius: '8px', cursor: 'pointer' }
};
