import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';


const RecyclingUnitDashboard = () => {
  const { ewasteTracker, eWasteCertificate } = useAuth();
  const { signer, role, account } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deliveredDevices, setDeliveredDevices] = useState([]);
  const [processedDevices, setProcessedDevices] = useState([]);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  // For processing device
  const [processData, setProcessData] = useState({
    deviceId: '',
    isRecycled: 'true', // Default to recycling
    processDetails: ''
  });
  
  // For issuing certificate
  const [certificateData, setCertificateData] = useState({
    deviceId: '',
    processMethod: ''
  });

  // Status mapping for display
  const statusNames = ['Registered', 'Collected', 'In Transit', 'Delivered', 'Recycled', 'Destroyed'];
  const hazardLevelNames = ['Low', 'Medium', 'High'];
  const operationalStatusNames = ['Functional', 'Damaged', 'Hazardous'];

  useEffect(() => {
    if (ewasteTracker) {
      loadDevices();
    }
  }, [ewasteTracker]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      
      // Get devices with "Delivered" status (3)
      const delivered = await ewasteTracker.getDevicesByStatus(3);
      setDeliveredDevices(delivered.map(id => id.toString()));
      
      // Get devices with "Recycled" (4) or "Destroyed" (5) status
      const recycled = await ewasteTracker.getDevicesByStatus(4);
      const destroyed = await ewasteTracker.getDevicesByStatus(5);
      
      // Combine and convert to strings
      const processed = [...recycled, ...destroyed].map(id => id.toString());
      setProcessedDevices(processed);
    } catch (err) {
      console.error('Error loading devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceDetails = async (id) => {
    if (!ewasteTracker || !id) return;

    try {
      setFetchingDetails(true);
      const device = await ewasteTracker.getDeviceById(id);
      setDeviceDetails({
        id: device.id.toString(),
        serialNumber: device.serialNumber,
        deviceType: device.deviceType,
        hazardLevel: parseInt(device.hazardLevel),
        operationalStatus: parseInt(device.operationalStatus),
        status: parseInt(device.status),
        owner: device.deviceOwner,
        currentHolder: device.currentHolder,
        registrationDate: new Date(device.registrationDate * 1000).toLocaleString(),
        lastUpdateDate: new Date(device.lastUpdateDate * 1000).toLocaleString(),
      });
    } catch (err) {
      console.error('Error fetching device details:', err);
      setError('Failed to fetch device details');
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleProcessDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!processData.deviceId || !processData.processDetails) {
        throw new Error('Please enter all required fields');
      }

      const isRecycled = processData.isRecycled === 'true';
      
      const tx = await ewasteTracker.connect(signer).processDevice(
        processData.deviceId,
        isRecycled,
        processData.processDetails
      );
      await tx.wait();
      
      const actionType = isRecycled ? 'recycled' : 'destroyed';
      setSuccess(`Device #${processData.deviceId} ${actionType} successfully`);
      setProcessData({
        deviceId: '',
        isRecycled: 'true',
        processDetails: ''
      });
      
      // Refresh device lists
      loadDevices();
    } catch (err) {
      setError(err.message || 'Error processing device');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!certificateData.deviceId || !certificateData.processMethod) {
        throw new Error('Please enter all required fields');
      }

      const tx = await eWasteCertificate.connect(signer).issueCertificate(
        certificateData.deviceId,
        certificateData.processMethod
      );
      await tx.wait();
      
      setSuccess(`Certificate issued for device #${certificateData.deviceId}`);
      setCertificateData({
        deviceId: '',
        processMethod: ''
      });
    } catch (err) {
      setError(err.message || 'Error issuing certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (formType, e) => {
    const { name, value } = e.target;
    if (formType === 'process') {
      setProcessData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (formType === 'certificate') {
      setCertificateData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Check if user has Recycling Unit role
  if (role !== 4) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-red-800">You do not have permission to access this page. Only Recycling Units can process devices and issue certificates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Recycling Unit Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded border border-green-200 mb-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process Device Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Process Device</h2>
          <form onSubmit={handleProcessDevice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <select
                name="deviceId"
                value={processData.deviceId}
                onChange={(e) => handleChange('process', e)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a device</option>
                {deliveredDevices.map(id => (
                  <option key={id} value={id}>Device #{id}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Process Type
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isRecycled"
                    value="true"
                    checked={processData.isRecycled === 'true'}
                    onChange={(e) => handleChange('process', e)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Recycle</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isRecycled"
                    value="false"
                    checked={processData.isRecycled === 'false'}
                    onChange={(e) => handleChange('process', e)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Destroy</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Process Details
              </label>
              <textarea
                name="processDetails"
                value={processData.processDetails}
                onChange={(e) => handleChange('process', e)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Describe the recycling/destruction process..."
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || deliveredDevices.length === 0}
              className={`w-full p-2 text-white font-medium rounded-md ${
                loading || deliveredDevices.length === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Process Device'}
            </button>
            
            {deliveredDevices.length === 0 && (
              <p className="text-sm text-amber-600">No devices available for processing</p>
            )}
          </form>
        </div>
        
        {/* Issue Certificate Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Issue Certificate</h2>
          <form onSubmit={handleIssueCertificate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <select
                name="deviceId"
                value={certificateData.deviceId}
                onChange={(e) => handleChange('certificate', e)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a device</option>
                {processedDevices.map(id => (
                  <option key={id} value={id}>Device #{id}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Process Method
              </label>
              <textarea
                name="processMethod"
                value={certificateData.processMethod}
                onChange={(e) => handleChange('certificate', e)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Describe the processing method used..."
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || processedDevices.length === 0}
              className={`w-full p-2 text-white font-medium rounded-md ${
                loading || processedDevices.length === 0 ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Issuing Certificate...' : 'Issue Certificate'}
            </button>
            
            {processedDevices.length === 0 && (
              <p className="text-sm text-amber-600">No processed devices available for certification</p>
            )}
          </form>
        </div>
        
        {/* Device Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Device Details</h2>
          
          {fetchingDetails ? (
            <p className="text-gray-600">Loading device details...</p>
          ) : deviceDetails ? (
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {deviceDetails.id}</p>
              <p><span className="font-medium">Serial Number:</span> {deviceDetails.serialNumber}</p>
              <p><span className="font-medium">Type:</span> {deviceDetails.deviceType}</p>
              <p><span className="font-medium">Hazard Level:</span> {hazardLevelNames[deviceDetails.hazardLevel]}</p>
              <p><span className="font-medium">Condition:</span> {operationalStatusNames[deviceDetails.operationalStatus]}</p>
              <p><span className="font-medium">Status:</span> {statusNames[deviceDetails.status]}</p>
              <p><span className="font-medium">Last Updated:</span> {deviceDetails.lastUpdateDate}</p>
              
              {deviceDetails.status === 3 && (
                <button
                  onClick={() => {
                    setProcessData({
                      ...processData,
                      deviceId: deviceDetails.id
                    });
                  }}
                  className="mt-3 w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Process This Device
                </button>
              )}
              
              {(deviceDetails.status === 4 || deviceDetails.status === 5) && (
                <button
                  onClick={() => {
                    setCertificateData({
                      ...certificateData,
                      deviceId: deviceDetails.id
                    });
                  }}
                  className="mt-3 w-full p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Issue Certificate for This Device
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Select a device to view details</p>
              <div className="space-y-3">
                <button 
                  onClick={() => deliveredDevices.length > 0 && fetchDeviceDetails(deliveredDevices[0])}
                  disabled={deliveredDevices.length === 0}
                  className={`w-full p-2 rounded-md ${
                    deliveredDevices.length === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  View Delivered Device
                </button>
                <button 
                  onClick={() => processedDevices.length > 0 && fetchDeviceDetails(processedDevices[0])}
                  disabled={processedDevices.length === 0}
                  className={`w-full p-2 rounded-md ${
                    processedDevices.length === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  View Processed Device
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tables of Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Delivered Devices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Delivered Devices</h2>
          {loading ? (
            <p className="text-gray-600">Loading devices...</p>
          ) : deliveredDevices.length === 0 ? (
            <p className="text-gray-600">No devices currently delivered to your facility.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveredDevices.map((id) => (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Device #{id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => fetchDeviceDetails(id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Processed Devices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Processed Devices</h2>
          {loading ? (
            <p className="text-gray-600">Loading devices...</p>
          ) : processedDevices.length === 0 ? (
            <p className="text-gray-600">No devices have been processed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processedDevices.map((id) => (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Device #{id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => fetchDeviceDetails(id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecyclingUnitDashboard; 