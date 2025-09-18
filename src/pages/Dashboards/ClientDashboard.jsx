// src/pages/Dashboards/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Paper,
  IconButton,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarToday,
  Psychology,
  Favorite,
  TrendingUp,
  Schedule,
  Star,
  ArrowForward,
  VideoCall,
  Chat,
  Phone,
  LocationOn,
  Search,
} from '@mui/icons-material';
import { getUserBookings, getUpcomingBookings } from '../../services/bookingService';
import { getProfessionals } from '../../services/userService';

const MotionCard = motion(Card);

const ClientDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('loginInfo'));

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, upcoming: 0, favorites: 0, progress: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user?.id) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');

        console.log("Fetching dashboard data for user:", user.user.id);

        const [upcomingRes, recentRes, recsRes] = await Promise.all([
          getUpcomingBookings(user.user.id, 'client'),
          getUserBookings(user.user.id, 'client', 'completed'),
          getProfessionals({ limit: 3, sortBy: 'rating' })
        ]);

        console.log("Upcoming appointments response:", upcomingRes);
        console.log("Recent sessions response:", recentRes);
        console.log("Recommendations response:", recsRes);

        if (upcomingRes.success) {
          setUpcomingAppointments(upcomingRes.bookings);
        } else {
          setError(upcomingRes.error || 'Could not fetch upcoming appointments.');
        }

        if (recentRes.success) {
          setRecentSessions(recentRes.bookings);
        } else {
          setError(recentRes.error || 'Could not fetch recent sessions.');
        }

        if (recsRes.success) {
          setRecommendations(recsRes.professionals);
        } else {
          setError(recsRes.error || 'Could not fetch recommendations.');
        }

        if (upcomingRes.success && recentRes.success) {
          setStats({
            totalSessions: recentRes.bookings.length,
            upcoming: upcomingRes.bookings.length,
            favorites: 8, // Placeholder for favorites feature
            progress: recentRes.bookings.length > 0 ? (recentRes.bookings.length / 30) * 100 : 0, // Example progress
          });
        }

      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.user?.id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;
  }

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
            Welcome, {user?.user?.name || 'Client'}! 👋
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            Here’s what’s happening with your account today.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <MotionCard sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Your Progress
              </Typography>
              <LinearProgress variant="determinate" value={stats.progress} sx={{ height: 8, borderRadius: 4 }} />
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <MotionCard sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button fullWidth variant="contained" onClick={() => navigate('/experts')}>Find a new Professional</Button>
            </MotionCard>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Upcoming Appointments */}
          <Grid item xs={12} lg={8}>
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ borderRadius: 3, mb: 4 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Upcoming Appointments
                </Typography>
                {upcomingAppointments.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Professional</TableCell>
                          <TableCell>Date & Time</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {upcomingAppointments.map((appt) => (
                          <TableRow key={appt.id}>
                            <TableCell>{appt.professionalName}</TableCell>
                            <TableCell>{new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}</TableCell>
                            <TableCell>{appt.sessionType}</TableCell>
                            <TableCell>
                              <Button variant="outlined" size="small">View</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography>No upcoming appointments.</Typography>
                )}
              </CardContent>
            </MotionCard>

            {/* Recent Sessions */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Recent Sessions
                </Typography>
                {recentSessions.length > 0 ? (
                  <Stack spacing={2}>
                    {recentSessions.map((session) => (
                      <Paper key={session.id} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body1">Session with {session.professionalName} on {new Date(session.appointmentDate).toLocaleDateString()}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography>No recent sessions.</Typography>
                )}
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Recommended Professionals */}
          <Grid item xs={12} lg={4}>
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Recommended for You
                </Typography>
                {recommendations.length > 0 ? (
                  <Stack spacing={3}>
                    {recommendations.map((prof) => (
                      <Paper key={prof.id} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {/* FIX: Use first_name for the avatar initial */}
                          {prof.first_name?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                        <Box>
                          {/* FIX: Combine first_name and last_name for the full name */}
                          <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                            {`${prof.first_name || ''} ${prof.last_name || ''}`.trim()}
                          </Typography>
                          {/* FIX: Use the specializations array for the specialization text */}
                          <Typography variant="body2" color="text.secondary">
                            {prof.specializations?.[0]?.label || 'No Specialization'}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography>No recommendations at this time.</Typography>
                )}
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ClientDashboard;