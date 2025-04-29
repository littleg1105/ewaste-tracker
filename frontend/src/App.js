import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContractProvider } from './context/ContractContext';
import Navigation from './components/Navigation';
import DeviceRegistration from './components/DeviceRegistration';
import DeviceSearch from './components/DeviceSearch';
import CertificateDisplay from './components/CertificateDisplay';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ContractProvider>
          <div className="min-h-screen bg-gray-100">
            <Navigation />
            <main className="container mx-auto py-6">
              <Routes>
                <Route path="/" element={<DeviceSearch />} />
                <Route path="/register-device" element={<DeviceRegistration />} />
                <Route path="/devices" element={<DeviceSearch />} />
                <Route path="/certificates" element={<CertificateDisplay />} />
              </Routes>
            </main>
          </div>
        </ContractProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
