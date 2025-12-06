// src/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ✅ 여기 값은 Firebase 콘솔에서 복사해 온 걸로 바꿔줘야 해!
const firebaseConfig = {
  apiKey: 'AIzaSyB_U8Zh16n250tTc7i8X8kKUpSVP5P337Y',
  authDomain: 'my-project-0076-b774a.firebaseapp.com',
  projectId: 'my-project-0076-b774a',
  // 필요한 key 더 있으면 그대로 붙여넣기
};

// 🔥 Hot reload / 중복 초기화 방지
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 공용으로 쓸 인스턴스들
export const auth = getAuth(app);
export const db = getFirestore(app);

// 🔑 Firestore 컬렉션 상위 키로 쓸 appId
//   여기 문자열은 네 프로젝트 고유 이름으로 아무거나 정해도 돼
export const appId = 'my-collection-app';

// 필요하면 default export도 유지
export default app;
