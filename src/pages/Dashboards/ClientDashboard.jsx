import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  useTheme,
  Divider,
  Paper,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProfessionals, getProfessionalTypes, getProfessionalById } from '../../services/userService';
import {
  getUpcomingBookings,
  getUserBookings,
  subscribeToClientBookings,
  createAvailabilitySlot,
  getAvailabilityForProfessional,
  updateAvailabilitySlot,
} from '../../services/bookingService';
import { 
  Search as SearchIcon, 
  CalendarToday,
  Schedule,
  Person,
  TrendingUp,
  Visibility,
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
  CalendarMonth,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore';
import ProfessionalCard from '../../components/ProfessionalCard';

const MotionCard = motion(Card);

const ClientDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));

  // State management
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [professionalTypes, setProfessionalTypes] = useState([]);
  const [professionalDetails, setProfessionalDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedSessions: 0,
    upcomingAppointments: 0,
    progress: 0
  });

  // Modal and UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Calendar state
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState({ title: '', start: null, end: null });
  const [modalMode, setModalMode] = useState('create');
  const [editingEventId, setEditingEventId] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.user?.uid) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [upcomingRes, recentRes, professionalsRes, typesRes] = await Promise.all([
          getUpcomingBookings(user.user.uid, 'client'),
          getUserBookings(user.user.uid, 'client', 'completed'),
          getProfessionals({ limit: 50 }),
          getProfessionalTypes()
        ]);

        if (upcomingRes?.success) {
          setUpcomingAppointments(upcomingRes.bookings);
          
          // Fetch professional details for upcoming appointments
          if (upcomingRes.bookings.length > 0) {
            const professionalIds = [...new Set(upcomingRes.bookings.map(b => b.professionalId))];
            const profDetailsPromises = professionalIds.map(id => getProfessionalById(id));
            const profDetailsResults = await Promise.all(profDetailsPromises);
            const profDetailsMap = profDetailsResults.reduce((acc, result) => {
              if (result.success) {
                acc[result.professional.id] = result.professional;
              }
              return acc;
            }, {});
            setProfessionalDetails(profDetailsMap);
          }
        }
        
        if (recentRes?.success) {
          setRecentSessions(recentRes.bookings);
        }
        
        if (professionalsRes?.success) {
          console.log('Fetched professionals:', professionalsRes.professionals);
          setProfessionals(professionalsRes.professionals);
          setFilteredProfessionals(professionalsRes.professionals);
        } else {
          console.error('Failed to fetch professionals:', professionalsRes?.error);
        }

        if (typesRes?.success) {
          setProfessionalTypes(typesRes.types);
        }

        // Calculate stats
        const totalBookings = (upcomingRes?.bookings?.length || 0) + (recentRes?.bookings?.length || 0);
        setStats({
          totalBookings,
          completedSessions: recentRes?.bookings?.length || 0,
          upcomingAppointments: upcomingRes?.bookings?.length || 0,
          progress: totalBookings > 0 ? ((recentRes?.bookings?.length || 0) / totalBookings) * 100 : 0
        });

      } catch (err) {
        console.error("Fetch data error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user?.user?.uid]);

  // Filter professionals based on search query and category
  useEffect(() => {
    let filtered = professionals;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prof =>
        (`${prof.first_name || ''} ${prof.last_name || ''}`.toLowerCase().includes(query)) ||
        (prof.displayName || '').toLowerCase().includes(query) ||
        (prof.specialization || '').toLowerCase().includes(query) ||
        (prof.location || '').toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(prof => prof.professional_type_id === Number(selectedCategory));
    }

    setFilteredProfessionals(filtered);
  }, [searchQuery, selectedCategory, professionals]);

  // Set up real-time listener for bookings
  useEffect(() => {
    if (!user?.user?.uid) return;

    const unsubscribe = subscribeToClientBookings(user.user.uid, (result) => {
      if (result.success) {
        const now = new Date();
        const upcoming = result.bookings.filter(b => 
          new Date(b.appointmentDate) >= now && 
          ['confirmed', 'pending'].includes(b.status)
        );
        const recent = result.bookings.filter(b => 
          b.status === 'completed'
        );

        setUpcomingAppointments(upcoming);
        setRecentSessions(recent);

        // Update stats
        const totalBookings = upcoming.length + recent.length;
        setStats(prev => ({
          ...prev,
          upcomingAppointments: upcoming.length,
          completedSessions: recent.length,
          totalBookings,
          progress: totalBookings > 0 ? (recent.length / totalBookings) * 100 : 0
        }));
      }
    });

    return () => unsubscribe();
  }, [user?.user?.uid]);

  // Fetch events for the selected professional when modal opens
  useEffect(() => {
    const fetchEvents = async () => {
      if (selectedProf?.id) {
        const result = await getAvailabilityForProfessional(selectedProf.id);
        if (result.success) {
          setEvents(result.slots);
        } else {
          console.error("Could not load schedule for this professional.");
        }
      }
    };
    fetchEvents();
  }, [selectedProf]);

  // Modal handlers
  const handleOpenModal = (prof) => {
    setSelectedProf(prof);
    setIsModalOpen(true);
    setActiveTab(0);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProf(null);
    setIsBioExpanded(false);
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calendar handlers
  const handlePrevDay = () => setViewDate(prev => new Date(prev.setDate(prev.getDate() - 1)));
  const handleNextDay = () => setViewDate(prev => new Date(prev.setDate(prev.getDate() + 1)));
  const handleToday = () => setViewDate(new Date());

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setModalMode('create');
    setEditingEventId(null);
    setNewEventData({ title: '', start: null, end: null });
  };

  const handleOpenEditModal = (eventToEdit) => {
    setModalMode('edit');
    setEditingEventId(eventToEdit.id);
    setNewEventData({
      title: eventToEdit.title,
      start: eventToEdit.start,
      end: eventToEdit.end,
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!newEventData.title || !newEventData.start || !newEventData.end) return;

    const slotData = {
      title: newEventData.title,
      start_date: Timestamp.fromDate(newEventData.start),
      end_date: Timestamp.fromDate(newEventData.end),
    };

    let result;
    if (modalMode === 'edit' && editingEventId) {
      result = await updateAvailabilitySlot(editingEventId, slotData);
      if (result.success) {
        setEvents(prevEvents => prevEvents.map(event =>
          event.id === editingEventId
            ? { ...event, title: newEventData.title, start: newEventData.start, end: newEventData.end }
            : event
        ));
        closeEventModal();
      }
    } else {
      const createData = {
        ...slotData,
        professional_id: selectedProf.id,
        notes: `Scheduled by: ${user?.user?.name || 'Client'}`,
        slot_id: `${Date.now()}`
      };
      result = await createAvailabilitySlot(createData);
      if (result.success) {
        setEvents(prevEvents => [...prevEvents, {
          ...newEventData,
          id: result.id,
          professionalId: selectedProf.id
        }]);
        closeEventModal();
      }
    }

    if (!result.success) {
      setError(`Failed to ${modalMode === 'edit' ? 'update' : 'save'} appointment. Please try again.`);
    }
  };

  // Handle booking success callback
  const handleBookingSuccess = (bookingId) => {
    // Real-time listener will automatically update the bookings
    console.log('Booking created successfully:', bookingId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              mb: 1,
            }}
          >
            Welcome back, {user?.user?.displayName || user?.user?.first_name || 'Client'}! 👋
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            Find and book appointments with verified professionals
          </Typography>
          
          {/* Debug: Show professionals count */}
          <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
            {filteredProfessionals.length} professionals found
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}
            >
              <Box display="flex" alignItems="center">
                <CalendarToday sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.upcomingAppointments}
                  </Typography>
                  <Typography variant="body2">Upcoming</Typography>
                </Box>
              </Box>
            </MotionCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'success.main', color: 'success.contrastText' }}
            >
              <Box display="flex" alignItems="center">
                <Schedule sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.completedSessions}
                  </Typography>
                  <Typography variant="body2">Completed</Typography>
                </Box>
              </Box>
            </MotionCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.main', color: 'warning.contrastText' }}
            >
              <Box display="flex" alignItems="center">
                <Person sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {filteredProfessionals.length}
                  </Typography>
                  <Typography variant="body2">Available Professionals</Typography>
                </Box>
              </Box>
            </MotionCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'info.main', color: 'info.contrastText' }}
            >
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(stats.progress)}%
                  </Typography>
                  <Typography variant="body2">Progress</Typography>
                </Box>
              </Box>
            </MotionCard>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Left Side - Professional Search */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Find Professionals
                </Typography>
                
                {/* Search and Filter Controls */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Search by name, specialization, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          label="Category"
                        >
                          <MenuItem value="All">All Categories</MenuItem>
                          {professionalTypes.map((type) => (
                            <MenuItem key={type.firestoreId} value={type.firestoreId}>
                              {type.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                {/* Professionals Grid */}
                <Grid container spacing={3}>
                  {filteredProfessionals.map((professional) => (
                    <Grid item xs={12} sm={6} lg={4} key={professional.id}>
                      <Box>
                        <ProfessionalCard
                          professional={professional}
                          onBookingSuccess={handleBookingSuccess}
                        />
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ mt: 1 }}
                          onClick={() => handleOpenModal(professional)}
                          startIcon={<Visibility />}
                        >
                          View Details & Schedule
                        </Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {filteredProfessionals.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                      No professionals found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search criteria
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side - Upcoming Appointments */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Upcoming Appointments
                </Typography>
                
                {upcomingAppointments.length > 0 ? (
                  <Stack spacing={2}>
                    {upcomingAppointments.slice(0, 5).map((appointment) => (
                      <Paper key={appointment.id} sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Avatar 
                                src={professionalDetails[appointment.professionalId]?.profile_picture}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              >
                                {professionalDetails[appointment.professionalId]?.first_name?.charAt(0) || 'P'}
                              </Avatar>
                              <Typography variant="subtitle2" fontWeight="bold">
                                Dr. {professionalDetails[appointment.professionalId]?.displayName || 
                                     `${professionalDetails[appointment.professionalId]?.first_name || ''} ${professionalDetails[appointment.professionalId]?.last_name || ''}`.trim() ||
                                     appointment.professionalName || 'Professional'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appointment.sessionType?.replace('_', ' ') || 'Video Call'} • {appointment.duration || 60} min
                            </Typography>
                            <Box mt={1}>
                              <Chip
                                label={appointment.status}
                                size="small"
                                color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No upcoming appointments
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Book an appointment with a professional
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <Card sx={{ borderRadius: 3, mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Recent Sessions
                  </Typography>
                  
                  <Stack spacing={2}>
                    {recentSessions.slice(0, 3).map((session) => (
                      <Paper key={session.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {session.professionalName || 'Professional'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(session.appointmentDate).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label="Completed"
                          size="small"
                          color="success"
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Professional Details Modal */}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">
                Dr. {selectedProf?.displayName || `${selectedProf?.first_name || ''} ${selectedProf?.last_name || ''}`.trim()}
              </Typography>
              <IconButton onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            {selectedProf && (
              <Box>
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                  <Tab label="Profile" />
                  <Tab label="Schedule" />
                  <Tab label="Reviews" />
                </Tabs>

                {/* Profile Tab */}
                {activeTab === 0 && (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center">
                          <Avatar
                            src={selectedProf.profile_picture || selectedProf.photoURL}
                            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                          >
                            {selectedProf.displayName?.charAt(0) || selectedProf.first_name?.charAt(0) || 'P'}
                          </Avatar>
                          <Typography variant="h6" gutterBottom>
                            Dr. {selectedProf.displayName || `${selectedProf.first_name || ''} ${selectedProf.last_name || ''}`.trim()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {selectedProf.specialization || 'Professional'}
                          </Typography>
                          <Chip
                            label={selectedProf.verification_status || 'VERIFIED'}
                            color="success"
                            size="small"
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                          Professional Information
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Experience
                            </Typography>
                            <Typography variant="body1">
                              {selectedProf.years_of_experience || '0'}+ years
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Hourly Rate
                            </Typography>
                            <Typography variant="body1">
                              ₹{selectedProf.hourly_rate || '0'}/hour
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Location
                            </Typography>
                            <Typography variant="body1">
                              {selectedProf.location || 'Location not specified'}
                            </Typography>
                          </Box>

                          {selectedProf.bio && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                About
                              </Typography>
                              <Typography variant="body2">
                                {isBioExpanded 
                                  ? selectedProf.bio 
                                  : `${selectedProf.bio.substring(0, 200)}${selectedProf.bio.length > 200 ? '...' : ''}`
                                }
                                {selectedProf.bio.length > 200 && (
                                  <Button
                                    size="small"
                                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                                  >
                                    {isBioExpanded ? 'Show Less' : 'Show More'}
                                  </Button>
                                )}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Schedule Tab */}
                {activeTab === 1 && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Schedule for {viewDate.toLocaleDateString()}
                      </Typography>
                      <Box>
                        <IconButton onClick={handlePrevDay}>
                          <ChevronLeft />
                        </IconButton>
                        <Button onClick={handleToday} sx={{ mx: 1 }}>
                          Today
                        </Button>
                        <IconButton onClick={handleNextDay}>
                          <ChevronRight />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Calendar View */}
                    <Paper sx={{ p: 2, minHeight: 400 }}>
                      {events.filter(e => e.start.toDateString() === viewDate.toDateString()).length > 0 ? (
                        <Stack spacing={1}>
                          {events
                            .filter(e => e.start.toDateString() === viewDate.toDateString())
                            .sort((a, b) => a.start - b.start)
                            .map(event => (
                              <Paper key={event.id} sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {event.title}
                                </Typography>
                                <Typography variant="body2">
                                  {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                  {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                {event.notes && (
                                  <Typography variant="caption">
                                    {event.notes}
                                  </Typography>
                                )}
                              </Paper>
                            ))}
                        </Stack>
                      ) : (
                        <Box textAlign="center" py={8}>
                          <Typography variant="body1" color="text.secondary">
                            No appointments scheduled for this date
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                )}

                {/* Reviews Tab */}
                {activeTab === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Reviews & Ratings
                    </Typography>
                    <Box textAlign="center" py={4}>
                      <Typography variant="body1" color="text.secondary">
                        Reviews functionality coming soon
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Event Creation Modal */}
        <Dialog open={isEventModalOpen} onClose={closeEventModal}>
          <DialogTitle>
            {modalMode === 'create' ? 'Add Availability' : 'Edit Availability'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} pt={1}>
              <TextField
                label="Title"
                fullWidth
                autoFocus
                value={newEventData.title}
                onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
              />
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={newEventData.start ? newEventData.start.toTimeString().substring(0, 5) : ''}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':');
                  const newStart = new Date(newEventData.start);
                  newStart.setHours(parseInt(h) || 0, parseInt(m) || 0);
                  setNewEventData({ ...newEventData, start: newStart });
                }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="time"
                fullWidth
                value={newEventData.end ? newEventData.end.toTimeString().substring(0, 5) : ''}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':');
                  const newEnd = new Date(newEventData.end);
                  newEnd.setHours(parseInt(h) || 0, parseInt(m) || 0);
                  setNewEventData({ ...newEventData, end: newEnd });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEventModal}>Cancel</Button>
            <Button onClick={handleSaveEvent} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ClientDashboard;