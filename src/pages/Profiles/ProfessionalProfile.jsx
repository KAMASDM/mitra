// src/pages/Profiles/ProfessionalProfile.jsx
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  Add,
  Remove,
  Star,
  Schedule,
  AttachMoney,
  Verified,
} from '@mui/icons-material';

const MotionCard = motion(Card);

const ProfessionalProfile = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Dr. Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 9876543210',
    profession: 'Clinical Psychologist',
    specialization: 'LGBTQ+ Counseling, Anxiety, Depression',
    experience: '8',
    location: 'Mumbai, Maharashtra',
    qualifications: ['PhD in Clinical Psychology', 'Licensed Clinical Psychologist', 'LGBTQ+ Affirmative Therapy Certification'],
    languages: ['English', 'Hindi', 'Marathi'],
    sessionRate: '2000',
    about: 'Specialized in LGBTQ+ affirmative therapy with 8+ years of experience helping individuals navigate identity, relationships, and mental health challenges. I provide a safe, non-judgmental space for all clients.',
    availability: {
      monday: { enabled: true, slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
      tuesday: { enabled: true, slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
      wednesday: { enabled: true, slots: ['9:00 AM - 12:00 PM'] },
      thursday: { enabled: true, slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
      friday: { enabled: true, slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] },
    },
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    clientReviews: true,
    profileVisibility: 'public',
    autoAcceptBookings: false,
  });

  const [newQualification, setNewQualification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
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

  const addQualification = () => {
    if (newQualification.trim()) {
      setProfileData({
        ...profileData,
        qualifications: [...profileData.qualifications, newQualification.trim()],
      });
      setNewQualification('');
    }
  };

  const removeQualification = (index) => {
    setProfileData({
      ...profileData,
      qualifications: profileData.qualifications.filter((_, i) => i !== index),
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      setProfileData({
        ...profileData,
        languages: [...profileData.languages, newLanguage.trim()],
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages.filter((_, i) => i !== index),
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

  const profileStats = [
    { label: 'Total Sessions', value: '156', color: '#9D84B7' },
    { label: 'Average Rating', value: '4.9', color: '#F4A259' },
    { label: 'Response Rate', value: '98%', color: '#4DAA57' },
    { label: 'Monthly Earnings', value: '₹1,85,000', color: '#5899E2' },
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
            Professional Profile
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            Manage your professional information and service settings
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
                    Professional Information
                  </Typography>
                  <Button
                    variant={isEditing ? "outlined" : "contained"}
                    startIcon={isEditing ? <Cancel /> : <Edit />}
                    onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>

                {/* Profile Picture & Verification */}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {profileData.firstName} {profileData.lastName}
                      </Typography>
                      <Verified sx={{ color: 'success.main' }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {profileData.profession}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {profileData.experience} years experience • Verified Professional
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Star sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        4.9 (156 reviews)
                      </Typography>
                    </Box>
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
                      name="profession"
                      label="Profession"
                      value={profileData.profession}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="experience"
                      label="Years of Experience"
                      type="number"
                      value={profileData.experience}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="specialization"
                      label="Specialization"
                      value={profileData.specialization}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      multiline
                      rows={2}
                    />
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
                      name="sessionRate"
                      label="Session Rate (₹)"
                      type="number"
                      value={profileData.sessionRate}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <AttachMoney sx={{ color: 'text.secondary', mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="about"
                      label="About Me"
                      value={profileData.about}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      multiline
                      rows={4}
                    />
                  </Grid>

                  {/* Qualifications */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Qualifications & Certifications
                    </Typography>
                    <List>
                      {profileData.qualifications.map((qualification, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText primary={qualification} />
                          {isEditing && (
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => removeQualification(index)}
                                color="error"
                              >
                                <Remove />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      ))}
                    </List>
                    {isEditing && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <TextField
                          fullWidth
                          value={newQualification}
                          onChange={(e) => setNewQualification(e.target.value)}
                          placeholder="Add new qualification"
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={addQualification}
                        >
                          Add
                        </Button>
                      </Box>
                    )}
                  </Grid>

                  {/* Languages */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Languages
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {profileData.languages.map((language, index) => (
                        <Chip
                          key={index}
                          label={language}
                          onDelete={isEditing ? () => removeLanguage(index) : undefined}
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                    {isEditing && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <TextField
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Add new language"
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={addLanguage}
                        >
                          Add
                        </Button>
                      </Box>
                    )}
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

            {/* Professional Settings */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Professional Settings
                </Typography>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Booking Preferences
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            name="autoAcceptBookings"
                            checked={preferences.autoAcceptBookings}
                            onChange={handlePreferenceChange}
                          />
                        }
                        label="Auto-accept bookings"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            name="clientReviews"
                            checked={preferences.clientReviews}
                            onChange={handlePreferenceChange}
                          />
                        }
                        label="Allow client reviews"
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Notifications
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
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Performance Stats */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ borderRadius: 3, mb: 4 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Performance Overview
                </Typography>
                <Stack spacing={3}>
                  {profileStats.map((stat, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </MotionCard>

            {/* Availability Status */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{ borderRadius: 3, mb: 4 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Availability Status
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">Available for bookings</Typography>
                    <Switch defaultChecked color="success" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Next available slot:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Tomorrow, 10:00 AM
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Schedule />}
                    fullWidth
                  >
                    Manage Schedule
                  </Button>
                </Stack>
              </CardContent>
            </MotionCard>

            {/* Quick Actions */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    View Public Profile
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Download Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Client Feedback
                  </Button>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProfessionalProfile;