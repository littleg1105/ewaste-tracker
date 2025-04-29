import React, { useState, useEffect } from 'react';
import { useContract } from '../context/ContractContext';
import { useAuth } from '../context/AuthContext';

const CertificateDisplay = () => {
  const { ewasteCertificate, ewasteTracker } = useContract();
  const { account } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, [ewasteCertificate]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const certificateCount = await ewasteCertificate.certificateCount();
      const certificatePromises = [];

      for (let i = 1; i <= certificateCount; i++) {
        certificatePromises.push(ewasteCertificate.getCertificate(i));
      }

      const certificateResults = await Promise.all(certificatePromises);
      setCertificates(certificateResults);
    } catch (err) {
      setError('Error loading certificates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceDetails = async (deviceId) => {
    try {
      const device = await ewasteTracker.getDeviceById(deviceId);
      setDeviceDetails(device);
    } catch (err) {
      console.error('Error loading device details:', err);
    }
  };

  const verifyCertificate = async (certificateId) => {
    try {
      const isValid = await ewasteCertificate.verifyCertificate(certificateId);
      setVerificationResult(isValid);
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setVerificationResult(false);
    }
  };

  const handleCertificateClick = async (certificate) => {
    setSelectedCertificate(certificate);
    await loadDeviceDetails(certificate.deviceId);
    await verifyCertificate(certificate.id);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '1rem' }}>Loading certificates...</div>;
  }

  if (error) {
    return <div style={{ color: '#dc2626', padding: '1rem' }}>{error}</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '0.5rem', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Certificates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                onClick={() => handleCertificateClick(certificate)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  backgroundColor: selectedCertificate?.id === certificate.id ? '#e0f2fe' : 'white'
                }}
              >
                <div style={{ fontWeight: '600' }}>
                  Certificate #{certificate.id}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Device ID: {certificate.deviceId}
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  Status:{' '}
                  <span style={{ color: certificate.isValid ? '#059669' : '#dc2626' }}>
                    {certificate.isValid ? 'Valid' : 'Revoked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCertificate && deviceDetails && (
          <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderRadius: '0.5rem', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Certificate Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <span style={{ fontWeight: '600' }}>Certificate ID:</span>{' '}
                {selectedCertificate.id}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Device ID:</span>{' '}
                {selectedCertificate.deviceId}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Recycling Unit:</span>{' '}
                {selectedCertificate.recyclingUnit}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Issue Date:</span>{' '}
                {new Date(selectedCertificate.issueDate * 1000).toLocaleString()}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Status:</span>{' '}
                <span style={{ color: selectedCertificate.isValid ? '#059669' : '#dc2626' }}>
                  {selectedCertificate.isValid ? 'Valid' : 'Revoked'}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Notes:</span>{' '}
                {selectedCertificate.notes}
              </div>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Device Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <span style={{ fontWeight: '600' }}>Serial Number:</span>{' '}
                {deviceDetails.serialNumber}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Device Type:</span>{' '}
                {deviceDetails.deviceType}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Current Status:</span>{' '}
                {deviceDetails.status}
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Verification Result</h3>
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.25rem',
                backgroundColor: verificationResult ? '#dcfce7' : '#fee2e2',
                color: verificationResult ? '#166534' : '#b91c1c'
              }}>
                {verificationResult
                  ? 'Certificate is valid'
                  : 'Certificate is invalid or has been revoked'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateDisplay; 