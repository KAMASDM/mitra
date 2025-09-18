// src/pages/Services/Services.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Psychology,
  Gavel,
  LocalHospital,
  Work,
  School,
  Home,
  SupportAgent,
  AccountBalance,
} from '@mui/icons-material';

const MotionCard = motion(Card);

const services = [
  {
    id: 1,
    title: 'Mental Health Services',
    description: 'Professional counseling and therapy services with LGBTQAI+ and women-friendly therapists.',
    icon: <Psychology />,
    color: '#9D84B7',
    features: ['Individual Therapy', 'Group Sessions', 'Crisis Support', 'Online Counseling'],
    price: 'Starting from ₹1,500/session'
  },
  {
    id: 2,
    title: 'Legal Aid Services',
    description: 'Legal consultation and support for rights protection, discrimination cases, and family matters.',
    icon: <Gavel />,
    color: '#F4A259',
    features: ['Legal Consultation', 'Document Assistance', 'Court Representation', 'Rights Advocacy'],
    price: 'Starting from ₹2,000/consultation'
  },
  {
    id: 3,
    title: 'Medical Services',
    description: 'Inclusive healthcare services with understanding and specialized medical professionals.',
    icon: <LocalHospital />,
    color: '#4DAA57',
    features: ['General Medicine', 'Specialized Care', 'Health Checkups', 'Hormone Therapy Guidance'],
    price: 'Starting from ₹800/consultation'
  },
  {
    id: 4,
    title: 'Career & Placement',
    description: 'Professional career guidance, skill development, and job placement assistance.',
    icon: <Work />,
    color: '#5899E2',
    features: ['Career Counseling', 'Skill Development', 'Job Placement', 'Interview Preparation'],
    price: 'Starting from ₹1,200/session'
  },
  {
    id: 5,
    title: 'Educational Support',
    description: 'Academic guidance, scholarship assistance, and educational counseling services.',
    icon: <School />,
    color: '#8E44AD',
    features: ['Academic Counseling', 'Scholarship Guidance', 'Course Selection', 'Educational Planning'],
    price: 'Starting from ₹1,000/session'
  },
  {
    id: 6,
    title: 'Housing Assistance',
    description: 'Safe housing options, rental assistance, and accommodation support services.',
    icon: <Home />,
    color: '#E74C3C',
    features: ['Housing Search', 'Rental Assistance', 'Legal Guidance', 'Safe Accommodation'],
    price: 'Starting from ₹500/consultation'
  },
  {
    id: 7,
    title: 'Support Groups',
    description: 'Community support groups and peer counseling for emotional and social support.',
    icon: <SupportAgent />,
    color: '#16A085',
    features: ['Peer Support', 'Group Therapy', 'Community Events', 'Mentorship Programs'],
    price: 'Starting from ₹300/session'
  },
  {
    id: 8,
    title: 'Financial Guidance',
    description: 'Financial planning, investment advice, and loan assistance services.',
    icon: <AccountBalance />,
    color: '#F39C12',
    features: ['Financial Planning', 'Investment Advice', 'Loan Assistance', 'Budgeting Help'],
    price: 'Starting from ₹1,500/consultation'
  },
];

const Services = () => {
  const theme = useTheme();
  const navigate = useNavigate();

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
            Our Services
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
            Comprehensive professional services designed specifically for LGBTQAI+ community
            and women, ensuring safe, inclusive, and judgment-free support.
          </Typography>
        </Box>

        {/* Services Grid */}
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item  key={service.id} size={{xs:12, sm:6, lg:4}}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `2px solid ${alpha(service.color, 0.1)}`,
                  '&:hover': {
                    borderColor: service.color,
                    boxShadow: `0 15px 35px ${alpha(service.color, 0.2)}`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
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
                    variant="h5"
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
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      mb: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    {service.description}
                  </Typography>

                  {/* Features */}
                  <Box sx={{ mb: 3 }}>
                    {service.features.map((feature, idx) => (
                      <Chip
                        key={idx}
                        label={feature}
                        size="small"
                        sx={{
                          mr: 1,
                          mb: 1,
                          bgcolor: alpha(service.color, 0.1),
                          color: service.color,
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Box>

                  {/* Price */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: service.color,
                      mb: 2,
                    }}
                  >
                    {service.price}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/experts')}
                    sx={{
                      bgcolor: service.color,
                      '&:hover': {
                        bgcolor: service.color,
                        filter: 'brightness(0.9)',
                      },
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    Find Professionals
                  </Button>
                </CardActions>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action Section */}
        <Box
          sx={{
            mt: 10,
            p: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
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
            towards getting the support you deserve.
          </Typography>
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
            Browse All Professionals
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Services;