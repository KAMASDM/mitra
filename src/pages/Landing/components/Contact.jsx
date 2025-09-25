// src/pages/Landing/components/Contact.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  useTheme,
  alpha,
  Stack,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
  Send,
  Support,
  ArrowForward,
} from '@mui/icons-material';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const contactInfo = [
  {
    icon: <Email />,
    title: 'Email Us',
    description: 'Get in touch via email',
    contact: 'hello@sweekar.com',
    color: '#5C4033',
  },
  {
    icon: <Phone />,
    title: 'Call Us',
    description: 'Speak with our team',
    contact: '+91 9876543210',
    color: '#5C4033',
  },
  {
    icon: <LocationOn />,
    title: 'Visit Us',
    description: 'Our office location',
    contact: 'Mumbai, Maharashtra',
    color: '#5C4033',
  },
  {
    icon: <Schedule />,
    title: 'Office Hours',
    description: 'We\'re available',
    contact: 'Mon-Fri: 9AM-6PM IST',
    color: '#5C4033',
  },
];

const ContactSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        // py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Typography
            variant="h2"
            component="h2"
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
            Have questions? We're here to help! Reach out to us and we'll get back to you
            as soon as possible.
          </Typography>
        </MotionBox>

        {/* Contact Info Cards */}
        <Grid container spacing={4} sx={{ mb: 8, justifyContent: 'center' }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: `2px solid ${alpha(info.color, 0.1)}`,
                  '&:hover': {
                    borderColor: info.color,
                    boxShadow: `0 15px 35px ${alpha(info.color, 0.2)}`,
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
                      background: alpha(info.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      color: info.color,
                    }}
                  >
                    {info.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    {info.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                    }}
                  >
                    {info.description}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: info.color,
                    }}
                  >
                    {info.contact}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Contact Form and CTA */}
        <Grid container spacing={6} justifyContent="center">
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <MotionCard
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              sx={{ borderRadius: 3 }}
            >
              <CardContent sx={{ p: 6 }}>
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 2,
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
                  Whether you have questions about our services, need technical support,
                  or want to provide feedback, we'd love to hear from you.
                </Typography>

                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you for your message! We'll get back to you soon.
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          name="name"
                          label="Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          name="email"
                          label="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      name="message"
                      label="Your Message"
                      multiline
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us how we can help you..."
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      endIcon={<Send />}
                      sx={{
                        alignSelf: 'flex-start',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Quick Actions Sidebar */}
          <Grid container spacing={2}>
            {/* Card 1 */}
            <Grid item size={{ xs: 12, md: 4 }}>
              <MotionCard
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                sx={{
                  borderRadius: 3, height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Support sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                    Ready to Get Started?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                    Join thousands of people who have found the right professional support
                    through our platform.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register')}
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
                  >
                    Sign Up Now
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Card 2 */}
            <Grid item size={{ xs: 12, md: 4 }}>
              <MotionCard
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                sx={{ borderRadius: 3, height: '100%' }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                    Browse Professionals
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Explore our directory of verified professionals and find the right fit for your needs.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/experts')}
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
                  >
                    View Professionals
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Card 3 */}
            <Grid item size={{ xs: 12, md: 4 }}>
              <MotionCard
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                sx={{
                  borderRadius: 3, height: '100%',
                  background: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mb: 2 }}>
                    Need Immediate Help?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                    If you're experiencing a crisis or emergency, please reach out to these resources immediately:
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Emergency: 102
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Crisis Helpline: 1800-123-4567
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>

        </Grid>

        {/* Final CTA */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          sx={{
            mt: 10,
            p: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
            }}
          >
            Your Journey Starts Here
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Take the first step towards getting the professional support you deserve.
            Safe, inclusive, and judgment-free care is just a click away.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.9),
                },
              }}
            >
              Get Started Today
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/services')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: alpha('#ffffff', 0.1),
                },
              }}
            >
              Learn More
            </Button>
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default ContactSection;