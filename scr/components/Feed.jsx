import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import Profile from './Profile';
import PersonalRecords from './PersonalRecords';
import RaceHistory from './RaceHistory';
import RunCard from './RunCard';
import RunDetailModal from './RunDetailModal';

function Feed({ user, userData, onShowSettings, onEditRun }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, race, casual
  const [searchQuery, setSearchQuery] = useState('');

  const loadRuns = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    loadRuns();
  }, [user]);

  const handleEdit = (run) => {
    setSelectedRun(null);
    onEditRun(run);
  };

  const filteredRuns = runs.filter(run => {
    // 필터 타입 확인
    if (filterType === 'race' && run.runType !== 'race') return false;
    if (filterType === 'casual' && run.runType !== 'casual') return false;
    
    // 검색어 확인
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const raceName = (run.raceName || '').toLowerCase();
      const location = (run.location || '').toLowerCase();
      const city = (run.city || '').toLowerCase();
      return raceName.includes(query) || location.includes(query) || city.includes(query);
    }
    
    return true;
  });

  return (
    <div>
      <Profile user={user} userData={userData} runs={runs} />
      <PersonalRecords runs={runs} />
      <RaceHistory runs={runs} />
      
      {/* 필터 & 검색 */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 space-y-3">
        {/* 필터 탭 */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
              filterType === 'all'
                ? 'bg-navy-700 text-white'
                : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
            }`}
          >
            전체 ({runs.length})
          </button>
          <button
            onClick={() => setFilterType('race')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
              filterType === 'race'
                ? 'bg-navy-700 text-white'
                : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
            }`}
          >
            대회 ({runs.filter(r => r.runType === 'race').length})
          </button>
          <button
            onClick={() => setFilterType('casual')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
              filterType === 'casual'
                ? 'bg-navy-700 text-white'
                : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
            }`}
          >
            일상 ({runs.filter(r => r.runType === 'casual').length})
          </button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="대회명, 장소, 도시 검색..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none text-sm"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white overflow-hidden animate-pulse">
              <div className="w-full aspect-square bg-navy-100"></div>
            </div>
          ))}
        </div>
      ) : runs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-5xl mb-3">🏃</div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">아직 기록이 없습니다</h3>
          <p className="text-sm text-navy-600">첫 번째 달리기 기록을 추가해보세요!</p>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-sm text-navy-600">다른 키워드로 검색해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          {filteredRuns.map(run => (
            <RunCard 
              key={run.id} 
              run={run}
              onClick={() => setSelectedRun(run)}
            />
          ))}
        </div>
      )}

      {selectedRun && (
        <RunDetailModal
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
          onDelete={loadRuns}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}

export default Feed;
