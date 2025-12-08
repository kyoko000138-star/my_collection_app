import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Camera,
  Image as ImageIcon,
  X,
  Edit2,
  Trash2,
  Search,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
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
 * 공통 스타일 (도록 / 박물관 캡션 느낌)
 * -------------------------------------------------------------------------- */

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
  serif: '"Gowun Batang","Noto Serif KR",serif',
  sans: '"Gowun Batang","Noto Serif KR",serif',
};

// TS 귀찮으니까 any로 통일
const Styles: any = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#E7E3DC',
    minHeight: '100vh',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    minHeight: '100vh',
    backgroundColor: Colors.bg,
    fontFamily: Fonts.serif,
    color: Colors.textMain,
    boxShadow: '0 0 20px rgba(0,0,0,0.06)',
    position: 'relative',
    paddingBottom: '80px',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backdropFilter: 'blur(10px)',
    background: 'rgba(253,251,247,0.96)',
    borderBottom: `1px solid ${Colors.border}`,
    height: 56,
    padding: '0 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  section: {
    padding: '20px 18px',
    borderBottom: `1px solid ${Colors.border}`,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: Colors.textSub,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: Colors.textSub,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '8px 0',
    border: 'none',
    borderBottom: `1px solid ${Colors.border}`,
    background: 'transparent',
    fontSize: 14,
    outline: 'none',
    borderRadius: 0,
  },
  textArea: {
    width: '100%',
    padding: 14,
    borderRadius: 4,
    border: `1px solid ${Colors.border}`,
    background: '#FAF7F2',
    fontSize: 14,
    fontFamily: Fonts.serif,
    lineHeight: 1.7,
    outline: 'none',
    resize: 'none',
    minHeight: 100,
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: (active: boolean) => ({
    padding: '7px 14px',
    borderRadius: 999,
    border: `1px solid ${active ? Colors.accent : Colors.border}`,
    background: active ? Colors.accent : '#FFFFFF',
    color: active ? '#FFFFFF' : Colors.textSub,
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  }),
  chipSoft: (active: boolean) => ({
    padding: '6px 12px',
    borderRadius: 999,
    border: `1px solid ${active ? Colors.accent : Colors.border}`,
    background: active ? Colors.accent : '#FFFFFF',
    color: active ? '#FFFFFF' : Colors.textSub,
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  }),
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 54,
    height: 54,
    borderRadius: '50%',
    border: 'none',
    background: Colors.accent,
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
    cursor: 'pointer',
    zIndex: 40,
  },
  cardHorizontal: {
    background: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    border: `1px solid ${Colors.border}`,
    display: 'flex',
    gap: 10,
    boxShadow: `0 2px 8px rgba(0,0,0,0.03)`,
    cursor: 'pointer',
  },
  uploadButton: {
    width: '100%',
    height: 48,
    borderRadius: 4,
    border: `1px dashed ${Colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FAF7F2',
    color: Colors.textSub,
    cursor: 'pointer',
    fontSize: 13,
    gap: 8,
    marginBottom: 12,
  },
};

/* -------------------------------------------------------------------------- */
/* 설정값들 (통화, 분류, 상태/태그)                                           */
/* -------------------------------------------------------------------------- */

const CURRENCY_OPTIONS = [
  { id: 'KRW', label: 'KRW', symbol: '₩' },
  { id: 'JPY', label: 'JPY', symbol: '¥' },
  { id: 'USD', label: 'USD', symbol: '$' },
  { id: 'CNY', label: 'CNY', symbol: '元' },
];

const CONDITION_OPTIONS = ['매우 좋음', '양호', '사용감 있음', '손상 있음'];

const USAGE_TAG_OPTIONS = [
  '문향용',
  '찻자리용',
  '전시용',
  '일상 사용',
  '수리 필요',
  '판매 후보',
];

const CATEGORY_MAP: Record<string, string[]> = {
  향목: [
    '가라',
    '사소라',
    '촌문다라',
    '마나가',
    '마나반',
    '라국',
    '침향',
    '백단',
  ],
  향도구: ['향로', '향합', '향판·향받침', '향꽂이·향통', '향도구 기타'],
  다구: ['다관', '숙우', '거름망·차체', '다구 세트', '다구 기타'],
  찻잔: ['찻잔', '잔단지·잔받침', '찻잔 세트', '찻잔 기타'],
  다완: ['다완', '농차완', '박차완', '다완 기타'],
  '차호·주전자': ['차호', '주전자', '차호·주전자 기타'],
  '합·함·상자': ['합', '함', '상자', '합·함·상자 기타'],
  '책·자료': ['책', '도록', '팜플릿·자료', '기록·노트', '책·자료 기타'],
  기타: ['기타'],
};

const COLLECTION_NAME = 'collectionItems';

const todayString = () => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/* 파일 → base64 data URL 변환 (IncensePage와 동일)                           */
/* -------------------------------------------------------------------------- */

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* -------------------------------------------------------------------------- */
/* 타입 정의                                                                  */
/* -------------------------------------------------------------------------- */

interface CollectionItem {
  id: string;
  name: string;
  mainCategory: string;
  subCategory: string;
  date: string;
  priceAmount: number | null;
  priceCurrency: string;
  shop: string;
  locationNote: string;
  notes: string;
  material: string;
  period: string;
  size: string;
  weight: string;
  condition: string;
  tags: string[];
  imageUrls: string[]; // Firestore에는 여전히 배열로 저장
}

interface FormImage {
  url: string; // data URL
  file: File | null;
}

/* -------------------------------------------------------------------------- */
/* 보조 컴포넌트                                                              */
/* -------------------------------------------------------------------------- */

const ImageStrip = ({
  images,
  onClick,
  onRemove,
}: {
  images: string[];
  onClick?: (url: string, index: number) => void;
  onRemove?: (index: number) => void;
}) => (
  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
    {images.map((url, i) => (
      <div
        key={i}
        style={{
          position: 'relative',
          width: 70,
          height: 70,
          flexShrink: 0,
        }}
      >
        <img
          src={url}
          alt={`thumb-${i}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 4,
            border: `1px solid ${Colors.border}`,
            cursor: onClick ? 'pointer' : 'default',
          }}
          onClick={() => onClick && onClick(url, i)}
        />
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(i);
            }}
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 5,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>
    ))}
  </div>
);

const FullImageOverlay = ({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) =>
  !url ? null : (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.96)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={url}
        alt="full"
        style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }}
      />
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          color: '#FFF',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <X size={30} />
      </button>
    </div>
  );

const formatPrice = (amount: number | null, currency: string) => {
  if (amount == null) return '―';
  const cur =
    CURRENCY_OPTIONS.find((c) => c.id === currency) || CURRENCY_OPTIONS[0];
  return `${cur.symbol} ${amount.toLocaleString()}`;
};

/* -------------------------------------------------------------------------- */
/* 메인 컴포넌트                                                              */
/* -------------------------------------------------------------------------- */

const CollectionsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [items, setItems] = useState<CollectionItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [mode, setMode] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMain, setFilterMain] = useState<string>('전체');
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // ✅ 여기 추가!
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  const [formData, setFormData] = useState<{
    id: string | null;
    name: string;
    mainCategory: string;
    subCategory: string;
    date: string;
    priceAmount: string;
    priceCurrency: string;
    shop: string;
    locationNote: string;
    notes: string;
    material: string;
    period: string;
    size: string;
    weight: string;
    condition: string;
    tags: string[];
    images: FormImage[];
  }>({
    id: null,
    name: '',
    mainCategory: '향목',
    subCategory: CATEGORY_MAP['향목'][0],
    date: todayString(),
    priceAmount: '',
    priceCurrency: 'KRW',
    shop: '',
    locationNote: '',
    notes: '',
    material: '',
    period: '',
    size: '',
    weight: '',
    condition: '양호',
    tags: [],
    images: [],
  });

  /* ---------------------------- Auth & Firestore ------------------------- */

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    setItemsLoading(true);

    const colRef = collection(db, COLLECTION_NAME);
    // 🔹 인덱스 필요 없는 가장 단순 쿼리: userId 조건만
    const qRef = query(colRef, where('userId', '==', user.uid));

    const unsub = onSnapshot(
      qRef,
      (snapshot) => {
        const list: CollectionItem[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name ?? '',
            mainCategory: data.mainCategory ?? '향목',
            subCategory:
              data.subCategory ??
              CATEGORY_MAP[data.mainCategory ?? '향목'][0],
            date: data.date ?? todayString(),
            priceAmount:
              typeof data.priceAmount === 'number' ? data.priceAmount : null,
            priceCurrency: data.priceCurrency ?? 'KRW',
            shop: data.shop ?? '',
            locationNote: data.locationNote ?? '',
            notes: data.notes ?? '',
            material: data.material ?? '',
            period: data.period ?? '',
            size: data.size ?? '',
            weight: data.weight ?? '',
            condition: data.condition ?? '양호',
            tags: Array.isArray(data.tags) ? data.tags : [],
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          };
        });

        // 🔹 날짜 기준 최신순 정렬 (YYYY-MM-DD라 문자열 정렬 가능)
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        setItems(list);
        setItemsLoading(false);

        if (selectedItem) {
          const updated = list.find((it) => it.id === selectedItem.id);
          if (updated) setSelectedItem(updated);
        }
      },
      (err) => {
        console.error(err);
        setItemsLoading(false);
      },
    );

    return () => unsub();
  }, [user, selectedItem]);

  /* ---------------------- 공통: 폼 열기/초기값 채우기 --------------------- */

  const openForm = (item: CollectionItem | null) => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        mainCategory: item.mainCategory || '향목',
        subCategory:
          item.subCategory || CATEGORY_MAP[item.mainCategory || '향목'][0],
        date: item.date || todayString(),
        priceAmount:
          item.priceAmount != null ? String(item.priceAmount) : '',
        priceCurrency: item.priceCurrency || 'KRW',
        shop: item.shop || '',
        locationNote: item.locationNote || '',
        notes: item.notes || '',
        material: item.material || '',
        period: item.period || '',
        size: item.size || '',
        weight: item.weight || '',
        condition: item.condition || '양호',
        tags: item.tags || [],
        images: (item.imageUrls || []).map((url) => ({ url, file: null })),
      });
    } else {
      setFormData({
        id: null,
        name: '',
        mainCategory: '향목',
        subCategory: CATEGORY_MAP['향목'][0],
        date: todayString(),
        priceAmount: '',
        priceCurrency: 'KRW',
        shop: '',
        locationNote: '',
        notes: '',
        material: '',
        period: '',
        size: '',
        weight: '',
        condition: '양호',
        tags: [],
        images: [],
      });
    }
    setMode('form');
  };

  /* ----------------------------- 저장 / 삭제 ----------------------------- */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('홈 화면에서 먼저 로그인해 주세요.');
      return;
    }
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const amountNumber = formData.priceAmount
        ? Number(formData.priceAmount)
        : null;

      // 🔹 IncensePage와 동일: 폼의 images 배열 → imageUrls
      const imageUrls = formData.images.map((img) => img.url);

      const payload = {
        name: formData.name.trim(),
        mainCategory: formData.mainCategory,
        subCategory: formData.subCategory,
        date: formData.date,
        priceAmount: Number.isNaN(amountNumber) ? null : amountNumber,
        priceCurrency: formData.priceCurrency,
        shop: formData.shop.trim(),
        locationNote: formData.locationNote.trim(),
        notes: formData.notes.trim(),
        material: formData.material.trim(),
        period: formData.period.trim(),
        size: formData.size.trim(),
        weight: formData.weight.trim(),
        condition: formData.condition,
        tags: formData.tags,
        imageUrls,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      };

      if (formData.id) {
        const docRef = doc(db, COLLECTION_NAME, formData.id);
        await updateDoc(docRef, payload);
        setSelectedItem({ ...(payload as any), id: formData.id });
      } else {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setSelectedItem({ ...(payload as any), id: docRef.id });
      }

      setMode('detail');
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
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(null);
      }
      setMode('list');
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  /* --------------------------- 이미지 업로드 ------------------------------ */

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages: FormImage[] = [];

    for (const file of fileArray) {
      const url = await fileToDataUrl(file);
      newImages.push({ url, file });
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));

    // 같은 파일 다시 선택 가능하도록 리셋
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /* ------------------------------ 필터링 로직 ----------------------------- */

  const filteredItems = items.filter((item) => {
    const catOk = filterMain === '전체' || item.mainCategory === filterMain;
    const term = searchTerm.trim().toLowerCase();
    const searchOk =
      !term ||
      [item.name, item.shop, item.material, item.period]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(term));
    return catOk && searchOk;
  });

  /* ====================================================================== */
  /*  Auth 상태에 따른 분기                                                 */
  /* ====================================================================== */

  if (authLoading) {
    return (
      <div style={Styles.wrapper}>
        <div style={Styles.container}>
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
    // 홈에서 로그인 안 했는데 직접 URL로 들어온 경우
    return (
      <div style={Styles.wrapper}>
        <div style={Styles.container}>
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
              MY COLLECTION
            </h1>
            <p
              style={{
                fontSize: 13,
                color: Colors.textSub,
                lineHeight: 1.7,
              }}
            >
              소장품 기록장은
              <br />
              홈 화면에서 로그인 후 이용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /*  VIEW 1. 리스트 (갤러리)                                              */
  /* ====================================================================== */

  if (mode === 'list') {
    return (
      <div style={Styles.wrapper}>
        <div style={Styles.container}>
          <main style={{ padding: '1px 18px' }}>
            {/* 검색창 */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 999,
                  border: `1px solid ${Colors.border}`,
                  padding: '8px 12px',
                  background: '#FFFFFF',
                }}
              >
                <Search size={16} color={Colors.textSub} />
                <input
                  type="text"
                  placeholder="이름, 작가, 구매처로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    flex: 1,
                    fontSize: 13,
                    background: 'transparent',
                  }}
                />
              </div>
            </div>

            {/* 대분류 필터 */}
            <div style={{ marginBottom: 16, overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
                {['전체', ...Object.keys(CATEGORY_MAP)].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterMain(cat)}
                    style={Styles.chip(filterMain === cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 리스트 */}
            {itemsLoading ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  fontSize: 13,
                  color: Colors.textSub,
                }}
              >
                소장품 목록을 불러오는 중입니다…
              </div>
            ) : filteredItems.length === 0 ? (
              <div
                style={{
                  padding: '60px 20px',
                  borderRadius: 4,
                  border: `1px dashed ${Colors.border}`,
                  textAlign: 'center',
                  color: Colors.textSub,
                  background: '#FAF7F2',
                }}
              >
                <p style={{ fontFamily: Fonts.serif, fontSize: 14 }}>
                  아직 등록된 소장품이 없습니다.
                </p>
                <p style={{ marginTop: 8, fontSize: 12 }}>
                  우측 하단의 + 버튼을 눌러 첫 기록을 남겨 보세요.
                </p>
              </div>
            ) : (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    style={Styles.cardHorizontal}
                    onClick={() => {
                      setSelectedItem(item);
                      setMode('detail');
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: '#F2F0EC',
                        border: `1px solid ${Colors.border}`,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.imageUrls?.length ? (
                        <img
                          src={item.imageUrls[0]}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <ImageIcon size={20} color={Colors.textSub} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 4,
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 6,
                            alignItems: 'center',
                          }}
                        >
                          {item.date && (
                            <span
                              style={{ fontSize: 11, color: Colors.textSub }}
                            >
                              {item.date.replace(/-/g, '.')}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 11,
                              color: Colors.textSub,
                              borderRadius: 999,
                              border: `1px solid ${Colors.border}`,
                              padding: '1px 8px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.mainCategory} · {item.subCategory}
                          </span>
                          {item.condition && (
                            <span
                              style={{
                                fontSize: 11,
                                color: Colors.textSub,
                                borderRadius: 999,
                                border: `1px solid ${Colors.border}`,
                                padding: '1px 8px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.condition}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openForm(item);
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={16} color={Colors.textSub} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={16} color={Colors.danger} />
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: Fonts.serif,
                          fontSize: 16,
                          fontWeight: 700,
                          marginBottom: 4,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: Colors.textSub,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        {item.period && <span>{item.period}</span>}
                        {item.shop && <span>· {item.shop}</span>}
                        {item.priceAmount != null && (
                          <span>
                            ·{' '}
                            {formatPrice(item.priceAmount, item.priceCurrency)}
                          </span>
                        )}
                        {item.material && <span>· {item.material}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* FAB */}
          <button style={Styles.fab} onClick={() => openForm(null)}>
            <Plus size={24} />
          </button>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /*  VIEW 2. 상세 – 도록 / 전시 캡션 스타일                                */
  /* ====================================================================== */

  if (mode === 'detail' && selectedItem) {
    const i = selectedItem;
    const sizeWeightText =
      [i.size, i.weight].filter((v) => v && v.trim().length > 0).join(' / ') ||
      '―';

    return (
      <div style={Styles.wrapper}>
        <div style={Styles.container}>
          <header style={Styles.header}>
            <button
              onClick={() => setMode('list')}
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <ArrowLeft size={22} />
            </button>
            <div style={{ display: 'flex', gap: 14 }}>
              <button
                onClick={() => openForm(selectedItem)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <Edit2 size={18} color={Colors.textSub} />
              </button>
              <button
                onClick={() => handleDelete(i.id)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={18} color={Colors.danger} />
              </button>
            </div>
          </header>

          <main style={{ padding: '24px 18px 32px' }}>
            {/* 상단 제목 블록 */}
            <section style={{ marginBottom: 26, textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: Colors.textSub,
                  marginBottom: 8,
                }}
              >
                {i.mainCategory} · {i.subCategory}
              </div>
              <h1
                style={{
                  fontFamily: Fonts.serif,
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginBottom: 8,
                }}
              >
                {i.name}
              </h1>
              <div style={{ fontSize: 12, color: Colors.textSub }}>
                {i.date && i.date.replace(/-/g, '.')} /{' '}
                {i.shop || '구매처 미기록'}
              </div>
            </section>

            {/* 이미지 (인센스 상세뷰 스타일, 450px 박스) */}
            {i.imageUrls?.length > 0 && (
              <section
                style={{
                  marginBottom: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={i.imageUrls[currentImageIndex]}
                    alt={`collection-${currentImageIndex}`}
                    style={{
                      width: '100%',
                      maxWidth: 450,
                      height: 450,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: `1px solid ${Colors.border}`,
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      setFullImage(i.imageUrls[currentImageIndex])
                    }
                  />

                  {i.imageUrls.length > 1 && (
                    <>
                      {/* 왼쪽 화살표 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === 0
                              ? i.imageUrls.length - 1
                              : prev - 1,
                          );
                        }}
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <ArrowLeft size={18} />
                      </button>

                      {/* 오른쪽 화살표 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === i.imageUrls.length - 1
                              ? 0
                              : prev + 1,
                          );
                        }}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <ArrowRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {/* 아래 점(슬라이드 인디케이터) */}
                {i.imageUrls.length > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      justifyContent: 'center',
                      marginTop: 4,
                    }}
                  >
                    {i.imageUrls.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          border: 'none',
                          padding: 0,
                          backgroundColor:
                            idx === currentImageIndex
                              ? Colors.textMain
                              : '#E0E0E0',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
            
            {/* 상세 스펙 */}
            <section
              style={{
                borderTop: `1px solid ${Colors.border}`,
                borderBottom: `1px solid ${Colors.border}`,
                padding: '18px 0',
                marginBottom: 26,
                fontSize: 13,
                lineHeight: 1.9,
                fontFamily: Fonts.serif,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '88px 1fr',
                  rowGap: 4,
                }}
              >
                <div style={{ fontWeight: 600 }}>재질</div>
                <div>{i.material || '―'}</div>

                <div style={{ fontWeight: 600 }}>추정 연대</div>
                <div>{i.period || '―'}</div>

                <div style={{ fontWeight: 600 }}>크기 · 무게</div>
                <div>{sizeWeightText}</div>

                <div style={{ fontWeight: 600 }}>구매일</div>
                <div>{i.date || '―'}</div>

                <div style={{ fontWeight: 600 }}>구매가</div>
                <div>{formatPrice(i.priceAmount, i.priceCurrency)}</div>

                <div style={{ fontWeight: 600 }}>구매처</div>
                <div>{i.shop || '―'}</div>

                <div style={{ fontWeight: 600 }}>상태</div>
                <div>{i.condition || '―'}</div>
              </div>
            </section>

            {/* 상태 태그 */}
            <section style={{ marginBottom: 26 }}>
              <div style={Styles.sectionTitle}>상태 · 태그</div>
              <div style={Styles.chipRow}>
                {USAGE_TAG_OPTIONS.map((tag) => (
                  <span
                    key={tag}
                    style={Styles.chipSoft(i.tags?.includes(tag))}
                  >
                    {tag}
                  </span>
                ))}
                {(!i.tags || i.tags.length === 0) && (
                  <span style={{ fontSize: 12, color: Colors.textSub }}>
                    태그가 없습니다.
                  </span>
                )}
              </div>
            </section>

            {/* 위치 메모 */}
            <section style={{ marginBottom: 26 }}>
              <div style={Styles.sectionTitle}>LOCATION NOTE</div>
              <p
                style={{
                  fontFamily: Fonts.serif,
                  fontSize: 14,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {i.locationNote ||
                  '예) 내 방 책장 1단, 왼쪽에서 두 번째 칸, 뒤쪽 줄...'}
              </p>
            </section>

            {/* 기록 메모 */}
            <section>
              <div style={Styles.sectionTitle}>MEMO</div>
              <p
                style={{
                  fontFamily: Fonts.serif,
                  fontSize: 14,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {i.notes || '메모가 없습니다.'}
              </p>
            </section>
          </main>

          <FullImageOverlay
            url={fullImage}
            onClose={() => setFullImage(null)}
          />
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /*  VIEW 3. 작성 / 수정 폼                                               */
  /* ====================================================================== */

  if (mode === 'form') {
    const handleClose = () =>
      formData.id && selectedItem ? setMode('detail') : setMode('list');

    return (
      <div style={Styles.wrapper}>
        <div style={{ ...Styles.container, position: 'relative' }}>
          {/* 상단 X 버튼 */}
          <button
            type="button"
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 1,
              left: 5,
              width: 32,
              height: 10,
              borderRadius: '999px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <form onSubmit={handleSave} style={{ paddingBottom: 40 }}>
            {/* 사진 (파일 업로드 방식) */}
            <section style={{ ...Styles.section, paddingTop: 56 }}>
              <div style={{ marginBottom: 8 }}>
                <span style={Styles.label}>사진</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
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
                      onClick={() => {}}
                      onRemove={(idx) =>
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== idx),
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </section>

            {/* 기본 정보 */}
            <section style={Styles.section}>
              <div style={{ marginBottom: 18 }}>
                <span style={Styles.label}>소장품 이름</span>
                <input
                  type="text"
                  style={Styles.input}
                  placeholder="예: 청자 향로"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 18,
                  marginBottom: 18,
                }}
              >
                <div>
                  <span style={Styles.label}>구매일</span>
                  <input
                    type="date"
                    style={Styles.input}
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <span style={Styles.label}>구매가</span>
                  <input
                    type="number"
                    style={Styles.input}
                    value={formData.priceAmount}
                    placeholder="0"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priceAmount: e.target.value,
                      }))
                    }
                  />
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    {CURRENCY_OPTIONS.map((cur) => (
                      <button
                        key={cur.id}
                        type="button"
                        style={Styles.chipSoft(
                          formData.priceCurrency === cur.id,
                        )}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            priceCurrency: cur.id,
                          }))
                        }
                      >
                        {cur.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <span style={Styles.label}>구매처</span>
                <input
                  type="text"
                  style={Styles.input}
                  placeholder="예: 인사동 고미술"
                  value={formData.shop}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, shop: e.target.value }))
                  }
                />
              </div>

              <div>
                <span style={Styles.label}>추정 연대</span>
                <input
                  type="text"
                  style={Styles.input}
                  placeholder="예: 에도 후기(19세기 전반)"
                  value={formData.period}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      period: e.target.value,
                    }))
                  }
                />
              </div>
            </section>

            {/* 분류 */}
            <section style={Styles.section}>
              <div style={{ marginBottom: 14 }}>
                <div style={Styles.label}>대분류</div>
                <div style={Styles.chipRow}>
                  {Object.keys(CATEGORY_MAP).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      style={Styles.chip(formData.mainCategory === cat)}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          mainCategory: cat,
                          subCategory: CATEGORY_MAP[cat][0],
                        }))
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={Styles.label}>소분류</div>
                <div style={Styles.chipRow}>
                  {CATEGORY_MAP[formData.mainCategory].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      style={Styles.chip(formData.subCategory === sub)}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, subCategory: sub }))
                      }
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 상세 스펙 */}
            <section style={Styles.section}>
              <div style={{ marginBottom: 16 }}>
                <span style={Styles.label}>재질</span>
                <input
                  type="text"
                  style={Styles.input}
                  placeholder="예: 자기, 백자, 동, 옻칠 목재..."
                  value={formData.material}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      material: e.target.value,
                    }))
                  }
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 18,
                }}
              >
                <div>
                  <span style={Styles.label}>크기</span>
                  <input
                    type="text"
                    style={Styles.input}
                    placeholder="예: 높이 8.5cm, 구경 6.4cm"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, size: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <span style={Styles.label}>무게</span>
                  <input
                    type="text"
                    style={Styles.input}
                    placeholder="예: 약 210g"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        weight: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </section>

            {/* 상태 · 태그 */}
            <section style={Styles.section}>
              <div style={{ marginBottom: 14 }}>
                <div style={Styles.label}>상태</div>
                <div style={Styles.chipRow}>
                  {CONDITION_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={Styles.chipSoft(formData.condition === c)}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, condition: c }))
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={Styles.label}>태그</div>
                <div style={Styles.chipRow}>
                  {USAGE_TAG_OPTIONS.map((tag) => {
                    const active = formData.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        style={Styles.chipSoft(active)}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            tags: active
                              ? prev.tags.filter((t) => t !== tag)
                              : [...prev.tags, tag],
                          }))
                        }
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 위치 / 메모 */}
            <section style={Styles.section}>
              <div style={{ marginBottom: 18 }}>
                <span style={Styles.label}>위치 메모</span>
                <textarea
                  style={Styles.textArea}
                  placeholder="예: 내 방 책장 1단, 왼쪽에서 두 번째 칸, 뒤쪽 줄..."
                  value={formData.locationNote}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      locationNote: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <span style={Styles.label}>기록 메모</span>
                <textarea
                  style={Styles.textArea}
                  placeholder="이 기물을 만나게 된 계기, 상태, 향/차와의 궁합 등을 자유롭게 적어 보세요."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>
            </section>

            {/* 저장 버튼 */}
            <div style={{ padding: '18px 18px 0' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 4,
                  border: 'none',
                  background: Colors.accent,
                  color: '#FFF',
                  fontFamily: Fonts.serif,
                  fontSize: 16,
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? '저장 중...'
                  : formData.id
                  ? '수정 완료'
                  : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default CollectionsPage;
