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

const services = [
  { id: 1, title: "Mental Health", icon: <Psychology />, color: "#5C4033" },
  { id: 2, title: "Legal Aid", icon: <Gavel />, color: "#5C4033" },
  { id: 3, title: "Medical Services", icon: <LocalHospital />, color: "#5C4033" },
  { id: 4, title: "Career Guidance", icon: <Work />, color: "#5C4033" },
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
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
        pt: { xs: 8, md: 10 },
        pb: { xs: 8, md: 12 },
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              sx={{ textAlign: { xs: "center", md: "left" } }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  mb: 3,
                }}
              >
                Safe & Inclusive{" "}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  Professional Services
                </Box>
                <br />
                for LGBTQAI+ & Women
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  fontWeight: 400,
                  maxWidth: { md: '90%' },
                }}
              >
                Connect with verified professionals in a safe, judgment-free
                environment tailored to your unique needs.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: { xs: "center", md: "flex-start" } }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/experts")}
                  sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
                >
                  Find an Expert
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/services")}
                  sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
                >
                  Explore Services
                </Button>
              </Stack>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={6} sx={{ my: 2 }}>
            <Grid container spacing={2}>
              {services.map((service, index) => (
                <Grid item xs={6} key={service.id}>
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.8 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    sx={{
                      p: 2,
                      borderRadius: '20%',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(service.color, 0.3)}`,
                      textAlign: "center",
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: `0 10px 30px ${alpha(service.color, 0.2)}`,
                        borderColor: service.color,
                      },
                    }}
                    onClick={() => navigate("/services")}
                  >
                    <Box sx={{ color: service.color, fontSize: '2.5rem', mb: 1 }}>{service.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: "1rem" }}>
                      {service.title}
                    </Typography>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;