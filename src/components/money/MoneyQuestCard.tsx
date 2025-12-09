// src/components/money/MoneyQuestCard.tsx
import React, { useMemo, useState } from 'react';
import { Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { getDailyMoneyQuests, MoneyQuest } from '../../money/moneyQuests';

const MoneyQuestCard: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const quests = useMemo<MoneyQuest[]>(() => {
    return getDailyMoneyQuests(today, 2); // 👉 오늘의 퀘스트 2개
  }, [today]);

  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const toggleQuest = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const dateLabel = `${today.getFullYear()}. ${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${today.getDate().toString().padStart(2, '0')}`;

  return (
    <div
      style={{
        padding: '14px 16px 16px',
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
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Sparkles size={14} />
        TODAY MONEY QUEST
      </div>
      <div style={{ fontSize: 14, marginBottom: 8, color: '#333' }}>
        {dateLabel}의 작은 퀘스트
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quests.map((q) => {
          const done = completedIds.includes(q.id);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => toggleQuest(q.id)}
              style={{
                textAlign: 'left',
                borderRadius: 12,
                border: '1px solid #e6e0d5',
                padding: '8px 10px',
                backgroundColor: done ? '#f0efe7' : '#fbfaf6',
                cursor: 'pointer',
                display: 'flex',
                gap: 8,
              }}
            >
              <div style={{ marginTop: 2 }}>
                {done ? (
                  <CheckCircle2 size={18} strokeWidth={1.7} color="#9c7a3e" />
                ) : (
                  <Circle size={18} strokeWidth={1.3} color="#c1b199" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: '#3f3428',
                    marginBottom: 2,
                  }}
                >
                  {q.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#8b7760',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {q.description}
                </div>
              </div>
            </button>
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
        체크는 지금 화면에서만 유지돼요. 나중에 원하면 Firestore에
        저장해서 “퀘스트 완료 수 → MP/Leaf 보너스”랑도 연결할 수 있어요.
      </div>
    </div>
  );
};

export default MoneyQuestCard;
