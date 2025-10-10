// src/services/bookingService.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  and,
  or,
  Timestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const BOOKINGS_COLLECTION = 'bookings';
const AVAILABILITY_COLLECTION = 'availability';
const PAYMENTS_COLLECTION = 'payments';
const AVAILABILITY_SLOTS_COLLECTION = 'availabilitySlots'; 
// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const booking = {
      ...bookingData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const bookingRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
    
    return { bookingId: bookingRef.id, success: true };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { error: error.message, success: false };
  }
};


// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (bookingSnap.exists()) {
      return { 
        booking: { id: bookingSnap.id, ...bookingSnap.data() }, 
        success: true 
      };
    } else {
      return { error: 'Booking not found', success: false };
    }
  } catch (error) {
    console.error('Error getting booking:', error);
    return { error: error.message, success: false };
  }
};

// Get user bookings (client or professional)
export const getUserBookings = async (userId, userType = 'client', status = null) => {
  try {
    const field = userType === 'client' ? 'clientId' : 'professionalId';
    let q = query(
      collection(db, BOOKINGS_COLLECTION),
      where(field, '==', userId),
      orderBy('appointmentDate', 'desc')
    );
    
    if (status) {
      q = query(
        collection(db, BOOKINGS_COLLECTION),
        and(
          where(field, '==', userId),
          where('status', '==', status)
        ),
        orderBy('appointmentDate', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({ 
        id: doc.id, 
        ...data,
        appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate
      });
    });
    
    return { bookings, success: true };
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return { error: error.message, success: false };
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status, additionalData = {}) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status,
      ...additionalData,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { error: error.message, success: false };
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, reason = '') => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { error: error.message, success: false };
  }
};

// Reschedule booking
export const rescheduleBooking = async (bookingId, newDate, newTime) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      appointmentDate: Timestamp.fromDate(new Date(newDate)),
      appointmentTime: newTime,
      status: 'rescheduled',
      rescheduledAt: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return { error: error.message, success: false };
  }
};

// Get upcoming bookings
// export const getUpcomingBookings = async (userId, userType = 'client', days = 7) => {
//   try {
//     const field = userType === 'client' ? 'clientId' : 'professionalId';
//     const now = new Date();
//     const futureDate = new Date();
//     futureDate.setDate(now.getDate() + days);
    
//     const q = query(
//       collection(db, BOOKINGS_COLLECTION),
//       and(
//         where(field, '==', userId),
//         where('appointmentDate', '>=', Timestamp.fromDate(now)),
//         where('appointmentDate', '<=', Timestamp.fromDate(futureDate)),
//         or(
//           where('status', '==', 'confirmed'),
//           where('status', '==', 'pending')
//         )
//       ),
//       orderBy('appointmentDate', 'asc')
//     );
    
//     const querySnapshot = await getDocs(q);
//     const bookings = [];
    
//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       bookings.push({ 
//         id: doc.id, 
//         ...data,
//         appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate
//       });
//     });
    
//     return { bookings, success: true };
//   } catch (error) {
//     console.error('Error getting upcoming bookings:', error);
//     return { error: error.message, success: false };
//   }
// };

export const getUpcomingBookings = async (userId, userType = 'client') => {
  try {
    const field = userType === 'client' ? 'clientId' : 'professionalId';
    const now = new Date();
    
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      and(
        where(field, '==', userId),
        where('appointmentDate', '>=', Timestamp.fromDate(now)),
        or(
          where('status', '==', 'confirmed'),
          where('status', '==', 'pending')
        )
      ),
      orderBy('appointmentDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({ 
        id: doc.id, 
        ...data,
        appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate
      });
    });
    
    return { bookings, success: true };
  } catch (error) {
    console.error('Error getting upcoming bookings:', error);
    return { error: error.message, success: false };
  }
};


// Get today's bookings
export const getTodaysBookings = async (userId, userType = 'professional') => {
  try {
    const field = userType === 'client' ? 'clientId' : 'professionalId';
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      and(
        where(field, '==', userId),
        where('appointmentDate', '>=', Timestamp.fromDate(startOfDay)),
        where('appointmentDate', '<=', Timestamp.fromDate(endOfDay))
      ),
      orderBy('appointmentTime', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({ 
        id: doc.id, 
        ...data,
        appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate
      });
    });
    
    return { bookings, success: true };
  } catch (error) {
    console.error('Error getting today\'s bookings:', error);
    return { error: error.message, success: false };
  }
};

// Get professional availability
export const getProfessionalAvailability = async (professionalId, date) => {
  try {
    const q = query(
      collection(db, AVAILABILITY_COLLECTION),
      and(
        where('professionalId', '==', professionalId),
        where('date', '==', date),
        where('available', '==', true)
      )
    );
    
    const querySnapshot = await getDocs(q);
    const availability = [];
    
    querySnapshot.forEach((doc) => {
      availability.push({ id: doc.id, ...doc.data() });
    });
    
    return { availability, success: true };
  } catch (error) {
    console.error('Error getting professional availability:', error);
    return { error: error.message, success: false };
  }
};

// Update professional availability
export const updateProfessionalAvailability = async (professionalId, availabilityData) => {
  try {
    const availabilityRef = await addDoc(collection(db, AVAILABILITY_COLLECTION), {
      professionalId,
      ...availabilityData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return { availabilityId: availabilityRef.id, success: true };
  } catch (error) {
    console.error('Error updating professional availability:', error);
    return { error: error.message, success: false };
  }
};

// Process payment for booking
export const processPayment = async (bookingId, paymentData) => {
  try {
    // Create payment record
    const payment = {
      bookingId,
      ...paymentData,
      status: 'completed', // In real app, this would come from payment processor
      processedAt: new Date(),
      createdAt: new Date()
    };
    
    const paymentRef = await addDoc(collection(db, PAYMENTS_COLLECTION), payment);
    
    // Update booking status to confirmed
    await updateBookingStatus(bookingId, 'confirmed', {
      paymentId: paymentRef.id,
      paymentStatus: 'completed'
    });
    
    return { paymentId: paymentRef.id, success: true };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { error: error.message, success: false };
  }
};

// Get booking statistics
export const getBookingStatistics = async (userId, userType = 'professional', period = 'month') => {
  try {
    const field = userType === 'client' ? 'clientId' : 'professionalId';
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      and(
        where(field, '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate))
      )
    );
    
    const querySnapshot = await getDocs(q);
    
    let totalBookings = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;
    let totalEarnings = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalBookings++;
      
      if (data.status === 'completed') {
        completedBookings++;
        totalEarnings += data.amount || 0;
      } else if (data.status === 'cancelled') {
        cancelledBookings++;
      }
    });
    
    const statistics = {
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings: totalBookings - completedBookings - cancelledBookings,
      totalEarnings,
      averageBookingValue: totalBookings > 0 ? totalEarnings / completedBookings : 0,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0
    };
    
    return { statistics, success: true };
  } catch (error) {
    console.error('Error getting booking statistics:', error);
    return { error: error.message, success: false };
  }
};

// Search bookings
export const searchBookings = async (searchParams) => {
  try {
    let q = collection(db, BOOKINGS_COLLECTION);
    
    // Build query based on search parameters
    const conditions = [];
    
    if (searchParams.clientId) {
      conditions.push(where('clientId', '==', searchParams.clientId));
    }
    
    if (searchParams.professionalId) {
      conditions.push(where('professionalId', '==', searchParams.professionalId));
    }
    
    if (searchParams.status) {
      conditions.push(where('status', '==', searchParams.status));
    }
    
    if (searchParams.dateFrom && searchParams.dateTo) {
      conditions.push(where('appointmentDate', '>=', Timestamp.fromDate(new Date(searchParams.dateFrom))));
      conditions.push(where('appointmentDate', '<=', Timestamp.fromDate(new Date(searchParams.dateTo))));
    }
    
    if (conditions.length > 0) {
      q = query(q, and(...conditions), orderBy('appointmentDate', 'desc'));
    } else {
      q = query(q, orderBy('appointmentDate', 'desc'));
    }
    
    if (searchParams.limit) {
      q = query(q, limit(searchParams.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({ 
        id: doc.id, 
        ...data,
        appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate
      });
    });
    
    return { bookings, success: true };
  } catch (error) {
    console.error('Error searching bookings:', error);
    return { error: error.message, success: false };
  }
};

export const createAvailabilitySlot = async (slotData) => {
  try {
    const slotPayload = {
      ...slotData,
      created_at: Timestamp.now(), // Use Firestore Timestamp for creation date
      is_cancelled: false,
    };

    const docRef = await addDoc(collection(db, 'availabilitySlots'), slotPayload);
    console.log("Successfully saved event to Firestore with ID:", docRef.id);
    return { success: true, id: docRef.id };
    
  } catch (error) {
    console.error("Error creating availability slot:", error);
    return { success: false, error: error.message };
  }
};

// NEW FUNCTION to fetch all events/slots for a specific professional
export const getAvailabilityForProfessional = async (professionalId) => {
  try {
    if (!professionalId) return { success: true, slots: [] };

    const q = query(
      collection(db, 'availabilitySlots'),
      where('professional_id', '==', professionalId)
    );

    const querySnapshot = await getDocs(q);
    const slots = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        professionalId: data.professional_id,
        title: data.title,
        // Convert Firestore Timestamps back to JavaScript Date objects
        start: data.start_date.toDate(),
        end: data.end_date.toDate(),
        notes: data.notes,
      };
    });

    return { success: true, slots };
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    return { success: false, error: error.message, slots: [] };
  }
};

export const updateAvailabilitySlot = async (slotId, slotData) => {
  try {
    const slotRef = doc(db, 'availabilitySlots', slotId);
    await updateDoc(slotRef, slotData);
    console.log("Successfully updated event in Firestore with ID:", slotId);
    return { success: true };
  } catch (error) {
    console.error("Error updating availability slot:", error);
    return { success: false, error: error.message };
  }
};

// Get available slots for a professional on a specific date
export const getAvailableSlots = async (professionalId, selectedDate) => {
  try {
    if (!professionalId || !selectedDate) {
      return { success: false, error: 'Professional ID and date are required' };
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get availability slots for the professional on the selected date
    const availabilityQuery = query(
      collection(db, 'availabilitySlots'),
      where('professional_id', '==', professionalId),
      where('start_date', '>=', Timestamp.fromDate(startOfDay)),
      where('start_date', '<=', Timestamp.fromDate(endOfDay)),
      where('is_cancelled', '==', false)
    );

    // Get existing bookings for the professional on the selected date
    const bookingsQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('professionalId', '==', professionalId),
      where('appointmentDate', '>=', Timestamp.fromDate(startOfDay)),
      where('appointmentDate', '<=', Timestamp.fromDate(endOfDay)),
      where('status', 'in', ['confirmed', 'pending'])
    );

    const [availabilitySnapshot, bookingsSnapshot] = await Promise.all([
      getDocs(availabilityQuery),
      getDocs(bookingsQuery)
    ]);

    // Convert availability slots to array
    const availableSlots = [];
    availabilitySnapshot.forEach((doc) => {
      const data = doc.data();
      availableSlots.push({
        id: doc.id,
        startTime: data.start_date.toDate(),
        endTime: data.end_date.toDate(),
        title: data.title,
        available: true
      });
    });

    // Get booked time slots
    const bookedSlots = [];
    bookingsSnapshot.forEach((doc) => {
      const data = doc.data();
      bookedSlots.push({
        startTime: data.appointmentDate.toDate(),
        endTime: new Date(data.appointmentDate.toDate().getTime() + (data.duration || 60) * 60000) // Add duration in minutes
      });
    });

    // Filter available slots that don't overlap with booked slots
    const freeSlots = availableSlots.filter(slot => {
      return !bookedSlots.some(booked => {
        return (slot.startTime < booked.endTime && slot.endTime > booked.startTime);
      });
    });

    return { success: true, availableSlots: freeSlots };
  } catch (error) {
    console.error('Error getting available slots:', error);
    return { success: false, error: error.message, availableSlots: [] };
  }
};

// Create booking with client details
export const createBookingWithClientDetails = async (bookingData, clientInfo) => {
  try {
    const user = JSON.parse(localStorage.getItem('loginInfo'));
    if (!user?.user?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    // Create the booking with complete client information
    const booking = {
      clientId: user.user.uid,
      professionalId: bookingData.professionalId,
      appointmentDate: Timestamp.fromDate(new Date(bookingData.appointmentDate)),
      appointmentTime: bookingData.appointmentTime,
      duration: bookingData.duration || 60,
      sessionType: bookingData.sessionType || 'video_call',
      status: 'pending',
      amount: bookingData.amount || 0,
      notes: bookingData.notes || '',
      
      // Client details
      clientName: clientInfo.name || user.user.name || `${user.user.first_name || ''} ${user.user.last_name || ''}`.trim(),
      clientEmail: clientInfo.email || user.user.email,
      clientPhone: clientInfo.phone || user.user.phone || '',
      clientAge: clientInfo.age || '',
      clientGender: clientInfo.gender || '',
      reasonForBooking: clientInfo.reasonForBooking || '',
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const bookingRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
    
    // Mark the availability slot as booked if slotId is provided
    if (bookingData.slotId) {
      const slotRef = doc(db, 'availabilitySlots', bookingData.slotId);
      await updateDoc(slotRef, {
        is_booked: true,
        booked_by: user.user.uid,
        booking_id: bookingRef.id,
        updated_at: Timestamp.now()
      });
    }
    
    return { success: true, bookingId: bookingRef.id };
  } catch (error) {
    console.error('Error creating booking with client details:', error);
    return { success: false, error: error.message };
  }
};

// Get bookings with client details for professionals
export const getProfessionalBookingsWithClientDetails = async (professionalId) => {
  try {
    if (!professionalId) {
      return { success: false, error: 'Professional ID is required' };
    }

    const bookingsQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('professionalId', '==', professionalId),
      orderBy('appointmentDate', 'asc')
    );

    const querySnapshot = await getDocs(bookingsQuery);
    const bookings = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        ...data,
        appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });

    return { success: true, bookings };
  } catch (error) {
    console.error('Error getting professional bookings with client details:', error);
    return { success: false, error: error.message, bookings: [] };
  }
};

// Real-time listener for professional bookings
// export const subscribeToProfessionalBookings = (professionalId, callback) => {
//   if (!professionalId) {
//     console.error('Professional ID is required for subscription');
//     return () => {}; // Return empty unsubscribe function
//   }

//   try {
//     const bookingsQuery = query(
//       collection(db, BOOKINGS_COLLECTION),
//       where('professionalId', '==', professionalId),
//       orderBy('appointmentDate', 'asc')
//     );

//     const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
//       const bookings = [];
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         bookings.push({
//           id: doc.id,
//           ...data,
//           appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate,
//           createdAt: data.createdAt?.toDate?.() || data.createdAt,
//           updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
//         });
//       });
//       callback({ success: true, bookings });
//     }, (error) => {
//       console.error('Error in bookings subscription:', error);
//       callback({ success: false, error: error.message, bookings: [] });
//     });

//     return unsubscribe;
//   } catch (error) {
//     console.error('Error setting up bookings subscription:', error);
//     return () => {}; // Return empty unsubscribe function
//   }
// };

export const subscribeToProfessionalBookings = (professionalId, callback) => {
  if (!professionalId) {
    console.error('Professional ID is required for subscription');
    return () => {}; // Return an empty unsubscribe function
  }
  try {
    const bookingsQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('professionalId', '==', professionalId),
      orderBy('appointmentDate', 'asc')
    );

    const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
      const bookings = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to JS Date object
          appointmentDate: data.appointmentDate.toDate(),
        });
      });
      // This callback will be triggered every time the bookings data changes for this professional
      callback({ success: true, bookings });
    }, (error) => {
      console.error('Error in bookings subscription:', error);
      callback({ success: false, error: error.message, bookings: [] });
    });
    return unsubscribe; // Return the function to stop the listener
  } catch (error) {
    console.error('Error setting up bookings subscription:', error);
    return () => {};
  }
};

// Real-time listener for client bookings
export const subscribeToClientBookings = (clientId, callback) => {
  if (!clientId) {
    console.error('Client ID is required for subscription');
    return () => {}; // Return empty unsubscribe function
  }

  try {
    const bookingsQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('appointmentDate', 'desc')
    );

    const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
      const bookings = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          appointmentDate: data.appointmentDate?.toDate?.() || data.appointmentDate,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
        });
      });
      callback({ success: true, bookings });
    }, (error) => {
      console.error('Error in bookings subscription:', error);
      callback({ success: false, error: error.message, bookings: [] });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up bookings subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Real-time listener for availability slots
export const subscribeToAvailabilitySlots = (professionalId, callback) => {
  if (!professionalId) {
    console.error('Professional ID is required for subscription');
    return () => {}; // Return empty unsubscribe function
  }

  try {
    const slotsQuery = query(
      collection(db, 'availabilitySlots'),
      where('professional_id', '==', professionalId)
    );

    const unsubscribe = onSnapshot(slotsQuery, (querySnapshot) => {
      const slots = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        slots.push({
          id: doc.id,
          professionalId: data.professional_id,
          title: data.title,
          start: data.start_date?.toDate?.() || data.start_date,
          end: data.end_date?.toDate?.() || data.end_date,
          notes: data.notes,
          isBooked: data.is_booked || false,
          bookedBy: data.booked_by || null,
          bookingId: data.booking_id || null,
        });
      });
      callback({ success: true, slots });
    }, (error) => {
      console.error('Error in availability slots subscription:', error);
      callback({ success: false, error: error.message, slots: [] });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up availability slots subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

export const createBookingFromSlot = async (slot, professionalId, clientData) => {
  try {
    const batch = writeBatch(db);

    // 1. Create the new booking document
    const bookingRef = doc(collection(db, BOOKINGS_COLLECTION));
    const bookingPayload = {
      professionalId: professionalId,
      clientId: clientData.id,
      clientName: clientData.name,
      clientEmail: clientData.email,
      appointmentDate: Timestamp.fromDate(slot.start),
      appointmentTime: slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: Math.round((slot.end - slot.start) / 60000), // duration in minutes
      status: 'pending', // Professionals will need to confirm
      notes: `Booked from available slot: "${slot.title}"`,
      sessionType: 'video_call', // Default or can be made selectable
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      slotId: slot.id, // Link to the availability slot
    };
    batch.set(bookingRef, bookingPayload);

    // 2. Mark the availability slot as booked
    // This line will now work because AVAILABILITY_SLOTS_COLLECTION is defined
    const slotRef = doc(db, AVAILABILITY_SLOTS_COLLECTION, slot.id);
    batch.update(slotRef, { 
      is_booked: true,
      booking_id: bookingRef.id,
      booked_by_uid: clientData.id,
    });

    // 3. Commit both operations together
    await batch.commit();

    return { success: true, bookingId: bookingRef.id };

  } catch (error) {
    console.error("Error creating booking from slot:", error);
    return { success: false, error: error.message };
  }
};