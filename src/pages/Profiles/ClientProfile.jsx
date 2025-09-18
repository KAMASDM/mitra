// src/pages/Profiles/ClientProfile.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Stack,
  IconButton,
  Divider,
  Chip,
  Alert,
  Paper,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Lock,
  Notifications,
  Security,
  Delete,
  Visibility,
  Psychology,
  Favorite,
} from '@mui/icons-material';
import { getCurrentUserProfile, updateUserProfile } from '../../services/authService';
import { getUserStatistics } from '../../services/userService';

const MotionCard = motion(Card);

const ClientProfile = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false,
    profileVisibility: 'private',
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user?.id) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const [profileRes, statsRes] = await Promise.all([
          getCurrentUserProfile(user.user.id),
          getUserStatistics(user.user.id, 'CLIENT')
        ]);

        if (profileRes.success) {
          setProfileData(profileRes.userData);
        } else {
          setError(profileRes.error || 'Could not fetch profile.');
        }

        if (statsRes.success) {
          setStats(statsRes.stats);
        }

      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.user?.id]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, checked, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: e.target.type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      setSuccess(false);
      setError('');
      const result = await updateUserProfile(user.user.id, profileData);
      if (result.success) {
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              mb: 1,
            }}
          >
            My Profile
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            Manage your personal information and preferences
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ borderRadius: 3, mb: 4 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Personal Information
                  </Typography>
                  <Button
                    variant={isEditing ? "outlined" : "contained"}
                    startIcon={isEditing ? <Cancel /> : <Edit />}
                    onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>

                {/* Profile Picture */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: 'primary.main',
                        fontSize: '3rem',
                      }}
                      src={profileData?.photoURL}
                    >
                      {profileData?.displayName?.charAt(0)}
                    </Avatar>
                    {isEditing && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      >
                        <PhotoCamera />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ ml: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {profileData?.displayName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Client Account
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Member since {new Date(profileData?.createdAt?.toDate()).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      name="displayName"
                      label="Full Name"
                      value={profileData?.displayName || ''}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email Address"
                      type="email"
                      value={profileData?.email || ''}
                      onChange={handleProfileChange}
                      disabled={true} // Email is usually not editable
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      value={profileData?.phone || ''}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      name="dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      value={profileData?.dateOfBirth || ''}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={profileData?.gender || ''}
                        label="Gender"
                        onChange={handleProfileChange}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Non-binary">Non-binary</MenuItem>
                        <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      name="location"
                      label="Location"
                      value={profileData?.location || ''}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </MotionCard>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Activity Summary */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{ borderRadius: 3, mb: 4 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Activity Summary
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {stats?.totalBookings || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Total Sessions
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                    ₹{stats?.totalSpent || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Total Spent
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {stats?.favoriteProfessionals || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Favorite Professionals
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ClientProfile;