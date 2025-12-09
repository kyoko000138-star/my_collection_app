// src/components/money/NoSpendBoard.tsx
import React, { useMemo } from 'react';

interface DayStatus {
  day: number;          // 1 ~ 31
  isNoSpend: boolean;   // 무지출이면 true
}

interface NoSpendBoardProps {
  year: number;         // 2025
  month: number;        // 1~12 (JS Date 기준: 1월=1)
  dayStatuses?: DayStatus[];
}

const NoSpendBoard: React.FC<NoSpendBoardProps> = ({
  year,
  month,
  dayStatuses = [],
}) => {
  const { daysInMonth, dayMap, currentCombo, maxCombo } = useMemo(() => {
    // 이번 달 일수 계산
    const daysInMonth = new Date(year, month, 0).getDate();

    // day → isNoSpend 맵
    const dayMap = new Map<number, boolean>();
    dayStatuses.forEach((d) => {
      if (d.day >= 1 && d.day <= daysInMonth) {
        dayMap.set(d.day, !!d.isNoSpend);
      }
    });

    // 콤보 계산
    let currentCombo = 0;
    let maxCombo = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const isNoSpend = dayMap.get(d) === true;
      if (isNoSpend) {
        currentCombo += 1;
        if (currentCombo > maxCombo) maxCombo = currentCombo;
      } else {
        currentCombo = 0;
      }
    }

    return { daysInMonth, dayMap, currentCombo, maxCombo };
  }, [year, month, dayStatuses]);

  const titleText = `${year}. ${month.toString().padStart(2, '0')} 무지출 보드`;

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 16,
        border: '1px solid #e5e5e5',
        backgroundColor: '#ffffff',
        fontSize: 13,
        color: '#555',
        marginBottom: 24,
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
        NO-SPEND CHALLENGE
      </div>
      <div style={{ fontSize: 15, marginBottom: 6, color: '#333' }}>{titleText}</div>

      {/* 콤보 / 최고 기록 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 10,
          fontSize: 12,
          color: '#8b7760',
        }}
      >
        <span>현재 콤보: <strong>{currentCombo}</strong>일 연속</span>
        <span>최고 기록: <strong>{maxCombo}</strong>일</span>
      </div>

      {/* 날짜 보드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          marginTop: 6,
        }}
      >
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isNoSpend = dayMap.get(day) === true;
          const hasData = dayMap.has(day);

          // 상태 표시:
          // ○ = 무지출 / ● = 지출 있음 / – = 아직 미기록
          let symbol = '–';
          let bg = '#f7f7f7';
          let color = '#999';

          if (hasData) {
            if (isNoSpend) {
              symbol = '○';
              bg = '#e6f4ea';
              color = '#2f6b3c';
            } else {
              symbol = '●';
              bg = '#fbe9e9';
              color = '#b04343';
            }
          }

          return (
            <div
              key={day}
              style={{
                borderRadius: 8,
                border: '1px solid #e1e1e1',
                padding: '4px 0',
                textAlign: 'center',
                backgroundColor: bg,
                fontSize: 11,
              }}
            >
              <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>
                {day}
              </div>
              <div style={{ fontSize: 14, color }}>{symbol}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: '#999',
        }}
      >
        ○ 무지출 / ● 지출 있음 / – 아직 미기록
      </div>
    </div>
  );
};

export default NoSpendBoard;
