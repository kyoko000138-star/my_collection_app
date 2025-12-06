// src/App.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  MapPin,
  Plus,
  Calendar,
  Clock,
  Star,
  Trash2,
  Edit2,
  X,
  Camera,
  Save,
  Image as ImageIcon,
  Wallet,
  List,
  LayoutGrid,
  Landmark,
  Utensils,
  Coffee,
  ShoppingBag,
  Bed,
  Train,
  CreditCard,
  Banknote,
  AlertCircle,
  Globe,
} from 'lucide-react';

import { auth, db, appId } from '../firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// --- 스타일 (폰트 + 공통 클래스) ---
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

  body { font-family: 'Noto Sans KR', sans-serif; color: #2c2c2c; background-color: #fffefc; }
  h1, h2, h3, h4, .serif { font-family: 'Gowun Batang', serif; }

  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

  .input-base {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: white;
    border: 1px solid #e5e5e5;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-base:focus {
    border-color: #78716c;
    box-shadow: 0 0 0 2px rgba(120, 113, 108, 0.2);
  }

  .select-base {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-chevron-down'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1em;
  }

  input[type="date"] {
    position: relative;
  }
  input[type="date"]::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
`;

// --- 상수 데이터/헬퍼 ---
const getTodayDate = () => new Date().toISOString().split('T')[0];

const PLACE_TYPES = [
  {
    id: 'culture',
    label: '문화/예술',
    icon: Landmark,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    id: 'sight',
    label: '관광',
    icon: Camera,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    id: 'food',
    label: '맛집',
    icon: Utensils,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    id: 'cafe',
    label: '카페',
    icon: Coffee,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
  },
  {
    id: 'shopping',
    label: '쇼핑',
    icon: ShoppingBag,
    color: 'text-pink-600',
    bg: 'bg-pink-100',
  },
  {
    id: 'stay',
    label: '숙소',
    icon: Bed,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    id: 'transport',
    label: '이동',
    icon: Train,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    id: 'etc',
    label: '기타',
    icon: MapPin,
    color: 'text-stone-600',
    bg: 'bg-stone-200',
  },
];

const COST_CATEGORIES = [
  { id: 'entrance', label: '입장료/관람' },
  { id: 'meal', label: '식사' },
  { id: 'cafe', label: '카페/디저트' },
  { id: 'shopping', label: '쇼핑/기념품' },
  { id: 'experience', label: '문화체험' },
  { id: 'transport', label: '교통' },
  { id: 'stay', label: '숙소' },
  { id: 'etc', label: '기타' },
];

const CURRENCIES = [
  { id: 'KRW', label: 'KRW', symbol: '₩' },
  { id: 'JPY', label: 'JPY', symbol: '¥' },
  { id: 'USD', label: 'USD', symbol: '$' },
  { id: 'EUR', label: 'EUR', symbol: '€' },
];

const PAYMENT_METHODS = [
  { id: 'card', label: '카드', icon: CreditCard },
  { id: 'cash', label: '현금', icon: Banknote },
];

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const normalizeName = (name?: string) =>
  name ? name.replace(/\s+/g, '').toLowerCase() : '';

const calculateDayNumber = (
  startDateStr: string,
  currentDateStr: string | undefined
) => {
  const start = new Date(startDateStr);
  const current = new Date(currentDateStr || startDateStr);
  if (isNaN(start.getTime()) || isNaN(current.getTime())) return null;
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

const formatPrice = (p?: number) =>
  p ? new Intl.NumberFormat('ko-KR').format(p) : 0;

// --- 타입 정의 ---
type Stop = {
  id: number;
  name: string;
  majorRegion?: string;
  minorRegion?: string;
  type: string;
  description?: string;
  cost?: number | string;
  currency: string;
  costCategory: string;
  paymentMethod: string;
  menu?: string;
  photos: string[];
  satisfaction: number;
  visitTime?: string;
  stopDate?: string;
  createdAt?: string;
};

type Trip = {
  id: string;
  title: string;
  date: string;
  endDate: string;
  stops: Stop[];
  createdAt?: { seconds: number };
};

// ✅ newStop 초기화용 팩토리 함수
const createInitialStop = (): Stop => ({
  id: Date.now(),
  name: '',
  majorRegion: '',
  minorRegion: '',
  type: 'sight',
  description: '',
  cost: '',
  currency: 'JPY',
  costCategory: 'entrance',
  paymentMethod: 'card',
  menu: '',
  photos: [],
  satisfaction: 3,
  visitTime: '',
});

// --- 서브 컴포넌트 ---
const ImageSlider: React.FC<{
  images: string[];
  readOnly?: boolean;
  onRemove?: (idx: number) => void;
  mode?: 'cover' | 'contain';
}> = ({ images, readOnly = false, onRemove, mode = 'cover' }) => {
  if (!images || images.length === 0) return null;

  return (
    <div
      className={`w-full h-full relative group ${
        mode === 'contain' ? 'bg-black' : ''
      }`}
    >
      <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center"
          >
            <img
              src={img}
              className={`w-full h-full ${
                mode === 'contain' ? 'object-contain' : 'object-cover'
              }`}
              alt={`slide-${idx}`}
            />
            {!readOnly && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(idx);
                }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full z-20 hover:bg-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full z-10 pointer-events-none">
          <span className="font-bold">TOTAL</span> {images.length}
        </div>
      )}
    </div>
  );
};

const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-1">
            정말 삭제하시겠습니까?
          </h3>
          <p className="text-sm text-stone-500">
            삭제된 데이터는 복구할 수 없습니다.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

const StarRating: React.FC<{
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: number;
}> = ({ value, onChange, readOnly = false, size = 16 }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={(e) => {
            if (!readOnly && onChange) {
              e.preventDefault();
              e.stopPropagation();
              onChange(star);
            }
          }}
          className={`transition-colors ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 p-0.5'
          }`}
          disabled={readOnly}
          type="button"
        >
          <Star
            size={size}
            className={
              star <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
            }
          />
        </button>
      ))}
    </div>
  );
};

// ----------------- 메인 컴포넌트 -----------------
const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<
    'travel_list' | 'travel_detail' | 'travel_create_form'
  >('travel_list');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [mainListTab, setMainListTab] = useState<'trips' | 'archive'>('trips');
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [activeTripTab, setActiveTripTab] = useState<'timeline' | 'archive'>(
    'timeline'
  );

  const [newTrip, setNewTrip] = useState({
    title: '',
    date: getTodayDate(),
    endDate: getTodayDate(),
    stops: [] as Stop[],
  });

  const [newStop, setNewStop] = useState<Stop>(createInitialStop());

  const [editingStopId, setEditingStopId] = useState<number | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    colName: 'trips' | 'trips_stops' | null;
    id: string | number | null;
    parentId?: string | null;
  }>({ isOpen: false, colName: null, id: null, parentId: null });

  const [isTripSaving, setIsTripSaving] = useState(false);
  const [isStopSaving, setIsStopSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // 메인 스크롤 영역 ref (뷰 전환 시 맨 위로 올리기용)
  const mainRef = useRef<HTMLDivElement | null>(null);

  // ---- Auth & Firestore 구독 ----
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Auth init failed:', error);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'trips');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Trip[] = snapshot.docs.map((d: any) => {
        const data = d.data() || {};
        const stops: Stop[] = Array.isArray(data.stops) ? data.stops : [];

        return {
          id: d.id,
          title: data.title || '',
          date: data.date || getTodayDate(),
          endDate: data.endDate || data.date || getTodayDate(),
          stops,
          createdAt: data.createdAt,
        };
      });

      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      setTrips(list);
    });

    return () => unsubscribe();
  }, [user]);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  // 뷰 전환 시 항상 스크롤 맨 위로
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [view]);

  // ---- 통계 ----
  const globalPlaceStats = useMemo(() => {
    const allStops = trips.flatMap((t) => t.stops || []);
    const map: any = {};
    allStops.forEach((stop) => {
      const key = normalizeName(stop.name);
      if (!map[key]) {
        map[key] = {
          name: stop.name,
          type: stop.type,
          visits: 0,
          majorRegion: stop.majorRegion || '기타',
          minorRegion: stop.minorRegion,
          totalCost: { KRW: 0, JPY: 0, USD: 0, EUR: 0 },
          history: [] as Stop[],
        };
      }
      map[key].visits += 1;
      const curr = stop.currency || 'KRW';
      map[key].totalCost[curr] += Number(stop.cost) || 0;
      map[key].history.push(stop);
    });
    return Object.values(map).sort((a: any, b: any) => b.visits - a.visits);
  }, [trips]);

  const tripPlaceStats = useMemo(() => {
    const stops = selectedTrip?.stops || [];
    const map: any = {};
    stops.forEach((stop) => {
      const key = normalizeName(stop.name);
      if (!map[key]) {
        map[key] = {
          name: stop.name,
          type: stop.type,
          visits: 0,
          majorRegion: stop.majorRegion || '기타',
          minorRegion: stop.minorRegion,
          totalCost: { KRW: 0, JPY: 0, USD: 0, EUR: 0 },
          history: [] as Stop[],
        };
      }
      map[key].visits += 1;
      const curr = stop.currency || 'KRW';
      map[key].totalCost[curr] += Number(stop.cost) || 0;
      map[key].history.push(stop);
    });
    return Object.values(map).sort((a: any, b: any) => b.visits - a.visits);
  }, [selectedTrip]);

  const availableRegions = useMemo(() => {
    const regions = new Set<string>(['전체']);
    (globalPlaceStats as any[]).forEach((p) => {
      if (p.majorRegion) regions.add(p.majorRegion);
    });
    return Array.from(regions);
  }, [globalPlaceStats]);

  // ---- 이미지 추가/삭제 ----
  const handleAddImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        setIsImageUploading(true);
        try {
          const newImages = await Promise.all(files.map((f) => resizeImage(f)));
          setNewStop((prev) => ({
            ...prev,
            photos: [...(prev.photos || []), ...newImages],
          }));
        } catch (e) {
          console.error('Image resize failed:', e);
        } finally {
          setIsImageUploading(false);
        }
      }
    },
    []
  );

  const handleRemoveImage = (idx: number) => {
    setNewStop((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  const getDayInfo = (trip: Trip | null, dateStr?: string) => {
    if (!trip || !trip.date) return { dayNum: 1 };
    const dateToCheck = dateStr || trip.date;
    const diffDays = calculateDayNumber(trip.date, dateToCheck);
    return { dayNum: diffDays };
  };

  const calculateTripTotal = (stops: Stop[]) => {
    return stops.reduce(
      (acc, stop) => {
        const curr = stop.currency || 'KRW';
        const cost = Number(stop.cost) || 0;
        acc[curr] = (acc[curr] || 0) + cost;
        return acc;
      },
      { KRW: 0, JPY: 0, USD: 0, EUR: 0 } as Record<string, number>
    );
  };

  // ---- CRUD (여정 / 스탑) ----
  const handleSaveTrip = async () => {
    // 1) 입력 값 검증
    if (!newTrip.title.trim()) return;

    // 2) 유저 체크
    if (!user) {
      alert('로그인이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setIsTripSaving(true);

    // 날짜 보정
    const start = newTrip.date;
    const end =
      newTrip.endDate && newTrip.endDate >= newTrip.date
        ? newTrip.endDate
        : newTrip.date;

    const colRef = collection(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'trips'
    );

    const data = {
      ...newTrip,
      date: start,
      endDate: end,
      stops: [],
      updatedAt: serverTimestamp(),
    };

    // UI 먼저 전환
    setNewTrip({
      title: '',
      date: getTodayDate(),
      endDate: getTodayDate(),
      stops: [],
    });
    setView('travel_list');

    try {
      await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      // onSnapshot 이 알아서 갱신
    } catch (e) {
      console.error('Trip save failed:', e);
      alert('여정 저장 중 오류가 발생했어요. (콘솔을 확인해 주세요)');
    } finally {
      setIsTripSaving(false);
    }
  };

  const handleSaveStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStop.name.trim() || !selectedTrip || !user) return;

    setIsStopSaving(true);

    try {
      const stopDate = newStop.stopDate || getTodayDate();

      let updatedStops = selectedTrip.stops || [];

      const newStopData: Stop = {
        ...newStop,
        cost: Number(newStop.cost) || 0,
        stopDate,
      };

      if (editingStopId !== null) {
        // 수정 모드
        updatedStops = updatedStops.map((stop) =>
          stop.id === editingStopId
            ? {
                ...newStopData,
                id: editingStopId,
                createdAt: stop.createdAt,
              }
            : stop
        );
      } else {
        // 신규 추가
        updatedStops.push({
          ...newStopData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        });
      }

      // createdAt 기준 정렬
      updatedStops.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
        return aTime - bTime;
      });

      // 폼 리셋용 값
      const resetStop: Stop = {
        ...createInitialStop(),
        majorRegion: newStop.majorRegion,
        minorRegion: newStop.minorRegion,
        currency: newStop.currency,
        costCategory: newStop.costCategory,
        paymentMethod: newStop.paymentMethod,
        type: newStop.type,
        satisfaction: newStop.satisfaction,
      };

      // UI 먼저 업데이트
      setTrips((prev) =>
        prev.map((t) =>
          t.id === selectedTrip.id ? { ...t, stops: updatedStops } : t
        )
      );
      setNewStop(resetStop);
      setEditingStopId(null);

      // Firestore 동기화
      await updateDoc(
        doc(
          db,
          'artifacts',
          appId,
          'users',
          user.uid,
          'trips',
          selectedTripId!
        ),
        { stops: updatedStops, updatedAt: serverTimestamp() }
      );
    } catch (e) {
      console.error('Stop save failed:', e);
      alert('방문 기록 저장 중 오류가 발생했어요. (콘솔을 확인해 주세요)');
    } finally {
      setIsStopSaving(false);
    }
  };

  const executeDelete = async () => {
    const { colName, id, parentId } = deleteModalState;
    if (!colName || !id || !user) return;

    // 1) 화면 상태 먼저 업데이트
    if (colName === 'trips') {
      setTrips((prev) => prev.filter((t) => t.id !== id));
      if (selectedTripId === id) {
        setSelectedTripId(null);
        setView('travel_list');
      }
    } else if (colName === 'trips_stops' && parentId) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === parentId
            ? { ...t, stops: (t.stops || []).filter((s) => s.id !== id) }
            : t
        )
      );
    }

    // 2) 모달 닫기
    setDeleteModalState({
      isOpen: false,
      colName: null,
      id: null,
      parentId: null,
    });

    // 3) Firestore 동기화
    try {
      if (colName === 'trips') {
        await deleteDoc(
          doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id as string)
        );
      } else if (colName === 'trips_stops' && parentId) {
        const tripDocRef = doc(
          db,
          'artifacts',
          appId,
          'users',
          user.uid,
          'trips',
          parentId
        );
        const tripToUpdate = trips.find((t) => t.id === parentId);
        if (tripToUpdate) {
          const updatedStops = (tripToUpdate.stops || []).filter(
            (stop) => stop.id !== id
          );
          await updateDoc(tripDocRef, {
            stops: updatedStops,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // ---- 공통 Archive 렌더러 ----
  const ArchiveList: React.FC<{ stats: any[]; filterRegion?: boolean }> = ({
    stats,
    filterRegion = false,
  }) => {
    const filteredStats =
      filterRegion && selectedRegion !== '전체'
        ? stats.filter((p) => p.majorRegion === selectedRegion)
        : stats;

    if (filterRegion) {
      return (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {availableRegions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedRegion === region
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {filteredStats.length === 0 ? (
            <div className="p-12 text-center text-stone-400 bg-white/50 rounded-2xl border border-stone-100 border-dashed">
              {selectedRegion === '전체'
                ? '방문한 장소가 없습니다.'
                : `"${selectedRegion}" 지역의 방문 기록이 없습니다.`}
            </div>
          ) : (
            filteredStats.map((place: any, idx: number) => {
              const typeInfo =
                PLACE_TYPES.find((t) => t.id === place.type) || PLACE_TYPES[7];
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-serif font-bold text-lg text-stone-800">
                        {place.name}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded ${typeInfo.bg} ${typeInfo.color} font-bold`}
                        >
                          {typeInfo.label}
                        </span>
                        {place.majorRegion && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-500 font-bold">
                            {place.majorRegion}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-serif font-bold text-stone-800">
                        {place.visits}회
                      </span>
                      <span className="text-xs text-stone-400">방문</span>
                    </div>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 text-sm space-y-1 mb-2">
                    <span className="text-xs font-bold text-stone-400 uppercase">
                      누적 지출
                    </span>
                    <div className="flex flex-wrap gap-2 font-mono font-medium text-stone-700">
                      {Object.entries(place.totalCost).map(([curr, val]) =>
                        (val as number) > 0 ? (
                          <span key={curr}>
                            {
                              CURRENCIES.find((c) => c.id === (curr as string))
                                ?.symbol
                            }
                            {formatPrice(val as number)}
                          </span>
                        ) : null
                      )}
                      {Object.values(place.totalCost).every(
                        (v: any) => v === 0
                      ) && <span className="text-stone-400">-</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      );
    }

    // trip 상세에서 사용하는 기본 모드
    return (
      <div className="space-y-4">
        {stats.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            아직 방문한 장소가 없습니다.
          </div>
        ) : (
          stats.map((place: any, idx: number) => {
            const typeInfo =
              PLACE_TYPES.find((t) => t.id === place.type) || PLACE_TYPES[7];
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-stone-800">
                      {place.name}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${typeInfo.bg} ${typeInfo.color} font-bold`}
                    >
                      {typeInfo.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-serif font-bold text-stone-800">
                      {place.visits}회
                    </span>
                    <span className="text-xs text-stone-400">방문</span>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 text-sm space-y-1 mb-2">
                  <span className="text-xs font-bold text-stone-400 uppercase">
                    누적 지출
                  </span>
                  <div className="flex flex-wrap gap-2 font-mono font-medium text-stone-700">
                    {Object.entries(place.totalCost).map(([curr, val]) =>
                      (val as number) > 0 ? (
                        <span key={curr}>
                          {CURRENCIES.find((c) => c.id === curr)?.symbol}
                          {formatPrice(val as number)}
                        </span>
                      ) : null
                    )}
                    {Object.values(place.totalCost).every(
                      (v: any) => v === 0
                    ) && <span className="text-stone-400">-</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // ----------- 각 View 렌더링 ------------
  const renderTravelList = () => (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* 탭 바만 남기고, 상단 Travel Archive 텍스트는 제거 (상위 헤더와 중복 방지) */}
      <div className="flex bg-white rounded-xl shadow-sm p-1 border border-stone-100 mb-4 sticky top-0 z-10">
        <button
          onClick={() => setMainListTab('trips')}
          className={`flex-1 py-2.5 font-bold text-sm rounded-lg transition-all ${
            mainListTab === 'trips'
              ? 'bg-stone-800 text-white shadow-md'
              : 'text-stone-500 hover:bg-stone-100'
          }`}
        >
          <List size={16} className="inline-block mr-1" /> 나의 여정
        </button>
        <button
          onClick={() => setMainListTab('archive')}
          className={`flex-1 py-2.5 font-bold text-sm rounded-lg transition-all ${
            mainListTab === 'archive'
              ? 'bg-stone-800 text-white shadow-md'
              : 'text-stone-500 hover:bg-stone-100'
          }`}
        >
          <LayoutGrid size={16} className="inline-block mr-1" /> 장소 보관함
        </button>
      </div>

      {mainListTab === 'trips' ? (
        <>
          <div className="flex justify-between items-center px-1 mb-2">
            <h3 className="text-lg font-serif font-bold text-stone-800">
              최근 기록
            </h3>
            <button
              onClick={() => setView('travel_create_form')}
              className="px-3 py-1.5 bg-stone-800 text-white text-xs font-bold rounded-full hover:bg-stone-700 flex items-center gap-1 shadow-sm"
            >
              <Plus size={14} /> 새 여정
            </button>
          </div>
          {trips.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-2xl border border-stone-200 border-dashed">
              <MapPin size={40} className="mb-2 opacity-20" />
              <p>기록된 여정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => {
                const total = calculateTripTotal(trip.stops || []);
                return (
                  <div
                    key={trip.id}
                    onClick={() => {
                      setSelectedTripId(trip.id);
                      setView('travel_detail');
                    }}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative cursor-pointer hover:shadow-md transition-all active:scale-[0.99] flex justify-between items-center group"
                  >
                    <div>
                      <h3 className="text-xl font-serif font-bold text-stone-800 group-hover:text-amber-700 transition-colors">
                        {trip.title}
                      </h3>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs text-stone-400 font-medium whitespace-nowrap flex items-center gap-1">
                          <Calendar size={12} /> {trip.date} ~ {trip.endDate}
                        </span>
                        <div className="flex gap-4 text-sm text-stone-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {trip.stops?.length || 0}곳
                          </span>
                          <span className="flex items-center gap-1">
                            <Wallet size={14} />
                            {Object.entries(total).map(([curr, val]) =>
                              val > 0 ? (
                                <span key={curr} className="mr-1">
                                  {
                                    CURRENCIES.find((c) => c.id === curr)
                                      ?.symbol
                                  }
                                  {formatPrice(val)}
                                </span>
                              ) : null
                            )}
                            {Object.values(total).every((v) => v === 0) && (
                              <span>0</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModalState({
                          isOpen: true,
                          colName: 'trips',
                          id: trip.id,
                          parentId: null,
                        });
                      }}
                      className="text-stone-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-stone-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 mb-2">
            <h3 className="text-lg font-serif font-bold text-stone-800">
              모든 장소
            </h3>
          </div>
          <ArchiveList stats={globalPlaceStats as any[]} filterRegion={true} />
        </div>
      )}
    </div>
  );

  const renderTravelDetail = () => {
    if (!selectedTrip) return null;
    const total = calculateTripTotal(selectedTrip.stops || []);
    const stopsList = selectedTrip.stops || [];

    return (
      <div className="p-4 space-y-4 animate-fade-in">
        <div className="bg-white p-5 rounded-2xl shadow-md border border-stone-100">
          <h1 className="text-xl font-serif font-bold text-stone-800">
            {selectedTrip.title}
          </h1>
          <div className="text-sm text-stone-500 mt-1 flex items-center gap-1">
            <Calendar size={12} /> {selectedTrip.date} ~ {selectedTrip.endDate}{' '}
            ({calculateDayNumber(selectedTrip.date, selectedTrip.endDate)}일간)
          </div>
          <div className="flex gap-4 text-stone-600 text-sm mt-3 pt-3 border-t border-stone-100">
            <span className="flex items-center gap-1 font-bold">
              <MapPin size={14} /> {stopsList.length}곳
            </span>
            <span className="flex items-center gap-1 font-bold">
              <Wallet size={14} />
              {Object.entries(total).map(([curr, val]) =>
                val > 0 ? (
                  <span key={curr} className="mr-1">
                    {CURRENCIES.find((c) => c.id === curr)?.symbol}
                    {formatPrice(val)}
                  </span>
                ) : null
              )}
              {Object.values(total).every((v) => v === 0) && <span>0</span>}
            </span>
          </div>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm p-1 border border-stone-100">
          <button
            onClick={() => setActiveTripTab('timeline')}
            className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${
              activeTripTab === 'timeline'
                ? 'bg-stone-800 text-white'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <List size={16} className="inline-block mr-1" /> 타임라인
          </button>
          <button
            onClick={() => setActiveTripTab('archive')}
            className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${
              activeTripTab === 'archive'
                ? 'bg-stone-800 text-white'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <LayoutGrid size={16} className="inline-block mr-1" /> 장소 보관함
          </button>
        </div>

        {activeTripTab === 'timeline' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {stopsList.length === 0 ? (
                <div className="py-12 text-center text-stone-400 bg-white/50 rounded-2xl border border-stone-100 border-dashed">
                  아직 기록된 장소가 없습니다.
                  <br />
                  아래 폼에서 첫 기록을 남겨보세요.
                </div>
              ) : (
                <div className="relative pl-4">
                  <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-stone-200 z-0"></div>
                  {stopsList.map((stop) => {
                    const stopDate = stop.stopDate || selectedTrip.date;
                    const dayInfo = getDayInfo(selectedTrip, stopDate);
                    const typeInfo =
                      PLACE_TYPES.find((t) => t.id === stop.type) ||
                      PLACE_TYPES[7];
                    const Icon = typeInfo.icon;
                    const isEditing = editingStopId === stop.id;
                    const payMethod = PAYMENT_METHODS.find(
                      (p) => p.id === stop.paymentMethod
                    );
                    const currSymbol =
                      CURRENCIES.find((c) => c.id === stop.currency)?.symbol ||
                      '';

                    return (
                      <div
                        key={stop.id}
                        className={`relative z-10 flex gap-4 mb-6 ${
                          isEditing ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm bg-stone-200 text-stone-600 box-content mt-1">
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-xl border shadow-sm transition-all border-stone-100">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-[10px] text-stone-400 font-bold bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">
                                  DAY {dayInfo.dayNum}
                                </span>
                                {stop.visitTime && (
                                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                    <Clock size={10} /> {stop.visitTime}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-stone-800 text-lg font-serif">
                                {stop.name}
                              </h4>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setNewStop(stop);
                                  setEditingStopId(stop.id);
                                }}
                                className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                                title="수정"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteModalState({
                                    isOpen: true,
                                    colName: 'trips_stops',
                                    id: stop.id,
                                    parentId: selectedTrip.id,
                                  })
                                }
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs mb-3">
                            <span
                              className={`px-2 py-0.5 rounded ${typeInfo.bg} ${typeInfo.color} font-bold`}
                            >
                              {typeInfo.label}
                            </span>
                            {!!Number(stop.cost) && (
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-bold">
                                {
                                  COST_CATEGORIES.find(
                                    (c) => c.id === stop.costCategory
                                  )?.label
                                }
                              </span>
                            )}
                            {stop.satisfaction > 0 && (
                              <div className="flex items-center">
                                <StarRating
                                  value={stop.satisfaction}
                                  readOnly={true}
                                  size={12}
                                />
                              </div>
                            )}
                          </div>

                          {stop.description && (
                            <p className="text-stone-600 text-sm mb-3 whitespace-pre-wrap bg-stone-50/50 p-2 rounded-lg">
                              {stop.description}
                            </p>
                          )}

                          <div className="bg-stone-50 rounded-lg p-3 text-sm grid gap-2">
                            {!!Number(stop.cost) && (
                              <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                                <span className="text-xs font-bold text-stone-400 uppercase">
                                  비용
                                </span>
                                <div className="flex items-center gap-2 text-stone-800">
                                  <span className="font-mono font-bold text-base">
                                    {currSymbol}
                                    {formatPrice(stop.cost as number)}
                                  </span>
                                  {payMethod && (
                                    <span className="text-[10px] text-stone-400 flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-stone-100">
                                      <payMethod.icon size={10} />{' '}
                                      {payMethod.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex items-start">
                              <span className="text-xs font-bold text-stone-400 uppercase min-w-[3rem] mt-0.5">
                                내용
                              </span>
                              <span className="text-stone-700 font-medium flex-1 text-sm">
                                {stop.menu || '-'}
                              </span>
                            </div>
                          </div>

                          {stop.photos && stop.photos.length > 0 && (
                            <div className="h-32 mt-3 rounded-lg overflow-hidden border border-stone-200">
                              <ImageSlider
                                images={stop.photos}
                                readOnly={true}
                                mode="cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 추가/수정 폼 */}
            <div className="p-5 bg-white rounded-2xl shadow-lg border border-stone-200 relative">
              <h3 className="font-serif font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
                {editingStopId ? (
                  <>
                    <Edit2 size={18} className="text-amber-600" /> 기록 수정
                  </>
                ) : (
                  <>
                    <Plus size={18} /> 새 방문 기록
                  </>
                )}
              </h3>
              <form onSubmit={handleSaveStop} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-400 ml-1">
                    장소명
                  </label>
                  <input
                    type="text"
                    className="input-base h-11"
                    placeholder="예: 료안사"
                    value={newStop.name}
                    onChange={(e) =>
                      setNewStop({ ...newStop, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 ml-1">
                      지역(대)
                    </label>
                    <input
                      type="text"
                      className="input-base h-11"
                      placeholder="예: 교토"
                      value={newStop.majorRegion}
                      onChange={(e) =>
                        setNewStop({ ...newStop, majorRegion: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 ml-1">
                      지역(소)
                    </label>
                    <input
                      type="text"
                      className="input-base h-11"
                      placeholder="예: 우쿄구"
                      value={newStop.minorRegion}
                      onChange={(e) =>
                        setNewStop({ ...newStop, minorRegion: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 ml-1">
                      방문 시간
                    </label>
                    <input
                      type="time"
                      className="input-base h-11"
                      value={newStop.visitTime}
                      onChange={(e) =>
                        setNewStop({ ...newStop, visitTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 ml-1">
                      만족도
                    </label>
                    <div className="input-base flex items-center h-11 px-3 justify-center bg-stone-50">
                      <StarRating
                        value={newStop.satisfaction}
                        onChange={(val) =>
                          setNewStop({ ...newStop, satisfaction: val })
                        }
                        size={20}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-400 ml-1">
                    유형
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLACE_TYPES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewStop({ ...newStop, type: t.id })}
                        className={`text-xs py-2 px-3 rounded-full border transition-all flex items-center gap-1 ${
                          newStop.type === t.id
                            ? 'bg-stone-800 text-white border-stone-800'
                            : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <t.icon size={12} /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-bold text-stone-400 ml-1">
                        비용
                      </label>
                      <div className="flex items-center input-base h-11 p-0 overflow-hidden">
                        <span className="bg-stone-100 h-full flex items-center justify-center w-10 text-stone-500 font-bold text-sm">
                          {
                            CURRENCIES.find((c) => c.id === newStop.currency)
                              ?.symbol
                          }
                        </span>
                        <input
                          type="number"
                          className="flex-1 p-2 bg-transparent border-none outline-none text-sm"
                          placeholder="0"
                          value={newStop.cost as any}
                          onChange={(e) =>
                            setNewStop({
                              ...newStop,
                              cost: e.target.value as any,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-xs font-bold text-stone-400 ml-1">
                        통화
                      </label>
                      <select
                        className="input-base select-base h-11 py-0"
                        value={newStop.currency}
                        onChange={(e) =>
                          setNewStop({ ...newStop, currency: e.target.value })
                        }
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-400 ml-1">
                        지출 구분
                      </label>
                      <select
                        className="input-base select-base h-11 py-0 text-sm"
                        value={newStop.costCategory}
                        onChange={(e) =>
                          setNewStop({
                            ...newStop,
                            costCategory: e.target.value,
                          })
                        }
                      >
                        {COST_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-400 ml-1">
                        결제 수단
                      </label>
                      <div className="flex bg-stone-100 p-1 rounded-lg h-11">
                        {PAYMENT_METHODS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setNewStop({ ...newStop, paymentMethod: m.id })
                            }
                            className={`flex-1 flex items-center justify-center gap-1 text-xs rounded-md transition-all ${
                              newStop.paymentMethod === m.id
                                ? 'bg-white text-stone-800 shadow-sm font-bold'
                                : 'text-stone-400'
                            }`}
                          >
                            <m.icon size={12} /> {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 ml-1">
                      상세 내역 (메뉴 등)
                    </label>
                    <input
                      type="text"
                      className="input-base h-11"
                      placeholder="예: 입장권 1매 + 기념품"
                      value={newStop.menu}
                      onChange={(e) =>
                        setNewStop({ ...newStop, menu: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-400 ml-1">
                    메모
                  </label>
                  <textarea
                    className="input-base resize-none"
                    rows={3}
                    placeholder="어떤 점이 좋았나요?"
                    value={newStop.description}
                    onChange={(e) =>
                      setNewStop({ ...newStop, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-400 ml-1">
                    사진 ({newStop.photos.length}장)
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:border-stone-400 transition-all bg-stone-50 shrink-0"
                    >
                      <Camera size={20} />
                    </button>
                    {(newStop.photos || []).map((photo, idx) => (
                      <div key={idx} className="relative group shrink-0">
                        <img
                          src={photo}
                          alt="review"
                          className="h-16 w-16 object-cover rounded-xl border border-stone-100 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1 -right-1 bg-stone-800 text-white rounded-full p-0.5 shadow-sm hover:bg-red-500"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={galleryInputRef}
                      onChange={handleAddImage}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {editingStopId ? (
                    <>
                      <button
                        type="submit"
                        disabled={isStopSaving}
                        className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                      >
                        {isStopSaving ? (
                          '수정 중...'
                        ) : (
                          <>
                            <Save size={18} /> 수정 완료
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStopId(null);
                          setNewStop(createInitialStop());
                        }}
                        className="px-5 bg-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-300"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      disabled={isStopSaving}
                      className="w-full py-3 bg-stone-800 text-white font-bold rounded-xl shadow-lg hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isStopSaving ? (
                        '저장 중...'
                      ) : (
                        <>
                          <Plus size={18} /> 기록 추가
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTripTab === 'archive' && (
          <div className="p-4 bg-white rounded-2xl border border-stone-100 shadow-lg animate-fade-in">
            <ArchiveList stats={tripPlaceStats as any[]} filterRegion={false} />
          </div>
        )}
      </div>
    );
  };

  const renderTravelCreateForm = () => (
    <div className="p-4 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-100 w-full">
        <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 text-center">
          새로운 여정 시작
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveTrip();
          }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 ml-1">
              여행 제목
            </label>
            <input
              type="text"
              className="input-base h-14 text-lg font-medium"
              placeholder="예: 늦가을 교토 산책"
              value={newTrip.title}
              onChange={(e) =>
                setNewTrip({ ...newTrip, title: e.target.value })
              }
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-bold text-stone-400 ml-1">
                시작일
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="input-base h-14 text-lg font-mono relative z-10 bg-transparent"
                  value={newTrip.date}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, date: e.target.value })
                  }
                  required
                />
                <Calendar
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 z-0 pointer-events-none"
                  size={20}
                />
              </div>
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-xs font-bold text-stone-400 ml-1">
                종료일
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="input-base h-14 text-lg font-mono relative z-10 bg-transparent"
                  value={newTrip.endDate}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, endDate: e.target.value })
                  }
                  required
                />
                <Calendar
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 z-0 pointer-events-none"
                  size={20}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={isTripSaving}
              className="flex-1 py-4 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-base"
            >
              {isTripSaving ? '생성 중...' : '시작하기'}
            </button>

            <button
              type="button"
              onClick={() => setView('travel_list')}
              className="px-6 bg-stone-100 text-stone-500 font-bold rounded-xl hover:bg-stone-200 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#F7F6F2] text-[#2C2C2C] font-sans flex flex-col">
      <style>{fontStyle}</style>
      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ ...deleteModalState, isOpen: false })
        }
        onConfirm={executeDelete}
      />

      {/* 상단 헤더는 호스트 앱(예: PRIVATE ARCHIVE)을 사용하고,
          이 컴포넌트는 내용만 렌더링 */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-10 bg-[#fcfaf7]">
        {view === 'travel_list' && renderTravelList()}
        {view === 'travel_create_form' && renderTravelCreateForm()}
        {view === 'travel_detail' && renderTravelDetail()}
      </main>
    </div>
  );
};

export default App;
