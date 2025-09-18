// src/components/Admin/ProfessionalManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Avatar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Stack,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Rating,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  Visibility,
  Download,
  FilePresent,
  Verified,
  Warning,
  School,
  Work,
  Star,
  TrendingUp,
  People,
  Schedule,
  AttachMoney,
  Email,
  Phone,
  LocationOn,
  Language,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { 
  getPendingProfessionals, 
  approveProfessional, 
  rejectProfessional,
  getAllUsers 
} from '../../services/adminService';

const MotionCard = motion(Card);

const ProfessionalManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [verifiedProfessionals, setVerifiedProfessionals] = useState([]);
  const [rejectedProfessionals, setRejectedProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null, professional: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [statistics, setStatistics] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    totalApplications: 0
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      
      // Fetch pending professionals
      const pendingResult = await getPendingProfessionals();
      if (pendingResult.success) {
        setPendingProfessionals(pendingResult.professionals);
      }

      // Fetch all users to get verified and rejected professionals
      const allUsersResult = await getAllUsers({ role: 'PROFESSIONAL' });
      if (allUsersResult.success) {
        const verified = allUsersResult.users.filter(u => u.professionalStatus === 'verified');
        const rejected = allUsersResult.users.filter(u => u.professionalStatus === 'rejected');
        
        setVerifiedProfessionals(verified);
        setRejectedProfessionals(rejected);
        
        setStatistics({
          pending: pendingResult.professionals?.length || 0,
          verified: verified.length,
          rejected: rejected.length,
          totalApplications: (pendingResult.professionals?.length || 0) + verified.length + rejected.length
        });
      }
    } catch (error) {
      showNotification('Failed to fetch professionals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setSearchTerm('');
  };

  const handleViewDetails = (professional) => {
    setSelectedProfessional(professional);
    setDetailsDialog(true);
  };

  const handleAction = (type, professional) => {
    setActionDialog({ open: true, type, professional });
    setRejectionReason('');
    setApprovalNotes('');
  };

  const confirmAction = async () => {
    const { type, professional } = actionDialog;
    try {
      setLoading(true);
      let result;

      if (type === 'approve') {
        result = await approveProfessional(professional.id, approvalNotes);
        if (result.success) {
          setPendingProfessionals(prev => prev.filter(p => p.id !== professional.id));
          setVerifiedProfessionals(prev => [...prev, { ...professional, status: 'verified' }]);
          setStatistics(prev => ({ ...prev, pending: prev.pending - 1, verified: prev.verified + 1 }));
          showNotification('Professional approved successfully');
        }
      } else if (type === 'reject') {
        if (!rejectionReason.trim()) {
          showNotification('Please provide a rejection reason', 'warning');
          return;
        }
        
        result = await rejectProfessional(professional.id, rejectionReason);
        if (result.success) {
          setPendingProfessionals(prev => prev.filter(p => p.id !== professional.id));
          setRejectedProfessionals(prev => [...prev, { ...professional, status: 'rejected', rejectionReason }]);
          setStatistics(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
          showNotification('Professional rejected');
        }
      }

      if (!result?.success) {
        showNotification(result?.error || 'Action failed', 'error');
      }
    } catch (error) {
      showNotification('Action failed', 'error');
    } finally {
      setLoading(false);
      setActionDialog({ open: false, type: null, professional: null });
    }
  };

  const getCurrentData = () => {
    let data = [];
    switch (tabValue) {
      case 0: data = pendingProfessionals; break;
      case 1: data = verifiedProfessionals; break;
      case 2: data = rejectedProfessionals; break;
      default: data = pendingProfessionals;
    }

    if (searchTerm) {
      return data.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profession?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      sx={{ borderRadius: 3 }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: color, mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 50, height: 50, borderRadius: '50%',
            background: `${color}20`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: color,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </MotionCard>
  );

  const ProfessionalDetailsDialog = ({ professional, open, onClose }) => {
    const verificationSteps = [
      'Application Submitted',
      'Documents Uploaded',
      'Under Review',
      professional?.status === 'verified' ? 'Approved' : professional?.status === 'rejected' ? 'Rejected' : 'Pending'
    ];

    const activeStep = professional?.status === 'verified' ? 3 : 
                     professional?.status === 'rejected' ? 3 : 2;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={professional?.photoURL} sx={{ bgcolor: 'primary.main' }}>
              {professional?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{professional?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {professional?.profession}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {professional && (
            <Grid container spacing={4}>
              {/* Verification Status */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Verification Progress</Typography>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {verificationSteps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel 
                        error={professional.status === 'rejected' && index === 3}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Grid>

              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{professional.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{professional.phone || 'Not provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">{professional.location || 'Not specified'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Applied Date</Typography>
                    <Typography variant="body1">
                      {new Date(professional.submittedDate || professional.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Professional Details</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Profession</Typography>
                    <Typography variant="body1">{professional.profession}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Experience</Typography>
                    <Typography variant="body1">{professional.experience} years</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Specialization</Typography>
                    <Typography variant="body1">
                      {professional.specialization || 'General practice'}
                    </Typography>
                  </Box>
                  {professional.rating && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={professional.rating} readOnly size="small" />
                        <Typography variant="body2">
                          {professional.rating} ({professional.reviewCount || 0} reviews)
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Grid>

              {/* Documents */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Submitted Documents</Typography>
                <Grid container spacing={2}>
                  {professional.documents?.map((doc, index) => (
                    <Grid item key={index}>
                      <Chip
                        icon={<FilePresent />}
                        label={doc}
                        color="success"
                        variant="outlined"
                        clickable
                        onClick={() => console.log('View document:', doc)}
                      />
                    </Grid>
                  )) || (
                    <Grid item xs={12}>
                      <Alert severity="warning">No documents submitted</Alert>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Additional Information */}
              {professional.about && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>About</Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {professional.about}
                  </Typography>
                </Grid>
              )}

              {/* Languages */}
              {professional.languages && professional.languages.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Languages</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {professional.languages.map((language, index) => (
                      <Chip key={index} label={language} size="small" />
                    ))}
                  </Stack>
                </Grid>
              )}

              {/* Rejection Reason */}
              {professional.status === 'rejected' && professional.rejectionReason && (
                <Grid item xs={12}>
                  <Alert severity="error">
                    <Typography variant="subtitle2" gutterBottom>Rejection Reason:</Typography>
                    <Typography variant="body2">{professional.rejectionReason}</Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {professional?.status !== 'verified' && professional?.status !== 'rejected' && (
            <>
              <Button
                color="error"
                onClick={() => {
                  onClose();
                  handleAction('reject', professional);
                }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  onClose();
                  handleAction('approve', professional);
                }}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  const currentData = getCurrentData();

  return (
    <Box sx={{ p: 3 }}>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Applications"
            value={statistics.pending}
            icon={<Schedule />}
            color="#F4A259"
            subtitle="Awaiting review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Professionals"
            value={statistics.verified}
            icon={<CheckCircle />}
            color="#4DAA57"
            subtitle="Active on platform"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rejected Applications"
            value={statistics.rejected}
            icon={<Cancel />}
            color="#E74C3C"
            subtitle="Did not meet criteria"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Applications"
            value={statistics.totalApplications}
            icon={<People />}
            color="#9D84B7"
            subtitle="All time"
          />
        </Grid>
      </Grid>

      {/* Controls and Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={statistics.pending} color="warning">
                  Pending Applications
                </Badge>
              } 
            />
            <Tab label={`Verified (${statistics.verified})`} />
            <Tab label={`Rejected (${statistics.rejected})`} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search professionals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => console.log('Export data')}
                >
                  Export
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Data Table */}
      <Paper sx={{ borderRadius: 3 }}>
        {loading && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Professional</TableCell>
                <TableCell>Profession</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((professional) => (
                  <TableRow key={professional.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {professional.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {professional.name || 'No name'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {professional.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{professional.profession}</TableCell>
                    <TableCell>{professional.experience} years</TableCell>
                    <TableCell>{professional.location || 'Not specified'}</TableCell>
                    <TableCell>
                      {new Date(professional.submittedDate || professional.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {professional.documents?.slice(0, 2).map((doc, index) => (
                          <Chip
                            key={index}
                            label={doc}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ))}
                        {professional.documents?.length > 2 && (
                          <Chip
                            label={`+${professional.documents.length - 2} more`}
                            size="small"
                            color="info"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(professional)}
                        >
                          <Visibility />
                        </IconButton>
                        {tabValue === 0 && ( // Only show approve/reject for pending
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAction('approve', professional)}
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleAction('reject', professional)}
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={currentData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Professional Details Dialog */}
      <ProfessionalDetailsDialog
        professional={selectedProfessional}
        open={detailsDialog}
        onClose={() => {
          setDetailsDialog(false);
          setSelectedProfessional(null);
        }}
      />

      {/* Action Confirmation Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onClose={() => setActionDialog({ open: false, type: null, professional: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'approve' ? 'Approve Professional' : 'Reject Professional'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {actionDialog.type === 'approve' 
              ? `Approve ${actionDialog.professional?.name} as a verified professional?`
              : `Reject ${actionDialog.professional?.name}'s application?`
            }
          </Typography>
          
          {actionDialog.type === 'approve' ? (
            <TextField
              fullWidth
              label="Approval Notes (Optional)"
              multiline
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes about the approval..."
            />
          ) : (
            <TextField
              fullWidth
              label="Rejection Reason *"
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              error={!rejectionReason.trim()}
              helperText="This reason will be sent to the professional"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setActionDialog({ open: false, type: null, professional: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionDialog.type === 'approve' ? 'success' : 'error'}
            onClick={confirmAction}
            disabled={loading || (actionDialog.type === 'reject' && !rejectionReason.trim())}
          >
            {loading ? 'Processing...' : (actionDialog.type === 'approve' ? 'Approve' : 'Reject')}
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

export default ProfessionalManagement;