import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import DeviceRegistration from './components/DeviceRegistration';
import DeviceSearch from './components/DeviceSearch';
import CertificateDisplay from './components/CertificateDisplay';
import ConnectWallet from './components/ConnectWallet';

// Import new page components
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import GreenPointDashboard from './pages/GreenPointDashboard';
import TransporterDashboard from './pages/TransporterDashboard';
import RecyclingUnitDashboard from './pages/RecyclingUnitDashboard';
import InspectorDashboard from './pages/InspectorDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <Navigation />
          <main className="container mx-auto py-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/connect" element={<ConnectWallet />} />
              <Route path="/register-device" element={<DeviceRegistration />} />
              <Route path="/devices" element={<DeviceSearch />} />
              <Route path="/certificates" element={<CertificateDisplay />} />
              
              {/* Role-specific routes */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/green-point" element={<GreenPointDashboard />} />
              <Route path="/transporter" element={<TransporterDashboard />} />
              <Route path="/recycling-unit" element={<RecyclingUnitDashboard />} />
              <Route path="/inspector" element={<InspectorDashboard />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
