import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

const DeviceRegistration = () => {
  const { ewasteTracker, signer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    serialNumber: '',
    deviceType: '',
    hazardLevel: '0',
    operationalStatus: '0',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await ewasteTracker.connect(signer).registerDevice(
        formData.serialNumber,
        formData.deviceType,
        parseInt(formData.hazardLevel),
        parseInt(formData.operationalStatus)
      );

      await tx.wait();
      setSuccess('Device registered successfully!');
      setFormData({
        serialNumber: '',
        deviceType: '',
        hazardLevel: '0',
        operationalStatus: '0',
      });
    } catch (err) {
      setError(err.message || 'Error registering device');
    } finally {
      setLoading(false);
    }
  };

  const hazardLevels = [
    { value: '0', label: 'Low' },
    { value: '1', label: 'Medium' },
    { value: '2', label: 'High' },
  ];

  const operationalStatuses = [
    { value: '0', label: 'Functional' },
    { value: '1', label: 'Damaged' },
    { value: '2', label: 'Hazardous' },
  ];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Register New Device
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

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Serial Number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Device Type"
              name="deviceType"
              value={formData.deviceType}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              select
              label="Hazard Level"
              name="hazardLevel"
              value={formData.hazardLevel}
              onChange={handleChange}
              fullWidth
            >
              {hazardLevels.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Operational Status"
              name="operationalStatus"
              value={formData.operationalStatus}
              onChange={handleChange}
              fullWidth
            >
              {operationalStatuses.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Registering...
                </>
              ) : (
                'Register Device'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeviceRegistration; 