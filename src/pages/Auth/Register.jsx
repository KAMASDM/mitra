// src/pages/Auth/Register.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  LocationOn,
  Work,
} from '@mui/icons-material';
import { signUpWithEmailAndPassword } from '../../services/authService';

const MotionCard = motion(Card);
const steps = ['Basic Info', 'Account Type', 'Verification'];

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'CLIENT',
    profession: '',
    experience: '',
    specialization: '',
    location: '',
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    setError('');
    if (activeStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    if (activeStep === 1) {
      if (!formData.accountType) {
        setError('Please select an account type');
        return false;
      }
      if (formData.accountType === 'PROFESSIONAL' && (!formData.profession || !formData.experience || !formData.specialization)) {
        setError('Please fill in all professional details');
        return false;
      }
    }
    if (activeStep === 2) {
      if (!formData.agreeTerms || !formData.agreePrivacy) {
        setError('Please agree to the terms and privacy policy');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const additionalData = {
        displayName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        location: formData.location,
        accountType: formData.accountType,
        ...(formData.accountType === 'PROFESSIONAL' && {
          profession: formData.profession,
          experience: formData.experience,
          specialization: formData.specialization,
        }),
      };

      const result = await signUpWithEmailAndPassword(formData.email, formData.password, additionalData);

      if (result.success) {
        const userData = {
          user: {
            id: result.user.uid,
            email: result.user.email,
            name: `${formData.firstName} ${formData.lastName}`,
          },
          user_type: formData.accountType,
          token: await result.user.getIdToken(),
        };
        localStorage.setItem('loginInfo', JSON.stringify(userData));

        if (formData.accountType === 'CLIENT') {
          navigate('/client/dashboard');
        } else if (formData.accountType === 'PROFESSIONAL') {
          navigate('/professional/dashboard');
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
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
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
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
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="accountType"
                  value={formData.accountType}
                  label="Account Type"
                  onChange={handleChange}
                >
                  <MenuItem value="CLIENT">Client</MenuItem>
                  <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.accountType === 'PROFESSIONAL' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="profession"
                    label="Profession"
                    value={formData.profession}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="experience"
                    label="Years of Experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="specialization"
                    label="Specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="location"
                    label="Location (City, State)"
                    value={formData.location}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        );
      case 2:
        return (
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
              }
              label={
                <Typography>
                  I agree to the{' '}
                  <Link href="/terms" target="_blank">
                    Terms and Conditions
                  </Link>
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                />
              }
              label={
                <Typography>
                  I agree to the{' '}
                  <Link href="/privacy" target="_blank">
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
          </Stack>
        );
      default:
        return null;
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
        py: 8,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
      }}
    >
      <Container maxWidth="md">
        <MotionCard
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{
            borderRadius: 4,
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
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
                Join SWEEKAR
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: '1.1rem',
                }}
              >
                Create your account and start your journey with us
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 4 }}>
              {renderStepContent()}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{ px: 4 }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                  }}
                >
                  Next
                </Button>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </MotionCard>
      </Container>
    </Box>
  );
};

export default Register;