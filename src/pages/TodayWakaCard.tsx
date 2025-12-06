// src/pages/TodayWakaCard.tsx
import React, { useState, useEffect } from 'react';
import {
  getTodayWaka,
  isFavorite,
  toggleFavorite,
} from '../waka/wakaCalendarData';

const cardWrapper: React.CSSProperties = {
  borderRadius: '18px',
  border: '1px solid #e0d6c8',
  padding: '16px 18px',
  backgroundColor: '#fbf8f2',
  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
};

const headerRow: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: 10,   // 24 → 16 (조금 위로)
  paddingBottom: 6, // 12 → 6 (조금 붙게)
  flex: 'none',
};

const badge: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#b59a7a',
};

const title: React.CSSProperties = {
  fontSize: '17px',
  color: '#3e3326',
  marginBottom: '8px',
};




const metaRow: React.CSSProperties = {
  marginTop: '10px',
  fontSize: '11px',
  color: '#7b6a55',
};

const translationBlock: React.CSSProperties = {
  marginTop: '12px',
  paddingTop: '10px',
  borderTop: '1px dashed #e0d6c8',
};

const translationToggleButton: React.CSSProperties = {
  marginTop: '10px',
  fontSize: '12px',
  color: '#8b755d',
  background: 'transparent',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
};

const translationText: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: 1.7,
  color: '#4b3a2a',
  whiteSpace: 'pre-line',
  marginTop: '4px',
};

const favoriteButton: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '16px',
  lineHeight: 1,
  padding: 0,
  color: '#c08a6b',
};

const TodayWakaCard: React.FC = () => {
  const todayWaka = getTodayWaka();

  const [favorite, setFavorite] = useState(false);
  const [showDetail, setShowDetail] = useState(false); // 👈 추가

  // 오늘의 와카가 바뀔 때(나중에 날짜 기능 넣었을 때도 대비)
  useEffect(() => {
    setFavorite(isFavorite(todayWaka.id));
  }, [todayWaka.id]);

  const handleToggleFavorite = () => {
    const next = toggleFavorite(todayWaka.id);
    setFavorite(next);
  };

  return (
    <div style={cardWrapper}>
      <div style={headerRow}>
        <span style={badge}>TODAY'S WAKA</span>

        {/* 오른쪽: 날짜 + 하트 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '11px', color: '#a08f77' }}>
            {todayWaka.date.solarLabel}
          </span>
          <button
            type="button"
            style={favoriteButton}
            onClick={handleToggleFavorite}
            aria-label="즐겨찾기"
          >
            {favorite ? '♥' : '♡'}
          </button>
        </div>
      </div>

      <div style={title}>{todayWaka.date.seasonalLabel || '계절의 흐름'}</div>

      <div style={wakaText}>
        {todayWaka.content.original.right}
        {'\n'}
        {todayWaka.content.original.left}
      </div>

      <div style={metaRow}>
        {todayWaka.content.info.author} · {todayWaka.content.info.source}
      </div>
      {/* 해석/해설 토글 버튼 */}
      <button
        type="button"
        style={translationToggleButton}
        onClick={() => setShowDetail((prev) => !prev)}
      >
        {showDetail ? '해석·해설 닫기' : '해석·해설 보기'}
      </button>

      {/* 해석/해설 영역 */}
      {showDetail && (
        <div style={translationBlock}>
          <div style={translationText}>
            <strong>현대 일본어</strong>
            {'\n'}
            {todayWaka.content.translations.modernJapanese}
          </div>
          <div style={translationText}>
            <strong>한국어 해석</strong>
            {'\n'}
            {todayWaka.content.translations.korean}
          </div>
          <div style={translationText}>
            <strong>해설</strong>
            {'\n'}
            {todayWaka.content.commentary}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayWakaCard;
