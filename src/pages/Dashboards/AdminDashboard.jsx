// src/pages/Dashboards/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  TablePagination,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  People,
  Person,
  TrendingUp,
  AttachMoney,
  Visibility,
  CheckCircle,
  Cancel,
  Analytics,
  Security,
  Settings,
  Block,
  Delete,
  Download, // Added Delete icon
} from '@mui/icons-material';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
  getPlatformMetrics,
  getRecentUsers,
  getProfessionalTypes
} from '../../services/adminService';

// Import the missing metrics function from userService
// import { getPlatformMetrics, getRecentUsers } from '../../services/userService';

const MotionCard = motion(Card);

const timeSince = (date) => {
  if (!date) return 'just now';

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

const AdminDashboard = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState('');

  // State for different sections
  const [platformStats, setPlatformStats] = useState({});
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [reports, setReports] = useState({});
  const [settings, setSettings] = useState({});
  const [metrics, setMetrics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({ revenue: [], users: [] });
  const [professionalTypes, setProfessionalTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Dialog states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);

  // --- FIX: State for Professional Details Dialog ---
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [professionalDetailsDialogOpen, setProfessionalDetailsDialogOpen] = useState(false);



  // Dialog states
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    data: null,
  });

  const professionalTypeMap = useMemo(() => {
    if (!professionalTypes) return {};
    return professionalTypes.reduce((acc, type) => {
      acc[type.id] = type.title;
      return acc;
    }, {});
  }, [professionalTypes]);

  useEffect(() => {
    fetchInitialData();
  }, []);


  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Corrected the Promise.all call to use the right function and handle the response
      const [statsRes, professionalsRes, usersRes, settingsRes, metricsRes, activityRes, typesRes] = await Promise.all([
        getPlatformStatistics(),
        getPendingProfessionals(),
        getAllUsers(),
        getPlatformSettings(),
        getPlatformMetrics(), // Changed from getSystemMetrics to getPlatformMetrics
        getRecentUsers(3), // Fetch recent users for activity feed
        getProfessionalTypes
      ]);

      if (statsRes.success) setPlatformStats(statsRes.statistics);
      if (statsRes.success) generateChartData(statsRes.statistics);
      if (professionalsRes.success) setPendingProfessionals(professionalsRes.professionals);
      if (usersRes.success) setAllUsers(usersRes.users);
      if (settingsRes.success) setSettings(settingsRes.settings);
      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (typesRes.success) setProfessionalTypes(typesRes.types);
      if (activityRes.success) {
        // Add a type to each activity for styling/icon purposes
        const formattedActivity = activityRes.users.map(u => ({
          ...u,
          type: u.role === 'PROFESSIONAL' ? 'New Professional' : 'New Client',
          timestamp: u.createdAt?.toDate ? u.createdAt.toDate() : new Date(),
        }));
        setRecentActivity(formattedActivity);
      }

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
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

  const handleRejectProfessional = async (professionalId) => {
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

  const generateChartData = (stats) => {
    // Generate sample data for the last 30 days
    const revenueData = [];
    const userData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      revenueData.push({
        date: shortDate,
        revenue: Math.floor(Math.random() * 3000) + 1000,
      });

      userData.push({
        date: shortDate,
        newUsers: Math.floor(Math.random() * 15) + 5,
      });
    }
    setChartData({ revenue: revenueData, users: userData });
  };
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDetailsDialogOpen(true);
  };
  const UserDetailsDialog = ({ user, open, onClose }) => {
    if (!user) return null;
    

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>User Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Avatar
                src={user.photoURL}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
              >
                {(user.displayName || user.email || 'U')?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{user.displayName || 'No name'}</Typography>
              <Chip
                label={user.role || 'Client'}
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip
                    label={user.status || 'active'}
                    color={user.status === 'active' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Joined On</Typography>
                  <Typography variant="body1">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Login</Typography>
                  <Typography variant="body1">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const handleViewProfessional = (professional) => {
    setSelectedProfessional(professional);
    setProfessionalDetailsDialogOpen(true);
  };

    const ProfessionalDetailsDialog = ({ professional, open, onClose }) => {
    if (!professional) return null;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>Professional Approval Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={professional.photoURL}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
              >
                {(professional.displayName || 'P')?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{professional.displayName || 'No name'}</Typography>
              <Chip 
                label={professional.profession} 
                color="secondary" 
                size="small" 
                sx={{ mt: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Email Address</Typography>
                        <Typography variant="body1">{professional.email}</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Experience</Typography>
                        <Typography variant="body1">{professional.years_of_experience || professional.experience} years</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Location</Typography>
                        <Typography variant="body1">{professional.location || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Submitted On</Typography>
                        <Typography variant="body1">
                            {new Date(professional.submittedDate?.toDate?.() || professional.submittedDate).toLocaleString()}
                        </Typography>
                    </Box>
                </Stack>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Submitted Documents</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {professional.documents && professional.documents.length > 0 ? (
                  professional.documents.map((doc, index) => (
                    <Chip 
                      key={index} 
                      icon={<FilePresent />} 
                      label={doc} 
                      variant="outlined"
                      color="success"
                      onClick={() => alert(`Viewing document: ${doc}`)} // Placeholder action
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">No documents submitted.</Typography>
                )}
              </Stack>
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Close</Button>
          <Button 
            color="error" 
            onClick={() => {
              handleRejectProfessional(professional.id);
              onClose();
            }}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => {
              handleApproveProfessional(professional.id);
              onClose();
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderOverview = () => (
    <Grid container spacing={4}>
      <Grid item size={{ xs: 12 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Users', value: platformStats.totalUsers || 0, icon: <People />, color: '#5C4033', change: metrics?.userGrowth ?? 0 },
            { label: 'Professionals', value: platformStats.totalProfessionals || 0, icon: <Person />, color: '#5C4033', change: metrics?.professionalGrowth ?? 0 },
            { label: 'Total Revenue', value: `₹${(platformStats.totalRevenue || 0).toLocaleString()}`, icon: <AttachMoney />, color: '#5C4033', change: metrics?.revenueGrowth ?? 0 },
            { label: 'Sessions', value: platformStats.totalSessions || 0, icon: <TrendingUp />, color: '#5C4033', change: metrics?.sessionGrowth ?? 0, isRate: true },
          ].map((stat, index) => (
            <Grid item key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{ p: 3, borderRadius: 2, border: `2px solid ${alpha(stat.color, 0.1)}`, '&:hover': { borderColor: stat.color, transform: 'translateY(-4px)', boxShadow: `0 10px 25px ${alpha(stat.color, 0.2)}` }, transition: 'all 0.3s ease' }}
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
                      label={`${stat.change > 0 ? '+' : ''}${stat.change}%`}
                      size="small"
                      sx={{ bgcolor: alpha(stat.change >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.1), color: stat.change >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}
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

      <Grid item xs={12} md={8}>
        <MotionCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Recent Activity</Typography>
            <Stack spacing={2}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <Paper
                    key={activity.id}
                    sx={{
                      p: 2,
                      bgcolor: activity.type === 'New Professional'
                        ? alpha(theme.palette.info.main, 0.05)
                        : alpha(theme.palette.success.main, 0.05)
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{activity.displayName || 'A new user'}</strong> just registered as a <strong>{activity.role}</strong>.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {timeSince(activity.timestamp)}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary">No recent activity to display.</Typography>
              )}
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <MotionCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions</Typography>
            <Stack spacing={2}>
              <Button variant="contained" fullWidth startIcon={<People />} onClick={() => setTabValue(2)}>Manage Users</Button>
              <Button variant="outlined" fullWidth startIcon={<Analytics />} onClick={() => setTabValue(3)}>View Reports</Button>
              <Button variant="outlined" fullWidth startIcon={<Settings />} onClick={() => setTabValue(4)}>Platform Settings</Button>
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
          <CardContent sx={{ p: 4, minWidth: '95vw' }}>
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
                    <TableCell>Submitted On</TableCell>
                    <TableCell>Documents</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingProfessionals.length > 0 ? (
                    pendingProfessionals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((prof) => (
                      <TableRow key={prof.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>{prof.displayName?.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{prof.displayName}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{prof.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{prof.profession}</TableCell>
                        <TableCell> {Number(prof.years_of_experience || prof.experience) > 0
                          ? `${prof.years_of_experience || prof.experience} years`
                          : 'No Experience'}</TableCell>
                        <TableCell>{prof.location}</TableCell>
                        <TableCell>{new Date(prof.submittedDate?.toDate?.() || prof.submittedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {prof.documents?.map((doc, index) => (
                              <Chip key={index} label={doc} size="small" color="success" variant="outlined" />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" color="primary" onClick={() => handleViewProfessional(prof)}><Visibility /></IconButton>
                            <IconButton size="small" color="success" onClick={() => handleApproveProfessional(prof.id)}><CheckCircle /></IconButton>
                            <IconButton size="small" color="error" onClick={() => handleRejectProfessional(prof.id)}><Cancel /></IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={7} align="center">No pending approvals</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={pendingProfessionals.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );


  const renderUserManagement = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4, minWidth: '95vw' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>User Management ({allUsers.length})</Typography>
              <Button variant="outlined" startIcon={<Download />}>Export Users</Button>
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
                  {allUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user.photoURL} sx={{ bgcolor: 'primary.main' }}>
                            {/* FIX: Your existing code for name fallback is already good! */}
                            {(user.displayName || user.email || 'U')?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.displayName || 'No name'}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {/* FIX: Add a fallback for the role to prevent a blank chip */}
                        <Chip label={user.role || 'Client'} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip label={user.status || 'active'} size="small" color={user.status === 'active' ? 'success' : 'warning'} />
                      </TableCell>
                      <TableCell>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => handleViewUser(user)}><Visibility /></IconButton>
                          <IconButton size="small" color={user.status === 'active' ? 'warning' : 'success'} onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}><Block /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}><Delete /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={allUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  // ... (renderReports and renderSettings can remain the same)
  const renderReports = () => (
    <Grid container spacing={4}>
      <Grid item size={{ xs: 12 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Platform Reports & Analytics</Typography>
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <MotionCard initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>Revenue Analytics (Last 30 Days)</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" sx={{ fontSize: '0.4rem', fontWeight: 500 }} />
                <YAxis sx={{ fontSize: '0.875rem', fontWeight: 500 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} fill={alpha(theme.palette.primary.main, 0.2)} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </MotionCard>
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <MotionCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>User Growth (Last 30 Days)</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newUsers" stroke={theme.palette.secondary.main} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderSettings = () => (
    <Grid container spacing={4}>
      <Grid item size={{ xs: 12 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Platform Settings
        </Typography>
      </Grid>

      <Grid item size={{ xs: 12, md: 6 }}>
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
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Support Email"
                value={settings.supportEmail || 'support@sweekar.com'}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
              <TextField
                fullWidth
                label="Default Session Duration (minutes)"
                type="number"
                value={settings.defaultSessionDuration || 60}
                onChange={(e) => setSettings({ ...settings, defaultSessionDuration: e.target.value })}
              />
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      <Grid item size={{ xs: 12, md: 6 }}>
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
                onChange={(e) => setSettings({ ...settings, platformCommission: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Default Currency</InputLabel>
                <Select
                  value={settings.defaultCurrency || 'INR'}
                  label="Default Currency"
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
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
                onChange={(e) => setSettings({ ...settings, minimumBookingNotice: e.target.value })}
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            Admin Dashboard 🛡️
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Welcome back, {user?.user?.name || 'Admin'}! Monitor and manage the SWEEKAR platform.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, minWidth: "95vw" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label={`Professional Approvals (${pendingProfessionals.length})`} />
            <Tab label="User Management" />
            <Tab label="Reports" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {tabValue === 0 && renderOverview()}
        {tabValue === 1 && renderProfessionalApprovals()}
        {tabValue === 2 && renderUserManagement()}
        {tabValue === 3 && renderReports()}
        {tabValue === 4 && renderSettings()}

        <UserDetailsDialog
          user={selectedUser}
          open={userDetailsDialogOpen}
          onClose={() => setUserDetailsDialogOpen(false)}
        />

         <ProfessionalDetailsDialog
          professional={selectedProfessional}
          open={professionalDetailsDialogOpen}
          onClose={() => setProfessionalDetailsDialogOpen(false)}
        />

        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null, data: null })}>
          <DialogTitle>{actionDialog.type === 'approve' ? 'Approve Professional' : 'Reject Professional'}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>Are you sure you want to {actionDialog.type} <strong>{actionDialog.data?.displayName}</strong>?</Typography>
            {actionDialog.type === 'reject' && (
              <TextField fullWidth label="Reason for rejection" multiline rows={3} sx={{ mt: 2 }} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, type: null, data: null })}>Cancel</Button>
            <Button variant="contained" color={actionDialog.type === 'approve' ? 'success' : 'error'} onClick={() => confirmProfessionalAction(actionDialog.type, actionDialog.data?.id, '')}>
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminDashboard;