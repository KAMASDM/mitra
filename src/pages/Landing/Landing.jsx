// src/pages/Landing/Landing.jsx
import { Box, Divider } from "@mui/material";
import HeroSection from "./components/Hero";
import ServicesSection from "./components/Services";
import FeaturesSection from "./components/Features";
import AboutSection from "./components/About";
import ContactSection from "./components/Contact";

const Landing = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Box component="section" id="hero">
        <HeroSection />
      </Box>
      <Divider />
      {/* <Box component="section" id="about" sx={{ py: { xs: 6, md: 10 } }}>
        <AboutSection />
      </Box> */}
      {/* <Divider /> */}
      {/* <Box component="section" id="services" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
        <ServicesSection />
      </Box>
      <Divider /> */}
      <Box component="section" id="features" sx={{ py: { xs: 6, md: 10 } }}>
        <FeaturesSection />
      </Box>
      <Divider />
      <Box component="section" id="contact" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
        <ContactSection />
      </Box>
    </Box>
  );
};

export default Landing;