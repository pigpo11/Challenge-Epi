import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFitness } from '../hooks/useFitness';
import { motion } from 'framer-motion';
import { Lock, User, Flame, Loader2 } from 'lucide-react';

const Login = () => {
    const { login } = useFitness();
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!nickname || password.length !== 6) {
            setError('닉네임과 6자리 비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        const result = await login(nickname, password);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '4rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '1.5rem' }}
                >
                    <Flame size={48} fill="var(--primary)" />
                </motion.div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Challenge Epi</h1>
            </header>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <User size={20} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="닉네임"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            maxLength={6}
                            placeholder="비밀번호 (6자리 숫자)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ''))}
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color: '#ff4d4d', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}
                    >
                        {error}
                    </motion.p>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ marginTop: '1rem', padding: '1.1rem', fontSize: '1.1rem', display: 'flex', gap: '8px' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : '로그인'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <Link
                    to="/onboarding"
                    style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.95rem',
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px'
                    }}
                >
                    처음이신가요?
                </Link>
            </div>
        </div>
    );
};

export default Login;
