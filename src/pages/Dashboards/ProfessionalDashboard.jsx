// src/pages/Dashboards/ProfessionalDashboard.jsx
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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarToday,
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
  Visibility,
  Assessment,
  Person,
  Email,
  Phone as PhoneIcon,
  AccessTime,
  DateRange,
  Add,
} from '@mui/icons-material';
import {
  getProfessionalBookingsWithClientDetails,
  updateBookingStatus,
  getTodaysBookings,
  subscribeToProfessionalBookings,
  createAvailabilitySlot,
  getAvailabilityForProfessional,
  updateAvailabilitySlot,
} from '../../services/bookingService';
import { Timestamp } from 'firebase/firestore';

const MotionCard = motion(Card);

const ProfessionalDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('loginInfo'));
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetailOpen, setBookingDetailOpen] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalClients: 0,
    averageRating: 4.8,
    monthlyEarnings: 0,
  });

  // Set up real-time listener for bookings
  useEffect(() => {
    if (!user?.user?.uid) {
      setError("Professional not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToProfessionalBookings(user.user.uid, (result) => {
      setLoading(false);
      
      if (result.success) {
        setBookings(result.bookings);

        // Filter today's bookings
        const today = new Date();
        const todaysBookings = result.bookings.filter(booking => {
          const bookingDate = new Date(booking.appointmentDate);
          return bookingDate.toDateString() === today.toDateString();
        });
        setTodaysBookings(todaysBookings);

        // Calculate stats
        const completedBookings = result.bookings.filter(b => b.status === 'completed');
        const uniqueClients = new Set(result.bookings.map(b => b.clientId)).size;
        const monthlyEarnings = completedBookings
          .filter(b => {
            const bookingDate = new Date(b.appointmentDate);
            const now = new Date();
            return bookingDate.getMonth() === now.getMonth() && 
                   bookingDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, b) => sum + (b.amount || 0), 0);

        setStats({
          todaysAppointments: todaysBookings.length,
          totalClients: uniqueClients,
          averageRating: 4.8, // This would come from reviews service
          monthlyEarnings,
        });
      } else {
        setError(result.error || "Failed to load dashboard data.");
      }
    });

    return () => unsubscribe();
  }, [user?.user?.uid]);

  // Fetch availability slots
  useEffect(() => {
    const fetchAvailability = async () => {
      if (user?.user?.uid) {
        const availabilityResult = await getAvailabilityForProfessional(user.user.uid);
        if (availabilityResult?.success) {
          setAvailabilitySlots(availabilityResult.slots);
        }
      }
    };
    fetchAvailability();
  }, [user?.user?.uid]);

  const handleAcceptAppointment = async (bookingId) => {
    try {
      const result = await updateBookingStatus(bookingId, 'confirmed');
      if (result.success) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' }
            : booking
        ));
      }
    } catch (err) {
      console.error('Error accepting appointment:', err);
    }
  };

  const handleDeclineAppointment = async (bookingId) => {
    try {
      const result = await updateBookingStatus(bookingId, 'cancelled');
      if (result.success) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        ));
      }
    } catch (err) {
      console.error('Error declining appointment:', err);
    }
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setBookingDetailOpen(true);
  };

  const handleAddAvailability = () => {
    setNewSlotData({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
    });
    setAvailabilityModalOpen(true);
  };

  const handleSaveAvailability = async () => {
    if (!newSlotData.title || !newSlotData.date || !newSlotData.startTime || !newSlotData.endTime) {
      return;
    }

    try {
      const startDateTime = new Date(`${newSlotData.date}T${newSlotData.startTime}`);
      const endDateTime = new Date(`${newSlotData.date}T${newSlotData.endTime}`);

      const slotData = {
        title: newSlotData.title,
        start_date: Timestamp.fromDate(startDateTime),
        end_date: Timestamp.fromDate(endDateTime),
        professional_id: user.user.uid,
        notes: `Available slot created by professional`,
        slot_id: `${Date.now()}`
      };

      const result = await createAvailabilitySlot(slotData);
      if (result.success) {
        // Refresh availability slots
        const availabilityResult = await getAvailabilityForProfessional(user.user.uid);
        if (availabilityResult?.success) {
          setAvailabilitySlots(availabilityResult.slots);
        }
        setAvailabilityModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating availability slot:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getSessionTypeIcon = (sessionType) => {
    switch (sessionType) {
      case 'video_call': return <VideoCall />;
      case 'phone_call': return <Phone />;
      case 'in_person': return <Person />;
      default: return <VideoCall />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Welcome, {user?.user?.displayName || user?.user?.first_name || 'Professional'}! 👨‍⚕️
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 400,
                }}
              >
                Here's your practice overview for today.
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Available for bookings
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {isAvailable ? 'Clients can book you' : 'Bookings disabled'}
                  </Typography>
                </Box>
              }
              sx={{ flexDirection: 'column', alignItems: 'flex-end' }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha('#9D84B7', 0.1)}`,
                '&:hover': {
                  borderColor: '#9D84B7',
                  boxShadow: `0 10px 25px ${alpha('#9D84B7', 0.2)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#9D84B7' }}>
                    {stats.todaysAppointments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Today's Sessions
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 40, color: '#9D84B7' }} />
              </Box>
            </MotionCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha('#F4A259', 0.1)}`,
                '&:hover': {
                  borderColor: '#F4A259',
                  boxShadow: `0 10px 25px ${alpha('#F4A259', 0.2)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#F4A259' }}>
                    {stats.totalClients}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Total Clients
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: '#F4A259' }} />
              </Box>
            </MotionCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha('#E74C3C', 0.1)}`,
                '&:hover': {
                  borderColor: '#E74C3C',
                  boxShadow: `0 10px 25px ${alpha('#E74C3C', 0.2)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#E74C3C' }}>
                    {stats.averageRating}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Average Rating
                  </Typography>
                </Box>
                <Star sx={{ fontSize: 40, color: '#E74C3C' }} />
              </Box>
            </MotionCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `2px solid ${alpha('#4DAA57', 0.1)}`,
                '&:hover': {
                  borderColor: '#4DAA57',
                  boxShadow: `0 10px 25px ${alpha('#4DAA57', 0.2)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#4DAA57' }}>
                    ₹{stats.monthlyEarnings.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    This Month
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#4DAA57' }} />
              </Box>
            </MotionCard>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Today's Appointments */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Today's Appointments
                </Typography>

                {todaysBookings.length > 0 ? (
                  <Stack spacing={2}>
                    {todaysBookings.map((appointment) => (
                      <Paper key={appointment.id} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {appointment.clientName?.charAt(0)?.toUpperCase() || 'C'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {appointment.clientName || 'Client'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {appointment.appointmentTime}
                                </Typography>
                                <Chip
                                  icon={getSessionTypeIcon(appointment.sessionType)}
                                  label={appointment.sessionType?.replace('_', ' ') || 'Video Call'}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {appointment.duration || 60} min
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={appointment.status}
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                            {appointment.status === 'pending' && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleAcceptAppointment(appointment.id)}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => handleDeclineAppointment(appointment.id)}
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => handleViewBookingDetails(appointment)}
                            >
                              Details
                            </Button>
                          </Box>
                        </Box>
                        
                        {appointment.reasonForBooking && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              Reason for Booking:
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {appointment.reasonForBooking}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                      No appointments today
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enjoy your free day!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Bookings */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Recent Bookings
                </Typography>
                
                {bookings.slice(0, 5).map((booking) => (
                  <Paper key={booking.id} sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {booking.clientName || 'Client'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(booking.appointmentDate)} at {booking.appointmentTime}
                    </Typography>
                    <Chip
                      label={booking.status}
                      size="small"
                      color={getStatusColor(booking.status)}
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                ))}

                {bookings.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No bookings yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clients can book you when available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Availability Management */}
            <Card sx={{ borderRadius: 3, mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" fontWeight="bold">
                    Manage Availability
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddAvailability}
                  >
                    Add Slot
                  </Button>
                </Box>
                
                {availabilitySlots.length > 0 ? (
                  <Stack spacing={2}>
                    {availabilitySlots.slice(0, 5).map((slot) => (
                      <Paper key={slot.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {slot.title}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <DateRange sx={{ fontSize: 16 }} />
                              <Typography variant="body2">
                                {slot.start?.toLocaleDateString()}
                              </Typography>
                              <AccessTime sx={{ fontSize: 16 }} />
                              <Typography variant="body2">
                                {slot.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {slot.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          </Box>
                          {slot.isBooked && (
                            <Chip
                              label="Booked"
                              color="warning"
                              size="small"
                            />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No availability slots created
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add availability slots to let clients book you
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Availability Creation Modal */}
        <Dialog
          open={availabilityModalOpen}
          onClose={() => setAvailabilityModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Availability Slot</DialogTitle>
          
          <DialogContent>
            <Stack spacing={3} pt={1}>
              <TextField
                fullWidth
                label="Slot Title"
                value={newSlotData.title}
                onChange={(e) => setNewSlotData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Available for consultation"
              />
              
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={newSlotData.date}
                onChange={(e) => setNewSlotData(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              
              <Box display="flex" gap={2}>
                <TextField
                  flex={1}
                  type="time"
                  label="Start Time"
                  value={newSlotData.startTime}
                  onChange={(e) => setNewSlotData(prev => ({ ...prev, startTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  flex={1}
                  type="time"
                  label="End Time"
                  value={newSlotData.endTime}
                  onChange={(e) => setNewSlotData(prev => ({ ...prev, endTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setAvailabilityModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAvailability}
              disabled={!newSlotData.title || !newSlotData.date || !newSlotData.startTime || !newSlotData.endTime}
            >
              Save Slot
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Booking Details Dialog */}
      <Dialog
        open={bookingDetailOpen}
        onClose={() => setBookingDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Appointment Details
        </DialogTitle>
        
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {selectedBooking.clientName?.charAt(0)?.toUpperCase() || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedBooking.clientName || 'Client'}
                      </Typography>
                      <Chip
                        label={selectedBooking.status}
                        color={getStatusColor(selectedBooking.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedBooking.appointmentDate)}
                  </Typography>
                  <Typography variant="body1">
                    {selectedBooking.appointmentTime}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {selectedBooking.duration || 60} minutes
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    Session Type
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getSessionTypeIcon(selectedBooking.sessionType)}
                    <Typography variant="body1">
                      {selectedBooking.sessionType?.replace('_', ' ') || 'Video Call'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    Amount
                  </Typography>
                  <Typography variant="body1">
                    ₹{selectedBooking.amount || 0}
                  </Typography>
                </Grid>

                {selectedBooking.clientEmail && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Contact Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Email sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {selectedBooking.clientEmail}
                      </Typography>
                    </Box>
                    {selectedBooking.clientPhone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          {selectedBooking.clientPhone}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                )}

                {selectedBooking.reasonForBooking && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Reason for Booking
                    </Typography>
                    <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                      <Typography variant="body2">
                        {selectedBooking.reasonForBooking}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {selectedBooking.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                      Notes
                    </Typography>
                    <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                      <Typography variant="body2">
                        {selectedBooking.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setBookingDetailOpen(false)}>
            Close
          </Button>
          {selectedBooking?.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleDeclineAppointment(selectedBooking.id);
                  setBookingDetailOpen(false);
                }}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleAcceptAppointment(selectedBooking.id);
                  setBookingDetailOpen(false);
                }}
              >
                Accept
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfessionalDashboard;