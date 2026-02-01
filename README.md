# RunLog - 러닝 기록 관리 웹앱

## 🎯 Phase 1 + 2 완료 사항

### ✅ Phase 1 - 긴급/중요 (Core UX)
- [x] 플로팅 버튼 → 하단 중앙 탭 이동 (홈, +, 기록관리)
- [x] 날짜 형식 통일 (YYYY.MM.DD)
- [x] PC/모바일 레이아웃 여백 수정
- [x] 날짜 선택 제한 (오늘 이후 불가)
- [x] 분/초 입력 범위 제한 (0~59)

### ✅ Phase 2 - 기능 개선
- [x] 색상 통일 (보라색 → navy 계열)
- [x] 같은 대회 다른 거리 로직 개선
- [x] 대회 참가 통계 추가
- [x] 사진 없는 기록 UI
- [x] 시간 입력 UI 개선
- [x] 일상 러닝 위치 정보 추가 (국내/해외)

## 📦 설치 및 실행

### 1. 의존성 설치
\`\`\`bash
npm install
\`\`\`

### 2. 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

브라우저가 자동으로 열리고 `http://localhost:3000`에서 앱이 실행됩니다.

### 3. 프로덕션 빌드
\`\`\`bash
npm run build
\`\`\`

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 4. 빌드 미리보기
\`\`\`bash
npm run preview
\`\`\`

## 📁 프로젝트 구조

\`\`\`
runlog/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx                 # 엔트리 포인트
│   ├── App.jsx                  # 메인 앱 (3탭 네비게이션)
│   ├── index.css                # 글로벌 스타일
│   ├── config/
│   │   ├── firebase.js          # Firebase 설정
│   │   └── constants.js         # 상수 (대회 목록, 도시, 국가)
│   ├── utils/
│   │   └── helpers.js           # 유틸리티 함수
│   └── components/
│       ├── AuthForm.jsx         # 로그인/회원가입
│       ├── Profile.jsx          # 프로필
│       ├── PersonalRecords.jsx  # 개인 최고 기록
│       ├── RaceHistory.jsx      # 대회 기록
│       ├── RunCard.jsx          # 러닝 기록 카드
│       ├── Feed.jsx             # 메인 피드
│       ├── AddRunForm.jsx       # 기록 추가 폼
│       ├── RunDetailModal.jsx   # 기록 상세
│       ├── SettingsModal.jsx    # 설정
│       └── RecordsManagement.jsx # 기록 관리
\`\`\`

## 🔥 주요 기능

### 하단 3탭 네비게이션
- 홈: 내 러닝 기록 피드
- +: 새 기록 추가
- 기록: 통계 및 분석

### 일상 러닝 위치 정보 (Phase 2)
- 국내: 도시 자동완성
- 해외: 토글 ON → 국가/도시 선택

### 대회 기록 개선
- 같은 대회, 다른 거리 구분
- 최근 기록 대표 표시
- 기록 향상도 표시 (↑ 또는 ↓)

## 🚀 배포

### Vercel 배포
\`\`\`bash
vercel
\`\`\`

### 기타 호스팅
`dist/` 폴더를 정적 호스팅 서비스에 업로드

## 📝 다음 단계 (Phase 3-4)

- [ ] 트로피 아이콘 통일
- [ ] 거리별 기록 빈 카드 디자인
- [ ] 이미지 드래그앤드롭
- [ ] 자동 로그인

## 🛠️ 기술 스택

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Image**: browser-image-compression

## ⚠️ 주의사항

- Firebase 설정은 `src/config/firebase.js`에 있습니다
- 실제 배포 시 Firebase 보안 규칙 설정 필요
- 환경 변수로 Firebase 설정 분리 권장

## 📧 문의

이슈나 질문이 있으시면 GitHub Issues를 이용해주세요.
