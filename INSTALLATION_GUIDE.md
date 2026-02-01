# RunLog Vite 프로젝트 - 설치 및 실행 가이드

## ✅ 완료된 작업

### Phase 1 - Core UX 개선
- ✅ 하단 3탭 네비게이션 (홈, +, 기록관리)
- ✅ 날짜 형식 통일 (YYYY.MM.DD)
- ✅ PC/모바일 레이아웃 여백 최적화
- ✅ 날짜 선택 제한 (오늘 이후 불가)
- ✅ 분/초 입력 범위 제한 (0~59)

### Phase 2 - 기능 개선
- ✅ navy 색상으로 통일
- ✅ 같은 대회 다른 거리 구분 로직
- ✅ 대회 참가 통계 추가
- ✅ 사진 없는 기록 UI 개선
- ✅ 일상 러닝 위치 정보 (국내/해외)

## 📦 빠른 시작

### 1단계: 의존성 설치
```bash
npm install
```

### 2단계: 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 열림

### 3단계: 프로덕션 빌드
```bash
npm run build
```

## 🗂️ 프로젝트 구조

```
runlog/
├── index.html                    # Vite 엔트리 HTML
├── package.json                  # 의존성 관리
├── vite.config.js                # Vite 설정
├── tailwind.config.js            # Tailwind CSS 설정
├── postcss.config.js             # PostCSS 설정
├── README.md                     # 프로젝트 문서
│
└── src/
    ├── main.jsx                  # React 엔트리 포인트
    ├── App.jsx                   # 메인 앱 (3탭 네비게이션)
    ├── index.css                 # 글로벌 스타일 + Tailwind
    │
    ├── config/
    │   ├── firebase.js           # Firebase 초기화
    │   └── constants.js          # 대회 목록, 도시, 국가 등
    │
    ├── utils/
    │   └── helpers.js            # formatDate, formatTime, calculatePace 등
    │
    └── components/
        ├── AuthForm.jsx          # 로그인/회원가입 (✅ 완성)
        ├── Profile.jsx           # 프로필 카드 (✅ Phase 1-2 적용)
        ├── PersonalRecords.jsx   # 개인 최고 기록 롤링 (✅ Phase 1-2 적용)
        ├── RaceHistory.jsx       # 대회별 기록 (✅ Phase 2 로직 적용)
        ├── RunCard.jsx           # 기록 카드 (✅ Phase 2 사진 없는 UI)
        ├── Feed.jsx              # 메인 피드 (✅ 필터/검색)
        ├── AddRunForm.jsx        # 기록 추가/수정 (✅ Phase 1-2 완료)
        ├── RunDetailModal.jsx    # 기록 상세 모달 (✅ 완성)
        ├── SettingsModal.jsx     # 설정 모달 (✅ 완성)
        └── RecordsManagement.jsx # 기록 관리 화면 (✅ 완성)
```

## 🔑 주요 기능

### 1. 하단 3탭 네비게이션
- **홈 (🏠)**: 내 러닝 기록 피드
- **추가 (+)**: 새 기록 등록
- **통계 (📊)**: 거리별 기록 분석

### 2. 일상 러닝 위치 정보 (Phase 2)
```
국내: [서울] + [올림픽공원]
      → 서울 (자동완성)
      
해외: [미국] + [뉴욕] + [센트럴파크]
      → 국가 선택 → 도시 직접 입력
```

### 3. 같은 대회 다른 거리
```
서울국제마라톤 (2024-03-17)
├─ 10K: 45:30
├─ HALF: 1:42:15
└─ FULL: 3:28:42
```

각 거리별로 별도 관리하여 혼란 방지

### 4. 대회 참가 통계
- 참가 횟수
- 최고 기록
- 기록 향상도 (↑5:23 또는 ↓2:10)

## 🚀 배포 방법

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Netlify 배포
1. `npm run build` 실행
2. `dist/` 폴더를 Netlify에 드래그앤드롭

## ⚙️ 환경 설정

### Firebase 설정 (`src/config/firebase.js`)
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

⚠️ **보안**: 프로덕션 배포 시 Firebase 보안 규칙 설정 필수!

## 📊 기술 스택

| 항목 | 기술 |
|------|------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Firebase (Auth, Firestore, Storage) |
| Image | browser-image-compression |
| Build | Vite |

## 🔧 트러블슈팅

### 1. 포트 충돌
```bash
# 다른 포트로 실행
npm run dev -- --port 3000
```

### 2. Firebase 인증 오류
- Firebase Console에서 Authentication 활성화 확인
- 도메인 승인 목록에 `localhost` 추가

### 3. 이미지 업로드 실패
- Firebase Storage 규칙 확인
- 파일 크기 제한 확인 (현재 5MB)

## 📝 다음 단계 (Phase 3-4)

### Phase 3 - 디테일 개선
- [ ] 트로피 아이콘 통일
- [ ] 거리별 기록 빈 카드 디자인
- [ ] 이미지 드래그앤드롭

### Phase 4 - 추가 기능
- [ ] 자동 로그인 (Remember Me)
- [ ] 다크 모드
- [ ] 기록 공유 기능

## 📞 지원

질문이나 버그 제보는 GitHub Issues로 문의해주세요.

---

**마지막 업데이트**: 2026-02-01  
**버전**: 1.0.0 (Vite Migration Complete)
