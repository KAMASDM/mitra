// src/services/userService.js
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
  startAfter,
  onSnapshot,
  getCountFromServer,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Collections
const USERS_COLLECTION = 'users';
const PROFESSIONALS_COLLECTION = 'professionals';
const REVIEWS_COLLECTION = 'reviews';
const BOOKINGS_COLLECTION = 'bookings';

// Get all users (Admin only)
export const getAllUsers = async (userType = null, pageSize = 20, lastDoc = null) => {
  try {
    let q = collection(db, USERS_COLLECTION);

    if (userType) {
      q = query(q, where('role', '==', userType));
    }

    q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return {
      users,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      success: true
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return { error: error.message, success: false };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { user: { id: userSnap.id, ...userSnap.data() }, success: true };
    } else {
      return { error: 'User not found', success: false };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return { error: error.message, success: false };
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { error: error.message, success: false };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: error.message, success: false };
  }
};

// Ultra-simple query approach - NO INDEXES NEEDED
export const getProfessionals = async (filters = {}) => {
  try {
    const professionalsRef = collection(db, PROFESSIONALS_COLLECTION);
    const pageSize = filters.pageSize || 50; // Fetch more items for client-side filtering

    let q;
    
    // Strategy: Use only ONE constraint at a time to avoid composite indexes
    if (filters.category && filters.category !== 'All') {
      // If category is specified, filter by category only
      q = query(
        professionalsRef,
        where('category', '==', filters.category),
        limit(pageSize)
      );
    } else {
      // Otherwise, just get verified professionals
      q = query(
        professionalsRef,
        where('verification_status', '==', 'VERIFIED'),
        limit(pageSize)
      );
    }

    if (filters.lastDoc) {
      q = query(q, startAfter(filters.lastDoc));
    }

    const professionalsSnapshot = await getDocs(q);

    if (professionalsSnapshot.empty) {
      return { 
        professionals: [], 
        hasMore: false,
        lastDoc: null,
        success: true 
      }; 
    }

    // Process results and merge with user data
    const mergedDataPromises = professionalsSnapshot.docs.map(async (professionalDoc) => {
      const professionalData = { id: professionalDoc.id, ...professionalDoc.data() };
      
      if (!professionalData.user_id) {
        console.warn(`Professional document with ID ${professionalDoc.id} is MISSING the 'user_id' field.`);
        return professionalData;
      }

      const userRef = doc(db, USERS_COLLECTION, professionalData.user_id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return { ...userData, ...professionalData };
      } else {
        console.warn(`No matching user found for professional with user_id: ${professionalData.user_id}`);
        return professionalData;
      }
    });

    let professionals = await Promise.all(mergedDataPromises);

    // CLIENT-SIDE FILTERING AND SORTING (no indexes needed!)
    
    // Filter by verification if we didn't already
    if (filters.category && filters.category !== 'All') {
      professionals = professionals.filter(prof => prof.verification_status === 'VERIFIED');
    }

    // Client-side sorting
    if (filters.sortBy) {
      professionals.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price':
            return (a.price || 0) - (b.price || 0); // ascending
          case 'experience':
            return (b.years_of_experience || 0) - (a.years_of_experience || 0); // descending
          case 'newest':
          default:
            // Sort by createdAt if available, otherwise by document creation order
            const aDate = a.createdAt?.toDate?.() || new Date(0);
            const bDate = b.createdAt?.toDate?.() || new Date(0);
            return bDate - aDate; // descending (newest first)
        }
      });
    }

    const lastDoc = professionalsSnapshot.docs[professionalsSnapshot.docs.length - 1];
    const hasMore = professionalsSnapshot.docs.length === pageSize;

    return { 
      professionals, 
      hasMore,
      lastDoc,
      success: true 
    };

  } catch (error) {
    console.error('Error getting professionals:', error);
    return { error: error.message, success: false };
  }
};

// Get total count of professionals (for pagination info)
export const getProfessionalsCount = async (filters = {}) => {
  try {
    const professionalsRef = collection(db, PROFESSIONALS_COLLECTION);
    const queryConstraints = [];

    // Always filter for verified professionals
    queryConstraints.push(where('verification_status', '==', 'VERIFIED'));

    // Add category filter if specified and not 'All'
    if (filters.category && filters.category !== 'All') {
      queryConstraints.push(where('category', '==', filters.category));
    }

    const q = query(professionalsRef, ...queryConstraints);
    const snapshot = await getDocs(q);
    
    return { 
      count: snapshot.size, 
      success: true 
    };
  } catch (error) {
    console.error('Error getting professionals count:', error);
    return { error: error.message, success: false };
  }
};

// Get professional by ID
export const getProfessionalById = async (professionalId) => {
  try {
    const professionalRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
    const professionalSnap = await getDoc(professionalRef);

    if (professionalSnap.exists()) {
      return {
        professional: { id: professionalSnap.id, ...professionalSnap.data() },
        success: true
      };
    } else {
      return { error: 'Professional not found', success: false };
    }
  } catch (error) {
    console.error('Error getting professional:', error);
    return { error: error.message, success: false };
  }
};

// Update professional profile
export const updateProfessionalProfile = async (professionalId, profileData) => {
  try {
    const professionalRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
    await updateDoc(professionalRef, {
      ...profileData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating professional profile:', error);
    return { error: error.message, success: false };
  }
};

// Upload profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    const fileRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    const uploadResult = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Update user profile with new photo URL
    await updateUser(userId, { photoURL: downloadURL });

    return { photoURL: downloadURL, success: true };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { error: error.message, success: false };
  }
};

// Delete profile picture
export const deleteProfilePicture = async (userId, photoURL) => {
  try {
    // Delete from storage
    const photoRef = ref(storage, photoURL);
    await deleteObject(photoRef);

    // Update user profile
    await updateUser(userId, { photoURL: null });

    return { success: true };
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return { error: error.message, success: false };
  }
};

// Get user reviews
export const getUserReviews = async (userId, userType = 'professional') => {
  try {
    const field = userType === 'professional' ? 'professionalId' : 'clientId';
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    return { reviews, success: true };
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return { error: error.message, success: false };
  }
};

// Add review
export const addReview = async (reviewData) => {
  try {
    const reviewRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      ...reviewData,
      createdAt: new Date()
    });

    return { reviewId: reviewRef.id, success: true };
  } catch (error) {
    console.error('Error adding review:', error);
    return { error: error.message, success: false };
  }
};

// Subscribe to user updates (real-time)
export const subscribeToUserUpdates = (userId, callback) => {
  const userRef = doc(db, USERS_COLLECTION, userId);

  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  }, (error) => {
    console.error('Error listening to user updates:', error);
  });
};

// Get user statistics
export const getUserStatistics = async (userId, userType) => {
  try {
    let stats = {};

    if (userType === 'CLIENT') {
      // Get client statistics
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('clientId', '==', userId)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      stats = {
        totalBookings: bookingsSnapshot.size,
        completedSessions: bookingsSnapshot.docs.filter(doc =>
          doc.data().status === 'completed'
        ).length,
        favoriteProfessionals: 0, // You can implement favorites collection
        totalSpent: bookingsSnapshot.docs.reduce((total, doc) =>
          total + (doc.data().amount || 0), 0
        )
      };
    } else if (userType === 'PROFESSIONAL') {
      // Get professional statistics
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('professionalId', '==', userId)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      const reviewsQuery = query(
        collection(db, REVIEWS_COLLECTION),
        where('professionalId', '==', userId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);

      const ratings = reviewsSnapshot.docs.map(doc => doc.data().rating);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      stats = {
        totalSessions: bookingsSnapshot.size,
        completedSessions: bookingsSnapshot.docs.filter(doc =>
          doc.data().status === 'completed'
        ).length,
        totalEarnings: bookingsSnapshot.docs.reduce((total, doc) =>
          total + (doc.data().amount || 0), 0
        ),
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviewsSnapshot.size
      };
    }

    return { stats, success: true };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return { error: error.message, success: false };
  }
};


export const getPlatformStats = async () => {
  try {
    // Get counts for users and professionals
    const usersCollection = collection(db, USERS_COLLECTION);
    const professionalsCollection = collection(db, PROFESSIONALS_COLLECTION);

    const usersSnapshot = await getCountFromServer(usersCollection);
    const professionalsSnapshot = await getCountFromServer(professionalsCollection);

    // Calculate total revenue and sessions from bookings
    const bookingsQuery = query(collection(db, BOOKINGS_COLLECTION));
    const bookingsSnapshot = await getDocs(bookingsQuery);

    let totalRevenue = 0;
    let completedSessions = 0;

    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      if (booking.status === 'completed' && typeof booking.amount === 'number') {
        totalRevenue += booking.amount;
        completedSessions++;
      }
    });

    const stats = {
      totalUsers: usersSnapshot.data().count,
      totalProfessionals: professionalsSnapshot.data().count,
      totalRevenue: totalRevenue,
      totalSessions: completedSessions,
    };

    return { stats, success: true };
  } catch (error) {
    console.error('Error getting platform stats:', error);
    return { error: error.message, success: false };
  }
};

// NEW: Get professionals with a 'PENDING' verification status
export const getPendingProfessionals = async () => {
  try {
    const q = query(
      collection(db, PROFESSIONALS_COLLECTION),
      where('verification_status', '==', 'PENDING')
    );
    const professionalsSnapshot = await getDocs(q);

    if (professionalsSnapshot.empty) {
      return { professionals: [], success: true };
    }

    // Merge with user data to get name, email etc.
    const mergedDataPromises = professionalsSnapshot.docs.map(async (profDoc) => {
      const profData = { id: profDoc.id, ...profDoc.data() };
      if (!profData.user_id) return profData;

      const userRef = doc(db, USERS_COLLECTION, profData.user_id);
      const userSnap = await getDoc(userRef);

      return userSnap.exists() ? { ...userSnap.data(), ...profData } : profData;
    });

    const professionals = await Promise.all(mergedDataPromises);
    return { professionals, success: true };

  } catch (error) {
    console.error('Error getting pending professionals:', error);
    return { error: error.message, success: false };
  }
};

// NEW: Get the most recent users
export const getRecentUsers = async (count = 5) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { users, success: true };
  } catch (error) {
    console.error('Error getting recent users:', error);
    return { error: error.message, success: false };
  }
};

// NEW: Update a professional's verification status
export const updateProfessionalStatus = async (professionalId, userId, newStatus) => {
  try {
    // Use a transaction to update both professional and user documents atomically
    await runTransaction(db, async (transaction) => {
      const professionalRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
      const userRef = doc(db, USERS_COLLECTION, userId);

      transaction.update(professionalRef, { verification_status: newStatus });

      // Also update the user's role if they are being verified
      if (newStatus === 'VERIFIED') {
        transaction.update(userRef, { role: 'PROFESSIONAL' });
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating professional status:', error);
    return { error: error.message, success: false };
  }
};

export const getPlatformMetrics = async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const sixtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);

    // --- User Growth ---
    const usersQuery = query(collection(db, USERS_COLLECTION), where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)));
    const prevUsersQuery = query(collection(db, USERS_COLLECTION), where('createdAt', '>=', Timestamp.fromDate(sixtyDaysAgo)), where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo)));
    const recentUsersSnap = await getDocs(usersQuery);
    const prevUsersSnap = await getDocs(prevUsersQuery);
    const userGrowth = prevUsersSnap.size > 0 ? ((recentUsersSnap.size - prevUsersSnap.size) / prevUsersSnap.size) * 100 : recentUsersSnap.size > 0 ? 100 : 0;

    // --- Professional Growth ---
    const profsQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'PROFESSIONAL'),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );
    const prevProfsQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'PROFESSIONAL'),
      where('createdAt', '>=', Timestamp.fromDate(sixtyDaysAgo)),
      where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo))
    );
    const recentProfsSnap = await getDocs(profsQuery);
    const prevProfsSnap = await getDocs(prevProfsQuery);
    const professionalGrowth = prevProfsSnap.size > 0 ? ((recentProfsSnap.size - prevProfsSnap.size) / prevProfsSnap.size) * 100 : recentProfsSnap.size > 0 ? 100 : 0;

    // --- Revenue & Session Growth ---
    const recentBookingsQuery = query(collection(db, BOOKINGS_COLLECTION), where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)), where('status', '==', 'completed'));
    const prevBookingsQuery = query(collection(db, BOOKINGS_COLLECTION), where('createdAt', '>=', Timestamp.fromDate(sixtyDaysAgo)), where('createdAt', '<', Timestamp.fromDate(thirtyDaysAgo)), where('status', '==', 'completed'));
    
    const recentBookingsSnap = await getDocs(recentBookingsQuery);
    const prevBookingsSnap = await getDocs(prevBookingsQuery);

    let recentRevenue = 0;
    recentBookingsSnap.forEach(doc => recentRevenue += doc.data().amount || 0);
    
    let prevRevenue = 0;
    prevBookingsSnap.forEach(doc => prevRevenue += doc.data().amount || 0);

    const revenueGrowth = prevRevenue > 0 ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : recentRevenue > 0 ? 100 : 0;

    // FIX: Added session growth calculation
    const recentSessionsCount = recentBookingsSnap.size;
    const prevSessionsCount = prevBookingsSnap.size;
    const sessionGrowth = prevSessionsCount > 0 ? ((recentSessionsCount - prevSessionsCount) / prevSessionsCount) * 100 : recentSessionsCount > 0 ? 100 : 0;

    const satisfactionRate = 96; // Placeholder

    return {
      metrics: {
        userGrowth: Math.round(userGrowth),
        professionalGrowth: Math.round(professionalGrowth),
        revenueGrowth: Math.round(revenueGrowth),
        sessionGrowth: Math.round(sessionGrowth), 
        satisfactionRate,
      },
      success: true,
    };

  } catch (error) {
    console.error("Error getting platform metrics:", error);
    return { error: error.message, success: false };
  }
};

export const getAllSpecializations = async () => {
  try {
    const specializationsSnapshot = await getDocs(collection(db, 'specializations'));
    const specializations = [];
    specializationsSnapshot.forEach((doc) => {
      specializations.push({ id: doc.id, ...doc.data() });
    });
    return { specializations, success: true };
  } catch (error) {
    console.error('Error getting all specializations:', error);
    return { error: error.message, success: false };
  }
};