import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme/theme';

// Layout Components
import Navbar from './components/Navigation/Navbar';
import MobileBottomNav from './components/Navigation/MobileBottomNav';
import ScrollToTop from './components/UI/ScrollToTop';

// Pages
import Landing from './pages/Landing/Landing';
import About from './pages/About/About';
import Services from './pages/Services/Services';
import Features from './pages/Features/Features';
import Experts from './pages/Experts/Experts';
import Contact from './pages/Contact/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard Pages
import ClientDashboard from './pages/Dashboards/ClientDashboard';
import ClientProfile from './pages/Profiles/ClientProfile';
import ProfessionalDashboard from './pages/Dashboards/ProfessionalDashboard';
import ProfessionalProfile from './pages/Profiles/ProfessionalProfile';
import AdminDashboard from './pages/Dashboards/AdminDashboard';

// Booking Pages
import BookingForm from './pages/Booking/BookingForm';
import BookingConfirmation from './pages/Booking/BookingConfirmation';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ScrollToTop />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/features" element={<Features />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Booking Routes */}
              <Route path="/book/:professionalId" element={<BookingForm />} />
              <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
              
              {/* Protected Client Routes */}
              <Route path="/client/dashboard" element={
                <ProtectedRoute allowedRoles={['CLIENT','USER']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/client/profile" element={
                <ProtectedRoute allowedRoles={['CLIENT','USER']}>
                  <ClientProfile />
                </ProtectedRoute>
              } />
              
              {/* Protected Professional Routes */}
              <Route path="/professional/dashboard" element={
                <ProtectedRoute allowedRoles={['PROFESSIONAL']}>
                  <ProfessionalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/professional/profile" element={
                <ProtectedRoute allowedRoles={['PROFESSIONAL']}>
                  <ProfessionalProfile />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </Box>
          
          <MobileBottomNav />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;