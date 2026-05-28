import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { OnboardingPage } from './pages/OnboardingPage';
import { MainDashboardPage } from './pages/MainDashboardPage';
import { RealtimeDashboardPage } from './pages/RealtimeDashboardPage';
import { SensorCanvasPage } from './pages/SensorCanvasPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#fffef5] transition-colors">
          <Navigation />
          <Routes>
            <Route path="/" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<MainDashboardPage />} />
            <Route path="/realtime" element={<RealtimeDashboardPage />} />
            <Route path="/sensors" element={<SensorCanvasPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
