// src/pages/Contact/Contact.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
  Send,
  Support,
  QuestionAnswer,
  BugReport,
} from '@mui/icons-material';

const MotionCard = motion(Card);

const contactMethods = [
  {
    icon: <Email />,
    title: 'Email Us',
    description: 'Send us an email and we\'ll respond within 24 hours',
    contact: 'support@sweekar.com',
    color: '#9D84B7',
  },
  {
    icon: <Phone />,
    title: 'Call Us',
    description: 'Speak directly with our support team',
    contact: '+91 9876543210',
    color: '#F4A259',
  },
  {
    icon: <LocationOn />,
    title: 'Visit Us',
    description: 'Come visit our office for in-person support',
    contact: 'Mumbai, Maharashtra, India',
    color: '#4DAA57',
  },
  {
    icon: <Schedule />,
    title: 'Office Hours',
    description: 'We\'re available during business hours',
    contact: 'Mon-Fri: 9AM-6PM IST',
    color: '#5899E2',
  },
];

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry', icon: <QuestionAnswer /> },
  { value: 'support', label: 'Technical Support', icon: <Support /> },
  { value: 'professional', label: 'Professional Services', icon: <Phone /> },
  { value: 'partnership', label: 'Partnership', icon: <Email /> },
  { value: 'feedback', label: 'Feedback', icon: <Send /> },
  { value: 'bug', label: 'Report a Bug', icon: <BugReport /> },
];

const Contact = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    inquiryType: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        inquiryType: '',
        message: '',
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              mb: 2,
            }}
          >
            Get in Touch
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            We're here to help! Reach out to us for any questions, support, or feedback.
            Our team is committed to providing you with the best possible experience.
          </Typography>
        </Box>

        {/* Contact Methods */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {contactMethods.map((method, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `2px solid ${alpha(method.color, 0.1)}`,
                  '&:hover': {
                    borderColor: method.color,
                    boxShadow: `0 10px 25px ${alpha(method.color, 0.2)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: alpha(method.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      color: method.color,
                    }}
                  >
                    {method.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {method.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      lineHeight: 1.6,
                    }}
                  >
                    {method.description}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: method.color,
                    }}
                  >
                    {method.contact}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} lg={8}>
            <MotionCard
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 6 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Send us a Message
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    mb: 4,
                    lineHeight: 1.6,
                  }}
                >
                  Fill out the form below and we'll get back to you as soon as possible.
                </Typography>

                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you for your message! We'll get back to you within 24 hours.
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="email"
                        type="email"
                        label="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Inquiry Type</InputLabel>
                        <Select
                          name="inquiryType"
                          value={formData.inquiryType}
                          label="Inquiry Type"
                          onChange={handleChange}
                        >
                          {inquiryTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {type.icon}
                                {type.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="subject"
                        label="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="message"
                        label="Message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Please describe your inquiry in detail..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        endIcon={<Send />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: 3,
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* FAQ Section */}
          <Grid item xs={12} lg={4}>
            <MotionCard
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              sx={{ borderRadius: 3, mb: 4 }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 3,
                  }}
                >
                  Frequently Asked Questions
                </Typography>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      How do I book an appointment?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      You can browse our professionals and book directly through their profiles, 
                      or contact us for personalized recommendations.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      Is my information secure?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      Yes, we use industry-standard encryption and follow strict privacy policies 
                      to protect your personal information.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      What if I need to cancel?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      You can cancel appointments up to 24 hours in advance through your dashboard 
                      or by contacting our support team.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      Do you offer emergency support?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      For mental health emergencies, please contact local emergency services. 
                      We provide crisis resources and can connect you with immediate support.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>

            {/* Emergency Contact */}
            <MotionCard
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              sx={{
                borderRadius: 3,
                background: alpha(theme.palette.error.main, 0.1),
                border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'error.main',
                    mb: 2,
                  }}
                >
                  Crisis Support
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  If you're experiencing a mental health emergency, please reach out immediately:
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Emergency: 102
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Crisis Helpline: 1800-123-4567
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;