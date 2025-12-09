// src/components/money/MoneyQuestCard.tsx
import React, { useState, useMemo } from 'react';
import { Scroll, CheckCircle2, Circle, Trophy, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── 퀘스트 데이터 (나중에 파일로 분리 가능) ───
type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

interface Quest {
  id: string;
  title: string;
  desc: string;
  difficulty: Difficulty;
  reward: number; // Leaf 포인트
}

const QUEST_POOL: Quest[] = [
  { id: 'q1', title: '무지출의 맹세', desc: '오늘 하루, 1원도 쓰지 않고 버티기', difficulty: 'HARD', reward: 5 },
  { id: 'q2', title: '냉장고 파먹기', desc: '배달앱을 켜는 대신 냉장고를 여세요', difficulty: 'NORMAL', reward: 3 },
  { id: 'q3', title: '기록의 시작', desc: '오늘 발생한 지출을 1건이라도 기록하기', difficulty: 'EASY', reward: 1 },
  { id: 'q4', title: '지출 봉인', desc: '오후 6시 이후로 지출하지 않기', difficulty: 'NORMAL', reward: 3 },
  { id: 'q5', title: '잔돈 저금', desc: '오늘 남은 예산의 끝자리를 저금통에 넣기', difficulty: 'EASY', reward: 1 },
];

// 난이도별 색상 설정
const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  EASY: { bg: '#e6f4ea', text: '#1e8e3e', border: '#ceead6' },
  NORMAL: { bg: '#e8f0fe', text: '#1967d2', border: '#d2e3fc' },
  HARD: { bg: '#fce8e6', text: '#d93025', border: '#fad2cf' },
};

const MoneyQuestCard: React.FC = () => {
  // 오늘 날짜 기준으로 랜덤하게 3개 뽑기 (새로고침해도 유지되도록 날짜 시드 사용)
  const todaysQuests = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const seed = todayStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // 간단한 셔플
    const shuffled = [...QUEST_POOL].sort((a, b) => {
      const hashA = (seed + a.id.charCodeAt(1)) % 100;
      const hashB = (seed + b.id.charCodeAt(1)) % 100;
      return hashA - hashB;
    });
    return shuffled.slice(0, 3); // 3개만 노출
  }, []);

  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const handleQuestClick = (id: string, reward: number) => {
    if (completedIds.includes(id)) return; // 이미 완료했으면 무시

    // 완료 처리
    setCompletedIds(prev => [...prev, id]);

    // 🎉 폭죽 효과 (보상 크기에 따라 다르게!)
    const particleCount = reward * 15;
    confetti({
      particleCount,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ffd700', '#ffeb3b', '#ffffff'] // 금색 위주
    });
  };

  // 진행률 계산
  const progress = Math.round((completedIds.length / todaysQuests.length) * 100);

  return (
    <div style={{
      padding: '20px', borderRadius: '20px', backgroundColor: '#fff', border: '1px solid #ddd',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24,
      position: 'relative', overflow: 'hidden'
    }}>
      
      {/* 헤더: 길드 의뢰서 느낌 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: 8, backgroundColor: '#f4f1ea', borderRadius: '8px', border: '1px solid #e0d5c2' }}>
            <Scroll size={18} color="#8b7760" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#3f3428' }}>모험가 길드 의뢰</div>
            <div style={{ fontSize: 11, color: '#999' }}>오늘의 미션 {completedIds.length}/{todaysQuests.length}</div>
          </div>
        </div>
        {/* 진행률 게이지 */}
        <div style={{ width: 40, height: 40, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="4" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffd700" strokeWidth="4" strokeDasharray={`${progress}, 100`} />
          </svg>
          <span style={{ position: 'absolute', fontSize: '10px', fontWeight: 'bold', color: '#b59a7a' }}>{progress}%</span>
        </div>
      </div>

      {/* 퀘스트 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {todaysQuests.map((quest) => {
          const isDone = completedIds.includes(quest.id);
          const style = DIFFICULTY_COLORS[quest.difficulty];

          return (
            <div 
              key={quest.id}
              onClick={() => handleQuestClick(quest.id, quest.reward)}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px', borderRadius: '12px',
                border: isDone ? '1px solid #eee' : `1px solid ${style.border}`,
                backgroundColor: isDone ? '#fafafa' : '#fff',
                cursor: isDone ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isDone ? 0.6 : 1,
                transform: isDone ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {/* 왼쪽 체크박스 */}
              <div style={{ color: isDone ? '#ccc' : style.text }}>
                {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>

              {/* 내용 */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  {/* 난이도 뱃지 */}
                  <span style={{ 
                    fontSize: 9, fontWeight: 'bold', padding: '2px 6px', borderRadius: 4,
                    backgroundColor: style.bg, color: style.text 
                  }}>
                    {quest.difficulty}
                  </span>
                  <span style={{ 
                    fontSize: 13, fontWeight: 'bold', 
                    color: isDone ? '#aaa' : '#333',
                    textDecoration: isDone ? 'line-through' : 'none'
                  }}>
                    {quest.title}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>{quest.desc}</div>
              </div>

              {/* 오른쪽 보상 */}
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                backgroundColor: isDone ? '#eee' : '#fff8c4', 
                padding: '4px 8px', borderRadius: '8px', minWidth: '40px'
              }}>
                <Star size={12} color={isDone ? '#999' : '#fbc02d'} fill={isDone ? '#999' : '#fbc02d'} />
                <span style={{ fontSize: 10, fontWeight: 'bold', color: isDone ? '#999' : '#f57f17' }}>+{quest.reward}</span>
              </div>

              {/* 완료 도장 (Absolute) */}
              {isDone && (
                <div className="fade-in" style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-10deg)',
                  border: '3px solid #ccc', borderRadius: '8px', padding: '4px 10px',
                  fontSize: '20px', fontWeight: '900', color: '#ccc', opacity: 0.4, pointerEvents: 'none'
                }}>
                  COMPLETED
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 팁 */}
      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 10, color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Trophy size={10} />
        <span>모든 의뢰를 완료하면 보너스 경험치가 지급됩니다. (준비중)</span>
      </div>

    </div>
  );
};

export default MoneyQuestCard;
