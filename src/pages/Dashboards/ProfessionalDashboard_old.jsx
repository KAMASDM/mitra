// // src/pages/Dashboards/ProfessionalDashboard.jsx
// import React, { useState } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Avatar,
//   Button,
//   Chip,
//   Paper,
//   IconButton,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Switch,
//   FormControlLabel,
//   useTheme,
//   alpha,
//   LinearProgress,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import {
//   CalendarToday,
//   TrendingUp,
//   People,
//   Star,
//   Schedule,
//   VideoCall,
//   Chat,
//   Phone,
//   CheckCircle,
//   Cancel,
//   Edit,
//   Visibility,
//   Assessment,
// } from '@mui/icons-material';

// const MotionCard = motion(Card);

// // Mock data
// const todayAppointments = [
//   {
//     id: 1,
//     client: 'Sarah K.',
//     time: '10:00 AM',
//     type: 'Video Call',
//     duration: '60 min',
//     status: 'confirmed',
//     notes: 'Follow-up session for anxiety management'
//   },
//   {
//     id: 2,
//     client: 'Alex M.',
//     time: '2:30 PM',
//     type: 'In-Person',
//     duration: '45 min',
//     status: 'pending',
//     notes: 'Initial consultation'
//   },
//   {
//     id: 3,
//     client: 'Jordan P.',
//     time: '4:00 PM',
//     type: 'Phone Call',
//     duration: '30 min',
//     status: 'confirmed',
//     notes: 'Career guidance session'
//   },
// ];

// const recentReviews = [
//   {
//     id: 1,
//     client: 'Anonymous',
//     rating: 5,
//     comment: 'Excellent session. Very understanding and helpful approach.',
//     date: '2025-09-12',
//     service: 'Counseling'
//   },
//   {
//     id: 2,
//     client: 'Anonymous',
//     rating: 4,
//     comment: 'Professional and caring. Looking forward to next session.',
//     date: '2025-09-10',
//     service: 'Therapy'
//   },
// ];

// const earnings = {
//   today: 8500,
//   thisWeek: 45000,
//   thisMonth: 185000,
//   total: 560000
// };

// const ProfessionalDashboard = () => {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem('loginInfo'));
//   const [isAvailable, setIsAvailable] = useState(true);

//   const stats = [
//     { label: 'Today\'s Sessions', value: '3', icon: <CalendarToday />, color: '#9D84B7' },
//     { label: 'Total Clients', value: '89', icon: <People />, color: '#F4A259' },
//     { label: 'Average Rating', value: '4.8', icon: <Star />, color: '#E74C3C' },
//     { label: 'This Month', value: '₹1,85,000', icon: <TrendingUp />, color: '#4DAA57' },
//   ];

//   const handleAcceptAppointment = (appointmentId) => {
//     console.log('Accept appointment:', appointmentId);
//   };

//   const handleDeclineAppointment = (appointmentId) => {
//     console.log('Decline appointment:', appointmentId);
//   };

//   return (
//     <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
//       <Container maxWidth="xl">
//         {/* Welcome Header */}
//         <Box sx={{ mb: 4 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//             <Box>
//               <Typography
//                 variant="h4"
//                 component="h1"
//                 sx={{
//                   fontWeight: 800,
//                   color: 'text.primary',
//                   mb: 1,
//                 }}
//               >
//                 Welcome, {user?.user?.name || 'Professional'}! 👨‍⚕️
//               </Typography>
//               <Typography
//                 variant="h6"
//                 sx={{
//                   color: 'text.secondary',
//                   fontWeight: 400,
//                 }}
//               >
//                 Here's your practice overview for today.
//               </Typography>
//             </Box>
//             <FormControlLabel
//               control={
//                 <Switch
//                   checked={isAvailable}
//                   onChange={(e) => setIsAvailable(e.target.checked)}
//                   color="success"
//                 />
//               }
//               label={
//                 <Box>
//                   <Typography variant="body2" sx={{ fontWeight: 600 }}>
//                     Available for bookings
//                   </Typography>
//                   <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                     {isAvailable ? 'Clients can book you' : 'Bookings disabled'}
//                   </Typography>
//                 </Box>
//               }
//               sx={{ flexDirection: 'column', alignItems: 'flex-end' }}
//             />
//           </Box>
//         </Box>

//         {/* Stats Cards */}
//         <Grid container spacing={3} sx={{ mb: 4 }}>
//           {stats.map((stat, index) => (
//             <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={index}>
//               <MotionCard
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 sx={{
//                   p: 3,
//                   borderRadius: 3,
//                   border: `2px solid ${alpha(stat.color, 0.1)}`,
//                   '&:hover': {
//                     borderColor: stat.color,
//                     transform: 'translateY(-4px)',
//                     boxShadow: `0 10px 25px ${alpha(stat.color, 0.2)}`,
//                   },
//                   transition: 'all 0.3s ease',
//                 }}
//               >
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <Box>
//                     <Typography
//                       variant="h4"
//                       sx={{
//                         fontWeight: 800,
//                         color: stat.color,
//                         mb: 1,
//                       }}
//                     >
//                       {stat.value}
//                     </Typography>
//                     <Typography
//                       variant="body2"
//                       sx={{
//                         color: 'text.secondary',
//                         fontWeight: 500,
//                       }}
//                     >
//                       {stat.label}
//                     </Typography>
//                   </Box>
//                   <Box
//                     sx={{
//                       width: 60,
//                       height: 60,
//                       borderRadius: '50%',
//                       background: alpha(stat.color, 0.1),
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       color: stat.color,
//                     }}
//                   >
//                     {stat.icon}
//                   </Box>
//                 </Box>
//               </MotionCard>
//             </Grid>
//           ))}
//         </Grid>

//         <Grid container spacing={4}>
//           {/* Today's Appointments */}
//           <Grid item xs={12} lg={8}>
//             <MotionCard
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6 }}
//               sx={{ borderRadius: 3, mb: 4 }}
//             >
//               <CardContent sx={{ p: 4 }}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                   <Typography variant="h5" sx={{ fontWeight: 700 }}>
//                     Today's Appointments
//                   </Typography>
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     startIcon={<CalendarToday />}
//                   >
//                     View Calendar
//                   </Button>
//                 </Box>

//                 <Stack spacing={3}>
//                   {todayAppointments.map((appointment) => (
//                     <Paper
//                       key={appointment.id}
//                       sx={{
//                         p: 3,
//                         borderRadius: 2,
//                         border: '1px solid',
//                         borderColor: 'divider',
//                         '&:hover': {
//                           boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
//                         },
//                         transition: 'all 0.3s ease',
//                       }}
//                     >
//                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                         <Box sx={{ flexGrow: 1 }}>
//                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//                             <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                               {appointment.client}
//                             </Typography>
//                             <Chip
//                               label={appointment.status}
//                               size="small"
//                               color={appointment.status === 'confirmed' ? 'success' : 'warning'}
//                             />
//                           </Box>

//                           <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
//                             <Chip
//                               icon={<Schedule />}
//                               label={`${appointment.time} (${appointment.duration})`}
//                               size="small"
//                               variant="outlined"
//                             />
//                             <Chip
//                               icon={appointment.type === 'Video Call' ? <VideoCall /> :
//                                 appointment.type === 'Phone Call' ? <Phone /> : <CalendarToday />}
//                               label={appointment.type}
//                               size="small"
//                               color="primary"
//                             />
//                           </Stack>

//                           <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                             {appointment.notes}
//                           </Typography>
//                         </Box>

//                         <Stack direction="row" spacing={1}>
//                           {appointment.status === 'pending' && (
//                             <>
//                               <IconButton
//                                 color="success"
//                                 onClick={() => handleAcceptAppointment(appointment.id)}
//                                 sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
//                               >
//                                 <CheckCircle />
//                               </IconButton>
//                               <IconButton
//                                 color="error"
//                                 onClick={() => handleDeclineAppointment(appointment.id)}
//                                 sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
//                               >
//                                 <Cancel />
//                               </IconButton>
//                             </>
//                           )}
//                           <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
//                             <VideoCall />
//                           </IconButton>
//                           <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
//                             <Chat />
//                           </IconButton>
//                         </Stack>
//                       </Box>
//                     </Paper>
//                   ))}
//                 </Stack>
//               </CardContent>
//             </MotionCard>

//             {/* Recent Reviews */}
//             {/* <MotionCard
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               sx={{ borderRadius: 3 }}
//             >
//               <CardContent sx={{ p: 4 }}>
//                 <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
//                   Recent Reviews
//                 </Typography>

//                 <Stack spacing={3}>
//                   {recentReviews.map((review) => (
//                     <Paper
//                       key={review.id}
//                       sx={{
//                         p: 3,
//                         borderRadius: 2,
//                         border: '1px solid',
//                         borderColor: 'divider',
//                       }}
//                     >
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           {[...Array(5)].map((_, i) => (
//                             <Star
//                               key={i}
//                               sx={{
//                                 color: i < review.rating ? 'warning.main' : 'grey.300',
//                                 fontSize: '1.2rem',
//                               }}
//                             />
//                           ))}
//                           <Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>
//                             {review.rating}/5
//                           </Typography>
//                         </Box>
//                         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                           {review.date}
//                         </Typography>
//                       </Box>
//                       <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
//                         "{review.comment}"
//                       </Typography>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                           Service: {review.service}
//                         </Typography>
//                         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//                           - {review.client}
//                         </Typography>
//                       </Box>
//                     </Paper>
//                   ))}
//                 </Stack>
//               </CardContent>
//             </MotionCard> */}
//           </Grid>

//           {/* Sidebar */}
//           <Grid item xs={12} lg={4}>
//             {/* Quick Actions */}
//             <MotionCard
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6 }}
//               sx={{ borderRadius: 3, mb: 4 }}
//             >
//               <CardContent sx={{ p: 4 }}>
//                 <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
//                   Quick Actions
//                 </Typography>
//                 <Stack spacing={2}>
//                   <Button
//                     variant="contained"
//                     fullWidth
//                     startIcon={<CalendarToday />}
//                     sx={{ py: 1.5, borderRadius: 2 }}                 
//                   >
//                     Manage Schedule
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     fullWidth
//                     startIcon={<Edit />}
//                     onClick={() => navigate('/professional/profile')}
//                     sx={{ py: 1.5, borderRadius: 2 }}
//                   >
//                     Edit Profile
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     fullWidth
//                     startIcon={<Assessment />}
//                     sx={{ py: 1.5, borderRadius: 2 }}
//                   >
//                     Analytics
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     fullWidth
//                     startIcon={<Chat />}
//                     sx={{ py: 1.5, borderRadius: 2 }}
//                   >
//                     Messages
//                   </Button>
//                 </Stack>
//               </CardContent>
//             </MotionCard>

//             {/* Earnings Overview */}
//             <MotionCard
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               sx={{ borderRadius: 3, mb: 4 }}
//             >
//               <CardContent sx={{ p: 4 }}>
//                 <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
//                   Earnings Overview
//                 </Typography>

//                 <Stack spacing={3}>
//                   <Box>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
//                       Today
//                     </Typography>
//                     <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
//                       ₹{earnings.today.toLocaleString()}
//                     </Typography>
//                   </Box>

//                   <Box>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
//                       This Week
//                     </Typography>
//                     <Typography variant="h5" sx={{ fontWeight: 600 }}>
//                       ₹{earnings.thisWeek.toLocaleString()}
//                     </Typography>
//                   </Box>

//                   <Box>
//                     <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
//                       This Month
//                     </Typography>
//                     <Typography variant="h5" sx={{ fontWeight: 600 }}>
//                       ₹{earnings.thisMonth.toLocaleString()}
//                     </Typography>
//                     <LinearProgress
//                       variant="determinate"
//                       value={75}
//                       sx={{
//                         mt: 1,
//                         height: 6,
//                         borderRadius: 3,
//                         bgcolor: alpha(theme.palette.success.main, 0.1),
//                         '& .MuiLinearProgress-bar': {
//                           bgcolor: 'success.main',
//                         },
//                       }}
//                     />
//                     <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//                       75% of monthly goal
//                     </Typography>
//                   </Box>
//                 </Stack>
//               </CardContent>
//             </MotionCard>

//             {/* Performance Metrics */}
//             {/* <MotionCard
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6, delay: 0.4 }}
//               sx={{ borderRadius: 3 }}
//             >
//               <CardContent sx={{ p: 4 }}>
//                 <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
//                   Performance
//                 </Typography>

//                 <Stack spacing={3}>
//                   <Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                       <Typography variant="body2">Client Satisfaction</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 600 }}>4.8/5</Typography>
//                     </Box>
//                     <LinearProgress
//                       variant="determinate"
//                       value={96}
//                       sx={{
//                         height: 6,
//                         borderRadius: 3,
//                         bgcolor: alpha(theme.palette.primary.main, 0.1),
//                       }}
//                     />
//                   </Box>

//                   <Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                       <Typography variant="body2">Response Rate</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 600 }}>98%</Typography>
//                     </Box>
//                     <LinearProgress
//                       variant="determinate"
//                       value={98}
//                       sx={{
//                         height: 6,
//                         borderRadius: 3,
//                         bgcolor: alpha(theme.palette.secondary.main, 0.1),
//                         '& .MuiLinearProgress-bar': {
//                           bgcolor: 'secondary.main',
//                         },
//                       }}
//                     />
//                   </Box>

//                   <Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                       <Typography variant="body2">Session Completion</Typography>
//                       <Typography variant="body2" sx={{ fontWeight: 600 }}>94%</Typography>
//                     </Box>
//                     <LinearProgress
//                       variant="determinate"
//                       value={94}
//                       sx={{
//                         height: 6,
//                         borderRadius: 3,
//                         bgcolor: alpha(theme.palette.info.main, 0.1),
//                         '& .MuiLinearProgress-bar': {
//                           bgcolor: 'info.main',
//                         },
//                       }}
//                     />
//                   </Box>
//                 </Stack>
//               </CardContent>
//             </MotionCard> */}
//           </Grid>
//         </Grid>
//       </Container>


//     </Box>
//   );
// };

// export default ProfessionalDashboard;

// src/pages/Dashboards/ProfessionalDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  LinearProgress,
  Stack,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  People,
  Star,
  Schedule,
  VideoCall,
  Chat,
  Phone,
  CheckCircle,
  Cancel,
  Edit,
  Assessment,
  Close as CloseIcon,
  CalendarMonth,
} from '@mui/icons-material';
import { ScheduleManagementView } from './ClientDashboard_old';

import {
  subscribeToProfessionalBookings,
  updateBookingStatus,
  // updateAvailabilitySlot,
  // createBookingFromSlot
} from '../../services/bookingService';
const MotionCard = motion(Card);
const earnings = { today: 8500, thisWeek: 45000, thisMonth: 185000, total: 560000 };

const ProfessionalDashboard = () => {
  // --- STATE & EFFECTS ---
  const theme = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  const [isAvailable, setIsAvailable] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]); // This will hold all bookings from the real-time listener
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalClients: 0,
    averageRating: 0, // Placeholder
    monthlyEarnings: 0
  });

  // Prepare stats array for rendering
  const statsArray = [
    { label: 'Today\'s Sessions', value: stats.todaysAppointments, icon: <CalendarMonth />, color: '#5C4033' },
    { label: 'Total Clients', value: stats.totalClients, icon: <People />, color: '#5C4033' },
    { label: 'Average Rating', value: stats.averageRating, icon: <Star />, color: '#5C4033' },
    { label: 'This Month', value: `₹${stats.monthlyEarnings.toLocaleString()}`, icon: <TrendingUp />, color: '#5C4033' },
  ];

  useEffect(() => {
    // Ensure user ID is available before subscribing
    if (!user?.user?.id) {
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    // Subscribe to bookings and get an 'unsubscribe' function back
    const unsubscribe = subscribeToProfessionalBookings(user.user.id, (result) => {
      if (result.success) {
        setBookings(result.bookings); // Update state with all bookings for this professional

        // Calculate dynamic stats based on the fetched bookings
        const now = new Date();
        const completedBookings = result.bookings.filter(b => b.status === 'completed');
        const uniqueClients = new Set(result.bookings.map(b => b.clientId)).size;
        const monthlyEarnings = completedBookings
          .filter(b => b.appointmentDate.getMonth() === now.getMonth() && b.appointmentDate.getFullYear() === now.getFullYear())
          .reduce((sum, b) => sum + (b.amount || 0), 0);

        setStats({
          todaysAppointments: result.bookings.filter(b => b.appointmentDate.toDateString() === now.toDateString()).length,
          totalClients: uniqueClients,
          averageRating: 0, // Placeholder
          monthlyEarnings: monthlyEarnings
        });
      } else {
        setError(result.error || "Failed to load bookings.");
      }
      setLoading(false);
    });

    // Cleanup: Unsubscribe from the real-time listener when the component unmounts

    return () => unsubscribe();
  }, [user?.user?.id]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    // Filter the full list of bookings to only include those for today's date
    return bookings.filter(b => b.appointmentDate.toDateString() === today);
  }, [bookings]);

  // --- ACTION HANDLERS ---
  const handleAcceptAppointment = async (appointmentId) => {
    const result = await updateBookingStatus(appointmentId, 'confirmed');
    if (!result.success) alert('Failed to accept appointment.');
    // UI updates automatically because of the real-time listener
  };

  // Decline appointment handler
  const handleDeclineAppointment = async (appointmentId) => {
    const result = await updateBookingStatus(appointmentId, 'cancelled', { cancellationReason: 'Declined by professional' });
    if (!result.success) alert('Failed to decline appointment.');
  };

  // --- HELPERS ---
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'confirmed': return { color: 'success', label: 'Confirmed' };
      case 'pending': return { color: 'warning', label: 'Pending' };
      case 'completed': return { color: 'info', label: 'Completed' };
      case 'cancelled': return { color: 'error', label: 'Cancelled' };
      default: return { color: 'default', label: status };
    }
  };

  // Return appropriate icon based on session type
  const getSessionTypeIcon = (sessionType) => {
    if (sessionType === 'In-Person') return <InPersonIcon />;
    if (sessionType === 'Phone Call') return <Phone />;
    return <VideoCall />;
  };

  // --- RENDERING ---
  if (loading) {
    return <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh">
      <CircularProgress />
    </Box>;
  }
  // Main render
  return (
    <Box
      sx={{
        py: 4,
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}>
      <Container maxWidth="xl">
        {/* Welcome Header */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
              Welcome, {user?.user?.name || 'Professional'}! 👨‍⚕️
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Here's your practice overview for today.
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                color="success" />
            }
            label="Available for bookings"
          />
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsArray.map((stat, index) => (
            <Grid item key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 10px 25px ${alpha(stat.color, 0.2)}`
                  }
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: stat.color,
                        mb: 1
                      }}>
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: alpha(stat.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Today's Appointments */}
          <Grid item size={{ xs: 12, lg: 8 }}>
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ borderRadius: 3, mb: 4 }}>

              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    gap: 2
                  }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700
                    }}>Today's Appointments</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CalendarMonth />}
                    onClick={() => setIsScheduleModalOpen(true)}>View Full Calendar</Button>
                </Box>
                <Stack spacing={3}>
                  {/* DYNAMICALLY RENDER todayAppointments INSTEAD OF MOCK DATA */}
                  {todayAppointments.length > 0 ? todayAppointments.map((appointment) => (
                    <Paper
                      key={appointment.id}
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5
                      }}>
                      <Stack spacing={1.5}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600 }}>
                            {appointment.clientName}
                          </Typography>
                          <Chip size="small" {...getStatusChipProps(appointment.status)} />
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip icon={<Schedule fontSize="small" />}
                              label={`${appointment.appointmentTime} (${appointment.duration} min)`}
                              size="small"
                              variant="outlined" />

                            <Chip icon={getSessionTypeIcon(appointment.sessionType)}
                              label={appointment.sessionType?.replace(/_/g, ' ')}
                              size="small"
                              variant="outlined" />
                          </Stack>

                          <Stack direction="row" spacing={0.5}>
                            {appointment.status === 'pending' && (
                              <>
                                <IconButton size="small" color="error"
                                  onClick={() => handleDeclineAppointment(appointment.id)}>
                                  <Cancel />
                                </IconButton>
                                <IconButton size="small" color="success"
                                  onClick={() => handleAcceptAppointment(appointment.id)}>
                                  <CheckCircle />
                                </IconButton>
                              </>
                            )}
                            <IconButton size="small">
                              <VideoCall />
                            </IconButton>
                            <IconButton size="small">
                              <Chat />
                            </IconButton>
                          </Stack>
                        </Box>

                        {appointment.notes && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              pt: 1,
                              borderTop: 1,
                              borderColor: 'divider'
                            }}>
                            {appointment.notes}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  )) : (
                    <Typography
                      color="text.secondary"
                      sx={{
                        textAlign: 'center',
                        py: 4
                      }}>
                      No appointments scheduled for today.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
          {/* Sidebar */}
          <Grid item size={{ xs: 12, lg: 4 }}>
            {/* Quick Actions */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ borderRadius: 3, mb: 4 }}>

              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Quick Actions</Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CalendarMonth />}
                    sx={{ py: 1.5, borderRadius: 2 }}
                    onClick={() => setIsScheduleModalOpen(true)}
                  >
                    Manage Schedule
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Edit />}
                    onClick={() => navigate('/professional/profile')}
                    sx={{ py: 1.5, borderRadius: 2 }}>Edit Profile</Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Assessment />}
                    sx={{ py: 1.5, borderRadius: 2 }}>Analytics</Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Chat />}
                    sx={{ py: 1.5, borderRadius: 2 }}>Messages</Button>
                </Stack>
              </CardContent>
            </MotionCard>

            {/* Earnings Overview */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{ borderRadius: 3, mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Earnings Overview</Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mb: 1 }}>Today</Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: 'success.main' }}>₹{earnings.today.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mb: 1 }}>This Month</Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600 }}>₹{earnings.thisMonth.toLocaleString()}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}>75% of monthly goal</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Container>

      {/* --- SCHEDULE MANAGEMENT DIALOG --- */}
      <Dialog
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        fullWidth
        maxWidth="md">
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          Manage Your Schedule
          <IconButton
            onClick={() => setIsScheduleModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 0,
            height: '75vh',
            overflow: 'hidden'
          }}>
          <ScheduleManagementView
            professional={{ id: user.user.id, ...user.user }} // Pass professional's own data
            user={user}
            isEditable={true} // Professional can edit their own schedule
          />
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default ProfessionalDashboard;