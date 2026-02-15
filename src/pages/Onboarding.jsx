import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitness } from '../hooks/useFitness';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useRef, useEffect } from 'react';
import supabase from '../services/database';

const Onboarding = () => {
    const { calculateFitness, profile } = useFitness();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(profile);

    const [loading, setLoading] = useState(false);
    const [nicknameError, setNicknameError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Pin input refs
    const pinRefs = useRef([]);
    const confirmPinRefs = useRef([]);

    const handleNext = async () => {
        if (step === 1) {
            const nickname = (formData.nickname || '').trim();
            if (!nickname) {
                setNicknameError('닉네임을 입력해주세요.');
                return;
            }

            setLoading(true);
            setNicknameError('');
            try {
                const { data: results, error } = await supabase
                    .from('Profile')
                    .select('id')
                    .eq('nickname', nickname)
                    .limit(1);
                if (error) throw error;
                if (results && results.length > 0) {
                    setNicknameError('이미 사용 중인 닉네임입니다.');
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error('Nickname check failed:', err);
                // Fallback to proceed if DB is shaky
            }
            setLoading(false);
            setStep(2);
        } else if (step === 2) {
            if (!isConfirming) {
                if ((formData.password || '').length !== 6) {
                    alert('비밀번호 6자리를 모두 입력해주세요.');
                    return;
                }
                setIsConfirming(true);
                setPasswordError('');
            } else {
                if (formData.password !== confirmPassword) {
                    setPasswordError('비밀번호가 동일하지 않습니다.');
                    setConfirmPassword('');
                    // Reset focus to first confirm input
                    if (confirmPinRefs.current[0]) confirmPinRefs.current[0].focus();
                    return;
                }
                setStep(3);
            }
        } else if (step < 6) {
            setStep(step + 1);
        } else {
            if (!formData.nickname || !formData.height) {
                alert('필수 정보를 모두 입력해주세요.');
                return;
            }
            setLoading(true);
            await calculateFitness(formData);
            setLoading(false);
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'nickname') setNicknameError('');
    };

    const steps = [
        { title: '반가워요!\n닉네임을 알려주세요', desc: '챌린지에서 사용할 이름이에요' },
        { title: '로그인 시 사용할\n숫자 6자리를 입력해주세요', desc: '' },
        { title: '신체 정보를\n입력해 주세요', desc: '정확한 칼로리 계산을 위해 필요해요' },
        { title: '평소 활동량은\n어느 정도인가요?', desc: '보통의 하루를 기준으로 선택해 주세요' },
        { title: '얼마나\n감량하고 싶으세요?', desc: '건강한 감량을 위해 20% 이내를 권장해요' },
        { title: '어떤 관리에\n집중하고 싶으세요?', desc: '딱 맞는 트랙을 설정해 드릴게요' }
    ];

    const currentTitle = (step === 2 && isConfirming) ? '비밀번호를\n한 번 더 입력해 주세요' : steps[step - 1].title;

    const handlePinChange = (val, index, isConfirm = false) => {
        const value = val.replace(/[^0-9]/g, '').slice(-1);
        if (isConfirm) {
            const newConfirm = confirmPassword.split('');
            newConfirm[index] = value;
            setConfirmPassword(newConfirm.join(''));
            if (value && index < 5) confirmPinRefs.current[index + 1].focus();
        } else {
            const newPass = (formData.password || '').split('');
            newPass[index] = value;
            setFormData({ ...formData, password: newPass.join('') });
            if (value && index < 5) pinRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index, isConfirm = false) => {
        if (e.key === 'Backspace') {
            const val = isConfirm ? confirmPassword : formData.password;
            if (!val[index] && index > 0) {
                if (isConfirm) confirmPinRefs.current[index - 1].focus();
                else pinRefs.current[index - 1].focus();
            }
        }
    };

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '4rem', paddingBottom: '2rem' }}>
            {/* Minimal Progress Bar */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--glass-bg)', zIndex: 100 }}>
                <motion.div
                    initial={{ width: '16%' }}
                    animate={{ width: `${(step / 6) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    style={{ height: '100%', background: 'var(--primary)' }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ flex: 1 }}
                >
                    <header style={{ marginBottom: '3rem' }}>
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                style={{ background: 'none', color: 'var(--text-muted)', padding: '0.5rem 0', marginBottom: '1rem', marginLeft: '-0.5rem' }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <h1 style={{ whiteSpace: 'pre-line', fontSize: '1.8rem', lineHeight: '1.4' }}>
                            {currentTitle}
                        </h1>
                        {steps[step - 1].desc && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
                                {steps[step - 1].desc}
                            </p>
                        )}
                    </header>

                    {step === 1 && (
                        <div className="input-group">
                            <input
                                autoFocus
                                type="text"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="닉네임 입력"
                                style={{ fontSize: '1.2rem', padding: '1.25rem', background: 'var(--bg-surface)', border: nicknameError ? '2px solid #ff4d4d' : 'none' }}
                            />
                            {nicknameError && (
                                <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginTop: '8px', marginLeft: '4px' }}>{nicknameError}</p>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                {[...Array(6)].map((_, i) => (
                                    <input
                                        key={i}
                                        ref={el => isConfirming ? (confirmPinRefs.current[i] = el) : (pinRefs.current[i] = el)}
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={(isConfirming ? confirmPassword : formData.password || '')[i] || ''}
                                        onChange={(e) => handlePinChange(e.target.value, i, isConfirming)}
                                        onKeyDown={(e) => handleKeyDown(e, i, isConfirming)}
                                        placeholder="-"
                                        style={{
                                            width: '46px',
                                            height: '56px',
                                            fontSize: '1.5rem',
                                            textAlign: 'center',
                                            background: 'var(--bg-surface)',
                                            border: passwordError && isConfirming ? '2px solid #ff4d4d' : '2px solid transparent',
                                            borderRadius: '12px',
                                            color: 'var(--primary)',
                                            fontWeight: 700
                                        }}
                                    />
                                ))}
                            </div>
                            {passwordError && isConfirming && (
                                <p style={{ color: '#ff4d4d', fontSize: '0.9rem', textAlign: 'center' }}>{passwordError}</p>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="input-group">
                                <label>성별</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {['male', 'female'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            style={{
                                                flex: 1,
                                                padding: '1.1rem',
                                                background: formData.gender === g ? 'var(--primary)' : 'var(--bg-surface)',
                                                color: formData.gender === g ? '#fff' : 'var(--text-muted)',
                                                borderRadius: '16px',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {g === 'male' ? '남성' : '여성'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>키 (cm)</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="175" />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>몸무게 (kg)</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="70" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>나이</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="25"
                                        style={{ paddingRight: '3rem' }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        right: '1.25rem',
                                        color: 'var(--text-muted)',
                                        fontSize: '1rem',
                                        pointerEvents: 'none'
                                    }}>
                                        세
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { val: '1.2', label: '거의 없음', sub: '좌식생활, 운동 안 함' },
                                { val: '1.375', label: '활동량 적음', sub: '주당 1~3회 정도 가벼운 운동' },
                                { val: '1.55', label: '보통', sub: '주당 3~5회 꾸준한 운동' },
                                { val: '1.725', label: '활동적', sub: '주당 6~7회 강도 높은 운동' },
                                { val: '1.9', label: '매우 활동적', sub: '매일 고강도 운동 또는 하루 2번 운동' }
                            ].map(a => (
                                <button
                                    key={a.val}
                                    onClick={() => setFormData({ ...formData, activity: a.val })}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1rem 1.25rem',
                                        background: formData.activity === a.val ? 'rgba(49, 130, 246, 0.1)' : 'var(--bg-surface)',
                                        border: formData.activity === a.val ? '2px solid var(--primary)' : '2px solid transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px',
                                        borderRadius: '18px'
                                    }}
                                >
                                    <span style={{ fontWeight: 700, color: formData.activity === a.val ? 'var(--primary)' : '#fff', fontSize: '1rem' }}>{a.label}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.sub}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 5 && (
                        <div style={{ padding: '0 1rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                                    {formData.deficit}<span style={{ fontSize: '1.5rem' }}>%</span>
                                </div>
                                <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>일일 칼로리 감량 비율</div>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={formData.deficit}
                                onChange={(e) => setFormData({ ...formData, deficit: e.target.value })}
                                style={{
                                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(formData.deficit - 1) / (20 - 1) * 100}%, var(--bg-surface) ${(formData.deficit - 1) / (20 - 1) * 100}%, var(--bg-surface) 100%)`
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <span>적극적 (1%)</span>
                                <span>강력함 (20%)</span>
                            </div>

                            <div className="glass-card" style={{ marginTop: '3rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                                    💡 <strong>팁:</strong> 초보자라면 10~15% 사이를 추천해요. 20% 이상의 무리한 감량은 근손실을 유발할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { id: 'diet', label: '식단', desc: '영양 성분 중심의 맞춤 식단 관리 최적화' },
                                { id: 'workout', label: '운동', desc: '체계적인 유산소 및 근력 루틴 추천' },
                                { id: 'both', label: '식단/운동 복합', desc: '가장 효과적인 토탈 케어 솔루션' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setFormData({ ...formData, track: t.id })}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1.5rem',
                                        background: formData.track === t.id ? 'rgba(49, 130, 246, 0.1)' : 'var(--bg-surface)',
                                        border: formData.track === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        borderRadius: '24px'
                                    }}
                                >
                                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: formData.track === t.id ? 'var(--primary)' : '#fff' }}>{t.label}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.desc}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Bottom Button Area */}
            <footer style={{ marginTop: '2rem', paddingBottom: 'var(--safe-area-bottom)' }}>
                <button
                    onClick={handleNext}
                    className="btn-primary"
                    disabled={
                        loading ||
                        (step === 1 && !(formData.nickname || '').trim()) ||
                        (step === 2 && (!isConfirming ? (formData.password || '').length !== 6 : confirmPassword.length !== 6)) ||
                        (step === 3 && (!formData.height || !formData.weight))
                    }
                    style={{
                        opacity: (loading || (step === 1 && !(formData.nickname || '').trim()) || (step === 2 && (!isConfirming ? (formData.password || '').length !== 6 : confirmPassword.length !== 6)) || (step === 3 && (!formData.height || !formData.weight))) ? 0.5 : 1,
                        padding: '1.25rem',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 30px rgba(49, 130, 246, 0.2)',
                        display: 'flex',
                        gap: '8px'
                    }}
                >
                    {loading && <Loader2 className="animate-spin" size={20} />}
                    {step === 6 ? '시작하기' : '다음'}
                </button>
            </footer>
        </div>
    );
};

export default Onboarding;
