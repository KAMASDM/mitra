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
  TextField,
  InputAdornment,
  useTheme,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProfessionals, getProfessionalTypes } from '../../services/userService';
import {
  getUpcomingBookings,
  getUserBookings,
} from '../../services/bookingService';
import { 
  Search as SearchIcon, 
  CalendarToday,
  Schedule,
  Person,
  TrendingUp,
} from '@mui/icons-material';
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

//   const handleOpenModal = (prof) => {
//     setSelectedProf(prof);
//     setIsModalOpen(true);
//     setActiveTab(0);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedProf(null);
//     setIsBioExpanded(false);
//   };

//   const handleTabChange = (event, newValue) => setActiveTab(newValue);

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0); // Reset to the first page when rows per page changes
//   };


//   // Main dashboard data fetch
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       if (!user?.user?.id) {
//         setError("User not found. Please log in again.");
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         const [upcomingRes, recentRes, recsRes] = await Promise.all([
//           getUpcomingBookings(user.user.id, 'client'),
//           getUserBookings(user.user.id, 'client', 'completed'),
//           getProfessionals({ limit: 10 })
//         ]);
//         if (upcomingRes?.success && upcomingRes.bookings.length > 0) {
//           setUpcomingAppointments(upcomingRes.bookings);
//           // Professional details fetch karva mate
//           const professionalIds = [...new Set(upcomingRes.bookings.map(b => b.professionalId))];
//           const profDetailsPromises = professionalIds.map(id => getProfessionalById(id));
//           const profDetailsResults = await Promise.all(profDetailsPromises);

//           const profDetailsMap = profDetailsResults.reduce((acc, result) => {
//             if (result.success) {
//               acc[result.professional.id] = result.professional;
//             }
//             return acc;
//           }, {});
//           setProfessionalDetails(profDetailsMap);
//         } else if (upcomingRes?.success) {
//           setUpcomingAppointments(upcomingRes.bookings);
//         }
//         if (recentRes?.success) setRecentSessions(recentRes.bookings);
//         if (recsRes?.success) setRecommendations(recsRes.professionals);
//         if (recentRes?.bookings) setStats({ progress: (recentRes.bookings.length / 20) * 100 || 0 });
//       } catch (err) {
//         console.error("Fetch data error:", err);
//         setError("Failed to load dashboard data.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDashboardData();
//   }, [user?.user?.id]);

//   // Fetch dashboard data
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
        }
        
        if (recentRes?.success) {
          setRecentSessions(recentRes.bookings);
        }
        
        if (professionalsRes?.success) {
          setProfessionals(professionalsRes.professionals);
          setFilteredProfessionals(professionalsRes.professionals);
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

//   // Filter professionals based on search query and category
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

  // Handle booking success callback
  const handleBookingSuccess = (bookingId) => {
    // Refresh upcoming appointments
    getUpcomingBookings(user.user.uid, 'client').then(result => {
      if (result.success) {
        setUpcomingAppointments(result.bookings);
      }
    });
  };

//   if (loading) {
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
                      <ProfessionalCard
                        professional={professional}
                        onBookingSuccess={handleBookingSuccess}
                      />
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
                            <Typography variant="subtitle2" fontWeight="bold">
                              {appointment.professionalName || 'Professional'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                            </Typography>
                            <Chip
                              label={appointment.status}
                              size="small"
                              color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                              sx={{ mt: 1 }}
                            />
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
      </Container>
    </Box>
  );
}

export default ClientDashboard;
//     setModalMode('create');
//     setEditingEventId(null);
//     setNewEventData({ title: '', start: null, end: null });
//   };

//   const handleOpenEditModal = (eventToEdit) => {
//      if (!isEditable) return; 
//     setModalMode('edit');
//     setEditingEventId(eventToEdit.id);
//     setNewEventData({
//       title: eventToEdit.title,
//       start: eventToEdit.start,
//       end: eventToEdit.end,
//     });
//     setIsEventModalOpen(true);
//   };

//   // Handle double click on calendar grid to add new event
//   const handleGridDoubleClick = (e) => {
//       if (!isEditable || !calendarGridRef.current) return;
//     // if (!calendarGridRef.current) return;
//     setModalMode('create');
//     setEditingEventId(null);
//     const rect = calendarGridRef.current.getBoundingClientRect();
//     const offsetY = e.clientY - rect.top;
//     const hours = Math.floor((offsetY / HOUR_HEIGHT) * 60 / 60);
//     const startDate = new Date(viewDate);
//     startDate.setHours(hours, 0, 0, 0);
//     const endDate = new Date(startDate);
//     endDate.setHours(startDate.getHours() + 1);
//     setNewEventData({ title: '', start: startDate, end: endDate });
//     setIsEventModalOpen(true);
//   };

//   // Save new event to backend
//   const handleSaveEvent = async () => {
//     if (!newEventData.title || !newEventData.start || !newEventData.end) return;

//     const slotData = {
//       title: newEventData.title,
//       start_date: Timestamp.fromDate(newEventData.start),
//       end_date: Timestamp.fromDate(newEventData.end),
//     };

//     let result;
//     if (modalMode === 'edit' && editingEventId) {
//       result = await updateAvailabilitySlot(editingEventId, slotData);
//       if (result.success) {
//         setEvents(prevEvents => prevEvents.map(event =>
//           event.id === editingEventId
//             ? { ...event, title: newEventData.title, start: newEventData.start, end: newEventData.end }
//             : event
//         ));
//         closeEventModal();
//       }
//     } else {
//       const createData = {
//         ...slotData,
//         professional_id: selectedProf.id,
//         notes: `Scheduled by: ${user?.user?.name || 'Client'}`,
//         slot_id: `${Date.now()}`
//       };
//       result = await createAvailabilitySlot(createData);
//       if (result.success) {
//         setEvents(prevEvents => [...prevEvents, {
//           ...newEventData,
//           id: result.id,
//           professionalId: selectedProf.id
//         }]);
//         closeEventModal();
//       }
//     }

//     if (!result.success) {
//       setError(`Failed to ${modalMode === 'edit' ? 'update' : 'save'} appointment. Please try again.`);
//     }
//   };

//   // Mini Calendar Component
//   const MiniCalendar = () => {
//     const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//     const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
//     const month = viewDate.getMonth();
//     const year = viewDate.getFullYear();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const firstDay = new Date(year, month, 1).getDay();
//     const handleMiniCalPrevMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
//     const handleMiniCalNextMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
//     const calendarCells = [];

//     const eventDates = useMemo(() => new Set(
//       events
//         .filter(e => e.professionalId === selectedProf?.id)
//         .map(e => e.start.toDateString())
//     ), [events, selectedProf]);


//     for (let i = 0; i < firstDay; i++) { calendarCells.push(<Grid item xs={1} key={`empty-${i}`} />); }
//     for (let day = 1; day <= daysInMonth; day++) {
//       const fullDate = new Date(year, month, day);
//       const isSelected = fullDate.toDateString() === viewDate.toDateString();
//       const isToday = fullDate.toDateString() === new Date().toDateString();

//       const hasEvent = eventDates.has(fullDate.toDateString());

//       calendarCells.push(
//         <Grid item xs={1} key={day} sx={{ display: 'flex', justifyContent: 'center' }}>
//           <Box sx={{ position: 'relative', width: 32, height: 32 }}>
//             <IconButton size="small"
//               onClick={() => setViewDate(fullDate)}
//               sx={{
//                 width: '100%',
//                 height: '100%',
//                 bgcolor: isSelected ? 'primary.main' : 'transparent',
//                 color: isSelected ? 'primary.contrastText' : 'inherit',
//                 border: isToday && !isSelected ? `1px solid ${theme.palette.primary.main}` : 'none', '&:hover': { bgcolor: isSelected ? 'primary.dark' : 'action.hover' }
//               }}>
//               <Typography variant="body2" sx={{ fontWeight: isSelected || isToday ? 'medium' : 'normal' }}>
//                 {day}
//               </Typography>
//             </IconButton>
//             {hasEvent && (
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   bottom: 4,
//                   left: '50%',
//                   transform: 'translateX(-50%)',
//                   width: 5,
//                   height: 5,
//                   borderRadius: '50%',
//                   bgcolor: isSelected ? 'white' : 'green',
//                 }}
//               />
//             )}
//           </Box>
//         </Grid>
//       );
//     }
//     return (
//       <Box>
//         <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//           <Typography
//             variant="body1"
//             sx={{ fontWeight: 'medium' }}>{`${monthNames[month]} ${year}`}
//           </Typography>
//           <Box>
//             <IconButton
//               onClick={handleMiniCalPrevMonth}
//               size="small">
//               <ChevronLeft />
//             </IconButton>
//             <IconButton
//               onClick={handleMiniCalNextMonth}
//               size="small">
//               <ChevronRight />
//             </IconButton>
//           </Box>
//         </Box>
//         <Grid container columns={7} // Mini Calendar Days Header
//           sx={{ textAlign: 'center' }}>
//           {daysOfWeek.map((day, index) => (<Grid item xs={1} key={`${day}-${index}`}>
//             <Typography
//               variant="caption"
//               color="text.secondary">
//               {day}
//             </Typography>
//           </Grid>
//           ))}
//         </Grid>
//         <Grid container columns={7} rowSpacing={0.5} mt={1}>{calendarCells}</Grid>
//       </Box>
//     );
//   };

//   // Loading and error states
//   if (loading) return
//   <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
//     <CircularProgress />
//   </Box>;
//   if (error) return
//   <Container sx={{ py: 8 }}>
//     <Alert severity="error">{error.message}</Alert>
//   </Container>;

//   // Main dashboard UI
//   return (
//     <Box
//       sx={{
//         py: 4,
//         bgcolor: 'background.default',
//         minHeight: '100vh'
//       }}>
//       <Container maxWidth="xl">
//         <Box
//           sx={{ mb: 4 }}
//         >
//           <Typography variant="h4" component="h1"
//             sx={{ fontWeight: 800 }}>
//             Welcome, {user?.user?.name || 'Guest'}! 👋
//           </Typography>
//           <Typography variant="h6"
//             sx={{
//               color: 'text.secondary',
//               fontWeight: 400
//             }}>
//             Here’s what’s happening with your account today.
//           </Typography>
//         </Box>

//         <Grid container spacing={3} sx={{ mb: 3 }}>
//           {/* Progress Card */}
//           <Grid item size={{ xs: 12, md: 3, sm: 6 }}>
//             <MotionCard sx={{
//               p: 3,
//               borderRadius: 3,
//               height: '100%'
//             }}>
//               <Typography variant="h6"
//                 sx={{
//                   fontWeight: 700,
//                   mb: 2
//                 }}>
//                 Your Progress
//               </Typography>
//               <LinearProgress variant="determinate"
//                 value={stats.progress || 25}
//                 sx={{
//                   height: 8,
//                   borderRadius: 4
//                 }} />
//             </MotionCard>
//           </Grid>

//           {/* Find Professional Card */}
//           <Grid item size={{ xs: 12, md: 3, sm: 6 }}>
//             <MotionCard
//               sx={{
//                 p: 3,
//                 borderRadius: 3,
//                 height: '100%',
//                 display: 'flex',
//                 alignItems: 'center'
//               }}>
//               <Button fullWidth
//                 variant="contained"
//                 onClick={() => navigate('/experts')}>
//                 Find a new Professional
//               </Button>
//             </MotionCard>
//           </Grid>

//           {/* Upcoming Appointments Card */}
//           <Grid item xs={12} md={6}>
//             <MotionCard sx={{ borderRadius: 3, height: '100%', p: 3 }}>
//               <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
//                 Upcoming Appointments
//               </Typography>
//               {upcomingAppointments.length > 0 ? (
//                 <Stack spacing={2}>
//                   {upcomingAppointments.map((appt) => {
//                     const professional = professionalDetails[appt.professionalId];
//                     const professionalName = professional
//                       ? `${professional.first_name || ''} ${professional.last_name || ''}`.trim()
//                       : 'Loading...';

//                     return (
//                       <Paper key={appt.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Box>
//                           <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{professionalName}</Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             {new Date(appt.appointmentDate.seconds * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//                           </Typography>
//                           <Typography variant="body2" color="text.secondary">{appt.appointmentTime}</Typography>
//                         </Box>
//                         <Button variant="outlined" size="small">View</Button>
//                       </Paper>
//                     );
//                   })}
//                 </Stack>
//               ) : (
//                 <Typography sx={{ color: 'text.secondary', mt: 1 }}>No upcoming appointments.</Typography>
//               )}
//             </MotionCard>
//           </Grid>

//           {/* Recent Sessions Card */}
//           <Grid item size={{ xs: 12, md: 3, sm: 6 }}>
//             <MotionCard
//               sx={{
//                 borderRadius: 3,
//                 height: '100%', p: 3
//               }}>
//               <Typography variant="h6"
//                 sx={{ fontWeight: 700, mb: 2 }}>Recent Sessions
//               </Typography>
//               {recentSessions.length > 0 ? <Typography>{recentSessions.length} sessions</Typography>
//                 : <Typography sx={{ color: 'text.secondary', mt: 1 }}>No recent sessions.</Typography>}
//             </MotionCard>
//           </Grid>
//         </Grid>

//         {/* Recommendations Table */}
//         <MotionCard initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           sx={{ borderRadius: 3 }}>
//           <CardContent sx={{ p: { xs: 2, md: 3 } }}>
//             <Box
//               sx={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 mb: 2,
//                 flexWrap: 'wrap',
//                 gap: 2
//               }}>
//               <Typography variant="h5"
//                 sx={{ fontWeight: 700 }}>Recommended for You
//               </Typography>
//               <TextField
//                 size="small"
//                 variant="outlined"
//                 placeholder="Search specialization..."
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   setPage(0); // Reset page to 0 when searching
//                 }}
//                 sx={{ minWidth: '250px', '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
//                 InputProps={{
//                   startAdornment: (<InputAdornment position="start">
//                     <SearchIcon color="action" />
//                   </InputAdornment>)
//                 }} />
//             </Box>
//             <TableContainer>
//               <Table sx={{ minWidth: 650 }}>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell
//                       sx={{ fontWeight: 'bold' }}>Professional Name</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Specialization</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Education</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
//                     <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {filteredRecommendations
//                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                     .map((prof) => (
//                       <TableRow key={prof.id}><TableCell>
//                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                           <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
//                             {prof.first_name?.charAt(0)?.toUpperCase()}
//                           </Avatar>
//                           <Box>
//                             <Typography
//                               variant="body1"
//                               sx={{
//                                 textTransform: 'capitalize',
//                                 fontWeight: 500
//                               }}>
//                               {`${prof.first_name || ''} ${prof.last_name || ''}`.trim()}
//                             </Typography>
//                             <Typography variant="body2"
//                               color="text.secondary">
//                               {prof.email}
//                             </Typography>
//                           </Box>
//                         </Box>
//                       </TableCell>
//                         <TableCell>
//                           {prof.specializations?.[0]?.label || 'No Specialization'}
//                         </TableCell>
//                         <TableCell>
//                           {prof.educational_qualification || 'No Education'}
//                         </TableCell>
//                         <TableCell>
//                           {prof.phone || 'No Phone'}
//                         </TableCell>
//                         <TableCell
//                           sx={{ textAlign: 'center' }}>
//                           <IconButton color="primary"
//                             onClick={() => handleOpenModal(prof)}
//                             size="small">
//                             <Visibility />
//                           </IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//             <TablePagination
//               rowsPerPageOptions={[5, 10, 25]}
//               component="div"
//               count={filteredRecommendations.length}
//               rowsPerPage={rowsPerPage}
//               page={page}
//               onPageChange={handleChangePage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//             />
//           </CardContent>
//         </MotionCard>
//       </Container>

//       {selectedProf && (
//         <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
//           <DialogTitle
//             sx={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center'
//             }}>
//             Professional Details
//             <IconButton onClick={handleCloseModal}>
//               <CloseIcon />
//             </IconButton>
//           </DialogTitle>
//           <Box
//             sx={{ borderBottom: 1, borderColor: 'divider' }}>
//             <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
//               <Tab label="Profile Details" />
//               <Tab label="Schedule Meeting" />
//             </Tabs>
//           </Box>
//           <DialogContent
//             sx={{
//               height: '75vh',
//               ...(activeTab === 1 ? { p: 0, overflow: 'hidden' }
//                 : { p: 3, overflow: 'auto' })
//             }}>
//             {activeTab === 0 && (
//               <Box>
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     mb: 3
//                   }}>
//                   <Avatar
//                     sx={{
//                       width: 80,
//                       height: 80,
//                       mr: 3,
//                       bgcolor: 'primary.main',
//                       fontSize: '2.5rem'
//                     }}>
//                     {selectedProf.first_name?.charAt(0)?.toUpperCase()}
//                   </Avatar>
//                   <Box>
//                     <Typography
//                       variant="h5"
//                       component="h2"
//                       sx={{
//                         textTransform: 'capitalize',
//                         fontWeight: 'bold'
//                       }}>
//                       {`${selectedProf.first_name || ''} ${selectedProf.last_name || ''}`}
//                     </Typography>
//                     <Typography
//                       variant="body1"
//                       color="text.secondary">
//                       {selectedProf.email || 'No Email'}
//                     </Typography>
//                     <Typography
//                       color="text.secondary"
//                       variant="body2">
//                       {selectedProf.specializations?.[0]?.label || 'No Specialization'}
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Divider sx={{ my: 3 }} />
//                 <Box sx={{ mb: 3 }}>
//                   <Typography
//                     variant="h6"
//                     sx={{ fontWeight: 'bold' }}
//                     gutterBottom>
//                     Scheduled Appointments
//                   </Typography>
//                   {events.filter(event => event.professionalId === selectedProf.id).length > 0 ? (
//                     <Stack spacing={2}>
//                       {events.filter(event => event.professionalId === selectedProf.id).sort((a, b) => a.start - b.start).map(event => (
//                         <Paper
//                           key={event.id}
//                           variant="outlined"
//                           sx={{
//                             p: 2,
//                             borderRadius: 2,
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: 2,
//                             borderColor: 'divider'
//                           }}
//                         >
//                           <Avatar sx={{ bgcolor: 'primary.light' }}>
//                             <CalendarMonth />
//                           </Avatar>
//                           <Box sx={{ flexGrow: 1 }}>
//                             <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//                               {event.title}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {event.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
//                             </Typography>
//                           </Box>
//                           {/* <IconButton size="small" onClick={() => handleOpenEditModal(event)}>
//                             <EditIcon />
//                           </IconButton> */}
//                         </Paper>
//                       ))}
//                     </Stack>
//                   ) : (
//                     <Typography variant="body2" color="text.secondary">You have not scheduled any appointments with this professional yet.</Typography>
//                   )}
//                 </Box>
//                 {/* <Divider sx={{ my: 3 }} /> */}
//                 <Box sx={{ mb: 3 }}>
//                   <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
//                     Biography
//                   </Typography>
//                   {selectedProf.biography ? (
//                     <>
//                       <Typography variant="body2" sx={{ whiteSpace: 'pre-line', textAlign: 'justify' }}>
//                         {isBioExpanded || selectedProf.biography.length <= 350
//                           ? selectedProf.biography
//                           : `${selectedProf.biography.substring(0, 250)}...`}
//                       </Typography>
//                       {selectedProf.biography.length > 350 && (
//                         <Button
//                           size="small"
//                           variant="contained"
//                           onClick={() => setIsBioExpanded(!isBioExpanded)}
//                           sx={{
//                             mt: 1,
//                             textTransform: 'none',
//                             bgcolor: '#8D7B70',
//                             color: 'white',
//                             borderRadius: '16px',
//                             px: 2.5,
//                             py: 0.5,
//                             '&:hover': {
//                               bgcolor: '#7A6B61',
//                             },
//                           }}
//                         >
//                           {isBioExpanded ? 'Show less' : 'Read more'}
//                         </Button>
//                       )}
//                     </>
//                   ) : (
//                     <Typography variant="body2" color="text.secondary">
//                       No biography available for this professional.
//                     </Typography>
//                   )}
//                 </Box>
//                 <Grid container spacing={2}>
//                   <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Educational Qualification</Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {selectedProf.educational_qualification || 'Not Provided'}
//                     </Typography>
//                   </Grid>
//                   <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Contact Number</Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {selectedProf.phone || 'Not Provided'}
//                     </Typography>
//                   </Grid>
//                 </Grid>

//                 {selectedProf.specializations?.length > 0 && (
//                   <Box sx={{ mt: 3 }}>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
//                       Specializations
//                     </Typography>
//                     <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
//                       {selectedProf.specializations.map((spec, index) => (
//                         <Chip
//                           key={`${spec.value}-${index}`}
//                           label={spec.label}
//                           color="primary"
//                           variant="outlined"
//                           sx={{ mb: 1 }}
//                         />
//                       ))}
//                     </Stack>
//                   </Box>
//                 )}
//               </Box>
//             )}
//             {activeTab === 1 && (
//               // <Box
//               //   sx={{
//               //     display: { xs: 'block', md: 'flex' },
//               //     height: '100%'
//               //   }}>
//               //   <Box
//               //     sx={{
//               //       width: { xs: '100%', md: 300 },
//               //       p: 2,
//               //       borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
//               //       overflowY: 'auto'
//               //     }}>
//               //     <MiniCalendar />
//               //     <Box sx={{ mt: 2 }}>
//               //       <Typography variant="subtitle2" sx={{ mb: 1 }}>Appointments on this day:</Typography>
//               //       <Stack spacing={1}>
//               //         {(() => {
//               //           const eventsForDay = events
//               //             .filter(event =>
//               //               event.professionalId === selectedProf.id &&
//               //               event.start.toDateString() === viewDate.toDateString()
//               //             )
//               //             .sort((a, b) => a.start - b.start);

//               //           if (eventsForDay.length > 0) {
//               //             return eventsForDay.map((event, index) => (
//               //               <Chip
//               //                 key={`${event.id}-${index}`}
//               //                 icon={<CalendarMonth />}
//               //                 label={`${event.title} - ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
//               //                 onClick={() => setViewDate(event.start)}
//               //                 sx={{ justifyContent: 'flex-start', pl: 1 }}
//               //               />
//               //             ));
//               //           } else {
//               //             return (
//               //               <Typography variant="caption" color="text.secondary">
//               //                 No appointments scheduled for this day.
//               //               </Typography>
//               //             );
//               //           }
//               //         })()}
//               //       </Stack>
//               //     </Box>
//               //   </Box>
//               //   <Box
//               //     sx={{
//               //       flexGrow: 1,
//               //       height: '100%',
//               //       display: 'flex',
//               //       flexDirection: 'column'
//               //     }}>
//               //     <Box
//               //       display="flex"
//               //       alignItems="center"
//               //       p={1.5}
//               //       borderBottom={1}
//               //       borderColor="divider">
//               //       <Button onClick={handleToday}
//               //         variant="outlined"
//               //         size="small"
//               //         sx={{ mr: 2 }}>
//               //         Today
//               //       </Button>
//               //       <IconButton onClick={handlePrevDay} size="small">
//               //         <ChevronLeft />
//               //       </IconButton>
//               //       <IconButton onClick={handleNextDay} size="small">
//               //         <ChevronRight />
//               //       </IconButton>
//               //       <Typography variant="h6" ml={2}>
//               //         {viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
//               //       </Typography>
//               //     </Box>
//               //     <Box
//               //       sx={{
//               //         flexGrow: 1, overflowY: 'auto', position: 'relative'
//               //       }}>
//               //       <Box
//               //         sx={{
//               //           display: 'flex', position: 'relative'
//               //         }}>
//               //         <Box
//               //           sx={{
//               //             width: '70px', pt: 1, textAlign: 'center', borderRight: 1, borderColor: 'divider'
//               //           }}>
//               //           {Array.from({ length: 24 }).map((_, i) => (
//               //             <Box key={i}
//               //               sx={{
//               //                 height: `${HOUR_HEIGHT}px`,
//               //                 position: 'relative'
//               //               }}>
//               //               <Typography
//               //                 variant="caption"
//               //                 sx={{
//               //                   position: 'relative',
//               //                   top: -8,
//               //                   color: 'text.secondary'
//               //                 }}>
//               //                 {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
//               //               </Typography>
//               //             </Box>
//               //           ))}
//               //         </Box>
//               //         <Box
//               //           sx={{
//               //             flexGrow: 1, position: 'relative'
//               //           }}
//               //           ref={calendarGridRef}
//               //           onDoubleClick={handleGridDoubleClick}>
//               //           {Array.from({ length: 24 }).map((_, i) => (<Box key={i}
//               //             sx={{
//               //               height: `${HOUR_HEIGHT}px`,
//               //               borderBottom: 1,
//               //               borderColor: 'divider', '&:last-of-type': { border: 'none' }
//               //             }}
//               //           />
//               //           ))}
//               //           {events.filter(e => new Date(e.start).toDateString() === viewDate.toDateString() && e.professionalId === selectedProf.id).map(event => {
//               //             const top = (event.start.getHours() * 60 + event.start.getMinutes()) / 60 * HOUR_HEIGHT;
//               //             const durationMinutes = (event.end - event.start) / 60000;
//               //             const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20);
//               //             return (
//               //               <Box
//               //                 key={event.id}
//               //                 sx={{
//               //                   position: 'absolute',
//               //                   top: `${top}px`,
//               //                   left: '10px',
//               //                   right: '10px',
//               //                   height: `${height}px`,
//               //                   bgcolor: 'primary.main',
//               //                   color: 'primary.contrastText',
//               //                   borderRadius: 1, p: 1,
//               //                   overflow: 'hidden',
//               //                   zIndex: 1,
//               //                 }}>
//               //                 <Typography variant="body2"
//               //                   sx={{
//               //                     fontWeight: 'bold',
//               //                     whiteSpace: 'nowrap'
//               //                   }}>
//               //                   {event.title}
//               //                 </Typography>
//               //                 <Typography variant="caption">
//               //                   {`${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
//               //                 </Typography>
//               //               </Box>
//               //             );
//               //           })}
//               //         </Box>
//               //       </Box>
//               //     </Box>
//               //   </Box>
//               // </Box>
//                <ScheduleManagementView 
//                 professional={selectedProf}
//                 user={user}
//                 isEditable={false} // Client cannot edit
//               />
//             )}
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* <Dialog open={isEventModalOpen} onClose={closeEventModal}>
//         <DialogTitle>{modalMode === 'create' ? 'Add an Appointment' : 'Edit Appointment'}</DialogTitle>
//         <DialogContent>
//           <Stack spacing={2} pt={1}>
//             <TextField
//               label="Appointment Title" fullWidth autoFocus
//               value={newEventData.title}
//               onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })} />
//             <TextField
//               label="Start Time" type="time" fullWidth
//               value={newEventData.start ? newEventData.start.toTimeString().substring(0, 5) : ''}
//               onChange={(e) => {
//                 const [h, m] = e.target.value.split(':'); const newStart = new Date(newEventData.start);
//                 newStart.setHours(parseInt(h) || 0, parseInt(m) || 0);
//                 setNewEventData({ ...newEventData, start: newStart });
//               }}
//               InputLabelProps={{ shrink: true }} />
//             <TextField
//               label="End Time"
//               type="time"
//               fullWidth
//               value={newEventData.end ? newEventData.end.toTimeString().substring(0, 5) : ''}
//               onChange={(e) => {
//                 const [h, m] = e.target.value.split(':');
//                 const newEnd = new Date(newEventData.end);
//                 newEnd.setHours(parseInt(h) || 0, parseInt(m) || 0);
//                 setNewEventData({ ...newEventData, end: newEnd });
//               }}
//               InputLabelProps={{ shrink: true }} />
//           </Stack>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={closeEventModal}>Cancel</Button>
//           <Button onClick={handleSaveEvent} variant="contained">Save</Button>
//         </DialogActions>
//       </Dialog> */}
//     </Box>
//   );
// };

// export default ClientDashboard;


import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  IconButton,
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
  TablePagination
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProfessionals, getProfessionalById } from '../../services/userService';
import {
  getUpcomingBookings,
  getUserBookings,
  createAvailabilitySlot,
  getAvailabilityForProfessional,
  updateAvailabilitySlot,
} from '../../services/bookingService';
import { Visibility, Close as CloseIcon, Search as SearchIcon, ChevronLeft, ChevronRight, CalendarMonth, Edit as EditIcon } from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore';


const MotionCard = motion(Card);

// --- 1. REUSABLE SCHEDULE COMPONENT (EXTRACTED) ---
export const ScheduleManagementView = ({ professional, user, isEditable }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState({ title: '', start: null, end: null });
  const calendarGridRef = useRef(null);
  const [modalMode, setModalMode] = useState('create');
  const [editingEventId, setEditingEventId] = useState(null);
  
  const HOUR_HEIGHT = 80;

  useEffect(() => {
    const fetchEvents = async () => {
      if (professional?.id) {
        setLoadingEvents(true);
        const result = await getAvailabilityForProfessional(professional.id);
        if (result.success) {
          setEvents(result.slots);
        } else {
          setEventError("Could not load schedule for this professional.");
        }
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [professional]);

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
    if (!isEditable) return; // Prevent client from editing
    setModalMode('edit');
    setEditingEventId(eventToEdit.id);
    setNewEventData({
      title: eventToEdit.title,
      start: eventToEdit.start,
      end: eventToEdit.end,
    });
    setIsEventModalOpen(true);
  };

  const handleGridDoubleClick = (e) => {
    if (!isEditable || !calendarGridRef.current) return; // Prevent client from creating
    
    setModalMode('create');
    setEditingEventId(null);
    const rect = calendarGridRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const hours = Math.floor((offsetY / HOUR_HEIGHT) * 60 / 60);
    const startDate = new Date(viewDate);
    startDate.setHours(hours, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);
    setNewEventData({ title: '', start: startDate, end: endDate });
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
        professional_id: professional.id,
        notes: `Scheduled by: ${user?.user?.name || 'Professional'}`,
        slot_id: `${Date.now()}`
      };
      result = await createAvailabilitySlot(createData);
      if (result.success) {
        setEvents(prevEvents => [...prevEvents, {
          ...newEventData,
          id: result.id,
          professionalId: professional.id
        }]);
        closeEventModal();
      }
    }

    if (!result.success) {
      setEventError(`Failed to ${modalMode === 'edit' ? 'update' : 'save'} appointment.`);
    }
  };

  const MiniCalendar = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const handleMiniCalPrevMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleMiniCalNextMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const calendarCells = [];

    const eventDates = useMemo(() => new Set(
      events.map(e => e.start.toDateString())
    ), [events]);

    for (let i = 0; i < firstDay; i++) { calendarCells.push(<Grid item xs={1} key={`empty-${i}`} />); }
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      const isSelected = fullDate.toDateString() === viewDate.toDateString();
      const isToday = fullDate.toDateString() === new Date().toDateString();
      const hasEvent = eventDates.has(fullDate.toDateString());

      calendarCells.push(
        <Grid item xs={1} key={day} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', width: 32, height: 32 }}>
            <IconButton size="small"
              onClick={() => setViewDate(fullDate)}
              sx={{
                width: '100%', height: '100%',
                bgcolor: isSelected ? 'primary.main' : 'transparent',
                color: isSelected ? 'primary.contrastText' : 'inherit',
                border: isToday && !isSelected ? `1px solid ${theme.palette.primary.main}` : 'none', '&:hover': { bgcolor: isSelected ? 'primary.dark' : 'action.hover' }
              }}>
              <Typography variant="body2" sx={{ fontWeight: isSelected || isToday ? 'medium' : 'normal' }}>{day}</Typography>
            </IconButton>
            {hasEvent && <Box sx={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', bgcolor: isSelected ? 'white' : 'primary.main' }} />}
          </Box>
        </Grid>
      );
    }
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{`${monthNames[month]} ${year}`}</Typography>
          <Box>
            <IconButton onClick={handleMiniCalPrevMonth} size="small"><ChevronLeft /></IconButton>
            <IconButton onClick={handleMiniCalNextMonth} size="small"><ChevronRight /></IconButton>
          </Box>
        </Box>
        <Grid container columns={7} sx={{ textAlign: 'center' }}>
          {daysOfWeek.map((day, index) => <Grid item xs={1} key={`${day}-${index}`}><Typography variant="caption" color="text.secondary">{day}</Typography></Grid>)}
        </Grid>
        <Grid container columns={7} rowSpacing={0.5} mt={1}>{calendarCells}</Grid>
      </Box>
    );
  };
  
  if (loadingEvents) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (eventError) return <Alert severity="error">{eventError}</Alert>;
  
  return (
    <Box sx={{ display: { xs: 'block', md: 'flex' }, height: '100%' }}>
      <Box sx={{ width: { xs: '100%', md: 300 }, p: 2, borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` }, overflowY: 'auto' }}>
        <MiniCalendar />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Available Slots</Typography>
        <Stack spacing={1}>
          {(() => {
            const eventsForDay = events.filter(event => event.start.toDateString() === viewDate.toDateString()).sort((a, b) => a.start - b.start);
            if (eventsForDay.length > 0) {
              return eventsForDay.map((event, index) => (
                <Chip key={`${event.id}-${index}`} icon={<CalendarMonth />} label={`${event.title} - ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} onClick={() => setViewDate(event.start)} sx={{ justifyContent: 'flex-start', pl: 1 }} />
              ));
            }
            return <Typography variant="caption" color="text.secondary">No appointments scheduled.</Typography>;
          })()}
        </Stack>
      </Box>
      <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" p={1.5} borderBottom={1} borderColor="divider">
          <Button onClick={handleToday} variant="outlined" size="small" sx={{ mr: 2 }}>Today</Button>
          <IconButton onClick={handlePrevDay} size="small"><ChevronLeft /></IconButton>
          <IconButton onClick={handleNextDay} size="small"><ChevronRight /></IconButton>
          <Typography variant="h6" ml={2}>{viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }}>
          <Box sx={{ display: 'flex', position: 'relative' }}>
            <Box sx={{ width: '70px', pt: 1, textAlign: 'center', borderRight: 1, borderColor: 'divider' }}>
              {Array.from({ length: 24 }).map((_, i) => <Box key={i} sx={{ height: `${HOUR_HEIGHT}px`, position: 'relative' }}><Typography variant="caption" sx={{ position: 'relative', top: -8, color: 'text.secondary' }}>{i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}</Typography></Box>)}
            </Box>
            <Box sx={{ flexGrow: 1, position: 'relative' }} ref={calendarGridRef} onDoubleClick={handleGridDoubleClick}>
              {Array.from({ length: 24 }).map((_, i) => <Box key={i} sx={{ height: `${HOUR_HEIGHT}px`, borderBottom: 1, borderColor: 'divider', '&:last-of-type': { border: 'none' } }} />)}
              {events.filter(e => e.start.toDateString() === viewDate.toDateString()).map(event => {
                const top = (event.start.getHours() * 60 + event.start.getMinutes()) / 60 * HOUR_HEIGHT;
                const durationMinutes = (event.end - event.start) / 60000;
                const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20);
                return (
                  <Box key={event.id} sx={{ position: 'absolute', top: `${top}px`, left: '10px', right: '10px', height: `${height}px`, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1, p: 1, overflow: 'hidden', zIndex: 1, cursor: isEditable ? 'pointer' : 'default' }} onClick={() => handleOpenEditModal(event)}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{event.title}</Typography>
                    <Typography variant="caption">{`${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
       <Dialog open={isEventModalOpen} onClose={closeEventModal}>
        <DialogTitle>{modalMode === 'create' ? 'Add Availability' : 'Edit Availability'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField label="Title" fullWidth autoFocus value={newEventData.title} onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })} />
            <TextField label="Start Time" type="time" fullWidth value={newEventData.start ? newEventData.start.toTimeString().substring(0, 5) : ''} onChange={(e) => { const [h, m] = e.target.value.split(':'); const newStart = new Date(newEventData.start); newStart.setHours(parseInt(h) || 0, parseInt(m) || 0); setNewEventData({ ...newEventData, start: newStart }); }} InputLabelProps={{ shrink: true }} />
            <TextField label="End Time" type="time" fullWidth value={newEventData.end ? newEventData.end.toTimeString().substring(0, 5) : ''} onChange={(e) => { const [h, m] = e.target.value.split(':'); const newEnd = new Date(newEventData.end); newEnd.setHours(parseInt(h) || 0, parseInt(m) || 0); setNewEventData({ ...newEventData, end: newEnd }); }} InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEventModal}>Cancel</Button>
          <Button onClick={handleSaveEvent} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


// --- 2. MAIN COMPONENT (NOW SIMPLIFIED) ---
const ClientDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('loginInfo'));

  const [recommendations, setRecommendations] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [professionalDetails, setProfessionalDetails] = useState({});
  const [stats, setStats] = useState({ progress: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.user?.id) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [upcomingRes, recentRes, recsRes] = await Promise.all([
          getUpcomingBookings(user.user.id, 'client'),
          getUserBookings(user.user.id, 'client', 'completed'),
          getProfessionals({ limit: 10 })
        ]);

        if (upcomingRes?.success) {
          setUpcomingAppointments(upcomingRes.bookings);
          if (upcomingRes.bookings.length > 0) {
            const professionalIds = [...new Set(upcomingRes.bookings.map(b => b.professionalId))];
            const profDetailsPromises = professionalIds.map(id => getProfessionalById(id));
            const profDetailsResults = await Promise.all(profDetailsPromises);
            const profDetailsMap = profDetailsResults.reduce((acc, result) => {
              if (result.success) acc[result.professional.id] = result.professional;
              return acc;
            }, {});
            setProfessionalDetails(profDetailsMap);
          }
        }
        if (recentRes?.success) setRecentSessions(recentRes.bookings);
        if (recsRes?.success) setRecommendations(recsRes.professionals);
        if (recentRes?.bookings) setStats({ progress: (recentRes.bookings.length / 20) * 100 || 0 });

      } catch (err) {
        console.error("Fetch data error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.user?.id]);
  
  const filteredRecommendations = useMemo(() => {
    if (!searchQuery) return recommendations;
    const query = searchQuery.toLowerCase();
    return recommendations.filter(prof =>
      (`${prof.first_name || ''} ${prof.last_name || ''}`.toLowerCase().includes(query)) ||
      (prof.specializations?.[0]?.label || '').toLowerCase().includes(query) ||
      (prof.educational_qualification || '').toLowerCase().includes(query)
    );
  }, [searchQuery, recommendations]);
  
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Dashboard Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Welcome, {user?.user?.name || 'Guest'}! 👋
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Here’s what’s happening with your account today.
          </Typography>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
           <Grid item xs={12} sm={6} md={3}>
            <MotionCard sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Your Progress</Typography>
              <LinearProgress variant="determinate" value={stats.progress || 25} sx={{ height: 8, borderRadius: 4 }} />
            </MotionCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Button fullWidth variant="contained" onClick={() => navigate('/experts')}>Find a new Professional</Button>
            </MotionCard>
          </Grid>
           <Grid item xs={12} md={6}>
            <MotionCard sx={{ borderRadius: 3, height: '100%', p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Upcoming Appointments</Typography>
              {upcomingAppointments.length > 0 ? (
                <Stack spacing={2}>
                  {upcomingAppointments.slice(0, 2).map((appt) => {
                    const professional = professionalDetails[appt.professionalId];
                    const professionalName = professional ? `${professional.first_name || ''} ${professional.last_name || ''}`.trim() : 'Loading...';
                    return (
                      <Paper key={appt.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{professionalName}</Typography>
                          <Typography variant="body2" color="text.secondary">{new Date(appt.appointmentDate.seconds * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {appt.appointmentTime}</Typography>
                        </Box>
                        <Button variant="outlined" size="small">View</Button>
                      </Paper>
                    );
                  })}
                </Stack>
              ) : <Typography sx={{ color: 'text.secondary', mt: 1 }}>No upcoming appointments.</Typography>}
            </MotionCard>
          </Grid>
        </Grid>
        
        {/* Recommendations Table */}
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} sx={{ borderRadius: 3 }}>
           <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Recommended for You</Typography>
              <TextField size="small" variant="outlined" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} sx={{ minWidth: '250px', '& .MuiOutlinedInput-root': { borderRadius: '50px' } }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }} />
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Professional</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Specialization</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Education</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecommendations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((prof) => (
                      <TableRow key={prof.id}>
                          <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>{prof.first_name?.charAt(0)?.toUpperCase()}</Avatar>
                                  <Box>
                                      <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>{`${prof.first_name || ''} ${prof.last_name || ''}`.trim()}</Typography>
                                      <Typography variant="body2" color="text.secondary">{prof.email}</Typography>
                                  </Box>
                              </Box>
                          </TableCell>
                          <TableCell>{prof.specializations?.[0]?.label || 'Not specified'}</TableCell>
                          <TableCell>{prof.educational_qualification || 'Not specified'}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}><IconButton color="primary" onClick={() => handleOpenModal(prof)} size="small"><Visibility /></IconButton></TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredRecommendations.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
          </CardContent>
        </MotionCard>
      </Container>
      
      {/* Modal Dialog for Professional Details & Scheduling */}
      {selectedProf && (
        <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            User Details <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
          </DialogTitle>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}><Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth"><Tab label="Profile" /><Tab label="Schedule Meeting" /></Tabs></Box>
          <DialogContent sx={{ height: '75vh', ...(activeTab === 1 ? { p: 0, overflow: 'hidden' } : { p: 3, overflow: 'auto' }) }}>
            {activeTab === 0 && (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main', fontSize: '2.5rem' }}>{selectedProf.first_name?.charAt(0)?.toUpperCase()}</Avatar>
                        <Box>
                            <Typography variant="h5" component="h2" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{`${selectedProf.first_name || ''} ${selectedProf.last_name || ''}`}</Typography>
                            <Typography variant="body1" color="text.secondary">{selectedProf.email || 'No Email'}</Typography>
                            <Typography color="text.secondary" variant="body2">{selectedProf.specializations?.[0]?.label || 'No Specialization'}</Typography>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>Biography</Typography>
                        {selectedProf.biography ? (
                          <>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', textAlign: 'justify' }}>
                              {isBioExpanded || selectedProf.biography.length <= 350 ? selectedProf.biography : `${selectedProf.biography.substring(0, 250)}...`}
                            </Typography>
                            {selectedProf.biography.length > 350 && <Button size="small" onClick={() => setIsBioExpanded(!isBioExpanded)} sx={{ mt: 1 }}>{isBioExpanded ? 'Show less' : 'Read more'}</Button>}
                          </>
                        ) : <Typography variant="body2" color="text.secondary">No biography available.</Typography>}
                    </Box>
                </Box>
            )}
            {activeTab === 1 && (
              <ScheduleManagementView 
                professional={selectedProf}
                user={user}
                isEditable={false} // Client cannot edit
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default ClientDashboard;