import { useState, useEffect } from 'react';
import { useFitness } from '../hooks/useFitness';
import { motion } from 'framer-motion';
import { Sparkles, Utensils, Zap, RefreshCw, ChevronLeft, AlertCircle } from 'lucide-react';
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
                setError('Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
            } else {
                setError(`AI 추천을 생성하는 중 오류가 발생했습니다: ${err.message}`);
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
                        {/* Soft Outer Pulse */}
                        <motion.div
                            animate={{
                                scale: [0.8, 1.4, 0.8],
                                opacity: [0.1, 0.3, 0.1]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                filter: 'blur(20px)'
                            }}
                        />

                        {/* High Precision Spinning Arc */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                border: '3px solid rgba(255, 255, 255, 0.05)',
                                borderTop: '3px solid var(--primary)',
                                boxShadow: '0 0 15px rgba(0, 255, 163, 0.2)'
                            }}
                        />

                        {/* Center Icon */}
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ position: 'absolute' }}
                        >
                            <Zap size={24} color="var(--primary)" fill="var(--primary)" style={{ opacity: 0.8 }} />
                        </motion.div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: '#fff',
                            lineHeight: 1.5,
                            letterSpacing: '-0.03em',
                            marginBottom: '0.75rem'
                        }}>
                            {profile.nickname}님을 위해<br />
                            <span className="gradient-text">최적의 플랜을 짜고 있어요</span>
                        </h2>
                        <motion.p
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
                        >
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
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>앗! 문제가 발생했어요</h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>{error}</p>
                <button onClick={fetchRecommendations} className="btn-primary">다시 시도하기</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', background: 'var(--glass-bg)', color: '#fff' }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem' }}>AI 추천 플랜</h1>
            </header>

            {(profile.track === 'diet' || profile.track === 'both') && recommendations.diet && (
                <section style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Utensils size={20} color="var(--primary)" /> 오늘의 추천 식단
                        </h3>
                        <button
                            onClick={fetchRecommendations}
                            style={{ background: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                            <RefreshCw size={14} /> 다시 추천
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recommendations.diet.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card"
                                style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div>
                                    <div className="badge" style={{ marginBottom: '4px', fontSize: '0.6rem' }}>{item.type}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{item.menu}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.kcal}kcal</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>단백질 {item.protein}g</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {(profile.track === 'workout' || profile.track === 'both') && recommendations.workouts && (
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={20} color="var(--secondary)" /> 오늘의 추천 운동
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recommendations.workouts.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card"
                                style={{ padding: '1.25rem', borderLeft: '4px solid var(--secondary)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 700, lineHeight: 1.4 }}>{item.name}</span>
                                    <span className="badge" style={{ color: 'var(--secondary)', borderColor: 'var(--secondary)', fontSize: '0.7rem' }}>{item.intensity}</span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>예상 소요 시간: {item.duration}</div>
                                {item.description && (
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', opacity: 0.9, lineHeight: 1.4, padding: '8px', background: 'rgba(0, 255, 163, 0.05)', borderRadius: '8px' }}>
                                        {item.description}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            <button className="btn-primary" style={{ width: '100%', marginTop: '3rem' }}>
                전체 리스트 저장하기
            </button>
        </div>
    );
};

export default Recommendations;
