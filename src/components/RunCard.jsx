import { formatTime, formatDateShort } from '../utils/helpers';

function RunCard({ run, onClick }) {
  const getDistanceLabel = () => {
    if (run.raceType === 'HALF') return 'HALF';
    if (run.raceType === 'FULL') return 'FULL';
    return `${run.distance}km`;
  };

  // 사진이 없는 경우 (Phase 2)
  if (!run.photos || run.photos.length === 0) {
    return (
      <div className="bg-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-navy-200" onClick={onClick}>
        <div className="relative w-full aspect-square bg-gradient-to-br from-navy-50 to-navy-100 flex flex-col items-center justify-center p-4">
          {run.runType === 'race' && (
            <div className="absolute top-2 left-2 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-1.5 rounded-lg shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}

          {run.isPublic === false && (
            <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-80 text-white p-1.5 rounded-lg shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          <div className="text-center">
            <h3 className="font-bold text-navy-900 text-base mb-2 line-clamp-2">
              {run.runType === 'race' ? run.raceName : run.location}
              {run.city && (
                <span className="block text-xs text-navy-600 mt-1">
                  📍 {run.isOverseas ? `${run.city}, ${run.country}` : run.city}
                </span>
              )}
            </h3>
            <div className="text-2xl font-bold text-navy-900 mb-1">
              {formatTime(run.time)}
            </div>
            <div className="text-xs text-navy-600">
              {getDistanceLabel()} · {formatDateShort(run.date)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 사진이 있는 경우
  return (
    <div className="bg-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={onClick}>
      <div className="relative w-full aspect-square bg-navy-100">
        <img
          src={run.photos[0]}
          alt="Run"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {run.photos.length > 1 && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <div className="relative w-5 h-5 sm:w-8 sm:h-8">
              <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white rounded-sm absolute top-0 left-0 opacity-60 shadow-lg"></div>
              <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white rounded-sm absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-black bg-opacity-30 shadow-lg"></div>
            </div>
          </div>
        )}

        {run.runType === 'race' && (
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white p-1 sm:p-2 rounded-md sm:rounded-lg shadow-lg">
            <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}

        {run.isPublic === false && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 bg-gray-800 bg-opacity-80 text-white p-1 sm:p-1.5 rounded-md sm:rounded-lg shadow-lg">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <div className="absolute bottom-0 right-0 bg-gradient-to-tl from-black/90 via-black/60 to-transparent pl-6 pt-6 pb-1.5 pr-1.5 sm:pl-12 sm:pt-12 sm:pb-4 sm:pr-4 rounded-tl-2xl">
          <div className="text-right">
            <div className="text-white font-bold text-lg sm:text-4xl leading-tight drop-shadow-lg">
              {formatTime(run.time)}
            </div>
            <div className="text-white text-[10px] sm:text-base font-medium mt-0.5 sm:mt-1 opacity-90 drop-shadow-lg">
              {getDistanceLabel()} · {formatDateShort(run.date)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RunCard;
