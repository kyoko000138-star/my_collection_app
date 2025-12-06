import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Camera,
  X,
  ArrowLeft,
  Coffee,
  Thermometer,
  Timer,
  Leaf,
  Flower,
  Flame,
  Mountain,
  Waves,
  Nut,
  Candy,
  Play,
  Square,
  RotateCcw,
  Cherry,
  CloudSun,
} from 'lucide-react';

import { auth, db } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

/* --------------------------------------------------------------------------
 * 1. 디자인 시스템 (Black & Gray Museum Theme)
 * -------------------------------------------------------------------------- */
const Colors = {
  bg: '#FDFDFD',
  cardBg: '#FFFFFF',
  textMain: '#1A1A1A',
  textSub: '#888888',
  accent: '#2C2C2C',
  teaGreen: '#5D7052',
  border: '#E0E0E0',
  activeBg: '#F5F5F5',
  danger: '#D32F2F',
  aroma: {
    wood: '#8D6E63',
    forest: '#8D6E63',
    green: '#81C784',
    floral: '#F48FB1',
    fruit: '#FFB74D',
    grain: '#D7CCC8',
    sweet: '#EF9A9A',
    fire: '#5D4037',
    marine: '#4FC3F7',
    mineral: '#90A4AE',
  },
};

const Fonts = {
  serif: '"Gowun Batang", serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const Styles: { [k: string]: any } = {
  containerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    minHeight: '100vh',
  },
  pageContainer: {
    width: '100%',
    maxWidth: '480px',
    minHeight: '100vh',
    backgroundColor: Colors.bg,
    fontFamily: Fonts.sans,
    color: Colors.textMain,
    paddingBottom: '80px',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
    position: 'relative',
  },
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(253, 253, 253, 0.98)',
    backdropFilter: 'blur(10px)',
    zIndex: 10,
    padding: '16px 20px',
    borderBottom: `1px solid ${Colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
  },
  formHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    padding: '8px 20px 8px',
    backgroundColor: Colors.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: '18px',
    fontWeight: 700,
    color: Colors.textMain,
  },
  section: {
    padding: '10px 20px',
    borderBottom: `1px solid ${Colors.border}`,
    backgroundColor: Colors.bg,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: '15px',
    fontWeight: 600,
    color: Colors.textMain,
    marginBottom: '16px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  inputGroup: { marginBottom: '24px' },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: Colors.textSub,
    marginBottom: '8px',
    display: 'block',
    letterSpacing: '0.02em',
  },
  input: {
    width: '100%',
    padding: '10px 0',
    border: 'none',
    borderBottom: `1px solid ${Colors.border}`,
    backgroundColor: 'transparent',
    fontSize: '15px',
    color: Colors.textMain,
    borderRadius: 0,
    outline: 'none',
    fontFamily: Fonts.sans,
    transition: 'border-color 0.2s',
  },
  textArea: {
    width: '100%',
    padding: '16px',
    borderRadius: '4px',
    border: `1px solid ${Colors.border}`,
    backgroundColor: '#FAFAFA',
    fontSize: '14px',
    color: Colors.textMain,
    outline: 'none',
    minHeight: '120px',
    resize: 'none',
    lineHeight: 1.6,
    fontFamily: Fonts.serif,
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    width: '100%',
  },
  chip: (active: boolean) => ({
    padding: '6px 12px',
    borderRadius: '20px',
    border: `1px solid ${active ? Colors.teaGreen : Colors.border}`,
    backgroundColor: active ? Colors.teaGreen : 'transparent',
    color: active ? '#FFFFFF' : Colors.textSub,
    fontSize: '12px',
    fontWeight: active ? 500 : 400,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    minWidth: '64px',
    textAlign: 'center',
  }),
  aromaChip: (active: boolean, color: string) => ({
    padding: '6px 12px',
    borderRadius: '20px',
    border: `1px solid ${active ? color : Colors.border}`,
    backgroundColor: active ? color : 'transparent',
    color: active ? '#FFFFFF' : Colors.textSub,
    fontSize: '12px',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '64px',
    textAlign: 'center',
  }),
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    border: `1px solid ${Colors.border}`,
  },
  fab: {
    position: 'absolute',
    right: '20px',
    bottom: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: Colors.teaGreen,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(93, 112, 82, 0.3)',
    cursor: 'pointer',
    zIndex: 50,
    border: 'none',
  },
  sliderContainer: {
    position: 'relative',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
  },
  sliderInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 2,
    margin: 0,
  },
  sliderTrack: {
    width: '100%',
    height: '2px',
    backgroundColor: '#E0E0E0',
    borderRadius: '2px',
    position: 'absolute',
  },
  sliderFill: (pct: number) => ({
    position: 'absolute',
    height: '2px',
    width: `${pct}%`,
    backgroundColor: Colors.teaGreen,
    borderRadius: '2px',
  }),
  sliderThumb: (pct: number) => ({
    position: 'absolute',
    left: `${pct}%`,
    width: '12px',
    height: '12px',
    backgroundColor: '#FFFFFF',
    border: `2px solid ${Colors.teaGreen}`,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  }),
  uploadButton: {
    width: '100%',
    height: '48px',
    borderRadius: '4px',
    border: `1px dashed ${Colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    color: Colors.textSub,
    cursor: 'pointer',
    fontSize: '13px',
    gap: '8px',
    marginBottom: '12px',
  },
  detailText: {
    fontSize: 15,
    color: Colors.textMain,
    lineHeight: 1.6,
    fontWeight: 500,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSub,
    marginBottom: 4,
    display: 'block',
    letterSpacing: '0.05em',
  },
};

/* --------------------------------------------------------------------------
 * 2. 데이터 상수
 * -------------------------------------------------------------------------- */
const todayString = () => new Date().toISOString().slice(0, 10);
const TEA_COLLECTION = 'teaSessions';

const TEA_MAIN_TYPES = [
  { id: 'green', label: '녹차' },
  { id: 'matcha', label: '말차' },
  { id: 'white', label: '백차' },
  { id: 'yellow', label: '황차' },
  { id: 'oolong', label: '청차' },
  { id: 'black', label: '홍차' },
  { id: 'dark', label: '흑차' },
  { id: 'herbal', label: '대용차' },
];

const TEA_SUB_TYPES: { [k: string]: string[] } = {
  green: ['우전', '세작', '센차', '옥로', '호지차', '기타'],
  matcha: ['농차', '박차', '기타'],
  white: ['백호은침', '백모단', '수미', '공미', '기타'],
  yellow: ['군산은침', '몽정황아', '기타'],
  oolong: [
    '철관음',
    '대홍포',
    '동방미인',
    '아리산오룡',
    '귀비우롱',
    '동정오룡',
    '문산포종',
    '기타',
  ],
  black: ['다질링', '아쌈', '얼그레이', '기문', '정산소종', '기타'],
  dark: ['보이 숙차', '보이 생차', '육보차', '천량차', '기타'],
  herbal: ['루이보스', '캐모마일', '페퍼민트', '기타'],
};

const AROMA_MAIN_CATS = [
  {
    id: 'floral',
    label: '꽃',
    color: Colors.aroma.floral,
    icon: <Flower size={18} />,
  },
  {
    id: 'fruit',
    label: '과일',
    color: Colors.aroma.fruit,
    icon: <Cherry size={18} />,
  },
  {
    id: 'green',
    label: '풀/채소',
    color: Colors.aroma.green,
    icon: <Leaf size={18} />,
  },
  {
    id: 'grain',
    label: '곡물/견과',
    color: Colors.aroma.grain,
    icon: <Nut size={18} />,
  },
  {
    id: 'sweet',
    label: '단맛',
    color: Colors.aroma.sweet,
    icon: <Candy size={18} />,
  },
  {
    id: 'wood',
    label: '나무·흙',
    color: Colors.aroma.wood,
    icon: <Mountain size={18} />,
  },
  {
    id: 'fire',
    label: '불/훈연',
    color: Colors.aroma.fire,
    icon: <Flame size={18} />,
  },
  {
    id: 'marine',
    label: '해양',
    color: Colors.aroma.marine,
    icon: <Waves size={18} />,
  },
  {
    id: 'mineral',
    label: '미네랄',
    color: Colors.aroma.mineral,
    icon: <CloudSun size={18} />,
  },
];

const AROMA_SUB_CATS: { [k: string]: string[] } = {
  floral: [
    '국화',
    '치자',
    '제라늄',
    '인동초',
    '자스민',
    '계화',
    '장미',
    '연꽃',
    '난초',
  ],
  fruit: [
    '파인애플',
    '바나나',
    '망고',
    '사과',
    '살구',
    '배',
    '포도',
    '감귤',
    '레몬',
    '베르가못',
    '베리류',
  ],
  green: ['갓 벤 풀', '해조류', '시금치', '쑥', '대나무', '솔잎', '민트'],
  grain: ['볶은 콩', '누룽지', '밤', '아몬드', '호두', '보리', '토스트'],
  sweet: ['꿀', '밀랍', '카라멜', '흑설탕', '맥아', '초콜릿', '크림', '버터'],
  wood: [
    '소나무',
    '삼나무',
    '참나무',
    '백단향',
    '젖은 나무',
    '이끼',
    '흙내음',
    '낙엽',
  ],
  fire: ['훈연', '가죽', '담배', '재', '타르', '동물성'],
  marine: ['해조류', '굴/새우', '바다소금', '미네랄'],
  mineral: ['바위', '금속', '분필', '소금기'],
};

const TASTE_AXES = [
  { key: 'sweetness', label: '단맛' },
  { key: 'bitterness', label: '쓴맛' },
  { key: 'astringency', label: '떫은맛' },
  { key: 'umami', label: '감칠맛' },
  { key: 'acidity', label: '산미' },
  { key: 'body', label: '바디감' },
];

const initialTaste: { [k: string]: number } = {
  sweetness: 0,
  bitterness: 0,
  astringency: 0,
  umami: 0,
  acidity: 0,
  body: 0,
};

/* --------------------------------------------------------------------------
 * 3. 유틸리티 컴포넌트
 * -------------------------------------------------------------------------- */

const TeaRadarChart = ({ values }: { values: any }) => {
  const size = 220;
  const center = size / 2;
  const radius = 80;
  const angleStep = (Math.PI * 2) / TASTE_AXES.length;
  const levels = [1, 2, 3, 4, 5];

  const getPoint = (index: number, value: number, maxVal = 5) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const points = TASTE_AXES.map((label, i) =>
    getPoint(i, values[label.key] || 0)
  );
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '10px 0',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {levels.map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 5) * radius}
            fill="none"
            stroke={Colors.border}
            strokeWidth="0.5"
          />
        ))}
        {TASTE_AXES.map((_, i) => {
          const p = getPoint(i, 5);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke={Colors.border}
              strokeWidth="0.5"
            />
          );
        })}
        <polygon
          points={polygonPoints}
          fill="rgba(93, 112, 82, 0.2)"
          stroke="#5D7052"
          strokeWidth="1.5"
        />
        {TASTE_AXES.map((label, i) => {
          const p = getPoint(i, 5);
          const labelX = center + (radius + 15) * Math.cos(p.angle);
          const labelY = center + (radius + 15) * Math.sin(p.angle);
          const anchor =
            labelX < center - 5
              ? 'end'
              : labelX > center + 5
              ? 'start'
              : 'middle';
          return (
            <text
              key={label.key}
              x={labelX}
              y={labelY}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill={Colors.textSub}
              fontSize="11"
              fontWeight={values[label.key] > 0 ? 'bold' : 'normal'}
            >
              {label.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const TeaSlider = ({
  value,
  max = 5,
  onChange,
}: {
  value: number;
  max?: number;
  onChange: (v: number) => void;
}) => {
  const pct = (value / max) * 100;
  return (
    <div style={Styles.sliderContainer}>
      <div style={Styles.sliderTrack}></div>
      <div style={Styles.sliderFill(pct)}></div>
      <div style={Styles.sliderThumb(pct)}></div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={Styles.sliderInput}
      />
    </div>
  );
};

const ImageStrip = ({
  images,
  onImageClick,
}: {
  images: string[];
  onImageClick: (url: string) => void;
}) => (
  <div
    style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '4px',
    }}
  >
    {images.map((url, idx) => (
      <img
        key={idx}
        src={url}
        alt={`thumb-${idx}`}
        style={{
          width: '70px',
          height: '70px',
          objectFit: 'cover',
          borderRadius: '4px',
          border: `1px solid ${Colors.border}`,
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => onImageClick(url)}
      />
    ))}
  </div>
);

const FullImageOverlay = ({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) => {
  if (!url) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <img
        src={url}
        alt="Full"
        style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }}
      />
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          color: '#fff',
          background: 'none',
          border: 'none',
        }}
      >
        <X size={32} />
      </button>
    </div>
  );
};

const MiniBrewTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const toggleTimer = () => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      intervalRef.current = window.setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          fontSize: '13px',
          fontFamily: 'monospace',
          width: '36px',
          textAlign: 'right',
          color: isRunning ? Colors.teaGreen : Colors.textSub,
        }}
      >
        {formatTime(time)}
      </div>
      <button
        type="button"
        onClick={toggleTimer}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: isRunning ? Colors.teaGreen : Colors.textSub,
        }}
      >
        {isRunning ? (
          <Square size={14} fill="currentColor" />
        ) : (
          <Play size={14} />
        )}
      </button>
      <button
        type="button"
        onClick={resetTimer}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: Colors.textSub,
        }}
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
};

/* --------------------------------------------------------------------------
 * 4. 리스트 / 상세 / 폼
 * -------------------------------------------------------------------------- */

const TeaList = ({
  entries,
  openDetail,
}: {
  entries: any[];
  openDetail: (e: any) => void;
}) => (
  <div style={{ padding: '20px' }}>
    {entries.length === 0 ? (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: Colors.textSub,
          border: `1px dashed ${Colors.border}`,
          borderRadius: '4px',
        }}
      >
        <p style={{ fontSize: '14px', fontFamily: Fonts.serif }}>
          아직 찻자리 기록이 없습니다.
        </p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={Styles.card}
            onClick={() => openDetail(entry)}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: Colors.textSub,
                  letterSpacing: '0.02em',
                }}
              >
                {entry.date?.replace(/-/g, '.')}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: Colors.textMain,
                  border: `1px solid ${Colors.border}`,
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                {TEA_MAIN_TYPES.find((t) => t.id === entry.teaType)?.label ||
                  '차'}
              </span>
            </div>
            <h3
              style={{
                fontFamily: Fonts.serif,
                fontSize: '18px',
                fontWeight: 700,
                color: Colors.textMain,
                marginBottom: '8px',
              }}
            >
              {entry.teaName}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {entry.aromaTags.slice(0, 5).map((tag: string, i: number) => (
                <span
                  key={`${tag}-${i}`}
                  style={{
                    fontSize: '11px',
                    color: Colors.textSub,
                    backgroundColor: '#F5F5F5',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  #{tag}
                </span>
              ))}
              {entry.aromaTags.length > 5 && (
                <span style={{ fontSize: '11px', color: Colors.textSub }}>
                  +{entry.aromaTags.length - 5}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const TeaDetail = ({
  entry,
  startEdit,
  handleDelete,
  closeDetail,
  setFullImageUrl,
}: {
  entry: any;
  startEdit: (e: any) => void;
  handleDelete: (id: string) => void;
  closeDetail: () => void;
  setFullImageUrl: (url: string | null) => void;
}) => {
  const mainTypeLabel =
    TEA_MAIN_TYPES.find((t) => t.id === entry.teaType)?.label || '';

  return (
    <div style={Styles.containerWrapper}>
      <div style={Styles.pageContainer}>
        <div style={Styles.header}>
          <button
            onClick={closeDetail}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: Colors.textMain,
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => startEdit(entry)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: Colors.textSub,
              }}
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(entry.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: Colors.danger,
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 20px' }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '13px',
                color: Colors.textSub,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              {entry.date?.replace(/-/g, '.')}
            </span>
            <h1
              style={{
                fontFamily: Fonts.serif,
                fontSize: '26px',
                fontWeight: 700,
                color: Colors.textMain,
              }}
            >
              {entry.teaName}
            </h1>
            <span
              style={{
                fontSize: '13px',
                color: Colors.textMain,
                marginTop: '8px',
                display: 'block',
              }}
            >
              {mainTypeLabel} · {entry.subType || '-'}
            </span>
          </div>

          {entry.images?.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <ImageStrip
                images={entry.images}
                onImageClick={setFullImageUrl}
              />
            </div>
          )}

          {/* 기본 정보 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '40px',
              borderTop: `1px solid ${Colors.border}`,
              borderBottom: `1px solid ${Colors.border}`,
              padding: '24px 0',
            }}
          >
            <div>
              <span style={Styles.detailLabel}>산지</span>
              <div style={Styles.detailText}>{entry.origin || '-'}</div>
            </div>
            <div>
              <span style={Styles.detailLabel}>품종</span>
              <div style={Styles.detailText}>{entry.variety || '-'}</div>
            </div>
            <div>
              <span style={Styles.detailLabel}>브랜드 / 구매처</span>
              <div style={Styles.detailText}>{entry.shop || '-'}</div>
            </div>
            <div>
              <span style={Styles.detailLabel}>다과</span>
              <div style={Styles.detailText}>{entry.snack || '-'}</div>
            </div>
          </div>

          {/* 우리기 기록 */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={Styles.sectionTitle}>우리기 기록</h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {entry.brewing.map((brew: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#FAFAFA',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: Colors.textMain }}>
                    {i + 1}포
                  </span>
                  <span style={{ color: Colors.textMain }}>
                    {brew.temp || '-'}°C
                  </span>
                  <span style={{ color: Colors.textMain }}>
                    {brew.time || '-'}
                  </span>
                  <span style={{ color: Colors.textMain }}>
                    {brew.water || '-'}ml
                  </span>
                </div>
              ))}
              {entry.brewing.length === 0 && (
                <div
                  style={{
                    fontSize: '13px',
                    color: Colors.textSub,
                    fontStyle: 'italic',
                  }}
                >
                  기록 없음
                </div>
              )}
            </div>
          </div>

          {/* 테이스팅 노트 */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={Styles.sectionTitle}>테이스팅 노트</h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '24px',
                justifyContent: 'center',
              }}
            >
              {entry.aromaTags.map((tag: string) => {
                const catId = Object.keys(AROMA_SUB_CATS).find((key) =>
                  AROMA_SUB_CATS[key].includes(tag)
                );
                const color = catId
                  ? (Colors.aroma as any)[catId]
                  : Colors.textSub;
                return (
                  <span key={tag} style={Styles.aromaChip(true, color)}>
                    {tag}
                  </span>
                );
              })}
            </div>
            <div style={{ marginBottom: '24px' }}>
              <TeaRadarChart values={entry.taste} />
            </div>
          </div>

          {/* 메모 */}
          {entry.note && (
            <div>
              <h3 style={Styles.sectionTitle}>감상 메모</h3>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.8,
                  color: Colors.textMain,
                  whiteSpace: 'pre-wrap',
                  fontFamily: Fonts.serif,
                }}
              >
                {entry.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TeaForm = ({
  formState,
  handlers,
}: {
  formState: { formData: any };
  handlers: any;
}) => {
  const { formData } = formState;
  const {
    setFormData,
    handleSave,
    closeForm,
    handleImageUpload,
    triggerFileInput,
    fileInputRef,
    saving,
  } = handlers;

  const [activeAromaCat, setActiveAromaCat] = useState<string | null>(null);

  const handleAddBrew = () => {
    setFormData({
      ...formData,
      brewing: [...formData.brewing, { temp: '', time: '', water: '' }],
    });
  };

  const handleBrewChange = (index: number, field: string, value: string) => {
    const newBrewing = [...formData.brewing];
    newBrewing[index] = { ...newBrewing[index], [field]: value };
    setFormData({ ...formData, brewing: newBrewing });
  };

  const handleRemoveBrew = (index: number) => {
    const newBrewing = formData.brewing.filter(
      (_: any, i: number) => i !== index
    );
    setFormData({ ...formData, brewing: newBrewing });
  };

  const toggleAromaTag = (tag: string) => {
    const newTags = formData.aromaTags.includes(tag)
      ? formData.aromaTags.filter((t: string) => t !== tag)
      : [...formData.aromaTags, tag];
    setFormData({ ...formData, aromaTags: newTags });
  };

  const handleTasteChange = (key: string, val: number) => {
    setFormData({ ...formData, taste: { ...formData.taste, [key]: val } });
  };

  const currentSubTypes = TEA_SUB_TYPES[formData.teaType] || [];

  return (
    <div style={Styles.containerWrapper}>
      <div style={Styles.pageContainer}>
        <div style={Styles.formHeader}>
          <button
            onClick={closeForm}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: Colors.textMain,
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form style={{ padding: '1px 20px' }}>
          {/* 1. 기본 정보 */}
          <div style={Styles.section}>
            <div style={Styles.inputGroup}>
              <span style={Styles.label}>날짜</span>
              <input
                type="date"
                style={Styles.input}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div style={Styles.inputGroup}>
              <span style={Styles.label}>이름</span>
              <input
                type="text"
                style={Styles.input}
                placeholder="예: 우전 녹차"
                value={formData.teaName}
                onChange={(e) =>
                  setFormData({ ...formData, teaName: e.target.value })
                }
              />
            </div>

            {/* 산지 / 품종 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '8px',
              }}
            >
              <div style={{ ...Styles.inputGroup, marginBottom: '8px' }}>
                <span style={Styles.label}>산지</span>
                <input
                  type="text"
                  style={Styles.input}
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  placeholder="예: 보성, 하동"
                />
              </div>
              <div style={{ ...Styles.inputGroup, marginBottom: '8px' }}>
                <span style={Styles.label}>품종</span>
                <input
                  type="text"
                  style={Styles.input}
                  value={formData.variety}
                  onChange={(e) =>
                    setFormData({ ...formData, variety: e.target.value })
                  }
                  placeholder="예: 재래종"
                />
              </div>
            </div>

            {/* 브랜드 / 구매처 */}
            <div style={{ ...Styles.inputGroup, marginBottom: '16px' }}>
              <span style={Styles.label}>브랜드 / 구매처</span>
              <input
                type="text"
                style={Styles.input}
                value={formData.shop}
                placeholder="예: OO다원, OO티샵"
                onChange={(e) =>
                  setFormData({ ...formData, shop: e.target.value })
                }
              />
            </div>

            <div style={Styles.inputGroup}>
              <span style={Styles.label}>차 종류</span>
              <div style={Styles.chipContainer}>
                {TEA_MAIN_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    style={Styles.chip(formData.teaType === t.id)}
                    onClick={() =>
                      setFormData({ ...formData, teaType: t.id, subType: '' })
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={Styles.inputGroup}>
              <span style={Styles.label}>세부 분류</span>
              <div style={Styles.chipContainer}>
                {currentSubTypes.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    style={Styles.chip(formData.subType === sub)}
                    onClick={() => setFormData({ ...formData, subType: sub })}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div style={Styles.inputGroup}>
              <span style={Styles.label}>곁들인 다과</span>
              <input
                type="text"
                style={Styles.input}
                value={formData.snack}
                onChange={(e) =>
                  setFormData({ ...formData, snack: e.target.value })
                }
                placeholder="예: 양갱, 마카롱"
              />
            </div>
          </div>

          {/* 2. 우리기 기록 */}
          <div style={Styles.section}>
            <h3 style={Styles.sectionTitle}>우리기 기록</h3>
            {formData.brewing.map((brew: any, i: number) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  marginBottom: '12px',
                  backgroundColor: '#FAFAFA',
                  padding: '8px',
                  borderRadius: '4px',
                  flexWrap: 'nowrap',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: Colors.textMain,
                    width: '30px',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}포
                </span>
                <input
                  type="text"
                  placeholder="온도(°C)"
                  style={{
                    ...Styles.input,
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '13px',
                    border: 'none',
                    backgroundColor: '#F0F0F0',
                    borderRadius: '4px',
                    minWidth: '60px',
                  }}
                  value={brew.temp}
                  onChange={(e) => handleBrewChange(i, 'temp', e.target.value)}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#F0F0F0',
                    borderRadius: '4px',
                    flex: 1,
                    minWidth: '110px',
                  }}
                >
                  <input
                    type="text"
                    placeholder="시간"
                    style={{
                      ...Styles.input,
                      padding: '8px',
                      textAlign: 'center',
                      fontSize: '13px',
                      border: 'none',
                      width: '100%',
                    }}
                    value={brew.time}
                    onChange={(e) =>
                      handleBrewChange(i, 'time', e.target.value)
                    }
                  />
                  <MiniBrewTimer />
                </div>
                <input
                  type="text"
                  placeholder="물양(ml)"
                  style={{
                    ...Styles.input,
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '13px',
                    border: 'none',
                    backgroundColor: '#F0F0F0',
                    borderRadius: '4px',
                    minWidth: '60px',
                  }}
                  value={brew.water}
                  onChange={(e) => handleBrewChange(i, 'water', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBrew(i)}
                  style={{ color: Colors.textSub, padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddBrew}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: `1px dashed ${Colors.border}`,
                backgroundColor: '#FAFAFA',
                color: Colors.textSub,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Plus size={14} /> 회차 추가
            </button>
          </div>

          {/* 3. 아로마 & 맛 */}
          <div style={Styles.section}>
            <h3 style={Styles.sectionTitle}>테이스팅 노트</h3>

            {/* 대분류 아이콘 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                gap: '20px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: `1px dashed ${Colors.border}`,
                flexWrap: 'wrap',
              }}
            >
              {AROMA_MAIN_CATS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    opacity: activeAromaCat === cat.id ? 1 : 0.4,
                    transition: 'opacity 0.2s',
                  }}
                  onClick={() =>
                    setActiveAromaCat(activeAromaCat === cat.id ? null : cat.id)
                  }
                >
                  <div style={{ color: cat.color }}>{cat.icon}</div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: Colors.textMain,
                      fontWeight: activeAromaCat === cat.id ? 600 : 400,
                    }}
                  >
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* 소분류 칩 */}
            {activeAromaCat && (
              <div
                style={{
                  marginBottom: '24px',
                  backgroundColor: '#FAFAFA',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${Colors.border}`,
                }}
              >
                <div style={Styles.chipContainer}>
                  {AROMA_SUB_CATS[activeAromaCat].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      style={Styles.aromaChip(
                        formData.aromaTags.includes(sub),
                        AROMA_MAIN_CATS.find((c) => c.id === activeAromaCat)!
                          .color as string
                      )}
                      onClick={() => toggleAromaTag(sub)}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 선택된 태그 표시 */}
            {formData.aromaTags.length > 0 && (
              <div
                style={{
                  marginBottom: '32px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  justifyContent: 'center',
                }}
              >
                {formData.aromaTags.map((t: string) => {
                  const catId = Object.keys(AROMA_SUB_CATS).find((key) =>
                    AROMA_SUB_CATS[key].includes(t)
                  );
                  const color = catId
                    ? (Colors.aroma as any)[catId]
                    : Colors.textSub;
                  return (
                    <span
                      key={t}
                      style={{
                        fontSize: '12px',
                        color: '#fff',
                        backgroundColor: color,
                        padding: '4px 10px',
                        borderRadius: '12px',
                      }}
                    >
                      #{t}
                    </span>
                  );
                })}
              </div>
            )}

            {/* 맛 그래프 */}
            <div style={{ marginBottom: '24px' }}>
              <TeaRadarChart values={formData.taste} />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px 24px',
              }}
            >
              {TASTE_AXES.map((axis) => (
                <div key={axis.key}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '2px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: Colors.textSub }}>
                      {axis.label}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: Colors.textMain,
                      }}
                    >
                      {formData.taste[axis.key]}
                    </span>
                  </div>
                  <TeaSlider
                    value={formData.taste[axis.key]}
                    onChange={(val) => handleTasteChange(axis.key, val)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 4. 사진 및 메모 */}
          <div style={Styles.section}>
            <div style={Styles.inputGroup}>
              <span style={Styles.label}>사진</span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={triggerFileInput}
                  style={Styles.uploadButton}
                >
                  <Camera size={20} strokeWidth={1.5} />
                  <span>사진 추가</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                {formData.images.length > 0 && (
                  <div style={{ flex: 1, overflowX: 'auto' }}>
                    <ImageStrip
                      images={formData.images.map((i: any) => i.url)}
                      onImageClick={() => {}}
                    />
                  </div>
                )}
              </div>
            </div>
            <div style={Styles.inputGroup}>
              <span style={Styles.label}>메모</span>
              <textarea
                style={Styles.textArea}
                placeholder="찻자리의 분위기, 다식, 함께한 사람 등을 기록하세요."
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              />
            </div>
          </div>

          <div style={{ padding: '20px 0' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: Colors.textMain,
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 500,
                cursor: saving ? 'default' : 'pointer',
                fontFamily: Fonts.serif,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
 * 5. 메인 페이지 컴포넌트 (Firestore + Google 로그인)
 * -------------------------------------------------------------------------- */
const TeaPage = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [entries, setEntries] = useState<any[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [mode, setMode] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: null,
    date: todayString(),
    teaName: '',
    origin: '',
    variety: '',
    shop: '',
    price: '',
    teaType: 'green',
    subType: '',
    snack: '',
    brewing: [{ temp: '', time: '', water: '' }],
    aromaTags: [],
    taste: { ...initialTaste },
    note: '',
    images: [] as { url: string; file: File | null }[],
  });

  /* ----------------------------- Auth 설정 ------------------------------ */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMode('list');
      setSelectedEntry(null);
    } catch (e) {
      console.error(e);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  /* --------------------------- Firestore 구독 --------------------------- */

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }
    setEntriesLoading(true);

    const q = query(
      collection(db, TEA_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            date: data.date ?? todayString(),
            teaName: data.teaName ?? '',
            origin: data.origin ?? '',
            variety: data.variety ?? '',
            shop: data.shop ?? '',
            price: data.price ?? '',
            teaType: data.teaType ?? 'green',
            subType: data.subType ?? '',
            snack: data.snack ?? '',
            brewing: Array.isArray(data.brewing) ? data.brewing : [],
            aromaTags: Array.isArray(data.aromaTags) ? data.aromaTags : [],
            taste: { ...initialTaste, ...(data.taste || {}) },
            note: data.note ?? '',
            images: Array.isArray(data.images) ? data.images : [],
          };
        });
        setEntries(list);
        setEntriesLoading(false);

        if (selectedEntry) {
          const updated = list.find((e) => e.id === selectedEntry.id);
          if (updated) setSelectedEntry(updated);
        }
      },
      (err) => {
        console.error(err);
        setEntriesLoading(false);
      }
    );

    return () => unsub();
  }, [user, selectedEntry]);

  /* ------------------------------ 공통 UI ------------------------------- */

  const LogoutButton = () =>
    user ? (
      <button
        type="button"
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          border: 'none',
          background: 'none',
          fontSize: 11,
          color: Colors.textSub,
          cursor: 'pointer',
          textDecoration: 'underline',
          zIndex: 20,
        }}
      >
        로그아웃
      </button>
    ) : null;

  /* ------------------------------ 폼 열기 ------------------------------- */

  const handleOpenForm = (entry: any = null) => {
    if (entry) {
      setFormData({
        ...entry,
        images: entry.images
          ? entry.images.map((url: string) => ({ url, file: null }))
          : [],
      });
    } else {
      setFormData({
        id: null,
        date: todayString(),
        teaName: '',
        origin: '',
        variety: '',
        shop: '',
        price: '',
        teaType: 'green',
        subType: '',
        snack: '',
        brewing: [{ temp: '', time: '', water: '' }],
        aromaTags: [],
        taste: { ...initialTaste },
        note: '',
        images: [],
      });
    }
    setMode('form');
  };

  /* --------------------------- 저장 / 삭제 ----------------------------- */

  const handleSave = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('로그인 후 이용해주세요.');
      return;
    }
    if (!formData.teaName.trim()) return;

    const imageUrls = formData.images.map((img: any) => img.url);

    const payload = {
      date: formData.date,
      teaName: formData.teaName.trim(),
      origin: formData.origin.trim(),
      variety: formData.variety.trim(),
      shop: formData.shop.trim(),
      price: formData.price,
      teaType: formData.teaType,
      subType: formData.subType,
      snack: formData.snack.trim(),
      brewing: formData.brewing,
      aromaTags: formData.aromaTags,
      taste: formData.taste,
      note: formData.note.trim(),
      images: imageUrls,
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };

    setSaving(true);
    try {
      if (formData.id) {
        const docRef = doc(db, TEA_COLLECTION, formData.id);
        await updateDoc(docRef, payload);
      } else {
        await addDoc(collection(db, TEA_COLLECTION), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setMode('list');
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, TEA_COLLECTION, id));
      setMode('list');
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  /* ------------------------ 이미지 업로드 핸들러 ------------------------ */

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file) => ({
        url: URL.createObjectURL(file), // ⚠️ 새로고침 후엔 사라짐 (나중에 Storage로 교체)
        file,
      }));
      setFormData((prev: any) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /* ------------------------------ 폼 Props ------------------------------ */

  const formState = { formData };
  const formHandlers = {
    setFormData,
    handleSave,
    closeForm: () => setMode('list'),
    handleImageUpload,
    triggerFileInput,
    fileInputRef,
    saving,
  };

  /* ------------------------------ 렌더링 ------------------------------- */

  if (authLoading) {
    return (
      <div style={Styles.containerWrapper}>
        <div style={Styles.pageContainer}>
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              fontFamily: Fonts.serif,
              fontSize: 14,
            }}
          >
            불러오는 중입니다…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={Styles.containerWrapper}>
        <div style={Styles.pageContainer}>
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontFamily: Fonts.serif,
                fontSize: 20,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              TEA SESSION LOG
            </h1>
            <p
              style={{
                fontSize: 13,
                color: Colors.textSub,
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              구글 계정으로 로그인하면
              <br />
              나만 보는 찻자리 기록장이 열립니다.
            </p>
            <button
              type="button"
              onClick={handleLogin}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: `1px solid ${Colors.accent}`,
                background: '#FFFFFF',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Google 계정으로 로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'list') {
    return (
      <div style={Styles.containerWrapper}>
        <div style={Styles.pageContainer}>
          <LogoutButton />
          {entriesLoading ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontSize: 13,
                color: Colors.textSub,
              }}
            >
              찻자리 기록을 불러오는 중입니다…
            </div>
          ) : (
            <TeaList
              entries={entries}
              openDetail={(entry) => {
                setSelectedEntry(entry);
                setMode('detail');
              }}
            />
          )}
          <button style={Styles.fab} onClick={() => handleOpenForm(null)}>
            <Plus size={24} />
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'detail' && selectedEntry) {
    return (
      <>
        <TeaDetail
          entry={selectedEntry}
          startEdit={(e) => handleOpenForm(e)}
          handleDelete={handleDelete}
          closeDetail={() => setMode('list')}
          setFullImageUrl={setFullImageUrl}
        />
        <FullImageOverlay
          url={fullImageUrl}
          onClose={() => setFullImageUrl(null)}
        />
      </>
    );
  }

  if (mode === 'form') {
    return <TeaForm formState={formState} handlers={formHandlers} />;
  }

  return null;
};

export default TeaPage;
