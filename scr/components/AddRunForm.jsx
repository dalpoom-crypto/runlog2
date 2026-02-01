import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { RACE_DATABASE, RACE_TYPES, KOREAN_CITIES, COUNTRIES } from '../config/constants';
import { compressImage, showToast, calculatePace } from '../utils/helpers';

function AddRunForm({ user, onRunAdded, editingRun, onEditComplete, onClose }) {
  const [runType, setRunType] = useState('race');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    distanceType: '5K',
    customDistance: '',
    hours: '0',
    minutes: '0',
    seconds: '0',
    location: '',
    city: '',
    country: '',
    isOverseas: false,
    raceName: '',
    customRaceName: '',
    memo: '',
    isPublic: true
  });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [availableRaces, setAvailableRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);

  // Phase 1: 오늘 이후 날짜 선택 불가
  const today = new Date().toISOString().split('T')[0];
  const maxDate = today;

  useEffect(() => {
    if (editingRun) {
      setRunType(editingRun.runType);
      
      const timeHours = Math.floor(editingRun.time / 3600);
      const timeMinutes = Math.floor((editingRun.time % 3600) / 60);
      const timeSeconds = editingRun.time % 60;

      const isKnownRace = RACE_DATABASE.some(race => race.name === editingRun.raceName);
      const raceNameValue = isKnownRace ? editingRun.raceName : 'CUSTOM';

      // Phase 2: 일상 러닝 위치 정보 파싱
      let city = '';
      let country = '';
      let isOverseas = false;
      
      if (editingRun.location) {
        const locationParts = editingRun.location.split(', ');
        if (locationParts.length === 1) {
          city = locationParts[0];
        } else if (locationParts.length === 2) {
          city = locationParts[0];
          country = locationParts[1];
          isOverseas = true;
        }
      }

      setFormData({
        date: editingRun.date,
        distanceType: editingRun.raceType || 'CUSTOM',
        customDistance: editingRun.raceType === 'CUSTOM' ? editingRun.distance.toString() : '',
        hours: timeHours.toString(),
        minutes: timeMinutes.toString(),
        seconds: timeSeconds.toString(),
        location: editingRun.location || '',
        city,
        country,
        isOverseas,
        raceName: raceNameValue,
        customRaceName: !isKnownRace ? editingRun.raceName : '',
        memo: editingRun.memo || '',
        isPublic: editingRun.isPublic !== false
      });

      setPhotoPreviews(editingRun.photos || []);
      setPhotos([]);
    }
  }, [editingRun]);

  useEffect(() => {
    if (runType === 'race' && formData.date) {
      const races = RACE_DATABASE.filter(race => race.date === formData.date);
      setAvailableRaces(races);
    }
  }, [runType, formData.date]);

  // Phase 2: 도시 자동완성 필터링
  const filteredCities = formData.city
    ? KOREAN_CITIES.filter(city => 
        city.toLowerCase().includes(formData.city.toLowerCase())
      )
    : KOREAN_CITIES;

  // Phase 2: 국가 자동완성 필터링
  const filteredCountries = formData.country
    ? COUNTRIES.filter(country => 
        country.toLowerCase().includes(formData.country.toLowerCase())
      )
    : COUNTRIES;

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    const currentPhotoCount = photoPreviews.length;
    const availableSlots = 3 - currentPhotoCount;
    
    if (availableSlots <= 0) {
      return;
    }
    
    const filesToAdd = files.slice(0, availableSlots);
    
    const previews = await Promise.all(filesToAdd.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }));
    
    setPhotos([...photos, ...filesToAdd]);
    setPhotoPreviews([...photoPreviews, ...previews]);
    
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Phase 1: 분/초 입력 검증 (0-59)
      const minutes = parseInt(formData.minutes);
      const seconds = parseInt(formData.seconds);
      
      if (minutes < 0 || minutes > 59) {
        showToast('분은 0-59 사이로 입력해주세요.', 'error');
        setLoading(false);
        return;
      }
      
      if (seconds < 0 || seconds > 59) {
        showToast('초는 0-59 사이로 입력해주세요.', 'error');
        setLoading(false);
        return;
      }

      const totalSeconds = parseInt(formData.hours) * 3600 + minutes * 60 + seconds;
      
      let distance;
      let raceType;
      
      if (formData.distanceType === 'CUSTOM') {
        distance = parseFloat(formData.customDistance);
        raceType = 'CUSTOM';
      } else {
        distance = RACE_TYPES[formData.distanceType];
        raceType = formData.distanceType;
      }

      const photoURLs = [];
      
      const existingPhotos = photoPreviews.filter(p => p.startsWith('http'));
      photoURLs.push(...existingPhotos);
      
      for (const photo of photos) {
        const compressed = await compressImage(photo);
        const photoRef = ref(storage, `runs/${user.uid}/${Date.now()}_${Math.random()}`);
        await uploadBytes(photoRef, compressed);
        const url = await getDownloadURL(photoRef);
        photoURLs.push(url);
      }

      // Phase 2: 일상 러닝 위치 정보 구성
      let location = '';
      if (runType === 'casual') {
        if (formData.isOverseas) {
          // 해외: 도시, 국가 형식
          location = formData.country ? `${formData.city}, ${formData.country}` : formData.city;
        } else {
          // 국내: 도시만
          location = formData.city;
        }
      }

      const runData = {
        userId: user.uid,
        runType,
        date: formData.date,
        distance,
        time: totalSeconds,
        pace: calculatePace(distance, totalSeconds),
        location,
        raceName: runType === 'race' ? (formData.raceName === 'CUSTOM' ? formData.customRaceName : formData.raceName) : '',
        memo: formData.memo,
        photos: photoURLs,
        isPublic: formData.isPublic,
        raceType,
        ...(editingRun ? {} : { createdAt: Timestamp.now() })
      };

      if (editingRun) {
        await updateDoc(doc(db, 'runs', editingRun.id), runData);
        onEditComplete();
      } else {
        await addDoc(collection(db, 'runs'), runData);
        onRunAdded();
      }
      
      handleClose();
    } catch (error) {
      console.error('기록 저장 실패:', error);
      showToast('기록 저장에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      distanceType: '5K',
      customDistance: '',
      hours: '0',
      minutes: '0',
      seconds: '0',
      location: '',
      city: '',
      country: '',
      isOverseas: false,
      raceName: '',
      customRaceName: '',
      memo: '',
      isPublic: true
    });
    setPhotos([]);
    setPhotoPreviews([]);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-navy-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
            {editingRun ? '기록 수정' : '새 기록 등록'}
          </h2>
          <button
            onClick={handleClose}
            className="text-navy-400 hover:text-navy-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* 구분 */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">구분</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRunType('race')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  runType === 'race'
                    ? 'bg-navy-700 text-white'
                    : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                }`}
              >
                대회
              </button>
              <button
                type="button"
                onClick={() => setRunType('casual')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  runType === 'casual'
                    ? 'bg-navy-700 text-white'
                    : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                }`}
              >
                일상
              </button>
            </div>
          </div>

          {/* Phase 1: 날짜 (오늘 이후 선택 불가) */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">날짜</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              max={maxDate}
              className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none"
              required
            />
          </div>

          {/* 대회 */}
          {runType === 'race' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">대회명</label>
                <select
                  value={formData.raceName}
                  onChange={(e) => setFormData({...formData, raceName: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none appearance-none bg-white"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '3rem'
                  }}
                  required
                >
                  <option value="">대회를 선택하세요</option>
                  {availableRaces.map(race => (
                    <option key={race.id} value={race.name}>{race.name}</option>
                  ))}
                  <option value="CUSTOM">직접 입력</option>
                </select>
              </div>
              
              {formData.raceName === 'CUSTOM' && (
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">대회명 직접 입력</label>
                  <input
                    type="text"
                    value={formData.customRaceName || ''}
                    onChange={(e) => setFormData({...formData, customRaceName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none"
                    placeholder="대회명을 입력하세요"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Phase 2: 일상 러닝 위치 */}
          {runType === 'casual' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-2">위치</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isOverseas: false, country: ''})}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                      !formData.isOverseas
                        ? 'bg-navy-700 text-white'
                        : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                    }`}
                  >
                    국내
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isOverseas: true})}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                      formData.isOverseas
                        ? 'bg-navy-700 text-white'
                        : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                    }`}
                  >
                    해외
                  </button>
                </div>

                {/* 도시 입력 (자동완성) */}
                <div className="relative">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({...formData, city: e.target.value});
                      setShowCitySuggestions(true);
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none"
                    placeholder={formData.isOverseas ? "도시 (예: 뉴욕)" : "도시 (예: 서울)"}
                    required
                  />
                  
                  {showCitySuggestions && !formData.isOverseas && filteredCities.length > 0 && formData.city && (
                    <div className="absolute z-10 w-full bg-white border-2 border-navy-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                      {filteredCities.slice(0, 5).map((city, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({...formData, city});
                            setShowCitySuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-navy-50 transition-colors text-sm"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 해외인 경우 국가 입력 */}
                {formData.isOverseas && (
                  <div className="relative mt-2">
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => {
                        setFormData({...formData, country: e.target.value});
                        setShowCountrySuggestions(true);
                      }}
                      onFocus={() => setShowCountrySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none"
                      placeholder="국가 (예: 미국)"
                      required
                    />
                    
                    {showCountrySuggestions && filteredCountries.length > 0 && formData.country && (
                      <div className="absolute z-10 w-full bg-white border-2 border-navy-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {filteredCountries.slice(0, 5).map((country, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, country});
                              setShowCountrySuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-navy-50 transition-colors text-sm"
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 거리 */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">거리</label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {['5K', '10K', 'HALF', 'FULL', 'CUSTOM'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, distanceType: type})}
                  className={`py-2 rounded-lg font-semibold text-sm transition-colors ${
                    formData.distanceType === type
                      ? 'bg-navy-700 text-white'
                      : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                  }`}
                >
                  {type === 'CUSTOM' ? '직접입력' : type}
                </button>
              ))}
            </div>
            {formData.distanceType === 'CUSTOM' && (
              <input
                type="number"
                step="0.01"
                value={formData.customDistance}
                onChange={(e) => setFormData({...formData, customDistance: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none"
                placeholder="거리 입력 (km)"
                required
              />
            )}
          </div>

          {/* Phase 1: 기록 시간 (분/초 0-59) */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">기록 시간</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="number"
                  min="0"
                  value={formData.hours}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                  onFocus={(e) => e.target.value === '0' && setFormData({...formData, hours: ''})}
                  onBlur={(e) => !e.target.value && setFormData({...formData, hours: '0'})}
                  className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none text-center"
                  placeholder="0"
                />
                <div className="text-xs text-navy-500 text-center mt-1">시간</div>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minutes}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                      setFormData({...formData, minutes: value});
                    }
                  }}
                  onFocus={(e) => e.target.value === '0' && setFormData({...formData, minutes: ''})}
                  onBlur={(e) => !e.target.value && setFormData({...formData, minutes: '0'})}
                  className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none text-center"
                  placeholder="0"
                />
                <div className="text-xs text-navy-500 text-center mt-1">분 (0-59)</div>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.seconds}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                      setFormData({...formData, seconds: value});
                    }
                  }}
                  onFocus={(e) => e.target.value === '0' && setFormData({...formData, seconds: ''})}
                  onBlur={(e) => !e.target.value && setFormData({...formData, seconds: '0'})}
                  className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none text-center"
                  placeholder="0"
                />
                <div className="text-xs text-navy-500 text-center mt-1">초 (0-59)</div>
              </div>
            </div>
          </div>

          {/* 사진 */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">사진 (최대 3장)</label>
            <div className="grid grid-cols-3 gap-2">
              {photoPreviews.map((preview, idx) => (
                <div key={idx} className="relative w-full aspect-square border-2 border-navy-200 rounded-lg overflow-hidden">
                  <img src={preview} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {photoPreviews.length < 3 && (
                <div
                  onClick={() => document.getElementById('photo-input').click()}
                  className="relative w-full aspect-square border-2 border-dashed border-navy-300 rounded-lg overflow-hidden cursor-pointer hover:border-navy-600 hover:bg-navy-50 transition-all flex items-center justify-center"
                >
                  <div className="text-center text-navy-400">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-xs leading-tight">사진<br/>추가</p>
                  </div>
                </div>
              )}
            </div>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">메모</label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData({...formData, memo: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border-2 border-navy-200 focus:border-navy-600 focus:outline-none"
              rows="3"
              placeholder="오늘의 달리기는 어땠나요?"
            />
          </div>

          {/* 공개 설정 */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">공개 설정</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, isPublic: true})}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  formData.isPublic
                    ? 'bg-navy-700 text-white'
                    : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                }`}
              >
                공개
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, isPublic: false})}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  !formData.isPublic
                    ? 'bg-navy-700 text-white'
                    : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
                }`}
              >
                비공개
              </button>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-700 text-white font-semibold py-4 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? '저장 중...' : (editingRun ? '수정 완료' : '기록 저장')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRunForm;
