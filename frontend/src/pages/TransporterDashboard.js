import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TransporterDashboard = () => {
  const { ewasteTracker, signer, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [collectedDevices, setCollectedDevices] = useState([]);
  const [inTransitDevices, setInTransitDevices] = useState([]);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  const [transportData, setTransportData] = useState({
    deviceId: '',
    route: ''
  });
  
  const [deliveryData, setDeliveryData] = useState({
    deviceId: '',
    recyclingUnitAddress: ''
  });

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
      const collected = await ewasteTracker.getDevicesByStatus(1);
      setCollectedDevices(collected.map(id => id.toString()));
      
      const inTransit = await ewasteTracker.getDevicesByStatus(2);
      setInTransitDevices(inTransit.map(id => id.toString()));
    } catch (err) {
      console.error('Error loading devices:', err);
      setError('Failed to load devices');
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

  if (role !== 3) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page. Only Transporters can manage device transportation.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transporter Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Start Transport Form */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Start Transport
              </Typography>
              <Box component="form" onSubmit={handleTransportStart} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  select
                  label="Device ID"
                  name="deviceId"
                  value={transportData.deviceId}
                  onChange={(e) => handleChange('transport', e)}
                  required
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select a device</option>
                  {collectedDevices.map(id => (
                    <option key={id} value={id}>Device #{id}</option>
                  ))}
                </TextField>

                <TextField
                  label="Transport Route"
                  name="route"
                  value={transportData.route}
                  onChange={(e) => handleChange('transport', e)}
                  required
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Specify transport route and details..."
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || collectedDevices.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : <LocalShippingIcon />}
                >
                  {loading ? 'Processing...' : 'Start Transport'}
                </Button>

                {collectedDevices.length === 0 && (
                  <Typography color="warning.main" variant="body2">
                    No devices available for transport
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Deliver Device Form */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Deliver Device
              </Typography>
              <Box component="form" onSubmit={handleDeviceDelivery} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  select
                  label="Device ID"
                  name="deviceId"
                  value={deliveryData.deviceId}
                  onChange={(e) => handleChange('delivery', e)}
                  required
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select a device</option>
                  {inTransitDevices.map(id => (
                    <option key={id} value={id}>Device #{id}</option>
                  ))}
                </TextField>

                <TextField
                  label="Recycling Unit Address"
                  name="recyclingUnitAddress"
                  value={deliveryData.recyclingUnitAddress}
                  onChange={(e) => handleChange('delivery', e)}
                  required
                  fullWidth
                  placeholder="0x..."
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  disabled={loading || inTransitDevices.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {loading ? 'Processing...' : 'Deliver Device'}
                </Button>

                {inTransitDevices.length === 0 && (
                  <Typography color="warning.main" variant="body2">
                    No devices in transit to deliver
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Device Details
              </Typography>

              {fetchingDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : deviceDetails ? (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        ID
                      </Typography>
                      <Typography variant="body1">{deviceDetails.id}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Serial Number
                      </Typography>
                      <Typography variant="body1">{deviceDetails.serialNumber}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1">{deviceDetails.deviceType}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body1">{statusNames[deviceDetails.status]}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">{deviceDetails.lastUpdateDate}</Typography>
                    </Grid>
                  </Grid>

                  {deviceDetails.status === 1 && (
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => {
                        setTransportData({
                          ...transportData,
                          deviceId: deviceDetails.id
                        });
                      }}
                    >
                      Start Transport for This Device
                    </Button>
                  )}

                  {deviceDetails.status === 2 && (
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => {
                        setDeliveryData({
                          ...deliveryData,
                          deviceId: deviceDetails.id
                        });
                      }}
                    >
                      Deliver This Device
                    </Button>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography color="text.secondary" gutterBottom>
                    Select a device to view details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="outlined"
                      disabled={collectedDevices.length === 0}
                      onClick={() => collectedDevices.length > 0 && fetchDeviceDetails(collectedDevices[0])}
                    >
                      View Collected Device
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      disabled={inTransitDevices.length === 0}
                      onClick={() => inTransitDevices.length > 0 && fetchDeviceDetails(inTransitDevices[0])}
                    >
                      View In-Transit Device
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Device Tables */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Collected Devices Table */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Collected Devices
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {collectedDevices.map((id) => (
                      <TableRow key={id}>
                        <TableCell>Device #{id}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => fetchDeviceDetails(id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* In Transit Devices Table */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Devices In Transit
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inTransitDevices.map((id) => (
                      <TableRow key={id}>
                        <TableCell>Device #{id}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => fetchDeviceDetails(id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransporterDashboard; 