import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Medal, Star } from 'lucide-react';
import { useFitness } from '../hooks/useFitness';

const Ranking = () => {
    const navigate = useNavigate();
    const { profile } = useFitness();

    const rankings = [
        { rank: 1, name: '에피소드 서초 김OO', score: 980, delta: '+2', status: '식단 완벽' },
        { rank: 2, name: '에피소드 강남 박OO', score: 955, delta: '-1', status: '운동 고수' },
        { rank: 3, name: '에피소드 서초 이OO', score: 920, delta: '0', status: '단백질 빌런' },
        { rank: 4, name: profile.nickname || '나 (본인)', score: profile.points || 0, delta: '+5', isMe: true, status: '파이팅!' },
        { rank: 5, name: '에피소드 강남 최OO', score: 850, delta: '+1', status: '유산소 왕' },
        { rank: 6, name: '에피소드 서초 정OO', score: 820, delta: '-2', status: '성실파' },
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', background: 'var(--glass-bg)', color: '#fff' }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.25rem' }}>챌린지 랭킹</h1>
            </header>

            {/* Top 3 UI */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', height: '180px', marginBottom: '3rem' }}>
                {/* 2nd */}
                <div style={{ textAlign: 'center' }}>
                    <Medal size={24} color="#C0C0C0" style={{ marginBottom: '8px' }} />
                    <div style={{ width: '80px', height: '80px', background: 'var(--glass-bg)', borderRadius: '40px', border: '2px solid #C0C0C0', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>2</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{rankings[1].name.split(' ')[2]}</div>
                </div>

                {/* 1st */}
                <div style={{ textAlign: 'center' }}>
                    <Trophy size={32} color="#FFD700" style={{ marginBottom: '8px' }} />
                    <div style={{ width: '100px', height: '100px', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '50px', border: '3px solid #FFD700', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800 }}>1</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>{rankings[0].name.split(' ')[2]}</div>
                </div>

                {/* 3rd */}
                <div style={{ textAlign: 'center' }}>
                    <Star size={24} color="#CD7F32" style={{ marginBottom: '8px' }} />
                    <div style={{ width: '80px', height: '80px', background: 'var(--glass-bg)', borderRadius: '40px', border: '2px solid #CD7F32', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>3</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{rankings[2].name.split(' ')[2]}</div>
                </div>
            </div>

            {/* Ranking List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rankings.map((user, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem',
                            borderColor: user.isMe ? 'var(--primary)' : 'var(--glass-border)',
                            background: user.isMe ? 'rgba(0, 255, 163, 0.05)' : 'var(--bg-card)'
                        }}
                    >
                        <div style={{ width: '30px', fontWeight: 800, color: user.rank <= 3 ? 'var(--primary)' : 'var(--text-muted)' }}>{user.rank}</div>
                        <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {user.name}
                                {user.isMe && <span className="badge" style={{ fontSize: '0.5rem', background: 'var(--primary)', color: '#000', borderColor: 'transparent' }}>ME</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.status}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800 }}>{user.score} pts</div>
                            <div style={{ fontSize: '0.65rem', color: user.delta.startsWith('+') ? 'var(--primary)' : '#ff4d4d' }}>{user.delta}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                매월 1일 랭킹이 업데이트됩니다.
            </div>
        </div>
    );
};

export default Ranking;
