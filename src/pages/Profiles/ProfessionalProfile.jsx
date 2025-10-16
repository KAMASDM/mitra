// src/pages/Profiles/ProfessionalProfile.jsx
import React, { useEffect, useState } from 'react';
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
  // Divider,
  Chip,
  Alert,
  // Paper,
  useTheme,
  // alpha,
  // FormControl,
  // InputLabel,
  // Select,
  // MenuItem,
  // Switch,
  // FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  // Lock,
  // Notifications,
  // Security,
  // Delete,
  Add,
  Remove,
  // Star,
  // Schedule,
  // AttachMoney,
  Verified,
  CurrencyRupee,
} from '@mui/icons-material';
import { getCurrentUserProfile, updateUserProfile } from '../../services/authService';
import { getProfessionalProfileByUserId, updateProfessionalProfile, getUserStatistics } from '../../services/userService';
import { uploadProfilePicture } from '../../services/userService';

const MotionCard = motion(Card);

const ProfessionalProfile = () => {
  const theme = useTheme();
  const loggedInUser = JSON.parse(localStorage.getItem('loginInfo'));

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [initialProfileData, setInitialProfileData] = useState(null);
  // State for image upload
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');



  useEffect(() => {
    const fetchProfile = async () => {
      if (!loggedInUser?.user?.id) {
        showNotification("User not authenticated. Please log in.", "error");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [userRes, professionalRes, statsRes] = await Promise.all([
          getCurrentUserProfile(loggedInUser.user.id),
          getProfessionalProfileByUserId(loggedInUser.user.id),
          getUserStatistics(loggedInUser.user.id, 'PROFESSIONAL'),
        ]);

        if (userRes.success && professionalRes.success) {
          const userData = userRes.userData;
          const profData = professionalRes.profile;

          const combinedData = {
            professionalId: profData.id,
            firstName: profData.first_name || '',
            lastName: profData.last_name || '',
            email: userData.email || '',
            phone: profData.phone || userData.phone || '',
            profession: profData.profession || 'Not specified',
            specialization: profData.specialization || '',
            experience: profData.years_of_experience || '0',
            location: profData.address || profData.location || '',
            qualifications: profData.educational_qualification ? profData.educational_qualification.split(',').map(q => q.trim()) : [],
            languages: profData.languages_spoken ? profData.languages_spoken.split(',').map(l => l.trim()) : [],
            sessionRate: profData.hourly_rate || '0',
            biography: profData.biography || '',
            photoURL: userData.photoURL || '',
          };
          setProfileData(combinedData);
          setInitialProfileData(combinedData);
          setProfileImageUrl(userRes.userData.photoURL || '');
        } else {
          showNotification("Could not load full profile. Please try again.", "error");
        }

        if (statsRes.success) {
          setStats(statsRes.stats);
        }

      } catch (error) {
        showNotification("An error occurred while fetching your profile.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [loggedInUser?.user?.id]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setProfileData({ ...profileData, qualifications: [...profileData.qualifications, newQualification.trim()] });
      setNewQualification('');
    }
  };
  const removeQualification = (index) => {
    setProfileData({ ...profileData, qualifications: profileData.qualifications.filter((_, i) => i !== index) });
  };
  const addLanguage = () => {
    if (newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      setProfileData({ ...profileData, languages: [...profileData.languages, newLanguage.trim()] });
      setNewLanguage('');
    }
  };
  const removeLanguage = (index) => {
    setProfileData({ ...profileData, languages: profileData.languages.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    let updatedProfile = { ...profileData };

    try {
      if (profileImageFile) {
        const uploadResult = await uploadProfilePicture(loggedInUser.user.id, profileImageFile);
        if (uploadResult.success) {
          updatedProfile.photoURL = uploadResult.photoURL;
          updatedProfile.profile_picture = uploadResult.photoURL;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      const result = await updateProfessionalProfile(loggedInUser.user.id, updatedProfile.professionalId, updatedProfile);

      if (result.success) {
        showNotification('Profile updated successfully!');
        setIsEditing(false);
        setInitialProfileData(updatedProfile);
        setProfileImageFile(null); // Clear the file after successful upload
      } else {
        throw new Error(result.error || 'Failed to update profile.');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Optionally refetch data to discard changes
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (!profileData) {
    return <Container sx={{ py: 8 }}><Alert severity="error">Could not load profile data.</Alert></Container>;
  }

  // const profileStats = [
  //   { label: 'Total Sessions', value: '156', color: '#9D84B7' },
  //   { label: 'Average Rating', value: '4.9', color: '#F4A259' },
  //   { label: 'Response Rate', value: '98%', color: '#4DAA57' },
  //   { label: 'Monthly Earnings', value: '₹1,85,000', color: '#5899E2' },
  // ];

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

        {/* {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )} */}

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
                      {profileData.firstName?.charAt(0)}
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
                      {profileData.experience + ' Years Exp' + (profileData.verification_status ? ' • Verified Professional' : ' • Not Verified')}
                    </Typography>
                    {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Star sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        4.9 (156 reviews)
                      </Typography>
                    </Box> */}
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="firstName"
                      label="First Name"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="lastName"
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
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
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="profession"
                      label="Profession"
                      value={profileData.profession}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
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
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="location"
                      label="Location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="sessionRate"
                      label="Session Rate (₹)"
                      type="number"
                      value={profileData.sessionRate}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <CurrencyRupee sx={{ color: 'text.secondary', mr: 1, fontSize: 'small' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6 }}>
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
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="biography"
                      label="Biography"
                      value={profileData.biography}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      multiline
                      rows={2}
                    />
                  </Grid>

                  {/* Qualifications */}
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Qualifications</Typography>
                    <List dense>
                      {(profileData?.qualifications || []).map((q, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemText primary={`• ${q}`} />
                          {isEditing && <ListItemSecondaryAction><IconButton edge="end" color="error" onClick={() => removeQualification(index)}><Remove /></IconButton></ListItemSecondaryAction>}
                        </ListItem>
                      ))}
                    </List>
                    {isEditing && <Box sx={{ display: 'flex', gap: 1, mt: 1 }}><TextField fullWidth value={newQualification} onChange={(e) => setNewQualification(e.target.value)} placeholder="Add new qualification" size="small" /><Button variant="outlined" startIcon={<Add />} onClick={addQualification}>Add</Button></Box>}
                  </Grid>

                  {/* Languages */}
                  <Grid item size={{ xs: 12, sm: 6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Languages</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {(profileData?.languages || []).map((lang, index) => (
                        <Chip key={index} label={lang} onDelete={isEditing ? () => removeLanguage(index) : undefined} color="primary" sx={{ mb: 1 }} />
                      ))}
                    </Stack>
                    {isEditing && <Box sx={{ display: 'flex', gap: 1, mt: 1 }}><TextField value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Add new language" size="small" /><Button variant="outlined" startIcon={<Add />} onClick={addLanguage}>Add</Button></Box>}
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saveLoading}>
                      {saveLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                    <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                  </Box>
                )}
              </CardContent>
            </MotionCard>

            {/* Professional Settings */}
            {/* <MotionCard
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
            </MotionCard> */}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Performance Stats */}
            {/* <MotionCard
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
            </MotionCard> */}

            {/* Availability Status */}
            {/* <MotionCard
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
            </MotionCard> */}

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