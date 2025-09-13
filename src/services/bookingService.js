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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const BOOKINGS_COLLECTION = 'bookings';
const AVAILABILITY_COLLECTION = 'availability';
const PAYMENTS_COLLECTION = 'payments';

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
export const getUpcomingBookings = async (userId, userType = 'client', days = 7) => {
  try {
    const field = userType === 'client' ? 'clientId' : 'professionalId';
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      and(
        where(field, '==', userId),
        where('appointmentDate', '>=', Timestamp.fromDate(now)),
        where('appointmentDate', '<=', Timestamp.fromDate(futureDate)),
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