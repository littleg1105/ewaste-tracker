import React, { useState, useEffect } from 'react';
import { useContract } from '../context/ContractContext';
import { useAuth } from '../context/AuthContext';

const TransporterDashboard = () => {
  const { ewasteTracker } = useContract();
  const { signer, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [collectedDevices, setCollectedDevices] = useState([]);
  const [inTransitDevices, setInTransitDevices] = useState([]);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  // For starting transport
  const [transportData, setTransportData] = useState({
    deviceId: '',
    route: ''
  });
  
  // For delivering device
  const [deliveryData, setDeliveryData] = useState({
    deviceId: '',
    recyclingUnitAddress: ''
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
      // Get devices with "Collected" status (1)
      const collected = await ewasteTracker.getDevicesByStatus(1);
      setCollectedDevices(collected.map(id => id.toString()));
      
      // Get devices with "In Transit" status (2)
      const inTransit = await ewasteTracker.getDevicesByStatus(2);
      setInTransitDevices(inTransit.map(id => id.toString()));
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

  const handleTransportStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!transportData.deviceId || !transportData.route) {
        throw new Error('Please enter all required fields');
      }

      const tx = await ewasteTracker.connect(signer).startTransport(
        transportData.deviceId, 
        transportData.route
      );
      await tx.wait();
      
      setSuccess(`Transport started for device #${transportData.deviceId}`);
      setTransportData({
        deviceId: '',
        route: ''
      });
      
      // Refresh device lists
      loadDevices();
    } catch (err) {
      setError(err.message || 'Error starting transport');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceDelivery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!deliveryData.deviceId || !deliveryData.recyclingUnitAddress) {
        throw new Error('Please enter all required fields');
      }

      const tx = await ewasteTracker.connect(signer).deliverDevice(
        deliveryData.deviceId, 
        deliveryData.recyclingUnitAddress
      );
      await tx.wait();
      
      setSuccess(`Device #${deliveryData.deviceId} delivered successfully`);
      setDeliveryData({
        deviceId: '',
        recyclingUnitAddress: ''
      });
      
      // Refresh device lists
      loadDevices();
    } catch (err) {
      setError(err.message || 'Error delivering device');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (formType, e) => {
    const { name, value } = e.target;
    if (formType === 'transport') {
      setTransportData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (formType === 'delivery') {
      setDeliveryData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Check if user has Transporter role
  if (role !== 3) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-red-800">You do not have permission to access this page. Only Transporters can manage device transportation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Transporter Dashboard</h1>
      
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
        {/* Start Transport Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Start Transport</h2>
          <form onSubmit={handleTransportStart} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <select
                name="deviceId"
                value={transportData.deviceId}
                onChange={(e) => handleChange('transport', e)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a device</option>
                {collectedDevices.map(id => (
                  <option key={id} value={id}>Device #{id}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transport Route
              </label>
              <textarea
                name="route"
                value={transportData.route}
                onChange={(e) => handleChange('transport', e)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Specify transport route and details..."
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || collectedDevices.length === 0}
              className={`w-full p-2 text-white font-medium rounded-md ${
                loading || collectedDevices.length === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Start Transport'}
            </button>
            
            {collectedDevices.length === 0 && (
              <p className="text-sm text-amber-600">No devices available for transport</p>
            )}
          </form>
        </div>
        
        {/* Deliver Device Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Deliver Device</h2>
          <form onSubmit={handleDeviceDelivery} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <select
                name="deviceId"
                value={deliveryData.deviceId}
                onChange={(e) => handleChange('delivery', e)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a device</option>
                {inTransitDevices.map(id => (
                  <option key={id} value={id}>Device #{id}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recycling Unit Address
              </label>
              <input
                type="text"
                name="recyclingUnitAddress"
                value={deliveryData.recyclingUnitAddress}
                onChange={(e) => handleChange('delivery', e)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="0x..."
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || inTransitDevices.length === 0}
              className={`w-full p-2 text-white font-medium rounded-md ${
                loading || inTransitDevices.length === 0 ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Processing...' : 'Deliver Device'}
            </button>
            
            {inTransitDevices.length === 0 && (
              <p className="text-sm text-amber-600">No devices in transit to deliver</p>
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
              
              {deviceDetails.status === 1 && (
                <button
                  onClick={() => {
                    setTransportData({
                      ...transportData,
                      deviceId: deviceDetails.id
                    });
                  }}
                  className="mt-3 w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Transport for This Device
                </button>
              )}
              
              {deviceDetails.status === 2 && (
                <button
                  onClick={() => {
                    setDeliveryData({
                      ...deliveryData,
                      deviceId: deviceDetails.id
                    });
                  }}
                  className="mt-3 w-full p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Deliver This Device
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Select a device to view details</p>
              <div className="space-y-3">
                <button 
                  onClick={() => collectedDevices.length > 0 && fetchDeviceDetails(collectedDevices[0])}
                  disabled={collectedDevices.length === 0}
                  className={`w-full p-2 rounded-md ${
                    collectedDevices.length === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  View Collected Device
                </button>
                <button 
                  onClick={() => inTransitDevices.length > 0 && fetchDeviceDetails(inTransitDevices[0])}
                  disabled={inTransitDevices.length === 0}
                  className={`w-full p-2 rounded-md ${
                    inTransitDevices.length === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  View In-Transit Device
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tables of Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Collected Devices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Collected Devices</h2>
          {loading ? (
            <p className="text-gray-600">Loading devices...</p>
          ) : collectedDevices.length === 0 ? (
            <p className="text-gray-600">No collected devices available.</p>
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
                  {collectedDevices.map((id) => (
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
        
        {/* In Transit Devices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Devices In Transit</h2>
          {loading ? (
            <p className="text-gray-600">Loading devices...</p>
          ) : inTransitDevices.length === 0 ? (
            <p className="text-gray-600">No devices currently in transit.</p>
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
                  {inTransitDevices.map((id) => (
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

export default TransporterDashboard; 