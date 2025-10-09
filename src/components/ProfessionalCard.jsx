// src/components/ProfessionalCard.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Star,
  LocationOn,
  Schedule,
  VideoCall,
  Phone,
  Person,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getAvailableSlots, createBookingWithClientDetails } from '../services/bookingService';

const MotionCard = motion(Card);

const ProfessionalCard = ({ professional, onBookingSuccess }) => {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Date/Time, 2: Client Details, 3: Confirmation
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [clientDetails, setClientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    reasonForBooking: '',
    sessionType: 'video_call'
  });

  // Get next 7 days for date selection
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return days;
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setLoading(true);
    setError('');

    try {
      const result = await getAvailableSlots(professional.id, date);
      if (result.success) {
        setAvailableSlots(result.availableSlots);
      } else {
        setError(result.error || 'Failed to load available slots');
        setAvailableSlots([]);
      }
    } catch (err) {
      setError('Error loading slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleClientDetailsChange = (field, value) => {
    setClientDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    if (!clientDetails.name || !clientDetails.email) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        professionalId: professional.id,
        appointmentDate: selectedSlot.startTime,
        appointmentTime: selectedSlot.startTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        duration: Math.round((selectedSlot.endTime - selectedSlot.startTime) / (1000 * 60)),
        sessionType: clientDetails.sessionType,
        amount: professional.hourly_rate || 0,
        slotId: selectedSlot.id
      };

      const result = await createBookingWithClientDetails(bookingData, clientDetails);
      
      if (result.success) {
        setSuccess('Booking created successfully!');
        setBookingStep(3);
        if (onBookingSuccess) {
          onBookingSuccess(result.bookingId);
        }
      } else {
        setError(result.error || 'Failed to create booking');
      }
    } catch (err) {
      setError('Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  const resetBookingDialog = () => {
    setBookingDialogOpen(false);
    setBookingStep(1);
    setSelectedDate('');
    setSelectedSlot(null);
    setAvailableSlots([]);
    setClientDetails({
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      reasonForBooking: '',
      sessionType: 'video_call'
    });
    setError('');
    setSuccess('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <MotionCard
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        sx={{
          height: '100%',
          cursor: 'pointer',
          borderRadius: 3,
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={professional.profile_picture || professional.photoURL}
              sx={{ width: 60, height: 60, mr: 2 }}
            >
              {professional.displayName?.charAt(0) || professional.first_name?.charAt(0) || 'P'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Dr. {professional.displayName || `${professional.first_name || ''} ${professional.last_name || ''}`.trim()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {professional.specialization || 'Professional'}
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Star sx={{ color: 'warning.main', mr: 0.5, fontSize: 16 }} />
              <Typography variant="body2">
                {professional.average_rating || '4.5'} ({professional.total_reviews || '0'} reviews)
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary">
                {professional.location || 'Location not specified'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary">
                {professional.years_of_experience || '0'}+ years experience
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary">
              ₹{professional.hourly_rate || '0'}/hour
            </Typography>
            <Chip
              label={professional.verification_status || 'VERIFIED'}
              color="success"
              size="small"
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setBookingDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Book Appointment
          </Button>
        </CardContent>
      </MotionCard>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={resetBookingDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Book Appointment with Dr. {professional.displayName || `${professional.first_name || ''} ${professional.last_name || ''}`.trim()}
        </DialogTitle>
        
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {bookingStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Date & Time
              </Typography>
              
              {/* Google Calendar Style Date Navigation */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Select a Date'}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button size="small" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                    Today
                  </Button>
                </Box>
              </Box>

              {/* Calendar Date Grid */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  {getNext7Days().map((day) => (
                    <Grid item xs key={day.date}>
                      <Button
                        fullWidth
                        variant={selectedDate === day.date ? "contained" : "outlined"}
                        onClick={() => handleDateChange(day.date)}
                        sx={{
                          minHeight: 60,
                          display: 'flex',
                          flexDirection: 'column',
                          p: 1,
                          borderRadius: 2,
                          textTransform: 'none'
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          {day.label.split(' ')[0]}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                          {day.label.split(' ')[2]}
                        </Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {selectedDate && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
                    <CalendarToday sx={{ mr: 1, fontSize: 20 }} />
                    Available Time Slots
                  </Typography>
                  
                  {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : availableSlots.length > 0 ? (
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      <Stack spacing={1}>
                        {availableSlots.map((slot) => (
                          <Box
                            key={slot.id}
                            component="button"
                            onClick={() => handleSlotSelect(slot)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 2,
                              border: selectedSlot?.id === slot.id ? 2 : 1,
                              borderColor: selectedSlot?.id === slot.id ? 'primary.main' : 'divider',
                              borderRadius: 2,
                              bgcolor: selectedSlot?.id === slot.id ? 'primary.light' : 'background.paper',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: selectedSlot?.id === slot.id ? 'primary.light' : 'action.hover',
                                borderColor: 'primary.main'
                              }
                            }}
                          >
                            <Box display="flex" alignItems="center">
                              <AccessTime sx={{ 
                                mr: 2, 
                                color: selectedSlot?.id === slot.id ? 'primary.main' : 'text.secondary' 
                              }} />
                              <Box textAlign="left">
                                <Typography variant="body1" fontWeight="medium">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {slot.duration || 60} minutes • {slot.sessionType || 'Video Call'}
                                </Typography>
                              </Box>
                            </Box>
                            {selectedSlot?.id === slot.id && (
                              <Chip
                                label="Selected"
                                size="small"
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: 'info.light',
                        '& .MuiAlert-message': { color: 'info.contrastText' }
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <CalendarToday sx={{ mr: 1 }} />
                        No available slots for selected date. Please choose another date.
                      </Box>
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          )}

          {bookingStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Client Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={clientDetails.name}
                    onChange={(e) => handleClientDetailsChange('name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={clientDetails.email}
                    onChange={(e) => handleClientDetailsChange('email', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={clientDetails.phone}
                    onChange={(e) => handleClientDetailsChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={clientDetails.age}
                    onChange={(e) => handleClientDetailsChange('age', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={clientDetails.gender}
                      onChange={(e) => handleClientDetailsChange('gender', e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                      <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Session Type
                  </Typography>
                  <RadioGroup
                    value={clientDetails.sessionType}
                    onChange={(e) => handleClientDetailsChange('sessionType', e.target.value)}
                    row
                  >
                    <FormControlLabel
                      value="video_call"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center">
                          <VideoCall sx={{ mr: 1 }} />
                          Video Call
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="phone_call"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center">
                          <Phone sx={{ mr: 1 }} />
                          Phone Call
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="in_person"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center">
                          <Person sx={{ mr: 1 }} />
                          In Person
                        </Box>
                      }
                    />
                  </RadioGroup>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason for Booking"
                    value={clientDetails.reasonForBooking}
                    onChange={(e) => handleClientDetailsChange('reasonForBooking', e.target.value)}
                    placeholder="Please describe briefly why you need this consultation..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {bookingStep === 3 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h5" color="success.main" gutterBottom>
                Booking Confirmed!
              </Typography>
              <Typography variant="body1" gutterBottom>
                Your appointment has been successfully booked.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You will receive a confirmation email shortly.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {bookingStep === 1 && (
            <>
              <Button onClick={resetBookingDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => setBookingStep(2)}
                disabled={!selectedSlot}
              >
                Continue
              </Button>
            </>
          )}
          
          {bookingStep === 2 && (
            <>
              <Button onClick={() => setBookingStep(1)}>Back</Button>
              <Button
                variant="contained"
                onClick={handleBookingSubmit}
                disabled={loading || !clientDetails.name || !clientDetails.email}
              >
                {loading ? <CircularProgress size={20} /> : 'Confirm Booking'}
              </Button>
            </>
          )}

          {bookingStep === 3 && (
            <Button variant="contained" onClick={resetBookingDialog}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfessionalCard;