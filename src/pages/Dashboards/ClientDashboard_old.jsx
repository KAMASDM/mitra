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
  TablePagination,
  Snackbar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProfessionals, getProfessionalById } from '../../services/userService';
import {
  getUpcomingBookings,
  getUserBookings,
  getAvailabilityForProfessional,
  createBookingFromSlot,
  createAvailabilitySlot,
  updateAvailabilitySlot
} from '../../services/bookingService';
import { Visibility, Close as CloseIcon, Search as SearchIcon, ChevronLeft, ChevronRight, CalendarMonth, Edit as EditIcon, } from '@mui/icons-material';
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


  // New states for booking confirmation
  const [confirmBookingOpen, setConfirmBookingOpen] = useState(false);
  const [slotToBook, setSlotToBook] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const HOUR_HEIGHT = 80;

  useEffect(() => {
    const fetchEvents = async () => {
      if (professional?.id) {
        setLoadingEvents(true);
        const result = await getAvailabilityForProfessional(professional.id);
        if (result.success) {
          setEvents(result.slots.map(slot => ({ ...slot, is_booked: slot.is_booked || false })));
        } else {
          setEventError("Could not load schedule for this professional.");
        }
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [professional]);

  const eventsForDay = useMemo(() => {
    return events
      .filter(event => event.start.toDateString() === viewDate.toDateString())
      .sort((a, b) => a.start - b.start);
  }, [events, viewDate]);

  const handleBookSlot = (slot) => {
    if (isEditable) return; // Professionals can't book themselves
    setSlotToBook(slot);
    setConfirmBookingOpen(true);
  };

  const confirmBooking = async () => {
    if (!slotToBook) return;
    setBookingLoading(true);

    const clientData = {
      id: user.user.id,
      name: user.user.name,
      email: user.user.email
    };

    const result = await createBookingFromSlot(slotToBook, professional.id, clientData);

    if (result.success) {
      setSnackbar({ open: true, message: 'Booking successful! The professional has been notified.', severity: 'success' });
      // Update the UI to show the slot as booked
      setEvents(prevEvents => prevEvents.map(event =>
        event.id === slotToBook.id ? { ...event, is_booked: true } : event
      ));
    } else {
      setSnackbar({ open: true, message: result.error || 'Booking failed. Please try again.', severity: 'error' });
    }

    setBookingLoading(false);
    setConfirmBookingOpen(false);
    setSlotToBook(null);
  };

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
      const createData = { ...slotData, professional_id: professional.id };
      result = await createAvailabilitySlot(createData);
      if (result.success) {
        setEvents(prevEvents => [...prevEvents, { ...newEventData, id: result.id }]);
      }
    }

    if (result.success) {
      closeEventModal();
    } else {
      setEventError(`Failed to ${modalMode} slot.`);
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
            {hasEvent && <Box sx={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', bgcolor: isSelected ? 'wh' : 'green' }} />}
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
    // <Box sx={{ display: 'flex', height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
    //   {/* Left Panel */}
    //   <Box sx={{ width: { xs: '100%', md: 280 }, p: 2, borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` }, overflowY: 'auto' }}>
    //     <MiniCalendar />
    //     <Divider sx={{ my: 2 }} />
    //     <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Available Slots</Typography>
    //     {loadingEvents ? <CircularProgress size={24} /> : (
    //       <Stack spacing={1}>
    //         {eventsForDay.length > 0 ? eventsForDay.map(event => (
    //           <Paper
    //             key={event.id}
    //             variant="outlined"
    //             sx={{
    //               p: 1.5,
    //               borderRadius: 2,
    //               display: 'flex',
    //               justifyContent: 'space-between',
    //               alignItems: 'center',
    //               opacity: event.is_booked ? 0.6 : 1,
    //               cursor: isEditable || event.is_booked ? 'default' : 'pointer',
    //               '&:hover': {
    //                 boxShadow: !isEditable && !event.is_booked ? 1 : 0
    //               }
    //             }}
    //           >
    //             <Box>
    //               <Typography variant="body2" fontWeight="bold">
    //                 {event.title}
    //               </Typography>
    //               <Typography variant="body2" fontWeight="bold">
    //                 {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    //               </Typography>
    //             </Box>
    //             {!isEditable && (
    //               <Button
    //                 size="small"
    //                 variant="contained"
    //                 onClick={() => handleBookSlot(event)}
    //                 disabled={event.is_booked || bookingLoading}
    //               >
    //                 {event.is_booked ? "Booked" : "Book"}
    //               </Button>
    //             )}
    //           </Paper>
    //         )) : (
    //           <Typography variant="caption" color="text.secondary">No available slots for this day.</Typography>
    //         )}
    //       </Stack>
    //     )}
    //   </Box>

    //   {/* Right Panel */}
    //   <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
    //     <Box display="flex" alignItems="center" p={1.5} borderBottom={1} borderColor="divider">
    //       <Button onClick={handleToday} variant="outlined" size="small" sx={{ mr: 2 }}>Today</Button>
    //       <IconButton onClick={handlePrevDay} size="small"><ChevronLeft /></IconButton>
    //       <IconButton onClick={handleNextDay} size="small"><ChevronRight /></IconButton>
    //       <Typography variant="h6" ml={2}>{viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Typography>
    //     </Box>
    //     <Box sx={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }}>
    //       <Box sx={{ display: 'flex', position: 'relative' }}>
    //         <Box sx={{ width: '70px', pt: 1, textAlign: 'center', borderRight: 1, borderColor: 'divider' }}>
    //           {Array.from({ length: 24 }).map((_, i) => <Box key={i} sx={{ height: `${HOUR_HEIGHT}px`, position: 'relative' }}><Typography variant="caption" sx={{ position: 'relative', top: -8, color: 'text.secondary' }}>{i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}</Typography></Box>)}
    //         </Box>
    //         <Box sx={{ flexGrow: 1, position: 'relative' }} ref={calendarGridRef}>
    //           {Array.from({ length: 24 }).map((_, i) => <Box key={i} sx={{ height: `${HOUR_HEIGHT}px`, borderBottom: 1, borderColor: 'divider' }} />)}
    //         </Box>
    //       </Box>
    //     </Box>
    //   </Box>    
    // </Box>

    <>
      <Box sx={{ display: 'flex', height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ width: { xs: '100%', md: 280 }, p: 2, borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` }, overflowY: 'auto' }}>
          <MiniCalendar />

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Available Slots</Typography>
          {loadingEvents ? <CircularProgress size={24} /> : (
            <Stack spacing={1}>
              {eventsForDay.length > 0 ? eventsForDay.map(event => (
                <Paper
                  key={event.id}
                  variant="outlined"
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textTransform: 'capitalize',
                    opacity: event.is_booked ? 0.6 : 1,
                    cursor: isEditable || event.is_booked ? 'default' : 'pointer',
                    '&:hover': {
                      boxShadow: !isEditable && !event.is_booked ? 1 : 0
                    }
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  {!isEditable && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleBookSlot(event)}
                      disabled={event.is_booked || bookingLoading}
                    >
                      {event.is_booked ? "Booked" : "Book"}
                    </Button>
                  )}
                </Paper>
              )) : (
                <Typography variant="caption" color="text.secondary">No available slots for this day.</Typography>
              )}
            </Stack>
          )}
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" p={1.5} borderBottom={1} borderColor="divider">
            <Button onClick={handleToday} variant="outlined" size="small" sx={{ mr: 2 }}>Today</Button>
            <IconButton onClick={handlePrevDay} size="small"><ChevronLeft /></IconButton>
            <IconButton onClick={handleNextDay} size="small"><ChevronRight /></IconButton>
            <Typography variant="h6" ml={2}>{viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Typography>
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }} onDoubleClick={handleGridDoubleClick} ref={calendarGridRef}>
            <Box sx={{ display: 'flex', position: 'relative' }}>
              <Box sx={{ width: '70px', pt: 1, textAlign: 'center', borderRight: 1, borderColor: 'divider' }}>
                {Array.from({ length: 24 }).map((_, i) => <Box key={i} sx={{ height: `${HOUR_HEIGHT}px`, position: 'relative' }}><Typography variant="caption" sx={{ position: 'relative', top: -8, color: 'text.secondary' }}>{i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}</Typography></Box>)}
              </Box>
              <Box sx={{ flexGrow: 1, position: 'relative' }}>
                {Array.from({ length: 24 }).map((_, i) => <Box key={i} sx={{ height: `${HOUR_HEIGHT}px`, borderBottom: 1, borderColor: 'divider' }} />)}
                {eventsForDay.map(event => {
                  const top = (event.start.getHours() + event.start.getMinutes() / 60) * HOUR_HEIGHT;
                  const height = ((event.end - event.start) / 3600000) * HOUR_HEIGHT;
                  return (
                    <Box
                      key={event.id}
                      onClick={() => handleOpenEditModal(event)}
                      sx={{
                        position: 'absolute', top: `${top}px`, left: '10px', right: '10px', height: `${height}px`,
                        bgcolor: event.is_booked ? 'grey.400' : 'primary.main',
                        color: 'primary.contrastText', borderRadius: 1, p: 1,
                        cursor: isEditable ? 'pointer' : 'default',
                        opacity: event.is_booked ? 0.7 : 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{event.title}</Typography>
                      <Typography variant="caption">{`${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Typography>
                      {event.is_booked && <Chip label="Booked" size="small" sx={{ mt: 1 }} />}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Add/Edit Modal */}
      <Dialog open={isEventModalOpen} onClose={closeEventModal}>
        <DialogTitle>{modalMode === 'create' ? 'Add Availability Slot' : 'Edit Slot'}</DialogTitle>
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

      <Dialog open={confirmBookingOpen} onClose={() => setConfirmBookingOpen(false)}>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to book this slot on
            <strong> {slotToBook?.start.toLocaleDateString()}</strong> from
            <strong> {slotToBook?.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> to
            <strong> {slotToBook?.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBookingOpen(false)}>Cancel</Button>
          <Button onClick={confirmBooking} variant="contained" disabled={bookingLoading}>
            {bookingLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
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
  const [allUserBookings, setAllUserBookings] = useState([]);

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

  const handleViewAppointment = (appt) => {
    const professional = professionalDetails[appt.professionalId];
    if (professional) {
      handleOpenModal(professional);
    } else {
      console.error("Could not find details for professional ID:", appt.professionalId);
    }
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
        const [allBookingsRes, recsRes] = await Promise.all([
          getUserBookings(user.user.id, 'client'),
          getProfessionals({ limit: 10 })
        ]);

        if (allBookingsRes?.success) {
          const bookings = allBookingsRes.bookings;
          setAllUserBookings(bookings);

          const now = new Date();
          const upcoming = bookings.filter(b =>
            new Date(b.appointmentDate) >= now &&
            ['confirmed', 'pending'].includes(b.status)
          );
          setUpcomingAppointments(upcoming);

          const recent = bookings.filter(b => b.status === 'completed');
          setRecentSessions(recent);

          setStats({ progress: (recent.length / 20) * 100 || 0 });

          if (bookings.length > 0) {
            const professionalIds = [...new Set(bookings.map(b => b.professionalId))];
            const profDetailsPromises = professionalIds.map(id => getProfessionalById(id));
            const profDetailsResults = await Promise.all(profDetailsPromises);
            const profDetailsMap = profDetailsResults.reduce((acc, result) => {
              if (result.success) acc[result.professional.id] = result.professional;
              return acc;
            }, {});
            setProfessionalDetails(profDetailsMap);
          }
        }
        if (recsRes?.success) setRecommendations(recsRes.professionals);

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
        <Box sx={{ mb: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Welcome, {user?.user?.name || 'Guest'}! 👋
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Here’s what’s happening with your account today.
          </Typography>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 2 }}>
          {/* Progress Card */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <MotionCard sx={{
              p: 3,
              borderRadius: 3,
              height: '100%'
            }}>
              <Typography variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2
                }}>
                Your Progress
              </Typography>
              <LinearProgress variant="determinate"
                value={stats.progress || 25}
                sx={{
                  height: 8,
                  borderRadius: 4
                }} />
            </MotionCard>
          </Grid>

          {/* Find Professional Card */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <MotionCard
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                // display: 'flex',
                // alignItems: 'center'
              }}>
              <Button fullWidth
                variant="contained"
                onClick={() => navigate('/experts')}>
                Find a new Professional
              </Button>
            </MotionCard>
          </Grid>

          {/* Upcoming Appointments Card */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <MotionCard sx={{ borderRadius: 3, height: '100%', p: 2.5, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, flexShrink: 0 }}>
                Upcoming Appointments
              </Typography>
              {upcomingAppointments.length > 0 ? (
                <Stack
                  spacing={2}
                  sx={{
                    overflowY: 'auto',
                    flexGrow: 1,
                    pr: 1,
                    maxHeight: 180,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.5),
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.8)
                    },
                  }}
                >
                  {upcomingAppointments.map((appt) => {
                    const professional = professionalDetails[appt.professionalId];
                    const professionalName = professional ? `${professional.first_name || ''} ${professional.last_name || ''}`.trim() : 'Loading...';

                    return (
                      <Paper
                        key={appt.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                          {professional?.first_name?.charAt(0) || 'P'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{professionalName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(appt.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {appt.appointmentTime}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleViewAppointment(appt)} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                          <ChevronRight />
                        </IconButton>
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: 'text.secondary', mt: 1 }}>No upcoming appointments.</Typography>
                </Box>
              )}
            </MotionCard>
          </Grid>

          {/* Recent Sessions Card */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <MotionCard
              sx={{
                borderRadius: 3,
                height: '100%', p: 3
              }}>
              <Typography variant="h6"
                sx={{ fontWeight: 700, mb: 2 }}>Recent Sessions
              </Typography>
              {recentSessions.length > 0 ? <Typography>{recentSessions.length} sessions</Typography>
                : <Typography sx={{ color: 'text.secondary', mt: 1 }}>No recent sessions.</Typography>}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
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
                      <TableCell>{prof.phone || 'N/A'}</TableCell>
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3
                  }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mr: 3,
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem'
                    }}>
                    {selectedProf.first_name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 'bold'
                      }}>
                      {`${selectedProf.first_name || ''} ${selectedProf.last_name || ''}`}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary">
                      {selectedProf.email || 'No Email'}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2">
                      {selectedProf.specializations?.[0]?.label || 'No Specialization'}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold' }}
                    gutterBottom>
                    Scheduled Appointments
                  </Typography>
                  {(() => {
                    const clientAppointmentsWithSelectedProf = allUserBookings.filter(
                      appt => appt.professionalId === selectedProf.id
                    );

                    if (clientAppointmentsWithSelectedProf.length > 0) {
                      return (
                        <List>
                          {clientAppointmentsWithSelectedProf.map((appointment) => (
                            <ListItem key={appointment.id} sx={{
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 2,
                              p: 2,
                              mb: 1,
                            }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                  <CalendarMonth />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={appointment.title || 'Appointment'}
                                secondary={
                                  <React.Fragment>
                                    <Typography component="span" variant="body2" color="text.primary">
                                      {`${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}`}
                                    </Typography>
                                  </React.Fragment>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      );
                    } else {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          You have no scheduled appointments with this professional yet.
                        </Typography>
                      );
                    }
                  })()}
                </Box>
                {/* <Divider sx={{ my: 3 }} /> */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
                    Biography
                  </Typography>
                  {selectedProf.biography ? (
                    <>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', textAlign: 'justify' }}>
                        {isBioExpanded || selectedProf.biography.length <= 350
                          ? selectedProf.biography
                          : `${selectedProf.biography.substring(0, 250)}...`}
                      </Typography>
                      {selectedProf.biography.length > 350 && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => setIsBioExpanded(!isBioExpanded)}
                          sx={{
                            mt: 1,
                            textTransform: 'none',
                            bgcolor: '#8D7B70',
                            color: 'white',
                            borderRadius: '16px',
                            px: 2.5,
                            py: 0.5,
                            '&:hover': {
                              bgcolor: '#7A6B61',
                            },
                          }}
                        >
                          {isBioExpanded ? 'Show less' : 'Read more'}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No biography available for this professional.
                    </Typography>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Educational Qualification</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProf.educational_qualification || 'Not Provided'}
                    </Typography>
                  </Grid>
                  <Grid item size={{ xs: 12, md: 6, sm: 6 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Contact Number</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedProf.phone || 'Not Provided'}
                    </Typography>
                  </Grid>
                </Grid>

                {selectedProf.specializations?.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Specializations
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                      {selectedProf.specializations.map((spec, index) => (
                        <Chip
                          key={`${spec.value}-${index}`}
                          label={spec.label}
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
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