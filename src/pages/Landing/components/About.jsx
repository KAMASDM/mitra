// src/pages/Landing/components/About.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Security,
  Diversity3,
  VerifiedUser,
  SupportAgent,
  Psychology,
  Balance,
} from '@mui/icons-material';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const values = [
  {
    icon: <Security />,
    title: 'Safe & Secure',
    description: 'Your privacy and security are our top priorities. All communications are encrypted and confidential.',
    color: '#9D84B7',
  },
  {
    icon: <Diversity3 />,
    title: 'Inclusive Community',
    description: 'We celebrate diversity and create a welcoming space for everyone, regardless of identity or background.',
    color: '#F4A259',
  },
  {
    icon: <VerifiedUser />,
    title: 'Verified Professionals',
    description: 'All our professionals are thoroughly vetted, licensed, and trained in inclusive care practices.',
    color: '#4DAA57',
  },
  {
    icon: <SupportAgent />,
    title: '24/7 Support',
    description: 'Our support team is always available to help you find the right professional and get the care you need.',
    color: '#5899E2',
  },
];

const stats = [
  { number: '500+', label: 'Verified Professionals' },
  { number: '10,000+', label: 'Successful Sessions' },
  { number: '8,500+', label: 'Happy Clients' },
  { number: '95%', label: 'Satisfaction Rate' },
];

const About = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
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
            About SWEEKAR
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
            SWEEKAR (स्वीकार) means "acceptance" in Hindi. We're building a platform that truly accepts
            and supports everyone, providing safe, inclusive professional services for the LGBTQAI+
            community and women.
          </Typography>
        </MotionBox>

        {/* Mission Statement */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          sx={{ mb: 10 }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 250,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <Psychology sx={{ fontSize: '4rem', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Our Mission
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Breaking barriers, building bridges
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
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                component="h3"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 3,
                }}
              >
                Creating Safe Spaces for Everyone
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                }}
              >
                We understand that finding the right professional who truly understands your unique
                experiences can be challenging. That's why we've created SWEEKAR - a platform that
                connects you with verified professionals who are not just qualified, but also
                committed to providing inclusive, judgment-free care.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                }}
              >
                Whether you're seeking mental health support, legal guidance, medical care, or
                career counseling, our platform ensures you receive the respectful, understanding
                service you deserve in a safe and supportive environment.
              </Typography>
            </Grid>
          </Grid>
        </MotionBox>

        {/* Core Values */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
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
            Our Core Values
          </Typography>
          <Container maxWidth="xl" sx={{ mt: 8 }}>
            <Grid container spacing={4}>
              {values.map((value, index) => (
                <Grid item key={index} sx={{ display: 'flex', justifyContent: 'center' }} size={{ xs: 12, md: 3, sm: 6 }}>
                  <MotionCard
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    sx={{
                      height: '100%',
                      maxWidth: 280,
                      borderRadius: 3,
                      border: `2px solid ${alpha(value.color, 0.1)}`,
                      '&:hover': {
                        borderColor: value.color,
                        boxShadow: `0 15px 35px ${alpha(value.color, 0.2)}`,
                      },
                      transition: 'all 0.3s ease',
                      alignItems: 'center',
                    }}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center', height: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: alpha(value.color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 20px',
                          color: value.color,
                        }}
                      >
                        {value.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          mb: 2,
                        }}
                      >
                        {value.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                        }}
                      >
                        {value.description}
                      </Typography>
                    </CardContent>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </MotionBox>

        {/* Statistics Section */}
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
            Our Impact
          </Typography>

          <Grid container spacing={4} alignItems="center" justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <MotionBox
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  sx={{ textAlign: 'center' }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: 'primary.main',
                      mb: 1,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </MotionBox>

        {/* Why Choose Us */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          sx={{ mt: 10 }}
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
                Why Choose SWEEKAR?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                }}
              >
                Unlike traditional platforms, SWEEKAR is built specifically with the LGBTQAI+
                community and women in mind. Every professional on our platform has been
                trained in inclusive care and understands the unique challenges you may face.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                }}
              >
                We're not just a directory - we're a community that believes everyone deserves
                access to professional services without fear of discrimination or judgment.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 250,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.8)}, ${alpha(theme.palette.success.main, 0.8)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <Balance sx={{ fontSize: '4rem', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Equality & Respect
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    For everyone, everywhere
                  </Typography>
                </Box>
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    left: -30,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: alpha('#ffffff', 0.1),
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -40,
                    right: -40,
                    width: 220,
                    height: 220,
                    borderRadius: '50%',
                    background: alpha('#ffffff', 0.1),
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default About;