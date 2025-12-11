// src/money/components/OnboardingModal.tsx

import React, { useState } from 'react';
import { UserState } from '../types';
import { CLASS_TYPES, ClassType } from '../constants';

interface OnboardingModalProps {
  onComplete: (data: Partial<UserState>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  
  // 입력 상태
  const [name, setName] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [fixedCost, setFixedCost] = useState('');
  const [selectedJob, setSelectedJob] = useState<ClassType>(CLASS_TYPES.GUARDIAN);
  const [periodDate, setPeriodDate] = useState('');

  const handleNext = () => {
    if (step === 1 && (!name || !budgetTotal)) return alert("이름과 예산을 입력해주세요.");
    if (step === 2 && !periodDate) return alert("기준일을 선택해주세요.");
    setStep(step + 1);
  };

  const handleSubmit = () => {
    // 입력된 데이터를 부모에게 전달
    const total = parseInt(budgetTotal.replace(/,/g, ''), 10);
    const fixed = parseInt(fixedCost.replace(/,/g, ''), 10) || 0;

    onComplete({
      profile: { name, classType: selectedJob, level: 1 },
      budget: { 
        total, 
        current: total - fixed, // 시작 시 고정비 미리 차감할지, 아닐지 선택 (여기선 잔액만 설정)
        fixedCost: fixed, 
        startDate: new Date().toISOString().split('T')[0] 
      },
      luna: { 
        nextPeriodDate: periodDate, 
        averageCycle: 28, 
        isTracking: true 
      }
    });
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.container}>
        <h2 style={styles.title}>⚔️ 던전 입관 신청서 ({step}/3)</h2>

        {/* STEP 1: 기본 정보 */}
        {step === 1 && (
          <div style={styles.form}>
            <label style={styles.label}>모험가 이름</label>
            <input style={styles.input} placeholder="이름을 입력하세요" value={name} onChange={e=>setName(e.target.value)} />
            
            <label style={styles.label}>이번 달 총 예산 (월급)</label>
            <input style={styles.input} type="number" placeholder="예: 1000000" value={budgetTotal} onChange={e=>setBudgetTotal(e.target.value)} />
            
            <label style={styles.label}>고정 지출 (숨만 쉬어도 나가는 돈)</label>
            <input style={styles.input} type="number" placeholder="예: 300000" value={fixedCost} onChange={e=>setFixedCost(e.target.value)} />
          </div>
        )}

        {/* STEP 2: 환경 변수 (Luna) */}
        {step === 2 && (
          <div style={styles.form}>
            <p style={styles.desc}>
              여성의 신체 주기는 던전의 난이도(PMS/REST)를 결정합니다.<br/>
              (민감한 정보는 기기에만 저장됩니다.)
            </p>
            <label style={styles.label}>다음 시작 예정일</label>
            <input style={styles.input} type="date" value={periodDate} onChange={e=>setPeriodDate(e.target.value)} />
          </div>
        )}

        {/* STEP 3: 직업 선택 */}
        {step === 3 && (
          <div style={styles.form}>
            <label style={styles.label}>직업을 선택하세요</label>
            <div style={styles.jobGrid}>
              {[
                { id: CLASS_TYPES.GUARDIAN, icon: '🛡️', name: '수호자', desc: '방어 특화. 소액 지출을 막아냅니다.' },
                { id: CLASS_TYPES.SAGE, icon: '🔮', name: '현자', desc: '기록 특화. 실수를 되돌릴 수 있습니다.' },
                { id: CLASS_TYPES.ALCHEMIST, icon: '💰', name: '연금술사', desc: '자산 특화. 쓰레기를 돈으로 바꿉니다.' },
                { id: CLASS_TYPES.DRUID, icon: '🌿', name: '드루이드', desc: '회복 특화. 휴식기에 더 많이 회복합니다.' },
              ].map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job.id as ClassType)}
                  style={{...styles.jobCard, borderColor: selectedJob === job.id ? '#8b5cf6' : '#374151'}}
                >
                  <div style={{fontSize:'20px'}}>{job.icon} {job.name}</div>
                  <div style={{fontSize:'10px', color:'#9ca3af', marginTop:'4px'}}>{job.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.footer}>
          {step < 3 ? (
            <button onClick={handleNext} style={styles.btnNext}>다음</button>
          ) : (
            <button onClick={handleSubmit} style={styles.btnComplete}>입장하기</button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', maxWidth: '380px', backgroundColor: '#111827', padding: '24px', borderRadius: '16px', color: '#f3f4f6' },
  title: { fontSize: '18px', textAlign: 'center', marginBottom: '24px', color: '#c084fc' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '16px' },
  desc: { fontSize: '12px', color: '#6b7280', lineHeight: 1.5, marginBottom: '10px' },
  jobGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  jobCard: { padding: '12px', borderRadius: '8px', border: '2px solid', backgroundColor: '#1f2937', cursor: 'pointer' },
  footer: { marginTop: '30px' },
  btnNext: { width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#374151', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  btnComplete: { width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#8b5cf6', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
};
