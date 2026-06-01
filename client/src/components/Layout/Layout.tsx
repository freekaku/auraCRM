import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  ExitToApp as LogoutIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const DRAWER_WIDTH = 260;

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { themeMode, toggleTheme, showNotification } = useUIStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    logout();
    showNotification('Logged out successfully', 'success');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Leads Pipeline', icon: <PeopleIcon />, path: '/leads' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: [2], display: 'flex', alignItems: 'center', gap: 1 }}>
        <BusinessIcon sx={{ color: '#4F5DFF', fontSize: 32 }} />
        <Typography
          variant="h5"
          noWrap
          sx={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4F5DFF 0%, #56D4B4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AuraCRM
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: '#E8EBF3' }} />
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(79, 93, 255, 0.08)' : 'transparent',
                  color: isActive ? '#4F5DFF' : '#7A7F9A',
                  borderLeft: isActive ? '3px solid #4F5DFF' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'rgba(79, 93, 255, 0.12)' 
                      : 'rgba(79, 93, 255, 0.04)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? '#4F5DFF' : '#7A7F9A',
                    minWidth: 40 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                    color: isActive ? '#4F5DFF' : '#7A7F9A',
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ borderColor: '#E8EBF3' }} />
      
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar 
          sx={{ 
            bgcolor: '#4F5DFF',
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
            width: 36,
            height: 36,
          }}
        >
          {user?.name.charAt(0).toUpperCase() || 'S'}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: '#2B2D42' }}>
            {user?.name || 'Sales Agent'}
          </Typography>
          <Typography variant="caption" noWrap sx={{ display: 'block', color: '#7A7F9A' }}>
            {user?.role || 'Representative'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F7F8FC' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          boxShadow: 'none',
          borderBottom: '1px solid #E8EBF3',
          backgroundColor: 'rgba(247, 248, 252, 0.95)',
          backgroundImage: 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon sx={{ color: '#2B2D42' }} />
          </IconButton>

          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 600,
              color: '#2B2D42',
            }}
          >
            {location.pathname === '/' ? 'Dashboard Insights' : 'Lead Relationship Pipeline'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Toggle dark/light mode">
              <IconButton onClick={toggleTheme} sx={{ color: '#7A7F9A' }}>
                {themeMode === 'dark' ? <LightIcon /> : <DarkIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#4F5DFF', fontSize: 14, fontWeight: 'bold' }}>
                  {user?.name.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 180,
                  border: '1px solid #E8EBF3',
                  borderRadius: 2,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: '#FFFFFF',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2B2D42' }}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem', color: '#7A7F9A' }}>
                  {user?.email}
                </Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: '#E8EBF3' }} />
              <MenuItem onClick={handleLogoutClick} sx={{ color: '#EF4444', gap: 1.5 }}>
                <LogoutIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E8EBF3',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E8EBF3',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
