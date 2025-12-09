import React, { useMemo } from 'react';
import { Shield, Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { calcNoSpendComboWithShield } from '../../money/moneyGameLogic';
import type { LunaMode } from '../../money/moneyLuna';

interface DayStatus {
  day: number;
  isNoSpend: boolean;
  completedQuests?: number;
}

interface NoSpendBoardProps {
  dayStatuses: DayStatus[];
  lunaMode?: LunaMode; // 선택적 prop으로 처리 (기본값 normal)
  year?: number;
  month?: number;
}

const NoSpendBoard: React.FC<NoSpendBoardProps> = ({ 
  dayStatuses = [], 
  lunaMode = 'normal',
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1
}) => {
  
  // 1. 콤보 및 실드 계산 (Luna 모드 적용)
  const { combo, shieldUsed } = useMemo(
    () => calcNoSpendComboWithShield(dayStatuses, lunaMode),
    [dayStatuses, lunaMode]
  );

  // 2. 달력 생성을 위한 데이터
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0: 일요일
  
  // 달력 그리드 생성 (빈 칸 + 날짜)
  const calendarGrid = useMemo(() => {
    const grid = [];
    // 앞쪽 빈 칸
    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }
    // 날짜 채우기
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push(d);
    }
    return grid;
  }, [year, month, firstDay, daysInMonth]);

  // 오늘 날짜
  const todayDate = new Date().getDate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* --- 상단: 콤보 & 실드 정보 (RPG 요소) --- */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: 16,
          border: '1px solid #e5e5e5',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarIcon size={14} color="#8b7760" />
            <span style={{ fontSize: 11, color: '#7a6a55', fontWeight: 600 }}>
              무지출 연속 콤보
            </span>
          </div>
          <span style={{ fontSize: 18, color: '#3f3428', fontWeight: 'bold' }}>
            {combo}<span style={{fontSize:12, fontWeight:'normal', color:'#8b7760'}}>일</span>
          </span>
        </div>

        {/* 실드 사용 알림 */}
        {shieldUsed ? (
          <div
            style={{
              marginTop: 6,
              padding: '8px 10px',
              borderRadius: 8,
              backgroundColor: '#eff6ff', // 파란색 틴트
              border: '1px solid #dbeafe',
              color: '#1e40af',
              fontSize: 11,
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'start',
              gap: 6
            }}
          >
            <Shield size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <strong>Luna 실드 발동!</strong><br/>
              <span style={{ fontSize: 10, color: '#3b82f6' }}>
                몸이 힘든 시기라 한 번의 지출은 콤보를 끊지 않았어요.
              </span>
            </div>
          </div>
        ) : (
          combo > 0 && (
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>
              아주 잘 하고 있어요! 🔥
            </div>
          )
        )}
      </div>

      {/* --- 하단: 달력 그리드 (Visual) --- */}
      <div style={{ padding: '4px' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#555', textAlign: 'center' }}>
          {month}월의 기록
        </div>
        
        {/* 요일 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div key={day} style={{ textAlign: 'center', fontSize: 10, color: i === 0 ? '#ff6b6b' : '#888' }}>
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 8 }}>
          {calendarGrid.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            
            const status = dayStatuses.find(s => s.day === day);
            const isNoSpend = status?.isNoSpend;
            const isToday = day === todayDate;

            return (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div 
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10,
                    backgroundColor: isToday ? '#333' : 'transparent',
                    color: isToday ? '#fff' : '#333',
                    border: isToday ? 'none' : '1px solid transparent'
                  }}
                >
                  {day}
                </div>
                {/* 성공/실패 마커 */}
                {day <= todayDate && (
                  <div style={{ height: 12 }}>
                    {isNoSpend ? (
                      <Check size={12} color="#4caf50" strokeWidth={3} />
                    ) : (
                      // 지출이 있었던 날 (데이터가 명시적으로 없거나 false면 X)
                      // 단, 미래 날짜는 표시 안 함 (위 조건 day <= todayDate 덕분)
                      // 오늘인데 아직 기록 없으면? (status undefined) -> 표시 안함
                      status ? <X size={12} color="#ddd" /> : null
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default NoSpendBoard;
