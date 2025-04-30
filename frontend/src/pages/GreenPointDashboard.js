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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const GreenPointDashboard = () => {
  const { ewasteTracker, signer, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [notes, setNotes] = useState('');
  const [registeredDevices, setRegisteredDevices] = useState([]);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Status mapping for display
  const statusNames = ['Registered', 'Collected', 'In Transit', 'Delivered', 'Recycled', 'Destroyed'];
  const hazardLevelNames = ['Low', 'Medium', 'High'];
  const operationalStatusNames = ['Functional', 'Damaged', 'Hazardous'];

  useEffect(() => {
    if (ewasteTracker) {
      loadRegisteredDevices();
    }
  }, [ewasteTracker]);

  const loadRegisteredDevices = async () => {
    if (!ewasteTracker) return;

    try {
      setLoading(true);
      const devices = await ewasteTracker.getDevicesByStatus(0);
      setRegisteredDevices(devices.map(id => id.toString()));
    } catch (err) {
      console.error('Error loading registered devices:', err);
      setError('Failed to load registered devices');
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

  const handleCollect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!deviceId) {
        throw new Error('Please enter a device ID');
      }

      const tx = await ewasteTracker.connect(signer).collectDevice(deviceId, notes);
      await tx.wait();
      
      setSuccess(`Device #${deviceId} collected successfully!`);
      setDeviceId('');
      setNotes('');
      
      loadRegisteredDevices();
    } catch (err) {
      setError(err.message || 'Error collecting device');
    } finally {
      setLoading(false);
    }
  };

  if (role !== 2) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page. Only Green Point operators can collect devices.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Green Point Dashboard
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
        {/* Collect Device Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Collect Device
              </Typography>
              <Box component="form" onSubmit={handleCollect} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Device ID"
                  type="number"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  required
                  fullWidth
                  inputProps={{ min: 1 }}
                />

                <TextField
                  label="Collection Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Add collection details..."
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Processing...' : 'Collect Device'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Devices */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Devices Available for Collection
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : registeredDevices.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  No devices available for collection.
                </Typography>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {registeredDevices.map((id) => (
                    <React.Fragment key={id}>
                      <ListItem
                        button
                        onClick={() => fetchDeviceDetails(id)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText
                          primary={`Device #${id}`}
                          secondary="Click to view details"
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeviceId(id);
                            }}
                            color="primary"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}

              {deviceDetails && !fetchingDetails && (
                <Paper sx={{ mt: 2, p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Device Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Serial Number
                      </Typography>
                      <Typography variant="body1">{deviceDetails.serialNumber}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1">{deviceDetails.deviceType}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Hazard Level
                      </Typography>
                      <Typography variant="body1">{hazardLevelNames[deviceDetails.hazardLevel]}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Condition
                      </Typography>
                      <Typography variant="body1">{operationalStatusNames[deviceDetails.operationalStatus]}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => setDeviceId(deviceDetails.id)}
                      >
                        Collect This Device
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GreenPointDashboard; 