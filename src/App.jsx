import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useFitness } from './hooks/useFitness';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import Ranking from './pages/Ranking';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import './index.css';

function App() {
  const { profile } = useFitness();
  const isSetup = profile.bmr !== '';

  return (
    <Router>
      <div className="app-layout">
        <Routes>
          <Route
            path="/"
            element={isSetup ? <Navigate to="/dashboard" /> : <Onboarding />}
          />
          <Route
            path="/onboarding"
            element={<Onboarding />}
          />
          <Route
            path="/dashboard"
            element={isSetup ? <Dashboard /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="/recommendations"
            element={isSetup ? <Recommendations /> : <Navigate to="/onboarding" />}
          />
          <Route
            path="/ranking"
            element={<Ranking />}
          />
          <Route
            path="/admin"
            element={<Admin />}
          />
          <Route
            path="/settings"
            element={isSetup ? <Settings /> : <Navigate to="/onboarding" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
