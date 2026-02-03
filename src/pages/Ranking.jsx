import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Loader2 } from 'lucide-react';
import { useFitness } from '../hooks/useFitness';
import sql from '../services/database';

const Ranking = () => {
    const navigate = useNavigate();
    const { profile } = useFitness();
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const results = await sql`
                    SELECT nickname as name, points as score, status, id
                    FROM "Profile"
                    ORDER BY points DESC
                    LIMIT 20
                `;

                const formatted = results.map((user, index) => ({
                    rank: index + 1,
                    name: user.name,
                    score: user.score || 0,
                    status: user.status || '파이팅!',
                    isMe: user.id === profile.dbId
                }));

                setRankings(formatted);
            } catch (err) {
                console.error('Failed to fetch rankings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [profile.dbId, profile.points]);

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <header style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', color: '#fff' }}>
                    <ChevronLeft size={28} />
                </button>
                <h1 style={{ fontSize: '1.3rem', marginBottom: 0 }}>챌린지 랭킹</h1>
            </header>

            <div className="container">
                {/* My Current Rank Summary */}
                <div className="glass-card" style={{ background: 'var(--bg-surface)', marginBottom: '2rem', padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>나의 현재 순위</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                            {rankings.find(r => r.isMe)?.rank || '-'}
                            <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: '2px' }}>위</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>획득 포인트</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{profile.points.toLocaleString()}</div>
                    </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', paddingLeft: '4px' }}>실시간 랭킹 순위</h3>
                <div className="glass-card" style={{ padding: '0.5rem 0', background: 'var(--bg-surface)', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <Loader2 className="animate-spin" size={24} color="var(--primary)" />
                        </div>
                    ) : rankings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            아직 등록된 랭커가 없습니다.
                        </div>
                    ) : (
                        rankings.map((user, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1.25rem',
                                    borderBottom: i === rankings.length - 1 ? 'none' : '1px solid var(--border)',
                                    background: user.isMe ? 'rgba(49, 130, 246, 0.05)' : 'transparent'
                                }}
                            >
                                <div style={{ width: '40px', fontSize: '1.1rem', fontWeight: 800, color: user.rank <= 3 ? 'var(--primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                                    {user.rank}
                                </div>
                                <div style={{ flex: 1, marginLeft: '1rem' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {user.name}
                                        {user.isMe && <span className="badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>나</span>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.status}</div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                                    {user.score.toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    매월 1일 자정, 새로운 시즌이 시작됩니다
                </div>
            </div>
        </div>
    );
};

export default Ranking;
