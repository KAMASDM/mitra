// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  Facebook,
} from '@mui/icons-material';
import { signInWithEmailAndPassword_Custom, signInWithGoogle } from '../../services/authService';

const MotionCard = motion(Card);

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRedirect = (user) => {
    switch (user.role) {
      case 'CLIENT':
        navigate('/client/dashboard');
        break;
      case 'PROFESSIONAL':
        navigate('/professional/dashboard');
        break;
      case 'ADMIN':
      case 'SUPERADMIN':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword_Custom(formData.email, formData.password);
      if (result.success) {
        const userData = {
          user: {
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
          },
          user_type: result.user.role,
          token: await result.user.getIdToken(),
        };
        localStorage.setItem('loginInfo', JSON.stringify(userData));
        handleRedirect(result.user);
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError('');
    try {
      let result;
      if (provider === 'Google') {
        result = await signInWithGoogle();
      } else {
        // Placeholder for Facebook or other providers
        setError('This social login provider is not yet supported.');
        setLoading(false);
        return;
      }

      if (result.success) {
        const userData = {
          user: {
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
          },
          user_type: result.user.role || 'CLIENT', // Default to client for social logins
          // token: await result.user.getIdToken(),
        };
        localStorage.setItem('loginInfo', JSON.stringify(userData));
        handleRedirect({ role: 'CLIENT' }); // Redirect social logins to client dashboard
      } else {
        setError(result.error || `Failed to sign in with ${provider}.`);
      }
    } catch (err) {
      setError(`An error occurred during social login. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (   
    <Box
      sx={{
        minWidth: '98vw', // Viewport width
        minHeight: '100vh', // Viewport height
        overflowX: 'hidden !important', // Prevent horizontal scroll
        display: 'flex',
        flexDirection: 'column', // Card ko center karne ke liye
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
      }}
    >
      <MotionCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{
          borderRadius: 4,
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          maxWidth: '450px',
          width: '100%',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 6 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontSize: '1.1rem',
              }}
            >
              Sign in to your SWEEKAR account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ textAlign: 'right' }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setError('Password reset feature coming soon!')}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Or continue with
            </Typography>
          </Divider>

          <Stack spacing={2}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={() => handleSocialLogin('Google')}
              sx={{
                py: 1.5,
                borderRadius: 3,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              Continue with Google
            </Button>
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </MotionCard>
    </Box>
  );
};

export default Login;