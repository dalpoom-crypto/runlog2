import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config/firebase';

import AuthForm from './components/AuthForm';
import Feed from './components/Feed';
import RecordsManagement from './components/RecordsManagement';
import AddRunForm from './components/AddRunForm';
import SettingsModal from './components/SettingsModal';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('myrecords'); // myrecords, add, stats
  const [showSettings, setShowSettings] = useState(false);
  const [editingRun, setEditingRun] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('사용자 데이터 로드 실패:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleAuthSuccess = () => {
    // 회원가입 후 내 기록 화면으로 이동
    setCurrentTab('myrecords');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900">RunLog</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="text-navy-700 hover:text-navy-900 transition-colors p-1"
          >
            <svg className="w-6 h-6 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24">
        {currentTab === 'myrecords' && (
          <Feed 
            user={user} 
            userData={userData}
            onShowSettings={() => setShowSettings(true)}
            onEditRun={setEditingRun}
          />
        )}
        {currentTab === 'stats' && <RecordsManagement user={user} />}
      </main>

      {/* 기록 추가 폼 */}
      {(showAddForm || editingRun) && (
        <AddRunForm 
          user={user} 
          onRunAdded={() => {
            setShowAddForm(false);
            window.location.reload();
          }}
          editingRun={editingRun} 
          onEditComplete={() => {
            setEditingRun(null);
            window.location.reload();
          }}
          onClose={() => {
            setShowAddForm(false);
            setEditingRun(null);
          }}
        />
      )}

      {/* 설정 모달 */}
      {showSettings && (
        <SettingsModal
          user={user}
          userData={userData}
          onClose={() => setShowSettings(false)}
          onSignOut={handleSignOut}
        />
      )}

      {/* 하단 3탭 네비게이션 (Phase 1) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-navy-200 z-50">
        <div className="max-w-4xl mx-auto px-4 py-2 flex justify-around items-center">
          <button
            onClick={() => setCurrentTab('myrecords')}
            className={`flex flex-col items-center gap-1 py-2 px-4 transition-colors ${
              currentTab === 'myrecords' ? 'text-navy-900' : 'text-navy-400'
            }`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={currentTab === 'myrecords' ? '2.5' : '1.5'} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">홈</span>
          </button>

          <button
            onClick={() => {
              setShowAddForm(true);
              setCurrentTab('add');
            }}
            className={`flex flex-col items-center gap-1 py-2 px-4 transition-colors ${
              currentTab === 'add' ? 'text-navy-900' : 'text-navy-400'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentTab === 'add' ? 'bg-navy-700' : 'bg-navy-600'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('stats')}
            className={`flex flex-col items-center gap-1 py-2 px-4 transition-colors ${
              currentTab === 'stats' ? 'text-navy-900' : 'text-navy-400'
            }`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={currentTab === 'stats' ? '2.5' : '1.5'} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">기록</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
