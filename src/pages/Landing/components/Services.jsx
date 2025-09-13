// src/pages/Landing/components/Services.jsx
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
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Psychology,
  Gavel,
  LocalHospital,
  Work,
  School,
  Home,
  SupportAgent,
  AccountBalance,
  ArrowForward,
} from '@mui/icons-material';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const services = [
  {
    icon: <Psychology />,
    title: 'Mental Health Services',
    description: 'Professional counseling and therapy with LGBTQAI+ and women-friendly therapists specializing in identity, relationships, and mental wellness.',
    features: ['Individual Therapy', 'Group Sessions', 'Crisis Support', 'Online Counseling'],
    color: '#9D84B7',
    popular: true,
  },
  {
    icon: <Gavel />,
    title: 'Legal Aid Services',
    description: 'Expert legal consultation for rights protection, discrimination cases, family matters, and workplace issues.',
    features: ['Legal Consultation', 'Document Assistance', 'Court Representation', 'Rights Advocacy'],
    color: '#F4A259',
  },
  {
    icon: <LocalHospital />,
    title: 'Medical Services',
    description: 'Inclusive healthcare with understanding medical professionals who provide specialized and general care.',
    features: ['General Medicine', 'Specialized Care', 'Health Checkups', 'Hormone Therapy Guidance'],
    color: '#4DAA57',
  },
  {
    icon: <Work />,
    title: 'Career & Placement',
    description: 'Professional career guidance, skill development, and job placement assistance in inclusive workplaces.',
    features: ['Career Counseling', 'Skill Development', 'Job Placement', 'Interview Preparation'],
    color: '#5899E2',
  },
  {
    icon: <School />,
    title: 'Educational Support',
    description: 'Academic guidance, scholarship assistance, and educational counseling for all levels of learning.',
    features: ['Academic Counseling', 'Scholarship Guidance', 'Course Selection', 'Educational Planning'],
    color: '#8E44AD',
  },
  {
    icon: <Home />,
    title: 'Housing Assistance',
    description: 'Safe housing options, rental assistance, and accommodation support services for secure living.',
    features: ['Housing Search', 'Rental Assistance', 'Legal Guidance', 'Safe Accommodation'],
    color: '#E74C3C',
  },
  {
    icon: <SupportAgent />,
    title: 'Support Groups',
    description: 'Community support groups and peer counseling for emotional and social support in a safe environment.',
    features: ['Peer Support', 'Group Therapy', 'Community Events', 'Mentorship Programs'],
    color: '#16A085',
  },
  {
    icon: <AccountBalance />,
    title: 'Financial Guidance',
    description: 'Financial planning, investment advice, and loan assistance to secure your financial future.',
    features: ['Financial Planning', 'Investment Advice', 'Loan Assistance', 'Budgeting Help'],
    color: '#F39C12',
  },
];

const ServicesSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
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
            Comprehensive Services
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
            From mental health support to legal guidance, we offer a wide range of professional 
            services designed specifically for the LGBTQAI+ community and women.
          </Typography>
        </MotionBox>

        {/* Services Grid */}
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: `2px solid ${alpha(service.color, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: service.color,
                    boxShadow: `0 15px 35px ${alpha(service.color, 0.2)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Popular Badge */}
                {service.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'error.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      zIndex: 1,
                    }}
                  >
                    Most Popular
                  </Box>
                )}

                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Service Icon */}
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: alpha(service.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      color: service.color,
                    }}
                  >
                    {service.icon}
                  </Box>

                  {/* Service Title */}
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    {service.title}
                  </Typography>

                  {/* Service Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 3,
                      lineHeight: 1.6,
                      flexGrow: 1,
                    }}
                  >
                    {service.description}
                  </Typography>

                  {/* Features List */}
                  <Box sx={{ mb: 3 }}>
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: service.color,
                            mr: 2,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.85rem',
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                    {service.features.length > 3 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: service.color,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          ml: 2,
                        }}
                      >
                        +{service.features.length - 3} more
                      </Typography>
                    )}
                  </Box>

                  {/* CTA Button */}
                  <Button
                    variant="outlined"
                    fullWidth
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/services')}
                    sx={{
                      borderColor: service.color,
                      color: service.color,
                      '&:hover': {
                        borderColor: service.color,
                        bgcolor: alpha(service.color, 0.1),
                      },
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          sx={{
            mt: 10,
            p: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              mb: 2,
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Connect with our verified professionals today and take the first step 
            towards getting the support you deserve in a safe, inclusive environment.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/experts')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
              }}
            >
              Find Professionals
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/services')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
              }}
            >
              View All Services
            </Button>
          </Box>
        </MotionBox>

        {/* Service Categories Overview */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          sx={{ mt: 10 }}
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
            How It Works
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  1
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Browse Professionals
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Search through our curated list of verified professionals who understand your needs.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: alpha(theme.palette.secondary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'secondary.main',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  2
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Book Your Session
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Choose your preferred time, session type, and book instantly with secure payment.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'success.main',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  3
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Get Support
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Attend your session and receive the professional support you need in a safe space.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default ServicesSection;