// src/components/Admin/PlatformSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  Slider,
} from '@mui/material';
import {
  Save,
  RestoreFromTrash,
  Security,
  Notifications,
  Payment,
  Settings,
  Email,
  Sms,
  Warning,
  Info,
  Add,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { 
  getPlatformSettings, 
  updatePlatformSettings 
} from '../../services/adminService';

const MotionCard = motion(Card);

const PlatformSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'SWEEKAR',
    platformDescription: 'Safe & Inclusive Professional Services for LGBTQAI+ & Women',
    supportEmail: 'support@sweekar.com',
    adminEmail: 'admin@sweekar.com',
    contactPhone: '+91 9876543210',
    platformLogo: '',
    favicon: '',
    
    // Business Settings
    platformCommission: 10,
    defaultCurrency: 'INR',
    minimumBookingNotice: 24,
    maxCancellationTime: 24,
    defaultSessionDuration: 60,
    maxSessionDuration: 180,
    minSessionDuration: 15,
    
    // Payment Settings
    paymentMethods: ['credit_card', 'debit_card', 'upi', 'wallet'],
    stripePublishableKey: '',
    stripeSecretKey: '',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    paypalClientId: '',
    autoRefundEnabled: true,
    refundProcessingDays: 7,
    
    // Security Settings
    twoFactorRequired: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireEmailVerification: true,
    allowSocialLogin: true,
    maxLoginAttempts: 5,
    loginLockoutDuration: 15,
    
    // Notification Settings
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    sendWelcomeEmail: true,
    sendBookingConfirmations: true,
    sendReminders: true,
    reminderTimeBeforeSession: 24,
    
    // Feature Flags
    maintenanceMode: false,
    newRegistrationsEnabled: true,
    professionalVerificationRequired: true,
    reviewsEnabled: true,
    ratingsEnabled: true,
    chatEnabled: true,
    videoCallEnabled: true,
    fileUploadEnabled: true,
    
    // Content Moderation
    autoModerationEnabled: true,
    profanityFilterEnabled: true,
    spamDetectionEnabled: true,
    
    // Analytics
    googleAnalyticsId: '',
    facebookPixelId: '',
    analyticsEnabled: true,
    
    // API Settings
    apiRateLimit: 1000,
    apiRateLimitWindow: 60,
    webhookSecret: '',
  });

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [showSecrets, setShowSecrets] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const result = await getPlatformSettings();
      
      if (result.success) {
        setSettings(prev => ({ ...prev, ...result.settings }));
      } else {
        showNotification('Failed to load settings', 'error');
      }
    } catch (error) {
      showNotification('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const result = await updatePlatformSettings(settings);
      
      if (result.success) {
        showNotification('Settings saved successfully');
      } else {
        showNotification(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showNotification('Error saving settings', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReset = () => {
    setConfirmDialog({ open: true, action: 'reset' });
  };

  const confirmReset = () => {
    fetchSettings(); // Reload from server
    setConfirmDialog({ open: false, action: null });
    showNotification('Settings reset to saved values');
  };

  const toggleSecretVisibility = (key) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderGeneralSettings = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Platform Information
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Platform Name"
                value={settings.platformName}
                onChange={(e) => handleSettingChange('platformName', e.target.value)}
              />
              
              <TextField
                fullWidth
                label="Platform Description"
                multiline
                rows={3}
                value={settings.platformDescription}
                onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
              />
              
              <TextField
                fullWidth
                label="Support Email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
              />
              
              <TextField
                fullWidth
                label="Admin Email"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
              />
              
              <TextField
                fullWidth
                label="Contact Phone"
                value={settings.contactPhone}
                onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Feature Controls
            </Typography>
            
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Maintenance Mode</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Temporarily disable public access
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.newRegistrationsEnabled}
                    onChange={(e) => handleSettingChange('newRegistrationsEnabled', e.target.checked)}
                  />
                }
                label="Allow New Registrations"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.professionalVerificationRequired}
                    onChange={(e) => handleSettingChange('professionalVerificationRequired', e.target.checked)}
                  />
                }
                label="Require Professional Verification"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.reviewsEnabled}
                    onChange={(e) => handleSettingChange('reviewsEnabled', e.target.checked)}
                  />
                }
                label="Enable Reviews & Ratings"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.videoCallEnabled}
                    onChange={(e) => handleSettingChange('videoCallEnabled', e.target.checked)}
                  />
                }
                label="Enable Video Calling"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.chatEnabled}
                    onChange={(e) => handleSettingChange('chatEnabled', e.target.checked)}
                  />
                }
                label="Enable In-App Chat"
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderBusinessSettings = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Business Configuration
            </Typography>
            
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Platform Commission Rate: {settings.platformCommission}%
                </Typography>
                <Slider
                  value={settings.platformCommission}
                  onChange={(e, value) => handleSettingChange('platformCommission', value)}
                  min={0}
                  max={30}
                  step={0.5}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 15, label: '15%' },
                    { value: 30, label: '30%' }
                  ]}
                />
              </Box>
              
              <FormControl fullWidth>
                <InputLabel>Default Currency</InputLabel>
                <Select
                  value={settings.defaultCurrency}
                  label="Default Currency"
                  onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                >
                  <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Minimum Booking Notice (hours)"
                type="number"
                value={settings.minimumBookingNotice}
                onChange={(e) => handleSettingChange('minimumBookingNotice', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 168 }}
              />
              
              <TextField
                fullWidth
                label="Maximum Cancellation Time (hours)"
                type="number"
                value={settings.maxCancellationTime}
                onChange={(e) => handleSettingChange('maxCancellationTime', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 72 }}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Session Configuration
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Default Session Duration (minutes)"
                type="number"
                value={settings.defaultSessionDuration}
                onChange={(e) => handleSettingChange('defaultSessionDuration', parseInt(e.target.value))}
                inputProps={{ min: 15, max: 180 }}
              />
              
              <TextField
                fullWidth
                label="Minimum Session Duration (minutes)"
                type="number"
                value={settings.minSessionDuration}
                onChange={(e) => handleSettingChange('minSessionDuration', parseInt(e.target.value))}
                inputProps={{ min: 5, max: 60 }}
              />
              
              <TextField
                fullWidth
                label="Maximum Session Duration (minutes)"
                type="number"
                value={settings.maxSessionDuration}
                onChange={(e) => handleSettingChange('maxSessionDuration', parseInt(e.target.value))}
                inputProps={{ min: 30, max: 300 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoRefundEnabled}
                    onChange={(e) => handleSettingChange('autoRefundEnabled', e.target.checked)}
                  />
                }
                label="Enable Automatic Refunds"
              />
              
              <TextField
                fullWidth
                label="Refund Processing Days"
                type="number"
                value={settings.refundProcessingDays}
                onChange={(e) => handleSettingChange('refundProcessingDays', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 30 }}
                disabled={!settings.autoRefundEnabled}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderSecuritySettings = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Authentication & Security
            </Typography>
            
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorRequired}
                    onChange={(e) => handleSettingChange('twoFactorRequired', e.target.checked)}
                  />
                }
                label="Require Two-Factor Authentication"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                  />
                }
                label="Require Email Verification"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowSocialLogin}
                    onChange={(e) => handleSettingChange('allowSocialLogin', e.target.checked)}
                  />
                }
                label="Allow Social Media Login"
              />
              
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                inputProps={{ min: 5, max: 120 }}
              />
              
              <TextField
                fullWidth
                label="Minimum Password Length"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                inputProps={{ min: 6, max: 20 }}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Login Protection
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Maximum Login Attempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                inputProps={{ min: 3, max: 10 }}
              />
              
              <TextField
                fullWidth
                label="Login Lockout Duration (minutes)"
                type="number"
                value={settings.loginLockoutDuration}
                onChange={(e) => handleSettingChange('loginLockoutDuration', parseInt(e.target.value))}
                inputProps={{ min: 5, max: 60 }}
              />
              
              <Divider />
              
              <Typography variant="subtitle2" color="text.secondary">
                Content Moderation
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoModerationEnabled}
                    onChange={(e) => handleSettingChange('autoModerationEnabled', e.target.checked)}
                  />
                }
                label="Enable Auto Moderation"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.profanityFilterEnabled}
                    onChange={(e) => handleSettingChange('profanityFilterEnabled', e.target.checked)}
                  />
                }
                label="Enable Profanity Filter"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.spamDetectionEnabled}
                    onChange={(e) => handleSettingChange('spamDetectionEnabled', e.target.checked)}
                  />
                }
                label="Enable Spam Detection"
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderNotificationSettings = () => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Notification Channels
            </Typography>
            
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotificationsEnabled}
                    onChange={(e) => handleSettingChange('emailNotificationsEnabled', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email fontSize="small" />
                    <Typography>Email Notifications</Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotificationsEnabled}
                    onChange={(e) => handleSettingChange('smsNotificationsEnabled', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sms fontSize="small" />
                    <Typography>SMS Notifications</Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotificationsEnabled}
                    onChange={(e) => handleSettingChange('pushNotificationsEnabled', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Notifications fontSize="small" />
                    <Typography>Push Notifications</Typography>
                  </Box>
                }
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Automatic Notifications
            </Typography>
            
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sendWelcomeEmail}
                    onChange={(e) => handleSettingChange('sendWelcomeEmail', e.target.checked)}
                  />
                }
                label="Send Welcome Emails"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sendBookingConfirmations}
                    onChange={(e) => handleSettingChange('sendBookingConfirmations', e.target.checked)}
                  />
                }
                label="Send Booking Confirmations"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sendReminders}
                    onChange={(e) => handleSettingChange('sendReminders', e.target.checked)}
                  />
                }
                label="Send Session Reminders"
              />
              
              <TextField
                fullWidth
                label="Reminder Time Before Session (hours)"
                type="number"
                value={settings.reminderTimeBeforeSession}
                onChange={(e) => handleSettingChange('reminderTimeBeforeSession', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 72 }}
                disabled={!settings.sendReminders}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderPaymentSettings = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Security Note:</strong> API keys and secrets are encrypted and stored securely. 
            Only show these values when necessary and never share them publicly.
          </Typography>
        </Alert>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Stripe Configuration
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Stripe Publishable Key"
                value={settings.stripePublishableKey}
                onChange={(e) => handleSettingChange('stripePublishableKey', e.target.value)}
                placeholder="pk_test_..."
              />
              
              <TextField
                fullWidth
                label="Stripe Secret Key"
                type={showSecrets.stripeSecret ? 'text' : 'password'}
                value={settings.stripeSecretKey}
                onChange={(e) => handleSettingChange('stripeSecretKey', e.target.value)}
                placeholder="sk_test_..."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleSecretVisibility('stripeSecret')}
                        edge="end"
                      >
                        {showSecrets.stripeSecret ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Razorpay Configuration
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Razorpay Key ID"
                value={settings.razorpayKeyId}
                onChange={(e) => handleSettingChange('razorpayKeyId', e.target.value)}
                placeholder="rzp_test_..."
              />
              
              <TextField
                fullWidth
                label="Razorpay Key Secret"
                type={showSecrets.razorpaySecret ? 'text' : 'password'}
                value={settings.razorpayKeySecret}
                onChange={(e) => handleSettingChange('razorpayKeySecret', e.target.value)}
                placeholder="***"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleSecretVisibility('razorpaySecret')}
                        edge="end"
                      >
                        {showSecrets.razorpaySecret ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              API & Integration Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Rate Limit (requests per window)"
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                  inputProps={{ min: 100, max: 10000 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Rate Limit Window (seconds)"
                  type="number"
                  value={settings.apiRateLimitWindow}
                  onChange={(e) => handleSettingChange('apiRateLimitWindow', parseInt(e.target.value))}
                  inputProps={{ min: 60, max: 3600 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Google Analytics ID"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => handleSettingChange('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Facebook Pixel ID"
                  value={settings.facebookPixelId}
                  onChange={(e) => handleSettingChange('facebookPixelId', e.target.value)}
                  placeholder="123456789"
                />
              </Grid>
            </Grid>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Platform Settings
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RestoreFromTrash />}
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>

      {/* Settings Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, value) => setTabValue(value)}>
            <Tab icon={<Settings />} label="General" />
            <Tab icon={<AttachMoney />} label="Business" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Payment />} label="Payments & API" />
          </Tabs>
        </Box>

        <Box sx={{ p: 0 }}>
          {tabValue === 0 && renderGeneralSettings()}
          {tabValue === 1 && renderBusinessSettings()}
          {tabValue === 2 && renderSecuritySettings()}
          {tabValue === 3 && renderNotificationSettings()}
          {tabValue === 4 && renderPaymentSettings()}
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: null })}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'reset' 
              ? 'Are you sure you want to reset all settings to their last saved values? Any unsaved changes will be lost.'
              : 'Please confirm this action.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null })}>
            Cancel
          </Button>
          <Button 
            onClick={confirmReset}
            color="warning"
            variant="contained"
          >
            Confirm Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlatformSettings