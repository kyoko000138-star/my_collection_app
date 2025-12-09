// src/components/money/MoneyQuestCard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Scroll, CheckCircle2, Circle, Star, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MoneyQuestCardProps {
  isNoSpendToday: boolean; // 👈 외부에서 받아온 무지출 여부
  hasTxToday: boolean;     // 👈 외부에서 받아온 기록 여부
}

type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

interface Quest {
  id: string;
  title: string;
  desc: string;
  difficulty: Difficulty;
  reward: number;
  type: 'auto' | 'manual'; // 자동완료인지 수동인지 구분
}

// 퀘스트 목록
const QUEST_POOL: Quest[] = [
  { id: 'q_nospend', title: '무지출의 맹세', desc: '달력에 무지출 도장을 찍으세요 (자동)', difficulty: 'HARD', reward: 5, type: 'auto' },
  { id: 'q_record', title: '기록의 시작', desc: '가계부를 1건 이상 작성하세요 (자동)', difficulty: 'EASY', reward: 2, type: 'auto' },
  { id: 'q_fridge', title: '냉장고 파먹기', desc: '배달 대신 냉장고 재료 쓰기', difficulty: 'NORMAL', reward: 3, type: 'manual' },
  { id: 'q_clean', title: '지출 봉인', desc: '오후 6시 이후 지출 안 하기', difficulty: 'NORMAL', reward: 3, type: 'manual' },
  { id: 'q_coin', title: '잔돈 저금', desc: '오늘 남은 예산 끝자리 저금하기', difficulty: 'EASY', reward: 1, type: 'manual' },
];

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: '#e6f4ea', text: '#1e8e3e', border: '#ceead6' },
  NORMAL: { bg: '#e8f0fe', text: '#1967d2', border: '#d2e3fc' },
  HARD: { bg: '#fce8e6', text: '#d93025', border: '#fad2cf' },
};

const MoneyQuestCard: React.FC<MoneyQuestCardProps> = ({ isNoSpendToday, hasTxToday }) => {
  const [manualCompleted, setManualCompleted] = useState<string[]>([]);

  // 오늘 날짜 시드로 퀘스트 3개 뽑기 (고정)
  const todaysQuests = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const seed = todayStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // 무조건 q_nospend, q_record는 포함하고, 나머지 1개를 랜덤으로
    const manuals = QUEST_POOL.filter(q => q.type === 'manual');
    const randomManual = manuals[seed % manuals.length];
    
    return [QUEST_POOL[0], QUEST_POOL[1], randomManual];
  }, []);

  // 퀘스트 클릭 핸들러
  const handleQuestClick = (quest: Quest) => {
    // 자동 퀘스트는 클릭으로 완료 불가
    if (quest.type === 'auto') {
      alert(quest.id === 'q_nospend' ? '아래 달력에서 "성공 체크"를 누르면 완료됩니다!' : '가계부를 입력하면 자동으로 완료됩니다!');
      return;
    }

    if (manualCompleted.includes(quest.id)) return; // 이미 완료됨

    // 수동 완료 처리
    setManualCompleted(prev => [...prev, quest.id]);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, colors: ['#ffd700'] });
  };

  return (
    <div style={{
      padding: '20px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #ddd',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ padding: 8, backgroundColor: '#f4f1ea', borderRadius: '8px', border: '1px solid #e0d5c2' }}>
          <Scroll size={18} color="#8b7760" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#3f3428' }}>모험가 길드 의뢰</div>
          <div style={{ fontSize: 11, color: '#999' }}>시스템 연동 퀘스트 가동 중</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {todaysQuests.map((quest) => {
          // 완료 여부 판단 (자동 vs 수동)
          let isDone = false;
          if (quest.id === 'q_nospend') isDone = isNoSpendToday;
          else if (quest.id === 'q_record') isDone = hasTxToday;
          else isDone = manualCompleted.includes(quest.id);

          const style = DIFFICULTY_COLORS[quest.difficulty];

          return (
            <div 
              key={quest.id}
              onClick={() => handleQuestClick(quest)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px', borderRadius: '12px',
                border: isDone ? '1px solid #eee' : `1px solid ${style.border}`,
                backgroundColor: isDone ? '#fafafa' : '#fff',
                cursor: 'pointer',
                opacity: isDone ? 0.6 : 1,
              }}
            >
              <div style={{ color: isDone ? '#ccc' : style.text }}>
                {isDone ? <CheckCircle2 size={20} /> : (quest.type === 'auto' ? <Lock size={16} /> : <Circle size={20} />)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 9, fontWeight: 'bold', padding: '2px 6px', borderRadius: 4, backgroundColor: style.bg, color: style.text }}>
                    {quest.difficulty}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 'bold', color: isDone ? '#aaa' : '#333', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {quest.title}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {quest.desc} {quest.type === 'auto' && <span style={{color: '#ff6b6b'}}>(자동)</span>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: isDone ? '#eee' : '#fff8c4', padding: '4px 8px', borderRadius: '8px', minWidth: '40px' }}>
                <Star size={12} color={isDone ? '#999' : '#fbc02d'} fill={isDone ? '#999' : '#fbc02d'} />
                <span style={{ fontSize: 10, fontWeight: 'bold', color: isDone ? '#999' : '#f57f17' }}>+{quest.reward}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoneyQuestCard;
