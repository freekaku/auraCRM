import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { showNotification } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Both email and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.token, res.data.user);
      showNotification('Successfully logged in!', 'success');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or connection issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F7F8FC 0%, #E8EBF3 50%, #F7F8FC 100%)',
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 3,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8EBF3',
          boxShadow: '0 4px 24px rgba(79, 93, 255, 0.06), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <BusinessIcon sx={{ color: '#4F5DFF', fontSize: 36 }} />
            <Typography
              variant="h4"
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
          </Box>

          <Typography variant="h5" align="center" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 1, color: '#2B2D42' }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 4, color: '#7A7F9A' }}>
            Log in to manage leads and deals.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLoginSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mb: 3, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </Box>

          <Box sx={{ p: 2, border: '1px solid #E8EBF3', borderRadius: 2, width: '100%', mb: 3, bgcolor: '#F7F8FC' }}>
            <Typography variant="caption" display="block" align="center" sx={{ fontWeight: 'bold', mb: 1, color: '#7A7F9A' }}>
              Quick Evaluation Credentials
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: '#7A7F9A' }}>
              <strong>Email:</strong> sarah.connor@auracrm.com
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: '#7A7F9A' }}>
              <strong>Password:</strong> password123
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: '#7A7F9A' }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" sx={{ fontWeight: 600, color: '#4F5DFF' }}>
              Register
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
