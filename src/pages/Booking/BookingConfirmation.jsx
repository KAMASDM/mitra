// src/pages/Booking/BookingConfirmation.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Stack,
  Divider,
  Chip,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  CalendarToday,
  Schedule,
  VideoCall,
  Phone,
  LocationOn,
  Download,
  Share,
  Home,
  Chat,
  Star,
} from '@mui/icons-material';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

// Mock booking data
const bookingDetails = {
  id: 'BK1726234567890',
  professional: {
    name: 'Dr. Priya Sharma',
    profession: 'Clinical Psychologist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    phone: '+91 9876543210',
    email: 'priya.sharma@sweekar.com',
  },
  appointment: {
    date: '2025-09-15',
    time: '10:00 AM',
    duration: '60 minutes',
    type: 'Video Call',
    status: 'Confirmed',
  },
  client: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+91 9876543211',
  },
  payment: {
    amount: 2000,
    method: 'Credit Card',
    transactionId: 'TXN123456789',
    status: 'Completed',
  },
  meetingLink: 'https://meet.sweekar.com/room/bk1726234567890',
};

const BookingConfirmation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'Video Call':
        return <VideoCall />;
      case 'Phone Call':
        return <Phone />;
      case 'In-Person':
        return <LocationOn />;
      default:
        return <CalendarToday />;
    }
  };

  const handleDownloadReceipt = () => {
    // Simulate download
    console.log('Downloading receipt...');
  };

  const handleShareBooking = () => {
    // Simulate sharing
    if (navigator.share) {
      navigator.share({
        title: 'SWEEKAR Appointment Confirmation',
        text: `Appointment confirmed with ${bookingDetails.professional.name} on ${formatDate(bookingDetails.appointment.date)}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Booking link copied to clipboard!');
    }
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md">
        {/* Success Animation */}
        <MotionBox
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          sx={{ textAlign: 'center', mb: 6 }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: '4rem', color: 'success.main' }} />
          </Box>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              mb: 2,
            }}
          >
            Booking Confirmed! 🎉
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '500px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Your appointment has been successfully booked. We've sent a confirmation email 
            with all the details.
          </Typography>
        </MotionBox>

        {/* Booking Details Card */}
        <MotionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          sx={{ borderRadius: 3, mb: 4 }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Appointment Details
            </Typography>

            {/* Professional Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                src={bookingDetails.professional.image}
                sx={{ width: 80, height: 80, mr: 3 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {bookingDetails.professional.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
                  {bookingDetails.professional.profession}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {bookingDetails.professional.rating}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={bookingDetails.appointment.status}
                color="success"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Appointment Info */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Date & Time
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {formatDate(bookingDetails.appointment.date)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {bookingDetails.appointment.time} ({bookingDetails.appointment.duration})
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getSessionTypeIcon(bookingDetails.appointment.type)}
                    <Typography variant="h6" sx={{ fontWeight: 600, ml: 2 }}>
                      Session Type
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {bookingDetails.appointment.type}
                  </Typography>
                  {bookingDetails.appointment.type === 'Video Call' && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Link will be shared 30 minutes before
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Booking Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Booking ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {bookingDetails.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Client Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {bookingDetails.client.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Contact Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {bookingDetails.client.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Contact Phone
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {bookingDetails.client.phone}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </MotionCard>

        {/* Payment Details */}
        <MotionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          sx={{ borderRadius: 3, mb: 4 }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Payment Summary
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Session Fee:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₹{bookingDetails.payment.amount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Platform Fee:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₹0
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total Paid:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ₹{bookingDetails.payment.amount}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Payment Method
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {bookingDetails.payment.method}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Transaction ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {bookingDetails.payment.transactionId}
                  </Typography>

                  <Chip
                    label={`Payment ${bookingDetails.payment.status}`}
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </MotionCard>

        {/* Action Buttons */}
        <MotionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          sx={{ borderRadius: 3 }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              What's Next?
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 2,
                  }}
                >
                  <Schedule sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Session Reminder
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    You'll receive email and SMS reminders 24 hours and 1 hour before your session.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    borderRadius: 2,
                  }}
                >
                  <Chat sx={{ fontSize: '3rem', color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Pre-Session Prep
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Prepare any questions or topics you'd like to discuss during your session.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mt: 4, justifyContent: 'center' }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Home />}
                onClick={() => navigate('/client/dashboard')}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Go to Dashboard
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<Download />}
                onClick={handleDownloadReceipt}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Download Receipt
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<Share />}
                onClick={handleShareBooking}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Share Booking
              </Button>
            </Stack>
          </CardContent>
        </MotionCard>

        {/* Important Notes */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
            Important Notes
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • You can reschedule or cancel your appointment up to 24 hours in advance
            </Typography>
            <Typography variant="body2">
              • For video calls, ensure you have a stable internet connection
            </Typography>
            <Typography variant="body2">
              • Join the session 5 minutes early to test your audio/video
            </Typography>
            <Typography variant="body2">
              • All sessions are confidential and secure
            </Typography>
            <Typography variant="body2">
              • If you need to cancel last minute due to emergency, please call our support line
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default BookingConfirmation;