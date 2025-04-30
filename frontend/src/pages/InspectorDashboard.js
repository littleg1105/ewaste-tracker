import React, { useState, useEffect } from 'react';
import { useContract } from '../context/ContractContext';
import { useAuth } from '../context/AuthContext';

const InspectorDashboard = () => {
  const { ewasteTracker, eWasteCertificate } = useContract();
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceCounts, setDeviceCounts] = useState({
    registered: 0,
    collected: 0,
    inTransit: 0,
    delivered: 0,
    recycled: 0,
    destroyed: 0,
    total: 0
  });
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'device', 'certificate'

  // Status mapping for display
  const statusNames = ['Registered', 'Collected', 'In Transit', 'Delivered', 'Recycled', 'Destroyed'];
  const hazardLevelNames = ['Low', 'Medium', 'High'];
  const operationalStatusNames = ['Functional', 'Damaged', 'Hazardous'];

  useEffect(() => {
    if (ewasteTracker) {
      loadDashboardData();
    }
  }, [ewasteTracker]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get counts for each status
      const registered = await ewasteTracker.getDevicesByStatus(0);
      const collected = await ewasteTracker.getDevicesByStatus(1);
      const inTransit = await ewasteTracker.getDevicesByStatus(2);
      const delivered = await ewasteTracker.getDevicesByStatus(3);
      const recycled = await ewasteTracker.getDevicesByStatus(4);
      const destroyed = await ewasteTracker.getDevicesByStatus(5);
      
      // Get total device count
      const deviceCount = await ewasteTracker.deviceCount();
      
      setDeviceCounts({
        registered: registered.length,
        collected: collected.length,
        inTransit: inTransit.length,
        delivered: delivered.length,
        recycled: recycled.length,
        destroyed: destroyed.length,
        total: parseInt(deviceCount.toString())
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSearch = async (e) => {
    e.preventDefault();
    
    if (!deviceId) {
      setError('Please enter a device ID');
      return;
    }
    
    setLoading(true);
    setError('');
    setDeviceDetails(null);
    setDeviceHistory([]);
    setCertificateData(null);
    
    try {
      // Get device details
      const device = await ewasteTracker.getDeviceById(deviceId);
      
      // Get device history
      const history = await ewasteTracker.getDeviceHistory(deviceId);
      
      // Format device details
      setDeviceDetails({
        id: device.id.toString(),
        serialNumber: device.serialNumber,
        deviceType: device.deviceType,
        hazardLevel: parseInt(device.hazardLevel),
        operationalStatus: parseInt(device.operationalStatus),
        status: parseInt(device.status),
        owner: device.deviceOwner,
        currentHolder: device.currentHolder,
        registrationDate: new Date(parseInt(device.registrationDate) * 1000).toLocaleString(),
        lastUpdateDate: new Date(parseInt(device.lastUpdateDate) * 1000).toLocaleString(),
      });
      
      // Format history
      const formattedHistory = history.map(item => ({
        timestamp: new Date(parseInt(item.timestamp) * 1000).toLocaleString(),
        status: parseInt(item.status),
        actor: item.actor,
        notes: item.notes
      }));
      
      setDeviceHistory(formattedHistory);
      
      // Check if certificates exist for this device
      if ((parseInt(device.status) === 4 || parseInt(device.status) === 5) && eWasteCertificate) {
        try {
          const certificateIds = await eWasteCertificate.getCertificatesByDevice(deviceId);
          
          if (certificateIds.length > 0) {
            // Get the most recent certificate
            const latestCertId = certificateIds[certificateIds.length - 1];
            const certificate = await eWasteCertificate.getCertificate(latestCertId);
            
            setCertificateData({
              id: certificate.certificateId.toString(),
              deviceId: certificate.deviceId.toString(),
              recyclingUnit: certificate.recyclingUnit,
              issueDate: new Date(parseInt(certificate.issueDate) * 1000).toLocaleString(),
              processMethod: certificate.processMethod,
              isValid: certificate.isValid
            });
          }
        } catch (err) {
          console.error('Error fetching certificate:', err);
        }
      }
      
      setViewMode('device');
    } catch (err) {
      console.error('Error searching device:', err);
      setError('Device not found or error fetching details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCertificate = async (certificateId) => {
    try {
      setLoading(true);
      const isValid = await eWasteCertificate.verifyCertificate(certificateId);
      
      setCertificateData(prev => ({
        ...prev,
        verificationResult: isValid ? 'Valid' : 'Invalid'
      }));
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('Error verifying certificate');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has Environment Inspector role
  if (role !== 5) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-red-800">You do not have permission to access this page. Only Environment Inspectors can access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Environment Inspector Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            viewMode === 'overview' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setViewMode('overview')}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            viewMode === 'device' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => deviceDetails && setViewMode('device')}
          disabled={!deviceDetails}
        >
          Device Details
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            viewMode === 'certificate' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => certificateData && setViewMode('certificate')}
          disabled={!certificateData}
        >
          Certificate
        </button>
      </div>
      
      {/* Device Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Device Search</h2>
        <form onSubmit={handleDeviceSearch} className="flex items-end gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device ID
            </label>
            <input
              type="number"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter device ID"
              min="1"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`p-2 px-4 text-white font-medium rounded-md ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
      
      {/* Overview Section */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Devices</h3>
              <p className="text-2xl font-bold text-blue-700">{deviceCounts.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Registered</h3>
              <p className="text-2xl font-bold text-gray-700">{deviceCounts.registered}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Collected</h3>
              <p className="text-2xl font-bold text-yellow-600">{deviceCounts.collected}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500">In Transit</h3>
              <p className="text-2xl font-bold text-amber-600">{deviceCounts.inTransit}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Delivered</h3>
              <p className="text-2xl font-bold text-teal-600">{deviceCounts.delivered}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Processed</h3>
              <p className="text-2xl font-bold text-green-600">{deviceCounts.recycled + deviceCounts.destroyed}</p>
              <div className="flex text-xs text-gray-500 mt-1">
                <span className="mr-2">Recycled: {deviceCounts.recycled}</span>
                <span>Destroyed: {deviceCounts.destroyed}</span>
              </div>
            </div>
          </div>
          
          {/* Visual Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
            <div className="h-8 rounded-lg overflow-hidden flex">
              {deviceCounts.total > 0 ? (
                <>
                  <div 
                    className="bg-gray-500 h-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${(deviceCounts.registered / deviceCounts.total) * 100}%` }}
                  >
                    {deviceCounts.registered > 0 && `${Math.round((deviceCounts.registered / deviceCounts.total) * 100)}%`}
                  </div>
                  <div 
                    className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${(deviceCounts.collected / deviceCounts.total) * 100}%` }}
                  >
                    {deviceCounts.collected > 0 && `${Math.round((deviceCounts.collected / deviceCounts.total) * 100)}%`}
                  </div>
                  <div 
                    className="bg-amber-500 h-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${(deviceCounts.inTransit / deviceCounts.total) * 100}%` }}
                  >
                    {deviceCounts.inTransit > 0 && `${Math.round((deviceCounts.inTransit / deviceCounts.total) * 100)}%`}
                  </div>
                  <div 
                    className="bg-teal-500 h-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${(deviceCounts.delivered / deviceCounts.total) * 100}%` }}
                  >
                    {deviceCounts.delivered > 0 && `${Math.round((deviceCounts.delivered / deviceCounts.total) * 100)}%`}
                  </div>
                  <div 
                    className="bg-green-500 h-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${(deviceCounts.recycled / deviceCounts.total) * 100}%` }}
                  >
                    {deviceCounts.recycled > 0 && `${Math.round((deviceCounts.recycled / deviceCounts.total) * 100)}%`}
                  </div>
                  <div 
                    className="bg-red-500 h-full flex items-center justify-center text-white text-xs"
                    style={{ width: `${(deviceCounts.destroyed / deviceCounts.total) * 100}%` }}
                  >
                    {deviceCounts.destroyed > 0 && `${Math.round((deviceCounts.destroyed / deviceCounts.total) * 100)}%`}
                  </div>
                </>
              ) : (
                <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  No devices in the system
                </div>
              )}
            </div>
            <div className="flex flex-wrap mt-3 text-sm">
              <div className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
                <span>Registered</span>
              </div>
              <div className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span>Collected</span>
              </div>
              <div className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span>In Transit</span>
              </div>
              <div className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full bg-teal-500 mr-1"></div>
                <span>Delivered</span>
              </div>
              <div className="flex items-center mr-4 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Recycled</span>
              </div>
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span>Destroyed</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Device Details Section */}
      {viewMode === 'device' && deviceDetails && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold mb-4">Device #{deviceDetails.id}</h2>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                deviceDetails.status === 4 ? 'bg-green-100 text-green-800' :
                deviceDetails.status === 5 ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {statusNames[deviceDetails.status]}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium">{deviceDetails.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{deviceDetails.deviceType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hazard Level</p>
                <p className="font-medium">{hazardLevelNames[deviceDetails.hazardLevel]}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-medium">{operationalStatusNames[deviceDetails.operationalStatus]}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Date</p>
                <p className="font-medium">{deviceDetails.registrationDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{deviceDetails.lastUpdateDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="font-medium truncate">{deviceDetails.owner}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Holder</p>
                <p className="font-medium truncate">{deviceDetails.currentHolder}</p>
              </div>
            </div>
            
            {certificateData && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <div className="flex justify-between mb-2">
                  <p className="font-medium text-green-800">Certificate Available</p>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setViewMode('certificate')}
                  >
                    View Certificate
                  </button>
                </div>
                <p className="text-sm text-green-700">
                  This device has been {deviceDetails.status === 4 ? 'recycled' : 'destroyed'} with a verified certificate.
                </p>
              </div>
            )}
            
            <h3 className="text-lg font-semibold mb-3">Device History</h3>
            <div className="max-h-60 overflow-y-auto">
              <div className="relative">
                {/* Timeline Connector */}
                <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200"></div>
                
                {/* Timeline Items */}
                {deviceHistory.map((item, index) => (
                  <div key={index} className="relative pl-10 pb-6">
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === 0 ? 'bg-gray-200' :
                      item.status === 1 ? 'bg-yellow-200' :
                      item.status === 2 ? 'bg-amber-200' :
                      item.status === 3 ? 'bg-teal-200' :
                      item.status === 4 ? 'bg-green-200' :
                      'bg-red-200'
                    }`}>
                      {item.status === 0 ? '📝' :
                       item.status === 1 ? '📦' :
                       item.status === 2 ? '🚚' :
                       item.status === 3 ? '🏭' :
                       item.status === 4 ? '♻️' :
                       '🗑️'}
                    </div>
                    <div>
                      <p className="font-medium">{statusNames[item.status]}</p>
                      <p className="text-sm text-gray-500 mb-1">{item.timestamp}</p>
                      <p className="text-sm truncate mb-1">Actor: {item.actor}</p>
                      <p className="text-sm text-gray-700">{item.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Certificate Section */}
      {viewMode === 'certificate' && certificateData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Certificate #{certificateData.id}</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              certificateData.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {certificateData.isValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Device ID</p>
              <p className="font-medium">#{certificateData.deviceId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium">{certificateData.issueDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recycling Unit</p>
              <p className="font-medium truncate">{certificateData.recyclingUnit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Verification Status</p>
              <p className={`font-medium ${
                certificateData.verificationResult === 'Valid' ? 'text-green-600' : 
                certificateData.verificationResult === 'Invalid' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {certificateData.verificationResult || 'Not Verified'}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Process Method</p>
            <p className="p-3 bg-gray-50 rounded-md border border-gray-200">
              {certificateData.processMethod}
            </p>
          </div>
          
          {!certificateData.verificationResult && (
            <button
              onClick={() => handleVerifyCertificate(certificateData.id)}
              disabled={loading}
              className={`w-full p-2 text-white font-medium rounded-md ${
                loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify Certificate Authenticity'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectorDashboard; 