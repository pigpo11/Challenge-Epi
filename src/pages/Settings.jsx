import { useNavigate } from 'react-router-dom';
import { useFitness } from '../hooks/useFitness';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Camera, User, TrendingUp } from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const { profile } = useFitness();

    // Mock data for weekly history (In production, fetch from Supabase 'certifications' table)
    const history = [
        { day: '월', date: '01.27', diet: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', workout: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438' },
        { day: '화', date: '01.28', diet: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', workout: null },
        { day: '수', date: '01.29', diet: null, workout: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48' },
        { day: '목', date: '01.30', diet: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061', workout: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
        { day: '금', date: '01.31', diet: 'https://images.unsplash.com/photo-1547592166-23ac45744a05', workout: null },
        { day: '토', date: '02.01', diet: null, workout: null },
        { day: '일', date: '02.02', diet: null, workout: null },
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', background: 'var(--glass-bg)', color: '#fff' }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem' }}>내 기록 및 설정</h1>
            </header>

            {/* Profile Card */}
            <section className="glass-card" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                    <User size={32} />
                </div>
                <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile.nickname} <span style={{ fontSize: '0.875rem', color: 'var(--primary)', marginLeft: '4px' }}>{profile.points}pts</span></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{profile.height}cm / {profile.weight}kg / {profile.targetCalories}kcal</div>
                </div>
            </section>

            {/* Weekly History */}
            <section>
                <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="var(--primary)" /> 요일별 인증 히스토리
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((day, i) => (
                        <div key={i} className="glass-card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 700 }}>{day.day}요일 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>{day.date}</span></div>
                                <div className="badge">{day.diet && day.workout ? '모두 완료' : day.diet || day.workout ? '일부 완료' : '미달성'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ position: 'relative', height: '100px', background: 'var(--glass-bg)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {day.diet ? (
                                        <img src={day.diet} alt="식단" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <Camera size={20} color="var(--border)" />
                                            <div style={{ fontSize: '0.65rem', color: 'var(--border)', marginTop: '4px' }}>식단 미인증</div>
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '0.6rem', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px' }}>DIET</div>
                                </div>
                                <div style={{ position: 'relative', height: '100px', background: 'var(--glass-bg)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {day.workout ? (
                                        <img src={day.workout} alt="운동" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <Camera size={20} color="var(--border)" />
                                            <div style={{ fontSize: '0.65rem', color: 'var(--border)', marginTop: '4px' }}>운동 미인증</div>
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '0.6rem', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px' }}>WORKOUT</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <button className="btn-glass" style={{ width: '100%', marginTop: '3rem', padding: '1rem', color: '#ff4d4d' }}>
                정보 리셋 및 로그아웃
            </button>
        </div>
    );
};

export default Settings;
