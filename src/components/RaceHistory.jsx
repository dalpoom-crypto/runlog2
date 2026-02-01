import { useState } from 'react';
import { formatTime, formatDate } from '../utils/helpers';

function RaceHistory({ runs }) {
  const [showAll, setShowAll] = useState(false);

  // 대회별 기록 그룹핑 (대회명 + 거리 타입으로 구분)
  const raceRecords = runs
    .filter(run => run.runType === 'race' && run.raceName)
    .reduce((acc, run) => {
      const key = `${run.raceName}_${run.raceType}`;
      if (!acc[key]) {
        acc[key] = {
          raceName: run.raceName,
          raceType: run.raceType,
          records: []
        };
      }
      acc[key].records.push(run);
      return acc;
    }, {});

  // 대회별 최고 기록 계산
  const raceStats = Object.values(raceRecords)
    .map(({ raceName, raceType, records }) => {
      const sortedRecords = records.sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestRecord = sortedRecords[0];
      const bestRecord = records.reduce((best, current) => 
        current.time < best.time ? current : best
      );
      const count = records.length;
      
      // 기록 향상도 계산 (최근 기록 vs 이전 기록)
      let improvement = null;
      if (count > 1) {
        const previousRecord = sortedRecords[1];
        improvement = previousRecord.time - latestRecord.time;
      }

      return {
        raceName,
        raceType,
        latestRecord,
        bestRecord,
        count,
        improvement,
        allRecords: sortedRecords
      };
    })
    .sort((a, b) => b.count - a.count);

  if (raceStats.length === 0) return null;

  const formatImprovement = (seconds) => {
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    const sign = seconds > 0 ? '↑' : '↓';
    return `${sign}${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayedStats = showAll ? raceStats : raceStats.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-navy-900">🏆 대회 기록</h2>
      </div>

      <div className="space-y-3">
        {displayedStats.map(({ raceName, raceType, latestRecord, bestRecord, count, improvement, allRecords }) => (
          <div key={`${raceName}_${raceType}`} className="bg-navy-100 rounded-lg p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy-900 text-sm sm:text-base truncate">{raceName}</h3>
                <p className="text-xs text-navy-600 mt-0.5">{count}회 참가</p>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <div className="text-lg sm:text-xl font-bold text-navy-900">{formatTime(latestRecord.time)}</div>
                {improvement && (
                  <div className={`text-xs font-semibold mt-0.5 ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatImprovement(improvement)}
                  </div>
                )}
              </div>
            </div>
            
            {/* 모든 참가 기록 표시 */}
            <div className="border-t border-navy-200 pt-2 mt-2 space-y-1">
              {allRecords.map((record, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-navy-600">
                  <span>
                    {raceType === 'HALF' ? 'HALF' : raceType === 'FULL' ? 'FULL' : `${record.distance}km`}
                    {' · '}
                    {formatTime(record.time)}
                  </span>
                  <span>{formatDate(record.date)}</span>
                </div>
              ))}
            </div>
            
            {bestRecord.id !== latestRecord.id && (
              <div className="text-xs text-navy-500 mt-2">
                최고기록: {formatTime(bestRecord.time)} ({formatDate(bestRecord.date)})
              </div>
            )}
          </div>
        ))}
      </div>

      {raceStats.length > 3 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-navy-700 font-semibold hover:text-navy-900 transition-colors"
          >
            {showAll ? '접기' : `+${raceStats.length - 3}개 대회 더보기`}
          </button>
        </div>
      )}
    </div>
  );
}

export default RaceHistory;
