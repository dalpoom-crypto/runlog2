// 날짜 포맷 - YYYY.MM.DD
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 날짜 포맷 (짧은 버전) - YY.MM.DD
export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 시간 포맷 (HH:MM:SS 또는 MM:SS)
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

// 페이스 계산
export const calculatePace = (distanceKm, timeSeconds) => {
  const paceSeconds = timeSeconds / distanceKm;
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.floor(paceSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

// 이미지 압축
export const compressImage = async (file) => {
  try {
    const imageCompression = (await import('browser-image-compression')).default;
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    return await imageCompression(file, options);
  } catch (error) {
    console.error('이미지 압축 실패:', error);
    return file;
  }
};

// 토스트 메시지 표시
export const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-navy-700'
  }`;
  toast.textContent = message;
  toast.style.animation = 'slideUp 0.3s ease-out';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
};

// 닉네임 중복 확인
export const checkNicknameExists = async (nickname, db, getDocs, collection) => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.some(doc => doc.data().nickname === nickname);
};

// 비밀번호 유효성 검사
export const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  return regex.test(password);
};

// 오늘 날짜 (YYYY-MM-DD)
export const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
