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
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
} from '@mui/icons-material';
import { Close as CloseIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { signInWithEmailAndPassword_Custom, signInWithGoogle, resetPassword } from '../../services/authService';

const MotionCard = motion(Card);

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };
  const handleOpenResetDialog = () => {
    setResetDialogOpen(true);
    setResetEmail('');
    setResetError('');
    setResetSuccess('');
    setError(''); // Clear main login error
  };
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    if (!resetEmail) {
      setResetError('Please enter your email address.');
      setResetLoading(false);
      return;
    }

    try {
      // Call the function from authService.js
      const result = await resetPassword(resetEmail);

      if (result.success) {
        setResetSuccess('Password reset link sent! Please check your email inbox.');
        // Optionally, close the dialog after a delay
        setTimeout(() => setResetDialogOpen(false), 5000);
      } else {
        setResetError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setResetError('An unexpected error occurred. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };
  const handleRedirect = (userData) => {
    switch (userData.role) {
      case 'CLIENT':
      case 'USER':
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
        navigate('/'); // Fallback
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
        const localData = {
          user: {
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
          },
          user_type: result.userData.role,
          token: await result.user.getIdToken(),
        };
        localStorage.setItem('loginInfo', JSON.stringify(localData));
        handleRedirect(result.userData);
      } else {
        if (result.needsVerification) {
          // Use toast for the critical email verification alert
          toast.error(result.error);
        }
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
      const result = await signInWithGoogle();
      if (result.success) {
        const localData = {
          user: {
            id: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
          },
          user_type: result.userData.role || 'USER',
          token: await result.user.getIdToken(),
        };
        localStorage.setItem('loginInfo', JSON.stringify(localData));
        handleRedirect(result.userData);
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
    <Box sx={{
      minWidth: '98vw',
      minHeight: '100vh',
      overflowX: 'hidden !important',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.1)}, 
          ${alpha(theme.palette.secondary.main, 0.1)})`
    }}>
      <MotionCard initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{
          borderRadius: 4, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          maxWidth: '450px',
          width: '100%'
        }}>
        <CardContent sx={{ p: { xs: 3, sm: 6 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Sign in to your Gazra-Mitraaccount
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField fullWidth
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment:
                    (<InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>),
                }} />
              <TextField fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password" value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (<InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>), endAdornment: (<InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ?
                        <VisibilityOff /> :
                        <Visibility />}
                    </IconButton>
                  </InputAdornment>),
                }} />
              <Box sx={{ textAlign: 'right' }}>
                <Link component="button"
                  type="button"
                  variant="body2"
                  onClick={handleOpenResetDialog}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}>
                  Forgot password?
                </Link>
              </Box>
              <Button type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3
                }}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 4 }}>
            <Typography variant="body2" color="text.secondary">Or continue with</Typography>
          </Divider>

          <Stack spacing={2}>
            <Button variant="outlined" size="large"
              startIcon={<Google />}
              onClick={() => handleSocialLogin('Google')}
              sx={{
                py: 1.5,
                borderRadius: 3,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04)
                }
              }}>
              Continue with Google
            </Button>
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component="button"
                type="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}>
                Sign up here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </MotionCard>

      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Reset Your Password
          <IconButton
            onClick={() => setResetDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email address and we will send you a link to reset your password.
          </Typography>

          {resetSuccess &&
            <Alert severity="success" sx={{ mb: 2 }}>
              {resetSuccess}
            </Alert>}

          {resetError &&
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetError}
            </Alert>}

          <form onSubmit={handleResetSubmit}>
            <TextField
              fullWidth
              name="resetEmail"
              type="email"
              label="Email Address"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              disabled={resetLoading || resetSuccess}
              InputProps={{
                startAdornment: (<InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={resetLoading || resetSuccess}
              sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 600, borderRadius: 3 }}
            >
              {resetLoading ? 'Sending Link...' : 'Send Reset Link'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Login;