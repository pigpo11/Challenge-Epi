import { useState, useEffect } from 'react';
import { useFitness } from '../hooks/useFitness';
import { motion } from 'framer-motion';
import { Zap, RefreshCw, ChevronLeft, AlertCircle, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFitnessRecommendations } from '../services/gemini';

const Recommendations = () => {
    const { profile } = useFitness();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFitnessRecommendations(profile);
            setRecommendations(data);
        } catch (err) {
            console.error("Technical Error Detail:", err);
            if (err.message === 'API_KEY_MISSING') {
                setError('API 키가 설정되지 않았습니다.');
            } else {
                setError(`추천을 생성할 수 없습니다.\n시스템 메세지: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    if (loading) {
        return (
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)', filter: 'blur(20px)' }}
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid rgba(255, 255, 255, 0.05)', borderTop: '3px solid var(--primary)' }}
                        />
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ position: 'absolute' }}>
                            <Zap size={24} color="var(--primary)" fill="var(--primary)" style={{ opacity: 0.8 }} />
                        </motion.div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', lineHeight: 1.5, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
                            {profile.nickname}님을 위해<br />
                            <span className="gradient-text">최적의 플랜을 짜고 있어요</span>
                        </h2>
                        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            잠시만 기다려 주세요
                        </motion.p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <AlertCircle size={48} color="#ff4d4d" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>문제가 발생했어요</h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>{error}</p>
                <button onClick={fetchRecommendations} className="btn-primary">다시 시도하기</button>
            </div>
        );
    }

    const handleSavePlan = () => {
        const newProfile = { ...profile, todayPlan: recommendations };
        setProfile(newProfile);
        localStorage.setItem('fitness-profile', JSON.stringify(newProfile));
        alert('오늘의 플랜이 성공적으로 저장되었습니다! 대시보드에서 언제든 확인하실 수 있어요. 😊');
        navigate('/dashboard');
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <header style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', color: '#fff' }}>
                    <ChevronLeft size={28} />
                </button>
                <h1 style={{ fontSize: '1.3rem', marginBottom: 0 }}>오늘의 추천 플랜</h1>
                <button onClick={fetchRecommendations} style={{ marginLeft: 'auto', background: 'none', color: 'var(--text-muted)' }}>
                    <RefreshCw size={20} />
                </button>
            </header>

            <div className="container">
                {(profile.track === 'diet' || profile.track === 'both') && recommendations.diet && (
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', paddingLeft: '4px' }}>오늘의 추천 식단</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recommendations.diet.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card"
                                    style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                                >
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '6px' }}>{item.type}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{item.menu}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{item.kcal}<span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kcal</span></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>단백질 {item.protein}g</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {(profile.track === 'workout' || profile.track === 'both') && recommendations.workouts && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', paddingLeft: '4px' }}>오늘의 추천 운동</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recommendations.workouts.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card"
                                    style={{ padding: '1.5rem' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.name}</span>
                                        <span className="badge">{item.intensity}</span>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>수행 방법</span>
                                            <span>{item.duration}</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: '#eee' }}>
                                            {item.description}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                <button
                    onClick={handleSavePlan}
                    className="btn-primary"
                    style={{ height: '60px', fontSize: '1.1rem', borderRadius: '20px' }}
                >
                    플랜 저장하기
                </button>
            </div>
        </div>
    );
};

export default Recommendations;
