// 날짜 포맷 - YYYY.MM.DD
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
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

// 이미지 압축 (임시로 압축 없이 원본 반환)
export const compressImage = async (file) => {
  console.log('이미지 압축 스킵 (원본 사용)');
  return file;
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
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
};
