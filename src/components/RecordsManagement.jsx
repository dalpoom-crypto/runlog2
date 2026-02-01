import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatTime, formatDate } from '../utils/helpers';
import RaceHistory from './RaceHistory';

function RecordsManagement({ user }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRuns = async () => {
      try {
        const q = query(
          collection(db, 'runs'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const runsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRuns(runsData);
      } catch (error) {
        console.error('기록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRuns();
  }, [user]);

  // 거리별 기록 계산
  const distanceRecords = ['5K', '10K', 'HALF', 'FULL'].map(type => {
    const typeRuns = runs.filter(run => run.raceType === type);
    if (typeRuns.length === 0) return null;

    const best = typeRuns.reduce((prev, curr) => prev.time < curr.time ? prev : curr);
    const average = typeRuns.reduce((sum, run) => sum + run.time, 0) / typeRuns.length;

    return {
      type,
      typeName: type === 'HALF' ? '하프' : type === 'FULL' ? '풀코스' : type,
      best,
      average,
      count: typeRuns.length,
      allRuns: typeRuns.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  }).filter(Boolean);

  // 거리별 참가 통계 (Phase 2)
  const distanceStats = {
    '5K': runs.filter(r => r.raceType === '5K').length,
    '10K': runs.filter(r => r.raceType === '10K').length,
    'HALF': runs.filter(r => r.raceType === 'HALF').length,
    'FULL': runs.filter(r => r.raceType === 'FULL').length,
  };

  const totalRaces = Object.values(distanceStats).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-navy-700 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 거리별 참가 통계 (Phase 2) */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-navy-900 mb-4">📊 참가 통계</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-navy-700">총 대회 참가</span>
            <span className="text-lg font-bold text-navy-900">{totalRaces}회</span>
          </div>
          {Object.entries(distanceStats).map(([type, count]) => (
            count > 0 && (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-navy-600">
                  {type === 'HALF' ? '하프' : type === 'FULL' ? '풀코스' : type}
                </span>
                <span className="text-base font-semibold text-navy-700">{count}회</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* 거리별 기록 */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-navy-900 mb-4">🏃 거리별 기록</h2>
        {distanceRecords.length === 0 ? (
          <p className="text-center text-navy-500 py-8">아직 기록이 없습니다</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {distanceRecords.map(({ type, typeName, best, average, count }) => (
              <div key={type} className="bg-gradient-to-br from-navy-50 to-navy-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-navy-900">{typeName}</h3>
                  <span className="text-xs text-navy-600">{count}회</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-navy-600 mb-1">최고 기록</div>
                    <div className="text-xl sm:text-2xl font-bold text-navy-900">{formatTime(best.time)}</div>
                    <div className="text-xs text-navy-500 mt-1">
                      {formatDate(best.date)}
                    </div>
                  </div>
                  {count > 1 && (
                    <div>
                      <div className="text-xs text-navy-600 mb-1">평균 기록</div>
                      <div className="text-base font-semibold text-navy-700">{formatTime(Math.round(average))}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* 빈 카드들 - Phase 3에서 개선 예정 */}
            {['5K', '10K', 'HALF', 'FULL'].filter(type => 
              !distanceRecords.some(r => r.type === type)
            ).map(type => (
              <div key={type} className="bg-gradient-to-br from-navy-50 to-navy-100 rounded-lg p-4 flex flex-col items-center justify-center text-center min-h-[140px]">
                <div className="text-2xl mb-2">🏃</div>
                <h3 className="text-base sm:text-lg font-bold text-navy-900 mb-1">
                  {type === 'HALF' ? '하프' : type === 'FULL' ? '풀코스' : type}
                </h3>
                <p className="text-xs text-navy-500">
                  {type === 'FULL' ? '풀코스에 도전해 보세요!' : '첫 기록을 만들어보세요!'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 대회별 기록 */}
      <RaceHistory runs={runs} />
    </div>
  );
}

export default RecordsManagement;
