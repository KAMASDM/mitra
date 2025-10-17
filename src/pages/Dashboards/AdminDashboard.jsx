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
  Tooltip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  Edit,
  FilePresent,
  PhotoCamera,
  PersonSearch,
  MedicalServices as MedicalServicesIcon,
  ContactPhone as ContactPhoneIcon,
  Info as InfoIcon,
  Bloodtype as BloodtypeIcon,
  Cake as CakeIcon,
  Report as ReportIcon,
  Medication as MedicationIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  Work as WorkIcon,
  Language as LanguageIcon,
  Event as EventIcon,
  Close as CloseIcon,
  EmailOutlined as EmailIcon,
  WorkOutline as ExperienceIcon,
  LocationOnOutlined as LocationIcon,
  VerifiedUserOutlined as VerifiedIcon,
  CalendarMonthOutlined as CalendarIcon,
  CalendarToday,
  School as SchoolIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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
  updateProfessionalDetails,
} from '../../services/adminService';
import { uploadProfilePicture } from '../../services/userService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

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


const EditProfessionalDialog = ({ professional, open, onClose, onSave, professionalTypes }) => {
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  useEffect(() => {
    if (professional) {
      const name = `${professional.first_name || ''} ${professional.last_name || ''}`.trim() || professional.displayName || '';
      setEditData({ ...professional, displayName: name });
      setProfilePicPreview(professional.photoURL || professional.profile_picture || '');
    }
    return () => {
      setNewProfilePic(null);
      setProfilePicPreview('');
    };
  }, [professional, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    await onSave(editData, newProfilePic);
    setSaving(false);
  };

  if (!open || !editData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Professional Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item size={{ xs: 12 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profilePicPreview}
                sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem', bgcolor: 'primary.light' }}
              >
                {editData.displayName?.charAt(0)}
              </Avatar>
              <IconButton component="label" sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                <PhotoCamera />
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" align="center">
              Click the camera to upload a new picture
            </Typography>
          </Grid>

          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="displayName" label="Full Name" value={editData.displayName || ''} onChange={handleChange} />
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="email" label="Email Address" value={editData.email || ''} onChange={handleChange} />
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="phone" label="Phone Number" value={editData.phone || ''} onChange={handleChange} />
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="years_of_experience" label="Years of Experience" type="number" value={editData.years_of_experience || 0} onChange={handleChange} />
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Profession</InputLabel>
              <Select
                name="professional_type_id"
                label="Profession"
                value={editData.professional_type_id || ''}
                onChange={handleChange}
              >
                {(professionalTypes || []).map((type) => (
                  <MenuItem key={type.firestoreId} value={type.id}>
                    {type.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="educational_qualification" label="Education" value={editData.educational_qualification || ''} onChange={handleChange} />
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="languages_spoken" label="Languages Spoken" value={editData.languages_spoken || ''} onChange={handleChange} helperText="Separate languages with a comma" />
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField fullWidth name="address" label="Address" value={editData.address || ''} onChange={handleChange} />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <TextField
              fullWidth
              name="biography"
              label="Biography"
              multiline
              rows={4}
              value={editData.biography || ''}
              onChange={handleChange}
            />
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
  const [settings, setSettings] = useState({});
  const [metrics, setMetrics] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({ revenue: [], users: [] });
  const [professionalTypes, setProfessionalTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);

  // State for the dialog tabs and client-specific data
  const [dialogTab, setDialogTab] = useState('user'); // 'user' or 'client'
  const [clientDetails, setClientDetails] = useState(null);
  const [clientDetailsLoading, setClientDetailsLoading] = useState(false);

  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [professionalDetailsDialogOpen, setProfessionalDetailsDialogOpen] = useState(false);
  const [editProfessionalDialogOpen, setEditProfessionalDialogOpen] = useState(false);

  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    data: null,
    reason: '',
  });

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
        getRecentUsers(3), // Last 3 users
        getAnalyticsDataForCharts(30), // Last 30 days
        getProfessionalTypes(), // Fetch professional types
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

  const getClientDetailsByUserId = async (userId) => {
    try {
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'No client-specific details found for this user.' };
      }

      const clientDoc = querySnapshot.docs[0];
      const details = clientDoc.data();

      if (details.created_at?.toDate) {
        details.created_at = details.created_at.toDate().toLocaleString();
      }

      return { success: true, details: { id: clientDoc.id, ...details } };

    } catch (error) {
      console.error('Error fetching client details:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchClientDetailsForDialog = async (userId) => {
    if (!userId) return;
    setClientDetailsLoading(true);
    setClientDetails(null);
    const clientRes = await getClientDetailsByUserId(userId);
    if (clientRes.success) {
      setClientDetails(clientRes.details);
    } else {
      console.warn(clientRes.error);
    }
    setClientDetailsLoading(false);
  };

  const professionalTypeMap = useMemo(() => {
    if (!professionalTypes.length) return {};
    return professionalTypes.reduce((acc, type) => {
      acc[type.id] = type.title;
      return acc;
    }, {});
  }, [professionalTypes]);


  const handleApproveProfessional = (professional) => {
    setActionDialog({ open: true, type: 'approve', data: professional, reason: '' });
  };

  const handleRejectProfessional = (professional) => {
    setActionDialog({ open: true, type: 'reject', data: professional, reason: '' });
  };

  const confirmProfessionalAction = async () => {
    const { type, data, reason } = actionDialog;
    const professionalId = data?.id;
    if (!professionalId) return;
    setLoading(true);
    try {
      let result;
      if (type === 'approve') {
        result = await approveProfessional(professionalId);
        if (result.success) {
          setAllProfessionals(prev => prev.map(p => p.id === professionalId ? { ...p, professionalStatus: 'verified' } : p));
          showSnackbar('Professional approved successfully');
        }
      } else if (type === 'reject') {
        result = await rejectProfessional(professionalId, reason);
        if (result.success) {
          setAllProfessionals(prev => prev.map(p => p.id === professionalId ? { ...p, professionalStatus: 'rejected' } : p));
          showSnackbar('Professional rejected');
        }
      }
      if (!result || !result.success) {
        showSnackbar(result?.error || 'Action failed', 'error');
      }
    } catch (error) {
      showSnackbar('Operation failed', 'error');
    } finally {
      setLoading(false);
      setActionDialog({ open: false, type: null, data: null, reason: '' });
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      setLoading(true);
      const result = await updateUserStatus(userId, newStatus);
      if (result.success) {
        setAllUsers(prev => prev.map(user => user.id === userId ? { ...user, status: newStatus } : user));
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
    let usersOnly = allUsers.filter(user => user.role === 'USER' || user.role === 'CLIENT' || !user.role);
    if (!userSearchTerm) return usersOnly;
    const lowercasedFilter = userSearchTerm.toLowerCase();
    return usersOnly.filter(user =>
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
        const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.displayName || '';
        return name.toLowerCase().includes(lowercasedFilter) || p.email?.toLowerCase().includes(lowercasedFilter);
      });
    }
    return professionals;
  }, [professionalSearchTerm, professionalStatusFilter, allProfessionals]);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDialogTab('user');
    setClientDetails(null);
    setUserDetailsDialogOpen(true);
  };

  const handleViewProfessional = (professional) => {
    setSelectedProfessional(professional);
    setProfessionalDetailsDialogOpen(true);
  };

  const handleEditProfessional = (professional) => {
    setSelectedProfessional(professional);
    setEditProfessionalDialogOpen(true);
  };

  const handleSaveChanges = async (updatedData, newProfilePic) => {
    let payload = { ...updatedData };
    if (newProfilePic) {
      showSnackbar('Uploading new profile picture...', 'info');
      const uploadResult = await uploadProfilePicture(payload.user_id, newProfilePic);
      if (uploadResult.success) {
        payload.photoURL = uploadResult.photoURL;
        payload.profile_picture = uploadResult.photoURL;
        showSnackbar('Picture uploaded successfully!', 'success');
      } else {
        showSnackbar('Failed to upload new profile picture.', 'error');
        return;
      }
    }
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

  const UserAndClientDetailsDialog = ({ user, open, onClose }) => {
    if (!user) return null;

    const handleTabChange = (event, newValue) => {
      setDialogTab(newValue);
      if (newValue === 'client' && !clientDetails) {
        fetchClientDetailsForDialog(user.id);
      }
    };

    const DetailItem = ({ label, value }) => (
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body1">{value || 'N/A'}</Typography>
      </Box>
    );

    const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.displayName || 'No name';

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
          <Tabs value={dialogTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="User Details" value="user" />
            <Tab label="Profile Details" value="client" />
          </Tabs>
        </DialogTitle>
        <DialogContent>
          {dialogTab === 'user' && (
            <Box>
              {/* Profile Header */}
              <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4} md={3} sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={user.profile_picture}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      bgcolor: 'primary.light',
                      fontSize: '3.5rem',
                      border: `3px solid ${theme.palette.primary.main}`
                    }}
                  >
                    {(displayName || user.email || 'U')?.charAt(0).toUpperCase()}
                  </Avatar>
                </Grid>
                <Grid item xs={12} sm={8} md={9}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{displayName}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>{user.email}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={user.role || 'Client'}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={user.status || 'active'}
                      color={user.status === 'active' ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 4 }} />

              {/* Other Details in a Grid */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DetailItem icon={<CalendarToday />} label="Joined On" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem icon={<HistoryIcon />} label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem icon={<VerifiedIcon />} label="Email" value={user.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem icon={<PhoneIcon />} label="Phone Number" value={user.phone || 'N/A'} />
                </Grid>
              </Grid>
            </Box>
          )}

          {dialogTab === 'client' && (
            <Box sx={{ mt: 2 }}>
              {clientDetailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
              ) : clientDetails ? (
                <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                  <Grid container spacing={3}>

                    {/* Left Column: Medical and Other Info */}
                    <Grid item size={{ xs: 12, md: 7 }}>
                      {/* Medical Info Section */}
                      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                          <MedicalServicesIcon color="primary" />
                          <Typography variant="h6" fontWeight={700}>Medical Information</Typography>
                        </Stack>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><BloodtypeIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.blood_group || 'N/A'} secondary="Blood Group" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CakeIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.date_of_birth || 'N/A'} secondary="Date of Birth" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.allergies || 'N/A'} secondary="Allergies" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><MedicationIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.current_medications || 'N/A'} secondary="Current Medications" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.medical_history || 'N/A'} secondary="Medical History" />
                          </ListItem>
                        </List>
                      </Paper>

                      {/* Other Info Section */}
                      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                          <InfoIcon color="info" />
                          <Typography variant="h6" fontWeight={700}>Other Info</Typography>
                        </Stack>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><WorkIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.occupation || 'N/A'} secondary="Occupation" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.preferred_language || 'N/A'} secondary="Preferred Language" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.created_at || 'N/A'} secondary="Profile Created" />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>

                    {/* Right Column: Emergency Contact */}
                    <Grid item size={{ xs: 12, md: 5 }}>
                      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.error.main}` }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                          <ContactPhoneIcon color="error" />
                          <Typography variant="h6" fontWeight={700}>Emergency Contact</Typography>
                        </Stack>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.emergency_contact_name || 'N/A'} secondary="Contact Name" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><PhoneIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.emergency_contact_phone || 'N/A'} secondary="Contact Phone" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><GroupIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary={clientDetails.emergency_contact_relationship || 'N/A'} secondary="Relationship" />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>

                  </Grid>
                </Box>
              ) : (
                <Typography sx={{ textAlign: 'center', p: 4 }}>No client-specific details found.</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const DetailItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
      {icon}
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
  const ProfessionalDetailsDialog = ({ professional, open, onClose }) => {
    if (!professional) return null;
    const name = `${professional.first_name || ''} ${professional.last_name || ''}`.trim() || professional.displayName || 'Unnamed Professional';

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Professional Details
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {/* Profile Header */}
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar
                src={professional.profile_picture || professional.photoURL}
                sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.light', fontSize: '4rem', color: 'primary.dark' }}
              >
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                {name}
              </Typography>
              {/* <Chip
                  label={professionName}
                  color="secondary"
                  size="small"
                  sx={{ mt: 1 }}
               /> */}
            </Grid>

            {/* Details Section */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DetailItem
                    icon={<EmailIcon color="action" />}
                    label="Email Address"
                    value={professional.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem
                    icon={<PhoneIcon color="action" />}
                    label="Phone"
                    value={professional.phone}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem
                    icon={<WorkIcon color="action" />}
                    label="Experience"
                    value={`${professional.years_of_experience || professional.experience || 'N/A'} years`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem
                    icon={<SchoolIcon color="action" />}
                    label="Education"
                    value={professional.educational_qualification}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem
                    icon={<LanguageIcon color="action" />}
                    label="Languages"
                    value={professional.languages_spoken}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem
                    icon={<EventIcon color="action" />}
                    label="Joined On"
                    value={professional.created_at ? new Date(professional.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box>
            <DetailItem
              icon={<InfoIcon color="action" />}
              label="Biography"
              value={professional.biography || 'No biography provided.'}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
          <Button onClick={onClose} color="inherit">Close</Button>
          {professional.professionalStatus === 'pending' && (
            <Box>
              <Button
                variant="outlined"
                color="error"
                onClick={() => { handleRejectProfessional(professional); onClose(); }}
                sx={{ mr: 1 }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => { handleApproveProfessional(professional); onClose(); }}
                disableElevation
              >
                Approve
              </Button>
            </Box>
          )}
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
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4, minWidth: '95vw' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Professional Management</Typography>
              <Stack spacing={2} flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" width={{ xs: '100%', sm: 'auto' }} gap={2}>
                <TextField size="small" variant="outlined" placeholder="Search..." value={professionalSearchTerm} onChange={(e) => setProfessionalSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>), }} sx={{ minWidth: 'auto' }} />
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
                    <TableCell>Phone</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProfessionals.length > 0 ? (
                    filteredProfessionals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((prof) => {
                      const name = `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || prof.displayName || 'Unnamed Professional';
                      const professionName = professionalTypeMap[prof.professional_type_id] || prof.profession || 'N/A';

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
                          <TableCell>{professionName}</TableCell>
                          <TableCell>{prof.years_of_experience ? `${prof.years_of_experience} years` : 'N/A'}</TableCell>
                          <TableCell>{prof.phone || 'N/A'}</TableCell>
                          <TableCell sx={{ maxWidth: 250 }}>
                            <Tooltip title={prof.address || 'Not Available'} arrow>
                              <Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prof.address || 'N/A'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip label={prof.professionalStatus} size="small" color={prof.professionalStatus === 'verified' ? 'success' : prof.professionalStatus === 'rejected' ? 'error' : 'warning'} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0}>
                              <IconButton size="small" color="primary" onClick={() => handleViewProfessional(prof)}><Visibility /></IconButton>
                              <IconButton size="small" color="secondary" onClick={() => handleEditProfessional(prof)}><Edit /></IconButton>
                              {prof.professionalStatus === 'pending' && (
                                <>
                                  <IconButton size="small" color="success" onClick={() => handleApproveProfessional(prof)}><CheckCircle /></IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleRejectProfessional(prof)}><Cancel /></IconButton>
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
          <CardContent sx={{ p: { xs: 2, md: 4, }, minWidth: '95vw' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>User Management</Typography>
              <Box sx={{ gap: 2 }} flexDirection={{ xs: 'column', sm: 'row' }} display="flex" alignItems="center" width={{ xs: '100%', sm: 'auto' }}>
                <TextField size="small" variant="outlined" placeholder="Search..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>), }} sx={{ maxWidth: '300px', flexGrow: 1 }} />
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
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => {
                    const professionalName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.displayName || 'Unnamed Professional';
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={user.profile_picture} sx={{ bgcolor: 'primary.main' }}>{professionalName.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>{professionalName}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell> <Chip label={user.role || 'Client'} size="small" color="primary" /></TableCell>
                        <TableCell><Chip label={user.status || 'active'} size="small" color={user.status === 'active' ? 'success' : 'warning'} /></TableCell>
                        <TableCell>{new Date(user.createdAt?.toDate?.() || user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0}>
                            <Tooltip title="View User Details">
                              <IconButton size="small" onClick={() => handleViewUser(user)}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.status === 'active' ? 'Suspend User' : 'Activate User'}>
                              <IconButton size="small" color={user.status === 'active' ? 'warning' : 'success'} onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}>
                                <Block />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
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
                <RechartsTooltip />
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
                <RechartsTooltip />
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

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" allowScrollButtonsMobile>
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

        <UserAndClientDetailsDialog
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
          professionalTypes={professionalTypes}
        />

        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: null, data: null, reason: '' })}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {actionDialog.type === 'approve' ? 'Approve Professional' : 'Reject Professional'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to {actionDialog.type}{' '}
              <strong>{`${actionDialog.data?.first_name || ''} ${actionDialog.data?.last_name || ''}`.trim() || actionDialog.data?.displayName}</strong>?
            </Typography>
            {actionDialog.type === 'reject' && (
              <TextField
                fullWidth
                label="Reason for rejection"
                multiline
                rows={3}
                sx={{ mt: 2 }}
                value={actionDialog.reason}
                onChange={(e) => setActionDialog(prev => ({ ...prev, reason: e.target.value }))}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setActionDialog({ open: false, type: null, data: null, reason: '' })}>Cancel</Button>
            <Button
              variant="contained"
              color={actionDialog.type === 'approve' ? 'success' : 'error'}
              onClick={confirmProfessionalAction}
              disabled={loading}
            >
              {loading ? 'Processing...' : (actionDialog.type === 'approve' ? 'Approve' : 'Reject')}
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