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
    return <div className="text-center p-4">Loading certificates...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Certificates</h2>
          <div className="space-y-2">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                onClick={() => handleCertificateClick(certificate)}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedCertificate?.id === certificate.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-semibold">
                  Certificate #{certificate.id}
                </div>
                <div className="text-sm text-gray-600">
                  Device ID: {certificate.deviceId}
                </div>
                <div className="text-sm">
                  Status:{' '}
                  <span
                    className={
                      certificate.isValid
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {certificate.isValid ? 'Valid' : 'Revoked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCertificate && deviceDetails && (
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Certificate Details</h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Certificate ID:</span>{' '}
                {selectedCertificate.id}
              </div>
              <div>
                <span className="font-semibold">Device ID:</span>{' '}
                {selectedCertificate.deviceId}
              </div>
              <div>
                <span className="font-semibold">Recycling Unit:</span>{' '}
                {selectedCertificate.recyclingUnit}
              </div>
              <div>
                <span className="font-semibold">Issue Date:</span>{' '}
                {new Date(
                  selectedCertificate.issueDate * 1000
                ).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={
                    selectedCertificate.isValid
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {selectedCertificate.isValid ? 'Valid' : 'Revoked'}
                </span>
              </div>
              <div>
                <span className="font-semibold">Notes:</span>{' '}
                {selectedCertificate.notes}
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">Device Details</h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Serial Number:</span>{' '}
                {deviceDetails.serialNumber}
              </div>
              <div>
                <span className="font-semibold">Device Type:</span>{' '}
                {deviceDetails.deviceType}
              </div>
              <div>
                <span className="font-semibold">Current Status:</span>{' '}
                {deviceDetails.status}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Verification Result</h3>
              <div
                className={`p-3 rounded ${
                  verificationResult
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
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