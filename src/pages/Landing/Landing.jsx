// src/pages/Landing/Landing.jsx
import { Box } from "@mui/material";
import HeroSection from "./components/Hero";
import ServicesSection from "./components/Services";
import FeaturesSection from "./components/Features";
import AboutSection from "./components/About";
import ContactSection from "./components/Contact";

const Landing = () => {
  return (
    <Box>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <FeaturesSection />
      <ContactSection />
    </Box>
  );
};

export default Landing;