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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !user.user || !user.user.id) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

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

        const [upcomingRes, recentRes, recsRes] = await Promise.all([
          getUpcomingBookings(user.user.id, 'client'),
          getUserBookings(user.user.id, 'client', 'completed'),
          getProfessionals({ limit: 3, sortBy: 'rating' })
        ]);

        console.log('Upcoming:', upcomingRes);
        console.log('Recent:', recentRes);
        console.log('Recommendations:', recsRes);

        if (upcomingRes.success) setUpcomingAppointments(upcomingRes.bookings);
        if (recentRes.success) setRecentSessions(recentRes.bookings);
        if (recsRes.success) setRecommendations(recsRes.professionals);

        setStats({
          totalSessions: recentRes.bookings.length,
          upcoming: upcomingRes.bookings.length,
          favorites: 8, // Placeholder for favorites feature
          progress: recentRes.bookings.length > 0 ? (recentRes.bookings.length / 30) * 100 : 0, // Example progress
        });
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
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Alert severity="error">{error}</Alert></Box>;
  }

  // Only show fallback if absolutely all data is missing
  if (
    upcomingAppointments.length === 0 &&
    recentSessions.length === 0 &&
    recommendations.length === 0
  ) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Alert severity="info">No dashboard data found.</Alert></Box>;
  }

  // Render dashboard even if bookings are empty
  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Render upcoming appointments section (can be empty) */}
        {/* Render recent sessions section (can be empty) */}
        {/* Render recommendations section (always render if professionals exist) */}
        {/* ...existing code... */}
      </Container>
    </Box>
  );
};

export default ClientDashboard;