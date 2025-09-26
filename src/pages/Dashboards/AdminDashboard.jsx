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
  InputAdornment,
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
  Download,
  Search,
  Edit, // Added Delete icon
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
  approveProfessional,
  rejectProfessional,
  getPlatformStatistics,
  getSystemReports,
  updatePlatformSettings,
  getPlatformSettings,
  getPlatformMetrics,
  getRecentUsers,
  getProfessionalTypes,
  getAnalyticsDataForCharts,
  getAllProfessionalsWithUserDetails,
  updateProfessionalDetails
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

const EditProfessionalDialog = ({ professional, open, onClose, onSave }) => {
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (professional) {
      const name = `${professional.first_name || ''} ${professional.last_name || ''}`.trim() || professional.displayName || '';
      setEditData({ ...professional, displayName: name });
    }
  }, [professional]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    await onSave(editData);
    setSaving(false);
  };

  if (!open || !editData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Professional Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="displayName" label="Full Name" value={editData.displayName || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="email" label="Email Address" value={editData.email || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="profession" label="Profession" value={editData.profession || ''} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="years_of_experience" label="Years of Experience" type="number" value={editData.years_of_experience || 0} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth name="location" label="Location" value={editData.location || ''} onChange={handleChange} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSaveChanges} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [professionalSearchTerm, setProfessionalSearchTerm] = useState('');
  const [platformStats, setPlatformStats] = useState({});
  const [allProfessionals, setAllProfessionals] = useState([]);
  const [professionalStatusFilter, setProfessionalStatusFilter] = useState('ALL');
  const [allUsers, setAllUsers] = useState([]);
  const [reports, setReports] = useState({});
  const [settings, setSettings] = useState({});
  const [metrics, setMetrics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({ revenue: [], users: [] });
  const [professionalTypes, setProfessionalTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [professionalDetailsDialogOpen, setProfessionalDetailsDialogOpen] = useState(false);
  const [editProfessionalDialogOpen, setEditProfessionalDialogOpen] = useState(false);
  // Dialog states
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    data: null,
  });

  // const professionalTypeMap = useMemo(() => {
  //   if (!professionalTypes) return {};
  //   return professionalTypes.reduce((acc, type) => {
  //     acc[type.id] = type.title;
  //     return acc;
  //   }, {});
  // }, [professionalTypes]);

  useEffect(() => {
    fetchInitialData();
  }, []);


  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, professionalsRes, usersRes, settingsRes, metricsRes, activityRes, chartRes, typesRes] = await Promise.all([
        getPlatformStatistics(),
        getAllProfessionalsWithUserDetails(),
        getAllUsers(),
        getPlatformSettings(),
        getPlatformMetrics(),
        getRecentUsers(3),
        getAnalyticsDataForCharts(30),
        getProfessionalTypes(),
      ]);

      if (statsRes.success) setPlatformStats(statsRes.statistics);
      if (professionalsRes.success) setAllProfessionals(professionalsRes.professionals);
      if (usersRes.success) setAllUsers(usersRes.users);
      if (settingsRes.success) setSettings(settingsRes.settings);
      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (typesRes.success) setProfessionalTypes(typesRes.types);
      if (chartRes.success) setChartData(chartRes.chartData);

      if (activityRes.success) {
        setRecentActivity(activityRes.users.map(u => ({ ...u, type: u.role === 'PROFESSIONAL' ? 'New Professional' : 'New Client', timestamp: u.createdAt?.toDate ? u.createdAt.toDate() : new Date() })));
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      showSnackbar('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  // const handleTabChange = (event, newValue) => {
  //   setTabValue(newValue);
  //   if (newValue === 3 && Object.keys(reports).length === 0) {
  //     fetchReports();
  //   }
  // };

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

  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return allUsers;
    const lowercasedFilter = userSearchTerm.toLowerCase();
    return allUsers.filter(user =>
      (`${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase().includes(lowercasedFilter)) ||
      (user.displayName?.toLowerCase().includes(lowercasedFilter)) ||
      (user.email?.toLowerCase().includes(lowercasedFilter))
    );
  }, [userSearchTerm, allUsers]);

  const professionalCounts = useMemo(() => {
    return {
      PENDING: allProfessionals.filter(p => p.professionalStatus === 'pending').length,
      VERIFIED: allProfessionals.filter(p => p.professionalStatus === 'verified').length,
      REJECTED: allProfessionals.filter(p => p.professionalStatus === 'rejected').length,
    };
  }, [allProfessionals]);

  const filteredProfessionals = useMemo(() => {
    let professionals = allProfessionals;
    if (professionalStatusFilter !== 'ALL') {
      professionals = professionals.filter(p => p.professionalStatus === professionalStatusFilter.toLowerCase());
    }
    if (professionalSearchTerm) {
      const lowercasedFilter = professionalSearchTerm.toLowerCase();
      professionals = professionals.filter(p => {
        const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.displayName || '';
        return name.toLowerCase().includes(lowercasedFilter) || p.email?.toLowerCase().includes(lowercasedFilter);
      });
    }
    return professionals;
  }, [professionalSearchTerm, professionalStatusFilter, allProfessionals]);

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

  const handleEditProfessional = (professional) => {
    setSelectedProfessional(professional);
    setEditProfessionalDialogOpen(true);
  };


  const handleSaveChanges = async (updatedData) => {
    const payload = { ...updatedData };
    if (payload.displayName) {
      const nameParts = payload.displayName.split(' ');
      payload.first_name = nameParts[0] || '';
      payload.last_name = nameParts.slice(1).join(' ') || '';
    }

    const result = await updateProfessionalDetails(payload.id, payload.user_id, payload);

    if (result.success) {
      setAllProfessionals(prev => prev.map(p => (p.id === payload.id ? { ...p, ...payload } : p)));
      setEditProfessionalDialogOpen(false);
      showSnackbar('Professional details updated successfully!');
    } else {
      showSnackbar(result.error || 'Failed to update details.', 'error');
    }
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
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4, minWidth: '95vw' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Professional Management</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField size="small" variant="outlined" placeholder="Search..." value={professionalSearchTerm} onChange={(e) => setProfessionalSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>), }} sx={{ minWidth: '300px' }} />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={professionalStatusFilter} label="Status" onChange={(e) => setProfessionalStatusFilter(e.target.value)}>
                    <MenuItem value="ALL">All Professionals</MenuItem>
                    <MenuItem value="PENDING">Pending ({professionalCounts.PENDING})</MenuItem>
                    <MenuItem value="VERIFIED">Verified ({professionalCounts.VERIFIED})</MenuItem>
                    <MenuItem value="REJECTED">Rejected ({professionalCounts.REJECTED})</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
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
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProfessionals.length > 0 ? (
                    filteredProfessionals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((prof) => {
                      const name = `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || prof.displayName || 'Unnamed Professional';
                      return (
                        <TableRow key={prof.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>{name.charAt(0)}</Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{name}</Typography>
                                <Typography variant="body2" color="text.secondary">{prof.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{prof.profession || 'N/A'}</TableCell>
                          <TableCell>{prof.years_of_experience || 'N/A'} years</TableCell>
                          <TableCell>{prof.location || 'N/A'}</TableCell>
                          <TableCell>{new Date(prof.createdAt?.toDate() || prof.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{prof.documents?.length || 0} files</TableCell>
                          <TableCell>
                            <Chip label={prof.professionalStatus} size="small" color={prof.professionalStatus === 'verified' ? 'success' : prof.professionalStatus === 'rejected' ? 'error' : 'warning'} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0}>
                              <IconButton size="small" color="primary"><Visibility /></IconButton>
                              <IconButton size="small" color="secondary" onClick={() => handleEditProfessional(prof)}><Edit /></IconButton>
                              {prof.professionalStatus === 'pending' && (
                                <>
                                  <IconButton size="small" color="success"><CheckCircle /></IconButton>
                                  <IconButton size="small" color="error"><Cancel /></IconButton>
                                </>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow><TableCell colSpan={8} align="center">No professionals match.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={filteredProfessionals.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>User Management</Typography>

              <Box sx={{ gap: 2, display:'flex'}}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Search..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ maxWidth: '300px', flexGrow: 1 }}
                />
                <Button variant="outlined" startIcon={<Download />}>Export Users</Button>
              </Box>

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
                  {/* --- UPDATE: Use filteredUsers here --- */}
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => {
                    const professionalName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.displayName || 'Unnamed Professional';
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={user.photoURL} sx={{ bgcolor: 'primary.main' }}>{professionalName.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{professionalName}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell> <Chip label={user.role || 'Client'} size="small" color="primary" /></TableCell>
                        <TableCell><Chip label={user.status || 'active'} size="small" color={user.status === 'active' ? 'success' : 'warning'} /></TableCell>
                        <TableCell>{new Date(user.createdAt?.toDate?.() || user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell> {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small" onClick={() => handleViewUser(user)}><Visibility /></IconButton>
                            <IconButton size="small" color={user.status === 'active' ? 'warning' : 'success'} onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}><Block /></IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}><Delete /></IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {/* --- UPDATE: Use filteredUsers.length for the count --- */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredUsers.length}
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
            <Tab label={`Professional Approvals (${filteredProfessionals.length})`} />
            <Tab label={`User Management (${filteredUsers.length})`} />
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

        <EditProfessionalDialog
          professional={selectedProfessional}
          open={editProfessionalDialogOpen}
          onClose={() => setEditProfessionalDialogOpen(false)}
          onSave={handleSaveChanges}
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