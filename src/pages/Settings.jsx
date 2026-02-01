import { useNavigate } from 'react-router-dom';
import { useFitness } from '../hooks/useFitness';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, MessageSquareCode, Plus, Activity, Trash2, User, Save, Edit2, TrendingDown, Target, Zap, Utensils, X } from 'lucide-react';
import { useState, useRef } from 'react';

const Settings = () => {
    const navigate = useNavigate();
    const { profile, setProfile, calculateFitness } = useFitness();
    const [statusText, setStatusText] = useState(profile.status || '오늘도 건강하게!');
    const [showInBodyForm, setShowInBodyForm] = useState(false);
    const [inbody, setInbody] = useState({ weight: profile.weight, muscle: '', fat: '' });
    const profileInputRef = useRef(null);

    // User Info Edit State
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [userInfo, setUserInfo] = useState(profile);

    const resetData = () => {
        if (window.confirm('모든 정보가 삭제됩니다. 계속할까요?')) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    const handleSaveStatus = () => {
        const newProfile = { ...profile, status: statusText };
        saveProfile(newProfile);
        alert('응원 메시지가 변경되었습니다.');
    };

    const handleSaveUserInfo = () => {
        if (!userInfo.nickname) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        calculateFitness(userInfo);
        setIsEditingInfo(false);
        alert('설정 정보가 수정되었습니다.');
    };

    const saveProfile = (newProfile) => {
        setProfile(newProfile);
        localStorage.setItem('fitness-profile', JSON.stringify(newProfile));
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            const newProfile = { ...profile, profileImage: base64String };
            saveProfile(newProfile);
            setUserInfo(prev => ({ ...prev, profileImage: base64String }));
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteProfileImage = (e) => {
        e.stopPropagation();
        if (!window.confirm('프로필 사진을 삭제하시겠습니까?')) return;
        const newProfile = { ...profile, profileImage: null };
        saveProfile(newProfile);
        setUserInfo(prev => ({ ...prev, profileImage: null }));
    };

    const handleAddInBody = () => {
        if (!inbody.weight || !inbody.muscle || !inbody.fat) {
            alert('모든 항목을 입력해주세요.');
            return;
        }
        const today = new Date();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const newRecord = {
            id: Date.now(),
            date: `${today.getMonth() + 1}.${today.getDate()}`,
            day: days[today.getDay()],
            ...inbody
        };

        const newProfile = {
            ...profile,
            weight: inbody.weight,
            inbodyRecords: [newRecord, ...(profile.inbodyRecords || [])]
        };
        saveProfile(newProfile);
        setInbody({ weight: inbody.weight, muscle: '', fat: '' });
        setShowInBodyForm(false);
    };

    const deleteInBody = (id) => {
        const newProfile = {
            ...profile,
            inbodyRecords: profile.inbodyRecords.filter(r => r.id !== id)
        };
        saveProfile(newProfile);
    };

    const activityLevels = [
        { val: '1.2', label: '거의 없음', sub: '좌식생활, 운동 안 함' },
        { val: '1.375', label: '활동량 적음', sub: '주 1~3회 운동' },
        { val: '1.55', label: '보통', sub: '주 3~5회 운동' },
        { val: '1.725', label: '활동적', sub: '주 6~7회 강도 높은 운동' },
        { val: '1.9', label: '매우 활동적', sub: '매일 고강도 또는 하루 2번' }
    ];

    return (
        <div style={{ paddingBottom: '6rem' }}>
            <header style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', color: '#fff' }}>
                    <ChevronLeft size={28} />
                </button>
                <h1 style={{ fontSize: '1.3rem', marginBottom: 0 }}>내 정보 설정</h1>
            </header>

            <div className="container">
                {/* Profile Main Section */}
                <div style={{ padding: '1rem 0', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div
                            onClick={() => profileInputRef.current?.click()}
                            style={{ position: 'relative', cursor: 'pointer' }}
                        >
                            <div style={{ width: '68px', height: '68px', background: 'var(--bg-surface)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={30} color="var(--text-muted)" />
                                )}
                            </div>
                            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--primary)', color: '#fff', padding: '5px', borderRadius: '50%', border: '2px solid var(--bg-dark)' }}>
                                <Camera size={12} />
                            </div>
                            {profile.profileImage && (
                                <div
                                    onClick={handleDeleteProfileImage}
                                    style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ff4d4d', color: '#fff', padding: '4px', borderRadius: '50%', border: '2px solid var(--bg-dark)', zIndex: 2 }}
                                >
                                    <X size={10} />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={profileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleProfileImageChange}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2px' }}>{profile.nickname}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{profile.gender === 'male' ? '남성' : '여성'} · {profile.age}세</div>
                        </div>
                        <button
                            onClick={() => {
                                if (isEditingInfo) handleSaveUserInfo();
                                else {
                                    setUserInfo(profile);
                                    setIsEditingInfo(true);
                                }
                            }}
                            style={{ background: isEditingInfo ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: isEditingInfo ? '#fff' : 'var(--text-muted)', padding: '10px', borderRadius: '12px', transition: 'all 0.2s' }}
                        >
                            {isEditingInfo ? <Save size={18} /> : <Edit2 size={18} />}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {isEditingInfo ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass-card"
                                style={{ padding: '1.5rem', background: 'rgba(49, 130, 246, 0.05)', border: '1px solid rgba(49, 130, 246, 0.2)', marginBottom: '2rem' }}
                            >
                                <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                                    <label>닉네임</label>
                                    <input type="text" value={userInfo.nickname} onChange={(e) => setUserInfo({ ...userInfo, nickname: e.target.value })} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0, minWidth: 0 }}>
                                        <label style={{ fontSize: '0.75rem' }}>키 (cm)</label>
                                        <input type="number" value={userInfo.height} onChange={(e) => setUserInfo({ ...userInfo, height: e.target.value })} style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0, minWidth: 0 }}>
                                        <label style={{ fontSize: '0.75rem' }}>몸무게 (kg)</label>
                                        <input type="number" value={userInfo.weight} onChange={(e) => setUserInfo({ ...userInfo, weight: e.target.value })} style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0, minWidth: 0 }}>
                                        <label style={{ fontSize: '0.75rem' }}>나이 (세)</label>
                                        <input type="number" value={userInfo.age} onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })} style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }} />
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                                    <label>활동량</label>
                                    <select
                                        value={userInfo.activity}
                                        onChange={(e) => setUserInfo({ ...userInfo, activity: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: '#1c1c22', border: '1px solid var(--border)', color: '#fff' }}
                                    >
                                        {activityLevels.map(a => <option key={a.val} value={a.val}>{a.label} ({a.sub})</option>)}
                                    </select>
                                </div>

                                <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                                    <label>감량 비율 (Deficit): {userInfo.deficit}%</label>
                                    <input
                                        type="range" min="1" max="20" value={userInfo.deficit}
                                        onChange={(e) => setUserInfo({ ...userInfo, deficit: e.target.value })}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                    <label>집중 관리 트랙</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                        {['diet', 'workout', 'both'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setUserInfo({ ...userInfo, track: t })}
                                                style={{
                                                    padding: '0.6rem 0.2rem', fontSize: '0.85rem', borderRadius: '10px',
                                                    background: userInfo.track === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                    color: '#fff', border: 'none'
                                                }}
                                            >
                                                {t === 'diet' ? '식단' : t === 'workout' ? '운동' : '복합'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleSaveUserInfo} className="btn-primary" style={{ padding: '1rem' }}>설정 저장하기</button>
                            </motion.div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>키</div>
                                    <div style={{ fontWeight: 700 }}>{profile.height}cm</div>
                                </div>
                                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>몸무게</div>
                                    <div style={{ fontWeight: 700 }}>{profile.weight}kg</div>
                                </div>
                                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>나이</div>
                                    <div style={{ fontWeight: 700 }}>{profile.age}세</div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Health Analytics Summary */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} color="var(--primary)" /> 신체 데이터 요약
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-surface)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Target size={14} /> 목표 칼로리
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{profile.targetCalories.toLocaleString()}<span style={{ fontSize: '0.8rem', fontWeight: 500, marginLeft: '2px' }}>kcal</span></div>
                        </div>
                        <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-surface)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Zap size={14} /> 기초 대사량 (BMR)
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{profile.bmr.toLocaleString()}<span style={{ fontSize: '0.8rem', fontWeight: 500, marginLeft: '2px' }}>kcal</span></div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 600 }}>권장 영양소 구성</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>탄수화물</div>
                                <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{profile.macros.carb}g</div>
                            </div>
                            <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>단백질</div>
                                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--primary)' }}>{profile.macros.protein}g</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>지방</div>
                                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#ff4d4d' }}>{profile.macros.fat}g</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Message Edit */}
                <div className="glass-card" style={{ marginBottom: '2rem', background: 'var(--bg-surface)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                        <MessageSquareCode size={18} /> 랭킹 응원 메시지
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                        <input
                            type="text"
                            value={statusText}
                            onChange={(e) => setStatusText(e.target.value)}
                            placeholder="나를 위한 한마디"
                            style={{ flex: '1 1 0', minWidth: 0, padding: '0.75rem 0.75rem', background: '#1c1c22', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.95rem', color: '#fff' }}
                        />
                        <button
                            onClick={handleSaveStatus}
                            style={{ flexShrink: 0, padding: '0.75rem 1rem', background: 'var(--primary)', color: '#fff', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                            저장
                        </button>
                    </div>
                </div>

                {/* InBody Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingLeft: '4px' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>인바디 기록</h3>
                        <button
                            onClick={() => setShowInBodyForm(!showInBodyForm)}
                            style={{ background: 'rgba(49, 130, 246, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <Plus size={16} /> 기록 추가
                        </button>
                    </div>

                    <AnimatePresence>
                        {showInBodyForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass-card"
                                style={{ marginBottom: '1.5rem', background: '#1c1c22', overflow: 'hidden' }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <div className="input-group" style={{ marginBottom: 0, minWidth: 0 }}>
                                        <label style={{ fontSize: '0.7rem' }}>체중(kg)</label>
                                        <input type="number" value={inbody.weight} onChange={(e) => setInbody({ ...inbody, weight: e.target.value })} placeholder="70" style={{ padding: '0.6rem 0.5rem', fontSize: '0.9rem' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0, minWidth: 0 }}>
                                        <label style={{ fontSize: '0.7rem' }}>골격근(kg)</label>
                                        <input type="number" value={inbody.muscle} onChange={(e) => setInbody({ ...inbody, muscle: e.target.value })} placeholder="30" style={{ padding: '0.6rem 0.5rem', fontSize: '0.9rem' }} />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0, minWidth: 0 }}>
                                        <label style={{ fontSize: '0.7rem' }}>체지방(%)</label>
                                        <input type="number" value={inbody.fat} onChange={(e) => setInbody({ ...inbody, fat: e.target.value })} placeholder="20" style={{ padding: '0.6rem 0.5rem', fontSize: '0.9rem' }} />
                                    </div>
                                </div>
                                <button onClick={handleAddInBody} className="btn-primary" style={{ padding: '0.8rem', fontSize: '0.9rem' }}>기록 완료</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(profile.inbodyRecords || []).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                아직 기록된 인바디 데이터가 없습니다.
                            </div>
                        ) : (
                            profile.inbodyRecords.map((record) => (
                                <div key={record.id} className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ textAlign: 'center', minWidth: '45px', borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{record.day}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.date}</div>
                                    </div>
                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>체중</div>
                                            <div style={{ fontWeight: 700 }}>{record.weight}kg</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>근육량</div>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{record.muscle}kg</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>체지방</div>
                                            <div style={{ fontWeight: 700, color: '#ff4d4d' }}>{record.fat}%</div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteInBody(record.id)} style={{ background: 'none', color: 'rgba(255,255,255,0.2)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Danger Zone */}
                <button
                    onClick={resetData}
                    style={{ background: 'none', color: '#ff4d4d', fontSize: '0.95rem', fontWeight: 600, width: '100%', padding: '1rem', marginTop: '2rem' }}
                >
                    데이터 초기화 및 로그아웃
                </button>
            </div>
        </div>
    );
};

export default Settings;
