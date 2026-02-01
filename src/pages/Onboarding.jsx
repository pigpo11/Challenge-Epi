import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFitness } from '../hooks/useFitness';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';

const Onboarding = () => {
    const { calculateFitness, profile } = useFitness();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(profile);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else {
            calculateFitness(formData);
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const steps = [
        { title: '기본 정보', desc: '정확한 계산을 위해 필요해요' },
        { title: '활동 수준', desc: '평소 얼마나 움직이시나요?' },
        { title: '목표 설정', desc: '얼마나 감량하고 싶으신가요?' },
        { title: '챌린지 트랙', desc: '어떤 관리를 원하시나요?' }
    ];

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div className="onboarding-progress" style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>STEP {step}/4</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{steps[step - 1].title}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--glass-bg)', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        style={{ height: '100%', background: 'var(--primary)' }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card"
                >
                    <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }} className="gradient-text">{steps[step - 1].title}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{steps[step - 1].desc}</p>

                    {step === 1 && (
                        <div className="fade-in">
                            <div className="input-group">
                                <label>닉네임</label>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    placeholder="예: 서초빌런, 강남러너"
                                />
                            </div>
                            <div className="input-group">
                                <label>성별</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['male', 'female'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            style={{
                                                flex: 1,
                                                padding: '1rem',
                                                background: formData.gender === g ? 'var(--primary)' : 'var(--glass-bg)',
                                                color: formData.gender === g ? '#000' : '#fff',
                                                border: '1px solid',
                                                borderColor: formData.gender === g ? 'var(--primary)' : 'var(--border)'
                                            }}
                                        >
                                            {g === 'male' ? '남성' : '여성'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
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
                                <label>나이 (세)</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="25" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="fade-in">
                            <div className="input-group">
                                <label>주간 활동량</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        { val: '1.2', label: '거의 없음', sub: '좌식생활, 운동 안함' },
                                        { val: '1.375', label: '활동량 적음', sub: '주당 1~3회 운동' },
                                        { val: '1.55', label: '보통', sub: '주당 3~5회 운동' },
                                        { val: '1.725', label: '활동적', sub: '주당 6~7회 운동' },
                                        { val: '1.9', label: '매우 활동적', sub: '매일 운동, 하루 2번' }
                                    ].map(a => (
                                        <button
                                            key={a.val}
                                            onClick={() => setFormData({ ...formData, activity: a.val })}
                                            style={{
                                                textAlign: 'left',
                                                padding: '1rem',
                                                background: formData.activity === a.val ? 'rgba(0, 255, 163, 0.1)' : 'var(--glass-bg)',
                                                border: '1px solid',
                                                borderColor: formData.activity === a.val ? 'var(--primary)' : 'var(--border)',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <span style={{ fontWeight: 700, color: formData.activity === a.val ? 'var(--primary)' : '#fff' }}>{a.label}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="fade-in">
                            <div className="input-group">
                                <label>목표 감량 강도 (%)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    name="deficit"
                                    value={formData.deficit}
                                    onChange={handleChange}
                                    style={{ accentColor: 'var(--primary)', marginBottom: '1rem' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{formData.deficit}%</span>
                                    <span style={{ color: 'var(--text-muted)', textAlign: 'right', fontSize: '0.875rem' }}>
                                        TDEE에서 {formData.deficit}%를 줄인<br />다이어트 칼로리로 설정됩니다.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="fade-in">
                            <div className="input-group">
                                <label>트랙 선택</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { id: 'diet', label: '식단', desc: '영양 성분 중심 식단만 추천' },
                                        { id: 'workout', label: '운동', desc: '유산소 루틴 중심 운동만 추천' },
                                        { id: 'both', label: '식단 + 운동', desc: '완벽한 체중 관리를 위한 복합 추천' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setFormData({ ...formData, track: t.id })}
                                            style={{
                                                textAlign: 'left',
                                                padding: '1.25rem',
                                                background: formData.track === t.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)',
                                                border: '1px solid',
                                                borderColor: formData.track === t.id ? 'var(--secondary)' : 'var(--border)'
                                            }}
                                        >
                                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: formData.track === t.id ? 'var(--secondary)' : '#fff' }}>{t.label}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="btn-glass"
                                style={{ flex: 1, padding: '1rem', background: 'var(--glass-bg)', color: '#fff' }}
                            >
                                <ChevronLeft size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                이전
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="btn-primary"
                            style={{ flex: 2 }}
                            disabled={step === 1 && (!formData.height || !formData.weight || !formData.nickname)}
                        >
                            {step === 4 ? '챌린지 시작하기' : '다음 단계'}
                            {step < 4 && <ChevronRight size={20} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;
