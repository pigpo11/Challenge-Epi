import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, User } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <nav className="bottom-nav">
            <Link to="/dashboard" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: currentPath === '/dashboard' ? 'var(--primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                gap: '4px'
            }}>
                <Home size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>홈</span>
            </Link>
            <Link to="/community" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: currentPath === '/community' ? 'var(--primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                gap: '4px'
            }}>
                <MessageCircle size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>커뮤니티</span>
            </Link>
            <Link to="/settings" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: currentPath === '/settings' ? 'var(--primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                gap: '4px'
            }}>
                <User size={22} />
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>정보</span>
            </Link>
        </nav>
    );
};

export default BottomNav;
