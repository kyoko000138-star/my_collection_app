import React, { useEffect, useState } from 'react';
import { Play, Coffee, PartyPopper, Ghost, RotateCcw, ExternalLink } from 'lucide-react';

type RandomItemType = 'video' | 'cleaning' | 'checklist' | 'activity';

interface RandomItem {
  type: RandomItemType;
  title: string;
  link?: string;        // video only
  duration?: number;    // cleaning only (seconds)
  subtitle?: string;    // optional sub text
}

// --- 공통 스타일 ---
const headerLabel: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#b59a7a',
  marginBottom: 4,
};

const pageTitle: React.CSSProperties = {
  fontSize: '20px',
  lineHeight: 1.5,
  marginBottom: 6,
  color: '#3e3326',
};

const pageSubtitle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8a7b68',
  marginBottom: 20,
};

const sectionLabel: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#c1b29b',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 500,
  color: '#3e3326',
};

const smallText: React.CSSProperties = {
  fontSize: '11px',
  color: '#b2a495',
};

const card: React.CSSProperties = {
  borderRadius: 18,
  background: '#fdfbf7',
  border: '1px solid rgba(0,0,0,0.04)',
  boxShadow: '0 10px 22px rgba(0,0,0,0.04)',
  padding: 18,
};

const resultCard: React.CSSProperties = {
  ...card,
  marginTop: 18,
  paddingTop: 16,
  paddingBottom: 16,
};

const modeButton = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '14px 12px',
  borderRadius: 16,
  border: active ? '1px solid #3f312b' : '1px solid rgba(0,0,0,0.06)',
  background: active ? '#3f312b' : '#fdfbf7',
  color: active ? '#fdfbf7' : '#5c4a3a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  cursor: 'pointer',
  boxShadow: active
    ? '0 12px 26px rgba(0,0,0,0.18)'
    : '0 6px 12px rgba(0,0,0,0.05)',
  transition: 'all 0.18s ease-out',
});

const primaryPillButton = (active: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '7px 14px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.06)',
  background: active ? '#35a36a' : '#f7f3ec',
  color: active ? '#fff' : '#7f7261',
  fontSize: '11px',
  fontWeight: 500,
  cursor: 'pointer',
  boxShadow: active ? '0 8px 16px rgba(53,163,106,0.35)' : 'none',
  transition: 'all 0.16s ease-out',
});

const secondaryGhostButton: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.06)',
  background: '#f7f3ec',
  color: '#7f7261',
  fontSize: '11px',
  cursor: 'pointer',
};

// --- 유튜브 ID 추출 ---
const getYouTubeId = (url?: string | null) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// --- 라운지용 프리셋 데이터 (영상 + 활동) ---
const PRESET_ITEMS: RandomItem[] = [
  // --- 영상 (다도 - 우라센케) ---
  { type: 'video', title: '우라센케 다도 稽古1', link: 'https://youtu.be/HEeAlmN9-BU' },
  { type: 'video', title: '우라센케 다도 시연 (Hakone Gardens)', link: 'https://www.youtube.com/watch?v=mCM6l1r1SqQ' },
  { type: 'video', title: '우라센케 하코비 코이차 (Ro)', link: 'https://www.youtube.com/watch?v=YuZyuiH_Ux8' },
  { type: 'video', title: '기본 우수차(Usucha) 점법', link: 'https://www.youtube.com/watch?v=F30VEwiD838' },
  { type: 'video', title: '일본 전통 다도 (Japan Tradition)', link: 'https://www.youtube.com/watch?v=VfwXse1XHdc' },
  { type: 'video', title: '우라센케 류레이 스타일 오테마에', link: 'https://www.youtube.com/watch?v=jOAdDH-es9Q' },
  { type: 'video', title: '우라센케 다도 시연 (Nikka Yuko)', link: 'https://www.youtube.com/watch?v=0MOZYVy1hKE' },
  { type: 'video', title: '우라센케 탄코카이 다도', link: 'https://www.youtube.com/watch?v=mB7bNYU-GSc' },
  { type: 'video', title: '하코비 우수차 타나', link: 'https://www.youtube.com/watch?v=ijHTLQfpRMI' },
  { type: 'video', title: '우라센케 다도 稽古2', link: 'https://youtu.be/WcO566qc50M' },
  { type: 'video', title: '우라센케 다도 稽古3', link: 'https://youtu.be/n6uNT8wzUfw' },
  { type: 'video', title: '우라센케 다도 稽古4', link: 'https://youtu.be/zinHduNbqKw' },
  { type: 'video', title: '우라센케 다도 稽古5', link: 'https://youtu.be/vfFC0PNUXCE' },
  { type: 'video', title: '우라센케 다도 稽古6', link: 'https://youtu.be/sDtQIw68chc' },
  { type: 'video', title: '우라센케 다도 稽古7', link: 'https://youtu.be/YX2YEnYILik' },
  { type: 'video', title: '우라센케 다도 稽古8', link: 'https://youtu.be/B8CGKZN5BpQ' },
  { type: 'video', title: '우라센케 다도 稽古9', link: 'https://youtu.be/1vsNNYBoAeU' },
  { type: 'video', title: '우라센케 다도 稽古10', link: 'https://youtu.be/8meDo5T06xc' },
  { type: 'video', title: '우라센케 다도 稽古11', link: 'https://youtu.be/9V5NvzzhwY8' },
  { type: 'video', title: '우라센케 다도 稽古12', link: 'https://youtu.be/fq96VlhOEM0' },
  { type: 'video', title: '우라센케 다도 稽古13', link: 'https://youtu.be/7dIdhXpQBtg' },
  { type: 'video', title: '우라센케 다도 稽古14', link: 'https://youtu.be/L9m92yGDAzI' },
  { type: 'video', title: '우라센케 다도 稽古15', link: 'https://youtu.be/KXuOGC6EHPI' },
  { type: 'video', title: '우라센케 다도 稽古16', link: 'https://youtu.be/-pEmxqq9uQA' },
  { type: 'video', title: '우라센케 다도 稽古17', link: 'https://youtu.be/aaRzylsZDJY' },
  { type: 'video', title: '우라센케 다도 稽古18', link: 'https://youtu.be/ma3mb98_-aE' },
  { type: 'video', title: '우라센케 다도 稽古19', link: 'https://youtu.be/b6tftDHVCfs' },
  { type: 'video', title: '우라센케 다도 稽古20', link: 'https://youtu.be/ZiN5yGh9gIg' },

  // --- 영상 (향도 - 시노류) ---
  { type: 'video', title: '시노류 향도1', link: 'https://youtu.be/OTM1qojHqe4' },
  { type: 'video', title: '시노류 향도: 우아함의 도구', link: 'https://www.youtube.com/watch?v=ssxbkc8sUcA' },
  { type: 'video', title: '시노류 향도: 쿠미코(조향) 연습', link: 'https://www.youtube.com/watch?v=TXJG0mgxE4M' },
  { type: 'video', title: '시노류 향도: 전통과 현대', link: 'https://www.youtube.com/watch?v=nCIOlN87HIM' },
  { type: 'video', title: '향 공양 의식 (Suma-dera)', link: 'https://www.youtube.com/watch?v=xTApRqpS8uU' },
  { type: 'video', title: '향의 세계 탐구', link: 'https://www.youtube.com/watch?v=jcOLFZLCTLw' },
  { type: 'video', title: '시노류 향도2', link: 'https://youtu.be/TXJG0mgxE4M' },
  { type: 'video', title: '시노류 향도3', link: 'https://youtu.be/X63p18uMbjQ' },

  // --- 영상 (걸어서 세계속으로 – 여러 지역) ---
  { type: 'video', title: '걸어서 세계속으로: 천년 고도 교토', link: 'https://www.youtube.com/watch?v=xd8p3iM3GzY' },
  { type: 'video', title: '걸어서 세계속으로: 료안사 정원', link: 'https://www.youtube.com/watch?v=ciEMobB0qwc' },
  { type: 'video', title: '걸어서 세계속으로: 벨기에 여행', link: 'https://www.youtube.com/watch?v=IIJtrkr9X_I' },
  { type: 'video', title: '걸어서 세계속으로: 미국 보스턴의 가을', link: 'https://www.youtube.com/watch?v=mN-kCMANiC8' },
  { type: 'video', title: '걸어서 세계속으로: 체코 여행', link: 'https://www.youtube.com/watch?v=IjBoqWAeLYo' },

  // --- 활동 / 집안일 / 휴식 ---
  {
    type: 'cleaning',
    title: '15분 집중 청소/정리',
    duration: 15 * 60,
    subtitle: '집 안 한 구역만 가볍게 비우는 시간',
  },
  {
    type: 'cleaning',
    title: '30분 집중 청소/정리',
    duration: 30 * 60,
    subtitle: '조금 큰 구역까지 한 번에 정리',
  },
  {
    type: 'cleaning',
    title: '낮잠 자기',
    duration: 30 * 60,
    subtitle: '알람 맞추고 부담 없이 눕기',
  },
  { type: 'activity', title: '수납장 청소/정리' },
  { type: 'activity', title: '문향(聞香)' },
  { type: 'activity', title: '차 한 잔 마시기' },
  { type: 'activity', title: '집 전체 환기 하기' },
  {
    type: 'activity',
    title: '화분 돌보기',
    subtitle: '물주기 · 잎 정리 · 흙 상태 살피기',
  },
  { type: 'activity', title: '시후쿠(仕覆) 만들기' },
];

// --- 타이머 컴포넌트 (청소용) ---
function CleaningTimer({ initialTime }: { initialTime: number }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      return;
    }
    const id = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, timeLeft]);

  const mins = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div
      style={{
        marginTop: 10,
        padding: '10px 12px',
        borderRadius: 12,
        background: '#f7f3ec',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 18,
          fontWeight: 600,
          color: '#3e3326',
        }}
      >
        {mins}:{secs}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            setRunning((prev) => !prev);
          }}
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            border: 'none',
            background: '#3f312b',
            color: '#fff',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          {running ? '일시 정지' : '시작'}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setTimeLeft(initialTime);
          }}
          style={{
            padding: '6px 8px',
            borderRadius: 999,
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#fdfbf7',
            color: '#7f7261',
            fontSize: 11,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <RotateCcw size={13} />
          리셋
        </button>
      </div>
    </div>
  );
}

// --- 메인 라운지 페이지 ---
function LoungePage() {
  const [mode, setMode] = useState<'video' | 'activity'>('video');
  const [randomItem, setRandomItem] = useState<RandomItem | null>(null);
  const [isActivityDone, setIsActivityDone] = useState(false);

  const pickRandom = (nextMode: 'video' | 'activity') => {
    const pool =
      nextMode === 'video'
        ? PRESET_ITEMS.filter((i) => i.type === 'video')
        : PRESET_ITEMS.filter((i) => i.type !== 'video');
    if (pool.length === 0) return;
    const idx = Math.floor(Math.random() * pool.length);
    setRandomItem(pool[idx]);
    setIsActivityDone(false);
  };

  useEffect(() => {
    pickRandom(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const renderResultBody = () => {
    if (!randomItem) {
      return (
        <div
          style={{
            padding: 20,
            borderRadius: 14,
            border: '1px dashed rgba(0,0,0,0.06)',
            background: '#fbf8f3',
            textAlign: 'center',
            color: '#c0b3a1',
            fontSize: 12,
          }}
        >
          왼쪽에서 모드를 선택하면 오늘의 작은 영상/활동을 뽑아 드릴게요.
        </div>
      );
    }

    // 영상 모드
    if (randomItem.type === 'video') {
      const videoId = getYouTubeId(randomItem.link);
      return (
        <div>
          <div style={sectionLabel}>오늘의 영상</div>
          <div
            style={{
              ...sectionTitle,
              marginTop: 4,
              marginBottom: 10,
            }}
          >
            {randomItem.title}
          </div>
          {videoId ? (
            <div
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                background: '#000',
                aspectRatio: '16 / 9',
              }}
            >
              <iframe
                title={randomItem.title}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            randomItem.link && (
              <a
                href={randomItem.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...secondaryGhostButton,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 6,
                }}
              >
                유튜브에서 보기
                <ExternalLink size={13} />
              </a>
            )
          )}
        </div>
      );
    }

    // --- 활동 / 청소 / 시후쿠 등 : 중앙 정렬 ---
    const showTimer = randomItem.type === 'cleaning';

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={sectionLabel}>오늘의 작은 활동</div>
        <div
          style={{
            ...sectionTitle,
            marginTop: 6,
            marginBottom: randomItem.subtitle ? 6 : 10,
          }}
        >
          {randomItem.title}
        </div>
        {randomItem.subtitle && (
          <div style={{ ...smallText, marginBottom: showTimer ? 6 : 14 }}>
            {randomItem.subtitle}
          </div>
        )}
        {showTimer && (
          <div style={{ maxWidth: 280, margin: '0 auto 12px' }}>
            <CleaningTimer initialTime={randomItem.duration ?? 15 * 60} />
          </div>
        )}
        <button
          type="button"
          style={primaryPillButton(isActivityDone)}
          onClick={() => setIsActivityDone((prev) => !prev)}
        >
          {isActivityDone ? (
            <>
              <PartyPopper size={14} />
              했다!! 😆
            </>
          ) : (
            <>
              <Ghost size={14} />
              아직 안했음 👀
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div>
      <div style={headerLabel}>ROOM VII · LOUNGE</div>
      <div style={pageTitle}>라운지</div>
      <div style={pageSubtitle}>
        다도 영상과 작은 집안일, 아주 가벼운 휴식을 뽑아 보는 방
      </div>

      {/* 모드 선택 카드 */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 4,
        }}
      >
        <button
          type="button"
          style={modeButton(mode === 'video')}
          onClick={() => setMode('video')}
        >
          <Play size={18} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>영상 보기</span>
          <span style={{ fontSize: 10, opacity: 0.7 }}>다도·향도·여행 콘텐츠</span>
        </button>
        <button
          type="button"
          style={modeButton(mode === 'activity')}
          onClick={() => setMode('activity')}
        >
          <Coffee size={18} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>활동 하기</span>
          <span style={{ fontSize: 10, opacity: 0.7 }}>청소·문향·티타임 등</span>
        </button>
      </div>

      {/* 결과 카드 */}
      <div style={resultCard}>{renderResultBody()}</div>

      {/* 다시 뽑기 */}
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ ...smallText, fontSize: 10 }}>
          마음에 안 들면 언제든 다시 뽑기 가능.
        </div>
        <button
          type="button"
          style={secondaryGhostButton}
          onClick={() => pickRandom(mode)}
        >
          다시 뽑기
        </button>
      </div>
    </div>
  );
}

export default LoungePage;
