import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContractProvider } from './context/ContractContext';
import Navigation from './components/Navigation';
import DeviceRegistration from './components/DeviceRegistration';
import DeviceSearch from './components/DeviceSearch';
import CertificateDisplay from './components/CertificateDisplay';
import ConnectWallet from './components/ConnectWallet';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ContractProvider>
          <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navigation />
            <main className="container">
              <Routes>
                <Route path="/" element={<DeviceSearch />} />
                <Route path="/connect" element={<ConnectWallet />} />
                <Route path="/register-device" element={<DeviceRegistration />} />
                <Route path="/devices" element={<DeviceSearch />} />
                <Route path="/certificates" element={<CertificateDisplay />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </ContractProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
