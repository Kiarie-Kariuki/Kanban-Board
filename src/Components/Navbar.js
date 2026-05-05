import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Link , useNavigate} from 'react-router-dom';
import { useUser } from './UserContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

const Navbar = () => {
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleMenuClose();
    signOut();
    navigate('/signin');
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
          <DashboardIcon sx={{ fontSize: 28 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '0.5px',
              background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Kanban Board
          </Typography>
        </Box>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, mr: 2 }}>
              <Button 
                color="inherit" 
                component={Link} 
                to="/board"
                startIcon={<DashboardIcon />}
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
                }}
              >
                Board
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/students"
                startIcon={<PeopleIcon />}
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
                }}
              >
                Students
              </Button>
            </Box>

            {/* User Avatar Menu */}
            <Avatar
              onClick={handleMenuOpen}
              sx={{
                cursor: 'pointer',
                bgcolor: '#fff',
                color: '#667eea',
                fontWeight: 700,
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  borderRadius: '12px',
                  mt: 1.5,
                }
              }}
            >
              <MenuItem disabled sx={{ fontWeight: 600 }}>
                <Typography variant="subtitle2">
                  {user.fullname || 'User'}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem 
                component={Link} 
                to="/profile" 
                onClick={handleMenuClose}
                sx={{ gap: 1 }}
              >
                <PersonIcon fontSize="small" />
                Profile
              </MenuItem>
              <MenuItem 
                onClick={handleSignOut}
                sx={{ gap: 1 }}
              >
                <LogoutIcon fontSize="small" />
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/"
              startIcon={<AppRegistrationIcon />}
              sx={{ 
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
              }}
            >
              Sign Up
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/signin"
              startIcon={<LoginIcon />}
              sx={{ 
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
              }}
            >
              Sign In
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;