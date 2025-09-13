// src/pages/Dashboards/AdminDashboard.jsx
import React, { useState } from 'react';
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
} from '@mui/icons-material';

const MotionCard = motion(Card);

// Mock data
const platformStats = [
  { label: 'Total Users', value: '2,847', icon: <People />, color: '#9D84B7', change: '+12%' },
  { label: 'Professionals', value: '486', icon: <Person />, color: '#F4A259', change: '+8%' },
  { label: 'Total Revenue', value: '₹45.2L', icon: <AttachMoney />, color: '#4DAA57', change: '+15%' },
  { label: 'Sessions', value: '12,439', icon: <TrendingUp />, color: '#5899E2', change: '+22%' },
];

const pendingProfessionals = [
  {
    id: 1,
    name: 'Dr. Rohit Verma',
    email: 'rohit.verma@email.com',
    profession: 'Psychiatrist',
    experience: '12 years',
    location: 'Mumbai',
    submittedDate: '2025-09-10',
    documents: ['Medical License', 'Identity Proof', 'Experience Certificate'],
  },
  {
    id: 2,
    name: 'Adv. Priya Singh',
    email: 'priya.singh@email.com',
    profession: 'Human Rights Lawyer',
    experience: '8 years',
    location: 'Delhi',
    submittedDate: '2025-09-12',
    documents: ['Bar Council Certificate', 'Identity Proof', 'Practice Certificate'],
  },
];

const recentUsers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@email.com',
    type: 'Client',
    joinDate: '2025-09-13',
    status: 'Active',
    sessions: 3,
  },
  {
    id: 2,
    name: 'Alex Kumar',
    email: 'alex@email.com',
    type: 'Client',
    joinDate: '2025-09-12',
    status: 'Active',
    sessions: 1,
  },
];

const platformMetrics = {
  userGrowth: 85,
  professionalGrowth: 72,
  revenueGrowth: 94,
  satisfactionRate: 96,
};

const AdminDashboard = () => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApproveProfessional = (professionalId) => {
    console.log('Approve professional:', professionalId);
  };

  const handleRejectProfessional = (professionalId) => {
    console.log('Reject professional:', professionalId);
  };

  const renderOverview = () => (
    <Grid container spacing={4}>
      {/* Platform Statistics */}
      <Grid item xs={12}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {platformStats.map((stat, index) => (
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
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: stat.color,
                        mb: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        mb: 1,
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: 'success.main',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: alpha(stat.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Platform Metrics */}
      <Grid item xs={12} md={6}>
        <MotionCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ borderRadius: 3, height: '100%' }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Platform Metrics
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">User Growth</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {platformMetrics.userGrowth}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={platformMetrics.userGrowth}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Professional Growth</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {platformMetrics.professionalGrowth}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={platformMetrics.professionalGrowth}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'secondary.main',
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Revenue Growth</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {platformMetrics.revenueGrowth}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={platformMetrics.revenueGrowth}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'success.main',
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Satisfaction Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {platformMetrics.satisfactionRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={platformMetrics.satisfactionRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'info.main',
                    },
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>

      {/* Recent Users */}
      <Grid item xs={12} md={6}>
        <MotionCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          sx={{ borderRadius: 3, height: '100%' }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Recent Users
            </Typography>

            <Stack spacing={3}>
              {recentUsers.map((user) => (
                <Paper
                  key={user.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={user.type}
                        size="small"
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {user.sessions} sessions
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </MotionCard>
      </Grid>
    </Grid>
  );

  const renderProfessionalApprovals = () => (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ borderRadius: 3 }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Pending Professional Approvals
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
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {professional.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {professional.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{professional.profession}</TableCell>
                      <TableCell>{professional.experience}</TableCell>
                      <TableCell>{professional.location}</TableCell>
                      <TableCell>{professional.submittedDate}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {professional.documents.map((doc, index) => (
                            <Chip
                              key={index}
                              label={doc}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => console.log('View details:', professional.id)}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveProfessional(professional.id)}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectProfessional(professional.id)}
                          >
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

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Welcome Header */}
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
            Admin Dashboard 🛡️
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            Welcome back, {user?.user?.name || 'Admin'}! Monitor and manage the SWEEKAR platform.
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<People />}
              sx={{
                py: 2,
                borderRadius: 3,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Manage Users
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Analytics />}
              sx={{
                py: 2,
                borderRadius: 3,
              }}
            >
              View Analytics
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Security />}
              sx={{
                py: 2,
                borderRadius: 3,
              }}
            >
              Security Center
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Settings />}
              sx={{
                py: 2,
                borderRadius: 3,
              }}
            >
              Platform Settings
            </Button>
          </Grid>
        </Grid>

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
        {tabValue === 2 && (
          <Typography variant="h6" sx={{ textAlign: 'center', py: 4 }}>
            User Management Panel - Coming Soon
          </Typography>
        )}
        {tabValue === 3 && (
          <Typography variant="h6" sx={{ textAlign: 'center', py: 4 }}>
            Reports & Analytics - Coming Soon
          </Typography>
        )}
        {tabValue === 4 && (
          <Typography variant="h6" sx={{ textAlign: 'center', py: 4 }}>
            Platform Settings - Coming Soon
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;