import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Users, Calendar, CheckCircle, XCircle, Search } from 'lucide-react';

const Admin = () => {
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);

    // Mock data for admin (In production, fetch from Neon DB)
    const users = [
        { id: 1, nickname: '서초러너', track: 'both', points: 450, lastCert: '2026-02-01' },
        { id: 2, nickname: '강남빌런', track: 'diet', points: 320, lastCert: '2026-02-01' },
        { id: 3, nickname: '헬스왕박군', track: 'workout', points: 280, lastCert: '2026-01-31' },
    ];

    const userHistory = [
        { day: '월', date: '01.27', diet: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', workout: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438' },
        { day: '화', date: '01.28', diet: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', workout: null },
        { day: '수', date: '01.29', diet: null, workout: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48' },
        { day: '목', date: '01.30', diet: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061', workout: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
        { day: '금', date: '01.31', diet: 'https://images.unsplash.com/photo-1547592166-23ac45744a05', workout: null },
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate('/')} style={{ padding: '0.5rem', background: 'var(--glass-bg)', color: '#fff' }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Console</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '300px 1fr' : '1fr', gap: '2rem' }}>
                {/* User List */}
                <section>
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input
                            type="text"
                            placeholder="멤버 검색..."
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} /> 참가 멤버 ({users.length})
                        </h3>
                        {users.map(user => (
                            <button
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className="glass-card"
                                style={{
                                    textAlign: 'left',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderColor: selectedUser?.id === user.id ? 'var(--primary)' : 'var(--glass-border)',
                                    background: selectedUser?.id === user.id ? 'rgba(0, 255, 163, 0.05)' : 'var(--bg-card)'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, color: '#fff' }}>{user.nickname}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.track === 'both' ? '식단+운동' : user.track === 'diet' ? '식단' : '운동'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{user.points} pts</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>최근인증 {user.lastCert}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Selected User History */}
                {selectedUser && (
                    <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={20} color="var(--primary)" /> {selectedUser.nickname}님의 요일별 인증 현황
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            {userHistory.map((day, i) => (
                                <div key={i} className="glass-card" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: 700 }}>{day.day}요일 ({day.date})</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {day.diet ? <CheckCircle size={12} color="var(--primary)" /> : <XCircle size={12} color="#ff4d4d" />} 식단 인증
                                            </div>
                                            <div style={{ height: '120px', background: 'var(--glass-bg)', borderRadius: '8px', overflow: 'hidden' }}>
                                                {day.diet && <img src={day.diet} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {day.workout ? <CheckCircle size={12} color="var(--primary)" /> : <XCircle size={12} color="#ff4d4d" />} 운동 인증
                                            </div>
                                            <div style={{ height: '120px', background: 'var(--glass-bg)', borderRadius: '8px', overflow: 'hidden' }}>
                                                {day.workout && <img src={day.workout} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </div>
        </div>
    );
};

export default Admin;
