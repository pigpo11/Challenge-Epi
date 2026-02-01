import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useFitness } from './hooks/useFitness';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Settings from './pages/Settings';
import './index.css';

function App() {
  const { profile } = useFitness();
  const isSetup = Boolean(profile?.isSetup);

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
            path="/community"
            element={isSetup ? <Community /> : <Navigate to="/onboarding" />}
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
