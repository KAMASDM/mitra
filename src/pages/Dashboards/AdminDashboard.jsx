// src/pages/Dashboards/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  People,
  Person,
  TrendingUp,
  AttachMoney,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  MoreVert,
  Analytics,
  Security,
  Settings,
  Block,
  Email,
  Phone,
  LocationOn,
  Work,
  School,
  Warning,
  Download,
} from '@mui/icons-material';

// Import admin services
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getPendingProfessionals,
  approveProfessional,
  rejectProfessional,
  getPlatformStatistics,
  getSystemReports,
  updatePlatformSettings,
  getPlatformSettings,
} from '../../services/adminService';

const MotionCard = motion(Card);

const AdminDashboard = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for different sections
  const [platformStats, setPlatformStats] = useState({});
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [reports, setReports] = useState({});
  const [settings, setSettings] = useState({});
  
  // Dialog states
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    data: null,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, professionalsRes, usersRes, settingsRes] = await Promise.all([
        getPlatformStatistics(),
        getPendingProfessionals(),
        getAllUsers(),
        getPlatformSettings(),
      ]);

      if (statsRes.success) setPlatformStats(statsRes.statistics);
      if (professionalsRes.success) setPendingProfessionals(professionalsRes.professionals);
      if (usersRes.success) setAllUsers(usersRes.users);
      if (settingsRes.success) setSettings(settingsRes.settings);
    } catch (error) {
      showSnackbar('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Load specific data based on tab
    if (newValue === 3 && Object.keys(reports).length === 0) {
      fetchReports();
    }
  };

  const fetchReports = async () => {
    try {
      const reportsRes = await getSystemReports();
      if (reportsRes.success) {
        setReports(reportsRes.reports);
      }
    } catch (error) {
      showSnackbar('Failed to load reports', 'error');
    }
  };

  const handleApproveProfessional = async (professionalId) => {
    setActionDialog({
      open: true,
      type: 'approve',
      data: pendingProfessionals.find(p => p.id === professionalId),
    });
  };

  const handleRejectProfessional = async (professionalId, reason = '') => {
    setActionDialog({
      open: true,
      type: 'reject',
      data: pendingProfessionals.find(p => p.id === professionalId),
    });
  };

  const confirmProfessionalAction = async (action, professionalId, reason = '') => {
    try {
      setLoading(true);
      let result;
      
      if (action === 'approve') {
        result = await approveProfessional(professionalId);
        if (result.success) {
          setPendingProfessionals(prev => prev.filter(p => p.id !== professionalId));
          showSnackbar('Professional approved successfully');
        }
      } else if (action === 'reject') {
        result = await rejectProfessional(professionalId, reason);
        if (result.success) {
          setPendingProfessionals(prev => prev.filter(p => p.id !== professionalId));
          showSnackbar('Professional rejected');
        }
      }
      
      if (!result.success) {
        showSnackbar(result.error || 'Action failed', 'error');
      }
    } catch (error) {
      showSnackbar('Operation failed', 'error');
    } finally {
      setLoading(false);
      setActionDialog({ open: false, type: null, data: null });
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      setLoading(true);
      const result = await updateUserStatus(userId, newStatus);
      
      if (result.success) {
        setAllUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        showSnackbar(`User status updated to ${newStatus}`);
      } else {
        showSnackbar(result.error || 'Failed to update user status', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update user status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        const result = await deleteUser(userId);
        
        if (result.success) {
          setAllUsers(prev => prev.filter(user => user.id !== userId));
          showSnackbar('User deleted successfully');
        } else {
          showSnackbar(result.error || 'Failed to delete user', 'error');
        }
      } catch (error) {
        showSnackbar('Failed to delete user', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderOverview = () => (
    <Grid container spacing={4}>
      {/* Platform Statistics */}
      <Grid item xs={12}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Users', value: platformStats.totalUsers || 0, icon: <People />, color: '#9D84B7', change: '+12%' },
            { label: 'Professionals', value: platformStats.totalProfessionals || 0, icon: <Person />, color: '#F4A259', change: '+8%' },
            { label: 'Total Revenue', value: `₹${(platformStats.totalRevenue || 0).toLocaleString()}`, icon: <AttachMoney />, color: '#4DAA57', change: '+15%' },
            { label: 'Sessions', value: platformStats.totalSessions || 0, icon: <TrendingUp />, color: '#5899E2', change: '+22%' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `2px solid ${alpha(stat.color, 0.1)}`,
                  '&:hover': {
                    borderColor: stat.color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 10px 25px ${alpha(stat.color, 0.2)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 600 }}
                    />
                  </Box>
                  <Box sx={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: alpha(stat.color, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Recent Activity and Quick Actions */}
      <Grid item xs={12} md={8}>
        <MotionCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Recent Activity
            </Typography>
            {/* Add recent activity feed here */}
            <Stack spacing={2}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="body2">
                  <strong>Dr. Priya Sharma</strong> submitted professional verification documents
                </Typography>
                <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="body2">
                  <strong>Alex Kumar</strong> completed their first session
                </Typography>
                <Typography variant="caption" color="text.secondary">4 hours ago</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Typography variant="body2">
                  Payment dispute raised for booking <strong>#BK123456</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">6 hours ago</Typography>
              </Paper>
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <MotionCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Quick Actions
            </Typography>
            <Stack spacing={2}>
              <Button variant="contained" fullWidth startIcon={<People />} onClick={() => setTabValue(2)}>
                Manage Users
              </Button>
              <Button variant="outlined" fullWidth startIcon={<Analytics />} onClick={() => setTabValue(3)}>
                View Reports
              </Button>
              <Button variant="outlined" fullWidth startIcon={<Settings />} onClick={() => setTabValue(4)}>
                Platform Settings
              </Button>
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderProfessionalApprovals = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Pending Professional Approvals ({pendingProfessionals.length})
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Professional</TableCell>
                    <TableCell>Profession</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Documents</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingProfessionals.map((professional) => (
                    <TableRow key={professional.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {professional.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {professional.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {professional.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{professional.profession}</TableCell>
                      <TableCell>{professional.experience} years</TableCell>
                      <TableCell>{professional.location}</TableCell>
                      <TableCell>{new Date(professional.submittedDate?.toDate?.() || professional.submittedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {professional.documents?.map((doc, index) => (
                            <Chip key={index} label={doc} size="small" color="success" variant="outlined" />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" color="primary" onClick={() => console.log('View details:', professional.id)}>
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" color="success" onClick={() => handleApproveProfessional(professional.id)}>
                            <CheckCircle />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleRejectProfessional(professional.id)}>
                            <Cancel />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderUserManagement = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                User Management ({allUsers.length} users)
              </Typography>
              <Button variant="outlined" startIcon={<Download />}>
                Export Users
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allUsers.slice(0, 10).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user.photoURL} sx={{ bgcolor: 'primary.main' }}>
                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {user.displayName || 'No name'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status || 'active'} 
                          size="small" 
                          color={user.status === 'active' ? 'success' : 'warning'} 
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt?.toDate?.() || user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? new Date(user.lastLoginAt.toDate()).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => console.log('View user:', user.id)}>
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color={user.status === 'active' ? 'warning' : 'success'}
                            onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          >
                            <Block />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderReports = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Platform Reports & Analytics
        </Typography>
      </Grid>
      
      {/* Revenue Reports */}
      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Revenue Analytics
            </Typography>
            {/* Add chart component here */}
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography color="text.secondary">Revenue Chart Placeholder</Typography>
            </Box>
          </CardContent>
        </MotionCard>
      </Grid>

      {/* User Growth */}
      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              User Growth
            </Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography color="text.secondary">User Growth Chart Placeholder</Typography>
            </Box>
          </CardContent>
        </MotionCard>
      </Grid>

      {/* Export Options */}
      <Grid item xs={12}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Export Reports
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<Download />}>
                User Report
              </Button>
              <Button variant="outlined" startIcon={<Download />}>
                Revenue Report
              </Button>
              <Button variant="outlined" startIcon={<Download />}>
                Session Report
              </Button>
              <Button variant="outlined" startIcon={<Download />}>
                Professional Report
              </Button>
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderSettings = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Platform Settings
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              General Settings
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Platform Name"
                value={settings.platformName || 'SWEEKAR'}
                onChange={(e) => setSettings({...settings, platformName: e.target.value})}
              />
              <TextField
                fullWidth
                label="Support Email"
                value={settings.supportEmail || 'support@sweekar.com'}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
              />
              <TextField
                fullWidth
                label="Default Session Duration (minutes)"
                type="number"
                value={settings.defaultSessionDuration || 60}
                onChange={(e) => setSettings({...settings, defaultSessionDuration: e.target.value})}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <MotionCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Business Settings
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Platform Commission (%)"
                type="number"
                value={settings.platformCommission || 10}
                onChange={(e) => setSettings({...settings, platformCommission: e.target.value})}
              />
              <FormControl fullWidth>
                <InputLabel>Default Currency</InputLabel>
                <Select
                  value={settings.defaultCurrency || 'INR'}
                  label="Default Currency"
                  onChange={(e) => setSettings({...settings, defaultCurrency: e.target.value})}
                >
                  <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Minimum Booking Notice (hours)"
                type="number"
                value={settings.minimumBookingNotice || 24}
                onChange={(e) => setSettings({...settings, minimumBookingNotice: e.target.value})}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={async () => {
              try {
                setLoading(true);
                const result = await updatePlatformSettings(settings);
                if (result.success) {
                  showSnackbar('Settings updated successfully');
                } else {
                  showSnackbar(result.error || 'Failed to update settings', 'error');
                }
              } finally {
                setLoading(false);
              }
            }}
          >
            Save Settings
          </Button>
          <Button variant="outlined" onClick={fetchInitialData}>
            Reset to Default
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            Admin Dashboard 🛡️
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Welcome back, {user?.user?.name || 'Admin'}! Monitor and manage the SWEEKAR platform.
          </Typography>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Professional Approvals" />
            <Tab label="User Management" />
            <Tab label="Reports" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && renderOverview()}
        {tabValue === 1 && renderProfessionalApprovals()}
        {tabValue === 2 && renderUserManagement()}
        {tabValue === 3 && renderReports()}
        {tabValue === 4 && renderSettings()}

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null, data: null })}>
          <DialogTitle>
            {actionDialog.type === 'approve' ? 'Approve Professional' : 'Reject Professional'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to {actionDialog.type} <strong>{actionDialog.data?.name}</strong>?
            </Typography>
            {actionDialog.type === 'reject' && (
              <TextField
                fullWidth
                label="Reason for rejection"
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, type: null, data: null })}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color={actionDialog.type === 'approve' ? 'success' : 'error'}
              onClick={() => confirmProfessionalAction(actionDialog.type, actionDialog.data?.id, '')}
            >
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminDashboard;