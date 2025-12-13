// src/money/components/MonthlyReportView.tsx

import React, { useMemo } from 'react';
import { UserState } from '../types';

interface Props {
  user: UserState;
  onBack: () => void;
}

export const MonthlyReportView: React.FC<Props> = ({ user, onBack }) => {
  // 결산 로직
  const report = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // "2025-10"

    // 이번 달 지출 내역 필터링
    const monthlyTx = user.pending.filter(tx => tx.createdAt.startsWith(currentMonth));
    
    const totalSpend = monthlyTx.reduce((sum, tx) => sum + tx.amount, 0);
    const budget = user.maxBudget; // 월 예산이라 가정
    const remain = user.currentBudget; // 현재 잔액 (게임 내 HP)
    
    // 소비 등급 판정
    let grade = 'C';
    const ratio = (totalSpend / budget) * 100;
    if (ratio <= 50) grade = 'S';
    else if (ratio <= 70) grade = 'A';
    else if (ratio <= 90) grade = 'B';
    else if (ratio <= 100) grade = 'C';
    else grade = 'F'; // 예산 초과

    return { totalSpend, remain, grade, count: monthlyTx.length };
  }, [user.pending, user.currentBudget, user.maxBudget]);

  return (
    <div style={styles.container}>
      <div style={styles.paper}>
        <div style={styles.stamp}>{report.grade}</div>
        <h2 style={styles.title}>📅 월간 결산</h2>
        <div style={styles.divider} />
        
        <div style={styles.row}>
          <span>총 예산</span>
          <span>{user.maxBudget.toLocaleString()}</span>
        </div>
        <div style={styles.row}>
          <span>총 지출</span>
          <span style={{color: '#ef4444'}}>-{report.totalSpend.toLocaleString()}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.rowBold}>
          <span>잔액 (HP)</span>
          <span style={{color: '#22c55e'}}>{report.remain.toLocaleString()}</span>
        </div>

        <div style={styles.commentBox}>
          {report.grade === 'S' && "완벽합니다! 저축왕이시군요. 👑"}
          {report.grade === 'A' && "아주 훌륭한 소비 습관입니다. 👍"}
          {report.grade === 'B' && "나쁘지 않아요. 조금 더 아껴볼까요? 🤔"}
          {report.grade === 'C' && "아슬아슬했습니다. 주의가 필요해요. 🚧"}
          {report.grade === 'F' && "예산 초과! 긴급 조치가 필요합니다. 🚨"}
        </div>
      </div>
      <button onClick={onBack} style={styles.backBtn}>닫기</button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', position: 'absolute', top: 0, left: 0, zIndex: 50 },
  
  paper: { width: '100%', backgroundColor: '#fff', color: '#1f2937', padding: '30px 20px', borderRadius: '4px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontFamily: 'serif' },
  
  title: { textAlign: 'center', margin: '0 0 20px 0', borderBottom: '2px solid #000', paddingBottom: '10px' },
  
  stamp: { position: 'absolute', top: '20px', right: '20px', fontSize: '60px', fontWeight: 'bold', color: 'rgba(220, 38, 38, 0.5)', border: '4px solid rgba(220, 38, 38, 0.5)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-15deg)' },

  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' },
  rowBold: { display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '18px', fontWeight: 'bold' },
  divider: { height: '1px', backgroundColor: '#e5e7eb', margin: '10px 0' },

  commentBox: { marginTop: '20px', backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontStyle: 'italic', color: '#4b5563' },

  backBtn: { marginTop: '20px', padding: '12px 30px', backgroundColor: '#4b5563', border: '1px solid #fff', color: '#fff', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }
};
