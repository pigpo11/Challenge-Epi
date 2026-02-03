import { useState, useEffect } from 'react';
import { useFitness } from '../hooks/useFitness';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, User as UserIcon, Home, MessageSquare, ChevronLeft, X, Loader2, Camera, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import sql from '../services/database';
import BottomNav from '../components/BottomNav';

const Community = () => {
    const { profile, setProfile } = useFitness();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch posts first
                const postResults = await sql`
                    SELECT 
                        p.id, 
                        p.type, 
                        p.image, 
                        p.likes, 
                        p."createdAt" as time,
                        pr.nickname as user,
                        pr.id as "profileId",
                        pr."profileImage"
                    FROM "Post" p
                    JOIN "Profile" pr ON p."profileId" = pr.id
                    ORDER BY p."createdAt" DESC
                `;

                // Fetch ALL comments and group them (or fetch per post, but one big query is often better for lists)
                const commentResults = await sql`
                    SELECT 
                        c.id, 
                        c."postId", 
                        c.text, 
                        c."createdAt", 
                        pr.nickname as user,
                        pr."profileImage"
                    FROM "Comment" c
                    JOIN "Profile" pr ON c."profileId" = pr.id
                    ORDER BY c."createdAt" ASC
                `;

                // Fetch current user's likes from Like table
                if (profile.dbId) {
                    const userLikes = await sql`
                        SELECT "postId" FROM "Like" WHERE "profileId" = ${profile.dbId}
                    `;
                    setLikedPosts(userLikes.map(like => like.postId));
                }

                const formattedPosts = postResults.map(p => {
                    // Normalize DB string to UTC if it lacks timezone info
                    const dateObj = (typeof p.time === 'string' && !p.time.includes('Z') && !p.time.includes('+'))
                        ? new Date(p.time.replace(' ', 'T') + 'Z')
                        : new Date(p.time);

                    const formattedDate = dateObj.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        timeZone: 'Asia/Seoul'
                    }).replace(/\. /g, '.').replace(/\.$/, '');

                    const formattedTime = dateObj.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Seoul'
                    });

                    return {
                        ...p,
                        date: formattedDate,
                        time: formattedTime,
                        comments: commentResults.filter(c => c.postId === p.id)
                    };
                });

                setPosts(formattedPosts);
            } catch (err) {
                console.error('Failed to fetch posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [profile.dbId]);

    const [commentText, setCommentText] = useState({});

    const handleCommentChange = (postId, text) => {
        setCommentText(prev => ({ ...prev, [postId]: text }));
    };

    const handleAddComment = async (postId) => {
        if (!commentText[postId] || !profile.dbId) return;

        const text = commentText[postId];
        const tempId = Date.now().toString();

        // 1. Optimistic Update
        const newPosts = posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [
                        ...post.comments,
                        { id: tempId, user: profile.nickname || '나', text: text, profileImage: profile.profileImage }
                    ]
                };
            }
            return post;
        });
        setPosts(newPosts);
        setCommentText(prev => ({ ...prev, [postId]: '' }));

        // 2. DB Sync
        try {
            await sql`
                INSERT INTO "Comment" (id, "postId", "profileId", text, "createdAt")
                VALUES (gen_random_uuid(), ${postId}, ${profile.dbId}, ${text}, NOW())
            `;
        } catch (err) {
            console.error('Failed to save comment:', err);
            alert('댓글 저장에 실패했습니다.');
            // Rollback if necessary
        }
    };

    const toggleLike = async (postId) => {
        if (!profile.dbId) {
            alert('좋아요를 누르려면 로그인이 필요합니다.');
            return;
        }

        const isLiked = likedPosts.includes(postId);

        // 1. UI Update (Optimistic)
        if (isLiked) {
            setLikedPosts(prev => prev.filter(id => id !== postId));
            // Update post likes count in UI
            setPosts(prev => prev.map(post =>
                post.id === postId ? { ...post, likes: Math.max(0, (post.likes || 0) - 1) } : post
            ));
        } else {
            setLikedPosts(prev => [...prev, postId]);
            // Update post likes count in UI
            setPosts(prev => prev.map(post =>
                post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
            ));
        }

        // 2. DB Sync - Insert/Delete Like record and update Post likes count
        try {
            if (isLiked) {
                // Remove like
                await sql`DELETE FROM "Like" WHERE "postId" = ${postId} AND "profileId" = ${profile.dbId}`;
                await sql`UPDATE "Post" SET likes = GREATEST(0, likes - 1) WHERE id = ${postId}`;
            } else {
                // Add like
                await sql`
                    INSERT INTO "Like" (id, "postId", "profileId", "createdAt")
                    VALUES (gen_random_uuid(), ${postId}, ${profile.dbId}, NOW())
                    ON CONFLICT ("postId", "profileId") DO NOTHING
                `;
                await sql`UPDATE "Post" SET likes = likes + 1 WHERE id = ${postId}`;
            }
        } catch (err) {
            console.error('Like sync failed:', err);
            // Rollback UI on error
            if (isLiked) {
                setLikedPosts(prev => [...prev, postId]);
                setPosts(prev => prev.map(post =>
                    post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
                ));
            } else {
                setLikedPosts(prev => prev.filter(id => id !== postId));
                setPosts(prev => prev.map(post =>
                    post.id === postId ? { ...post, likes: Math.max(0, (post.likes || 0) - 1) } : post
                ));
            }
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        // 1. UI Update
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

        // 2. DB Sync
        try {
            await sql`DELETE FROM "Comment" WHERE id = ${commentId}`;
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    const handleDeletePost = async (post) => {
        if (!window.confirm('인증 게시글을 삭제하시겠습니까?\n적립된 포인트(10pts)도 회수됩니다.')) return;

        // 1. UI Update
        setPosts(prev => prev.filter(p => p.id !== post.id));

        // 2. DB Sync
        try {
            // Deduct points atomically in DB
            await sql`UPDATE "Profile" SET points = GREATEST(0, points - 10), "updatedAt" = NOW() WHERE id = ${profile.dbId}`;

            // Delete post record
            await sql`DELETE FROM "Post" WHERE id = ${post.id}`;

            // Sync local profile state: remove from certs and update points
            setProfile(prev => {
                const newPoints = Math.max(0, (prev.points || 0) - 10);
                const newCerts = { ...prev.certs };

                if (post.type === 'diet') {
                    newCerts.diet = (newCerts.diet || []).filter(c =>
                        typeof c === 'string' ? c !== post.image : c.id !== post.id
                    );
                } else {
                    const workoutCert = newCerts.workout;
                    if (workoutCert) {
                        const isMatch = typeof workoutCert === 'string'
                            ? workoutCert === post.image
                            : workoutCert.id === post.id;
                        if (isMatch) newCerts.workout = null;
                    }
                }
                return { ...prev, points: newPoints, certs: newCerts };
            });
        } catch (err) {
            console.error('Failed to delete post:', err);
            alert('게시글 삭제에 실패했습니다.');
        }
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
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>피드를 불러오는 중...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                            <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.2, margin: '0 auto' }} />
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
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {post.profileImage ? (
                                                <img src={post.profileImage} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <UserIcon size={20} color="var(--text-muted)" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{post.user}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {post.date} {post.time} · <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{post.type === 'diet' ? '식단 인증' : '운동 인증'}</span>
                                            </div>
                                        </div>
                                        {post.profileId === profile.dbId && (
                                            <button
                                                onClick={() => handleDeletePost(post)}
                                                style={{ background: 'none', color: 'rgba(255,255,255,0.2)', padding: '8px' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Image */}
                                    <div style={{ width: '100%', aspectRatio: '1/1', background: '#000' }}>
                                        <img src={post.image} alt="인증샷" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                                                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{post.likes || 0}</span>
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
                                                            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0, marginTop: '2px' }}>
                                                                    {comment.profileImage ? (
                                                                        <img src={comment.profileImage} alt="댓글 프로필" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <UserIcon size={14} color="var(--text-muted)" style={{ margin: '5px' }} />
                                                                    )}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <span style={{ fontWeight: 700, marginRight: '6px' }}>{comment.user}</span>
                                                                    <span style={{ color: '#eee' }}>{comment.text}</span>
                                                                </div>
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

            <BottomNav />
        </div>
    );
};

export default Community;
