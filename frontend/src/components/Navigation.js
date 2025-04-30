import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
  ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DevicesIcon from '@mui/icons-material/Devices';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FactoryIcon from '@mui/icons-material/Factory';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

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
      { path: '/', label: 'Home', icon: <HomeIcon /> },
    ];

    if (account) {
      items.push({ path: '/devices', label: 'Devices', icon: <DevicesIcon /> });

      switch (Number(role)) {
        case 0: // Admin
          items.push({ 
            path: '/admin', 
            label: 'Admin Panel', 
            icon: <AdminPanelSettingsIcon />,
            description: 'Manage users and system settings'
          });
          break;
        case 1: // User
          items.push({ 
            path: '/register-device', 
            label: 'Register Device', 
            icon: <AddCircleIcon />,
            description: 'Register new e-waste devices'
          });
          break;
        case 2: // Green Point
          items.push({ 
            path: '/green-point', 
            label: 'Green Point Dashboard', 
            icon: <RecyclingIcon />,
            description: 'Manage device collection'
          });
          break;
        case 3: // Transporter
          items.push({ 
            path: '/transporter', 
            label: 'Transporter Dashboard', 
            icon: <LocalShippingIcon />,
            description: 'Manage device transportation'
          });
          break;
        case 4: // Recycling Unit
          items.push(
            { 
              path: '/recycling-unit', 
              label: 'Recycling Dashboard', 
              icon: <FactoryIcon />,
              description: 'Manage device recycling'
            },
            { 
              path: '/certificates', 
              label: 'Certificates', 
              icon: <VerifiedUserIcon />,
              description: 'View and manage recycling certificates'
            }
          );
          break;
        case 5: // Environment Inspector
          items.push({ 
            path: '/inspector', 
            label: 'Inspector Dashboard', 
            icon: <VerifiedUserIcon />,
            description: 'Monitor and inspect e-waste tracking'
          });
          break;
        default:
          break;
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
        startIcon={item.icon}
        sx={{
          mx: 1,
          borderBottom: location.pathname === item.path ? 2 : 0,
          borderColor: 'secondary.main',
          borderRadius: 0,
          textTransform: 'none'
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
      <Box sx={{ width: 280, pt: 2 }}>
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
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.label}
                secondary={item.description}
              />
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
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RecyclingIcon sx={{ mr: 1 }} />
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
                  startIcon={<MenuIcon />}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/connect"
                  startIcon={<MenuIcon />}
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