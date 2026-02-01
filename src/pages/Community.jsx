import { useState, useEffect } from 'react';
import { useFitness } from '../hooks/useFitness';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, User as UserIcon, Home, MessageSquare, ChevronLeft, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Community = () => {
    const { profile } = useFitness();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);

    useEffect(() => {
        const defaultPosts = [
            {
                id: 1,
                user: '에피소드 서초 김OO',
                type: 'diet',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
                time: '2시간 전',
                comments: [
                    { id: 1, user: '운동왕', text: '열정이 대단하시네요 ㅎㅎ' }
                ]
            },
            {
                id: 2,
                user: '강남빌런 박OO',
                type: 'workout',
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
                time: '3시간 전',
                comments: [
                    { id: 3, user: '서초러너', text: '와 5km 페이스가 어떻게 되시나요?' }
                ]
            }
        ];

        const savedPosts = JSON.parse(localStorage.getItem('community-posts') || '[]');
        setPosts([...savedPosts, ...defaultPosts]);
    }, []);

    const [commentText, setCommentText] = useState({});

    const handleCommentChange = (postId, text) => {
        setCommentText(prev => ({ ...prev, [postId]: text }));
    };

    const handleAddComment = (postId) => {
        if (!commentText[postId]) return;

        const newPosts = posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [
                        ...post.comments,
                        { id: Date.now(), user: profile.nickname || '나', text: commentText[postId] }
                    ]
                };
            }
            return post;
        });

        setPosts(newPosts);
        setCommentText(prev => ({ ...prev, [postId]: '' }));
    };

    const toggleLike = (postId) => {
        if (likedPosts.includes(postId)) {
            setLikedPosts(prev => prev.filter(id => id !== postId));
        } else {
            setLikedPosts(prev => [...prev, postId]);
        }
    };

    const handleDeleteComment = (postId, commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        const newPosts = posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: post.comments.filter(c => c.id !== commentId)
                };
            }
            return post;
        });
        setPosts(newPosts);
    };

    return (
        <div style={{ paddingBottom: '8rem' }}>
            <header style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
                <Link to="/dashboard" style={{ color: '#fff' }}>
                    <ChevronLeft size={28} />
                </Link>
                <h1 style={{ fontSize: '1.3rem', marginBottom: 0 }}>커뮤니티</h1>
            </header>

            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    {posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                            <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                            <p>아직 등록된 인증이 없어요.<br />첫 번째 주인공이 되어보세요!</p>
                        </div>
                    ) : (
                        posts.map((post) => {
                            const isLiked = likedPosts.includes(post.id);
                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card"
                                    style={{ padding: '0', overflow: 'hidden', background: 'var(--bg-surface)' }}
                                >
                                    {/* User Info */}
                                    <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserIcon size={20} color="var(--text-muted)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{post.user}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.time} · {post.type === 'diet' ? '식단 인증' : '운동 인증'}</div>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    <div style={{ width: '100%', aspectRatio: '1/1', background: '#000' }}>
                                        <img src={post.image} alt="인증샷" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>

                                    {/* Actions & Content */}
                                    <div style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                onClick={() => toggleLike(post.id)}
                                                style={{ background: 'none', color: isLiked ? '#ff4d4d' : '#fff', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
                                            >
                                                <Heart size={24} fill={isLiked ? '#ff4d4d' : 'none'} />
                                                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
                                            </motion.button>
                                            <div style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
                                                <MessageCircle size={24} />
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        {post.comments.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '1rem' }}>
                                                {post.comments.map(comment => {
                                                    const canDelete = post.user === profile.nickname || comment.user === profile.nickname;
                                                    return (
                                                        <div key={comment.id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <span style={{ fontWeight: 700, marginRight: '6px' }}>{comment.user}</span>
                                                                <span style={{ color: '#eee' }}>{comment.text}</span>
                                                            </div>
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                                                    style={{ background: 'none', color: 'rgba(255,255,255,0.2)', padding: '2px', marginLeft: '8px' }}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Comment Input */}
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <input
                                                type="text"
                                                placeholder="댓글 달기..."
                                                value={commentText[post.id] || ''}
                                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                                style={{ flex: 1, background: '#1c1c22', border: '1px solid var(--border)', padding: '0.7rem 1rem', borderRadius: '12px', fontSize: '0.9rem', color: '#fff' }}
                                            />
                                            <button
                                                onClick={() => handleAddComment(post.id)}
                                                style={{ background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}
                                            >
                                                게시
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <Link to="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', gap: '4px' }}>
                    <Home size={22} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>홈</span>
                </Link>
                <Link to="/community" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)', textDecoration: 'none', gap: '4px' }}>
                    <MessageCircle size={22} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>커뮤니티</span>
                </Link>
                <Link to="/settings" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', gap: '4px' }}>
                    <UserIcon size={22} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>정보</span>
                </Link>
            </nav>
        </div>
    );
};

export default Community;
