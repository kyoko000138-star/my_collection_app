// src/components/money/MoneyStats.tsx
import React from 'react';
import { Activity, Brain, Shield } from 'lucide-react';

interface MoneyStatsProps {
  monthlyBudget?: any;
  transactions?: any[];
  dayStatuses?: any[];
  installments?: any[];
}

const MoneyStats: React.FC<MoneyStatsProps> = () => {
  // ❗️일단은 고정값으로만 표시 (calcHP / calcMP / calcDEF 전혀 사용 X)
  const hp = 0;
  const mp = 0;
  const def = 0;

  return (
    <div
      style={{
        padding: '16px 18px',
        borderRadius: '16px',
        border: '1px solid #e5e5e5',
        backgroundColor: '#f9f5ee',
        fontSize: 13,
        color: '#555',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#b59a7a',
          marginBottom: 6,
        }}
      >
        MONEY STATUS
      </div>
      <div style={{ fontSize: 18, marginBottom: 8, color: '#333' }}>
        이번 달 머니 스탯
      </div>

      <StatRow icon={<Activity size={16} />} label="HP (생활비 체력)" value={hp} max={100} />
      <StatRow icon={<Brain size={16} />} label="MP (무지출 포인트)" value={mp} max={10} />
      <StatRow icon={<Shield size={16} />} label="DEF (할부 방어도)" value={def} max={100} />
    </div>
  );
};

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, value, max }) => {
  const ratio = Math.max(0, Math.min(1, max ? value / max : 0));

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 6 }}>
        {icon}
        <span style={{ fontSize: 13, color: '#6f5a45' }}>{label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8b7760' }}>
          {value} / {max}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 999,
          background: '#e6ddcf',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: '100%',
            background: '#c29b5a',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

export default MoneyStats;
