import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useFitness } from './hooks/useFitness';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Ranking from './pages/Ranking';
import Recommendations from './pages/Recommendations';
import './index.css';

function App() {
  const { profile } = useFitness();
  const isAuthenticated = Boolean(profile?.dbId);

  return (
    <Router>
      <div className="app-layout">
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/onboarding"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Onboarding />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/community"
            element={isAuthenticated ? <Community /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
          />
          <Route
            path="/ranking"
            element={isAuthenticated ? <Ranking /> : <Navigate to="/login" />}
          />
          <Route
            path="/recommendations"
            element={isAuthenticated ? <Recommendations /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
