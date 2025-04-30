import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navigation = () => {
  const { account, role, disconnectWallet } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDisconnect = async () => {
    await disconnectWallet();
    navigate('/');
  };

  const getMenuItems = () => {
    const items = [
      { path: '/', label: 'Home' },
    ];

    if (account) {
      items.push({ path: '/devices', label: 'Devices' });

      if (role === 0) { // Admin
        items.push({ path: '/admin', label: 'Admin Panel' });
      }

      if (role === 1) { // User
        items.push({ path: '/register-device', label: 'Register Device' });
      }

      if (role === 2) { // Green Point
        items.push({ path: '/green-point', label: 'Green Point Dashboard' });
      }

      if (role === 3) { // Transporter
        items.push({ path: '/transporter', label: 'Transporter Dashboard' });
      }

      if (role === 4) { // Recycling Unit
        items.push(
          { path: '/recycling-unit', label: 'Recycling Dashboard' },
          { path: '/certificates', label: 'Certificates' }
        );
      }

      if (role === 5) { // Environment Inspector
        items.push({ path: '/inspector', label: 'Inspector Dashboard' });
      }
    }

    return items;
  };

  const menuItems = getMenuItems();

  const renderMenuItems = () => (
    menuItems.map((item) => (
      <Button
        key={item.path}
        component={Link}
        to={item.path}
        color="inherit"
        sx={{
          mx: 1,
          borderBottom: location.pathname === item.path ? 2 : 0,
          borderColor: 'secondary.main',
          borderRadius: 0
        }}
      >
        {item.label}
      </Button>
    ))
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <Box sx={{ width: 250, pt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              button
              component={Link}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              selected={location.pathname === item.path}
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2 }}>
          {account ? (
            <>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Connected with:
              </Typography>
              <Chip
                label={`${account.slice(0, 6)}...${account.slice(-4)}`}
                color="primary"
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={() => { handleDisconnect(); setMobileMenuOpen(false); }}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component={Link}
              to="/connect"
              onClick={() => setMobileMenuOpen(false)}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              mr: 2,
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            E-Waste Tracker
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {renderMenuItems()}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && account && (
              <Chip
                label={`${account.slice(0, 6)}...${account.slice(-4)}`}
                color="primary"
                sx={{ mr: 2 }}
              />
            )}
            {!isMobile && (
              account ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/connect"
                >
                  Connect Wallet
                </Button>
              )
            )}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                edge="end"
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>
      {renderMobileMenu()}
    </AppBar>
  );
};

export default Navigation; 