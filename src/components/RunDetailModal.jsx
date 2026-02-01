import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatTime, formatDate, showToast } from '../utils/helpers';

function RunDetailModal({ run, onClose, onDelete, onEdit }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && run.photos && currentImageIndex < run.photos.length - 1) {
      goToNext();
    }
    if (isRightSwipe && run.photos && currentImageIndex > 0) {
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    if (run.photos) {
      setCurrentImageIndex((prev) => (prev === 0 ? run.photos.length - 1 : prev - 1));
    }
  };

  const goToNext = () => {
    if (run.photos) {
      setCurrentImageIndex((prev) => (prev === run.photos.length - 1 ? 0 : prev + 1));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'runs', run.id));
      onDelete();
      onClose();
      showToast('기록이 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      showToast('기록 삭제에 실패했습니다.', 'error');
    }
  };

  const handleShare = () => {
    showToast('공유 기능은 추후 구현 예정입니다.');
  };

  const getDistanceLabel = () => {
    if (run.raceType === 'HALF') return 'HALF';
    if (run.raceType === 'FULL') return 'FULL';
    return `${run.distance}km`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto" style={{ paddingBottom: '80px' }}>
      <div className="min-h-screen">
        <div className="sticky top-0 bg-white border-b border-navy-100 z-10 shadow-sm">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <button onClick={onClose} className="text-navy-900 p-1 -ml-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-base sm:text-lg font-bold text-navy-900">게시물</h2>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-navy-900 p-1 -mr-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-navy-200 py-2 w-32 z-20">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(run);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-navy-700 hover:bg-navy-50 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {run.photos && run.photos.length > 0 && (
          <div className="flex justify-center bg-white">
            <div 
              className="relative w-full max-w-4xl"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={run.photos[currentImageIndex]}
                alt="Run"
                className="w-full h-auto object-contain"
              />
              
              {run.photos.length > 1 && (
                <>
                  {currentImageIndex > 0 && (
                    <button
                      className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 text-navy-900 w-8 h-8 rounded-full items-center justify-center hover:bg-opacity-100 transition-all shadow-md"
                      onClick={goToPrevious}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {currentImageIndex < run.photos.length - 1 && (
                    <button
                      className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 text-navy-900 w-8 h-8 rounded-full items-center justify-center hover:bg-opacity-100 transition-all shadow-md"
                      onClick={goToNext}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {run.photos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === currentImageIndex ? 'bg-navy-700 w-6' : 'bg-navy-300'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-white max-w-4xl mx-auto pb-20">
          <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 border-b border-navy-100">
            <button className="hover:opacity-60 transition-opacity p-1">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="hover:opacity-60 transition-opacity p-1">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button onClick={handleShare} className="hover:opacity-60 transition-opacity p-1">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button className="ml-auto hover:opacity-60 transition-opacity p-1">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          <div className="px-3 sm:px-4 py-3 sm:py-4">
            <div className="mb-3 sm:mb-4">
              <span className="font-bold text-navy-900 text-base sm:text-lg">
                {run.runType === 'race' ? run.raceName : run.location}
              </span>
              {run.city && (
                <div className="text-xs sm:text-sm text-navy-600 mt-1">
                  📍 {run.isOverseas ? `${run.city}, ${run.country}` : run.city}
                </div>
              )}
            </div>

            <div className="mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl font-bold text-navy-900 mb-2">
                {formatTime(run.time)}
              </div>
              <div className="text-xs sm:text-sm text-navy-600">
                {getDistanceLabel()} · {formatDate(run.date)}
              </div>
            </div>

            {run.memo && (
              <p className="text-sm text-navy-700 mb-4 leading-relaxed">{run.memo}</p>
            )}

            <p className="text-xs text-navy-400">
              게시: {run.createdAt?.toDate ? 
                formatDate(run.createdAt.toDate().toISOString().split('T')[0]) :
                formatDate(new Date(run.createdAt).toISOString().split('T')[0])
              }
            </p>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm modal-content">
            <h3 className="text-lg font-bold text-navy-900 mb-2">기록 삭제</h3>
            <p className="text-navy-600 mb-4 text-sm">이 기록을 정말 삭제하시겠습니까?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
              >
                삭제
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-navy-100 text-navy-700 py-2 rounded-lg hover:bg-navy-200 transition-colors text-sm font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RunDetailModal;
