// src/pages/Profiles/ClientProfile.jsx
import React, { useState } from 'react';
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

const MotionCard = motion(Card);

const ClientProfile = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+91 9876543210',
    dateOfBirth: '1992-05-15',
    gender: 'Female',
    location: 'Mumbai, Maharashtra',
    emergencyContact: '+91 9876543211',
    preferredLanguage: 'English',
    interests: ['Mental Health', 'Career Counseling'],
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false,
    profileVisibility: 'private',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setIsEditing(false);
      setError('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const favoriteServices = ['Mental Health Counseling', 'Legal Consultation', 'Career Guidance'];
  const recentSessions = [
    { service: 'Anxiety Counseling', professional: 'Dr. Priya Sharma', date: '2025-09-10', rating: 5 },
    { service: 'Legal Consultation', professional: 'Adv. Meera Patel', date: '2025-09-08', rating: 4 },
    { service: 'Career Guidance', professional: 'Rajesh Kumar', date: '2025-09-05', rating: 5 },
  ];

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
                    >
                      {profileData.firstName.charAt(0)}
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
                      {profileData.firstName} {profileData.lastName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Client Account
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Member since September 2025
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="firstName"
                      label="First Name"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="lastName"
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="dateOfBirth"
                      label="Date of Birth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={profileData.gender}
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="location"
                      label="Location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="emergencyContact"
                      label="Emergency Contact"
                      value={profileData.emergencyContact}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!isEditing}>
                      <InputLabel>Preferred Language</InputLabel>
                      <Select
                        name="preferredLanguage"
                        value={profileData.preferredLanguage}
                        label="Preferred Language"
                        onChange={handleProfileChange}
                      >
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Hindi">Hindi</MenuItem>
                        <MenuItem value="Marathi">Marathi</MenuItem>
                        <MenuItem value="Bengali">Bengali</MenuItem>
                        <MenuItem value="Tamil">Tamil</MenuItem>
                      </Select>
                    </FormControl>
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

            {/* Privacy & Security */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Privacy & Security
                </Typography>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Notification Preferences
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="emailNotifications"
                            checked={preferences.emailNotifications}
                            onChange={handlePreferenceChange}
                          />
                        }
                        label="Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            name="smsNotifications"
                            checked={preferences.smsNotifications}
                            onChange={handlePreferenceChange}
                          />
                        }
                        label="SMS Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            name="appointmentReminders"
                            checked={preferences.appointmentReminders}
                            onChange={handlePreferenceChange}
                          />
                        }
                        label="Appointment Reminders"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            name="marketingEmails"
                            checked={preferences.marketingEmails}
                            onChange={handlePreferenceChange}
                          />
                        }
                        label="Marketing Emails"
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Security Settings
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        variant="outlined"
                        startIcon={<Lock />}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Security />}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Enable Two-Factor Authentication
                      </Button>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Account Actions
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        Delete Account
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Favorite Services */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ borderRadius: 3, mb: 4 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Favorite Services
                </Typography>
                <Stack spacing={2}>
                  {favoriteServices.map((service, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Favorite sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                      <Typography variant="body2">{service}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </MotionCard>

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
                      24
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Total Sessions
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                      4.8
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Average Rating Given
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main' }}>
                      8
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Favorite Professionals
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>

            {/* Recent Sessions */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Recent Sessions
                </Typography>
                <Stack spacing={2}>
                  {recentSessions.map((session, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        {session.service}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        with {session.professional}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {session.date}
                        </Typography>
                        <Chip
                          label={`${session.rating}★`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </Paper>
                  ))}
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