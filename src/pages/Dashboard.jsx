import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useFitness } from '../hooks/useFitness';
import { motion } from 'framer-motion';
import { Activity, Utensils, Award, TrendingUp, Camera, Settings } from 'lucide-react';

const Dashboard = () => {
    const { profile, setProfile } = useFitness();
    const dietInputRef = useRef(null);
    const workoutInputRef = useRef(null);

    const handleCertify = (type) => {
        if (type === 'diet') {
            if ((profile.certs?.diet || []).length >= 3) {
                alert('식단 인증은 하루 최대 3개까지만 가능합니다.');
                return;
            }
            dietInputRef.current.click();
        } else {
            if (profile.certs?.workout) {
                alert('운동 인증은 이미 완료되었습니다.');
                return;
            }
            workoutInputRef.current.click();
        }
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            const newProfile = { ...profile };

            if (!newProfile.certs) newProfile.certs = { diet: [], workout: null };

            if (type === 'diet') {
                newProfile.certs.diet = [...(newProfile.certs.diet || []), base64String];
            } else {
                newProfile.certs.workout = base64String;
            }

            newProfile.points = (profile.points || 0) + 10;
            setProfile(newProfile);
            localStorage.setItem('fitness-profile', JSON.stringify(newProfile));
            alert(`${type === 'diet' ? '식단' : '운동'} 인증 완료! 10pts가 적립되었습니다.`);
        };
        reader.readAsDataURL(file);
    };

    const stats = [
        { label: '목표 칼로리', value: profile.targetCalories, unit: 'kcal', icon: TrendingUp, color: 'var(--primary)' },
        { label: '활동 대사량', value: profile.tdee, unit: 'kcal', icon: Activity, color: 'var(--secondary)' },
        { label: '기초 대사량', value: profile.bmr, unit: 'kcal', icon: Settings, color: 'var(--accent)' },
    ];

    const macros = [
        { label: '탄수화물', value: profile.macros.carb, unit: 'g', kcal: 4, color: '#ffcc00' },
        { label: '단백질', value: profile.macros.protein, unit: 'g', kcal: 4, color: '#ff4d4d' },
        { label: '지방', value: profile.macros.fat, unit: 'g', kcal: 9, color: '#4da6ff' },
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Challenge Epi</h1>
                </div>
                <Link to="/settings" className="glass-card" style={{ padding: '0.75rem', borderRadius: '16px', color: 'inherit', textDecoration: 'none' }}>
                    <Settings size={20} color="var(--text-muted)" />
                </Link>
            </header>

            {/* Hero Stats */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card"
                        style={{ padding: '1rem', textAlign: 'center' }}
                    >
                        <s.icon size={20} color={s.color} style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{s.value.toLocaleString()}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                    </motion.div>
                ))}
            </section>

            {/* Macro Breakdown */}
            <section className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Utensils size={18} color="var(--primary)" /> 영양 성분 가이드
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    {macros.map((m, i) => (
                        <div
                            key={i}
                            style={{
                                width: `${(m.value * m.kcal / profile.targetCalories) * 100}%`,
                                background: m.color
                            }}
                        />
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {macros.map((m, i) => (
                        <div key={i}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{m.label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{m.value}<span style={{ fontSize: '0.75rem', marginLeft: '2px', fontWeight: 400 }}>g</span></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                <Link to="/recommendations" style={{ textDecoration: 'none' }}>
                    <button className="glass-card" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '1.5rem', background: 'rgba(0, 255, 163, 0.05)', borderColor: 'rgba(0, 255, 163, 0.2)' }}>
                        <div style={{ padding: '12px', background: 'var(--primary)', borderRadius: '12px', color: '#000' }}>
                            <TrendingUp size={24} />
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>오늘의 식단/운동</span>
                    </button>
                </Link>
                <Link to="/ranking" style={{ textDecoration: 'none' }}>
                    <button className="glass-card" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '1.5rem' }}>
                        <div style={{ padding: '12px', background: 'var(--accent)', borderRadius: '12px', color: '#fff' }}>
                            <Award size={24} />
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>챌린지 랭킹</span>
                    </button>
                </Link>
            </div>

            {/* Daily Progress / Certify */}
            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>오늘의 인증</h3>

                {/* Hidden Inputs */}
                <input
                    type="file"
                    ref={dietInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'diet')}
                />
                <input
                    type="file"
                    ref={workoutInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'workout')}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Diet Cert Slot */}
                    {(profile.track === 'diet' || profile.track === 'both') && (
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>식단 (최대 3개)</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {(profile.certs?.diet || []).map((img, idx) => (
                                    <div key={idx} style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <img src={img} alt="인증" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                                {(profile.certs?.diet || []).length < 3 && (
                                    <div
                                        className="glass-card"
                                        onClick={() => handleCertify('diet')}
                                        style={{ width: '80px', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}
                                    >
                                        <Camera size={20} color="var(--text-muted)" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Workout Cert Slot */}
                    {(profile.track === 'workout' || profile.track === 'both') && (
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>운동 (최대 1개)</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {profile.certs?.workout ? (
                                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <img src={profile.certs.workout} alt="인증" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div
                                        className="glass-card"
                                        onClick={() => handleCertify('workout')}
                                        style={{ width: '80px', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}
                                    >
                                        <Camera size={20} color="var(--text-muted)" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Bottom Nav Mockup */}
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10, 10, 12, 0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', padding: '1rem 0', zIndex: 100 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <div style={{ color: 'var(--primary)' }}><TrendingUp size={24} /></div>
                    <Link to="/recommendations" style={{ color: 'var(--text-muted)' }}><Utensils size={24} /></Link>
                    <Link to="/ranking" style={{ color: 'var(--text-muted)' }}><Award size={24} /></Link>
                    <div style={{ color: 'var(--text-muted)' }}><Settings size={24} /></div>
                </div>
            </nav>
        </div>
    );
};

export default Dashboard;
