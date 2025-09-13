// src/pages/Booking/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  useTheme,
  alpha,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { CalendarToday, Schedule, VideoCall, Phone, LocationOn, Star, Verified, AttachMoney, Person, Payment } from '@mui/icons-material';
import { getProfessionalById } from '../../services/userService';
import { createBooking } from '../../services/bookingService';

const MotionCard = motion(Card);
const steps = ['Select Date & Time', 'Session Type', 'Personal Details', 'Payment'];

// ... (sessionTypes constant remains the same)

const BookingForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { professionalId } = useParams();
  
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    // ... (bookingData state remains the same)
  });

  useEffect(() => {
    const fetchProfessional = async () => {
      if (!professionalId) {
        setError('No professional selected.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const result = await getProfessionalById(professionalId);
        if (result.success) {
          setProfessional(result.professional);
        } else {
          setError(result.error || 'Could not find professional.');
        }
      } catch (err) {
        setError('An error occurred while fetching professional details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, [professionalId]);
  
  // ... (handleChange, handleNext, handleBack, validateStep functions remain the same)

  const handleBooking = async () => {
    // ... (logic now uses createBooking from bookingService)
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* ... (The rest of the JSX remains the same, but now uses the dynamic `professional` state object) */}
      </Container>
    </Box>
  );
};

export default BookingForm;