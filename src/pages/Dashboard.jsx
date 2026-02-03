import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useFitness } from '../hooks/useFitness';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Utensils, Award, TrendingUp, Camera, Settings, ChevronRight, Home, Trophy, User, MessageCircle, X, ChevronLeft, Flame, Loader2 } from 'lucide-react';
import sql from '../services/database';
import BottomNav from '../components/BottomNav';

const Dashboard = () => {
    const { profile, setProfile } = useFitness();
    const navigate = useNavigate();
    const dietInputRef = useRef(null);
    const workoutInputRef = useRef(null);
    const [showCertOverlay, setShowCertOverlay] = useState(false);
    const [rankings, setRankings] = useState([]);
    const [loadingRankings, setLoadingRankings] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const results = await sql`
                    SELECT id, nickname as name, points as score, status, "profileImage"
                    FROM "Profile"
                    ORDER BY points DESC
                    LIMIT 5
                `;
                const formatted = results.map((user, index) => ({
                    rank: index + 1,
                    name: user.name,
                    score: Number(user.score) || 0,
                    status: user.status || '오늘도 화이팅!',
                    profileImage: user.profileImage,
                    isMe: user.id === profile.dbId
                }));
                setRankings(formatted);
            } catch (err) {
                console.error('Failed to fetch rankings:', err);
            } finally {
                setLoadingRankings(false);
            }
        };
        fetchRankings();
    }, [profile.points, profile.dbId]);


    const handleCertify = (type) => {
        if (type === 'diet') {
            if ((profile.certs?.diet || []).length >= 5) {
                alert('식단 인증은 하루 최대 5개까지만 가능합니다.');
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

            // Sync to DB
            const syncPost = async () => {
                const targetDbId = newProfile.dbId || profile.dbId;
                if (!targetDbId) {
                    console.error('No DB ID found for sync');
                    return;
                }

                try {
                    setLoadingRankings(true);

                    // 1. Ensure Profile exists/up-to-date in DB
                    // We update points first
                    await sql`UPDATE "Profile" SET points = ${newProfile.points} WHERE id = ${targetDbId}`;

                    // 2. Create Community Post
                    await sql`
                        INSERT INTO "Post" (id, "profileId", type, image, likes, "createdAt")
                        VALUES (gen_random_uuid(), ${targetDbId}, ${type}, ${base64String}, 0, NOW())
                    `;

                    // Refetch rankings after DB update to ensure real-time reflection
                    await fetchRankings();
                } catch (err) {
                    console.error('DB Sync failed:', err);
                    alert('서버 저장에 실패했습니다. 하지만 로컬에는 저장되었습니다.');
                } finally {
                    setLoadingRankings(false);
                }
            };
            syncPost();

            alert(`${type === 'diet' ? '식단' : '운동'} 인증 완료! 10pts가 적립되었고 커뮤니티에 공유되었습니다.`);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteCert = async (type, index) => {
        if (!window.confirm('기록을 삭제하시겠습니까? 적립된 포인트(10pts)도 회수됩니다.')) return;

        const newProfile = { ...profile };
        const imageToDelete = type === 'diet' ? profile.certs.diet[index] : profile.certs.workout;

        if (type === 'diet') {
            newProfile.certs.diet = profile.certs.diet.filter((_, i) => i !== index);
        } else {
            newProfile.certs.workout = null;
        }

        newProfile.points = Math.max(0, (profile.points || 0) - 10);
        setProfile(newProfile);

        // Sync to DB
        if (profile.dbId) {
            try {
                // 1. Update points
                await sql`UPDATE "Profile" SET points = ${newProfile.points} WHERE id = ${profile.dbId}`;

                // 2. Delete the post from Community (based on image match)
                await sql`DELETE FROM "Post" WHERE "profileId" = ${profile.dbId} AND image = ${imageToDelete}`;

                await fetchRankings();
            } catch (err) {
                console.error('Delete sync failed:', err);
                alert('서버 저장소 데이터 삭제에 실패했습니다.');
            }
        }

        alert('기록이 삭제되었습니다.');
    };

    return (
        <div style={{ paddingBottom: '8rem', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Header / Logo Section */}
            <div className="container" style={{ paddingTop: '2rem', marginBottom: '1.5rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                            <Flame size={24} fill="var(--primary)" /> Challenge Epi
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{profile.nickname}님</h2>
                    </div>
                    <Link to="/settings" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                        <Settings size={22} />
                    </Link>
                </header>

                <div className="glass-card" style={{ padding: '1.75rem', background: 'var(--bg-surface)', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <Award size={16} /> 나의 챌린지 포인트
                        </div>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                        {(Number(profile.points) || 0).toLocaleString()}<span style={{ fontSize: '1.1rem', marginLeft: '4px', fontWeight: 500 }}>pts</span>
                    </div>
                </div>
            </div>

            {/* Main Action CTA */}
            <div className="container" style={{ marginBottom: '2.5rem' }}>
                <motion.div
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCertOverlay(true)}
                    className="glass-card"
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(49, 130, 246, 0.2) 0%, rgba(49, 130, 246, 0.05) 100%)', border: '1px solid rgba(49, 130, 246, 0.3)', padding: '1.5rem' }}
                >
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>오늘의 식단/운동 인증하기</div>
                        <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' }}>기록하고 10포인트 적립🔥</div>
                    </div>
                    <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(49, 130, 246, 0.4)' }}>
                        <Camera size={26} />
                    </div>
                </motion.div>
            </div>

            {/* Ranking Section */}
            <div className="container" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingLeft: '4px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>실시간 챌린지 랭킹 👑</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>매월 1일 갱신</div>
                </div>
                <div className="glass-card" style={{ padding: '0.5rem 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {loadingRankings ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                            <Loader2 className="animate-spin" size={20} color="var(--primary)" />
                        </div>
                    ) : rankings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            아직 데이터가 없습니다.
                        </div>
                    ) : (
                        rankings.map((user, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem 1.25rem',
                                    borderBottom: i === rankings.length - 1 ? 'none' : '1px solid var(--border)',
                                    background: user.isMe ? 'rgba(49, 130, 246, 0.08)' : 'transparent'
                                }}
                            >
                                <div style={{ width: '30px', fontSize: '1.1rem', fontWeight: 900, color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                                    {user.rank}
                                </div>
                                <div style={{ marginLeft: '1rem', width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={18} color="var(--text-muted)" />
                                    )}
                                </div>
                                <div style={{ flex: 1, marginLeft: '0.75rem' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {user.name}
                                        {user.isMe && <span style={{ fontSize: '0.6rem', background: 'var(--primary)', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>나</span>}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.status}</div>
                                </div>
                                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                                    {user.score.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>pts</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Full Screen Certification Overlay */}
            <AnimatePresence>
                {showCertOverlay && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-dark)', zIndex: 1000, overflowY: 'auto' }}
                    >
                        <header style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
                            <button onClick={() => setShowCertOverlay(false)} style={{ background: 'none', color: '#fff', border: 'none', padding: '8px' }}>
                                <ChevronLeft size={28} />
                            </button>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 0 }}>오늘의 기록</h1>
                        </header>

                        <div className="container" style={{ paddingTop: '1rem' }}>
                            <input type="file" ref={dietInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileSelect(e, 'diet')} />
                            <input type="file" ref={workoutInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileSelect(e, 'workout')} />

                            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 800 }}>오늘의 인증</h3>

                                {/* Diet */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Utensils size={18} color="var(--primary)" />
                                            <span style={{ fontSize: '1rem', fontWeight: 700 }}>식단 기록 <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>({profile.certs?.diet?.length || 0}/5)</span></span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {(profile.certs?.diet || []).map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <img src={img} alt="인증" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCert('diet', idx)}
                                                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', background: '#ff4d4d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                        {(profile.certs?.diet || []).length < 5 && (
                                            <button
                                                onClick={() => handleCertify('diet')}
                                                style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                            >
                                                <Camera size={24} />
                                                <span style={{ fontSize: '0.7rem' }}>기록하기</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Workout */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Activity size={18} color="var(--primary)" />
                                            <span style={{ fontSize: '1rem', fontWeight: 700 }}>운동 기록</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {profile.certs?.workout ? (
                                            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <img src={profile.certs.workout} alt="인증" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCert('workout')}
                                                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', background: '#ff4d4d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleCertify('workout')}
                                                style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                            >
                                                <Camera size={24} />
                                                <span style={{ fontSize: '0.7rem' }}>기록하기</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCertOverlay(false)}
                                className="btn-primary"
                                style={{ padding: '1.25rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 700 }}
                            >
                                완료
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
};

export default Dashboard;
