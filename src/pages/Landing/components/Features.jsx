// src/pages/Landing/components/Features.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Security,
  VerifiedUser,
  Schedule,
  VideoCall,
  Phone,
  LocationOn,
  Star,
  Support,
  Language,
  AccessTime,
  CheckCircle,
  Diversity3,
} from '@mui/icons-material';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const platformFeatures = [
  {
    icon: <Security />,
    title: 'End-to-End Security',
    description: 'All your conversations and data are encrypted and completely confidential. Your privacy is our top priority.',
    color: '#9D84B7',
  },
  {
    icon: <VerifiedUser />,
    title: 'Verified Professionals',
    description: 'Every professional is thoroughly vetted, licensed, and trained in inclusive care practices.',
    color: '#F4A259',
  },
  {
    icon: <Schedule />,
    title: 'Flexible Scheduling',
    description: 'Book appointments that fit your schedule with easy rescheduling and cancellation options.',
    color: '#4DAA57',
  },
  {
    icon: <Support />,
    title: '24/7 Support',
    description: 'Our dedicated support team is always available to help you with any questions or concerns.',
    color: '#5899E2',
  },
];

const sessionTypes = [
  {
    icon: <VideoCall />,
    title: 'Video Sessions',
    description: 'Face-to-face consultations from the comfort of your home',
    features: ['HD Video Quality', 'Screen Sharing', 'Recording Options', 'Multi-device Support'],
    color: '#9D84B7',
  },
  {
    icon: <Phone />,
    title: 'Phone Consultations',
    description: 'Voice-only sessions for maximum privacy and convenience',
    features: ['Crystal Clear Audio', 'Anonymous Options', 'Call Recording', 'Mobile Friendly'],
    color: '#F4A259',
  },
  {
    icon: <LocationOn />,
    title: 'In-Person Meetings',
    description: 'Traditional face-to-face sessions at professional clinics',
    features: ['Safe Locations', 'Verified Venues', 'Accessibility Options', 'Parking Available'],
    color: '#4DAA57',
  },
];

const qualityFeatures = [
  'Licensed & Certified Professionals',
  'LGBTQAI+ Affirmative Care',
  'Cultural Competency Training',
  'Regular Quality Assessments',
  'Client Feedback Integration',
  'Continuing Education Requirements',
];

const FeaturesSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="xl">
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
            Platform Features
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Discover why thousands trust SWEEKAR for their professional service needs. 
            Our platform is designed with your safety, privacy, and convenience in mind.
          </Typography>
        </MotionBox>

        {/* Platform Features */}
        <Grid container spacing={4} sx={{ mb: 10 }}>
          {platformFeatures.map((feature, index) => (
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
                  border: `2px solid ${alpha(feature.color, 0.1)}`,
                  '&:hover': {
                    borderColor: feature.color,
                    boxShadow: `0 15px 35px ${alpha(feature.color, 0.2)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: alpha(feature.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Session Types */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          sx={{ mb: 10 }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              textAlign: 'center',
              mb: 6,
            }}
          >
            Multiple Session Options
          </Typography>
          
          <Grid container spacing={4}>
            {sessionTypes.map((session, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ scale: 1.03 }}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${alpha(session.color, 0.05)}, ${alpha(session.color, 0.1)})`,
                    border: `1px solid ${alpha(session.color, 0.2)}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: alpha(session.color, 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: session.color,
                          mr: 3,
                        }}
                      >
                        {session.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            mb: 1,
                          }}
                        >
                          {session.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          {session.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={1}>
                      {session.features.map((feature, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <CheckCircle
                            sx={{
                              fontSize: '1rem',
                              color: session.color,
                              mr: 2,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </MotionBox>

        {/* Quality Assurance */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          sx={{ mb: 10 }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  mb: 3,
                }}
              >
                Quality You Can Trust
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                }}
              >
                We maintain the highest standards of professional quality through rigorous 
                vetting processes and ongoing quality assurance programs. Every professional 
                on our platform is committed to providing inclusive, respectful care.
              </Typography>

              <Grid container spacing={2}>
                {qualityFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star
                        sx={{
                          fontSize: '1.2rem',
                          color: 'warning.main',
                          mr: 2,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        {feature}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: 400,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.8)}, ${alpha(theme.palette.info.main, 0.8)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <Diversity3 sx={{ fontSize: '5rem', mb: 3 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Inclusive Excellence
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                    Where diversity meets quality care
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Our professionals are trained to understand and celebrate the unique 
                    experiences of every individual they serve.
                  </Typography>
                </Box>
                
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: alpha('#ffffff', 0.1),
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: alpha('#ffffff', 0.1),
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </MotionBox>

        {/* Additional Features */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          sx={{
            p: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              textAlign: 'center',
              mb: 6,
            }}
          >
            More Features
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Language sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Multi-Language Support
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Communicate in your preferred language with native speakers
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <AccessTime sx={{ fontSize: '3rem', color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Instant Booking
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Book appointments instantly with real-time availability
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Star sx={{ fontSize: '3rem', color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Rating System
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Transparent ratings and reviews from verified clients
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Support sx={{ fontSize: '3rem', color: 'success.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Crisis Support
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Emergency support resources available 24/7
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
              }}
            >
              Get Started Today
            </Button>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default FeaturesSection;