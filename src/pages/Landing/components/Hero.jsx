// src/pages/Landing/components/Hero.jsx
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowForward, Psychology, Gavel, LocalHospital, Work } from "@mui/icons-material";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

const services = [
  {
    id: 1,
    title: "Mental Health",
    icon: <Psychology />,
    color: "#9D84B7",
  },
  {
    id: 2,
    title: "Legal Aid", 
    icon: <Gavel />,
    color: "#F4A259",
  },
  {
    id: 3,
    title: "Medical Services",
    icon: <LocalHospital />,
    color: "#4DAA57",
  },
  {
    id: 4,
    title: "Placement Services",
    icon: <Work />,
    color: "#5899E2",
  },
];

const Hero = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha('#f5f1e8', 0.9)}, ${alpha('#e8f5e8', 0.9)})`,
        pt: { xs: 6, md: 8 },
        pb: { xs: 8, md: 12 },
        minHeight: { xs: '90vh', md: '85vh' },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background decorative elements */}
      <MotionBox
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: alpha(theme.palette.primary.main, 0.1),
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <MotionBox
        sx={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: alpha(theme.palette.secondary.main, 0.1),
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: { xs: 'auto', md: '70vh' } }}
        >
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              sx={{
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <MotionTypography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  mb: 3,
                }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: loaded ? 1 : 0, x: loaded ? 0 : -50 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                Safe & Inclusive{" "}
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.primary.main,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "100%",
                      height: "30%",
                      bottom: 0,
                      left: 0,
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      zIndex: -1,
                      borderRadius: "4px",
                    },
                  }}
                >
                  Professional Services
                </Box>
                <br />
                for LGBTQAI+ & Women
              </MotionTypography>

              <MotionTypography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                  fontWeight: 400,
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  lineHeight: 1.6,
                  maxWidth: { xs: '100%', md: '90%' },
                }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: loaded ? 1 : 0, x: loaded ? 0 : -50 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                Connect with verified professionals in a safe, judgment-free
                environment tailored to your unique needs.
              </MotionTypography>

              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Stack 
                  direction={{ xs: "column", sm: "row" }} 
                  spacing={2} 
                  sx={{ 
                    justifyContent: { xs: "center", md: "flex-start" },
                    alignItems: "center"
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate("/services")}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 3,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Explore Services
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/experts")}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: 3,
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                        transform: "translateY(-2px)",
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Find Experts
                  </Button>
                </Stack>
              </MotionBox>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.8 }}
              transition={{ duration: 1, delay: 0.3 }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid container spacing={2} sx={{ maxWidth: 500 }}>
                {services.map((service, index) => (
                  <Grid item xs={6} key={service.id}>
                    <MotionBox
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 50 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.8 + (index * 0.1),
                        ease: "easeOut"
                      }}
                      whileHover={{
                        scale: 1.05,
                        y: -5,
                      }}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        background: alpha('#ffffff', 0.9),
                        backdropFilter: 'blur(10px)',
                        border: `2px solid ${alpha(service.color, 0.2)}`,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: `0 10px 30px ${alpha(service.color, 0.3)}`,
                          borderColor: service.color,
                        },
                      }}
                      onClick={() => navigate("/services")}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: alpha(service.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          color: service.color,
                        }}
                      >
                        {service.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontSize: "1rem",
                        }}
                      >
                        {service.title}
                      </Typography>
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </MotionBox>
          </Grid>
        </Grid>

        {/* Statistics Section */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          sx={{
            mt: { xs: 6, md: 8 },
            p: 4,
            borderRadius: 4,
            background: alpha('#ffffff', 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Grid container spacing={4} sx={{ textAlign: "center" }}>
            {[
              { label: "Verified Professionals", value: "500+" },
              { label: "Successful Consultations", value: "10,000+" },
              { label: "Happy Clients", value: "8,500+" },
              { label: "Service Categories", value: "20+" },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Hero;