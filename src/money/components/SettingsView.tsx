// src/money/components/SettingsView.tsx

import React, { useState } from 'react';
import { UserState } from '../types';

interface Props {
  user: UserState;
  onSave: (updated: Partial<UserState>) => void;
  onBack: () => void;
}

export const SettingsView: React.FC<Props> = ({ user, onSave, onBack }) => {
  const [name, setName] = useState(user.name);
  const [cycleDate, setCycleDate] = useState(user.lunaCycle.startDate);

  const handleSave = () => {
    onSave({
      name,
      lunaCycle: { ...user.lunaCycle, startDate: cycleDate }
    });
    alert("설정이 저장되었습니다.");
    onBack();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚙️ 환경 설정</h2>
      
      <div style={styles.form}>
        <div style={styles.field}>
          <label>모험가 이름</label>
          <input value={name} onChange={e => setName(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label>최근 생리 시작일 (Luna)</label>
          <input type="date" value={cycleDate} onChange={e => setCycleDate(e.target.value)} style={styles.input} />
          <p style={styles.help}>* 주기를 수정하여 난이도를 조정합니다.</p>
        </div>

        <div style={styles.field}>
          <label>데이터 초기화</label>
          <button style={styles.resetBtn} onClick={() => {
            if(confirm("정말 모든 데이터를 삭제합니까?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}>🚨 데이터 삭제 (Reset)</button>
        </div>
      </div>

      <div style={styles.btnRow}>
        <button onClick={handleSave} style={styles.saveBtn}>저장</button>
        <button onClick={onBack} style={styles.cancelBtn}>취소</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', backgroundColor: '#1c1917', padding: '20px', color: '#fff' },
  title: { borderBottom: '2px solid #44403c', paddingBottom: '10px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { padding: '10px', backgroundColor: '#292524', border: '1px solid #57534e', color: '#fff', borderRadius: '6px' },
  help: { fontSize: '11px', color: '#a8a29e' },
  resetBtn: { padding: '10px', backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '30px' },
  saveBtn: { flex: 1, padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#44403c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};
