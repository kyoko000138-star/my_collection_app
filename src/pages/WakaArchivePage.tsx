import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  X,
  Moon,
  Sun,
  Cloud,
  ChevronLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  Wind,
  Droplets,
  Coffee,
} from 'lucide-react';

// ─── 폰트 & 기본 스타일 ───
const StyleHeader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Yuji+Syuku&family=Zen+Old+Mincho:wght@400;600&display=swap');

    :root {
      --font-kor: 'Gowun Batang', serif;
      --font-jp-calli: 'Yuji Syuku', serif;
      --font-jp-std: 'Zen Old Mincho', serif;
      --paper-color: #fffefc;
    }

    .vertical-text {
      writing-mode: vertical-rl;
      text-orientation: upright;
      font-feature-settings: "vhal" 1;
      white-space: nowrap;
    }

    .animate-slide-up {
      animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .fade-in {
      animation: fadeIn 1.2s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .texture-overlay {
      background-image: url("https://www.transparenttextures.com/patterns/cream-paper.png");
      opacity: 0.2;
      pointer-events: none;
    }

    .text-shadow-sm {
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  `}</style>
);

// ─── 사운드 시스템 ───
const getAmbientSound = (month: number) => {
  // 나중에 계절/시간대별로 바꾸고 싶으면 여기서 분기
  return 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_6858489857.mp3?filename=forest-wind-and-birds-6881.mp3';
};

// ─── 계절 배경 이미지 시스템 (시간대 없음 버전) ───
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

// public/waka-images 안의 실제 파일명 그대로
const SPRING_IMAGES = [
  'spring_1.jpg',
  'spring_2.jpg',
  'spring_3.jpg',
  'spring_4.jpg',
  'spring_5.jpg',
  'spring_6.jpg',
  'spring_7.jpg',
  'spring_8.jpg',
  'spring_9.jpg',
  'spring_10.jpg',
  'spring_11.jpg',
  'spring_12.jpg',
];

const SUMMER_IMAGES = [
  'summer (2).jpg',
  'summer (3).jpg',
  'summer (4).jpg',
  'summer (5).jpg',
  'summer (6).jpg',
  'summer (7).jpg',
  'summer (8).jpg',
  'summer (9).jpg',
  'summer (10).jpg',
  'summer (11).jpg',
  'summer (12).jpg',
  'summer (13).jpg',
  'summer (14).jpg',
  'summer (15).jpg',
  'summer (16).jpg',
  'summer (17).jpg',
  // 만약 폴더에 `summer (1).jpg` 도 있으면 여기 맨 위에 추가해줘!
];

const AUTUMN_IMAGES = [
  'autumn (1).jpg',
  'autumn (2).jpg',
  'autumn (3).jpg',
  'autumn (4).jpg',
  'autumn (5).jpg',
  'autumn (6).jpg',
  'autumn (7).jpg',
  'autumn (8).jpg',
  'autumn (9).jpg',
  'autumn (10).jpg',
  'autumn (11).jpg',
  'autumn (12).jpg',
  'autumn (13).jpg',
  'autumn (14).jpg',
  'autumn (15).jpg',
];

const WINTER_IMAGES = [
  'winnter (1).jpg',
  'winnter (2).jpg',
  'winnter (3).jpg',
  'winnter (4).jpg',
  'winnter (5).jpg',
  'winnter (6).jpg',
  'winnter (7).jpg',
  'winnter (8).jpg',
  'winnter (9).jpg',
  'winnter (10).jpg',
];

// 계절 → 이미지 목록 매핑 (시간대 없음)
const wakaImageMap: Record<Season, string[]> = {
  spring: SPRING_IMAGES,
  summer: SUMMER_IMAGES,
  autumn: AUTUMN_IMAGES,
  winter: WINTER_IMAGES,
};

// 이미 있는 getSeason 그대로 사용
function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

// 계절만 보고 랜덤으로 1장 선택
function getSeasonalImage(month: number, fallback?: string): string {
  const season = getSeason(month);
  const list = wakaImageMap[season];

  if (list && list.length > 0) {
    const idx = Math.floor(Math.random() * list.length);
    return `/waka-images/${list[idx]}`;
  }

  // 아무 것도 없으면 기본 이미지
  return fallback || '/waka-images/default.jpg';
}

// ─── 타입 ───
interface WakaEntry {
  id: string;
  date: {
    month: number;
    day: number;
    lunar: string;
    term?: string;
  };
  tags: string[];
  content: {
    right: string;
    left: string;
    hiragana: string;
    modern: string;
    author: string;
    source: string;
    korean: string;
    commentary: string;
  };
  media: {
    imageSrc: string;
  };
}

// ─── 샘플 데이터 ───
const sampleData: Record<string, WakaEntry> = {
  today: {
    id: '0101',
    date: { month: 1, day: 25, lunar: '12월 15일', term: '대한 후' },
    tags: ['#1월', '#설경', '#소나무'],
    content: {
      right: 'み山には 松の雪だに 消えなくに',
      left: '錦をるてふ 花見がてら',
      hiragana:
        'みやまには まつのゆきだに きえなくに\nにしきをるてふ はなみがてら',
      author: '紀貫之',
      source: '古今和歌集',
      modern:
        '奥深い山では、松に積もった雪さえまだ消えていないというのに、錦を織るというあの花見に出かけようとしているのですか。',
      korean:
        '깊은 산 소나무엔 눈도 채 녹지 않았는데\n비단 짜듯 곱다는 꽃구경을 가려 하는가',
      commentary:
        '아직 때가 무르익지 않았음을 경계하며, 들뜬 마음 대신 눈 덮인 산의 고요한 현실을 직시하게 하는 노래입니다.',
    },
    media: {
      imageSrc:
        'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=1000&auto=format&fit=crop',
    },
  },
  calm: {
    id: 'rec-calm',
    date: { month: 1, day: 26, lunar: '12월 16일', term: '입춘 전야' },
    tags: ['#고요', '#달', '#성찰'],
    content: {
      right: '大空の 月の光し きよければ',
      left: '影見し水ぞ まづこほりける',
      hiragana:
        'おおぞらの つきのひかりし きよければ\nかげみしみずぞ まずこおりける',
      author: '読み人知らず',
      source: '古今和歌集',
      modern:
        '大空の月の光があまりにも澄みきっているので、その姿を映していた水こそが真っ先に凍ってしまった。',
      korean:
        '드넓은 하늘의 달빛이 너무나 맑기에\n그 그림자를 비추던 물이 가장 먼저 얼어붙었구나',
      commentary:
        '차갑고 맑은 달빛의 아름다움과 혹독한 추위를 동시에 포착했습니다. 고요히 자신을 비추어보고 싶을 때 어울리는 노래입니다.',
    },
    media: {
      imageSrc:
        'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1000&auto=format&fit=crop',
    },
  },
  energy: {
    id: 'rec-energy',
    date: { month: 2, day: 4, lunar: '1월 1일', term: '입춘' },
    tags: ['#시작', '#물소리', '#생명력'],
    content: {
      right: '谷風に とくる氷の ひまごとに',
      left: '打ち出づる波や 春の初花',
      hiragana:
        'たにかぜに とくるこおりの ひまごとに\nうちいづるなみや はるのはつはな',
      author: '源当純',
      source: '古今和歌集',
      modern:
        '谷風に解けていく氷の隙間ごとにほとばしり出る波こそが、春の初めの花なのだろう。',
      korean:
        '골짜기 바람에 녹는 얼음 틈 사이마다\n솟구치는 물결이 마치 봄의 첫 꽃 같구나',
      commentary:
        '얼음이 풀리며 흐르는 물을 꽃에 비유했습니다. 정체된 상황이 풀리고 새로운 활력이 시작됨을 알리는 희망찬 노래입니다.',
    },
    media: {
      imageSrc:
        'https://images.unsplash.com/photo-1518090676098-2253eb945492?q=80&w=1000&auto=format&fit=crop',
    },
  },
  wait: {
    id: 'rec-wait',
    date: { month: 2, day: 10, lunar: '1월 7일', term: '우수 전' },
    tags: ['#기다림', '#매화', '#인내'],
    content: {
      right: '東風吹かば 匂ひおこせよ 梅の花',
      left: '主なしとて 春を忘るな',
      hiragana:
        'こちふかば においおこせよ うめのはな\nあるじなしとて はるをわするな',
      author: '菅原道真',
      source: '拾遺和歌集',
      modern:
        '東風が吹いたなら、その香りをこちらに届けておくれ、梅の花よ。主人がいないからといって、春を忘れてはならないぞ。',
      korean:
        '동풍이 불거든 그 향기를 내게 보내다오, 매화꽃이여.\n주인이 없다 하여 봄을 잊지 말아라.',
      commentary:
        '어떤 상황에서도 제 계절을 잊지 않고 꽃을 피우는 매화처럼, 묵묵히 때를 기다리는 마음을 노래했습니다.',
    },
    media: {
      imageSrc:
        'https://images.unsplash.com/photo-1516834474-48c0abc2a902?q=80&w=1000&auto=format&fit=crop',
    },
  },
};

// ─── 엽서형 와카 카드 ───
const WakaPostcard: React.FC<{
  waka: WakaEntry;
  isRecommended?: boolean;
  onClose?: () => void;
}> = ({ waka, isRecommended, onClose }) => {
  const [revealed, setRevealed] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const soundSrc = useMemo(
    () => getAmbientSound(waka.date.month),
    [waka.date.month]
  );

  // 🔹 계절+시간대에 맞는 배경 이미지 선택
  const bgImageSrc = useMemo(
    () => getSeasonalImage(waka.date.month, waka.media.imageSrc),
    [waka.date.month, waka.media.imageSrc]
  );

  useEffect(() => {
    if (isRecommended) {
      const timer = setTimeout(() => setRevealed(true), 600);
      return () => clearTimeout(timer);
    } else {
      setRevealed(false);
    }
  }, [waka.id, isRecommended]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async () => {
      try {
        if (revealed && !isMuted) {
          if (audio.readyState >= 2) {
            audio.volume = 0.3;
            await audio.play();
          } else {
            audio.oncanplay = async () => {
              audio.volume = 0.3;
              await audio.play();
            };
          }
        } else {
          audio.pause();
        }
      } catch (e) {
        console.log(e);
      }
    };

    playAudio();
    return () => {
      if (audio) {
        audio.pause();
        audio.oncanplay = null;
      }
    };
  }, [revealed, isMuted, soundSrc]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const dateLabel = `${waka.date.month}월 ${waka.date.day}일
  음력 ${waka.date.lunar}${waka.date.term ? ` | ${waka.date.term}` : ''}`;

  const outerWrapper: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '4px 16px 16px',
  };

  const cardBox: React.CSSProperties = {
    position: 'relative',
    width: 320,
    height: 540,
    backgroundColor: 'var(--paper-color)',
    borderRadius: 6,
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.05), 0 15px 35px -5px rgba(50,40,30,0.1)',
  };

  const bgBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition:
      'transform 2000ms ease-in-out, opacity 2000ms ease-in-out, filter 2000ms ease-in-out',
  };

  const overlayPaper: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'var(--paper-color)',
    opacity: 0.2,
    mixBlendMode: 'multiply' as const,
    pointerEvents: 'none',
  };

  const contentWrapper: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '32px',
    transition: 'opacity 2000ms ease, transform 2000ms ease',
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(8px)',
  };

  const waitingOverlay: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: revealed ? 0 : 1,
    pointerEvents: revealed ? 'none' : 'auto',
    transition: 'opacity 1000ms ease',
  };

  const waitingBox: React.CSSProperties = {
    backgroundColor: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(12px)',
    padding: '32px 36px',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.35)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  };

  const headerRow: React.CSSProperties = {
    textAlign: 'center',
    paddingTop: 1, // 24 → 16 : 위로 살짝
    paddingBottom: 6, // 12 → 6 : 줄과 좀 더 붙게
    flex: 'none',
  };

  const dateLabelStyle: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#a08f7e',
    borderBottom: '1px solid #d3c4af',
    paddingBottom: 3,
    fontFamily: 'var(--font-kor)',
    whiteSpace: 'pre-line',
  };

  const wakaArea: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    flex: 1,
  };

  const wakaCenterRow: React.CSSProperties = {
    position: 'absolute',
    top: '52%', // 50% → 46% : 중앙보다 위로
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
  };

  const wakaLineRight: React.CSSProperties = {
    fontFamily: 'var(--font-jp-calli)',
    fontSize: 24,
    color: '#2b221b',
    lineHeight: 1.9,
    minHeight: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const wakaLineLeft: React.CSSProperties = {
    ...wakaLineRight,
    paddingTop: 48,
  };

  const authorBlock: React.CSSProperties = {
    position: 'absolute',
    bottom: 16,
    left: 12,
    fontFamily: 'var(--font-jp-std)',
    letterSpacing: '0.1em',
    fontSize: 10,
    color: '#8e8070',
    opacity: 0.85,
  };

  const soundButtonWrapper: React.CSSProperties = {
    position: 'absolute',
    right: 18,
    bottom: 18,
    zIndex: 20,
  };

  const soundButton: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 5,
    border: '1px solid #e1d5c5',
    backgroundColor: '#f9f4ec',
    boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#c9a781',
    cursor: 'pointer',
  };

  const bottomSection: React.CSSProperties = {
    marginTop: 16,
    width: '100%',
    maxWidth: 320,
    transition: 'opacity 1000ms ease 300ms, transform 1000ms ease 300ms',
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(8px)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  };

  return (
    <div style={outerWrapper}>
      <audio
        ref={audioRef}
        src={soundSrc}
        loop
        crossOrigin="anonymous"
        preload="auto"
      />

      <div style={cardBox} onClick={() => setRevealed(true)}>
        {/* 배경 */}
        <div
          style={{
            ...bgBase,
            backgroundImage: `url(${bgImageSrc})`,
            opacity: revealed ? 0.25 : 1,
            filter: revealed ? 'grayscale(10%) blur(2px)' : 'none',
            transform: revealed ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        <div className="texture-overlay" style={overlayPaper} />

        {/* 대기 라벨 */}
        <div style={waitingOverlay}>
          <div style={waitingBox}>
            <div
              style={{
                width: 1,
                height: 32,
                backgroundColor: 'rgba(255,255,255,0.9)',
              }}
            />
            <span
              className="text-shadow-sm"
              style={{
                fontFamily: 'var(--font-kor)',
                fontSize: 11,
                letterSpacing: '0.4em',
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}
            >
              {isRecommended ? '당신을 위한' : '오늘의 계절'}
            </span>
            <div
              style={{
                width: 1,
                height: 32,
                backgroundColor: 'rgba(255,255,255,0.9)',
              }}
            />
          </div>
        </div>

        {/* 본문 */}
        <div style={contentWrapper}>
          <div style={headerRow}>
            <span style={dateLabelStyle}>{dateLabel}</span>
          </div>

          <div style={wakaArea}>
            <div style={wakaCenterRow}>
              <div className="vertical-text" style={wakaLineRight}>
                {waka.content.right}
              </div>
              <div className="vertical-text" style={wakaLineLeft}>
                {waka.content.left}
              </div>
            </div>

            <div className="vertical-text" style={authorBlock}>
              <span>{waka.content.author}</span>
              <span
                style={{
                  display: 'block',
                  marginTop: 4,
                  fontSize: 9,
                  opacity: 0.7,
                }}
              >
                · {waka.content.source}
              </span>
            </div>
          </div>

          <div style={soundButtonWrapper}>
            <button
              onClick={toggleSound}
              style={soundButton}
              aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
            >
              {isMuted ? (
                <VolumeX size={14} color="#c9a781" strokeWidth={1.8} />
              ) : (
                <Volume2 size={14} color="#c9a781" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 하단 해석 */}
      <div style={bottomSection}>
        <p
          style={{
            fontFamily: 'var(--font-jp-std)',
            fontSize: 12,
            color: '#8e8070',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {waka.content.hiragana}
        </p>

        <p
          style={{
            fontFamily: 'var(--font-jp-std)',
            fontSize: 12,
            color: '#7c6e63',
            lineHeight: 1.7,
            padding: '0 16px',
            whiteSpace: 'pre-line',
          }}
        >
          {waka.content.modern}
        </p>

        <div
          style={{
            width: 32,
            height: 1,
            backgroundColor: '#e6dfd4',
            margin: '4px auto',
          }}
        />

        <p
          style={{
            fontFamily: 'var(--font-kor)',
            fontSize: 15,
            color: '#3e3326',
            lineHeight: 1.9,
            padding: '0 8px',
            whiteSpace: 'pre-line',
            fontWeight: 500,
          }}
        >
          {waka.content.korean}
        </p>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: 20,
            borderRadius: 4,
            border: '1px solid #eeeae0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            margin: '0 8px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-kor)',
              fontSize: 12,
              color: '#8a7b6d',
              lineHeight: 1.6,
            }}
          >
            {waka.content.commentary}
          </p>
        </div>

        {isRecommended && onClose && (
          <div style={{ paddingTop: 12, paddingBottom: 32 }}>
            <button
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                margin: '0 auto',
                color: '#a09080',
                fontFamily: 'var(--font-kor)',
                fontSize: 12,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
            >
              <RefreshCw size={12} />
              <span style={{ paddingBottom: 2 }}>오늘의 와카로 돌아가기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── 심리테스트 모달 ───
const AdvancedTest: React.FC<{
  onClose: () => void;
  onComplete: (result: string) => void;
}> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{
    q1?: string;
    q2?: string;
    q3?: string;
  }>({});

  const questions = [
    {
      id: 'q1',
      title: '지금 당신의 마음속 날씨는\n어떤가요?',
      options: [
        {
          val: 'snow',
          label: '소리 없이 눈 내리는 밤',
          icon: <Moon size={14} />,
        },
        { val: 'wind', label: '거칠게 부는 바람', icon: <Wind size={14} /> },
        {
          val: 'sun',
          label: '구름 사이로 비치는 햇살',
          icon: <Sun size={14} />,
        },
      ],
    },
    {
      id: 'q2',
      title: '지금 당신을 가장\n무겁게 하는 것은 무엇인가요?',
      options: [
        {
          val: 'anxiety',
          label: '알 수 없는 막막함',
          icon: <Cloud size={14} />,
        },
        { val: 'burnout', label: '지쳐버린 마음', icon: <Coffee size={14} /> },
        {
          val: 'wait',
          label: '오지 않는 소식에 대한 기다림',
          icon: <Droplets size={14} />,
        },
      ],
    },
    {
      id: 'q3',
      title: '이 노래가 끝난 뒤,\n어떤 풍경에 닿고 싶나요?',
      options: [
        { val: 'silence', label: '완전한 고요와 휴식' },
        { val: 'energy', label: '다시 시작할 힘' },
        { val: 'accept', label: '있는 그대로를 받아들임' },
      ],
    },
  ];

  const handleSelect = (val: string) => {
    const currentQ = questions[step - 1].id;
    const newAnswers = { ...answers, [currentQ]: val };
    setAnswers(newAnswers);

    if (step < 3) {
      setStep(step + 1);
    } else {
      let resultType: 'calm' | 'energy' | 'wait' = 'calm';
      if (newAnswers.q3 === 'energy') resultType = 'energy';
      else if (newAnswers.q2 === 'wait' || newAnswers.q3 === 'accept')
        resultType = 'wait';
      else if (newAnswers.q1 === 'snow' && newAnswers.q3 === 'silence')
        resultType = 'calm';

      setTimeout(() => onComplete(resultType), 600);
    }
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: '#fffefc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <button
          onClick={onClose}
          style={{
            color: '#b59a7a',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
        >
          <X size={24} />
        </button>
        <div
          style={{
            color: '#d3c4af',
            fontSize: 12,
            fontFamily: 'var(--font-kor)',
            letterSpacing: '0.2em',
          }}
        >
          {step === 0 ? 'FOR YOU' : `QUESTION ${step} / 3`}
        </div>
        <div style={{ width: 24 }} />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          maxWidth: 420,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {step === 0 && (
          <div className="fade-in" style={{ width: '100%' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '999px',
                border: '1px solid #d3c4af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <Sparkles size={20} style={{ color: '#b59a7a' }} />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-kor)',
                fontSize: 20,
                color: '#2c241b',
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              당신의 마음에 맞는
              <br />옛 노래를 찾아드립니다.
            </h2>
            <p style={{ color: '#8e8070', fontSize: 14, lineHeight: 1.8 }}>
              세 가지 질문에 답해주시면,
              <br />
              지금 당신에게 필요한 계절의 노래를
              <br />
              처방해 드립니다.
            </p>
            <div style={{ paddingTop: 32 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '12px 32px',
                  borderRadius: 999,
                  backgroundColor: '#2c241b',
                  color: '#faf9f6',
                  fontSize: 12,
                  letterSpacing: '0.2em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                시작하기
              </button>
            </div>
          </div>
        )}

        {step > 0 && (
          <div key={step} className="fade-in" style={{ width: '100%' }}>
            <h3
              style={{
                fontFamily: 'var(--font-kor)',
                fontSize: 18,
                color: '#2c241b',
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              {questions[step - 1].title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questions[step - 1].options.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleSelect(opt.val)}
                  style={{
                    width: '100%',
                    padding: 16,
                    border: '1px solid #e6dfd4',
                    backgroundColor: '#ffffff',
                    borderRadius: 4,
                    fontFamily: 'var(--font-kor)',
                    fontSize: 14,
                    color: '#5c4d3b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  {opt.icon && (
                    <span
                      style={{
                        color: '#d3c4af',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {opt.icon}
                    </span>
                  )}
                  <span style={{ whiteSpace: 'pre-line' }}>{opt.label}</span>
                </button>
              ))}
            </div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  marginTop: 32,
                  fontSize: 12,
                  color: '#a09080',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                <ChevronLeft size={14} /> 이전으로
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ width: '100%', height: 4, backgroundColor: '#f0ebe0' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: '#d3c4af',
            transition: 'width 500ms ease',
            width: `${(step / 3) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

// ─── 메인 페이지 ───
export default function WakaArchivePage() {
  const [mode, setMode] = useState<'today' | 'test' | 'recommend'>('today');
  const [recommendedWaka, setRecommendedWaka] = useState<WakaEntry | null>(
    null
  );

  const pageRoot: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#fffefc',
    paddingBottom: 72,
    overflowX: 'hidden',
  };

  // 헤더 스타일
  const headerStyle: React.CSSProperties = {
    paddingTop: 5, // 조금 더 여백
    paddingBottom: 25,
    textAlign: 'center', // ← 가운데 정렬
    // paddingLeft 제거
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 24,
    letterSpacing: '0.1em',
    color: '#2c241b',
    marginBottom: 8,
    fontFamily: 'var(--font-kor)',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: '#b59a7a',
  };

  const mainWrapper: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const startButtonWrap: React.CSSProperties = {
    marginTop: 32,
    marginBottom: 32,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  };

  const startButton: React.CSSProperties = {
    backgroundColor: '#2c241b',
    color: '#faf9f6',
    padding: '12px 24px',
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #4a3f35',
    boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    fontSize: 12,
    letterSpacing: '0.2em',
    fontFamily: 'var(--font-kor)',
  };

  const forYouHeader: React.CSSProperties = {
    paddingTop: 24,
    paddingBottom: 12,
    textAlign: 'center',
  };

  return (
    <div style={pageRoot}>
      <StyleHeader />

      {mode === 'today' && (
        <header className="fade-in" style={headerStyle}>
          <h1 style={titleStyle}>和歌</h1>
          <p style={subtitleStyle}>Today's Waka</p>
        </header>
      )}

      <main style={mainWrapper}>
        {mode === 'today' && (
          <div className="fade-in" style={{ width: '100%' }}>
            <WakaPostcard waka={sampleData.today} />
            <div style={startButtonWrap}>
              <button onClick={() => setMode('test')} style={startButton}>
                <Sparkles size={14} />
                <span style={{ paddingTop: 2 }}>마음 처방받기</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'recommend' && recommendedWaka && (
          <div className="animate-slide-up" style={{ width: '100%' }}>
            <header style={forYouHeader}>
              <p style={subtitleStyle}>FOR YOU</p>
              <h1
                style={{
                  ...titleStyle,
                  textAlign: 'center',
                  fontSize: 20,
                  letterSpacing: '0.08em',
                  marginTop: 8,
                  marginBottom: 0,
                  lineHeight: 1.6,
                }}
              >
                <span>당신을 위한</span>
                <span> 노래</span>
              </h1>
            </header>

            <WakaPostcard
              waka={recommendedWaka}
              isRecommended
              onClose={() => {
                setRecommendedWaka(null);
                setMode('today');
              }}
            />
          </div>
        )}

        {mode === 'test' && (
          <AdvancedTest
            onClose={() => setMode('today')}
            onComplete={(resultType) => {
              const result = sampleData[resultType] || sampleData.calm;
              setRecommendedWaka(result);
              setMode('recommend');
            }}
          />
        )}
      </main>
    </div>
  );
}
