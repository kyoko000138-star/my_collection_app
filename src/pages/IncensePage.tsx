import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Waves,
  Edit2,
  Trash2,
  Camera,
  X,
  ArrowLeft,
  Smile,
  Frown,
  Zap,
  Heart,
  Coffee,
} from 'lucide-react';

import { auth, db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

/* -------------------------------------------------------------------------- */
/* 1. 디자인 시스템 & 스타일 */
/* -------------------------------------------------------------------------- */

const Colors = {
  bg: '#FDFDFD',
  cardBg: '#FFFFFF',
  textMain: '#1A1A1A',
  textSub: '#888888',
  accent: '#2C2C2C',
  slider: '#B0B0B0',
  border: '#E0E0E0',
  activeBg: '#F5F5F5',
  warm: '#E07A5F',
  cool: '#81B0D4',
  danger: '#D32F2F',
};

const Fonts = {
  serif: '"Gowun Batang", serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

// TS 귀찮으니까 any로 통일
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
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: '18px',
    fontWeight: 700,
    color: Colors.textMain,
  },
  section: {
    padding: '24px 20px',
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
  select: {
    padding: '10px 20px 10px 0',
    border: 'none',
    borderBottom: `1px solid ${Colors.border}`,
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: Colors.textMain,
    borderRadius: 0,
    outline: 'none',
    fontFamily: Fonts.sans,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: 'none',
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
    gap: '6px',
  },
  chipRowTight: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'flex-start',
  },
  chip: (active: boolean) => ({
    padding: '8px 14px',
    borderRadius: '20px',
    border: `1px solid ${active ? Colors.textMain : Colors.border}`,
    backgroundColor: active ? Colors.textMain : 'transparent',
    color: active ? '#FFFFFF' : Colors.textSub,
    fontSize: '13px',
    fontWeight: active ? 500 : 400,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
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
    backgroundColor: Colors.textMain,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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
  sliderFill: (pct: number, color: string) => ({
    position: 'absolute',
    height: '2px',
    width: `${pct}%`,
    backgroundColor: color,
    borderRadius: '2px',
  }),
  sliderThumb: (pct: number, color: string) => ({
    position: 'absolute',
    left: `${pct}%`,
    width: '12px',
    height: '12px',
    backgroundColor: '#FFFFFF',
    border: `2px solid ${color}`,
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
};

const todayString = () => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/* 2. 데이터 상수 */
/* -------------------------------------------------------------------------- */

const initialAroma = {
  spicy: 1,
  sweet: 1,
  sour: 1,
  bitter: 1,
  salty: 1,
  nutty: 1,
  creamy: 1,
  refreshing: 1,
  floral: 1,
  fruity: 1,
  woody: 1,
  herbal: 1,
  damp: 1,
  dry: 1,
};

const WEATHER_OPTIONS = [
  { id: 'sunny', label: '맑음', icon: <Sun size={14} /> },
  { id: 'cloudy', label: '흐림', icon: <Cloud size={14} /> },
  { id: 'rainy', label: '비', icon: <CloudRain size={14} /> },
  { id: 'snowy', label: '눈', icon: <Snowflake size={14} /> },
  { id: 'fog', label: '안개', icon: <Waves size={14} /> },
];

const MOOD_OPTIONS = [
  { id: 'joy', label: '기쁨', icon: <Smile size={14} /> },
  { id: 'delight', label: '즐거움', icon: <Heart size={14} /> },
  { id: 'boredom', label: '권태', icon: <Coffee size={14} /> },
  { id: 'sadness', label: '슬픔', icon: <Frown size={14} /> },
  { id: 'melancholy', label: '우울', icon: <CloudRain size={14} /> },
  { id: 'anxiety', label: '불안', icon: <Zap size={14} /> },
];

const HEATING_OPTIONS = [
  { id: 'charcoal', label: '숯' },
  { id: 'electric', label: '전기향로' },
];

const RIKKOKU_OPTIONS = [
  { id: 'gara', label: '가라' },
  { id: 'rakoku', label: '라국' },
  { id: 'sasora', label: '사소라' },
  { id: 'manaka', label: '마나가' },
  { id: 'manaban', label: '마나반' },
  { id: 'sonbundara', label: '촌문다라' },
  { id: 'jinko', label: '침향' },
];

const RIKKOKU_ROW1_IDS = ['gara', 'rakoku', 'sasora', 'manaka'];
const RIKKOKU_ROW2_IDS = ['manaban', 'sonbundara', 'jinko'];

const GOMI_OPTIONS = [
  { id: 'san', label: '산 (酸)' },
  { id: 'ku', label: '고 (苦)' },
  { id: 'kan', label: '감 (甘)' },
  { id: 'shin', label: '신 (辛)' },
  { id: 'kan_salty', label: '함 (鹹)' },
];

const CURRENCY_OPTIONS = [
  { id: 'KRW', label: 'KRW', symbol: '₩' },
  { id: 'JPY', label: 'JPY', symbol: '¥' },
  { id: 'CNY', label: 'CNY', symbol: '위안' },
  { id: 'USD', label: 'USD', symbol: '$' },
];

const AROMA_LABELS = [
  { key: 'spicy', label: '매운맛' },
  { key: 'sweet', label: '단맛' },
  { key: 'sour', label: '신맛' },
  { key: 'bitter', label: '쓴맛' },
  { key: 'salty', label: '짠맛' },
  { key: 'nutty', label: '고소한' },
  { key: 'creamy', label: '크리미' },
  { key: 'refreshing', label: '청량감' },
  { key: 'floral', label: '꽃' },
  { key: 'fruity', label: '과일' },
  { key: 'woody', label: '나무' },
  { key: 'herbal', label: '약초' },
  { key: 'damp', label: '축축한' },
  { key: 'dry', label: '건조한' },
];

const warmCoolColor = (pos: number) => {
  if (pos <= 2) return Colors.cool;
  if (pos >= 4) return Colors.warm;
  return Colors.textSub;
};

/* -------------------------------------------------------------------------- */
/* 3. 유틸 컴포넌트 */
/* -------------------------------------------------------------------------- */

const SVGRadarChart = ({ values }: { values: any }) => {
  const size = 240;
  const center = size / 2;
  const radius = 90;
  const angleStep = (Math.PI * 2) / AROMA_LABELS.length;
  const levels = [1, 2, 3, 4, 5];

  const getPoint = (index: number, value: number, maxVal = 5) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const dataPoints = AROMA_LABELS.map((label, i) =>
    getPoint(i, values[label.key] || 0),
  );
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 0',
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
            strokeWidth={0.5}
            opacity={0.8}
          />
        ))}
        {AROMA_LABELS.map((_, i) => {
          const p = getPoint(i, 5);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke={Colors.border}
              strokeWidth={0.5}
              opacity={0.8}
            />
          );
        })}
        <polygon
          points={polygonPoints}
          fill={`${Colors.textMain}1A`}
          stroke={Colors.textMain}
          strokeWidth={1}
        />
        {AROMA_LABELS.map((label, i) => {
          const p = getPoint(i, 5);
          const labelX = center + (radius + 15) * Math.cos(p.angle);
          const labelY = center + (radius + 15) * Math.sin(p.angle);
          const anchor =
            labelX < center - 10
              ? 'end'
              : labelX > center + 10
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
              fontSize={10}
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

const CustomSlider = ({
  value,
  min = 0,
  max,
  onChange,
  color = Colors.slider,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (val: number) => void;
  color?: string;
}) => {
  const safeValue = Math.max(min, Math.min(value, max));
  const pct = ((safeValue - min) / (max - min)) * 100;

  return (
    <div style={Styles.sliderContainer}>
      <div style={Styles.sliderTrack} />
      <div style={Styles.sliderFill(pct, color)} />
      <div style={Styles.sliderThumb(pct, color)} />
      <input
        type="range"
        min={min}
        max={max}
        value={safeValue}
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

/* -------------------------------------------------------------------------- */
/* 4. 메인 페이지 (Firestore 연동) */
/* -------------------------------------------------------------------------- */

type AromaState = typeof initialAroma;

interface IncenseEntry {
  id: string;
  date: string;
  incenseName: string;
  purchasePlace: string;
  purchasePrice: number | null;
  purchaseCurrency: string;
  heatingMethod: 'charcoal' | 'electric';
  weather: string;
  mood?: string;
  rikkoku?: string;
  gomi: string[];
  aroma: AromaState;
  warmCool: number;
  note: string;
  imageUrls: string[];
}

interface FormImage {
  url: string;
  file: File | null;
}

interface FormData {
  id: string | null; // Firestore doc id
  date: string;
  incenseName: string;
  purchasePlace: string;
  purchasePrice: string;
  purchaseCurrency: string;
  heatingMethod: 'charcoal' | 'electric';
  weather: string;
  mood?: string;
  rikkoku?: string;
  gomi: string[];
  aroma: AromaState;
  warmCool: number;
  note: string;
  images: FormImage[];
}

const IncensePage = () => {
  const [entries, setEntries] = useState<IncenseEntry[]>([]);
  const [mode, setMode] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedEntry, setSelectedEntry] = useState<IncenseEntry | null>(null);
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    id: null,
    date: todayString(),
    incenseName: '',
    purchasePlace: '',
    purchasePrice: '',
    purchaseCurrency: 'KRW',
    heatingMethod: 'charcoal',
    weather: 'sunny',
    mood: undefined,
    rikkoku: undefined,
    gomi: [],
    aroma: { ...initialAroma },
    warmCool: 3,
    note: '',
    images: [],
  });

  /* --------------------------- Firestore 구독 --------------------------- */

  useEffect(() => {
    // 익명 로그인
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((err) => {
          console.error('Anonymous sign-in failed', err);
        });
      }
    });

    const colRef = collection(db, 'incenseEntries');
    const q = query(colRef, orderBy('date', 'desc'), orderBy('createdAt', 'desc'));

    const unsubSnap = onSnapshot(
      q,
      (snapshot) => {
        const list: IncenseEntry[] = snapshot.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            date: data.date || todayString(),
            incenseName: data.incenseName || '',
            purchasePlace: data.purchasePlace || '',
            purchasePrice:
              typeof data.purchasePrice === 'number'
                ? data.purchasePrice
                : data.purchasePrice
                ? Number(data.purchasePrice)
                : null,
            purchaseCurrency: data.purchaseCurrency || 'KRW',
            heatingMethod: (data.heatingMethod as any) || 'charcoal',
            weather: data.weather || 'sunny',
            mood: data.mood,
            rikkoku: data.rikkoku,
            gomi: Array.isArray(data.gomi) ? data.gomi : [],
            aroma: { ...initialAroma, ...(data.aroma || {}) },
            warmCool:
              typeof data.warmCool === 'number' ? data.warmCool : 3,
            note: data.note || '',
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          };
        });
        setEntries(list);
      },
      (err) => {
        console.error('incenseEntries onSnapshot error', err);
      },
    );

    return () => {
      unsubAuth();
      unsubSnap();
    };
  }, []);

  /* --------------------------- 폼 열기/리셋 --------------------------- */

  const resetForm = () => {
    setFormData({
      id: null,
      date: todayString(),
      incenseName: '',
      purchasePlace: '',
      purchasePrice: '',
      purchaseCurrency: 'KRW',
      heatingMethod: 'charcoal',
      weather: 'sunny',
      mood: undefined,
      rikkoku: undefined,
      gomi: [],
      aroma: { ...initialAroma },
      warmCool: 3,
      note: '',
      images: [],
    });
  };

  const handleOpenForm = (entry: IncenseEntry | null = null) => {
    if (entry) {
      setFormData({
        id: entry.id,
        date: entry.date,
        incenseName: entry.incenseName,
        purchasePlace: entry.purchasePlace,
        purchasePrice: entry.purchasePrice
          ? String(entry.purchasePrice)
          : '',
        purchaseCurrency: entry.purchaseCurrency || 'KRW',
        heatingMethod: entry.heatingMethod,
        weather: entry.weather,
        mood: entry.mood,
        rikkoku: entry.rikkoku,
        gomi: entry.gomi || [],
        aroma: { ...initialAroma, ...(entry.aroma || {}) },
        warmCool: entry.warmCool ?? 3,
        note: entry.note || '',
        images: (entry.imageUrls || []).map((url) => ({
          url,
          file: null,
        })),
      });
    } else {
      resetForm();
    }
    setMode('form');
  };

  /* --------------------------- 저장 / 삭제 --------------------------- */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.incenseName.trim()) return;

    const imageUrls = formData.images.map((img) => img.url);

    const payload: any = {
      date: formData.date,
      incenseName: formData.incenseName.trim(),
      purchasePlace: formData.purchasePlace.trim(),
      purchasePrice: formData.purchasePrice
        ? Number(formData.purchasePrice)
        : null,
      purchaseCurrency: formData.purchaseCurrency,
      heatingMethod: formData.heatingMethod,
      weather: formData.weather,
      mood: formData.mood || null,
      rikkoku: formData.rikkoku || null,
      gomi: formData.gomi,
      aroma: formData.aroma,
      warmCool: formData.warmCool,
      note: formData.note,
      imageUrls,
      updatedAt: serverTimestamp(),
    };

    try {
      if (formData.id) {
        const docRef = doc(db, 'incenseEntries', formData.id);
        await updateDoc(docRef, payload);
      } else {
        const colRef = collection(db, 'incenseEntries');
        await addDoc(colRef, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setMode('list');
      resetForm();
    } catch (err) {
      console.error('Saving incense entry failed', err);
      alert('저장 중 오류가 발생했어요. 콘솔 로그를 확인해줘!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const docRef = doc(db, 'incenseEntries', id);
      await deleteDoc(docRef);
      setMode('list');
      setSelectedEntry(null);
    } catch (err) {
      console.error('Delete incense entry failed', err);
      alert('삭제 중 오류가 발생했어요.');
    }
  };

  /* --------------------------- 이미지 업로드 --------------------------- */

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: FormImage[] = Array.from(e.target.files).map(
        (file) => ({
          url: URL.createObjectURL(file),
          file,
        }),
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /* ------------------------------- 리스트 뷰 ------------------------------ */

  if (mode === 'list') {
    return (
      <div style={Styles.containerWrapper}>
        <div style={Styles.pageContainer}>
          {/* 상단 여백 (PRIVATE ARCHIVE 헤더와 간격) */}
          <div style={{ padding: '1px 20px 8px' }}></div>

          <div style={{ padding: '0 20px 20px' }}>
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
                  아직 기록이 없습니다.
                </p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  우측 하단의 + 버튼을 눌러 기록을 시작하세요.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {entries.map((entry) => {
                  const rikkokuLabel = RIKKOKU_OPTIONS.find(
                    (r) => r.id === entry.rikkoku,
                  )?.label;

                  const gomiLabels = (entry.gomi || [])
                    .map(
                      (g) =>
                        GOMI_OPTIONS.find((o) => o.id === g)?.label,
                    )
                    .filter(Boolean)
                    .join(' · ');

                  const notePreview =
                    entry.note && entry.note.length > 40
                      ? entry.note.slice(0, 40) + '…'
                      : entry.note;

                  return (
                    <div
                      key={entry.id}
                      style={Styles.card}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setMode('detail');
                      }}
                    >
                      {/* 1줄 – 날짜 / 문향 방식 */}
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
                            color: Colors.accent,
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {entry.date.replace(/-/g, '.')}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: Colors.textSub,
                            border: `1px solid ${Colors.border}`,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {entry.heatingMethod === 'charcoal'
                            ? '숯'
                            : '전기향로'}
                        </span>
                      </div>

                      {/* 2줄 – 향 이름 */}
                      <h3
                        style={{
                          fontFamily: Fonts.serif,
                          fontSize: '18px',
                          fontWeight: 700,
                          color: Colors.textMain,
                          marginBottom: '8px',
                          lineHeight: 1.3,
                        }}
                      >
                        {entry.incenseName}
                      </h3>

                      {/* 3줄 – 육국 / 날씨·마음 */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: gomiLabels || notePreview ? 4 : 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '12px',
                            color: Colors.textSub,
                          }}
                        >
                          {rikkokuLabel && <span>{rikkokuLabel}</span>}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            flexShrink: 0,
                          }}
                        >
                          {entry.weather && (
                            <span style={{ fontSize: '12px' }}>
                              {
                                WEATHER_OPTIONS.find(
                                  (w) => w.id === entry.weather,
                                )?.icon
                              }
                            </span>
                          )}
                          {entry.mood && (
                            <span style={{ fontSize: '12px' }}>
                              {
                                MOOD_OPTIONS.find(
                                  (m) => m.id === entry.mood,
                                )?.icon
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 4줄 – 오미 */}
                      {gomiLabels && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: Colors.textSub,
                            marginBottom: notePreview ? 4 : 0,
                          }}
                        >
                          {gomiLabels}
                        </div>
                      )}

                      {/* 5줄 – 메모 프리뷰 */}
                      {notePreview && (
                        <p
                          style={{
                            fontSize: '12px',
                            color: Colors.textSub,
                            lineHeight: 1.5,
                          }}
                        >
                          {notePreview}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button style={Styles.fab} onClick={() => handleOpenForm(null)}>
            <Plus size={24} />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------- 상세 뷰 ------------------------------ */

  if (mode === 'detail' && selectedEntry) {
    const weather = WEATHER_OPTIONS.find(
      (w) => w.id === selectedEntry.weather,
    );
    const mood = MOOD_OPTIONS.find((m) => m.id === selectedEntry.mood);
    const rikkokuLabel = RIKKOKU_OPTIONS.find(
      (r) => r.id === selectedEntry.rikkoku,
    )?.label;
    const gomiLabels = selectedEntry.gomi
      ?.map((g) => GOMI_OPTIONS.find((o) => o.id === g)?.label)
      .join(', ');
    const currencySymbol =
      CURRENCY_OPTIONS.find(
        (c) => c.id === (selectedEntry.purchaseCurrency || 'KRW'),
      )?.symbol || '₩';

    return (
      <div style={Styles.containerWrapper}>
        <div style={Styles.pageContainer}>
          <div style={Styles.header}>
            <button
              onClick={() => setMode('list')}
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
                onClick={() => handleOpenForm(selectedEntry)}
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
                onClick={() => handleDelete(selectedEntry.id)}
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
                {selectedEntry.date.replace(/-/g, '.')}
              </span>
              <h1
                style={{
                  fontFamily: Fonts.serif,
                  fontSize: '26px',
                  fontWeight: 700,
                  color: Colors.textMain,
                }}
              >
                {selectedEntry.incenseName}
              </h1>
            </div>

            {selectedEntry.imageUrls?.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <ImageStrip
                  images={selectedEntry.imageUrls}
                  onImageClick={setFullImageUrl}
                />
              </div>
            )}

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
                <span style={Styles.label}>문향 방식</span>
                <span
                  style={{
                    fontSize: '15px',
                    color: Colors.textMain,
                    fontFamily: Fonts.serif,
                  }}
                >
                  {selectedEntry.heatingMethod === 'charcoal'
                    ? '숯'
                    : '전기향로'}
                </span>
              </div>
              <div>
                <span style={Styles.label}>오늘의 날씨 / 마음</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '15px', color: Colors.textMain }}>
                    {weather?.icon}
                  </span>
                  <span style={{ fontSize: '15px', color: Colors.textMain }}>
                    {mood?.icon}
                  </span>
                </div>
              </div>
              {(selectedEntry.purchasePlace ||
                selectedEntry.purchasePrice) && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={Styles.label}>구입 정보</span>
                  <div
                    style={{
                      fontSize: '15px',
                      color: Colors.textMain,
                      fontFamily: Fonts.serif,
                    }}
                  >
                    {selectedEntry.purchasePlace}{' '}
                    {selectedEntry.purchasePrice
                      ? `(${currencySymbol}${Number(
                          selectedEntry.purchasePrice,
                        ).toLocaleString()})`
                      : ''}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h3 style={Styles.sectionTitle}>향의 인상</h3>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {rikkokuLabel && (
                  <span style={Styles.chip(true)}>{rikkokuLabel}</span>
                )}
                {gomiLabels && (
                  <span style={Styles.chip(true)}>{gomiLabels}</span>
                )}
              </div>
              <div style={{ marginBottom: '32px' }}>
                <SVGRadarChart values={selectedEntry.aroma} />
              </div>
              <div>
                <span style={Styles.label}>향의 온도</span>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: Colors.cool }}>
                    차가움
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div
                        key={num}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor:
                            selectedEntry.warmCool === num
                              ? warmCoolColor(num)
                              : '#E0E0E0',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: Colors.warm }}>
                    따뜻함
                  </span>
                </div>
              </div>
            </div>

            {selectedEntry.note && (
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
                  {selectedEntry.note}
                </p>
              </div>
            )}
          </div>
          <FullImageOverlay
            url={fullImageUrl}
            onClose={() => setFullImageUrl(null)}
          />
        </div>
      </div>
    );
  }

  /* ------------------------------- 입력 폼 ------------------------------ */

  if (mode === 'form') {
    return (
      <div style={Styles.containerWrapper}>
        <div style={Styles.pageContainer}>
          {/* 상단 X 버튼 */}
          <div
            style={{
              padding: '4px 20px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('list');
                resetForm();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: Colors.textMain,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color={Colors.textMain} />
            </button>
          </div>

          <form style={{ padding: '0 20px 24px' }}>
            {/* 기본 정보 */}
            <div style={{ ...Styles.section, paddingBottom: 1 }}>
              <div style={Styles.inputGroup}>
                <span style={Styles.label}>문향 날짜</span>
                <input
                  type="date"
                  style={Styles.input}
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={Styles.label}>향 이름</span>
                <input
                  type="text"
                  style={Styles.input}
                  placeholder="예: 침향 조각"
                  value={formData.incenseName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      incenseName: e.target.value,
                    })
                  }
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: 0,
                }}
              >
                <div style={Styles.inputGroup}>
                  <span style={Styles.label}>구매처</span>
                  <input
                    type="text"
                    style={Styles.input}
                    value={formData.purchasePlace}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasePlace: e.target.value,
                      })
                    }
                  />
                </div>
                <div style={Styles.inputGroup}>
                  <span style={Styles.label}>구매가</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <select
                      style={{
                        ...Styles.select,
                        width: '50px',
                        marginRight: '8px',
                      }}
                      value={formData.purchaseCurrency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseCurrency: e.target.value,
                        })
                      }
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      style={{ ...Styles.input, flex: 1 }}
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchasePrice: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 문향 환경 */}
            <div
              style={{
                ...Styles.section,
                paddingTop: 10,
                paddingBottom: 1,
              }}
            >
              <h3
                style={{
                  ...Styles.sectionTitle,
                  marginTop: 0,
                  marginBottom: 12,
                }}
              >
                문향 환경
              </h3>

              <div style={Styles.inputGroup}>
                <span style={Styles.label}>문향 방식</span>
                <div style={Styles.chipRowTight}>
                  {HEATING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      style={Styles.chip(formData.heatingMethod === opt.id)}
                      onClick={() =>
                        setFormData({ ...formData, heatingMethod: opt.id as any })
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={Styles.inputGroup}>
                <span style={Styles.label}>오늘의 날씨</span>
                <div style={Styles.chipRowTight}>
                  {WEATHER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      style={Styles.chip(formData.weather === opt.id)}
                      onClick={() =>
                        setFormData({ ...formData, weather: opt.id })
                      }
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={Styles.inputGroup}>
                <span style={Styles.label}>오늘의 마음</span>
                <div style={Styles.chipRowTight}>
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      style={Styles.chip(formData.mood === opt.id)}
                      onClick={() =>
                        setFormData({ ...formData, mood: opt.id })
                      }
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 향의 인상 */}
            <div style={Styles.section}>
              <h3 style={Styles.sectionTitle}>향의 인상</h3>

              {/* 육국 */}
              <div style={Styles.inputGroup}>
                <span style={Styles.label}>육국</span>
                <div>
                  <div style={Styles.chipRowTight}>
                    {RIKKOKU_ROW1_IDS.map((id) => {
                      const opt = RIKKOKU_OPTIONS.find((o) => o.id === id)!;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          style={Styles.chip(formData.rikkoku === opt.id)}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              rikkoku:
                                formData.rikkoku === opt.id
                                  ? undefined
                                  : opt.id,
                            })
                          }
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ ...Styles.chipRowTight, marginTop: 6 }}>
                    {RIKKOKU_ROW2_IDS.map((id) => {
                      const opt = RIKKOKU_OPTIONS.find((o) => o.id === id)!;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          style={Styles.chip(formData.rikkoku === opt.id)}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              rikkoku:
                                formData.rikkoku === opt.id
                                  ? undefined
                                  : opt.id,
                            })
                          }
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 오미 */}
              <div style={Styles.inputGroup}>
                <span style={Styles.label}>오미</span>
                <div style={Styles.chipRowTight}>
                  {GOMI_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      style={Styles.chip(formData.gomi.includes(opt.id))}
                      onClick={() => {
                        const newGomi = formData.gomi.includes(opt.id)
                          ? formData.gomi.filter((id) => id !== opt.id)
                          : [...formData.gomi, opt.id];
                        setFormData({ ...formData, gomi: newGomi });
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 레이더 + 슬라이더 */}
              <div style={{ margin: '32px 0' }}>
                <SVGRadarChart values={formData.aroma} />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px 16px',
                }}
              >
                {AROMA_LABELS.map((axis) => (
                  <div key={axis.key}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '2px',
                      }}
                    >
                      <span
                        style={{ fontSize: '12px', color: Colors.textSub }}
                      >
                        {axis.label}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: Colors.textMain,
                        }}
                      >
                        {formData.aroma[axis.key]}
                      </span>
                    </div>
                    <CustomSlider
                      max={5}
                      value={formData.aroma[axis.key]}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          aroma: { ...prev.aroma, [axis.key]: val },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '32px' }}>
                <span style={Styles.label}>향의 온도</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: Colors.cool }}>
                    차가움
                  </span>
                  <div style={{ flex: 1 }}>
                    <CustomSlider
                      min={1}
                      max={5}
                      value={formData.warmCool}
                      onChange={(val) =>
                        setFormData({ ...formData, warmCool: val })
                      }
                      color={warmCoolColor(formData.warmCool)}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: Colors.warm }}>
                    따뜻함
                  </span>
                </div>
              </div>
            </div>

            {/* 사진 및 메모 */}
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
                        images={formData.images.map((i) => i.url)}
                        onImageClick={() => {}}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div style={Styles.inputGroup}>
                <span style={Styles.label}>감상 메모</span>
                <textarea
                  style={Styles.textArea}
                  placeholder="향의 느낌, 떠오르는 이미지, 공간의 분위기..."
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
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: Colors.textMain,
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: Fonts.serif,
                }}
              >
                저장하기
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default IncensePage;
