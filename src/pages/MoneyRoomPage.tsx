// src/pages/MoneyRoomPage.tsx
import React from 'react';
import MoneyStats from '../components/money/MoneyStats';
import CollectionBar from '../components/money/CollectionBar';

const MoneyRoomPage: React.FC = () => {
  // TODO: 여기 나중에 Firestore에서 진짜 데이터 가져오기
  const dummyMonthlyBudget = {
    year: 2025,
    month: 12,
    variableBudget: 800000,
    fixedExpenses: 400000,
    totalIncome: 2450000,
    noSpendTarget: 10,
  };

  const dummyTransactions: any[] = []; // 일단 빈 배열
  const dummyDayStatuses: any[] = [];
  const dummyInstallments: any[] = [];

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '16px 16px 40px',
        fontFamily: "'Noto Sans KR', system-ui",
      }}
    >
      <header style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#b59a7a',
            marginBottom: 4,
          }}
        >
          MY COLLECTION
        </div>
        <h1 style={{ fontSize: 20, color: '#5a4633', margin: 0 }}>
          이번 달 머니룸
        </h1>
        <p style={{ fontSize: 13, color: '#8b7760', marginTop: 6 }}>
          이번 달 돈의 흐름을 조용히 관찰하고, 작은 게임처럼 기록해 보는 공간입니다.
        </p>
      </header>

      <MoneyStats
        monthlyBudget={dummyMonthlyBudget as any}
        transactions={dummyTransactions}
        dayStatuses={dummyDayStatuses}
        installments={dummyInstallments}
      />

      <CollectionBar
        transactions={dummyTransactions}
        dayStatuses={dummyDayStatuses}
        installments={dummyInstallments}
      />

      {/* 나중에 여기에
          <MoneyMonsterCard />
          <MoneyWeaponSynthesis />
          <NoSpendBoard />
          <DailyQuestBox />
         이런 식으로 붙이면 됨 */}
    </div>
  );
};

export default MoneyRoomPage;
